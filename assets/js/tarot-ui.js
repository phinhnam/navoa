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

  function copyTarot(cards, question) {
    var stats = analyzeReading(cards);
    var advice = generateAdvice(cards, stats);
    var cardLines = cards.map(function (c, idx) {
      var pos = cards.length === 3 ? (THREE_CARD_POSITIONS[idx] ? THREE_CARD_POSITIONS[idx].title + ': ' : '') : '';
      return '• ' + pos + c.vn + ' (' + (c.reversed ? 'Âm/Ngược' : 'Dương/Xuôi') + '): ' + (c.reversed ? c.rev : c.meaning);
    });

    var lines = [
      '✦ THIÊN SỐ — TRẢI BÀI TAROT ✦',
      (question ? 'Câu hỏi: ' + question : 'Thông điệp thời điểm'),
      'Số lá: ' + cards.length + ' (' + stats.upright + ' Dương · ' + stats.rev + ' Âm)',
      '--------------------------------'
    ].concat(cardLines).concat([
      '--------------------------------',
      '• Lời khuyên then chốt:',
      advice.map(function (a) { return '  - ' + a; }).join('\n'),
      '--------------------------------',
      'Trải bài tại Thiên Số: ' + location.href.split('?')[0].split('#')[0] + '#tarot'
    ]);

    var text = lines.join('\n');
    function onCopied() {
      if (toast) {
        toast.textContent = 'Đã sao chép kết quả trải bài.';
        toast.hidden = false;
        clearTimeout(toast._timer);
        toast._timer = setTimeout(function () { toast.hidden = true; }, 3000);
      }
    }

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(onCopied).catch(function () {
        fallbackCopy(text);
        onCopied();
      });
    } else {
      fallbackCopy(text);
      onCopied();
    }
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

  function analyzeReading(cards) {
    var total = cards.length;
    var upright = 0;
    var rev = 0;
    var major = 0;
    var elementCounts = { 'Hỏa': 0, 'Thủy': 0, 'Khí': 0, 'Thổ': 0 };

    cards.forEach(function (c) {
      if (c.reversed) rev++; else upright++;
      if (c.arcana === 'major') major++;
      if (c.element && elementCounts[c.element] !== undefined) {
        elementCounts[c.element]++;
      }
    });

    var topElement = null;
    var maxCount = 0;
    Object.keys(elementCounts).forEach(function (el) {
      if (elementCounts[el] > maxCount) {
        maxCount = elementCounts[el];
        topElement = el;
      }
    });

    return {
      total: total,
      upright: upright,
      rev: rev,
      major: major,
      minor: total - major,
      topElement: maxCount > 0 ? topElement : null
    };
  }

  function generateAdvice(cards, stats) {
    var advice = [];
    if (stats.rev > 0) {
      advice.push('Có ' + stats.rev + ' lá ở chiều Âm (Ngược): Hãy quan sát lại nội tâm hoặc những nút thắt chưa bộc lộ trước khi hành động vội vàng.');
    } else {
      advice.push('Các lá bài đều ở chiều thuận (Dương): Tình thế ủng hộ sự chủ động, tự tin triển khai kế hoạch ra bên ngoài.');
    }

    if (stats.major >= (stats.total === 1 ? 1 : 2)) {
      advice.push('Lá Đại Bí mật mang năng lượng bước ngoặt: Hãy nhìn nhận bức tranh dài hạn, đây là giai đoạn chuyển biến quan trọng.');
    }

    if (stats.topElement === 'Hỏa') {
      advice.push('Nguyên tố Hỏa (Trượng) chiếm ưu thế: Cần duy trì nhiệt huyết, dứt khoát đưa ý tưởng thành hành động cụ thể.');
    } else if (stats.topElement === 'Thủy') {
      advice.push('Nguyên tố Thủy (Chén) chiếm ưu thế: Lắng nghe trực giác, chăm sóc các mối quan hệ và cân bằng cảm xúc.');
    } else if (stats.topElement === 'Khí') {
      advice.push('Nguyên tố Khí (Kiếm) chiếm ưu thế: Giữ tư duy minh bạch, lý trí sáng suốt, giao tiếp rõ ràng và tránh suy diễn.');
    } else if (stats.topElement === 'Thổ') {
      advice.push('Nguyên tố Thổ (Đá quý) chiếm ưu thế: Ưu tiên tính thực tế, kiên nhẫn tích lũy và bảo toàn các nguồn lực nền tảng.');
    }

    if (advice.length < 2) {
      advice.push('Giữ tâm thế chủ động: Tarot là tấm gương soi chiếu hiện tại, tương lai do nhận thức và hành động của bạn tạo nên.');
    }

    return advice;
  }

  function flowHTML(cards) {
    if (cards.length !== 3) return '';
    var steps = [
      {
        pos: 'Quá khứ · Cội nguồn',
        desc: cards[0].reversed
          ? 'Bài học chưa được giải quyết dứt điểm hoặc tiền đề có trở ngại ngầm: ' + esc(cards[0].rev)
          : 'Nền tảng, kinh nghiệm hoặc động lực khởi điểm đã đưa bạn tới hoàn cảnh này: ' + esc(cards[0].meaning)
      },
      {
        pos: 'Hiện tại · Trọng tâm',
        desc: cards[1].reversed
          ? 'Điểm nghẽn hoặc áp lực nội tâm cần tháo gỡ ngay lúc này: ' + esc(cards[1].rev)
          : 'Cơ hội và nguồn lực quan trọng nhất bạn đang nắm giữ: ' + esc(cards[1].meaning)
      },
      {
        pos: 'Tương lai · Chiều hướng',
        desc: cards[2].reversed
          ? 'Cảnh báo nguy cơ lệch hướng nếu không giải quyết khúc mắc hiện tại: ' + esc(cards[2].rev)
          : 'Chiều hướng hanh thông và thành quả đón đợi khi bạn đi đúng nhịp: ' + esc(cards[2].meaning)
      }
    ];

    var html = '<div class="tarot-flow">';
    steps.forEach(function (s, idx) {
      var c = cards[idx];
      var side = c.reversed ? 'Âm' : 'Dương';
      var sideClass = c.reversed ? 'tarot-rev-badge' : 'tarot-up-badge';
      html += '<div class="tarot-flow-item">' +
        '<div class="tarot-flow-head">' +
          '<span class="tarot-flow-pos">' + s.pos + '</span>' +
          '<span class="' + sideClass + '">' + side + '</span>' +
        '</div>' +
        '<h4 class="tarot-flow-name">' + esc(c.vn) + '</h4>' +
        '<p class="tarot-flow-desc">' + s.desc + '</p>' +
      '</div>';
    });
    html += '</div>';
    return html;
  }

  function singleHTML(card) {
    var isRev = card.reversed;
    var side = isRev ? 'Âm (Ngược)' : 'Dương (Xuôi)';
    var lead = isRev
      ? 'Lá bài xuất hiện ở chiều Âm, phản ánh nguồn năng lượng đang bị dồn nén, do dự hoặc cần sự điều chỉnh từ bên trong bản thân trước khi hành động bên ngoài.'
      : 'Lá bài xuất hiện ở chiều thuận Dương, báo hiệu nguồn năng lượng đang rõ ràng, trực diện và sẵn sàng để bạn nắm bắt.';
    var meaning = isRev ? card.rev : card.meaning;

    return '<div class="tarot-single-box">' +
      '<div class="tarot-single-head">' +
        '<h4>Thông điệp cốt lõi · ' + esc(card.vn) + ' (' + side + ')</h4>' +
      '</div>' +
      '<p class="tarot-single-lead">' + lead + '</p>' +
      '<p class="tarot-single-meaning">' + esc(meaning) + '</p>' +
    '</div>';
  }

  function renderSynthesis(cards, question) {
    var stats = analyzeReading(cards);
    var advice = generateAdvice(cards, stats);

    var energyChips = [
      '<span class="chip">' + stats.upright + ' Dương · ' + stats.rev + ' Âm</span>',
      '<span class="chip">' + (stats.major > 0 ? stats.major + ' Đại Bí mật' : 'Thuần Tiểu Bí mật') + '</span>'
    ];
    if (stats.topElement) {
      energyChips.push('<span class="chip">Trọng tâm: ' + stats.topElement + '</span>');
    }

    var detailsHTML = cards.length === 3 ? flowHTML(cards) : singleHTML(cards[0]);

    var adviceListHTML = advice.map(function (a) {
      return '<li>' + esc(a) + '</li>';
    }).join('');

    var guideHTML = '<details class="acc tarot-guide">' +
      '<summary><span class="acc-title">Cẩm nang & Quy ước Tarot</span>' +
        '<span class="acc-tag">Tìm hiểu thêm</span></summary>' +
      '<div class="tarot-guide-body">' +
        '<p><b>Đại Bí mật (22 lá):</b> Phản ánh những bài học cuộc đời lớn, sự chuyển biến định mệnh hoặc bước ngoặt tinh thần sâu sắc.</p>' +
        '<p><b>Tiểu Bí mật (56 lá):</b> Mô tả các chi tiết, sự việc và tâm lý trong đời sống thường nhật qua 4 nguyên tố:</p>' +
        '<ul>' +
          '<li><b>Trượng (Hỏa):</b> Năng lượng, ý chí hành động, đam mê và nghề nghiệp.</li>' +
          '<li><b>Chén (Thủy):</b> Cảm xúc, tình yêu, mối quan hệ và tiếng nói trực giác.</li>' +
          '<li><b>Kiếm (Khí):</b> Tư duy lý trí, giao tiếp, thử thách và sự thật cần đối diện.</li>' +
          '<li><b>Đá quý (Thổ):</b> Nền tảng vật chất, tài chính, công việc và sự tích lũy bền vững.</li>' +
        '</ul>' +
        '<p><b>Dương / Âm:</b> Chiều Dương thể hiện năng lượng bộc lộ trực tiếp ra ngoài; chiều Âm phản ánh năng lượng hướng nội, có trở ngại cần gỡ bỏ hoặc cần thêm thời gian tích lũy.</p>' +
        '<p class="panel-sub">Tarot là tấm gương phản chiếu nhận thức hiện tại. Tương lai luôn được định hình bởi lựa chọn và hành động tỉnh thức của bạn.</p>' +
      '</div>' +
    '</details>';

    return '<div class="tarot-synthesis">' +
      '<div class="tarot-synthesis-head">' +
        '<h3 class="tarot-synthesis-title">' +
          '<svg class="tarot-icon" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M12 7v5l3 3" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>' +
          'Giải thích bài Tarot' +
        '</h3>' +
        '<div class="tarot-head-actions">' +
          '<div class="chips">' + energyChips.join('') + '</div>' +
          '<button class="btn btn-line btn-sm" type="button" id="tarot-copy-btn">' +
            '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="9" y="9" width="13" height="13" rx="2" fill="none" stroke="currentColor" stroke-width="1.4"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" fill="none" stroke="currentColor" stroke-width="1.4"/></svg>' +
            'Sao chép trải bài</button>' +
        '</div>' +
      '</div>' +
      detailsHTML +
      '<div class="cast-advice tarot-advice">' +
        '<h4>Lời khuyên then chốt</h4>' +
        '<ul>' + adviceListHTML + '</ul>' +
      '</div>' +
      guideHTML +
      '</div>';
  }

  function render(cards, question, notify) {
    var total = cards.length;
    var cardsHTML = cards.map(function (card, idx) {
      return cardHTML(card, idx, total);
    }).join('');
    var questionHTML = question ? '<p class="tarot-question">Câu hỏi: <em>' + esc(question) + '</em></p>' : '';
    var synthesisHTML = renderSynthesis(cards, question);

    root.innerHTML = '<div class="tarot-cards">' + cardsHTML + '</div>' + questionHTML + synthesisHTML;
    root.hidden = false;
    root.setAttribute('tabindex', '-1');
    root.focus();
    root.classList.remove('is-fresh');
    void root.offsetWidth;
    root.classList.add('is-fresh');

    var copyBtn = document.getElementById('tarot-copy-btn');
    if (copyBtn) {
      copyBtn.addEventListener('click', function () {
        copyTarot(cards, question);
      });
    }

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
