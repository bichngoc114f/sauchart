// =====================================================================
//  indicators.js — CÁC HÀM TÍNH CHỈ BÁO
//  Quy ước: đầu vào là mảng số, đầu ra là mảng CÙNG ĐỘ DÀI.
//  Chỗ nào chưa đủ dữ liệu để tính thì để null.
// =====================================================================

const CB = {}; // CB = "Chỉ Báo"

// SMA – trung bình cộng n giá trị gần nhất
CB.sma = (src, n) => {
  const out = new Array(src.length).fill(null);
  let tong = 0, dem = 0;
  for (let i = 0; i < src.length; i++) {
    const v = src[i];
    if (v == null) { tong = 0; dem = 0; continue; }
    tong += v; dem++;
    if (dem > n) { tong -= src[i - n]; dem = n; }
    if (dem === n) out[i] = tong / n;
  }
  return out;
};

// EMA – trung bình hàm mũ, giá trị đầu tiên lấy bằng SMA (giống Pine Script)
CB.ema = (src, n) => {
  const out = new Array(src.length).fill(null);
  const a = 2 / (n + 1);
  let truoc = null, tong = 0, dem = 0;
  for (let i = 0; i < src.length; i++) {
    const v = src[i];
    if (v == null) continue;
    if (truoc == null) {
      tong += v; dem++;
      if (dem === n) { truoc = tong / n; out[i] = truoc; }
    } else {
      truoc = a * v + (1 - a) * truoc;
      out[i] = truoc;
    }
  }
  return out;
};

// WMA – trung bình có trọng số: giá mới nhất nặng nhất
CB.wma = (src, n) => {
  const out = new Array(src.length).fill(null);
  const mauSo = (n * (n + 1)) / 2;
  for (let i = n - 1; i < src.length; i++) {
    let tong = 0, du = true;
    for (let k = 0; k < n; k++) {
      const v = src[i - k];
      if (v == null) { du = false; break; }
      tong += v * (n - k);
    }
    if (du) out[i] = tong / mauSo;
  }
  return out;
};

// Độ lệch chuẩn (kiểu "population" giống ta.stdev của TradingView)
CB.stdev = (src, n) => {
  const tb = CB.sma(src, n);
  const out = new Array(src.length).fill(null);
  for (let i = 0; i < src.length; i++) {
    if (tb[i] == null) continue;
    let s = 0;
    for (let k = 0; k < n; k++) s += (src[i - k] - tb[i]) ** 2;
    out[i] = Math.sqrt(s / n);
  }
  return out;
};

// Bollinger Bands: đường giữa = SMA, 2 dải = SMA ± hệ số × độ lệch chuẩn
CB.bollinger = (src, n, heSo) => {
  const giua = CB.sma(src, n);
  const dl = CB.stdev(src, n);
  return {
    giua,
    tren: giua.map((g, i) => (g == null ? null : g + heSo * dl[i])),
    duoi: giua.map((g, i) => (g == null ? null : g - heSo * dl[i])),
  };
};

// RSI – làm mượt kiểu Wilder (giống ta.rsi của TradingView và iRSI của MT5)
CB.rsi = (gia, n = 14) => {
  const out = new Array(gia.length).fill(null);
  let tbTang = 0, tbGiam = 0;
  const tinh = () => (tbGiam === 0 ? (tbTang === 0 ? 50 : 100) : 100 - 100 / (1 + tbTang / tbGiam));
  for (let i = 1; i < gia.length; i++) {
    const d = gia[i] - gia[i - 1];
    const tang = d > 0 ? d : 0;
    const giam = d < 0 ? -d : 0;
    if (i <= n) {
      tbTang += tang; tbGiam += giam;
      if (i === n) { tbTang /= n; tbGiam /= n; out[i] = tinh(); }
    } else {
      tbTang = (tbTang * (n - 1) + tang) / n;
      tbGiam = (tbGiam * (n - 1) + giam) / n;
      out[i] = tinh();
    }
  }
  return out;
};

// ---------- VWAP theo kỳ (Năm / Quý / Tháng / Tuần) ----------
// Mỗi kỳ có 1 "mã kỳ"; khi mã kỳ đổi thì VWAP bắt đầu tính lại từ đầu.
// Tính theo giờ UTC (giống TradingView với cặp Binance).
CB.maKy = (utcGiay, ky) => {
  const d = new Date(utcGiay * 1000);
  const nam = d.getUTCFullYear(), thang = d.getUTCMonth();
  if (ky === 'Y') return nam;
  if (ky === 'Q') return nam * 10 + Math.floor(thang / 3);
  if (ky === 'M') return nam * 100 + thang;
  // Tuần bắt đầu Thứ Hai. Ngày số 0 (01/01/1970) là Thứ Năm.
  const ngay = Math.floor(utcGiay / 86400);
  return ngay - ((ngay + 3) % 7);
};

// bars: [{time, high, low, close, volume}] — time đã cộng lệch múi giờ
// Trả về mảng {value, dauKy} hoặc null (khi chưa thấy điểm bắt đầu kỳ)
CB.vwap = (bars, ky, lechGio) => {
  const out = [];
  let ma = null, tongPV = 0, tongV = 0, hopLe = false;
  for (const b of bars) {
    const utc = b.time - lechGio;
    const m = CB.maKy(utc, ky);
    let dauKy = false;
    if (m !== ma) {
      // Chỉ tin VWAP khi chắc chắn đã có dữ liệu từ ĐẦU kỳ
      if (ma !== null || CB.maKy(utc - 1, ky) !== m) hopLe = true;
      ma = m; tongPV = 0; tongV = 0; dauKy = true;
    }
    const giaDienHinh = (b.high + b.low + b.close) / 3; // hlc3, giống TradingView
    tongPV += giaDienHinh * b.volume;
    tongV += b.volume;
    out.push(hopLe && tongV > 0 ? { value: tongPV / tongV, dauKy } : null);
  }
  return out;
};
