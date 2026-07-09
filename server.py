from __future__ import annotations

import json
import re
from html import unescape
from html.parser import HTMLParser
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.error import URLError
from urllib.parse import parse_qs, urlencode, urljoin, urlparse
from urllib.request import Request, urlopen


ROOT = Path(__file__).resolve().parent
HOST = "127.0.0.1"
PORT = 8765


class TextLinkParser(HTMLParser):
    def __init__(self) -> None:
        super().__init__()
        self.links: list[dict[str, str]] = []
        self._current_href = ""
        self._current_text: list[str] = []

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        if tag != "a":
            return
        href = dict(attrs).get("href") or ""
        if "rent.591.com.tw" in href or "/rent-detail" in href or "/home/" in href:
            self._current_href = href
            self._current_text = []

    def handle_data(self, data: str) -> None:
        if self._current_href:
            self._current_text.append(data)

    def handle_endtag(self, tag: str) -> None:
        if tag == "a" and self._current_href:
            text = normalize_text(" ".join(self._current_text))
            if text:
                self.links.append({"href": self._current_href, "text": text})
            self._current_href = ""
            self._current_text = []


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

    for index, match in enumerate(pattern.finditer(listing_area)):
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


class Handler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT), **kwargs)

    def do_GET(self) -> None:
        parsed = urlparse(self.path)
        if parsed.path == "/api/market":
            self.handle_market(parsed.query)
            return
        super().do_GET()

    def handle_market(self, query: str) -> None:
        params = parse_qs(query)
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
            payload = {"ok": True, "source": "591", "queryUrl": url, "items": items}
            self.send_json(payload, 200)
        except (TimeoutError, URLError, OSError) as exc:
            self.send_json({"ok": False, "source": "591", "queryUrl": url, "items": [], "error": str(exc)}, 502)

    def send_json(self, payload: dict, status: int) -> None:
        body = json.dumps(payload, ensure_ascii=False).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)


def first(params: dict[str, list[str]], key: str) -> str:
    values = params.get(key) or [""]
    return values[0].strip()


def main() -> None:
    server = ThreadingHTTPServer((HOST, PORT), Handler)
    print(f"租賃行情快查已啟動：http://{HOST}:{PORT}/")
    print("停止服務請按 Ctrl+C")
    server.serve_forever()


if __name__ == "__main__":
    main()
