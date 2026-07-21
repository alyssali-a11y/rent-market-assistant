const fs = require("fs");
const path = require("path");
const vm = require("vm");

const appPath = path.join(__dirname, "..", "app.js");
let code = fs.readFileSync(appPath, "utf8");
code = code.replace(
  "  init();\n})();",
  "  globalThis.__addressTest = { parseAddress, buildMapAddress, sanitizeMapAddress };\n})();",
);

const dummyElement = {
  value: "",
  checked: false,
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
  URL,
  URLSearchParams,
  window: {
    location: { href: "https://rent-market-assistant.vercel.app/" },
    RENT_ASSISTANT_DATA: {
      generatedAt: "2026-07-09T00:00:00+08:00",
      cityRegions: {
        "台中市": 8,
        "台北市": 1,
        "新北市": 3,
        "新竹市": 4,
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

const api = context.__addressTest;
const cases = [
  {
    label: "strip floor",
    input: { address: "台中市北區三民路三段129號12樓", city: "", district: "" },
    expected: "台灣台中市北區三民路三段129號",
  },
  {
    label: "preserve sub number",
    input: { address: "臺北市中正區中華路二段467巷38弄5號之1 8樓", city: "", district: "" },
    expected: "台灣台北市中正區中華路二段467巷38弄5號之1",
  },
  {
    label: "prepend selected location",
    input: { address: "三民路三段129號12樓", city: "台中市", district: "北區" },
    expected: "台灣台中市北區三民路三段129號",
  },
  {
    label: "explicit address wins",
    input: { address: "台中市北區三民路三段129號", city: "台北市", district: "中正區" },
    expected: "台灣台中市北區三民路三段129號",
  },
  {
    label: "keep house number without road",
    input: { address: "129號12樓", city: "台中市", district: "北區" },
    expected: "台灣台中市北區129號",
  },
  {
    label: "strip postal code",
    input: { address: "404台中市北區三民路三段129號12樓", city: "", district: "" },
    expected: "台灣台中市北區三民路三段129號",
  },
];

for (const testCase of cases) {
  const actual = api.buildMapAddress(testCase.input);
  if (actual !== testCase.expected) {
    throw new Error(`${testCase.label}: expected ${testCase.expected}, got ${actual}`);
  }
}

const normalizedLocation = api.parseAddress("臺中市北區三民路三段129號");
if (normalizedLocation.city !== "台中市" || normalizedLocation.district !== "北區") {
  throw new Error(`traditional variant parsing failed: ${JSON.stringify(normalizedLocation)}`);
}

console.log(JSON.stringify({
  cases: cases.length,
  sample: api.buildMapAddress(cases[0].input),
  normalizedLocation,
}, null, 2));
