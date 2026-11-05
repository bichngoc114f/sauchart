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
  nen: '#1d1f28',                 // màu nền biểu đồ
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
];
// Mặc định giống màn hình TradingView của Sâu: VWAP + Volume + RSI
const MAC_DINH = {
  cumMA: true, bbGia20: true, bbGia55: true, volume: true,
  vwapY: true, vwapQ: true, vwapM: true, vwapW: true, rsi: true,
};

// ---------- 2. NHỚ CÀI ĐẶT (lưu trong trình duyệt của từng máy) ----------
function docBoNho(khoa, macDinh) {
  try {
    const s = localStorage.getItem('sauchart.' + khoa);
    return s ? JSON.parse(s) : macDinh;
  } catch (e) { return macDinh; }
}
function ghiBoNho(khoa, giaTri) {
  try { localStorage.setItem('sauchart.' + khoa, JSON.stringify(giaTri)); } catch (e) {}
}

let caiDat = Object.assign({}, MAC_DINH, docBoNho('caidat2', {}));
let maHienTai = docBoNho('ma', 'BTCUSDT');
let khungHienTai = docBoNho('khung', '1h');
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
let coboBBMask = [];    // parallel to duLieuNen: 1 nếu nến nằm trong BB zone
let coboCombMask = [];

// Hiển thị / layout
let watchlistThuGon = docBoNho('watchlistThuGon', false);
let phongToKhungGia = docBoNho('phongToKhungGia', false);

// ---------- 3. TẠO BIỂU ĐỒ ----------
const LC = LightweightCharts;
const chart = LC.createChart(document.getElementById('chart'), {
  autoSize: true,
  layout: { background: { color: MAU.nen }, textColor: '#b2b5be', panes: { separatorColor: '#d1d4dc' }, attributionLogo: false },
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
    themDuong(P, MAU.bb55Dai, (i) => diem(t(i), ketQua.bb55.tren[i]));
    themDuong(P, MAU.bb55Dai, (i) => diem(t(i), ketQua.bb55.duoi[i]));
    themDuong(P, MAU.bb20Dai, (i) => diem(t(i), ketQua.bb20.tren[i]));
    themDuong(P, MAU.bb20Dai, (i) => diem(t(i), ketQua.bb20.duoi[i]));
    themDuong(P, MAU.bb55, (i) => diem(t(i), ketQua.bb55.giua[i]), NET_CHAM);
    themDuong(P, MAU.bb20, (i) => diem(t(i), ketQua.bb20.giua[i]), NET_CHAM);
    themDuong(P, MAU.wma45, (i) => diem(t(i), ketQua.wma45[i]), { lineWidth: 2 });
    themDuong(P, MAU.ema9, (i) => diem(t(i), ketQua.ema9[i]), { lineWidth: 2 });
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
  ketQua = kq;
}

// Vẽ toàn bộ (khi mới tải hoặc đổi cài đặt)
function veToanBo() {
  tinhChiBao();
  nenSeries.setData(duLieuNen);
  S.forEach((x) => x.series.setData(duLieuNen.map((_, i) => x.lay(i))));
  coboCapNhat();
}

// Chỉ cập nhật cây nến cuối (khi giá real-time nhảy)
function veNenCuoi() {
  tinhChiBao();
  const i = duLieuNen.length - 1;
  nenSeries.update(duLieuNen[i]);
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
    lr.innerHTML =
      `<span style="color:${MAU.rsi}">RSI ${so(ketQua.rsi[i])}</span>` +
      `<span style="color:${MAU.ema9}">EMA9 ${so(ketQua.ema9[i])}</span>` +
      `<span style="color:${MAU.wma45}">WMA45 ${so(ketQua.wma45[i])}</span>` +
      `<span style="color:${MAU.bb20}">BB20 ${so(ketQua.bb20.giua[i])}</span>` +
      `<span style="color:${MAU.bb55}">BB55 ${so(ketQua.bb55.giua[i])}</span>`;
  } else {
    lr.style.display = 'none';
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
});

// Kéo/zoom biểu đồ hoặc đổi kích thước màn hình → cập nhật vị trí nhãn giá
chart.timeScale().subscribeVisibleLogicalRangeChange((range) => {
  capNhatNhanGia();
  if (range && range.from < 50 && !dangTaiThem && !daHetLichSu) {
    taiThemNenCu();
  }
});
window.addEventListener('resize', () => capNhatNhanGia());

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

function togglePhongToKhungGia() {
  phongToKhungGia = !phongToKhungGia;
  ghiBoNho('phongToKhungGia', phongToKhungGia);
  try { _applyRsiPaneSize(); } catch (e) {}
  _applyPhongToBtn();
  capNhatLegend(duLieuNen.length - 1);
  capNhatNhanGia();
}

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
  const toi = ++phien;
  dangTaiThem = false;
  daHetLichSu = false;
  ghiBoNho('ma', maHienTai);
  ghiBoNho('khung', khungHienTai);
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
    chart.timeScale().setVisibleLogicalRange({ from: nen.length - 150, to: nen.length + 5 });
    capNhatLegend(duLieuNen.length - 1);
    document.getElementById('symbolPrice').textContent = dinhDangGia(nen[nen.length - 1].close);
    if (!infoVN) { moKetNoiRealtime(maHienTai, khungHienTai === '2w' ? '1w' : khungHienTai); }
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
              const H = bitmapSize.height;
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
                  if (coboTabSel === 0 && !coboComboSel) {
                    for (const k of COBO_KHUNG) {
                      if (!(showMask & k.bit)) continue;
                      ctx.fillStyle = k.mau + '2e';
                      ctx.fillRect(xb, 0, cw, H);
                    }
                  } else {
                    ctx.fillStyle = 'rgba(180,180,180,0.13)';
                    ctx.fillRect(xb, 0, cw, H);
                  }
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
                  ctx.fillStyle = BBM + '2e';
                  ctx.fillRect(xb, 0, cw, H);
                  ctx.fillStyle = BBM;
                  ctx.fillRect(xb, 0, cw, barH);
                }
              } else {
                const C_TIM = '#d65db1', C_XAM = '#8a8f98', C_VANG = '#e8c547';
                const visMask2 = COBO_KHUNG.reduce((a, k) => coboVisBat[k.id] ? a|k.bit : a, 0);
                for (let i = iFrom; i <= iTo; i++) {
                  let cm = coboCombMask[i] || 0;
                  if (!cm) continue;
                  if (!coboBBVisBat.tim)  cm &= ~1;
                  if (!coboBBVisBat.xam)  cm &= ~2;
                  if (!coboBBVisBat.vang) cm &= ~4;
                  if (!cm) continue;
                  const r = _xbcw(i); if (!r) continue;
                  const { xb, cw } = r;
                  const bgC = (cm & 1) ? C_TIM : (cm & 2) ? C_XAM : C_VANG;
                  ctx.fillStyle = bgC + '2e';
                  ctx.fillRect(xb, 0, cw, H);
                  let barIdx = 0;
                  if (cm & 1) { ctx.fillStyle = C_TIM;  ctx.fillRect(xb, barIdx++ * gap, cw, barH); }
                  if (cm & 2) { ctx.fillStyle = C_XAM;  ctx.fillRect(xb, barIdx++ * gap, cw, barH); }
                  if (cm & 4) { ctx.fillStyle = C_VANG; ctx.fillRect(xb, barIdx++ * gap, cw, barH); }
                  // Dải 5 màu SMA bên dưới khi có vùng tím/xám (có thành phần SMA)
                  if (cm & 3) {
                    const smaMask = (coboBitmask[i] || 0) & visMask2;
                    if (smaMask) {
                      const smaStart = barIdx * gap;
                      const smaCnt = COBO_KHUNG.filter(k => smaMask & k.bit).length;
                      ctx.fillStyle = 'rgba(0,0,0,0.45)';
                      ctx.fillRect(xb, smaStart, cw, smaCnt * gap + barH);
                      for (let ki = 0; ki < COBO_KHUNG.length; ki++) {
                        if (!(smaMask & COBO_KHUNG[ki].bit)) continue;
                        ctx.fillStyle = COBO_KHUNG[ki].mau;
                        ctx.fillRect(xb, barIdx++ * gap, cw, barH);
                      }
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

function coboTinhBitmask() {
  coboBitmask = new Array(duLieuNen.length).fill(0);
  coboBBMask = new Array(duLieuNen.length).fill(0);
  coboCombMask = new Array(duLieuNen.length).fill(0);
  if (!coboBat || !duLieuNen.length) return;
  if (DANH_SACH_VN.find(x => x.ma === maHienTai)) return;
  const kq = coboKetQua[maHienTai];
  const bbKq = coboBBKetQua[maHienTai];
  const khungMs = _coboKhungMs();
  const D_MS = 86400000;
  for (let i = 0; i < duLieuNen.length; i++) {
    const nenUtcMs = (duLieuNen[i].time - LECH_GIO) * 1000;
    const nenEndMs = (i+1 < duLieuNen.length)
      ? (duLieuNen[i+1].time - LECH_GIO) * 1000
      : nenUtcMs + khungMs;
    if (kq) {
      let mask = 0;
      for (const k of COBO_KHUNG) {
        if (!kq[k.id]?.zones?.length) continue;
        if (_coboOverlap(kq[k.id].zones, nenUtcMs, nenEndMs)) mask |= k.bit;
      }
      coboBitmask[i] = mask;
    }
    if (bbKq?.zones?.length) {
      // Màu hiện ở phiên D kế tiếp: kiểm tra ngày liền trước (nến D đó đóng mới biết màu)
      const bbS = nenUtcMs - D_MS, bbE = nenEndMs - D_MS;
      coboBBMask[i] = _coboOverlap(bbKq.zones, bbS, bbE) ? 1 : 0;
    }
    if (kq && bbKq?.zones) {
      // Màu hiện ở phiên D kế tiếp: dùng bbS/bbE (lùi 1 ngày) thay nenUtcMs/nenEndMs
      const bbS = nenUtcMs - D_MS, bbE = nenEndMs - D_MS;
      const dayStartMs = Math.floor(bbS / D_MS) * D_MS;
      let combBits = 0;
      for (let dMs = dayStartMs; dMs < bbE; dMs += D_MS) {
        const dayEnd = dMs + D_MS;
        let smaFlag = false;
        for (const k of COBO_KHUNG) {
          if (!kq[k.id]?.zones?.length) continue;
          if (_coboOverlap(kq[k.id].zones, dMs, dayEnd)) { smaFlag = true; break; }
        }
        const bbFlag = bbKq.zones.length > 0 && _coboOverlap(bbKq.zones, dMs, dayEnd);
        if (smaFlag && bbFlag) combBits |= 1;
        else if (smaFlag) combBits |= 2;
        else if (bbFlag) combBits |= 4;
      }
      coboCombMask[i] = combBits;
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
    `<div style="color:#888;font-size:11px;padding:1px 0;font-style:italic">Màu hiện ở phiên D kế tiếp (sau khi nến D đủ điều kiện đóng)</div>`;
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
  html += `<div style="color:#888;font-size:11px;padding:1px 0;font-style:italic">Màu hiện ở phiên D kế tiếp (sau khi nến D đủ điều kiện đóng)</div>`;
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
    lab.innerHTML = `<input type="checkbox" ${caiDat[cb.id] ? 'checked' : ''}>` +
      `<i style="background:${cb.mau}"></i><span>${cb.ten}</span>`;
    lab.querySelector('input').onchange = async (e) => {
      const canTaiLai = cb.id.startsWith('vwap') && e.target.checked && nenTienTo.length === 0;
      caiDat[cb.id] = e.target.checked;
      ghiBoNho('caidat2', caiDat);
      if (canTaiLai) { taoSeries(); napBieuDo(); return; } // cần tải thêm nến 1H cho VWAP
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

// ---------- 11. EA L5 / F1 ----------
const EA_MAUS = { D: '#f5c518', H4: '#00bcd4', H8: '#ab47bc', H12: '#ff7043', Trap: '#66bb6a' };
const EA_LUONGS = ['D', 'H4', 'H8', 'H12', 'Trap'];
const EA_MA_HO_TRO = ['BTCUSDT', 'ETHUSDT', 'PAXGUSDT'];

const EA_F1_MAUS = { H2: '#f0a030', H4: '#4fc3f7', D: '#d65db1' };
const EA_F1_LUONGS = ['H2', 'H4', 'D'];
const EA_F1_DEFAULT = { H2: true, H4: true, D: true };

const EA_S1_MAUS = { W: '#f5c518', D: '#00bcd4', '2D': '#ab47bc' };
const S1_LUONGS = ['W', 'D', '2D'];
const S1_DEFAULT = { W: true, D: true, '2D': true };
let caiDatS1 = Object.assign({}, S1_DEFAULT, docBoNho('eaS1', {}));

const EA_DEFAULT = { on: false, D: true, H4: true, H8: true, H12: true, Trap: true, entry: true, sltp: true, pnl: true, hist: true, bts: true, ds: false };
let caiDatEA = Object.assign({}, EA_DEFAULT, docBoNho('ea', {}));
let caiDatF1 = Object.assign({}, EA_F1_DEFAULT, docBoNho('eaF1', {}));
let eaLoai = docBoNho('eaLoai', 'L5'); // 'L5' hoặc 'F1' (chỉ dùng cho crypto)

let eaKetQua = {};        // { 'BTCUSDT': { trades, status, thongKe } } — L5 / S1
let eaF1KetQua = {};      // { 'BTCUSDT': { trades, status, thongKe } } — F1
let eaTimerRefresh = null;
let eaHistMarkers = null;  // markers lịch sử (LC.createSeriesMarkers)
let eaHistPrim = null;     // primitive vẽ đường nối entry-exit
let eaOpenPrim = null;     // EaOpenLinesPrimitive cho lệnh đang mở
let eaLoading = false;

function eaCoHoTro() { return EA_MA_HO_TRO.includes(maHienTai) || !!DANH_SACH_VN.find(x => x.ma === maHienTai); }
function eaIsVN() { return !!DANH_SACH_VN.find(x => x.ma === maHienTai); }
function eaIsF1() { return !eaIsVN() && eaLoai === 'F1'; }
function eaGetKetQua() { return eaIsF1() ? eaF1KetQua[maHienTai] : eaKetQua[maHienTai]; }
function eaLegEnabled(leg) {
  if (eaIsVN()) return !!caiDatS1[leg];
  if (eaIsF1()) return !!caiDatF1[leg];
  return !!caiDatEA[leg];
}
function eaLegMau(leg) {
  if (eaIsVN()) return EA_S1_MAUS[leg] || '#aaa';
  if (eaIsF1()) return EA_F1_MAUS[leg] || '#aaa';
  return EA_MAUS[leg] || '#aaa';
}
function eaLuongs() {
  if (eaIsVN()) return S1_LUONGS;
  if (eaIsF1()) return EA_F1_LUONGS;
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
                ctx.strokeStyle = tr.win ? '#2962ff' : '#ef5350';
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
        e.color = '#2962ff';
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
    markers.push({ time: et, position: 'atPriceBottom', price: tr.entry, color: '#2962ff', shape: 'arrowUp', size: 1 });
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
      entryItems.push({ price: tr.entry, label: `buy (${tr.leg})`, color: '#2962ff', snapTime, trade: tr });
    }
  }
  if (caiDatEA.sltp) {
    for (const tr of open) {
      const lastSL = tr.slHist?.length ? tr.slHist[tr.slHist.length - 1].sl : null;
      if (lastSL == null) continue;
      slItems.push({ price: lastSL, label: `SL (${tr.leg})`, color: '#ef5350' });
    }
    // Buy Limit chờ (L5 only)
    if (!eaIsVN() && !eaIsF1()) {
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

  if (eaIsF1()) {
    const legs = kq.status?.legs || {};
    const tk = kq.thongKe || {};
    const fmtLeg = (l) => {
      if (!caiDatF1[l]) return '';
      const d = legs[l];
      let txt = '';
      if (d?.pos) txt = `Mở @${dinhDangGia(d.pos.price)} · SL ${dinhDangGia(d.pos.sl)}`;
      else txt = 'Không có lệnh';
      if (l !== 'D') {
        const cb = d?.coBo;
        if (cb != null) txt += cb ? ' · Co bó ✓' : ' · Co bó ✗';
      }
      const t = tk[l];
      const tkStr = t ? ` <span style="color:#888;font-size:9px">(${t.total}l·${t.thang}w·${t.tongPct>=0?'+':''}${t.tongPct}%)</span>` : '';
      return `<div class="eas-row"><span class="eas-leg" style="color:${EA_F1_MAUS[l]}">${l}</span><span>${txt}${tkStr}</span></div>`;
    };
    const ngay = legs.D?.ngay;
    let ngayStr = '—';
    if (ngay) {
      const bbS = ngay.vungBB ? `✓(w3 ${ngay.w3?.toFixed(1)}%)` : `✗(w3 ${ngay.w3?.toFixed(1)}%)`;
      const smaS = ngay.vungSMA ? '✓' : '✗';
      const rsiS = ngay.rsi != null ? ngay.rsi.toFixed(1) : '—';
      const lS = Array.isArray(ngay.L) && ngay.L.length === 4 ? ngay.L.map(x=>x.toFixed(1)).join('/') : '—';
      ngayStr = `BB ${bbS} · SMA ${smaS} · RSI ${rsiS} · L ${lS}`;
    }
    el.innerHTML =
      `<div class="eas-head"><span>EA F1</span><button class="eas-collapse" onclick="this.closest('.ea-status').classList.toggle('eas-thu')">◀</button></div>` +
      `<div class="eas-body">` +
      EA_F1_LUONGS.map(fmtLeg).join('') +
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
    const isF1 = eaIsF1();
    let tenEA = 'EA L5';
    if (isVN) {
      eaKetQua[maHienTai] = await S1Data.chayS1(maHienTai, msg => datTrangThai(msg));
      tenEA = 'EA S1';
    } else if (isF1) {
      eaF1KetQua[maHienTai] = await F1Data.chayF1(maHienTai, msg => datTrangThai(msg));
      tenEA = 'EA F1';
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
      if (eaIsF1()) delete eaF1KetQua[maHienTai];
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
  const isF1 = eaIsF1();
  const l5 = document.getElementById('eaL5Luong');
  const s1 = document.getElementById('eaS1Luong');
  const f1 = document.getElementById('eaF1Luong');
  const loaiRow = document.getElementById('eaLoaiRow');
  if (l5) l5.style.display = (!isVN && !isF1) ? '' : 'none';
  if (s1) s1.style.display = isVN ? '' : 'none';
  if (f1) f1.style.display = isF1 ? '' : 'none';
  if (loaiRow) {
    loaiRow.style.display = isVN ? 'none' : 'flex';
    // Cập nhật trạng thái active cho các nút loại
    loaiRow.querySelectorAll('[data-loai]').forEach(b => {
      b.classList.toggle('active', b.dataset.loai === eaLoai);
    });
  }
  const nameEl = document.querySelector('#eaL5Row span');
  if (nameEl) nameEl.textContent = isVN ? 'S1' : (isF1 ? 'EA' : 'L5');
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

  // Loại EA: L5 / F1 (chỉ cho crypto)
  const loaiRow = document.getElementById('eaLoaiRow');
  if (loaiRow) {
    ['L5', 'F1'].forEach(loai => {
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
  EA_F1_LUONGS.forEach(l => {
    const cb = document.querySelector(`.ea-f1-luong[data-leg="${l}"]`);
    if (cb) cb.checked = !!caiDatF1[l];
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

  // Leg toggles F1
  document.querySelectorAll('.ea-f1-luong').forEach(cb => {
    cb.onchange = (e) => {
      caiDatF1[e.target.dataset.leg] = e.target.checked;
      ghiBoNho('eaF1', caiDatF1);
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
