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
- KHÔNG sửa `ea-*.js`, `*-thong-bao.cjs`. Không thấy file thì DỪNG và báo.
