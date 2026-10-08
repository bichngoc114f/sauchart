// =====================================================================
//  ea-s1-data.js — TẢI NẾN NGÀY (KBS) + CHẠY EA S1 CHO 1 MÃ CHỨNG KHOÁN VN
//  Dùng: const kq = await S1Data.chayS1('ACB', (msg) => console.log(msg));
//  Cần nạp trước: ea-l5-engine.js, ea-s1-engine.js
//  S1 chỉ cần nến D (M, W, 2D tự gộp) → 1 lần gọi KBS, không cần cache.
// =====================================================================
(function (root) {
  'use strict';
  const KBS = 'https://kbbuddywts.kbsec.com.vn/iis-server/investment';
  const VPS = 'https://histdatafeed.vps.com.vn/tradingview/history';
  const CHI_SO = ['VN30', 'VNINDEX', 'VN100', 'HNX30', 'HNXINDEX', 'UPCOMINDEX'];
  const laChiSo = (sym) => CHI_SO.includes(sym.toUpperCase());

  const ddmmyyyy = (dt) => `${String(dt.getUTCDate()).padStart(2, '0')}-${String(dt.getUTCMonth() + 1).padStart(2, '0')}-${dt.getUTCFullYear()}`;
  // "2026-10-07 ..." hoặc "07/10/2026" → ms UTC 00:00 của ngày đó
  function ngay(s) {
    s = String(s);
    let m = s.match(/(\d{4})-(\d{2})-(\d{2})/);
    if (m) return Date.UTC(+m[1], +m[2] - 1, +m[3]);
    m = s.match(/(\d{2})[/-](\d{2})[/-](\d{4})/);
    if (m) return Date.UTC(+m[3], +m[2] - 1, +m[1]);
    return NaN;
  }

  async function taiKBS(sym) {
    const loai = laChiSo(sym) ? 'index' : 'stocks';
    const url = `${KBS}/${loai}/${sym}/data_day?sdate=01-01-2010&edate=${ddmmyyyy(new Date(Date.now() + 7 * 3600e3))}`;
    const r = await fetch(url);
    if (!r.ok) throw new Error('KBS ' + r.status);
    const j = await r.json();
    const arr = j.data_day || Object.values(j).find(Array.isArray) || [];
    return arr.map((x) => ({ t: ngay(x.t), o: +x.o, h: +x.h, l: +x.l, c: +x.c }));
  }
  async function taiVPS(sym) {
    const to = Math.floor(Date.now() / 1000);
    const r = await fetch(`${VPS}?symbol=${sym}&resolution=D&from=${to - 20 * 365 * 86400}&to=${to}`);
    const j = await r.json();
    if (!j.t) throw new Error('VPS rỗng');
    return j.t.map((s, i) => ({ t: Math.floor((s + 7 * 3600) / 86400) * 86400000, o: +j.o[i], h: +j.h[i], l: +j.l[i], c: +j.c[i] }));
  }

  // Sắp xếp, bỏ trùng, bỏ nến lỗi, bỏ nến hôm nay nếu chưa tới 15:00 giờ VN
  function chuanHoa(rows) {
    const map = new Map();
    for (const b of rows) if (Number.isFinite(b.t) && b.c > 0 && b.l > 0) map.set(b.t, b);
    const out = [...map.values()].sort((a, b) => a.t - b.t);
    const vn = new Date(Date.now() + 7 * 3600e3);
    const homNay = Date.UTC(vn.getUTCFullYear(), vn.getUTCMonth(), vn.getUTCDate());
    if (out.length && out[out.length - 1].t === homNay && vn.getUTCHours() < 15) out.pop();
    return out;
  }

  async function layNenD(sym) {
    try { const d = await taiKBS(sym); if (d.length > 100) return chuanHoa(d); } catch (e) { /* thử VPS */ }
    return chuanHoa(await taiVPS(sym));
  }

  async function chayS1(sym, baoCao = () => {}) {
    sym = sym.toUpperCase();
    baoCao('Đang tải nến D ' + sym + '…');
    const d = await layNenD(sym);
    baoCao('Đang tính lệnh S1…');
    const kq = root.S1.chay(d, { chiSo: laChiSo(sym) });
    const tk = root.S1.thongKe(kq.trades);
    const thongKe = {};
    for (const leg of ['W', 'D', '2D']) {
      const x = tk[leg] || { soLenh: 0, dangMo: 0, pnl: 0, thang: 0 };
      thongKe[leg] = { total: x.soLenh - x.dangMo, tongPct: +x.pnl.toFixed(2), thang: x.thang, dangMo: x.dangMo };
    }
    const b = kq.status.bias || {};
    baoCao('EA S1 sẵn sàng');
    return {
      trades: kq.trades,
      thongKe,
      status: { bias: { valid: !!b.hopLe, method: b.method || '', start: b.tu || null }, legs: kq.status.legs, phienCuoi: kq.status.phienCuoi, t2: kq.status.t2 },
      soNen: d.length, tuNgayDuLieu: d.length ? d[0].t : null,
    };
  }

  root.S1Data = { chayS1, layNenD, laChiSo };
})(typeof window !== 'undefined' ? window : globalThis);
