// =====================================================================
//  ea-f1-data.js — TẢI DỮ LIỆU + CHẠY EA F1 CHO 1 MÃ CRYPTO
//  Dùng: const kq = await F1Data.chayF1('BTCUSDT', (msg) => console.log(msg));
//  Cần nạp trước: ea-l5-engine.js, ea-l5-data.js (dùng L5Data.layKhung có cache
//  IndexedDB), ea-f1-engine.js.
//  Dữ liệu: nến 1h/4h/8h/12h từ 01/08/2017 (đủ khởi động SMA987 trước 2020),
//  nến D toàn bộ; H2 gộp từ H1; dò SL bằng nến H1 (kết quả trùng M15 trên BTC).
//  Lần đầu tải nhiều (~1–2 phút), các lần sau chỉ tải phần nến mới.
// =====================================================================
(function (root) {
  'use strict';
  const H = 3600e3;
  const KHOI_DONG = Date.UTC(2017, 7, 1);
  const TU_NGAY = Date.UTC(2020, 0, 1);

  // Gộp H1 → H2 (mốc giờ chẵn UTC); bỏ nến H2 cuối nếu mới có 1 nến H1 (chưa đóng)
  function gopH2(h1) {
    const out = [];
    for (const b of h1) {
      const k = Math.floor(b.t / (2 * H)) * 2 * H;
      const c = out[out.length - 1];
      if (c && c.t === k) { c.h = Math.max(c.h, b.h); c.l = Math.min(c.l, b.l); c.c = b.c; c.n++; }
      else out.push({ t: k, o: b.o, h: b.h, l: b.l, c: b.c, n: 1 });
    }
    if (out.length && out[out.length - 1].n < 2) out.pop();
    return out;
  }

  async function chayF1(sym, baoCao = () => {}) {
    const lay = root.L5Data.layKhung;
    baoCao('F1: tải nến D…');
    const d = await lay(sym, '1d', 0, baoCao);
    const h12 = await lay(sym, '12h', KHOI_DONG, baoCao);
    const h8 = await lay(sym, '8h', KHOI_DONG, baoCao);
    const h4 = await lay(sym, '4h', KHOI_DONG, baoCao);
    const h1 = await lay(sym, '1h', KHOI_DONG, baoCao);
    const h2 = gopH2(h1);
    baoCao('F1: đang tính lệnh…');
    const kq = root.F1.chay({ d, h12, h8, h4, h2, h1, sl: h1 }, { tuNgay: TU_NGAY });
    const giaCuoi = h1.length ? h1[h1.length - 1].c : null;
    const tk = root.F1.thongKe(kq.trades, giaCuoi);
    const thongKe = {};
    for (const leg of ['H2', 'H4', 'D']) {
      const x = tk[leg] || { soLenh: 0, dangMo: 0, thang: 0, pnl: 0, kep: 0, sutMax: 0 };
      thongKe[leg] = { total: x.soLenh - x.dangMo, dangMo: x.dangMo, thang: x.thang, tongPct: +x.pnl.toFixed(2), kepPct: +x.kep.toFixed(1), sutMax: +x.sutMax.toFixed(1) };
    }
    baoCao('EA F1 sẵn sàng');
    // Cùng dạng dữ liệu với L5Data.chayL5 để giao diện EA dùng chung
    return { trades: kq.trades, thongKe, status: { legs: kq.status.legs } };
  }

  root.F1Data = { chayF1, gopH2 };
})(typeof window !== 'undefined' ? window : globalThis);
