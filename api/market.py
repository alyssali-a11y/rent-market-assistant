from __future__ import annotations

import json
import re
from html import unescape
from http.server import BaseHTTPRequestHandler
from urllib.error import URLError
from urllib.parse import parse_qs, urlencode, urlparse
from urllib.request import Request, urlopen


MAX_ITEMS = 12


def normalize_text(value: str) -> str:
    value = value.replace("\\/", "/").replace("\\u002F", "/")
    value = re.sub(r"\\u([0-9a-fA-F]{4})", lambda match: chr(int(match.group(1), 16)), value)
    value = re.sub(r"<[^>]+>", " ", value)
    return re.sub(r"\s+", " ", unescape(value)).strip()


def fetch_text(url: str) -> str:
    request = Request(
        url,
        headers={
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/126 Safari/537.36",
            "Accept-Language": "zh-TW,zh;q=0.9,en;q=0.6",
            "Referer": "https://rent.591.com.tw/",
        },
    )
    with urlopen(request, timeout=12) as response:
        return response.read().decode("utf-8", errors="ignore")


def parse_591_items(html: str, base_url: str) -> list[dict[str, str | int | float | None]]:
    items = parse_591_payload_items(html)
    if not items:
        items = parse_591_text_items(html)
    for item in items:
        if not item.get("url"):
            item["url"] = base_url
    return items[:MAX_ITEMS]


def parse_591_payload_items(html: str) -> list[dict[str, str | int | float | None]]:
    pattern = re.compile(
        r'(?P<id>\d{7,9}),"(?P<title>[^"]{4,140})".{0,3500}?'
        r'"https:\\u002F\\u002Frent\.591\.com\.tw\\u002F(?P=id)",'
        r'"(?P<floor>[^"]*)","(?P<ping>[\d.]+)坪","(?P<layout>[^"]*)",'
        r'"(?P<community>[^"]*)",(?P<rent>\d{3,8})',
        re.S,
    )

    items: list[dict[str, str | int | float | None]] = []
    seen_ids: set[str] = set()
    for match in pattern.finditer(html):
        listing_id = match.group("id")
        if listing_id in seen_ids:
            continue
        seen_ids.add(listing_id)

        title = clean_listing_title(match.group("title"))
        community = normalize_text(match.group("community"))
        location = extract_location(html, match.start(), match.end()) or community
        layout = normalize_text(match.group("layout")) or infer_layout(title, community)
        ping = parse_float(match.group("ping"))
        rent = parse_int(match.group("rent"))
        if not title or not rent:
            continue

        detail_url = f"https://rent.591.com.tw/{listing_id}"
        items.append(
            {
                "source": "591",
                "title": title,
                "address": location,
                "rent": rent,
                "ping": ping,
                "layout": layout,
                "url": detail_url,
                "note": "591 搜尋頁刊登資料",
            }
        )
        if len(items) >= MAX_ITEMS:
            break
    return items


def parse_591_text_items(html: str) -> list[dict[str, str | int | float | None]]:
    text = normalize_text(html)
    pattern = re.compile(
        r"(?P<title>[\u4e00-\u9fffA-Za-z0-9()[\]【】、，,.\- ]{4,90})\s+"
        r"(?P<location>[\u4e00-\u9fff]{1,4}區-[^\s]{2,24})\s+"
        r"(?P<ping>[\d.]+)\s*坪.{0,120}?"
        r"(?P<rent>[\d,]{4,7})\s*元",
        re.S,
    )

    items: list[dict[str, str | int | float | None]] = []
    seen_titles: set[str] = set()
    for match in pattern.finditer(text):
        title = clean_listing_title(match.group("title"))
        if not title or title in seen_titles:
            continue
        seen_titles.add(title)
        rent = parse_int(match.group("rent"))
        ping = parse_float(match.group("ping"))
        if not rent:
            continue
        items.append(
            {
                "source": "591",
                "title": title,
                "address": normalize_text(match.group("location")),
                "rent": rent,
                "ping": ping,
                "layout": infer_layout(title, match.group("location")),
                "url": "",
                "note": "591 搜尋頁文字資料",
            }
        )
        if len(items) >= MAX_ITEMS:
            break
    return items


def extract_location(html: str, start: int, end: int) -> str:
    window = normalize_text(html[max(0, start - 900) : min(len(html), end + 900)])
    matches = re.findall(r"[\u4e00-\u9fff]{1,4}區-[\u4e00-\u9fffA-Za-z0-9\-]{2,30}", window)
    if matches:
        return matches[-1]
    return ""


def clean_listing_title(value: str) -> str:
    title = normalize_text(value)
    title = re.sub(r"^\([^)]{1,24}\)\s*", "", title)
    title = re.sub(r"^(置頂|精選|新上架|可短租)\s*", "", title)
    return title.strip(" ，,")


def infer_layout(title: str, location: str) -> str:
    text = f"{title} {location}"
    if "獨立套房" in text:
        return "獨立套房"
    if "分租套房" in text:
        return "分租套房"
    if "整層住家" in text:
        return "整層住家"
    match = re.search(r"([1-6一二三四五六])房", text)
    if match:
        return f"{match.group(1)}房"
    if "套房" in text:
        return "套房"
    return ""


def parse_int(value: str | None) -> int | None:
    if not value:
        return None
    digits = re.sub(r"[^\d]", "", value)
    return int(digits) if digits else None


def parse_float(value: str | None) -> float | None:
    if not value:
        return None
    match = re.search(r"\d+(?:\.\d+)?", value)
    return float(match.group(0)) if match else None


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
