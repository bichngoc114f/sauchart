"""Fetch OHLCV daily — sources: TCBS / Yahoo Finance / VNDirect / Stooq / Entrade"""
import urllib.request, json, time, os, io, csv
from datetime import datetime, timezone

SYMBOLS = [
    ('VNINDEX', 'index'), ('VN30', 'index'),
    ('ACB', 'stock'), ('BCM', 'stock'), ('BID', 'stock'), ('BVH', 'stock'),
    ('CTG', 'stock'), ('FPT', 'stock'), ('GAS', 'stock'), ('GVR', 'stock'),
    ('HDB', 'stock'), ('HPG', 'stock'), ('MBB', 'stock'), ('MSN', 'stock'),
    ('MWG', 'stock'), ('NVL', 'stock'), ('PDR', 'stock'), ('PLX', 'stock'),
    ('PNJ', 'stock'), ('POW', 'stock'), ('SAB', 'stock'), ('SHB', 'stock'),
    ('SSI', 'stock'), ('STB', 'stock'), ('TCB', 'stock'), ('TPB', 'stock'),
    ('VCB', 'stock'), ('VHM', 'stock'), ('VIC', 'stock'), ('VJC', 'stock'),
    ('VNM', 'stock'), ('VPB', 'stock'),
]

NOW  = int(time.time())
FROM = NOW - 4 * 365 * 24 * 3600
os.makedirs('data', exist_ok=True)

BROWSER_HDR = {
    'User-Agent': ('Mozilla/5.0 (Windows NT 10.0; Win64; x64) '
                   'AppleWebKit/537.36 (KHTML, like Gecko) '
                   'Chrome/125.0.0.0 Safari/537.36'),
    'Accept': 'application/json, */*',
    'Accept-Language': 'vi-VN,vi;q=0.9,en;q=0.8',
}

def fetch_json(url, extra=None):
    h = dict(BROWSER_HDR)
    if extra:
        h.update(extra)
    req = urllib.request.Request(url, headers=h)
    with urllib.request.urlopen(req, timeout=25) as r:
        return json.loads(r.read())

def _date_ts(s):
    """'2024-01-02' or '2024-01-02T00:00:00...' → midnight UTC"""
    d = str(s)[:10]
    return int(datetime(int(d[:4]), int(d[5:7]), int(d[8:10]),
                        tzinfo=timezone.utc).timestamp())

def _v(item, *keys):
    for k in keys:
        if k in item and item[k] is not None:
            return item[k]
    return 0

def try_tcbs(symbol, loai):
    if loai == 'index':
        url = (f"https://apipubaws.tcbs.com.vn/stock-insight/v1/index/bars-long-term"
               f"?ticker={symbol}&type=index&resolution=D&from={FROM}&to={NOW}")
    else:
        url = (f"https://apipubaws.tcbs.com.vn/stock-insight/v1/stock/bars-long-term"
               f"?ticker={symbol}&type=stock&resolution=D&from={FROM}&to={NOW}")
    d = fetch_json(url)
    items = d.get('data') or []
    if not items:
        return None
    # Debug: print first item structure once per symbol
    print(f"  TCBS sample: {json.dumps(items[0])[:120]}")
    t, o, h, l, c, v = [], [], [], [], [], []
    for item in items:
        td = _v(item, 'tradingDate', 'date')
        if not td:
            continue
        try:
            ts = _date_ts(td) if isinstance(td, str) else int(td)
        except Exception:
            continue
        close = _v(item, 'close', 'closePrice', 'c')
        if not close:
            continue
        t.append(ts)
        o.append(_v(item, 'open', 'openPrice', 'o') or close)
        h.append(_v(item, 'high', 'highPrice', 'h') or close)
        l.append(_v(item, 'low', 'lowPrice', 'l') or close)
        c.append(close)
        v.append(_v(item, 'volume', 'dealVolume', 'totalVolume', 'v'))
    return {'t': t, 'o': o, 'h': h, 'l': l, 'c': c, 'v': v} if len(t) >= 10 else None

def try_yahoo(symbol, loai):
    yf = f'%5E{symbol}' if loai == 'index' else f'{symbol}.VN'
    url = (f"https://query1.finance.yahoo.com/v8/finance/chart/{yf}"
           f"?period1={FROM}&period2={NOW}&interval=1d&includePrePost=false")
    d = fetch_json(url, {
        'Referer': 'https://finance.yahoo.com/',
        'Origin':  'https://finance.yahoo.com',
    })
    res = (d.get('chart', {}).get('result') or [None])[0]
    if not res:
        return None
    ts_list = res.get('timestamp') or []
    q = (res.get('indicators', {}).get('quote') or [{}])[0]
    opens  = q.get('open',   [])
    highs  = q.get('high',   [])
    lows   = q.get('low',    [])
    closes = q.get('close',  [])
    vols   = q.get('volume', [])
    t, o, h, l, c, v = [], [], [], [], [], []
    for i, ts in enumerate(ts_list):
        if i >= len(closes) or closes[i] is None:
            continue
        t.append(ts)
        o.append(opens[i]  if opens  and opens[i]  is not None else closes[i])
        h.append(highs[i]  if highs  and highs[i]  is not None else closes[i])
        l.append(lows[i]   if lows   and lows[i]   is not None else closes[i])
        c.append(closes[i])
        v.append(vols[i]   if vols   and vols[i]   is not None else 0)
    return {'t': t, 'o': o, 'h': h, 'l': l, 'c': c, 'v': v} if len(t) >= 10 else None

def try_finfo(symbol, loai):
    # VNDirect finfo API — hỗ trợ cả cổ phiếu lẫn index (VNINDEX, VN30)
    url = (f"https://finfo-api.vndirect.com.vn/v4/stock_prices/"
           f"?symbol={symbol}&sort=date&size=1500&page=0")
    h = dict(BROWSER_HDR)
    h.update({'Origin': 'https://www.vndirect.com.vn',
              'Referer': 'https://www.vndirect.com.vn/'})
    req = urllib.request.Request(url, headers=h)
    with urllib.request.urlopen(req, timeout=8) as r:
        d = json.loads(r.read())
    items = d.get('data') or []
    if not items:
        return None
    t, o, h, l, c, v = [], [], [], [], [], []
    for item in items:
        date_str = item.get('date', '')
        if len(date_str) < 10:
            continue
        try:
            ts = _date_ts(date_str)
            close = item.get('close') or item.get('adClose')
            if not close:
                continue
            t.append(ts)
            o.append(item.get('open') or close)
            h.append(item.get('high') or close)
            l.append(item.get('low') or close)
            c.append(float(close))
            v.append(item.get('volume') or 0)
        except Exception:
            continue
    # finfo trả về mới nhất trước, cần đảo ngược
    t.reverse(); o.reverse(); h.reverse(); l.reverse(); c.reverse(); v.reverse()
    return {'t': t, 'o': o, 'h': h, 'l': l, 'c': c, 'v': v} if len(t) >= 10 else None

def try_stooq(symbol, loai):
    # Stooq CSV: cổ phiếu → acb.vn; index → thử nhiều ticker khác nhau
    if loai == 'index':
        candidates = [symbol.lower(), f"%5e{symbol.lower()}", f"{symbol.lower()}.vn"]
    else:
        candidates = [f"{symbol.lower()}.vn"]
    for stooq_sym in candidates:
        url = f"https://stooq.com/q/d/l/?s={stooq_sym}&i=d"
        try:
            result = _stooq_fetch(stooq_sym, url)
            if result:
                return result
            print(f"  Stooq {stooq_sym}: no valid CSV data")
        except Exception as e:
            print(f"  Stooq {stooq_sym}: {e}")
    return None

def _stooq_fetch(stooq_sym, url):
    req = urllib.request.Request(url, headers=BROWSER_HDR)
    with urllib.request.urlopen(req, timeout=20) as r:
        content = r.read().decode('utf-8')
    reader = csv.DictReader(io.StringIO(content))
    rows = list(reader)
    if not rows or 'Date' not in (rows[0] if rows else {}):
        return None
    t, o, h, l, c, v = [], [], [], [], [], []
    for row in sorted(rows, key=lambda r: r.get('Date', '')):
        d = row.get('Date', '')
        if len(d) < 10:
            continue
        try:
            ts = int(datetime(int(d[:4]), int(d[5:7]), int(d[8:10]),
                              tzinfo=timezone.utc).timestamp())
            o.append(float(row.get('Open') or 0))
            h.append(float(row.get('High') or 0))
            l.append(float(row.get('Low') or 0))
            close = float(row.get('Close') or 0)
            if not close:
                continue
            t.append(ts)
            c.append(close)
            v.append(float(row.get('Volume') or 0))
        except Exception:
            continue
    return {'t': t, 'o': o, 'h': h, 'l': l, 'c': c, 'v': v} if len(t) >= 10 else None

def try_entrade(symbol, loai):
    url = (f"https://services.entrade.com.vn/chart-api/v2/charts/{loai}"
           f"?symbol={symbol}&resolution=D&from={FROM}&to={NOW}")
    d = fetch_json(url, {
        'Referer': 'https://entrade.com.vn/',
        'Origin':  'https://entrade.com.vn',
    })
    if d.get('t') and len(d['t']) >= 10:
        return {'t': d['t'], 'o': d['o'], 'h': d['h'],
                'l': d['l'], 'c': d['c'], 'v': d.get('v', [])}
    return None

SOURCES = [('TCBS', try_tcbs), ('Yahoo', try_yahoo), ('Finfo', try_finfo), ('Stooq', try_stooq), ('Entrade', try_entrade)]

ok_count = 0
for symbol, loai in SYMBOLS:
    result = None
    for src_name, src_fn in SOURCES:
        try:
            result = src_fn(symbol, loai)
            if result:
                print(f"OK  {symbol:10s}  {len(result['t'])} bars  [{src_name}]")
                break
        except Exception as e:
            print(f"TRY {symbol:10s}  [{src_name}] {e}")

    if result:
        with open(f"data/{symbol}.json", 'w') as f:
            json.dump(result, f, separators=(',', ':'))
        ok_count += 1
    else:
        print(f"FAIL {symbol}")
    time.sleep(0.3)

print(f"\nXong: {ok_count}/{len(SYMBOLS)} mã thành công")
if ok_count < len(SYMBOLS) // 2:
    raise SystemExit(f"Quá nhiều lỗi: {ok_count}/{len(SYMBOLS)}")
