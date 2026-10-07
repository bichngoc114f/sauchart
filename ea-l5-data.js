// EA L5 Data — tải nến Binance và gọi engine
// File này chứa logic backtest đã kiểm tra — không sửa
const L5Data = (() => {
  const REST_URLS = [
    'https://data-api.binance.vision',
    'https://api.binance.com',
    'https://api1.binance.com',
  ];

  async function fetchBars(sym, interval, limit) {
    for (const base of REST_URLS) {
      try {
        const r = await fetch(`${base}/api/v3/klines?symbol=${sym}&interval=${interval}&limit=${limit}`);
        if (!r.ok) continue;
        return (await r.json()).map(k => ({
          t: +k[0], o: +k[1], h: +k[2], l: +k[3], c: +k[4], v: +k[5],
        }));
      } catch (e) { /* thử server tiếp theo */ }
    }
    throw new Error(`Không tải được ${interval} cho ${sym}`);
  }

  async function chayL5(sym, onProgress) {
    onProgress?.('Đang tải dữ liệu EA, lần đầu mất khoảng 30 giây...');
    const [b1D, b4H, b8H, b12H, b1H] = await Promise.all([
      fetchBars(sym, '1d',  1000),
      fetchBars(sym, '4h',  1000),
      fetchBars(sym, '8h',  500),
      fetchBars(sym, '12h', 500),
      fetchBars(sym, '1h',  1000),
    ]);
    onProgress?.('Đang tính EA...');
    const { trades, status } = L5Engine.run(b1D, b4H, b8H, b12H, b1H);
    const thongKe = {};
    for (const leg of ['D', 'H4', 'H8', 'H12', 'Trap']) {
      const lt = trades.filter(t => t.leg === leg && t.exitT !== null);
      thongKe[leg] = {
        total: lt.length,
        tongPct: +lt.reduce((s, t) => s + (t.pnlPct || 0), 0).toFixed(2),
        thang: lt.filter(t => (t.pnlPct || 0) > 0).length,
      };
    }
    onProgress?.('EA sẵn sàng');
    return { trades, status, thongKe };
  }

  return { chayL5 };
})();
