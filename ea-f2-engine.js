// =====================================================================
//  ea-f2-engine.js — BỘ MÁY TÍNH LỆNH EA F2 (chỉ tính toán, không vẽ)
//  Theo EA-F2-v0.1.mq5 (Sâu chốt 05/11/2026) = F1 + 2 thay đổi ở LUỒNG D.
//  3 luồng độc lập, CHỈ MUA, không TP, SL bám 2 chiều, được vào lại sau SL:
//   H2 : vượt lên cụm co bó H2 (K=7), SL = S1 × 0.99           (như F1)
//   H4 : vượt lên cụm co bó H4 (K=6), SL = S1 × 0.99           (như F1)
//   D  : TÍN HIỆU như F1 khi nến D đóng: vùng tím (co bó BB 4% + co bó SMA
//        ở ≥1 khung H12/H8/H4/H2/H1 trong ngày) + close > BB thấp + RSI.
//        F2-1 RÀO: chưa vào ngay. "Cụm co bó thấp nhất" = khung có đường SMA
//        thấp nhất (S1 nhỏ nhất) trong các nến co bó của ngày; bộ đường = K
//        đường gần giá tại nến co bó CUỐI CÙNG của khung đó trong ngày.
//        Vào khi một nến của khung đó đóng (từ lúc nến D đóng, trong phiên D
//        kế tiếp) có giá đóng > đường thứ N=4 (thấp → cao) của bộ đường (SMA
//        tính tại nến đó) và SL dự kiến < giá đóng. Hết phiên chưa đạt → bỏ.
//        Đang giữ lệnh D lúc rào đạt → bỏ tín hiệu.
//        F2-2 SL: lúc vào SL = min(SMA thấp nhất của vùng trong ngày, BB thấp)
//        × 0.99 ("latch" bật). Mỗi nến D đóng: còn vùng tím → SL = min(SMA
//        thấp nhất ngày đó, BB thấp) × 0.99; hết vùng tím → tắt latch hẳn,
//        SL = BB thấp × 0.99. SL mới ≥ giá đóng → đóng lệnh ở giá đóng.
//  Vào lệnh ở GIÁ ĐÓNG nến kích hoạt. SL dò bằng nến nhỏ (H1/M15) từ sau lúc
//  vào; chạm SL thoát ở min(giá mở nến nhỏ, SL).
//  Đầu vào/ra giống ea-f1-engine.js; xuất window.F2.
// =====================================================================
(function (root) {
  'use strict';
  const H = 3600e3, DAY = 24 * H;
  const P = {
    SMA: [34, 55, 89, 144, 233, 377, 610, 987],
    K: { h12: 4, h8: 5, h4: 6, h2: 7, h1: 8 },
    zoneW: 3.0,     // độ rộng K đường gần giá nhất ≤ x%
    zoneD: 3.0,     // khoảng cách giá → SMA gần nhất ≤ x%
    slBuf: 1.0,     // H2/H4: SL = S1 × (1 − x%)
    bbW: 4.0,       // co bó BB: (max − min {close, SMA20, SMA55}) / close ≤ x%
    rsiNear: 6.0,   // RSI ≥ L3, hoặc (L3 − L1 ≤ x và RSI ≥ L2)
    slBufD: 1.0,    // D: SL = min(SMA thấp nhất vùng, BB thấp) × (1 − x%)
    raoN: 4,        // F2: giá đóng > đường thứ N (thấp → cao) của cụm co bó thấp nhất
  };
  const MS = { h1: H, h2: 2 * H, h4: 4 * H, h8: 8 * H, h12: 12 * H, d: DAY };

  // ---------- Chỉ báo ----------
  function sma(src, n) {
    const out = new Array(src.length).fill(NaN); let s = 0;
    for (let i = 0; i < src.length; i++) {
      s += src[i]; if (i >= n) s -= src[i - n];
      if (i >= n - 1) out[i] = s / n;
    }
    return out;
  }
  function smaNaN(src, n) { // SMA bỏ qua NaN đầu chuỗi
    const out = new Array(src.length).fill(NaN); let s = 0, cnt = 0;
    for (let i = 0; i < src.length; i++) {
      const v = src[i]; if (Number.isNaN(v)) { s = 0; cnt = 0; continue; }
      s += v; cnt++; if (cnt > n) { s -= src[i - n]; cnt = n; }
      if (cnt === n) out[i] = s / n;
    }
    return out;
  }
  // RSI Wilder, khởi đầu từ delta đầu tiên (pandas ewm alpha=1/14, adjust=False)
  function rsi(c, n = 14) {
    const out = new Array(c.length).fill(NaN); let ag = 0, al = 0;
    for (let k = 1; k < c.length; k++) {
      const d = c[k] - c[k - 1], g = d > 0 ? d : 0, l = d < 0 ? -d : 0;
      if (k === 1) { ag = g; al = l; } else { ag = (g + (n - 1) * ag) / n; al = (l + (n - 1) * al) / n; }
      if (k >= n) out[k] = al === 0 ? (ag === 0 ? 50 : 100) : 100 - 100 / (1 + ag / al);
    }
    return out;
  }
  function ema(src, n) {
    const out = new Array(src.length).fill(NaN), a = 2 / (n + 1); let prev = NaN;
    for (let i = 0; i < src.length; i++) {
      const v = src[i]; if (Number.isNaN(v)) continue;
      prev = Number.isNaN(prev) ? v : a * v + (1 - a) * prev; out[i] = prev;
    }
    return out;
  }
  function wma(src, n) {
    const out = new Array(src.length).fill(NaN), den = (n * (n + 1)) / 2;
    for (let i = n - 1; i < src.length; i++) {
      let s = 0, ok = true;
      for (let k = 0; k < n; k++) { const v = src[i - k]; if (Number.isNaN(v)) { ok = false; break; } s += v * (n - k); }
      if (ok) out[i] = s / den;
    }
    return out;
  }

  // ---------- Co bó SMA: mỗi nến trả {valid, zone, s1, st} ----------
  function vungCoBo(bars, K, S) {
    const c = bars.map((b) => b.c);
    S = S || P.SMA.map((p) => sma(c, p));
    return bars.map((b, i) => {
      const v = S.map((x) => x[i]);
      if (v.some(Number.isNaN)) return { valid: false, zone: false };
      const xep = v.map((x, k) => [Math.abs(x - b.c), x, k]).sort((a, z) => a[0] - z[0]);
      const gan = xep.slice(0, K);
      const giaTri = gan.map((x) => x[1]);
      const s1 = Math.min(...giaTri), st = Math.max(...giaTri);
      const w = ((st - s1) / b.c) * 100, d = (xep[0][0] / b.c) * 100;
      return { valid: true, zone: w <= P.zoneW && d <= P.zoneD, s1, st, w, d, sel: gan.map((x) => x[2]) };
    });
  }

  // ---------- Dò SL trên nến nhỏ ----------
  // Kiểm tra các nến nhỏ có giờ mở trong [tu, den); trả {t, gia} nếu chạm SL
  function taoDoSL(sl) {
    let k = 0;
    return (tu, den, slGia) => {
      while (k < sl.length && sl[k].t < tu) k++;
      while (k < sl.length && sl[k].t < den) {
        const b = sl[k];
        if (b.l <= slGia) { k++; return { t: b.t, gia: Math.min(b.o, slGia) }; }
        k++;
      }
      return null;
    };
  }
  function dongLenh(pos, t, gia, lyDo) {
    return {
      leg: pos.leg, method: pos.method, entryT: pos.entryT, entry: pos.entry, exitT: t, exit: gia, reason: lyDo,
      slHist: pos.slHist, pnlPct: gia === null ? null : ((gia - pos.entry) / pos.entry) * 100,
    };
  }

  // ---------- Luồng H2 / H4 ----------
  function chayH(ten, bars, ms, K, slBars, tuNgay) {
    const z = vungCoBo(bars, K);
    const doSL = taoDoSL(slBars);
    const trades = [];
    let pos = null;
    for (let i = 1; i < bars.length; i++) {
      const b = bars[i], T = b.t + ms;
      // (1) trong nến i: dò SL (SL đặt ở lần đóng nến trước)
      if (pos) {
        const hit = doSL(Math.max(b.t, pos.entryT), T, pos.sl);
        if (hit) { trades.push(dongLenh(pos, hit.t, hit.gia, 'SL')); pos = null; }
      }
      if (b.t + ms <= tuNgay || !z[i].valid) continue;
      // (2) nến i đóng
      const slMoi = z[i].s1 * (1 - P.slBuf / 100);
      if (pos) { pos.sl = slMoi; pos.slHist.push({ t: T, sl: slMoi }); continue; }
      if (z[i].zone && bars[i - 1].c <= z[i].st && b.c > z[i].st && slMoi < b.c) {
        pos = { leg: ten, method: `Vượt lên cụm co bó ${ten} (K=${K})`, entryT: T, entry: b.c, sl: slMoi, slHist: [{ t: T, sl: slMoi }] };
      }
    }
    if (pos) trades.push(dongLenh(pos, null, null, 'DANG_MO'));
    return { trades, pos, zone: z[z.length - 1] };
  }

  // ---------- Luồng D (F2) ----------
  const KHUNG5 = ['h12', 'h8', 'h4', 'h2', 'h1']; // thứ tự như MT5 (bằng nhau → khung lớn hơn)
  const TEN5 = { h12: 'H12', h8: 'H8', h4: 'H4', h2: 'H2', h1: 'H1' };
  function chayD(du, slBars, tuNgay) {
    const d = du.d, c = d.map((b) => b.c);
    const b20 = sma(c, 20), b55 = sma(c, 55);
    const r = rsi(c), e9 = ema(r, 9), w45 = wma(r, 45), r20 = smaNaN(r, 20), r55 = smaNaN(r, 55);
    // Mỗi khung: SMA, vùng co bó, thông tin theo ngày {fl: S1 nhỏ nhất, sel: bộ đường nến co bó cuối}
    const KH = {};
    for (const id of KHUNG5) {
      const bars = du[id]; if (!bars) continue;
      const cc = bars.map((x) => x.c);
      const S = P.SMA.map((p) => sma(cc, p));
      const z = vungCoBo(bars, P.K[id], S);
      const ngay = new Map();
      bars.forEach((x, i) => {
        if (!z[i].zone) return;
        const k = Math.floor(x.t / DAY) * DAY;
        const o = ngay.get(k);
        if (!o) ngay.set(k, { fl: z[i].s1, sel: z[i].sel });
        else { if (z[i].s1 < o.fl) o.fl = z[i].s1; o.sel = z[i].sel; }
      });
      KH[id] = { bars, S, ngay, ms: MS[id], k: 0 };
    }
    // Cụm co bó trong ngày dayStart: {found, low, f, sel}
    const vungNgay = (dayStart) => {
      const r0 = { found: false, low: Infinity, f: null, sel: null };
      for (const id of KHUNG5) {
        const o = KH[id] && KH[id].ngay.get(dayStart); if (!o) continue;
        r0.found = true;
        if (o.fl < r0.low) { r0.low = o.fl; r0.f = id; r0.sel = o.sel; }
      }
      return r0;
    };
    const doSL = taoDoSL(slBars);
    const trades = [];
    let pos = null, last = null, cho = null, cur = -Infinity; // cur: mốc đã dò SL tới
    const doTi = (den) => { // dò SL tới mốc den
      if (pos && den > cur) {
        const hit = doSL(Math.max(cur, pos.entryT), den, pos.sl);
        if (hit) { trades.push(dongLenh(pos, hit.t, hit.gia, 'SL')); pos = null; }
      }
      if (den > cur) cur = den;
    };
    // Xét rào trên các nến khung cho.f đóng trong [tu, den)
    const xetRao = (tu, den) => {
      const kh = KH[cho.f], bars = kh.bars;
      while (kh.k < bars.length && bars[kh.k].t + kh.ms < tu) kh.k++;
      for (let j = kh.k; j < bars.length && cho; j++) {
        const tc = bars[j].t + kh.ms;
        if (tc >= den) break;
        if (tc < tu) continue;
        doTi(tc);
        const v = cho.sel.map((k) => kh.S[k][j]);
        if (v.some(Number.isNaN)) continue;
        v.sort((x, y) => x - y);
        const thr = v[Math.min(P.raoN, v.length) - 1], cc = bars[j].c;
        if (!(cc > thr && cho.sl < cc)) continue;
        if (pos) { cho = null; break; } // đang giữ lệnh D → bỏ tín hiệu
        pos = { leg: 'D', latch: true, entryT: tc, entry: cc, sl: cho.sl, slHist: [{ t: tc, sl: cho.sl }],
          method: `Vùng tím BB + RSI → rào ${TEN5[cho.f]} (giá > đường thứ ${Math.min(P.raoN, v.length)} ${thr.toFixed(2)}) · ${cho.ghiChu}` };
        cho = null;
      }
    };
    for (let i = 0; i < d.length; i++) {
      const b = d[i], T = b.t + DAY;
      // trong phiên: tín hiệu chờ rào (tạo lúc b.t) + dò SL
      if (cho) { if (KH[cho.f]) xetRao(b.t, T); cho = null; }
      doTi(T);
      // nến D đóng tại T
      if (T <= tuNgay || Number.isNaN(b55[i])) continue;
      const bThap = Math.min(b20[i], b55[i]), bCao = Math.max(b20[i], b55[i]);
      const bbSL = bThap * (1 - P.slBufD / 100);
      const w3 = ((Math.max(b.c, bCao) - Math.min(b.c, bThap)) / b.c) * 100;
      const L = [e9[i], w45[i], r20[i], r55[i]];
      const coL = !L.some(Number.isNaN);
      if (coL) L.sort((x, y) => x - y);
      const vungBB = w3 <= P.bbW;
      const dz = vungBB ? vungNgay(b.t) : { found: false };
      const vungSMA = vungBB ? dz.found : vungNgay(b.t).found; // chỉ để hiển thị
      const tim = vungBB && dz.found;
      const rsiOk = coL && (r[i] >= L[2] || (L[2] - L[0] <= P.rsiNear && r[i] >= L[1]));
      last = { t: b.t, vungBB, vungSMA, w3, rsi: r[i], L: coL ? L : null, cumThap: tim ? TEN5[dz.f] : null };
      // đang giữ lệnh: SL theo F2
      if (pos) {
        let slMoi = bbSL;
        if (pos.latch && tim) slMoi = Math.min(dz.low, bThap) * (1 - P.slBufD / 100);
        else pos.latch = false;
        if (slMoi >= b.c) { pos.slHist.push({ t: T, sl: slMoi }); trades.push(dongLenh(pos, T, b.c, 'SL')); pos = null; }
        else { pos.sl = slMoi; pos.slHist.push({ t: T, sl: slMoi }); }
      }
      // tín hiệu mới (xét cả khi đang giữ lệnh)
      if (tim && b.c > bThap && rsiOk) {
        cho = { f: dz.f, sel: dz.sel, sl: Math.min(dz.low, bThap) * (1 - P.slBufD / 100), tu: T,
          ghiChu: `RSI ${r[i].toFixed(1)}, L1..L4 ${L.map((x) => x.toFixed(1)).join('/')}` };
      }
    }
    if (pos) trades.push(dongLenh(pos, null, null, 'DANG_MO'));
    const choTT = cho ? { khung: TEN5[cho.f], sl: cho.sl, tu: cho.tu } : null;
    return { trades, pos, last, cho: choTT };
  }

  // ---------- Chạy toàn bộ ----------
  function chay(du, tuyChon = {}) {
    const tuNgay = tuyChon.tuNgay ?? Date.UTC(2020, 0, 1);
    const sl = du.sl || du.h1;
    const H2 = du.h2 ? chayH('H2', du.h2, MS.h2, P.K.h2, sl, tuNgay) : { trades: [] };
    const H4 = du.h4 ? chayH('H4', du.h4, MS.h4, P.K.h4, sl, tuNgay) : { trades: [] };
    const D = du.d ? chayD(du, sl, tuNgay) : { trades: [] };
    const trades = [...H2.trades, ...H4.trades, ...D.trades].sort((a, b) => a.entryT - b.entryT);
    const viThe = (x) => (x && x.pos ? { price: x.pos.entry, sl: x.pos.sl } : null);
    return {
      trades,
      status: {
        legs: {
          H2: { pos: viThe(H2), coBo: H2.zone ? H2.zone.zone : null, w: H2.zone && H2.zone.valid ? H2.zone.w : null },
          H4: { pos: viThe(H4), coBo: H4.zone ? H4.zone.zone : null, w: H4.zone && H4.zone.valid ? H4.zone.w : null },
          D: { pos: viThe(D), ngay: D.last || null, cho: D.cho || null }, // ngay: {vungBB, vungSMA, w3, rsi, L, cumThap}; cho: tín hiệu đang chờ rào
        },
      },
    };
  }

  // Thống kê: số lệnh, thắng, cộng dồn %, lãi kép %, sụt giảm tối đa (theo lệnh đã đóng, vốn kép)
  function thongKe(trades, giaCuoi) {
    const out = {};
    for (const t of trades) {
      const k = t.leg;
      const o = (out[k] = out[k] || { soLenh: 0, dangMo: 0, thang: 0, pnl: 0, kep: 1, dinh: 1, sutMax: 0 });
      o.soLenh++;
      let p = t.pnlPct;
      if (t.exitT === null) { o.dangMo++; if (giaCuoi == null) continue; p = ((giaCuoi - t.entry) / t.entry) * 100; }
      o.pnl += p; if (p > 0) o.thang++;
      o.kep *= 1 + p / 100; o.dinh = Math.max(o.dinh, o.kep); o.sutMax = Math.min(o.sutMax, (o.kep / o.dinh - 1) * 100);
    }
    for (const k in out) { out[k].kep = (out[k].kep - 1) * 100; delete out[k].dinh; }
    return out;
  }

  const F2 = { P, chay, thongKe, vungCoBo, _test: { sma, rsi, ema, wma } };
  if (typeof module !== 'undefined' && module.exports) module.exports = F2;
  else root.F2 = F2;
})(typeof window !== 'undefined' ? window : globalThis);
