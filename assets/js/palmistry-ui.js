/* Thiên Số — Giao diện Luận giải Tướng pháp chỉ tay (HTML5 Canvas + data-palmistry)
   Toàn bộ quá trình xử lý ảnh và luận giải diễn ra 100% trong trình duyệt. */
(function () {
  'use strict';

  if (!window.PALMISTRY) return;
  var P = window.PALMISTRY;

  var dropzone = document.getElementById('palm-dropzone');
  var fileInput = document.getElementById('palm-file-input');
  var cameraBtn = document.getElementById('palm-camera-btn');
  var sampleBtn = document.getElementById('palm-sample-btn');
  var canvasWrap = document.getElementById('palm-canvas-wrap');
  var canvas = document.getElementById('palm-canvas');
  var ctx = canvas && canvas.getContext ? canvas.getContext('2d') : null;
  var contrastSlider = document.getElementById('palm-contrast');
  var contrastVal = document.getElementById('palm-contrast-val');
  var resetImgBtn = document.getElementById('palm-reset-img');
  var invertBtn = document.getElementById('palm-invert-btn');

  var form = document.getElementById('palm-form');
  var submitBtn = document.getElementById('palm-submit');
  var resultRoot = document.getElementById('palm-result');
  var toast = document.getElementById('toast');

  var currentImg = null;
  var isInverted = false;
  var currentContrast = 100;

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

  function esc(str) {
    return String(str === undefined || str === null ? '' : str).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  /* ---------- Xử lý vẽ ảnh trên HTML5 Canvas ---------- */
  function renderCanvas() {
    if (!ctx || !currentImg) return;

    var maxW = 560;
    var maxH = 680;
    var scale = Math.min(maxW / currentImg.width, maxH / currentImg.height, 1);
    var w = Math.round(currentImg.width * scale);
    var h = Math.round(currentImg.height * scale);

    canvas.width = w;
    canvas.height = h;

    ctx.clearRect(0, 0, w, h);
    ctx.drawImage(currentImg, 0, 0, w, h);

    // Xử lý bộ lọc tăng tương phản (High contrast & Line enhancement)
    if (currentContrast !== 100 || isInverted) {
      var imgData = ctx.getImageData(0, 0, w, h);
      var d = imgData.data;
      var factor = (259 * (currentContrast + 255)) / (255 * (259 - currentContrast));

      for (var i = 0; i < d.length; i += 4) {
        var r = d[i];
        var g = d[i + 1];
        var b = d[i + 2];

        if (isInverted) {
          r = 255 - r;
          g = 255 - g;
          b = 255 - b;
        }

        if (currentContrast !== 100) {
          r = factor * (r - 128) + 128;
          g = factor * (g - 128) + 128;
          b = factor * (b - 128) + 128;
        }

        d[i] = Math.min(255, Math.max(0, r));
        d[i + 1] = Math.min(255, Math.max(0, g));
        d[i + 2] = Math.min(255, Math.max(0, b));
      }
      ctx.putImageData(imgData, 0, 0);
    }
  }

  function loadFile(file) {
    if (!file || !file.type.match(/^image\//i)) {
      showToast('Vui lòng chọn tệp hình ảnh hợp lệ (PNG, JPG, WEBP).');
      return;
    }

    var reader = new FileReader();
    reader.onload = function (e) {
      var img = new Image();
      img.onload = function () {
        currentImg = img;
        isInverted = false;
        currentContrast = 120; // Tự động tăng nhẹ tương phản giúp vệt chỉ tay rõ nét
        if (contrastSlider) contrastSlider.value = '120';
        if (contrastVal) contrastVal.textContent = '120%';
        if (dropzone) dropzone.hidden = true;
        if (canvasWrap) canvasWrap.hidden = false;
        renderCanvas();
        showToast('Đã nạp ảnh bàn tay vào Canvas bảo mật.');
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  }

  function drawSamplePalm() {
    var sample = document.createElement('canvas');
    sample.width = 460;
    sample.height = 580;
    var sctx = sample.getContext('2d');

    // Nền tối thanh nhã
    var bgGrad = sctx.createRadialGradient(230, 290, 40, 230, 290, 280);
    bgGrad.addColorStop(0, '#1E152F');
    bgGrad.addColorStop(1, '#0C0816');
    sctx.fillStyle = bgGrad;
    sctx.fillRect(0, 0, 460, 580);

    // Hình phác thảo bàn tay vàng kim
    sctx.strokeStyle = 'rgba(231, 201, 138, 0.45)';
    sctx.lineWidth = 2.5;
    sctx.beginPath();
    // Phác thảo lòng bàn tay & cổ tay
    sctx.ellipse(230, 340, 140, 170, 0, 0, Math.PI * 2);
    sctx.stroke();

    // 1. Đường Sinh Đạo (Vòng ôm quanh gò cái)
    sctx.strokeStyle = '#F6E8C6';
    sctx.lineWidth = 3.5;
    sctx.beginPath();
    sctx.moveTo(160, 270);
    sctx.quadraticCurveTo(240, 340, 180, 470);
    sctx.stroke();

    // 2. Đường Trí Đạo (Ngang qua gò Thái Âm)
    sctx.strokeStyle = '#B7A7FF';
    sctx.lineWidth = 3.5;
    sctx.beginPath();
    sctx.moveTo(160, 275);
    sctx.quadraticCurveTo(250, 330, 340, 360);
    sctx.stroke();

    // 3. Đường Tâm Đạo (Dưới chân các ngón)
    sctx.strokeStyle = '#F5C4D8';
    sctx.lineWidth = 3.5;
    sctx.beginPath();
    sctx.moveTo(350, 280);
    sctx.quadraticCurveTo(260, 270, 200, 230);
    sctx.stroke();

    // 4. Đường Định Mệnh (Dọc từ cổ tay lên giữa)
    sctx.strokeStyle = '#9FD8B4';
    sctx.lineWidth = 2.8;
    sctx.beginPath();
    sctx.moveTo(230, 490);
    sctx.lineTo(230, 260);
    sctx.stroke();

    // 5. Chữ M giao thoa
    sctx.fillStyle = 'rgba(231, 201, 138, 0.85)';
    sctx.font = 'bold 16px sans-serif';
    sctx.fillText('Sinh Đạo', 130, 430);
    sctx.fillText('Trí Đạo', 320, 340);
    sctx.fillText('Tâm Đạo', 180, 210);
    sctx.fillText('Định Mệnh', 240, 480);

    var img = new Image();
    img.onload = function () {
      currentImg = img;
      if (dropzone) dropzone.hidden = true;
      if (canvasWrap) canvasWrap.hidden = false;
      renderCanvas();
      showToast('Đã nạp hình mẫu bàn tay minh họa.');
    };
    img.src = sample.toDataURL();
  }

  /* ---------- Tương tác kéo thả & nút bấm ---------- */
  if (dropzone) {
    dropzone.addEventListener('dragover', function (e) {
      e.preventDefault();
      dropzone.classList.add('is-dragover');
    });

    dropzone.addEventListener('dragleave', function (e) {
      e.preventDefault();
      dropzone.classList.remove('is-dragover');
    });

    dropzone.addEventListener('drop', function (e) {
      e.preventDefault();
      dropzone.classList.remove('is-dragover');
      if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0]) {
        loadFile(e.dataTransfer.files[0]);
      }
    });

    dropzone.addEventListener('click', function (e) {
      if (e.target.closest('#palm-sample-btn')) return;
      if (fileInput) fileInput.click();
    });
  }

  if (fileInput) {
    fileInput.addEventListener('change', function () {
      if (fileInput.files && fileInput.files[0]) {
        loadFile(fileInput.files[0]);
      }
    });
  }

  if (sampleBtn) {
    sampleBtn.addEventListener('click', function (e) {
      e.stopPropagation();
      drawSamplePalm();
    });
  }

  if (contrastSlider) {
    contrastSlider.addEventListener('input', function () {
      currentContrast = Number(contrastSlider.value);
      if (contrastVal) contrastVal.textContent = currentContrast + '%';
      renderCanvas();
    });
  }

  if (invertBtn) {
    invertBtn.addEventListener('click', function () {
      isInverted = !isInverted;
      renderCanvas();
    });
  }

  if (resetImgBtn) {
    resetImgBtn.addEventListener('click', function () {
      currentImg = null;
      if (fileInput) fileInput.value = '';
      if (canvasWrap) canvasWrap.hidden = true;
      if (dropzone) dropzone.hidden = false;
    });
  }

  /* ---------- Luận giải & Tổng hợp Tướng Pháp ---------- */
  function readSelections() {
    var genderEl = document.querySelector('input[name="palm-gender"]:checked');
    var handEl = document.querySelector('input[name="palm-hand"]:checked');
    var shapeEl = document.getElementById('palm-shape');
    var lifeEl = document.getElementById('palm-line-life');
    var headEl = document.getElementById('palm-line-head');
    var heartEl = document.getElementById('palm-line-heart');
    var fateEl = document.getElementById('palm-line-fate');
    var sunEl = document.getElementById('palm-line-sun');

    var checkedSpecials = [];
    document.querySelectorAll('.palm-special-cb:checked').forEach(function (cb) {
      checkedSpecials.push(cb.value);
    });

    return {
      gender: genderEl ? genderEl.value : 'male',
      hand: handEl ? handEl.value : 'right',
      shape: shapeEl ? shapeEl.value : 'earth',
      life: lifeEl ? lifeEl.value : 'deep_curved',
      head: headEl ? headEl.value : 'long_straight',
      heart: heartEl ? heartEl.value : 'curves_jupiter',
      fate: fateEl ? fateEl.value : 'clear_from_base',
      sun: sunEl ? sunEl.value : 'clear_long',
      specials: checkedSpecials
    };
  }

  function renderReport(data) {
    if (!resultRoot) return;

    var handType = P.handTypes[data.shape] || P.handTypes.earth;
    var lifeOpt = P.lines.life.options[data.life] || P.lines.life.options.deep_curved;
    var headOpt = P.lines.head.options[data.head] || P.lines.head.options.long_straight;
    var heartOpt = P.lines.heart.options[data.heart] || P.lines.heart.options.curves_jupiter;
    var fateOpt = P.lines.fate.options[data.fate] || P.lines.fate.options.clear_from_base;
    var sunOpt = P.lines.sun.options[data.sun] || P.lines.sun.options.clear_long;

    var handContext = data.hand === 'left'
      ? 'Bàn tay trái đại diện cho <b>tiềm năng bẩm sinh, di truyền tiền định</b> và những tố chất thuở thiếu thời.'
      : 'Bàn tay phải đại diện cho <b>thành tựu rèn luyện thực tế, ý chí cá nhân</b> và tương lai đang tiếp diễn.';

    var specialCardsHTML = '';
    if (data.specials && data.specials.length) {
      specialCardsHTML =
        '<div class="palm-special-box">' +
          '<h4 class="palm-box-title">Dấu Ấn Quý Tướng Đặc Biệt</h4>' +
          '<div class="palm-special-grid">' +
          data.specials.map(function (k) {
            var s = P.specialSigns[k];
            if (!s) return '';
            return '<div class="palm-special-card">' +
              '<div class="palm-special-head">' +
                '<span class="special-badge">Dấu Ấn</span>' +
                '<h5>' + esc(s.name) + ' <small>' + esc(s.han) + '</small></h5>' +
              '</div>' +
              '<p class="special-desc">' + esc(s.description) + '</p>' +
              '<p class="special-reading"><b>Ý nghĩa:</b> ' + esc(s.reading) + '</p>' +
              '<p class="special-advice"><b>Lời khuyên:</b> ' + esc(s.advice) + '</p>' +
            '</div>';
          }).join('') +
          '</div>' +
        '</div>';
    }

    resultRoot.innerHTML =
      '<div class="palm-report-head">' +
        '<div class="palm-report-badges">' +
          '<span class="badge-num">Tướng Pháp Bàn Tay</span>' +
          '<span class="cast-tone tone-great">Hành ' + esc(handType.element) + '</span>' +
        '</div>' +
        '<h3 class="palm-report-title">Bản Luận Giải Tướng Tay Toàn Diện</h3>' +
        '<p class="palm-report-context">' + handContext + '</p>' +
      '</div>' +

      '<div class="palm-result-grid">' +
        // 1. Hình thái bàn tay
        '<div class="palm-card">' +
          '<div class="palm-card-head">' +
            '<span class="palm-icon">🖐</span>' +
            '<div>' +
              '<span class="palm-label">Hình Thái Lòng Bàn Tay</span>' +
              '<h4>' + esc(handType.name) + '</h4>' +
            '</div>' +
          '</div>' +
          '<p class="palm-shape-desc"><b>Đặc điểm:</b> ' + esc(handType.shape) + '</p>' +
          '<div class="chips" style="margin: 0.4rem 0 0.6rem;">' +
            handType.traits.map(function (t) { return '<span class="chip-sm">' + esc(t) + '</span>'; }).join('') +
          '</div>' +
          '<p class="palm-desc">' + esc(handType.nature) + '</p>' +
          '<div class="palm-pillars">' +
            '<div><b>Điểm mạnh:</b><ul>' + handType.strengths.map(function (s) { return '<li>' + esc(s) + '</li>'; }).join('') + '</ul></div>' +
            '<div><b>Lưu ý:</b><ul>' + handType.challenges.map(function (c) { return '<li>' + esc(c) + '</li>'; }).join('') + '</ul></div>' +
          '</div>' +
        '</div>' +

        // 2. Đường Sinh Đạo
        '<div class="palm-card">' +
          '<div class="palm-card-head">' +
            '<span class="palm-icon" style="color:#F6E8C6;">🌱</span>' +
            '<div>' +
              '<span class="palm-label">Đường Sinh Đạo (Thể Lực)</span>' +
              '<h4>' + esc(lifeOpt.label) + '</h4>' +
            '</div>' +
          '</div>' +
          '<p class="palm-desc">' + esc(lifeOpt.reading) + '</p>' +
          '<div class="palm-advice-box"><b>Khuyên dưỡng:</b> ' + esc(lifeOpt.advice) + '</div>' +
        '</div>' +

        // 3. Đường Trí Đạo
        '<div class="palm-card">' +
          '<div class="palm-card-head">' +
            '<span class="palm-icon" style="color:#B7A7FF;">💡</span>' +
            '<div>' +
              '<span class="palm-label">Đường Trí Đạo (Tư Duy)</span>' +
              '<h4>' + esc(headOpt.label) + '</h4>' +
            '</div>' +
          '</div>' +
          '<p class="palm-desc">' + esc(headOpt.reading) + '</p>' +
          '<div class="palm-advice-box"><b>Khuyên dưỡng:</b> ' + esc(headOpt.advice) + '</div>' +
        '</div>' +

        // 4. Đường Tâm Đạo
        '<div class="palm-card">' +
          '<div class="palm-card-head">' +
            '<span class="palm-icon" style="color:#F5C4D8;">💖</span>' +
            '<div>' +
              '<span class="palm-label">Đường Tâm Đạo (Cảm Xúc)</span>' +
              '<h4>' + esc(heartOpt.label) + '</h4>' +
            '</div>' +
          '</div>' +
          '<p class="palm-desc">' + esc(heartOpt.reading) + '</p>' +
          '<div class="palm-advice-box"><b>Khuyên dưỡng:</b> ' + esc(heartOpt.advice) + '</div>' +
        '</div>' +

        // 5. Đường Định Mệnh & Thái Dương
        '<div class="palm-card">' +
          '<div class="palm-card-head">' +
            '<span class="palm-icon" style="color:#9FD8B4;">⚡</span>' +
            '<div>' +
              '<span class="palm-label">Sự Nghiệp & Danh Tiếng</span>' +
              '<h4>Định Mệnh & Thái Dương</h4>' +
            '</div>' +
          '</div>' +
          '<p class="palm-desc"><b>Định Mệnh (' + esc(fateOpt.label) + '):</b> ' + esc(fateOpt.reading) + '</p>' +
          '<p class="palm-desc" style="margin-top:0.4rem;"><b>Thái Dương (' + esc(sunOpt.label) + '):</b> ' + esc(sunOpt.reading) + '</p>' +
          '<div class="palm-advice-box"><b>Khuyên dưỡng:</b> ' + esc(fateOpt.advice) + '</div>' +
        '</div>' +
      '</div>' +

      specialCardsHTML +

      '<div class="palm-philosophy-box">' +
        '<div class="palm-philo-head">' +
          '<svg viewBox="0 0 24 24" aria-hidden="true" width="20" height="20"><path d="M12 2L15 8L21 9L17 14L18 20L12 17L6 20L7 14L3 9L9 8L12 2Z" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/></svg>' +
          '<strong>' + esc(P.philosophy.title) + '</strong>' +
        '</div>' +
        '<blockquote class="palm-philo-quote">“' + esc(P.philosophy.quote) + '”</blockquote>' +
        '<p class="palm-philo-text">' + esc(P.philosophy.explanation) + '</p>' +
      '</div>' +

      '<div class="palm-actions">' +
        '<button class="btn btn-gold btn-sm" type="button" id="palm-copy-summary-btn">' +
          '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="9" y="9" width="13" height="13" rx="2" fill="none" stroke="currentColor" stroke-width="1.4"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" fill="none" stroke="currentColor" stroke-width="1.4"/></svg>' +
          'Sao chép luận giải chỉ tay' +
        '</button>' +
        '<button class="btn btn-line btn-sm" type="button" id="palm-again-btn">Xem lại đặc điểm khác</button>' +
      '</div>';

    resultRoot.scrollIntoView({
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
      block: 'start'
    });

    var copyBtn = document.getElementById('palm-copy-summary-btn');
    if (copyBtn) {
      copyBtn.addEventListener('click', function () {
        var summaryLines = [
          '✦ THIÊN SỐ — LUẬN GIẢI TƯỚNG PHÁP CHỈ TAY ✦',
          'Tay xem: ' + (data.hand === 'left' ? 'Bàn tay trái (Tiềm năng bẩm sinh)' : 'Bàn tay phải (Thành quả rèn luyện)'),
          'Hình thái: ' + handType.name + ' (' + handType.shape + ')',
          '--------------------------------',
          '• Sinh Đạo: ' + lifeOpt.label + ' — ' + lifeOpt.reading,
          '• Trí Đạo: ' + headOpt.label + ' — ' + headOpt.reading,
          '• Tâm Đạo: ' + heartOpt.label + ' — ' + heartOpt.reading,
          '• Định Mệnh: ' + fateOpt.label + ' — ' + fateOpt.reading,
          '• Thái Dương: ' + sunOpt.label + ' — ' + sunOpt.reading,
          (data.specials && data.specials.length ? '• Dấu ấn quý: ' + data.specials.map(function (k) { return (P.specialSigns[k] || {}).name; }).filter(Boolean).join(', ') : ''),
          '--------------------------------',
          'Triết lý: ' + P.philosophy.quote,
          'Luận giải tại: ' + location.href.split('?')[0].split('#')[0] + '#chi-tay'
        ].filter(Boolean).join('\n');

        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(summaryLines).then(function () {
            showToast('Đã sao chép kết quả luận giải chỉ tay.');
          }).catch(function () {
            fallbackCopy(summaryLines);
            showToast('Đã sao chép kết quả luận giải chỉ tay.');
          });
        } else {
          fallbackCopy(summaryLines);
          showToast('Đã sao chép kết quả luận giải chỉ tay.');
        }
      });
    }

    var againBtn = document.getElementById('palm-again-btn');
    if (againBtn) {
      againBtn.addEventListener('click', function () {
        var formSection = document.getElementById('palm-section-head');
        if (formSection) {
          formSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    }
  }

  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var data = readSelections();
      renderReport(data);
    });
  }
})();
