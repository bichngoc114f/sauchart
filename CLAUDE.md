Sâu Chart – app biểu đồ cá nhân thay TradingView. Mọi thay đổi commit và push thẳng lên nhánh main để GitHub Pages tự cập nhật.

## Quy tắc cache-busting
Mỗi khi commit có sửa bất kỳ file nào trong repo (app.js, style.css, indicators.js, ea-*.js, v.v.), phải cập nhật tham số `?v=` trong index.html cho TẤT CẢ thẻ `<script src>` và `<link rel="stylesheet" href>` trỏ tới file nội bộ.
Dùng định dạng ngày-giờ UTC: YYYYMMDDHHММ (ví dụ `?v=202611051430`).
KHÔNG thêm `?v=` vào URL ngoài (https://...), icon, manifest.

## Co bó
- Zone format: `{s: startMs, e: endMs}` (UTC ms) — dùng `z.s`/`z.e`, KHÔNG phải `z.from`/`z.to`.
- `COBO_KHUNG` id dùng chữ thường: `h12`, `h8`, `h4`, `h2`, `h1`.
- `KHUNG_FMS` trong `coboTinhBitmask` phải dùng key chữ thường tương ứng.
- coboLoai=2 (SMA+BB): BB shift +1 ngày, SMA mỗi khung shift +độ dài khung; TÍM=BB∩SMA, VÀNG=BB−SMA, XÁM=SMA−BB.
- EA hiện chỉ còn F3 (6 luồng: H2, H4, D, H1, M30, M15); F1 và F2 đã bị xóa.
- KHÔNG sửa `ea-*.js`, `*-thong-bao.cjs`. Không thấy file thì DỪNG và báo.

## Fibonacci
- Nút "📐 Fib" (id `btnFib`) mở bảng quản lý; nút "Xóa" (id `fibXoaChon`, ẩn khi chưa chọn).
- State: `fibPrim`, `fibBatMode`, `fibVePhase`, `fibDangVe`, `fibSelected`, `fibDiagIds`, `fibDragState`, `_fibDsCache`, `_fibLastHitPrice`.
- Storage: localStorage key `'sauchart.fib.<MA>'`, value `[{id, t1, p1, t2, p2, hidden?, kieu?}]` (t = UTC seconds).
- `fibTai()` gọi từ `napBieuDo()` để reset khi đổi mã/khung giờ.
- `FibPrimitive` gắn vĩnh viễn vào `nenSeries` qua `fibKhoiDong()` ở cuối file.
- Lưu bền vững (`storage.js`, nạp trước `app.js`): `ghiBoNho()` ghi localStorage rồi `sauStore.ghi()` sao chép (async, debounce) vào IndexedDB `sauchart-data`/store `kv` ({k, v, ts}) cho mọi khóa `sauchart.*` (Fib, fibShow, fibHopLuu, cài đặt chỉ báo/Co bó/EA, `lanCuoi`...). Không đụng DB `sauchart-ea` của EA.
  - Khởi động: `navigator.storage.persist()`; đọc IndexedDB, khóa nào localStorage không có → khôi phục; khác nhau → bản có `ts` mới hơn (map ts lưu ở `sauchart._ts`); khóa chỉ có trong localStorage → gieo vào IndexedDB. Khôi phục sau khi app chạy: chỉ khóa Fib → `window.sauFibKhoiPhuc()` (= `fibTai()`), khóa khác → nạp lại trang đúng 1 lần.
  - `sauchart.lanCuoi` = `{ma, khung}`: mã/khung lần xem cuối, mở lại vào đúng đó.
  - Bảng Fib có "Sao lưu Fib" (tải `sauchart-fib-YYYYMMDD-HHmm.json`: `{phienBan:1, ts, fib, fibShow, fibHopLuu}` theo mã) và "Khôi phục Fib" (`fibKiemTraSaoLuu()` kiểm tra cấu trúc, `confirm`, ghi qua `ghiBoNho`). Định dạng Fib trong localStorage không đổi.
- Level 0 ở point2, level 1 ở point1: `price = p2 + (p1 - p2) * ratio`.
- Không có vùng tô nền; chỉ có đường kẻ ngang và đường nối chéo khi chọn.
- Độ đậm vạch Fib: thanh kéo `fibAlphaRange` (5–100%, bước 5) trong bảng Fib, nút "Mặc định"; khóa toàn cục `'sauchart.fibAlpha'` (0.05–1), mặc định `FIB_DUONG_ALPHA = 0.25`, đọc qua `fibGetAlpha()`. Kéo thanh vẽ lại ngay (gộp bằng `fibVeLaiRaf()`); chỉ ảnh hưởng đường mức, số hợp lưu và đường chéo vẫn rõ 100%.
- Công tắc "Hiện số hợp lưu" (`fibSoChk`, khóa toàn cục `'sauchart.fibSo'`, mặc định true, đọc qua `fibSoGet()`): chỉ ẩn/hiện các số 2/3; việc tính nhóm hợp lưu (`fibTinhHopLuu()`) vẫn chạy nên chế độ Chỉ hiện vùng hợp lưu và bấm đường hợp lưu vẫn đúng. File sao lưu có thêm `fibAlpha`, `fibSo` (tùy chọn khi khôi phục).
- Chế độ "Chỉ hiện vùng hợp lưu" (ô tích `fibHlChk` trong bảng Fib, khóa `'sauchart.fibHopLuu.<MA>'`, mặc định false): bật thì `FibPrimitive.draw` và `fibHitTest` chỉ xét các đường thuộc nhóm hợp lưu; nút Fib có chấm vàng (class `fib-loc`).
  - `fibTinhHopLuu()` gom nhóm theo giá của mọi Fib đang hiển thị (không phụ thuộc khung nhìn), trả `{groups, keys: Set('fbId|r')}`; dùng chung cho lọc, số hợp lưu, hit-test và `fibTinhNhomHopLuu()`.
  - Danh sách Fib trong bảng không bị lọc; chọn Fib từ danh sách vẫn hiện đường chéo + chấm neo dù đường ngang bị ẩn.
- Đường nối chéo: CHỈ hiện khi bấm chọn đường mức ngang (không hiện mặc định).
  - `fibDiagIds` = Set fbId cần vẽ đường nối; null = không vẽ gì.
  - Bấm đường có nhóm hợp lưu (≥2 Fib trong 0.5%) → `fibTinhNhomHopLuu()` trả về Set tất cả Fib trong nhóm.
  - Bấm qua bảng → `fibDiagIds = new Set([fibSelected])` (chỉ 1 Fib).
  - Bỏ chọn: click vùng trống, Esc, đổi mã/khung, xóa Fib.
