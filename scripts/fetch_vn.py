"""Fetch OHLCV daily — sources: TCBS / Yahoo / WiGroup / SSI / FireAnt / VNDirect / Stooq / Entrade"""
import urllib.request, json, time, os, io, csv, http.cookiejar
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

def fetch_json(url, extra=None, timeout=25):
    h = dict(BROWSER_HDR)
    if extra:
        h.update(extra)
    req = urllib.request.Request(url, headers=h)
    with urllib.request.urlopen(req, timeout=timeout) as r:
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

# ── Yahoo crumb cache ────────────────────────────────────────────────────────
_yahoo_opener = None
_yahoo_crumb  = None

def _get_yahoo_crumb():
    global _yahoo_opener, _yahoo_crumb
    if _yahoo_crumb:
        return _yahoo_opener, _yahoo_crumb
    cj = http.cookiejar.CookieJar()
    opener = urllib.request.build_opener(urllib.request.HTTPCookieProcessor(cj))
    opener.addheaders = (list(BROWSER_HDR.items()) +
                         [('Referer', 'https://finance.yahoo.com/')])
    opener.open('https://finance.yahoo.com/', timeout=15)
    with opener.open('https://query1.finance.yahoo.com/v1/test/getcrumb',
                     timeout=15) as r:
        crumb = r.read().decode('utf-8').strip()
    if len(crumb) < 3:
        raise ValueError(f'crumb too short: {crumb!r}')
    print(f'  Yahoo crumb: {crumb[:8]}...')
    _yahoo_opener = opener
    _yahoo_crumb  = crumb
    return opener, crumb

# ────────────────────────────────────────────────────────────────────────────

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

def try_yahoo_crumb(symbol, loai):
    """Yahoo Finance v7 CSV với cookie+crumb — giải quyết lỗi 401"""
    if loai != 'index':
        return None
    try:
        opener, crumb = _get_yahoo_crumb()
    except Exception as e:
        print(f"  Yahoo crumb setup: {e}")
        return None
    for yf in [f'%5E{symbol}', f'{symbol}.VN', symbol]:
        url = (f"https://query1.finance.yahoo.com/v7/finance/download/{yf}"
               f"?period1={FROM}&period2={NOW}&interval=1d&events=history&crumb={crumb}")
        try:
            with opener.open(url, timeout=20) as r:
                content = r.read().decode('utf-8')
            t, o, hi, lo, c, v = [], [], [], [], [], []
            for row in csv.DictReader(io.StringIO(content)):
                d = (row.get('Date') or '')[:10]
                if len(d) < 10:
                    continue
                try:
                    cl = float(row.get('Close') or 0)
                    if not cl or cl != cl:
                        continue
                    ts = int(datetime(int(d[:4]), int(d[5:7]), int(d[8:10]),
                                      tzinfo=timezone.utc).timestamp())
                    t.append(ts); o.append(float(row.get('Open') or cl))
                    hi.append(float(row.get('High') or cl))
                    lo.append(float(row.get('Low') or cl))
                    c.append(cl); v.append(float(row.get('Volume') or 0))
                except Exception:
                    continue
            if len(t) >= 10:
                return {'t': t, 'o': o, 'h': hi, 'l': lo, 'c': c, 'v': v}
            print(f"  Yahoo crumb {yf}: {len(t)} rows")
        except Exception as e:
            print(f"  Yahoo crumb {yf}: {e}")
    return None

def try_cafef(symbol, loai):
    """CafeF LiveData API — portal lớn VN, có thể truy cập qua CDN"""
    if loai != 'index':
        return None
    import datetime as dt
    from urllib.parse import quote
    end   = dt.date.today().strftime('%d/%m/%Y')
    start = (dt.date.today() - dt.timedelta(days=4*365)).strftime('%d/%m/%Y')
    url = (f"https://s.cafef.vn/LiveData/PriceHistoryEx.ashx"
           f"?Symbol={symbol}&StartDate={quote(start)}&EndDate={quote(end)}"
           f"&PageIndex=1&PageSize=1500")
    d = fetch_json(url, {'Referer': 'https://cafef.vn/',
                         'Origin': 'https://cafef.vn'}, timeout=15)
    items = ((d.get('Content') or {}).get('Data') or
             d.get('Data') or d.get('data') or [])
    if len(items) < 10:
        return None
    t, o, h, l, c, v = [], [], [], [], [], []
    for item in reversed(items):
        date_str = str(item.get('Ngay') or item.get('date', ''))[:10]
        # CafeF format: "2026-10-06T00:00:00"
        if 'T' in date_str:
            date_str = date_str[:10]
        if len(date_str) < 10:
            continue
        try:
            ts    = _date_ts(date_str)
            close = float(item.get('GiaDongCua') or item.get('close') or 0)
            if not close:
                continue
            t.append(ts)
            o.append(float(item.get('GiaMoCua')    or item.get('open')  or close))
            h.append(float(item.get('GiaCaoNhat')  or item.get('high')  or close))
            l.append(float(item.get('GiaThapNhat') or item.get('low')   or close))
            c.append(close)
            v.append(float(item.get('KhoiLuongKhopLenh') or
                           item.get('volume') or 0))
        except Exception:
            continue
    return {'t': t, 'o': o, 'h': h, 'l': l, 'c': c, 'v': v} if len(t) >= 10 else None

def try_dnse(symbol, loai):
    """DNSE Securities data API"""
    if loai != 'index':
        return None
    # DNSE dùng ký hiệu "VNI" cho VNINDEX, "VN30" cho VN30
    dnse_sym = 'VNI' if symbol == 'VNINDEX' else symbol
    url = (f"https://services.entrade.com.vn/chart-api/v2/charts/index"
           f"?symbol={dnse_sym}&resolution=D&from={FROM}&to={NOW}")
    d = fetch_json(url, {'Referer': 'https://dnse.com.vn/',
                         'Origin': 'https://dnse.com.vn'}, timeout=15)
    if not d.get('t') or len(d['t']) < 10:
        return None
    return {'t': d['t'], 'o': d['o'], 'h': d['h'],
            'l': d['l'], 'c': d['c'], 'v': d.get('v', [])}

def try_ssi_iboard(symbol, loai):
    """SSI iboard historical price API v2"""
    if loai != 'index':
        return None
    url = (f"https://iboard-query.ssi.com.vn/v2/stock/historical-price"
           f"?symbol={symbol}&resolution=1D&limit=1500&page=1")
    d = fetch_json(url, {'Referer': 'https://iboard.ssi.com.vn/',
                         'Origin': 'https://iboard.ssi.com.vn'}, timeout=15)
    # SSI trả về: {"status": "Success", "data": {"items": [...]}}
    items = ((d.get('data') or {}).get('items') or
             d.get('items') or [])
    if len(items) < 10:
        return None
    t, o, h, l, c, v = [], [], [], [], [], []
    for item in reversed(items):
        date_str = str(item.get('time') or item.get('tradingDate', ''))[:10]
        if len(date_str) < 10:
            continue
        try:
            ts    = _date_ts(date_str)
            close = float(item.get('price') or item.get('closePrice') or
                          item.get('close') or 0)
            if not close:
                continue
            t.append(ts)
            o.append(float(item.get('openPrice')   or item.get('open')  or close))
            h.append(float(item.get('highestPrice') or item.get('high')  or close))
            l.append(float(item.get('lowestPrice')  or item.get('low')   or close))
            c.append(close)
            v.append(float(item.get('totalVolume')  or item.get('volume') or 0))
        except Exception:
            continue
    return {'t': t, 'o': o, 'h': h, 'l': l, 'c': c, 'v': v} if len(t) >= 10 else None

def try_fireant(symbol, loai):
    """FireAnt REST API — cả cổ phiếu lẫn index"""
    if loai != 'index':
        return None
    import datetime as dt
    end   = dt.date.today().strftime('%Y-%m-%d')
    start = (dt.date.today() - dt.timedelta(days=4*365)).strftime('%Y-%m-%d')
    url = (f"https://restv2.fireant.vn/symbols/{symbol}/historical-quotes"
           f"?startDate={start}&endDate={end}&offset=0&limit=1500")
    d = fetch_json(url, {'Referer': 'https://fireant.vn/',
                         'Origin': 'https://fireant.vn'}, timeout=15)
    items = d if isinstance(d, list) else []
    if len(items) < 10:
        return None
    t, o, h, l, c, v = [], [], [], [], [], []
    for item in reversed(items):
        date_str = str(item.get('date', ''))[:10]
        if len(date_str) < 10:
            continue
        try:
            ts    = _date_ts(date_str)
            close = float(item.get('priceClose') or item.get('close') or 0)
            if not close:
                continue
            t.append(ts)
            o.append(float(item.get('priceOpen') or item.get('open') or close))
            h.append(float(item.get('priceHigh') or item.get('high') or close))
            l.append(float(item.get('priceLow')  or item.get('low')  or close))
            c.append(close)
            v.append(float(item.get('totalVolume') or item.get('volume') or 0))
        except Exception:
            continue
    return {'t': t, 'o': o, 'h': h, 'l': l, 'c': c, 'v': v} if len(t) >= 10 else None

def try_yahoo_csv(symbol, loai):
    """Yahoo Finance v7 CSV không crumb — fallback"""
    if loai != 'index':
        return None
    for yf in [f'%5E{symbol}', f'{symbol}.VN', symbol]:
        try:
            url = (f"https://query1.finance.yahoo.com/v7/finance/download/{yf}"
                   f"?period1={FROM}&period2={NOW}&interval=1d&events=history")
            h = dict(BROWSER_HDR)
            h['Referer'] = 'https://finance.yahoo.com/'
            req = urllib.request.Request(url, headers=h)
            with urllib.request.urlopen(req, timeout=20) as r:
                content = r.read().decode('utf-8')
            t, o, hi, lo, c, v = [], [], [], [], [], []
            for row in csv.DictReader(io.StringIO(content)):
                d = (row.get('Date') or '')[:10]
                if len(d) < 10:
                    continue
                try:
                    cl = float(row.get('Close') or 0)
                    if not cl or cl != cl:
                        continue
                    ts = int(datetime(int(d[:4]), int(d[5:7]), int(d[8:10]),
                                      tzinfo=timezone.utc).timestamp())
                    t.append(ts); o.append(float(row.get('Open') or cl))
                    hi.append(float(row.get('High') or cl))
                    lo.append(float(row.get('Low') or cl))
                    c.append(cl); v.append(float(row.get('Volume') or 0))
                except Exception:
                    continue
            if len(t) >= 10:
                return {'t': t, 'o': o, 'h': hi, 'l': lo, 'c': c, 'v': v}
            print(f"  Yahoo CSV {yf}: {len(t)} rows")
        except Exception as e:
            print(f"  Yahoo CSV {yf}: {e}")
    return None

def try_finfo(symbol, loai):
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
    t.reverse(); o.reverse(); h.reverse(); l.reverse(); c.reverse(); v.reverse()
    return {'t': t, 'o': o, 'h': h, 'l': l, 'c': c, 'v': v} if len(t) >= 10 else None

def try_stooq(symbol, loai):
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

SOURCES = [
    ('TCBS',       try_tcbs),
    ('Yahoo',      try_yahoo),
    ('CafeF',      try_cafef),          # CafeF portal VN
    ('DNSE',       try_dnse),           # DNSE/Entrade với ký hiệu VNI
    ('SSI',        try_ssi_iboard),     # SSI iboard v2
    ('FireAnt',    try_fireant),        # FireAnt (index only)
    ('YahooCrumb', try_yahoo_crumb),    # Yahoo v7 CSV + cookie+crumb
    ('YahooCSV',   try_yahoo_csv),
    ('Finfo',      try_finfo),
    ('Stooq',      try_stooq),
    ('Entrade',    try_entrade),
]

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
