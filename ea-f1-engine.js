// =====================================================================
//  ea-f1-engine.js — BỘ MÁY TÍNH LỆNH EA F1 (chỉ tính toán, không vẽ)
//  Theo "F1-tong-hop-quyet-dinh-2026-11-04.md" + EA-F1-v0.1.mq5.
//  3 luồng độc lập, CHỈ MUA, không TP, SL bám 2 chiều, được vào lại sau SL:
//   H2 : vượt lên cụm co bó H2 (K=7), SL = S1 × 0.99
//   H4 : vượt lên cụm co bó H4 (K=6), SL = S1 × 0.99
//   D  : vùng tím (co bó SMA ở ≥1 khung H12/H8/H4/H2/H1 VÀ co bó BB 4%)
//        + close > BB thấp + RSI (RSI ≥ L3, hoặc L3−L1 ≤ 6 và RSI ≥ L2),
//        SL = BB thấp × 0.99
//  Co bó SMA: 8 SMA 34…987 trên giá đóng của khung, K đường gần giá nhất
//   (H12 4, H8 5, H4 6, H2 7, H1 8); co bó khi độ rộng ≤ 3% VÀ cách giá ≤ 3%.
//  Vào lệnh ở GIÁ ĐÓNG nến tín hiệu. SL kiểm tra bằng nến nhỏ (M15 hoặc H1)
//  từ sau lúc vào lệnh; chạm SL thoát ở min(giá mở nến nhỏ, SL).
//
//  Đầu vào: { h1, h2, h4, h8, h12, d, sl } — mảng nến [{t,o,h,l,c}] ĐÃ ĐÓNG,
//   t = ms UTC giờ mở nến, tăng dần. sl = nến nhỏ để dò SL (M15 hoặc H1).
//  Đầu ra: { trades, status } — mỗi lệnh {leg, method, entryT, entry, exitT,
//   exit, reason, slHist:[{t,sl}], pnlPct} (giống L5; exitT=null nếu đang mở).
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
    slBufD: 1.0,    // D: SL = BB thấp × (1 − x%)
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
  function vungCoBo(bars, K) {
    const c = bars.map((b) => b.c);
    const S = P.SMA.map((p) => sma(c, p));
    return bars.map((b, i) => {
      const v = S.map((x) => x[i]);
      if (v.some(Number.isNaN)) return { valid: false, zone: false };
      const xep = v.map((x) => [Math.abs(x - b.c), x]).sort((a, z) => a[0] - z[0]);
      const gan = xep.slice(0, K).map((x) => x[1]);
      const s1 = Math.min(...gan), st = Math.max(...gan);
      const w = ((st - s1) / b.c) * 100, d = (xep[0][0] / b.c) * 100;
      return { valid: true, zone: w <= P.zoneW && d <= P.zoneD, s1, st, w, d };
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

  // ---------- Luồng D ----------
  function chayD(du, slBars, tuNgay) {
    const d = du.d, c = d.map((b) => b.c);
    const b20 = sma(c, 20), b55 = sma(c, 55);
    const r = rsi(c), e9 = ema(r, 9), w45 = wma(r, 45), r20 = smaNaN(r, 20), r55 = smaNaN(r, 55);
    // Ngày có co bó SMA ở ít nhất 1 trong 5 khung (nến khung đó mở trong ngày)
    const ngaySMA = new Set();
    for (const id of ['h12', 'h8', 'h4', 'h2', 'h1']) {
      if (!du[id]) continue;
      const z = vungCoBo(du[id], P.K[id]);
      du[id].forEach((b, i) => { if (z[i].zone) ngaySMA.add(Math.floor(b.t / DAY) * DAY); });
    }
    const doSL = taoDoSL(slBars);
    const trades = [];
    let pos = null, last = null;
    for (let i = 0; i < d.length; i++) {
      const b = d[i], T = b.t + DAY;
      if (pos) {
        const hit = doSL(Math.max(b.t, pos.entryT), T, pos.sl);
        if (hit) { trades.push(dongLenh(pos, hit.t, hit.gia, 'SL')); pos = null; }
      }
      if (T <= tuNgay || Number.isNaN(b55[i])) continue;
      const bThap = Math.min(b20[i], b55[i]), bCao = Math.max(b20[i], b55[i]);
      const slMoi = bThap * (1 - P.slBufD / 100);
      const w3 = ((Math.max(b.c, bCao) - Math.min(b.c, bThap)) / b.c) * 100;
      const L = [e9[i], w45[i], r20[i], r55[i]];
      const coL = !L.some(Number.isNaN);
      if (coL) L.sort((x, y) => x - y);
      const vungBB = w3 <= P.bbW, vungSMA = ngaySMA.has(b.t);
      last = { t: b.t, vungBB, vungSMA, w3, rsi: r[i], L: coL ? L : null };
      if (pos) { pos.sl = slMoi; pos.slHist.push({ t: T, sl: slMoi }); continue; }
      if (!coL || !vungBB || !vungSMA || !(b.c > bThap) || !(slMoi < b.c)) continue;
      const rsiOk = r[i] >= L[2] || (L[2] - L[0] <= P.rsiNear && r[i] >= L[1]);
      if (!rsiOk) continue;
      pos = { leg: 'D', method: `Vùng tím BB + RSI (RSI ${r[i].toFixed(1)}, L1..L4 ${L.map((x) => x.toFixed(1)).join('/')})`, entryT: T, entry: b.c, sl: slMoi, slHist: [{ t: T, sl: slMoi }] };
    }
    if (pos) trades.push(dongLenh(pos, null, null, 'DANG_MO'));
    return { trades, pos, last };
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
          D: { pos: viThe(D), ngay: D.last || null }, // ngay: {vungBB, vungSMA, w3, rsi, L} của nến D cuối
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

  const F1 = { P, chay, thongKe, vungCoBo, _test: { sma, rsi, ema, wma } };
  if (typeof module !== 'undefined' && module.exports) module.exports = F1;
  else root.F1 = F1;
})(typeof window !== 'undefined' ? window : globalThis);
