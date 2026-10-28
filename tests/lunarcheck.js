/* Thiên Số — lunarcheck (âm lịch + Mai Hoa + 64 quẻ).
   Chạy: node tests/lunarcheck.js
   Kiểm tra Tết, Trung thu, Can Chi năm, hexByLines round-trip 64/64, Mai Hoa sample. */
const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '..');
global.window = {};
const load = (f) => new Function('window', fs.readFileSync(path.join(ROOT, f), 'utf8'))(window);
load('assets/js/lunar.js');
load('assets/js/iching.js');
load('assets/js/data-hexagrams.js');
const L = window.LUNAR, I = window.ICHING;

let fails = 0;
const check = (cond, msg) => { if (!cond) { fails++; console.log('FAIL:', msg); } };

const pad = (n) => String(n).padStart(2, '0');
const fmt = (o) => `${pad(o.day)}/${pad(o.month)}/${o.year}` + (o.leap ? ' NHUẬN' : '');

console.log('--- Tết ---');
const tet = [
  [10, 2, 2024],
  [29, 1, 2025],
  [17, 2, 2026],
  [22, 1, 2023],
];
for (const [d, m, y] of tet) {
  const r = L.solarToLunar(d, m, y);
  console.log(`${pad(d)}/${pad(m)}/${y} -> ${fmt(r)}`);
  check(r.day === 1 && r.month === 1, `${pad(d)}/${pad(m)}/${y} Tết không phải 1/1/${y}`);
}

console.log('--- Trung thu (15/8) ---');
for (const [d, m, y] of [[17, 9, 2024], [6, 10, 2025], [25, 9, 2026]]) {
  const r = L.solarToLunar(d, m, y);
  console.log(`${pad(d)}/${pad(m)}/${y} -> ${fmt(r)}`);
  check(r.day === 15 && r.month === 8, `${pad(d)}/${pad(m)}/${y} Trung thu không phải 15/8`);
}

console.log('--- Can Chi năm ---');
for (const y of [2023, 2024, 2025, 2026]) {
  console.log(y, L.canChiYear(y));
  check(typeof L.canChiYear(y) === 'string' && L.canChiYear(y).length > 0, `Can Chi năm ${y} rỗng`);
}

console.log('--- Hexagram round-trip ---');
let loaded = Object.keys(I.hexagrams || {}).length;
console.log('hexagrams loaded:', loaded);
let bad = 0;
for (let n = 1; n <= 64; n++) {
  const h = I.structure[n];
  check(!!h, `thiếu cấu trúc quẻ ${n}`);
  if (!h) continue;
  const back = I.hexByLines(h.lines);
  if (back !== n) { bad++; console.log('mismatch', n, back); }
}
check(loaded === 64, `số quẻ khác 64 (${loaded})`);
check(bad === 0, `hexByLines round-trip có ${bad} sai sót`);

console.log('--- Mai Hoa sample ---');
for (const [d, m, y, hour] of [[28, 10, 2026, 5], [17, 2, 2026, 0], [1, 1, 2000, 11]]) {
  const info = L.birthInfo(d, m, y, hour);
  const q = I.castMaiHoa(info);
  console.log(`${pad(d)}/${pad(m)}/${y} h=${hour}`, JSON.stringify(q));
  for (const k of ['primary', 'mutual', 'changed']) {
    const v = q[k];
    check(v >= 1 && v <= 64, `Mai Hoa ${k} ngoài 1-64: ${v}`);
    check(!!I.hexagrams[v], `Mai Hoa ${k}=${v} thiếu dữ liệu quẻ`);
  }
}

console.log(fails ? `\n${fails} FAILED` : '\nALL CHECKS PASSED');
process.exit(fails ? 1 : 0);
