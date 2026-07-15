from __future__ import annotations

import csv
import json
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.error import URLError
from urllib.parse import parse_qs, urlencode, urlparse

from api.market import (
    MOI_OPEN_DATA_URL,
    fetch_text,
    first,
    kind_for_building_type,
    parse_591_items,
    parse_float,
    parse_moi_rental_items,
)


ROOT = Path(__file__).resolve().parent
HOST = "127.0.0.1"
PORT = 8765


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
        city = first(params, "city")
        district = first(params, "district")
        address = first(params, "address")
        layout = first(params, "layout")
        building_type = first(params, "buildingType")
        kind = first(params, "kind") or kind_for_building_type(building_type)
        ping = parse_float(first(params, "ping"))
        keyword = first(params, "keyword") or district or address
        list_params = {}
        if region:
            list_params["region"] = region
        if kind:
            list_params["kind"] = kind
        if keyword:
            list_params["keywords"] = keyword
        url = "https://rent.591.com.tw/list"
        if list_params:
            url += "?" + urlencode(list_params)

        items = []
        moi_items = []
        errors = {}
        try:
            html = fetch_text(url)
            items = parse_591_items(html, url, address=address, district=district, layout=layout, ping=ping, keyword=keyword, building_type=building_type)
        except (TimeoutError, URLError, OSError) as exc:
            errors["591"] = str(exc)

        try:
            moi_items = parse_moi_rental_items(city, district, address, keyword, layout, ping)
        except (TimeoutError, URLError, OSError, csv.Error, ValueError) as exc:
            errors["MOI"] = str(exc)

        payload = {
            "ok": not errors,
            "source": "external",
            "queryUrl": url,
            "openDataUrl": MOI_OPEN_DATA_URL,
            "items": items,
            "moiItems": moi_items,
            "errors": errors,
        }
        self.send_json(payload, 200 if not errors or items or moi_items else 502)

    def send_json(self, payload: dict, status: int) -> None:
        body = json.dumps(payload, ensure_ascii=False).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)


def main() -> None:
    server = ThreadingHTTPServer((HOST, PORT), Handler)
    print(f"租賃行情快查已啟動：http://{HOST}:{PORT}/")
    print("完成使用後請按 Ctrl+C 關閉。")
    server.serve_forever()


if __name__ == "__main__":
    main()
