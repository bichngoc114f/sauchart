// =====================================================================
//  ea-f3-data.js — TẢI DỮ LIỆU + CHẠY EA F3 CHO 1 MÃ CRYPTO
//  Dùng: const kq = await F3Data.chayF3('BTCUSDT', (msg) => console.log(msg));
//        const kq = await F3Data.chayF3('BTCUSDT', baoCao, { tuMix: Date.now() - 180 * 864e5 }); // bản gọn cho bot
//  Cần nạp trước: ea-l5-engine.js, ea-l5-data.js (dùng L5Data.layKhung có cache IndexedDB), ea-f3-engine.js.
//  Dữ liệu: nến D toàn bộ; 1h/4h/8h/12h từ 01/08/2017 (SMA987 khởi động trước 2020, dùng chung cache với F2);
//  H2 gộp từ H1; M15 tải từ (tuMix − 20 ngày); M30 gộp từ M15. D/H2/H4 dò SL bằng H1; H1/M30/M15 dò SL bằng M15.
//  Lần đầu tải nhiều (M15 từ 2020 ≈ 240 nghìn nến, ~2–4 phút), các lần sau chỉ tải phần nến mới.
//  tuMix = mốc bắt đầu tính 3 luồng mới (mặc định 01/01/2020). Bot Telegram dùng bản gọn (180 ngày) cho nhanh.
// =====================================================================
(function (root) {
  'use strict';
  const MIN = 60e3, H = 3600e3, DAY = 24 * H;
  const KHOI_DONG = Date.UTC(2017, 7, 1);
  const TU_NGAY = Date.UTC(2020, 0, 1);

  // Gộp nến nhỏ → nến lớn theo bội số (mốc UTC); bỏ nến lớn thiếu nến nhỏ (chưa đóng/hụt dữ liệu cuối chuỗi)
  function gop(nho, ms, soNen) {
    const out = [];
    for (const b of nho) {
      const k = Math.floor(b.t / ms) * ms;
      const c = out[out.length - 1];
      if (c && c.t === k) { c.h = Math.max(c.h, b.h); c.l = Math.min(c.l, b.l); c.c = b.c; c.n++; }
      else out.push({ t: k, o: b.o, h: b.h, l: b.l, c: b.c, n: 1 });
    }
    if (out.length && out[out.length - 1].n < soNen) out.pop();
    return out;
  }
  const gopH2 = (h1) => gop(h1, 2 * H, 2);
  const gopM30 = (m15) => gop(m15, 30 * MIN, 2);

  async function chayF3(sym, baoCao = () => {}, tuyChon = {}) {
    const lay = root.L5Data.layKhung;
    const tuMix = tuyChon.tuMix ?? TU_NGAY;
    const batDauM15 = Math.floor((tuMix - 20 * DAY) / DAY) * DAY; // chẵn ngày để khóa cache ổn định trong ngày
    baoCao('F3: tải nến D…');
    const d = await lay(sym, '1d', 0, baoCao);
    const h12 = await lay(sym, '12h', KHOI_DONG, baoCao);
    const h8 = await lay(sym, '8h', KHOI_DONG, baoCao);
    const h4 = await lay(sym, '4h', KHOI_DONG, baoCao);
    const h1 = await lay(sym, '1h', KHOI_DONG, baoCao);
    baoCao('F3: tải nến M15…');
    const m15 = await lay(sym, '15m', batDauM15, baoCao);
    const h2 = gopH2(h1), m30 = gopM30(m15);
    baoCao('F3: đang tính lệnh…');
    const kq = root.F3.chay({ d, h12, h8, h4, h2, h1, m30, m15, sl: h1 }, { tuNgay: TU_NGAY, tuMix });
    const giaCuoi = m15.length ? m15[m15.length - 1].c : (h1.length ? h1[h1.length - 1].c : null);
    const tk = root.F3.thongKe(kq.trades, giaCuoi);
    const thongKe = {};
    for (const leg of ['H2', 'H4', 'D', 'H1', 'M30', 'M15']) {
      const x = tk[leg] || { soLenh: 0, dangMo: 0, thang: 0, pnl: 0, kep: 0, sutMax: 0 };
      thongKe[leg] = { total: x.soLenh - x.dangMo, dangMo: x.dangMo, thang: x.thang, tongPct: +x.pnl.toFixed(2), kepPct: +x.kep.toFixed(1), sutMax: +x.sutMax.toFixed(1) };
    }
    baoCao('EA F3 sẵn sàng');
    // Cùng dạng dữ liệu với F2Data.chayF2 / L5Data.chayL5 để giao diện EA dùng chung
    return { trades: kq.trades, thongKe, status: { legs: kq.status.legs } };
  }

  root.F3Data = { chayF3, gopH2, gopM30 };
})(typeof window !== 'undefined' ? window : globalThis);
