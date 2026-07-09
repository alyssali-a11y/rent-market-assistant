(function () {
  const SQM_TO_PING = 0.3025;
  const AREA_UNIT_PATTERN = "(?:平方公尺|㎡|m²|m2|M2|平方米)";
  const OCR_WARNING = "注意：線上辨識功能有限，請務必再次確認相關欄位後再送出！！";
  const JOIN_LABELS = [
    "建物標示部",
    "土地標示部",
    "建物所有權部",
    "所有權部",
    "建物他項權利部",
    "他項權利部",
    "建物門牌",
    "建物地址",
    "房屋門牌",
    "門牌地址",
    "主要用途",
    "主要建材",
    "建築完成日期",
    "建築基地權利",
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
  const CITY_NAMES = Object.keys(DISTRICT_TO_CITIES).reduce((cities, district) => {
    DISTRICT_TO_CITIES[district].forEach((city) => {
      if (!cities.includes(city)) cities.push(city);
    });
    return cities;
  }, []);
  const DISTRICT_NAMES = Object.keys(DISTRICT_TO_CITIES).sort((a, b) => b.length - a.length);

  const $ = (selector) => document.querySelector(selector);
  const numberText = (value, digits = 2) => Number(value.toFixed(digits)).toString();

  function setup() {
    const button = $("#runDocOcr");
    if (!button) return;
    button.addEventListener("click", handleRecognition, true);
  }

  async function handleRecognition(event) {
    event.preventDefault();
    event.stopImmediatePropagation();
    const file = selectedFile();
    if (!file) {
      toast("請先選擇權狀或謄本檔案");
      return;
    }
    buttonDisabled(true);
    setStatus("辨識中，PDF 會先讀文字層；掃描圖檔才會啟動 OCR。", "");
    renderFields(null);
    try {
      const text = await extractDocumentText(file);
      const fields = extractFields(text, file.name);
      applyFields(fields);
      renderFields(fields);
      const count = ["city", "district", "address", "ping"].filter((key) => fields[key]).length;
      setStatus(count ? `已完成辨識，已嘗試帶入 ${count} 個欄位。` : "已讀取文件，但沒有找到可自動帶入的欄位。", count ? "good" : "warn");
      toast(count ? "辨識完成，請再次確認欄位" : "請手動確認欄位");
    } catch (error) {
      console.error(error);
      setStatus("辨識失敗，請改上傳原始 PDF 謄本或手動輸入欄位。", "bad");
      toast("辨識失敗，請手動確認欄位");
    } finally {
      buttonDisabled(false);
    }
  }

  function selectedFile() {
    return ($("#docUpload") && $("#docUpload").files && $("#docUpload").files[0])
      || ($("#docCamera") && $("#docCamera").files && $("#docCamera").files[0])
      || null;
  }

  function buttonDisabled(value) {
    const button = $("#runDocOcr");
    if (button) button.disabled = value;
  }

  async function extractDocumentText(file) {
    const isPdf = file.type === "application/pdf" || /\.pdf$/i.test(file.name);
    if (!isPdf) return recognizeImageText(file);
    if (!window.pdfjsLib) throw new Error("PDF 解析套件尚未載入");
    const pdfjsLib = window.pdfjsLib;
    if (pdfjsLib.GlobalWorkerOptions) {
      pdfjsLib.GlobalWorkerOptions.workerSrc = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
    }
    const buffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: buffer }).promise;
    const chunks = [];
    const maxTextPages = Math.min(pdf.numPages, 4);
    for (let pageNumber = 1; pageNumber <= maxTextPages; pageNumber += 1) {
      const page = await pdf.getPage(pageNumber);
      const content = await page.getTextContent();
      chunks.push(content.items.map((item) => item.str || "").join(" "));
    }
    const text = chunks.join("\n");
    if (compactText(text).length >= 80 || !window.Tesseract) return text;
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
    if (!window.Tesseract) throw new Error("OCR 套件尚未載入");
    const result = await window.Tesseract.recognize(source, "chi_tra+eng");
    return (result && result.data && result.data.text) || "";
  }

  function extractFields(text, fileName) {
    const normalized = normalizeText(text);
    const compact = compactText(normalized);
    const address = extractAddress(normalized, compact);
    const addressLocation = parseAddress(address);
    const fileLocation = inferLocation(fileName || "");
    const issueCity = extractIssueCity(compact);
    const sectionDistrict = extractSectionDistrict(compact);
    const area = extractArea(normalized);
    const district = addressLocation.district || fileLocation.district || sectionDistrict || "";
    let city = addressLocation.city || fileLocation.city || issueCity || "";
    if (!city && district) {
      const candidates = DISTRICT_TO_CITIES[district] || [];
      if (candidates.length === 1) city = candidates[0];
    }
    return {
      city,
      district,
      address,
      ping: area ? area.ping : null,
      sqm: area ? area.sqm : null,
      formula: area ? area.formula : "",
    };
  }

  function extractArea(text) {
    const section = buildingSection(text) || normalizeOcrText(text);
    const rows = [];
    extractMainAreas(section).forEach((sqm) => rows.push({ type: "main", sqm, numerator: 1, denominator: 1, sign: 1 }));
    extractAccessoryAreas(section).forEach((sqm) => rows.push({ type: "accessory", sqm, numerator: 1, denominator: 1, sign: 1 }));
    extractCommonRows(section).forEach((row) => rows.push(row));
    const expectsMoreRows = /共有部分|共同使用部分|附屬建物/.test(section);
    const hasLayerArea = /層次面積/.test(section);
    if (!hasLayerArea && expectsMoreRows && rows.length === 1 && rows[0].type === "main") return null;
    if (!rows.some((row) => row.type === "main")) return null;
    const sqm = rows.reduce((sum, row) => sum + row.sign * row.sqm * row.numerator / row.denominator, 0);
    if (!(sqm > 0)) return null;
    const mainSqm = rows.filter((row) => row.type === "main").reduce((sum, row) => sum + row.sqm, 0);
    const accessorySqm = rows.filter((row) => row.type === "accessory").reduce((sum, row) => sum + row.sqm, 0);
    const commonSqm = rows.filter((row) => row.type === "common").reduce((sum, row) => sum + row.sqm * row.numerator / row.denominator, 0);
    const parkingSqm = rows.filter((row) => row.type === "parking").reduce((sum, row) => sum + row.sqm * row.numerator / row.denominator, 0);
    const details = [
      `主建物 ${numberText(mainSqm)}`,
      accessorySqm ? `附屬 ${numberText(accessorySqm)}` : "",
      commonSqm ? `共有 ${numberText(commonSqm)}` : "",
      parkingSqm ? `車位扣除 ${numberText(parkingSqm)}` : "",
    ].filter(Boolean).join("＋").replace("＋車位扣除", "－車位扣除");
    return {
      sqm,
      ping: sqm * SQM_TO_PING,
      formula: `權狀面積約 ${numberText(sqm)} 平方公尺，${numberText(sqm * SQM_TO_PING)} 坪（${details}）`,
    };
  }

  function extractMainAreas(section) {
    const target = sectionBetween(section, /主建物(?:層次)?(?:面積)?/, /附屬建物|共有部分|共同使用部分|建物門牌|主要用途|建築完成|登記原因|所有權部/)
      || sectionUntil(section, /附屬建物|共有部分|共同使用部分|建築完成日期|其他登記事項|所有權部/);
    const layer = valuesAfterLabel(target, "層次面積");
    if (layer.length) return unique(layer);
    const total = valuesAfterLabel(target, "總面積");
    if (total.length) return [total[0]];
    return unique(valuesFromLines(ocrLines(target).filter((line) => !/總面積/.test(line))));
  }

  function extractAccessoryAreas(section) {
    const target = sectionBetween(section, /附屬建物(?:用途)?(?:面積)?/, /共有部分|共同使用部分|主建物|建物門牌|主要用途|建築完成|登記原因|所有權部/);
    if (!target) return [];
    const values = valuesFromLines(ocrLines(target));
    if (values.length) return unique(values);
    const compact = compactText(target);
    return unique([...compact.matchAll(/(?:陽台|平台|雨遮|露台|花台|騎樓)([0-9]+(?:\.[0-9]+)?)(?:平方公尺)?/g)].map((match) => Number(match[1])));
  }

  function extractCommonRows(section) {
    const shared = sectionBetween(section, /共有部分|共同使用部分/, /建築基地權利|建物所有權部|所有權部|土地標示部|他項權利部/);
    if (!shared) return [];
    const rows = allocationsFromText(shared);
    return rows.map((row) => ({
      type: row.isParking ? "parking" : "common",
      sqm: row.area,
      numerator: row.numerator,
      denominator: row.denominator,
      sign: row.isParking ? -1 : 1,
    }));
  }

  function allocationsFromText(text) {
    const normalized = normalizeOcrText(text);
    return [...normalized.matchAll(/([0-9]+)\s*分之\s*([0-9]+)/g)].map((match) => {
      const denominator = Number(match[1]);
      const numerator = Number(match[2]);
      if (!denominator || !numerator || numerator > denominator) return null;
      const before = normalized.slice(Math.max(0, match.index - 220), match.index);
      const after = normalized.slice(match.index, Math.min(normalized.length, match.index + 90));
      const unitMatches = [...before.matchAll(new RegExp(`([0-9]+(?:\\.[0-9]+)?)\\s*${AREA_UNIT_PATTERN}`, "g"))];
      const decimalMatches = [...before.matchAll(/([0-9]+\.[0-9]+)/g)];
      const areaMatch = unitMatches.length ? unitMatches[unitMatches.length - 1] : decimalMatches[decimalMatches.length - 1];
      const area = areaMatch ? Number(areaMatch[1]) : NaN;
      if (!Number.isFinite(area)) return null;
      const context = `${before.slice(-80)}${match[0]}${after.slice(0, 40)}`;
      return { area, numerator, denominator, isParking: /含停車位|停車位編號|車位編號|車位權利範圍|停車位[^，。；;]{0,24}權利範圍/.test(context) };
    }).filter(Boolean);
  }

  function buildingSection(text) {
    return sectionBetween(text, /建物標示部|標示部/, /土地標示部|所有權部|建物所有權部|他項權利部|建物他項權利部/);
  }

  function sectionBetween(text, startPattern, stopPattern) {
    const normalized = normalizeOcrText(text);
    const start = normalized.search(startPattern);
    if (start < 0) return "";
    const rest = normalized.slice(start);
    const stop = rest.slice(2).search(stopPattern);
    return stop >= 0 ? rest.slice(0, stop + 2) : rest;
  }

  function sectionUntil(text, stopPattern) {
    const normalized = normalizeOcrText(text);
    const stop = normalized.search(stopPattern);
    return stop >= 0 ? normalized.slice(0, stop) : normalized;
  }

  function ocrLines(text) {
    return normalizeOcrText(text)
      .replace(/(建物標示部|主建物|層次面積|總面積|附屬建物用途|附屬建物|共有部分|共同使用部分|權利範圍|建築完成日期|建築基地權利|建物所有權部|所有權部)/g, "\n$1")
      .replace(/([。；;])/g, "$1\n")
      .split(/\n+/)
      .map((line) => line.trim())
      .filter(Boolean);
  }

  function valuesAfterLabel(text, label) {
    const compact = compactText(normalizeOcrText(text));
    const regex = new RegExp(`${escapeRegExp(label)}[^0-9]{0,90}([0-9]+(?:\\.[0-9]+)?)(?:${AREA_UNIT_PATTERN})?`, "g");
    return [...compact.matchAll(regex)]
      .map((match) => Number(match[1]))
      .filter((value) => Number.isFinite(value) && value > 0 && value < 10000);
  }

  function valuesFromLines(lines) {
    const values = [];
    lines.forEach((line) => {
      if (/權利範圍|分之/.test(line) && !new RegExp(AREA_UNIT_PATTERN).test(line)) return;
      const unitRegex = new RegExp(`([0-9]+(?:\\.[0-9]+)?)\\s*${AREA_UNIT_PATTERN}`, "g");
      const units = [...line.matchAll(unitRegex)].map((match) => Number(match[1]));
      if (units.length) {
        values.push(...units);
        return;
      }
      values.push(...[...line.matchAll(/([0-9]+\.[0-9]+)/g)].map((match) => Number(match[1])));
    });
    return values.filter((value) => Number.isFinite(value) && value > 0 && value < 10000);
  }

  function extractAddress(text, compact) {
    const labels = ["建物門牌", "建物地址", "房屋門牌", "門牌地址", "建物坐落", "門牌"];
    for (const label of labels) {
      const index = compact.indexOf(label);
      if (index < 0) continue;
      const address = cleanAddress(compact.slice(index + label.length, index + label.length + 120));
      if (address) return address;
    }
    const line = text.split(/\n+/).find((item) => /(?:路|街|大道|巷|弄).{0,30}號/.test(item));
    return line ? cleanAddress(line) : "";
  }

  function cleanAddress(raw) {
    let value = compactText(raw);
    const stop = value.search(/(?:主要用途|總面積|層次|建物標示|登記|權利範圍|附屬建物|共有部分|所有權|備考|建築完成)/);
    if (stop > 0) value = value.slice(0, stop);
    const cityIndex = CITY_NAMES.map((city) => value.indexOf(city)).filter((index) => index >= 0).sort((a, b) => a - b)[0];
    if (Number.isFinite(cityIndex)) value = value.slice(cityIndex);
    const districtIndex = DISTRICT_NAMES.map((district) => value.indexOf(district)).filter((index) => index >= 0).sort((a, b) => a - b)[0];
    if (!Number.isFinite(cityIndex) && Number.isFinite(districtIndex)) value = value.slice(districtIndex);
    const door = value.match(/^(.+?(?:路|街|大道|巷|弄|段).{0,50}?[\d一二三四五六七八九十百]+號(?:之[\d一二三四五六七八九十]+)?(?:[\d一二三四五六七八九十]+樓(?:之[\d一二三四五六七八九十]+)?)?)/);
    if (door) return door[1];
    const simple = value.match(/^(.{0,30}?[\d一二三四五六七八九十百]+號(?:之[\d一二三四五六七八九十]+)?(?:[\d一二三四五六七八九十]+樓(?:之[\d一二三四五六七八九十]+)?)?)/);
    return simple ? simple[1] : "";
  }

  function parseAddress(address) {
    const normalized = compactText(address);
    const city = CITY_NAMES.find((item) => normalized.includes(item)) || "";
    const district = DISTRICT_NAMES.find((item) => normalized.includes(item)) || "";
    return { city, district };
  }

  function inferLocation(text) {
    const normalized = compactText(text);
    let city = CITY_NAMES.find((item) => normalized.includes(item));
    if (!city) city = CITY_NAMES.find((item) => normalized.includes(item.replace(/[市縣]$/, ""))) || "";
    const district = DISTRICT_NAMES.find((item) => normalized.includes(item)) || "";
    if (!city && district) {
      const candidates = DISTRICT_TO_CITIES[district] || [];
      if (candidates.length === 1) city = candidates[0];
    }
    return { city, district };
  }

  function extractIssueCity(compact) {
    const agency = compact.match(/([\u4e00-\u9fff]{2,8}(?:市|縣))?[\u4e00-\u9fff]{0,12}(?:地政事務所|登記機關|核發機關|縣市政府)/);
    if (!agency) return "";
    const text = agency[0];
    return CITY_NAMES.find((city) => text.includes(city) || text.includes(city.replace(/[市縣]$/, ""))) || "";
  }

  function extractSectionDistrict(compact) {
    const match = compact.match(/([\u4e00-\u9fff]{1,4}(?:區|鎮|鄉|市))[\u4e00-\u9fff]{1,12}段/);
    return match ? match[1] : "";
  }

  function applyFields(fields) {
    if (!fields) return;
    const address = $("#address");
    const city = $("#city");
    const district = $("#district");
    const ping = $("#ping");
    if (address && fields.address) address.value = fields.address;
    if (city && fields.city) city.value = fields.city;
    if (district && fields.district) district.value = fields.district;
    if (ping && fields.ping) ping.value = numberText(fields.ping);
    address && address.dispatchEvent(new Event("input", { bubbles: true }));
  }

  function renderFields(fields) {
    const target = $("#docDetectedFields");
    if (!target) return;
    if (!fields) {
      target.innerHTML = "";
      return;
    }
    const items = [
      ["縣市", fields.city],
      ["行政區", fields.district],
      ["地址", fields.address],
      ["坪數", fields.ping ? `${numberText(fields.ping)} 坪` : ""],
    ].filter(([, value]) => value);
    if (!items.length) {
      target.innerHTML = `<p class="recognition-warning">${OCR_WARNING}</p>`;
      return;
    }
    target.innerHTML = `
      <div class="detected-grid">
        ${items.map(([label, value]) => `<div class="detected-item"><span>${html(label)}</span><strong>${html(value)}</strong></div>`).join("")}
      </div>
      ${fields.formula ? `<small>${html(fields.formula)}</small>` : ""}
      <p class="recognition-warning">${OCR_WARNING}</p>
    `;
  }

  function setStatus(message, level) {
    const status = $("#docStatus");
    if (!status) return;
    status.textContent = message;
    status.className = `doc-status ${level || ""}`.trim();
  }

  function toast(message) {
    const toastEl = $("#toast");
    if (!toastEl) return;
    toastEl.textContent = message;
    toastEl.classList.add("show");
    setTimeout(() => toastEl.classList.remove("show"), 2200);
  }

  function normalizeText(text) {
    return toHalfWidth(String(text || ""))
      .replace(/\r/g, "\n")
      .replace(/臺/g, "台")
      .replace(/[﹒‧]/g, ".")
      .replace(/[㎡]/g, "平方公尺");
  }

  function compactText(text) {
    return normalizeText(text).replace(/[\s　:：,，。；;、]/g, "");
  }

  function normalizeOcrText(text) {
    const fullWidth = "０１２３４５６７８９．";
    const halfWidth = "0123456789.";
    const normalized = normalizeText(text)
      .replace(/[０-９．]/g, (char) => halfWidth[fullWidth.indexOf(char)] || char)
      .replace(/[,，]/g, "")
      .replace(/\s+/g, " ");
    return JOIN_LABELS.reduce((output, label) => {
      const loose = label.split("").map(escapeRegExp).join("\\s*");
      return output.replace(new RegExp(loose, "g"), label);
    }, normalized);
  }

  function unique(values) {
    const seen = new Set();
    return values.filter((value) => {
      const key = numberText(value, 4);
      if (!Number.isFinite(value) || seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  function toHalfWidth(text) {
    return String(text || "").replace(/[！-～]/g, (char) => String.fromCharCode(char.charCodeAt(0) - 0xfee0));
  }

  function escapeRegExp(value) {
    return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }

  function html(value) {
    return String(value).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", setup);
  } else {
    setup();
  }
})();
