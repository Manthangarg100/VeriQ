const CACHE='veriq-v8-handdrawn-logo';
const APP_SHELL=['/','/index.html','/app.js','/styles.css','/assets/measurement-instrument.png','/assets/hero-bubble.png','/assets/veriq-logo-lockup.png','/assets/veriq-logo-icon.png'];
self.addEventListener('install',event=>{event.waitUntil(caches.open(CACHE).then(c=>c.addAll(APP_SHELL)).then(()=>self.skipWaiting()));});
self.addEventListener('activate',event=>{event.waitUntil(Promise.all([caches.keys().then(keys=>Promise.all(keys.filter(key=>key.startsWith('veriq-')&&key!==CACHE).map(key=>caches.delete(key)))),self.clients.claim()]));});
self.addEventListener('fetch',event=>{const u=new URL(event.request.url);if(u.pathname.startsWith('/api/'))return;event.respondWith(caches.match(event.request).then(cached=>cached||fetch(event.request).then(res=>{const copy=res.clone();caches.open(CACHE).then(c=>c.put(event.request,copy));return res;}).catch(()=>caches.match('/index.html'))));});
