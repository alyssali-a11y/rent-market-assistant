from __future__ import annotations

import csv
import io
import json
import re
from html import unescape
from http.server import BaseHTTPRequestHandler
from urllib.error import URLError
from urllib.parse import parse_qs, urlencode, urlparse
from urllib.request import Request, urlopen


MAX_ITEMS = 12
MAX_591_PARSE_ITEMS = 30
MOI_OPEN_DATA_URL = "https://plvr.land.moi.gov.tw/DownloadOpenData"
MOI_DOWNLOAD_ROOT = "https://plvr.land.moi.gov.tw/Download"
MOI_CSV_CACHE: dict[str, str] = {}
MOI_CITY_CODES = {
    "基隆市": "c",
    "台北市": "a",
    "臺北市": "a",
    "新北市": "f",
    "桃園市": "h",
    "新竹市": "o",
    "新竹縣": "j",
    "苗栗縣": "k",
    "台中市": "b",
    "臺中市": "b",
    "南投縣": "m",
    "彰化縣": "n",
    "雲林縣": "p",
    "嘉義市": "i",
    "嘉義縣": "q",
    "台南市": "d",
    "臺南市": "d",
    "高雄市": "e",
    "屏東縣": "t",
    "宜蘭縣": "g",
    "花蓮縣": "u",
    "台東縣": "v",
    "臺東縣": "v",
    "澎湖縣": "x",
}


def normalize_text(value: str) -> str:
    value = value.replace("\\/", "/").replace("\\u002F", "/")
    value = re.sub(r"\\u([0-9a-fA-F]{4})", lambda match: chr(int(match.group(1), 16)), value)
    value = re.sub(r"<[^>]+>", " ", value)
    return re.sub(r"\s+", " ", unescape(value)).strip()


def normalize_address(value: str) -> str:
    return (
        normalize_text(value)
        .replace("臺", "台")
        .replace("０", "0")
        .replace("１", "1")
        .replace("２", "2")
        .replace("３", "3")
        .replace("４", "4")
        .replace("５", "5")
        .replace("６", "6")
        .replace("７", "7")
        .replace("８", "8")
        .replace("９", "9")
    )


def compact_address(value: str) -> str:
    return re.sub(r"[\s　,，。．.、之\-號号樓楼層层]", "", normalize_address(value))


def fetch_bytes(url: str, referer: str = "https://rent.591.com.tw/") -> bytes:
    request = Request(
        url,
        headers={
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/126 Safari/537.36",
            "Accept-Language": "zh-TW,zh;q=0.9,en;q=0.6",
            "Referer": referer,
        },
    )
    with urlopen(request, timeout=18) as response:
        return response.read()


def fetch_text(url: str, referer: str = "https://rent.591.com.tw/") -> str:
    return fetch_bytes(url, referer=referer).decode("utf-8", errors="ignore")


def parse_591_items(
    html: str,
    base_url: str,
    address: str = "",
    district: str = "",
    layout: str = "",
    ping: float | None = None,
    keyword: str = "",
    building_type: str = "",
) -> list[dict[str, str | int | float | None]]:
    items = parse_591_payload_items(html)
    if not items:
        items = parse_591_text_items(html)
    for item in items:
        if not item.get("url"):
            item["url"] = base_url
    return rank_market_items(items, address, district, layout, ping, keyword, building_type)[:MAX_ITEMS]


def parse_591_payload_items(html: str) -> list[dict[str, str | int | float | None]]:
    card_items = parse_591_card_items(html)
    if card_items:
        return card_items

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
        if not title or not is_reasonable_monthly_rent(rent):
            continue

        items.append(
            {
                "source": "591",
                "title": title,
                "address": location,
                "rent": rent,
                "ping": ping,
                "layout": layout,
                "url": f"https://rent.591.com.tw/{listing_id}",
                "note": "591 搜尋頁刊登資料",
            }
        )
        if len(items) >= MAX_591_PARSE_ITEMS:
            break
    return items


def parse_591_card_items(html: str) -> list[dict[str, str | int | float | None]]:
    blocks = split_591_item_blocks(html)
    items: list[dict[str, str | int | float | None]] = []
    seen_ids: set[str] = set()

    for listing_id, block in blocks:
        if listing_id in seen_ids:
            continue
        seen_ids.add(listing_id)

        title = extract_591_title(block)
        rent = extract_591_rent(block)
        ping = extract_591_ping(block)
        location = extract_591_location(block)
        layout = extract_591_layout(block, title)
        if not title or not is_reasonable_monthly_rent(rent):
            continue

        items.append(
            {
                "source": "591",
                "title": title,
                "address": location,
                "rent": rent,
                "ping": ping,
                "layout": layout,
                "url": f"https://rent.591.com.tw/{listing_id}",
                "note": "591 搜尋頁刊登資料",
            }
        )
        if len(items) >= MAX_591_PARSE_ITEMS:
            break

    return items


def split_591_item_blocks(html: str) -> list[tuple[str, str]]:
    matches = list(re.finditer(r'<div class="item"\s+data-id="(?P<id>\d{7,9})"', html))
    blocks: list[tuple[str, str]] = []
    for index, match in enumerate(matches):
        start = match.start()
        end = matches[index + 1].start() if index + 1 < len(matches) else min(len(html), start + 50000)
        blocks.append((match.group("id"), html[start:end]))
    return blocks


def extract_591_title(block: str) -> str:
    title_match = re.search(r'<a[^>]+title="(?P<title>[^"]{2,180})"', block)
    if title_match:
        return clean_listing_title(title_match.group("title"))

    alt_match = re.search(r'alt="(?P<alt>[^"]{4,240})"', block)
    if alt_match:
        alt = normalize_text(alt_match.group("alt"))
        title = re.split(r"\s+(?:整層住家|獨立套房|分租套房|雅房|店面|辦公|住辦|車位)\s+", alt)[0]
        return clean_listing_title(title)
    return ""


def extract_591_rent(block: str) -> int | None:
    alt_match = re.search(r'alt="[^"]*?月租\s*(?P<rent>[\d,]{3,8})\s*元/月', block)
    if alt_match:
        return parse_int(alt_match.group("rent"))

    price_block = re.search(r'item-info-price.{0,900}?<div class="inline-flex-row"[^>]*>(?P<rent>[\d,]{3,8})</div>.{0,160}?元/月', block, re.S)
    if price_block:
        return parse_int(price_block.group("rent"))

    text = normalize_text(block)
    explicit = re.search(r"(?:月租|租金)\s*(?P<rent>[\d,]{3,8})\s*元/月", text)
    if explicit:
        return parse_int(explicit.group("rent"))
    return None


def extract_591_ping(block: str) -> float | None:
    text = normalize_text(block)
    candidates = [
        parse_float(match.group(1))
        for match in re.finditer(r"(?<!x)(\d+(?:\.\d+)?)\s*坪", text, re.I)
    ]
    filtered = [value for value in candidates if value and 1 <= value <= 300]
    return filtered[0] if filtered else None


def extract_591_location(block: str) -> str:
    text = normalize_text(block)
    matches = re.findall(r"[\u4e00-\u9fff]{1,5}[區鄉鎮市]-[\u4e00-\u9fffA-Za-z0-9\-]{2,40}", text)
    if matches:
        return matches[-1]
    road_matches = re.findall(
        r"[\u4e00-\u9fff]{1,5}[區鄉鎮市][\u4e00-\u9fff\d]{1,16}(?:大道|路|街)(?:[一二三四五六七八九十\d]+段)?",
        text,
    )
    if road_matches:
        return road_matches[-1]
    alt_match = re.search(r'alt="(?P<alt>[^"]{4,240})"', block)
    if alt_match:
        alt = normalize_text(alt_match.group("alt"))
        location_match = re.search(r"[\u4e00-\u9fff]{1,5}[區鄉鎮市]-[\u4e00-\u9fffA-Za-z0-9\-]{2,40}", alt)
        if location_match:
            return location_match.group(0)
    return ""


def extract_591_layout(block: str, title: str) -> str:
    text = normalize_text(f"{title} {block}")
    for label in ("整層住家", "獨立套房", "分租套房", "雅房", "店面", "辦公", "住辦", "車位"):
        if label in text:
            return label
    if "開放式" in text:
        return "開放式"
    match = re.search(r"([1-6一二三四五六兩])\s*房(?:\s*([0-6一二三四五六兩])\s*廳)?", text)
    if match:
        hall = match.group(2)
        return f"{match.group(1)}房{hall}廳" if hall else f"{match.group(1)}房"
    return ""


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
        if not is_reasonable_monthly_rent(rent):
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
        if len(items) >= MAX_591_PARSE_ITEMS:
            break
    return items


def parse_moi_rental_items(
    city: str,
    district: str,
    address: str,
    keyword: str,
    layout: str,
    ping: float | None,
) -> list[dict[str, str | int | float | None]]:
    code = MOI_CITY_CODES.get(city) or MOI_CITY_CODES.get(city.replace("臺", "台"))
    if not code:
        return []

    csv_text = get_moi_city_csv(code)
    road = extract_road(address) or extract_road(keyword)
    compact_road = compact_address(road)
    compact_input = compact_address(address)
    target_layout = normalize_layout(layout)
    target_district = normalize_address(district)
    scored: list[tuple[int, dict[str, str | int | float | None]]] = []

    reader = csv.DictReader(io.StringIO(csv_text))
    for row in reader:
        row_district = normalize_address(row.get("鄉鎮市區", ""))
        row_address = normalize_address(row.get("土地位置建物門牌", ""))
        if not row_address or (target_district and row_district != target_district):
            continue

        row_compact = compact_address(row_address)
        row_layout = rental_layout(row)
        rent = parse_int(row.get("總額元"))
        area_sqm = parse_float(row.get("建物總面積平方公尺"))
        row_ping = round(area_sqm / 3.305785, 1) if area_sqm else None
        if not rent:
            continue

        score = 0
        if compact_road and compact_road in row_compact:
            score += 80
        if compact_input and compact_input[:12] in row_compact:
            score += 40
        if target_layout and normalize_layout(row_layout) == target_layout:
            score += 22
        if ping and row_ping:
            score += max(0, 24 - int(abs(row_ping - ping) * 2))
        if row_district == target_district:
            score += 10
        if compact_road and compact_road not in row_compact:
            score -= 20

        scored.append(
            (
                score,
                {
                    "source": "MOI",
                    "title": f"租賃成交：{row_address}",
                    "address": row_address,
                    "rent": rent,
                    "ping": row_ping,
                    "layout": row_layout,
                    "url": MOI_OPEN_DATA_URL,
                    "note": build_moi_note(row),
                    "date": format_minguo_date(row.get("租賃年月日", "")),
                    "buildingType": normalize_text(row.get("建物型態", "")),
                },
            )
        )

    scored.sort(key=lambda item: item[0], reverse=True)
    return [item for score, item in scored if score >= 0][:MAX_ITEMS]


def get_moi_city_csv(code: str) -> str:
    file_name = f"{code}_lvr_land_c.csv"
    if file_name not in MOI_CSV_CACHE:
        url = f"{MOI_DOWNLOAD_ROOT}?fileName={file_name}"
        MOI_CSV_CACHE[file_name] = fetch_bytes(url, referer=MOI_OPEN_DATA_URL).decode("utf-8-sig", errors="ignore")
    return MOI_CSV_CACHE[file_name]


def rental_layout(row: dict[str, str]) -> str:
    rental_type = normalize_text(row.get("出租型態", ""))
    if rental_type:
        return rental_type
    rooms = parse_int(row.get("建物現況格局-房"))
    halls = parse_int(row.get("建物現況格局-廳"))
    if rooms is not None and halls is not None:
        return f"{rooms}房{halls}廳"
    if rooms is not None:
        return f"{rooms}房"
    return ""


def build_moi_note(row: dict[str, str]) -> str:
    date = format_minguo_date(row.get("租賃年月日", ""))
    building = normalize_text(row.get("建物型態", ""))
    service = normalize_text(row.get("租賃住宅服務", ""))
    parts = ["內政部租賃實價 Open Data"]
    if date:
        parts.append(f"租賃年月日 {date}")
    if building:
        parts.append(building)
    if service:
        parts.append(service)
    return "｜".join(parts)


def format_minguo_date(value: str) -> str:
    digits = re.sub(r"[^\d]", "", value or "")
    if len(digits) < 7:
        return ""
    year = int(digits[:3]) + 1911
    return f"{year}/{digits[3:5]}/{digits[5:7]}"


def extract_location(html: str, start: int, end: int) -> str:
    window = normalize_text(html[max(0, start - 900) : min(len(html), end + 900)])
    matches = re.findall(r"[\u4e00-\u9fff]{1,4}區-[\u4e00-\u9fffA-Za-z0-9\-]{2,30}", window)
    if matches:
        return matches[-1]
    return ""


def extract_road(value: str) -> str:
    text = normalize_address(value)
    match = re.search(r"([\u4e00-\u9fff\d]+(?:大道|路|街)(?:[一二三四五六七八九十\d]+段)?)", text)
    return match.group(1) if match else ""


def rank_market_items(
    items: list[dict[str, str | int | float | None]],
    address: str,
    district: str,
    layout: str,
    ping: float | None,
    keyword: str = "",
    building_type: str = "",
) -> list[dict[str, str | int | float | None]]:
    target_road = extract_road(address) or extract_road(keyword)
    compact_road = compact_address(target_road)
    compact_input = compact_address(address)
    target_district = normalize_address(district)
    target_layout = normalize_layout(layout)
    target_type = normalize_property_type(building_type)

    scored: list[tuple[int, int, dict[str, str | int | float | None]]] = []
    for index, item in enumerate(items):
        score = score_market_item(item, compact_road, compact_input, target_district, target_layout, target_type, ping)
        scored.append((score, -index, item))

    scored.sort(key=lambda item: (item[0], item[1]), reverse=True)
    return [item for _, _, item in scored]


def score_market_item(
    item: dict[str, str | int | float | None],
    compact_road: str,
    compact_input: str,
    target_district: str,
    target_layout: str,
    target_type: str,
    target_ping: float | None,
) -> int:
    title = normalize_address(str(item.get("title") or ""))
    address = normalize_address(str(item.get("address") or ""))
    haystack = compact_address(f"{address} {title}")
    score = 0

    if compact_road:
        if compact_road in haystack:
            score += 90
        else:
            score -= 18

    if target_district and target_district in normalize_address(f"{address} {title}"):
        score += 28

    if compact_input and len(compact_input) >= 10 and compact_input[:10] in haystack:
        score += 35

    item_layout = normalize_layout(str(item.get("layout") or title))
    if target_layout and item_layout:
        if item_layout == target_layout:
            score += 34
        elif same_room_count(target_layout, item_layout):
            score += 18

    item_type = normalize_property_type(f"{item.get('layout') or ''} {title}")
    if target_type:
        if item_type == target_type:
            score += 44
        elif item_type:
            score -= 28

    item_ping = item.get("ping")
    if target_ping and isinstance(item_ping, (int, float)) and item_ping > 0:
        diff = abs(float(item_ping) - target_ping)
        ratio = diff / max(target_ping, 1)
        if ratio <= 0.1:
            score += 36
        elif ratio <= 0.2:
            score += 26
        elif ratio <= 0.35:
            score += 14
        else:
            score -= min(24, int(ratio * 20))

    if item.get("rent"):
        score += 5
    if item.get("address"):
        score += 3
    return score


def same_room_count(left: str, right: str) -> bool:
    left_match = re.search(r"([1-6一二三四五六兩])\s*房", normalize_text(left))
    right_match = re.search(r"([1-6一二三四五六兩])\s*房", normalize_text(right))
    return bool(left_match and right_match and normalize_room_count(left_match.group(1)) == normalize_room_count(right_match.group(1)))


def normalize_room_count(value: str) -> str:
    return {"一": "1", "二": "2", "兩": "2", "三": "3", "四": "4", "五": "5", "六": "6"}.get(value, value)


def clean_listing_title(value: str) -> str:
    title = normalize_text(value)
    title = re.sub(r"^\([^)]{1,24}\)\s*", "", title)
    title = re.sub(r"^(置頂|精選|新上架|可短租)\s*", "", title)
    return title.strip(" ，,")


def normalize_layout(value: str) -> str:
    text = normalize_text(value)
    if "店面" in text or "商鋪" in text or "商舖" in text:
        return "店面"
    if "商辦" in text or "辦公" in text or "住辦" in text:
        return "商辦"
    if "獨立套房" in text:
        return "獨立套房"
    if "分租套房" in text:
        return "分租套房"
    if "整" in text or "住家" in text:
        return "整層住家"
    if "開放式" in text:
        return "開放式"
    match = re.search(r"([1-6一二三四五六兩])\s*房", text)
    if match:
        return f"{normalize_room_count(match.group(1))}房"
    if "套房" in text:
        return "套房"
    return text


def infer_layout(title: str, location: str) -> str:
    text = f"{title} {location}"
    if "店面" in text or "商鋪" in text or "商舖" in text:
        return "店面"
    if "商辦" in text or "辦公" in text or "住辦" in text:
        return "商辦"
    if "獨立套房" in text:
        return "獨立套房"
    if "分租套房" in text:
        return "分租套房"
    if "整層住家" in text:
        return "整層住家"
    if "開放式" in text:
        return "開放式"
    match = re.search(r"([1-6一二三四五六兩])\s*房", text)
    if match:
        return f"{normalize_room_count(match.group(1))}房"
    if "套房" in text:
        return "套房"
    return ""


def normalize_property_type(value: str) -> str:
    text = normalize_text(value)
    if "店面" in text or "商鋪" in text or "商舖" in text:
        return "店面"
    if "商辦" in text or "辦公" in text or "住辦" in text or "辦公室" in text:
        return "商辦"
    if any(label in text for label in ("整層住家", "獨立套房", "分租套房", "雅房", "套房", "公寓", "華廈", "電梯大樓", "透天")):
        return "住宅"
    return ""


def kind_for_building_type(building_type: str) -> str:
    property_type = normalize_property_type(building_type)
    if property_type == "店面":
        return "5"
    if property_type == "商辦":
        return "6"
    return ""


def parse_int(value: str | None) -> int | None:
    if not value:
        return None
    digits = re.sub(r"[^\d]", "", value)
    return int(digits) if digits else None


def is_reasonable_monthly_rent(value: int | None) -> bool:
    return value is not None and 1000 <= value <= 500000


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

        items: list[dict[str, str | int | float | None]] = []
        moi_items: list[dict[str, str | int | float | None]] = []
        errors: dict[str, str] = {}
        try:
            html = fetch_text(url)
            items = parse_591_items(html, url, address=address, district=district, layout=layout, ping=ping, keyword=keyword, building_type=building_type)
        except (TimeoutError, URLError, OSError) as exc:
            errors["591"] = str(exc)

        try:
            moi_items = parse_moi_rental_items(city, district, address, keyword, layout, ping)
        except (TimeoutError, URLError, OSError, csv.Error, ValueError) as exc:
            errors["MOI"] = str(exc)

        self.send_json(
            {
                "ok": not errors,
                "source": "external",
                "queryUrl": url,
                "openDataUrl": MOI_OPEN_DATA_URL,
                "items": items,
                "moiItems": moi_items,
                "errors": errors,
            },
            200 if not errors or items or moi_items else 502,
        )

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
