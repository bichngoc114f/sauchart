// =====================================================================
//  ea-s1-engine.js — BỘ MÁY TÍNH LỆNH EA S1 (chứng khoán VN, chỉ tính toán)
//  Theo tài liệu "S1-quy-trinh-vao-ra-lenh.md" (bản chốt 08/10/2026).
//  S1 = L5 đổi khung: Bias W→M, D→W, H4→D, H8→2D; bỏ H12, Trap, rào RSI(H1)<20,
//  bỏ nhánh xác nhận H1. Chỉ cần NẾN D (M, W, 2D tự gộp).
//
//  Quy tắc khớp lệnh:
//   - Tín hiệu lấy khi nến đã đóng (14:45) → vào/thoát ở GIÁ MỞ CỬA phiên kế tiếp.
//   - SL kiểm tra theo low nến D; phiên mở cửa dưới SL → thoát ở giá mở cửa.
//   - T+2 (cổ phiếu): phiên vào lệnh = T, chỉ bán được từ phiên T+2. Chạm SL /
//     bias vô hiệu trước đó → thoát ở giá mở cửa phiên T+2. Chỉ số không áp T+2.
//
//  Cần nạp ea-l5-engine.js trước (dùng lại chỉ báo + tham số L5).
//  Đầu vào: d = [{t, o, h, l, c}] nến ngày đã đóng, tăng dần (t = ms UTC 00:00 ngày giao dịch).
//  Đầu ra: { trades, status } — mỗi lệnh: {leg, method, entryT, entry, exitT, exit, reason, slHist:[{t,sl}], pnlPct}
//  Luồng: 'W', 'D', '2D'. Chỉ có lệnh MUA.
// =====================================================================
(function (root) {
  'use strict';

  const L5 = root.L5 || (typeof require !== 'undefined' ? require('./ea-l5-engine.js') : null);
  if (!L5) throw new Error('S1 cần ea-l5-engine.js nạp trước');
  const P = L5.P;
  const chiBao = L5._test.chiBao;
  const DAY = 24 * 3600 * 1000;

  // Tìm vị trí phần tử cuối có giá trị <= x
  function viTri(arr, x) {
    let lo = 0, hi = arr.length - 1, ans = -1;
    while (lo <= hi) {
      const m = (lo + hi) >> 1;
      if (arr[m] <= x) { ans = m; lo = m + 1; } else hi = m - 1;
    }
    return ans;
  }

  // ---------- GỘP KHUNG TỪ NẾN D ----------
  // Mỗi nến gộp: {t, o, h, l, c, i0, i1} — i0/i1 = chỉ số phiên D đầu/cuối
  function gopKhung(d, kieu) {
    const out = [];
    for (let i = 0; i < d.length; i++) {
      const b = d[i];
      let key;
      if (kieu === 'W') { const day = Math.floor(b.t / DAY); key = day - ((day + 3) % 7); } // Thứ Hai
      else if (kieu === 'M') { const x = new Date(b.t); key = x.getUTCFullYear() * 12 + x.getUTCMonth(); }
      else key = Math.floor(i / 2); // 2D: ghép 2 phiên liên tiếp từ phiên đầu dữ liệu
      const cur = out[out.length - 1];
      if (!cur || cur.key !== key) out.push({ key, t: b.t, o: b.o, h: b.h, l: b.l, c: b.c, i0: i, i1: i });
      else { cur.h = Math.max(cur.h, b.h); cur.l = Math.min(cur.l, b.l); cur.c = b.c; cur.i1 = i; }
    }
    return out;
  }
  // Nến gộp đã đóng chưa (nến cuối cùng có thể chưa đủ kỳ)
  function daDong(bars, k, d, kieu) {
    if (k < bars.length - 1) return true;
    const b = bars[k];
    if (kieu === '2D') return b.i1 - b.i0 === 1;
    if (kieu === 'W') return new Date(d[b.i1].t).getUTCDay() === 5; // phiên Thứ Sáu đã đóng
    return false; // tháng hiện tại: coi như chưa đóng
  }

  // ---------- 1. BIAS M (PA3) — máy trạng thái giữ nguyên Bias W của L5 ----------
  function tinhBiasM(d) {
    const thang = gopKhung(d, 'M');
    const cb = chiBao(thang);
    const n = thang.length;
    const hopLe = new Array(n).fill(false), method = new Array(n).fill(''), batDau = new Array(n).fill(null);
    let state = 0, entered = false, cdh = false, m = '', since = null;

    const tryReset = (r, l1, l2, l3, spreadOk, gateOk) => {
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
      const t = thang[i].t;
      const spreadOk = (l4 - l1) <= P.maxSpread;
      const bypass = (l4 - l1) <= P.gate22Spread && r > l3 + P.gate22RsiL3Buf;
      let gateOk = true;
      const s20 = cb.p20[i], s55 = cb.p55[i];
      if (!bypass && !Number.isNaN(s20) && !Number.isNaN(s55)) {
        const pc = thang[i].c, lo = Math.min(s20, s55), hi = Math.max(s20, s55);
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
    // Bias tháng k có hiệu lực từ phiên đầu tiên của tháng kế tiếp (chỉ số phiên D)
    const hieuLuc = thang.map((x) => x.i1 + 1);
    const k = (i) => viTri(hieuLuc, i);
    const biasAt = (i) => { const q = k(i); return q >= 0 ? hopLe[q] : false; };
    const infoAt = (i) => { const q = k(i); return q >= 0 ? { hopLe: hopLe[q], method: method[q], tu: batDau[q] } : { hopLe: false }; };
    return { biasAt, infoAt, thang, cb };
  }

  // ---------- KHỚP LỆNH CHUNG (vào/thoát ở giá mở, SL theo low, T+2) ----------
  function boKhop(leg, d, t2, tOf) {
    const trades = [];
    const S = { pos: null, cho: null };
    const dong = (i, gia, lyDo) => {
      const p = S.pos;
      trades.push({
        leg, method: p.method, entryT: tOf(p.eIdx), entry: p.entry, exitT: tOf(i), exit: gia, reason: lyDo,
        slHist: p.slHist.map((s) => ({ t: tOf(s.idx), sl: s.sl })), pnlPct: ((gia - p.entry) / p.entry) * 100,
        eIdx: p.eIdx, xIdx: i, _slIdx: p.slHist,
      });
      S.pos = null;
    };
    // Đầu phiên i: vào lệnh đang chờ, xử lý thoát đang chờ, kiểm tra SL
    const dauPhien = (i, taoViThe) => {
      if (S.cho && S.cho.idx === i) { S.pos = taoViThe(S.cho, i); S.cho = null; }
      const p = S.pos;
      if (!p) return;
      const banDuoc = !t2 || i >= p.eIdx + 2;
      if (!banDuoc) {
        if (!p.exitReq && d[i].l <= p.sl) p.exitReq = 'SL (chờ hàng về T+2)';
        return;
      }
      if (p.exitReq) return dong(i, d[i].o, p.exitReq);
      if (d[i].o <= p.sl) return dong(i, d[i].o, 'SL (mở cửa dưới SL)');
      if (d[i].l <= p.sl) return dong(i, p.sl, 'SL');
    };
    const ketThuc = () => {
      if (S.pos) {
        const p = S.pos;
        trades.push({
          leg, method: p.method, entryT: tOf(p.eIdx), entry: p.entry, exitT: null, exit: null,
          reason: p.exitReq ? 'CHO_THOAT: ' + p.exitReq : 'DANG_MO',
          slHist: p.slHist.map((s) => ({ t: tOf(s.idx), sl: s.sl })), pnlPct: null, eIdx: p.eIdx, xIdx: null, _slIdx: p.slHist,
        });
      }
    };
    return { S, trades, dauPhien, ketThuc };
  }

  // ---------- 2. LỆNH W (thay lệnh D của L5) ----------
  function chayW(d, bias, i0, t2, tOf) {
    const w = gopKhung(d, 'W');
    const cb = chiBao(w);
    const slPct = (k) => {
      for (let q = Math.max(0, k - P.dOversoldLookback + 1); q <= k; q++) if (cb.rsi[q] < P.dOversoldThresh) return P.dSlOversold;
      if (cb.rsi[k] < cb.L1[k] - P.dInvalidTol) return P.dSlBelow;
      return P.dSlAbove;
    };
    const slW = (k) => cb.basis[k] * (1 - slPct(k) / 100);
    const dongTai = new Map(); // chỉ số phiên đóng nến W → chỉ số nến W
    w.forEach((b, k) => { if (daDong(w, k, d, 'W')) dongTai.set(b.i1, k); });
    const X = boKhop('W', d, t2, tOf);
    const taoViThe = (cho, i) => {
      const sl = slW(cho.m);
      return { method: cho.method, eIdx: i, entry: d[i].o, sl, slHist: [{ idx: i, sl }], exitReq: null };
    };
    for (let i = 0; i < d.length; i++) {
      X.dauPhien(i, taoViThe);
      const k = dongTai.get(i);
      if (k === undefined || i < i0 || Number.isNaN(cb.L1[k])) continue;
      const p = X.S.pos;
      if (p) {
        if (!p.exitReq) { p.sl = slW(k); p.slHist.push({ idx: i + 1, sl: p.sl }); }
      } else if (!X.S.cho && bias.biasAt(w[k].i0) && cb.rsi[k] >= cb.L4[k] + cb.buf[k] && w[k].c > cb.basis[k]) {
        X.S.cho = { idx: i + 1, m: k, method: 'Full breakout W' };
      }
    }
    X.ketThuc();
    // W-trailing đang có hiệu lực ở phiên i (null nếu W không mở lệnh)
    const wTrailAt = (i) => {
      for (let q = X.trades.length - 1; q >= 0; q--) {
        const tr = X.trades[q];
        if (tr.eIdx <= i && (tr.xIdx === null || i < tr.xIdx)) {
          let v = null;
          for (const s of tr._slIdx) { if (s.idx <= i) v = s.sl; else break; }
          return v;
        }
        if (tr.xIdx !== null && tr.xIdx <= i) break;
      }
      return null;
    };
    return { trades: X.trades, wTrailAt, cho: X.S.cho, w, cb };
  }

  // ---------- 3. LỆNH D / 2D (thay H4 / H8 của L5) ----------
  function chayMain(ten, d, bias, wTrailAt, i0, t2, tOf) {
    const kieu = ten === 'D' ? 'D' : '2D';
    const main = kieu === 'D' ? d.map((b, i) => ({ ...b, i0: i, i1: i })) : gopKhung(d, '2D');
    const cb = chiBao(main);
    const dongTai = new Map();
    main.forEach((b, k) => { if (kieu === 'D' || daDong(main, k, d, '2D')) dongTai.set(b.i1, k); });
    const X = boKhop(ten, d, t2, tOf);

    // SL Pha A/B (giữ nguyên L5, D-trailing → W-trailing)
    const tinhSL = (p, m) => {
      const trail1 = cb.basis[m] * (1 - P.mainSlBuf / 100);
      if (main[m].c > cb.p20[m] && main[m].c > cb.p55[m]) p.phaseB = true;
      const wTrail = wTrailAt(main[m].i0);
      if (wTrail !== null && (p.peak === null || wTrail > p.peak)) p.peak = wTrail;
      if (!p.phaseB) return trail1;
      const cand = (wTrail !== null && wTrail >= p.entry) ? wTrail : Math.min(trail1, p.entry);
      if (p.peak !== null && p.peak >= p.entry && p.peak > cand) return p.peak;
      return cand;
    };
    const taoViThe = (cho, i) => {
      const p = { method: cho.method, eIdx: i, entry: d[i].o, phaseB: false, peak: null, sl: 0, slHist: [], exitReq: null };
      p.sl = tinhSL(p, cho.m); p.slHist.push({ idx: i, sl: p.sl });
      return p;
    };
    let tinHieuCuoi = null; // để hiện trạng thái
    for (let i = 0; i < d.length; i++) {
      X.dauPhien(i, taoViThe);
      const m = dongTai.get(i);
      if (m === undefined || i < i0 || Number.isNaN(cb.L1[m])) continue;
      const ok = bias.biasAt(main[m].i0);
      const p = X.S.pos;
      if (p) {
        if (!p.exitReq) {
          p.sl = tinhSL(p, m); p.slHist.push({ idx: i + 1, sl: p.sl });
          if (!ok) p.exitReq = 'Bias M vô hiệu';
        }
        continue;
      }
      if (X.S.cho || !ok) continue;
      const r = cb.rsi[m], buf = cb.buf[m];
      const condFull = r >= cb.L4[m] + buf;
      const condB = r >= cb.L2[m] + buf && (cb.L4[m] - r) < P.mainCond2Tol;
      if (!(condFull || condB)) continue;
      const c = main[m].c;
      if (c > cb.basis[m] && c > cb.p55[m]) {
        X.S.cho = { idx: i + 1, m, method: condFull ? 'Full breakout ' + ten : ten + ' vượt 2 đường (gần L4<3đ)' };
      } else tinHieuCuoi = { i, lyDo: c > cb.basis[m] ? 'bị chặn bởi gate SMA55' : 'giá dưới basis_min' };
    }
    X.ketThuc();
    return { trades: X.trades, cho: X.S.cho, tinHieuCuoi };
  }

  // ---------- CHẠY TOÀN BỘ ----------
  // tuyChon: { tuNgay (ms), chiSo: true nếu là chỉ số (không áp T+2) }
  function chay(d, tuyChon = {}) {
    const chiSo = !!tuyChon.chiSo;
    const tuNgay = tuyChon.tuNgay ?? (chiSo ? Date.UTC(2018, 0, 1) : Date.UTC(2016, 0, 1));
    const t2 = !chiSo;
    const n = d.length;
    // Thời gian của phiên idx (idx = n là "phiên kế tiếp" chưa có)
    const tOf = (idx) => {
      if (idx < n) return d[idx].t;
      let t = d[n - 1].t + DAY;
      while ([0, 6].includes(new Date(t).getUTCDay())) t += DAY;
      return t;
    };
    let i0 = 0;
    while (i0 < n && d[i0].t < tuNgay) i0++;
    const bias = tinhBiasM(d);
    const W = chayW(d, bias, i0, t2, tOf);
    const D = chayMain('D', d, bias, W.wTrailAt, i0, t2, tOf);
    const D2 = chayMain('2D', d, bias, W.wTrailAt, i0, t2, tOf);
    const sach = (tr) => { const { eIdx, xIdx, _slIdx, ...x } = tr; return x; };
    const trades = [...W.trades, ...D.trades, ...D2.trades].map(sach).sort((a, b) => a.entryT - b.entryT);

    const trangThai = (leg, cho) => {
      const mo = trades.find((x) => x.leg === leg && x.exitT === null);
      return {
        pos: mo ? { price: mo.entry, sl: mo.slHist.length ? mo.slHist[mo.slHist.length - 1].sl : null, choThoat: mo.reason.startsWith('CHO_THOAT') ? mo.reason.slice(11) : null } : null,
        choVao: cho ? { phien: tOf(cho.idx), method: cho.method } : null, // vào ở giá mở phiên này
      };
    };
    const info = bias.infoAt(n);
    return {
      trades,
      status: {
        bias: info,
        legs: { W: trangThai('W', W.cho), D: trangThai('D', D.cho), '2D': trangThai('2D', D2.cho) },
        phienCuoi: n ? d[n - 1].t : null,
        t2,
      },
    };
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

  const S1 = { chay, thongKe, tinhBiasM, gopKhung };
  if (typeof module !== 'undefined' && module.exports) module.exports = S1;
  else root.S1 = S1;
})(typeof window !== 'undefined' ? window : globalThis);
