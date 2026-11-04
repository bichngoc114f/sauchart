// =====================================================================
//  cobo-thong-bao.cjs — THÔNG BÁO TELEGRAM KHI BTC VÀO VÙNG CO BÓ MỚI
//  Chạy MỖI GIỜ trên GitHub Actions (sau khi nến H1 đóng).
//  Công thức (giống tab "Vùng co bó" của Sâu Chart):
//   - Mỗi khung tính 8 SMA trên giá đóng của chính khung: 34,55,89,144,233,377,610,987.
//   - Tại mỗi nến lấy K đường GẦN GIÁ NHẤT (|SMA − close| nhỏ nhất):
//       H12: 4, H8: 5, H4: 6, H2: 7, H1: 8.
//   - độ rộng = (max − min của K đường) / close × 100; co bó khi ≤ NGUONG
//     VÀ khoảng cách giá → SMA gần nhất ≤ KC_GIA (thêm 03/11/2026).
//   - "Vào vùng mới" = nến vừa đóng co bó, nến trước đó không co bó.
//  CO BÓ BB (khung D, thêm 04/11/2026 — giống EA F1):
//   - w3 = (max − min của {close, SMA20, SMA55} nến D) / close × 100; co bó BB khi ≤ NGUONG_BB (4%).
//   - Màu ngày: 🟣 tím = BB + co bó SMA (≥1 nến của 5 khung trong ngày đó, ngày UTC);
//     🟡 vàng = chỉ BB; ⚪ xám = chỉ SMA.
//   - Báo khi nến D vừa đóng (07:00 VN) chuyển sang TÍM hoặc VÀNG (khác màu ngày trước).
//  Trạng thái (nến đã xét của từng khung) lưu ở .cobo-state (GitHub cache).
//  Cần 2 secret: TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID.
// =====================================================================
'use strict';
const fs = require('fs');

const MA = 'BTCUSDT';
const NGUONG = 3.0; // % — Sâu chốt 03/11/2026
const KC_GIA = 3.0; // % — |close − SMA gần nhất| / close tối đa
const NGUONG_BB = 4.0; // % — co bó BB khung D (EA F1)
const D_MS = 24 * 3600e3;
const SMA = [34, 55, 89, 144, 233, 377, 610, 987];
const H = 3600e3, VN = 7 * H;
// Thứ tự hiển thị giống web: H12, H8, H4, H2, H1
const KHUNG = [
  { id: 'H12', iv: '12h', ms: 12 * H, K: 4, mau: '🟦' },
  { id: 'H8', iv: '8h', ms: 8 * H, K: 5, mau: '🟪' },
  { id: 'H4', iv: '4h', ms: 4 * H, K: 6, mau: '🟥' },
  { id: 'H2', iv: '2h', ms: 2 * H, K: 7, mau: '🟧' },
  { id: 'H1', iv: '1h', ms: 1 * H, K: 8, mau: '🟩' },
];
const HOSTS = ['https://data-api.binance.vision', 'https://api.binance.com'];
const TOKEN = process.env.TELEGRAM_BOT_TOKEN || '';
const CHAT = process.env.TELEGRAM_CHAT_ID || '';
const THU = process.env.THU === 'true'; // chạy tay: gửi bảng trạng thái hiện tại
const FILE_TT = '.cobo-state/state.json';

const gioVN = (t) => { const x = new Date(t + VN); return `${String(x.getUTCHours()).padStart(2, '0')}:00 ${String(x.getUTCDate()).padStart(2, '0')}/${String(x.getUTCMonth() + 1).padStart(2, '0')}`; };
const gia = (v) => Math.round(v).toLocaleString('en-US');

// ---------- Dữ liệu ----------
async function goi(iv, endTime) {
  for (const h of HOSTS) {
    try {
      const r = await fetch(`${h}/api/v3/klines?symbol=${MA}&interval=${iv}&limit=1000${endTime ? '&endTime=' + endTime : ''}`, { signal: AbortSignal.timeout(20000) });
      if (r.ok) return (await r.json()).map((k) => ({ t: k[0], c: +k[4] }));
    } catch (e) { /* thử host sau */ }
  }
  throw new Error('không tải được nến ' + iv);
}
// ~2000 nến gần nhất (2 lần gọi), chỉ nến ĐÃ ĐÓNG
async function layNen(k) {
  const moi = await goi(k.iv);
  const cu = await goi(k.iv, moi[0].t - 1);
  const map = new Map();
  for (const b of [...cu, ...moi]) map.set(b.t, b);
  const now = Date.now();
  return [...map.values()].filter((b) => b.t + k.ms <= now).sort((a, b) => a.t - b.t);
}

// ---------- Tính độ rộng ----------
function sma(c, n) {
  const out = new Array(c.length).fill(NaN); let s = 0;
  for (let i = 0; i < c.length; i++) { s += c[i]; if (i >= n) s -= c[i - n]; if (i >= n - 1) out[i] = s / n; }
  return out;
}
function doRong(bars, K) {
  const c = bars.map((b) => b.c);
  const S = SMA.map((p) => sma(c, p));
  return bars.map((b, i) => {
    const v = S.map((x) => x[i]);
    if (v.some(Number.isNaN)) return null;
    const xep = v.map((x) => [Math.abs(x - b.c), x]).sort((a, b) => a[0] - b[0]);
    const gan = xep.slice(0, K).map((x) => x[1]);
    // w = độ rộng K đường gần giá nhất; d = khoảng cách giá → SMA gần nhất (%)
    return { w: ((Math.max(...gan) - Math.min(...gan)) / b.c) * 100, d: (xep[0][0] / b.c) * 100 };
  });
}
const coBo = (x) => x !== null && x.w <= NGUONG && x.d <= KC_GIA;

// Co bó BB khung D: w3 mỗi nến D (null khi chưa đủ SMA55)
function doRongBB(d) {
  const c = d.map((b) => b.c), s20 = sma(c, 20), s55 = sma(c, 55);
  return d.map((b, i) => (Number.isNaN(s55[i]) ? null
    : ((Math.max(b.c, s20[i], s55[i]) - Math.min(b.c, s20[i], s55[i])) / b.c) * 100));
}
const ngayUTC = (t) => Math.floor(t / D_MS) * D_MS;
const ngayVN = (t) => { const x = new Date(t + VN); return `${String(x.getUTCDate()).padStart(2, '0')}/${String(x.getUTCMonth() + 1).padStart(2, '0')}`; };
const TEN_MAU = { tim: '🟣 TÍM (BB + SMA)', vang: '🟡 VÀNG (chỉ BB)', xam: '⚪ xám (chỉ SMA)', khong: 'không' };

// ---------- Telegram + trạng thái ----------
async function gui(text) {
  if (!TOKEN || !CHAT) { console.log('----- (không có token, chỉ in) -----\n' + text); return; }
  const r = await fetch(`https://api.telegram.org/bot${TOKEN}/sendMessage`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: CHAT, text: text.slice(0, 4000), parse_mode: 'HTML' }),
  });
  if (!r.ok) throw new Error('Telegram lỗi ' + r.status + ': ' + (await r.text()));
}
function docTT() { try { return JSON.parse(fs.readFileSync(FILE_TT, 'utf8')); } catch (e) { return {}; } }
function ghiTT(tt) { fs.mkdirSync('.cobo-state', { recursive: true }); fs.writeFileSync(FILE_TT, JSON.stringify(tt)); }

// Nến bắt đầu của vùng đang chạy (lùi về nến đầu tiên co bó liên tục)
function batDauVung(bars, w, i) { let j = i; while (j > 0 && coBo(w[j - 1])) j--; return bars[j].t; }

async function main() {
  const tt = docTT();
  tt.daXet = tt.daXet || {};
  const kq = [];
  for (const k of KHUNG) {
    const bars = await layNen(k);
    const w = doRong(bars, k.K);
    const i = bars.length - 1;
    // Nến mới đóng kể từ lần chạy trước (lần đầu: chỉ xét nến cuối, không báo dồn)
    const truoc = tt.daXet[k.id];
    const vaoMoi = [];
    for (let j = 1; j <= i; j++) {
      const canXet = truoc === undefined ? j === i : bars[j].t > truoc;
      if (canXet && coBo(w[j]) && !coBo(w[j - 1])) vaoMoi.push(j);
    }
    tt.daXet[k.id] = bars[i].t;
    kq.push({ k, bars, w, i, vaoMoi, dang: coBo(w[i]) });
  }

  // ---- Co bó BB khung D ----
  const ngaySMA = new Map(); // ngày UTC → các khung SMA có co bó trong ngày
  for (const x of kq) x.bars.forEach((b, j) => {
    if (!coBo(x.w[j])) return;
    const n = ngayUTC(b.t); if (!ngaySMA.has(n)) ngaySMA.set(n, new Set()); ngaySMA.get(n).add(x.k.id);
  });
  const dBars = await layNen({ iv: '1d', ms: D_MS });
  const w3 = doRongBB(dBars);
  const mauNgay = (j) => {
    const bb = w3[j] !== null && w3[j] <= NGUONG_BB, sm = ngaySMA.has(dBars[j].t);
    return bb && sm ? 'tim' : bb ? 'vang' : sm ? 'xam' : 'khong';
  };
  const iD = dBars.length - 1;
  const truocD = tt.daXet.D;
  const suKienBB = [];
  for (let j = 1; j <= iD; j++) {
    const canXet = truocD === undefined ? j === iD : dBars[j].t > truocD;
    const m = mauNgay(j);
    if (canXet && (m === 'tim' || m === 'vang') && m !== mauNgay(j - 1)) suKienBB.push(j);
  }
  tt.daXet.D = dBars[iD].t;

  const trangThai = () => kq.map((x) => {
    const r = x.w[x.i];
    const ttxt = x.dang ? `CO BÓ từ ${gioVN(batDauVung(x.bars, x.w, x.i))}` : 'không';
    return `${x.k.mau} <b>${x.k.id}</b> (${x.k.K} đường): ${r === null ? '–' : 'rộng ' + r.w.toFixed(2) + '%, cách giá ' + r.d.toFixed(2) + '%'} · ${ttxt}`;
  }).join('\n');
  const giaNay = kq.find((x) => x.k.id === 'H1').bars.at(-1).c;

  const suKien = kq.flatMap((x) => x.vaoMoi.map((j) => ({ x, j })));
  if (suKien.length) {
    const dong = suKien.map(({ x, j }) => `${x.k.mau} <b>${x.k.id}</b> vào vùng co bó MỚI — nến ${gioVN(x.bars[j].t)}, độ rộng ${x.w[j].w.toFixed(2)}%, cách giá ${x.w[j].d.toFixed(2)}% (${x.k.K} đường gần giá nhất)`);
    const dangCoBo = kq.filter((x) => x.dang).map((x) => x.k.id);
    await gui(`<b>📐 BTC — Vùng co bó mới</b> (rộng ≤ ${NGUONG}%, cách giá ≤ ${KC_GIA}%)\n` + dong.join('\n') +
      `\n\nGiá ${gia(giaNay)} · Đang co bó ${dangCoBo.length}/5 khung: ${dangCoBo.join(', ') || '–'}`);
  }
  if (suKienBB.length) {
    const dong = suKienBB.map((j) => {
      const sm = ngaySMA.get(dBars[j].t);
      return `Nến D ${ngayVN(dBars[j].t)} (đóng 07:00): ${TEN_MAU[mauNgay(j)]} · BB rộng ${w3[j].toFixed(2)}%` +
        ` · giá đóng ${gia(dBars[j].c)}` + (sm ? ` · SMA co bó: ${[...sm].join(', ')}` : '');
    });
    await gui(`<b>🟣 BTC — Co bó BB khung D</b> (close/SMA20/SMA55 rộng ≤ ${NGUONG_BB}%)\n` + dong.join('\n'));
  }
  const dongBB = () => {
    const r = w3[iD], homNay = ngaySMA.get(ngayUTC(Date.now()));
    return `🟣 <b>BB D</b> nến ${ngayVN(dBars[iD].t)}: ${r === null ? '–' : 'rộng ' + r.toFixed(2) + '%'} · màu ${TEN_MAU[mauNgay(iD)]}` +
      `\n   Hôm nay (chưa đóng) SMA co bó: ${homNay ? [...homNay].join(', ') : 'chưa'}`;
  };
  if (THU) await gui(`<b>📐 BTC — Trạng thái vùng co bó</b> (SMA: rộng ≤ ${NGUONG}%, cách giá ≤ ${KC_GIA}% · BB D ≤ ${NGUONG_BB}%, giá ${gia(giaNay)})\n` + trangThai() + '\n' + dongBB());
  ghiTT(tt);
}
main().catch(async (e) => {
  console.error(e);
  try { await gui('❗ Thông báo vùng co bó lỗi: ' + e.message); } catch (_) { /* bỏ qua */ }
  process.exitCode = 1;
});
