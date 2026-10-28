(function () {
  'use strict';

  var NUM = window.NUM;

  if (NUM.numbersDeep) {
    Object.keys(NUM.numbersDeep).forEach(function (key) {
      NUM.numbers[key] = Object.assign({}, NUM.numbers[key] || {}, NUM.numbersDeep[key]);
    });
  }

  var LETTER_VALUES = {
    A: 1, J: 1, S: 1,
    B: 2, K: 2, T: 2,
    C: 3, L: 3, U: 3,
    D: 4, M: 4, V: 4,
    E: 5, N: 5, W: 5,
    F: 6, O: 6, X: 6,
    G: 7, P: 7, Y: 7,
    H: 8, Q: 8, Z: 8,
    I: 9, R: 9
  };
  var VOWELS = { A: 1, E: 1, I: 1, O: 1, U: 1, Y: 1 };
  var CORE_KEYS = ['lifePath', 'destiny', 'soul', 'personality', 'birthday', 'maturity', 'attitude', 'balance'];
  var GALLERY_ORDER = [1, 2, 3, 4, 5, 6, 7, 8, 9, 11, 22, 33];
  var LOSHU_ORDER = [3, 6, 9, 2, 5, 8, 1, 4, 7];
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  var finePointer = window.matchMedia('(pointer: fine)');
  var currentYear = new Date().getFullYear();
  var currentProfile = null;
  var calcTimer = null;

  function $(sel, root) { return (root || document).querySelector(sel); }
  function $$(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }
  function pad(n) { return String(n).padStart(2, '0'); }

  function esc(str) {
    return String(str).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  var ARROW = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  var ARROW_SM = '<svg class="num-arrow" viewBox="0 0 24 24" aria-hidden="true"><path d="M7 17L17 7M9 7h8v8" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>';

  /* ---------- Starfield ---------- */
  var canvas = $('#stars');
  var ctx = canvas && canvas.getContext ? canvas.getContext('2d') : null;
  var stars = [];
  var shooting = [];
  var rafId = null;
  var viewW = 0;
  var viewH = 0;
  var startTime = 0;
  var nextShoot = 0;
  var STAR_COLORS = { white: '#FFFFFF', gold: '#F4E3BC', lilac: '#C9BDFF', rose: '#F5C4D8' };

  function buildStars() {
    var count = Math.min(200, Math.max(70, Math.round((viewW * viewH) / 11000)));
    stars = [];
    for (var i = 0; i < count; i++) {
      var pick = Math.random();
      stars.push({
        x: Math.random() * viewW,
        y: Math.random() * viewH,
        r: Math.random() * 1.25 + 0.25,
        a: Math.random() * 0.5 + 0.16,
        speed: Math.random() * 0.5 + 0.15,
        phase: Math.random() * Math.PI * 2,
        drift: Math.random() * 0.035 + 0.006,
        tint: pick > 0.9 ? 'rose' : pick > 0.72 ? 'lilac' : pick > 0.55 ? 'gold' : 'white'
      });
    }
  }

  function drawStars(t, still) {
    if (!ctx) return;
    ctx.clearRect(0, 0, viewW, viewH);
    for (var i = 0; i < stars.length; i++) {
      var s = stars[i];
      var offset = still ? 0 : (t * s.drift) % (viewH + 24);
      var y = s.y - offset;
      if (y < -12) y += viewH + 24;
      var twinkle = still ? 1 : 0.62 + Math.sin(t * 0.001 * s.speed + s.phase) * 0.38;
      ctx.globalAlpha = Math.max(0.04, s.a * twinkle);
      ctx.fillStyle = STAR_COLORS[s.tint];
      ctx.beginPath();
      ctx.arc(s.x, y, s.r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  function drawShooting(t) {
    if (t > nextShoot) {
      nextShoot = t + 7000 + Math.random() * 9000;
      shooting.push({
        x: viewW * 0.15 + Math.random() * viewW * 0.75,
        y: Math.random() * viewH * 0.45,
        vx: 4.5 + Math.random() * 3,
        vy: 1.4 + Math.random() * 1.4,
        life: 1
      });
    }
    for (var i = shooting.length - 1; i >= 0; i--) {
      var s = shooting[i];
      s.x += s.vx;
      s.y += s.vy;
      s.life -= 0.011;
      if (s.life <= 0 || s.x > viewW + 80 || s.y > viewH + 80) {
        shooting.splice(i, 1);
        continue;
      }
      var tailX = s.x - s.vx * 15;
      var tailY = s.y - s.vy * 15;
      var grad = ctx.createLinearGradient(s.x, s.y, tailX, tailY);
      grad.addColorStop(0, 'rgba(255,246,224,' + (0.65 * s.life).toFixed(3) + ')');
      grad.addColorStop(1, 'rgba(255,246,224,0)');
      ctx.strokeStyle = grad;
      ctx.lineWidth = 1.3;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(s.x, s.y);
      ctx.lineTo(tailX, tailY);
      ctx.stroke();
    }
  }

  function starLoop(t) {
    if (!startTime) startTime = t;
    var el = t - startTime;
    drawStars(el, false);
    drawShooting(el);
    rafId = requestAnimationFrame(starLoop);
  }

  function startStars() {
    if (!ctx) return;
    if (rafId) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }
    if (reduceMotion.matches) {
      drawStars(0, true);
      return;
    }
    startTime = 0;
    nextShoot = 5000;
    rafId = requestAnimationFrame(starLoop);
  }

  function setupCanvas() {
    if (!ctx) return;
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    viewW = window.innerWidth;
    viewH = window.innerHeight;
    canvas.width = Math.floor(viewW * dpr);
    canvas.height = Math.floor(viewH * dpr);
    canvas.style.width = viewW + 'px';
    canvas.style.height = viewH + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    buildStars();
    if (reduceMotion.matches) drawStars(0, true);
  }

  if (ctx) {
    setupCanvas();
    startStars();
    var resizeTimer;
    window.addEventListener('resize', function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(function () {
        setupCanvas();
        if (!reduceMotion.matches && !rafId) startStars();
      }, 160);
    });
    document.addEventListener('visibilitychange', function () {
      if (document.hidden) {
        if (rafId) cancelAnimationFrame(rafId);
        rafId = null;
      } else if (!reduceMotion.matches) {
        startStars();
      }
    });
    if (reduceMotion.addEventListener) {
      reduceMotion.addEventListener('change', function () {
        setupCanvas();
        startStars();
      });
    }
  }

  /* ---------- Orb ---------- */
  function buildOrb() {
    var NS = 'http://www.w3.org/2000/svg';
    var flower = $('#flower');
    var digits = $('#orb-digits');
    if (!flower || !digits) return;

    var R = 26;
    var circles = [[0, 0]];
    var k, a;
    for (k = 0; k < 6; k++) {
      a = (k * Math.PI) / 3;
      circles.push([Math.cos(a) * R, Math.sin(a) * R]);
    }
    for (k = 0; k < 6; k++) {
      a = Math.PI / 6 + (k * Math.PI) / 3;
      circles.push([Math.cos(a) * R * Math.sqrt(3), Math.sin(a) * R * Math.sqrt(3)]);
    }
    for (k = 0; k < 6; k++) {
      a = (k * Math.PI) / 3;
      circles.push([Math.cos(a) * R * 2, Math.sin(a) * R * 2]);
    }
    circles.forEach(function (pos) {
      var c = document.createElementNS(NS, 'circle');
      c.setAttribute('cx', pos[0].toFixed(2));
      c.setAttribute('cy', pos[1].toFixed(2));
      c.setAttribute('r', String(R));
      flower.appendChild(c);
    });

    for (var i = 1; i <= 9; i++) {
      var angle = ((-90 + (i - 1) * 40) * Math.PI) / 180;
      var rad = 89;
      var txt = document.createElementNS(NS, 'text');
      txt.setAttribute('x', (Math.cos(angle) * rad).toFixed(2));
      txt.setAttribute('y', (Math.sin(angle) * rad).toFixed(2));
      txt.setAttribute('class', 'orb-digit' + (i % 3 === 0 ? ' is-hot' : i % 2 === 0 ? ' is-alt' : ''));
      txt.style.setProperty('--d', (i * 0.6).toFixed(1) + 's');
      txt.textContent = String(i);
      digits.appendChild(txt);
    }
  }

  function initOrbParallax() {
    var orb = $('#hero-orb');
    if (!orb || !finePointer.matches || reduceMotion.matches) return;
    var tx = 0, ty = 0, ox = 0, oy = 0, raf = null;
    function tick() {
      ox += (tx - ox) * 0.075;
      oy += (ty - oy) * 0.075;
      orb.style.transform = 'translate3d(' + ox.toFixed(2) + 'px,' + oy.toFixed(2) + 'px,0)';
      if (Math.abs(tx - ox) > 0.15 || Math.abs(ty - oy) > 0.15) {
        raf = requestAnimationFrame(tick);
      } else {
        raf = null;
      }
    }
    window.addEventListener('pointermove', function (e) {
      tx = (e.clientX / window.innerWidth - 0.5) * 16;
      ty = (e.clientY / window.innerHeight - 0.5) * 16;
      if (!raf) raf = requestAnimationFrame(tick);
    }, { passive: true });
  }

  /* ---------- Header / cursor / tilt ---------- */
  var header = $('.site-header');
  function onScroll() {
    if (header) header.classList.toggle('is-scrolled', window.scrollY > 24);
  }
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  function initCursor() {
    var glow = $('.cursor-glow');
    if (!glow || !finePointer.matches) return;
    var cx = 0, cy = 0, gx = 0, gy = 0, raf = null, started = false;
    function tick() {
      gx += (cx - gx) * 0.16;
      gy += (cy - gy) * 0.16;
      glow.style.transform = 'translate3d(' + gx.toFixed(2) + 'px,' + gy.toFixed(2) + 'px,0)';
      if (Math.abs(cx - gx) > 0.4 || Math.abs(cy - gy) > 0.4) {
        raf = requestAnimationFrame(tick);
      } else {
        raf = null;
      }
    }
    window.addEventListener('pointermove', function (e) {
      cx = e.clientX;
      cy = e.clientY;
      if (!started) {
        started = true;
        gx = cx;
        gy = cy;
        glow.classList.add('is-on');
      }
      if (!raf) raf = requestAnimationFrame(tick);
    }, { passive: true });
    document.addEventListener('pointerleave', function () {
      glow.classList.remove('is-on');
    });
  }

  function initTilt() {
    if (!finePointer.matches || reduceMotion.matches) return;
    document.addEventListener('pointermove', function (e) {
      var el = e.target instanceof Element ? e.target.closest('.num-card') : null;
      if (!el) return;
      var r = el.getBoundingClientRect();
      var px = (e.clientX - r.left) / r.width - 0.5;
      var py = (e.clientY - r.top) / r.height - 0.5;
      el.style.setProperty('--tilt-y', (px * 7).toFixed(2) + 'deg');
      el.style.setProperty('--tilt-x', (-py * 7).toFixed(2) + 'deg');
    }, { passive: true });
    document.addEventListener('pointerout', function (e) {
      var el = e.target instanceof Element ? e.target.closest('.num-card') : null;
      if (!el) return;
      var to = e.relatedTarget;
      if (to && el.contains(to)) return;
      el.style.setProperty('--tilt-x', '0deg');
      el.style.setProperty('--tilt-y', '0deg');
    }, { passive: true });
  }

  /* ---------- Reveal ---------- */
  var revealObserver = 'IntersectionObserver' in window
    ? new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            revealObserver.unobserve(entry.target);
          }
        });
      }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' })
    : null;

  function observeReveals(root) {
    $$('.reveal', root || document).forEach(function (el) {
      if (el.classList.contains('is-visible')) return;
      if (revealObserver) revealObserver.observe(el);
      else el.classList.add('is-visible');
    });
  }

  /* ---------- Numerology ---------- */
  function normalizeName(input) {
    return String(input)
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd')
      .replace(/Đ/g, 'D')
      .toUpperCase();
  }

  function digitSum(n) {
    return String(Math.abs(n)).split('').reduce(function (s, c) { return s + Number(c); }, 0);
  }

  function reduceNum(n, keepMaster) {
    if (keepMaster === undefined) keepMaster = true;
    n = Math.abs(Math.trunc(n));
    while (n > 9) {
      if (keepMaster && (n === 11 || n === 22 || n === 33)) return n;
      n = digitSum(n);
    }
    return n;
  }

  function computeProfile(rawName, dob) {
    var name = String(rawName).trim().replace(/\s+/g, ' ');
    var norm = normalizeName(name);
    var letters = norm.replace(/[^A-Z]/g, '');
    var words = norm.split(/\s+/).filter(function (w) { return /[A-Z]/.test(w); });
    var chars = letters.split('');

    var total = 0;
    var vowelSum = 0;
    var hasVowel = false;
    chars.forEach(function (ch) {
      var v = LETTER_VALUES[ch] || 0;
      total += v;
      if (VOWELS[ch]) {
        vowelSum += v;
        hasVowel = true;
      }
    });
    var consSum = total - vowelSum;

    var dReduce = reduceNum(dob.d);
    var mReduce = reduceNum(dob.m);
    var yReduce = reduceNum(dob.y);

    var lifePath = reduceNum(dReduce + mReduce + yReduce);
    var destiny = total > 0 ? reduceNum(total) : null;
    var soul = hasVowel ? reduceNum(vowelSum) : null;
    var personality = consSum > 0 ? reduceNum(consSum) : null;
    var birthday = reduceNum(dob.d);
    var maturity = destiny === null ? null : reduceNum(lifePath + destiny);
    var attitude = reduceNum(dReduce + mReduce);
    var balance = words.length
      ? reduceNum(words.reduce(function (s, w) { return s + (LETTER_VALUES[w.charAt(0)] || 0); }, 0))
      : null;
    var personalYear = reduceNum(digitSum(dob.d) + digitSum(dob.m) + digitSum(currentYear), false);

    var counts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0 };
    var nameCounts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0 };
    var dobCounts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0 };
    var dobDigits = String(dob.d) + String(dob.m) + String(dob.y);
    dobDigits.split('').forEach(function (ch) {
      if (ch !== '0') {
        counts[Number(ch)] += 1;
        dobCounts[Number(ch)] += 1;
      }
    });
    chars.forEach(function (ch) {
      var v = LETTER_VALUES[ch];
      if (v) {
        counts[v] += 1;
        nameCounts[v] += 1;
      }
    });

    var missing = [];
    var repeated = [];
    Object.keys(dobCounts).forEach(function (key) {
      var num = Number(key);
      if (dobCounts[num] === 0) missing.push(num);
      else if (dobCounts[num] >= 2) repeated.push({ n: num, count: dobCounts[num] });
    });
    repeated.sort(function (a, b) { return b.count - a.count || a.n - b.n; });

    return {
      name: name,
      dob: dob,
      lifePath: lifePath,
      destiny: destiny,
      soul: soul,
      personality: personality,
      birthday: birthday,
      maturity: maturity,
      attitude: attitude,
      balance: balance,
      personalYear: personalYear,
      counts: counts,
      nameCounts: nameCounts,
      dobCounts: dobCounts,
      raw: {
        destiny: total,
        soul: vowelSum,
        personality: consSum,
        maturity: lifePath + (destiny || 0),
        dob: dobDigits.split('').reduce(function (s, c) { return s + Number(c); }, 0)
      },
      missing: missing,
      repeated: repeated
    };
  }

  function personalYearCycle(py) {
    var cycle = [];
    for (var off = 0; off < 9; off++) {
      var value = ((py - 1 + off) % 9) + 1;
      cycle.push({ value: value, year: currentYear + off, current: off === 0 });
    }
    return cycle;
  }

  function reduceNoMaster(n) {
    return reduceNum(n, false);
  }

  function gap(a, b) {
    return Math.abs(reduceNoMaster(a) - reduceNoMaster(b));
  }

  function karmicNumber(n) {
    n = Math.abs(Math.trunc(n));
    while (n > 9) {
      if (n === 13 || n === 14 || n === 16 || n === 19) return n;
      n = digitSum(n);
    }
    return 0;
  }

  function lifePathForAge(lifePath) {
    return lifePath === 33 ? 6 : lifePath;
  }

  function computeCycles(profile) {
    var d = reduceNoMaster(profile.dob.d);
    var m = reduceNoMaster(profile.dob.m);
    var y = reduceNoMaster(profile.dob.y);
    var firstEnd = 36 - lifePathForAge(profile.lifePath);

    var p1 = reduceNum(d + m);
    var p2 = reduceNum(d + y);
    var p3 = reduceNum(p1 + p2);
    var p4 = reduceNum(m + y);
    var c1 = gap(d, m);
    var c2 = gap(d, y);
    var c3 = gap(c1, c2);
    var c4 = gap(m, y);

    var pinnacles = [
      { value: p1, from: 0, to: firstEnd },
      { value: p2, from: firstEnd + 1, to: firstEnd + 9 },
      { value: p3, from: firstEnd + 10, to: firstEnd + 18 },
      { value: p4, from: firstEnd + 19, to: null }
    ];
    var challenges = [
      { value: c1, from: 0, to: firstEnd },
      { value: c2, from: firstEnd + 1, to: firstEnd + 9 },
      { value: c3, from: firstEnd + 10, to: firstEnd + 18 },
      { value: c4, from: firstEnd + 19, to: null }
    ];

    var debts = [];
    [
      ['Đường đời', profile.raw.dob],
      ['Sứ mệnh', profile.raw.destiny],
      ['Linh hồn', profile.raw.soul],
      ['Nhân cách', profile.raw.personality],
      ['Trưởng thành', profile.raw.maturity]
    ].forEach(function (row) {
      var debt = karmicNumber(row[1]);
      if (debt && debts.every(function (item) { return item.value !== debt; })) {
        debts.push({ value: debt, source: row[0] });
      }
    });

    var nameLetters = {};
    normalizeName(profile.name).replace(/[^A-Z]/g, '').split('').forEach(function (ch) {
      if (LETTER_VALUES[ch]) nameLetters[ch] = true;
    });

    var planes = (NUM.cycles && NUM.cycles.planes ? NUM.cycles.planes.list : []).map(function (plane) {
      var present = plane.letters.filter(function (letter) { return nameLetters[letter]; });
      var ratio = plane.letters.length ? present.length / plane.letters.length : 0;
      return {
        plane: plane,
        count: present.length,
        ratio: ratio,
        level: ratio >= 0.7 ? 'Mạnh' : ratio >= 0.34 ? 'Vừa' : present.length ? 'Mỏng' : 'Vắng'
      };
    });

    var arrowSets = NUM.cycles && NUM.cycles.arrows ? NUM.cycles.arrows.lines : [];
    var activeArrows = [];
    var emptyArrows = [];
    arrowSets.forEach(function (arrow) {
      var filled = arrow.cells.filter(function (n) { return (profile.dobCounts[n] || 0) > 0; }).length;
      if (filled === arrow.cells.length) activeArrows.push(arrow);
      else if (filled === 0) emptyArrows.push(arrow);
    });

    var passion = 0;
    var passionCount = 0;
    Object.keys(profile.nameCounts).forEach(function (key) {
      var count = profile.nameCounts[key];
      if (count > passionCount) {
        passion = Number(key);
        passionCount = count;
      }
    });

    var personalMonth = reduceNoMaster(profile.personalYear + (new Date().getMonth() + 1));

    return {
      pinnacles: pinnacles,
      challenges: challenges,
      debts: debts,
      planes: planes,
      activeArrows: activeArrows,
      emptyArrows: emptyArrows,
      hiddenPassion: passion && passionCount ? passion : null,
      personalMonth: personalMonth
    };
  }

  function ageRange(from, to) {
    return to === null ? from + '+' : from + '–' + to;
  }

  /* ---------- Rendering ---------- */
  function coreCard(key, value, index) {
    var pos = NUM.positions[key];
    if (value === null || value === undefined) {
      return '<button class="num-card is-static" type="button" aria-disabled="true" style="--i:' + index + '">' +
        '<span class="num-card-top"><span class="num-label">' + pos.label + '</span>' + ARROW_SM + '</span>' +
        '<span class="num-value">&mdash;</span>' +
        '<span class="num-title">Chưa đủ dữ liệu</span>' +
        '<span class="num-tags">Cần thêm nguyên âm trong tên</span>' +
        '</button>';
    }
    var meta = NUM.numbers[value];
    return '<button class="num-card" type="button" data-key="' + key + '" data-value="' + value + '" ' +
      'aria-haspopup="dialog" style="--i:' + index + '">' +
      '<span class="num-card-top">' +
        '<span class="num-label">' + pos.label + '</span>' +
        '<span class="num-card-flags">' + (meta.master ? '<span class="num-master">Bậc thầy</span>' : '') + ARROW_SM + '</span>' +
      '</span>' +
      '<span class="num-value">' + value + '</span>' +
      '<span class="num-title">' + meta.title + '</span>' +
      '<span class="num-tags">' + meta.keywords.join(' · ') + '</span>' +
      '</button>';
  }

  function renderInsights(profile, cycles) {
    var C = NUM.cycles || {};
    var lifeMeta = NUM.numbers[profile.lifePath] || {};

    var deepItems = [
      ['Món quà', lifeMeta.gift],
      ['Cái bóng', lifeMeta.shadow],
      ['Tuổi thơ', lifeMeta.childhood],
      ['Tiền bạc', lifeMeta.money],
      ['Sức khỏe', lifeMeta.health],
      ['Trưởng thành', lifeMeta.growth]
    ].filter(function (row) { return row[1]; });

    var deepHTML = deepItems.length
      ? '<div class="panel deep-panel">' +
          '<div class="panel-head">' +
            '<h3 class="panel-title">Hồ sơ chuyên sâu</h3>' +
            '<p class="panel-sub">' + (lifeMeta.archetype || 'Đường đời ' + profile.lifePath) + '</p>' +
          '</div>' +
          (lifeMeta.mantra ? '<p class="mantra">“' + lifeMeta.mantra + '”</p>' : '') +
          '<div class="deep-grid">' + deepItems.map(function (row) {
            return '<div class="deep-item"><h4>' + row[0] + '</h4><p>' + row[1] + '</p></div>';
          }).join('') + '</div>' +
          (lifeMeta.famous && lifeMeta.famous.length
            ? '<div class="famous"><span class="famous-label">Cùng tần số</span>' +
              lifeMeta.famous.map(function (name) { return '<span class="chip">' + name + '</span>'; }).join('') +
              '</div>'
            : '') +
        '</div>'
      : '';

    var pinnacleHTML = cycles.pinnacles.map(function (p) {
      var meta = (C.pinnacles && C.pinnacles[p.value]) || { title: 'Đỉnh cao ' + p.value, text: '' };
      return '<article class="cycle-card">' +
        '<span class="cycle-age">' + ageRange(p.from, p.to) + '</span>' +
        '<span class="cycle-num">' + p.value + '</span>' +
        '<h4>' + meta.title + '</h4>' +
        '<p>' + meta.text + '</p>' +
        '</article>';
    }).join('');

    var challengeHTML = cycles.challenges.map(function (c) {
      var meta = (C.challenges && C.challenges[c.value]) || { title: 'Thách thức ' + c.value, text: '' };
      return '<details class="acc">' +
        '<summary><span class="acc-age">' + ageRange(c.from, c.to) + '</span>' +
        '<span class="acc-title"><b>' + c.value + '</b> ' + meta.title + '</span></summary>' +
        '<p>' + meta.text + '</p>' +
        '</details>';
    }).join('');

    var debtHTML = cycles.debts.length
      ? cycles.debts.map(function (d) {
          var meta = (C.karmicDebt && C.karmicDebt[d.value]) || { title: 'Nợ nghiệp ' + d.value, text: '' };
          return '<details class="acc">' +
            '<summary><span class="acc-age">' + d.source + '</span>' +
            '<span class="acc-title"><b>' + d.value + '</b> ' + meta.title + '</span></summary>' +
            '<p>' + meta.text + '</p>' +
            '</details>';
        }).join('')
      : '<p class="panel-sub">Không có nợ nghiệp 13 · 14 · 16 · 19 trong các chỉ số cốt lõi.</p>';

    var arrowHTML = (cycles.activeArrows.length || cycles.emptyArrows.length)
      ? '<div class="arrow-list">' +
          cycles.activeArrows.map(function (a) {
            return '<details class="acc arrow-acc">' +
              '<summary><span class="acc-title">' + a.name + '</span>' +
              '<span class="acc-tag is-full">Đủ ' + a.cells.join('·') + '</span></summary>' +
              '<p>' + a.text + '</p></details>';
          }).join('') +
          cycles.emptyArrows.map(function (a) {
            var emptyText = a.empty ? a.empty.name + ': ' + a.empty.text : (C.arrows && C.arrows.empty ? C.arrows.empty.text : '');
            return '<details class="acc arrow-acc">' +
              '<summary><span class="acc-title">' + a.name + '</span>' +
              '<span class="acc-tag is-empty">Trống ' + a.cells.join('·') + '</span></summary>' +
              '<p>' + emptyText + '</p></details>';
          }).join('') +
        '</div>'
      : '<p class="panel-sub">Chưa đủ dữ liệu để đọc mũi tên.</p>';

    var planeHTML = cycles.planes.map(function (p) {
      return '<div class="plane-row">' +
        '<span class="plane-name">' + p.plane.name + '<em>' + p.count + '/' + p.plane.letters.length + '</em></span>' +
        '<span class="plane-track"><span class="plane-fill" style="--pct:' + Math.round(p.ratio * 100) + '%"></span></span>' +
        '<span class="plane-level">' + p.level + '</span>' +
        '</div>';
    }).join('');

    var passionMeta = cycles.hiddenPassion && C.hiddenPassion ? C.hiddenPassion[cycles.hiddenPassion] : '';
    var monthMeta = C.personalMonth ? C.personalMonth[cycles.personalMonth] : '';

    return deepHTML +
      '<div class="panel cycles-panel">' +
        '<div class="panel-head">' +
          '<h3 class="panel-title">Bốn đỉnh cao</h3>' +
          '<p class="panel-sub">Chu kỳ chín năm · bắt đầu từ tuổi ' + (36 - lifePathForAge(profile.lifePath)) + '</p>' +
        '</div>' +
        '<p class="panel-sub cycles-intro">' + (C.pinnacleIntro || '') + '</p>' +
        '<div class="cycle-grid">' + pinnacleHTML + '</div>' +
      '</div>' +

      '<div class="result-panels">' +
        '<div class="panel">' +
          '<div class="panel-head">' +
            '<h3 class="panel-title">Thách thức lặp lại</h3>' +
            '<p class="panel-sub">Bài tập của từng chặng</p>' +
          '</div>' +
          '<p class="panel-sub cycles-intro">' + (C.challengeIntro || '') + '</p>' +
          '<div class="acc-list">' + challengeHTML + '</div>' +
        '</div>' +
        '<div class="panel">' +
          '<div class="panel-head">' +
            '<h3 class="panel-title">Nợ nghiệp</h3>' +
            '<p class="panel-sub">Kỹ năng chưa được dạy</p>' +
          '</div>' +
          '<p class="panel-sub cycles-intro">' + (C.karmicDebtIntro || '') + '</p>' +
          '<div class="acc-list">' + debtHTML + '</div>' +
        '</div>' +
      '</div>' +

      '<div class="result-panels">' +
        '<div class="panel">' +
          '<div class="panel-head">' +
            '<h3 class="panel-title">Mũi tên bản đồ số</h3>' +
            '<p class="panel-sub">Đường đủ và đường trống · chỉ tính ngày sinh</p>' +
          '</div>' +
          arrowHTML +
        '</div>' +
        '<div class="panel">' +
          '<div class="panel-head">' +
            '<h3 class="panel-title">Bình diện &amp; ẩn đam mê</h3>' +
            '<p class="panel-sub cycles-intro">' + (C.planes && C.planes.intro || '') + '</p>' +
          '</div>' +
          '<div class="planes">' + planeHTML + '</div>' +
          '<div class="mini-grid">' +
            '<div class="mini-card"><span>Ẩn đam mê</span><strong>' + (cycles.hiddenPassion || '—') + '</strong>' +
              '<p class="mini-intro">' + (C.hiddenPassion && C.hiddenPassion.intro || '') + '</p>' +
              '<p>' + (passionMeta || 'Cần thêm chữ cái trong tên.') + '</p></div>' +
            '<div class="mini-card"><span>Tháng cá nhân</span><strong>' + cycles.personalMonth + '</strong>' +
              '<p class="mini-intro">' + (C.personalMonth && C.personalMonth.intro || '') + '</p>' +
              '<p>' + (monthMeta || '') + '</p></div>' +
          '</div>' +
        '</div>' +
      '</div>' +
      (profile.lifePath === 11 || profile.lifePath === 22 || profile.lifePath === 33
        ? '<div class="panel mastery-panel">' +
          '<div class="panel-head">' +
            '<h3 class="panel-title">Số chủ đạo ' + profile.lifePath + '</h3>' +
            '<p class="panel-sub cycles-intro">' + (C.mastery && C.mastery[String(profile.lifePath)] || '') + '</p>' +
          '</div>' +
          '</div>'
        : '') +
      '</div>';
  }

  function renderResults(profile) {
    currentProfile = profile;
    var root = $('#results-root');
    if (!root) return;

    var lifeMeta = NUM.numbers[profile.lifePath];
    var py = profile.personalYear;
    var pyMeta = NUM.personalYear[py];
    var cycle = personalYearCycle(py);
    var cycles = computeCycles(profile);

    var cards = CORE_KEYS.map(function (key, i) {
      return coreCard(key, profile[key], i);
    }).join('');

    var energyRows = CORE_KEYS.map(function (key) {
      var value = profile[key];
      var pct = value === null ? 0 : Math.min(value, 9) / 9 * 100;
      return '<div class="energy-row">' +
        '<span class="energy-label">' + NUM.positions[key].label + '</span>' +
        '<span class="energy-track"><span class="energy-fill" data-pct="' + pct.toFixed(1) + '"></span></span>' +
        '<span class="energy-value">' + (value === null ? '&mdash;' : value) + '</span>' +
        '</div>';
    }).join('');

    var loshuCells = LOSHU_ORDER.map(function (n) {
      var count = profile.counts[n] || 0;
      var fromDob = profile.dobCounts[n] || 0;
      var glow = Math.min(0.14 + count * 0.13, 0.62).toFixed(2);
      return '<div class="loshu-cell ' + (count ? 'is-filled' : 'is-empty') +
        (fromDob ? ' is-birth' : '') + '" style="--glow:' + glow + '">' +
        '<span class="loshu-num">' + n + '</span>' +
        (count ? '<span class="loshu-count">&times;' + count + '</span>' : '') +
        (fromDob ? '<span class="loshu-dob" aria-hidden="true"></span>' : '') +
        '</div>';
    }).join('');

    var loshuLabel = 'Bản đồ số. ' + LOSHU_ORDER.map(function (n) {
      var count = profile.counts[n] || 0;
      var fromDob = profile.dobCounts[n] || 0;
      return 'Số ' + n + ': ' + count + ' lần' +
        (fromDob ? ', trong đó ' + fromDob + ' lần từ ngày sinh' : '');
    }).join('. ');

    var missingHTML = profile.missing.length
      ? '<div class="missing">' +
          '<p class="missing-title">Con số cần bồi đắp</p>' +
          '<div class="missing-list">' + profile.missing.map(function (n) {
            return '<button class="missing-chip" type="button" data-key="missing" data-value="' + n + '" aria-haspopup="dialog">' +
              '<span class="missing-num">' + n + '</span>' + NUM.missing[n] +
              '</button>';
          }).join('') + '</div>' +
        '</div>'
      : '<div class="missing"><p class="missing-title">Đủ chín con số</p>' +
        '<p class="panel-sub">Bản đồ của bạn cân bằng hiếm thấy — không có con số nào vắng mặt.</p></div>';

    var repeatedText = profile.repeated.length
      ? 'Số lặp: ' + profile.repeated.map(function (r) { return r.n + ' (&times;' + r.count + ')'; }).join(' · ')
      : 'Không có số lặp nổi bật';

    var timeline = cycle.map(function (item) {
      return '<button class="timeline-item' + (item.current ? ' is-current' : '') + '" type="button" ' +
        'data-key="personalYear" data-value="' + item.value + '" data-year="' + item.year + '" aria-haspopup="dialog">' +
        (item.current ? '<span class="timeline-badge">Năm nay</span>' : '') +
        '<span class="timeline-num">' + item.value + '</span>' +
        '<span class="timeline-year">' + item.year + '</span>' +
        '<span class="timeline-title">' + NUM.personalYear[item.value].title + '</span>' +
        '</button>';
    }).join('');

    root.innerHTML =
      '<div class="result-head">' +
        '<div>' +
          '<p class="eyebrow"><span class="eyebrow-dot"></span>Lá số của bạn</p>' +
          '<h2 class="result-name" id="results-title">' + esc(profile.name) + '</h2>' +
        '</div>' +
        '<p class="result-meta">Sinh ' + pad(profile.dob.d) + ' · ' + pad(profile.dob.m) + ' · ' + profile.dob.y +
          ' &nbsp;|&nbsp; Tám chỉ số cốt lõi</p>' +
      '</div>' +

      '<div class="result-hero">' +
        '<div class="life-ring">' +
          '<svg viewBox="0 0 200 200" aria-hidden="true">' +
            '<defs><linearGradient id="lpGrad" x1="0" y1="0" x2="1" y2="1">' +
              '<stop offset="0%" stop-color="#F6E8C6"/>' +
              '<stop offset="50%" stop-color="#E7C98A"/>' +
              '<stop offset="100%" stop-color="#B7A7FF"/>' +
            '</linearGradient></defs>' +
            '<circle class="ring-track" cx="100" cy="100" r="86"/>' +
            '<circle class="ring-progress" id="lp-ring" cx="100" cy="100" r="86" stroke="url(#lpGrad)"/>' +
          '</svg>' +
          '<div class="ring-center">' +
            '<span class="ring-num" id="lp-num">0</span>' +
            '<span class="ring-label">Đường đời</span>' +
          '</div>' +
        '</div>' +
        '<div class="life-info">' +
          '<p class="eyebrow" style="margin-bottom:.55rem">Chỉ số đường đời</p>' +
          '<h3>' + lifeMeta.title + '</h3>' +
          '<div class="chips">' + lifeMeta.keywords.map(function (k) {
            return '<span class="chip">' + k + '</span>';
          }).join('') + (lifeMeta.master ? '<span class="chip">Bậc thầy</span>' : '') + '</div>' +
          '<p class="essence">' + lifeMeta.essence + '</p>' +
          '<dl class="meta-stats">' +
            '<div class="meta-stat"><dt>Hành tinh</dt><dd>' + lifeMeta.planet + '</dd></div>' +
            '<div class="meta-stat"><dt>Nguyên tố</dt><dd>' + lifeMeta.element + '</dd></div>' +
            '<div class="meta-stat"><dt>Màu</dt><dd>' + lifeMeta.color + '</dd></div>' +
            '<div class="meta-stat"><dt>Năm cá nhân</dt><dd>' + py + ' · ' + pyMeta.title + '</dd></div>' +
          '</dl>' +
          '<button class="btn btn-line btn-sm" type="button" data-key="lifePath" data-value="' + profile.lifePath + '" aria-haspopup="dialog">' +
            'Đọc luận giải đầy đủ ' + ARROW +
          '</button>' +
        '</div>' +
      '</div>' +

      '<div class="number-grid">' + cards + '</div>' +

      '<div class="result-panels">' +
        '<div class="panel">' +
          '<div class="panel-head">' +
            '<h3 class="panel-title">Cân bằng năng lượng</h3>' +
            '<p class="panel-sub">Tám chỉ số trên thang 9</p>' +
          '</div>' +
          '<div class="energy">' + energyRows + '</div>' +
        '</div>' +
        '<div class="panel">' +
          '<div class="panel-head">' +
            '<h3 class="panel-title">Bản đồ số</h3>' +
            '<p class="panel-sub">Biểu đồ ngày sinh · tần suất, chấm vàng = số từ ngày sinh</p>' +
          '</div>' +
          '<div class="loshu-wrap">' +
            '<div class="loshu" role="img" aria-label="' + loshuLabel + '">' + loshuCells + '</div>' +
            '<div class="loshu-legend">' +
              '<span class="legend-item"><span class="legend-swatch gold"></span>Ô sáng = năng lượng mạnh</span>' +
              '<span class="legend-item"><span class="legend-swatch dob"></span>Chấm vàng = có trong ngày sinh</span>' +
              '<span class="legend-item"><span class="legend-swatch empty"></span>Nét đứt = con số thiếu</span>' +
            '</div>' +
            '<p class="panel-sub">' + repeatedText + '</p>' +
          '</div>' +
          missingHTML +
        '</div>' +
      '</div>' +

      '<div class="panel timeline-panel">' +
        '<div class="panel-head">' +
          '<h3 class="panel-title">Vòng quay chín năm</h3>' +
          '<p class="panel-sub">Năm cá nhân ' + py + ' · ' + currentYear + '</p>' +
        '</div>' +
        '<div class="timeline" aria-label="Chu kỳ chín năm cá nhân">' + timeline + '</div>' +
      '</div>' +

      renderInsights(profile, cycles) +

      '<div class="result-actions">' +
        '<button class="btn btn-line btn-sm" type="button" data-action="share">' +
          '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="18" cy="5" r="2.6" fill="none" stroke="currentColor" stroke-width="1.4"/><circle cx="6" cy="12" r="2.6" fill="none" stroke="currentColor" stroke-width="1.4"/><circle cx="18" cy="19" r="2.6" fill="none" stroke="currentColor" stroke-width="1.4"/><path d="M8.2 10.8l7.6-4.4M8.2 13.2l7.6 4.4" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>' +
          'Chia sẻ lá số</button>' +
        '<button class="btn btn-line btn-sm" type="button" data-action="print">' +
          '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 9V4h10v5M7 17H5a2 2 0 01-2-2v-4a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2h-2" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/><rect x="7" y="14" width="10" height="6" rx="1" fill="none" stroke="currentColor" stroke-width="1.4"/></svg>' +
          'In / Lưu PDF</button>' +
        '<button class="btn btn-line btn-sm" type="button" data-action="again">' +
          '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 12a8 8 0 0113.7-5.7L20 8M20 4v4h-4M20 12a8 8 0 01-13.7 5.7L4 16M4 20v-4h4" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>' +
          'Luận giải lại</button>' +
      '</div>';
  }

  function startResultAnimations(profile) {
    var ring = $('#lp-ring');
    var numEl = $('#lp-num');
    if (ring) {
      var C = 2 * Math.PI * 86;
      ring.style.strokeDasharray = C.toFixed(1);
      ring.style.strokeDashoffset = C.toFixed(1);
      var target = C * (1 - Math.min(profile.lifePath, 9) / 9);
      setTimeout(function () {
        ring.style.strokeDashoffset = target.toFixed(1);
      }, reduceMotion.matches ? 0 : 380);
    }
    if (numEl) countUp(numEl, profile.lifePath, reduceMotion.matches ? 0 : 1200);
    $$('.energy-fill').forEach(function (el) {
      var pct = Number(el.getAttribute('data-pct')) || 0;
      setTimeout(function () {
        el.style.width = pct + '%';
      }, reduceMotion.matches ? 0 : 320);
    });
  }

  function countUp(el, target, duration) {
    if (!duration) {
      el.textContent = String(target);
      return;
    }
    var start = performance.now();
    function step(now) {
      var t = Math.min((now - start) / duration, 1);
      var eased = 1 - Math.pow(1 - t, 3);
      el.textContent = String(Math.round(eased * target));
      if (t < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  /* ---------- Dialog ---------- */
  var dialog = $('#num-dialog');
  var dialogBody = $('#dialog-body');
  var dialogClose = $('#dialog-close');
  var live = $('#live');
  var lastFocused = null;
  var lastTrigger = null;

  function dialogHTML(position, value, meta) {
    var strengths = meta.strengths && meta.strengths.length
      ? '<div><h4>Điểm mạnh</h4><ul>' + meta.strengths.map(function (s) { return '<li>' + s + '</li>'; }).join('') + '</ul></div>'
      : '';
    var challenges = meta.challenges && meta.challenges.length
      ? '<div><h4>Thử thách</h4><ul>' + meta.challenges.map(function (s) { return '<li>' + s + '</li>'; }).join('') + '</ul></div>'
      : '';
    var cols = strengths || challenges ? '<div class="dialog-cols">' + strengths + challenges + '</div>' : '';

    var love = meta.love
      ? '<div class="dialog-section"><h4>Tình yêu &amp; quan hệ</h4><p>' + meta.love + '</p></div>'
      : '';
    var career = meta.career
      ? '<div class="dialog-section"><h4>Sự nghiệp</h4><p>' + meta.career + '</p></div>'
      : '';
    var gift = meta.gift
      ? '<div class="dialog-section"><h4>Món quà</h4><p>' + meta.gift + '</p></div>'
      : '';
    var shadow = meta.shadow
      ? '<div class="dialog-section"><h4>Cái bóng</h4><p>' + meta.shadow + '</p></div>'
      : '';
    var extras = [
      ['Tuổi thơ', meta.childhood],
      ['Tiền bạc', meta.money],
      ['Sức khỏe', meta.health],
      ['Trưởng thành', meta.growth]
    ].filter(function (row) { return row[1]; }).map(function (row) {
      return '<div class="dialog-section"><h4>' + row[0] + '</h4><p>' + row[1] + '</p></div>';
    }).join('');
    var advice = meta.advice
      ? '<div class="dialog-advice"><h4>Lời nhắn</h4><p>' + meta.advice + '</p></div>'
      : '';
    var mantra = meta.mantra
      ? '<div class="dialog-advice is-mantra"><h4>Câu thần chú</h4><p>“' + meta.mantra + '”</p></div>'
      : '';
    var famous = meta.famous && meta.famous.length
      ? '<div class="dialog-section"><h4>Cùng tần số</h4><div class="chips">' +
        meta.famous.map(function (name) { return '<span class="chip">' + name + '</span>'; }).join('') +
        '</div></div>'
      : '';
    var stats = meta.planet || meta.element || meta.color
      ? '<dl class="dialog-meta">' +
          (meta.planet ? '<div class="meta-stat"><dt>Hành tinh</dt><dd>' + meta.planet + '</dd></div>' : '') +
          (meta.element ? '<div class="meta-stat"><dt>Nguyên tố</dt><dd>' + meta.element + '</dd></div>' : '') +
          (meta.color ? '<div class="meta-stat"><dt>Màu</dt><dd>' + meta.color + '</dd></div>' : '') +
        '</dl>'
      : '';

    return '<div class="dialog-head">' +
        '<p class="eyebrow"><span class="eyebrow-dot"></span>' + position.label + '</p>' +
        '<div class="dialog-num-row">' +
          '<span class="dialog-num">' + value + '</span>' +
          '<div>' +
            '<h3 class="dialog-title" id="dialog-title">' + meta.title + '</h3>' +
            (meta.archetype ? '<p class="dialog-archetype">' + meta.archetype + '</p>' : '') +
            '<p class="dialog-tags">' + (meta.keywords || []).join(' · ') + '</p>' +
          '</div>' +
        '</div>' +
      '</div>' +
      '<p class="dialog-desc">' + position.desc + '</p>' +
      '<p class="dialog-essence">' + meta.essence + '</p>' +
      gift + shadow + cols + love + career + extras + advice + mantra + famous + stats;
  }

  function openDialog(key, value, year, trigger) {
    var position;
    var meta;
    if (key === 'missing') {
      position = {
        label: 'Con số cần bồi đắp',
        desc: 'Con số vắng mặt trong bản đồ số của bạn. Đây không phải khiếm khuyết — mà là bài học đang chờ được học.'
      };
      meta = Object.assign({}, NUM.numbers[value], { advice: NUM.missing[value] });
    } else if (key === 'personalYear') {
      var py = NUM.personalYear[value];
      if (!py) return;
      position = {
        label: 'Năm cá nhân' + (year ? ' · ' + year : ''),
        desc: NUM.positions.personalYear.desc
      };
      meta = {
        title: py.title,
        keywords: ['Chu kỳ chín năm', 'Năm ' + value],
        essence: py.text
      };
    } else if (key === 'gallery') {
      position = {
        label: 'Con số',
        desc: 'Một trong mười hai khuôn mặt năng lượng. Đây là bản chất cốt lõi, độc lập với vị trí trong lá số.'
      };
      meta = NUM.numbers[value];
    } else {
      position = NUM.positions[key];
      meta = NUM.numbers[value];
    }

    if (!position || !meta || !dialog || !dialogBody) return;
    lastFocused = document.activeElement || document.body;
    lastTrigger = trigger || null;
    dialogBody.innerHTML = dialogHTML(position, value, meta);
    dialog.setAttribute('aria-modal', 'true');
    if (lastTrigger) lastTrigger.setAttribute('aria-expanded', 'true');
    if (typeof dialog.showModal === 'function') {
      if (!dialog.open) dialog.showModal();
    } else {
      dialog.setAttribute('open', '');
    }
    dialogBody.scrollTop = 0;
    if (dialogClose) dialogClose.focus();
    if (live) live.textContent = 'Mở chi tiết: ' + meta.title;
    dialog.removeEventListener('keydown', trapDialogFocus);
    dialog.addEventListener('keydown', trapDialogFocus);
  }

  function trapDialogFocus(e) {
    if (e.key === 'Escape') return;
    if (e.key !== 'Tab') return;
    var focusables = $$('button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])', dialog).filter(function (el) {
      return el.offsetParent !== null;
    });
    if (!focusables.length) return;
    var idx = focusables.indexOf(document.activeElement);
    if (idx === -1) idx = 0;
    var next = e.shiftKey ? (idx - 1 + focusables.length) % focusables.length : (idx + 1) % focusables.length;
    focusables[next].focus();
    e.preventDefault();
  }

  function closeDialog() {
    dialog.removeEventListener('keydown', trapDialogFocus);
    dialog.removeAttribute('aria-modal');
    if (lastTrigger) lastTrigger.setAttribute('aria-expanded', 'false');
    lastTrigger = null;
    if (lastFocused) {
      try { lastFocused.focus(); } catch (e) {}
      lastFocused = null;
    }
    if (live) live.textContent = '';
  }

  function initDialog() {
    if (!dialog) return;
    dialog.addEventListener('close', closeDialog);
    if (dialogClose) dialogClose.addEventListener('click', function () { dialog.close(); });
    dialog.addEventListener('click', function (e) {
      if (e.target === dialog) dialog.close();
    });
  }

  /* ---------- Gallery ---------- */
  function renderGallery() {
    var gallery = $('#gallery');
    if (!gallery) return;
    gallery.innerHTML = GALLERY_ORDER.map(function (n, i) {
      var meta = NUM.numbers[n];
      return '<button class="gallery-card reveal' + (meta.master ? ' is-master' : '') + '" type="button" ' +
        'data-key="gallery" data-value="' + n + '" aria-haspopup="dialog" style="--i:' + (i % 6) + '">' +
        (meta.master ? '<span class="gallery-master-badge">Bậc thầy</span>' : '') +
        '<span class="gallery-num">' + n + '</span>' +
        '<span class="gallery-title">' + meta.title + '</span>' +
        '<span class="gallery-tags">' + meta.keywords.join(' · ') + '</span>' +
        '<span class="gallery-desc">' + meta.essence + '</span>' +
        '</button>';
    }).join('');
  }

  /* ---------- Form ---------- */
  var form = $('#calc-form');
  var nameInput = $('#fullname');
  var dayInput = $('#dob-day');
  var monthInput = $('#dob-month');
  var yearInput = $('#dob-year');
  var dobInputs = [dayInput, monthInput, yearInput].filter(Boolean);
  var submitBtn = $('#submit-btn');
  var submitLabel = submitBtn ? submitBtn.querySelector('.btn-label') : null;
  var nameError = $('#fullname-error');
  var dobError = $('#dob-error');
  var formError = $('#form-error');

  function validateDob(d, m, y) {
    if (!Number.isFinite(d) || !Number.isFinite(m) || !Number.isFinite(y)) return null;
    if (y < 1900 || y > currentYear) return null;
    if (m < 1 || m > 12) return null;
    if (d < 1 || d > 31) return null;
    var dt = new Date(y, m - 1, d);
    if (dt.getFullYear() !== y || dt.getMonth() !== m - 1 || dt.getDate() !== d) return null;
    if (dt.getTime() > Date.now() + 86400000) return null;
    return { d: d, m: m, y: y };
  }

  function readDobFromInputs() {
    if (!dayInput || !monthInput || !yearInput) return null;
    var dStr = dayInput.value.trim();
    var mStr = monthInput.value.trim();
    var yStr = yearInput.value.trim();
    if (!/^\d{1,2}$/.test(dStr) || !/^\d{1,2}$/.test(mStr) || !/^\d{4}$/.test(yStr)) return null;
    return validateDob(Number(dStr), Number(mStr), Number(yStr));
  }

  function parseDobString(value) {
    if (!value) return null;
    var match = String(value).match(/(\d{1,2})\D+(\d{1,2})\D+(\d{4})/);
    if (!match) return null;
    return validateDob(Number(match[1]), Number(match[2]), Number(match[3]));
  }

  function fillDob(dob) {
    if (!dob || !dayInput || !monthInput || !yearInput) return;
    dayInput.value = pad(dob.d);
    monthInput.value = pad(dob.m);
    yearInput.value = String(dob.y);
  }

  function dobString(dob) {
    return pad(dob.d) + '/' + pad(dob.m) + '/' + dob.y;
  }

  function setFieldError(field, msg) {
    var err = field === 'name' ? nameError : dobError;
    if (field === 'name') {
      if (nameInput) nameInput.setAttribute('aria-invalid', 'true');
    } else {
      dobInputs.forEach(function (input) { input.setAttribute('aria-invalid', 'true'); });
    }
    if (err) {
      err.textContent = msg;
      err.hidden = false;
    }
  }

  function clearFieldError(field) {
    var err = field === 'name' ? nameError : dobError;
    if (field === 'name') {
      if (nameInput) nameInput.removeAttribute('aria-invalid');
    } else {
      dobInputs.forEach(function (input) { input.removeAttribute('aria-invalid'); });
    }
    if (err) {
      err.textContent = '';
      err.hidden = true;
    }
    if (formError) {
      formError.hidden = true;
      formError.textContent = '';
    }
  }

  function setLoading(isLoading) {
    if (!submitBtn) return;
    submitBtn.disabled = isLoading;
    submitBtn.classList.toggle('is-loading', isLoading);
    submitBtn.setAttribute('aria-busy', isLoading ? 'true' : 'false');
    if (submitLabel) submitLabel.textContent = isLoading ? 'Đang đọc dấu vết…' : 'Khởi tạo lá số';
  }

  function validateAndRun() {
    var name = nameInput ? nameInput.value.trim() : '';
    var dob = readDobFromInputs();
    var valid = true;

    clearFieldError('name');
    clearFieldError('dob');

    var letters = normalizeName(name).replace(/[^A-Z]/g, '');
    if (letters.length < 2) {
      setFieldError('name', 'Vui lòng nhập họ tên có ít nhất 2 chữ cái.');
      valid = false;
    }
    if (!dob) {
      setFieldError('dob', 'Ngày sinh chưa hợp lệ. Kiểm tra lại ngày, tháng, năm.');
      valid = false;
    }
    if (!valid) {
      if (nameInput && nameInput.getAttribute('aria-invalid')) nameInput.focus();
      else if (dayInput) dayInput.focus();
      return;
    }
    runCalc(name, dob);
  }

  function runCalc(name, dob) {
    setLoading(true);
    clearTimeout(calcTimer);
    var delay = reduceMotion.matches ? 140 : 950;
    calcTimer = setTimeout(function () {
      var profile = computeProfile(name, dob);
      renderResults(profile);
      setLoading(false);
      var results = $('#ket-qua');
      if (results) results.hidden = false;
      startResultAnimations(profile);
      saveLast(name, dob);
      updateUrl(name, dob);
      var live = $('#live');
      if (live) {
        live.textContent = 'Đã tạo lá số cho ' + name + '. Đường đời số ' + profile.lifePath +
          ', ' + NUM.numbers[profile.lifePath].title + '.';
      }
      if (results) {
        setTimeout(function () {
          results.scrollIntoView({ behavior: reduceMotion.matches ? 'auto' : 'smooth', block: 'start' });
        }, 80);
      }
    }, delay);
  }

  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      validateAndRun();
    });
  }

  if (nameInput) {
    nameInput.addEventListener('input', function () { clearFieldError('name'); });
  }

  function bindDobPart(input, next, maxLen) {
    if (!input) return;
    input.addEventListener('input', function () {
      input.value = input.value.replace(/\D/g, '').slice(0, maxLen);
      clearFieldError('dob');
      if (next && input.value.length >= maxLen) next.focus();
    });
    input.addEventListener('blur', function () {
      if (maxLen === 2 && input.value.length === 1) input.value = pad(input.value);
    });
  }

  bindDobPart(dayInput, monthInput, 2);
  bindDobPart(monthInput, yearInput, 2);
  bindDobPart(yearInput, null, 4);

  /* ---------- Actions ---------- */
  function fallbackCopy(text) {
    var ta = document.createElement('textarea');
    ta.value = text;
    ta.setAttribute('readonly', '');
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand('copy'); } catch (err) {}
    document.body.removeChild(ta);
  }

  function toast(message) {
    var el = $('#toast');
    if (!el) return;
    el.textContent = message;
    el.classList.add('is-on');
    clearTimeout(toast._timer);
    toast._timer = setTimeout(function () { el.classList.remove('is-on'); }, 2800);
  }

  function resultUrl() {
    if (!currentProfile) return location.href;
    var params = new URLSearchParams();
    params.set('ten', currentProfile.name);
    params.set('ngay', dobString(currentProfile.dob));
    var base = location.href.split('?')[0].split('#')[0];
    return base + '?' + params.toString();
  }

  function shareResult() {
    if (!currentProfile) return;
    var url = resultUrl();
    var text = 'Lá số Thiên Số của ' + currentProfile.name + ' — Đường đời ' +
      currentProfile.lifePath + ': ' + NUM.numbers[currentProfile.lifePath].title + '.';
    if (navigator.share) {
      navigator.share({ title: 'Thiên Số', text: text, url: url }).catch(function (err) {
        if (err && err.name === 'AbortError') return;
        copyShare(text, url);
      });
      return;
    }
    copyShare(text, url);
  }

  function copyShare(text, url) {
    var full = text + ' ' + url;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(full).then(function () {
        toast('Đã sao chép liên kết lá số.');
      }).catch(function () {
        fallbackCopy(full);
        toast('Đã sao chép liên kết lá số.');
      });
    } else {
      fallbackCopy(full);
      toast('Đã sao chép liên kết lá số.');
    }
  }

  function handleAction(action) {
    if (action === 'share') {
      shareResult();
    } else if (action === 'print') {
      window.print();
    } else if (action === 'again') {
      var target = $('#khoi-tao');
      if (target) {
        target.scrollIntoView({ behavior: reduceMotion.matches ? 'auto' : 'smooth', block: 'start' });
      }
      setTimeout(function () {
        if (nameInput) nameInput.focus({ preventScroll: true });
      }, reduceMotion.matches ? 0 : 480);
    }
  }

  function saveLast(name, dob) {
    try {
      localStorage.setItem('thienso:last', JSON.stringify({
        name: name,
        dob: dobString(dob)
      }));
    } catch (err) {}
  }

  function loadLast() {
    try {
      var raw = localStorage.getItem('thienso:last');
      if (!raw) return null;
      var data = JSON.parse(raw);
      if (data && data.name && data.dob) return data;
    } catch (err) {}
    return null;
  }

  function updateUrl(name, dob) {
    try {
      var params = new URLSearchParams();
      params.set('ten', name);
      params.set('ngay', dobString(dob));
      history.replaceState(null, '', location.pathname + '?' + params.toString());
    } catch (err) {}
  }

  /* ---------- Events ---------- */
  document.addEventListener('click', function (e) {
    var el = e.target instanceof Element ? e.target.closest('button') : null;
    if (!el) return;

    if (el.hasAttribute('data-action')) {
      handleAction(el.getAttribute('data-action'));
      return;
    }
    if (el.hasAttribute('data-key') && el.hasAttribute('data-value')) {
      var value = Number(el.getAttribute('data-value'));
      if (!isNaN(value)) {
        openDialog(el.getAttribute('data-key'), value, el.getAttribute('data-year'), el);
      }
    }
  });

  /* ---------- Init ---------- */
  buildOrb();
  initOrbParallax();
  initCursor();
  initTilt();
  initDialog();
  renderGallery();
  observeReveals();

  var yearEl = $('#year');
  if (yearEl) yearEl.textContent = String(currentYear);

  var params = new URLSearchParams(location.search);
  var sharedName = params.get('ten');
  var sharedDob = parseDobString(params.get('ngay'));

  if (sharedName && sharedDob && nameInput && normalizeName(sharedName).replace(/[^A-Z]/g, '').length >= 2) {
    nameInput.value = sharedName;
    fillDob(sharedDob);
    runCalc(sharedName, sharedDob);
  } else {
    var last = loadLast();
    if (last && nameInput) {
      nameInput.value = last.name;
      var lastDob = parseDobString(last.dob);
      if (lastDob) fillDob(lastDob);
    }
  }
})();
