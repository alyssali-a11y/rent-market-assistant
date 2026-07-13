from __future__ import annotations

import sys
from pathlib import Path
from urllib.error import HTTPError

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

from api.market import extract_591_rent, fetch_text, parse_591_items, parse_591_payload_items  # noqa: E402


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
