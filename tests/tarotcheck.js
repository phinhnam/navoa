/* Thiên Số — Regression harness for Tarot data (data-tarot.js) */
'use strict';

const path = require('path');
global.window = {};
require(path.join(__dirname, '..', 'assets', 'js', 'data-tarot.js'));

const TAROT = global.window.TAROT;
if (!TAROT) {
  console.error('FAIL: window.TAROT not found');
  process.exit(1);
}

const cards = TAROT.cards || [];
const suits = TAROT.suits || [];

// 1. Suit count
if (suits.length !== 4) {
  console.error('FAIL: suits length should be 4, got ' + suits.length);
  process.exit(1);
}

// 2. Total card count
if (cards.length !== 78) {
  console.error('FAIL: cards length should be 78, got ' + cards.length);
  process.exit(1);
}

// 3. Major / Minor count
const majorCards = cards.filter(c => c.arcana === 'major');
const minorCards = cards.filter(c => c.arcana === 'minor');

if (majorCards.length !== 22) {
  console.error('FAIL: Major Arcana should be 22, got ' + majorCards.length);
  process.exit(1);
}

if (minorCards.length !== 56) {
  console.error('FAIL: Minor Arcana should be 56, got ' + minorCards.length);
  process.exit(1);
}

// 4. Minor suits count
const suitCounts = { wands: 0, cups: 0, swords: 0, pentacles: 0 };
minorCards.forEach(c => {
  if (suitCounts[c.suit] !== undefined) {
    suitCounts[c.suit]++;
  } else {
    console.error('FAIL: Invalid suit ' + c.suit + ' on card ' + c.id);
    process.exit(1);
  }
});

for (const s of Object.keys(suitCounts)) {
  if (suitCounts[s] !== 14) {
    console.error('FAIL: Suit ' + s + ' should have 14 cards, got ' + suitCounts[s]);
    process.exit(1);
  }
}

// 5. Unique IDs and required fields
const idSet = new Set();
cards.forEach(c => {
  if (!c.id || idSet.has(c.id)) {
    console.error('FAIL: Duplicate or invalid id ' + c.id);
    process.exit(1);
  }
  idSet.add(c.id);

  if (!c.vn || typeof c.vn !== 'string') {
    console.error('FAIL: Invalid name vn on card ' + c.id);
    process.exit(1);
  }
  if (!c.meaning || typeof c.meaning !== 'string') {
    console.error('FAIL: Missing upright meaning on card ' + c.id + ' (' + c.vn + ')');
    process.exit(1);
  }
  if (!c.rev || typeof c.rev !== 'string') {
    console.error('FAIL: Missing reversed meaning (rev) on card ' + c.id + ' (' + c.vn + ')');
    process.exit(1);
  }
  if (!Array.isArray(c.keywords) || c.keywords.length === 0) {
    console.error('FAIL: Missing keywords array on card ' + c.id + ' (' + c.vn + ')');
    process.exit(1);
  }
});

console.log('Tarot cards verified: 78 cards (22 Major, 56 Minor across 4 suits)');
console.log('ALL CHECKS PASSED');
