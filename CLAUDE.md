Sâu Chart – app biểu đồ cá nhân thay TradingView. Mọi thay đổi commit và push thẳng lên nhánh main để GitHub Pages tự cập nhật.

## Quy tắc cache-busting
Mỗi khi commit có sửa bất kỳ file nào trong repo (app.js, style.css, indicators.js, ea-*.js, v.v.), phải cập nhật tham số `?v=` trong index.html cho TẤT CẢ thẻ `<script src>` và `<link rel="stylesheet" href>` trỏ tới file nội bộ.
Dùng định dạng ngày-giờ UTC: YYYYMMDDHHММ (ví dụ `?v=202611051430`).
KHÔNG thêm `?v=` vào URL ngoài (https://...), icon, manifest.

## Thang giá
- Nút hình lục giác `#btnThangGia` ở góc dưới-trái cột giá (ngang hàng trục thời gian), menu `#popupThangGia`: Regular (mode 0, mặc định) / Logarithmic (mode 1). `apDungCheDoThangGia()` gọi `chart.priceScale('right').applyOptions({mode})` — chỉ pane nến chính, RSI giữ nguyên. Khóa toàn cục `'sauchart.priceScaleMode'` (0/1), áp lại ở cuối `taoSeries()` nên đổi mã/khung vẫn giữ.
- Vị trí nút/menu tính trong `capNhatNutThangGia()` từ `priceScale('right').width()` và `timeScale().height()`; gọi từ `capNhatNhanGia()` và `ResizeObserver` trên `#chart`.
- Mọi lớp vẽ riêng (Fib, EA, Co bó) PHẢI lấy tọa độ y qua `series.priceToCoordinate()` / `coordinateToPrice()`, KHÔNG tự nội suy tuyến tính theo giá, để đúng ở cả hai chế độ.

## Kẻ vẽ (đường ngang / đường dọc / trendline)
- Nút `#btnVe` ("✎ Vẽ", cạnh nút Fib) mở menu `#panelVe`: Đường ngang, Đường dọc, Trendline (+ tùy chọn mặc định "Kéo dài sang phải/trái" cho trendline mới, khóa `'sauchart.veTuyChon'`), "Xóa tất cả (mã này)". Chọn công cụ → `kvVaoMode()`; Esc hoặc bấm lại nút để hủy; vẽ xong tự thoát chế độ (mỗi lần một nét) và nét mới được chọn.
- Dữ liệu: `'sauchart.draw.<MA>'` = `[{id, k:'h'|'v'|'t', t1,p1,t2,p2, mau, w:1|2|3, ls:'solid'|'dash', extR?, extL?}]`, lưu (time chart = giây UTC + LECH_GIO, price) gốc, dùng chung mọi khung giờ của mã; đường ngang chỉ có p1, đường dọc chỉ có t1. Sao lưu/khôi phục (bảng Fib) mang theo trường `draw`; `kvChuanHoa()` làm sạch dữ liệu.
- `KeVePrimitive` gắn vào `nenSeries` SAU Fib (vẽ đè Fib, dưới popup DOM), có `priceAxisViews` (nhãn giá đường ngang) và `timeAxisViews` (nhãn thời gian đường dọc). Tọa độ x qua `kvTimeToX()` (timeToIndex + nội suy giữa 2 nến + ngoại suy ngoài dữ liệu, KHÔNG dùng `timeToCoordinate`), y qua `priceToCoordinate` (đúng cả Regular/Logarithmic).
- LƯU Ý: `timeScale().logicalToCoordinate()` chỉ đúng với chỉ số NGUYÊN (chỉ số lẻ trả 0) → luôn dùng `kvLogicalToX(idx)` khi chỉ số có thể lẻ (đã sửa cả `fibTimeToX` ngoại suy).
- Tương tác (`kvOnPointerDown` gắn ở pha capture trên `#chart`, `touch-action: none`): pointerdown trúng nét (6px, cảm ứng 12px, chỉ trong pane nến) → chọn + kéo thân; trúng chấm neo trendline (10px) → kéo điểm; trúng vùng trống thì để chart kéo bình thường và thả không kéo → bỏ chọn (tự xử lý, không dựa vào click của thư viện). Delete/Backspace xóa, Esc bỏ chọn, Shift khóa ngang/dọc khi vẽ trendline. Thanh nhỏ `#kvThanh` (màu 10 ô `FIB_BANG_MAU`, độ dày 1/2/3, liền/đứt, kéo dài trái/phải cho trendline, xóa) bám nét đang chọn.
- Chọn nét kẻ vẽ ↔ chọn Fib loại trừ nhau; vào chế độ Fib thì thoát chế độ kẻ vẽ và ngược lại. `kvTai()` gọi từ `napBieuDo()` và khi khôi phục dữ liệu.

## Co bó
- Zone format: `{s: startMs, e: endMs}` (UTC ms) — dùng `z.s`/`z.e`, KHÔNG phải `z.from`/`z.to`.
- `COBO_KHUNG` id dùng chữ thường: `h12`, `h8`, `h4`, `h2`, `h1`.
- `KHUNG_FMS` trong `coboTinhBitmask` phải dùng key chữ thường tương ứng.
- coboLoai=2 (SMA+BB): BB shift +1 ngày, SMA mỗi khung shift +độ dài khung; TÍM=BB∩SMA, VÀNG=BB−SMA, XÁM=SMA−BB.
- `CoboPrimitive` chỉ vẽ các thanh bar mảnh ở đỉnh chart (barH 5px, gap 7px) kèm dải nền tối `rgba(0,0,0,0.45)` cao đúng bằng khối bar; KHÔNG được tô nền full-height (`fillRect(xb, 0, cw, H)`) ở bất kỳ nhánh coboLoai nào (đã gỡ vì nhuộm màu cả nền đen).
- EA hiện chỉ còn F3 (6 luồng: H2, H4, D, H1, M30, M15); F1 và F2 đã bị xóa.
- KHÔNG sửa `ea-*.js`, `*-thong-bao.cjs`. Không thấy file thì DỪNG và báo.

## Fibonacci
- Nút "📐 Fib" (id `btnFib`) mở bảng quản lý; nút "Xóa" (id `fibXoaChon`, ẩn khi chưa chọn).
- State: `fibPrim`, `fibBatMode`, `fibVePhase`, `fibDangVe`, `fibSelected`, `fibDiagIds`, `fibDragState`, `_fibDsCache`, `_fibLastHitPrice`.
- Storage: localStorage key `'sauchart.fib.<MA>'`, value `[{id, t1, p1, t2, p2, hidden?, kieu?, mau?}]` (t = UTC seconds, `mau` = màu hex của bộ Fib).
- `fibTai()` gọi từ `napBieuDo()` để reset khi đổi mã/khung giờ.
- `FibPrimitive` gắn vĩnh viễn vào `nenSeries` qua `fibKhoiDong()` ở cuối file.
- Lưu bền vững (`storage.js`, nạp trước `app.js`): `ghiBoNho()` ghi localStorage rồi `sauStore.ghi()` sao chép (async, debounce) vào IndexedDB `sauchart-data`/store `kv` ({k, v, ts}) cho mọi khóa `sauchart.*` (Fib, fibShow, fibHopLuu, cài đặt chỉ báo/Co bó/EA, `lanCuoi`...). Không đụng DB `sauchart-ea` của EA.
  - Khởi động: `navigator.storage.persist()`; đọc IndexedDB, khóa nào localStorage không có → khôi phục; khác nhau → bản có `ts` mới hơn (map ts lưu ở `sauchart._ts`); khóa chỉ có trong localStorage → gieo vào IndexedDB. Khôi phục sau khi app chạy: chỉ khóa Fib → `window.sauFibKhoiPhuc()` (= `fibTai()`), khóa khác → nạp lại trang đúng 1 lần.
  - `sauchart.lanCuoi` = `{ma, khung}`: mã/khung lần xem cuối, mở lại vào đúng đó.
  - Bảng Fib có "Sao lưu Fib" (tải `sauchart-fib-YYYYMMDD-HHmm.json`: `{phienBan:1, ts, fib, fibShow, fibHopLuu}` theo mã) và "Khôi phục Fib" (`fibKiemTraSaoLuu()` kiểm tra cấu trúc, `confirm`, ghi qua `ghiBoNho`). Định dạng Fib trong localStorage không đổi.
- Level 0 ở point2, level 1 ở point1: `price = p2 + (p1 - p2) * ratio`.
- Kiểu Đa sắc = mỗi bộ Fib MỘT màu riêng (`fb.mau`, lấy từ `FIB_BANG_MAU` 10 màu): `fibMauTiepTheo(ds)` chọn màu đầu bảng chưa dùng (hết thì màu ít dùng nhất), gán khi vẽ xong (`fibVeComplet`); Fib cũ thiếu `mau` được `fibGanMauThieu()` gán theo thứ tự khi đọc trong `fibLayDS()` rồi lưu lại. Màu giữ nguyên khi đổi kiểu/khung/mã. Mọi vạch, đường chéo, chấm neo (viền), nhãn tỉ lệ của bộ đó dùng `fb.mau`; số hợp lưu luôn trắng `#ffffff`; bản xem trước dùng màu sắp gán. Kiểu Đơn sắc vẫn trắng `#e0e0e0`.
  - Danh sách trong bảng Fib có ô màu 10x10 đầu mỗi dòng (cả khi Đơn sắc); bấm ô → hàng 10 màu (`.fib-pal`), màu đang được Fib khác dùng có chấm đánh dấu nhưng vẫn chọn được. Sao lưu/khôi phục mang theo `mau`.
- Không có vùng tô nền; chỉ có đường kẻ ngang và đường nối chéo khi chọn.
- Độ đậm vạch Fib: thanh kéo `fibAlphaRange` (5–100%, bước 5) trong bảng Fib, nút "Mặc định"; khóa toàn cục `'sauchart.fibAlpha'` (0.05–1), mặc định `FIB_DUONG_ALPHA = 0.25`, đọc qua `fibGetAlpha()`. Kéo thanh vẽ lại ngay (gộp bằng `fibVeLaiRaf()`); chỉ ảnh hưởng đường mức, số hợp lưu và đường chéo vẫn rõ 100%.
- Số hợp lưu (2, 3...) ở mép phải LUÔN hiện, không có công tắc (đã bỏ khóa `sauchart.fibSo`).
- Công tắc "Hiện số dải Fib (0.5, 0.618...)" (`fibNhanChk`, khóa toàn cục `'sauchart.fibNhan'`, mặc định TẮT, đọc qua `fibNhanGet()`): bật thì vẽ tỉ lệ (0, 0.236, ..., 2.618, không kèm giá) ở mép TRÁI ngay trên từng đường đang vẽ, cỡ 10px, alpha 0.9 độc lập với thanh độ đậm, viền chữ #1d1f28; nhãn cách nhau <10px thì nhãn sau lệch xuống 10px, vẫn chồng thì bỏ (Fib đang chọn được ưu tiên). File sao lưu có thêm `fibAlpha`, `fibNhan` (tùy chọn khi khôi phục).
- Chế độ "Chỉ hiện vùng hợp lưu" (ô tích `fibHlChk` trong bảng Fib, khóa `'sauchart.fibHopLuu.<MA>'`, mặc định false): bật thì `FibPrimitive.draw` và `fibHitTest` chỉ xét các đường thuộc nhóm hợp lưu; nút Fib có chấm vàng (class `fib-loc`).
  - `fibTinhHopLuu()` gom nhóm theo giá của mọi Fib đang hiển thị (không phụ thuộc khung nhìn), trả `{groups, keys: Set('fbId|r')}`; dùng chung cho lọc, số hợp lưu, hit-test và `fibTinhNhomHopLuu()`.
  - Danh sách Fib trong bảng không bị lọc; chọn Fib từ danh sách vẫn hiện đường chéo + chấm neo dù đường ngang bị ẩn.
- Đường nối chéo: CHỈ hiện khi bấm chọn đường mức ngang (không hiện mặc định).
  - `fibDiagIds` = Set fbId cần vẽ đường nối; null = không vẽ gì.
  - Bấm đường có nhóm hợp lưu (≥2 Fib trong 0.5%) → `fibTinhNhomHopLuu()` trả về Set tất cả Fib trong nhóm.
  - Bấm qua bảng → `fibDiagIds = new Set([fibSelected])` (chỉ 1 Fib).
  - Bỏ chọn: click vùng trống, Esc, đổi mã/khung, xóa Fib.
