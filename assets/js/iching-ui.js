/* Thiên Số — Giao diện lập quẻ Mai Hoa (dùng ICHING + LUNAR + data-hexagrams) */
(function () {
  'use strict';

  if (!window.ICHING || !window.LUNAR) return;

  var I = window.ICHING;
  var L = window.LUNAR;
  var H = I.hexagrams || {};

  var form = document.getElementById('cast-form');
  var root = document.getElementById('cast-result');
  if (!form || !root) return;

  var dayInput = document.getElementById('cast-day');
  var monthInput = document.getElementById('cast-month');
  var yearInput = document.getElementById('cast-year');
  var hourSelect = document.getElementById('cast-hour');
  var questionInput = document.getElementById('cast-question');
  var errorEl = document.getElementById('cast-error');
  var submitBtn = document.getElementById('cast-submit');
  var recent = document.getElementById('cast-recent');
  var live = document.getElementById('live');
  var toast = document.getElementById('toast');

  var TONES = {
    great: 'Đại cát',
    good: 'Cát',
    mixed: 'Trung hòa',
    caution: 'Cẩn trọng',
    bad: 'Cần giữ mình'
  };

  var MOVING_POSITION = {
    1: 'Hào 1 (dưới cùng): khởi đầu, căn bản — bước đầu tiên của vấn đề.',
    2: 'Hào 2: phát triển, điềm tĩnh — việc đang chín chồi, đừng vội.',
    3: 'Hào 3: tất yếu, biến động — thời điểm khó, cần kiểm tra kỹ trước khi hành động.',
    4: 'Hào 4: trung bình, ổn định — giữ vững phần đã có.',
    5: 'Hào 5: vị trí cao, quyết định — có quyền quy định, hành động có trọng lượng.',
    6: 'Hào 6 (trên cùng): kết thúc, rút lui — chốt lại, buông bỏ để chuẩn bị chu kỳ mới.'
  };

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

  function showToast(msg) {
    if (!toast) return;
    toast.textContent = msg;
    toast.hidden = false;
    toast.classList.add('is-on');
    clearTimeout(toast._timer);
    toast._timer = setTimeout(function () {
      toast.hidden = true;
      toast.classList.remove('is-on');
    }, 2800);
  }

  function copyCast(cast, info, question) {
    var meta = H[cast.primary] || {};
    var changedMeta = cast.changed ? (H[cast.changed] || {}) : null;
    var lines = [
      '✦ THIÊN SỐ — MAI HOA DỊCH SỐ ✦',
      (question ? 'Hỏi việc: ' + question : 'Xem thời vận'),
      'Thời điểm: ' + info.solarText + ' · Âm lịch: ' + info.lunarText,
      'Can Chi: Năm ' + info.yearCanChi + ' · Ngày ' + info.dayCanChi + ' · Giờ ' + info.hourCanChi,
      '--------------------------------',
      '• Quẻ Chủ: Quẻ ' + cast.primary + ' — ' + (meta.name || '') + ' (' + (TONES[meta.tone] || '') + ')',
      '• Hào động: Hào ' + cast.moving + ' (' + (MOVING_POSITION[cast.moving] || '') + ')',
      '• Tương quan: ' + cast.relation.label + ' (Thể ' + cast.the.name + ' - Dụng ' + cast.dung.name + ')',
      '• Lời thoán: ' + (meta.judgement || ''),
      (cast.mutual ? '• Quẻ Hỗ: Quẻ ' + cast.mutual + ' — ' + ((H[cast.mutual] || {}).name || '') : ''),
      (cast.changed && changedMeta ? '• Quẻ Biến: Quẻ ' + cast.changed + ' — ' + (changedMeta.name || '') + ' (' + (TONES[changedMeta.tone] || '') + ')' : ''),
      '--------------------------------',
      'Gieo tại Thiên Số: ' + location.href.split('?')[0].split('#')[0] + '#kinh-dich'
    ].filter(Boolean).join('\n');

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(lines).then(function () {
        showToast('Đã sao chép kết quả quẻ.');
      }).catch(function () {
        fallbackCopy(lines);
        showToast('Đã sao chép kết quả quẻ.');
      });
    } else {
      fallbackCopy(lines);
      showToast('Đã sao chép kết quả quẻ.');
    }
  }

  function pad(n) { return String(n).padStart(2, '0'); }

  function esc(str) {
    return String(str === undefined || str === null ? '' : str).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function validDate(d, m, y) {
    if (!Number.isFinite(d) || !Number.isFinite(m) || !Number.isFinite(y)) return null;
    if (y < 1900 || y > new Date().getFullYear()) return null;
    if (m < 1 || m > 12 || d < 1 || d > 31) return null;
    var dt = new Date(y, m - 1, d);
    if (dt.getFullYear() !== y || dt.getMonth() !== m - 1 || dt.getDate() !== d) return null;
    return { d: d, m: m, y: y };
  }

  function readForm() {
    var dStr = dayInput.value.trim();
    var mStr = monthInput.value.trim();
    var yStr = yearInput.value.trim();
    if (!/^\d{1,2}$/.test(dStr) || !/^\d{1,2}$/.test(mStr) || !/^\d{4}$/.test(yStr)) return null;
    return validDate(Number(dStr), Number(mStr), Number(yStr));
  }

  function fillToday() {
    var now = new Date();
    if (dayInput) dayInput.value = pad(now.getDate());
    if (monthInput) monthInput.value = pad(now.getMonth() + 1);
    if (yearInput) yearInput.value = String(now.getFullYear());
    if (hourSelect) hourSelect.value = String(L.hourChiFromHour(now.getHours()));
  }

  function linesHTML(lines, moving, size) {
    var out = '';
    for (var i = lines.length - 1; i >= 0; i--) {
      var yang = lines[i] === 1;
      var isMoving = moving === i + 1;
      out += '<span class="hex-line ' + (yang ? 'is-yang' : 'is-yin') +
        (isMoving ? ' is-moving' : '') + (size === 'sm' ? ' is-sm' : '') + '">' +
        (yang ? '<i></i>' : '<i></i><i></i>') +
        '</span>';
    }
    return out;
  }

  function miniHex(no, label) {
    if (!no || !I.structure[no]) return '';
    var meta = H[no] || {};
    var lines = I.structure[no].lines;
    return '<div class="mini-hex">' +
      '<span class="mini-hex-label">' + label + '</span>' +
      '<div class="hex-lines is-mini" aria-hidden="true">' + linesHTML(lines, 0, 'sm') + '</div>' +
      '<span class="mini-hex-name">' + esc(meta.name || I.structure[no].fullName) + '</span>' +
      '<span class="mini-hex-num">Quẻ ' + no + '</span>' +
      '</div>';
  }

  function advanceHTML(cast) {
    var parts = [];
    if (cast.mutual) parts.push(miniHex(cast.mutual, 'Quẻ hỗ'));
    if (cast.changed) parts.push(miniHex(cast.changed, 'Quẻ biến'));
    return parts.length ? '<div class="hex-pair">' + parts.join('') + '</div>' : '';
  }

  function render(cast, info, question) {
    var no = cast.primary;
    var meta = H[no] || {};
    var tone = meta.tone || 'mixed';
    var changedMeta = cast.changed ? (H[cast.changed] || {}) : null;

    var advice = (meta.advice || []).map(function (line) {
      return '<li>' + line + '</li>';
    }).join('');

    var header = '<div class="cast-top">' +
      '<div class="cast-hex">' +
        '<div class="hex-lines is-main" role="img" aria-label="' +
          esc('Sáu hào của quẻ ' + no + ', hào động thứ ' + cast.moving + ' tính từ dưới lên') + '">' +
          linesHTML(cast.lines, cast.moving) +
        '</div>' +
        '<span class="hex-caption">Hào 1 ở dưới · hào động ' + cast.moving + ' — ' + MOVING_POSITION[cast.moving] + '</span>' +
      '</div>' +
      '<div class="cast-main tone-' + tone + '">' +
        '<p class="eyebrow"><span class="eyebrow-dot"></span>Quẻ chủ · ' + no + '</p>' +
        '<h3 class="cast-name">' + esc(meta.name || I.structure[no].fullName) +
          '<span class="cast-han">' + esc(meta.han || '') + '</span></h3>' +
        '<p class="cast-tone">' + (TONES[tone] || '') + '</p>' +
        '<div class="chips">' + (meta.keywords || []).map(function (k) {
          return '<span class="chip">' + k + '</span>';
        }).join('') + '</div>' +
        '<p class="cast-judgement">' + esc(meta.judgement || '') + '</p>' +
      '</div>' +
    '</div>';

    var body = '<div class="cast-note">' +
      '<h4>Đại tượng</h4><p>' + esc(meta.image || '') + '</p>' +
      '</div>' +
      '      <p class="cast-essence">' + esc(meta.essence || '') + '</p>' +
      (meta.lineTexts && cast.moving ? '<div class="line-meaning"><h4>Ý nghĩa hào ' + cast.moving + '</h4><p>' + esc(meta.lineTexts[cast.moving - 1]) + '</p></div>' : '') +
      (question ? '<p class="cast-question">Điều đang hỏi: <em>' + esc(question) + '</em></p>' : '') +
      (advice ? '<div class="cast-advice"><h4>Nên làm</h4><ul>' + advice + '</ul></div>' : '') +
      advanceHTML(cast) +
      '<div class="cast-pair">' +
        '<div class="cast-side">' +
          '<span class="cast-side-label">Thể · Dụng</span>' +
          '<p><b>Thể</b> ' + cast.the.name + ' (' + cast.the.element + ') · <b>Dụng</b> ' +
            cast.dung.name + ' (' + cast.dung.element + ')</p>' +
          '<p class="cast-relation tone-' + cast.relation.tone + '">' + cast.relation.label + '</p>' +
          '<p>' + cast.relation.text + '</p>' +
        '</div>' +
        '<div class="cast-side">' +
          '<span class="cast-side-label">Quẻ biến</span>' +
          (changedMeta && changedMeta.name
            ? '<p><b>' + esc(changedMeta.name) + '</b> · ' + TONES[changedMeta.tone] + '</p>' +
              '<p>' + esc(changedMeta.judgement || '') + '</p>'
            : '<p>Không đổi quẻ.</p>') +
        '</div>' +
      '</div>' +
      '<details class="acc cast-method">' +
        '<summary><span class="acc-title">Cách lập quẻ</span>' +
          '<span class="acc-tag">Mai Hoa dịch số</span></summary>' +
        '<div class="cast-method-body">' +
          '<p>Dương lịch: ' + info.solarText + ' · Âm lịch: ' + info.lunarText + '</p>' +
          '<p>Năm ' + info.yearCanChi + ' · Ngày ' + info.dayCanChi + ' · Giờ ' + info.hourCanChi + '</p>' +
          '<p>Thượng quái: (' + cast.method.chiYear + ' + ' + cast.method.lunarMonth + ' + ' +
            cast.method.lunarDay + ') mod 8 = ' + cast.upperNum + ' · ' + cast.upper.name + '</p>' +
          '<p>Hạ quái: (' + cast.method.upperSum + ' + ' + cast.method.chiHour + ') mod 8 = ' +
            cast.lowerNum + ' · ' + cast.lower.name + '</p>' +
          '<p>Hào động: (' + cast.method.lowerSum + ') mod 6 = ' + cast.moving + '</p>' +
          '<p class="panel-sub">Quy ước Tiên thiên: Càn 1, Đoài 2, Ly 3, Chấn 4, Tốn 5, Khảm 6, Cấn 7, Khôn 8. Mai Hoa dùng thời điểm làm tín hiệu, không phải lời phán tuyệt đối.</p>' +
        '</div>' +
      '</details>' +
      '<div class="result-actions" style="margin-top: 1.1rem;">' +
        '<button class="btn btn-line btn-sm" type="button" id="cast-copy-btn">' +
          '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="9" y="9" width="13" height="13" rx="2" fill="none" stroke="currentColor" stroke-width="1.4"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" fill="none" stroke="currentColor" stroke-width="1.4"/></svg>' +
          'Sao chép quẻ</button>' +
      '</div>';

    root.innerHTML = header + body;
    root.hidden = false;
    root.setAttribute('tabindex', '-1');
    root.focus();
    root.classList.remove('is-fresh');
    void root.offsetWidth;
    root.classList.add('is-fresh');

    var copyBtn = document.getElementById('cast-copy-btn');
    if (copyBtn) {
      copyBtn.addEventListener('click', function () {
        copyCast(cast, info, question);
      });
    }

    if (live) live.textContent = 'Đã gieo quẻ ' + cast.primary + ' · ' + (meta.name || '') + ' · hào động ' + cast.moving;
    if (toast) {
      toast.textContent = 'Quẻ ' + cast.primary + ' — ' + (meta.name || '');
      toast.hidden = false;
      setTimeout(function () { toast.hidden = true; }, 3000);
    }
  }

  function showError(message) {
    if (!errorEl) return;
    errorEl.textContent = message;
    errorEl.hidden = false;
    [dayInput, monthInput, yearInput].forEach(function (el) {
      if (el) el.setAttribute('aria-invalid', 'true');
    });
  }

  function clearError() {
    if (!errorEl) return;
    errorEl.textContent = '';
    errorEl.hidden = true;
    [dayInput, monthInput, yearInput].forEach(function (el) {
      if (el) el.removeAttribute('aria-invalid');
    });
  }

  function saveLastIching(dob, chi, question) {
    try {
      localStorage.setItem('thienso:iching:last', JSON.stringify({
        d: dob.d, m: dob.m, y: dob.y,
        chi: chi,
        question: question
      }));
    } catch (e) {}
  }

  function loadLastIching() {
    try {
      var raw = localStorage.getItem('thienso:iching:last');
      if (!raw) return null;
      var data = JSON.parse(raw);
      if (data && validDate(data.d, data.m, data.y)) return data;
    } catch (e) {}
    return null;
  }

  function castNow(scroll) {
    var dob = readForm();
    if (!dob) {
      showError('Ngày chưa hợp lệ. Kiểm tra lại ngày, tháng, năm.');
      return;
    }
    var chi = hourSelect ? Number(hourSelect.value) : 0;
    if (!Number.isFinite(chi) || chi < 0 || chi > 11) chi = 0;

    var info = L.birthInfo(dob.d, dob.m, dob.y, chi);
    var cast = I.castMaiHoa(info);
    var question = questionInput ? questionInput.value.trim() : '';

    clearError();
    render(cast, info, question);
    saveLastIching(dob, chi, question);

    if (recent) {
      recent.textContent = 'Quẻ ' + cast.primary + ' · ' + (H[cast.primary] || {}).name +
        ' · ' + info.lunarText + ' · giờ ' + info.hourChiName;
    }

    if (scroll) {
      root.scrollIntoView({
        behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
        block: 'start'
      });
    }
  }

  function bindPart(input, next, maxLen) {
    if (!input) return;
    input.addEventListener('input', function () {
      input.value = input.value.replace(/\D/g, '').slice(0, maxLen);
      clearError();
      if (next && input.value.length >= maxLen) next.focus();
    });
    input.addEventListener('blur', function () {
      if (maxLen === 2 && input.value.length === 1) input.value = pad(input.value);
    });
  }

  bindPart(dayInput, monthInput, 2);
  bindPart(monthInput, yearInput, 2);
  bindPart(yearInput, null, 4);

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    castNow(true);
  });

  var todayBtn = document.getElementById('cast-today');
  if (todayBtn) {
    todayBtn.addEventListener('click', function () {
      fillToday();
      if (questionInput) questionInput.value = '';
      castNow(true);
    });
  }

  var savedIching = loadLastIching();
  if (savedIching) {
    if (dayInput) dayInput.value = pad(savedIching.d);
    if (monthInput) monthInput.value = pad(savedIching.m);
    if (yearInput) yearInput.value = String(savedIching.y);
    if (hourSelect) hourSelect.value = String(savedIching.chi);
    if (questionInput && savedIching.question) questionInput.value = savedIching.question;
    castNow(false);
  } else {
    fillToday();
    castNow(false);
  }
})();
