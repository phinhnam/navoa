/* Thiên Số — numcheck (numerology smoke).
   Chạy: node tests/numcheck.js
   Kiểm tra normalizeName, computeProfile, computeCycles có NUM.numbers entry cho mọi chỉ số, và không crash. */
const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '..');

global.window = {};
window.matchMedia = () => ({ matches: false });
const NM = (f) => new Function('window', 'document', fs.readFileSync(path.join(ROOT, f), 'utf8'));
NM('assets/js/data.js')(window, {});
NM('assets/js/data-numbers.js')(window, {});
NM('assets/js/data-cycles.js')(window, {});
const NUM = window.NUM;
Object.keys(NUM.numbersDeep).forEach((k) => {
  NUM.numbers[k] = Object.assign({}, NUM.numbers[k] || {}, NUM.numbersDeep[k]);
});

const src = fs.readFileSync(path.join(ROOT, 'assets/js/app.js'), 'utf8');
const consts = src.slice(src.indexOf('var LETTER_VALUES'), src.indexOf('var CORE_KEYS'));
const pure = src.slice(src.indexOf('/* ---------- Numerology ---------- */'), src.indexOf('/* ---------- Rendering ---------- */'));
const currentYear = new Date().getFullYear();
const api = new Function('NUM', 'currentYear', consts + pure +
  '\nreturn {normalizeName, reduceNum, reduceNoMaster, computeProfile, computeCycles, personalYearCycle, karmicNumber};')(NUM, currentYear);

let fails = 0;
const check = (cond, msg) => { if (!cond) { fails++; console.log('FAIL:', msg); } };

const cases = [
  ['Nguyễn Thu Hà', { d: 29, m: 9, y: 1995 }],
  ['Đặng Thị Ánh Tuyết', { d: 29, m: 11, y: 2009 }],
  ['Lê Văn A', { d: 22, m: 11, y: 1991 }],
  ['123', { d: 1, m: 1, y: 2000 }],
];

for (const [name, dob] of cases) {
  console.log('\n==', name, dob);
  console.log('normalize:', api.normalizeName(name));
  let p;
  try { p = api.computeProfile(name, dob); } catch (e) { fails++; console.log('PROFILE CRASH', e.message); continue; }
  const keys = ['lifePath','destiny','soul','personality','birthday','maturity','attitude','balance','personalYear'];
  console.log(Object.fromEntries(keys.map(k => [k, p[k]])));
  for (const k of keys) {
    const v = p[k];
    if (v === null) continue;
    if (!NUM.numbers[v]) { fails++; console.log('!! no NUM.numbers entry for', k, '=', v); }
  }
  let c;
  try { c = api.computeCycles(p); } catch (e) { fails++; console.log('CYCLES CRASH', e.message); continue; }
  console.log('firstEnd =', 36 - p.lifePath, '(reduced lifePath', api.reduceNoMaster(p.lifePath) + ')');
  console.log('pinnacles:', c.pinnacles.map(x => `${x.value}@${x.from}-${x.to}`).join(' | '));
  console.log('challenges:', c.challenges.map(x => `${x.value}@${x.from}-${x.to}`).join(' | '));
  c.challenges.forEach(x => { if (NUM.cycles.challenges[x.value] === undefined) { fails++; console.log('!! no challenge text for', x.value); } });
  c.pinnacles.forEach(x => { if (NUM.cycles.pinnacles[x.value] === undefined) { fails++; console.log('!! no pinnacle text for', x.value); } });
  console.log('debts:', JSON.stringify(c.debts), 'personalMonth:', c.personalMonth, 'hiddenPassion:', c.hiddenPassion);
  console.log('pyCycle:', api.personalYearCycle(p.personalYear).map(x => x.year + ':' + x.value).join(' '));
}

console.log(fails ? `\n${fails} FAILED` : '\nALL CHECKS PASSED');
process.exit(fails ? 1 : 0);
