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
    docUpload: document.querySelector("#docUpload"),
    docCamera: document.querySelector("#docCamera"),
    runDocOcr: document.querySelector("#runDocOcr"),
    docStatus: document.querySelector("#docStatus"),
    docDetectedFields: document.querySelector("#docDetectedFields"),
    loadSample: document.querySelector("#loadSample"),
    clearForm: document.querySelector("#clearForm"),
    clearFormTop: document.querySelector("#clearFormTop"),
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
  const OCR_WARNING = "注意：線上辨識功能有限，請務必再次確認相關欄位後再送出！！";
  const SQM_TO_PING = 0.3025;
  const AREA_UNIT_PATTERN = "(?:平方公尺|㎡|m²|m2|M2|平方米)";
  const BUILDING_LAYER_PATTERN = "(?:地下(?:[一二三四五六七八九十百0-9]+)?層|第?[一二三四五六七八九十百0-9]+層(?:之[一二三四五六七八九十百0-9]+)?|騎樓|夾層|屋頂突出物)";
  const ADDRESS_NUMBER_PATTERN = "[\\d一二三四五六七八九十百]+(?:之[\\d一二三四五六七八九十百]+)?號";
  const OCR_JOIN_LABELS = [
    "建物標示部",
    "土地標示部",
    "建物所有權部",
    "所有權部",
    "建物他項權利部",
    "他項權利部",
    "建物門牌",
    "建物坐落地號",
    "主要用途",
    "主要建材",
    "建築完成日期",
    "建築基地權利",
    "登記原因",
    "主建物",
    "附屬建物",
    "附屬建物用途",
    "共有部分",
    "共同使用部分",
    "權利範圍",
    "層次面積",
    "總面積",
    "面積",
    "平方公尺",
    "停車位",
    "停車空間",
    "分之",
  ];
  let toastTimer = null;
  let selectedDocFile = null;

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
    els.clearForm.addEventListener("click", clearForm);
    if (els.clearFormTop) {
      els.clearFormTop.addEventListener("click", clearForm);
    }
    if (els.runAnalysisTop) {
      els.runAnalysisTop.addEventListener("click", analyze);
    }
    if (els.loadSample) {
      els.loadSample.addEventListener("click", loadSample);
    }
    els.copyAddress.addEventListener("click", copyCurrentAddress);
    [els.docUpload, els.docCamera].filter(Boolean).forEach((input) => {
      input.addEventListener("change", handleDocFileSelect);
    });
    if (els.runDocOcr) {
      els.runDocOcr.addEventListener("click", runDocumentRecognition);
    }
    if (els.docDetectedFields) {
      ["input", "change"].forEach((eventName) => {
        els.docDetectedFields.addEventListener(eventName, handleAreaReviewChange);
      });
    }

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
    els.matchesBody.innerHTML = '<tr><td class="empty-row" colspan="6">正在整理 591 與實價登錄來源狀態。</td></tr>';
  }

  async function loadExternalRows(currentCase) {
    const rows = [];
    const keyword = buildSearchKeyword(currentCase);
    const region = data.cityRegions[currentCase.city] || "";
    const kind = get591Kind(currentCase.buildingType);
    const params = new URLSearchParams({
      address: currentCase.address,
      city: currentCase.city,
      district: currentCase.district,
      keyword,
      region,
      kind,
      buildingType: currentCase.buildingType,
      layout: currentCase.layout,
      ping: currentCase.ping || "",
    });

    try {
      const response = await fetch(`/api/market?${params.toString()}`, { cache: "no-store" });
      if (response.ok) {
        const payload = await response.json();
        const parsedRows = normalize591Rows(payload.items || []);
        const moiRows = normalizeMoiRows(payload.moiItems || []);
        rows.push(...parsedRows);
        rows.push(...moiRows);
        if (parsedRows.length || moiRows.length) {
          setSourceStatus(`已讀取 ${parsedRows.length} 筆 591 待租物件、${moiRows.length} 筆內政部租賃實價 Open Data。`, "good");
        } else {
          setSourceStatus("已連線外部來源，但本次條件沒有整理出可比物件；可放寬路段、坪數或格局條件。", "warn");
        }
      } else {
        setSourceStatus("本機外部資料服務未回應，請從右側開啟 591 與實價登錄查詢頁。", "warn");
      }
    } catch {
      setSourceStatus("外部行情服務暫時無法回應，請稍後重試，或先從右側開啟 591 與實價登錄查詢頁。", "warn");
    }

    if (!rows.some((row) => row.sourceType === "591")) {
      rows.unshift(build591StatusRow(currentCase));
    }
    if (!rows.some((row) => row.sourceType === "MOI")) {
      rows.push(buildMoiStatusRow(currentCase));
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
      url: normalizeExternalUrl(item.url),
      note: item.note || "591 搜尋結果",
      pricePerPing: parseNumber(item.rent) && parseNumber(item.ping) ? Math.round(parseNumber(item.rent) / parseNumber(item.ping)) : null,
      status: "已讀取",
    }));
  }

  function build591StatusRow(currentCase) {
    return {
      sourceType: "591",
      sourceLabel: "591 租屋網",
      title: "591 尚未取得可比物件",
      address: buildSearchKeyword(currentCase) || currentCase.address || "請輸入地址",
      rent: null,
      ping: null,
      layout: currentCase.layout || "不限",
      url: els.rent591Link.href,
      note: "已嘗試讀取 591 外部來源；若沒有可比租金，請放寬路段、坪數或格局條件。",
      pricePerPing: null,
      status: "待查",
    };
  }

  function normalizeMoiRows(items) {
    return items.map((item) => ({
      sourceType: "MOI",
      sourceLabel: "內政部租賃實價",
      title: item.title || "租賃成交案例",
      address: item.address || "",
      rent: parseNumber(item.rent),
      ping: parseNumber(item.ping),
      layout: item.layout || "",
      url: normalizeExternalUrl(item.url || els.moiLink.href),
      date: item.date || "",
      note: item.note || "內政部租賃實價 Open Data",
      pricePerPing: parseNumber(item.rent) && parseNumber(item.ping) ? Math.round(parseNumber(item.rent) / parseNumber(item.ping)) : null,
      status: "已成交",
    })).sort((left, right) => dateSortValue(right.date) - dateSortValue(left.date));
  }

  function buildMoiStatusRow(currentCase) {
    return {
      sourceType: "MOI",
      sourceLabel: "內政部租賃實價",
      title: "Open Data 尚未取得成交案例",
      address: currentCase.address || [currentCase.city, currentCase.district].filter(Boolean).join(""),
      rent: null,
      ping: null,
      layout: currentCase.layout || "不限",
      url: els.moiLink.href,
      note: "已嘗試讀取內政部租賃實價 Open Data；若沒有成交案例，請放寬路段或行政區條件。",
      pricePerPing: null,
      status: "待查",
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
      moiCount: rows.filter((row) => row.sourceType === "MOI" && row.rent).length,
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
    els.webCount.textContent = `${stats.moiCount} 筆`;
    els.pppValue.textContent = stats.pppMedian ? `${formatMoney(stats.pppMedian)}／坪` : "－";
    els.sampleScope.textContent = buildSearchKeyword(currentCase) || "請輸入地址";

    if (stats.low && stats.high) {
      els.recommendedBand.textContent = `${formatMoney(roundToHundred(stats.low))}～${formatMoney(roundToHundred(stats.high))}`;
      els.recommendedNote.textContent = "綜合 591 待租價與內政部租賃成交價";
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
    if (stats.source591Count + stats.moiCount >= 6) return { level: "good", label: "外部樣本充足" };
    if (stats.source591Count + stats.moiCount >= 2) return { level: "warn", label: "可先報區間" };
    return { level: "risk", label: "需查外部頁" };
  }

  function buildTalkTrack(currentCase, stats) {
    if (!currentCase.address) {
      return "輸入地址後，系統會先讀取 591 待租物件與內政部租賃實價 Open Data，現場以外部行情作為主要說法。";
    }
    if (!stats.low || !stats.high) {
      return "目前尚未取得足夠的外部租金數字。建議先按右側 591 與內政部實價登錄連結，確認同路段、同格局、同坪數的租金，再對屋主說明要以外部公開行情為準。";
    }

    const band = `${formatMoney(roundToHundred(stats.low))} 到 ${formatMoney(roundToHundred(stats.high))}`;
    return `依 591 目前周邊待租價與內政部租賃實價成交資料，這類條件可先抓 ${band} 元／月；向屋主說明刊登價會略高於成交價，建議用外部公開行情作為定價依據。`;
  }

  function renderRows(rows) {
    if (!rows.length) {
      renderEmptyRows();
      return;
    }
    els.matchesBody.innerHTML = rows.map((item) => {
      const safeUrl = normalizeExternalUrl(item.url);
      const linkAttributes = safeUrl
        ? `href="${escapeHtml(safeUrl)}" target="_blank" rel="noopener noreferrer" referrerpolicy="no-referrer"`
        : "";
      const title = safeUrl
        ? `<a ${linkAttributes}>${escapeHtml(item.title)}</a>`
        : escapeHtml(item.title);
      const rent = item.rent ? formatMoney(item.rent) : item.status;
      const ping = item.ping ? `${item.ping} 坪` : "－";
      const pricePerPing = item.pricePerPing ? `${formatMoney(item.pricePerPing)}／坪` : "－";
      const sourceClass = item.sourceType === "MOI" ? "source-moi" : "source-591";
      const actionLabel = item.sourceType === "MOI" ? "開啟官方查詢" : item.status === "待查" ? "開啟搜尋頁" : "查看物件";
      const sourceAction = safeUrl ? `<a class="source-page-link" ${linkAttributes}>${actionLabel}</a>` : "";
      return `
        <tr>
          <td class="address-cell" data-label="地址／標題"><div class="cell-content"><strong>${title}</strong><small>${escapeHtml(item.address || item.note || "－")}</small></div></td>
          <td data-label="租金"><div class="cell-content cell-number">${rent}</div></td>
          <td data-label="坪數"><div class="cell-content cell-number">${ping}</div></td>
          <td data-label="單坪價"><div class="cell-content cell-number">${pricePerPing}</div></td>
          <td data-label="格局"><div class="cell-content">${escapeHtml(item.layout || "－")}</div></td>
          <td class="source-cell" data-label="來源"><div class="cell-content"><span class="source-badge ${sourceClass}">${escapeHtml(item.sourceLabel)}</span><small>${escapeHtml(item.note || "")}</small>${sourceAction}</div></td>
        </tr>
      `;
    }).join("");
  }

  function renderEmptyRows() {
    els.matchesBody.innerHTML = '<tr><td class="empty-row" colspan="6">輸入地址後，這裡會顯示 591 待租物件與內政部租賃實價 Open Data。</td></tr>';
  }

  function updateLinks() {
    const currentCase = getCase();
    const address = buildMapAddress(currentCase);
    const keyword = buildSearchKeyword(currentCase);
    const encodedAddress = encodeURIComponent(address || "台北市");
    const region = data.cityRegions[currentCase.city];
    const kind = get591Kind(currentCase.buildingType);
    const rent591Params = new URLSearchParams();
    if (region) rent591Params.set("region", region);
    if (kind) rent591Params.set("kind", kind);
    rent591Params.set("keywords", keyword || address || "租屋");

    els.mapsLink.href = `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`;
    els.mapFrame.src = `https://maps.google.com/maps?q=${encodedAddress}&output=embed`;
    els.moiLink.href = "https://lvr.land.moi.gov.tw/";
    els.rent591Link.href = `https://rent.591.com.tw/list?${rent591Params.toString()}`;
  }

  function buildSearchKeyword(currentCase) {
    const address = currentCase.address;
    if (!address) return [currentCase.city, currentCase.district].filter(Boolean).join(" ");
    const road = address.match(/([\u4e00-\u9fff\d]+(?:大道|路|街)(?:[一二三四五六七八九十\d]+段)?)/);
    return [currentCase.district, road ? road[1] : ""].filter(Boolean).join(" ");
  }

  function buildMapAddress(currentCase) {
    const address = currentCase.address || "";
    const normalizedAddress = normalizeAddress(address);
    const parts = [];
    if (currentCase.city && !normalizedAddress.includes(normalizeAddress(currentCase.city))) {
      parts.push(currentCase.city);
    }
    if (currentCase.district && !normalizedAddress.includes(normalizeAddress(currentCase.district))) {
      parts.push(currentCase.district);
    }
    if (address) {
      parts.push(address);
    }
    return parts.join("");
  }

  function get591Kind(buildingType) {
    if (buildingType === "店面") return "5";
    if (buildingType === "商辦") return "6";
    return "";
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
    selectedDocFile = null;
    if (els.docUpload) els.docUpload.value = "";
    if (els.docCamera) els.docCamera.value = "";
    if (els.runDocOcr) els.runDocOcr.disabled = true;
    setDocStatus("可上傳 PDF、權狀或謄本照片，辨識後會嘗試帶入縣市、行政區、地址與坪數。", "");
    renderRecognizedFields(null);
    updateLinks();
    renderEmptyRows();
    renderAnalysis(getCase(), [], buildExternalStats(getCase(), []));
    setSourceStatus("按下產生建議後，系統會讀取 591 搜尋結果與內政部租賃實價 Open Data。", "");
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

  function handleDocFileSelect(event) {
    const file = event.target.files && event.target.files[0];
    if (!file) return;
    selectedDocFile = file;
    if (els.runDocOcr) els.runDocOcr.disabled = false;
    setDocStatus(`已選擇「${file.name}」，按下開始辨識後會嘗試帶入欄位。`, "");
    renderRecognizedFields(null);
  }

  async function runDocumentRecognition() {
    if (!selectedDocFile) {
      showToast("請先選擇權狀或謄本檔案");
      return;
    }

    if (els.runDocOcr) els.runDocOcr.disabled = true;
    setDocStatus("辨識中，PDF 會先讀文字層；掃描圖檔才會啟動 OCR。", "");
    renderRecognizedFields(null);

    try {
      const text = await extractDocumentText(selectedDocFile);
      if (!text.trim()) {
        throw new Error("文件沒有可讀文字");
      }

      const fields = extractRecognizedFields(text, selectedDocFile.name);
      applyRecognizedFields(fields);
      renderRecognizedFields(fields);

      const appliedCount = ["city", "district", "address", "ping"].filter((key) => fields[key]).length;
      if (appliedCount) {
        setDocStatus(`已完成辨識，已嘗試帶入 ${appliedCount} 個欄位。`, "good");
        showToast("辨識完成，請再次確認欄位");
      } else {
        setDocStatus("已讀取文件，但沒有找到可自動帶入的欄位。請改用更清楚的謄本或手動輸入。", "warn");
      }
    } catch (error) {
      console.error(error);
      setDocStatus("辨識失敗，請改上傳原始 PDF 謄本或手動輸入欄位。", "bad");
      showToast("辨識失敗，請手動確認欄位");
    } finally {
      if (els.runDocOcr) els.runDocOcr.disabled = !selectedDocFile;
    }
  }

  async function extractDocumentText(file) {
    const isPdf = file.type === "application/pdf" || /\.pdf$/i.test(file.name);
    if (isPdf) {
      return readPdfText(file);
    }
    return recognizeImageText(file);
  }

  async function readPdfText(file) {
    if (!window.pdfjsLib) {
      throw new Error("PDF 解析套件尚未載入");
    }

    const pdfjsLib = window.pdfjsLib;
    if (pdfjsLib.GlobalWorkerOptions) {
      pdfjsLib.GlobalWorkerOptions.workerSrc = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
    }

    const buffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: buffer }).promise;
    const maxTextPages = Math.min(pdf.numPages, 4);
    const chunks = [];

    for (let pageNumber = 1; pageNumber <= maxTextPages; pageNumber += 1) {
      const page = await pdf.getPage(pageNumber);
      const content = await page.getTextContent();
      const pageText = content.items.map((item) => item.str || "").join(" ");
      chunks.push(pageText);
    }

    const text = chunks.join("\n");
    if (compactText(text).length >= 80 || !window.Tesseract) {
      return text;
    }

    const ocrChunks = [];
    const maxOcrPages = Math.min(pdf.numPages, 2);
    for (let pageNumber = 1; pageNumber <= maxOcrPages; pageNumber += 1) {
      const page = await pdf.getPage(pageNumber);
      const viewport = page.getViewport({ scale: 1.55 });
      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d");
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      await page.render({ canvasContext: context, viewport }).promise;
      ocrChunks.push(await recognizeImageText(canvas));
    }
    return [text, ...ocrChunks].join("\n");
  }

  async function recognizeImageText(source) {
    if (!window.Tesseract) {
      throw new Error("OCR 套件尚未載入");
    }
    const result = await window.Tesseract.recognize(source, "chi_tra+eng");
    return (result && result.data && result.data.text) || "";
  }

  function extractRecognizedFields(text, fileName) {
    const normalized = normalizeDocText(text);
    const compact = compactText(normalized);
    const fileLocation = inferLocationFromText(fileName || "");
    const address = extractTranscriptAddress(normalized, compact);
    const addressLocation = address ? parseAddress(address) : { city: "", district: "" };
    const issueCity = extractIssueCity(compact);
    const sectionDistrict = extractSectionDistrict(compact);
    const area = extractTitleArea(normalized, compact);

    const district = addressLocation.district || fileLocation.district || sectionDistrict || "";
    let city = addressLocation.city || fileLocation.city || issueCity || "";
    if (!city && district) {
      const possibleCities = DISTRICT_TO_CITIES[district] || [];
      if (possibleCities.length === 1) city = possibleCities[0];
    }

    return {
      city,
      district,
      address,
      ping: area ? area.ping : null,
      sqm: area ? area.sqm : null,
      formula: area ? area.formula : "",
      source: area ? area.source : "",
      areaRows: area ? area.rows : [],
    };
  }

  function applyRecognizedFields(fields) {
    if (!fields) return;
    if (fields.address) {
      els.address.value = fields.address;
    }
    if (fields.city && CITY_NAMES.includes(fields.city)) {
      els.city.value = fields.city;
    }
    if (fields.district) {
      els.district.value = fields.district;
    }
    if (fields.ping) {
      els.ping.value = formatDecimal(fields.ping, 2);
    }
    syncAddressParts();
    updateLinks();
  }

  function renderRecognizedFields(fields) {
    if (!els.docDetectedFields) return;
    if (!fields) {
      els.docDetectedFields.innerHTML = "";
      return;
    }

    const items = [
      ["縣市", fields.city],
      ["行政區", fields.district],
      ["地址", fields.address],
      ["坪數", fields.ping ? `${formatDecimal(fields.ping, 2)} 坪` : ""],
    ].filter(([, value]) => value);

    if (!items.length) {
      els.docDetectedFields.innerHTML = `<p class="recognition-warning">${OCR_WARNING}</p>`;
      return;
    }

    els.docDetectedFields.innerHTML = `
      <div class="detected-grid">
        ${items.map(([label, value]) => `
          <div class="detected-item">
            <span>${escapeHtml(label)}</span>
            <strong${label === "坪數" ? ' id="detectedPingValue"' : ""}>${escapeHtml(value)}</strong>
          </div>
        `).join("")}
      </div>
      ${fields.areaRows && fields.areaRows.length ? renderAreaReview(fields.areaRows) : ""}
      ${fields.formula ? `<small>${escapeHtml(fields.formula)}</small>` : ""}
      <p class="recognition-warning">${OCR_WARNING}</p>
    `;
  }

  function renderAreaReview(rows) {
    return `
      <div class="area-review" aria-label="權狀面積拆解確認">
        <div class="area-review-head">
          <strong>權狀面積拆解確認</strong>
          <span>勾選或修正數字後會自動重算坪數</span>
        </div>
        <div class="area-review-rows">
          ${rows.map((row, index) => renderAreaReviewRow(row, index)).join("")}
        </div>
        <div class="area-review-total" id="areaReviewTotal">${escapeHtml(areaSummary(rows).formula)}</div>
      </div>
    `;
  }

  function renderAreaReviewRow(row, index) {
    const isParking = row.type === "parking";
    const label = row.name || areaRowLabel(row.type);
    return `
      <div class="area-review-row" data-sign="${row.sign}" data-type="${escapeHtml(row.type)}" data-name="${escapeHtml(label)}">
        <label class="area-review-check">
          <input class="area-use" type="checkbox" checked />
          <span>${escapeHtml(label)}${isParking ? "（扣除）" : ""}</span>
        </label>
        <label>
          <span>面積</span>
          <input class="area-sqm" type="number" inputmode="decimal" min="0" step="0.01" value="${escapeHtml(formatDecimal(row.sqm, 4))}" aria-label="${escapeHtml(label)}面積" />
        </label>
        <label>
          <span>分子</span>
          <input class="area-numerator" type="number" inputmode="numeric" min="1" step="1" value="${escapeHtml(String(row.numerator || 1))}" aria-label="${escapeHtml(label)}權利範圍分子" />
        </label>
        <label>
          <span>分母</span>
          <input class="area-denominator" type="number" inputmode="numeric" min="1" step="1" value="${escapeHtml(String(row.denominator || 1))}" aria-label="${escapeHtml(label)}權利範圍分母" />
        </label>
        <output class="area-row-result" data-row-result="${index}">${escapeHtml(areaRowFormula(row))}</output>
      </div>
    `;
  }

  function handleAreaReviewChange(event) {
    if (!event.target.closest(".area-review")) return;
    updateAreaReviewCalculation();
  }

  function collectAreaReviewRows() {
    if (!els.docDetectedFields) return [];
    return [...els.docDetectedFields.querySelectorAll(".area-review-row")].map((row) => {
      const sqm = parseNumber(row.querySelector(".area-sqm")?.value);
      const numerator = parseNumber(row.querySelector(".area-numerator")?.value) || 1;
      const denominator = parseNumber(row.querySelector(".area-denominator")?.value) || 1;
      const sign = Number(row.dataset.sign) || 1;
      const type = row.dataset.type || "common";
      const name = row.dataset.name || areaRowLabel(type);
      const checked = row.querySelector(".area-use")?.checked;
      if (!checked || !sqm || denominator <= 0) return null;
      return { type, name, sqm, numerator, denominator, sign };
    }).filter(Boolean);
  }

  function updateAreaReviewCalculation() {
    const rows = collectAreaReviewRows();
    const summary = areaSummary(rows);
    const total = document.querySelector("#areaReviewTotal");
    if (total) total.textContent = summary.formula;
    if (summary.sqm > 0) {
      els.ping.value = formatDecimal(summary.ping, 2);
      const detectedPing = document.querySelector("#detectedPingValue");
      if (detectedPing) detectedPing.textContent = `${formatDecimal(summary.ping, 2)} 坪`;
      syncAddressParts();
      updateLinks();
    } else {
      els.ping.value = "";
      const detectedPing = document.querySelector("#detectedPingValue");
      if (detectedPing) detectedPing.textContent = "－";
      updateLinks();
    }
    if (els.docDetectedFields) {
      els.docDetectedFields.querySelectorAll(".area-review-row").forEach((row) => {
        const output = row.querySelector(".area-row-result");
        const item = {
          type: row.dataset.type || "common",
          name: row.dataset.name || "",
          sign: Number(row.dataset.sign) || 1,
          sqm: parseNumber(row.querySelector(".area-sqm")?.value) || 0,
          numerator: parseNumber(row.querySelector(".area-numerator")?.value) || 1,
          denominator: parseNumber(row.querySelector(".area-denominator")?.value) || 1,
        };
        if (output) output.textContent = row.querySelector(".area-use")?.checked ? areaRowFormula(item) : "未採用";
      });
    }
  }

  function areaSummary(rows) {
    const sqm = rows.reduce((sum, row) => sum + row.sign * row.sqm * row.numerator / row.denominator, 0);
    const ping = sqm * SQM_TO_PING;
    const formulaParts = rows.map(areaRowFormula);
    return {
      sqm,
      ping,
      formula: sqm > 0
        ? `權狀面積 ${formatDecimal(sqm, 2)} 平方公尺，${formatDecimal(ping, 2)} 坪（${formulaParts.join("；")}）`
        : "未勾選可計算的權狀面積",
    };
  }

  function areaRowLabel(type) {
    return {
      main: "主建物",
      accessory: "附屬建物",
      common: "共有部分",
      parking: "車位共有部分",
    }[type] || "面積";
  }

  function areaRowFormula(row) {
    const allocated = row.sqm * row.numerator / row.denominator;
    const label = row.name || areaRowLabel(row.type);
    const fraction = row.numerator === 1 && row.denominator === 1 ? "" : ` × ${row.numerator} / ${row.denominator}`;
    const sign = row.sign < 0 ? "－" : "";
    return `${sign}${label} ${formatDecimal(row.sqm, 2)}${fraction} = ${sign}${formatDecimal(allocated, 2)} 平方公尺`;
  }

  function setDocStatus(message, level) {
    if (!els.docStatus) return;
    els.docStatus.textContent = message;
    els.docStatus.className = `doc-status ${level || ""}`.trim();
  }

  function normalizeDocText(text) {
    return toHalfWidth(String(text || ""))
      .replace(/\r/g, "\n")
      .replace(/臺/g, "台")
      .replace(/[﹒‧]/g, ".")
      .replace(/[㎡]/g, "平方公尺");
  }

  function compactText(text) {
    return normalizeDocText(text).replace(/[\s　:：,，。；;、]/g, "");
  }

  function escapeRegExp(value) {
    return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }

  function normalizeOcrLabels(text) {
    return OCR_JOIN_LABELS.reduce((output, label) => {
      const looseLabel = label.split("").map(escapeRegExp).join("\\s*");
      return output.replace(new RegExp(looseLabel, "g"), label);
    }, String(text || ""));
  }

  function normalizeOcrText(text) {
    const fullWidth = "０１２３４５６７８９．";
    const halfWidth = "0123456789.";
    const normalized = normalizeDocText(text)
      .replace(/[０-９．]/g, (char) => halfWidth[fullWidth.indexOf(char)] || char)
      .replace(/[,，]/g, "")
      .replace(/\s+/g, " ");
    return normalizeOcrLabels(normalized);
  }

  function toHalfWidth(text) {
    return String(text || "").replace(/[！-～]/g, (char) => String.fromCharCode(char.charCodeAt(0) - 0xfee0));
  }

  function inferLocationFromText(text) {
    const normalized = compactText(text);
    let city = CITY_NAMES.find((item) => normalized.includes(item));
    if (!city) {
      city = CITY_NAMES.find((item) => {
        const shortName = item.replace(/[市縣]$/, "");
        return shortName.length >= 2 && normalized.includes(shortName);
      }) || "";
    }

    const district = DISTRICT_NAMES.find((item) => normalized.includes(item)) || "";
    if (!city && district) {
      const possibleCities = DISTRICT_TO_CITIES[district] || [];
      if (possibleCities.length === 1) city = possibleCities[0];
    }
    return { city, district };
  }

  function extractIssueCity(compact) {
    const agencyWindow = compact.match(/([\u4e00-\u9fff]{2,8}(?:市|縣))?[\u4e00-\u9fff]{0,12}(?:地政事務所|登記機關|核發機關|縣市政府)/);
    if (agencyWindow) {
      const agencyText = agencyWindow[0];
      const city = CITY_NAMES.find((item) => agencyText.includes(item) || agencyText.includes(item.replace(/[市縣]$/, "")));
      if (city) return city;
    }
    return "";
  }

  function extractSectionDistrict(compact) {
    const match = compact.match(/([\u4e00-\u9fff]{1,4}(?:區|鎮|鄉|市))[\u4e00-\u9fff]{1,12}段/);
    return match ? match[1] : "";
  }

  function extractTranscriptAddress(text, compact) {
    const labels = ["建物門牌", "建物地址", "房屋門牌", "門牌地址", "建物坐落", "門牌"];
    for (const label of labels) {
      const compactIndex = compact.indexOf(label);
      const textIndex = normalizeOcrText(text).indexOf(label);
      if (compactIndex === -1 && textIndex === -1) continue;
      const raw = compactIndex >= 0
        ? compact.slice(compactIndex + label.length, compactIndex + label.length + 180)
        : normalizeOcrText(text).slice(textIndex + label.length, textIndex + label.length + 180);
      const address = cleanTranscriptAddress(raw);
      if (address) return address;
    }

    const fullAddress = findAddressLikeText(text);
    return fullAddress ? cleanTranscriptAddress(fullAddress) : "";
  }

  function cleanTranscriptAddress(raw) {
    let value = compactText(raw);
    const stopIndex = value.search(/(?:主要用途|總面積|層次|建物標示|登記|權利範圍|附屬建物|共有部分|所有權|備考|建築完成)/);
    if (stopIndex > 0) value = value.slice(0, stopIndex);

    const cityIndex = CITY_NAMES.map((city) => value.indexOf(city)).filter((index) => index >= 0).sort((a, b) => a - b)[0];
    if (Number.isFinite(cityIndex)) value = value.slice(cityIndex);
    const districtIndex = DISTRICT_NAMES.map((district) => value.indexOf(district)).filter((index) => index >= 0).sort((a, b) => a - b)[0];
    if (!Number.isFinite(cityIndex) && Number.isFinite(districtIndex)) value = value.slice(districtIndex);

    const doorMatch = value.match(new RegExp(`^(.+?(?:路|街|大道|巷|弄|段).{0,60}?${ADDRESS_NUMBER_PATTERN}(?:[\\d一二三四五六七八九十百]+樓(?:之[\\d一二三四五六七八九十百]+)?)?)`));
    if (doorMatch) return doorMatch[1];
    const simpleMatch = value.match(new RegExp(`^(.{0,30}?${ADDRESS_NUMBER_PATTERN}(?:[\\d一二三四五六七八九十百]+樓(?:之[\\d一二三四五六七八九十百]+)?)?)`));
    return simpleMatch ? simpleMatch[1] : "";
  }

  function findAddressLikeText(text) {
    const normalized = compactText(text);
    const cityAlternates = CITY_NAMES.map(escapeRegExp).join("|");
    const districtAlternates = DISTRICT_NAMES.map(escapeRegExp).join("|");
    const patterns = [
      new RegExp(`((?:${cityAlternates})?(?:${districtAlternates})?.{0,40}?(?:大道|路|街|巷|弄|段).{0,70}?${ADDRESS_NUMBER_PATTERN}(?:[\\d一二三四五六七八九十百]+樓(?:之[\\d一二三四五六七八九十百]+)?)?)`),
      new RegExp(`((?:${cityAlternates})(?:${districtAlternates}).{0,90}?${ADDRESS_NUMBER_PATTERN}(?:[\\d一二三四五六七八九十百]+樓(?:之[\\d一二三四五六七八九十百]+)?)?)`),
    ];
    for (const pattern of patterns) {
      const match = normalized.match(pattern);
      if (match) return match[1];
    }
    return "";
  }

  function extractTitleArea(text, compact) {
    const rows = buildAreaRows(text, compact);
    const hasMain = rows.some((row) => row.type === "main");
    if (hasMain) {
      const sqm = rows.reduce((sum, row) => sum + row.sign * row.sqm * row.numerator / row.denominator, 0);
      if (sqm > 0) {
        const mainSqm = rows.filter((row) => row.type === "main").reduce((sum, row) => sum + row.sqm, 0);
        const accessorySqm = rows.filter((row) => row.type === "accessory").reduce((sum, row) => sum + row.sqm, 0);
        const commonSqm = rows.filter((row) => row.type === "common").reduce((sum, row) => sum + row.sqm * row.numerator / row.denominator, 0);
        const parkingSqm = rows.filter((row) => row.type === "parking").reduce((sum, row) => sum + row.sqm * row.numerator / row.denominator, 0);
        const details = [
          `主建物 ${formatDecimal(mainSqm, 2)}`,
          accessorySqm ? `附屬 ${formatDecimal(accessorySqm, 2)}` : "",
          commonSqm ? `共有 ${formatDecimal(commonSqm, 2)}` : "",
          parkingSqm ? `車位扣除 ${formatDecimal(parkingSqm, 2)}` : "",
        ].filter(Boolean).join("＋").replace("＋車位扣除", "－車位扣除");
        return {
          sqm,
          ping: sqm * SQM_TO_PING,
          source: "權狀面積",
          formula: `權狀面積約 ${formatDecimal(sqm, 2)} 平方公尺，${formatDecimal(sqm * SQM_TO_PING, 2)} 坪（${details}）`,
          rows,
        };
      }
    }

    const pingMatch = compact.match(/(?:權狀坪數|謄本坪數|建物坪數|坪數)([0-9]+(?:\.[0-9]+)?)坪?/);
    if (pingMatch) {
      const ping = Number(pingMatch[1]);
      return { sqm: ping / SQM_TO_PING, ping, source: "權狀面積", formula: `權狀面積約 ${formatDecimal(ping, 2)} 坪` };
    }

    const sqmMatch = compact.match(/(?:權狀面積|謄本面積|登記面積)([0-9]+(?:\.[0-9]+)?)平方公尺/);
    if (sqmMatch) {
      const sqm = Number(sqmMatch[1]);
      return {
        sqm,
        ping: sqm * SQM_TO_PING,
        source: "權狀面積",
        formula: `權狀面積約 ${formatDecimal(sqm, 2)} 平方公尺，${formatDecimal(sqm * SQM_TO_PING, 2)} 坪`,
      };
    }

    return null;
  }

  function buildAreaRows(text, compact) {
    const section = buildingMarkSection(text) || normalizeOcrText(text);
    const rows = [];
    const mainAreas = extractMainAreaEntries(section);
    mainAreas.forEach((entry) => rows.push({
      type: "main",
      name: entry.name,
      sqm: entry.sqm,
      numerator: 1,
      denominator: 1,
      sign: 1,
    }));

    extractAccessoryAreas(section).forEach((sqm) => {
      rows.push({ type: "accessory", sqm, numerator: 1, denominator: 1, sign: 1 });
    });

    extractCommonRows(section).forEach((row) => rows.push(row));

    const expectsMoreRows = /共有部分|共同使用部分|附屬建物/.test(section);
    const hasLayerArea = /層次面積/.test(section);
    const onlyUnsafeMainTotal = !hasLayerArea && expectsMoreRows && rows.length === 1 && rows[0].type === "main";
    return onlyUnsafeMainTotal ? [] : rows;
  }

  function normalizeOcrLines(text) {
    return normalizeOcrText(text)
      .replace(/(建物標示部|主建物|層次面積|總面積|附屬建物用途|附屬建物|共有部分|共同使用部分|權利範圍|建築完成日期|建築基地權利|建物所有權部|所有權部)/g, "\n$1")
      .replace(/([。；;])/g, "$1\n")
      .split(/\n+/)
      .map((line) => line.trim())
      .filter(Boolean);
  }

  function sectionBetween(text, startPattern, stopPattern) {
    const normalized = normalizeOcrText(text);
    const start = normalized.search(startPattern);
    if (start < 0) return "";
    const rest = normalized.slice(start);
    const stop = rest.slice(2).search(stopPattern);
    return stop >= 0 ? rest.slice(0, stop + 2) : rest;
  }

  function buildingMarkSection(text) {
    return sectionBetween(text, /建物標示部|標示部/, /土地標示部|所有權部|建物所有權部|他項權利部|建物他項權利部/);
  }

  function subsection(text, startPattern, stopPattern) {
    return sectionBetween(text, startPattern, stopPattern) || "";
  }

  function sharedPartSection(section) {
    return subsection(section, /共有部分|共同使用部分/, /建築基地權利|建物所有權部|所有權部|土地標示部|他項權利部/) || "";
  }

  function sectionUntil(text, stopPattern) {
    const normalized = normalizeOcrText(text);
    const stop = normalized.search(stopPattern);
    return stop >= 0 ? normalized.slice(0, stop) : normalized;
  }

  function areaValuesFromText(text) {
    const normalized = normalizeOcrText(text);
    const unitRegex = new RegExp(`([0-9]+(?:\\.[0-9]+)?)\\s*${AREA_UNIT_PATTERN}`, "g");
    const unitValues = [...normalized.matchAll(unitRegex)]
      .map((match) => Number(match[1]))
      .filter((value) => Number.isFinite(value) && value > 0 && value < 10000);
    if (unitValues.length) return unitValues;

    return [...normalized.matchAll(/([0-9]+\.[0-9]+)/g)]
      .map((match) => Number(match[1]))
      .filter((value) => Number.isFinite(value) && value > 0 && value < 10000);
  }

  function areaValuesAfterLabel(text, label) {
    const normalized = normalizeOcrText(text);
    const compact = compactText(normalized);
    const labelPattern = escapeRegExp(label);
    const regex = new RegExp(`${labelPattern}[^0-9]{0,90}([0-9]+(?:\\.[0-9]+)?)(?:${AREA_UNIT_PATTERN})?`, "g");
    return [...compact.matchAll(regex)]
      .map((match) => Number(match[1]))
      .filter((value) => Number.isFinite(value) && value > 0 && value < 10000);
  }

  function areaValuesFromLines(lines) {
    const values = [];
    lines.forEach((line) => {
      if (/權利範圍|分之/.test(line) && !new RegExp(AREA_UNIT_PATTERN).test(line)) return;
      values.push(...areaValuesFromText(line));
    });
    return values;
  }

  function sumSectionAreas(section, startPattern, stopPattern) {
    const target = subsection(section, startPattern, stopPattern);
    if (!target) return 0;
    const values = areaValuesFromLines(normalizeOcrLines(target));
    return uniqueNumbers(values).reduce((sum, value) => sum + value, 0);
  }

  function extractMainAreaEntries(section) {
    const target = subsection(section, /主建物(?:層次)?(?:面積)?/, /附屬建物|共有部分|共同使用部分|建物門牌|主要用途|建築完成|登記原因|所有權部/)
      || sectionUntil(section, /附屬建物|共有部分|共同使用部分|建築完成日期|其他登記事項|所有權部/);
    if (!target) return [];

    const layerEntries = extractBuildingLayerEntries(target);
    if (layerEntries.length) return layerEntries;

    const areas = areaValuesAfterLabel(target, "層次面積");
    if (areas.length) {
      return areas.map((sqm, index) => ({
        name: areas.length > 1 ? `主建物（第 ${index + 1} 筆）` : "主建物",
        sqm,
      }));
    }

    const totalAreas = areaValuesAfterLabel(target, "總面積");
    if (totalAreas.length) return [{ name: "主建物", sqm: totalAreas[0] }];

    const lines = normalizeOcrLines(target).filter((line) => !/總面積/.test(line));
    return uniqueNumbers(areaValuesFromLines(lines)).map((sqm) => ({ name: "主建物", sqm }));
  }

  function extractBuildingLayerEntries(text) {
    const normalized = normalizeOcrText(text);
    const pattern = new RegExp(`(?<layer>${BUILDING_LAYER_PATTERN})`, "g");
    const matches = [...normalized.matchAll(pattern)];
    const entries = [];

    matches.forEach((match, index) => {
      const start = match.index + match[0].length;
      const end = index + 1 < matches.length ? matches[index + 1].index : normalized.length;
      const segment = normalized.slice(start, end);
      const sqm = extractLayerSegmentArea(segment);
      if (!sqm) return;
      entries.push({ name: `主建物（${match.groups?.layer || match[0]}）`, sqm });
    });

    if (entries.length < matches.length && matches.length > 1) {
      const areaScope = normalized.slice(matches[0].index);
      const unitValues = [...areaScope.matchAll(new RegExp(`([0-9]+(?:\\.[0-9]+)?)\\s*${AREA_UNIT_PATTERN}`, "g"))]
        .map((item) => validAreaNumber(item[1]))
        .filter(Boolean);
      const decimalValues = [...areaScope.matchAll(/([0-9]+\.[0-9]+)/g)]
        .map((item) => validAreaNumber(item[1]))
        .filter(Boolean);
      const orderedValues = unitValues.length === matches.length
        ? unitValues
        : (decimalValues.length === matches.length ? decimalValues : []);
      if (orderedValues.length === matches.length) {
        return matches.map((match, index) => ({
          name: `主建物（${match.groups?.layer || match[0]}）`,
          sqm: orderedValues[index],
        }));
      }
    }

    return entries;
  }

  function extractLayerSegmentArea(segment) {
    const labeled = segment.match(new RegExp(`層次面積[^0-9]{0,60}([0-9]+(?:\\.[0-9]+)?)(?:\\s*${AREA_UNIT_PATTERN})?`));
    if (labeled) return validAreaNumber(labeled[1]);

    const unitArea = segment.match(new RegExp(`([0-9]+(?:\\.[0-9]+)?)\\s*${AREA_UNIT_PATTERN}`));
    if (unitArea) return validAreaNumber(unitArea[1]);

    const decimalArea = segment.match(/([0-9]+\.[0-9]+)/);
    return decimalArea ? validAreaNumber(decimalArea[1]) : null;
  }

  function validAreaNumber(value) {
    const number = Number(value);
    return Number.isFinite(number) && number > 0 && number < 10000 ? number : null;
  }

  function extractAccessoryAreas(section) {
    const target = subsection(section, /附屬建物(?:用途)?(?:面積)?/, /共有部分|共同使用部分|主建物|建物門牌|主要用途|建築完成|登記原因|所有權部/);
    if (!target) return [];
    const values = areaValuesFromLines(normalizeOcrLines(target));
    if (values.length) return uniqueNumbers(values);

    const compact = compactText(target);
    return uniqueNumbers([...compact.matchAll(/(?:陽台|平台|雨遮|露台|花台|騎樓)([0-9]+(?:\.[0-9]+)?)(?:平方公尺)?/g)].map((match) => Number(match[1])));
  }

  function extractCommonRows(section) {
    const sharedSection = sharedPartSection(section);
    if (!sharedSection) return [];
    const rows = areaAllocationsFromText(sharedSection);
    if (rows.length) {
      return rows.map((row) => ({
        type: row.isParking ? "parking" : "common",
        sqm: row.area,
        numerator: row.numerator,
        denominator: row.denominator,
        sign: row.isParking ? -1 : 1,
      }));
    }

    return normalizeOcrLines(sharedSection)
      .map(areaAllocationFromLine)
      .filter(Boolean)
      .map((row) => ({
        type: row.isParking ? "parking" : "common",
        sqm: row.area,
        numerator: row.numerator,
        denominator: row.denominator,
        sign: row.isParking ? -1 : 1,
      }));
  }

  function areaAllocationFromLine(line) {
    const fraction = line.match(/([0-9]+)\s*分之\s*([0-9]+)/);
    const unitArea = line.match(new RegExp(`([0-9]+(?:\\.[0-9]+)?)\\s*${AREA_UNIT_PATTERN}`));
    const decimalAreas = [...line.matchAll(/([0-9]+\.[0-9]+)/g)].map((item) => Number(item[1]));
    const area = unitArea ? Number(unitArea[1]) : (decimalAreas.length ? Math.max(...decimalAreas) : NaN);
    if (!Number.isFinite(area)) return null;
    if (!fraction) return {
      area,
      numerator: 1,
      denominator: 1,
      isParking: isParkingAllocationContext(line),
    };

    const denominator = Number(fraction[1]);
    const numerator = Number(fraction[2]);
    if (!denominator || !numerator || numerator > denominator) return null;
    return {
      area,
      numerator,
      denominator,
      isParking: isParkingAllocationContext(line),
    };
  }

  function isParkingAllocationContext(text) {
    return /含停車位|停車位編號|車位編號|車位權利範圍|停車位[^，。；;]{0,24}權利範圍/.test(normalizeOcrText(text));
  }

  function areaAllocationsFromText(text) {
    const normalized = normalizeOcrText(text);
    const fractionMatches = [...normalized.matchAll(/([0-9]+)\s*分之\s*([0-9]+)/g)];
    return fractionMatches.map((match) => {
      const denominator = Number(match[1]);
      const numerator = Number(match[2]);
      if (!denominator || !numerator || numerator > denominator) return null;

      const before = normalized.slice(Math.max(0, match.index - 220), match.index);
      const contextAfter = normalized.slice(match.index, Math.min(normalized.length, match.index + 90));
      const unitMatches = [...before.matchAll(new RegExp(`([0-9]+(?:\\.[0-9]+)?)\\s*${AREA_UNIT_PATTERN}`, "g"))];
      const decimalMatches = [...before.matchAll(/([0-9]+\.[0-9]+)/g)];
      const areaMatch = unitMatches.length ? unitMatches[unitMatches.length - 1] : decimalMatches[decimalMatches.length - 1];
      const area = areaMatch ? Number(areaMatch[1]) : NaN;
      if (!Number.isFinite(area)) return null;
      const context = `${before.slice(-80)}${match[0]}${contextAfter.slice(0, 40)}`;
      return {
        area,
        numerator,
        denominator,
        isParking: isParkingAllocationContext(context),
      };
    }).filter(Boolean);
  }

  function findAreaNumber(text) {
    const section = normalizeOcrText(text);
    const labeledMatches = [...section.matchAll(/(?:總面積|面積|用途面積)(?:平方公尺)?([0-9]+(?:\.[0-9]+)?)(?:平方公尺)?/g)];
    if (labeledMatches.length) {
      return Number(labeledMatches[labeledMatches.length - 1][1]);
    }

    const unitMatches = [...section.matchAll(new RegExp(`([0-9]+(?:\\.[0-9]+)?)\\s*${AREA_UNIT_PATTERN}`, "g"))];
    if (unitMatches.length) {
      return Number(unitMatches[unitMatches.length - 1][1]);
    }

    const decimalMatches = [...section.matchAll(/[0-9]+\.[0-9]+/g)]
      .map((match) => Number(match[0]))
      .filter((value) => value > 0 && value < 100000);
    if (decimalMatches.length) {
      return decimalMatches[decimalMatches.length - 1];
    }

    const integerMatches = [...section.matchAll(/[0-9]+/g)]
      .map((match) => Number(match[0]))
      .filter((value) => value > 0 && value < 100000);
    return integerMatches.length ? integerMatches[integerMatches.length - 1] : null;
  }

  function sliceBetween(text, startLabels, endLabels) {
    const starts = startLabels.map((label) => text.indexOf(label)).filter((index) => index >= 0);
    if (!starts.length) return "";
    const start = Math.min(...starts);
    const end = endLabels
      .map((label) => text.indexOf(label, start + 1))
      .filter((index) => index > start)
      .sort((a, b) => a - b)[0];
    return text.slice(start, end || text.length);
  }

  function uniqueNumbers(values) {
    const seen = new Set();
    return values.filter((value) => {
      const key = formatDecimal(value, 4);
      if (!Number.isFinite(value) || seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }
  function formatDecimal(value, digits) {
    if (!Number.isFinite(value)) return "";
    return Number(value.toFixed(digits)).toString();
  }

  function parseNumber(value) {
    if (value === null || value === undefined || value === "") return null;
    const number = Number(String(value).replace(/[^\d.]/g, ""));
    return Number.isFinite(number) && number > 0 ? number : null;
  }

  function normalizeExternalUrl(value) {
    if (!value) return "";
    try {
      const url = new URL(String(value), window.location.href);
      return url.protocol === "https:" || url.protocol === "http:" ? url.href : "";
    } catch (_error) {
      return "";
    }
  }

  function dateSortValue(value) {
    const digits = String(value || "").replace(/[^\d]/g, "");
    return digits.length >= 8 ? Number(digits.slice(0, 8)) : 0;
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
