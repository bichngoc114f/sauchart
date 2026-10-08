// =====================================================================
//  s1-thong-bao.cjs — GỬI THÔNG BÁO TELEGRAM CHO EA S1 (chạy trên GitHub Actions)
//  Chạy mỗi ngày giao dịch sau 15:30 giờ VN:
//   1. Tải nến D (KBS, dự phòng VPS) cho các mã S1, chạy bộ máy S1 (giống hệt app).
//   2. Gửi 1 tin tổng kết: mã đủ tiêu chuẩn MUA ở giá mở cửa phiên tới; lệnh THOÁT
//      (đã chạm SL hôm nay, hoặc phải bán ở giá mở phiên tới do Bias M vô hiệu / T+2);
//      các lệnh đang giữ + SL cho phiên tới.
//  Cần 2 secret trong GitHub: TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID.
//  Chạy thử trên máy: node s1-thong-bao.cjs   (không có token → chỉ in ra màn hình)
// =====================================================================
'use strict';
globalThis.L5 = require('./ea-l5-engine.js');
const S1 = require('./ea-s1-engine.js');

// Danh sách mã (đã bỏ nhóm dầu khí GAS, PLX, POW)
const CHI_SO = ['VN30', 'VNINDEX'];
const CO_PHIEU = ['ACB', 'BCM', 'BID', 'BVH', 'CTG', 'FPT', 'GVR', 'HDB', 'HPG', 'MBB', 'MSN', 'MWG', 'NVL', 'PDR',
  'PNJ', 'SAB', 'SHB', 'SSI', 'STB', 'TCB', 'TPB', 'VCB', 'VHM', 'VIC', 'VJC', 'VNM', 'VPB'];
const DS_MA = [...CHI_SO, ...CO_PHIEU];

const TOKEN = process.env.TELEGRAM_BOT_TOKEN || '';
const CHAT = process.env.TELEGRAM_CHAT_ID || '';
const THU = process.env.THU === 'true'; // chạy tay: gửi tóm tắt kể cả khi hôm nay không có phiên

const VN = 7 * 3600e3;
const ngayVN = () => { const x = new Date(Date.now() + VN); return Date.UTC(x.getUTCFullYear(), x.getUTCMonth(), x.getUTCDate()); };
const dd = (t) => { const x = new Date(t); return `${String(x.getUTCDate()).padStart(2, '0')}/${String(x.getUTCMonth() + 1).padStart(2, '0')}/${x.getUTCFullYear()}`; };
const gia = (v) => (v >= 1000 ? Math.round(v).toLocaleString('en-US') : (+v).toFixed(2));
const pct = (v) => (v >= 0 ? '+' : '') + v.toFixed(1) + '%';
const cho = (ms) => new Promise((r) => setTimeout(r, ms));

// ---------- Tải dữ liệu ----------
async function layJson(url) {
  for (let lan = 0; lan < 3; lan++) {
    try {
      const r = await fetch(url, { signal: AbortSignal.timeout(20000), headers: { 'User-Agent': 'Mozilla/5.0' } });
      if (r.ok) return await r.json();
    } catch (e) { /* thử lại */ }
    await cho(1500 * (lan + 1));
  }
  throw new Error('không gọi được ' + new URL(url).host);
}
function ngay(s) {
  const m = String(s).match(/(\d{4})-(\d{2})-(\d{2})/);
  return m ? Date.UTC(+m[1], +m[2] - 1, +m[3]) : NaN;
}
async function taiKBS(ma) {
  const x = new Date(Date.now() + VN);
  const den = `${String(x.getUTCDate()).padStart(2, '0')}-${String(x.getUTCMonth() + 1).padStart(2, '0')}-${x.getUTCFullYear()}`;
  const loai = CHI_SO.includes(ma) ? 'index' : 'stocks';
  const j = await layJson(`https://kbbuddywts.kbsec.com.vn/iis-server/investment/${loai}/${ma}/data_day?sdate=01-01-2010&edate=${den}`);
  return (j.data_day || []).map((b) => ({ t: ngay(b.t), o: +b.o, h: +b.h, l: +b.l, c: +b.c }));
}
async function taiVPS(ma) {
  const to = Math.floor(Date.now() / 1000);
  const j = await layJson(`https://histdatafeed.vps.com.vn/tradingview/history?symbol=${ma}&resolution=D&from=${to - 20 * 365 * 86400}&to=${to}`);
  if (!j.t) throw new Error('VPS rỗng');
  return j.t.map((s, i) => ({ t: Math.floor((s + 7 * 3600) / 86400) * 86400000, o: +j.o[i], h: +j.h[i], l: +j.l[i], c: +j.c[i] }));
}
// Giống ea-s1-data.js: sắp xếp, bỏ trùng, bỏ nến hôm nay nếu chưa tới 15:00 giờ VN
function chuanHoa(rows) {
  const map = new Map();
  for (const b of rows) if (Number.isFinite(b.t) && b.c > 0 && b.l > 0) map.set(b.t, b);
  const out = [...map.values()].sort((a, b) => a.t - b.t);
  const gioVN = new Date(Date.now() + VN).getUTCHours();
  if (out.length && out[out.length - 1].t === ngayVN() && gioVN < 15) out.pop();
  return out;
}
async function layNenD(ma) {
  try { const d = await taiKBS(ma); if (d.length > 100) return { d: chuanHoa(d), nguon: 'KBS' }; } catch (e) { /* thử VPS */ }
  return { d: chuanHoa(await taiVPS(ma)), nguon: 'VPS' };
}

// ---------- Telegram ----------
async function gui(text) {
  if (!TOKEN || !CHAT) { console.log('----- (không có token, chỉ in) -----\n' + text); return; }
  // Telegram giới hạn 4096 ký tự/tin → chia theo dòng
  const phan = [];
  let cur = '';
  for (const dong of text.split('\n')) {
    if ((cur + dong).length > 3900) { phan.push(cur); cur = ''; }
    cur += dong + '\n';
  }
  if (cur.trim()) phan.push(cur);
  for (const p of phan) {
    const r = await fetch(`https://api.telegram.org/bot${TOKEN}/sendMessage`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: CHAT, text: p, parse_mode: 'HTML', disable_web_page_preview: true }),
    });
    if (!r.ok) throw new Error('Telegram lỗi ' + r.status + ': ' + (await r.text()));
  }
}

// ---------- Tạo nội dung tin ----------
function phanTich(ma, d) {
  const kq = S1.chay(d, { chiSo: CHI_SO.includes(ma) });
  const phien = d[d.length - 1].t, dong = d[d.length - 1].c;
  const thoatHomNay = kq.trades.filter((t) => t.exitT === phien);
  const dangGiu = kq.trades.filter((t) => t.exitT === null).map((t) => ({
    leg: t.leg, vaoT: t.entryT, vao: t.entry, sl: t.slHist.length ? t.slHist[t.slHist.length - 1].sl : null,
    lai: (dong / t.entry - 1) * 100, choThoat: t.reason.startsWith('CHO_THOAT') ? t.reason.slice(11) : null,
  }));
  const choMua = Object.entries(kq.status.legs).filter(([, v]) => v.choVao).map(([leg, v]) => ({ leg, phien: v.choVao.phien }));
  return { ma, phien, dong, bias: kq.status.bias.hopLe, thoatHomNay, dangGiu, choMua };
}

// Một tin duy nhất sau mỗi phiên: MUA phiên tới → THOÁT → đang giữ
function tinHangNgay(ds, loi) {
  const phien = Math.max(...ds.map((x) => x.phien));
  const out = [`<b>📊 S1 — Tổng kết phiên ${dd(phien)}</b>`];

  // 1. Mã đủ tiêu chuẩn vào lệnh → mua ở giá mở cửa phiên tới
  const mua = ds.filter((x) => x.choMua.length);
  out.push('', `<b>🟢 MUA ở giá mở cửa phiên tới (${mua.length} mã)</b>`);
  if (!mua.length) out.push('Không có mã nào đủ tiêu chuẩn.');
  for (const x of mua) out.push(`<b>${x.ma}</b> (đóng cửa ${gia(x.dong)}): luồng ${x.choMua.map((m) => m.leg).join(', ')}`);

  // 2. Thoát lệnh: đã chạm SL hôm nay + phải bán ở giá mở cửa phiên tới
  const thoat = [];
  for (const x of ds) {
    if (x.phien !== phien) continue;
    for (const t of x.thoatHomNay) thoat.push(`🔴 <b>${x.ma}</b> ${t.leg}: ĐÃ THOÁT hôm nay @${gia(t.exit)} (${t.reason}), ${pct(t.pnlPct)}. Vào ${dd(t.entryT)} @${gia(t.entry)}`);
    for (const g of x.dangGiu.filter((g) => g.choThoat)) thoat.push(`🟠 <b>${x.ma}</b> ${g.leg}: BÁN ở giá mở cửa phiên tới (${g.choThoat}). Vào ${dd(g.vaoT)} @${gia(g.vao)}, hiện ${pct(g.lai)}`);
  }
  out.push('', `<b>🔴 THOÁT LỆNH (${thoat.length})</b>`);
  out.push(...(thoat.length ? thoat : ['Không có lệnh nào chạm ngưỡng thoát.']));

  // 3. Lệnh đang giữ + SL cho phiên tới
  const giu = ds.filter((x) => x.dangGiu.some((g) => !g.choThoat));
  out.push('', `<b>📋 Đang giữ — SL cho phiên tới</b>`);
  if (!giu.length) out.push('Không có lệnh nào.');
  for (const x of giu) {
    const ct = x.dangGiu.filter((g) => !g.choThoat).map((g) => `${g.leg} vào ${dd(g.vaoT)} @${gia(g.vao)} · SL ${g.sl === null ? '–' : gia(g.sl)} · ${pct(g.lai)}`);
    out.push(`<b>${x.ma}</b> (giá ${gia(x.dong)})\n  ` + ct.join('\n  '));
  }

  const bias = ds.filter((x) => x.bias).map((x) => x.ma);
  out.push('', `Bias M hợp lệ (${bias.length}/${ds.length}): ${bias.join(', ') || '–'}`);
  if (loi.length) out.push(`❗ Không tải được: ${loi.join(', ')}`);
  return out.join('\n');
}

// ---------- Chạy ----------
async function main() {
  const ds = [], loi = [];
  for (const ma of DS_MA) {
    try {
      const { d } = await layNenD(ma);
      if (d.length < 100) throw new Error('ít dữ liệu');
      ds.push(phanTich(ma, d));
    } catch (e) { loi.push(ma); console.error(ma, e.message); }
    await cho(300);
  }
  if (!ds.length) {
    await gui(`❗ <b>S1</b>: không tải được dữ liệu mã nào (${dd(ngayVN())}). Có thể máy chủ KBS/VPS chặn IP nước ngoài.`);
    process.exitCode = 1;
    return;
  }
  // Ngày lễ / chưa có phiên hôm nay → không gửi (trừ khi chạy tay)
  const coPhienHomNay = ds.some((x) => x.phien === ngayVN());
  if (!coPhienHomNay && !THU) { console.log('Hôm nay không có phiên mới → không gửi.'); return; }
  await gui(tinHangNgay(ds, loi));
}
main().catch(async (e) => {
  console.error(e);
  try { await gui('❗ S1 thông báo lỗi: ' + e.message); } catch (_) { /* bỏ qua */ }
  process.exitCode = 1;
});
