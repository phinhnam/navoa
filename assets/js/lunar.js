/* Thiên Số — Âm lịch & Can Chi
   Thuật toán chuyển đổi dựa trên công trình của Hồ Ngọc Đức (amlich),
   dùng cho Mai Hoa Dịch số: ngày/tháng/năm âm lịch + chi năm + chi giờ.
   Mọi tính toán chạy trên máy người dùng, múi giờ mặc định UTC+7. */
(function () {
  'use strict';

  var PI = Math.PI;
  var TZ = 7;

  function INT(d) { return Math.floor(d); }

  function jdFromDate(dd, mm, yy) {
    var a, y, m, jd;
    a = INT((14 - mm) / 12);
    y = yy + 4800 - a;
    m = mm + 12 * a - 3;
    jd = dd + INT((153 * m + 2) / 5) + 365 * y + INT(y / 4) - INT(y / 100) + INT(y / 400) - 32045;
    if (jd < 2299161) {
      jd = dd + INT((153 * m + 2) / 5) + 365 * y + INT(y / 4) - 32083;
    }
    return jd;
  }

  function jdToDate(jd) {
    var a, b, c, d, e, m, day, month, year;
    if (jd > 2299160) {
      a = jd + 32044;
      b = INT((4 * a + 3) / 146097);
      c = a - INT((b * 146097) / 4);
    } else {
      b = 0;
      c = jd + 32082;
    }
    d = INT((4 * c + 3) / 1461);
    e = c - INT((1461 * d) / 4);
    m = INT((5 * e + 2) / 153);
    day = e - INT((153 * m + 2) / 5) + 1;
    month = m + 3 - 12 * INT(m / 10);
    year = b * 100 + d - 4800 + INT(m / 10);
    return [day, month, year];
  }

  function newMoon(k) {
    var T, T2, T3, dr, Jd1, M, Mpr, F, C1, deltat, JdNew;
    T = k / 1236.85;
    T2 = T * T;
    T3 = T2 * T;
    dr = PI / 180;
    Jd1 = 2415020.75933 + 29.53058868 * k + 0.0001178 * T2 - 0.000000155 * T3;
    Jd1 = Jd1 + 0.00033 * Math.sin((166.56 + 132.87 * T - 0.009173 * T2) * dr);
    M = 359.2242 + 29.10535608 * k - 0.0000333 * T2 - 0.00000347 * T3;
    Mpr = 306.0253 + 385.81691806 * k + 0.0107306 * T2 + 0.00001236 * T3;
    F = 21.2964 + 390.67050646 * k - 0.0016528 * T2 - 0.00000239 * T3;
    C1 = (0.1734 - 0.000393 * T) * Math.sin(M * dr) + 0.0021 * Math.sin(2 * dr * M);
    C1 = C1 - 0.4068 * Math.sin(Mpr * dr) + 0.0161 * Math.sin(dr * 2 * Mpr);
    C1 = C1 - 0.0004 * Math.sin(dr * 3 * Mpr);
    C1 = C1 + 0.0104 * Math.sin(dr * 2 * F) - 0.0051 * Math.sin(dr * (M + Mpr));
    C1 = C1 - 0.0074 * Math.sin(dr * (M - Mpr)) + 0.0004 * Math.sin(dr * (2 * F + M));
    C1 = C1 - 0.0004 * Math.sin(dr * (2 * F - M)) - 0.0006 * Math.sin(dr * (2 * F + Mpr));
    C1 = C1 + 0.0010 * Math.sin(dr * (2 * F - Mpr)) + 0.0005 * Math.sin(dr * (2 * Mpr + M));
    if (T < -11) {
      deltat = 0.001 + 0.000839 * T + 0.0002261 * T2 - 0.00000845 * T3 - 0.000000081 * T * T3;
    } else {
      deltat = -0.000278 + 0.000265 * T + 0.000262 * T2;
    }
    JdNew = Jd1 + C1 - deltat;
    return JdNew;
  }

  function sunLongitude(jdn) {
    var T, T2, dr, M, L0, DL, L;
    T = (jdn - 2451545.0) / 36525;
    T2 = T * T;
    dr = PI / 180;
    M = 357.52910 + 35999.05030 * T - 0.0001559 * T2 - 0.00000048 * T * T2;
    L0 = 280.46645 + 36000.76983 * T + 0.0003032 * T2;
    DL = (1.914600 - 0.004817 * T - 0.000014 * T2) * Math.sin(dr * M);
    DL = DL + (0.019993 - 0.000101 * T) * Math.sin(dr * 2 * M) + 0.000290 * Math.sin(dr * 3 * M);
    L = L0 + DL;
    L = L * dr;
    L = L - PI * 2 * (INT(L / (PI * 2)));
    return L;
  }

  function sunLongitudeArc(dayNumber, tz) {
    return INT(sunLongitude(dayNumber - 0.5 - tz / 24) / PI * 6);
  }

  function newMoonDay(k, tz) {
    return INT(newMoon(k) + 0.5 + tz / 24);
  }

  function lunarMonth11(yy, tz) {
    var off, k, nm, sunLong;
    off = jdFromDate(31, 12, yy) - 2415021;
    k = INT(off / 29.530588853);
    nm = newMoonDay(k, tz);
    sunLong = sunLongitudeArc(nm, tz);
    if (sunLong >= 9) {
      nm = newMoonDay(k - 1, tz);
    }
    return nm;
  }

  function leapMonthOffset(a11, tz) {
    var k, last, i, arc;
    k = INT(0.5 + (a11 - 2415021.076998695) / 29.530588853);
    last = 0;
    i = 1;
    arc = sunLongitudeArc(newMoonDay(k + i, tz), tz);
    do {
      last = arc;
      i++;
      arc = sunLongitudeArc(newMoonDay(k + i, tz), tz);
    } while (arc !== last && i < 14);
    return i - 1;
  }

  function solarToLunar(dd, mm, yy, tz) {
    var dayNumber, k, monthStart, a11, b11, lunarDay, lunarMonth, lunarYear,
        lunarLeap, diff, leapMonth;
    tz = typeof tz === 'number' ? tz : TZ;
    dayNumber = jdFromDate(dd, mm, yy);
    k = INT((dayNumber - 2415021.076998695) / 29.530588853);
    monthStart = newMoonDay(k + 1, tz);
    if (monthStart > dayNumber) {
      monthStart = newMoonDay(k, tz);
    }
    a11 = lunarMonth11(yy, tz);
    b11 = a11;
    if (a11 >= monthStart) {
      lunarYear = yy;
      a11 = lunarMonth11(yy - 1, tz);
    } else {
      lunarYear = yy + 1;
      b11 = lunarMonth11(yy + 1, tz);
    }
    lunarDay = dayNumber - monthStart + 1;
    diff = INT((monthStart - a11) / 29);
    lunarLeap = 0;
    lunarMonth = diff + 11;
    if (b11 - a11 > 365) {
      leapMonth = leapMonthOffset(a11, tz);
      if (diff >= leapMonth) {
        lunarMonth = diff + 10;
        if (diff === leapMonth) {
          lunarLeap = 1;
        }
      }
    }
    if (lunarMonth > 12) {
      lunarMonth -= 12;
    }
    if (lunarMonth >= 11 && diff < 4) {
      lunarYear -= 1;
    }
    return {
      day: lunarDay,
      month: lunarMonth,
      year: lunarYear,
      leap: lunarLeap
    };
  }

  var CHI = ['Tý', 'Sửu', 'Dần', 'Mão', 'Thìn', 'Tỵ', 'Ngọ', 'Mùi', 'Thân', 'Dậu', 'Tuất', 'Hợi'];
  var CAN = ['Giáp', 'Ất', 'Bính', 'Đinh', 'Mậu', 'Kỷ', 'Canh', 'Tân', 'Nhâm', 'Quý'];

  function mod(n, m) { return ((n % m) + m) % m; }

  function chiIndex(year) { return mod(year - 4, 12); }
  function canIndex(year) { return mod(year - 4, 10); }

  function canChiYear(year) {
    return CAN[canIndex(year)] + ' ' + CHI[chiIndex(year)];
  }

  function canChiDay(dd, mm, yy) {
    var jd = jdFromDate(dd, mm, yy);
    var idx = mod(jd + 9, 10);
    var chi = mod(jd + 1, 12);
    return CAN[idx] + ' ' + CHI[chi];
  }

  function canChiHour(chiHourIndex) {
    return CAN[0] + ' ' + CHI[mod(chiHourIndex, 12)];
  }

  function canChiHourOfDay(dd, mm, yy, chiHourIndex) {
    var dayCan = mod(jdFromDate(dd, mm, yy) + 9, 10);
    var hourCan = mod((dayCan % 5) * 2 + chiHourIndex, 10);
    return CAN[hourCan] + ' ' + CHI[mod(chiHourIndex, 12)];
  }

  function hourChiFromHour(hour) {
    if (hour === 23 || hour === 0) return 0;
    return INT((hour + 1) / 2) % 12;
  }

  /** Đầy đủ dữ liệu lập quẻ cho một ngày dương lịch + chi giờ (0 = Tý) */
  function birthInfo(dd, mm, yy, chiHour) {
    var lunar = solarToLunar(dd, mm, yy);
    var chiY = chiIndex(lunar.year);
    var chiH = typeof chiHour === 'number' ? mod(chiHour, 12) : null;
    return {
      solar: { day: dd, month: mm, year: yy },
      lunar: lunar,
      yearChiIndex: chiY,
      yearChiNumber: chiY + 1,
      yearChiName: CHI[chiY],
      yearCanChi: canChiYear(lunar.year),
      yearCanChiName: canChiYear(lunar.year),
      dayCanChi: canChiDay(dd, mm, yy),
      hourChiIndex: chiH,
      hourChiNumber: chiH === null ? null : chiH + 1,
      hourChiName: chiH === null ? null : CHI[chiH],
      hourCanChi: chiH === null ? null : canChiHourOfDay(dd, mm, yy, chiH),
      lunarText: lunar.day + '/' + lunar.month + (lunar.leap ? ' nhuận' : '') + '/' + lunar.year,
      solarText: dd + '/' + mm + '/' + yy
    };
  }

  window.LUNAR = {
    CAN: CAN,
    CHI: CHI,
    solarToLunar: solarToLunar,
    birthInfo: birthInfo,
    canChiYear: canChiYear,
    canChiDay: canChiDay,
    canChiHourOfDay: canChiHourOfDay,
    hourChiFromHour: hourChiFromHour,
    chiIndex: chiIndex,
    jdFromDate: jdFromDate,
    jdToDate: jdToDate
  };
})();
