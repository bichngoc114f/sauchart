"""Fetch OHLCV daily data từ Entrade API, lưu vào data/{SYMBOL}.json"""
import urllib.request
import json
import time
import os

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

BASE  = 'https://services.entrade.com.vn/chart-api/v2/charts'
NOW   = int(time.time())
FROM  = NOW - 4 * 365 * 24 * 3600   # 4 năm lịch sử

os.makedirs('data', exist_ok=True)

ok_count = 0
for symbol, loai in SYMBOLS:
    url = f"{BASE}/{loai}?symbol={symbol}&resolution=D&from={FROM}&to={NOW}"
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req, timeout=20) as resp:
            raw  = resp.read()
            data = json.loads(raw)
        if data.get('t') and len(data['t']) > 0:
            path = f"data/{symbol}.json"
            with open(path, 'w') as f:
                json.dump(data, f, separators=(',', ':'))
            print(f"OK  {symbol:10s}  {len(data['t'])} bars")
            ok_count += 1
        else:
            print(f"EMPTY  {symbol}")
    except Exception as e:
        print(f"ERR  {symbol}: {e}")
    time.sleep(0.4)

print(f"\nXong: {ok_count}/{len(SYMBOLS)} mã thành công")
