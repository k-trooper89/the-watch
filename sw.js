/* offline support for the installed app: the core files are stored on first visit,
   province borders are stored the first time each country is zoomed into.
   bump VERSION whenever the app changes so phones pick up the new files */
const VERSION='watch-2';
const CORE=['./','index.html','manifest.webmanifest','lib/d3.min.js','lib/topojson-client.min.js','data/world-110m.js','data/world-50m.js',
  'icons/icon-192.png','icons/icon-512.png','icons/maskable-512.png',
  'lib/fonts/plex-mono-300.woff2','lib/fonts/plex-mono-400.woff2','lib/fonts/plex-mono-500.woff2','lib/fonts/plex-mono-700.woff2',
  'lib/fonts/pt-mono-latin.woff2','lib/fonts/pt-mono-latin-ext.woff2','lib/fonts/pt-mono-cyrillic.woff2',
  'lib/fonts/pt-sans-narrow-400-latin.woff2','lib/fonts/pt-sans-narrow-400-latin-ext.woff2','lib/fonts/pt-sans-narrow-400-cyrillic.woff2',
  'lib/fonts/pt-sans-narrow-700-latin.woff2','lib/fonts/pt-sans-narrow-700-latin-ext.woff2','lib/fonts/pt-sans-narrow-700-cyrillic.woff2',
  'lib/fonts/barlow-condensed-500-latin.woff2','lib/fonts/barlow-condensed-500-latin-ext.woff2','lib/fonts/barlow-condensed-700-latin.woff2','lib/fonts/barlow-condensed-700-latin-ext.woff2',
  'lib/fonts/share-tech-mono-400-latin.woff2','lib/fonts/allerta-stencil-400-latin.woff2'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(VERSION).then(c=>c.addAll(CORE)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==VERSION).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{
  const r=e.request;if(r.method!=='GET'||new URL(r.url).origin!==location.origin)return;
  // the page itself: try the network first so updates arrive, fall back to the stored copy offline
  if(r.mode==='navigate'){e.respondWith(fetch(r).then(res=>{const c=res.clone();caches.open(VERSION).then(k=>k.put('index.html',c));return res}).catch(()=>caches.match('index.html')));return}
  e.respondWith(caches.match(r,{ignoreSearch:true}).then(hit=>hit||fetch(r).then(res=>{if(res.ok){const c=res.clone();caches.open(VERSION).then(k=>k.put(r,c))}return res})));
});
