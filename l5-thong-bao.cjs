// =====================================================================
//  l5-thong-bao.cjs — GỬI THÔNG BÁO TELEGRAM CHO EA L5 (crypto, chạy trên GitHub Actions)
//  Chạy MỖI GIỜ:
//   1. Tải nến Binance + chạy L5 cho BTCUSDT, ETHUSDT, PAXGUSDT (dùng đúng ea-l5-data.js + ea-l5-engine.js như app).
//   2. Lệnh nào VÀO hoặc THOÁT kể từ lần chạy trước → gửi tin ngay.
//   3. Lần chạy đầu tiên sau 07:00 giờ VN mỗi ngày (nến D vừa đóng) → gửi tin TÓM TẮT.
//  Trạng thái (lần chạy trước, ngày đã tóm tắt) lưu ở thư mục .l5-state (GitHub cache giữ giữa các lần chạy).
//  Cần 2 secret: TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID.
// =====================================================================
'use strict';
const fs = require('fs');
globalThis.L5 = require('./ea-l5-engine.js');
require('./ea-l5-data.js'); // gắn globalThis.L5Data (không có IndexedDB → tự chạy không cache)

const DS_MA = [['BTCUSDT', 'BTC'], ['ETHUSDT', 'ETH'], ['PAXGUSDT', 'Vàng (PAXG)']];
const TOKEN = process.env.TELEGRAM_BOT_TOKEN || '';
const CHAT = process.env.TELEGRAM_CHAT_ID || '';
const THU = process.env.THU === 'true'; // chạy tay: gửi tóm tắt + lệnh 24 giờ qua
const FILE_TT = '.l5-state/state.json';
const H = 3600e3, VN = 7 * H;

const gioVN = (t) => { const x = new Date(t + VN); return `${String(x.getUTCHours()).padStart(2, '0')}:${String(x.getUTCMinutes()).padStart(2, '0')} ${String(x.getUTCDate()).padStart(2, '0')}/${String(x.getUTCMonth() + 1).padStart(2, '0')}`; };
const ngayVN = (t) => { const x = new Date(t + VN); return `${String(x.getUTCDate()).padStart(2, '0')}/${String(x.getUTCMonth() + 1).padStart(2, '0')}/${x.getUTCFullYear()}`; };
const gia = (v) => (v >= 100 ? (+v).toLocaleString('en-US', { maximumFractionDigits: 1 }) : (+v).toFixed(2));
const pct = (v) => (v >= 0 ? '+' : '') + v.toFixed(1) + '%';

function docTT() { try { return JSON.parse(fs.readFileSync(FILE_TT, 'utf8')); } catch (e) { return {}; } }
function ghiTT(tt) { fs.mkdirSync('.l5-state', { recursive: true }); fs.writeFileSync(FILE_TT, JSON.stringify(tt)); }

async function gui(text) {
  if (!TOKEN || !CHAT) { console.log('----- (không có token, chỉ in) -----\n' + text); return; }
  const r = await fetch(`https://api.telegram.org/bot${TOKEN}/sendMessage`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: CHAT, text: text.slice(0, 4000), parse_mode: 'HTML', disable_web_page_preview: true }),
  });
  if (!r.ok) throw new Error('Telegram lỗi ' + r.status + ': ' + (await r.text()));
}
async function giaHienTai(ma) {
  for (const h of ['https://data-api.binance.vision', 'https://api.binance.com']) {
    try { const r = await fetch(`${h}/api/v3/ticker/price?symbol=${ma}`); if (r.ok) return +(await r.json()).price; } catch (e) { /* thử host sau */ }
  }
  return null;
}

// Lệnh vào / thoát trong khoảng (tu, den]
function suKien(ma, ten, kq, tu, den) {
  const out = [];
  for (const t of kq.trades) {
    if (t.entryT > tu && t.entryT <= den) {
      const sl = t.slHist.length ? t.slHist[0].sl : null;
      out.push({ t: t.entryT, text: `🟢 <b>${ten}</b> ${t.leg}: MUA @${gia(t.entry)} lúc ${gioVN(t.entryT)} · SL ${sl === null ? '–' : gia(sl)}\n   (${t.method})` });
    }
    if (t.exitT !== null && t.exitT > tu && t.exitT <= den) {
      out.push({ t: t.exitT, text: `🔴 <b>${ten}</b> ${t.leg}: THOÁT @${gia(t.exit)} lúc ${gioVN(t.exitT)} (${t.reason}) · ${pct(t.pnlPct)}\n   Vào ${gioVN(t.entryT)} @${gia(t.entry)}` });
    }
  }
  return out;
}

function tomTat(ds) {
  const out = [`<b>📊 L5 — Tóm tắt sáng ${ngayVN(Date.now())}</b> (nến D đã đóng 07:00)`];
  for (const x of ds) {
    const b = x.kq.status.bias;
    out.push('', `<b>${x.ten}</b> giá ${x.gia ? gia(x.gia) : '–'} · Bias W: ${b.valid ? 'hợp lệ (' + b.method + ')' : 'KHÔNG hợp lệ'}`);
    const mo = x.kq.trades.filter((t) => t.exitT === null);
    if (!mo.length) out.push('  Không giữ lệnh nào.');
    for (const t of mo) {
      const sl = t.slHist.length ? t.slHist[t.slHist.length - 1].sl : null;
      const lai = x.gia ? ' · ' + pct((x.gia / t.entry - 1) * 100) : '';
      out.push(`  ${t.leg} vào ${gioVN(t.entryT)} @${gia(t.entry)} · SL ${sl === null ? '–' : gia(sl)}${lai}`);
    }
  }
  return out.join('\n');
}

async function main() {
  const tt = docTT();
  const now = Date.now();
  // Lần đầu (chưa có trạng thái) hoặc chạy tay: xem lại 24 giờ qua
  const tu = THU || !tt.lanTruoc ? now - 24 * H : tt.lanTruoc;
  const ds = [], loi = [];
  for (const [ma, ten] of DS_MA) {
    try {
      const kq = await L5Data.chayL5(ma, (m) => console.log(ma, m));
      ds.push({ ma, ten, kq, gia: await giaHienTai(ma) });
    } catch (e) { loi.push(ten); console.error(ma, e.message); }
  }
  if (!ds.length) {
    // Báo lỗi tối đa 6 giờ/lần để khỏi gửi liên tục
    if (!tt.baoLoi || now - tt.baoLoi > 6 * H) { await gui('❗ <b>L5</b>: không tải được dữ liệu Binance. Có thể máy chủ đang chặn, sẽ tự thử lại mỗi giờ.'); tt.baoLoi = now; }
    ghiTT(tt); process.exitCode = 1; return;
  }
  // 1. Lệnh vào/thoát mới
  const sk = ds.flatMap((x) => suKien(x.ma, x.ten, x.kq, tu, now)).sort((a, b) => a.t - b.t);
  if (sk.length) await gui(`<b>⚡ L5 — Lệnh mới</b>\n` + sk.map((s) => s.text).join('\n'));
  // 2. Tóm tắt mỗi ngày (lần chạy đầu tiên sau 07:00 VN)
  const homNay = ngayVN(now);
  const daQua7h = new Date(now + VN).getUTCHours() >= 7;
  if (THU || (daQua7h && tt.tomTat !== homNay)) {
    await gui(tomTat(ds) + (loi.length ? `\n\n❗ Không tải được: ${loi.join(', ')}` : ''));
    if (!THU) tt.tomTat = homNay;
  }
  // Chạy tay không dời mốc, để lần chạy tự động sau không bỏ sót lệnh
  if (!THU || !tt.lanTruoc) tt.lanTruoc = now;
  ghiTT(tt);
}
main().catch(async (e) => {
  console.error(e);
  try { await gui('❗ L5 thông báo lỗi: ' + e.message); } catch (_) { /* bỏ qua */ }
  process.exitCode = 1;
});
