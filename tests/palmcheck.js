/* Thiên Số — palmcheck (Tướng pháp chỉ tay smoke & regression).
   Chạy: node tests/palmcheck.js */
const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '..');

global.window = {};
new Function('window', fs.readFileSync(path.join(ROOT, 'assets/js/data-palmistry.js'), 'utf8'))(window);

const P = window.PALMISTRY;
let fails = 0;
const check = (cond, msg) => { if (!cond) { fails++; console.log('FAIL:', msg); } };

check(!!P, 'window.PALMISTRY không tồn tại');
check(!!P.handTypes, 'thiếu handTypes');
check(Object.keys(P.handTypes).length === 4, 'handTypes không đủ 4 loại');

for (const k of ['earth', 'air', 'water', 'fire']) {
  const h = P.handTypes[k];
  check(!!h, `thiếu handType ${k}`);
  check(typeof h.name === 'string' && h.name.length > 0, `${k} thiếu name`);
  check(Array.isArray(h.traits) && h.traits.length >= 3, `${k} thiếu traits`);
  check(typeof h.nature === 'string' && h.nature.length > 0, `${k} thiếu nature`);
  check(Array.isArray(h.strengths) && h.strengths.length >= 2, `${k} thiếu strengths`);
  check(Array.isArray(h.challenges) && h.challenges.length >= 1, `${k} thiếu challenges`);
}

check(!!P.lines, 'thiếu lines');
const lineKeys = ['life', 'head', 'heart', 'fate', 'sun'];
check(Object.keys(P.lines).length === 5, 'lines không đủ 5 đại chỉ');

for (const lk of lineKeys) {
  const line = P.lines[lk];
  check(!!line, `thiếu line ${lk}`);
  check(typeof line.name === 'string' && line.name.length > 0, `${lk} thiếu name`);
  check(typeof line.han === 'string' && line.han.length > 0, `${lk} thiếu han`);
  check(typeof line.significance === 'string' && line.significance.length > 0, `${lk} thiếu significance`);
  check(!!line.options && Object.keys(line.options).length >= 3, `${lk} thiếu options`);
  for (const optKey of Object.keys(line.options)) {
    const opt = line.options[optKey];
    check(typeof opt.label === 'string' && opt.label.length > 0, `${lk}.${optKey} thiếu label`);
    check(typeof opt.reading === 'string' && opt.reading.length > 0, `${lk}.${optKey} thiếu reading`);
    check(typeof opt.advice === 'string' && opt.advice.length > 0, `${lk}.${optKey} thiếu advice`);
  }
}

check(!!P.specialSigns, 'thiếu specialSigns');
check(Object.keys(P.specialSigns).length >= 4, 'specialSigns không đủ 4 dấu ấn');
for (const sk of Object.keys(P.specialSigns)) {
  const sign = P.specialSigns[sk];
  check(typeof sign.name === 'string' && sign.name.length > 0, `${sk} thiếu name`);
  check(typeof sign.description === 'string' && sign.description.length > 0, `${sk} thiếu description`);
  check(typeof sign.reading === 'string' && sign.reading.length > 0, `${sk} thiếu reading`);
  check(typeof sign.advice === 'string' && sign.advice.length > 0, `${sk} thiếu advice`);
}

check(!!P.philosophy && typeof P.philosophy.quote === 'string', 'thiếu philosophy');

console.log('Palmistry verified: 4 hand types, 5 major lines, 4 special signs, philosophy included');
console.log(fails ? `\n${fails} FAILED` : 'ALL CHECKS PASSED');
process.exit(fails ? 1 : 0);
