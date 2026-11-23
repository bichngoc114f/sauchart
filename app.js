// =====================================================================
//  SÂU CHART — app.js (bộ não của app)
//  Bước 2: chỉ báo + giao diện cho iPhone/iPad
//  Dữ liệu: Binance (miễn phí, không cần tài khoản)
// =====================================================================

// ---------- 1. CẤU HÌNH ----------
const DANH_SACH_MA = [
  { ma: 'BTCUSDT', ten: 'Bitcoin' },
  { ma: 'ETHUSDT', ten: 'Ethereum' },
  { ma: 'PAXGUSDT', ten: 'Vàng (PAXG ≈ XAU)' },
];

// Cổ phiếu Việt Nam — dữ liệu từ TCBS
const DANH_SACH_VN = [
  { ma: 'VNINDEX', ten: 'VN-Index',  loai: 'index' },
  { ma: 'VN30',    ten: 'VN30',      loai: 'index' },
  { ma: 'ACB', ten: 'ACB', loai: 'stock' },
  { ma: 'BCM', ten: 'BCM', loai: 'stock' },
  { ma: 'BID', ten: 'BID', loai: 'stock' },
  { ma: 'BVH', ten: 'BVH', loai: 'stock' },
  { ma: 'CTG', ten: 'CTG', loai: 'stock' },
  { ma: 'FPT', ten: 'FPT', loai: 'stock' },
  { ma: 'GAS', ten: 'GAS', loai: 'stock' },
  { ma: 'GVR', ten: 'GVR', loai: 'stock' },
  { ma: 'HDB', ten: 'HDB', loai: 'stock' },
  { ma: 'HPG', ten: 'HPG', loai: 'stock' },
  { ma: 'MBB', ten: 'MBB', loai: 'stock' },
  { ma: 'MSN', ten: 'MSN', loai: 'stock' },
  { ma: 'MWG', ten: 'MWG', loai: 'stock' },
  { ma: 'NVL', ten: 'NVL', loai: 'stock' },
  { ma: 'PDR', ten: 'PDR', loai: 'stock' },
  { ma: 'PLX', ten: 'PLX', loai: 'stock' },
  { ma: 'PNJ', ten: 'PNJ', loai: 'stock' },
  { ma: 'POW', ten: 'POW', loai: 'stock' },
  { ma: 'SAB', ten: 'SAB', loai: 'stock' },
  { ma: 'SHB', ten: 'SHB', loai: 'stock' },
  { ma: 'SSI', ten: 'SSI', loai: 'stock' },
  { ma: 'STB', ten: 'STB', loai: 'stock' },
  { ma: 'TCB', ten: 'TCB', loai: 'stock' },
  { ma: 'TPB', ten: 'TPB', loai: 'stock' },
  { ma: 'VCB', ten: 'VCB', loai: 'stock' },
  { ma: 'VHM', ten: 'VHM', loai: 'stock' },
  { ma: 'VIC', ten: 'VIC', loai: 'stock' },
  { ma: 'VJC', ten: 'VJC', loai: 'stock' },
  { ma: 'VNM', ten: 'VNM', loai: 'stock' },
  { ma: 'VPB', ten: 'VPB', loai: 'stock' },
];

// Dữ liệu VN: đọc từ file JSON do GitHub Actions cập nhật (data/{MA}.json)
// → không cần CORS proxy, không phụ thuộc API bên ngoài từ browser

// [mã Binance, nhãn hiển thị]
const KHUNG_GIO = [
  ['15m', '15m'], ['30m', '30m'],
  ['1h', '1H'], ['2h', '2H'], ['4h', '4H'], ['8h', '8H'], ['12h', '12H'],
  ['1d', '1D'], ['2d', '2D'], ['3d', '3D'], ['1w', '1W'], ['2w', '2W'], ['1M', 'M'],
];

// Khung giờ cho VN: H4, D, 2D, 3D, W, 2W, M
const KHUNG_GIO_VN = [
  ['h4', 'H4'], ['1d', 'D'], ['2d', '2D'], ['3d', '3D'], ['1w', 'W'], ['2w', '2W'], ['1M', 'M'],
];

const CUM_MA_PERIODS = [34, 55, 89, 144, 233, 377, 610, 987];

// Vùng co bó: 5 khung, cùng 8 SMA, soDuong (K) khác nhau
const COBO_KHUNG = [
  { id:'h12', ms:43200000,  smas:[34,55,89,144,233,377,610,987], soDuong:4, mau:'#3cc4d6', bit:8  },
  { id:'h8',  ms:28800000,  smas:[34,55,89,144,233,377,610,987], soDuong:5, mau:'#9085e9', bit:2  },
  { id:'h4',  ms:14400000,  smas:[34,55,89,144,233,377,610,987], soDuong:6, mau:'#e66767', bit:1  },
  { id:'h2',  ms:7200000,   smas:[34,55,89,144,233,377,610,987], soDuong:7, mau:'#f0a030', bit:4  },
  { id:'h1',  ms:3600000,   smas:[34,55,89,144,233,377,610,987], soDuong:8, mau:'#a8cc3c', bit:16 },
];
// Điều kiện (b): khoảng cách giá → SMA gần nhất ≤ 3% (cố định)
const COBO_KC_GIA = 3;
const MAU_CUM_MA = ['#f44336', '#ff9800', '#ffeb3b', '#4caf50', '#00bcd4', '#2196f3', '#9c27b0', '#e91e63'];

const REST_URLS = [
  'https://data-api.binance.vision',
  'https://api.binance.com',
  'https://api1.binance.com',
  'https://api2.binance.com',
  'https://api3.binance.com',
];
const WS_BASE = 'wss://data-stream.binance.vision';
const LECH_GIO = 7 * 60 * 60; // Binance trả giờ UTC → cộng 7 tiếng cho giờ Việt Nam

// Màu các đường — lấy theo mẫu TradingView của Sâu (đổi tuỳ ý)
const MAU = {
  nen: '#0e1015',                 // màu nền biểu đồ
  tang: '#ffffff', giam: '#9e9e9e', // nến tăng trắng, nến giảm xám
  volTang: 'rgba(38,166,154,0.5)', volGiam: 'rgba(239,83,80,0.5)',
  sma20: '#f7c948', sma55: '#e91e63', ema200: '#ffffff', bb: '#2962ff',
  // VWAP vẽ dạng chấm tròn
  vwapY: '#8a3038', vwapQ: '#b8892a', vwapM: '#6a2a8c', vwapW: '#4a8a98',
  // Khung RSI
  rsi: '#ffffff', ema9: '#4060f8', wma45: '#8e28a8',
  bb20: '#e09020', bb20Dai: 'rgba(224,144,32,0.45)',
  bb55: '#70a850', bb55Dai: 'rgba(112,168,80,0.45)',
  nenQuaMua: 'rgba(76,175,80,0.14)', nenQuaBan: 'rgba(239,83,80,0.14)',
  // Baseline (JMA)
  bl: '#f5d742', blSlow: '#9c27b0',
};

// Danh sách chỉ báo có thể bật/tắt (hiện trong bảng ⚙︎)
const CHI_BAO = [
  { id: 'vwapY', nhom: 'VWAP', ten: 'VWAP Năm', mau: MAU.vwapY },
  { id: 'vwapQ', nhom: 'VWAP', ten: 'VWAP Quý (3 tháng)', mau: MAU.vwapQ },
  { id: 'vwapM', nhom: 'VWAP', ten: 'VWAP Tháng', mau: MAU.vwapM },
  { id: 'vwapW', nhom: 'VWAP', ten: 'VWAP Tuần', mau: MAU.vwapW },
  { id: 'volume', nhom: 'Trên giá', ten: 'Khối lượng (Volume)', mau: '#787b86' },
  { id: 'cumMA', nhom: 'Trên giá', ten: 'Cụm MA (34·55·89·144·233·377·610·987)', mau: '#ffd700' },
  { id: 'bbGia20', nhom: 'Trên giá', ten: 'BB Giá (20, 2.0)', mau: MAU.bb20 },
  { id: 'bbGia55', nhom: 'Trên giá', ten: 'BB Giá (55, 2.1)', mau: MAU.bb55 },
  { id: 'rsi', nhom: 'Khung dưới', ten: 'RSI của Sâu (RSI14 + EMA9, WMA45, BB20, BB55)', mau: MAU.rsi },
  { id: 'bl',          nhom: 'Baseline', ten: 'Baseline',                               mau: MAU.bl,     blKey: 'bl'   },
  { id: 'blSlow',      nhom: 'Baseline', ten: 'Slow Baseline',                          mau: MAU.blSlow, blKey: 'slow' },
  { id: 'blToNen',     nhom: 'Baseline', ten: 'Tô màu nến khi giá cắt Baseline',        mau: ''   },
  { id: 'blToNenSlow', nhom: 'Baseline', ten: 'Tô màu nến khi giá cắt Slow Baseline',   mau: ''   },
  { id: 'blTamGiac',   nhom: 'Baseline', ten: 'Tam giác báo cắt',                       mau: ''   },
];
// Mặc định giống màn hình TradingView của Sâu: VWAP + Volume + RSI
const MAC_DINH = {
  cumMA: false, bbGia20: false, bbGia55: false, volume: false,
  vwapY: true, vwapQ: true, vwapM: true, vwapW: true, rsi: true,
  bl: true, blSlow: true, blToNen: true, blToNenSlow: true, blTamGiac: false,
};

// ---------- 2. NHỚ CÀI ĐẶT (lưu trong trình duyệt của từng máy) ----------
function docBoNho(khoa, macDinh) {
  try {
    const s = localStorage.getItem('sauchart.' + khoa);
    return s ? JSON.parse(s) : macDinh;
  } catch (e) { return macDinh; }
}
function ghiBoNho(khoa, giaTri) {
  let raw;
  try { raw = JSON.stringify(giaTri); } catch (e) { return; }
  try { localStorage.setItem('sauchart.' + khoa, raw); } catch (e) {}
  // Bản sao dự phòng IndexedDB (storage.js) — không chặn giao diện
  try { if (window.sauStore) window.sauStore.ghi('sauchart.' + khoa, raw); } catch (e) {}
}

let caiDat = Object.assign({}, MAC_DINH, docBoNho('caidat2', {}));
let blCaiDat = Object.assign(
  { bl: { len: 70, phase: 5, power: 2 }, slow: { len: 150, phase: 0, power: 2 } },
  docBoNho('blCaiDat', {})
);
// đảm bảo mỗi khoá con cũng có đủ trường
blCaiDat.bl   = Object.assign({ len: 70,  phase: 5, power: 2 }, blCaiDat.bl);
blCaiDat.slow = Object.assign({ len: 150, phase: 0, power: 2 }, blCaiDat.slow);
const _lanCuoi = docBoNho('lanCuoi', null); // {ma, khung} lần xem cuối
let maHienTai = (_lanCuoi && typeof _lanCuoi.ma === 'string' && _lanCuoi.ma) || docBoNho('ma', 'BTCUSDT');
let khungHienTai = (_lanCuoi && typeof _lanCuoi.khung === 'string' && _lanCuoi.khung) || docBoNho('khung', '1d');
if (![...DANH_SACH_MA, ...DANH_SACH_VN].some((x) => x.ma === maHienTai)) maHienTai = 'BTCUSDT';
if (![...KHUNG_GIO, ...KHUNG_GIO_VN].some((x) => x[0] === khungHienTai)) khungHienTai = '1h';

let duLieuNen = [];    // nến của biểu đồ
let nenTienTo = [];    // nến 1H từ đầu năm tới trước nến đầu tiên — chỉ để tính VWAP Năm/Quý
let ketQua = null;     // kết quả tính chỉ báo gần nhất
let wsNen = null;
let phien = 0;         // chống lỗi khi bấm đổi mã/khung liên tục
let dangTaiThem = false;  // đang tải thêm nến cũ
let daHetLichSu = false;  // đã về tới nến đầu tiên

// Vùng co bó
let coboBat = docBoNho('coboBat_v3', false);
let coboVisBat = Object.assign({h4:false,h8:false,h2:false,h12:false,h1:false}, docBoNho('coboVis_v3',{}));
let coboTabSel = docBoNho('coboTab_v3', 1);
let coboNguong = docBoNho('coboNguong_v3', 3);
let coboComboSel = 0;
let coboKetQua = {};   // {ma: {h4,h8,h2,h12,h1: {widths,ts,durMs,zones}, lastH1T}}
let coboBitmask = [];  // parallel to duLieuNen: số nguyên, bits 1-16 theo COBO_KHUNG
let coboPrim = null;
let coboLoading = false;
let coboTimer = null;
// Co bó BB
let coboLoai = docBoNho('coboLoai', 0);        // 0=SMA, 1=BB, 2=SMA+BB
let coboNguongBB = docBoNho('coboNguongBB', 4); // 3/4/5%
let coboBBVisBat = Object.assign({tim:true,xam:true,vang:true}, docBoNho('coboBBVis',{}));
let coboBBKetQua = {};  // {ma: {w3s, ts, zones}}
let coboBBMask = [];       // parallel to duLieuNen: 1 nếu nến nằm trong BB zone (shifted)
let coboCombMask = [];     // parallel to duLieuNen: bits 1=TÍM, 2=XÁM, 4=VÀNG (shifted intervals)
let coboSmaShiftMask = []; // parallel to duLieuNen: per-frame shifted SMA bitmask (dải coboLoai=2)

// Hiển thị / layout
let watchlistThuGon = docBoNho('watchlistThuGon', true);
let phongToKhungGia = docBoNho('phongToKhungGia', false);
let rsiNhomSeries = { ma: [], bb: [] };
let rsiNhomBat = Object.assign({ma:true, bb:true}, docBoNho('rsiNhom', {}));
let thangGiaMode = docBoNho('priceScaleMode', 0) === 1 ? 1 : 0; // 0 = Regular, 1 = Logarithmic
let blMarkers = null;
let wsH1Auto = null;
let autoLamMoiLuc = Date.now(); // lần cuối tính lại cobo+EA tự động

// ---------- 3. TẠO BIỂU ĐỒ ----------
const LC = LightweightCharts;
const chart = LC.createChart(document.getElementById('chart'), {
  autoSize: true,
  layout: { background: { color: MAU.nen }, textColor: '#b2b5be', panes: { separatorColor: '#2a2f3a' }, attributionLogo: false },
  grid: { vertLines: { visible: false }, horzLines: { visible: false } }, // không kẻ lưới, giống mẫu
  crosshair: { mode: LC.CrosshairMode.Normal },
  leftPriceScale: { visible: false },
  rightPriceScale: { visible: true, borderVisible: false },
  timeScale: { borderVisible: false, timeVisible: true, secondsVisible: false, rightOffset: 8 },
});

const nenSeries = chart.addSeries(LC.CandlestickSeries, {
  priceScaleId: 'right',
  upColor: MAU.tang, downColor: MAU.giam, borderVisible: false,
  wickUpColor: MAU.tang, wickDownColor: MAU.giam,
  lastValueVisible: false,
});

// S = các chuỗi chỉ báo đang vẽ. Mỗi phần tử: { series, lay(i) → điểm thứ i }
let S = [];

function themDuong(paneIndex, mau, lay, tuyChon = {}) {
  const series = chart.addSeries(LC.LineSeries, Object.assign({
    priceScaleId: 'right', color: mau, lineWidth: 1, priceLineVisible: false, lastValueVisible: false,
    crosshairMarkerVisible: false,
  }, tuyChon), paneIndex);
  S.push({ series, lay });
  return series;
}

// Kiểu "chấm tròn" giống style Circles của TradingView
const CHAM_TRON = { lineVisible: false, pointMarkersVisible: true, pointMarkersRadius: 1.6 };
// Kiểu nét chấm thưa (thay cho kiểu dấu + của TradingView)
const NET_CHAM = { lineStyle: LC.LineStyle.SparseDotted, lineWidth: 2 };

// Biến 1 giá trị thành điểm vẽ: null → "khoảng trống"
const diem = (t, v) => (v == null ? { time: t } : { time: t, value: v });

// Xoá hết chỉ báo cũ và tạo lại theo cài đặt
function taoSeries() {
  if (blMarkers) { try { blMarkers.detach(); } catch (e) {} blMarkers = null; }
  S.forEach((x) => chart.removeSeries(x.series));
  S = [];
  const t = (i) => duLieuNen[i].time;

  // --- Volume (lớp phủ ~25% dưới cùng khung giá)
  if (caiDat.volume) {
    const vol = chart.addSeries(LC.HistogramSeries, {
      priceFormat: { type: 'volume' }, priceScaleId: 'vol',
      priceLineVisible: false, lastValueVisible: false,
    }, 0);
    vol.priceScale().applyOptions({ scaleMargins: { top: 0.75, bottom: 0 } });
    S.push({
      series: vol,
      lay: (i) => {
        const n = duLieuNen[i];
        return { time: n.time, value: n.volume, color: n.close >= n.open ? MAU.volTang : MAU.volGiam };
      },
    });
  }

  // --- Đường trên giá
  if (caiDat.bbGia20) {
    themDuong(0, MAU.bb20Dai, (i) => diem(t(i), ketQua.bbGia20.tren[i]));
    themDuong(0, MAU.bb20Dai, (i) => diem(t(i), ketQua.bbGia20.duoi[i]));
    themDuong(0, MAU.bb20, (i) => diem(t(i), ketQua.bbGia20.giua[i]), NET_CHAM);
  }
  if (caiDat.bbGia55) {
    themDuong(0, MAU.bb55Dai, (i) => diem(t(i), ketQua.bbGia55.tren[i]));
    themDuong(0, MAU.bb55Dai, (i) => diem(t(i), ketQua.bbGia55.duoi[i]));
    themDuong(0, MAU.bb55, (i) => diem(t(i), ketQua.bbGia55.giua[i]), NET_CHAM);
  }
  if (caiDat.cumMA) {
    CUM_MA_PERIODS.forEach((p, idx) => {
      themDuong(0, MAU_CUM_MA[idx], (i) => diem(t(i), ketQua.cumMA[idx][i]));
    });
  }

  // --- VWAP: vẽ chấm tròn, nên sang kỳ mới tự "ngắt" chứ không nối dây
  ['vwapY', 'vwapQ', 'vwapM', 'vwapW'].forEach((id) => {
    if (!caiDat[id]) return;
    themDuong(0, MAU[id], (i) => {
      const v = ketQua[id][i];
      return v ? { time: t(i), value: v.value } : { time: t(i) };
    }, CHAM_TRON);
  });

  // --- Baseline (JMA)
  if (caiDat.bl)     themDuong(0, MAU.bl,     (i) => diem(t(i), ketQua.bl?.[i]));
  if (caiDat.blSlow) themDuong(0, MAU.blSlow, (i) => diem(t(i), ketQua.blSlow?.[i]));

  // --- Khung RSI (pane số 1, bên dưới)
  if (caiDat.rsi) {
    const P = 1;
    // Nền xanh khi RSI > 80, đỏ khi RSI < 20: cột rất cao nằm phía sau,
    // không tham gia co giãn thang (autoscaleInfoProvider trả null)
    const nen = chart.addSeries(LC.HistogramSeries, {
      priceScaleId: 'right', priceLineVisible: false, lastValueVisible: false,
      base: -1000, autoscaleInfoProvider: () => null,
    }, P);
    S.push({
      series: nen,
      lay: (i) => {
        const r = ketQua.rsi[i];
        if (r == null || (r <= 80 && r >= 20)) return { time: t(i) };
        return { time: t(i), value: 1000, color: r > 80 ? MAU.nenQuaMua : MAU.nenQuaBan };
      },
    });
    rsiNhomSeries = { ma: [], bb: [] };
    const _rniB = [
      themDuong(P, MAU.bb55Dai, (i) => diem(t(i), ketQua.bb55.tren[i])),
      themDuong(P, MAU.bb55Dai, (i) => diem(t(i), ketQua.bb55.duoi[i])),
      themDuong(P, MAU.bb20Dai, (i) => diem(t(i), ketQua.bb20.tren[i])),
      themDuong(P, MAU.bb20Dai, (i) => diem(t(i), ketQua.bb20.duoi[i])),
      themDuong(P, MAU.bb55, (i) => diem(t(i), ketQua.bb55.giua[i]), NET_CHAM),
      themDuong(P, MAU.bb20, (i) => diem(t(i), ketQua.bb20.giua[i]), NET_CHAM),
    ];
    const _rniM = [
      themDuong(P, MAU.wma45, (i) => diem(t(i), ketQua.wma45[i]), { lineWidth: 2 }),
      themDuong(P, MAU.ema9, (i) => diem(t(i), ketQua.ema9[i]), { lineWidth: 2 }),
    ];
    rsiNhomSeries.bb = _rniB;
    rsiNhomSeries.ma = _rniM;
    _rniB.forEach(s => s.applyOptions({ visible: rsiNhomBat.bb }));
    _rniM.forEach(s => s.applyOptions({ visible: rsiNhomBat.ma }));
    const rsiS = themDuong(P, MAU.rsi, (i) => diem(t(i), ketQua.rsi[i]), { lineWidth: 2 });
    // Mốc 70/30 chấm, 50 gạch — giống mẫu
    [[70, LC.LineStyle.Dotted], [50, LC.LineStyle.Dashed], [30, LC.LineStyle.Dotted]].forEach(([muc, kieu]) =>
      rsiS.createPriceLine({ price: muc, color: 'rgba(178,181,190,0.6)', lineWidth: 1, lineStyle: kieu, axisLabelVisible: false }));
    rsiS.priceScale().applyOptions({ scaleMargins: { top: 0.04, bottom: 0.04 } });

    // Khung RSI chiếm khoảng 40% chiều cao như mẫu (hoặc ẩn nếu đang phóng to)
    const panes = chart.panes();
    if (panes[1]) {
      try { _applyRsiPaneSize(panes); } catch (e) {}
    }
  }
  _applyPhongToBtn();
  _applyRsiNhomBtn();
  apDungCheDoThangGia();
}

// ---------- 4. TÍNH CHỈ BÁO ----------
function tinhChiBao() {
  const dong = duLieuNen.map((n) => n.close);
  const rsi = CB.rsi(dong, 14);
  const kq = {
    cumMA: CUM_MA_PERIODS.map((p) => CB.sma(dong, p)),
    bbGia20: CB.bollinger(dong, 20, 2.0),
    bbGia55: CB.bollinger(dong, 55, 2.1),
    rsi,
    ema9: CB.ema(rsi, 9),
    wma45: CB.wma(rsi, 45),
    bb20: CB.bollinger(rsi, 20, 2.0),
    bb55: CB.bollinger(rsi, 55, 2.1),
  };
  // VWAP: nối nến 1H tiền tố (nếu có) + nến biểu đồ, rồi cắt lấy phần của biểu đồ
  const coso = nenTienTo.concat(duLieuNen);
  const cat = nenTienTo.length;
  ['vwapY', 'vwapQ', 'vwapM', 'vwapW'].forEach((id) => {
    kq[id] = CB.vwap(coso, id.slice(-1), LECH_GIO).slice(cat);
  });
  // Baseline (JMA) — tính khi bất kỳ tuỳ chọn BL nào bật
  if (caiDat.bl || caiDat.blSlow || caiDat.blToNen || caiDat.blToNenSlow || caiDat.blTamGiac) {
    kq.bl     = CB.jma(dong, blCaiDat.bl.len,   blCaiDat.bl.power,   blCaiDat.bl.phase);
    kq.blSlow = CB.jma(dong, blCaiDat.slow.len, blCaiDat.slow.power, blCaiDat.slow.phase);
  }
  ketQua = kq;
}

// Tô màu nến khi cắt BL/SlowBL (chỉ nến đã đóng)
function _nenVoiBL(n, i) {
  if (!caiDat.blToNen && !caiDat.blToNenSlow) return n;
  if (i >= duLieuNen.length - 1) return n; // nến đang chạy: không tô
  let color = null;
  if (caiDat.blToNen && ketQua?.bl && i > 0) {
    const bl = ketQua.bl, pc = duLieuNen[i - 1].close;
    if (bl[i] != null && bl[i - 1] != null) {
      if (n.close > bl[i] && pc <= bl[i - 1]) color = '#26a69a';
      else if (n.close < bl[i] && pc >= bl[i - 1]) color = '#ef5350';
    }
  }
  if (!color && caiDat.blToNenSlow && ketQua?.blSlow && i > 0) {
    const bl = ketQua.blSlow, pc = duLieuNen[i - 1].close;
    if (bl[i] != null && bl[i - 1] != null) {
      if (n.close > bl[i] && pc <= bl[i - 1]) color = '#2962ff';
      else if (n.close < bl[i] && pc >= bl[i - 1]) color = '#9c27b0';
    }
  }
  if (!color) return n;
  return { ...n, color, wickColor: color };
}

// Vẽ tam giác báo cắt BL
function _blApDungTamGiac() {
  if (blMarkers) { try { blMarkers.detach(); } catch (e) {} blMarkers = null; }
  if (!caiDat.blTamGiac || !ketQua?.bl || !ketQua?.blSlow) return;
  const markers = [];
  const last = duLieuNen.length - 1;
  for (let i = 1; i < last; i++) {
    const nen = duLieuNen[i], prev = duLieuNen[i - 1];
    const bl = ketQua.bl, bls = ketQua.blSlow;
    if (bl[i] != null && bl[i - 1] != null) {
      if (nen.close > bl[i] && prev.close <= bl[i - 1])
        markers.push({ time: nen.time, position: 'belowBar', color: '#26a69a', shape: 'arrowUp',   size: 1 });
      else if (nen.close < bl[i] && prev.close >= bl[i - 1])
        markers.push({ time: nen.time, position: 'aboveBar', color: '#ef5350', shape: 'arrowDown', size: 1 });
    }
    if (bls[i] != null && bls[i - 1] != null) {
      if (nen.close > bls[i] && prev.close <= bls[i - 1])
        markers.push({ time: nen.time, position: 'belowBar', color: '#2962ff', shape: 'arrowUp',   size: 1 });
      else if (nen.close < bls[i] && prev.close >= bls[i - 1])
        markers.push({ time: nen.time, position: 'aboveBar', color: '#9c27b0', shape: 'arrowDown', size: 1 });
    }
  }
  if (!markers.length) return;
  try {
    if (typeof LC.createSeriesMarkers === 'function')
      blMarkers = LC.createSeriesMarkers(nenSeries, markers);
    else if (typeof nenSeries.setMarkers === 'function')
      nenSeries.setMarkers(markers);
  } catch (e) { console.warn('BL markers:', e); }
}

// Vẽ toàn bộ (khi mới tải hoặc đổi cài đặt)
function veToanBo() {
  tinhChiBao();
  nenSeries.setData(duLieuNen.map((n, i) => _nenVoiBL(n, i)));
  S.forEach((x) => x.series.setData(duLieuNen.map((_, i) => x.lay(i))));
  _blApDungTamGiac();
  coboCapNhat();
}

// Chỉ cập nhật cây nến cuối (khi giá real-time nhảy)
function veNenCuoi() {
  tinhChiBao();
  const i = duLieuNen.length - 1;
  nenSeries.update(_nenVoiBL(duLieuNen[i], i));
  S.forEach((x) => x.series.update(x.lay(i)));
  capNhatNhanGia();
  eaCapNhatPnl();
  coboCapNhat();
}

// ---------- 5. LẤY DỮ LIỆU ----------
function chuyenNenBinance(k) {
  return {
    time: Math.floor(k[0] / 1000) + LECH_GIO,
    open: +k[1], high: +k[2], low: +k[3], close: +k[4], volume: +k[5],
  };
}

async function goiBinance(thamSo) {
  for (const base of REST_URLS) {
    try {
      const res = await fetch(`${base}/api/v3/klines?${thamSo}`);
      if (!res.ok) continue;
      return (await res.json()).map(chuyenNenBinance);
    } catch (e) {
      console.warn('Lỗi tải từ', base, e);
    }
  }
  // Fallback: OKX (hỗ trợ 2D/3D/1W/1M, không bị block)
  const p = Object.fromEntries(new URLSearchParams(thamSo));
  try {
    const data = await goiOKX(p.symbol, p.interval);
    if (data?.length) return data;
  } catch (e) {
    console.warn('OKX fallback lỗi:', e);
  }
  throw new Error('Không tải được dữ liệu từ Binance');
}

// Chuyển symbol Binance → OKX: BTCUSDT → BTC-USDT
function binanceSymToOKX(ma) {
  return ma.replace(/(USDT|BUSD|BTC|ETH)$/, '-$1');
}
// Chuyển interval Binance → OKX: 1h→1H, 2d→2D, v.v.
function binanceIntervalToOKX(kh) {
  const MAP = {'1h':'1H','2h':'2H','4h':'4H','8h':'8H','12h':'12H',
               '1d':'1D','2d':'2D','3d':'3D','1w':'1W'};
  return MAP[kh] || kh;
}
async function goiOKX(ma, khung, afterMs = null) {
  const instId = binanceSymToOKX(ma);
  const bar    = binanceIntervalToOKX(khung);
  let url = `https://www.okx.com/api/v5/market/candles?instId=${instId}&bar=${bar}&limit=300`;
  if (afterMs != null) url += `&after=${afterMs}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`OKX HTTP ${res.status}`);
  const d = await res.json();
  if (d.code !== '0' || !d.data?.length) throw new Error(`OKX: ${d.msg}`);
  // OKX trả mới nhất trước → reverse
  return d.data.slice().reverse().map(item => ({
    time: Math.floor(+item[0] / 1000) + LECH_GIO,
    open: +item[1], high: +item[2], low: +item[3], close: +item[4], volume: +item[5],
  }));
}

// Nến 1H từ 01/01 năm nay tới ngay trước nến đầu tiên của biểu đồ.
// Cần cho VWAP Năm/Quý khi biểu đồ chưa chứa đủ dữ liệu từ đầu kỳ.
async function taiTienTo(ma, nenDau) {
  const canVwap = caiDat.vwapY || caiDat.vwapQ || caiDat.vwapM || caiDat.vwapW;
  if (!canVwap) return [];
  const dauNamMs = Date.UTC(new Date().getUTCFullYear(), 0, 1);
  const ketThucMs = (nenDau.time - LECH_GIO) * 1000 - 1;
  if (ketThucMs <= dauNamMs) return [];
  const GIO = 3600 * 1000;
  const yeuCau = [];
  for (let bd = dauNamMs; bd <= ketThucMs; bd += 1000 * GIO) {
    yeuCau.push(goiBinance(`symbol=${ma}&interval=1h&startTime=${bd}&endTime=${ketThucMs}&limit=1000`));
  }
  const cacPhan = await Promise.all(yeuCau);
  return cacPhan.flat();
}

// ---------- 5b. LẤY DỮ LIỆU VN TỪ TRÌNH DUYỆT (KBS / VPS / VNDirect) ----------

function _kbsFmt(d) {
  // Date → DD-MM-YYYY cho KBS API
  return String(d.getUTCDate()).padStart(2,'0') + '-' +
         String(d.getUTCMonth()+1).padStart(2,'0') + '-' +
         d.getUTCFullYear();
}

function _parseVNTime(t) {
  // "2026-10-07 09:00" → {y, m, d, h}
  const [dp, tp] = t.split(' ');
  const [y, mo, da] = dp.split('-').map(Number);
  return { y, m: mo, d: da, h: tp ? +tp.split(':')[0] : 0 };
}

async function _fetchKBSChunk(sym, isHourly, from, to, kbsType = 'index') {
  const ep = isHourly ? 'data_60P' : 'data_day';
  const url = `https://kbbuddywts.kbsec.com.vn/iis-server/investment/${kbsType}/${sym}/${ep}` +
              `?sdate=${_kbsFmt(from)}&edate=${_kbsFmt(to)}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`KBS ${res.status}`);
  const d = await res.json();
  const arr = d[ep] || [];
  // Mới nhất đứng trước → reverse; giá có thể là chuỗi
  return arr.slice().reverse().map(item => ({
    t: item.t,
    o: +item.o, h: +item.h, l: +item.l, c: +item.c, v: +(item.v || 0),
  }));
}

function _gopH4KBS(raw) {
  // Gộp nến giờ KBS (giờ VN) → H4: sáng 09:00 (9,10,11h), chiều 13:00 (13,14,15h)
  const sess = new Map();
  for (const bar of raw) {
    const { y, m, d, h } = _parseVNTime(bar.t);
    let sid = null;
    if (h >= 9 && h <= 11)  sid = `${y}-${m}-${d}-AM`;
    if (h >= 13 && h <= 15) sid = `${y}-${m}-${d}-PM`;
    if (!sid) continue;
    if (!sess.has(sid)) sess.set(sid, { y, m, d, am: h <= 11, bars: [] });
    sess.get(sid).bars.push(bar);
  }
  const out = [];
  for (const [, { y, m, d, am, bars }] of sess) {
    if (!bars.length) continue;
    // timestamp: hiển thị giờ VN trên chart (chart không cộng thêm offset cho dữ liệu VN)
    const h = am ? 9 : 13;
    out.push({
      time: Date.UTC(y, m-1, d, h) / 1000,
      open: bars[0].o,
      high: Math.max(...bars.map(b => b.h)),
      low:  Math.min(...bars.map(b => b.l)),
      close: bars[bars.length-1].c,
      volume: bars.reduce((s, b) => s + b.v, 0),
    });
  }
  return out.sort((a, b) => a.time - b.time);
}

function _rawToDaily(raw) {
  return raw.map(bar => {
    const { y, m, d } = _parseVNTime(bar.t);
    return { time: Date.UTC(y, m-1, d) / 1000, open: bar.o, high: bar.h, low: bar.l, close: bar.c, volume: bar.v };
  });
}

function _gop3D(daily) {
  const out = [];
  for (let i = 0; i < daily.length; i += 3) {
    const g = daily.slice(i, i+3);
    out.push({ time: g[0].time, open: g[0].open, high: Math.max(...g.map(b=>b.high)),
               low: Math.min(...g.map(b=>b.low)), close: g[g.length-1].close,
               volume: g.reduce((s,b)=>s+b.volume,0) });
  }
  return out;
}

function _gopTuan(daily) {
  const m = new Map();
  for (const b of daily) {
    const dow = new Date(b.time*1000).getUTCDay();
    const mon = b.time - ((dow === 0 ? 6 : dow-1) * 86400);
    if (!m.has(mon)) m.set(mon, []);
    m.get(mon).push(b);
  }
  const out = [];
  for (const [t, g] of m) {
    out.push({ time: t, open: g[0].open, high: Math.max(...g.map(b=>b.high)),
               low: Math.min(...g.map(b=>b.low)), close: g[g.length-1].close,
               volume: g.reduce((s,b)=>s+b.volume,0) });
  }
  return out.sort((a,b)=>a.time-b.time);
}

function _gop2W(weekly) {
  // weekly: mảng nến 1W (time = giây UTC+7 cho crypto, UTC 00:00 cho VN)
  // Căn theo epoch: soTuan = floor((UTC_giây_mở_nến - 345600) / 604800)
  // 345600 = 4 ngày (Thứ Hai 00:00 UTC của tuần đầu tiên)
  // maCap = floor(soTuan / 2) → nhóm 2 tuần liên tiếp
  const isVN = !!DANH_SACH_VN.find(x => x.ma === maHienTai);
  const m = new Map();
  for (const b of weekly) {
    const utcSec = isVN ? b.time : (b.time - LECH_GIO);
    const soTuan = Math.floor((utcSec - 345600) / 604800);
    const maCap = Math.floor(soTuan / 2);
    if (!m.has(maCap)) m.set(maCap, []);
    m.get(maCap).push(b);
  }
  const out = [];
  for (const [, g] of m) {
    g.sort((a, b) => a.time - b.time);
    out.push({
      time: g[0].time,
      open: g[0].open,
      high: Math.max(...g.map(b => b.high)),
      low: Math.min(...g.map(b => b.low)),
      close: g[g.length - 1].close,
      volume: g.reduce((s, b) => s + b.volume, 0),
    });
  }
  return out.sort((a, b) => a.time - b.time);
}

function _gopThang(daily) {
  const m = new Map();
  for (const b of daily) {
    const d = new Date(b.time*1000);
    const k = `${d.getUTCFullYear()}-${d.getUTCMonth()}`;
    if (!m.has(k)) m.set(k, { time: b.time, bars: [] });
    m.get(k).bars.push(b);
  }
  const out = [];
  for (const [, { time, bars }] of m) {
    out.push({ time, open: bars[0].open, high: Math.max(...bars.map(b=>b.high)),
               low: Math.min(...bars.map(b=>b.low)), close: bars[bars.length-1].close,
               volume: bars.reduce((s,b)=>s+b.volume,0) });
  }
  return out.sort((a,b)=>a.time-b.time);
}

async function goiKBSIndex(sym, khung, fromYear) {
  const isHourly = khung === 'h4';
  const startY = fromYear || (isHourly ? 2023 : 2012);
  const today = new Date();
  const endY = today.getUTCFullYear();
  const chunks = [];
  for (let y = startY; y <= endY; y++) {
    const from = new Date(Date.UTC(y, 0, 1));
    const to   = new Date(Math.min(Date.UTC(y, 11, 31), today.getTime()));
    chunks.push(_fetchKBSChunk(sym, isHourly, from, to));
  }
  const parts = await Promise.all(chunks);
  // Gộp và loại trùng theo timestamp chuỗi
  const seen = new Set();
  const raw = [];
  for (const p of parts) for (const b of p) { if (!seen.has(b.t)) { seen.add(b.t); raw.push(b); } }
  raw.sort((a, b) => a.t < b.t ? -1 : a.t > b.t ? 1 : 0);

  if (isHourly) return _gopH4KBS(raw);
  const daily = _rawToDaily(raw);
  if (khung === '1d') return daily;
  if (khung === '3d') return _gop3D(daily);
  if (khung === '1w') return _gopTuan(daily);
  if (khung === '2w') return _gop2W(_gopTuan(daily));
  if (khung === '1M') return _gopThang(daily);
  return daily;
}

function _gopH4UTC(hourlyBars) {
  // Gộp nến giờ UTC (VPS) → H4: sáng UTC 2-4h (=9-11h VN), chiều UTC 6-8h (=13-15h VN)
  const sess = new Map();
  for (const b of hourlyBars) {
    const h = new Date(b.time*1000).getUTCHours();
    let key = null;
    if (h >= 2 && h <= 4) key = Math.floor(b.time/86400)*86400 + 2*3600;
    if (h >= 6 && h <= 8) key = Math.floor(b.time/86400)*86400 + 6*3600;
    if (key === null) continue;
    if (!sess.has(key)) sess.set(key, []);
    sess.get(key).push(b);
  }
  const out = [];
  for (const [t, g] of sess) {
    g.sort((a,b)=>a.time-b.time);
    out.push({ time: t, open: g[0].open, high: Math.max(...g.map(b=>b.high)),
               low: Math.min(...g.map(b=>b.low)), close: g[g.length-1].close,
               volume: g.reduce((s,b)=>s+b.volume,0) });
  }
  return out.sort((a,b)=>a.time-b.time);
}

async function goiVPSIndex(sym, khung) {
  const isHourly = khung === 'h4';
  const to = Math.floor(Date.now()/1000);
  const from = isHourly ? to - 90*86400 : to - 15*365*86400;
  const res = isHourly ? '60' : 'D';
  const url = `https://histdatafeed.vps.com.vn/tradingview/history?symbol=${sym}&resolution=${res}&from=${from}&to=${to}`;
  const r = await fetch(url);
  if (!r.ok) throw new Error(`VPS ${r.status}`);
  const d = await r.json();
  if (d.s !== 'ok' || !d.t?.length) throw new Error('VPS no data');
  const bars = d.t.map((ts, i) => ({
    time: ts, open: d.o[i], high: d.h[i], low: d.l[i], close: d.c[i], volume: d.v?.[i] || 0,
  }));
  if (isHourly) return _gopH4UTC(bars);
  if (khung === '1d') return bars;
  if (khung === '3d') return _gop3D(bars);
  if (khung === '1w') return _gopTuan(bars);
  if (khung === '2w') return _gop2W(_gopTuan(bars));
  if (khung === '1M') return _gopThang(bars);
  return bars;
}

async function goiVNDirectIndex(sym, khung) {
  const to = Math.floor(Date.now()/1000);
  const from = to - 15*365*86400;
  const url = `https://dchart-api.vndirect.com.vn/dchart/history?resolution=D&symbol=${sym}&from=${from}&to=${to}`;
  const r = await fetch(url);
  if (!r.ok) throw new Error(`VNDirect ${r.status}`);
  const d = await r.json();
  if (d.s !== 'ok' || !d.t?.length) throw new Error('VNDirect no data');
  const daily = d.t.map((ts, i) => ({
    time: ts, open: d.o[i], high: d.h[i], low: d.l[i], close: d.c[i], volume: d.v?.[i] || 0,
  }));
  if (khung === '1d') return daily;
  if (khung === '3d') return _gop3D(daily);
  if (khung === '1w') return _gopTuan(daily);
  if (khung === '2w') return _gop2W(_gopTuan(daily));
  if (khung === '1M') return _gopThang(daily);
  return daily;
}

async function goiIndexData(sym, khung) {
  try {
    const data = await goiKBSIndex(sym, khung);
    if (data.length) return data;
  } catch (e) { console.warn('KBS lỗi:', e); }
  try {
    const data = await goiVPSIndex(sym, khung);
    if (data.length) return data;
  } catch (e) { console.warn('VPS lỗi:', e); }
  if (khung !== 'h4') {
    try {
      const data = await goiVNDirectIndex(sym, khung);
      if (data.length) return data;
    } catch (e) { console.warn('VNDirect lỗi:', e); }
  }
  throw new Error(`Không tải được dữ liệu ${sym}`);
}

async function goiKBSStock(sym, khung) {
  const isHourly = khung === 'h4';
  const today = new Date();
  // KBS chỉ lưu ~500 nến giờ gần nhất (~5 tháng) → xin 6 tháng là đủ
  const from = isHourly
    ? new Date(today.getTime() - 180 * 86400000)
    : new Date(Date.UTC(2015, 0, 1));
  const raw = await _fetchKBSChunk(sym, isHourly, from, today, 'stocks');
  if (isHourly) return _gopH4KBS(raw);
  const daily = _rawToDaily(raw);
  if (khung === '1d') return daily;
  if (khung === '3d') return _gop3D(daily);
  if (khung === '1w') return _gopTuan(daily);
  if (khung === '2w') return _gop2W(_gopTuan(daily));
  if (khung === '1M') return _gopThang(daily);
  return daily;
}

async function goiVPSStock(sym, khung) {
  const to = Math.floor(Date.now() / 1000);
  const from = to - 15 * 365 * 86400;
  const url = `https://histdatafeed.vps.com.vn/tradingview/history?symbol=${sym}&resolution=D&from=${from}&to=${to}`;
  const r = await fetch(url);
  if (!r.ok) throw new Error(`VPS ${r.status}`);
  const d = await r.json();
  if (d.s !== 'ok' || !d.t?.length) throw new Error('VPS no data');
  const daily = d.t.map((ts, i) => ({
    time: ts, open: d.o[i], high: d.h[i], low: d.l[i], close: d.c[i], volume: d.v?.[i] || 0,
  }));
  if (khung === '1d') return daily;
  if (khung === '3d') return _gop3D(daily);
  if (khung === '1w') return _gopTuan(daily);
  if (khung === '2w') return _gop2W(_gopTuan(daily));
  if (khung === '1M') return _gopThang(daily);
  return daily;
}

async function goiStockData(sym, khung) {
  try {
    const data = await goiKBSStock(sym, khung);
    if (data.length) return data;
  } catch (e) { console.warn('KBS stock lỗi:', e); }
  if (khung !== 'h4') {
    try {
      const data = await goiVPSStock(sym, khung);
      if (data.length) return data;
    } catch (e) { console.warn('VPS stock lỗi:', e); }
  }
  throw new Error(`Không tải được dữ liệu ${sym}`);
}

// ---------- 6. REAL-TIME ----------
function moKetNoiRealtime(ma, khung) {
  if (wsNen) { wsNen.onclose = null; wsNen.close(); }
  const ws = new WebSocket(`${WS_BASE}/ws/${ma.toLowerCase()}@kline_${khung}`);
  wsNen = ws;
  ws.onopen = () => datTrangThai('Real-time', 'ok');
  ws.onmessage = (event) => {
    const k = JSON.parse(event.data).k;
    const nen1w = {
      time: Math.floor(k.t / 1000) + LECH_GIO,
      open: +k.o, high: +k.h, low: +k.l, close: +k.c, volume: +k.v,
    };
    if (khungHienTai === '2w') {
      // Cập nhật nến 2W cuối: high/low/close/volume từ 1W đang chạy
      const cuoi = duLieuNen[duLieuNen.length - 1];
      if (!cuoi) return;
      const utcSec = nen1w.time - LECH_GIO;
      const soTuan = Math.floor((utcSec - 345600) / 604800);
      const maCap = Math.floor(soTuan / 2);
      const utcSecCuoi = cuoi.time - LECH_GIO;
      const soTuanCuoi = Math.floor((utcSecCuoi - 345600) / 604800);
      const maCapCuoi = Math.floor(soTuanCuoi / 2);
      if (maCap === maCapCuoi) {
        // Cùng cặp → cập nhật nến 2W cuối
        duLieuNen[duLieuNen.length - 1] = {
          time: cuoi.time,
          open: cuoi.open,
          high: Math.max(cuoi.high, nen1w.high),
          low: Math.min(cuoi.low, nen1w.low),
          close: nen1w.close,
          volume: cuoi.volume + nen1w.volume,
        };
      } else {
        // Tuần mới bắt đầu cặp mới → thêm nến 2W mới
        duLieuNen.push({
          time: nen1w.time,
          open: nen1w.open,
          high: nen1w.high,
          low: nen1w.low,
          close: nen1w.close,
          volume: nen1w.volume,
        });
      }
    } else {
      const cuoi = duLieuNen[duLieuNen.length - 1];
      if (!cuoi || nen1w.time < cuoi.time) return;
      if (nen1w.time === cuoi.time) duLieuNen[duLieuNen.length - 1] = nen1w;
      else duLieuNen.push(nen1w);
    }
    veNenCuoi();
    capNhatLegend(duLieuNen.length - 1);
    document.getElementById('symbolPrice').textContent = dinhDangGia(duLieuNen[duLieuNen.length - 1].close);
  };
  ws.onclose = () => {
    datTrangThai('Mất kết nối, đang thử lại...', 'err');
    setTimeout(() => { if (wsNen === ws) moKetNoiRealtime(ma, khung); }, 3000);
  };
}

// WS phụ nhận kline 1h để phát hiện nến H1 đóng → kích hoạt tính lại cobo + EA
function moWsH1Auto(ma) {
  if (wsH1Auto) { wsH1Auto.onclose = null; wsH1Auto.close(); wsH1Auto = null; }
  if (DANH_SACH_VN.find(x => x.ma === ma)) return;
  const ws = new WebSocket(`${WS_BASE}/ws/${ma.toLowerCase()}@kline_1h`);
  wsH1Auto = ws;
  ws.onmessage = (event) => { if (JSON.parse(event.data).k.x) autoLamMoi(ma); };
  ws.onclose = () => { setTimeout(() => { if (wsH1Auto === ws) moWsH1Auto(ma); }, 5000); };
}

// ---------- 7. HIỂN THỊ ----------
function dinhDangGia(g) {
  if (g == null) return '—';
  const soLe = g >= 1000 ? 2 : g >= 1 ? 4 : 6;
  return g.toLocaleString('en-US', { minimumFractionDigits: soLe, maximumFractionDigits: soLe });
}
const so = (v, le = 2) => (v == null ? '—' : v.toFixed(le));

function datTrangThai(text, loai) {
  const el = document.getElementById('status');
  el.querySelector('.status-text').textContent = text;
  el.className = 'status ' + (loai || '');
}

function capNhatLegend(i) {
  const n = duLieuNen[i];
  if (!n || !ketQua) return;
  const cls = n.close >= n.open ? 'up' : 'down';
  const pct = ((n.close - n.open) / n.open) * 100;
  let html =
    `<div><span class="lg-ma">${maHienTai} · ${khungLabel()}</span>` +
    `<b>O</b><span class="${cls}">${dinhDangGia(n.open)}</span>` +
    `<b>H</b><span class="${cls}">${dinhDangGia(n.high)}</span>` +
    `<b>L</b><span class="${cls}">${dinhDangGia(n.low)}</span>` +
    `<b>C</b><span class="${cls}">${dinhDangGia(n.close)}</span>` +
    ` <span class="${cls}">(${pct >= 0 ? '+' : ''}${pct.toFixed(2)}%)</span></div><div class="lg-dong2">`;
  const them = (id, ten, v) => { if (caiDat[id]) html += `<span style="color:${MAU[id]}">${ten} ${dinhDangGia(v)}</span>`; };
  if (caiDat.cumMA && ketQua.cumMA)
    CUM_MA_PERIODS.forEach((p, idx) =>
      html += `<span style="color:${MAU_CUM_MA[idx]}">MA${p} ${dinhDangGia(ketQua.cumMA[idx][i])}</span>`);
  if (caiDat.bbGia20 && ketQua.bbGia20)
    html += `<span style="color:${MAU.bb20}">BB20 ${dinhDangGia(ketQua.bbGia20.giua[i])}</span>`;
  if (caiDat.bbGia55 && ketQua.bbGia55)
    html += `<span style="color:${MAU.bb55}">BB55 ${dinhDangGia(ketQua.bbGia55.giua[i])}</span>`;
  them('vwapY', 'VWAP-N', ketQua.vwapY[i] && ketQua.vwapY[i].value);
  them('vwapQ', 'VWAP-Q', ketQua.vwapQ[i] && ketQua.vwapQ[i].value);
  them('vwapM', 'VWAP-T', ketQua.vwapM[i] && ketQua.vwapM[i].value);
  them('vwapW', 'VWAP-W', ketQua.vwapW[i] && ketQua.vwapW[i].value);
  if (caiDat.bl     && ketQua?.bl?.[i]     != null) html += `<span style="color:${MAU.bl}">BL${blCaiDat.bl.len} ${dinhDangGia(ketQua.bl[i])}</span>`;
  if (caiDat.blSlow && ketQua?.blSlow?.[i] != null) html += `<span style="color:${MAU.blSlow}">BL${blCaiDat.slow.len} ${dinhDangGia(ketQua.blSlow[i])}</span>`;
  html += '</div>';
  const lg = document.getElementById('legend');
  lg.innerHTML = html;
  lg.style.left = '8px';
  document.getElementById('legendRsi').style.left = '8px';

  // Legend của khung RSI: đặt ngay đầu khung dưới
  const lr = document.getElementById('legendRsi');
  const panes = chart.panes();
  if (caiDat.rsi && panes[1] && !phongToKhungGia) {
    lr.style.display = 'block';
    lr.style.top = panes[0].getHeight() + 6 + 'px';
    _applyRsiNhomBtn();
    lr.innerHTML =
      `<span style="color:${MAU.rsi}">RSI ${so(ketQua.rsi[i])}</span>` +
      (rsiNhomBat.ma ? `<span style="color:${MAU.ema9}">EMA9 ${so(ketQua.ema9[i])}</span><span style="color:${MAU.wma45}">WMA45 ${so(ketQua.wma45[i])}</span>` : '') +
      (rsiNhomBat.bb ? `<span style="color:${MAU.bb20}">BB20 ${so(ketQua.bb20.giua[i])}</span><span style="color:${MAU.bb55}">BB55 ${so(ketQua.bb55.giua[i])}</span>` : '');
  } else {
    lr.style.display = 'none';
    _applyRsiNhomBtn();
  }
}

const khungLabel = () => {
  const infoVN = DANH_SACH_VN.find((x) => x.ma === maHienTai);
  const list = infoVN ? KHUNG_GIO_VN : KHUNG_GIO;
  return (list.find((x) => x[0] === khungHienTai) || [khungHienTai, khungHienTai])[1];
};

// Rê chuột / chạm giữ trên biểu đồ → legend hiện số liệu của cây nến đó
chart.subscribeCrosshairMove((param) => {
  _crosshairY = (param.point) ? param.point.y : null;
  let i = duLieuNen.length - 1;
  if (param.time) {
    const j = timNen(param.time);
    if (j >= 0) i = j;
  }
  capNhatLegend(i);
  capNhatNhanGia();
  // Con trỏ: kẻ vẽ > Fib mode > anchor Fib > mũi tên EA > mặc định
  const _cnv = document.querySelector('#chart canvas');
  if (_cnv) {
    const _kvCon = kvConTro(param.point);
    if (_kvCon) {
      _cnv.style.cursor = _kvCon;
    } else if (fibBatMode) {
      _cnv.style.cursor = 'crosshair';
    } else if (param.point && fibSelected && fibAnchorHitTest(param.point.x, param.point.y, 10)) {
      _cnv.style.cursor = 'move';
    } else if (param.point && caiDatEA.hist && caiDatEA.on && eaCoHoTro()) {
      const near = eaVaoTimGanNhat(param.point);
      _cnv.style.cursor = near ? 'pointer' : '';
    } else {
      _cnv.style.cursor = '';
    }
  }
});

// Bấm vào biểu đồ → chọn Fib hoặc hiện popup EA
chart.subscribeClick((param) => {
  if (fibBatMode) return;
  if (kvXuLyClick(param)) return; // nét kẻ vẽ được ưu tiên
  if (param.point) {
    const isMob = window.matchMedia('(pointer: coarse)').matches;
    const thr = isMob ? 14 : 8;
    const hit = fibHitTest(param.point.x, param.point.y, thr);
    if (hit !== null) {
      if (fibSelected === hit) {
        fibSelected = null; fibDiagIds = null;
      } else {
        fibSelected = hit;
        fibDiagIds = fibTinhNhomHopLuu(hit, _fibLastHitPrice);
      }
      fibCapNhatXoaBtn();
      eaVaoDongBang();
      if (fibPrim) fibPrim.update();
      return;
    }
    if (fibSelected) { fibSelected = null; fibDiagIds = null; fibCapNhatXoaBtn(); if (fibPrim) fibPrim.update(); }
  }
  if (!caiDatEA.hist || !eaCoHoTro() || !caiDatEA.on) return;
  if (!param.point) { eaVaoDongBang(); return; }
  const trade = eaVaoTimGanNhat(param.point);
  if (!trade) { eaVaoDongBang(); return; }
  if (eaVaoPopupTrade === trade) { eaVaoDongBang(); return; }
  eaVaoHienBang(trade);
});

// Kéo/zoom biểu đồ hoặc đổi kích thước màn hình → cập nhật vị trí nhãn giá
chart.timeScale().subscribeVisibleLogicalRangeChange((range) => {
  capNhatNhanGia();
  if (range && range.from < 50 && !dangTaiThem && !daHetLichSu) {
    taiThemNenCu();
  }
});
window.addEventListener('resize', () => { capNhatNhanGia(); _applyRsiNhomBtn(); });

// ---------- 8b. THU GỌN WATCHLIST ----------
function _applyWatchlistState() {
  const panel = document.getElementById('watchlistPanel');
  const arrow = document.querySelector('#btnToggleWL .wl-arrow');
  if (!panel) return;
  if (watchlistThuGon) {
    panel.classList.add('thu-gon');
    if (arrow) arrow.textContent = '‹';
  } else {
    panel.classList.remove('thu-gon');
    if (arrow) arrow.textContent = '›';
  }
}

function toggleWatchlist() {
  watchlistThuGon = !watchlistThuGon;
  ghiBoNho('watchlistThuGon', watchlistThuGon);
  _applyWatchlistState();
}

// ---------- 8c. PHÓNG TO KHUNG GIÁ ----------
function _applyRsiPaneSize(panes) {
  const p = panes || chart.panes();
  if (!p[1]) return;
  if (phongToKhungGia) {
    p[0].setStretchFactor(100);
    p[1].setStretchFactor(1);
  } else {
    p[0].setStretchFactor(60);
    p[1].setStretchFactor(40);
  }
}

function _applyPhongToBtn() {
  const btn = document.getElementById('btnPhongTo');
  if (!btn) return;
  btn.textContent = phongToKhungGia ? '⤡' : '⤢';
  btn.title = phongToKhungGia ? 'Thu nhỏ khung giá' : 'Phóng to khung giá';
  btn.classList.toggle('active', phongToKhungGia);
  btn.style.display = caiDat.rsi ? '' : 'none';
}

function _applyRsiNhomBtn() {
  const btn = document.getElementById('btnRsiNhom');
  if (!btn) return;
  const panes = chart.panes();
  if (!caiDat.rsi || !panes[1] || phongToKhungGia) {
    btn.style.display = 'none';
    document.getElementById('popupRsiNhom').style.display = 'none';
    return;
  }
  btn.style.display = '';
  btn.style.top = (panes[0].getHeight() + 6) + 'px';
}

function togglePhongToKhungGia() {
  phongToKhungGia = !phongToKhungGia;
  ghiBoNho('phongToKhungGia', phongToKhungGia);
  try { _applyRsiPaneSize(); } catch (e) {}
  _applyPhongToBtn();
  _applyRsiNhomBtn();
  capNhatLegend(duLieuNen.length - 1);
  capNhatNhanGia();
}

// ---------- 8d. CHẾ ĐỘ THANG GIÁ (Regular / Logarithmic) ----------
// Chỉ thang giá của pane nến chính (chart.priceScale('right') = pane 0); RSI và pane khác giữ nguyên.
// Mọi lớp vẽ riêng (Fib, EA, Co bó) đều lấy y qua series.priceToCoordinate nên tự đúng ở cả hai chế độ.
function apDungCheDoThangGia() {
  try { chart.priceScale('right').applyOptions({ mode: thangGiaMode }); } catch (e) {}
  document.querySelectorAll('#popupThangGia .ptg-item').forEach((it) => {
    it.classList.toggle('active', Number(it.dataset.mode) === thangGiaMode);
  });
  capNhatNutThangGia();
}

function datCheDoThangGia(m) {
  thangGiaMode = m === 1 ? 1 : 0;
  ghiBoNho('priceScaleMode', thangGiaMode);
  apDungCheDoThangGia();
  if (fibPrim) fibPrim.update();
}

// Nút nằm ở góc dưới-trái của cột giá bên phải, ngang hàng thanh trục thời gian
function capNhatNutThangGia() {
  const btn = document.getElementById('btnThangGia');
  if (!btn) return;
  let scaleW = 0, timeH = 0;
  try { scaleW = chart.priceScale('right').width(); } catch (e) {}
  try { timeH = chart.timeScale().height(); } catch (e) {}
  if (!scaleW) scaleW = 56;
  if (!timeH) timeH = 26;
  const h = Math.max(18, Math.min(26, timeH - 4));
  const w = Math.min(h + 2, Math.max(18, scaleW));
  btn.style.width = w + 'px';
  btn.style.height = h + 'px';
  btn.style.bottom = Math.max(1, Math.round((timeH - h) / 2)) + 'px';
  const right = Math.max(0, Math.round(scaleW - w) - 2);
  btn.style.right = right + 'px';
  const pop = document.getElementById('popupThangGia');
  if (pop) {
    pop.style.right = right + 'px';
    pop.style.bottom = (timeH + 6) + 'px';
  }
}

(function () {
  const btn = document.getElementById('btnThangGia');
  const pop = document.getElementById('popupThangGia');
  if (!btn || !pop) return;
  const dong = () => { pop.style.display = 'none'; btn.classList.remove('active'); };
  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    const mo = pop.style.display === 'none' || pop.style.display === '';
    if (mo) { capNhatNutThangGia(); pop.style.display = 'flex'; btn.classList.add('active'); } else dong();
  });
  pop.addEventListener('click', (e) => {
    e.stopPropagation();
    const it = e.target.closest('.ptg-item');
    if (!it) return;
    datCheDoThangGia(Number(it.dataset.mode));
    dong();
  });
  document.addEventListener('click', dong);
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') dong(); });
  try { new ResizeObserver(() => capNhatNutThangGia()).observe(document.getElementById('chart')); } catch (e) {}
  apDungCheDoThangGia();
}());

// Tìm vị trí cây nến theo thời gian (tìm nhị phân cho nhanh)
function timNen(t) {
  let lo = 0, hi = duLieuNen.length - 1;
  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    if (duLieuNen[mid].time === t) return mid;
    if (duLieuNen[mid].time < t) lo = mid + 1; else hi = mid - 1;
  }
  return -1;
}

// Tải lại toàn bộ biểu đồ khi đổi mã / khung giờ
async function napBieuDo() {
  eaVaoDongBang();
  fibTai();
  kvTai();
  const toi = ++phien;
  dangTaiThem = false;
  daHetLichSu = false;
  ghiBoNho('ma', maHienTai);
  ghiBoNho('khung', khungHienTai);
  ghiBoNho('lanCuoi', { ma: maHienTai, khung: khungHienTai });
  document.getElementById('symbolTitle').textContent = maHienTai;
  document.title = `${maHienTai} · Sâu Chart`;
  datTrangThai('Đang tải dữ liệu...');
  if (wsNen) { wsNen.onclose = null; wsNen.close(); wsNen = null; }

  const infoVN = DANH_SACH_VN.find((x) => x.ma === maHienTai);
  try {
    let nen, tienTo = [];
    if (infoVN) {
      if (khungHienTai === '2d') {
        const d = await S1Data.layNenD(maHienTai);
        const bars2d = S1.gopKhung(d, '2D');
        nen = bars2d.map(b => ({ time: b.t / 1000, open: b.o, high: b.h, low: b.l, close: b.c, volume: 0 }));
      } else if (infoVN.loai === 'index') {
        nen = await goiIndexData(maHienTai, khungHienTai);
      } else {
        nen = await goiStockData(maHienTai, khungHienTai);
      }
      if (!nen.length) throw new Error('Không có dữ liệu cho mã này');
    } else {
      // --- Crypto: dùng Binance ---
      if (khungHienTai === '2w') {
        const nen1w = await goiBinance(`symbol=${maHienTai}&interval=1w&limit=1000`);
        nen = _gop2W(nen1w);
        tienTo = await taiTienTo(maHienTai, nen[0]);
      } else {
        nen = await goiBinance(`symbol=${maHienTai}&interval=${khungHienTai}&limit=1000`);
        tienTo = await taiTienTo(maHienTai, nen[0]);
      }
    }
    if (toi !== phien) return;
    duLieuNen = nen;
    nenTienTo = tienTo.filter((x) => x.time < nen[0].time);
    veToanBo();
    if (fibPrim) fibPrim.update();
    chart.timeScale().setVisibleLogicalRange({ from: nen.length - 150, to: nen.length + 5 });
    capNhatLegend(duLieuNen.length - 1);
    document.getElementById('symbolPrice').textContent = dinhDangGia(nen[nen.length - 1].close);
    if (!infoVN) {
      moKetNoiRealtime(maHienTai, khungHienTai === '2w' ? '1w' : khungHienTai);
      moWsH1Auto(maHienTai);
      autoLamMoiLuc = Date.now();
    }
    else { datTrangThai('KBS · dữ liệu VN', 'ok'); }
    batDauNhanGia();
    veNutEA();
    veNutCoBo();
    if (coboBat && !infoVN) {
      const needSMA = coboLoai !== 1;
      const needBB  = coboLoai !== 0;
      const hasSMA  = !!coboKetQua[maHienTai];
      const hasBB   = !!coboBBKetQua[maHienTai];
      if ((needSMA && !hasSMA) || (needBB && !hasBB)) {
        const loads = [];
        if (needSMA && !hasSMA) loads.push(coboTinh(maHienTai));
        if (needBB  && !hasBB)  loads.push(_coboEnsureBB(maHienTai));
        Promise.all(loads).then(() => { coboVe(); coboCapNhat(); coboCapNhatPanel(); });
      } else {
        coboVe();
        coboCapNhat();
      }
    } else {
      coboVe();
    }
    if (caiDatEA.on && eaCoHoTro()) {
      if (eaGetKetQua()) veEA(); else chayEA();
    } else {
      veEA();
    }
  } catch (e) {
    if (toi === phien) datTrangThai(e.message, 'err');
  }
}

// Tải thêm nến cũ khi người dùng kéo sang trái (chỉ cho crypto / Binance)
async function taiThemNenCu() {
  if (dangTaiThem || daHetLichSu) return;
  if (DANH_SACH_VN.find(x => x.ma === maHienTai)) return;
  if (!duLieuNen.length) return;

  dangTaiThem = true;
  const phienNay = phien;
  datTrangThai('Đang tải nến cũ...');

  try {
    const nenCuNhat = duLieuNen[0];
    // Đổi ngược thời gian app (đã cộng LECH_GIO) về UTC ms để làm endTime
    const endTimeMs = (nenCuNhat.time - LECH_GIO) * 1000 - 1;

    let nenMoi;
    let gioiHan;
    if (khungHienTai === '2d') {
      // Binance không có khung 2d → dùng OKX với after (ms của nến cũ nhất)
      const afterMs = (nenCuNhat.time - LECH_GIO) * 1000;
      nenMoi = await goiOKX(maHienTai, '2d', afterMs);
      gioiHan = 300;
    } else if (khungHienTai === '2w') {
      // Fetch 1W cũ hơn nến 2W đầu tiên (cần thêm 1 tuần buffer cho nến biên)
      const endTime1w = (nenCuNhat.time - LECH_GIO) * 1000;
      const raw1w = await goiBinance(`symbol=${maHienTai}&interval=1w&endTime=${endTime1w}&limit=1000`);
      gioiHan = 1000;
      // Gộp thành 2W, loại nến cuối có cùng maCap với nến đầu tiên hiện có (nến biên)
      const all2w = _gop2W(raw1w);
      const dauHienCo = duLieuNen[0].time;
      nenMoi = all2w.filter(n => n.time < dauHienCo);
    } else {
      nenMoi = await goiBinance(
        `symbol=${maHienTai}&interval=${khungHienTai}&endTime=${endTimeMs}&limit=1000`
      );
      gioiHan = 1000;
    }

    if (phienNay !== phien) return; // mã/khung đã đổi trong lúc tải

    if (khungHienTai === '2w') {
      if (!nenMoi.length) { daHetLichSu = true; datTrangThai('Đã tới nến đầu tiên', 'ok'); return; }
    } else {
      if (nenMoi.length < gioiHan) daHetLichSu = true;
      if (!nenMoi.length) { datTrangThai('Đã tới nến đầu tiên', 'ok'); return; }
    }

    // Loại trùng theo time rồi ghép vào đầu
    const daCoTime = new Set(duLieuNen.map(n => n.time));
    const them = nenMoi.filter(n => !daCoTime.has(n.time));

    if (!them.length) {
      daHetLichSu = true;
      datTrangThai('Đã tới nến đầu tiên', 'ok');
      return;
    }

    // Lưu range hiện tại để bù offset sau khi thêm nến
    const range = chart.timeScale().getVisibleLogicalRange();
    duLieuNen = [...them, ...duLieuNen];
    veToanBo();
    coboCapNhat();

    // Dịch range đúng số nến vừa chèn để biểu đồ không nhảy
    if (range) {
      chart.timeScale().setVisibleLogicalRange({
        from: range.from + them.length,
        to: range.to + them.length,
      });
    }

    datTrangThai(daHetLichSu ? 'Đã tới nến đầu tiên' : 'Real-time', 'ok');
  } catch (e) {
    console.warn('Lỗi tải thêm nến:', e);
    if (phienNay === phien) datTrangThai('Real-time', 'ok');
  } finally {
    dangTaiThem = false;
  }
}

// ---------- 7.5. VÙNG CO BÓ ----------

function _sma(closes, period) {
  const out = new Float64Array(closes.length);
  let sum = 0;
  for (let i = 0; i < closes.length; i++) {
    sum += closes[i];
    if (i >= period) sum -= closes[i - period];
    if (i >= period - 1) out[i] = sum / period;
  }
  return out;
}

function _gopH2(h1bars) {
  const m = new Map();
  const cnt = new Map();
  for (const b of h1bars) {
    const k = Math.floor(b.t / 7200000) * 7200000;
    if (!m.has(k)) { m.set(k, {t:k, o:b.o, h:b.h, l:b.l, c:b.c}); cnt.set(k, 1); }
    else { const e = m.get(k); e.h = Math.max(e.h, b.h); e.l = Math.min(e.l, b.l); e.c = b.c; cnt.set(k, cnt.get(k)+1); }
  }
  return [...m.values()].filter(e => cnt.get(e.t) >= 2).sort((a,b) => a.t - b.t);
}

// Tính trước mảng độ rộng + khoảng cách giá→SMA gần nhất (NaN khi chưa đủ SMA987)
function _coboCalcWidths(bars, kInfo) {
  const { smas: periods, soDuong: K, ms: durMs } = kInfo;
  const maxP = periods[periods.length - 1]; // 987
  const closes = bars.map(b => b.c);
  const smaArrays = periods.map(p => _sma(closes, p));
  const widths = new Float32Array(bars.length).fill(NaN);
  const minDists = new Float32Array(bars.length).fill(NaN);
  for (let i = maxP - 1; i < bars.length; i++) {
    const close = closes[i];
    // Sắp 8 SMA theo |SMA − close| tăng dần, lấy K đường gần nhất
    const vals = smaArrays.map(s => s[i]);
    vals.sort((a, b) => Math.abs(a - close) - Math.abs(b - close));
    let lo = vals[0], hi = vals[0];
    for (let j = 1; j < K; j++) {
      if (vals[j] < lo) lo = vals[j];
      if (vals[j] > hi) hi = vals[j];
    }
    widths[i] = (hi - lo) / close * 100;
    // vals đã sắp tăng dần theo |SMA−close| → vals[0] là SMA gần nhất
    minDists[i] = Math.abs(vals[0] - close) / close * 100;
  }
  return { widths, minDists, ts: bars.map(b => b.t), durMs };
}

// Dựng danh sách vùng từ mảng độ rộng + ngưỡng (tức thì, không tính lại SMA)
// Điều kiện (a): widths[i] ≤ nguong  VÀ  (b): minDists[i] ≤ COBO_KC_GIA
function _coboFromWidths({ widths, minDists, ts, durMs }, nguong) {
  const zones = [];
  let zStart = null;
  for (let i = 0; i < widths.length; i++) {
    const w = widths[i];
    if (isNaN(w)) {
      if (zStart !== null) { zones.push({s: zStart, e: ts[i]}); zStart = null; }
      continue;
    }
    if (w <= nguong && minDists[i] <= COBO_KC_GIA) {
      if (zStart === null) zStart = ts[i];
    } else {
      if (zStart !== null) { zones.push({s: zStart, e: ts[i]}); zStart = null; }
    }
  }
  if (zStart !== null && ts.length) zones.push({s: zStart, e: ts[ts.length-1] + durMs});
  return zones;
}

function _coboBBCalcW3s(dbars) {
  const closes = dbars.map(b => b.c);
  const sma20 = _sma(closes, 20);
  const sma55 = _sma(closes, 55);
  const n = dbars.length;
  const w3s = new Float32Array(n).fill(NaN);
  for (let i = 54; i < n; i++) {
    const cl = closes[i], s20 = sma20[i], s55 = sma55[i];
    const hi = Math.max(cl, s20, s55), lo = Math.min(cl, s20, s55);
    w3s[i] = (hi - lo) / cl * 100;
  }
  return { w3s, ts: dbars.map(b => b.t) };
}

function _coboBBFromW3s({ w3s, ts }, nguong) {
  const zones = [];
  let zStart = null;
  for (let i = 0; i < w3s.length; i++) {
    const w = w3s[i];
    if (isNaN(w)) {
      if (zStart !== null) { zones.push({s: zStart, e: ts[i]}); zStart = null; }
      continue;
    }
    if (w <= nguong) {
      if (zStart === null) zStart = ts[i];
    } else {
      if (zStart !== null) { zones.push({s: zStart, e: ts[i]}); zStart = null; }
    }
  }
  if (zStart !== null && ts.length) zones.push({s: zStart, e: ts[ts.length-1] + 86400000});
  return zones;
}

function _coboOverlap(zones, startMs, endMs) {
  // Binary search: find first zone with e > startMs
  let lo = 0, hi = zones.length - 1;
  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    if (zones[mid].e <= startMs) lo = mid + 1; else hi = mid - 1;
  }
  return lo < zones.length && zones[lo].s < endMs;
}

function coboBitCount(mask) {
  let n = 0; let m = mask;
  while (m) { n += m & 1; m >>= 1; }
  return n;
}

function _coboKhungMs() {
  const map = {'15m':900000,'30m':1800000,'1h':3600000,'2h':7200000,'4h':14400000,
    '8h':28800000,'12h':43200000,'1d':86400000,'2d':172800000,'3d':259200000,
    '1w':604800000,'2w':1209600000};
  return map[khungHienTai] || 2635200000; // 1M ≈ 30.5 ngày
}

class CoboPrimitive {
  constructor() { this._series = null; this._chart = null; }
  attached(p) { this._series = p.series; this._chart = p.chart; }
  detached() { this._series = null; this._chart = null; }
  updateAllViews() {}

  paneViews() {
    const self = this;
    return [{
      renderer() {
        return {
          draw(target) {
            if (!self._chart || !coboBat) return;
            const hasSMA = coboBitmask.length > 0;
            const hasBB  = coboBBMask.length > 0;
            if (coboLoai === 0 && !hasSMA) return;
            if (coboLoai === 1 && !hasBB) return;
            if (coboLoai === 2 && !hasSMA && !hasBB) return;
            target.useBitmapCoordinateSpace(({ context: ctx, horizontalPixelRatio: hpr, verticalPixelRatio: vpr, bitmapSize }) => {
              const ts = self._chart.timeScale();
              const barH = Math.max(1, Math.round(5 * vpr));
              const gap = Math.round(7 * vpr);
              const lr = ts.getVisibleLogicalRange();
              if (!lr) return;
              const iFrom = Math.max(0, Math.floor(lr.from));
              const iTo = Math.min(duLieuNen.length - 1, Math.ceil(lr.to));

              const _xbcw = (i) => {
                const x = ts.timeToCoordinate(duLieuNen[i].time);
                if (x == null) return null;
                const xb = Math.round(x * hpr);
                let cw;
                if (i + 1 <= iTo) {
                  const xn = ts.timeToCoordinate(duLieuNen[i+1].time);
                  cw = xn != null ? Math.max(1, Math.round((xn - x) * hpr)) : Math.round(4 * hpr);
                } else {
                  cw = Math.round(4 * hpr);
                }
                return { xb, cw };
              };

              ctx.save();

              if (coboLoai === 0) {
                const visMask = COBO_KHUNG.reduce((a, k) => coboVisBat[k.id] ? a|k.bit : a, 0);
                for (let i = iFrom; i <= iTo; i++) {
                  const rawMask = coboBitmask[i] || 0;
                  if (!rawMask) continue;
                  const activeBits = coboBitCount(rawMask);
                  let showMask = 0;
                  if (coboComboSel) {
                    showMask = rawMask === coboComboSel ? rawMask : 0;
                  } else if (coboTabSel === 0) {
                    showMask = rawMask & visMask;
                  } else if (coboTabSel === 5) {
                    showMask = activeBits === 5 ? rawMask : 0;
                  } else {
                    showMask = activeBits >= coboTabSel ? rawMask : 0;
                  }
                  if (!showMask) continue;
                  const r = _xbcw(i); if (!r) continue;
                  const { xb, cw } = r;
                  // Nền tối mỏng để bars nổi bật trên mọi màu nền
                  ctx.fillStyle = 'rgba(0,0,0,0.45)';
                  ctx.fillRect(xb, 0, cw, COBO_KHUNG.length * gap + barH);
                  for (let ki = 0; ki < COBO_KHUNG.length; ki++) {
                    if (!(showMask & COBO_KHUNG[ki].bit)) continue;
                    ctx.fillStyle = COBO_KHUNG[ki].mau;
                    ctx.fillRect(xb, ki * gap, cw, barH);
                  }
                }
              } else if (coboLoai === 1) {
                const BBM = '#e8c547';
                for (let i = iFrom; i <= iTo; i++) {
                  if (!coboBBMask[i]) continue;
                  const r = _xbcw(i); if (!r) continue;
                  const { xb, cw } = r;
                  ctx.fillStyle = BBM;
                  ctx.fillRect(xb, 0, cw, barH);
                }
              } else {
                const C_TIM = '#d65db1', C_XAM = '#8a8f98', C_VANG = '#e8c547';
                const visMask2 = COBO_KHUNG.reduce((a, k) => coboVisBat[k.id] ? a|k.bit : a, 0);
                const N_KH = COBO_KHUNG.length;
                for (let i = iFrom; i <= iTo; i++) {
                  let cm = coboCombMask[i] || 0;
                  if (!coboBBVisBat.tim)  cm &= ~1;
                  if (!coboBBVisBat.xam)  cm &= ~2;
                  if (!coboBBVisBat.vang) cm &= ~4;
                  let smaBits = coboSmaShiftMask[i] || 0;
                  if (visMask2) smaBits &= visMask2;
                  if (!cm && !smaBits) continue;
                  const r = _xbcw(i); if (!r) continue;
                  const { xb, cw } = r;
                  const hasColor = !!cm, hasBands = !!smaBits;
                  // Nền tối phía sau bars
                  const darkH = !hasBands ? barH : (hasColor ? (1 + N_KH) : N_KH) * gap + barH;
                  ctx.fillStyle = 'rgba(0,0,0,0.45)';
                  ctx.fillRect(xb, 0, cw, darkH);
                  // Bar màu ở y=0 (ưu tiên: tím > xám > vàng)
                  if (hasColor) {
                    if      (cm & 1) ctx.fillStyle = C_TIM;
                    else if (cm & 2) ctx.fillStyle = C_XAM;
                    else             ctx.fillStyle = C_VANG;
                    ctx.fillRect(xb, 0, cw, barH);
                  }
                  // Dải 5 khung SMA: coboBitmask thực tế, dưới bar màu
                  if (hasBands) {
                    const bandOffset = hasColor ? gap : 0;
                    for (let ki = 0; ki < N_KH; ki++) {
                      if (!(smaBits & COBO_KHUNG[ki].bit)) continue;
                      ctx.fillStyle = COBO_KHUNG[ki].mau;
                      ctx.fillRect(xb, bandOffset + ki * gap, cw, barH);
                    }
                  }
                }
              }

              ctx.restore();
            });
          },
        };
      },
    }];
  }
}

async function coboTinh(ma) {
  if (coboLoading) return;
  coboLoading = true;
  datTrangThai('Đang tính vùng co bó…');
  try {
    const TU = Date.UTC(2019, 6, 1);
    const [h1bars, h4bars, h8bars, h12bars] = await Promise.all([
      L5Data.layKhung(ma, '1h', TU),
      L5Data.layKhung(ma, '4h', TU),
      L5Data.layKhung(ma, '8h', TU),
      L5Data.layKhung(ma, '12h', TU),
    ]);
    const h2bars = _gopH2(h1bars);
    const CFG = Object.fromEntries(COBO_KHUNG.map(k => [k.id, k]));
    const calc = {
      h4:  _coboCalcWidths(h4bars,  CFG.h4),
      h8:  _coboCalcWidths(h8bars,  CFG.h8),
      h2:  _coboCalcWidths(h2bars,  CFG.h2),
      h12: _coboCalcWidths(h12bars, CFG.h12),
      h1:  _coboCalcWidths(h1bars,  CFG.h1),
    };
    coboKetQua[ma] = {
      h4:  { ...calc.h4,  zones: _coboFromWidths(calc.h4,  coboNguong) },
      h8:  { ...calc.h8,  zones: _coboFromWidths(calc.h8,  coboNguong) },
      h2:  { ...calc.h2,  zones: _coboFromWidths(calc.h2,  coboNguong) },
      h12: { ...calc.h12, zones: _coboFromWidths(calc.h12, coboNguong) },
      h1:  { ...calc.h1,  zones: _coboFromWidths(calc.h1,  coboNguong) },
      lastH1T: h1bars.length ? h1bars[h1bars.length-1].t : 0,
    };
    datTrangThai('Real-time', 'ok');
  } catch (e) {
    datTrangThai('Lỗi vùng co bó: ' + e.message, 'err');
  } finally {
    coboLoading = false;
  }
}

// Tính bitmask cho mỗi nến theo 4 mảng song song:
//   coboBitmask:      SMA gốc (không dịch) → coboLoai=0
//   coboBBMask:       BB đã dịch +1 ngày   → coboLoai=1
//   coboSmaShiftMask: SMA đã dịch +độ dài khung (mỗi khung riêng) → dải trong coboLoai=2
//   coboCombMask:     TÍM(1)/XÁM(2)/VÀNG(4) = giao/hiệu tập BB và SMA đã dịch → coboLoai=2
function coboTinhBitmask() {
  coboBitmask = new Array(duLieuNen.length).fill(0);
  coboBBMask = new Array(duLieuNen.length).fill(0);
  coboCombMask = new Array(duLieuNen.length).fill(0);
  coboSmaShiftMask = new Array(duLieuNen.length).fill(0);
  if (!coboBat || !duLieuNen.length) return;
  if (DANH_SACH_VN.find(x => x.ma === maHienTai)) return;
  const kq = coboKetQua[maHienTai];
  const bbKq = coboBBKetQua[maHienTai];
  const khungMs = _coboKhungMs();
  const D_MS = 86400000;
  const KHUNG_FMS = { h12: 43200000, h8: 28800000, h4: 14400000, h2: 7200000, h1: 3600000 };

  // Interval helpers (tính 1 lần khi dữ liệu đổi, không tính lại mỗi lần vẽ)
  function ivMerge(ivs) {
    if (!ivs.length) return [];
    const s = ivs.slice().sort((a, b) => a.from - b.from);
    const out = [{ from: s[0].from, to: s[0].to }];
    for (let i = 1; i < s.length; i++) {
      const cur = out[out.length - 1];
      if (s[i].from <= cur.to) { if (s[i].to > cur.to) cur.to = s[i].to; }
      else out.push({ from: s[i].from, to: s[i].to });
    }
    return out;
  }
  function ivIntersect(A, B) {
    const out = []; let ai = 0, bi = 0;
    while (ai < A.length && bi < B.length) {
      const f = Math.max(A[ai].from, B[bi].from), t = Math.min(A[ai].to, B[bi].to);
      if (f < t) out.push({ from: f, to: t });
      if (A[ai].to < B[bi].to) ai++; else bi++;
    }
    return out;
  }
  function ivSubtract(A, B) {
    if (!B.length) return A.slice();
    const out = []; let bi = 0;
    for (const a of A) {
      while (bi < B.length && B[bi].to <= a.from) bi++;
      let cur = a.from, bj = bi;
      while (bj < B.length && B[bj].from < a.to) {
        if (cur < B[bj].from) out.push({ from: cur, to: B[bj].from });
        if (B[bj].to > cur) cur = B[bj].to;
        bj++;
      }
      if (cur < a.to) out.push({ from: cur, to: a.to });
    }
    return out;
  }
  function ivOverlaps(ivs, a, b) {
    if (!ivs.length) return false;
    let lo = 0, hi = ivs.length;
    while (lo < hi) { const m = (lo + hi) >> 1; if (ivs[m].to <= a) lo = m + 1; else hi = m; }
    return lo < ivs.length && ivs[lo].from < b;
  }

  // Danh sách đã dịch: BB +1 ngày, SMA mỗi khung + độ dài khung
  const bbShifted = bbKq?.zones?.length
    ? ivMerge(bbKq.zones.map(z => ({ from: z.s + D_MS, to: z.e + D_MS })))
    : [];
  const smaPerFrame = {};
  const smaAllRaw = [];
  for (const k of COBO_KHUNG) {
    const fms = KHUNG_FMS[k.id];
    if (!fms || !kq?.[k.id]?.zones?.length) { smaPerFrame[k.id] = []; continue; }
    smaPerFrame[k.id] = ivMerge(kq[k.id].zones.map(z => ({ from: z.s + fms, to: z.e + fms })));
    for (const iv of smaPerFrame[k.id]) smaAllRaw.push(iv);
  }
  const smaAll = ivMerge(smaAllRaw);
  const ivTim  = ivIntersect(bbShifted, smaAll); // TÍM = BB ∩ SMA
  const ivVang = ivSubtract(bbShifted, smaAll);  // VÀNG = BB − SMA
  const ivXam  = ivSubtract(smaAll, bbShifted);  // XÁM = SMA − BB

  for (let i = 0; i < duLieuNen.length; i++) {
    const a = (duLieuNen[i].time - LECH_GIO) * 1000;
    const b = (i+1 < duLieuNen.length)
      ? (duLieuNen[i+1].time - LECH_GIO) * 1000
      : a + khungMs;

    // coboBitmask: SMA zone gốc (không dịch) cho coboLoai=0
    if (kq) {
      let mask = 0;
      for (const k of COBO_KHUNG) {
        if (!kq[k.id]?.zones?.length) continue;
        if (_coboOverlap(kq[k.id].zones, a, b)) mask |= k.bit;
      }
      coboBitmask[i] = mask;
    }

    // coboSmaShiftMask: SMA đã dịch mỗi khung (dải coboLoai=2)
    {
      let mask = 0;
      for (const k of COBO_KHUNG) {
        if (ivOverlaps(smaPerFrame[k.id], a, b)) mask |= k.bit;
      }
      coboSmaShiftMask[i] = mask;
    }

    // coboBBMask: BB đã dịch (coboLoai=1)
    coboBBMask[i] = ivOverlaps(bbShifted, a, b) ? 1 : 0;

    // coboCombMask: TÍM/XÁM/VÀNG (coboLoai=2)
    {
      let cm = 0;
      if (ivOverlaps(ivTim,  a, b)) cm |= 1;
      if (ivOverlaps(ivXam,  a, b)) cm |= 2;
      if (ivOverlaps(ivVang, a, b)) cm |= 4;
      coboCombMask[i] = cm;
    }
  }
}

function coboVe() {
  if (coboPrim) { try { nenSeries.detachPrimitive(coboPrim); } catch(e){} coboPrim = null; }
  if (!coboBat || DANH_SACH_VN.find(x => x.ma === maHienTai)) return;
  coboPrim = new CoboPrimitive();
  nenSeries.attachPrimitive(coboPrim);
}

async function coboBBTinh(ma) {
  if (DANH_SACH_VN.find(x => x.ma === ma)) return;
  const TU = Date.UTC(2019, 6, 1);
  const rawBars = await L5Data.layKhung(ma, '1d', TU);
  const nowMs = Date.now();
  const dbars = rawBars.filter(b => b.t + 86400000 <= nowMs);
  if (!dbars.length) return;
  const calc = _coboBBCalcW3s(dbars);
  coboBBKetQua[ma] = { ...calc, zones: _coboBBFromW3s(calc, coboNguongBB) };
}

async function _coboEnsureBB(ma) {
  if (coboBBKetQua[ma]) return;
  if (DANH_SACH_VN.find(x => x.ma === ma)) return;
  datTrangThai('Đang tính vùng co bó BB…');
  try {
    await coboBBTinh(ma);
    datTrangThai('Real-time', 'ok');
  } catch(e) {
    datTrangThai('Lỗi co bó BB: ' + e.message, 'err');
  }
}

function coboCapNhatNguongBB(nguong) {
  coboNguongBB = nguong;
  ghiBoNho('coboNguongBB', nguong);
  const ma = maHienTai;
  if (!coboBBKetQua[ma]) return;
  coboBBKetQua[ma].zones = _coboBBFromW3s(coboBBKetQua[ma], coboNguongBB);
  coboCapNhat();
}

function _coboCombDayCounts(ma) {
  const bbKq = coboBBKetQua[ma];
  const kq = coboKetQua[ma];
  if (!bbKq || !kq) return { tim:0, xam:0, vang:0, totalD:0 };
  let tim = 0, xam = 0, vang = 0, totalD = 0;
  for (let i = 0; i < bbKq.ts.length; i++) {
    if (isNaN(bbKq.w3s[i])) continue;
    totalD++;
    const dMs = bbKq.ts[i];
    const dEnd = dMs + 86400000;
    let smaFlag = false;
    for (const k of COBO_KHUNG) {
      if (!kq[k.id]?.zones?.length) continue;
      if (_coboOverlap(kq[k.id].zones, dMs, dEnd)) { smaFlag = true; break; }
    }
    const bbFlag = bbKq.w3s[i] <= coboNguongBB;
    if (smaFlag && bbFlag) tim++;
    else if (smaFlag) xam++;
    else if (bbFlag) vang++;
  }
  return { tim, xam, vang, totalD };
}

function coboCapNhatNguong(nguong) {
  coboNguong = nguong;
  ghiBoNho('coboNguong_v3', nguong);
  const ma = maHienTai;
  if (!coboKetQua[ma]) return;
  for (const k of COBO_KHUNG) {
    const d = coboKetQua[ma][k.id];
    if (d) d.zones = _coboFromWidths(d, coboNguong);
  }
  coboCapNhat();
}

function coboCapNhat() {
  coboTinhBitmask();
  if (coboPrim) try { coboPrim._series?.requestUpdate?.() || nenSeries.update(duLieuNen[duLieuNen.length-1]); } catch(e){}
  coboVeBang();
}

function _coboVeBangBB(el) {
  const bbKq = coboBBKetQua[maHienTai];
  if (!bbKq) {
    el.innerHTML = '<div style="color:#888;font-size:12px;padding:4px 0">Chưa có dữ liệu BB</div>';
    return;
  }
  const { w3s } = bbKq;
  let totalD = 0, bbCnt = 0;
  for (let i = 0; i < w3s.length; i++) {
    if (isNaN(w3s[i])) continue;
    totalD++;
    if (w3s[i] <= coboNguongBB) bbCnt++;
  }
  const fPct = (n, d) => d > 0 ? (n/d*100).toFixed(1)+'%' : '—';
  el.innerHTML = `<div style="font-size:12px;padding:4px 0">` +
    `<span style="color:#e8c547">■</span> Co bó BB: <b>${bbCnt}</b> ngày D` +
    ` <span style="color:#888">(${fPct(bbCnt, totalD)} / ${totalD} ngày có dữ liệu)</span></div>` +
    `<div style="color:#888;font-size:11px;padding:1px 0;font-style:italic">Vùng hiện từ lúc nến D BB đóng (dịch 1 ngày).</div>`;
}

function _coboVeBangComb(el) {
  const bbKq = coboBBKetQua[maHienTai];
  const kq = coboKetQua[maHienTai];
  if (!bbKq || !kq) {
    el.innerHTML = '<div style="color:#888;font-size:12px;padding:4px 0">Chưa có dữ liệu</div>';
    return;
  }
  const { tim, xam, vang, totalD } = _coboCombDayCounts(maHienTai);
  const fPct = (n, d) => d > 0 ? (n/d*100).toFixed(1)+'%' : '—';
  const total = tim + xam + vang;
  let html = `<table class="cobo-tbl"><thead><tr><th>Loại</th><th>Ngày D</th><th>%</th></tr></thead><tbody>`;
  if (coboBBVisBat.tim)  html += `<tr><td><span class="cobo-badge" style="color:#d65db1;border-color:#d65db1">TÍM</span></td><td>${tim}</td><td>${fPct(tim,totalD)}</td></tr>`;
  if (coboBBVisBat.xam)  html += `<tr><td><span class="cobo-badge" style="color:#8a8f98;border-color:#8a8f98">XÁM</span></td><td>${xam}</td><td>${fPct(xam,totalD)}</td></tr>`;
  if (coboBBVisBat.vang) html += `<tr><td><span class="cobo-badge" style="color:#e8c547;border-color:#e8c547">VÀNG</span></td><td>${vang}</td><td>${fPct(vang,totalD)}</td></tr>`;
  html += `<tr class="cobo-tot"><td>Tổng</td><td>${total}</td><td>${fPct(total,totalD)}</td></tr>`;
  html += `</tbody></table>`;
  html += `<div style="color:#888;font-size:11px;padding:2px 0">/ ${totalD} ngày D có dữ liệu</div>`;
  html += `<div style="color:#888;font-size:11px;padding:1px 0;font-style:italic">Vùng hiện từ lúc nến tạo vùng đóng; tím = BB và SMA cùng tồn tại.</div>`;
  el.innerHTML = html;
}

function coboVeBang() {
  const el = document.getElementById('coboBang');
  if (!el) return;
  const isVN = !!DANH_SACH_VN.find(x => x.ma === maHienTai);
  if (isVN || !coboBat) {
    el.innerHTML = '<div style="color:#888;font-size:12px;padding:4px 0">Chưa có dữ liệu</div>';
    return;
  }
  if (coboLoai === 1) { _coboVeBangBB(el); return; }
  if (coboLoai === 2) { _coboVeBangComb(el); return; }
  if (!coboBitmask.length || !coboKetQua[maHienTai]) {
    el.innerHTML = '<div style="color:#888;font-size:12px;padding:4px 0">Chưa có dữ liệu</div>';
    return;
  }

  const totalAll = duLieuNen.length;
  const fPct = (n, d) => d > 0 ? (n/d*100).toFixed(1)+'%' : '—';

  if (coboTabSel === 0 && !coboComboSel) {
    // Per-frame: bảng đơn giản — mỗi khung đang bật 1 dòng
    let html = `<table class="cobo-tbl"><thead><tr>`;
    html += `<th>Khung</th><th>Nến</th><th>%</th></tr></thead><tbody>`;
    for (const k of COBO_KHUNG) {
      if (!coboVisBat[k.id]) continue;
      let cnt = 0;
      for (let i = 0; i < coboBitmask.length; i++) {
        if (coboBitmask[i] & k.bit) cnt++;
      }
      html += `<tr><td><span class="cobo-badge" style="color:${k.mau};border-color:${k.mau}">${k.id.toUpperCase()}</span></td>`;
      html += `<td>${cnt}</td><td>${fPct(cnt, totalAll)}</td></tr>`;
    }
    html += `</tbody></table>`;
    el.innerHTML = html;
    return;
  }

  // Chế độ chồng khung hoặc comboSel
  const minBits = coboTabSel === 5 ? 5 : coboTabSel;
  const counts = new Map();
  let totalCobo = 0;
  for (let i = 0; i < duLieuNen.length; i++) {
    const mask = coboBitmask[i];
    if (!mask) continue;
    const bits = coboBitCount(mask);
    const ok = coboTabSel === 5 ? bits === 5 : bits >= minBits;
    if (!ok) continue;
    counts.set(mask, (counts.get(mask) || 0) + 1);
    totalCobo++;
  }

  const rows = [...counts.entries()].sort((a,b) => b[1]-a[1]);

  let html = `<div style="color:#888;font-size:11px;margin:4px 0 6px">`;
  html += `Nến co bó: <b style="color:var(--text)">${totalCobo}</b> / ${totalAll} (${fPct(totalCobo, totalAll)})</div>`;
  html += `<table class="cobo-tbl"><thead><tr>`;
  html += `<th>Tổ hợp</th><th>Nến</th><th>%</th></tr></thead><tbody>`;

  for (const [mask, cnt] of rows) {
    const isSel = coboComboSel === mask;
    html += `<tr class="cobo-combo-row${isSel?' sel':''}" data-mask="${mask}">`;
    html += `<td>`;
    for (const k of COBO_KHUNG) {
      if (mask & k.bit)
        html += `<span class="cobo-badge" style="color:${k.mau};border-color:${k.mau}">${k.id.toUpperCase()}</span>`;
    }
    html += `</td><td>${cnt}</td><td>${fPct(cnt, totalAll)}</td></tr>`;
  }
  html += `<tr class="cobo-tot"><td>Tổng</td><td>${totalCobo}</td><td>${fPct(totalCobo, totalAll)}</td></tr>`;
  html += `</tbody></table>`;
  el.innerHTML = html;

  el.querySelectorAll('.cobo-combo-row').forEach(row => {
    row.onclick = () => {
      const mask = parseInt(row.dataset.mask);
      coboComboSel = coboComboSel === mask ? 0 : mask;
      coboCapNhat();
    };
  });
}

function veNutCoBo() {
  const btn = document.getElementById('btnCoBo');
  if (!btn) return;
  const isVN = !!DANH_SACH_VN.find(x => x.ma === maHienTai);
  btn.disabled = isVN;
  btn.style.opacity = isVN ? '0.4' : '';
  btn.title = isVN ? 'Chỉ hỗ trợ crypto' : '';
  btn.classList.toggle('active', coboBat && !isVN);
}

function coboLapLich() {
  if (coboTimer) clearInterval(coboTimer);
  coboTimer = setInterval(async () => {
    if (!coboBat || coboLoading) return;
    if (DANH_SACH_VN.find(x => x.ma === maHienTai)) return;
    const ma = maHienTai;
    const prevH1T = coboKetQua[ma]?.lastH1T || 0;
    if (coboLoai !== 1) await coboTinh(ma);
    if (coboLoai !== 0) {
      await coboBBTinh(ma);
    }
    const changed = (coboKetQua[ma]?.lastH1T !== prevH1T) || coboLoai !== 0;
    if (changed) coboCapNhat();
  }, 5 * 60 * 1000);
}

// Tính lại cobo + EA khi nến H1 mới đóng (gọi từ wsH1Auto và visibilitychange)
async function autoLamMoi(ma) {
  autoLamMoiLuc = Date.now();
  if (ma !== maHienTai) return;
  if (DANH_SACH_VN.find(x => x.ma === ma)) return;
  if (coboBat && !coboLoading) {
    const loads = [];
    if (coboLoai !== 1) loads.push(coboTinh(ma));
    if (coboLoai !== 0) loads.push(coboBBTinh(ma));
    if (loads.length) {
      await Promise.all(loads);
      if (ma === maHienTai) { coboVe(); coboCapNhat(); coboCapNhatPanel(); }
    }
  }
  if (caiDatEA.on && eaCoHoTro() && !eaLoading) {
    if (eaIsF3()) delete eaF3KetQua[ma];
    else delete eaKetQua[ma];
    chayEA();
  }
}

function khoiDongCoBoPanel() {
  const panel = document.getElementById('panelCoBo');
  const btn = document.getElementById('btnCoBo');
  if (!panel || !btn) return;

  btn.onclick = async () => {
    const isVN = !!DANH_SACH_VN.find(x => x.ma === maHienTai);
    if (isVN) return;
    coboBat = !coboBat;
    ghiBoNho('coboBat_v3', coboBat);
    veNutCoBo();
    if (coboBat) {
      panel.hidden = false;
      const needSMA = coboLoai !== 1;
      const needBB  = coboLoai !== 0;
      if (needSMA && !coboKetQua[maHienTai]) await coboTinh(maHienTai);
      if (needBB)  await _coboEnsureBB(maHienTai);
      coboVe();
      coboCapNhat();
      coboCapNhatPanel();
    } else {
      panel.hidden = true;
      coboVe();
    }
  };

  document.getElementById('btnDongCoBo').onclick = () => { panel.hidden = true; };
  panel.onclick = e => { if (e.target === panel) panel.hidden = true; };
}

function coboCapNhatPanel() {
  const loaiRow = document.getElementById('coboLoaiRow');
  if (!loaiRow) return;

  // Hàng loại co bó
  loaiRow.innerHTML = '';
  [['Co bó SMA', 0], ['Co bó BB', 1], ['SMA + BB', 2]].forEach(([label, v]) => {
    const b = document.createElement('button');
    b.className = 'cobo-btn' + (coboLoai === v ? ' active' : '');
    b.textContent = label;
    b.onclick = async () => {
      coboLoai = v;
      ghiBoNho('coboLoai', v);
      coboCapNhatPanel();
      coboCapNhat();
      if (coboLoai !== 0 && !coboBBKetQua[maHienTai]) {
        await _coboEnsureBB(maHienTai);
        coboCapNhat();
        coboCapNhatPanel();
      }
    };
    loaiRow.appendChild(b);
  });

  // Show/hide BB ngưỡng
  const bbNhom = document.getElementById('coboBBNhom');
  const bbNguongRow = document.getElementById('coboBBNguongRow');
  const showBB = coboLoai !== 0;
  if (bbNhom)     bbNhom.style.display     = showBB ? '' : 'none';
  if (bbNguongRow) bbNguongRow.style.display = showBB ? '' : 'none';

  if (showBB && bbNguongRow) {
    bbNguongRow.innerHTML = '';
    [3, 4, 5].forEach(v => {
      const b = document.createElement('button');
      b.className = 'cobo-btn' + (coboNguongBB === v ? ' active' : '');
      b.textContent = v + '%';
      b.onclick = () => { coboCapNhatNguongBB(v); coboCapNhatPanel(); };
      bbNguongRow.appendChild(b);
    });
  }

  // Show/hide SMA rows
  const showSMA = coboLoai !== 1;
  const smaNhom  = document.getElementById('coboSMANhom');
  const khungNhom = document.getElementById('coboKhungNhom');
  const tabNhom   = document.getElementById('coboTabNhom');
  const nguongRow = document.getElementById('coboNguongRow');
  const visRow    = document.getElementById('coboVisRow');
  const tabRow    = document.getElementById('coboTabRow');
  if (smaNhom)   smaNhom.style.display   = showSMA ? '' : 'none';
  if (khungNhom) khungNhom.style.display = showSMA ? '' : 'none';
  if (tabNhom)   tabNhom.style.display   = showSMA ? '' : 'none';
  if (nguongRow) nguongRow.style.display = showSMA ? '' : 'none';
  if (visRow)    visRow.style.display    = showSMA ? '' : 'none';
  if (tabRow)    tabRow.style.display    = showSMA ? '' : 'none';

  if (showSMA) {
    if (nguongRow) {
      nguongRow.innerHTML = '';
      [5, 4, 3.5, 3].forEach(v => {
        const b = document.createElement('button');
        b.className = 'cobo-btn' + (coboNguong === v ? ' active' : '');
        b.textContent = v + '%';
        b.onclick = () => { coboCapNhatNguong(v); coboCapNhatPanel(); };
        nguongRow.appendChild(b);
      });
    }
    if (visRow) {
      visRow.innerHTML = '';
      COBO_KHUNG.forEach(k => {
        const b = document.createElement('button');
        b.className = 'cobo-btn' + (coboVisBat[k.id] ? ' active' : '');
        b.textContent = k.id.toUpperCase();
        b.style.borderColor = k.mau;
        b.style.color = coboVisBat[k.id] ? '#fff' : k.mau;
        b.style.background = coboVisBat[k.id] ? k.mau : '';
        b.onclick = () => {
          coboVisBat[k.id] = !coboVisBat[k.id];
          ghiBoNho('coboVis_v3', coboVisBat);
          coboCapNhatPanel();
          coboCapNhat();
        };
        visRow.appendChild(b);
      });
    }
    if (tabRow) {
      tabRow.innerHTML = '';
      [[1,'Có màu (≥1)'],[2,'2+ màu'],[3,'3+ màu'],[4,'4+ màu'],[5,'Cả 5 màu']].forEach(([k, label]) => {
        const b = document.createElement('button');
        b.className = 'cobo-btn' + (coboTabSel === k ? ' active' : '');
        b.textContent = label;
        b.onclick = () => {
          coboTabSel = coboTabSel === k ? 0 : k;
          coboComboSel = 0;
          ghiBoNho('coboTab_v3', coboTabSel);
          coboCapNhatPanel();
          coboCapNhat();
        };
        tabRow.appendChild(b);
      });
    }
  }

  // Show/hide SMA+BB vis toggles
  const combNhom   = document.getElementById('coboCombNhom');
  const combVisRow = document.getElementById('coboCombVisRow');
  const showComb = coboLoai === 2;
  if (combNhom)   combNhom.style.display   = showComb ? '' : 'none';
  if (combVisRow) combVisRow.style.display = showComb ? '' : 'none';
  if (showComb && combVisRow) {
    combVisRow.innerHTML = '';
    [['TÍM', 'tim', '#d65db1'], ['XÁM', 'xam', '#8a8f98'], ['VÀNG', 'vang', '#e8c547']].forEach(([label, key, mau]) => {
      const b = document.createElement('button');
      const on = coboBBVisBat[key];
      b.className = 'cobo-btn' + (on ? ' active' : '');
      b.textContent = label;
      b.style.borderColor = mau;
      b.style.color = on ? '#fff' : mau;
      b.style.background = on ? mau : '';
      b.onclick = () => {
        coboBBVisBat[key] = !coboBBVisBat[key];
        ghiBoNho('coboBBVis', coboBBVisBat);
        coboCapNhatPanel();
        coboCapNhat();
      };
      combVisRow.appendChild(b);
    });
  }

  coboVeBang();
}


// ---------- 8. NÚT KHUNG GIỜ ----------
function veNutKhungGio() {
  const box = document.getElementById('timeframes');
  box.innerHTML = '';
  const infoVN = DANH_SACH_VN.find((x) => x.ma === maHienTai);
  const list = infoVN ? KHUNG_GIO_VN : KHUNG_GIO;
  // Nếu khung hiện tại không có trong danh sách mới → reset về mặc định
  if (!list.some((x) => x[0] === khungHienTai)) {
    khungHienTai = list[1][0]; // '1d' cho VN, '1d' cho crypto
  }
  list.forEach(([id, nhan]) => {
    const btn = document.createElement('button');
    btn.textContent = nhan;
    if (id === khungHienTai) btn.classList.add('active');
    btn.onclick = () => {
      if (khungHienTai === id) return;
      khungHienTai = id;
      veNutKhungGio();
      napBieuDo();
    };
    box.appendChild(btn);
  });
  const nut = box.querySelector('.active');
  if (nut) nut.scrollIntoView({ inline: 'center', block: 'nearest' });
}

// ---------- 9. WATCHLIST ----------
function taoWlRow(box, ma, ten, nhan) {
  const row = document.createElement('div');
  row.className = 'wl-row' + (ma === maHienTai ? ' active' : '');
  row.id = 'wl-' + ma;
  row.innerHTML =
    `<span class="name">${nhan}<span class="sub">${ten}</span></span>` +
    `<span class="price">—</span><span class="pct">—</span>`;
  row.onclick = () => {
    if (maHienTai === ma) return;
    maHienTai = ma;
    document.querySelectorAll('.wl-row').forEach((r) => r.classList.remove('active'));
    row.classList.add('active');
    napBieuDo();
  };
  box.appendChild(row);
}

function veWatchlist() {
  const box = document.getElementById('watchlist');
  box.innerHTML = '';

  // --- Crypto ---
  const hCrypto = document.createElement('div');
  hCrypto.className = 'wl-header';
  hCrypto.textContent = 'Crypto';
  box.appendChild(hCrypto);
  DANH_SACH_MA.forEach(({ ma, ten }) => taoWlRow(box, ma, ten, ma.replace('USDT', '')));

  // --- VN30 ---
  const hVN = document.createElement('div');
  hVN.className = 'wl-header';
  hVN.textContent = 'VN30';
  box.appendChild(hVN);
  DANH_SACH_VN.forEach(({ ma, ten }) => taoWlRow(box, ma, ten, ma));
}

let timerGiaVN = null;
async function capNhatGiaVN() {
  await Promise.allSettled(DANH_SACH_VN.map(async ({ ma, loai }) => {
    try {
      const today = new Date();
      const twoWeeksAgo = new Date(today.getTime() - 14 * 86400000);
      const kbsType = loai === 'index' ? 'index' : 'stocks';
      const raw = await _fetchKBSChunk(ma, false, twoWeeksAgo, today, kbsType);
      const bars = _rawToDaily(raw);
      if (!bars.length) return;
      const last = bars[bars.length - 1];
      const prev = bars.length > 1 ? bars[bars.length - 2] : null;
      const pct = prev ? ((last.close - prev.close) / prev.close) * 100 : 0;
      const row = document.getElementById('wl-' + ma);
      if (!row) return;
      const cls = pct >= 0 ? 'up' : 'down';
      row.querySelector('.price').textContent = dinhDangGia(last.close);
      row.querySelector('.price').className = 'price ' + cls;
      row.querySelector('.pct').textContent = (pct >= 0 ? '+' : '') + pct.toFixed(2) + '%';
      row.querySelector('.pct').className = 'pct ' + cls;
    } catch (_) {}
  }));
}

function batDauPollingVN() {
  capNhatGiaVN();
  if (timerGiaVN) clearInterval(timerGiaVN);
  timerGiaVN = setInterval(capNhatGiaVN, 60000);
}

// ---------- 9b. NHÃN GIÁ + ĐẾM NGƯỢC NẾN ----------
let timerDemNguoc = null;
let _daDatLaiNen = false;
let _crosshairY = null; // Y crosshair trên pane (null = ngoài biểu đồ)

function _fmtCountdown(s) {
  s = Math.max(0, Math.round(s));
  if (s >= 86400) {
    const d = Math.floor(s / 86400);
    const h = Math.floor((s % 86400) / 3600);
    const m = Math.floor((s % 3600) / 60);
    return `${d}d ${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}`;
  }
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sc = s % 60;
  if (h > 0) return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(sc).padStart(2,'0')}`;
  return `${String(m).padStart(2,'0')}:${String(sc).padStart(2,'0')}`;
}

function _lastTradingDayOfMonth(year, month0) {
  // Ngày giao dịch cuối tháng; trả về UTC seconds (00:00 UTC ngày đó)
  let d = new Date(Date.UTC(year, month0 + 1, 0)); // ngày cuối tháng
  while (d.getUTCDay() === 0 || d.getUTCDay() === 6)
    d = new Date(d.getTime() - 86400000);
  return d.getTime() / 1000;
}

// Tính thời điểm đóng cửa nến hiện tại; trả về { secs, nghỉ }
// secs = số giây thực UTC còn lại đến khi nến đóng; nghỉ = true nếu ngoài giờ VN
function tinhKetThucNen() {
  if (!duLieuNen.length) return null;
  const last = duLieuNen[duLieuNen.length - 1];
  const nowUTC = Date.now() / 1000;
  const isVN = !!DANH_SACH_VN.find((x) => x.ma === maHienTai);

  if (isVN) {
    // Kiểm tra có đang trong phiên giao dịch không (theo giờ VN = UTC+7)
    const vnNow = new Date((nowUTC + 7 * 3600) * 1000);
    const vnSec = vnNow.getUTCHours() * 3600 + vnNow.getUTCMinutes() * 60 + vnNow.getUTCSeconds();
    const vnDay = vnNow.getUTCDay();
    const trongPhien = vnDay >= 1 && vnDay <= 5 &&
      ((vnSec >= 9 * 3600 && vnSec < 11 * 3600 + 30 * 60) ||
       (vnSec >= 13 * 3600 && vnSec < 14 * 3600 + 45 * 60));
    if (!trongPhien) return { nghỉ: true };

    // last.time được lưu dạng "giờ VN as UTC" (LECH_GIO=0 với VN)
    // để lấy ngày/tháng/năm của nến, đọc từ last.time như UTC
    const bd = new Date(last.time * 1000);
    const y = bd.getUTCFullYear(), mo = bd.getUTCMonth(), d = bd.getUTCDate();
    const barH = bd.getUTCHours(); // 9 hoặc 13 cho H4; 0 cho D/3D/W/M

    // Tính thời điểm đóng cửa nến dưới dạng real UTC seconds
    // 14:45 VN = 07:45 UTC; 11:30 VN = 04:30 UTC
    let closeRealUTC;
    if (khungHienTai === 'h4') {
      closeRealUTC = barH === 9
        ? Date.UTC(y, mo, d, 4, 30) / 1000   // sáng đóng 11:30 VN
        : Date.UTC(y, mo, d, 7, 45) / 1000;  // chiều đóng 14:45 VN
    } else if (khungHienTai === '1d') {
      closeRealUTC = Date.UTC(y, mo, d, 7, 45) / 1000;
    } else if (khungHienTai === '2d') {
      return null; // không hiện đếm ngược cho nến 2D
    } else if (khungHienTai === '3d') {
      // Nến 3D mở ngày đầu, đóng ngày thứ 3 lúc 14:45 VN
      closeRealUTC = Date.UTC(y, mo, d + 2, 7, 45) / 1000;
    } else if (khungHienTai === '1w') {
      // Nến W mở thứ Hai, đóng thứ Sáu lúc 14:45 VN
      closeRealUTC = Date.UTC(y, mo, d + 4, 7, 45) / 1000;
    } else if (khungHienTai === '2w') {
      // Nến 2W mở thứ Hai đầu cặp, đóng thứ Sáu tuần thứ 2 lúc 14:45 VN
      closeRealUTC = Date.UTC(y, mo, d + 11, 7, 45) / 1000;
    } else { // '1M'
      const ltd = _lastTradingDayOfMonth(y, mo);
      const ld = new Date(ltd * 1000);
      closeRealUTC = Date.UTC(ld.getUTCFullYear(), ld.getUTCMonth(), ld.getUTCDate(), 7, 45) / 1000;
    }
    return { secs: closeRealUTC - nowUTC };

  } else {
    // Crypto: time = openUTC + LECH_GIO (7h)
    const openUTC = last.time - 7 * 3600;
    const durMap = {
      '15m': 900, '30m': 1800,
      '1h': 3600, '2h': 7200, '4h': 14400, '8h': 28800, '12h': 43200,
      '1d': 86400, '2d': 172800, '3d': 259200, '1w': 604800, '2w': 1209600,
    };
    let closeUTC;
    if (khungHienTai in durMap) {
      closeUTC = openUTC + durMap[khungHienTai];
    } else { // '1M'
      const od = new Date(openUTC * 1000);
      closeUTC = Date.UTC(od.getUTCFullYear(), od.getUTCMonth() + 1, 1) / 1000;
    }
    return { secs: closeUTC - nowUTC };
  }
}

function capNhatNhanGia() {
  capNhatNutThangGia();
  const el = document.getElementById('nhanGia');
  if (!el || !duLieuNen.length) { if (el) el.style.display = 'none'; return; }

  const last = duLieuNen[duLieuNen.length - 1];
  const yCoord = nenSeries.priceToCoordinate(last.close);
  const chartH = document.getElementById('chart').clientHeight;
  if (yCoord == null || yCoord < 0 || yCoord > chartH) {
    el.style.display = 'none'; return;
  }

  let scaleW = 60;
  try { scaleW = chart.priceScale('right').width(); } catch (e) {}

  const giaEl = el.querySelector('.ng-gia');
  const demEl = el.querySelector('.ng-dem');

  // Màu: tăng → nền trắng chữ tối, giảm → nền xám chữ tối
  const tang = last.close >= last.open;
  giaEl.style.background = tang ? MAU.tang : MAU.giam;
  giaEl.style.color = '#1d1f28';
  giaEl.textContent = dinhDangGia(last.close);

  // Đếm ngược
  const kt = tinhKetThucNen();
  if (!kt) {
    demEl.textContent = '';
  } else if (kt.nghỉ) {
    demEl.textContent = 'Nghỉ';
  } else {
    const s = kt.secs;
    demEl.textContent = s <= 0 ? '00:00' : _fmtCountdown(s);
    if (s <= 0 && !_daDatLaiNen) {
      _daDatLaiNen = true;
      const isVN = !!DANH_SACH_VN.find((x) => x.ma === maHienTai);
      setTimeout(() => { _daDatLaiNen = false; napBieuDo(); }, isVN ? 60000 : 1500);
    }
  }

  el.style.width = scaleW + 'px';
  el.style.right = '0';
  el.style.left = 'auto';
  // Căn tâm dòng giá (ng-gia cao ~18px) vào yCoord
  const labelTop = Math.round(yCoord - 9);
  el.style.top = labelTop + 'px';
  // Ẩn khi crosshair đang đè lên vùng nhãn (±40px quanh giá hiện tại)
  if (_crosshairY !== null && _crosshairY >= labelTop - 5 && _crosshairY <= labelTop + 45) {
    el.style.display = 'none';
  } else {
    el.style.display = '';
  }
}

function batDauNhanGia() {
  _daDatLaiNen = false;
  if (timerDemNguoc) clearInterval(timerDemNguoc);
  timerDemNguoc = setInterval(capNhatNhanGia, 1000);
  capNhatNhanGia();
}

function dungNhanGia() {
  if (timerDemNguoc) { clearInterval(timerDemNguoc); timerDemNguoc = null; }
  const el = document.getElementById('nhanGia');
  if (el) el.style.display = 'none';
}

let wsWatch = null;
function moKetNoiWatchlist() {
  const streams = DANH_SACH_MA.map((x) => x.ma.toLowerCase() + '@miniTicker').join('/');
  const ws = new WebSocket(`${WS_BASE}/stream?streams=${streams}`);
  wsWatch = ws;
  ws.onmessage = (event) => {
    const d = JSON.parse(event.data).data; // c = giá hiện tại, o = giá 24h trước
    const gia = +d.c;
    const pct = ((gia - +d.o) / +d.o) * 100;
    const row = document.getElementById('wl-' + d.s);
    if (!row) return;
    const cls = pct >= 0 ? 'up' : 'down';
    row.querySelector('.price').textContent = dinhDangGia(gia);
    row.querySelector('.price').className = 'price ' + cls;
    row.querySelector('.pct').textContent = (pct >= 0 ? '+' : '') + pct.toFixed(2) + '%';
    row.querySelector('.pct').className = 'pct ' + cls;
  };
  ws.onclose = () => setTimeout(() => { if (wsWatch === ws) moKetNoiWatchlist(); }, 3000);
}

// ---------- 10. BẢNG CÀI ĐẶT CHỈ BÁO ----------
function veBangCaiDat() {
  const box = document.getElementById('dsChiBao');
  box.innerHTML = '';
  let nhomTruoc = '';
  CHI_BAO.forEach((cb) => {
    if (cb.nhom !== nhomTruoc) {
      nhomTruoc = cb.nhom;
      const h = document.createElement('div');
      h.className = 'panel-nhom';
      h.textContent = cb.nhom;
      box.appendChild(h);
    }

    const lab = document.createElement('label');
    lab.className = 'panel-dong';

    if (cb.blKey) {
      // Dòng có thông số JMA: checkbox + màu + tên + 3 ô số
      const p = blCaiDat[cb.blKey];
      lab.innerHTML =
        `<input type="checkbox" ${caiDat[cb.id] ? 'checked' : ''}>` +
        `<i style="background:${cb.mau}"></i><span>${cb.ten}</span>`;
      lab.querySelector('input').onchange = (e) => {
        caiDat[cb.id] = e.target.checked;
        ghiBoNho('caidat2', caiDat);
        taoSeries(); veToanBo(); capNhatLegend(duLieuNen.length - 1);
      };
      box.appendChild(lab);

      const prow = document.createElement('div');
      prow.className = 'bl-params-row';
      prow.innerHTML =
        `<label>Độ dài <input type="number" class="bl-inp" data-blkey="${cb.blKey}" data-p="len"   min="2"    max="1000" value="${p.len}"></label>` +
        `<label>Phase  <input type="number" class="bl-inp" data-blkey="${cb.blKey}" data-p="phase" min="-100" max="100"  step="0.1" value="${p.phase}"></label>` +
        `<label>Power  <input type="number" class="bl-inp" data-blkey="${cb.blKey}" data-p="power" min="1"    max="5"    value="${p.power}"></label>`;
      prow.querySelectorAll('.bl-inp').forEach((inp) => {
        inp.addEventListener('click', (e) => e.stopPropagation());
        inp.onchange = () => {
          let v = parseFloat(inp.value);
          if (isNaN(v)) return;
          const pk = inp.dataset.p;
          if (pk === 'len')   v = Math.round(Math.max(2,    Math.min(1000, v)));
          if (pk === 'phase') v = Math.max(-100, Math.min(100, +v.toFixed(1)));
          if (pk === 'power') v = Math.round(Math.max(1,    Math.min(5,    v)));
          inp.value = v;
          blCaiDat[inp.dataset.blkey][pk] = v;
          ghiBoNho('blCaiDat', blCaiDat);
          taoSeries(); veToanBo(); capNhatLegend(duLieuNen.length - 1);
        };
      });
      box.appendChild(prow);
      return; // đã append, bỏ qua append cuối
    }

    // Dòng thường (checkbox + màu tuỳ chọn + tên)
    lab.innerHTML =
      `<input type="checkbox" ${caiDat[cb.id] ? 'checked' : ''}>` +
      (cb.mau ? `<i style="background:${cb.mau}"></i>` : '') +
      `<span>${cb.ten}</span>`;
    lab.querySelector('input').onchange = async (e) => {
      const canTaiLai = cb.id.startsWith('vwap') && e.target.checked && nenTienTo.length === 0;
      caiDat[cb.id] = e.target.checked;
      ghiBoNho('caidat2', caiDat);
      if (canTaiLai) { taoSeries(); napBieuDo(); return; }
      taoSeries();
      veToanBo();
      capNhatLegend(duLieuNen.length - 1);
    };
    box.appendChild(lab);
  });
  const attr = document.createElement('div');
  attr.className = 'panel-attr';
  attr.innerHTML = 'Biểu đồ: <a href="https://www.tradingview.com/" target="_blank" rel="noopener">TradingView Lightweight Charts™</a>';
  box.appendChild(attr);
}
const panel = document.getElementById('panelCaiDat');
document.getElementById('btnCaiDat').onclick = () => { panel.hidden = !panel.hidden; };
document.getElementById('btnDong').onclick = () => { panel.hidden = true; };
panel.onclick = (e) => { if (e.target === panel) panel.hidden = true; };

// ---------- 11. EA L5 / F3 ----------
const EA_MAUS = { D: '#f5c518', H4: '#00bcd4', H8: '#ab47bc', H12: '#ff7043', Trap: '#66bb6a' };
const EA_LUONGS = ['D', 'H4', 'H8', 'H12', 'Trap'];
const EA_MA_HO_TRO = ['BTCUSDT', 'ETHUSDT', 'PAXGUSDT'];

const EA_F3_MAUS = { H2: '#f0a030', H4: '#4fc3f7', D: '#d65db1', H1: '#66bb6a', M30: '#ff7043', M15: '#ab47bc' };
const EA_F3_LUONGS = ['H2', 'H4', 'D', 'H1', 'M30', 'M15'];
const EA_F3_DEFAULT = { H2: true, H4: true, D: true, H1: true, M30: true, M15: true };

const EA_S1_MAUS = { W: '#f5c518', D: '#00bcd4', '2D': '#ab47bc' };
const S1_LUONGS = ['W', 'D', '2D'];
const S1_DEFAULT = { W: true, D: true, '2D': true };
let caiDatS1 = Object.assign({}, S1_DEFAULT, docBoNho('eaS1', {}));

const EA_DEFAULT = { on: false, D: true, H4: true, H8: true, H12: true, Trap: true, entry: true, sltp: true, pnl: true, hist: true, bts: true, ds: false };
let caiDatEA = Object.assign({}, EA_DEFAULT, docBoNho('ea', {}));
let caiDatF3 = Object.assign({}, EA_F3_DEFAULT, docBoNho('eaF3', {}));
let eaLoai = docBoNho('eaLoai', 'L5'); // 'L5' hoặc 'F3' (chỉ dùng cho crypto)
if (eaLoai === 'F1' || eaLoai === 'F2') { eaLoai = 'F3'; ghiBoNho('eaLoai', 'F3'); }

let eaKetQua = {};        // { 'BTCUSDT': { trades, status, thongKe } } — L5 / S1
let eaF3KetQua = {};      // { 'BTCUSDT': { trades, status, thongKe } } — F3
let eaTimerRefresh = null;
let eaHistMarkers = null;  // markers lịch sử (LC.createSeriesMarkers)
let eaHistPrim = null;     // primitive vẽ đường nối entry-exit
let eaOpenPrim = null;     // EaOpenLinesPrimitive cho lệnh đang mở
let eaLoading = false;
let eaVaoPopupTrade = null; // lệnh đang hiện popup chi tiết (null = ẩn)

// --- Fibonacci state ---
let fibPrim = null;
let fibBatMode = false;
let fibVePhase = 0;      // 0=chờ điểm 1, 1=preview/chờ điểm 2
let fibDangVe = null;    // { t1, p1, t2, p2 } preview đang vẽ
let fibP1_cx = 0, fibP1_cy = 0;
let fibPointerActive = false;
let fibSelected = null;
let fibDiagIds = null;   // Set fbId cần vẽ đường nối chéo; null = không vẽ
let fibDragState = null; // { which: 1|2 }
let _fibDsCache = null;  // { ma, ds }
let _fibLastHitPrice = null; // giá mức vừa bấm (để tính nhóm hợp lưu)

// --- Kẻ vẽ (đường ngang / dọc / trendline) — state khai báo sớm vì napBieuDo() chạy trước phần code bên dưới ---
let kvPrim = null;
let kvMode = null;       // null | 'h' | 'v' | 't' (công cụ đang chọn để vẽ)
let kvPhase = 0;         // trendline: 0 = chờ điểm 1, 1 = chờ điểm 2
let kvDangVe = null;     // { k:'t', t1,p1,t2,p2,... } bản xem trước trendline
let kvSelected = null;   // id nét đang chọn
let kvDrag = null;       // { loai:'move'|'p1'|'p2', ... }
let _kvCache = null;     // { ma, ds }
let kvP1Px = null;       // vị trí pixel điểm 1 (để phân biệt click-click và kéo)
let kvChoTrong = null;   // pointerdown trong ruột hình chữ nhật chưa chọn (thả không kéo → chọn hình)
let kvClickTrong = null; // pointerdown vào vùng trống khi đang có nét được chọn (thả không kéo → bỏ chọn)

function eaCoHoTro() { return EA_MA_HO_TRO.includes(maHienTai) || !!DANH_SACH_VN.find(x => x.ma === maHienTai); }
function eaIsVN() { return !!DANH_SACH_VN.find(x => x.ma === maHienTai); }
function eaIsF3() { return !eaIsVN() && eaLoai === 'F3'; }
function eaGetKetQua() { return eaIsF3() ? eaF3KetQua[maHienTai] : eaKetQua[maHienTai]; }
function eaLegEnabled(leg) {
  if (eaIsVN()) return !!caiDatS1[leg];
  if (eaIsF3()) return !!caiDatF3[leg];
  return !!caiDatEA[leg];
}
function eaLegMau(leg) {
  if (eaIsVN()) return EA_S1_MAUS[leg] || '#aaa';
  if (eaIsF3()) return EA_F3_MAUS[leg] || '#aaa';
  return EA_MAUS[leg] || '#aaa';
}
function eaLuongs() {
  if (eaIsVN()) return S1_LUONGS;
  if (eaIsF3()) return EA_F3_LUONGS;
  return EA_LUONGS;
}
function eaFmtNgay(ms) {
  if (!ms) return '—';
  const d = new Date(ms);
  const pad = n => String(n).padStart(2, '0');
  return `${pad(d.getUTCDate())}/${pad(d.getUTCMonth() + 1)}/${d.getUTCFullYear()}`;
}

function eaFmtVN(ms) {
  if (!ms) return '—';
  const d = new Date(ms + 7 * 3600000);
  const pad = n => String(n).padStart(2, '0');
  return `${pad(d.getUTCDate())}/${pad(d.getUTCMonth() + 1)} ${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}`;
}

// Snap UTC-ms trade time → chart candle time (binary search)
function eaSnapToNen(tradeT_ms) {
  if (!duLieuNen.length) return null;
  const ts = Math.floor(tradeT_ms / 1000) + (eaIsVN() ? 0 : LECH_GIO);
  if (ts < duLieuNen[0].time) return null;
  let lo = 0, hi = duLieuNen.length - 1;
  while (lo < hi) {
    const mid = (lo + hi + 1) >> 1;
    if (duLieuNen[mid].time <= ts) lo = mid; else hi = mid - 1;
  }
  return duLieuNen[lo].time;
}

// Primitive vẽ đường chấm nối điểm vào - điểm ra
class EaHistPrimitive {
  constructor() { this._trades = []; this._series = null; this._chart = null; }
  attached(p) { this._series = p.series; this._chart = p.chart; }
  detached() { this._series = null; this._chart = null; }
  setTrades(trades) { this._trades = trades; }
  updateAllViews() {}
  paneViews() {
    const self = this;
    return [{
      renderer() {
        return {
          draw(target) {
            if (!self._series || !self._chart || !self._trades.length) return;
            target.useBitmapCoordinateSpace(({ context: ctx, horizontalPixelRatio: hpr, verticalPixelRatio: vpr }) => {
              const ts = self._chart.timeScale();
              ctx.save();
              ctx.lineWidth = hpr;
              for (const tr of self._trades) {
                const x1 = ts.timeToCoordinate(tr.et);
                const y1 = self._series.priceToCoordinate(tr.ep);
                const x2 = ts.timeToCoordinate(tr.xt);
                const y2 = self._series.priceToCoordinate(tr.xp);
                if (x1 == null || y1 == null || x2 == null || y2 == null) continue;
                ctx.setLineDash([4 * hpr, 3 * hpr]);
                ctx.strokeStyle = tr.win ? '#00c853' : '#ef5350';
                ctx.beginPath();
                ctx.moveTo(x1 * hpr, y1 * vpr);
                ctx.lineTo(x2 * hpr, y2 * vpr);
                ctx.stroke();
              }
              ctx.restore();
            });
          },
        };
      },
    }];
  }
}

// Primitive vẽ đường entry/SL dạng đoạn thẳng (không kéo dài toàn bộ)
class EaOpenLinesPrimitive {
  constructor() {
    this._lines = [];       // [{price, label, color, snapTime}]
    this._entryData = [];   // [{price, label, color, snapTime, trade}] để cập nhật PnL
    this._series = null;
    this._chart = null;
    this._requestUpdate = null;
  }
  attached(p) { this._series = p.series; this._chart = p.chart; this._requestUpdate = p.requestUpdate; }
  detached() { this._series = null; this._chart = null; this._requestUpdate = null; }
  updateAllViews() {}

  setData(entryItems, slItems) {
    this._entryData = entryItems;
    this._lines = [
      ...entryItems.map(e => ({ price: e.price, label: e.label, color: e.color, snapTime: e.snapTime })),
      ...slItems.map(s => ({ price: s.price, label: s.label, color: s.color, snapTime: null })),
    ];
    if (this._requestUpdate) this._requestUpdate();
  }

  updatePnl(cur, showPnl) {
    for (let i = 0; i < this._entryData.length; i++) {
      const e = this._entryData[i];
      const base = `buy (${e.trade.leg})`;
      if (showPnl && cur) {
        const pct = (cur - e.trade.entry) / e.trade.entry * 100;
        e.label = `${base} ${pct >= 0 ? '+' : ''}${pct.toFixed(2)}%`;
        e.color = pct >= 0 ? '#26a69a' : '#ef5350';
      } else {
        e.label = base;
        e.color = '#00c853';
      }
      this._lines[i].label = e.label;
      this._lines[i].color = e.color;
    }
    if (this._requestUpdate) this._requestUpdate();
  }

  priceAxisViews() {
    const self = this;
    return this._lines.map(line => ({
      coordinate() {
        if (!self._series) return -1;
        return self._series.priceToCoordinate(line.price) ?? -1;
      },
      text() { return dinhDangGia(line.price); },
      textColor() { return '#ffffff'; },
      backColor() { return line.color; },
      tickVisible() { return false; },
    }));
  }

  paneViews() {
    const self = this;
    return [{
      renderer() {
        return {
          draw(target) {
            if (!self._series || !self._chart || !self._lines.length) return;
            target.useBitmapCoordinateSpace(({ context: ctx, horizontalPixelRatio: hpr, verticalPixelRatio: vpr, bitmapSize }) => {
              const ts = self._chart.timeScale();
              const lastT = duLieuNen.length ? duLieuNen[duLieuNen.length - 1].time : null;
              ctx.save();
              ctx.lineWidth = hpr;
              for (const line of self._lines) {
                const y = self._series.priceToCoordinate(line.price);
                if (y == null) continue;
                const startT = line.snapTime ?? lastT;
                let x1 = 0;
                if (startT != null) {
                  const xc = ts.timeToCoordinate(startT);
                  x1 = xc != null ? Math.max(0, xc) * hpr : 0;
                }
                const yBitmap = y * vpr;
                const x2Bitmap = bitmapSize.width;
                ctx.setLineDash([4 * hpr, 3 * hpr]);
                ctx.strokeStyle = line.color;
                ctx.beginPath();
                ctx.moveTo(x1, yBitmap);
                ctx.lineTo(x2Bitmap, yBitmap);
                ctx.stroke();
                if (line.label) {
                  ctx.setLineDash([]);
                  const fs = 11 * vpr;
                  ctx.font = `${fs}px sans-serif`;
                  const tw = ctx.measureText(line.label).width;
                  const px = 4 * hpr, py = 2 * vpr;
                  const bw = tw + px * 2, bh = fs + py * 2;
                  const bx = x2Bitmap - bw - 4 * hpr;
                  const by = yBitmap - bh / 2;
                  ctx.fillStyle = line.color + 'cc';
                  ctx.fillRect(bx, by, bw, bh);
                  ctx.fillStyle = '#ffffff';
                  ctx.textBaseline = 'middle';
                  ctx.fillText(line.label, bx + px, yBitmap);
                }
              }
              ctx.restore();
            });
          },
        };
      },
    }];
  }
}

// Xoá toàn bộ drawing EA
function eaXoaVe() {
  if (eaHistMarkers) { try { eaHistMarkers.detach(); } catch (e) {} eaHistMarkers = null; }
  if (eaHistPrim) { try { nenSeries.detachPrimitive(eaHistPrim); } catch (e) {} eaHistPrim = null; }
  if (eaOpenPrim) { try { nenSeries.detachPrimitive(eaOpenPrim); } catch (e) {} eaOpenPrim = null; }
  eaVaoDongBang();
}

// Lịch sử giao dịch: mũi tên vào/ra + đường chấm nối
function eaVeHist(kq) {
  if (eaHistMarkers) { try { eaHistMarkers.detach(); } catch (e) {} eaHistMarkers = null; }
  if (eaHistPrim) { try { nenSeries.detachPrimitive(eaHistPrim); } catch (e) {} eaHistPrim = null; }
  if (!kq?.trades?.length || !caiDatEA.hist) return;

  const markers = [];
  const lineData = [];
  for (const tr of kq.trades) {
    if (!eaLegEnabled(tr.leg)) continue;
    const et = eaSnapToNen(tr.entryT);
    if (et === null) continue;
    markers.push({ time: et, position: 'atPriceBottom', price: tr.entry, color: '#00c853', shape: 'arrowUp', size: 1.5 });
    if (tr.exitT !== null) {
      const xt = eaSnapToNen(tr.exitT);
      if (xt !== null) {
        markers.push({ time: xt, position: 'atPriceTop', price: tr.exit, color: '#ef5350', shape: 'arrowDown', size: 1 });
        lineData.push({ et, ep: tr.entry, xt, xp: tr.exit, win: (tr.pnlPct || 0) >= 0 });
      }
    }
  }
  markers.sort((a, b) => a.time - b.time || (a.position === 'atPriceBottom' ? -1 : 1));
  if (markers.length) {
    try {
      if (typeof LC.createSeriesMarkers === 'function') {
        eaHistMarkers = LC.createSeriesMarkers(nenSeries, markers);
      } else if (typeof nenSeries.setMarkers === 'function') {
        nenSeries.setMarkers(markers);
      }
    } catch (e) { console.warn('EA hist markers:', e); }
  }
  if (lineData.length) {
    try {
      eaHistPrim = new EaHistPrimitive();
      eaHistPrim.setTrades(lineData);
      nenSeries.attachPrimitive(eaHistPrim);
    } catch (e) { console.warn('EA hist primitive:', e); }
  }
}

// Cập nhật % lãi/lỗ real-time trên đường giá vào
function eaCapNhatPnl() {
  if (!eaOpenPrim) return;
  const cur = duLieuNen.length ? duLieuNen[duLieuNen.length - 1].close : null;
  eaOpenPrim.updatePnl(cur, caiDatEA.pnl);
}

// ---------- Popup chi tiết lệnh vào (bấm mũi tên mua) ----------

function eaVaoDongBang() {
  const el = document.getElementById('eaVaoPopup');
  if (el) el.style.display = 'none';
  eaVaoPopupTrade = null;
}

// Tìm lệnh entry gần điểm bấm nhất (CSS pixels)
function eaVaoTimGanNhat(point) {
  if (!point) return null;
  const kq = eaGetKetQua();
  if (!kq?.trades || !caiDatEA.hist) return null;
  const isMobile = window.matchMedia('(pointer: coarse)').matches;
  const thr = isMobile ? 20 : 12;
  let best = null, bestDist = Infinity;
  for (const t of kq.trades) {
    if (!eaLegEnabled(t.leg)) continue;
    const ct = eaSnapToNen(t.entryT);
    if (ct === null) continue;
    const x = chart.timeScale().timeToCoordinate(ct);
    const y = nenSeries.priceToCoordinate(t.entry);
    if (x == null || y == null) continue;
    const dx = Math.abs(point.x - x);
    const dy = Math.abs(point.y - y);
    if (dx <= thr * 2 && dy <= thr * 2) {
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < bestDist) { bestDist = dist; best = t; }
    }
  }
  return bestDist <= thr * 2.5 ? best : null;
}

function eaVaoHienBang(t) {
  const el = document.getElementById('eaVaoPopup');
  if (!el) return;
  const v = t.vao || null;
  const SL0 = t.slHist?.[0]?.sl ?? null;
  const g = dinhDangGia;
  const fv = eaFmtVN;
  const fd = (ms) => {
    if (!ms) return '—';
    const d = new Date(ms + 7 * 3600000);
    return String(d.getUTCDate()).padStart(2, '0') + '/' + String(d.getUTCMonth() + 1).padStart(2, '0');
  };
  const mau = EA_F3_MAUS[t.leg] || '#aaa';

  let html = `<div class="eavp-head">` +
    `<span><span class="eavp-leg" style="color:${mau}">${t.leg}</span> EA F3 · MUA</span>` +
    `<button class="eavp-close" onclick="eaVaoDongBang()">✕</button>` +
    `</div><div class="eavp-body">` +
    `<div class="eavp-top">Vào <b>${fv(t.entryT)}</b> @ <b>${g(t.entry)}</b></div>`;

  if (v?.loai === 'D' && v?.tinHieuT) {
    html += `<div class="eavp-top">Tín hiệu D đóng ${fv(v.tinHieuT)}</div>`;
  }

  if (!v) {
    html += `<div class="eavp-sec">Luồng vào lệnh</div>`;
    html += `<div class="eavp-row">${t.method || '—'}</div>`;
    if (SL0 != null) {
      const slPct = t.entry ? ((t.entry - SL0) / t.entry * 100).toFixed(2) : null;
      html += `<div class="eavp-sec">Mức SL khi vào lệnh</div>`;
      html += `<div class="eavp-row">SL = <b>${g(SL0)}</b>${slPct != null ? ` · ${slPct}% dưới giá vào` : ''}</div>`;
    }
    html += `<div class="eavp-row eavp-na">Không có thông tin chi tiết.</div>`;
    html += `</div>`;
    el.innerHTML = html;
    el.style.display = '';
    eaVaoPopupTrade = t;
    return;
  }

  // B. Luồng vào lệnh
  html += `<div class="eavp-sec">Luồng vào lệnh</div>`;
  html += `<div class="eavp-row">${t.method}</div>`;
  if (v.loai === 'H' || v.loai === 'MIX') {
    html += `<div class="eavp-row">Nến trước <b>${g(v.nenTruoc)}</b> ≤ S_cao, nến này <b>${g(t.entry)}</b> > S_cao <b>${g(v.st)}</b></div>`;
    if (v.loai === 'MIX') {
      html += `<div class="eavp-row">Chỉ vào khi nến D gần nhất là nến tím: ngày <b>${fd(v.ngayTim)}</b> = tím</div>`;
    }
  } else if (v.loai === 'D') {
    const lStr = Array.isArray(v.L) ? v.L.map(x => x.toFixed(1)).join('/') : '—';
    html += `<div class="eavp-row">Vùng tím BB <b>${so(v.w3)}</b>% (BB20 ${g(v.bb20)}, BB55 ${g(v.bb55)}) · RSI <b>${so(v.rsi, 1)}</b> (L1..L4 = ${lStr})</div>`;
    html += `<div class="eavp-row">Cụm co bó thấp nhất: <b>${v.khung}</b>. Rào: nến <b>${v.raoKhung}</b> đóng ${g(t.entry)} > đường thứ ${v.raoN} (${g(v.raoGia)}) lúc ${fv(v.nenRaoT)}</div>`;
  }

  // C. SL khi vào
  html += `<div class="eavp-sec">Mức SL khi vào lệnh</div>`;
  if (SL0 != null) {
    html += `<div class="eavp-row">SL = <b>${g(SL0)}</b></div>`;
    if (v.loai === 'H') {
      html += `<div class="eavp-row">S1 ${g(v.s1)} × 0.99 = ${g(v.s1 != null ? v.s1 * 0.99 : null)}</div>`;
    } else if (v.loai === 'MIX') {
      const slS1 = v.s1 != null ? v.s1 * (1 - 0.01) : null;
      const dungSlS1 = slS1 != null && v.slBB != null ? slS1 <= v.slBB : null;
      html += `<div class="eavp-row">SLm (S1×0.99) = <b>${g(slS1)}</b> · BB thấp D×0.99 = <b>${g(v.slBB)}</b>`;
      if (dungSlS1 != null) html += ` → dùng <b>${dungSlS1 ? 'SLm' : 'BB×0.99'}</b>`;
      html += `</div>`;
    } else if (v.loai === 'D') {
      html += `<div class="eavp-row">SMA thấp nhất ${g(v.slSMA)}, BB thấp D ${g(v.slBB)} → lấy giá nhỏ hơn × 0.99</div>`;
    }
    if (t.entry) {
      const slPct = ((t.entry - SL0) / t.entry * 100).toFixed(2);
      html += `<div class="eavp-row"><b>${slPct}%</b> dưới giá vào</div>`;
    }
    html += `<div class="eavp-row eavp-note">SL bám theo (trailing) mỗi khi nến đóng.</div>`;
  }

  // D. Cụm co bó
  html += `<div class="eavp-sec">Cụm co bó khi vào lệnh</div>`;
  html += `<div class="eavp-row">Khung <b>${v.khung}</b> (K=${v.K} đường gần giá nhất)</div>`;
  let rowW = `Độ rộng <b>${so(v.w)}</b>% (ngưỡng ≤ 3%)`;
  if (v.d != null) rowW += ` · cách giá <b>${so(v.d)}</b>%`;
  html += `<div class="eavp-row">${rowW}</div>`;
  html += `<div class="eavp-row">S1 (thấp nhất) <b>${g(v.s1)}</b> · S_cao <b>${g(v.st)}</b></div>`;
  if (Array.isArray(v.duong) && v.duong.length) {
    html += `<div class="eavp-row eavp-sma-list">${v.duong.map(x => `SMA${x.p}: ${g(x.v)}`).join(' · ')}</div>`;
  }
  html += `</div>`;

  el.innerHTML = html;
  el.style.display = '';
  eaVaoPopupTrade = t;
}

// Đường đoạn: lệnh đang mở (entry) + SL + buy limit chờ — dùng primitive thay createPriceLine
function eaVeOpenLines(kq) {
  if (eaOpenPrim) { try { nenSeries.detachPrimitive(eaOpenPrim); } catch (e) {} eaOpenPrim = null; }
  if (!kq) return;
  const open = (kq.trades || []).filter(t => t.exitT === null && eaLegEnabled(t.leg));
  const entryItems = [];
  const slItems = [];
  if (caiDatEA.entry) {
    for (const tr of open) {
      const snapTime = eaSnapToNen(tr.entryT);
      entryItems.push({ price: tr.entry, label: `buy (${tr.leg})`, color: '#00c853', snapTime, trade: tr });
    }
  }
  if (caiDatEA.sltp) {
    for (const tr of open) {
      const lastSL = tr.slHist?.length ? tr.slHist[tr.slHist.length - 1].sl : null;
      if (lastSL == null) continue;
      slItems.push({ price: lastSL, label: `SL (${tr.leg})`, color: '#ef5350' });
    }
    // Buy Limit chờ (L5 only)
    if (!eaIsVN() && !eaIsF3()) {
      const legs = kq.status?.legs || {};
      for (const l of EA_LUONGS) {
        if (!caiDatEA[l]) continue;
        const cho = legs[l]?.cho;
        if (!cho) continue;
        slItems.push({ price: cho.price, label: `buy limit (${l})`, color: '#ff9800' });
        if (cho.sl != null) slItems.push({ price: cho.sl, label: `SL (${l})`, color: '#ef5350' });
      }
    }
  }
  if (!entryItems.length && !slItems.length) return;
  try {
    eaOpenPrim = new EaOpenLinesPrimitive();
    nenSeries.attachPrimitive(eaOpenPrim);
    eaOpenPrim.setData(entryItems, slItems);
  } catch (e) { console.warn('EA open lines primitive:', e); }
  eaCapNhatPnl();
}

function eaVeStatus(kq) {
  const el = document.getElementById('eaStatus');
  if (!el) return;
  if (!kq || !caiDatEA.bts) { el.style.display = 'none'; return; }
  el.style.left = '8px';

  if (eaIsF3()) {
    const legs = kq.status?.legs || {};
    const tk = kq.thongKe || {};
    const fmtLeg = (l) => {
      if (!caiDatF3[l]) return '';
      const d = legs[l];
      let txt = '';
      if (d?.pos) txt = `Mở @${dinhDangGia(d.pos.price)} · SL ${dinhDangGia(d.pos.sl)}`;
      else txt = 'Không có lệnh';
      if (l === 'D' && d?.cho) txt += ` · ⏳ chờ rào ${d.cho.khung} (SL dự kiến ${dinhDangGia(d.cho.sl)})`;
      if (l !== 'D') {
        const cb = d?.coBo;
        if (cb != null) {
          const wStr = d?.w != null ? ` (${d.w.toFixed(1)}%)` : '';
          txt += cb ? ` · Co bó ✓${wStr}` : ' · Co bó ✗';
        }
        if (d != null && 'tim' in d && d.tim === false) txt += ' · ngoài vùng tím';
      }
      const t = tk[l];
      const tkStr = t ? ` <span style="color:#888;font-size:9px">(${t.total}l·${t.thang}w·${t.tongPct>=0?'+':''}${t.tongPct}%)</span>` : '';
      return `<div class="eas-row"><span class="eas-leg" style="color:${EA_F3_MAUS[l]}">${l}</span><span>${txt}${tkStr}</span></div>`;
    };
    const ngay = legs.D?.ngay;
    let ngayStr = '—';
    if (ngay) {
      const bbS = ngay.vungBB ? `✓(w3 ${ngay.w3?.toFixed(1)}%)` : `✗(w3 ${ngay.w3?.toFixed(1)}%)`;
      const smaS = ngay.vungSMA ? '✓' : '✗';
      const rsiS = ngay.rsi != null ? ngay.rsi.toFixed(1) : '—';
      const lS = Array.isArray(ngay.L) && ngay.L.length === 4 ? ngay.L.map(x=>x.toFixed(1)).join('/') : '—';
      ngayStr = `BB ${bbS} · SMA ${smaS} · RSI ${rsiS} · L ${lS}${ngay.cumThap ? ` · cụm thấp nhất ${ngay.cumThap}` : ''}`;
    }
    el.innerHTML =
      `<div class="eas-head"><span>EA F3</span><button class="eas-collapse" onclick="this.closest('.ea-status').classList.toggle('eas-thu')">◀</button></div>` +
      `<div class="eas-body">` +
      EA_F3_LUONGS.map(fmtLeg).join('') +
      `<div class="eas-row"><span class="eas-leg" style="color:#aaa">Ngày D</span><span style="font-size:10px">${ngayStr}</span></div>` +
      `</div>`;
    el.style.display = '';
    return;
  }

  const bias = kq.status?.bias || {};
  const biasStr = bias.valid
    ? `✓ ${bias.method || ''} ${bias.start ? '(' + eaFmtNgay(bias.start).slice(0, 5) + ')' : ''}`
    : '✗ Không hợp lệ';
  if (eaIsVN()) {
    const legs = kq.status?.legs || {};
    const legRow = (l) => {
      if (!caiDatS1[l]) return '';
      const d = legs[l];
      let txt = 'Chờ tín hiệu';
      if (d?.pos) {
        if (d.pos.choThoat) txt = `Chờ thoát: ${d.pos.choThoat}`;
        else txt = `Mở @${dinhDangGia(d.pos.price)}, SL ${dinhDangGia(d.pos.sl)}`;
      } else if (d?.choVao) {
        txt = `Chờ vào ở giá mở phiên ${eaFmtNgay(d.choVao.phien)}`;
      }
      return `<div class="eas-row"><span class="eas-leg" style="color:${EA_S1_MAUS[l]}">${l}</span><span>${txt}</span></div>`;
    };
    el.innerHTML =
      `<div class="eas-head"><span>EA S1</span><button class="eas-collapse" onclick="this.closest('.ea-status').classList.toggle('eas-thu')">◀</button></div>` +
      `<div class="eas-body">` +
      `<div class="eas-row"><span class="eas-leg" style="color:#aaa">Bias M</span><span>${biasStr}</span></div>` +
      S1_LUONGS.map(legRow).join('') +
      `</div>`;
  } else {
    const legs = kq.status?.legs || {};
    const legRow = (l) => {
      if (!caiDatEA[l]) return '';
      const d = legs[l];
      let txt = 'Chờ tín hiệu';
      if (d?.pos) txt = `Mở @${dinhDangGia(d.pos.price)}, SL ${dinhDangGia(d.pos.sl)}`;
      else if (d?.cho) txt = `⏳ Buy Limit @${dinhDangGia(d.cho.price)} · SL ${dinhDangGia(d.cho.sl)}`;
      else if (d?.waiting) txt = 'Chờ xác nhận H1';
      else if (d?.breakout) txt = 'Đã breakout';
      return `<div class="eas-row"><span class="eas-leg" style="color:${EA_MAUS[l]}">${l}</span><span>${txt}</span></div>`;
    };
    const biasVN = bias.valid
      ? `✓ ${bias.method || ''} ${bias.start ? '(' + eaFmtVN(bias.start).slice(0, 5) + ')' : ''}`
      : '✗ Không hợp lệ';
    el.innerHTML =
      `<div class="eas-head"><span>EA L5</span><button class="eas-collapse" onclick="this.closest('.ea-status').classList.toggle('eas-thu')">◀</button></div>` +
      `<div class="eas-body">` +
      `<div class="eas-row"><span class="eas-leg" style="color:#aaa">W</span><span>${biasVN}</span></div>` +
      EA_LUONGS.map(legRow).join('') +
      `</div>`;
  }
  el.style.display = '';
}

function eaVeTrades(kq) {
  const panel = document.getElementById('eaTrades');
  const list = document.getElementById('eaTradesList');
  if (!panel || !list) return;
  if (!kq || !caiDatEA.ds) { panel.style.display = 'none'; return; }
  const trades = [...kq.trades].reverse();
  const luongs = eaLuongs();
  const fmtThoiGian = eaIsVN() ? (ms) => eaFmtNgay(ms).slice(0, 5) : eaFmtVN;
  let html = '';
  for (const leg of luongs) {
    if (!eaLegEnabled(leg)) continue;
    const lt = trades.filter(t => t.leg === leg);
    if (!lt.length) continue;
    const tk = kq.thongKe?.[leg] || {};
    const mau = eaLegMau(leg);
    html += `<div class="eat-nhom-header" style="border-left:3px solid ${mau}">` +
      `${leg} — ${tk.total || 0} lệnh · Tổng ${tk.tongPct >= 0 ? '+' : ''}${tk.tongPct || 0}% · Thắng ${tk.thang || 0}</div>`;
    for (const tr of lt) {
      const pct = tr.pnlPct || 0;
      const isOpen = tr.exitT === null;
      const cls = isOpen ? 'eat-open' : pct >= 0 ? 'eat-win' : 'eat-loss';
      const nhanChoDL = (!eaIsVN() && tr.method?.includes('Buy Limit khớp'))
        ? ' <span style="color:#ff9800;font-size:9px">(lệnh chờ)</span>' : '';
      html += `<div class="eat-row ${cls}" data-entry="${tr.entryT}">` +
        `<span class="eat-leg" style="color:${mau}">${tr.leg}</span>` +
        `<span class="eat-time">${fmtThoiGian(tr.entryT)}</span>` +
        `<span class="eat-price">${dinhDangGia(tr.entry)}</span>` +
        `<span class="eat-time">${isOpen ? '⏳' : fmtThoiGian(tr.exitT)}</span>` +
        `<span class="eat-price">${isOpen ? '—' : dinhDangGia(tr.exit)}</span>` +
        `<span class="eat-pct">${isOpen ? 'Mở' : (pct >= 0 ? '+' : '') + pct.toFixed(2) + '%'}</span>` +
        `<span class="eat-reason">${tr.reason || ''}${nhanChoDL}</span></div>`;
    }
  }
  list.innerHTML = html;
  list.querySelectorAll('.eat-row[data-entry]').forEach(row => {
    row.onclick = () => {
      const t = eaSnapToNen(+row.dataset.entry);
      if (t === null) return;
      const i = timNen(t);
      if (i >= 0) chart.timeScale().setVisibleLogicalRange({ from: i - 50, to: i + 50 });
    };
  });
  panel.style.display = '';
}

function veEA() {
  eaXoaVe();
  const show = caiDatEA.on && eaCoHoTro();
  if (!show) {
    document.getElementById('eaStatus').style.display = 'none';
    document.getElementById('eaTrades').style.display = 'none';
    return;
  }
  const kq = eaGetKetQua();
  if (!kq) return;
  eaVeHist(kq);
  eaVeOpenLines(kq);
  eaVeStatus(kq);
  eaVeTrades(kq);
}

async function chayEA() {
  if (eaLoading || !eaCoHoTro() || !caiDatEA.on) return;
  eaLoading = true;
  try {
    const isVN = eaIsVN();
    const isF3 = eaIsF3();
    let tenEA = 'EA L5';
    if (isVN) {
      eaKetQua[maHienTai] = await S1Data.chayS1(maHienTai, msg => datTrangThai(msg));
      tenEA = 'EA S1';
    } else if (isF3) {
      eaF3KetQua[maHienTai] = await F3Data.chayF3(maHienTai, msg => datTrangThai(msg));
      tenEA = 'EA F3';
    } else {
      eaKetQua[maHienTai] = await L5Data.chayL5(maHienTai, msg => datTrangThai(msg));
    }
    datTrangThai(tenEA + ' sẵn sàng', 'ok');
    veEA();
  } catch (e) {
    datTrangThai('Lỗi EA: ' + e.message, 'err');
  } finally {
    eaLoading = false;
  }
}

function eaLapLichLamMoi() {
  if (eaTimerRefresh) clearTimeout(eaTimerRefresh);
  const interval = 15 * 60 * 1000;
  const offset = 30 * 1000;
  const now = Date.now();
  const next = Math.ceil((now - offset) / interval) * interval + offset;
  const delay = Math.max(next - now, 10000);
  eaTimerRefresh = setTimeout(async () => {
    if (caiDatEA.on && eaCoHoTro()) {
      if (eaIsF3()) delete eaF3KetQua[maHienTai];
      else delete eaKetQua[maHienTai];
      await napBieuDo();
      await chayEA();
    }
    eaLapLichLamMoi();
  }, delay);
}

function veNutEA() {
  const btn = document.getElementById('btnEA');
  if (!btn) return;
  btn.disabled = false;
  btn.style.opacity = '';
  btn.title = '';
  const note = document.getElementById('eaVNNote');
  if (note) note.style.display = 'none';
  const isVN = eaIsVN();
  const isF3 = eaIsF3();
  const l5 = document.getElementById('eaL5Luong');
  const s1 = document.getElementById('eaS1Luong');
  const f3 = document.getElementById('eaF3Luong');
  const loaiRow = document.getElementById('eaLoaiRow');
  if (l5) l5.style.display = (!isVN && !isF3) ? '' : 'none';
  if (s1) s1.style.display = isVN ? '' : 'none';
  if (f3) f3.style.display = isF3 ? '' : 'none';
  if (loaiRow) {
    loaiRow.style.display = isVN ? 'none' : 'flex';
    // Cập nhật trạng thái active cho các nút loại
    loaiRow.querySelectorAll('[data-loai]').forEach(b => {
      b.classList.toggle('active', b.dataset.loai === eaLoai);
    });
  }
  const nameEl = document.querySelector('#eaL5Row span');
  if (nameEl) nameEl.textContent = isVN ? 'S1' : (isF3 ? 'EA' : 'L5');
}

function khoiDongEAPanel() {
  const panelEA = document.getElementById('panelEA');
  document.getElementById('btnEA').onclick = () => { panelEA.hidden = !panelEA.hidden; };
  document.getElementById('btnDongEA').onclick = () => { panelEA.hidden = true; };
  panelEA.onclick = (e) => { if (e.target === panelEA) panelEA.hidden = true; };
  document.getElementById('btnDongTrades').onclick = () => {
    caiDatEA.ds = false;
    document.getElementById('eaShowDS').checked = false;
    ghiBoNho('ea', caiDatEA);
    document.getElementById('eaTrades').style.display = 'none';
  };

  // Loại EA: L5 / F3 (chỉ cho crypto)
  const loaiRow = document.getElementById('eaLoaiRow');
  if (loaiRow) {
    ['L5', 'F3'].forEach(loai => {
      const b = document.createElement('button');
      b.className = 'cobo-btn' + (eaLoai === loai ? ' active' : '');
      b.dataset.loai = loai;
      b.textContent = loai;
      b.onclick = async () => {
        if (eaLoai === loai) return;
        eaLoai = loai;
        ghiBoNho('eaLoai', eaLoai);
        veNutEA();
        if (caiDatEA.on && !eaGetKetQua() && !eaIsVN()) {
          await chayEA();
        } else {
          veEA();
        }
      };
      loaiRow.appendChild(b);
    });
  }

  // Sync checkboxes from state
  document.getElementById('eaL5On').checked = caiDatEA.on;
  EA_LUONGS.forEach(l => {
    const cb = document.querySelector(`.ea-luong[data-leg="${l}"]`);
    if (cb) cb.checked = !!caiDatEA[l];
  });
  EA_F3_LUONGS.forEach(l => {
    const cb = document.querySelector(`.ea-f3-luong[data-leg="${l}"]`);
    if (cb) cb.checked = !!caiDatF3[l];
  });
  document.getElementById('eaShowEntry').checked = !!caiDatEA.entry;
  document.getElementById('eaShowSLTP').checked = !!caiDatEA.sltp;
  document.getElementById('eaShowPnl').checked = !!caiDatEA.pnl;
  document.getElementById('eaShowHist').checked = !!caiDatEA.hist;
  document.getElementById('eaShowBTS').checked = !!caiDatEA.bts;
  document.getElementById('eaShowDS').checked = !!caiDatEA.ds;

  // Master EA toggle
  document.getElementById('eaL5On').onchange = async (e) => {
    caiDatEA.on = e.target.checked;
    ghiBoNho('ea', caiDatEA);
    if (caiDatEA.on && !eaGetKetQua()) {
      await chayEA();
    } else {
      veEA();
    }
    eaLapLichLamMoi();
  };

  // Leg toggles L5
  document.querySelectorAll('.ea-luong').forEach(cb => {
    cb.onchange = (e) => {
      caiDatEA[e.target.dataset.leg] = e.target.checked;
      ghiBoNho('ea', caiDatEA);
      veEA();
    };
  });

  // Leg toggles S1
  document.querySelectorAll('.ea-s1-luong').forEach(cb => {
    cb.checked = !!caiDatS1[cb.dataset.leg];
    cb.onchange = (e) => {
      caiDatS1[e.target.dataset.leg] = e.target.checked;
      ghiBoNho('eaS1', caiDatS1);
      veEA();
    };
  });

  // Leg toggles F3
  document.querySelectorAll('.ea-f3-luong').forEach(cb => {
    cb.onchange = (e) => {
      caiDatF3[e.target.dataset.leg] = e.target.checked;
      ghiBoNho('eaF3', caiDatF3);
      veEA();
    };
  });

  // Display toggles
  document.getElementById('eaShowEntry').onchange = (e) => {
    caiDatEA.entry = e.target.checked;
    ghiBoNho('ea', caiDatEA);
    veEA();
  };
  document.getElementById('eaShowSLTP').onchange = (e) => {
    caiDatEA.sltp = e.target.checked;
    ghiBoNho('ea', caiDatEA);
    veEA();
  };
  document.getElementById('eaShowPnl').onchange = (e) => {
    caiDatEA.pnl = e.target.checked;
    ghiBoNho('ea', caiDatEA);
    eaCapNhatPnl();
  };
  document.getElementById('eaShowHist').onchange = (e) => {
    caiDatEA.hist = e.target.checked;
    ghiBoNho('ea', caiDatEA);
    veEA();
  };
  document.getElementById('eaShowBTS').onchange = (e) => {
    caiDatEA.bts = e.target.checked;
    ghiBoNho('ea', caiDatEA);
    eaVeStatus(eaGetKetQua() || null);
  };
  document.getElementById('eaShowDS').onchange = async (e) => {
    caiDatEA.ds = e.target.checked;
    ghiBoNho('ea', caiDatEA);
    eaVeTrades(eaGetKetQua() || null);
  };
}

// ---------- 12. ĐIỆN THOẠI: quay lại app thì tải lại cho mới ----------
let anLuc = 0;
document.addEventListener('visibilitychange', () => {
  if (document.hidden) { anLuc = Date.now(); return; }
  // iPhone/iPad hay ngắt kết nối khi app chạy nền → quá 30 giây thì tải lại
  if (anLuc && Date.now() - anLuc > 30000) {
    napBieuDo();
    if (wsWatch) { wsWatch.onclose = null; wsWatch.close(); }
    moKetNoiWatchlist();
    batDauPollingVN();
  } else if (Date.now() - autoLamMoiLuc > 3600000) {
    // Tab bị ẩn < 30s nhưng đã > 1 giờ từ lần tính cuối → tính lại cobo + EA
    autoLamMoi(maHienTai);
  }
});

// ---------- 12. KHỞI ĐỘNG ----------
veNutKhungGio();
veWatchlist();
veBangCaiDat();
khoiDongEAPanel();
khoiDongCoBoPanel();
taoSeries();
moKetNoiWatchlist();
batDauPollingVN();
eaLapLichLamMoi();
coboLapLich();
napBieuDo();

// Nút thu gọn watchlist
document.getElementById('btnToggleWL').onclick = toggleWatchlist;
_applyWatchlistState();

// Nút phóng to khung giá
document.getElementById('btnPhongTo').onclick = togglePhongToKhungGia;
_applyPhongToBtn();

// Nút nhóm đường RSI
(function () {
  const btn = document.getElementById('btnRsiNhom');
  const popup = document.getElementById('popupRsiNhom');
  if (!btn || !popup) return;

  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    const show = popup.style.display === 'none' || popup.style.display === '';
    if (show) {
      popup.querySelector('.rni-ma').checked = rsiNhomBat.ma;
      popup.querySelector('.rni-bb').checked = rsiNhomBat.bb;
      popup.style.top = (parseInt(btn.style.top || '0') + 26) + 'px';
      popup.style.display = 'flex';
    } else {
      popup.style.display = 'none';
    }
  });

  popup.addEventListener('click', (e) => e.stopPropagation());

  document.addEventListener('click', () => { popup.style.display = 'none'; });

  popup.querySelectorAll('.rni-ma, .rni-bb').forEach(cb => {
    cb.addEventListener('change', () => {
      const nhom = cb.classList.contains('rni-ma') ? 'ma' : 'bb';
      rsiNhomBat[nhom] = cb.checked;
      ghiBoNho('rsiNhom', rsiNhomBat);
      rsiNhomSeries[nhom].forEach(s => s.applyOptions({ visible: cb.checked }));
      capNhatLegend(duLieuNen.length - 1);
    });
  });
}());

// ==================== FIBONACCI RETRACEMENT ====================

const FIB_LEVELS = [
  { r: 0 }, { r: 0.236 }, { r: 0.382 }, { r: 0.5 }, { r: 0.618 },
  { r: 0.786 }, { r: 1 }, { r: 1.618 }, { r: 2.618 },
];

// Kiểu Đa sắc: mỗi bộ Fib một màu (fb.mau) lấy từ bảng này; trắng/ghi dành cho Đơn sắc
const FIB_BANG_MAU = [
  '#29b6f6', '#ff9800', '#66bb6a', '#ef5350', '#ab47bc',
  '#ffee58', '#26c6da', '#ec407a', '#8d6e63', '#d4e157',
];
function fibMauHopLe(m) { return typeof m === 'string' && /^#[0-9a-fA-F]{6}$/.test(m); }
// Màu đầu tiên trong bảng chưa bộ nào dùng; dùng hết thì lấy màu ít được dùng nhất (từ đầu bảng)
function fibMauTiepTheo(ds) {
  const dem = FIB_BANG_MAU.map(() => 0);
  for (const fb of ds) {
    if (fb && fibMauHopLe(fb.mau)) {
      const i = FIB_BANG_MAU.indexOf(fb.mau.toLowerCase());
      if (i >= 0) dem[i]++;
    }
  }
  let t = 0;
  for (let i = 1; i < dem.length; i++) if (dem[i] < dem[t]) t = i;
  return FIB_BANG_MAU[t];
}
// Gán màu cho các Fib chưa có (Fib vẽ trước đây); trả true nếu có thay đổi
function fibGanMauThieu(ds) {
  let doi = false;
  for (const fb of ds) {
    if (fb && !fibMauHopLe(fb.mau)) { fb.mau = fibMauTiepTheo(ds); doi = true; }
  }
  return doi;
}

const FIB_HOP_LUU_PCT = 0.5;
const FIB_DUONG_ALPHA = 0.25; // độ đậm mặc định của đường mức ngang

// Độ đậm vạch Fib do người dùng chỉnh (toàn cục), 0.05–1; chưa chỉnh thì dùng mặc định
function fibGetAlpha() {
  const v = docBoNho('fibAlpha', FIB_DUONG_ALPHA);
  return (typeof v === 'number' && v >= 0.05 && v <= 1) ? v : FIB_DUONG_ALPHA;
}
function fibNhanGet() { return docBoNho('fibNhan', false) === true; }

// Gộp các lần vẽ lại khi kéo thanh độ đậm
let _fibRaf = 0;
function fibVeLaiRaf() {
  if (_fibRaf) return;
  _fibRaf = requestAnimationFrame(() => { _fibRaf = 0; if (fibPrim) fibPrim.update(); });
}

// Đổi thời gian nến (chart time, giây UTC+7) → tọa độ x CSS pixel, không dùng timeToCoordinate
// vì timeToCoordinate trả null khi t không khớp chính xác một nến (ví dụ đổi khung giờ).
// timeToIndex(t, true) tìm nến gần nhất → logicalToCoordinate trả tọa độ kể cả ngoài khung nhìn.
function fibTimeToX(t) {
  const ts = chart.timeScale();
  const idx = ts.timeToIndex(t, true);
  if (idx != null) return ts.logicalToCoordinate(idx);
  // Ngoại suy khi t nằm ngoài toàn bộ dữ liệu
  if (!duLieuNen.length) return null;
  const n = duLieuNen.length;
  const secPerBar = n >= 2 ? (duLieuNen[n - 1].time - duLieuNen[n - 2].time) : 3600;
  if (secPerBar <= 0) return null;
  if (t >= duLieuNen[n - 1].time) {
    return kvLogicalToX(n - 1 + (t - duLieuNen[n - 1].time) / secPerBar);
  }
  return kvLogicalToX(0 + (t - duLieuNen[0].time) / secPerBar);
}

function fibHopLuuGetOnly() { return docBoNho('fibHopLuu.' + maHienTai, false); }
function fibHopLuuSetOnly(v) { ghiBoNho('fibHopLuu.' + maHienTai, v); }

// Gom nhóm mọi mức của các Fib đang hiển thị theo giá (không phụ thuộc khung nhìn).
// Trả về { groups: [[{p, r, fbId}]] (chỉ nhóm có ≥ 2 Fib khác nhau), keys: Set('fbId|r') }.
function fibTinhHopLuu() {
  const keys = new Set();
  const groupsOut = [];
  if (!fibGetShow()) return { groups: groupsOut, keys };
  const pts = [];
  for (const fb of fibLayDS()) {
    if (fb.hidden || Math.abs(fb.p1 - fb.p2) < 1e-9) continue;
    for (const lv of FIB_LEVELS) {
      pts.push({ p: fb.p2 + (fb.p1 - fb.p2) * lv.r, r: lv.r, fbId: fb.id });
    }
  }
  pts.sort((a, b) => a.p - b.p);
  const groups = [];
  for (const pt of pts) {
    let placed = false;
    for (const g of groups) {
      if (g[0].p > 0 && Math.abs(pt.p - g[0].p) / g[0].p <= FIB_HOP_LUU_PCT / 100) {
        g.push(pt);
        placed = true;
        break;
      }
    }
    if (!placed) groups.push([pt]);
  }
  for (const g of groups) {
    if (new Set(g.map(pt => pt.fbId)).size < 2) continue;
    groupsOut.push(g);
    for (const pt of g) keys.add(pt.fbId + '|' + pt.r);
  }
  return { groups: groupsOut, keys };
}

class FibPrimitive {
  constructor() { this._series = null; this._chart = null; this._requestUpdate = null; }
  attached(p) { this._series = p.series; this._chart = p.chart; this._requestUpdate = p.requestUpdate; }
  detached() { this._series = null; this._chart = null; this._requestUpdate = null; }
  updateAllViews() {}
  update() { if (this._requestUpdate) this._requestUpdate(); }

  paneViews() {
    const self = this;
    return [{
      renderer() {
        return {
          draw(target) {
            if (!self._series || !self._chart) return;
            const ds = fibLayDS();
            const hasPreview = fibDangVe && fibDangVe.t2 != null;
            if (!ds.length && !hasPreview) return;
            target.useBitmapCoordinateSpace(({ context: ctx, horizontalPixelRatio: hpr, verticalPixelRatio: vpr, bitmapSize }) => {
              const ts = self._chart.timeScale();
              ctx.save();
              const xLB = 0;
              const xRB = bitmapSize.width;
              const all = [...ds];
              if (hasPreview) all.push({ id: '__prev__', ...fibDangVe, mau: fibMauTiepTheo(ds) });

              const showAll = fibGetShow();
              const duongAlpha = fibGetAlpha();
              const onlyHL = fibHopLuuGetOnly();
              const hl = fibTinhHopLuu();
              const levInfo = new Map();
              const nhanOn = fibNhanGet();
              const nhanList = [];
              for (const fb of all) {
                const isP = fb.id === '__prev__';
                const isSel = !isP && fb.id === fibSelected;
                if (Math.abs(fb.p1 - fb.p2) < 1e-9) continue;
                if (!isP && (!showAll || fb.hidden)) continue;

                const kieu = isP ? 'da' : (fb.kieu || 'da');
                const isMono = kieu === 'don';
                const mauFib = fibMauHopLe(fb.mau) ? fb.mau : FIB_BANG_MAU[0];

                // Tọa độ neo — chỉ dùng cho đường chéo & chấm neo; level lines không cần
                const x1c = fibTimeToX(fb.t1);
                const y1c = self._series.priceToCoordinate(fb.p1);
                const x2c = fibTimeToX(fb.t2);
                const y2c = self._series.priceToCoordinate(fb.p2);
                const x1b = x1c != null ? x1c * hpr : null;
                const y1b = y1c != null ? y1c * vpr : null;
                const x2b = x2c != null ? x2c * hpr : null;
                const y2b = y2c != null ? y2c * vpr : null;

                const lw = isP ? 0.5 * hpr : (isSel ? hpr : 0.5 * hpr);
                ctx.globalAlpha = isP ? 0.2 : 1;

                // Đường chéo nét đứt: chỉ bản xem trước hoặc Fib trong nhóm đang chọn
                const showDiag = isP || (fibDiagIds != null && fibDiagIds.has(fb.id));
                if (showDiag && x1b != null && y1b != null && x2b != null && y2b != null) {
                  ctx.save();
                  ctx.setLineDash([4 * hpr, 3 * hpr]);
                  ctx.strokeStyle = isMono ? '#e0e0e0' : mauFib;
                  ctx.lineWidth = lw;
                  ctx.beginPath();
                  ctx.moveTo(x1b, y1b);
                  ctx.lineTo(x2b, y2b);
                  ctx.stroke();
                  ctx.restore();
                }

                // Tính tọa độ y và màu của từng mức (chỉ phụ thuộc vào giá)
                const levs = FIB_LEVELS.map(lv => {
                  const p = fb.p2 + (fb.p1 - fb.p2) * lv.r;
                  const yc = self._series.priceToCoordinate(p);
                  const mau = isMono ? '#e0e0e0' : mauFib;
                  return { p, r: lv.r, yb: yc != null ? yc * vpr : null, mau };
                });
                // Vị trí từng mức để vẽ số hợp lưu (không phải preview)
                if (!isP) {
                  for (const lv of levs) {
                    if (lv.yb != null) levInfo.set(fb.id + '|' + lv.r, { yb: lv.yb });
                  }
                }

                // Đường ngang full chiều ngang (chỉ phụ thuộc vào giá)
                ctx.globalAlpha = isP ? duongAlpha * 0.7 : duongAlpha;
                for (const lv of levs) {
                  if (lv.yb == null) continue;
                  if (onlyHL && !isP && !hl.keys.has(fb.id + '|' + lv.r)) continue;
                  if (nhanOn && !isP) nhanList.push({ yb: lv.yb, text: String(lv.r), mau: lv.mau, sel: isSel });
                  ctx.strokeStyle = lv.mau;
                  ctx.lineWidth = lw;
                  ctx.beginPath();
                  ctx.moveTo(xLB, lv.yb);
                  ctx.lineTo(xRB, lv.yb);
                  ctx.stroke();
                }
                ctx.globalAlpha = isP ? 0.2 : 1;

                // Chấm neo khi được chọn (chỉ khi có tọa độ)
                if (isSel) {
                  const dotFill = isMono ? '#e0e0e0' : '#fff';
                  for (const pt of [{ xb: x1b, yb: y1b }, { xb: x2b, yb: y2b }]) {
                    if (pt.xb == null || pt.yb == null) continue;
                    ctx.beginPath();
                    ctx.arc(pt.xb, pt.yb, 5 * hpr, 0, Math.PI * 2);
                    ctx.fillStyle = dotFill;
                    ctx.fill();
                    ctx.strokeStyle = isMono ? '#888' : mauFib;
                    ctx.lineWidth = hpr;
                    ctx.stroke();
                  }
                }
              }
              // Nhãn tỉ lệ ở mép trái (tùy chọn), độc lập với thanh độ đậm
              try {
                if (nhanList.length) {
                  const vung = nhanList.filter(n => n.yb >= 6 * vpr && n.yb <= bitmapSize.height);
                  // Fib đang chọn được ưu tiên giữ nhãn; còn lại xếp theo vị trí từ trên xuống
                  vung.sort((a, b) => (b.sel - a.sel) || (a.yb - b.yb));
                  const khoang = 10 * vpr;
                  const daVe = [];
                  const trong = (y) => daVe.every(v => Math.abs(v - y) >= khoang);
                  ctx.save();
                  ctx.globalAlpha = 0.9;
                  ctx.font = `${Math.round(10 * vpr)}px sans-serif`;
                  ctx.textAlign = 'left';
                  ctx.textBaseline = 'bottom';
                  ctx.lineJoin = 'round';
                  ctx.lineWidth = 3 * hpr;
                  for (const n of vung) {
                    let y = n.yb;
                    if (!trong(y)) { y = n.yb + khoang; if (!trong(y)) continue; }
                    daVe.push(y);
                    ctx.strokeStyle = '#1d1f28';
                    ctx.strokeText(n.text, 4 * hpr, y - 2 * vpr);
                    ctx.fillStyle = n.mau;
                    ctx.fillText(n.text, 4 * hpr, y - 2 * vpr);
                  }
                  ctx.restore();
                }
              } catch (_e) {
                // lỗi vẽ nhãn không ảnh hưởng các đường Fib
              }

              // Số hợp lưu: nhóm các mức giá trong vòng FIB_HOP_LUU_PCT% của nhau
              try {
                if (hl.groups.length) {
                  ctx.save();
                  ctx.globalAlpha = 1;
                  ctx.font = `bold ${Math.round(11 * vpr)}px sans-serif`;
                  ctx.textAlign = 'right';
                  ctx.textBaseline = 'bottom';
                  ctx.lineJoin = 'round';
                  for (const g of hl.groups) {
                    const cnt = new Set(g.map(pt => pt.fbId)).size;
                    // Mỗi đường trong nhóm vẽ riêng, bỏ qua nếu quá gần đường trên
                    const ybList = [];
                    for (const pt of g) {
                      const inf = levInfo.get(pt.fbId + '|' + pt.r);
                      if (inf) ybList.push({ yb: inf.yb, mau: '#ffffff' });
                    }
                    ybList.sort((a, b) => a.yb - b.yb);
                    let lastDrawnYb = -Infinity;
                    for (const item of ybList) {
                      if (item.yb - lastDrawnYb < 10 * vpr) continue;
                      lastDrawnYb = item.yb;
                      const x = xRB - 4 * hpr;
                      const y = item.yb - 3 * vpr;
                      const label = String(cnt);
                      ctx.strokeStyle = '#1d1f28';
                      ctx.lineWidth = 3 * hpr;
                      ctx.strokeText(label, x, y);
                      ctx.fillStyle = item.mau;
                      ctx.fillText(label, x, y);
                    }
                  }
                  ctx.restore();
                }
              } catch (_e) {
                // lỗi vẽ số hợp lưu không ảnh hưởng các bộ Fib
              }

              ctx.restore();
            });
          }
        };
      }
    }];
  }
}

function fibLayDS() {
  if (_fibDsCache && _fibDsCache.ma === maHienTai) return _fibDsCache.ds;
  let ds = [];
  try { ds = docBoNho('fib.' + maHienTai, []); } catch (e) {}
  if (!Array.isArray(ds)) ds = [];
  if (fibGanMauThieu(ds)) { try { ghiBoNho('fib.' + maHienTai, ds); } catch (e) {} }
  _fibDsCache = { ma: maHienTai, ds };
  return ds;
}

function fibLuuDS(ds) {
  _fibDsCache = { ma: maHienTai, ds };
  try { ghiBoNho('fib.' + maHienTai, ds); } catch (e) {}
}

function fibMoiId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 5);
}

function fibGetXY(e) {
  const r = document.getElementById('chart').getBoundingClientRect();
  const cx = e.clientX ?? (e.changedTouches && e.changedTouches[0] ? e.changedTouches[0].clientX : 0);
  const cy = e.clientY ?? (e.changedTouches && e.changedTouches[0] ? e.changedTouches[0].clientY : 0);
  return { x: cx - r.left, y: cy - r.top };
}

function fibXYToAnchor(x, y) {
  let t = 0;
  if (duLieuNen.length) {
    const rt = chart.timeScale().coordinateToTime(x);
    const lastT = duLieuNen[duLieuNen.length - 1].time;
    if (rt == null) {
      t = lastT;
    } else {
      t = rt;
      // snap đến cây nến gần nhất
      let lo = 0, hi = duLieuNen.length - 1;
      while (lo < hi) { const m = (lo + hi + 1) >> 1; if (duLieuNen[m].time <= t) lo = m; else hi = m - 1; }
      if (lo + 1 < duLieuNen.length && Math.abs(duLieuNen[lo + 1].time - t) < Math.abs(duLieuNen[lo].time - t)) lo++;
      t = duLieuNen[lo].time;
    }
  }
  const p = nenSeries.coordinateToPrice(y) || 0;
  return { t, p };
}

function fibHitTest(x, y, thr) {
  _fibLastHitPrice = null;
  if (!fibGetShow()) return null;
  const hlKeys = fibHopLuuGetOnly() ? fibTinhHopLuu().keys : null;
  const ds = fibLayDS();
  for (let i = ds.length - 1; i >= 0; i--) {
    const fb = ds[i];
    if (fb.hidden || Math.abs(fb.p1 - fb.p2) < 1e-9) continue;
    for (const lv of FIB_LEVELS) {
      if (hlKeys && !hlKeys.has(fb.id + '|' + lv.r)) continue;
      const p = fb.p2 + (fb.p1 - fb.p2) * lv.r;
      const yc = nenSeries.priceToCoordinate(p);
      if (yc == null) continue;
      if (Math.abs(y - yc) <= thr) {
        _fibLastHitPrice = p;
        return fb.id;
      }
    }
  }
  return null;
}

function fibAnchorHitTest(x, y, thr) {
  if (!fibSelected) return null;
  const ds = fibLayDS();
  const fb = ds.find(f => f.id === fibSelected);
  if (!fb) return null;
  const x1c = fibTimeToX(fb.t1);
  const y1c = nenSeries.priceToCoordinate(fb.p1);
  const x2c = fibTimeToX(fb.t2);
  const y2c = nenSeries.priceToCoordinate(fb.p2);
  if (x1c != null && y1c != null && Math.abs(x - x1c) <= thr && Math.abs(y - y1c) <= thr) return 1;
  if (x2c != null && y2c != null && Math.abs(x - x2c) <= thr && Math.abs(y - y2c) <= thr) return 2;
  return null;
}

// Tính nhóm hợp lưu cho đường được bấm chọn.
// Trả về Set fbId của tất cả các Fib có đường mức trong cùng nhóm 0.5% với clickedPrice.
// Nếu không có nhóm (< 2 Fib) → trả về Set chỉ chứa clickedFbId.
function fibTinhNhomHopLuu(clickedFbId, clickedPrice) {
  const result = new Set([clickedFbId]);
  if (clickedPrice == null) return result;
  for (const g of fibTinhHopLuu().groups) {
    for (const pt of g) {
      if (pt.fbId === clickedFbId && Math.abs(pt.p - clickedPrice) < 1e-6) {
        return new Set(g.map(x => x.fbId));
      }
    }
  }
  return result;
}

function fibGetShow() { return docBoNho('fibShow.' + maHienTai, true); }
function fibSetShow(v) { ghiBoNho('fibShow.' + maHienTai, v); }

function fibCapNhatNut() { fibVePanel(); }

function fibCapNhatXoaBtn() {
  const btn = document.getElementById('fibXoaChon');
  if (btn) btn.style.display = (fibSelected && !fibBatMode) ? '' : 'none';
}

function fibVaoMode(bat) {
  fibBatMode = bat;
  fibVePhase = 0;
  fibDangVe = null;
  const btnFibEl = document.getElementById('btnFib');
  const hint = document.getElementById('fibHint');
  if (btnFibEl) btnFibEl.classList.toggle('active', bat);
  if (hint) hint.style.display = bat ? '' : 'none';
  if (bat) {
    if (kvMode) kvVaoMode(null);
    chart.applyOptions({ handleScroll: false, handleScale: false });
    fibSelected = null; fibDiagIds = null;
    fibCapNhatXoaBtn();
    const c = document.querySelector('#chart canvas');
    if (c) c.style.cursor = 'crosshair';
  } else {
    chart.applyOptions({ handleScroll: true, handleScale: true });
    const c = document.querySelector('#chart canvas');
    if (c) c.style.cursor = '';
    if (fibPrim) fibPrim.update();
  }
  fibVePanel();
}

function fibVeComplet(x, y) {
  if (!fibDangVe) return;
  const a2 = fibXYToAnchor(x, y);
  if (Math.abs(fibDangVe.p1 - a2.p) > 1e-6) {
    const ds = fibLayDS();
    ds.push({ id: fibMoiId(), t1: fibDangVe.t1, p1: fibDangVe.p1, t2: a2.t, p2: a2.p, mau: fibMauTiepTheo(ds) });
    fibLuuDS(ds);
  }
  fibDangVe = null;
  fibVaoMode(false);
}

// ---------- Sao lưu / khôi phục Fib ra file JSON ----------
const FIB_MA_HOP_LE = /^[A-Za-z0-9._-]{1,30}$/;
const FIB_NHOM_LUU = [['fib', 'sauchart.fib.'], ['fibShow', 'sauchart.fibShow.'], ['fibHopLuu', 'sauchart.fibHopLuu.'], ['draw', 'sauchart.draw.']];

function fibDatThongBao(txt) {
  const el = document.getElementById('fibSaoLuuMsg');
  if (el) el.textContent = txt;
}

function fibSaoLuuFile() {
  const out = { phienBan: 1, ts: Date.now(), fib: {}, fibShow: {}, fibHopLuu: {}, draw: {}, drawAlpha: kvAlphaChung(), fibAlpha: fibGetAlpha(), fibNhan: fibNhanGet() };
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      for (const [truong, tienTo] of FIB_NHOM_LUU) {
        if (k.startsWith(tienTo)) {
          try { out[truong][k.slice(tienTo.length)] = JSON.parse(localStorage.getItem(k)); } catch (e) {}
        }
      }
    }
  } catch (e) {}
  const d = new Date();
  const p2 = (n) => String(n).padStart(2, '0');
  const ten = `sauchart-fib-${d.getFullYear()}${p2(d.getMonth() + 1)}${p2(d.getDate())}-${p2(d.getHours())}${p2(d.getMinutes())}.json`;
  const url = URL.createObjectURL(new Blob([JSON.stringify(out, null, 1)], { type: 'application/json' }));
  const a = document.createElement('a');
  if ('download' in a) {
    a.href = url;
    a.download = ten;
    a.style.display = 'none';
    a.addEventListener('click', (e) => e.stopPropagation()); // tránh làm đóng bảng Fib
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 60000);
  } else {
    window.open(url, '_blank'); // trình duyệt không hỗ trợ a.download: mở file ở tab mới
  }
  const nMa = new Set([...Object.keys(out.fib), ...Object.keys(out.draw)]).size;
  fibDatThongBao(`Đã tạo ${ten} (${nMa} mã, gồm Fib và nét kẻ vẽ). Trên iPad: mở file qua Chia sẻ / Lưu vào Tệp nếu cần.`);
}

// Trả về { fib, fibShow, fibHopLuu } đã làm sạch, hoặc chuỗi báo lỗi
function fibKiemTraSaoLuu(data) {
  const laObj = (o) => o && typeof o === 'object' && !Array.isArray(o);
  if (!laObj(data)) return 'file không đúng cấu trúc.';
  if (data.phienBan !== 1) return 'phiên bản file không được hỗ trợ.';
  if (!laObj(data.fib)) return 'thiếu dữ liệu Fib.';
  const so = (v) => typeof v === 'number' && isFinite(v);
  const kq = { fib: {}, fibShow: {}, fibHopLuu: {} };
  for (const ma of Object.keys(data.fib)) {
    if (!FIB_MA_HOP_LE.test(ma)) return `mã "${ma}" không hợp lệ.`;
    const arr = data.fib[ma];
    if (!Array.isArray(arr)) return `danh sách Fib của ${ma} không hợp lệ.`;
    kq.fib[ma] = [];
    for (const f of arr) {
      if (!laObj(f) || typeof f.id !== 'string' || !f.id || !so(f.t1) || !so(f.p1) || !so(f.t2) || !so(f.p2)) {
        return `có Fib thiếu id/t1/p1/t2/p2 hoặc không phải số (mã ${ma}).`;
      }
      const o = { id: f.id, t1: f.t1, p1: f.p1, t2: f.t2, p2: f.p2 };
      if (typeof f.hidden === 'boolean') o.hidden = f.hidden;
      if (f.kieu === 'da' || f.kieu === 'don') o.kieu = f.kieu;
      if (fibMauHopLe(f.mau)) o.mau = f.mau.toLowerCase();
      kq.fib[ma].push(o);
    }
  }
  kq.draw = {};
  if (data.drawAlpha !== undefined) {
    if (typeof data.drawAlpha !== 'number' || !(data.drawAlpha >= 0.1 && data.drawAlpha <= 1)) return 'độ đậm nét vẽ (drawAlpha) không hợp lệ.';
    kq.drawAlpha = data.drawAlpha;
  }
  if (data.draw !== undefined) {
    if (!laObj(data.draw)) return 'mục draw (nét kẻ vẽ) không hợp lệ.';
    for (const ma of Object.keys(data.draw)) {
      if (!FIB_MA_HOP_LE.test(ma) || !Array.isArray(data.draw[ma])) return `nét kẻ vẽ của "${ma}" không hợp lệ.`;
      kq.draw[ma] = [];
      for (const l of data.draw[ma]) {
        const o = kvChuanHoa(l);
        if (!o) return `có nét kẻ vẽ thiếu hoặc sai trường (mã ${ma}).`;
        kq.draw[ma].push(o);
      }
    }
  }
  if (!Object.keys(kq.fib).length && !Object.keys(kq.draw).length) return 'file không chứa Fib hay nét vẽ nào.';
  for (const truong of ['fibShow', 'fibHopLuu']) {
    if (data[truong] === undefined) continue;
    if (!laObj(data[truong])) return `mục ${truong} không hợp lệ.`;
    for (const ma of Object.keys(data[truong])) {
      if (!FIB_MA_HOP_LE.test(ma) || typeof data[truong][ma] !== 'boolean') return `mục ${truong} có giá trị không hợp lệ.`;
      kq[truong][ma] = data[truong][ma];
    }
  }
  if (data.fibAlpha !== undefined) {
    if (typeof data.fibAlpha !== 'number' || !(data.fibAlpha >= 0.05 && data.fibAlpha <= 1)) return 'độ đậm vạch Fib (fibAlpha) không hợp lệ.';
    kq.fibAlpha = data.fibAlpha;
  }
  if (data.fibNhan !== undefined) {
    if (typeof data.fibNhan !== 'boolean') return 'cài đặt nhãn tỉ lệ (fibNhan) không hợp lệ.';
    kq.fibNhan = data.fibNhan;
  }
  return kq;
}

function fibKhoiPhucFile(file) {
  const loi = (m) => { alert('Không khôi phục được: ' + m + ' Dữ liệu hiện tại không bị thay đổi.'); };
  const rd = new FileReader();
  rd.onerror = () => loi('không đọc được file.');
  rd.onload = () => {
    let data;
    try { data = JSON.parse(rd.result); } catch (e) { return loi('file không phải JSON hợp lệ.'); }
    const kq = fibKiemTraSaoLuu(data);
    if (typeof kq === 'string') return loi(kq);
    if (!confirm('Khôi phục sẽ thay các Fib và nét vẽ hiện tại của mã có trong file. Tiếp tục?')) return;
    for (const ma of Object.keys(kq.fib)) ghiBoNho('fib.' + ma, kq.fib[ma]);
    for (const ma of Object.keys(kq.fibShow)) ghiBoNho('fibShow.' + ma, kq.fibShow[ma]);
    for (const ma of Object.keys(kq.fibHopLuu)) ghiBoNho('fibHopLuu.' + ma, kq.fibHopLuu[ma]);
    for (const ma of Object.keys(kq.draw)) ghiBoNho('draw.' + ma, kq.draw[ma]);
    if (kq.drawAlpha !== undefined) ghiBoNho('drawAlpha', kq.drawAlpha);
    if (kq.fibAlpha !== undefined) ghiBoNho('fibAlpha', kq.fibAlpha);
    if (kq.fibNhan !== undefined) ghiBoNho('fibNhan', kq.fibNhan);
    fibTai(); // đọc lại từ bộ nhớ, vẽ lại biểu đồ và danh sách
    kvTai();
    fibDatThongBao(`Đã khôi phục Fib cho ${Object.keys(kq.fib).length} mã và nét vẽ cho ${Object.keys(kq.draw).length} mã.`);
  };
  rd.readAsText(file);
}

// Cập nhật dấu hiệu lọc trên nút Fib và dòng chú thích "chưa có vùng hợp lưu" trong bảng
function fibCapNhatLocHL() {
  const on = fibHopLuuGetOnly();
  const btn = document.getElementById('btnFib');
  if (btn) btn.classList.toggle('fib-loc', on);
  const note = document.getElementById('fibHlNote');
  if (note) note.style.display = (on && !fibTinhHopLuu().groups.length) ? '' : 'none';
}

function fibVePanel() {
  const panelFib = document.getElementById('panelFib');
  if (!panelFib || panelFib.hidden) return;
  const body = document.getElementById('fibPanelBody');
  if (!body) return;

  const ds = fibLayDS();
  const showAll = fibGetShow();

  let html = `<div style="padding:8px 14px 6px;display:flex;gap:8px;align-items:center;flex-wrap:wrap">` +
    `<button id="fibBtnVeTrong" class="cobo-btn${fibBatMode ? ' active' : ''}">Vẽ FIB</button>` +
    `<label style="display:flex;align-items:center;gap:5px;font-size:12px;cursor:pointer">` +
    `<input type="checkbox" id="fibShowChk"${showAll ? ' checked' : ''}> Hiển thị Fib</label>` +
    `</div>` +
    `<div style="padding:0 14px 6px">` +
    `<label style="display:flex;align-items:center;gap:5px;font-size:12px;cursor:pointer">` +
    `<input type="checkbox" id="fibHlChk"${fibHopLuuGetOnly() ? ' checked' : ''}> Chỉ hiện vùng hợp lưu</label>` +
    `<div id="fibHlNote" style="display:none;margin-top:4px;font-size:11px;color:var(--muted)">` +
    `Chưa có vùng hợp lưu (cần ≥ 2 Fib có đường trùng trong 0.5%)</div>` +
    `</div>` +
    `<div style="padding:2px 14px 8px">` +
    `<div style="display:flex;align-items:center;gap:8px;font-size:12px">` +
    `<span>Độ đậm vạch Fib</span>` +
    `<span id="fibAlphaVal" style="min-width:36px;color:var(--muted)">${Math.round(fibGetAlpha() * 100)}%</span>` +
    `<button id="fibAlphaMacDinh" class="cobo-btn" style="font-size:11px;padding:2px 8px">Mặc định</button>` +
    `</div>` +
    `<input type="range" id="fibAlphaRange" min="5" max="100" step="5" value="${Math.round(fibGetAlpha() * 100)}"` +
    ` style="width:100%;margin:6px 0 0;touch-action:none">` +
    `</div>` +
    `<div style="padding:0 14px 6px">` +
    `<label style="display:flex;align-items:center;gap:5px;font-size:12px;cursor:pointer">` +
    `<input type="checkbox" id="fibNhanChk"${fibNhanGet() ? ' checked' : ''}> Hiện số dải Fib (0.5, 0.618...)</label>` +
    `</div>`;

  if (!ds.length) {
    html += `<div style="padding:2px 14px 10px;font-size:11px;color:var(--muted)">Chưa có Fib nào. Bấm Vẽ FIB để thêm.</div>`;
  } else {
    html += `<div class="fib-ds-list">`;
    for (const fb of ds) {
      const kieu = fb.kieu || 'da';
      const hidden = fb.hidden || false;
      const t1ms = (fb.t1 - LECH_GIO) * 1000;
      const t2ms = (fb.t2 - LECH_GIO) * 1000;
      const huong = fb.p1 > fb.p2 ? '↘ đỉnh→đáy' : '↗ đáy→đỉnh';
      const isSel = fb.id === fibSelected;
      const mauFb = fibMauHopLe(fb.mau) ? fb.mau.toLowerCase() : FIB_BANG_MAU[0];
      const mauKhac = new Set(ds.filter(o => o !== fb && fibMauHopLe(o.mau)).map(o => o.mau.toLowerCase()));
      let pal = '';
      for (const m of FIB_BANG_MAU) {
        pal += `<span class="fib-pal-c" data-id="${fb.id}" data-mau="${m}" title="${mauKhac.has(m) ? 'Đang được Fib khác dùng' : m}"` +
          ` style="width:22px;height:22px;border-radius:3px;background:${m};display:inline-flex;align-items:center;justify-content:center;cursor:pointer;` +
          `${m === mauFb ? 'outline:2px solid #fff;outline-offset:1px;' : ''}">` +
          (mauKhac.has(m) ? `<i style="width:6px;height:6px;border-radius:50%;background:rgba(0,0,0,.6)"></i>` : '') + `</span>`;
      }
      html += `<div class="fib-ds-row${isSel ? ' fib-ds-sel' : ''}">` +
        `<div style="display:flex;align-items:center;gap:8px">` +
        `<span class="fib-sw" data-id="${fb.id}" title="Đổi màu" style="display:inline-flex;padding:6px;margin:-6px;cursor:pointer">` +
        `<i style="width:10px;height:10px;border-radius:2px;background:${mauFb};display:block"></i></span>` +
        `<input type="checkbox" class="fib-cb" data-id="${fb.id}"${hidden ? '' : ' checked'} title="Hiện/ẩn">` +
        `</div>` +
        `<div class="fib-pal" data-id="${fb.id}" style="display:none;gap:6px;flex-wrap:wrap;padding:2px 0 4px">${pal}</div>` +
        `<div class="fib-ds-info" data-id="${fb.id}">` +
        `<span class="fib-huong">${huong}</span> ` +
        `Đ1: <b>${eaFmtVN(t1ms)}</b> @ <b>${dinhDangGia(fb.p1)}</b>` +
        ` → Đ2: <b>${eaFmtVN(t2ms)}</b> @ <b>${dinhDangGia(fb.p2)}</b>` +
        `</div>` +
        `<div class="fib-kieu-row">` +
        `<button class="fib-kieu-btn${kieu === 'da' ? ' active' : ''}" data-id="${fb.id}" data-kieu="da">Đa sắc</button>` +
        `<button class="fib-kieu-btn${kieu === 'don' ? ' active' : ''}" data-id="${fb.id}" data-kieu="don">Đơn sắc</button>` +
        `</div>` +
        `</div>`;
    }
    html += `</div>`;
  }

  html += `<div style="padding:8px 14px 10px;display:flex;gap:8px;flex-wrap:wrap;align-items:center;border-top:1px solid var(--border)">` +
    `<button id="fibBtnSaoLuu" class="cobo-btn" style="font-size:11px">Sao lưu Fib</button>` +
    `<button id="fibBtnKhoiPhuc" class="cobo-btn" style="font-size:11px">Khôi phục Fib</button>` +
    `<input type="file" id="fibFileIn" accept=".json,application/json" style="display:none">` +
    `<div id="fibSaoLuuMsg" style="flex-basis:100%;font-size:11px;color:var(--muted)"></div>` +
    `</div>`;

  body.innerHTML = html;

  const btnSaoLuu = document.getElementById('fibBtnSaoLuu');
  if (btnSaoLuu) btnSaoLuu.onclick = fibSaoLuuFile;
  const fileIn = document.getElementById('fibFileIn');
  const btnKhoiPhuc = document.getElementById('fibBtnKhoiPhuc');
  if (btnKhoiPhuc && fileIn) btnKhoiPhuc.onclick = () => { fileIn.value = ''; fileIn.click(); };
  if (fileIn) fileIn.onchange = () => {
    const f = fileIn.files && fileIn.files[0];
    if (f) fibKhoiPhucFile(f);
  };

  const veBtn = document.getElementById('fibBtnVeTrong');
  if (veBtn) veBtn.onclick = () => {
    if (fibBatMode) { fibVaoMode(false); return; }
    if (!fibGetShow()) { fibSetShow(true); if (fibPrim) fibPrim.update(); }
    document.getElementById('panelFib').hidden = true;
    fibVaoMode(true);
  };

  const showChk = document.getElementById('fibShowChk');
  if (showChk) showChk.onchange = () => {
    fibSetShow(showChk.checked);
    fibCapNhatLocHL();
    if (fibPrim) fibPrim.update();
  };

  const nhanChk = document.getElementById('fibNhanChk');
  if (nhanChk) nhanChk.onchange = () => {
    ghiBoNho('fibNhan', nhanChk.checked);
    fibVeLaiRaf();
  };

  const alphaRange = document.getElementById('fibAlphaRange');
  const alphaVal = document.getElementById('fibAlphaVal');
  const datAlpha = (pct) => {
    if (alphaRange) alphaRange.value = pct;
    if (alphaVal) alphaVal.textContent = pct + '%';
    ghiBoNho('fibAlpha', pct / 100);
    fibVeLaiRaf();
  };
  if (alphaRange) {
    alphaRange.oninput = () => datAlpha(Number(alphaRange.value));
    // kéo thanh không được cuộn biểu đồ hay bị coi là bấm ra ngoài đóng bảng
    alphaRange.addEventListener('click', (e) => e.stopPropagation());
    alphaRange.addEventListener('touchstart', (e) => e.stopPropagation(), { passive: true });
    alphaRange.addEventListener('touchmove', (e) => e.stopPropagation(), { passive: true });
  }
  const alphaMD = document.getElementById('fibAlphaMacDinh');
  if (alphaMD) alphaMD.onclick = () => datAlpha(Math.round(FIB_DUONG_ALPHA * 100));

  const hlChk = document.getElementById('fibHlChk');
  if (hlChk) hlChk.onchange = () => {
    fibHopLuuSetOnly(hlChk.checked);
    fibCapNhatLocHL();
    if (fibPrim) fibPrim.update();
  };
  fibCapNhatLocHL();

  body.querySelectorAll('.fib-sw').forEach(sw => {
    sw.onclick = () => {
      const pal = body.querySelector(`.fib-pal[data-id="${sw.dataset.id}"]`);
      if (!pal) return;
      const mo = pal.style.display !== 'none';
      body.querySelectorAll('.fib-pal').forEach(x => { x.style.display = 'none'; });
      if (!mo) pal.style.display = 'flex';
    };
  });
  body.querySelectorAll('.fib-pal-c').forEach(c => {
    c.onclick = () => {
      const ds2 = fibLayDS();
      const fb = ds2.find(f => f.id === c.dataset.id);
      if (!fb) return;
      fb.mau = c.dataset.mau;
      fibLuuDS(ds2);
      fibVePanel();
      if (fibPrim) fibPrim.update();
    };
  });

  body.querySelectorAll('.fib-cb').forEach(cb => {
    cb.onchange = () => {
      const ds2 = fibLayDS();
      const fb = ds2.find(f => f.id === cb.dataset.id);
      if (fb) { fb.hidden = !cb.checked; fibLuuDS(ds2); fibCapNhatLocHL(); if (fibPrim) fibPrim.update(); }
    };
  });

  body.querySelectorAll('.fib-ds-info').forEach(el => {
    el.onclick = () => {
      fibSelected = el.dataset.id;
      fibDiagIds = new Set([fibSelected]);
      fibCapNhatXoaBtn();
      if (fibPrim) fibPrim.update();
      // highlight row
      body.querySelectorAll('.fib-ds-row').forEach(r => r.classList.remove('fib-ds-sel'));
      el.closest('.fib-ds-row').classList.add('fib-ds-sel');
      // scroll biểu đồ tới điểm 1
      try {
        const fb = fibLayDS().find(f => f.id === el.dataset.id);
        if (fb) {
          const idx = chart.timeScale().timeToIndex(fb.t1, true);
          if (idx != null) {
            const range = chart.timeScale().getVisibleLogicalRange();
            const span = range ? range.to - range.from : 150;
            chart.timeScale().setVisibleLogicalRange({ from: idx - span * 0.3, to: idx + span * 0.7 });
          }
        }
      } catch (ex) {}
    };
  });

  body.querySelectorAll('.fib-kieu-btn').forEach(btn => {
    btn.onclick = () => {
      const ds2 = fibLayDS();
      const fb = ds2.find(f => f.id === btn.dataset.id);
      if (!fb) return;
      fb.kieu = btn.dataset.kieu;
      fibLuuDS(ds2);
      body.querySelectorAll(`.fib-kieu-btn[data-id="${btn.dataset.id}"]`).forEach(b => {
        b.classList.toggle('active', b.dataset.kieu === fb.kieu);
      });
      if (fibPrim) fibPrim.update();
    };
  });
}

function fibXoaChon() {
  if (!fibSelected) return;
  const ds = fibLayDS().filter(f => f.id !== fibSelected);
  fibLuuDS(ds);
  fibSelected = null; fibDiagIds = null;
  fibCapNhatXoaBtn();
  fibVePanel();
  if (fibPrim) fibPrim.update();
}

function fibTai() {
  _fibDsCache = null;
  if (fibBatMode) fibVaoMode(false);
  fibSelected = null; fibDiagIds = null;
  fibDangVe = null;
  fibVePhase = 0;
  fibDragState = null;
  fibPointerActive = false;
  fibCapNhatXoaBtn();
  fibCapNhatLocHL();
  fibVePanel();
  if (fibPrim) fibPrim.update();
}

function fibOnPointerDown(e) {
  if (e.pointerType === 'mouse' && e.button !== 0) return;
  const { x, y } = fibGetXY(e);

  if (fibBatMode) {
    if (fibVePhase === 0) {
      const a = fibXYToAnchor(x, y);
      fibDangVe = { t1: a.t, p1: a.p, t2: a.t, p2: a.p };
      fibP1_cx = e.clientX; fibP1_cy = e.clientY;
      fibVePhase = 1;
      fibPointerActive = true;
      if (fibPrim) fibPrim.update();
    } else {
      fibVeComplet(x, y);
      fibPointerActive = false;
    }
    e.preventDefault();
    return;
  }

  if (fibSelected) {
    const isMob = window.matchMedia('(pointer: coarse)').matches;
    const thr = isMob ? 16 : 10;
    const which = fibAnchorHitTest(x, y, thr);
    if (which) {
      fibDragState = { which };
      fibPointerActive = true;
      chart.applyOptions({ handleScroll: false, handleScale: false });
      e.preventDefault();
    }
  }
}

function fibOnPointerMove(e) {
  const { x, y } = fibGetXY(e);

  if (fibDragState && fibSelected) {
    const a = fibXYToAnchor(x, y);
    const ds = fibLayDS();
    const fb = ds.find(f => f.id === fibSelected);
    if (fb) {
      if (fibDragState.which === 1) { fb.t1 = a.t; fb.p1 = a.p; }
      else { fb.t2 = a.t; fb.p2 = a.p; }
      if (fibPrim) fibPrim.update();
    }
    e.preventDefault();
    return;
  }

  if (fibBatMode && fibVePhase === 1 && fibDangVe) {
    const a = fibXYToAnchor(x, y);
    fibDangVe.t2 = a.t;
    fibDangVe.p2 = a.p;
    if (fibPrim) fibPrim.update();
  }
}

function fibOnPointerUp(e) {
  const { x, y } = fibGetXY(e);

  if (fibDragState && fibSelected) {
    const a = fibXYToAnchor(x, y);
    const ds = fibLayDS();
    const fb = ds.find(f => f.id === fibSelected);
    if (fb) {
      if (fibDragState.which === 1) { fb.t1 = a.t; fb.p1 = a.p; }
      else { fb.t2 = a.t; fb.p2 = a.p; }
      fibLuuDS(ds);
      if (fibPrim) fibPrim.update();
    }
    fibDragState = null;
    fibPointerActive = false;
    chart.applyOptions({ handleScroll: true, handleScale: true });
    return;
  }

  if (fibBatMode && fibVePhase === 1 && fibPointerActive) {
    const dx = e.clientX - fibP1_cx;
    const dy = e.clientY - fibP1_cy;
    if (Math.sqrt(dx * dx + dy * dy) > 5) {
      fibVeComplet(x, y);
    }
    fibPointerActive = false;
  }
}

function fibOnPointerCancel(e) {
  if (fibDragState) {
    _fibDsCache = null;
    fibDragState = null;
    fibPointerActive = false;
    chart.applyOptions({ handleScroll: true, handleScale: true });
    if (fibPrim) fibPrim.update();
  }
  if (fibBatMode && fibVePhase === 1) {
    fibDangVe = null;
    fibVePhase = 0;
    fibPointerActive = false;
    if (fibPrim) fibPrim.update();
  }
}

function fibOnKeyDown(e) {
  if (fibBatMode && e.key === 'Escape') {
    fibDangVe = null;
    fibVaoMode(false);
  }
  if (!fibBatMode && fibSelected && e.key === 'Escape') {
    fibSelected = null; fibDiagIds = null;
    fibCapNhatXoaBtn();
    if (fibPrim) fibPrim.update();
  }
  if (!fibBatMode && fibSelected && (e.key === 'Delete' || e.key === 'Backspace')) {
    const tag = document.activeElement.tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA') return;
    fibXoaChon();
  }
}

function fibKhoiDong() {
  fibPrim = new FibPrimitive();
  nenSeries.attachPrimitive(fibPrim);

  const chartEl = document.getElementById('chart');
  chartEl.addEventListener('pointerdown', fibOnPointerDown);
  chartEl.addEventListener('pointermove', fibOnPointerMove);
  chartEl.addEventListener('pointerup', fibOnPointerUp);
  chartEl.addEventListener('pointercancel', fibOnPointerCancel);
  document.addEventListener('keydown', fibOnKeyDown);

  // Nút mở/đóng bảng Fib
  const btnFibEl = document.getElementById('btnFib');
  const panelFib = document.getElementById('panelFib');
  if (btnFibEl && panelFib) {
    btnFibEl.onclick = (e) => {
      e.stopPropagation();
      if (!panelFib.hidden) { panelFib.hidden = true; return; }
      panelFib.hidden = false;
      fibVePanel();
    };
    document.addEventListener('click', (e) => {
      if (!panelFib || panelFib.hidden) return;
      // composedPath: phần tử vừa bấm có thể đã bị dựng lại (gỡ khỏi cây) trong lúc xử lý, contains() sẽ sai
      const trongBang = e.composedPath ? e.composedPath().includes(panelFib) : panelFib.contains(e.target);
      if (!trongBang && e.target !== btnFibEl) panelFib.hidden = true;
    });
  }

  fibCapNhatLocHL();

  const btnDongFib = document.getElementById('btnDongFib');
  if (btnDongFib) btnDongFib.onclick = () => { document.getElementById('panelFib').hidden = true; };

  const btnXoaChon = document.getElementById('fibXoaChon');
  if (btnXoaChon) btnXoaChon.onclick = fibXoaChon;
}

// ==================== KẺ VẼ: ĐƯỜNG NGANG / ĐƯỜNG DỌC / TRENDLINE ====================
// Lưu (time, price) gốc theo mã ('sauchart.draw.<MA>'), dùng chung mọi khung giờ; tọa độ y luôn qua
// series.priceToCoordinate (đúng cả Regular lẫn Logarithmic); tọa độ x qua kvTimeToX (xem bên dưới).
// Nét: { id, k:'h'|'v'|'t', t1?, p1?, t2?, p2?, mau, w:1|2|3, ls:'solid'|'dash', extR?, extL? }

// Hệ số độ đậm chung cho mọi nét vẽ (0.1–1, mặc định 1); alpha thực tế của nét = alpha riêng × hệ số chung
function kvAlphaChung() {
  const v = docBoNho('drawAlpha', 1);
  return (typeof v === 'number' && v >= 0.1 && v <= 1) ? v : 1;
}

function kvOpt() {
  const o = docBoNho('veTuyChon', {});
  return { extR: !!(o && o.extR === true), extL: !!(o && o.extL === true) };
}

function kvChuanHoa(l) {
  const so = (v) => typeof v === 'number' && isFinite(v);
  if (!l || typeof l !== 'object' || typeof l.id !== 'string' || !l.id) return null;
  if (l.k === 'r' || l.loai === 'rect') {
    // Hình chữ nhật: {loai:'rect', t1,p1,t2,p2, mau, day, kieu, alpha, alphaNen, keoDaiPhai} (+ k:'r' để phân nhánh trong code)
    if (![l.t1, l.p1, l.t2, l.p2].every(so)) return null;
    return {
      id: l.id, k: 'r', loai: 'rect', t1: l.t1, p1: l.p1, t2: l.t2, p2: l.p2,
      mau: fibMauHopLe(l.mau) ? l.mau.toLowerCase() : FIB_BANG_MAU[0],
      day: (l.day === 1 || l.day === 2 || l.day === 3) ? l.day : 1,
      kieu: l.kieu === 'dash' ? 'dash' : 'solid',
      alpha: (typeof l.alpha === 'number' && l.alpha >= 0.1 && l.alpha <= 1) ? Math.round(l.alpha * 100) / 100 : 1,
      alphaNen: (so(l.alphaNen) && l.alphaNen >= 0 && l.alphaNen <= 0.6) ? Math.round(l.alphaNen * 100) / 100 : 0.15,
      keoDaiPhai: l.keoDaiPhai === true,
    };
  }
  if (l.k !== 'h' && l.k !== 'v' && l.k !== 't') return null;
  const o = {
    id: l.id, k: l.k,
    mau: fibMauHopLe(l.mau) ? l.mau.toLowerCase() : FIB_BANG_MAU[0],
    w: (l.w === 1 || l.w === 2 || l.w === 3) ? l.w : 1,
    alpha: (typeof l.alpha === 'number' && l.alpha >= 0.1 && l.alpha <= 1) ? Math.round(l.alpha * 100) / 100 : 1,
    ls: l.ls === 'dash' ? 'dash' : 'solid',
  };
  if (l.k === 'h') { if (!so(l.p1)) return null; o.p1 = l.p1; }
  else if (l.k === 'v') { if (!so(l.t1)) return null; o.t1 = l.t1; }
  else {
    if (![l.t1, l.p1, l.t2, l.p2].every(so)) return null;
    o.t1 = l.t1; o.p1 = l.p1; o.t2 = l.t2; o.p2 = l.p2;
    o.extR = l.extR === true; o.extL = l.extL === true;
  }
  return o;
}

function kvLayDS() {
  if (_kvCache && _kvCache.ma === maHienTai) return _kvCache.ds;
  let ds = [];
  try { ds = docBoNho('draw.' + maHienTai, []); } catch (e) {}
  if (!Array.isArray(ds)) ds = [];
  ds = ds.map(kvChuanHoa).filter(Boolean);
  _kvCache = { ma: maHienTai, ds };
  return ds;
}
function kvLuuDS(ds) {
  _kvCache = { ma: maHienTai, ds };
  ghiBoNho('draw.' + maHienTai, ds);
}
function kvTim(id) { return id ? kvLayDS().find((l) => l.id === id) || null : null; }

// ---------- Tọa độ ----------
// x của một thời điểm: dùng timeToIndex(t, true) + logicalToCoordinate; nội suy phân số giữa 2 nến
// (đổi khung giờ vẫn đúng chỗ) và ngoại suy khi t nằm ngoài dữ liệu. Trả null khi chưa có nến.
// logicalToCoordinate chỉ đúng với chỉ số NGUYÊN (chỉ số lẻ trả 0) → nội suy tuyến tính giữa 2 chỉ số nguyên
function kvLogicalToX(idx) {
  const ts = chart.timeScale();
  const i = Math.floor(idx), f = idx - i;
  const a = ts.logicalToCoordinate(i);
  if (a == null || f < 1e-9) return a;
  const b = ts.logicalToCoordinate(i + 1);
  return b == null ? a : a + f * (b - a);
}
function kvTimeToX(t) {
  const n = duLieuNen.length;
  if (!n) return null;
  const ts = chart.timeScale();
  const first = duLieuNen[0].time, last = duLieuNen[n - 1].time;
  const spb = n >= 2 ? Math.max(1, last - duLieuNen[n - 2].time) : 86400;
  const spb0 = n >= 2 ? Math.max(1, duLieuNen[1].time - first) : 86400;
  let idx;
  if (t >= last) idx = (n - 1) + (t - last) / spb;
  else if (t <= first) idx = (t - first) / spb0;
  else {
    let i = ts.timeToIndex(t, true);
    if (i == null) return null;
    if (i >= n - 1) i = n - 2;
    if (duLieuNen[i].time > t) i--;
    if (i < 0) i = 0;
    const a = duLieuNen[i].time, b = duLieuNen[i + 1].time;
    idx = i + (t - a) / Math.max(1, b - a);
  }
  return kvLogicalToX(idx);
}
// Thời điểm (snap vào nến gần nhất, ngoại suy theo độ dài nến khi click vùng trống bên phải/trái)
function kvXToTime(x) {
  const n = duLieuNen.length;
  if (!n) return 0;
  const first = duLieuNen[0].time, last = duLieuNen[n - 1].time;
  const l = chart.timeScale().coordinateToLogical(x);
  if (l == null) return last;
  const i = Math.round(l);
  if (i < 0) return first + i * (n >= 2 ? Math.max(1, duLieuNen[1].time - first) : 86400);
  if (i >= n) return last + (i - (n - 1)) * (n >= 2 ? Math.max(1, last - duLieuNen[n - 2].time) : 86400);
  return duLieuNen[i].time;
}
function kvXYToAnchor(x, y) {
  const p = nenSeries.coordinateToPrice(y);
  if (p == null || !isFinite(p)) return null;
  return { t: kvXToTime(x), p };
}
function kvToaDo(ln) {
  return {
    x1: ln.t1 != null ? kvTimeToX(ln.t1) : null,
    y1: ln.p1 != null ? nenSeries.priceToCoordinate(ln.p1) : null,
    x2: ln.t2 != null ? kvTimeToX(ln.t2) : null,
    y2: ln.p2 != null ? nenSeries.priceToCoordinate(ln.p2) : null,
  };
}
// Đoạn thẳng của trendline sau khi kéo dài sang trái/phải (cùng đơn vị với đầu vào; W = bề rộng vùng vẽ)
function kvTrendSeg(x1, y1, x2, y2, eL, eR, W) {
  let ax = x1, ay = y1, bx = x2, by = y2;
  if (ax > bx) { ax = x2; ay = y2; bx = x1; by = y1; }
  const dx = bx - ax;
  if (Math.abs(dx) < 1e-6) return [ax, ay, bx, by];
  const m = (by - ay) / dx;
  let nx1 = ax, ny1 = ay, nx2 = bx, ny2 = by;
  if (eR) { nx2 = Math.max(W, bx); ny2 = ay + m * (nx2 - ax); }
  if (eL) { nx1 = Math.min(0, ax); ny1 = ay + m * (nx1 - ax); }
  return [nx1, ny1, nx2, ny2];
}
function kvKcDoan(px, py, s) {
  const dx = s[2] - s[0], dy = s[3] - s[1];
  const L2 = dx * dx + dy * dy;
  let t = L2 ? ((px - s[0]) * dx + (py - s[1]) * dy) / L2 : 0;
  t = Math.max(0, Math.min(1, t));
  return Math.hypot(px - (s[0] + t * dx), py - (s[1] + t * dy));
}

// ---------- Hit-test (CSS px) ----------
function kvThr() { return window.matchMedia('(pointer: coarse)').matches ? 12 : 6; }
function kvTrongVung(x, y) {
  try {
    const pw = chart.timeScale().width();
    const ph = chart.panes()[0].getHeight();
    return x >= 0 && y >= 0 && x <= pw && y <= ph;
  } catch (e) { return false; }
}
// Hộp hình chữ nhật (đơn vị tùy sx, sy): l,t,b là cạnh; rr = cạnh phải thật; r = cạnh phải vẽ (tới hết màn hình nếu kéo dài)
function kvRectBox(ln, sx, sy, W) {
  const c = kvToaDo(ln);
  if (c.x1 == null || c.y1 == null || c.x2 == null || c.y2 == null) return null;
  const l = Math.min(c.x1, c.x2) * sx, rr = Math.max(c.x1, c.x2) * sx;
  const t = Math.min(c.y1, c.y2) * sy, b = Math.max(c.y1, c.y2) * sy;
  return { l, t, b, rr, r: ln.keoDaiPhai ? Math.max(rr, W + 4 * sx) : rr };
}
// Tám điểm kéo của hình chữ nhật (CSS px): 4 góc + 4 giữa cạnh
function kvRectHandles(ln) {
  const R = kvRectBox(ln, 1, 1, 0);
  if (!R) return [];
  const mx = (R.l + R.rr) / 2, my = (R.t + R.b) / 2;
  return [
    { n: 'nw', x: R.l, y: R.t }, { n: 'n', x: mx, y: R.t }, { n: 'ne', x: R.rr, y: R.t }, { n: 'e', x: R.rr, y: my },
    { n: 'se', x: R.rr, y: R.b }, { n: 's', x: mx, y: R.b }, { n: 'sw', x: R.l, y: R.b }, { n: 'w', x: R.l, y: my },
  ];
}
function kvVienRect(x, y, R, thr) {
  if (x < R.l - thr || x > R.r + thr || y < R.t - thr || y > R.b + thr) return false;
  return Math.abs(x - R.l) <= thr || Math.abs(y - R.t) <= thr || Math.abs(y - R.b) <= thr || (Math.abs(x - R.r) <= thr && R.r === R.rr);
}
// Trả về {id, vung:'vien'|'trong'}: ưu tiên mọi nét và VIỀN hình (từ nét vẽ sau cùng), sau đó mới tới RUỘT hình chữ nhật nhỏ nhất
function kvHit(x, y, thr) {
  const ds = kvLayDS();
  const W = document.getElementById('chart').clientWidth;
  for (let i = ds.length - 1; i >= 0; i--) {
    const ln = ds[i];
    if (ln.k === 'r') {
      const R = kvRectBox(ln, 1, 1, W);
      if (R && kvVienRect(x, y, R, thr)) return { id: ln.id, vung: 'vien' };
      continue;
    }
    const c = kvToaDo(ln);
    if (ln.k === 'h') { if (c.y1 != null && Math.abs(y - c.y1) <= thr) return { id: ln.id, vung: 'vien' }; }
    else if (ln.k === 'v') { if (c.x1 != null && Math.abs(x - c.x1) <= thr) return { id: ln.id, vung: 'vien' }; }
    else if (c.x1 != null && c.y1 != null && c.x2 != null && c.y2 != null) {
      const s = kvTrendSeg(c.x1, c.y1, c.x2, c.y2, ln.extL, ln.extR, W);
      if (kvKcDoan(x, y, s) <= thr) return { id: ln.id, vung: 'vien' };
    }
  }
  let best = null, dt = Infinity;
  for (const ln of ds) {
    if (ln.k !== 'r') continue;
    const R = kvRectBox(ln, 1, 1, W);
    if (R && x >= R.l && x <= R.r && y >= R.t && y <= R.b) {
      const dtich = (R.r - R.l) * (R.b - R.t);
      if (dtich < dt) { dt = dtich; best = ln; }
    }
  }
  return best ? { id: best.id, vung: 'trong' } : null;
}
function kvHitTest(x, y, thr) { const h = kvHit(x, y, thr); return h ? h.id : null; }
// Click trúng Fib hoặc mũi tên EA thì nhường cho chúng (không chọn ruột hình chữ nhật đè lên)
function kvNhuongChoKhac(x, y) {
  try { if (fibGetShow() && fibHitTest(x, y, window.matchMedia('(pointer: coarse)').matches ? 14 : 8) !== null) return true; } catch (e) {}
  try { if (caiDatEA.hist && caiDatEA.on && eaCoHoTro() && eaVaoTimGanNhat({ x, y })) return true; } catch (e) {}
  return false;
}
function kvAnchorHit(ln, x, y, thr) {
  if (!ln) return null;
  if (ln.k === 'r') {
    for (const h of kvRectHandles(ln)) if (Math.hypot(x - h.x, y - h.y) <= thr) return h.n;
    return null;
  }
  if (ln.k !== 't') return null;
  const c = kvToaDo(ln);
  if (c.x1 != null && c.y1 != null && Math.hypot(x - c.x1, y - c.y1) <= thr) return 'p1';
  if (c.x2 != null && c.y2 != null && Math.hypot(x - c.x2, y - c.y2) <= thr) return 'p2';
  return null;
}
const KV_CON_KEO = { nw: 'nwse-resize', se: 'nwse-resize', ne: 'nesw-resize', sw: 'nesw-resize', n: 'ns-resize', s: 'ns-resize', e: 'ew-resize', w: 'ew-resize' };
function kvConTro(pt) {
  if (kvMode) return 'crosshair';
  if (kvDrag) return KV_CON_KEO[kvDrag.loai] || 'move';
  if (!kvPrim || !pt || !kvTrongVung(pt.x, pt.y)) return null;
  if (!kvLayDS().length) return null;
  const thr = kvThr();
  const sel = kvTim(kvSelected);
  const neo = sel ? kvAnchorHit(sel, pt.x, pt.y, thr + 4) : null;
  if (neo) return KV_CON_KEO[neo] || 'move';
  const h = kvHit(pt.x, pt.y, thr);
  if (!h) return null;
  if (h.vung === 'trong') return h.id === kvSelected ? 'move' : null; // ruột hình chưa chọn: để chart kéo bình thường
  return h.id === kvSelected ? 'move' : 'pointer';
}

// ---------- Vẽ ----------
function kvMauChu(mau) {
  const n = parseInt(mau.slice(1), 16);
  const lum = (0.299 * (n >> 16) + 0.587 * ((n >> 8) & 255) + 0.114 * (n & 255)) / 255;
  return lum > 0.55 ? '#1d1f28' : '#ffffff';
}
function kvFmtThoiGian(t) {
  const d = new Date(t * 1000); // t = giây UTC + LECH_GIO nên các trường UTC chính là giờ VN
  const p = (n) => String(n).padStart(2, '0');
  const ngay = `${p(d.getUTCDate())}/${p(d.getUTCMonth() + 1)}/${String(d.getUTCFullYear()).slice(2)}`;
  return (d.getUTCHours() === 0 && d.getUTCMinutes() === 0) ? ngay : `${ngay} ${p(d.getUTCHours())}:${p(d.getUTCMinutes())}`;
}
function kvTrucView(coord, text, mau) {
  return { coordinate: () => coord, text: () => text, textColor: () => kvMauChu(mau), backColor: () => mau, visible: () => true, tickVisible: () => true };
}

// Nền tô của hình chữ nhật (vẽ ở lượt đầu để không phủ lên các nét khác)
function kvVeRectNen(ctx, ln, hpr, vpr, W, xemTruoc) {
  if (!(ln.alphaNen > 0)) return;
  const R = kvRectBox(ln, hpr, vpr, W);
  if (!R) return;
  ctx.save();
  ctx.globalAlpha = (xemTruoc ? 0.6 : 1) * ln.alphaNen * kvAlphaChung();
  ctx.fillStyle = ln.mau;
  ctx.fillRect(R.l, R.t, R.r - R.l, R.b - R.t);
  ctx.restore();
}
function kvVeRectVien(ctx, ln, hpr, vpr, W, sel, xemTruoc) {
  const R = kvRectBox(ln, hpr, vpr, W);
  if (!R) return;
  ctx.save();
  ctx.globalAlpha = (xemTruoc ? 0.6 : 1) * (ln.alpha == null ? 1 : ln.alpha) * kvAlphaChung();
  ctx.strokeStyle = ln.mau;
  ctx.lineWidth = ((ln.day || 1) + (sel ? 1 : 0)) * hpr;
  ctx.setLineDash(ln.kieu === 'dash' ? [6 * hpr, 4 * hpr] : []);
  ctx.beginPath();
  if (ln.keoDaiPhai) { ctx.moveTo(R.r, R.t); ctx.lineTo(R.l, R.t); ctx.lineTo(R.l, R.b); ctx.lineTo(R.r, R.b); }
  else ctx.rect(R.l, R.t, R.r - R.l, R.b - R.t);
  ctx.stroke();
  if (sel) {
    ctx.setLineDash([]);
    ctx.globalAlpha = 1;
    const mx = (R.l + R.rr) / 2, my = (R.t + R.b) / 2;
    const cham = [[R.l, R.t, 5], [mx, R.t, 4], [R.rr, R.t, 5], [R.rr, my, 4], [R.rr, R.b, 5], [mx, R.b, 4], [R.l, R.b, 5], [R.l, my, 4]];
    for (const [x, y, r] of cham) {
      ctx.beginPath();
      ctx.arc(x, y, r * hpr, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.fill();
      ctx.strokeStyle = ln.mau;
      ctx.lineWidth = 2 * hpr;
      ctx.stroke();
    }
  }
  ctx.restore();
}

function kvVeNet(ctx, ln, hpr, vpr, W, H, sel, xemTruoc) {
  if (ln.k === 'r') { kvVeRectVien(ctx, ln, hpr, vpr, W, sel, xemTruoc); return; }
  const c = kvToaDo(ln);
  ctx.save();
  ctx.globalAlpha = (xemTruoc ? 0.6 : 1) * (ln.alpha == null ? 1 : ln.alpha) * kvAlphaChung();
  ctx.strokeStyle = ln.mau;
  ctx.lineWidth = ((ln.w || 1) + (sel ? 1 : 0)) * hpr;
  ctx.lineCap = 'butt';
  ctx.setLineDash(ln.ls === 'dash' ? [6 * hpr, 4 * hpr] : []);
  ctx.beginPath();
  let ve = false;
  if (ln.k === 'h') {
    if (c.y1 != null) { ctx.moveTo(0, c.y1 * vpr); ctx.lineTo(W, c.y1 * vpr); ve = true; }
  } else if (ln.k === 'v') {
    if (c.x1 != null) { ctx.moveTo(c.x1 * hpr, 0); ctx.lineTo(c.x1 * hpr, H); ve = true; }
  } else if (c.x1 != null && c.y1 != null && c.x2 != null && c.y2 != null) {
    const s = kvTrendSeg(c.x1 * hpr, c.y1 * vpr, c.x2 * hpr, c.y2 * vpr, ln.extL, ln.extR, W);
    ctx.moveTo(s[0], s[1]); ctx.lineTo(s[2], s[3]); ve = true;
  }
  if (ve) ctx.stroke();
  if (sel && ln.k === 't' && ve) {
    ctx.setLineDash([]);
    ctx.globalAlpha = 1;
    for (const [x, y] of [[c.x1, c.y1], [c.x2, c.y2]]) {
      ctx.beginPath();
      ctx.arc(x * hpr, y * vpr, 5 * hpr, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.fill();
      ctx.strokeStyle = ln.mau;
      ctx.lineWidth = 2 * hpr;
      ctx.stroke();
    }
  }
  ctx.restore();
}

class KeVePrimitive {
  constructor() { this._series = null; this._chart = null; this._req = null; this._pv = []; this._tv = []; }
  attached(p) { this._series = p.series; this._chart = p.chart; this._req = p.requestUpdate; }
  detached() { this._series = null; this._chart = null; this._req = null; }
  update() { if (this._req) this._req(); }

  updateAllViews() {
    this._pv = []; this._tv = [];
    if (!this._series || !this._chart) return;
    try {
      const H = this._chart.panes()[0].getHeight();
      const W = this._chart.timeScale().width();
      for (const ln of kvLayDS()) {
        if (ln.k === 'h') {
          const y = this._series.priceToCoordinate(ln.p1);
          if (y != null && y >= 0 && y <= H) this._pv.push(kvTrucView(y, dinhDangGia(ln.p1), ln.mau));
        } else if (ln.k === 'v') {
          const x = kvTimeToX(ln.t1);
          if (x != null && x >= 0 && x <= W) this._tv.push(kvTrucView(x, kvFmtThoiGian(ln.t1), ln.mau));
        }
      }
    } catch (e) {}
    kvCapNhatThanh();
  }
  priceAxisViews() { return this._pv; }
  timeAxisViews() { return this._tv; }

  paneViews() {
    return [{
      renderer() {
        return {
          draw(target) {
            const ds = kvLayDS();
            if (!ds.length && !kvDangVe) return;
            target.useBitmapCoordinateSpace(({ context: ctx, horizontalPixelRatio: hpr, verticalPixelRatio: vpr, bitmapSize }) => {
              const W = bitmapSize.width, H = bitmapSize.height;
              for (const ln of ds) {
                if (ln.k === 'r') { try { kvVeRectNen(ctx, ln, hpr, vpr, W, false); } catch (e) {} }
              }
              if (kvDangVe && kvDangVe.k === 'r') { try { kvVeRectNen(ctx, kvDangVe, hpr, vpr, W, true); } catch (e) {} }
              for (const ln of ds) {
                try { kvVeNet(ctx, ln, hpr, vpr, W, H, ln.id === kvSelected, false); } catch (e) {}
              }
              if (kvDangVe) { try { kvVeNet(ctx, kvDangVe, hpr, vpr, W, H, false, true); } catch (e) {} }
            });
          },
        };
      },
    }];
  }
}

// ---------- Thao tác ----------
function kvRectMacDinh() {
  return { mau: FIB_BANG_MAU[0], day: 1, kieu: 'solid', alpha: 1, alphaNen: 0.15, keoDaiPhai: false };
}
function kvNetMacDinh() {
  const o = kvOpt();
  return { mau: FIB_BANG_MAU[0], w: 1, alpha: 1, ls: 'solid', extR: o.extR, extL: o.extL };
}
function kvCapNhatCuon() {
  const khoa = !!(fibBatMode || kvMode || kvDrag || fibDragState);
  chart.applyOptions({ handleScroll: !khoa, handleScale: !khoa });
}
function kvCapNhatNut() {
  const b = document.getElementById('btnVe');
  if (b) b.classList.toggle('active', !!kvMode);
  const hint = document.getElementById('kvHint');
  if (hint) {
    const t = { h: 'Bấm 1 lần để đặt đường ngang. Esc để hủy', v: 'Bấm 1 lần để đặt đường dọc. Esc để hủy',
      t: 'Bấm điểm 1, rồi điểm 2 (giữ Shift để khóa ngang/dọc). Esc để hủy',
      r: 'Bấm góc 1, rồi góc đối diện để vẽ hình chữ nhật. Esc để hủy' }[kvMode];
    hint.textContent = t || '';
    hint.style.display = t ? '' : 'none';
  }
}
function kvVaoMode(tool) {
  if (tool && fibBatMode) fibVaoMode(false);
  kvMode = tool || null;
  kvPhase = 0; kvDangVe = null; kvP1Px = null;
  if (tool) { eaVaoDongBang(); kvBoChon(); fibSelected = null; fibDiagIds = null; fibCapNhatXoaBtn(); if (fibPrim) fibPrim.update(); }
  kvCapNhatCuon();
  kvCapNhatNut();
  const c = document.querySelector('#chart canvas');
  if (c) c.style.cursor = tool ? 'crosshair' : '';
  if (kvPrim) kvPrim.update();
}
function kvChon(id) {
  kvSelected = id;
  if (id) { fibSelected = null; fibDiagIds = null; fibCapNhatXoaBtn(); if (fibPrim) fibPrim.update(); }
  kvVeThanh();
  if (kvPrim) kvPrim.update();
}
function kvBoChon() {
  if (kvSelected == null) return;
  kvSelected = null;
  kvVeThanh();
  if (kvPrim) kvPrim.update();
}
function kvTao(props) {
  const ds = kvLayDS();
  const ln = kvChuanHoa(Object.assign({ id: fibMoiId() }, kvNetMacDinh(), props));
  if (!ln) return;
  ds.push(ln);
  kvLuuDS(ds);
  kvVaoMode(null);
  kvChon(ln.id);
}
function kvXoa(id) {
  kvLuuDS(kvLayDS().filter((l) => l.id !== id));
  if (kvSelected === id) kvSelected = null;
  kvVeThanh();
  if (kvPrim) kvPrim.update();
}
function kvSua(id, patch) {
  const ds = kvLayDS();
  const ln = ds.find((l) => l.id === id);
  if (!ln) return;
  Object.assign(ln, patch);
  kvLuuDS(ds);
  kvVeThanh();
  if (kvPrim) kvPrim.update();
}
// Gọi từ napBieuDo()/khôi phục: đọc lại dữ liệu mã hiện tại, thoát chế độ vẽ, bỏ chọn
function kvDongBoAlphaChung() {
  const alC = document.getElementById('veAlphaChung');
  if (!alC) return;
  const pct = Math.round(kvAlphaChung() * 100);
  alC.value = pct;
  const v = document.getElementById('veAlphaChungVal');
  if (v) v.textContent = pct + '%';
}
function kvTai() {
  _kvCache = null;
  kvMode = null; kvPhase = 0; kvDangVe = null; kvP1Px = null; kvDrag = null; kvSelected = null;
  if (!kvPrim) return;
  kvCapNhatCuon();
  kvCapNhatNut();
  kvDongBoAlphaChung();
  kvVeThanh();
  kvPrim.update();
}
function kvXuLyClick(param) {
  if (kvMode) return true;
  if (!kvPrim || !param.point) return false;
  const { x, y } = param.point;
  if (kvTrongVung(x, y)) {
    const h = kvHit(x, y, kvThr());
    if (h && !(h.vung === 'trong' && kvNhuongChoKhac(x, y))) {
      if (kvSelected !== h.id) kvChon(h.id);
      eaVaoDongBang();
      return true;
    }
  }
  if (kvSelected) kvBoChon();
  return false;
}

// Shift khi vẽ trendline: khóa ngang hoặc dọc theo hướng lệch nhiều hơn
function kvAnchorTrend(x, y, shift) {
  const a = kvXYToAnchor(x, y);
  if (!a || !shift || !kvDangVe) return a;
  const x1 = kvTimeToX(kvDangVe.t1), y1 = nenSeries.priceToCoordinate(kvDangVe.p1);
  if (x1 == null || y1 == null) return a;
  return Math.abs(x - x1) >= Math.abs(y - y1) ? { t: a.t, p: kvDangVe.p1 } : { t: kvDangVe.t1, p: a.p };
}
function kvHoanTat(x, y, shift) {
  if (!kvDangVe) return;
  const hcn = kvMode === 'r';
  const a = hcn ? kvXYToAnchor(x, y) : kvAnchorTrend(x, y, shift);
  if (!a) return;
  const x1 = kvTimeToX(kvDangVe.t1), y1 = nenSeries.priceToCoordinate(kvDangVe.p1);
  const x2 = kvTimeToX(a.t), y2 = nenSeries.priceToCoordinate(a.p);
  if (x1 != null && y1 != null && x2 != null && y2 != null && Math.hypot(x2 - x1, y2 - y1) < 3) return; // 2 điểm trùng nhau
  kvTao({ k: hcn ? 'r' : 't', t1: kvDangVe.t1, p1: kvDangVe.p1, t2: a.t, p2: a.p });
}

function kvOnPointerDown(e) {
  if (e.pointerType === 'mouse' && e.button !== 0) return;
  const { x, y } = fibGetXY(e);
  if (kvMode) {
    if (!kvTrongVung(x, y)) return;
    if (kvMode === 'h' || kvMode === 'v') {
      const a = kvXYToAnchor(x, y);
      if (a) kvTao(kvMode === 'h' ? { k: 'h', p1: a.p } : { k: 'v', t1: a.t });
    } else if (kvPhase === 0) {
      const a = kvXYToAnchor(x, y);
      if (a) {
        kvDangVe = kvMode === 'r'
          ? Object.assign({ id: '__prev__', k: 'r', loai: 'rect', t1: a.t, p1: a.p, t2: a.t, p2: a.p }, kvRectMacDinh())
          : Object.assign({ id: '__prev__', k: 't', t1: a.t, p1: a.p, t2: a.t, p2: a.p }, kvNetMacDinh());
        kvPhase = 1;
        kvP1Px = { x: e.clientX, y: e.clientY };
        if (kvPrim) kvPrim.update();
      }
    } else {
      kvHoanTat(x, y, e.shiftKey);
    }
    e.preventDefault(); e.stopPropagation();
    return;
  }
  if (!kvPrim || !kvTrongVung(x, y)) return;
  const thr = kvThr();
  let ln = kvTim(kvSelected);
  let loai = ln ? kvAnchorHit(ln, x, y, thr + 4) : null;
  if (!loai) {
    const h = kvHit(x, y, thr);
    if (!h) { if (kvSelected) kvClickTrong = { x: e.clientX, y: e.clientY }; return; }
    if (h.vung === 'trong' && h.id !== kvSelected) {
      // ruột hình chữ nhật chưa chọn: không chiếm sự kiện (chart vẫn kéo/zoom được); thả không kéo thì mới chọn
      if (!kvNhuongChoKhac(x, y)) kvChoTrong = { id: h.id, x: e.clientX, y: e.clientY };
      else if (kvSelected) kvClickTrong = { x: e.clientX, y: e.clientY };
      return;
    }
    ln = kvTim(h.id);
    if (kvSelected !== h.id) kvChon(h.id);
    loai = 'move';
  }
  const px = kvToaDo(ln);
  kvDrag = { loai, id: ln.id, x0: x, y0: y, px, moved: false, iL: px.x1 <= px.x2 ? 1 : 2, iT: px.y1 <= px.y2 ? 1 : 2 };
  kvCapNhatCuon();
  e.preventDefault(); e.stopPropagation();
}

function kvOnPointerMove(e) {
  if (kvDrag) {
    const { x, y } = fibGetXY(e);
    const d = kvDrag;
    if (!d.moved && Math.hypot(x - d.x0, y - d.y0) < 3) return;
    d.moved = true;
    const ln = kvTim(d.id);
    if (!ln) return;
    if (d.loai === 'move') {
      const dx = x - d.x0, dy = y - d.y0;
      if (ln.k === 'h') {
        const p = d.px.y1 != null ? nenSeries.coordinateToPrice(d.px.y1 + dy) : null;
        if (p != null && isFinite(p)) ln.p1 = p;
      } else if (ln.k === 'v') {
        if (d.px.x1 != null) ln.t1 = kvXToTime(d.px.x1 + dx);
      } else if ([d.px.x1, d.px.y1, d.px.x2, d.px.y2].every((v) => v != null)) { // trendline và hình chữ nhật
        const p1 = nenSeries.coordinateToPrice(d.px.y1 + dy), p2 = nenSeries.coordinateToPrice(d.px.y2 + dy);
        if (p1 != null && p2 != null) {
          ln.t1 = kvXToTime(d.px.x1 + dx); ln.p1 = p1;
          ln.t2 = kvXToTime(d.px.x2 + dx); ln.p2 = p2;
        }
      }
    } else if (ln.k === 'r') {
      // kéo chấm của hình chữ nhật: cạnh trái/phải đổi thời gian, cạnh trên/dưới đổi giá
      const a = kvXYToAnchor(x, y);
      if (a) {
        const iR = 3 - d.iL, iB = 3 - d.iT, hd = d.loai;
        if (hd.includes('w')) ln['t' + d.iL] = a.t;
        if (hd.includes('e')) ln['t' + iR] = a.t;
        if (hd.includes('n')) ln['p' + d.iT] = a.p;
        if (hd.includes('s')) ln['p' + iB] = a.p;
      }
    } else {
      const a = kvXYToAnchor(x, y);
      if (a) {
        if (d.loai === 'p1') { ln.t1 = a.t; ln.p1 = a.p; } else { ln.t2 = a.t; ln.p2 = a.p; }
      }
    }
    if (kvPrim) kvPrim.update();
    e.preventDefault();
    return;
  }
  if ((kvMode === 't' || kvMode === 'r') && kvPhase === 1 && kvDangVe) {
    const { x, y } = fibGetXY(e);
    const a = kvMode === 'r' ? kvXYToAnchor(x, y) : kvAnchorTrend(x, y, e.shiftKey);
    if (a) { kvDangVe.t2 = a.t; kvDangVe.p2 = a.p; if (kvPrim) kvPrim.update(); }
  }
}

function kvOnPointerUp(e) {
  if (kvChoTrong) {
    if (Math.hypot(e.clientX - kvChoTrong.x, e.clientY - kvChoTrong.y) < 5) kvChon(kvChoTrong.id);
    kvChoTrong = null;
  }
  if (kvClickTrong) {
    // click vào vùng trống (không kéo chart) → bỏ chọn; không phụ thuộc sự kiện click của thư viện biểu đồ
    if (Math.hypot(e.clientX - kvClickTrong.x, e.clientY - kvClickTrong.y) < 5) kvBoChon();
    kvClickTrong = null;
  }
  if (kvDrag) {
    if (kvDrag.moved) kvLuuDS(kvLayDS());
    kvDrag = null;
    kvCapNhatCuon();
    return;
  }
  if ((kvMode === 't' || kvMode === 'r') && kvPhase === 1 && kvP1Px) {
    // kéo từ điểm 1 sang điểm 2 rồi thả = hoàn tất; chỉ click (không kéo) thì chờ click điểm 2
    if (Math.hypot(e.clientX - kvP1Px.x, e.clientY - kvP1Px.y) > 5) {
      const { x, y } = fibGetXY(e);
      kvHoanTat(x, y, e.shiftKey);
    }
    kvP1Px = null;
  }
}

function kvOnPointerCancel() {
  if (kvDrag) { _kvCache = null; kvDrag = null; kvCapNhatCuon(); if (kvPrim) kvPrim.update(); }
  kvChoTrong = null;
  if ((kvMode === 't' || kvMode === 'r') && kvPhase === 1) { kvDangVe = null; kvPhase = 0; kvP1Px = null; if (kvPrim) kvPrim.update(); }
}

function kvOnKeyDown(e) {
  const tag = document.activeElement && document.activeElement.tagName;
  if (e.key === 'Escape') {
    if (kvMode) kvVaoMode(null);
    else if (kvSelected) kvBoChon();
    return;
  }
  if (kvSelected && !kvMode && (e.key === 'Delete' || e.key === 'Backspace')) {
    if (tag === 'INPUT' || tag === 'TEXTAREA') return;
    kvXoa(kvSelected);
    e.preventDefault();
  }
}

// ---------- Thanh công cụ nhỏ gần nét đang chọn ----------
function kvVeThanh() {
  const el = document.getElementById('kvThanh');
  if (!el) return;
  const ln = kvTim(kvSelected);
  if (!ln) { el.style.display = 'none'; return; }
  const r = ln.k === 'r';
  const day = r ? ln.day : ln.w, kieu = r ? ln.kieu : ln.ls;
  let h = `<span class="kv-sw" title="Màu"><i style="background:${ln.mau}"></i></span>`;
  h += `<span class="kv-sep"></span>`;
  h += [1, 2, 3].map((w) => `<button class="kv-b${day === w ? ' on' : ''}" data-w="${w}" title="Độ dày ${w}px">${w}</button>`).join('');
  h += `<span class="kv-sep"></span>`;
  h += `<button class="kv-b${kieu === 'solid' ? ' on' : ''}" data-ls="solid" title="Nét liền">━</button>`;
  h += `<button class="kv-b${kieu === 'dash' ? ' on' : ''}" data-ls="dash" title="Nét đứt">┅</button>`;
  const al = Math.round((ln.alpha == null ? 1 : ln.alpha) * 100);
  h += `<span class="kv-sep"></span>`;
  if (r) h += `<span class="kv-lb">Viền</span>`;
  h += `<input type="range" class="kv-al" min="10" max="100" step="5" value="${al}" title="${r ? 'Độ đậm viền' : 'Độ đậm'}" style="touch-action:none">`;
  h += `<span class="kv-alv" title="${r ? 'Độ đậm viền' : 'Độ đậm'}">${al}%</span>`;
  if (r) {
    const an = Math.round((ln.alphaNen == null ? 0.15 : ln.alphaNen) * 100);
    h += `<span class="kv-lb">Nền</span>`;
    h += `<input type="range" class="kv-an" min="0" max="60" step="5" value="${an}" title="Độ đậm nền" style="touch-action:none">`;
    h += `<span class="kv-anv" title="Độ đậm nền">${an}%</span>`;
    h += `<span class="kv-sep"></span>`;
    h += `<button class="kv-b${ln.keoDaiPhai ? ' on' : ''}" data-ext="keoDaiPhai" title="Kéo dài sang phải (hết màn hình)">⇥</button>`;
  } else if (ln.k === 't') {
    h += `<span class="kv-sep"></span>`;
    h += `<button class="kv-b${ln.extL ? ' on' : ''}" data-ext="extL" title="Kéo dài sang trái">⇤</button>`;
    h += `<button class="kv-b${ln.extR ? ' on' : ''}" data-ext="extR" title="Kéo dài sang phải">⇥</button>`;
  }
  h += `<span class="kv-sep"></span><button class="kv-b kv-del" data-xoa="1" title="Xóa nét này">✕</button>`;
  h += `<div class="kv-pal" style="display:none">` +
    FIB_BANG_MAU.map((m) => `<span class="kv-pc" data-mau="${m}" style="background:${m}${m === ln.mau ? ';outline:2px solid #fff;outline-offset:1px' : ''}"></span>`).join('') +
    `</div>`;
  el.innerHTML = h;
  el.style.display = 'flex';
  kvCapNhatThanh();
}

function kvCapNhatThanh() {
  const el = document.getElementById('kvThanh');
  if (!el || el.style.display === 'none') return;
  const ln = kvTim(kvSelected);
  if (!ln) { el.style.display = 'none'; return; }
  try {
    const cw = document.getElementById('chart').clientWidth;
    const H = chart.panes()[0].getHeight();
    const bw = el.offsetWidth || 220, bh = el.offsetHeight || 30;
    const c = kvToaDo(ln);
    let ax, ay;
    if (ln.k === 'h' && c.y1 != null) { ax = cw - bw - 90; ay = c.y1 - bh - 10; if (ay < 4) ay = c.y1 + 10; }
    else if (ln.k === 'v' && c.x1 != null) { ax = c.x1 + 10; ay = 10; }
    else if ((ln.k === 't' || ln.k === 'r') && c.x1 != null && c.x2 != null && c.y1 != null && c.y2 != null) {
      ax = (c.x1 + c.x2) / 2 - bw / 2; ay = Math.min(c.y1, c.y2) - bh - 12;
      if (ay < 4) ay = Math.max(c.y1, c.y2) + 12;
    } else { ax = 8; ay = 8; }
    ax = Math.max(4, Math.min(ax, cw - bw - 70));
    ay = Math.max(4, Math.min(ay, H - bh - 4));
    el.style.left = Math.round(ax) + 'px';
    el.style.top = Math.round(ay) + 'px';
  } catch (e) {}
}

function kvKhoiDong() {
  kvPrim = new KeVePrimitive();
  nenSeries.attachPrimitive(kvPrim); // gắn sau Fib → nằm trên Fib, dưới các popup DOM

  const chartEl = document.getElementById('chart');
  chartEl.addEventListener('pointerdown', kvOnPointerDown, true); // capture: chạy trước thao tác kéo chart
  window.addEventListener('pointermove', kvOnPointerMove);
  window.addEventListener('pointerup', kvOnPointerUp);
  window.addEventListener('pointercancel', kvOnPointerCancel);
  document.addEventListener('keydown', kvOnKeyDown);

  // Thanh công cụ nhỏ
  const bar = document.getElementById('kvThanh');
  if (bar) bar.addEventListener('click', (e) => {
    e.stopPropagation();
    const id = kvSelected;
    const t = e.target.closest('[data-w],[data-ls],[data-ext],[data-xoa],.kv-sw,.kv-pc');
    if (!t || !id) return;
    const ln = kvTim(id);
    if (!ln) return;
    const hcn = ln.k === 'r';
    if (t.dataset.w) kvSua(id, hcn ? { day: Number(t.dataset.w) } : { w: Number(t.dataset.w) });
    else if (t.dataset.ls) kvSua(id, hcn ? { kieu: t.dataset.ls } : { ls: t.dataset.ls });
    else if (t.dataset.ext) kvSua(id, { [t.dataset.ext]: !ln[t.dataset.ext] });
    else if (t.dataset.xoa) kvXoa(id);
    else if (t.classList.contains('kv-pc')) kvSua(id, { mau: t.dataset.mau });
    else if (t.classList.contains('kv-sw')) {
      const pal = bar.querySelector('.kv-pal');
      if (pal) pal.style.display = pal.style.display === 'none' ? 'flex' : 'none';
    }
  });

  // Thanh kéo độ đậm của nét đang chọn: đổi ngay khi kéo, không dựng lại thanh (để không ngắt thao tác kéo)
  if (bar) {
    bar.addEventListener('input', (e) => {
      const laNen = e.target.classList.contains('kv-an');
      if (!laNen && !e.target.classList.contains('kv-al')) return;
      const ln = kvTim(kvSelected);
      if (!ln) return;
      if (laNen) {
        const pn = Math.max(0, Math.min(60, Number(e.target.value) || 0));
        ln.alphaNen = pn / 100;
        const vn = bar.querySelector('.kv-anv');
        if (vn) vn.textContent = pn + '%';
        kvLuuDS(kvLayDS());
        if (kvPrim) kvPrim.update();
        return;
      }
      const pct = Math.max(10, Math.min(100, Number(e.target.value) || 100));
      ln.alpha = pct / 100;
      const v = bar.querySelector('.kv-alv');
      if (v) v.textContent = pct + '%';
      kvLuuDS(kvLayDS());
      if (kvPrim) kvPrim.update();
    });
  }

  // Nút "Vẽ" + menu
  const btn = document.getElementById('btnVe');
  const panel = document.getElementById('panelVe');
  if (btn && panel) {
    const o = kvOpt();
    const chkR = document.getElementById('veExtR'), chkL = document.getElementById('veExtL');
    if (chkR) chkR.checked = o.extR;
    if (chkL) chkL.checked = o.extL;
    const luuOpt = () => ghiBoNho('veTuyChon', { extR: !!(chkR && chkR.checked), extL: !!(chkL && chkL.checked) });
    if (chkR) chkR.onchange = luuOpt;
    if (chkL) chkL.onchange = luuOpt;

    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (kvMode) { kvVaoMode(null); return; } // bấm lại nút để hủy chế độ vẽ
      kvDongBoAlphaChung();
      panel.hidden = !panel.hidden;
    });
    panel.querySelectorAll('.ve-item[data-tool]').forEach((it) => {
      it.onclick = () => { panel.hidden = true; kvVaoMode(it.dataset.tool); };
    });
    const alC = document.getElementById('veAlphaChung');
    if (alC) alC.oninput = () => {
      const pct = Math.max(10, Math.min(100, Number(alC.value) || 100));
      ghiBoNho('drawAlpha', pct / 100);
      const v = document.getElementById('veAlphaChungVal');
      if (v) v.textContent = pct + '%';
      if (kvPrim) kvPrim.update();
    };
    kvDongBoAlphaChung();
    const xoaTatCa = document.getElementById('veXoaTatCa');
    if (xoaTatCa) xoaTatCa.onclick = () => {
      const n = kvLayDS().length;
      if (!n) { alert('Mã này chưa có nét vẽ nào.'); return; }
      if (!confirm(`Xóa tất cả ${n} nét vẽ của ${maHienTai}?`)) return;
      kvLuuDS([]);
      kvSelected = null;
      kvVeThanh();
      if (kvPrim) kvPrim.update();
      panel.hidden = true;
    };
    const dong = document.getElementById('btnDongVe');
    if (dong) dong.onclick = () => { panel.hidden = true; };
    document.addEventListener('click', (e) => {
      if (panel.hidden) return;
      const trong = e.composedPath ? e.composedPath().includes(panel) : panel.contains(e.target);
      if (!trong && e.target !== btn) panel.hidden = true;
    });
  }
  kvCapNhatNut();
  kvPrim.update();
}

fibKhoiDong();
kvKhoiDong();

// storage.js gọi khi vừa khôi phục dữ liệu Fib từ IndexedDB sau khi app đã chạy
window.sauFibKhoiPhuc = function () { fibTai(); fibCapNhatLocHL(); kvTai(); };
window.sauAppChay = true;
