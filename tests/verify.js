/* Thiên Số — Regression harness (numerology).
   Chạy: node tests/verify.js
   Tự chứa: đọc các file JS gốc trong repo, tách phần logic thuần từ app.js, chạy qua 6 hồ sơ. */
const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '..');

global.window = {};
for (const f of ['assets/js/data.js', 'assets/js/data-numbers.js', 'assets/js/data-cycles.js']) {
  new Function('window', fs.readFileSync(path.join(ROOT, f), 'utf8'))(window);
}
const NUM = window.NUM;
Object.keys(NUM.numbersDeep).forEach((k) => {
  NUM.numbers[k] = Object.assign({}, NUM.numbers[k] || {}, NUM.numbersDeep[k]);
});

const src = fs.readFileSync(path.join(ROOT, 'assets/js/app.js'), 'utf8');
const consts = src.slice(src.indexOf('var LETTER_VALUES'), src.indexOf('var CORE_KEYS'));
const pure = src.slice(src.indexOf('/* ---------- Numerology ---------- */'), src.indexOf('/* ---------- Rendering ---------- */'));
const api = new Function('NUM', 'currentYear', consts + pure +
  '\nreturn {computeProfile, computeCycles, reduceNum, normalizeName};')(NUM, 2026);

let fails = 0;
const check = (cond, msg) => { if (!cond) { fails++; console.log('FAIL:', msg); } };

const cases = [
  ['Nguyễn Thu Hà', { d: 29, m: 9, y: 1995 }],
  ['Đặng Thị Ánh Tuyết', { d: 29, m: 11, y: 2009 }],
  ['Lê Văn A', { d: 22, m: 11, y: 1991 }],
  ['Trần Thị Bích Ngọc', { d: 1, m: 1, y: 2000 }],
  ['Phạm Minh Khoa', { d: 12, m: 12, y: 1988 }],
  ['Võ Thị Hồng', { d: 5, m: 6, y: 1975 }],
];

for (const [name, dob] of cases) {
  const p = api.computeProfile(name, dob);
  const c = api.computeCycles(p);

  const digits = String(dob.d) + String(dob.m) + String(dob.y);
  const expectDob = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0 };
  for (const ch of digits) if (ch !== '0') expectDob[Number(ch)]++;
  check(JSON.stringify(expectDob) === JSON.stringify(p.dobCounts), `${name}: dobCounts != digits`);
  for (let n = 1; n <= 9; n++) {
    check(p.counts[n] === p.dobCounts[n] + p.nameCounts[n], `${name}: counts[${n}] != dob+name`);
  }

  const lines = NUM.cycles.arrows.lines;
  for (const arrow of lines) {
    const filled = arrow.cells.filter((n) => p.dobCounts[n] > 0).length;
    const isActive = c.activeArrows.includes(arrow);
    const isEmpty = c.emptyArrows.includes(arrow);
    check(isActive === (filled === arrow.cells.length), `${name}: active ${arrow.cells.join('')}`);
    check(isEmpty === (filled === 0), `${name}: empty ${arrow.cells.join('')}`);
    check(!(isActive && isEmpty), `${name}: arrow both active+empty`);
  }

  const ageLP = p.lifePath === 33 ? 6 : p.lifePath;
  const expectedEnd = 36 - ageLP;
  check(c.pinnacles[0].from === 0 && c.pinnacles[0].to === expectedEnd, `${name}: pinnacle 1 range`);
  for (let i = 1; i < 4; i++) {
    check(c.pinnacles[i].from === c.pinnacles[i - 1].to + 1, `${name}: pinnacle gap ${i}`);
    if (i < 3) check(c.pinnacles[i].to === c.pinnacles[i].from + 8, `${name}: pinnacle len ${i}`);
  }
  check(c.pinnacles[3].to === null, `${name}: last pinnacle open`);
  check(c.pinnacles.every((x) => NUM.cycles.pinnacles[x.value]), `${name}: pinnacle data`);
  check(c.challenges.every((x) => NUM.cycles.challenges[x.value] !== undefined), `${name}: challenge data`);
  check(NUM.numbers[p.lifePath], `${name}: lifePath data`);

  // missing/repeated tính theo dobCounts
  const expectMissing = [];
  const expectRepeated = [];
  for (let n = 1; n <= 9; n++) {
    if (p.dobCounts[n] === 0) expectMissing.push(n);
    else if (p.dobCounts[n] >= 2) expectRepeated.push({ n, count: p.dobCounts[n] });
  }
  expectRepeated.sort((a, b) => b.count - a.count || a.n - b.n);
  check(JSON.stringify(p.missing) === JSON.stringify(expectMissing), `${name}: missing`);
  check(JSON.stringify(p.repeated) === JSON.stringify(expectRepeated), `${name}: repeated`);

  console.log(`${name} ${dob.d}/${dob.m}/${dob.y} | LP ${p.lifePath} | P1 ${c.pinnacles[0].from}-${c.pinnacles[0].to}` +
    ` | active ${c.activeArrows.map((a) => a.cells.join('')).join(',') || '-'}` +
    ` | empty ${c.emptyArrows.map((a) => a.cells.join('')).join(',') || '-'}`);
}

const p33 = api.computeProfile('Đặng Thị Ánh Tuyết', { d: 29, m: 11, y: 2009 });
check(p33.lifePath === 33, 'expected lifePath 33');
check(api.computeCycles(p33).pinnacles[0].to === 30, 'lifePath 33 should end P1 at 30');

console.log(fails ? `\n${fails} FAILED` : '\nALL CHECKS PASSED');
process.exit(fails ? 1 : 0);
