// =====================================================================
//  cobo-thong-bao.cjs — THÔNG BÁO TELEGRAM KHI BTC VÀO VÙNG CO BÓ MỚI
//  Chạy MỖI GIỜ trên GitHub Actions (sau khi nến H1 đóng).
//  Công thức (giống tab "Vùng co bó" của Sâu Chart):
//   - Mỗi khung tính 8 SMA trên giá đóng của chính khung: 34,55,89,144,233,377,610,987.
//   - Tại mỗi nến lấy K đường GẦN GIÁ NHẤT (|SMA − close| nhỏ nhất):
//       H12: 4, H8: 5, H4: 6, H2: 7, H1: 8.
//   - độ rộng = (max − min của K đường) / close × 100; co bó khi ≤ NGUONG.
//   - "Vào vùng mới" = nến vừa đóng co bó, nến trước đó không co bó.
//  Trạng thái (nến đã xét của từng khung) lưu ở .cobo-state (GitHub cache).
//  Cần 2 secret: TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID.
// =====================================================================
'use strict';
const fs = require('fs');

const MA = 'BTCUSDT';
const NGUONG = 3.0; // % — Sâu chốt 03/11/2026
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
    const gan = v.map((x) => [Math.abs(x - b.c), x]).sort((a, b) => a[0] - b[0]).slice(0, K).map((x) => x[1]);
    return ((Math.max(...gan) - Math.min(...gan)) / b.c) * 100;
  });
}
const coBo = (w) => w !== null && w <= NGUONG;

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

  const trangThai = () => kq.map((x) => {
    const r = x.w[x.i];
    const ttxt = x.dang ? `CO BÓ từ ${gioVN(batDauVung(x.bars, x.w, x.i))}` : 'không';
    return `${x.k.mau} <b>${x.k.id}</b> (${x.k.K} đường): ${r === null ? '–' : r.toFixed(2) + '%'} · ${ttxt}`;
  }).join('\n');
  const giaNay = kq.find((x) => x.k.id === 'H1').bars.at(-1).c;

  const suKien = kq.flatMap((x) => x.vaoMoi.map((j) => ({ x, j })));
  if (suKien.length) {
    const dong = suKien.map(({ x, j }) => `${x.k.mau} <b>${x.k.id}</b> vào vùng co bó MỚI — nến ${gioVN(x.bars[j].t)}, độ rộng ${x.w[j].toFixed(2)}% (${x.k.K} đường gần giá nhất)`);
    const dangCoBo = kq.filter((x) => x.dang).map((x) => x.k.id);
    await gui(`<b>📐 BTC — Vùng co bó mới</b> (ngưỡng ${NGUONG}%)\n` + dong.join('\n') +
      `\n\nGiá ${gia(giaNay)} · Đang co bó ${dangCoBo.length}/5 khung: ${dangCoBo.join(', ') || '–'}`);
  }
  if (THU) await gui(`<b>📐 BTC — Trạng thái vùng co bó</b> (ngưỡng ${NGUONG}%, giá ${gia(giaNay)})\n` + trangThai());
  ghiTT(tt);
}
main().catch(async (e) => {
  console.error(e);
  try { await gui('❗ Thông báo vùng co bó lỗi: ' + e.message); } catch (_) { /* bỏ qua */ }
  process.exitCode = 1;
});
