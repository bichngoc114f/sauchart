// Lưu trữ bền vững cho Sâu Chart: xin persist, bản sao dự phòng IndexedDB ('sauchart-data'/'kv')
// cho mọi khóa 'sauchart.*' ghi qua ghiBoNho(), tự khôi phục khi localStorage bị mất.
(function () {
  'use strict';
  const PREFIX = 'sauchart.';
  const TS_KEY = PREFIX + '_ts'; // { khóa: thời điểm ghi (ms) } — để so bản localStorage với bản IndexedDB
  const DB_NAME = 'sauchart-data';
  const STORE = 'kv';
  const FLUSH_MS = 300;

  // 1. Xin lưu trữ bền vững (không báo gì nếu bị từ chối)
  try {
    if (navigator.storage && typeof navigator.storage.persist === 'function') {
      navigator.storage.persist().catch(function () {});
    }
  } catch (e) {}

  function laKhoaDuPhong(k) {
    return typeof k === 'string' && k.indexOf(PREFIX) === 0 && k.indexOf(PREFIX + '_') !== 0;
  }

  // Ảnh chụp localStorage ngay lúc nạp, trước khi app.js kịp ghi giá trị mặc định
  const anhChup = {};
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (laKhoaDuPhong(k)) anhChup[k] = localStorage.getItem(k);
    }
  } catch (e) {}

  let tsMap = {};
  try { tsMap = JSON.parse(localStorage.getItem(TS_KEY)) || {}; } catch (e) { tsMap = {}; }
  function luuTsMap() { try { localStorage.setItem(TS_KEY, JSON.stringify(tsMap)); } catch (e) {} }

  let db = null;
  let san = false;              // đã đọc xong IndexedDB và đối chiếu
  const choGhi = new Map();     // khóa → {k, v, ts} đang chờ ghi vào IndexedDB
  let hen = null;

  function moDb() {
    return new Promise(function (resolve) {
      try {
        if (!window.indexedDB) return resolve(null);
        const rq = indexedDB.open(DB_NAME, 1);
        rq.onupgradeneeded = function () {
          if (!rq.result.objectStoreNames.contains(STORE)) rq.result.createObjectStore(STORE, { keyPath: 'k' });
        };
        rq.onsuccess = function () { resolve(rq.result); };
        rq.onerror = function () { resolve(null); };
        rq.onblocked = function () { resolve(null); };
      } catch (e) { resolve(null); }
    });
  }

  function docTatCa() {
    return new Promise(function (resolve) {
      try {
        const rq = db.transaction(STORE, 'readonly').objectStore(STORE).getAll();
        rq.onsuccess = function () { resolve(rq.result || []); };
        rq.onerror = function () { resolve([]); };
      } catch (e) { resolve([]); }
    });
  }

  function xaChoGhi() {
    hen = null;
    if (!san || !db || !choGhi.size) return;
    const ds = Array.from(choGhi.values());
    choGhi.clear();
    try {
      const os = db.transaction(STORE, 'readwrite').objectStore(STORE);
      ds.forEach(function (r) { os.put(r); });
    } catch (e) {}
  }
  function henGhi(ngay) {
    if (ngay) { if (hen) clearTimeout(hen); xaChoGhi(); return; }
    if (!hen) hen = setTimeout(xaChoGhi, FLUSH_MS);
  }

  // Gọi từ ghiBoNho() sau khi ghi localStorage; không chặn giao diện
  function ghi(khoa, raw) {
    if (!laKhoaDuPhong(khoa) || typeof raw !== 'string') return;
    const ts = Date.now();
    tsMap[khoa] = ts;
    luuTsMap();
    choGhi.set(khoa, { k: khoa, v: raw, ts: ts });
    if (san) henGhi(false);
  }

  function doiChieu(bans) {
    const khoiPhuc = [];
    const coTrongDb = {};
    bans.forEach(function (r) {
      if (!r || !laKhoaDuPhong(r.k) || typeof r.v !== 'string') return;
      coTrongDb[r.k] = true;
      const local = anhChup[r.k];
      let dung = false;
      if (local === undefined) {
        dung = true; // localStorage không có mà IndexedDB có → khôi phục
      } else if (local !== r.v) {
        // khác nhau: chỉ khi localStorage chưa bị app đổi tiếp và bản IndexedDB mới hơn
        let hienTai = null;
        try { hienTai = localStorage.getItem(r.k); } catch (e) {}
        if (hienTai === local && (r.ts || 0) > (tsMap[r.k] || 0)) dung = true;
      }
      if (dung) {
        try {
          localStorage.setItem(r.k, r.v);
          tsMap[r.k] = r.ts || Date.now();
          choGhi.delete(r.k); // bỏ giá trị mặc định app vừa ghi đang chờ, tránh đè bản gốc
          khoiPhuc.push(r.k);
        } catch (e) {}
      } else if (local !== undefined && local !== r.v && !choGhi.has(r.k)) {
        // bản localStorage mới hơn → cập nhật lại bản sao
        choGhi.set(r.k, { k: r.k, v: local, ts: tsMap[r.k] || Date.now() });
      }
    });
    // Gieo bản sao cho dữ liệu đã có sẵn trong localStorage nhưng chưa có trong IndexedDB
    Object.keys(anhChup).forEach(function (k) {
      if (coTrongDb[k] || choGhi.has(k)) return;
      let hienTai = anhChup[k];
      try { hienTai = localStorage.getItem(k); } catch (e) {}
      if (hienTai === null) return;
      if (!tsMap[k]) tsMap[k] = Date.now();
      choGhi.set(k, { k: k, v: hienTai, ts: tsMap[k] });
    });
    if (khoiPhuc.length) luuTsMap();
    return khoiPhuc;
  }

  function apDungKhoiPhuc(khoiPhuc) {
    if (!khoiPhuc.length) return;
    if (!window.sauAppChay) return; // app.js chưa chạy → nó sẽ đọc thẳng dữ liệu đã khôi phục
    const chiFib = khoiPhuc.every(function (k) { return k.indexOf(PREFIX + 'fib') === 0 || k.indexOf(PREFIX + 'draw.') === 0; });
    if (chiFib && typeof window.sauFibKhoiPhuc === 'function') {
      try { window.sauFibKhoiPhuc(); } catch (e) {}
      return;
    }
    // Cài đặt khác đã được app đọc từ giá trị mặc định → nạp lại trang đúng 1 lần
    try {
      if (sessionStorage.getItem(PREFIX + '_rl')) return;
      sessionStorage.setItem(PREFIX + '_rl', '1');
    } catch (e) { return; }
    location.reload();
  }

  const sanSang = moDb().then(function (d) {
    db = d;
    if (!db) return [];
    return docTatCa().then(doiChieu);
  }).catch(function () { return []; }).then(function (khoiPhuc) {
    san = true;
    if (db) xaChoGhi();
    apDungKhoiPhuc(khoiPhuc);
  });

  // Đẩy ngay các thay đổi đang chờ khi trang bị ẩn/đóng
  document.addEventListener('visibilitychange', function () { if (document.hidden) henGhi(true); });
  window.addEventListener('pagehide', function () { henGhi(true); });

  window.sauStore = { ghi: ghi, sanSang: sanSang };
})();
