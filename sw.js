// 레나 — 서비스 워커. 배포할 때마다 C의 버전을 1 올린다.
const C='lena-v4',F=['./','index.html','app.js','manifest.json','icon-180.png','icon-512.png',
 'assets/lena/bg.mp4','assets/lena/poster.jpg','assets/lena/face.jpg','assets/lena/cat.jpg','assets/lena/knock.webp',
 'assets/lena/paper_pink.webp','assets/lena/paper_teal.webp','assets/lena/paper_white.webp','assets/lena/paper_yellow.webp',
 'assets/lena/st_bolt.webp','assets/lena/st_coin.webp','assets/lena/st_heart.webp','assets/lena/st_lips.webp','assets/lena/st_peace.webp','assets/lena/st_phone.webp','assets/lena/st_skull.webp','assets/lena/st_star.webp','assets/lena/st_tape.webp',
 'assets/lena/tape_pink1.webp','assets/lena/tape_pink2.webp','assets/lena/tape_teal1.webp','assets/lena/tape_teal2.webp','assets/lena/tape_white.webp','assets/lena/tape_yellow.webp'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(C).then(c=>Promise.all(F.map(u=>c.add(new Request(u,{cache:'reload'})).catch(()=>{})))));self.skipWaiting()});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==C).map(x=>caches.delete(x)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{const u=new URL(e.request.url);if(e.request.method!=='GET'||u.origin!==location.origin)return;
 // 영상은 Range 요청이 오므로 캐시에서 잘라서 돌려준다
 if(u.pathname.endsWith('.mp4')){e.respondWith(caches.match(u.pathname.replace(/^.*\/assets\//,'assets/')).then(async r=>{r=r||await caches.match(e.request.url,{ignoreSearch:true});if(!r)return fetch(e.request);const rg=e.request.headers.get('range');if(!rg)return r;const b=await r.arrayBuffer(),m=/bytes=(\d+)-(\d*)/.exec(rg),s=+m[1],en=m[2]?+m[2]:b.byteLength-1;return new Response(b.slice(s,en+1),{status:206,headers:{'Content-Type':'video/mp4','Content-Range':`bytes ${s}-${en}/${b.byteLength}`,'Content-Length':String(en-s+1),'Accept-Ranges':'bytes'}})}));return}
 if(u.pathname.includes('/assets/')){e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request).then(r=>{if(r.ok){const c=r.clone();caches.open(C).then(x=>x.put(e.request,c))}return r})));return}
 const fresh=e.request.mode==='navigate'||/\.(html|js)$|\/$/.test(u.pathname)?new Request(e.request.url,{cache:'no-store'}):e.request;
 e.respondWith(fetch(fresh).then(r=>{if(r.ok){const c=r.clone();caches.open(C).then(x=>x.put(e.request,c))}return r}).catch(()=>caches.match(e.request).then(r=>r||caches.match('index.html'))))});
self.addEventListener('push',e=>{let d={};try{d=e.data.json()}catch(x){d={body:e.data?e.data.text():''}}
 const t=!d.title||d.title==='하루'?'레나':d.title;
 e.waitUntil(self.registration.showNotification(t,{body:d.body||'',icon:'icon-180.png',badge:'icon-180.png',tag:'lena-'+Date.now()}))});
self.addEventListener('notificationclick',e=>{e.notification.close();e.waitUntil(clients.matchAll({type:'window',includeUncontrolled:true}).then(l=>{for(const c of l)if('focus' in c)return c.focus();return clients.openWindow('./')}))});
