"""Fetch OHLCV daily từ SSI / Entrade, lưu vào data/{SYMBOL}.json"""
import urllib.request
import json, time, os

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
    'Accept': 'application/json, text/plain, */*',
    'Accept-Language': 'vi-VN,vi;q=0.9,en;q=0.8',
    'Connection': 'keep-alive',
}

def fetch_json(url, extra=None):
    h = dict(BROWSER_HDR)
    if extra:
        h.update(extra)
    req = urllib.request.Request(url, headers=h)
    with urllib.request.urlopen(req, timeout=20) as r:
        return json.loads(r.read())

def try_ssi(symbol, loai):
    url = (
        'https://fc-data.ssi.com.vn/api/v2/Market/charting_library/history'
        f'?symbol={symbol}&resolution=D&from={FROM}&to={NOW}&countBack=1500'
    )
    d = fetch_json(url, {'Referer': 'https://iboard.ssi.com.vn/'})
    if d.get('s') == 'ok' and d.get('t'):
        return {'t': d['t'], 'o': d['o'], 'h': d['h'],
                'l': d['l'], 'c': d['c'], 'v': d.get('v', [])}
    return None

def try_entrade(symbol, loai):
    base = 'https://services.entrade.com.vn/chart-api/v2/charts'
    url  = f'{base}/{loai}?symbol={symbol}&resolution=D&from={FROM}&to={NOW}'
    d = fetch_json(url, {
        'Referer': 'https://entrade.com.vn/',
        'Origin':  'https://entrade.com.vn',
    })
    if d.get('t') and len(d['t']) > 0:
        return {'t': d['t'], 'o': d['o'], 'h': d['h'],
                'l': d['l'], 'c': d['c'], 'v': d.get('v', [])}
    return None

SOURCES = [('SSI', try_ssi), ('Entrade', try_entrade)]

ok_count = 0
for symbol, loai in SYMBOLS:
    result = None
    for src_name, src_fn in SOURCES:
        try:
            result = src_fn(symbol, loai)
            if result:
                print(f'OK  {symbol:10s}  {len(result["t"])} bars  [{src_name}]')
                break
        except Exception as e:
            print(f'TRY {symbol:10s}  [{src_name}] {e}')

    if result:
        with open(f'data/{symbol}.json', 'w') as f:
            json.dump(result, f, separators=(',', ':'))
        ok_count += 1
    else:
        print(f'FAIL {symbol}')
    time.sleep(0.3)

print(f'\nXong: {ok_count}/{len(SYMBOLS)} mã thành công')
if ok_count < len(SYMBOLS) // 2:
    raise SystemExit(f'Quá nhiều lỗi: {ok_count}/{len(SYMBOLS)}')
