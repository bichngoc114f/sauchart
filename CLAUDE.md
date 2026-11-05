Sâu Chart – app biểu đồ cá nhân thay TradingView. Mọi thay đổi commit và push thẳng lên nhánh main để GitHub Pages tự cập nhật.

## Quy tắc cache-busting
Mỗi khi commit có sửa bất kỳ file nào trong repo (app.js, style.css, indicators.js, ea-*.js, v.v.), phải cập nhật tham số `?v=` trong index.html cho TẤT CẢ thẻ `<script src>` và `<link rel="stylesheet" href>` trỏ tới file nội bộ.
Dùng định dạng ngày-giờ UTC: YYYYMMDDHHММ (ví dụ `?v=202611051430`).
KHÔNG thêm `?v=` vào URL ngoài (https://...), icon, manifest.
