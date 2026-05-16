self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
});

self.addEventListener('fetch', (event) => {
  // 간단한 네트워크 우선(Network First) 전략 (또는 Pass-through)
  // PWA 설치 요건을 맞추기 위한 최소한의 서비스 워커입니다.
  event.respondWith(
    fetch(event.request).catch(() => {
      return caches.match(event.request);
    })
  );
});
