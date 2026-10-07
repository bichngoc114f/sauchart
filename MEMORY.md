# Sâu Chart — Memory

**URL:** https://bichngoc114f.github.io/sauchart/
**Repo:** bichngoc114f/sauchart (GitHub Pages, push thẳng main → auto deploy)
**Stack:** HTML/CSS/JS thuần, LightweightCharts v5.2.1 standalone (`LC = LightweightCharts`)

---

## Quy tắc bất biến
- **KHÔNG SỬA** `ea-l5-engine.js` và `ea-l5-data.js`
- Mọi thay đổi commit + push thẳng lên **main**
- Nhánh dev hiện tại: `claude/sau-chart-write-permission-35rk3i` (nếu dùng branch riêng)

---

## Kiến trúc file
| File | Vai trò |
|------|---------|
| `index.html` | HTML skeleton, load scripts |
| `style.css` | Toàn bộ CSS |
| `app.js` | Logic chính (chart, dữ liệu, EA UI) |
| `indicators.js` | Tính chỉ báo (BB, MA, VWAP, RSI) |
| `ea-l5-engine.js` | **READONLY** stub EA engine |
| `ea-l5-data.js` | **READONLY** data fetcher EA |

---

## Trạng thái sau Task 7 (2026-10-07)

### Chart config
- `rightPriceScale: { visible: true, borderVisible: false }` — thang giá PHẢI
- `leftPriceScale: { visible: false }`
- `nenSeries`, `themDuong()`, RSI histogram: `priceScaleId: 'right'`

### #nhanGia (nhãn giá + đếm ngược)
- Định vị `right:0` (không phải left)
- Width = `chart.priceScale('right').width()`

### Legend / EA status panel
- `left: '8px'` — bắt đầu từ cạnh trái (không offset thang giá)

### EA biến quan trọng
```js
let eaHistMarkers = null;   // LC.createSeriesMarkers result
let eaHistPrim = null;      // EaHistPrimitive instance
let eaOpenPrim = null;      // EaOpenLinesPrimitive instance
let eaLoading = false;
```

### EA localStorage key: `caiDatEA`
```js
const EA_DEFAULT = {
  on: false, D: true, H4: true, H8: true, H12: true, Trap: true,
  entry: true, sltp: true, pnl: true, hist: true, bts: true, ds: false
};
```

### EA Primitive classes
- **`EaHistPrimitive`**: vẽ đường chấm nối entry→exit cho closed trades
- **`EaOpenLinesPrimitive`**: vẽ đoạn dashed từ nến entry (hoặc last candle) → cạnh phải pane; nhãn text tại cạnh phải; `priceAxisViews()` tạo label màu trên thang giá phải

### EA Primitives API (LightweightCharts v5)
- `nenSeries.attachPrimitive(prim)` / `nenSeries.detachPrimitive(prim)`
- `LC.createSeriesMarkers(series, markers)` → `.detach()`
- `target.useBitmapCoordinateSpace({context, horizontalPixelRatio, verticalPixelRatio, bitmapSize})`
- `chart.timeScale().timeToCoordinate(time)` → CSS px
- `series.priceToCoordinate(price)` → CSS px
- Nhân `* hpr` / `* vpr` để ra bitmap px

### Marker positions (LC v5)
- `atPriceBottom` / `atPriceTop` với `price:` field

---

## EA data interface (ea-l5-data.js)
```
L5Data.chayL5(sym, onProgress) → {trades, status, thongKe}
Trade: { leg, method, entryT(ms UTC), entry, exitT(ms UTC|null),
         exit, reason, slHist:[{t,sl}], pnlPct }
```

---

## Xử lý timezone
- Crypto (Binance): `LECH_GIO = 7*3600`
- VN stocks: `LECH_GIO = 0`
- `eaSnapToNen(ms)`: snap UTC-ms → chart candle time

---

## Tasks đã hoàn thành
1. VN stock fetching
2. Countdown timer
3. Price label system
4. EA L5 integration (stub engine + data)
5. EA UI panel
6. EA display redesign (MT5-style): hist markers + primitives, entry/SL price lines, PnL real-time
7. Thang giá sang phải + đường entry/SL dùng primitive đoạn thẳng

---

## Ghi chú kỹ thuật
- `dinhDangGia(v)` — format giá
- `docBoNho(k,def)` / `ghiBoNho(k,v)` — localStorage helpers
- `duLieuNen[]` — mảng candle hiện tại `{time,open,high,low,close,volume}`
- `maHienTai` — symbol đang xem
- `khungLabel()` — timeframe label
- `MAU.*` — bảng màu toàn cục
