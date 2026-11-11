/* v120 '오늘' 화면 — 1번 회선. 레나 일러스트가 화면 전체에 깔리고, 아래에서 올라오는 유리판에 오늘 할 것이 시간순으로 모인다.
   전환 = 회선 연결(네온 선이 위→아래로 훑으며 화면이 열림, 0.3초). 데이터는 study.js의 dayRows(캘린더 종이 시간표와 같은 줄)를 씀. */
(function () {
  'use strict';
  var app = document.querySelector('.app'); if (!app || typeof S === 'undefined') return;
  var css = document.createElement('style');
  css.textContent =
    '.lv{position:absolute;inset:0;z-index:25;background:#06090a;overflow:hidden;visibility:hidden;clip-path:inset(0 0 100% 0);transition:clip-path .3s cubic-bezier(0.23,1,0.32,1),visibility 0s .3s}' +
    '.lv.on{visibility:visible;clip-path:inset(0 0 0 0);transition:clip-path .3s cubic-bezier(0.23,1,0.32,1)}' +
    '.lv.out{transition:clip-path .2s cubic-bezier(0.23,1,0.32,1),visibility 0s .2s}' +
    '.lv-art{position:absolute;left:0;top:0;width:100%;height:80%;object-fit:cover!important;object-position:50% 0;transform-origin:50% 20%;transition:transform .5s cubic-bezier(0.23,1,0.32,1)}.lv.on .lv-art{transform:none}.lv .lv-art{transform:scale(1.04)}' +
    '.lv-sh{position:absolute;inset:0;background:linear-gradient(180deg,rgba(0,0,0,.55),transparent 16%,transparent 44%,#06090a 78%);pointer-events:none}' +
    '.lv-ln{position:absolute;left:0;right:0;top:0;height:3px;background:var(--pink);box-shadow:0 0 18px 4px rgba(255,61,154,.75);opacity:0;pointer-events:none;z-index:5}.lv.on .lv-ln{animation:lvLn .3s cubic-bezier(0.23,1,0.32,1)}@keyframes lvLn{0%{transform:translateY(0);opacity:1}85%{opacity:1}100%{transform:translateY(100vh);opacity:0}}' +
    '.lv-id{position:absolute;left:0;right:0;top:36%;text-align:center;font:400 22px "Black Han Sans",sans-serif;color:#fff;text-shadow:0 0 14px var(--pink);opacity:0;pointer-events:none;z-index:5}.lv.on .lv-id{animation:lvId .7s ease}@keyframes lvId{0%{opacity:0}15%,55%{opacity:1}100%{opacity:0}}' +
    '.lv-top{position:absolute;left:0;right:0;top:0;padding:calc(env(safe-area-inset-top,0px) + 10px) 14px 0;display:flex;align-items:center;gap:10px;z-index:3}' +
    '.lv-back{min-height:44px;padding:0 14px 0 10px;border-radius:22px;background:rgba(0,0,0,.5);-webkit-backdrop-filter:blur(10px);backdrop-filter:blur(10px);border:1px solid rgba(255,255,255,.22);color:#fff;font-size:14px;font-weight:600;display:flex;align-items:center;gap:4px}' +
    '.lv-back svg{width:18px;height:18px;fill:none;stroke:currentColor;stroke-width:2.4;stroke-linecap:round;stroke-linejoin:round}' +
    '.lv-ttl{margin-left:auto;text-align:right;color:#fff;text-shadow:0 1px 8px rgba(0,0,0,.8)}.lv-ttl small{display:block;font:700 11px "Space Mono",monospace;color:var(--mint);letter-spacing:.5px}.lv-ttl b{font:400 20px "Black Han Sans",sans-serif}' +
    '.lv-pn{position:absolute;left:0;right:0;bottom:0;height:90%;z-index:4;display:flex;flex-direction:column;border-radius:24px 24px 0 0;background:rgba(9,17,19,.78);-webkit-backdrop-filter:blur(20px);backdrop-filter:blur(20px);border-top:1px solid rgba(47,224,200,.5);transform:translateY(36%);transition:transform .28s cubic-bezier(0.32,0.72,0,1);will-change:transform}' +
    '.lv-pn.full{transform:translateY(0)}.lv-pn.peek{transform:translateY(74%)}.lv-pn.drag{transition:none}' +
    '.lv-hd{flex:none;padding:8px 16px 6px;touch-action:none;cursor:grab}.lv-hd i{display:block;width:42px;height:5px;border-radius:3px;background:rgba(255,255,255,.35);margin:0 auto 10px}' +
    '.lv-say{display:flex;gap:10px;align-items:flex-start}.lv-say u{flex:none;width:36px;height:36px;border-radius:50%;background:url(assets/lena/face.jpg) center/cover;border:2px solid var(--pink)}' +
    '.lv-say p{margin:0;padding:9px 12px;border-radius:4px 14px 14px 14px;background:var(--paper);color:#111;font-size:14px;line-height:1.45;font-weight:600;box-shadow:3px 3px 0 var(--pink)}' +
    '.lv-st{display:flex;gap:6px;flex-wrap:wrap;margin:10px 0 2px}.lv-st span{font:700 12px "Space Mono",monospace;padding:5px 9px;border-radius:12px;background:rgba(255,255,255,.1);color:#dfe9ea}.lv-st span b{color:var(--mint)}.lv-st span.late b{color:var(--hot)}' +
    '.lv-bd{flex:1;overflow-y:auto;-webkit-overflow-scrolling:touch;padding:4px 14px calc(env(safe-area-inset-bottom,0px) + 96px)}' +
    '.lv-sec{margin:14px 2px 6px;font-size:13px;font-weight:700;color:var(--mint);display:flex;align-items:center;gap:6px}.lv-sec:before{content:"";width:4px;height:13px;border-radius:2px;background:var(--pink)}' +
    '.tv-r{display:flex;align-items:center;gap:10px;min-height:52px;padding:6px 8px 6px 10px;border-radius:14px;background:rgba(255,255,255,.07);margin-bottom:6px;border-left:4px solid var(--c,#667)}' +
    '.tv-r.past{opacity:.5}.tv-r.dn{opacity:.45}.tv-r.dn .tv-w{text-decoration:line-through}.tv-r.late{background:rgba(255,46,110,.14)}' +
    '.tv-t{flex:none;width:46px;font:700 13px "Space Mono",monospace;color:#fff}.tv-t small{display:block;font-size:10px;color:#9fb0b3;font-weight:400}' +
    '.tv-w{flex:1;min-width:0;font-size:14px;line-height:1.35;color:#f1f5f5;word-break:keep-all;overflow-wrap:anywhere}.tv-w em{font-style:normal;font-size:11px;font-weight:700;color:var(--c,#9fb0b3);display:block}' +
    '.tv-ck{flex:none;width:40px;height:40px;border-radius:50%;border:2px solid rgba(255,255,255,.45);background:none;display:grid;place-items:center;transition:transform .14s cubic-bezier(0.23,1,0.32,1),background-color .14s ease}.tv-ck:active{transform:scale(.9)}.tv-ck svg{width:18px;height:18px;fill:none;stroke:#fff;stroke-width:2.6;stroke-linecap:round;stroke-linejoin:round;opacity:.5}.tv-r.dn .tv-ck{background:var(--teal);border-color:var(--teal)}.tv-r.dn .tv-ck svg{stroke:#04201c;opacity:1}' +
    '.tv-now{display:flex;align-items:center;gap:8px;margin:8px 2px;font:700 11px "Space Mono",monospace;color:var(--pink)}.tv-now:after{content:"";flex:1;height:2px;background:var(--pink);box-shadow:0 0 8px var(--pink)}' +
    '.tv-em{padding:22px 10px;text-align:center;color:#9fb0b3;font-size:14px;line-height:1.6}' +
    '.tv-lk{display:flex;gap:8px;margin-top:14px}.tv-lk button{flex:1;min-height:44px;border-radius:14px;background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.16);color:#dfe9ea;font-size:13px;font-weight:600}' +
    '.lv-add{position:absolute;left:12px;right:12px;bottom:calc(env(safe-area-inset-bottom,0px) + 12px);z-index:6;padding:10px;border-radius:20px;background:rgba(6,12,13,.92);border:1px solid rgba(47,224,200,.45);-webkit-backdrop-filter:blur(14px);backdrop-filter:blur(14px)}' +
    '.lv-add .r1{display:flex;gap:8px}.lv-add input.tx{flex:1;min-width:0;height:44px;border-radius:14px;border:0;padding:0 14px;font-size:16px;background:#f3efe6;color:#111}' +
    '.lv-add .go{flex:none;min-width:64px;height:44px;border-radius:14px;border:0;background:var(--teal);color:#04201c;font-weight:800;font-size:14px}' +
    '.lv-add .r2{display:none;gap:8px;margin-top:8px;align-items:center}.lv-add.open .r2{display:flex}.lv-add .kd{display:flex;border-radius:12px;overflow:hidden;border:1px solid rgba(255,255,255,.25);flex:none}' +
    '.lv-add .kd button{min-height:44px;padding:0 12px;background:none;border:0;color:#cfd9da;font-size:13px;font-weight:700}.lv-add .kd button.on{background:var(--yel);color:#111}.lv-add .kd button.kev.on{background:var(--pink);color:#fff}' +
    '.lv-add input.dt{flex:1;min-width:0;height:44px;border-radius:12px;border:0;padding:0 8px;font-size:16px;background:rgba(255,255,255,.14);color:#fff;color-scheme:dark}' +
    '@media (prefers-reduced-motion:reduce){.lv,.lv.on,.lv.out{clip-path:none;transition:opacity .2s ease,visibility 0s;opacity:0}.lv.on{opacity:1}.lv.on .lv-ln,.lv.on .lv-id{animation:none}.lv .lv-art{transform:none;transition:none}.lv-pn{transition:none}}';
  document.head.appendChild(css);

  var E = function (t, c, x) { var e = document.createElement(t); if (c) e.className = c; if (x != null) e.textContent = x; return e; };
  var lv = E('section', 'lv'); lv.id = 'lvToday'; lv.setAttribute('aria-label', '오늘');
  var art = E('img', 'lv-art'); art.alt = ''; art.decoding = 'async';
  var top = E('div', 'lv-top'), back = E('button', 'lv-back'); back.innerHTML = '<svg viewBox="0 0 24 24"><path d="M15 5l-7 7 7 7"/></svg>통화';
  var ttl = E('div', 'lv-ttl'); top.append(back, ttl);
  var pn = E('div', 'lv-pn'), hd = E('div', 'lv-hd'), bd = E('div', 'lv-bd'); hd.appendChild(E('i'));
  var say = E('div', 'lv-say'), sayP = E('p'); say.append(E('u'), sayP); var stats = E('div', 'lv-st'); hd.append(say, stats); pn.append(hd, bd);
  var add = E('div', 'lv-add');
  lv.append(art, E('div', 'lv-sh'), E('div', 'lv-ln'), E('div', 'lv-id', '1번 회선 · 오늘'), top, pn, add); app.appendChild(lv);

  var WDN = '일월화수목금토', kind = 'todo';
  var tk = function () { return window.lenaStudy ? lenaStudy.todayK() : new Date().toISOString().slice(0, 10); };
  var toT = function (m) { return window.lenaStudy ? lenaStudy.toT(m) : ''; };
  function rowsNow() {
    var D = null, rows = []; try { var P = lenaStudy.plan(); D = P.days[0] || null; rows = lenaStudy.dayRows(tk(), D); } catch (e) { rows = []; }
    return rows;
  }
  var COL = { ev: 'var(--pink)', todo: 'var(--yel)', fix: '#8a9aa0', play: '#6b7a80', ex: 'var(--hot)', log: 'var(--teal)' }, LB = { ev: '일정', todo: '할 일 마감', fix: '고정', play: '휴식', ex: '시험', log: '끝낸 공부' };
  function line(st) {                                 // 레나의 한마디: 지금 상황으로
    var n = (S.name || '') ? S.name : '';
    if (st.late) return '밀린 거 ' + st.late + '개 있네. 그것부터 치우자' + (n ? ', ' + n : '') + '.';
    if (st.next) { var m = Math.round((st.next.s - st.nowM)); return (m <= 60 ? m + '분 뒤에 ' : toT(st.next.s) + '에 ') + '\'' + st.next.txt.replace(/ \(마감\)$/, '').slice(0, 16) + '\'. ' + (m <= 20 ? '슬슬 준비해.' : '그 전까진 여유 있어.'); }
    if (st.left) return '시간 정해진 건 끝. 남은 할 일 ' + st.left + '개는 천천히 해도 돼.';
    if (st.total) return '오늘 할 건 다 했네. 잘했어' + (n ? ', ' + n : '') + '.';
    return '오늘은 비어 있어. 뭐 할지 나한테 말해 볼래?';
  }
  function ck(fn, done) { var b = E('button', 'tv-ck'); b.setAttribute('aria-label', done ? '끝냄 취소' : '끝냄'); b.innerHTML = '<svg viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>'; b.onclick = fn; return b; }
  function render() {
    var now = new Date(), nowM = now.getHours() * 60 + now.getMinutes(), rows = rowsNow();
    ttl.innerHTML = ''; ttl.append(E('small', null, '1번 회선'), E('b', null, (now.getMonth() + 1) + '월 ' + now.getDate() + '일 ' + WDN[now.getDay()] + '요일'));
    var free = S.items.filter(function (t) { return !t.done && !t.rid && !isEv(t) && !t.due; });
    var lateIt = S.items.filter(function (t) { return isLate(t) && t.due.slice(0, 10) < tk(); });
    var act = rows.filter(function (o) { return o.kind === 'ev' || o.kind === 'todo' || o.kind === 'st'; });
    var doneN = rows.filter(function (o) { return o.kind === 'log' || o.done; }).length;
    var next = rows.filter(function (o) { return o.s >= nowM && !o.done && (o.kind === 'ev' || o.kind === 'todo' || o.kind === 'st' || o.kind === 'fix'); })[0];
    var lateToday = rows.filter(function (o) { return o.kind === 'todo' && !o.done && o.s < nowM; }).length;
    var st = { late: lateIt.length + lateToday, next: next, nowM: nowM, left: free.length, total: act.length + doneN };
    sayP.textContent = line(st);
    stats.innerHTML = '';
    var chip = function (l, v, c) { var s = E('span', c || ''); s.append(l + ' ', E('b', null, v)); stats.appendChild(s); };
    chip('끝냄', doneN + '/' + (act.length + doneN)); if (st.late) chip('밀림', st.late, 'late'); if (free.length) chip('언제든', free.length);
    var stM = rows.filter(function (o) { return o.kind === 'st'; }).reduce(function (a, o) { return a + (o.mins || 0); }, 0); if (stM) chip('공부', Math.floor(stM / 60) ? Math.floor(stM / 60) + '시간 ' + (stM % 60 ? stM % 60 + '분' : '') : stM + '분');
    bd.innerHTML = '';
    if (lateIt.length) {
      bd.appendChild(E('div', 'lv-sec', '밀린 것'));
      lateIt.forEach(function (t) { var r = E('div', 'tv-r late'); r.style.setProperty('--c', 'var(--hot)'); var w = E('div', 'tv-w'); w.append(E('em', null, when(t.due) + '까지였어'), t.text); r.append(E('div', 'tv-t', '지남'), w, ck(function () { fin(t, r); })); bd.appendChild(r); });
    }
    bd.appendChild(E('div', 'lv-sec', '오늘 시간표'));
    if (!rows.length) bd.appendChild(E('div', 'tv-em', '시간 정해진 건 없어.\n아래 칸에 적거나, 통화로 나한테 말해.'));
    var put = false;
    rows.forEach(function (o) {
      if (!put && o.s >= nowM && rows.length) { put = true; bd.appendChild(E('div', 'tv-now', '지금 ' + toT(nowM))); }
      var dn = o.kind === 'log' || o.done, end = o.s + (o.mins || 0), r = E('div', 'tv-r' + (dn ? ' dn' : '') + (!dn && o.s >= 0 && end < nowM && o.kind !== 'todo' ? ' past' : '') + (o.kind === 'todo' && !dn && o.s < nowM ? ' late' : ''));
      var c = o.sub && window.lenaStudy ? lenaStudy.colOf(o.sub) : COL[o.kind] || '#667'; r.style.setProperty('--c', c);
      var t = E('div', 'tv-t', o.s < 0 ? '종일' : toT(o.s)); if (o.mins && o.kind !== 'play') t.appendChild(E('small', null, o.mins + '분'));
      var w = E('div', 'tv-w'); w.append(E('em', null, o.sub ? (/^(할 일|루틴)$/.test(o.sub) ? o.sub : o.sub + ' 공부') + (o.kind === 'log' ? ' · 끝냄' : '') : LB[o.kind] || ''), o.txt.replace(/ \(마감\)$/, ''));
      r.append(t, w);
      if (o.kind === 'todo' && o.it) r.appendChild(ck(function () { fin(o.it, r); }, dn));
      else if (o.kind === 'st') r.appendChild(ck(function () { try { (o.bs || [o.b]).forEach(function (b) { lenaStudy.finishBlock(b); }); } catch (e) {} toast('끝! 수고했어.'); render(); }));
      bd.appendChild(r);
    });
    if (!put && rows.length) bd.appendChild(E('div', 'tv-now', '지금 ' + toT(nowM)));
    if (free.length) {
      bd.appendChild(E('div', 'lv-sec', '언제든 할 일'));
      free.forEach(function (t) { var r = E('div', 'tv-r'); r.style.setProperty('--c', 'var(--yel)'); var w = E('div', 'tv-w'); w.append(t.text); r.append(E('div', 'tv-t', '—'), w, ck(function () { fin(t, r); })); bd.appendChild(r); });
    }
    var lk = E('div', 'tv-lk'); [['달력', function () { openSheet('cal'); }], ['주간 시간표', function () { openSheet('tt'); }], ['전단지 전체', function () { openBoard('all'); }]].forEach(function (x) { var b = E('button', null, x[0]); b.onclick = x[1]; lk.appendChild(b); }); bd.appendChild(lk);
  }
  function fin(t, r) {
    if (t.done) { setDone(t, false); save(); render(); return; }
    try { tearSound(); } catch (e) {} r.classList.add('dn'); setTimeout(function () { setDone(t, true); save(); try { pushSync(true); } catch (e) {} render(); }, 260);
    var snap = t; toast('\'' + t.text + '\' 끝', function () { setDone(snap, false); save(); render(); });
  }
  // 넣기 칸 (할 일 / 일정)
  var tx = E('input', 'tx'); tx.type = 'text'; tx.placeholder = '오늘 할 것 적기…'; tx.autocomplete = 'off'; tx.enterKeyHint = 'done'; tx.setAttribute('aria-label', '할 일이나 일정');
  var go = E('button', 'go', '붙이기'), r1 = E('div', 'r1'); r1.append(tx, go);
  var kd = E('div', 'kd'), bT = E('button', 'on', '할 일'), bE = E('button', 'kev', '일정'), dt = E('input', 'dt'); dt.type = 'datetime-local'; dt.setAttribute('aria-label', '시간');
  kd.append(bT, bE); var r2 = E('div', 'r2'); r2.append(kd, dt); add.append(r1, r2);
  function setK(k) { kind = k; bT.classList.toggle('on', k === 'todo'); bE.classList.toggle('on', k === 'event'); }
  bT.onclick = function () { setK('todo'); }; bE.onclick = function () { setK('event'); if (!dt.value) { var d = new Date(Date.now() + 3600e3); d.setMinutes(0, 0, 0); dt.value = tk() + 'T' + String(d.getHours()).padStart(2, '0') + ':00'; } };
  tx.addEventListener('focus', function () { add.classList.add('open'); pn.classList.remove('peek'); pn.classList.add('full'); });
  function submit() {
    var v = tx.value.trim(); if (!v) { tx.focus(); return; }
    if (kind === 'event' && !dt.value) { toast('일정은 시간을 넣어 줘.'); dt.focus(); return; }
    addItem(v, dt.value, kind); save(); try { pushSync(true); } catch (e) {}
    tx.value = ''; dt.value = ''; tx.blur(); add.classList.remove('open'); render(); toast('\'' + v + '\' 붙였어.');
  }
  go.onclick = submit; tx.addEventListener('keydown', function (e) { if (e.key === 'Enter' && !e.isComposing) submit(); });

  // 유리판: 손잡이를 끌거나 눌러서 3단계(살짝 / 보통 / 가득)
  var states = ['peek', '', 'full'], cur = 1, dg = null;
  function setP(i) { cur = Math.max(0, Math.min(2, i)); pn.classList.remove('peek', 'full', 'drag'); pn.style.transform = ''; if (states[cur]) pn.classList.add(states[cur]); }
  hd.addEventListener('pointerdown', function (e) { if (e.target.closest('button')) return; hd.setPointerCapture(e.pointerId); dg = { y: e.clientY, t: performance.now(), base: [74, 36, 0][cur], h: pn.offsetHeight, mv: 0 }; });
  hd.addEventListener('pointermove', function (e) { if (!dg) return; var dy = e.clientY - dg.y; dg.mv = dy; if (Math.abs(dy) < 6) return; pn.classList.add('drag'); pn.style.transform = 'translateY(' + Math.max(0, Math.min(80, dg.base + dy / dg.h * 100)) + '%)'; });
  function hdUp() { if (!dg) return; var dy = dg.mv, v = dy / Math.max(1, performance.now() - dg.t); dg = null; if (Math.abs(dy) < 6) { setP(cur === 2 ? 1 : 2); return; } var p = [74, 36, 0][cur] + dy / pn.offsetHeight * 100; if (Math.abs(v) > .5) setP(cur + (v < 0 ? 1 : -1)); else setP(p > 56 ? 0 : p > 18 ? 1 : 2); }
  hd.addEventListener('pointerup', hdUp); hd.addEventListener('pointercancel', hdUp);

  var tm = 0, opened = false;
  function open() {
    if (opened) return; opened = true;
    if (!art.src) art.src = 'assets/lena/menu/today.webp';
    setP(1); setK('todo'); render(); bd.scrollTop = 0;
    lv.classList.remove('out'); void lv.offsetWidth; lv.classList.add('on');
    clearInterval(tm); tm = setInterval(function () { if (opened && !document.hidden && document.activeElement !== tx && document.activeElement !== dt) render(); }, 30000);
    setTimeout(function () { var n = bd.querySelector('.tv-now'); if (n && cur !== 0) bd.scrollTop = Math.max(0, n.offsetTop - bd.offsetTop - 70); }, 60);
  }
  function close() { if (!opened) return; opened = false; clearInterval(tm); tx.blur(); add.classList.remove('open'); lv.classList.add('out'); lv.classList.remove('on'); try { renderHome(); } catch (e) {} }
  back.onclick = function () { try { dtmf(0); } catch (e) {} close(); };
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && opened && !document.getElementById('sheet').classList.contains('open')) close(); });
  // 다른 시트에서 고치고 돌아오면 새로 그림
  try { var _cs = closeSheet; closeSheet = function () { _cs.apply(this, arguments); if (opened) render(); }; } catch (e) {}
  // 들어오는 길: 음성통화 화면 '전단지' 버튼 → '오늘'
  var ab = document.getElementById('aBoard');
  if (ab) { ab.onclick = function () { try { dtmf(1); } catch (e) {} open(); }; for (var i = 0; i < ab.childNodes.length; i++) if (ab.childNodes[i].nodeType === 3 && ab.childNodes[i].textContent.trim()) ab.childNodes[i].textContent = '오늘'; }
  window.lenaToday = { open: open, close: close, render: render, get on() { return opened; } };
})();
