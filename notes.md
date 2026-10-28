# Notes — Thiên Số (Thần số học Pythagore)

## Session 2026-10-28

**Trạng thái:** Chỉ khảo sát codebase. **Không có thay đổi mã nguồn nào** trong session này.
Không có git repo, không có `package.json`, không có build step — site tĩnh chạy trực tiếp.

## Tổng quan dự án

Landing page + công cụ tính lá số thần số học Pythagore và gieo quẻ Mai Hoa (Kinh Dịch),
toàn bộ xử lý phía client, không backend, không lưu dữ liệu ra ngoài máy người dùng.

- Ngôn ngữ nội dung: tiếng Việt (`<html lang="vi">`), theme tối, font Google.
- Mọi tính toán là JS thuần, không framework, không bundler.

## Cấu trúc file

```
index.html                    350 dòng — toàn bộ markup (hero, form, gallery, method, kinh dịch, dialog)
assets/css/styles.css         ~59 KB — toàn bộ style, CSS variables, animation
assets/js/data.js             ~21 KB — window.NUM: nội dung luận giải 8 chỉ số cơ bản
assets/js/data-numbers.js     ~45 KB — window.NUM.numbersDeep: 12 con số, bản chuyên sâu
assets/js/data-cycles.js      ~16 KB — window.NUM.cycles: đỉnh cao, thách thức, nghiệp, mũi tên, bánh diện
assets/js/data-hexagrams.js   ~70 KB — window.ICHING.hexagrams: 64 quẻ
assets/js/lunar.js            ~7.6 KB — window.LUNAR: âm lịch + Can Chi (thuật toán Hồ Ngọc Đức, TZ=7)
assets/js/iching.js           ~9.5 KB — window.ICHING: bát quái, lập quẻ Mai Hoa, Ngũ hành
assets/js/iching-ui.js        ~9.8 KB — UI form gieo quẻ (cast-form → cast-result)
assets/js/app.js              ~52 KB — sao/orb/parallax, tính lá số, render kết quả, dialog, gallery, share
tests/verify.js               regression harness (numerology)
tests/numcheck.js             smoke test (numerology)
tests/lunarcheck.js           regression harness (âm lịch + Mai Hoa + 64 quẻ)
package.json                  test script
```

## Kiến trúc logic

**Thứ tự load bắt buộc** (đã đúng trong `index.html:341-348`):
`data.js` → `data-numbers.js` → `data-cycles.js` → `lunar.js` → `iching.js` →
`data-hexagrams.js` → `app.js` → `iching-ui.js`.

### app.js — luồng thần số học

- `normalizeName` (app.js:337): bỏ dấu tiếng Việt, Đ→D, chỉ giữ A–Z.
- `reduceNum` (app.js:350): rút gọn, giữ master number 11/22/33; `reduceNoMaster` (app.js:454) thì không giữ.
- `computeProfile` (app.js:360): 8 chỉ số cốt lõi (chuẩn Pythagore) — Đường đời (lifePath), Sứ mệnh (destiny), Linh hồn (soul), Nhân cách (personality), Ngày sinh (birthday), Thái độ (attitude), Trưởng thành (maturity), Cân bằng (balance).
- `computeCycles` (app.js:471): 4 đỉnh cao, 4 thách thức, năm cá nhân, chu kỳ 9 năm.
- `renderResults` (app.js:730) + `renderInsights` (app.js:590) đổ vào `#results-root`;
  `coreCard` (app.js:567), `dialogHTML`/`openDialog` (app.js:929/993) cho popup ý nghĩa số.
- `validateAndRun` (app.js:1150) → `runCalc` (app.js:1175) → render + share/URL.
- Share: `resultUrl` (app.js:1250) đọc `?ten=&ngay=`; `saveLast`/`loadLast` dùng localStorage.
- Trang trí: `buildStars`, `drawStars`, `buildOrb`, `initOrbParallax`, `initCursor`, `initTilt`,
  `observeReveals` — đều tôn trọng `prefers-reduced-motion`.

### Kinh Dịch

- `castMaiHoa` (iching.js:181): (chi năm + tháng âm + ngày âm) % 8 → quẻ thượng;
  cộng thêm chi giờ % 8 → quẻ hạ; % 6 → hào động. Suy ra quẻ chủ / hỗ / biến.
- `relation` (iching.js:138): sinh–khắc Ngũ hành giữa Thể và Dụng.
- `solarToLunar` (lunar.js:120) dùng múi giờ cố định TZ=7.

## Cách chạy / kiểm thử

- Mở trực tiếp `index.html`, hoặc `python -m http.server` (không cần thiết vì không fetch file).
- Test tự động: `npm test` (chạy `tests/verify.js`, `tests/numcheck.js`, `tests/lunarcheck.js` — thuần Node, không cần framework).
- Kiểm tra thủ công bằng DevTools console + Edge headless + CDP (các file `cdp-*.js` ở %TEMP%).
- Môi trường shell: Windows PowerShell 5.1. File UTF-8; `Get-Content` hiển thị sai dấu —
  dùng tool Read thay vì PowerShell để đọc nội dung tiếng Việt.

## Session 2026-10-28 (tiếp) — kiểm chứng & sửa lỗi

Kịch bản kiểm chứng tạm (ngoài repo):
`%TEMP%\opencode\numcheck.js` (thần số học) và `lunarcheck.js` (âm lịch + Mai Hoa).

### Kết quả kiểm chứng

- Âm lịch: Tết 2023/2024/2025/2026, Trung thu 2024/2025/2026, Can Chi năm — **khớp**.
- 64 quẻ: đủ trường bắt buộc, `tone` hợp lệ, `hexByLines` round-trip 64/64 **khớp**.
- Mai Hoa: thượng/hạ quái, hào động, Thể–Dụng, quẻ hỗ/biến — **hợp công thức**.
- Thần số học: 29/09/1995 → Đường đời 8, Sứ mệnh 9, Linh hồn 1, Nhân cách 8,
  Ngày sinh 11, Trưởng thành 8, Thái độ 2, Cân bằng 6, Năm cá nhân 2026 = 3 — **khớp tính tay**.

### Đã sửa (assets/js/app.js)

1. **Tuổi đỉnh cao với Đường đời 33** — trước đây `36 - 33 = 3` khiến đỉnh 1 là "0–3 tuổi".
   Thêm `lifePathForAge()`: 33 dùng hệ 33/6 (→ 6, đỉnh 1 kết thúc tuổi 30); 11 và 22 vẫn
   giữ nguyên (25 và 14 tuổi) theo quy ước phổ biến ở VN. Áp dụng cho `computeCycles`
   và dòng phụ đề trong `renderInsights`.
2. **Crash khi tên không có chữ cái** (truy cập `?ten=123&ngay=...` bỏ qua validate):
   `destiny`/`maturity` giờ trả `null` thay vì `0`, nên `coreCard` hiển thị "Chưa đủ dữ liệu";
   đồng thời chặn khởi tạo từ URL nếu tên có dưới 2 chữ cái.
3. **Làm nổi bật số ngày sinh trong bản đồ Lo Shu**    (theo yêu cầu: giữ nguyên cách trộn tần suất):
   - `computeProfile` thêm `dobCounts` (chỉ đếm chữ số ngày/tháng/năm sinh); `counts` vẫn giữ nguyên.
   - Ô có số trong ngày sinh nhận class `is-birth`: viền vàng đậm, số màu vàng sáng, chấm vàng góc trên phải.
   - Panel phụ đề + legend mới ("Chấm vàng = có trong ngày sinh"); `aria-label` đọc rõ
     "x lần, trong đó y lần từ ngày sinh".
   - In ấn: viền 2px + chấm đen để vẫn phân biệt được khi in đen trắng.
   - File: `assets/js/app.js` (computeProfile, renderResults), `assets/css/styles.css`
     (`.loshu-cell.is-birth`, `.loshu-dob`, `.legend-swatch.dob`, print rules).
   - Đã kiểm tra trực quan bằng Edge headless + CDP (ảnh chụp panel Lo Shu).
4. **Mũi tên Lo Shu chỉ tính ngày sinh** — `computeCycles` dùng `profile.dobCounts` thay vì
   `profile.counts`; phụ đề panel đổi thành "Đường đủ và đường trống · chỉ tính ngày sinh".
   Kiểm chứng 29/09/1995: chỉ còn mũi tên Cân bằng 9·5·1 (đủ) và Thực tế 4·3·8 (trống).

### Kiểm tra lại (cùng ngày)

- `node --check` pass cả 8 file JS.
- Harness 6 hồ sơ: `counts = dobCounts + nameCounts`, mũi tên đủ/trống khớp 100% với `dobCounts`,
  các mốc đỉnh cao liền nhau (0→36−LP, mỗi chặng 9 năm, chặng cuối mở), dữ liệu đỉnh/thách thức đủ.
- DOM thật (Edge headless + CDP), 4 kịch bản URL: không exception/console error;
  LP 33 hiển thị 0–30 · 31–39 · 40–48 · 49+; `?ten=123` bị chặn, không render lá số.
- Ảnh chụp desktop, mobile 390px, và chế độ in: chấm/viền ngày sinh hiển thị đúng.
  Bổ sung rule in cho `.legend-swatch.dob` (chấm đen đặc thay vì rỗng).
- Lưu ý thiết kế: ô Lo Shu có thể "đầy" nhờ chữ cái trong tên nhưng mũi tên vẫn báo "Trống"
  vì mũi tên chỉ tính ngày sinh; phụ đề panel đã ghi rõ để tránh nhầm.

## Hoàn thành 2026-10-28 — Mở rộng (tất cả 3 mục)

1. **Git init** — repo tại `.git/`, commit đầu `ae143eb` (12 file, 6652 dòng) bao gồm toàn bộ thay đổi trước đó.
2. **Favicon + OG image** — favicon đã có (inline SVG data URI). Tạo `assets/images/og-image.svg` (1200×630, tối, brand mark + tiêu đề). Thêm meta `og:url`, `og:site_name`, `og:image`, `og:image:width/height`, `twitter:card/title/description/image`, `apple-touch-icon`.
3. **Responsive mobile** — Xác minh qua CDP Edge headless tại 375/390/412/768/1280px: không lỗi console, không tràn ngang (`bodyScrollW === bodyClientW`), `calc-form` dùng `grid-template-columns: 1fr` (xếp dọc) ở ≤640px (styles.css:2487), `loshu-wrap` khép trong khung 375px, panel co dãn theo chiều rộng, header điều chỉnh chiều cao. (Không có thiết bị mobile thật để kiểm tra vật lý.)

## Hoàn thành 2026-10-28 — Test tự động (tests/ + package.json)

- Tạo `package.json` với `"test": "node tests/verify.js && node tests/numcheck.js && node tests/lunarcheck.js"`.
- `tests/verify.js`: 6 hồ sơ, kiểm tra dobCounts/counts, mũi tên đủ/trống tính trên dobCounts, dải đỉnh liên hợp, LP33 → P1 hết 30, missing/repeated tính theo dobCounts, dữ liệu đỉnh/thách thức đủ.
- `tests/numcheck.js`: normalizeName, computeProfile, computeCycles, NUM.numbers entry cho mọi chỉ số, không crash.
- `tests/lunarcheck.js`: Tết 2023–2026, Trung thu 2024–2026, Can Chi năm, hexByLines round-trip 64/64, Mai Hoa sample (primary/mutual/changed trong 1–64 và có dữ liệu quẻ).
- Chạy `npm test` → ALL CHECKS PASSED trên cả 3 file.

## Hoàn thành — Accessibility dialog (app.js)

- `openDialog`: lưu phần tử đang focus, set `aria-modal="true"` trên dialog, `aria-expanded="true"` trên nút kích hoạt, focus vào nút "Đóng", thông báo qua vùng `#live` (`aria-live=polite`), gắn keydown listener chặn Tab thoát ngoài dialog (focus trap).
- `closeDialog` (bắt sự kiện `close`, bao gồm cả Escape): xoá `aria-modal`, `aria-expanded`, khôi phục focus về phần tử trước đó, xóa văn bản vùng live.
- Click handler truyền nút kích hoạt vào `openDialog` để gán `aria-expanded`.
- Xác nhận qua CDP (Edge headless): mở dialog → modal + expanded + focus vào nút Đóng + live thông báo; nhấn Escape → đóng, bỏ modal, khôi phục focus, không lỗi console.

## Thay đổi 2026-10-28 — Bản đồ số theo chuẩn biểu đồ ngày sinh VN

- `LOSHU_ORDER` app.js:26: `[4,9,2,3,5,7,8,1,6]` → `[3,6,9,2,5,8,1,4,7]` (lưới chuẩn: 3-6-9 / 2-5-8 / 1-4-7, số 5 ở giữa, 1 dưới-trái, 3 trên-trái).
- `data-cycles.js` arrows.lines (8 dòng): 123 Kế hoạch, 456 Ý chí, 789 Hoạt động, 147 Thực tế, 258 Cân bằng, 369 Trí tuệ, 159 Quyết tâm, 357 Tâm linh. Bỏ nhãn sai "Cảm xúc"/"Hành động"/"Tâm linh" gắn nhầm vào đường lưới Lo Shu.
- app.js:718,776,867: nhãn UI "Lo Shu" → "Bản đồ số"/"Biểu đồ ngày sinh".
- Kiểm chứng: `node --check` 2 file OK; `verify.js` 6 profile OK (active/empty mũi tên tính trên dobCounts, dải đỉnh liên hợp, LP33 → P1 hết 30); CDP Edge headless 4 tình huống URL — không lỗi console, lưới hiển thị đúng thứ tự, `ten=123` vẫn bị chặn.

## Thay đổi 2026-10-28 (tiếp theo) — Thêm thông tin mũi tên trống

- `data-cycles.js` arrows.lines: mỗi mục thêm `empty: { name, text }` cho phiên bản trống: 123→Thiếu định hướng, 456→Uất giận, 789→Thụ động, 147→Hỗn độn, 258→Nhạy cảm, 369→Trí nhớ ngắn hạn, 159→Trì hoãn, 357→Hoài nghi.
- app.js:668-672: render mũi tên trống hiển thị `Tên empty: nội dung` thay vì văn bản chung chung.

## Hoàn thành 2026-10-28 — Kinh Dịch UI (iching-ui.js)

- `render()`: sau khi đổ HTML, set `tabindex="-1"` và `focus()` vào `#cast-result` để người dùng dùng bàn phím điều hướng ngay vào kết quả (accessibility).
- Thông báo qua `#live` (`aria-live=polite`) và `#toast` sau mỗi lần gieo quẻ (`"Đã gieo quẻ X · Tên quẻ · hào động Y"`).
- Thêm `MOVING_POSITION` (dòng 35-42): mô tả vị trí hào 1–6 theo quy ước chung (khởi đầu, phát triển, tất yếu, trung bình, vị trí cao, kết thúc) — hiển thị bên cạnh "Hào động X" trong `hex-caption`. Không bịa nội dung ý nghĩa hào cụ thể của từng quẻ vì `data-hexagrams.js` không có field đó.
- Xác minh qua CDP Edge headless (url `#kinh-dich`, ngày 29/09/1995, giờ Tý): focus chuyển sang `#cast-result`, live/toast hiển thị đúng, 12 option giờ, không lỗi console, không tràn ngang.

## Hoàn thành 2026-10-28 — Đưa nội dung intro chưa dùng vào UI (app.js)

- `challengeIntro` (data-cycles.js:21): hiển thị dưới tiêu đề panel "Thách thức lặp lại".
- `karmicDebtIntro` (data-cycles.js:34): hiển thị dưới tiêu đề panel "Nợ nghiệp".
- `planes.intro` (data-cycles.js:72): thay văn bản cứng "Cách bạn tiếp nhận thế giới" ở panel "Bình diện & ẩn đam mê".
- `hiddenPassion.intro` (data-cycles.js:82): hiển thị trong mini-card Ẩn đam mê.
- `personalMonth.intro` (data-cycles.js:94): hiển thị trong mini-card Tháng cá nhân.
- `mastery` (data-cycles.js:108): thêm panel "Số chủ đạo 11/22/33" khi Đường đời là số chủ đạo, hiển thị văn bản tương ứng (11/22/33).
- Xác minh qua `node --check`, `verify.js` (6 hồ sơ), CDP Edge headless 4 kịch bản URL — không lỗi console.

## Hoàn thành 2026-10-28 — Đồng bộ missing/repeated sang dobCounts (app.js)

- `computeProfile` (app.js:414-421): `missing` (con số cần bồi đắp) và `repeated` (số lặp) giờ tính
  từ `dobCounts` (chỉ chữ số ngày/tháng/năm sinh) thay vì `counts` (trộn họ tên).
- `counts` vẫn giữ nguyên (trộn) để render bản đồ số/loshu theo nguyên tắc đã chốt: loshu trộn,
  mũi tên + missing/repeated chỉ tính ngày sinh.
- Xác minh qua CDP Edge headless (4 kịch bản URL): missing/repeated khớp chữ số ngày sinh,
  không lỗi console. `ten=123` vẫn bị chặn.

## Hoàn thành 2026-10-28 — Hướng dẫn "Khi nào nên gieo quẻ" (index.html + styles.css)

- `index.html` (sau `section-lead` của `#kinh-dich`): thêm khối `.cast-when` gồm tiêu đề
  "Khi nào nên gieo quẻ", hai cột "Nên gieo khi" (4 mục) và "Hoãn lại khi" (4 mục), cùng câu chốt
  "Quẻ không quyết định thay bạn…". Nội dung nhấn: hỏi một câu thật, cụ thể, mỗi lần một việc,
  không gieo lại cùng câu để "xin quẻ khác", không thay thế quyết định y tế/pháp lý/tài chính.
- `styles.css` (khối Kinh Dịch): thêm `.cast-when`, `.cast-when-head/-cols/-col/-label/-note`.
  Desktop 2 cột, `@media (max-width: 640px)` chuyển 1 cột. Dùng tông xanh cho "Nên gieo",
  đỏ nhạt cho "Hoãn lại", khớp bảng màu sẵn có.
- Kiểm chứng: `npm test` ALL CHECKS PASSED; CDP Edge headless 1280px → 2 cột, 375px → 1 cột,
  8 mục, không lỗi console, `scrollWidth === clientWidth` (không tràn ngang); chụp ảnh desktop/mobile.

## Hoàn thành 2026-10-28 — Tính năng Bài Tarot (data-tarot.js, tarot-ui.js)

- `assets/js/data-tarot.js`: 78 lá (22 Đại Bí mật + 56 Tiểu Bí mật). Mỗi lá có `id, num, vn, arcana,
  suit, rank, element, meaning` (xuôi), `rev` (ngược), `keywords[]`. 22 lá Đại Bí mật viết nghĩa riêng
  (Gã khờ, Pháp sư, Nữ tu sĩ, … Thế giới); 56 lá Tiểu Bí mật theo 4 bộ Trượng/Chén/Kiếm/Đá quý × 14 cấp
  (Án, 2–10, Trang, Hiệp sĩ, Nữ hoàng, Vua) với nghĩa dựng từ cấp + bộ. File sinh bằng script tạm,
  đã kiểm tra 78 lá, 22/56, tên không trùng, `keywords` luôn là mảng.
- `assets/js/tarot-ui.js`: chọn 1 lá hoặc 3 lá (quá khứ/hiện tại/tương lai), mỗi lá ngẫu nhiên
  xuôi/ngược (50%); render thẻ với nhãn Đại/Tiểu Bí mật, bộ nguyên tố, Dương/Âm, nghĩa và từ khóa.
  Submit và "Xáo trộn lại" đều vẽ lại; focus vào `#tarot-result`, thông báo qua `#live`/`#toast`
  (lần vẽ đầu khi tải trang không phát thông báo để tránh trùng toast với Kinh Dịch).
- `index.html`: thêm link "Bài Tarot" vào nav đầu trang + footer; thêm section `#tarot` (số V) với
  form + panel kết quả; nạp `data-tarot.js` và `tarot-ui.js`.
- `styles.css`: thêm khối `/* Bài Tarot */` (`.tarot-layout/-form/-result/-cards/-card/...`),
  desktop 2 cột, `@media (max-width: 980px)` về 1 cột; thêm `#tarot` vào danh sách ẩn khi in.
- Kiểm chứng: `npm test` ALL CHECKS PASSED; CDP Edge headless 1280px & 375px: 1 lá → 3 lá đúng,
  Đại/Tiểu Bí mật + Dương/Âm hiển thị, không lỗi console, `scrollWidth === clientWidth`; chụp ảnh
  desktop/mobile.

## Hoàn thành 2026-10-28 — Cải tiến toàn diện theo đề xuất

1. **Sửa lỗi Mutation dữ liệu trong `tarot-ui.js`:**
   - Dùng `Object.assign({}, raw)` khi bốc bài thay vì gán trực tiếp lên object trong mảng `TAROT.cards`.
   - Ngăn chặn triệt để tình trạng thẻ bài bị ô nhiễm cờ `reversed` toàn cục.
2. **Nâng cấp trải bài Tarot 3 lá (`tarot-ui.js` + `styles.css`):**
   - Thêm nhãn vị trí cụ thể cho trải bài 3 lá:
     - Lá 1: Quá khứ · Gốc rễ & bài học khởi phát.
     - Lá 2: Hiện tại · Thực tại & thử thách cốt lõi.
     - Lá 3: Tương lai · Xu hướng & hướng đi khuyên dùng.
   - Thêm badge `.tarot-card-pos` với màu vàng gold và đường nét chấm thanh lịch.
3. **Bộ test tự động cho Tarot (`tests/tarotcheck.js` + `package.json`):**
   - Tạo mới `tests/tarotcheck.js`: xác thực 78 lá (22 Đại Bí mật, 56 Tiểu Bí mật đều nhau 14 lá/bộ), không trùng ID, các trường bắt buộc không rỗng.
   - Tích hợp vào `npm test`: cả 4 test suite (`verify.js`, `numcheck.js`, `lunarcheck.js`, `tarotcheck.js`) chạy mượt mà không lỗi.
4. **Tối ưu hiệu năng tải phông chữ (Fonts Loading Waterfall):**
   - Chuyển link Google Fonts vào `<head>` của `index.html` song song cùng preconnect.
   - Xóa bỏ `@import url(...)` đầu file `styles.css` để loại bỏ bước chặn render (render-blocking waterfall).
5. **Nâng cấp tính năng Sao chép tóm tắt lá số (`app.js`):**
   - Bổ sung nút "Sao chép tóm tắt" dạng text có định dạng đẹp mắt vào thanh công cụ kết quả thần số học.
   - Hỗ trợ gửi nhanh qua Zalo, Messenger, Notes mà không bắt buộc người nhận phải vào website.
6. **Lưu & phục hồi lịch sử cho Kinh Dịch và Tarot (`iching-ui.js`, `tarot-ui.js`):**
   - Lưu trữ phiên gieo quẻ Kinh Dịch (`thienso:iching:last`) và trải bài Tarot gần nhất (`thienso:tarot:last`) vào `localStorage`.
   - Tự động nạp lại khi người dùng tải lại trang hoặc mở lại tab.
7. **Bổ sung khối "Giải thích bài Tarot" chuyên sâu (`tarot-ui.js` + `styles.css`):**
   - Phân tích tương quan năng lượng: Tỷ lệ Âm/Dương (Ngược/Xuôi), số lượng Đại Bí mật (bước ngoặt lớn) vs Tiểu Bí mật, và nguyên tố chiếm ưu thế (Hỏa/Thủy/Khí/Thổ).
   - Luận giải chi tiết:
     - 3 lá: Dòng chảy Quá khứ (Cội nguồn) → Hiện tại (Trọng tâm) → Tương lai (Chiều hướng & Kết quả tiềm năng).
     - 1 lá: Phân tích thông điệp trực diện & trọng tâm phản ánh của lá bài.
   - Khối "Lời khuyên then chốt": Danh sách 2–3 lời khuyên hành động thiết thực dựa trên cấu trúc năng lượng trải bài.
   - Khối "Cẩm nang & Quy ước Tarot" (dạng collapsible `<details class="acc">` tương tự Mai Hoa Dịch Số) giúp người dùng nắm bắt quy ước 78 lá bài và tiếp cận Tarot khoa học, tỉnh thức.

8. **Hỗ trợ PWA & Chạy Offline toàn diện (`manifest.webmanifest` + `sw.js`):**
   - Tạo file Web App Manifest chuẩn: Cho phép cài đặt ứng dụng vào màn hình chính (Add to Home Screen) trên thiết bị di động (iOS/Android) và máy tính (Windows/macOS).
   - Tích hợp Service Worker (`sw.js`) với cơ chế Cache-First cho toàn bộ tài nguyên tĩnh (HTML, CSS, JS, SVG). Ứng dụng hoạt động 100% không cần kết nối mạng.
9. **Tách module đồ họa & tương tác (`assets/js/effects.js`):**
   - Tách toàn bộ hiệu ứng nền (Canvas Starfield `#stars`, quả cầu Orb Parallax, Custom Cursor Glow, Card 3D Tilt, IntersectionObserver Reveal) từ `app.js` sang `effects.js`.
   - Giúp `app.js` giảm gần 300 dòng mã nguồn, tập trung hoàn toàn vào Engine thần số học và Controller lá số.
10. **Đồng bộ tính năng "Sao chép nhanh" cho Kinh Dịch & Tarot:**
    - Kinh Dịch (`iching-ui.js`): Thêm nút "Sao chép quẻ" (định dạng tóm tắt: Quẻ chủ, hào động, Thể/Dụng, quẻ hỗ, quẻ biến, thoán từ và lời khuyên).
    - Bài Tarot (`tarot-ui.js`): Thêm nút "Sao chép trải bài" (định dạng tóm tắt: danh sách lá kèm chiều Dương/Âm, luận giải vị trí và lời khuyên then chốt).
    - Người dùng có thể dễ dàng chia sẻ cả 3 phương pháp luận giải qua Zalo/Messenger chỉ với 1 click.
11. **Sửa lỗi chính tả toàn bộ dữ liệu 64 Quẻ (`data-hexagrams.js`):**
    - Sửa triệt để 384 lỗi typo chữ `"Hão "` thành `"Hào "` trong trường `lineTexts` của toàn bộ 64 quẻ.
12. **Nâng cấp toàn diện mảng Kinh Dịch (`iching.js`, `iching-ui.js`, `styles.css`):**
    - Thêm phương pháp **Gieo 3 Đồng Xu cổ truyền (Chu Dịch Lục Hào)**:
      - Tab chuyển đổi giữa *Mai Hoa theo giờ* và *Gieo 3 đồng xu*.
      - Hiệu ứng lật 3 đồng xu cổ (Sấp = Âm = 2, Ngửa = Dương = 3), gieo tuần tự 6 lần từ Hào 1 lên Hào 6.
      - Hỗ trợ quẻ tĩnh (0 hào động), quẻ 1 hào động hoặc nhiều hào động (Lão Âm 6, Lão Dương 9).
    - Thêm khối **Ứng kỳ & Phương vị (`cast-forecast`)**:
      - Phân tích Ngũ hành theo 4 mùa âm lịch (Vượng, Tướng, Hưu, Tù, Tử).
      - Dự báo thời điểm việc thành / ứng nghiệm và phương vị cát lợi cho cả quẻ Thể và quẻ Dụng.
    - Bộ test tự động: Bổ sung kiểm thử `castCoins`, `timingForecast` và kiểm tra 0 lỗi typo vào `tests/lunarcheck.js`.
13. **Thư viện 64 Quẻ Văn Vương toàn diện (`index.html`, `iching-ui.js`, `styles.css`):**
    - Thiết kế giao diện lưới 64 quẻ (`#thu-vien-que`) với thanh tìm kiếm thời gian thực (tên quẻ, số quẻ, quái thượng/hạ, từ khóa) không phân biệt dấu tiếng Việt.
    - Bộ lọc nhanh theo Bát quái quái thượng (Tất cả, Càn, Đoài, Ly, Chấn, Tốn, Khảm, Cấn, Khôn).
    - Hộp thoại chi tiết quẻ (`#hex-dialog`):
      - Đồ họa trực quan 6 hào lớn (Sơ hào đến Thượng hào, chỉ rõ Âm/Dương).
      - Thoán từ (Lời phán) & Đại tượng (Hình tượng vũ trụ).
      - Luận giải Bản chất năng lượng & Ứng dụng đời sống.
      - Lời khuyên quân tử & Luận giải chi tiết từng hào trong 6 hào từ.
      - Quản lý tiêu điểm (Focus trap), hỗ trợ phím Escape, đóng mở mượt mà.
14. **Cầu nối tam giác vũ trụ — Đồng bộ Thần Số · Tarot · Kinh Dịch (`app.js`, `styles.css`):**
    - Tích hợp khối "Cầu nối vũ trụ" (`.cosmic-panel`) ngay trong bảng kết quả lá số cá nhân:
      - **Thần số (Pythagore):** Chỉ số Đường đời, bản chất năng lượng và Năm cá nhân.
      - **Tarot Bản Mệnh:** Tự động quy đổi Đường đời sang lá bài Major Arcana tương ứng (kèm số bậc thầy 11, 22, 33), hiển thị từ khóa và thông điệp soi đường.
      - **Quẻ Dịch Bản Mệnh:** Dùng ngày tháng năm sinh lập quẻ Mai Hoa bản mệnh, hiển thị quẻ chủ, cấu tạo quái, tương quan Thể - Dụng và nút "Đọc toàn bộ quẻ này" mở trực tiếp `#hex-dialog`.
      - **Cộng hưởng tam giác vũ trụ:** Đoạn luận giải tổng hợp liên kết trực giác phương Tây với triết lý dịch biến phương Đông.
      - Cập nhật tính năng "Sao chép tóm tắt" để chứa thông tin Tarot Bản Mệnh và Quẻ Dịch Bản Mệnh.
    - Nâng cấp phiên bản Service Worker lên `thienso-v2` để cập nhật tức thì.

## Việc chưa làm / có thể mở rộng tiếp theo

- Bổ sung tùy chọn xuất lá số dạng ảnh (Canvas/HTML-to-Image) nếu người dùng có nhu cầu lưu file ảnh trực tiếp.
