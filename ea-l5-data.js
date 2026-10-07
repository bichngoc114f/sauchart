// =====================================================================
//  ea-l5-data.js — TẢI DỮ LIỆU CHO EA L5 (Binance) + LƯU ĐỆM TRÊN MÁY
//  Dùng: const kq = await L5Data.chayL5('BTCUSDT', (msg) => console.log(msg));
//  Lần đầu tải nhiều (nến H1 từ 2019, M15 quanh các lệnh D) → lưu IndexedDB,
//  những lần sau chỉ tải phần nến mới.
// =====================================================================
(function (root) {
  'use strict';
  const MIN = 60 * 1000, H = 60 * MIN, DAY = 24 * H;
  const IV = { '15m': 15 * MIN, '1h': H, '4h': 4 * H, '8h': 8 * H, '12h': 12 * H, '1d': DAY };
  const HOSTS = ['https://data-api.binance.vision', 'https://api.binance.com'];
  const TU_NGAY = Date.UTC(2020, 0, 1);
  const KHOI_DONG = Date.UTC(2019, 6, 1); // tải sớm hơn để chỉ báo đủ dữ liệu khởi động

  // ---------- IndexedDB (lỗi thì bỏ qua, chạy không cache) ----------
  let dbP = null;
  function db() {
    if (dbP) return dbP;
    dbP = new Promise((res) => {
      try {
        const rq = indexedDB.open('sauchart-ea', 1);
        rq.onupgradeneeded = () => rq.result.createObjectStore('nen');
        rq.onsuccess = () => res(rq.result);
        rq.onerror = () => res(null);
      } catch (e) { res(null); }
    });
    return dbP;
  }
  async function cacheGet(key) {
    const d = await db(); if (!d) return null;
    return new Promise((res) => {
      try { const rq = d.transaction('nen').objectStore('nen').get(key); rq.onsuccess = () => res(rq.result || null); rq.onerror = () => res(null); }
      catch (e) { res(null); }
    });
  }
  async function cacheSet(key, val) {
    const d = await db(); if (!d) return;
    try { d.transaction('nen', 'readwrite').objectStore('nen').put(val, key); } catch (e) {}
  }

  // ---------- Gọi Binance ----------
  async function goi(sym, iv, start, end) {
    for (const h of HOSTS) {
      try {
        const r = await fetch(`${h}/api/v3/klines?symbol=${sym}&interval=${iv}&startTime=${start}&endTime=${end}&limit=1000`);
        if (!r.ok) continue;
        return (await r.json()).map((k) => [k[0], +k[1], +k[2], +k[3], +k[4]]);
      } catch (e) { /* thử host sau */ }
    }
    throw new Error('Không tải được nến ' + sym + ' ' + iv);
  }
  // Tải khoảng [start, end] theo từng khúc 1000 nến, chạy song song 6 khúc
  async function taiKhoang(sym, iv, start, end, tienDo) {
    const step = IV[iv] * 1000;
    const khuc = [];
    for (let s = start; s <= end; s += step) khuc.push([s, Math.min(s + step - 1, end)]);
    const out = new Array(khuc.length);
    let xong = 0, i = 0;
    async function tho() {
      while (i < khuc.length) {
        const k = i++;
        out[k] = await goi(sym, iv, khuc[k][0], khuc[k][1]);
        xong++; if (tienDo) tienDo(xong, khuc.length);
      }
    }
    await Promise.all(Array.from({ length: Math.min(6, khuc.length) }, tho));
    return out.flat();
  }
  // Ghép + bỏ trùng + bỏ nến chưa đóng
  function chuanHoa(rows, iv) {
    const map = new Map();
    for (const r of rows) map.set(r[0], r);
    const now = Date.now();
    return [...map.values()].filter((r) => r[0] + IV[iv] <= now).sort((a, b) => a[0] - b[0]);
  }
  const thanhNen = (rows) => rows.map((r) => ({ t: r[0], o: r[1], h: r[2], l: r[3], c: r[4] }));

  // Lấy cả chuỗi 1 khung (có cache, chỉ tải phần mới)
  async function layKhung(sym, iv, tu, baoCao) {
    const key = `${sym}|${iv}|${tu}`;
    let rows = (await cacheGet(key)) || [];
    const batDau = rows.length ? rows[rows.length - 1][0] + IV[iv] : tu;
    const moi = await taiKhoang(sym, iv, batDau, Date.now(), (a, b) => baoCao && baoCao(`Tải ${iv}: ${a}/${b}`));
    rows = chuanHoa(rows.concat(moi), iv);
    await cacheSet(key, rows);
    return thanhNen(rows);
  }

  // ---------- Chạy L5 cho 1 mã ----------
  async function chayL5(sym, baoCao = () => {}) {
    const L5 = root.L5;
    baoCao('Đang tải nến D…');
    const d = await layKhung(sym, '1d', 0, baoCao); // nến D: lấy toàn bộ lịch sử (Bias W cần lịch sử dài)
    const [h12, h8, h4, h1] = [
      await layKhung(sym, '12h', KHOI_DONG, baoCao),
      await layKhung(sym, '8h', KHOI_DONG, baoCao),
      await layKhung(sym, '4h', KHOI_DONG, baoCao),
      await layKhung(sym, '1h', KHOI_DONG, baoCao),
    ];
    // Chạy D trước để biết cần nến M15 ở những đoạn nào
    const bias = L5.tinhBiasW(d);
    const D = L5.chayD(d, h1, bias, TU_NGAY);
    const m15ByEntry = {};
    let k = 0;
    for (const tr of D.trades) {
      k++;
      baoCao(`Tải M15 cho lệnh D ${k}/${D.trades.length}…`);
      const from = tr.entryT - 400 * IV['15m'];
      const to = tr.exitT === null ? Date.now() : tr.exitT + IV['15m'];
      const key = `${sym}|15m|${tr.entryT}`;
      let rows = tr.exitT !== null ? await cacheGet(key) : null;
      if (!rows) {
        rows = chuanHoa(await taiKhoang(sym, '15m', from, to), '15m');
        if (tr.exitT !== null) await cacheSet(key, rows);
      }
      m15ByEntry[tr.entryT] = thanhNen(rows);
    }
    baoCao('Đang tính lệnh…');
    const kq = L5.chay({ d, h12, h8, h4, h1, m15ByEntry }, { tuNgay: TU_NGAY });
    baoCao('EA sẵn sàng');
    return dinhDangChoApp(kq, L5.thongKe(kq.trades));
  }

  // Chuyển kết quả sang đúng dạng giao diện app.js đang dùng
  function dinhDangChoApp(kq, tk) {
    const thongKe = {};
    for (const leg of ['D', 'H4', 'H8', 'H12', 'Trap']) {
      const x = tk[leg] || { soLenh: 0, dangMo: 0, pnl: 0, thang: 0 };
      thongKe[leg] = { total: x.soLenh - x.dangMo, tongPct: +x.pnl.toFixed(2), thang: x.thang, dangMo: x.dangMo };
    }
    const viTheMo = (tr) => tr ? { pos: { price: tr.entry, sl: tr.slHist.length ? tr.slHist[tr.slHist.length - 1].sl : null } } : null;
    const legs = { D: viTheMo(kq.status.D), Trap: viTheMo(kq.status.trap) };
    for (const [k, v] of Object.entries(kq.status.legs)) {
      legs[k] = { pos: v.pos ? { price: v.pos.entry, sl: v.pos.sl } : null, waiting: v.waiting, breakout: v.breakout };
    }
    const b = kq.status.bias || {};
    return {
      trades: kq.trades,
      thongKe,
      status: { bias: { valid: !!b.hopLe, method: b.method || '', start: b.tu || null }, legs },
    };
  }

  root.L5Data = { chayL5, layKhung };
})(typeof window !== 'undefined' ? window : globalThis);
