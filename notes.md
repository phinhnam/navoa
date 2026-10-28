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
```

## Kiến trúc logic

**Thứ tự load bắt buộc** (đã đúng trong `index.html:341-348`):
`data.js` → `data-numbers.js` → `data-cycles.js` → `lunar.js` → `iching.js` →
`data-hexagrams.js` → `app.js` → `iching-ui.js`.

### app.js — luồng thần số học

- `normalizeName` (app.js:337): bỏ dấu tiếng Việt, Đ→D, chỉ giữ A–Z.
- `reduceNum` (app.js:350): rút gọn, giữ master number 11/22/33; `reduceNoMaster` (app.js:454) thì không giữ.
- `computeProfile` (app.js:360): 8 chỉ số — Đường đời, Sứ mệnh, Linh hồn, Nhân cách,
  Ngày sinh, Thái độ, Trưởng thành, Cân bằng (cần xác nhận lại danh sách chính xác khi sửa).
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
- Không có test tự động, không có lint/typecheck. Kiểm tra thủ công bằng DevTools console.
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
3. **Làm nổi bật số ngày sinh trong bản đồ Lo Shu** (theo yêu cầu: giữ nguyên cách trộn tần suất):
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

### Quan sát chưa sửa (cần quyết định)

- **Mũi tên Lo Shu giờ chỉ tính ngày sinh** (`profile.dobCounts`), phụ đề panel ghi rõ
  "chỉ tính ngày sinh". `missing`/`repeated` vẫn trộn họ tên như đã chốt; nếu muốn đồng bộ
  thì đổi sang `dobCounts` (chỉ 2 chỗ trong `computeProfile`).
- `NUM.cycles` có các intro/chương chưa dùng: `challengeIntro`, `karmicDebtIntro`,
  `planes.intro`, `hiddenPassion.intro`, `personalMonth.intro`, `mastery`.
- `số chủ đạo 11/22` giữ nguyên khi tính tuổi đỉnh (25/14 tuổi) — đúng theo nhiều nguồn VN,
  nhưng khác trường phái phương Tây (dùng 2/4 → 34/32). Đã giữ nguyên theo hiện trạng.

## Việc chưa làm / cần hỏi

- Chưa xác nhận yêu cầu cụ thể của người dùng — các session dừng ở bước khảo sát/kiểm chứng.
- Chưa có repo git → chưa có lịch sử thay đổi; cân nhắc `git init` nếu cần rollback.
- Chưa kiểm tra responsive trên mobile thật (đã xem simulate 390px qua CDP).
- Chưa có favicon/OG image dạng file (OG đang dùng meta text only).

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
