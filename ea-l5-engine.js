// =====================================================================
//  ea-l5-engine.js — BỘ MÁY TÍNH LỆNH EA L5 (chỉ tính toán, không vẽ)
//  Viết lại theo tài liệu "quy-trinh-vao-ra-lenh-L5" (bản Python backtest
//  là nguồn chân lý) + đối chiếu EA-trial-L5.mq5.
//
//  Đầu vào: nến các khung (thời gian mở nến tính bằng ms UTC):
//    { d, h12, h8, h4, h1, m15ByEntry }
//    mỗi mảng nến: [{t, o, h, l, c}] — CHỈ nến đã đóng, sắp xếp tăng dần.
//    m15ByEntry: nến M15 theo từng lệnh D (chỉ cần quanh các lệnh D).
//  Đầu ra: { trades, status, dTrades } — mỗi lệnh: {leg, method, entryT, entry, exitT, exit, reason, slHist:[{t,sl}], pnlPct}
//  Đối chiếu BTC 2020→05/10/2026 (dữ liệu Binance): D 29 lệnh +642%, H4 76 +637%, H8 49 +641%, H12 38 +645%, Trap 60 +602%
//  (backtest Python trên Exness: D 27 +643%, H4 74 +667%, H8 52 +659%, H12 41 +665%, Trap 53 +611%).
//  Chỉ có lệnh BUY (L5 là hệ thống thuận xu hướng, chỉ mua).
// =====================================================================
(function (root) {
  'use strict';

  const H = 3600 * 1000;
  const DAY = 24 * H;
  const WEEK = 7 * DAY;

  // ---------- THAM SỐ (mục 8 tài liệu L5) ----------
  const P = {
    // Bias W
    near1: 2.0, near2: 4.0, nearNext: 4.0, near3: 6.0, invalidTol: 0.5,
    maxSpread: 6.0, priceGatePct: 0.30, gate22RsiL3Buf: 1.0, gate22Spread: 6.0,
    // Buffer thích ứng
    wideThreshold: 10.0, wideBuf: 1.0,
    // D
    dSlBelow: 1.0, dSlAbove: 2.0, dSlOversold: 1.5, dOversoldLookback: 60, dOversoldThresh: 20, dInvalidTol: 0.5,
    // MAIN (H4/H8/H12)
    mainCond2Tol: 3.0, mainOversoldLookback: 10, mainOversoldThresh: 20, mainSlBuf: 1.0,
    // Trap M15
    trapMinBelow: 10, trapDistMin: 5.0, trapRsiFloor: 25, trapCrossSpreadTol: 10.0, trapMaxTry: 6, trapSlBuf: 1.0,
  };

  // ---------- CHỈ BÁO (giống indicators.py) ----------
  // RSI Wilder, khởi đầu từ delta đầu tiên (như pandas ewm alpha=1/14, adjust=False)
  function rsiPy(c, n = 14) {
    const out = new Array(c.length).fill(NaN);
    let ag = 0, al = 0;
    for (let k = 1; k < c.length; k++) {
      const d = c[k] - c[k - 1];
      const g = d > 0 ? d : 0, l = d < 0 ? -d : 0;
      if (k === 1) { ag = g; al = l; }
      else { ag = (g + (n - 1) * ag) / n; al = (l + (n - 1) * al) / n; }
      if (k >= n) {
        if (al === 0 && ag === 0) out[k] = 50;
        else if (al === 0) out[k] = 100;
        else if (ag === 0) out[k] = 0;
        else out[k] = 100 - 100 / (1 + ag / al);
      }
    }
    return out;
  }
  // EMA kiểu pandas ewm(span=n, adjust=False): giá trị hợp lệ đầu tiên làm gốc
  function emaPy(src, n) {
    const out = new Array(src.length).fill(NaN);
    const a = 2 / (n + 1);
    let prev = NaN;
    for (let i = 0; i < src.length; i++) {
      const v = src[i];
      if (Number.isNaN(v)) continue;
      prev = Number.isNaN(prev) ? v : a * v + (1 - a) * prev;
      out[i] = prev;
    }
    return out;
  }
  function sma(src, n) {
    const out = new Array(src.length).fill(NaN);
    let s = 0, cnt = 0;
    for (let i = 0; i < src.length; i++) {
      const v = src[i];
      if (Number.isNaN(v)) { s = 0; cnt = 0; continue; }
      s += v; cnt++;
      if (cnt > n) { s -= src[i - n]; cnt = n; }
      if (cnt === n) out[i] = s / n;
    }
    return out;
  }
  function wma(src, n) {
    const out = new Array(src.length).fill(NaN);
    const den = (n * (n + 1)) / 2;
    for (let i = n - 1; i < src.length; i++) {
      let s = 0, ok = true;
      for (let k = 0; k < n; k++) {
        const v = src[i - k];
        if (Number.isNaN(v)) { ok = false; break; }
        s += v * (n - k);
      }
      if (ok) out[i] = s / den;
    }
    return out;
  }

  // Tính trọn bộ chỉ báo cho 1 khung
  function chiBao(bars) {
    const c = bars.map((b) => b.c);
    const rsi = rsiPy(c);
    const ema9 = emaPy(rsi, 9), wma45 = wma(rsi, 45), s20 = sma(rsi, 20), s55 = sma(rsi, 55);
    const n = bars.length;
    const L1 = new Array(n).fill(NaN), L2 = L1.slice(), L3 = L1.slice(), L4 = L1.slice(), buf = new Array(n).fill(0);
    for (let i = 0; i < n; i++) {
      const v = [ema9[i], wma45[i], s20[i], s55[i]];
      if (v.some(Number.isNaN)) continue;
      v.sort((a, b) => a - b);
      L1[i] = v[0]; L2[i] = v[1]; L3[i] = v[2]; L4[i] = v[3];
      buf[i] = (v[3] - v[0]) > P.wideThreshold ? P.wideBuf : 0;
    }
    const p20 = sma(c, 20), p55 = sma(c, 55);
    const basis = p20.map((x, i) => Math.min(x, p55[i]));
    return { rsi, ema9, wma45, L1, L2, L3, L4, buf, p20, p55, basis };
  }

  // Tìm vị trí nến cuối có t <= x (tìm nhị phân); -1 nếu không có
  function viTri(arr, x, key = (b) => b.t) {
    let lo = 0, hi = arr.length - 1, ans = -1;
    while (lo <= hi) {
      const m = (lo + hi) >> 1;
      if (key(arr[m]) <= x) { ans = m; lo = m + 1; } else hi = m - 1;
    }
    return ans;
  }

  // ---------- 1. BIAS W (PA3) ----------
  function tinhBiasW(d) {
    // Gom nến D thành tuần bắt đầu Thứ Hai (UTC)
    const tuan = [];
    for (const b of d) {
      const day = Math.floor(b.t / DAY);
      const mon = (day - ((day + 3) % 7)) * DAY;
      const cur = tuan[tuan.length - 1];
      if (!cur || cur.t !== mon) tuan.push({ t: mon, c: b.c });
      else cur.c = b.c;
    }
    const cb = chiBao(tuan);
    const n = tuan.length;
    const hopLe = new Array(n).fill(false), method = new Array(n).fill(''), batDau = new Array(n).fill(null);
    let state = 0, entered = false, cdh = false, m = '', since = null;

    const tryReset = (r, l1, l2, l3, spreadOk, gateOk, t) => {
      if (!gateOk) return { s: r >= l1 ? 1 : 0, ent: false, m: '' };
      const dk5 = (l3 - r) <= P.near3;
      if (r >= l1) {
        if (r >= l2) return { s: 3, ent: true, m: 'min2lines' };
        if ((l2 - r) <= P.nearNext && spreadOk) return { s: 3, ent: true, m: 'gan_duong_tiep_theo' };
        if (dk5) return { s: 3, ent: true, m: 'gan_L3_tong_quat' };
        return { s: 1, ent: false, m: '' };
      }
      if ((l1 - r) <= P.near1 && (l2 - r) <= P.near2 && spreadOk) return { s: 3, ent: false, m: 'gan_cum_dan_dat' };
      if (dk5) return { s: 3, ent: false, m: 'gan_L3_tong_quat' };
      return { s: 0, ent: false, m: '' };
    };

    for (let i = 0; i < n; i++) {
      const l1 = cb.L1[i], l2 = cb.L2[i], l3 = cb.L3[i], l4 = cb.L4[i], r = cb.rsi[i];
      if (Number.isNaN(l1) || Number.isNaN(r)) continue;
      const t = tuan[i].t;
      const spreadOk = (l4 - l1) <= P.maxSpread;
      const bypass = (l4 - l1) <= P.gate22Spread && r > l3 + P.gate22RsiL3Buf;
      let gateOk = true;
      const s20 = cb.p20[i], s55 = cb.p55[i];
      if (!bypass && !Number.isNaN(s20) && !Number.isNaN(s55)) {
        const pc = tuan[i].c, lo = Math.min(s20, s55), hi = Math.max(s20, s55);
        if (pc < lo && (hi - lo) > P.priceGatePct * pc) gateOk = false;
      }
      const before = state;
      if (state === 0) {
        const x = tryReset(r, l1, l2, l3, spreadOk, gateOk);
        state = x.s; entered = x.ent;
        if (state === 3) { m = x.m; since = t; cdh = false; }
      } else if (state === 1) {
        if (r < l1) state = 0;
        else if (!gateOk) { /* giữ 1 */ }
        else if (r >= l2) { state = 3; m = 'min2lines'; entered = true; cdh = false; since = t; }
        else if ((l2 - r) <= P.nearNext && spreadOk) { state = 3; m = 'gan_duong_tiep_theo'; entered = true; cdh = false; since = t; }
        else if ((l3 - r) <= P.near3) { state = 3; m = 'gan_L3_tong_quat'; entered = true; cdh = false; since = t; }
      } else if (state === 3) {
        if (!gateOk) { state = 0; entered = false; cdh = false; }
        else if (!cdh && r >= l4) cdh = true;
        else if (!cdh) {
          if (r >= l1) entered = true;
          else if (entered && r < l1 - P.invalidTol) { state = 0; entered = false; }
          else if (!entered) {
            const dk3 = (l1 - r) <= P.near1 && (l2 - r) <= P.near2;
            const dk5 = (l3 - r) <= P.near3;
            if (!dk3 && !dk5) { state = 0; entered = false; }
          }
        } else if (r < l1 - P.invalidTol) { state = 0; entered = false; cdh = false; }
      }
      if (before !== 0 && state === 0) {
        const x = tryReset(r, l1, l2, l3, spreadOk, gateOk);
        state = x.s; entered = x.ent;
        if (state === 3) { m = x.m; since = t; cdh = false; }
      }
      hopLe[i] = state === 3; method[i] = state === 3 ? m : ''; batDau[i] = state === 3 ? since : null;
    }
    // Bias của tuần i có hiệu lực từ Thứ Hai tuần kế tiếp
    const hieuLuc = tuan.map((w) => w.t + WEEK);
    const biasAt = (t) => {
      const k = viTri(hieuLuc, t, (x) => x);
      return k >= 0 ? hopLe[k] : false;
    };
    const infoAt = (t) => {
      const k = viTri(hieuLuc, t, (x) => x);
      return k >= 0 ? { hopLe: hopLe[k], method: method[k], tu: batDau[k] } : { hopLe: false };
    };
    return { biasAt, infoAt, tuan, rsi: cb.rsi, L: [cb.L1, cb.L2, cb.L3, cb.L4] };
  }

  // ---------- 2. LỆNH D ----------
  function chayD(d, h1, bias, tuNgay) {
    const cb = chiBao(d);
    const trades = [];
    let pos = null; // {entryT, entry, sl, slHist:[{t,sl}]}
    const slPct = (i) => {
      for (let k = Math.max(0, i - P.dOversoldLookback + 1); k <= i; k++) if (cb.rsi[k] < P.dOversoldThresh) return P.dSlOversold;
      if (cb.rsi[i] < cb.L1[i] - P.dInvalidTol) return P.dSlBelow;
      return P.dSlAbove;
    };
    let j = 0; // chỉ số H1
    for (let i = 0; i < d.length; i++) {
      const b = d[i];
      if (b.t < tuNgay) continue;
      if (Number.isNaN(cb.L1[i])) continue;
      const Tc = b.t + DAY;
      if (pos) {
        const sl = cb.basis[i] * (1 - slPct(i) / 100);
        pos.sl = sl; pos.slHist.push({ t: Tc, sl });
      } else if (bias.biasAt(b.t) && cb.rsi[i] >= cb.L4[i] + cb.buf[i] && b.c > cb.basis[i]) {
        const sl = cb.basis[i] * (1 - slPct(i) / 100);
        pos = { leg: 'D', entryT: Tc, entry: b.c, sl, slHist: [{ t: Tc, sl }], method: 'Full breakout D' };
      }
      // Kiểm tra SL theo low từng nến H1 trong ngày kế tiếp
      if (pos) {
        while (j < h1.length && h1[j].t < Tc) j++;
        let k = j;
        while (k < h1.length && h1[k].t < Tc + DAY) {
          if (h1[k].l <= pos.sl) {
            trades.push(dongLenh(pos, h1[k].t, pos.sl, 'SL'));
            pos = null; break;
          }
          k++;
        }
      }
    }
    if (pos) trades.push(dongLenh(pos, null, null, 'DANG_MO'));
    // Mốc tra cứu "D-trailing" theo thời gian
    const dTrailAt = (t) => {
      for (let q = trades.length - 1; q >= 0; q--) {
        const tr = trades[q];
        if (tr.entryT <= t && (tr.exitT === null || t < tr.exitT)) {
          let v = null;
          for (const s of tr.slHist) { if (s.t <= t) v = s.sl; else break; }
          return v;
        }
        if (tr.exitT !== null && tr.exitT <= t) break;
      }
      return null;
    };
    return { trades, dTrailAt };
  }

  function dongLenh(pos, t, gia, lyDo) {
    return {
      leg: pos.leg, method: pos.method, entryT: pos.entryT, entry: pos.entry,
      exitT: t, exit: gia, reason: lyDo, slHist: pos.slHist, attempt: pos.attempt,
      pnlPct: gia === null ? null : ((gia - pos.entry) / pos.entry) * 100,
    };
  }

  // ---------- 3. LỆNH H4 / H8 / H12 ("logic H4") ----------
  function chayMain(ten, gio, main, h1, bias, dTrailAt, tuNgay) {
    const cb = chiBao(main);
    const cbH = chiBao(h1);
    const dur = gio * H;
    const nWin = P.mainOversoldLookback * gio;
    const trades = [];
    let pos = null, breakout = false, waiting = false;

    const h1Idx = (t) => viTri(h1, t);
    const oversold = (endIdx) => { // endIdx bao gồm, lùi nWin nến
      for (let k = Math.max(0, endIdx - nWin + 1); k <= endIdx; k++) if (cbH.rsi[k] < P.mainOversoldThresh) return true;
      return false;
    };
    // Tính SL theo Pha A/B (m = nến MAIN tham chiếu)
    const tinhSL = (m) => {
      const trail1 = cb.basis[m] * (1 - P.mainSlBuf / 100);
      if (main[m].c > cb.p20[m] && main[m].c > cb.p55[m]) pos.phaseB = true;
      const dTrail = dTrailAt(main[m].t);
      if (dTrail !== null && (pos.peak === null || dTrail > pos.peak)) pos.peak = dTrail;
      if (!pos.phaseB) return trail1;
      let cand = (dTrail !== null && dTrail >= pos.entry) ? dTrail : Math.min(trail1, pos.entry);
      if (pos.peak !== null && pos.peak >= pos.entry && pos.peak > cand) return pos.peak;
      return cand;
    };
    const moLenh = (m, t, gia, method) => {
      pos = { leg: ten, entryT: t, entry: gia, phaseB: false, peak: null, sl: 0, slHist: [], method };
      pos.sl = tinhSL(m); pos.slHist.push({ t, sl: pos.sl });
      breakout = true; waiting = false;
    };
    const dongVi = (t, gia, lyDo) => {
      trades.push(dongLenh(pos, t, gia, lyDo));
      pos = null; breakout = false; waiting = false;
    };

    // Bắt đầu từ nến H1 đầu tiên >= tuNgay
    let m = 0;
    while (m < main.length && main[m].t < tuNgay) m++;
    let j = Math.max(2, h1Idx(tuNgay));
    for (; j < h1.length; j++) {
      const T = h1[j].t;
      // (1) Nến MAIN đóng tại T
      while (m < main.length && main[m].t + dur <= T) {
        if (!Number.isNaN(cb.L1[m])) xuLyMain(m, main[m].t + dur);
        m++;
      }
      // (2) Xác nhận qua H1 cho nến H1 vừa đóng (j-1)
      const p = j - 1;
      if (waiting && !pos && bias.biasAt(h1[p].t) && !Number.isNaN(cbH.L4[p]) && !Number.isNaN(cbH.L4[p - 1])) {
        const bo = cbH.rsi[p] >= cbH.L4[p] + cbH.buf[p] && cbH.rsi[p - 1] < cbH.L4[p - 1] + cbH.buf[p - 1];
        if (bo) {
          const ms = viTri(main, h1[p].t); // nến MAIN chứa nến H1 này
          if (ms >= 0 && h1[p].c > cb.basis[ms] && !oversold(p) && h1[p].c > cb.p55[ms]) {
            moLenh(ms, T, h1[p].c, 'Backtest ' + ten + ' → xác nhận H1');
          }
        }
      }
      // (3) Kiểm tra SL trên nến H1 j
      if (pos && h1[j].l <= pos.sl) dongVi(T, pos.sl, 'SL');
    }
    if (pos) trades.push(dongLenh(pos, null, null, 'DANG_MO'));
    return { trades, trangThai: () => ({ breakout, waiting, pos }) };

    function xuLyMain(m, T) {
      const b = main[m];
      const ok = bias.biasAt(b.t);
      if (pos) {
        pos.sl = tinhSL(m); pos.slHist.push({ t: T, sl: pos.sl });
        if (!ok) dongVi(T, b.c, 'Bias W vô hiệu');
        return;
      }
      if (!ok) { breakout = false; waiting = false; return; }
      const r = cb.rsi[m], buf = cb.buf[m];
      const condFull = r >= cb.L4[m] + buf;
      const condB = r >= cb.L2[m] + buf && (cb.L4[m] - r) < P.mainCond2Tol;
      if (condFull || condB) {
        const method = condFull ? 'Full breakout ' + ten : ten + ' vượt 2 đường (gần L4<3đ)';
        if (b.c > cb.basis[m]) {
          const first = h1Idx(b.t);
          if (first >= 0 && oversold(first)) { breakout = true; waiting = false; return; }
          if (!(b.c > cb.p55[m])) { breakout = true; waiting = false; return; }
          moLenh(m, T, b.c, method);
          return;
        }
        breakout = true; waiting = false;
      } else if (breakout && r >= cb.L1[m] && r < cb.L4[m]) {
        waiting = true;
      } else if (r < cb.L1[m]) {
        breakout = false; waiting = false;
      }
    }
  }

  // ---------- 4. TRAP M15 (V4) ----------
  // m15ByEntry: { [giờ vào lệnh D]: mảng nến M15 phủ cửa sổ lệnh D (kèm ~400 nến trước để khởi động chỉ báo) }
  function chayTrap(m15ByEntry, dTrades, dTrailAt) {
    const trades = [];
    for (const dt of dTrades) {
      const seg = m15ByEntry[dt.entryT];
      if (!seg || seg.length < 100) continue;
      const cb = chiBao(seg);
      const end = dt.exitT === null ? Infinity : dt.exitT;
      let state = 'WATCHING', attempts = 0, count = 0, awaiting = false, pos = null;
      let lastIdx = -1;
      for (let i = 1; i < seg.length; i++) {
        const b = seg[i];
        if (b.t < dt.entryT) continue;
        if (b.t >= end) break;
        lastIdx = i;
        const T = b.t + 15 * 60 * 1000; // giờ đóng nến
        // SL trong nến
        if (pos && b.l <= pos.sl) {
          trades.push(dongLenh(pos, b.t, pos.sl, 'SL'));
          pos = null; count = 0; awaiting = false;
          state = attempts >= P.trapMaxTry ? 'DONE' : 'SEARCHING';
          continue; // giống EA: nến này không xét tín hiệu
        }
        if (Number.isNaN(cb.L1[i])) continue;
        const r = cb.rsi[i], L1 = cb.L1[i], L2 = cb.L2[i], L4 = cb.L4[i], buf = cb.buf[i];
        const trail = () => cb.basis[i] * (1 - P.trapSlBuf / 100);
        // (a) đang giữ lệnh trap
        if (pos) {
          if (!pos.phaseB && b.c > cb.p20[i] && b.c > cb.p55[i]) pos.phaseB = true;
          pos.sl = slTrap(pos, trail(), dTrailAt(T)); pos.slHist.push({ t: T, sl: pos.sl });
          continue;
        }
        // (b)
        if (state === 'DONE') continue;
        // (c) rào sàn RSI
        if (state !== 'WATCHING' && r < P.trapRsiFloor) { state = 'WATCHING'; count = 0; awaiting = false; continue; }
        // (d) xác nhận đáy
        let justConfirmed = false;
        if (state === 'SEARCHING' && !awaiting) {
          if (r < L1) count++;
          const dist = cb.wma45[i] - cb.ema9[i];
          if (count >= P.trapMinBelow && dist >= P.trapDistMin) { awaiting = true; justConfirmed = true; }
        }
        // (e) cắt lên để vào
        if (awaiting && (L4 - L1) < P.trapCrossSpreadTol && r >= L2 + buf) {
          awaiting = false;
          if (b.c > cb.basis[i]) {
            attempts++;
            pos = { leg: 'Trap', entryT: T, entry: b.c, phaseB: false, sl: 0, slHist: [], method: 'Trap M15 lần ' + attempts, attempt: attempts };
            pos.sl = slTrap(pos, trail(), dTrailAt(T)); pos.slHist.push({ t: T, sl: pos.sl });
          } else state = 'SEARCHING';
          continue;
        }
        // (f) đỉnh RSI > 80
        if (r > 80 && !justConfirmed) { state = 'WAIT_PULLBACK'; count = 0; awaiting = false; continue; }
        // (g) chờ pullback
        if (state === 'WAIT_PULLBACK' && r < L4) { state = 'SEARCHING'; count = 0; }
      }
      if (pos) {
        if (dt.exitT === null) trades.push(dongLenh(pos, null, null, 'DANG_MO'));
        else trades.push(dongLenh(pos, dt.exitT, lastIdx >= 0 ? seg[lastIdx].c : pos.entry, 'D đóng'));
      }
    }
    return trades;
  }
  function slTrap(pos, trail1, dTrail) {
    if (!pos.phaseB) return trail1;
    if (dTrail !== null && dTrail >= pos.entry) return dTrail;
    return Math.min(trail1, pos.entry);
  }

  // ---------- CHẠY TOÀN BỘ ----------
  function chay(du, tuyChon = {}) {
    const tuNgay = tuyChon.tuNgay ?? Date.UTC(2020, 0, 1);
    const bias = tinhBiasW(du.d);
    const D = chayD(du.d, du.h1, bias, tuNgay);
    const legs = {};
    for (const [ten, gio, key] of [['H4', 4, 'h4'], ['H8', 8, 'h8'], ['H12', 12, 'h12']]) {
      if (du[key]) legs[ten] = chayMain(ten, gio, du[key], du.h1, bias, D.dTrailAt, tuNgay);
    }
    const trap = du.m15ByEntry ? chayTrap(du.m15ByEntry, D.trades, D.dTrailAt) : [];
    const trades = [...D.trades, ...Object.values(legs).flatMap((x) => x.trades), ...trap]
      .sort((a, b) => a.entryT - b.entryT);
    const now = du.h1.length ? du.h1[du.h1.length - 1].t + H : Date.now();
    const info = bias.infoAt(now);
    const status = {
      bias: info,
      D: D.trades.find((x) => x.exitT === null) || null,
      legs: Object.fromEntries(Object.entries(legs).map(([k, v]) => [k, v.trangThai()])),
      trap: trap.find((x) => x.exitT === null) || null,
    };
    return { trades, status, dTrades: D.trades };
  }

  // Thống kê số lệnh + % cộng đơn theo luồng
  function thongKe(trades) {
    const out = {};
    for (const t of trades) {
      const k = t.leg;
      out[k] = out[k] || { soLenh: 0, dangMo: 0, pnl: 0, thang: 0 };
      out[k].soLenh++;
      if (t.exitT === null) out[k].dangMo++;
      else { out[k].pnl += t.pnlPct; if (t.pnlPct > 0) out[k].thang++; }
    }
    return out;
  }

  const L5 = { P, chay, thongKe, tinhBiasW, chayD, _test: { rsiPy, emaPy, sma, wma, chiBao } };
  if (typeof module !== 'undefined' && module.exports) module.exports = L5;
  else root.L5 = L5;
})(typeof window !== 'undefined' ? window : globalThis);
