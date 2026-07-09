from __future__ import annotations

import json
import re
from html import unescape
from http.server import BaseHTTPRequestHandler
from urllib.error import URLError
from urllib.parse import parse_qs, urlencode, urlparse
from urllib.request import Request, urlopen


def normalize_text(value: str) -> str:
    return re.sub(r"\s+", " ", unescape(value)).strip()


def fetch_text(url: str) -> str:
    request = Request(
        url,
        headers={
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/126 Safari/537.36",
            "Accept-Language": "zh-TW,zh;q=0.9,en;q=0.6",
        },
    )
    with urlopen(request, timeout=12) as response:
        return response.read().decode("utf-8", errors="ignore")


def parse_591_items(html: str, base_url: str) -> list[dict[str, str | int | float | None]]:
    text = normalize_text(re.sub(r"<[^>]+>", " ", html))
    listing_area = text
    if "為您精選" in listing_area:
        listing_area = listing_area.split("為您精選", 1)[1]
    if "全部" in listing_area:
        listing_area = listing_area.split("全部", 1)[0]

    pattern = re.compile(
        r"(?:優選好屋\s+)?"
        r"(?P<title>.{4,90}?)\s+"
        r"(?P<location>[\u4e00-\u9fff]{1,4}區-[^\s]{2,24})\s+"
        r"(?:(?P<layout>\d房/)\s*)?"
        r"(?P<ping>[\d.]+)\s*坪"
        r"[^元]{0,120}?"
        r"(?P<rent>[\d,]{4,7})\s*元/月"
    )

    items: list[dict[str, str | int | float | None]] = []
    seen_titles: set[str] = set()
    for match in pattern.finditer(listing_area):
        title = clean_listing_title(match.group("title"))
        if not title or title in seen_titles:
            continue
        seen_titles.add(title)
        rent = int(match.group("rent").replace(",", ""))
        location = match.group("location")
        ping = float(match.group("ping")) if match.group("ping") else None
        items.append(
            {
                "source": "591",
                "title": title,
                "address": location,
                "rent": rent,
                "ping": ping,
                "layout": normalize_text((match.group("layout") or "").replace("/", "")) or infer_layout(title, location),
                "url": base_url,
                "note": "591 搜尋頁擷取",
            }
        )
        if len(items) >= 12:
            break
    return items


def clean_listing_title(value: str) -> str:
    title = normalize_text(value)
    title = re.sub(r"^\([^)]{1,24}\)\s*", "", title)
    title = re.sub(r"^(我也要出現在這裡|優選好屋|精選)\s*", "", title)
    title = re.sub(r"^\([^)]{1,24}\)\s*", "", title)
    if len(title) > 64:
        title = title[-64:]
    return title.strip(" ，,")


def infer_layout(title: str, location: str) -> str:
    text = f"{title} {location}"
    if "套房" in text:
        return "套房"
    match = re.search(r"([1-4一二三四])房", text)
    if match:
        return f"{match.group(1)}房"
    if "雅房" in text:
        return "雅房"
    return ""


class handler(BaseHTTPRequestHandler):
    def do_OPTIONS(self) -> None:
        self.send_response(204)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()

    def do_GET(self) -> None:
        parsed = urlparse(self.path)
        params = parse_qs(parsed.query)
        region = first(params, "region")
        keyword = first(params, "keyword") or first(params, "district") or first(params, "address")
        list_params = {}
        if region:
            list_params["region"] = region
        if keyword:
            list_params["keywords"] = keyword
        url = "https://rent.591.com.tw/list"
        if list_params:
            url += "?" + urlencode(list_params)

        try:
            html = fetch_text(url)
            items = parse_591_items(html, url)
            self.send_json({"ok": True, "source": "591", "queryUrl": url, "items": items}, 200)
        except (TimeoutError, URLError, OSError) as exc:
            self.send_json({"ok": False, "source": "591", "queryUrl": url, "items": [], "error": str(exc)}, 502)

    def send_json(self, payload: dict, status: int) -> None:
        body = json.dumps(payload, ensure_ascii=False).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)


def first(params: dict[str, list[str]], key: str) -> str:
    values = params.get(key) or [""]
    return values[0].strip()
