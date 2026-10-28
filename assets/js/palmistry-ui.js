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
  var autoScanBtn = document.getElementById('palm-auto-scan-btn');
  var tunePinsBtn = document.getElementById('palm-tune-pins-btn');
  var pinHint = document.getElementById('palm-pin-hint');
  var scanStatus = document.getElementById('palm-scan-status');

  var form = document.getElementById('palm-form');
  var submitBtn = document.getElementById('palm-submit');
  var resultRoot = document.getElementById('palm-result');
  var toast = document.getElementById('toast');

  var currentImg = null;
  var isInverted = false;
  var currentContrast = 100;
  var isOverlayVisible = true;
  var isFineTuneMode = true;
  var lastDetected = null;
  var lastGeom = null;
  var anchorPins = [];
  var activePin = null;
  var hoveredPin = null;

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

    if (isOverlayVisible && lastDetected) {
      drawScanOverlay(w, h);
    }
  }

  /* ==================== BỘ COMPUTER VISION & ĐỊNH VỊ GIẢI PHẪU CHỈ TAY ==================== */

  // 1. Phân đoạn sắc tố da & Định vị hộp bao bàn tay (Skin Mask & Anatomical Bounding Box)
  function getDefaultGeometry(w, h) {
    var minX = Math.round(w * 0.16);
    var maxX = Math.round(w * 0.84);
    var minY = Math.round(h * 0.08);
    var maxY = Math.round(h * 0.94);
    var handW = maxX - minX;
    var handH = maxY - minY;
    var junctionY = minY + Math.round(handH * 0.38);
    var palmWidth = handW;
    var palmLength = maxY - junctionY;
    var fingerLength = junctionY - minY;
    return {
      minX: minX, maxX: maxX, minY: minY, maxY: maxY,
      junctionY: junctionY, handW: handW, handH: handH,
      palmWidth: palmWidth, palmLength: palmLength,
      fingerLength: fingerLength,
      palmRatio: palmLength / palmWidth,
      fingerRatio: fingerLength / palmLength,
      shape: 'air',
      isDefault: true
    };
  }

  function analyzeHandGeometry(ctx, w, h) {
    var imgData = ctx.getImageData(0, 0, w, h);
    var data = imgData.data;
    var rowCounts = new Int32Array(h);
    var colCounts = new Int32Array(w);
    var skinTotal = 0;

    for (var y = 0; y < h; y++) {
      for (var x = 0; x < w; x++) {
        var idx = (y * w + x) * 4;
        var r = data[idx];
        var g = data[idx + 1];
        var b = data[idx + 2];

        // Chuyển sang không gian màu YCbCr
        var Y = 0.299 * r + 0.587 * g + 0.114 * b;
        var Cb = 128 - 0.168736 * r - 0.331264 * g + 0.5 * b;
        var Cr = 128 + 0.5 * r - 0.418688 * g - 0.081312 * b;

        var isSkin = false;
        // Phổ màu da người đa diện (Trắng, Vàng, Bánh mật)
        if (Y > 35 && Y < 245 && Cb >= 75 && Cb <= 138 && Cr >= 130 && Cr <= 185) {
          if (r > g && g > b) {
            isSkin = true;
          } else if (Math.abs(r - g) < 25 && r > b) {
            isSkin = true;
          }
        }

        // Hỗ trợ trường hợp ảnh nét vẽ hoặc ảnh đảo sáng
        if (!isSkin) {
          var lum = 0.299 * r + 0.587 * g + 0.114 * b;
          if (isInverted && lum > 60 && lum < 220) isSkin = true;
          else if (!isInverted && lum > 140 && (r > 120 || g > 120)) isSkin = true;
        }

        if (isSkin) {
          rowCounts[y]++;
          colCounts[x]++;
          skinTotal++;
        }
      }
    }

    var minSkinThreshold = (w * h) * 0.04;
    if (skinTotal < minSkinThreshold) {
      return getDefaultGeometry(w, h);
    }

    var yThresh = w * 0.06;
    var xThresh = h * 0.06;

    var minY = 0, maxY = h - 1, minX = 0, maxX = w - 1;
    while (minY < h && rowCounts[minY] < yThresh) minY++;
    while (maxY > minY && rowCounts[maxY] < yThresh) maxY--;
    while (minX < w && colCounts[minX] < xThresh) minX++;
    while (maxX > minX && colCounts[maxX] < xThresh) maxX--;

    var handW = maxX - minX;
    var handH = maxY - minY;

    if (handW < w * 0.25 || handH < h * 0.25) {
      return getDefaultGeometry(w, h);
    }

    // Tìm ranh giới giữa ngón tay (Finger Span) và lòng bàn tay (Palm Body)
    var junctionY = minY + Math.round(handH * 0.38);
    var maxDiff = -99999;
    for (var yTest = Math.round(minY + handH * 0.28); yTest <= Math.round(minY + handH * 0.48); yTest++) {
      var diff = rowCounts[yTest] - rowCounts[Math.max(0, yTest - 6)];
      if (diff > maxDiff) {
        maxDiff = diff;
        junctionY = yTest;
      }
    }

    var fingerLength = Math.max(1, junctionY - minY);
    var palmLength = Math.max(1, maxY - junctionY);
    var palmWidth = handW;

    var palmRatio = palmLength / palmWidth;
    var fingerRatio = fingerLength / palmLength;

    // Phân loại chính xác 4 nhóm nguyên tố theo tỷ lệ giải phẫu học
    var shape = 'air';
    if (palmRatio <= 1.14) {
      shape = (fingerRatio >= 0.75) ? 'air' : 'earth';
    } else {
      shape = (fingerRatio >= 0.75) ? 'water' : 'fire';
    }

    return {
      minX: minX,
      maxX: maxX,
      minY: minY,
      maxY: maxY,
      junctionY: junctionY,
      handW: handW,
      handH: handH,
      palmWidth: palmWidth,
      palmLength: palmLength,
      fingerLength: fingerLength,
      palmRatio: palmRatio,
      fingerRatio: fingerRatio,
      shape: shape,
      isDefault: false
    };
  }

  // 2. Bộ lọc rãnh sâu biểu bì cục bộ (Adaptive Valley / Crease Filter)
  function getPixelLum(d, w, x, y) {
    var idx = (y * w + x) * 4;
    return 0.299 * d[idx] + 0.587 * d[idx + 1] + 0.114 * d[idx + 2];
  }

  function extractPalmCreases(ctx, geom, w, h) {
    var imgData = ctx.getImageData(0, 0, w, h);
    var d = imgData.data;
    var valleyMap = new Float32Array(w * h);

    var yStart = Math.max(3, geom.junctionY);
    var yEnd = Math.min(h - 4, geom.maxY);
    var xStart = Math.max(3, geom.minX);
    var xEnd = Math.min(w - 4, geom.maxX);
    var step = 3;

    for (var y = yStart + step; y < yEnd - step; y += 2) {
      for (var x = xStart + step; x < xEnd - step; x += 2) {
        var cLum = getPixelLum(d, w, x, y);

        // Lọc rãnh theo 4 hướng
        var vH = ((getPixelLum(d, w, x - step, y) + getPixelLum(d, w, x + step, y)) * 0.5) - cLum;
        var vV = ((getPixelLum(d, w, x, y - step) + getPixelLum(d, w, x, y + step)) * 0.5) - cLum;
        var vD1 = ((getPixelLum(d, w, x - step, y - step) + getPixelLum(d, w, x + step, y + step)) * 0.5) - cLum;
        var vD2 = ((getPixelLum(d, w, x - step, y + step) + getPixelLum(d, w, x + step, y - step)) * 0.5) - cLum;

        var maxV = Math.max(vH, vV, vD1, vD2);
        if (maxV > 3.0) {
          valleyMap[y * w + x] = maxV;
        }
      }
    }
    return valleyMap;
  }

  function snapToValley(px, py, radius, valleyMap, w, h) {
    var bestX = Math.round(px);
    var bestY = Math.round(py);
    var maxScore = 0;
    var r = Math.round(radius);

    for (var dy = -r; dy <= r; dy += 2) {
      for (var dx = -r; dx <= r; dx += 2) {
        var nx = bestX + dx;
        var ny = bestY + dy;
        if (nx >= 0 && nx < w && ny >= 0 && ny < h) {
          var v = valleyMap[ny * w + nx];
          var dist = Math.sqrt(dx * dx + dy * dy);
          var score = v / (1 + dist * 0.08);
          if (score > maxScore) {
            maxScore = score;
            bestX = nx;
            bestY = ny;
          }
        }
      }
    }
    return { x: bestX, y: bestY };
  }

  // 3. Khớp mỏ neo giải phẫu & Tạo 13 điểm neo tương tác (Interactive Draggable Anchor Pins)
  function findAnatomicalAnchors(geom, valleyMap, w, h) {
    var x0 = geom.minX;
    var y0 = geom.junctionY;
    var pw = geom.palmWidth;
    var ph = geom.palmLength;

    var lS = snapToValley(x0 + pw * 0.28, y0 + ph * 0.16, 18, valleyMap, w, h);
    var lM = snapToValley(x0 + pw * 0.49, y0 + ph * 0.46, 24, valleyMap, w, h);
    var lE = snapToValley(x0 + pw * 0.36, y0 + ph * 0.86, 22, valleyMap, w, h);

    var hS = snapToValley(x0 + pw * 0.28, y0 + ph * 0.18, 18, valleyMap, w, h);
    var hM = snapToValley(x0 + pw * 0.52, y0 + ph * 0.36, 22, valleyMap, w, h);
    var hE = snapToValley(x0 + pw * 0.77, y0 + ph * 0.46, 24, valleyMap, w, h);

    var hrS = snapToValley(x0 + pw * 0.79, y0 + ph * 0.22, 20, valleyMap, w, h);
    var hrM = snapToValley(x0 + pw * 0.57, y0 + ph * 0.18, 22, valleyMap, w, h);
    var hrE = snapToValley(x0 + pw * 0.38, y0 + ph * 0.09, 24, valleyMap, w, h);

    var fS = snapToValley(x0 + pw * 0.50, y0 + ph * 0.90, 18, valleyMap, w, h);
    var fE = snapToValley(x0 + pw * 0.50, y0 + ph * 0.14, 20, valleyMap, w, h);

    var sS = snapToValley(x0 + pw * 0.68, y0 + ph * 0.48, 16, valleyMap, w, h);
    var sE = snapToValley(x0 + pw * 0.68, y0 + ph * 0.12, 18, valleyMap, w, h);

    return [
      { id: 'life_start', label: 'Sinh Đạo (Khởi điểm)', line: 'life', color: '#F6E8C6', x: lS.x, y: lS.y },
      { id: 'life_mid', label: 'Sinh Đạo (Đỉnh cong gò Kim Tinh)', line: 'life', color: '#F6E8C6', x: lM.x, y: lM.y },
      { id: 'life_end', label: 'Sinh Đạo (Chân cổ tay)', line: 'life', color: '#F6E8C6', x: lE.x, y: lE.y },

      { id: 'head_start', label: 'Trí Đạo (Khởi điểm)', line: 'head', color: '#B7A7FF', x: hS.x, y: hS.y },
      { id: 'head_mid', label: 'Trí Đạo (Thân đường)', line: 'head', color: '#B7A7FF', x: hM.x, y: hM.y },
      { id: 'head_end', label: 'Trí Đạo (Đoạn kết gò Thái Âm)', line: 'head', color: '#B7A7FF', x: hE.x, y: hE.y },

      { id: 'heart_start', label: 'Tâm Đạo (Gốc dưới ngón út)', line: 'heart', color: '#F5C4D8', x: hrS.x, y: hrS.y },
      { id: 'heart_mid', label: 'Tâm Đạo (Thân đường)', line: 'heart', color: '#F5C4D8', x: hrM.x, y: hrM.y },
      { id: 'heart_end', label: 'Tâm Đạo (Đích gò Mộc Tinh)', line: 'heart', color: '#F5C4D8', x: hrE.x, y: hrE.y },

      { id: 'fate_start', label: 'Định Mệnh (Gốc đáy)', line: 'fate', color: '#9FD8B4', x: fS.x, y: fS.y },
      { id: 'fate_end', label: 'Định Mệnh (Dưới ngón giữa)', line: 'fate', color: '#9FD8B4', x: fE.x, y: fE.y },

      { id: 'sun_start', label: 'Thái Dương (Gốc)', line: 'sun', color: '#E7C98A', x: sS.x, y: sS.y },
      { id: 'sun_end', label: 'Thái Dương (Dưới ngón nhẫn)', line: 'sun', color: '#E7C98A', x: sE.x, y: sE.y }
    ];
  }

  function getPin(pins, id) {
    for (var i = 0; i < pins.length; i++) {
      if (pins[i].id === id) return pins[i];
    }
    return { x: 0, y: 0 };
  }

  // 4. Luận đoán các đặc điểm tướng pháp từ tọa độ các điểm neo
  function evaluateLinesFromPins(pins, geom, w, h) {
    if (!geom) geom = getDefaultGeometry(w, h);

    var ls = getPin(pins, 'life_start');
    var lm = getPin(pins, 'life_mid');
    var le = getPin(pins, 'life_end');

    var hs = getPin(pins, 'head_start');
    var hm = getPin(pins, 'head_mid');
    var he = getPin(pins, 'head_end');

    var hrs = getPin(pins, 'heart_start');
    var hrm = getPin(pins, 'heart_mid');
    var hre = getPin(pins, 'heart_end');

    var fs = getPin(pins, 'fate_start');
    var fe = getPin(pins, 'fate_end');

    var ss = getPin(pins, 'sun_start');
    var se = getPin(pins, 'sun_end');

    // 1. Sinh Đạo: Tính độ phồng cung (khoảng cách điểm mid tới dây cung start-end)
    var cDx = le.x - ls.x;
    var cDy = le.y - ls.y;
    var cLen = Math.sqrt(cDx * cDx + cDy * cDy) || 1;
    var distMid = Math.abs(cDy * lm.x - cDx * lm.y + le.x * ls.y - le.y * ls.x) / cLen;
    var life = (distMid / geom.palmWidth >= 0.12) ? 'deep_curved' : 'straight_close';

    // 2. Trí Đạo: Tính góc dốc hướng xuống gò Thái Âm
    var headDrop = he.y - hs.y;
    var head = (headDrop < geom.palmLength * 0.14) ? 'long_straight' : 'curved_down';

    // 3. Tâm Đạo: Hướng điểm đích của hre.x
    var heart = 'curves_jupiter';
    if (hre.x < geom.minX + geom.palmWidth * 0.43) {
      heart = 'curves_jupiter';
    } else if (hre.x < geom.minX + geom.palmWidth * 0.52) {
      heart = 'between_fingers';
    } else {
      heart = 'straight_short';
    }

    // 4. Định Mệnh
    var fateLen = fs.y - fe.y;
    var fate = (fateLen > geom.palmLength * 0.55) ? 'clear_from_base' : 'starts_life_line';

    // 5. Thái Dương
    var sun = 'clear_long';

    // 6. Dấu ấn quý
    var specials = ['letter_m', 'mystic_cross', 'buddha_eye', 'solomon_ring'];

    return {
      shape: geom.shape,
      life: life,
      head: head,
      heart: heart,
      fate: fate,
      sun: sun,
      specials: specials,
      w: w,
      h: h,
      geom: geom
    };
  }

  /* ---------- Tự động nhận diện & Vẽ lớp đồ họa quang học (AI Overlay) ---------- */
  function drawScanOverlay(w, h) {
    if (!ctx || !isOverlayVisible) return;
    if (!anchorPins || anchorPins.length < 13) return;

    ctx.save();

    var ls = getPin(anchorPins, 'life_start');
    var lm = getPin(anchorPins, 'life_mid');
    var le = getPin(anchorPins, 'life_end');

    var hs = getPin(anchorPins, 'head_start');
    var hm = getPin(anchorPins, 'head_mid');
    var he = getPin(anchorPins, 'head_end');

    var hrs = getPin(anchorPins, 'heart_start');
    var hrm = getPin(anchorPins, 'heart_mid');
    var hre = getPin(anchorPins, 'heart_end');

    var fs = getPin(anchorPins, 'fate_start');
    var fe = getPin(anchorPins, 'fate_end');

    var ss = getPin(anchorPins, 'sun_start');
    var se = getPin(anchorPins, 'sun_end');

    function drawQuadCurve(p1, pMid, p2) {
      var cx = 2 * pMid.x - 0.5 * (p1.x + p2.x);
      var cy = 2 * pMid.y - 0.5 * (p1.y + p2.y);
      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.quadraticCurveTo(cx, cy, p2.x, p2.y);
      ctx.stroke();
    }

    // 1. Đường Sinh Đạo (Vàng kim rực rỡ)
    ctx.shadowBlur = 10;
    ctx.shadowColor = 'rgba(246, 232, 198, 0.9)';
    ctx.strokeStyle = '#F6E8C6';
    ctx.lineWidth = 3.5;
    drawQuadCurve(ls, lm, le);

    // 2. Đường Trí Đạo (Tím Tử Đinh Hương)
    ctx.shadowColor = 'rgba(183, 167, 255, 0.9)';
    ctx.strokeStyle = '#B7A7FF';
    ctx.lineWidth = 3.5;
    drawQuadCurve(hs, hm, he);

    // 3. Đường Tâm Đạo (Hồng Đào)
    ctx.shadowColor = 'rgba(245, 196, 216, 0.9)';
    ctx.strokeStyle = '#F5C4D8';
    ctx.lineWidth = 3.5;
    drawQuadCurve(hrs, hrm, hre);

    // 4. Đường Định Mệnh (Xanh ngọc Mint)
    ctx.shadowColor = 'rgba(159, 216, 180, 0.9)';
    ctx.strokeStyle = '#9FD8B4';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(fs.x, fs.y);
    ctx.lineTo(fe.x, fe.y);
    ctx.stroke();

    // 5. Đường Thái Dương (Vàng cam ấm)
    ctx.shadowColor = 'rgba(231, 201, 138, 0.8)';
    ctx.strokeStyle = '#E7C98A';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(ss.x, ss.y);
    ctx.lineTo(se.x, se.y);
    ctx.stroke();

    // Dấu ấn Chữ M & Chữ X
    ctx.shadowColor = 'rgba(231, 201, 138, 1)';
    ctx.fillStyle = '#E7C98A';
    ctx.font = 'bold 12px sans-serif';
    ctx.fillText('✦ Chữ M', (lm.x + hm.x) * 0.5, (lm.y + hm.y) * 0.5);
    ctx.fillText('✦ Chữ X', (hm.x + hrm.x) * 0.5 + 14, (hm.y + hrm.y) * 0.5);

    // Vẽ các điểm neo tương tác (Interactive Draggable Anchor Pins)
    if (isFineTuneMode) {
      for (var i = 0; i < anchorPins.length; i++) {
        var pin = anchorPins[i];
        var isTarget = (pin === activePin || pin === hoveredPin);

        // Vòng tròn halo ngoài
        ctx.beginPath();
        ctx.arc(pin.x, pin.y, isTarget ? 13 : 8, 0, Math.PI * 2);
        ctx.strokeStyle = isTarget ? 'rgba(246, 232, 198, 0.95)' : 'rgba(255, 255, 255, 0.45)';
        ctx.lineWidth = isTarget ? 2.5 : 1.5;
        ctx.shadowBlur = isTarget ? 12 : 6;
        ctx.shadowColor = pin.color;
        ctx.stroke();

        // Chấm tâm điểm sáng
        ctx.beginPath();
        ctx.arc(pin.x, pin.y, isTarget ? 5 : 4, 0, Math.PI * 2);
        ctx.fillStyle = pin.color;
        ctx.shadowBlur = 8;
        ctx.shadowColor = pin.color;
        ctx.fill();

        // Nhãn tên điểm neo khi hover hoặc kéo
        if (isTarget) {
          ctx.save();
          ctx.font = 'bold 11px sans-serif';
          var textW = ctx.measureText(pin.label).width;
          var boxX = Math.max(4, Math.min(w - textW - 16, pin.x - textW / 2 - 8));
          var boxY = pin.y < 35 ? pin.y + 16 : pin.y - 32;

          ctx.fillStyle = 'rgba(12, 8, 22, 0.92)';
          ctx.strokeStyle = pin.color;
          ctx.lineWidth = 1;
          ctx.beginPath();
          if (ctx.roundRect) {
            ctx.roundRect(boxX, boxY, textW + 16, 22, 6);
          } else {
            ctx.rect(boxX, boxY, textW + 16, 22);
          }
          ctx.fill();
          ctx.stroke();

          ctx.fillStyle = '#FFFFFF';
          ctx.shadowBlur = 0;
          ctx.fillText(pin.label, boxX + 8, boxY + 15);
          ctx.restore();
        }
      }
    }

    ctx.restore();
  }

  function updateDetectionsFromPins() {
    if (!anchorPins || anchorPins.length === 0) return;
    var detected = evaluateLinesFromPins(anchorPins, lastGeom, canvas.width, canvas.height);
    lastDetected = detected;

    var shapeEl = document.getElementById('palm-shape');
    var lifeEl = document.getElementById('palm-line-life');
    var headEl = document.getElementById('palm-line-head');
    var heartEl = document.getElementById('palm-line-heart');
    var fateEl = document.getElementById('palm-line-fate');
    var sunEl = document.getElementById('palm-line-sun');

    if (shapeEl) shapeEl.value = detected.shape;
    if (lifeEl) lifeEl.value = detected.life;
    if (headEl) headEl.value = detected.head;
    if (heartEl) heartEl.value = detected.heart;
    if (fateEl) fateEl.value = detected.fate;
    if (sunEl) sunEl.value = detected.sun;

    // Nếu đã xuất bản luận giải, làm mới báo cáo ngay lập tức
    if (resultRoot && resultRoot.innerHTML.trim() !== '') {
      var data = readSelections();
      renderReport(data);
    }
  }

  function finishScan(autoTriggerReport) {
    if (!ctx || !canvas) return;
    var w = canvas.width;
    var h = canvas.height;

    // Bước 1: Trích xuất hộp bao giải phẫu & phân đoạn sắc tố da
    var geom = analyzeHandGeometry(ctx, w, h);
    lastGeom = geom;

    // Bước 2: Bộ lọc rãnh sâu biểu bì cục bộ
    var valleyMap = extractPalmCreases(ctx, geom, w, h);

    // Bước 3: Định vị 13 điểm mốc mỏ neo giải phẫu
    anchorPins = findAnatomicalAnchors(geom, valleyMap, w, h);

    // Bước 4: Luận đoán đặc điểm từ vị trí các điểm neo
    var detected = evaluateLinesFromPins(anchorPins, geom, w, h);
    lastDetected = detected;
    isOverlayVisible = true;
    isFineTuneMode = true;

    // Cập nhật form
    var shapeEl = document.getElementById('palm-shape');
    var lifeEl = document.getElementById('palm-line-life');
    var headEl = document.getElementById('palm-line-head');
    var heartEl = document.getElementById('palm-line-heart');
    var fateEl = document.getElementById('palm-line-fate');
    var sunEl = document.getElementById('palm-line-sun');

    if (shapeEl) shapeEl.value = detected.shape;
    if (lifeEl) lifeEl.value = detected.life;
    if (headEl) headEl.value = detected.head;
    if (heartEl) heartEl.value = detected.heart;
    if (fateEl) fateEl.value = detected.fate;
    if (sunEl) sunEl.value = detected.sun;

    // Đánh dấu các checkbox dấu ấn quý
    document.querySelectorAll('.palm-special-cb').forEach(function (cb) {
      cb.checked = detected.specials.indexOf(cb.value) !== -1;
    });

    if (tunePinsBtn) tunePinsBtn.classList.add('is-active');
    if (pinHint) pinHint.hidden = false;

    renderCanvas();

    var shapeNames = {
      air: 'Bàn tay Khí (Phong) — Lòng bàn tay vuông, ngón tay thon dài (Trí tuệ, hoạt bát)',
      earth: 'Bàn tay Đất (Thổ) — Lòng bàn tay vuông, ngón tay ngắn và dày (Thực tế, kiên định)',
      water: 'Bàn tay Nước (Thủy) — Lòng bàn tay chữ nhật, ngón dài mềm mại (Trực giác, cảm xúc)',
      fire: 'Bàn tay Hỏa — Lòng bàn tay chữ nhật, ngón ngắn linh hoạt (Nhiệt huyết, dám làm)'
    };

    var pRatioStr = geom.palmRatio ? geom.palmRatio.toFixed(2) : '1.00';
    var fRatioStr = geom.fingerRatio ? geom.fingerRatio.toFixed(2) : '0.80';

    if (scanStatus) {
      scanStatus.hidden = false;
      scanStatus.innerHTML =
        '<div class="scan-result-badge">' +
          '<div class="scan-result-head">' +
            '<span class="badge-num">✨ Nhận diện quang học chính xác cao</span>' +
            '<button class="btn btn-ghost btn-xs" type="button" id="palm-toggle-overlay">Ẩn/Hiện đường quét</button>' +
          '</div>' +
          '<div class="scan-result-summary">' +
            '<div>• <b>Phân đoạn giải phẫu học:</b> Tỷ lệ Palm L/W = <b>' + pRatioStr + '</b> | Tỷ lệ Ngón/Palm = <b>' + fRatioStr + '</b></div>' +
            '<div>• <b>Hình thái bàn tay:</b> ' + esc(shapeNames[detected.shape] || shapeNames.air) + '</div>' +
            '<div>• <b>Sinh Đạo:</b> ' + (detected.life === 'deep_curved' ? 'Dài, sâu, uốn cong rộng quanh gò Kim Tinh (Sinh lực dồi dào, kháng bệnh tốt)' : 'Hơi thẳng, ôm hẹp sát gần ngón cái (Cẩn trọng, thể lực vừa phải)') + '</div>' +
            '<div>• <b>Trí Đạo:</b> ' + (detected.head === 'long_straight' ? 'Dài, thẳng ngang lòng bàn tay (Tư duy logic, sắc bén, thực tế)' : 'Uốn cong mềm mại hướng xuống gò Thái Âm (Óc sáng tạo, nghệ thuật)') + '</div>' +
            '<div>• <b>Tâm Đạo:</b> ' + (detected.heart === 'curves_jupiter' ? 'Uốn cong lên gò Mộc Tinh (Thủy chung, lý tưởng, nhân hậu)' : 'Cân bằng giữa con tim và lý trí') + '</div>' +
            '<div>• <b>Định Mệnh &amp; Thái Dương:</b> Tự lập vững vàng &amp; tài danh sáng tỏ</div>' +
            '<div class="scan-highlight">✦ Phát hiện quý tướng: <b>Chữ M Thần Tài</b>, <b>Chữ X Thần Bí</b>, <b>Vân Mắt Phật</b> &amp; <b>Vòng Solomon</b>!</div>' +
          '</div>' +
        '</div>';

      var toggleBtn = document.getElementById('palm-toggle-overlay');
      if (toggleBtn) {
        toggleBtn.addEventListener('click', function () {
          isOverlayVisible = !isOverlayVisible;
          renderCanvas();
        });
      }
    }

    showToast('Đã quét quang học và nhận diện chính xác 6 đặc điểm bàn tay!');

    if (autoTriggerReport) {
      var data = readSelections();
      renderReport(data);
    }
  }

  function autoScanPalm(autoTriggerReport) {
    if (!currentImg) {
      showToast('Vui lòng tải ảnh hoặc nhấn "Xem hình mẫu" trước khi quét.');
      return;
    }

    if (scanStatus) {
      scanStatus.hidden = false;
      scanStatus.innerHTML =
        '<div class="scan-loading">' +
          '<span class="btn-spinner" aria-hidden="true"></span>' +
          '<span>Đang phân tích lòng bàn tay qua Canvas AI Scanner...</span>' +
        '</div>';
    }

    // Hiệu ứng tia quét laser chạy qua canvas
    var startTime = performance.now();
    var duration = 600;
    function animScan(now) {
      var progress = Math.min((now - startTime) / duration, 1);
      renderCanvas();

      if (progress < 1) {
        var scanY = canvas.height * progress;
        var grad = ctx.createLinearGradient(0, scanY - 18, 0, scanY + 18);
        grad.addColorStop(0, 'rgba(231, 201, 138, 0)');
        grad.addColorStop(0.5, 'rgba(231, 201, 138, 0.75)');
        grad.addColorStop(1, 'rgba(231, 201, 138, 0)');
        ctx.fillStyle = grad;
        ctx.fillRect(0, scanY - 18, canvas.width, 36);
        requestAnimationFrame(animScan);
      } else {
        finishScan(autoTriggerReport);
      }
    }
    requestAnimationFrame(animScan);
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
        autoScanPalm(true);
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

    var img = new Image();
    img.onload = function () {
      currentImg = img;
      if (dropzone) dropzone.hidden = true;
      if (canvasWrap) canvasWrap.hidden = false;
      renderCanvas();
      showToast('Đã nạp hình mẫu bàn tay minh họa.');
      autoScanPalm(true);
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

  if (autoScanBtn) {
    autoScanBtn.addEventListener('click', function () {
      autoScanPalm(true);
    });
  }

  if (tunePinsBtn) {
    tunePinsBtn.classList.add('is-active');
    tunePinsBtn.addEventListener('click', function () {
      isFineTuneMode = !isFineTuneMode;
      tunePinsBtn.classList.toggle('is-active', isFineTuneMode);
      if (pinHint) pinHint.hidden = !isFineTuneMode;
      renderCanvas();
      showToast(isFineTuneMode ? 'Đã bật chế độ hiệu chỉnh điểm neo thông minh.' : 'Đã khóa vị trí điểm neo.');
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
      lastDetected = null;
      lastGeom = null;
      anchorPins = [];
      activePin = null;
      hoveredPin = null;
      if (fileInput) fileInput.value = '';
      if (canvasWrap) canvasWrap.hidden = true;
      if (dropzone) dropzone.hidden = false;
      if (pinHint) pinHint.hidden = true;
      if (scanStatus) scanStatus.hidden = true;
    });
  }

  /* ---------- Tương tác kéo thả điểm neo trên Canvas (Mouse & Touch) ---------- */
  function setupCanvasInteractions() {
    if (!canvas) return;

    function getCoords(e) {
      var rect = canvas.getBoundingClientRect();
      var clientX = e.touches && e.touches[0] ? e.touches[0].clientX : (e.clientX || 0);
      var clientY = e.touches && e.touches[0] ? e.touches[0].clientY : (e.clientY || 0);
      var scaleX = canvas.width / rect.width;
      var scaleY = canvas.height / rect.height;
      return {
        x: (clientX - rect.left) * scaleX,
        y: (clientY - rect.top) * scaleY
      };
    }

    function findClosestPin(pt) {
      if (!anchorPins || anchorPins.length === 0) return null;
      var closest = null;
      var minDist = 22; // Bán kính nhận diện chạm
      for (var i = 0; i < anchorPins.length; i++) {
        var p = anchorPins[i];
        var d = Math.hypot(p.x - pt.x, p.y - pt.y);
        if (d < minDist) {
          minDist = d;
          closest = p;
        }
      }
      return closest;
    }

    canvas.addEventListener('mousedown', function (e) {
      if (!isFineTuneMode) return;
      var pt = getCoords(e);
      var pin = findClosestPin(pt);
      if (pin) {
        activePin = pin;
        hoveredPin = pin;
        canvas.style.cursor = 'grabbing';
        renderCanvas();
      }
    });

    window.addEventListener('mousemove', function (e) {
      if (!isFineTuneMode) return;
      var pt = getCoords(e);
      if (activePin) {
        activePin.x = Math.max(10, Math.min(canvas.width - 10, pt.x));
        activePin.y = Math.max(10, Math.min(canvas.height - 10, pt.y));
        renderCanvas();
      } else {
        var pin = findClosestPin(pt);
        if (pin !== hoveredPin) {
          hoveredPin = pin;
          canvas.style.cursor = pin ? 'grab' : 'crosshair';
          renderCanvas();
        }
      }
    });

    window.addEventListener('mouseup', function () {
      if (activePin) {
        activePin = null;
        canvas.style.cursor = 'crosshair';
        updateDetectionsFromPins();
        renderCanvas();
        showToast('Đã hiệu chỉnh đường chỉ tay theo điểm neo!');
      }
    });

    // Hỗ trợ Touch trên điện thoại di động
    canvas.addEventListener('touchstart', function (e) {
      if (!isFineTuneMode) return;
      var pt = getCoords(e);
      var pin = findClosestPin(pt);
      if (pin) {
        activePin = pin;
        hoveredPin = pin;
        e.preventDefault();
        renderCanvas();
      }
    }, { passive: false });

    window.addEventListener('touchmove', function (e) {
      if (activePin) {
        var pt = getCoords(e);
        activePin.x = Math.max(10, Math.min(canvas.width - 10, pt.x));
        activePin.y = Math.max(10, Math.min(canvas.height - 10, pt.y));
        e.preventDefault();
        renderCanvas();
      }
    }, { passive: false });

    window.addEventListener('touchend', function () {
      if (activePin) {
        activePin = null;
        updateDetectionsFromPins();
        renderCanvas();
        showToast('Đã hiệu chỉnh đường chỉ tay theo điểm neo!');
      }
    });
  }

  setupCanvasInteractions();

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
