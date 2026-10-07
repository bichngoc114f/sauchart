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
  ['1d', '1D'], ['2d', '2D'], ['3d', '3D'], ['1w', '1W'], ['1M', 'M'],
];

// Khung giờ cho VN index (VNINDEX, VN30): chỉ H4, D, 3D, W, M
const KHUNG_GIO_VN = [
  ['h4', 'H4'], ['1d', 'D'], ['3d', '3D'], ['1w', 'W'], ['1M', 'M'],
];

const CUM_MA_PERIODS = [34, 55, 89, 144, 233, 377, 610, 987];
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

// ---------- 3. TẠO BIỂU ĐỒ ----------
const LC = LightweightCharts;
const chart = LC.createChart(document.getElementById('chart'), {
  autoSize: true,
  layout: { background: { color: MAU.nen }, textColor: '#b2b5be', panes: { separatorColor: '#d1d4dc' } },
  grid: { vertLines: { visible: false }, horzLines: { visible: false } }, // không kẻ lưới, giống mẫu
  crosshair: { mode: LC.CrosshairMode.Normal },
  leftPriceScale: { visible: true, borderVisible: false },   // thang giá bên TRÁI như mẫu
  rightPriceScale: { visible: false },
  timeScale: { borderVisible: false, timeVisible: true, secondsVisible: false, rightOffset: 8 },
});

const nenSeries = chart.addSeries(LC.CandlestickSeries, {
  priceScaleId: 'left',
  upColor: MAU.tang, downColor: MAU.giam, borderVisible: false,
  wickUpColor: MAU.tang, wickDownColor: MAU.giam,
});

// S = các chuỗi chỉ báo đang vẽ. Mỗi phần tử: { series, lay(i) → điểm thứ i }
let S = [];

function themDuong(paneIndex, mau, lay, tuyChon = {}) {
  const series = chart.addSeries(LC.LineSeries, Object.assign({
    priceScaleId: 'left', color: mau, lineWidth: 1, priceLineVisible: false, lastValueVisible: false,
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
      priceScaleId: 'left', priceLineVisible: false, lastValueVisible: false,
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

    // Khung RSI chiếm khoảng 40% chiều cao như mẫu
    const panes = chart.panes();
    if (panes[1]) {
      try { panes[0].setStretchFactor(60); panes[1].setStretchFactor(40); } catch (e) {}
    }
  }
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
}

// Chỉ cập nhật cây nến cuối (khi giá real-time nhảy)
function veNenCuoi() {
  tinhChiBao();
  const i = duLieuNen.length - 1;
  nenSeries.update(duLieuNen[i]);
  S.forEach((x) => x.series.update(x.lay(i)));
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
async function goiOKX(ma, khung) {
  const instId = binanceSymToOKX(ma);
  const bar    = binanceIntervalToOKX(khung);
  const url    = `https://www.okx.com/api/v5/market/candles?instId=${instId}&bar=${bar}&limit=300`;
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
    const nen = {
      time: Math.floor(k.t / 1000) + LECH_GIO,
      open: +k.o, high: +k.h, low: +k.l, close: +k.c, volume: +k.v,
    };
    const cuoi = duLieuNen[duLieuNen.length - 1];
    if (!cuoi || nen.time < cuoi.time) return;
    if (nen.time === cuoi.time) duLieuNen[duLieuNen.length - 1] = nen;
    else duLieuNen.push(nen);
    veNenCuoi();
    capNhatLegend(duLieuNen.length - 1);
    document.getElementById('symbolPrice').textContent = dinhDangGia(nen.close);
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
  // Thang giá nằm bên trái → đẩy chú thích sang phải cho khỏi đè
  let trai = 60;
  try { trai = chart.priceScale('left').width() + 8; } catch (e) {}
  lg.style.left = trai + 'px';
  document.getElementById('legendRsi').style.left = trai + 'px';

  // Legend của khung RSI: đặt ngay đầu khung dưới
  const lr = document.getElementById('legendRsi');
  const panes = chart.panes();
  if (caiDat.rsi && panes[1]) {
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
  let i = duLieuNen.length - 1;
  if (param.time) {
    const j = timNen(param.time);
    if (j >= 0) i = j;
  }
  capNhatLegend(i);
});

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
      if (infoVN.loai === 'index') {
        nen = await goiIndexData(maHienTai, khungHienTai);
      } else {
        nen = await goiStockData(maHienTai, khungHienTai);
      }
      if (!nen.length) throw new Error('Không có dữ liệu cho mã này');
    } else {
      // --- Crypto: dùng Binance ---
      nen = await goiBinance(`symbol=${maHienTai}&interval=${khungHienTai}&limit=1000`);
      tienTo = await taiTienTo(maHienTai, nen[0]);
    }
    if (toi !== phien) return;
    duLieuNen = nen;
    nenTienTo = tienTo.filter((x) => x.time < nen[0].time);
    veToanBo();
    chart.timeScale().setVisibleLogicalRange({ from: nen.length - 150, to: nen.length + 5 });
    capNhatLegend(duLieuNen.length - 1);
    document.getElementById('symbolPrice').textContent = dinhDangGia(nen[nen.length - 1].close);
    if (!infoVN) { moKetNoiRealtime(maHienTai, khungHienTai); dungDemNguoc(); }
    else { datTrangThai('KBS · dữ liệu VN', 'ok'); batDauDemNguoc(); }
  } catch (e) {
    if (toi === phien) datTrangThai(e.message, 'err');
  }
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

// ---------- 9b. ĐỒNG HỒ ĐẾM NGƯỢC PHIÊN GIAO DỊCH ----------
let timerDemNguoc = null;

function tinhDemNguoc() {
  const MO_CUA   = 9 * 3600;
  const DONG_SANG = 11 * 3600 + 30 * 60;
  const MO_CHIEU  = 13 * 3600;
  const DONG_CHIEU = 14 * 3600 + 30 * 60;
  const ATC        = 14 * 3600 + 45 * 60;

  // Thời gian hiện tại theo múi giờ VN (UTC+7)
  const now = new Date(Date.now() + 7 * 3600000);
  const t = now.getUTCHours() * 3600 + now.getUTCMinutes() * 60 + now.getUTCSeconds();
  const day = now.getUTCDay(); // 0=CN, 6=T7

  if (day === 6) return { label: 'T2 mở cửa', secs: 2 * 86400 - t + MO_CUA };
  if (day === 0) return { label: 'T2 mở cửa', secs: 1 * 86400 - t + MO_CUA };
  if (t < MO_CUA)     return { label: 'Mở cửa',    secs: MO_CUA - t };
  if (t < DONG_SANG)  return { label: 'Đóng sáng', secs: DONG_SANG - t };
  if (t < MO_CHIEU)   return { label: 'Mở chiều',  secs: MO_CHIEU - t };
  if (t < DONG_CHIEU) return { label: 'Đóng chiều', secs: DONG_CHIEU - t };
  if (t < ATC)        return { label: 'ATC',        secs: ATC - t };
  const d = day === 5 ? 3 : 1;
  return { label: 'Ngày mai', secs: d * 86400 - t + MO_CUA };
}

function _fmtSecs(s) {
  s = Math.max(0, Math.round(s));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sc = s % 60;
  if (h > 0) return `${h}:${String(m).padStart(2,'0')}:${String(sc).padStart(2,'0')}`;
  return `${String(m).padStart(2,'0')}:${String(sc).padStart(2,'0')}`;
}

function batDauDemNguoc() {
  const el = document.getElementById('demNguoc');
  if (!el) return;
  el.style.display = '';
  el.innerHTML = '<span class="dn-label"></span><span class="dn-time"></span>';
  const lbl = el.querySelector('.dn-label');
  const tim = el.querySelector('.dn-time');
  function tick() {
    const r = tinhDemNguoc();
    lbl.textContent = r.label;
    tim.textContent = _fmtSecs(r.secs);
  }
  tick();
  if (timerDemNguoc) clearInterval(timerDemNguoc);
  timerDemNguoc = setInterval(tick, 1000);
}

function dungDemNguoc() {
  if (timerDemNguoc) { clearInterval(timerDemNguoc); timerDemNguoc = null; }
  const el = document.getElementById('demNguoc');
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
}
const panel = document.getElementById('panelCaiDat');
document.getElementById('btnCaiDat').onclick = () => { panel.hidden = !panel.hidden; };
document.getElementById('btnDong').onclick = () => { panel.hidden = true; };
panel.onclick = (e) => { if (e.target === panel) panel.hidden = true; };

// ---------- 11. ĐIỆN THOẠI: quay lại app thì tải lại cho mới ----------
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
taoSeries();
moKetNoiWatchlist();
batDauPollingVN();
napBieuDo();
