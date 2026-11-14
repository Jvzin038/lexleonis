// Service worker da Lex Leonis: guarda o site no aparelho para ele abrir sem internet.
// Páginas: rede primeiro, cópia salva quando não há conexão.
// Arquivos de /assets (nome muda a cada versão) e fontes: cópia salva primeiro.
// Nada de /api, ações do servidor ou banco de dados passa por aqui.
const VERSION = "v1";
const SHELL_CACHE = `lexleonis-shell-${VERSION}`;
const ASSET_CACHE = `lexleonis-assets-${VERSION}`;
const SHELL_FILES = ["/", "/manifest.json", "/icon.png", "/favicon.png"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(SHELL_CACHE)
      .then((cache) => cache.addAll(SHELL_FILES))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key.startsWith("lexleonis-") && key !== SHELL_CACHE && key !== ASSET_CACHE)
            .map((key) => caches.delete(key)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

function isServerRoute(url) {
  return url.pathname.startsWith("/api/") || url.pathname.startsWith("/_serverFn") || url.pathname.startsWith("/__");
}

function saveCopy(cacheName, request, response) {
  const copy = response.clone();
  caches.open(cacheName).then((cache) => cache.put(request, copy));
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  const isFont = url.hostname === "fonts.googleapis.com" || url.hostname === "fonts.gstatic.com";
  const sameOrigin = url.origin === self.location.origin;
  if (!sameOrigin && !isFont) return;
  if (sameOrigin && isServerRoute(url)) return;

  // O site é montado no navegador: toda página usa o mesmo HTML inicial.
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.ok) saveCopy(SHELL_CACHE, "/", response);
          return response;
        })
        .catch(async () => (await caches.match("/")) || Response.error()),
    );
    return;
  }

  if (isFont || url.pathname.startsWith("/assets/")) {
    event.respondWith(
      caches.match(request).then(
        (saved) =>
          saved ||
          fetch(request).then((response) => {
            if (response.ok || response.type === "opaque") saveCopy(ASSET_CACHE, request, response);
            return response;
          }),
      ),
    );
    return;
  }

  event.respondWith(
    fetch(request)
      .then((response) => {
        if (response.ok) saveCopy(SHELL_CACHE, request, response);
        return response;
      })
      .catch(async () => (await caches.match(request)) || Response.error()),
  );
});
