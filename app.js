(function () {
  const data = window.RENT_ASSISTANT_DATA || {
    generatedAt: "",
    cityRegions: {},
    pendingCases: [],
  };

  const els = {
    form: document.querySelector("#caseForm"),
    address: document.querySelector("#address"),
    city: document.querySelector("#city"),
    district: document.querySelector("#district"),
    buildingType: document.querySelector("#buildingType"),
    layout: document.querySelector("#layout"),
    ping: document.querySelector("#ping"),
    managementFee: document.querySelector("#managementFee"),
    hasElevator: document.querySelector("#hasElevator"),
    canCook: document.querySelector("#canCook"),
    canPet: document.querySelector("#canPet"),
    hasParking: document.querySelector("#hasParking"),
    loadSample: document.querySelector("#loadSample"),
    clearForm: document.querySelector("#clearForm"),
    runAnalysisTop: document.querySelector("#runAnalysisTop"),
    dataStamp: document.querySelector("#dataStamp"),
    confidenceTag: document.querySelector("#confidenceTag"),
    recommendedBand: document.querySelector("#recommendedBand"),
    recommendedNote: document.querySelector("#recommendedNote"),
    sampleCount: document.querySelector("#sampleCount"),
    sampleScope: document.querySelector("#sampleScope"),
    pppValue: document.querySelector("#pppValue"),
    webCount: document.querySelector("#webCount"),
    talkTrack: document.querySelector("#talkTrack"),
    matchSummary: document.querySelector("#matchSummary"),
    matchesBody: document.querySelector("#matchesBody"),
    mapsLink: document.querySelector("#mapsLink"),
    moiLink: document.querySelector("#moiLink"),
    rent591Link: document.querySelector("#rent591Link"),
    mapFrame: document.querySelector("#mapFrame"),
    copyAddress: document.querySelector("#copyAddress"),
    sourceStatus: document.querySelector("#sourceStatus"),
    toast: document.querySelector("#toast"),
  };

  const CITY_NAMES = Object.keys(data.cityRegions).sort((a, b) => a.localeCompare(b, "zh-Hant"));
  const DISTRICT_CITY_PAIRS = [
    ["台北市", "中正區 萬華區 大同區 中山區 松山區 大安區 信義區 士林區 北投區 內湖區 南港區 文山區"],
    ["新北市", "板橋區 三重區 中和區 永和區 新莊區 新店區 土城區 蘆洲區 樹林區 汐止區 鶯歌區 三峽區 淡水區 瑞芳區 五股區 泰山區 林口區 深坑區 石碇區 坪林區 三芝區 石門區 八里區 平溪區 雙溪區 貢寮區 金山區 萬里區 烏來區"],
    ["基隆市", "仁愛區 信義區 中正區 中山區 安樂區 暖暖區 七堵區"],
    ["桃園市", "桃園區 中壢區 平鎮區 八德區 楊梅區 蘆竹區 大溪區 龜山區 龍潭區 大園區 觀音區 新屋區 復興區"],
    ["新竹市", "東區 北區 香山區"],
    ["新竹縣", "竹北市 竹東鎮 新埔鎮 關西鎮 湖口鄉 新豐鄉 峨眉鄉 寶山鄉 北埔鄉 芎林鄉 橫山鄉 尖石鄉 五峰鄉"],
    ["苗栗縣", "苗栗市 頭份市 竹南鎮 後龍鎮 通霄鎮 苑裡鎮 卓蘭鎮 造橋鄉 西湖鄉 頭屋鄉 公館鄉 銅鑼鄉 三義鄉 大湖鄉 獅潭鄉 三灣鄉 南庄鄉 泰安鄉"],
    ["台中市", "中區 東區 南區 西區 北區 北屯區 西屯區 南屯區 太平區 大里區 霧峰區 烏日區 豐原區 后里區 石岡區 東勢區 和平區 新社區 潭子區 大雅區 神岡區 大肚區 沙鹿區 龍井區 梧棲區 清水區 大甲區 外埔區 大安區"],
    ["彰化縣", "彰化市 員林市 和美鎮 鹿港鎮 溪湖鎮 二林鎮 田中鎮 北斗鎮 花壇鄉 芬園鄉 大村鄉 永靖鄉 伸港鄉 線西鄉 福興鄉 秀水鄉 埔心鄉 埔鹽鄉 大城鄉 芳苑鄉 竹塘鄉 社頭鄉 二水鄉 田尾鄉 埤頭鄉 溪州鄉"],
    ["南投縣", "南投市 埔里鎮 草屯鎮 竹山鎮 集集鎮 名間鄉 鹿谷鄉 中寮鄉 魚池鄉 國姓鄉 水里鄉 信義鄉 仁愛鄉"],
    ["雲林縣", "斗六市 斗南鎮 虎尾鎮 西螺鎮 土庫鎮 北港鎮 古坑鄉 大埤鄉 莿桐鄉 林內鄉 二崙鄉 崙背鄉 麥寮鄉 東勢鄉 褒忠鄉 臺西鄉 元長鄉 四湖鄉 口湖鄉 水林鄉"],
    ["嘉義市", "東區 西區"],
    ["嘉義縣", "太保市 朴子市 布袋鎮 大林鎮 民雄鄉 溪口鄉 新港鄉 六腳鄉 東石鄉 義竹鄉 鹿草鄉 水上鄉 中埔鄉 竹崎鄉 梅山鄉 番路鄉 大埔鄉 阿里山鄉"],
    ["台南市", "中西區 東區 南區 北區 安平區 安南區 永康區 歸仁區 新化區 左鎮區 玉井區 楠西區 南化區 仁德區 關廟區 龍崎區 官田區 麻豆區 佳里區 西港區 七股區 將軍區 學甲區 北門區 新營區 後壁區 白河區 東山區 六甲區 下營區 柳營區 鹽水區 善化區 大內區 山上區 新市區 安定區"],
    ["高雄市", "楠梓區 左營區 鼓山區 三民區 鹽埕區 前金區 新興區 苓雅區 前鎮區 旗津區 小港區 鳳山區 林園區 大寮區 大樹區 大社區 仁武區 鳥松區 岡山區 橋頭區 燕巢區 田寮區 阿蓮區 路竹區 湖內區 茄萣區 永安區 彌陀區 梓官區 旗山區 美濃區 六龜區 甲仙區 杉林區 內門區 茂林區 桃源區 那瑪夏區"],
    ["屏東縣", "屏東市 潮州鎮 東港鎮 恆春鎮 萬丹鄉 長治鄉 麟洛鄉 九如鄉 里港鄉 鹽埔鄉 高樹鄉 萬巒鄉 內埔鄉 竹田鄉 新埤鄉 枋寮鄉 新園鄉 崁頂鄉 林邊鄉 南州鄉 佳冬鄉 琉球鄉 車城鄉 滿州鄉 枋山鄉 三地門鄉 霧臺鄉 瑪家鄉 泰武鄉 來義鄉 春日鄉 獅子鄉 牡丹鄉"],
    ["宜蘭縣", "宜蘭市 羅東鎮 蘇澳鎮 頭城鎮 礁溪鄉 壯圍鄉 員山鄉 冬山鄉 五結鄉 三星鄉 大同鄉 南澳鄉"],
    ["花蓮縣", "花蓮市 鳳林鎮 玉里鎮 新城鄉 吉安鄉 壽豐鄉 光復鄉 豐濱鄉 瑞穗鄉 富里鄉 秀林鄉 萬榮鄉 卓溪鄉"],
    ["台東縣", "臺東市 台東市 成功鎮 關山鎮 長濱鄉 海端鄉 池上鄉 東河鄉 鹿野鄉 延平鄉 卑南鄉 金峰鄉 大武鄉 達仁鄉 綠島鄉 蘭嶼鄉 太麻里鄉"],
    ["澎湖縣", "馬公市 湖西鄉 白沙鄉 西嶼鄉 望安鄉 七美鄉"],
    ["金門縣", "金城鎮 金湖鎮 金沙鎮 金寧鄉 烈嶼鄉 烏坵鄉"],
    ["連江縣", "南竿鄉 北竿鄉 莒光鄉 東引鄉"],
  ];
  const DISTRICT_TO_CITIES = DISTRICT_CITY_PAIRS.reduce((map, [city, districts]) => {
    districts.split(/\s+/).filter(Boolean).forEach((district) => {
      if (!map[district]) map[district] = [];
      if (!map[district].includes(city)) map[district].push(city);
    });
    return map;
  }, {});
  const DISTRICT_NAMES = Object.keys(DISTRICT_TO_CITIES).sort((a, b) => b.length - a.length);
  let toastTimer = null;

  function init() {
    fillCityOptions();
    hydrateDataStamp();
    updateLinks();
    renderEmptyRows();
    bindEvents();
  }

  function fillCityOptions() {
    els.city.innerHTML = '<option value="">自動判斷</option>';
    CITY_NAMES.forEach((city) => {
      const option = document.createElement("option");
      option.value = city;
      option.textContent = city;
      els.city.appendChild(option);
    });
  }

  function hydrateDataStamp() {
    const date = data.generatedAt ? new Date(data.generatedAt).toLocaleString("zh-TW", { hour12: false }) : "尚未產生";
    els.dataStamp.textContent = `外部行情模式｜資料啟動 ${date}`;
  }

  function bindEvents() {
    els.form.addEventListener("submit", (event) => {
      event.preventDefault();
      analyze();
    });
    els.runAnalysisTop.addEventListener("click", analyze);
    els.clearForm.addEventListener("click", clearForm);
    els.loadSample.addEventListener("click", loadSample);
    els.copyAddress.addEventListener("click", copyCurrentAddress);

    ["input", "change"].forEach((eventName) => {
      els.address.addEventListener(eventName, () => {
        syncAddressParts();
        updateLinks();
      });
      [els.city, els.district, els.buildingType, els.layout, els.ping].forEach((field) => {
        field.addEventListener(eventName, updateLinks);
      });
    });
  }

  function getCase() {
    return {
      address: els.address.value.trim(),
      city: els.city.value.trim(),
      district: els.district.value.trim(),
      buildingType: els.buildingType.value.trim(),
      layout: els.layout.value.trim(),
      ping: parseNumber(els.ping.value),
      managementFee: parseNumber(els.managementFee.value) || 0,
      hasElevator: els.hasElevator.checked,
      canCook: els.canCook.checked,
      canPet: els.canPet.checked,
      hasParking: els.hasParking.checked,
    };
  }

  function syncAddressParts() {
    const parsed = parseAddress(els.address.value);
    if (parsed.city) {
      els.city.value = parsed.city;
    }
    if (parsed.district) {
      els.district.value = parsed.district;
    }
  }

  function parseAddress(address) {
    const result = { city: "", district: "" };
    const normalizedAddress = normalizeAddress(address);
    const city = CITY_NAMES.find((item) => normalizedAddress.includes(item));
    if (city) result.city = city;
    const district = DISTRICT_NAMES.find((item) => normalizedAddress.includes(item));
    if (district) {
      result.district = district;
      const possibleCities = DISTRICT_TO_CITIES[district] || [];
      if (!result.city && possibleCities.length === 1) {
        result.city = possibleCities[0];
      }
    } else {
      const districtMatch = normalizedAddress.match(/([\u4e00-\u9fff]{1,4}(?:區|鎮|鄉|市))/);
      if (districtMatch) result.district = districtMatch[1];
    }
    return result;
  }

  function normalizeAddress(address) {
    return String(address || "")
      .replace(/臺/g, "台")
      .replace(/[　\s,，。]/g, "");
  }

  async function analyze() {
    syncAddressParts();
    const currentCase = getCase();
    updateLinks();
    setLoadingState();

    const externalRows = await loadExternalRows(currentCase);
    const stats = buildExternalStats(currentCase, externalRows);
    renderAnalysis(currentCase, externalRows, stats);
    renderRows(externalRows);
    showToast("已更新外部行情來源");
  }

  function setLoadingState() {
    els.confidenceTag.className = "pill neutral";
    els.confidenceTag.textContent = "讀取外部來源";
    els.recommendedBand.textContent = "讀取中";
    els.recommendedNote.textContent = "正在嘗試取得 591 搜尋結果";
    els.sampleCount.textContent = "－";
    els.webCount.textContent = "待查";
    els.pppValue.textContent = "－";
    els.matchSummary.textContent = "讀取外部物件中";
    els.matchesBody.innerHTML = '<tr><td class="empty-row" colspan="5">正在整理 591 與實價登錄來源狀態。</td></tr>';
  }

  async function loadExternalRows(currentCase) {
    const rows = [];
    const keyword = buildSearchKeyword(currentCase);
    const region = data.cityRegions[currentCase.city] || "";
    const params = new URLSearchParams({
      address: currentCase.address,
      city: currentCase.city,
      district: currentCase.district,
      keyword,
      region,
      layout: currentCase.layout,
      ping: currentCase.ping || "",
    });

    try {
      const response = await fetch(`/api/market?${params.toString()}`, { cache: "no-store" });
      if (response.ok) {
        const payload = await response.json();
        rows.push(...normalize591Rows(payload.items || []));
        setSourceStatus("已嘗試讀取 591 搜尋結果。實價登錄仍以官方頁面查詢為準。", "good");
      } else {
        setSourceStatus("本機外部資料服務未回應，請從右側開啟 591 與實價登錄查詢頁。", "warn");
      }
    } catch {
      setSourceStatus("目前是靜態開啟模式，無法自動擷取 591；請改用本機服務啟動，或從右側開啟來源頁查詢。", "warn");
    }

    rows.push(buildMoiStatusRow(currentCase));
    if (!rows.some((row) => row.sourceType === "591")) {
      rows.unshift(build591StatusRow(currentCase));
    }
    return rows;
  }

  function normalize591Rows(items) {
    return items.map((item) => ({
      sourceType: "591",
      sourceLabel: "591 租屋網",
      title: item.title || "591 待租物件",
      address: item.address || item.location || "",
      rent: parseNumber(item.rent),
      ping: parseNumber(item.ping),
      layout: item.layout || "",
      url: item.url || "",
      note: item.note || "591 搜尋結果",
      pricePerPing: parseNumber(item.rent) && parseNumber(item.ping) ? Math.round(parseNumber(item.rent) / parseNumber(item.ping)) : null,
      status: "已讀取",
    }));
  }

  function build591StatusRow(currentCase) {
    return {
      sourceType: "591",
      sourceLabel: "591 租屋網",
      title: "待開啟 591 查詢",
      address: buildSearchKeyword(currentCase) || currentCase.address || "請輸入地址",
      rent: null,
      ping: null,
      layout: currentCase.layout || "不限",
      url: els.rent591Link.href,
      note: "靜態頁面無法直接跨站擷取，請用右側 591 連結查詢；若以本機服務啟動，會自動整理結果。",
      pricePerPing: null,
      status: "待查",
    };
  }

  function buildMoiStatusRow(currentCase) {
    return {
      sourceType: "MOI",
      sourceLabel: "內政部實價登錄",
      title: "租賃實價官方查詢",
      address: currentCase.address || [currentCase.city, currentCase.district].filter(Boolean).join(""),
      rent: null,
      ping: null,
      layout: currentCase.layout || "不限",
      url: els.moiLink.href,
      note: "請在官方頁面切到租賃，貼上地址、路段或行政區；表格來源會明確標示為內政部實價登錄。",
      pricePerPing: null,
      status: "官方頁面",
    };
  }

  function buildExternalStats(currentCase, rows) {
    const priced = rows.filter((row) => Number.isFinite(row.rent) && row.rent > 0);
    const rents = priced.map((row) => row.rent);
    const ppps = rows.map((row) => row.pricePerPing).filter((value) => Number.isFinite(value) && value > 0);
    const rentBand = makeBand(rents);
    const pppBand = makeBand(ppps);
    let low = rentBand.low;
    let high = rentBand.high;

    if (currentCase.ping && pppBand.low && pppBand.high) {
      low = Math.round(pppBand.low * currentCase.ping);
      high = Math.round(pppBand.high * currentCase.ping);
    }

    if (low && high && low > high) {
      [low, high] = [high, low];
    }

    return {
      low,
      high,
      pppMedian: median(ppps),
      rentCount: priced.length,
      source591Count: rows.filter((row) => row.sourceType === "591" && row.rent).length,
      moiStatus: rows.some((row) => row.sourceType === "MOI") ? "官方頁面" : "未查",
    };
  }

  function makeBand(values) {
    const sorted = values.filter((value) => Number.isFinite(value) && value > 0).sort((a, b) => a - b);
    if (!sorted.length) return { low: null, high: null };
    if (sorted.length === 1) {
      const value = sorted[0];
      return { low: Math.round(value * 0.95), high: Math.round(value * 1.05) };
    }
    return {
      low: Math.round(percentile(sorted, 0.25)),
      high: Math.round(percentile(sorted, 0.75)),
    };
  }

  function renderAnalysis(currentCase, rows, stats) {
    els.sampleCount.textContent = `${stats.source591Count} 筆`;
    els.webCount.textContent = stats.moiStatus;
    els.pppValue.textContent = stats.pppMedian ? `${formatMoney(stats.pppMedian)}／坪` : "－";
    els.sampleScope.textContent = buildSearchKeyword(currentCase) || "請輸入地址";

    if (stats.low && stats.high) {
      els.recommendedBand.textContent = `${formatMoney(roundToHundred(stats.low))}～${formatMoney(roundToHundred(stats.high))}`;
      els.recommendedNote.textContent = "以 591 可讀取待租物件為主，實價登錄作官方查證";
    } else {
      els.recommendedBand.textContent = "需查外部頁";
      els.recommendedNote.textContent = "目前沒有可自動計算的 591 租金資料";
    }

    const confidence = getConfidence(stats, currentCase);
    els.confidenceTag.className = `pill ${confidence.level}`;
    els.confidenceTag.textContent = confidence.label;
    els.talkTrack.textContent = buildTalkTrack(currentCase, stats);
    els.matchSummary.textContent = rows.length ? `顯示 ${rows.length} 筆外部來源／查詢狀態` : "尚無外部來源";
  }

  function getConfidence(stats, currentCase) {
    if (!currentCase.address) return { level: "neutral", label: "等待輸入" };
    if (stats.source591Count >= 6) return { level: "good", label: "591 樣本充足" };
    if (stats.source591Count >= 2) return { level: "warn", label: "可先報區間" };
    return { level: "risk", label: "需查外部頁" };
  }

  function buildTalkTrack(currentCase, stats) {
    if (!currentCase.address) {
      return "輸入地址後，先開 591 與實價登錄官方頁，現場以外部行情作為主要說法。";
    }
    if (!stats.low || !stats.high) {
      return "目前尚未取得足夠的 591 租金數字。建議先按右側 591 與內政部實價登錄連結，確認同路段、同格局、同坪數的租金，再對屋主說明要以外部公開行情為準。";
    }

    const band = `${formatMoney(roundToHundred(stats.low))} 到 ${formatMoney(roundToHundred(stats.high))}`;
    return `依 591 目前可讀取的周邊待租物件，這類條件可先抓 ${band} 元／月；再用內政部實價登錄租賃資料確認成交租金，向屋主說明刊登價與實際成交價可能會有落差。`;
  }

  function renderRows(rows) {
    if (!rows.length) {
      renderEmptyRows();
      return;
    }
    els.matchesBody.innerHTML = rows.map((item) => {
      const title = item.url
        ? `<a href="${escapeHtml(item.url)}" target="_blank" rel="noopener">${escapeHtml(item.title)}</a>`
        : escapeHtml(item.title);
      const rent = item.rent ? formatMoney(item.rent) : item.status;
      const ping = item.ping ? `${item.ping} 坪` : "－";
      const sourceClass = item.sourceType === "MOI" ? "source-moi" : "source-591";
      return `
        <tr>
          <td class="address-cell"><strong>${title}</strong><small>${escapeHtml(item.address || item.note || "－")}</small></td>
          <td>${rent}</td>
          <td>${ping}</td>
          <td>${escapeHtml(item.layout || "－")}</td>
          <td><span class="source-badge ${sourceClass}">${escapeHtml(item.sourceLabel)}</span><small>${escapeHtml(item.note || "")}</small></td>
        </tr>
      `;
    }).join("");
  }

  function renderEmptyRows() {
    els.matchesBody.innerHTML = '<tr><td class="empty-row" colspan="5">輸入地址後，這裡會顯示 591 與實價登錄來源。</td></tr>';
  }

  function updateLinks() {
    const currentCase = getCase();
    const address = currentCase.address || [currentCase.city, currentCase.district].filter(Boolean).join("");
    const keyword = buildSearchKeyword(currentCase);
    const encodedAddress = encodeURIComponent(address || "台北市");
    const encodedKeyword = encodeURIComponent(keyword || address || "租屋");
    const region = data.cityRegions[currentCase.city];

    els.mapsLink.href = `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`;
    els.mapFrame.src = `https://maps.google.com/maps?q=${encodedAddress}&output=embed`;
    els.moiLink.href = "https://lvr.land.moi.gov.tw/";
    els.rent591Link.href = region
      ? `https://rent.591.com.tw/list?region=${region}&keywords=${encodedKeyword}`
      : `https://rent.591.com.tw/list?keywords=${encodedKeyword}`;
  }

  function buildSearchKeyword(currentCase) {
    const address = currentCase.address;
    if (!address) return [currentCase.city, currentCase.district].filter(Boolean).join(" ");
    const road = address.match(/([\u4e00-\u9fff\d]+(?:大道|路|街)(?:[一二三四五六七八九十\d]+段)?)/);
    return [currentCase.district, road ? road[1] : ""].filter(Boolean).join(" ");
  }

  function setSourceStatus(message, level) {
    els.sourceStatus.className = `source-status ${level || ""}`;
    els.sourceStatus.innerHTML = `<strong>來源狀態</strong><p>${escapeHtml(message)}</p>`;
  }

  function loadSample() {
    const sample = (data.pendingCases || []).find((item) => item.address && item.city) || {
      city: "台北市",
      address: "台北市中正區中華路二段467巷38弄5號",
    };
    els.address.value = `${sample.city || ""}${sample.address || ""}`;
    els.city.value = sample.city || "";
    els.district.value = parseAddress(els.address.value).district || "";
    els.buildingType.value = "";
    els.layout.value = "";
    els.ping.value = "";
    els.managementFee.value = "";
    updateLinks();
    analyze();
  }

  function clearForm() {
    els.form.reset();
    els.city.value = "";
    updateLinks();
    renderEmptyRows();
    renderAnalysis(getCase(), [], buildExternalStats(getCase(), []));
    setSourceStatus("按下產生建議後，系統會先嘗試讀取 591 搜尋結果；實價登錄目前以官方查詢頁為準。", "");
  }

  async function copyCurrentAddress() {
    const address = els.address.value.trim();
    if (!address) {
      showToast("請先輸入地址");
      return;
    }
    try {
      await navigator.clipboard.writeText(address);
      showToast("地址已複製");
    } catch {
      showToast("無法自動複製，請手動選取地址");
    }
  }

  function parseNumber(value) {
    if (value === null || value === undefined || value === "") return null;
    const number = Number(String(value).replace(/[^\d.]/g, ""));
    return Number.isFinite(number) && number > 0 ? number : null;
  }

  function median(values) {
    const sorted = values.filter((value) => Number.isFinite(value)).sort((a, b) => a - b);
    if (!sorted.length) return null;
    const middle = Math.floor(sorted.length / 2);
    return sorted.length % 2 ? sorted[middle] : Math.round((sorted[middle - 1] + sorted[middle]) / 2);
  }

  function percentile(sortedValues, p) {
    if (!sortedValues.length) return null;
    const index = (sortedValues.length - 1) * p;
    const lower = Math.floor(index);
    const upper = Math.ceil(index);
    if (lower === upper) return sortedValues[lower];
    return sortedValues[lower] + (sortedValues[upper] - sortedValues[lower]) * (index - lower);
  }

  function roundToHundred(value) {
    return Math.round(value / 100) * 100;
  }

  function formatMoney(value) {
    if (!Number.isFinite(value)) return "－";
    return `${Math.round(value).toLocaleString("zh-TW")} 元`;
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function showToast(message) {
    clearTimeout(toastTimer);
    els.toast.textContent = message;
    els.toast.classList.add("show");
    toastTimer = setTimeout(() => els.toast.classList.remove("show"), 2400);
  }

  init();
})();
