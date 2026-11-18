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
- Level 0 ở point2, level 1 ở point1: `price = p2 + (p1 - p2) * ratio`.
- Không có vùng tô nền; chỉ có đường kẻ ngang và đường nối chéo khi chọn.
- Đường nối chéo: CHỈ hiện khi bấm chọn đường mức ngang (không hiện mặc định).
  - `fibDiagIds` = Set fbId cần vẽ đường nối; null = không vẽ gì.
  - Bấm đường có nhóm hợp lưu (≥2 Fib trong 0.5%) → `fibTinhNhomHopLuu()` trả về Set tất cả Fib trong nhóm.
  - Bấm qua bảng → `fibDiagIds = new Set([fibSelected])` (chỉ 1 Fib).
  - Bỏ chọn: click vùng trống, Esc, đổi mã/khung, xóa Fib.
