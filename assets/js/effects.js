/* Thiên Số — Hiệu ứng hình ảnh & tương tác (Effects & Visuals) */
(function () {
  'use strict';

  function $(sel, root) { return (root || document).querySelector(sel); }
  function $$(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  var finePointer = window.matchMedia('(pointer: fine)');

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

  // Auto-init visual features
  buildOrb();
  initOrbParallax();
  initCursor();
  initTilt();
  observeReveals();

  window.THIENSO_FX = {
    observeReveals: observeReveals,
    buildOrb: buildOrb
  };
})();
