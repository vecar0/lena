// 레나 — 오락실 (다이얼 8번): 허브·게임 동전. 다른 게임은 g_*.js가 ARC.reg로 등록한다
// app.js의 전역(S, save, el, $, btn, row, lbl, pick, tone, coinSound, dtmf, toast, SH, openSheet, closeSheet, refreshSheet, dk, sleep, nmc)을 쓴다.
'use strict';
(() => {
const css = `
.arc{position:absolute;inset:0;z-index:45;display:none;flex-direction:column;background:#0b0d11;overflow:hidden}
.arc.on{display:flex}
.arc img{object-fit:contain}
.arc::before{content:"";position:absolute;inset:0;pointer-events:none;background:radial-gradient(rgba(255,255,255,.04) 1px,transparent 1.2px) 0 0/4px 4px,radial-gradient(ellipse at 50% 0%,rgba(255,61,154,.18),transparent 60%),radial-gradient(ellipse at 50% 100%,rgba(47,224,200,.14),transparent 60%)}
.ahd{position:relative;display:flex;align-items:center;gap:10px;padding:calc(var(--st) + 12px) 14px 8px}
.ahd h2{font-family:'Black Han Sans';font-weight:400;font-size:22px;text-shadow:2px 2px 0 var(--pink);flex:1;line-height:1.1}
.gcb{display:flex;align-items:center;gap:5px;height:34px;padding:0 12px 0 6px;border-radius:17px;background:rgba(0,0,0,.6);border:1px solid var(--line);font-family:'Space Mono',monospace;font-weight:700;font-size:15px;color:var(--yel)}
.gcb img{width:24px;height:24px}
.abody{position:relative;flex:1;overflow-y:auto;padding:4px 14px calc(var(--sb) + 16px);display:flex;flex-direction:column;gap:12px}
.talkr{display:flex;align-items:center;gap:10px;min-height:52px;padding:8px 12px;background:rgba(0,0,0,.5);border:1px solid var(--line);border-radius:14px}
.talkr i{width:38px;height:38px;flex:none;border-radius:50%;background:url(assets/lena/cat.jpg) center/cover;border:2px solid #000;box-shadow:2px 2px 0 var(--pink)}
.talkr i.face{background:url(assets/lena/face.jpg) 50% 30%/cover}
.talkr i.sk{background:#151515 url(assets/lena/st_skull.webp) center/80% no-repeat;box-shadow:2px 2px 0 var(--teal)}
.talkr span{font-size:14.5px;font-weight:700;line-height:1.45;word-break:keep-all}
.gcards{display:grid;gap:12px}
.gban{position:relative;display:flex;align-items:center;gap:12px;min-height:96px;padding:12px 14px;border-radius:16px;border:2px solid #000;background:var(--panel2);box-shadow:4px 4px 0 var(--gc,var(--pink));overflow:hidden;text-align:left}
.gban::before{content:"";position:absolute;inset:0;background:radial-gradient(circle at 88% 50%,var(--gc,var(--pink)),transparent 55%);opacity:.22}
.gban:active{transform:translate(2px,2px);box-shadow:2px 2px 0 var(--gc,var(--pink))}
.gban>img{position:relative;width:76px;height:76px;object-fit:contain;flex:none;order:2;margin-left:auto;filter:drop-shadow(3px 3px 0 rgba(0,0,0,.5))}
.gbt{position:relative;flex:1;min-width:0}
.gbt b{display:block;font-family:'Black Han Sans';font-weight:400;font-size:20px}
.gbt small{display:block;font-size:12.5px;color:var(--mute);margin-top:3px;line-height:1.4;word-break:keep-all}
.gban>em{position:absolute;left:14px;top:-1px;font-style:normal;font-size:10.5px;font-weight:800;background:var(--yel);color:#111;padding:2px 7px;border-radius:0 0 8px 8px;border:2px solid #000;border-top:0}
.gban>em{display:flex;align-items:center;gap:1px}.gban>em .ci{width:14px;height:14px;margin:0 1px}
.abody.flat{padding:0;overflow:hidden;gap:0}
.abody>*{flex-shrink:0}
.abody.flat>*{flex-shrink:1}
.gcard{display:flex;align-items:center;gap:14px;padding:14px;border-radius:16px;background:var(--panel2);border:2px solid #000;box-shadow:4px 4px 0 var(--pink);text-align:left}
.gcard:nth-child(2){box-shadow:4px 4px 0 var(--teal)}
.gcard img{width:62px;height:62px;flex:none}
.gcard b{display:block;font-family:'Black Han Sans';font-weight:400;font-size:20px}
.gcard small{display:block;font-size:12.5px;color:var(--mute);margin-top:3px;line-height:1.45;word-break:keep-all}
.arc.hubv{background:#06080a}.arc.hubv::before{display:none}
.ahero{position:absolute;left:0;right:0;top:0;height:74%;overflow:hidden;pointer-events:none}
.ahero img{width:100%;height:100%;object-fit:cover!important;object-position:50% 6%}
.ahero::after{content:"";position:absolute;inset:0;background:linear-gradient(180deg,rgba(6,8,10,.6),transparent 16%,transparent 56%,#06080a 97%)}
.ahero.cat{background:radial-gradient(ellipse at 50% 45%,rgba(30,140,90,.45),transparent 62%),url(assets/lena/poster.jpg) center/cover;background-blend-mode:normal}
.ahero.cat::before{content:"";position:absolute;inset:0;backdrop-filter:blur(18px) brightness(.4);-webkit-backdrop-filter:blur(18px) brightness(.4)}
.ahero.cat img{position:absolute;left:50%;top:46%;width:min(58vw,250px);height:auto;aspect-ratio:1;object-fit:cover!important;border-radius:50%;transform:translate(-50%,-50%);border:3px solid #000;box-shadow:0 0 0 5px var(--teal),0 0 60px rgba(47,224,200,.5)}
.arc.hubv .ahd{z-index:2}.arc.hubv .ahd h2{text-shadow:0 2px 10px #000,2px 2px 0 var(--pink)}
.abody.hubb{justify-content:flex-end;gap:12px;padding:0 14px calc(var(--sb) + 18px);overflow:hidden}
.abody.hubb .hsp{flex:1}
.abody.hubb .talkr{background:rgba(6,8,10,.82);-webkit-backdrop-filter:blur(10px);backdrop-filter:blur(10px)}
.hcards{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:8px}
.hcard{position:relative;display:flex;flex-direction:column;align-items:center;justify-content:flex-end;gap:6px;aspect-ratio:5/7;padding:12px 6px 10px;border-radius:12px;background:var(--paper);color:#111;border:2px solid #000;box-shadow:0 0 0 2px var(--gc,var(--pink)) inset,3px 4px 0 #000;transition:transform .14s cubic-bezier(0.23,1,0.32,1)}
.hcard:active{transform:translateY(2px) scale(.97)}
.hcard img{flex:1;min-height:0;width:84%;object-fit:contain}
.hcard b{font-family:'Black Han Sans';font-weight:400;font-size:13.5px;line-height:1.05;text-align:center;word-break:keep-all}
.hcard em{position:absolute;top:6px;right:6px;display:flex;align-items:center;gap:1px;font-style:normal;font-family:'Space Mono',monospace;font-weight:700;font-size:11px;background:#111;color:var(--yel);padding:1px 6px 1px 2px;border-radius:9px}.hcard em .ci{width:14px;height:14px}
@media (max-height:700px){.hcard{aspect-ratio:5/6}}
/* common */
.res{font-family:'Black Han Sans';font-size:28px;text-align:center;text-shadow:2px 2px 0 #000;min-height:32px}
.res.w{color:var(--yel)}.res.l{color:var(--hot)}
/* slot */
.mach{border-radius:22px;padding:12px;background:linear-gradient(#22262e,#14171c);border:3px solid #000;box-shadow:0 0 0 3px var(--pink),0 0 22px rgba(255,61,154,.45),6px 8px 0 #000}
.stat{display:grid;grid-template-columns:repeat(3,1fr);gap:6px;margin-bottom:10px}
.stat div{background:#0d1f17;border:2px solid #000;border-radius:8px;padding:5px 6px;text-align:center;font-family:'Space Mono',monospace}
.stat small{display:block;font-size:10px;color:#7dffb5;opacity:.75;letter-spacing:1px}
.stat b{display:block;font-size:17px;color:#7dffb5;text-shadow:0 0 6px rgba(125,255,181,.6)}
.stat .due b{color:#ff8fb6;text-shadow:0 0 6px rgba(255,61,154,.6)}
.grid{display:grid;grid-template-columns:repeat(5,1fr);gap:5px;background:#000;padding:5px;border-radius:12px}
.cell{aspect-ratio:1;border-radius:8px;background:#f6f2ea;display:grid;place-items:center;position:relative;overflow:hidden}
.cell img{width:82%;height:82%;object-fit:contain}
.cell.spin img{filter:blur(1.5px);transform:translateY(4px)}
.cell.hit{background:#fff36b;box-shadow:inset 0 0 0 3px var(--pink);animation:hit .5s var(--ease) 2}
@keyframes hit{50%{transform:scale(.9)}}
.gain{font-family:'Black Han Sans';font-size:30px;text-align:center;color:var(--yel);text-shadow:3px 3px 0 #000;min-height:36px;margin-top:6px}
.lever{width:100%;height:58px;border-radius:14px;background:linear-gradient(#ff6fb6,#e0247a);border:3px solid #000;box-shadow:0 4px 0 #000;font-family:'Black Han Sans';font-size:22px;color:#fff;letter-spacing:2px;margin-top:10px}
.lever:active{transform:translateY(3px);box-shadow:0 1px 0 #000}
.lever:disabled{filter:grayscale(.6);opacity:.6}
.cabw{position:relative;width:100%;max-width:330px;margin:0 auto;padding-right:30px}
.cab{position:relative;width:100%;aspect-ratio:760/1144;background:url(assets/lena/g/slot_cab.webp) center/100% 100% no-repeat;filter:drop-shadow(5px 7px 0 rgba(0,0,0,.55))}
.rwin{position:absolute;left:17.9%;top:28.3%;width:64%;height:24.7%;display:grid;grid-template-columns:repeat(5,1fr);gap:2px;background:#0b0b0f;border-radius:4px;overflow:hidden}
.rwin::after{content:"";position:absolute;inset:0;pointer-events:none;background:linear-gradient(rgba(0,0,0,.55),transparent 22%,transparent 78%,rgba(0,0,0,.55)),linear-gradient(105deg,transparent 30%,rgba(255,255,255,.18) 38%,transparent 46%)}
.reel{position:relative;overflow:hidden;background:#f3efe6}
.strip{position:absolute;left:0;right:0;top:0;will-change:transform}
.sc{height:calc(100% / var(--n));display:grid;place-items:center;position:relative}
.sc img{width:78%;height:78%;object-fit:contain}
.strip.blur .sc img{filter:blur(2px) saturate(.8)}
.sc.hit{background:#fff36b;animation:hit .5s var(--ease) 3}
.sc.hit::after{content:"";position:absolute;inset:1px;border:2px solid var(--pink);border-radius:3px}
.tray{position:absolute;left:28%;right:28%;bottom:8.5%;height:6%;display:grid;place-items:center;font-family:'Black Han Sans';font-size:clamp(16px,6vw,24px);color:var(--yel);text-shadow:2px 2px 0 #000,0 0 10px rgba(242,234,58,.7);pointer-events:none}
.lvr{position:absolute;right:0;top:22%;width:30px;height:46%;touch-action:none;cursor:grab}
.lvr .bs{position:absolute;left:4px;right:4px;top:46%;height:16%;border-radius:6px;background:linear-gradient(#3a3f47,#15181c);border:2px solid #000}
.lvr .arm{position:absolute;left:11px;width:8px;border-radius:4px;background:linear-gradient(90deg,#8a8f96,#f2f4f6 45%,#6d7279);border:1.5px solid #000}
.lvr .ball{position:absolute;left:50%;width:28px;height:28px;margin:-14px 0 0 -14px;border-radius:50%;background:radial-gradient(circle at 35% 30%,#ffd1e6,#ff3d9a 45%,#a3105a);border:2px solid #000;box-shadow:2px 3px 0 rgba(0,0,0,.5)}
.pullb{display:block;margin:10px auto 0;height:44px;padding:0 18px;border-radius:22px;border:2px solid #000;background:var(--pink);color:#fff;font-weight:800;font-size:14px;box-shadow:0 3px 0 #000}
.pullb:disabled{filter:grayscale(.6);opacity:.6}
.charms{display:flex;gap:6px;flex-wrap:wrap;min-height:34px}
.charm{display:flex;align-items:center;gap:6px;height:32px;padding:0 10px 0 4px;border-radius:16px;background:var(--panel2);border:1px solid var(--line);font-size:12.5px;font-weight:700}
.charm img{width:24px;height:24px}
.shop{display:grid;gap:10px}
.offer{display:flex;align-items:center;gap:10px;padding:10px;border-radius:14px;background:var(--paper);color:#111;border:2px solid #000;box-shadow:3px 3px 0 var(--teal)}
.offer img{width:44px;height:44px;flex:none}
.offer div{flex:1}.offer b{font-size:15px;font-weight:800}.offer small{display:block;font-size:12.5px;opacity:.75;margin-top:2px;line-height:1.4;word-break:keep-all}
.offer .btn{height:40px;padding:0 12px;font-size:14px}
.rules{font-size:13px;color:#cfd8dc;line-height:1.6;word-break:keep-all;background:rgba(0,0,0,.4);border:1px solid var(--line);border-radius:12px;padding:10px 12px}
.rules b{color:var(--mint)}
`;
document.head.appendChild(Object.assign(document.createElement('style'), { textContent: css }));
const A = el('div', 'arc'); A.id = 'arc'; $('app').appendChild(A);
const img = n => `assets/lena/${n}.webp`;

// ---------- 게임 동전 ----------
function gcInit() {
  if (S.gc == null) S.gc = 0;
  const t = dk(new Date());
  if (S.gcDay !== t) { S.gcDay = t; S.gc = Math.min(99, (S.gc || 0) + 10); S.gcLoan = ''; save(); return true; }
  return false;
}
const gc = () => S.gc || 0;
function gcAdd(n) { S.gc = Math.max(0, Math.min(999, gc() + n)); save(); hdr(); }

// ---------- 화면 틀 ----------
let cur = '', cleanup = null;
function frame(title, body, back, flat) {
  if (cleanup) { try { cleanup(); } catch (e) {} cleanup = null; }
  A.innerHTML = ''; A.classList.remove('hubv'); A.scrollLeft = A.scrollTop = 0; $('app').scrollLeft = $('app').scrollTop = 0;
  const h = el('div', 'ahd');
  if (back) { const b = el('button', 'sx'); b.innerHTML = '<svg viewBox="0 0 24 24"><path d="M14.5 6l-6 6 6 6"/></svg>'; b.onclick = () => { dtmf('*'); hub(); }; h.appendChild(b); }
  h.appendChild(el('h2', null, title));
  const g = el('div', 'gcb'); g.id = 'gcb'; h.appendChild(g);
  const x = el('button', 'sx'); x.innerHTML = '<svg viewBox="0 0 24 24"><path d="M7 7l10 10M17 7L7 17"/></svg>'; x.onclick = closeArc; h.appendChild(x);
  const B = el('div', 'abody' + (flat ? ' flat' : '')); A.append(h, B); body(B); hdr(); return B;
}
function hdr() { const g = $('gcb'); if (!g) return; g.innerHTML = ''; const i = el('img'); i.src = CUR('gc'); i.alt = ''; g.append(i, document.createTextNode(gc())); g.title = '게임 동전'; }
function talk(B, who, t) { const r = el('div', 'talkr'), i = el('i', who === 'sk' ? 'sk' : $('app').classList.contains('outside') ? '' : 'face'); const s = el('span', null, t); r.append(i, s); B.appendChild(r); return s; }
function openArc() { ['sv', 'svBest', 'svKill', 'rh', 'rhDif', 'cardAsc', 'cardAscMax', 'cardBest', 'cardRun', 'cardWin', 'idl', 'idr'].forEach(k => { delete S[k]; }); const fresh = gcInit(); A.classList.add('on'); hub(fresh); }
function closeArc() { if (cleanup) { try { cleanup(); } catch (e) {} cleanup = null; } const end = () => { A.classList.remove('on', 'hubv'); cur = ''; if (typeof renderHome === 'function') renderHome(); }; if (window.lenaScene && cur === 'hub') lenaScene.fadeOut(A, end); else end(); }
window.openArc = openArc;
window.ARC = { A, frame, talk, gc, gcAdd, hub, reg, img, gimg: n => `assets/lena/g/${n}.webp`, set cleanup(f) { cleanup = f; }, get cleanup() { return cleanup; }, closeArc };

const GAMES = [];
function reg(g) { GAMES.push(g); GAMES.sort((x, y) => (x.order || 9) - (y.order || 9)); }
function hub(fresh) {
  cur = 'hub';
  const B = frame('오락실', B => {
    // 딜러 레나(영상 모드에서만) — 그림 위에는 아무것도 얹지 않고, 아래 테이블 자리에 대사와 카드
    const out = $('app').classList.contains('outside'), hero = el('div', 'ahero' + (out ? ' cat' : '')), im = el('img'); im.src = out ? 'assets/lena/cat.jpg' : 'assets/lena/menu/play.webp'; im.alt = ''; im.decoding = 'async'; hero.appendChild(im); A.insertBefore(hero, A.firstChild);   // 밖 모드 = 고양이 딜러
    const sp = el('div', 'hsp'); B.appendChild(sp);
    talk(B, 'l', fresh ? `${nmc()}오늘 게임 동전 10개 넣어 놨어. …다 잃어도 울지 마.` : pick(['한 판 할래? 내 앞에서 지면 더 재밌거든.', '카드는 내가 섞을게. 고르기만 해.', '오늘은 운 좋은 얼굴이네.']));
    const G = el('div', 'hcards');
    GAMES.forEach((g, i) => {
      const c = el('button', 'hcard'); c.style.setProperty('--gc', g.color || 'var(--pink)'); const ic = el('img'); ic.src = g.icon; ic.alt = '';
      c.append(ic, el('b', null, g.name)); if (g.cost) { const em = el('em'); em.innerHTML = `${ci('gc')}${g.cost}`; c.appendChild(em); }
      c.setAttribute('aria-label', `${g.name} — ${g.sub()}`);
      c.onclick = () => { dtmf((i % 9) + 1); g.start(); }; G.appendChild(c);
    });
    B.appendChild(G);
    if (gc() < 1) B.appendChild(row(btn('레나에게 동전 빌리기', 'wide', () => { if (S.gcLoan === dk(new Date())) { toast('오늘은 이미 빌렸어. 내일 또 와.'); return; } S.gcLoan = dk(new Date()); gcAdd(3); coinSound(); hub(); })));
  }, false, true);
  A.classList.add('hubv'); B.classList.add('hubb');
  if (window.lenaScene) lenaScene.settle(A.querySelector('.ahero'), [B.querySelector('.talkr')].concat([].slice.call(B.querySelectorAll('.hcard'))), 40);
}

// 슬롯(본핏)은 g_slot.js

// 다이얼 8번 = 오락실
SH[8] = { t: '오락실', s: '', r: () => {}, direct: openArc };
})();
