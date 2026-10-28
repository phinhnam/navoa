/* Thiên Số — Kinh Dịch: bát quái, lập quẻ Mai Hoa, thể–dụng
   Quy ước: hào vẽ từ dưới lên (hào 1 → hào 6), 1 = dương, 0 = âm.
   Số Tiên thiên: Càn 1, Đoài 2, Ly 3, Chấn 4, Tốn 5, Khảm 6, Cấn 7, Khôn 8. */
(function () {
  'use strict';

  var TRIGRAMS = {
    Can: {
      key: 'Can', name: 'Càn', han: '乾', symbol: '☰', lines: [1, 1, 1],
      element: 'Kim', direction: 'Tây Bắc', family: 'Cha', prior: 1,
      image: 'Trời', quality: 'Cương kiện, sáng tạo, khởi đầu'
    },
    Doai: {
      key: 'Doai', name: 'Đoài', han: '兌', symbol: '☱', lines: [1, 1, 0],
      element: 'Kim', direction: 'Chính Tây', family: 'Thiếu nữ', prior: 2,
      image: 'Đầm', quality: 'Vui vẻ, giao tiếp, phản chiếu'
    },
    Ly: {
      key: 'Ly', name: 'Ly', han: '離', symbol: '☲', lines: [1, 0, 1],
      element: 'Hỏa', direction: 'Chính Nam', family: 'Trung nữ', prior: 3,
      image: 'Lửa', quality: 'Sáng rõ, bám víu, nhận thức'
    },
    Chan: {
      key: 'Chan', name: 'Chấn', han: '震', symbol: '☳', lines: [1, 0, 0],
      element: 'Mộc', direction: 'Chính Đông', family: 'Trưởng nam', prior: 4,
      image: 'Sấm', quality: 'Chấn động, thức tỉnh, hành động'
    },
    Ton: {
      key: 'Ton', name: 'Tốn', han: '巽', symbol: '☴', lines: [0, 1, 1],
      element: 'Mộc', direction: 'Đông Nam', family: 'Trưởng nữ', prior: 5,
      image: 'Gió', quality: 'Thẩm thấu, mềm mỏng, lan tỏa'
    },
    Kham: {
      key: 'Kham', name: 'Khảm', han: '坎', symbol: '☵', lines: [0, 1, 0],
      element: 'Thủy', direction: 'Chính Bắc', family: 'Trung nam', prior: 6,
      image: 'Nước', quality: 'Hiểm, sâu, trôi chảy và thích nghi'
    },
    Can2: {
      key: 'Can2', name: 'Cấn', han: '艮', symbol: '☶', lines: [0, 0, 1],
      element: 'Thổ', direction: 'Đông Bắc', family: 'Thiếu nam', prior: 7,
      image: 'Núi', quality: 'Dừng lại, ổn định, giới hạn'
    },
    Khon: {
      key: 'Khon', name: 'Khôn', han: '坤', symbol: '☷', lines: [0, 0, 0],
      element: 'Thổ', direction: 'Tây Nam', family: 'Mẹ', prior: 8,
      image: 'Đất', quality: 'Tiếp nhận, nuôi dưỡng, bền bỉ'
    }
  };

  var PRIOR = {};
  var BY_NAME = {};
  Object.keys(TRIGRAMS).forEach(function (k) {
    var t = TRIGRAMS[k];
    PRIOR[t.prior] = t;
    BY_NAME[t.name] = t;
  });

  /* 64 quẻ theo thứ tự Văn Vương: [số, tên quái hạ (nội), tên quái thượng (ngoại)] */
  var HEX_STRUCT = [
    [1, 'Càn', 'Càn'], [2, 'Khôn', 'Khôn'],
    [3, 'Chấn', 'Khảm'], [4, 'Khảm', 'Cấn'],
    [5, 'Càn', 'Khảm'], [6, 'Khảm', 'Càn'],
    [7, 'Khảm', 'Khôn'], [8, 'Khôn', 'Khảm'],
    [9, 'Càn', 'Tốn'], [10, 'Đoài', 'Càn'],
    [11, 'Càn', 'Khôn'], [12, 'Khôn', 'Càn'],
    [13, 'Ly', 'Càn'], [14, 'Càn', 'Ly'],
    [15, 'Cấn', 'Khôn'], [16, 'Khôn', 'Chấn'],
    [17, 'Chấn', 'Đoài'], [18, 'Tốn', 'Cấn'],
    [19, 'Đoài', 'Khôn'], [20, 'Khôn', 'Tốn'],
    [21, 'Chấn', 'Ly'], [22, 'Ly', 'Cấn'],
    [23, 'Khôn', 'Cấn'], [24, 'Chấn', 'Khôn'],
    [25, 'Chấn', 'Càn'], [26, 'Càn', 'Cấn'],
    [27, 'Chấn', 'Cấn'], [28, 'Tốn', 'Đoài'],
    [29, 'Khảm', 'Khảm'], [30, 'Ly', 'Ly'],
    [31, 'Cấn', 'Đoài'], [32, 'Tốn', 'Chấn'],
    [33, 'Cấn', 'Càn'], [34, 'Càn', 'Chấn'],
    [35, 'Khôn', 'Ly'], [36, 'Ly', 'Khôn'],
    [37, 'Ly', 'Tốn'], [38, 'Đoài', 'Ly'],
    [39, 'Cấn', 'Khảm'], [40, 'Khảm', 'Chấn'],
    [41, 'Đoài', 'Cấn'], [42, 'Chấn', 'Tốn'],
    [43, 'Càn', 'Đoài'], [44, 'Tốn', 'Càn'],
    [45, 'Khôn', 'Đoài'], [46, 'Tốn', 'Khôn'],
    [47, 'Khảm', 'Đoài'], [48, 'Tốn', 'Khảm'],
    [49, 'Ly', 'Đoài'], [50, 'Tốn', 'Ly'],
    [51, 'Chấn', 'Chấn'], [52, 'Cấn', 'Cấn'],
    [53, 'Cấn', 'Tốn'], [54, 'Đoài', 'Chấn'],
    [55, 'Ly', 'Chấn'], [56, 'Cấn', 'Ly'],
    [57, 'Tốn', 'Tốn'], [58, 'Đoài', 'Đoài'],
    [59, 'Khảm', 'Tốn'], [60, 'Đoài', 'Khảm'],
    [61, 'Đoài', 'Tốn'], [62, 'Cấn', 'Chấn'],
    [63, 'Ly', 'Khảm'], [64, 'Khảm', 'Ly']
  ];

  var BY_BINARY = {};
  var STRUCT = {};

  function lower(t) { return TRIGRAMS[t].lines; }

  function pull(t) { return TRIGRAMS[t].lines; }

  HEX_STRUCT.forEach(function (row) {
    var n = row[0];
    var lo = BY_NAME[row[1]].key;
    var up = BY_NAME[row[2]].key;
    var lines = pull(lo).concat(pull(up));
    STRUCT[n] = {
      number: n,
      lower: lo,
      upper: up,
      lowerName: TRIGRAMS[lo].name,
      upperName: TRIGRAMS[up].name,
      lines: lines,
      binary: lines.join(''),
      fullName: TRIGRAMS[up].name + ' ' + TRIGRAMS[lo].name
    };
    BY_BINARY[lines.join('')] = n;
  });

  function hexByLines(lines) {
    return BY_BINARY[lines.join('')] || null;
  }

  /* Quẻ hỗ: hào 2-3-4 làm hạ quái, hào 3-4-5 làm thượng quái */
  function mutualLines(lines) {
    return [lines[1], lines[2], lines[3], lines[2], lines[3], lines[4]];
  }

  function changedLines(lines, moving) {
    var out = lines.slice();
    out[moving - 1] = out[moving - 1] ? 0 : 1;
    return out;
  }

  var SHENG = { 'Mộc': 'Hỏa', 'Hỏa': 'Thổ', 'Thổ': 'Kim', 'Kim': 'Thủy', 'Thủy': 'Mộc' };
  var KE = { 'Mộc': 'Thổ', 'Thổ': 'Thủy', 'Thủy': 'Hỏa', 'Hỏa': 'Kim', 'Kim': 'Mộc' };

  /* Quan hệ giữa quẻ Dụng (sự việc) và quẻ Thể (bản thân) */
  function relation(theEl, dungEl) {
    if (theEl === dungEl) {
      return {
        code: 'hoa', label: 'Thể Dụng tương hòa', tone: 'good',
        text: 'Thể và Dụng cùng hành ' + theEl + '. Việc và người đồng nhịp: dễ thuận, nhưng cũng dễ cùng một điểm yếu. Giữ được sự tỉnh táo thì kết quả bền.'
      };
    }
    if (SHENG[dungEl] === theEl) {
      return {
        code: 'dung-sinh-the', label: 'Dụng sinh Thể', tone: 'great',
        text: 'Dụng (' + dungEl + ') sinh Thể (' + theEl + '). Ngoại cảnh đang nuôi mình: có người giúp, có thời vận đỡ. Nên nhận sự trợ lực và hành động đúng lúc.'
      };
    }
    if (SHENG[theEl] === dungEl) {
      return {
        code: 'the-sinh-dung', label: 'Thể sinh Dụng', tone: 'drain',
        text: 'Thể (' + theEl + ') sinh Dụng (' + dungEl + '). Mình đang cho đi nhiều hơn nhận lại. Kết quả vẫn có nhưng hao tâm sức: cần biết điểm dừng và giữ sức.'
      };
    }
    if (KE[dungEl] === theEl) {
      return {
        code: 'dung-khac-the', label: 'Dụng khắc Thể', tone: 'bad',
        text: 'Dụng (' + dungEl + ') khắc Thể (' + theEl + '). Sự việc đang mạnh hơn người: đừng cố cưỡng. Chờ thời, thu nhỏ mục tiêu, giữ nền trước khi tiến.'
      };
    }
    return {
      code: 'the-khac-dung', label: 'Thể khắc Dụng', tone: 'good',
      text: 'Thể (' + theEl + ') khắc Dụng (' + dungEl + '). Mình đang nắm thế chủ động. Có thể thắng, nhưng cái thắng đó cần được dùng để xây, không phải để áp đặt.'
    };
  }

  function trigramOfLines(lines) {
    var key = null;
    Object.keys(TRIGRAMS).forEach(function (k) {
      if (TRIGRAMS[k].lines.join('') === lines.join('')) key = k;
    });
    return key ? TRIGRAMS[key] : null;
  }

  /**
   * Lập quẻ Mai Hoa theo thời điểm sinh (âm lịch).
   * info: kết quả LUNAR.birthInfo(...)
   */
  function castMaiHoa(info) {
    var chiYear = info.yearChiNumber;
    var m = info.lunar.month;
    var d = info.lunar.day;
    var chiHour = info.hourChiNumber;

    var upperNum = (chiYear + m + d) % 8; if (upperNum === 0) upperNum = 8;
    var lowerNum = (chiYear + m + d + chiHour) % 8; if (lowerNum === 0) lowerNum = 8;
    var moving = (chiYear + m + d + chiHour) % 6; if (moving === 0) moving = 6;

    var upper = PRIOR[upperNum];
    var low = PRIOR[lowerNum];
    var lines = low.lines.concat(upper.lines);
    var primaryNo = hexByLines(lines);
    var mutualNo = hexByLines(mutualLines(lines));
    var changedNo = hexByLines(changedLines(lines, moving));

    var theTri = moving <= 3 ? upper : low;
    var dungTri = moving <= 3 ? low : upper;
    var rel = relation(theTri.element, dungTri.element);

    return {
      upper: upper,
      lower: low,
      upperNum: upperNum,
      lowerNum: lowerNum,
      moving: moving,
      lines: lines,
      primary: primaryNo,
      mutual: mutualNo,
      changed: changedNo,
      the: theTri,
      dung: dungTri,
      movingTrigram: dungTri,
      relation: rel,
      method: {
        chiYear: chiYear,
        lunarMonth: m,
        lunarDay: d,
        chiHour: chiHour,
        upperSum: chiYear + m + d,
        lowerSum: chiYear + m + d + chiHour,
        upperNum: upperNum,
        lowerNum: lowerNum,
        moving: moving
      }
    };
  }

  window.ICHING = Object.assign(window.ICHING || {}, {
    trigrams: TRIGRAMS,
    prior: PRIOR,
    byName: BY_NAME,
    structure: STRUCT,
    hexStruct: HEX_STRUCT,
    castMaiHoa: castMaiHoa,
    hexByLines: hexByLines,
    mutualLines: mutualLines,
    changedLines: changedLines,
    trigramOfLines: trigramOfLines,
    relation: relation,
    sheng: SHENG,
    ke: KE
  });
})();
