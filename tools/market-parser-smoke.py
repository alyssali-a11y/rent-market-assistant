from __future__ import annotations

import sys
from pathlib import Path
from urllib.error import HTTPError

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

from api.market import (  # noqa: E402
    MOI_CSV_CACHE,
    extract_591_rent,
    fetch_text,
    parse_591_items,
    parse_591_payload_items,
    parse_moi_rental_items,
)


def main() -> None:
    sample_html = """
    <div class="item" data-id="21528361">
      <img alt="達麗世界仁⭐️3房2廳平車⭐️可租補、傢俱可談 整層住家 達麗世界仁 591租屋 月租20,000元/月">
      <a class="link v-middle" href="https://rent.591.com.tw/21528361" title="達麗世界仁⭐️3房2廳平車⭐️可租補、傢俱可談">達麗世界仁⭐️3房2廳平車⭐️可租補、傢俱可談</a>
      <div>南區-永華南路</div>
      <span>35坪</span>
      <div class="item-info-price"><div class="inline-flex-row">20,000</div><span>元/月</span></div>
    </div>
    """
    parsed_sample = parse_591_payload_items(sample_html)
    assert parsed_sample and parsed_sample[0]["rent"] == 20000, parsed_sample
    assert parsed_sample[0]["rent"] != 21528361, parsed_sample
    assert parsed_sample[0]["propertyType"] == "整層住家", parsed_sample

    fallback_items = parse_591_items(
        "台南優質兩房 南區-永華南路 24坪 20,000元",
        "https://rent.591.com.tw/list?region=15",
    )
    assert fallback_items and fallback_items[0]["url"] == "", fallback_items

    business_html = """
    <div class="item" data-v-test>
      <a class="link v-middle" href="https://business.591.com.tw/rent/21631832"
         title="信義安和優質店面">信義安和優質店面</a>
      <div class="item-info-txt"><span>23.4坪</span><span>1F/16F</span></div>
      <div class="item-info-txt">大安區-安和路一段</div>
      <div class="item-info-price"><strong class="font-arial">105,000</strong><span>元/月</span></div>
    </div>
    """
    business_items = parse_591_payload_items(business_html)
    assert business_items and business_items[0]["rent"] == 105000, business_items
    assert business_items[0]["url"] == "https://business.591.com.tw/rent/21631832", business_items
    assert business_items[0]["ping"] == 23.4, business_items
    assert business_items[0]["propertyType"] == "店面", business_items

    sort_html = """
    <div class="item" data-id="21500001">
      <a class="link v-middle" href="https://rent.591.com.tw/21500001" title="東區 1 房電梯套房">東區 1 房電梯套房</a>
      <div>東區-崇明路</div>
      <span>8坪</span>
      <div class="item-info-price"><div class="inline-flex-row">9,000</div><span>元/月</span></div>
    </div>
    <div class="item" data-id="21500002">
      <a class="link v-middle" href="https://rent.591.com.tw/21500002" title="南區永華南路三房平車">南區永華南路三房平車</a>
      <div>南區-永華南路</div>
      <span>24坪</span>
      <div class="item-info-price"><div class="inline-flex-row">20,000</div><span>元/月</span></div>
    </div>
    <div class="item" data-id="21500003">
      <a class="link v-middle" href="https://rent.591.com.tw/21500003" title="南區永成路兩房">南區永成路兩房</a>
      <div>南區-永成路</div>
      <span>18坪</span>
      <div class="item-info-price"><div class="inline-flex-row">16,000</div><span>元/月</span></div>
    </div>
    """
    sorted_sample = parse_591_items(
        sort_html,
        "https://rent.591.com.tw/list",
        address="台南市南區永華南路二段100號",
        district="南區",
        layout="3房",
        ping=24,
        keyword="南區 永華南路",
    )
    assert sorted_sample[0]["url"].endswith("/21500002"), sorted_sample
    assert sorted_sample[0]["address"] == "南區-永華南路", sorted_sample

    property_type_html = """
    <div class="item" data-id="21510001">
      <a href="https://rent.591.com.tw/21510001" title="近捷運電梯大樓三房">近捷運電梯大樓三房</a>
      <div>信義區-松仁路</div><span>30坪</span>
      <div class="item-info-price"><strong>38,000</strong><span>元/月</span></div>
    </div>
    <div class="item" data-id="21510002">
      <a href="https://rent.591.com.tw/21510002" title="整棟透天可住家">整棟透天可住家</a>
      <div>信義區-松仁路</div><span>31坪</span>
      <div class="item-info-price"><strong>36,000</strong><span>元/月</span></div>
    </div>
    """
    property_type_sample = parse_591_items(
        property_type_html,
        "https://rent.591.com.tw/list",
        address="台北市信義區松仁路100號",
        district="信義區",
        ping=31,
        building_type="透天厝",
    )
    assert property_type_sample[0]["url"].endswith("/21510002"), property_type_sample
    assert property_type_sample[0]["propertyType"] == "透天厝", property_type_sample

    commercial_html = """
    <div class="item" data-id="21600001">
      <a class="link v-middle" href="https://rent.591.com.tw/21600001" title="三房住宅近捷運">三房住宅近捷運</a>
      <div>大安區-忠孝東路四段</div>
      <span>32坪</span>
      <div class="item-info-price"><div class="inline-flex-row">45,000</div><span>元/月</span></div>
    </div>
    <div class="item" data-id="21600002">
      <a class="link v-middle" href="https://rent.591.com.tw/21600002" title="忠孝東路黃金店面">忠孝東路黃金店面</a>
      <div>大安區-忠孝東路四段</div>
      <span>20坪</span>
      <div class="item-info-price"><div class="inline-flex-row">120,000</div><span>元/月</span></div>
    </div>
    <div class="item" data-id="21600003">
      <a class="link v-middle" href="https://rent.591.com.tw/21600003" title="忠孝東路辦公室可登記">忠孝東路辦公室可登記</a>
      <div>大安區-忠孝東路四段</div>
      <span>28坪</span>
      <div class="item-info-price"><div class="inline-flex-row">80,000</div><span>元/月</span></div>
    </div>
    """
    store_sample = parse_591_items(
        commercial_html,
        "https://rent.591.com.tw/list?kind=5",
        address="台北市大安區忠孝東路四段100號",
        district="大安區",
        ping=20,
        keyword="大安區 忠孝東路四段",
        building_type="店面",
    )
    assert store_sample[0]["url"].endswith("/21600002"), store_sample

    office_sample = parse_591_items(
        commercial_html,
        "https://rent.591.com.tw/list?kind=6",
        address="台北市大安區忠孝東路四段100號",
        district="大安區",
        ping=28,
        keyword="大安區 忠孝東路四段",
        building_type="商辦",
    )
    assert office_sample[0]["url"].endswith("/21600003"), office_sample

    moi_cache_key = "a_lvr_land_c.csv"
    MOI_CSV_CACHE[moi_cache_key] = """鄉鎮市區,土地位置建物門牌,總額元,建物總面積平方公尺,租賃年月日,出租型態,建物型態,租賃住宅服務
大安區,台北市大安區忠孝東路四段2號,22000,66.12,1150105,整層住家,住宅大樓,
大安區,台北市大安區忠孝東路四段1號,21000,66.12,1150605,整層住家,住宅大樓,
"""
    moi_sample = parse_moi_rental_items("台北市", "大安區", "忠孝東路四段", "", "整層住家", 20, "電梯大樓")
    assert [item["date"] for item in moi_sample] == ["2026/06/05", "2026/01/05"], moi_sample
    assert all(item["propertyType"] == "電梯大樓" for item in moi_sample), moi_sample
    MOI_CSV_CACHE.pop(moi_cache_key, None)

    url = "https://rent.591.com.tw/list?region=15&keywords=%E5%8D%97%E5%8D%80%20%E6%B0%B8%E8%8F%AF%E5%8D%97%E8%B7%AF"
    html = fetch_text(url)
    items = parse_591_items(html, url)
    if not items:
        raise AssertionError("591 parser returned no items")

    bad_rents = [item for item in items if not item.get("rent") or int(item["rent"]) >= 500000]
    if bad_rents:
        raise AssertionError(f"unreasonable rent values: {bad_rents[:3]}")

    if not any(item.get("url", "").endswith("/21528361") and item.get("rent") == 20000 for item in items):
        print("warning: live 591 search result no longer contains 21528361 at rent 20000")

    commercial_queries = [
        "https://rent.591.com.tw/list?kind=5&keywords=%E5%A4%A7%E5%AE%89%E5%8D%80",
        "https://rent.591.com.tw/list?kind=6&keywords=%E5%A4%A7%E5%AE%89%E5%8D%80",
    ]
    for commercial_url in commercial_queries:
        commercial_items = parse_591_items(fetch_text(commercial_url), commercial_url)
        if not commercial_items:
            raise AssertionError(f"591 commercial parser returned no items: {commercial_url}")
        missing_links = [
            item
            for item in commercial_items
            if not str(item.get("url") or "").startswith("https://business.591.com.tw/rent/")
        ]
        if missing_links:
            raise AssertionError(f"591 commercial items missing listing IDs: {missing_links[:3]}")

    detail_urls = [
        "https://rent.591.com.tw/21513985",
        "https://rent.591.com.tw/21578522",
        "https://rent.591.com.tw/21471070",
    ]
    detail_rents = []
    for detail_url in detail_urls:
        try:
            rent = extract_591_rent(fetch_text(detail_url))
        except HTTPError as exc:
            if exc.code == 404:
                print(f"warning: 591 detail page is no longer available: {detail_url}")
                continue
            raise
        if not rent or rent >= 500000:
            raise AssertionError(f"bad detail rent for {detail_url}: {rent}")
        detail_rents.append(rent)

    print(f"parsed {len(items)} items; first rents:", [item["rent"] for item in items[:5]])
    print("detail rents:", detail_rents)


if __name__ == "__main__":
    main()
