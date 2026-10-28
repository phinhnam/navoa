/* Thiên Số — Giao diện vẽ bài Tarot (dùng TAROT) */
(function () {
  'use strict';

  if (!window.TAROT) return;

  var T = window.TAROT;
  var CARDS = T.cards || [];

  var form = document.getElementById('tarot-form');
  var root = document.getElementById('tarot-result');
  if (!form || !root) return;

  var countSelect = document.getElementById('tarot-count');
  var questionInput = document.getElementById('tarot-question');
  var errorEl = document.getElementById('tarot-error');
  var submitBtn = document.getElementById('tarot-submit');
  var shuffleBtn = document.getElementById('tarot-shuffle');
  var recent = document.getElementById('tarot-recent');
  var live = document.getElementById('live');
  var toast = document.getElementById('toast');

  function esc(str) {
    return String(str === undefined || str === null ? '' : str).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function pick(count) {
    var pool = CARDS.slice();
    var out = [];
    for (var i = 0; i < count; i++) {
      if (!pool.length) break;
      var idx = Math.floor(Math.random() * pool.length);
      var raw = pool.splice(idx, 1)[0];
      var card = Object.assign({}, raw);
      card.reversed = Math.random() < 0.5;
      out.push(card);
    }
    return out;
  }

  var THREE_CARD_POSITIONS = [
    { title: 'Quá khứ', hint: 'Gốc rễ & bài học khởi phát' },
    { title: 'Hiện tại', hint: 'Thực tại & thử thách cốt lõi' },
    { title: 'Tương lai', hint: 'Xu hướng & hướng đi khuyên dùng' }
  ];

  function cardHTML(card, index, total) {
    var isMajor = card.arcana === 'major';
    var rev = card.reversed;
    var meaning = rev ? card.rev : card.meaning;
    var side = rev ? 'Âm (Ngược)' : 'Dương (Xuôi)';
    var sideClass = rev ? 'tarot-rev-badge' : 'tarot-up-badge';
    var arcanaLabel = isMajor ? 'Đại Bí mật' : 'Tiểu Bí mật · ' + (card.element || '');
    var posHTML = '';
    if (total === 3 && THREE_CARD_POSITIONS[index]) {
      posHTML = '<div class="tarot-card-pos">' +
        '<span class="tarot-pos-title">' + esc(THREE_CARD_POSITIONS[index].title) + '</span>' +
        '<span class="tarot-pos-hint">' + esc(THREE_CARD_POSITIONS[index].hint) + '</span>' +
        '</div>';
    }
    var keywords = (card.keywords || []).map(function (k) {
      return '<span class="chip">' + esc(k) + '</span>';
    }).join('');
    var keywordsHTML = keywords ? '<div class="tarot-card-keywords">' + keywords + '</div>' : '';

    return '<div class="tarot-card ' + (isMajor ? 'is-major' : '') + '">' +
      posHTML +
      '<div class="tarot-card-arcana">' + esc(arcanaLabel) + '</div>' +
      '<span class="' + sideClass + '">' + esc(side) + '</span>' +
      '<div class="tarot-card-name">' + esc(card.vn) + '</div>' +
      '<div class="tarot-card-meaning">' + esc(meaning) + '</div>' +
      keywordsHTML +
      '</div>';
  }

  function render(cards, question, notify) {
    var total = cards.length;
    var cardsHTML = cards.map(function (card, idx) {
      return cardHTML(card, idx, total);
    }).join('');
    var questionHTML = question ? '<p class="tarot-question">Câu hỏi: <em>' + esc(question) + '</em></p>' : '';

    root.innerHTML = '<div class="tarot-cards">' + cardsHTML + '</div>' + questionHTML;
    root.hidden = false;
    root.setAttribute('tabindex', '-1');
    root.focus();
    root.classList.remove('is-fresh');
    void root.offsetWidth;
    root.classList.add('is-fresh');

    var names = cards.map(function (c) { return c.vn + (c.reversed ? ' (Âm)' : ''); }).join(', · ');
    if (notify) {
      if (live) live.textContent = 'Đã vẽ ' + cards.length + ' lá Tarot · ' + names;
      if (toast) {
        toast.textContent = 'Tarot · ' + names.slice(0, 60);
        toast.hidden = false;
        setTimeout(function () { toast.hidden = true; }, 3000);
      }
    }
    if (recent) {
      recent.textContent = cards.length + ' lá · ' + names;
    }
  }

  function showError(message) {
    if (!errorEl) return;
    errorEl.textContent = message;
    errorEl.hidden = false;
  }

  function clearError() {
    if (!errorEl) return;
    errorEl.textContent = '';
    errorEl.hidden = true;
  }

  function saveLastTarot(cards, question) {
    try {
      localStorage.setItem('thienso:tarot:last', JSON.stringify({
        cards: cards,
        question: question,
        count: cards.length
      }));
    } catch (e) {}
  }

  function loadLastTarot() {
    try {
      var raw = localStorage.getItem('thienso:tarot:last');
      if (!raw) return null;
      var data = JSON.parse(raw);
      if (data && Array.isArray(data.cards) && data.cards.length) return data;
    } catch (e) {}
    return null;
  }

  function drawNow(scroll, notify) {
    var count = countSelect ? Number(countSelect.value) : 1;
    if (!Number.isFinite(count) || count < 1 || count > 3) count = 1;
    var cards = pick(count);
    var question = questionInput ? questionInput.value.trim() : '';
    clearError();
    render(cards, question, notify !== false);
    saveLastTarot(cards, question);
    if (scroll) {
      root.scrollIntoView({
        behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
        block: 'start'
      });
    }
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    drawNow(true);
  });

  if (shuffleBtn) {
    shuffleBtn.addEventListener('click', function () {
      drawNow(true);
    });
  }

  var savedTarot = loadLastTarot();
  if (savedTarot) {
    if (countSelect) countSelect.value = String(savedTarot.count || savedTarot.cards.length);
    if (questionInput && savedTarot.question) questionInput.value = savedTarot.question;
    render(savedTarot.cards, savedTarot.question, false);
  } else {
    drawNow(false, false);
  }
})();
