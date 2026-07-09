# 租賃行情快查部署說明

## 為什麼不要只用 GitHub Pages

GitHub Pages 是靜態網頁，瀏覽器仍會被跨站限制擋住，不能穩定直接擷取 591 租屋網。  
本工具已提供 `/api/market` 後端 API，建議流程是：

1. 將 `rent-market-assistant` 資料夾推到 GitHub repository。
2. 到 Vercel 新增專案，選擇該 GitHub repository。
3. 將專案根目錄設定為 `rent-market-assistant`。
4. 部署後開啟 Vercel 網址，即可使用外部網頁版本。

## 本機測試

在專案上一層執行：

```powershell
.\Run-RentMarketAssistant.ps1
```

然後開啟：

```text
http://127.0.0.1:8765/
```

## 外部資料來源

- Google 地圖：由使用者地址產生查詢連結與地圖預覽。
- 591 租屋網：由 `/api/market` 後端 API 讀取搜尋頁並整理成表格。
- 內政部實價登錄：保留官方查詢頁入口，現場以官方資料查證成交租金。

## 部署後注意

591 頁面結構若改版，`api/market.py` 的解析規則可能需要跟著調整。
