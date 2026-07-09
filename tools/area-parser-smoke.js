const fs = require("fs");
const path = require("path");
const vm = require("vm");

const appPath = path.join(__dirname, "..", "app.js");
let code = fs.readFileSync(appPath, "utf8");
code = code.replace("  init();\n})();", "  globalThis.__areaTest = { extractRecognizedFields, buildAreaRows, compactText };\n})();");

const dummyElement = {
  value: "",
  textContent: "",
  innerHTML: "",
  className: "",
  classList: { add() {}, remove() {}, toggle() {} },
  addEventListener() {},
  appendChild() {},
  querySelector() { return dummyElement; },
  querySelectorAll() { return []; },
};

const context = {
  console,
  setTimeout,
  clearTimeout,
  URLSearchParams,
  window: {
    RENT_ASSISTANT_DATA: {
      generatedAt: "2026-07-09T00:00:00+08:00",
      cityRegions: {
        "桃園市": "taoyuan",
        "台北市": "taipei",
        "新北市": "newtaipei",
        "基隆市": "keelung",
        "台中市": "taichung",
      },
      pendingCases: [],
    },
  },
  document: {
    querySelector() { return dummyElement; },
    querySelectorAll() { return []; },
    createElement() { return dummyElement; },
  },
};

vm.createContext(context);
vm.runInContext(code, context, { filename: "app.js" });

function approx(actual, expected, label) {
  if (Math.abs(actual - expected) > 0.02) {
    throw new Error(`${label}: expected ${expected}, got ${actual}`);
  }
}

const mixedTableText = `
桃園市平鎮地政事務所
建物標示部
建物門牌 桃園市平鎮區金陵路三段197巷46之2號七樓
層次 總面積 層次面積 主要用途
七層 38.51 住家用
附屬建物 用途 面積
陽台 5.21 平方公尺
共有部分
建號 總面積 權利範圍
0001-0000 1600.00 平方公尺 權利範圍 10000分之200
停車位 0002-0000 500.00 平方公尺 權利範圍 10000分之50
`;

const spacedLabelText = `
桃園市平鎮地政事務所
建 物 標 示 部
建 物 門 牌 桃園市平鎮區金陵路三段197巷46之2號七樓
層 次 面 積 七 層 45.30 平 方 公 尺
附 屬 建 物 陽 台 4.70 平 方 公 尺
共 有 部 分 1000.00 平 方 公 尺 權 利 範 圍 10000 分 之 200
`;

const taichungAddressText = `
台中市清水地政事務所
建物標示部
建物門牌 台中市清水區中華路三段197巷46之2號七樓
層次 總面積 層次面積 主要用途
七層 113.45 平方公尺 住家用
附屬建物 用途 面積
陽台 6.24 平方公尺
共有部分
建號 總面積 權利範圍
0001-0000 1701.49 平方公尺 權利範圍 10000分之244
`;

const unsafeTotalOnly = `
建物標示部
建物門牌 桃園市平鎮區金陵路三段197巷46之2號七樓
總面積 54.06
共有部分
`;

const api = context.__areaTest;
const first = api.extractRecognizedFields(mixedTableText, "桃園市平鎮區謄本.pdf");
approx(first.sqm, 73.22, "mixed table sqm");
approx(first.ping, 22.15, "mixed table ping");
if (first.city !== "桃園市" || first.district !== "平鎮區") {
  throw new Error(`location failed: ${first.city}/${first.district}`);
}

const second = api.extractRecognizedFields(spacedLabelText, "平鎮區謄本.pdf");
approx(second.sqm, 70, "spaced label sqm");
approx(second.ping, 21.18, "spaced label ping");
if (second.address !== "桃園市平鎮區金陵路三段197巷46之2號七樓") {
  throw new Error(`spaced address failed: ${second.address}`);
}

const third = api.extractRecognizedFields(taichungAddressText, "台中市清水區謄本.pdf");
if (third.city !== "台中市" || third.district !== "清水區") {
  throw new Error(`taichung location failed: ${third.city}/${third.district}`);
}
if (third.address !== "台中市清水區中華路三段197巷46之2號七樓") {
  throw new Error(`taichung address failed: ${third.address}`);
}
if (!third.areaRows || third.areaRows.length < 3) {
  throw new Error(`area rows missing: ${third.areaRows && third.areaRows.length}`);
}

const unsafe = api.extractRecognizedFields(unsafeTotalOnly, "平鎮區謄本.pdf");
if (unsafe.ping) {
  throw new Error(`unsafe total should not produce ping, got ${unsafe.ping}`);
}

console.log(JSON.stringify({
  mixedPing: first.ping,
  mixedFormula: first.formula,
  spacedPing: second.ping,
  taichungAddress: third.address,
  taichungRows: third.areaRows.length,
  unsafePing: unsafe.ping,
}, null, 2));
