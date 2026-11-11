/* v122 회선(창구) 화면 — 설정: 심야 교환국 LENA-LINE. 직원은 레나 한 명, 창구가 넷(1 비서·오늘 / 2 일정·학습·계획 / 3 교환·연락 / 4 오락·놀이).
   규정상 창구마다 근무복이 달라서 회선이 바뀔 때마다 갈아입고 받는다. 영상 회선은 단골 전용 비밀 회선이라 밖에서는 금지 →
   밖(.app.outside)에서는 일반 회선 담당 고양이가 수화기를 들고 레나 말을 전한다(레나 그림은 어디에도 안 나옴).
   구조: 기존 시트(#sheet)를 그대로 내용판으로 쓰고, 그 뒤에 창구 배경(.lv)을 깐다. 어떤 길로든 창구에 속한 시트를 열면 그 창구로 들어감. */
(function () {
  'use strict';
  var app = document.querySelector('.app'), sheet = document.getElementById('sheet'); if (!app || !sheet || typeof S === 'undefined') return;
  var LINES = [
    { n: 1, name: '오늘', desk: '비서 창구', art: 'today', tabs: [['today', '오늘'], [1, '전체']] },
    { n: 2, name: '계획', desk: '일정·학습 창구', art: 'plan', tabs: [['cal', '달력'], ['tt', '시간표'], [6, '공부']] },
    { n: 3, name: '연락', desk: '교환 창구', art: 'contact', tabs: [['call', '전화'], ['memo', '메모'], [7, '모닝콜']] },
    { n: 4, name: '놀이', desk: '오락 창구', art: 'play', tabs: [['shop', '자판기'], [8, '오락실'], ['fort', '운세']] }
  ];
  var ALIAS = { 3: 'shop', 2: 'fort', 4: 'call', 5: 'call', 9: 'call', '*': 'call' }, OF = {};
  LINES.forEach(function (L) { L.tabs.forEach(function (t) { OF[t[0]] = L; }); });
  var norm = function (k) { return ALIAS[k] != null ? ALIAS[k] : k; };

  var css = document.createElement('style');
  css.textContent =
    '.lv{position:absolute;inset:0;z-index:25;background:#06090a;overflow:hidden;visibility:hidden;clip-path:inset(0 0 100% 0);transition:clip-path .3s cubic-bezier(0.23,1,0.32,1),visibility 0s .3s}' +
    '.lv.on{visibility:visible;clip-path:inset(0 0 0 0);transition:clip-path .3s cubic-bezier(0.23,1,0.32,1)}.lv.out{transition:clip-path .2s cubic-bezier(0.23,1,0.32,1),visibility 0s .2s}' +
    '.lv-art{position:absolute;left:0;top:0;width:100%;height:80%;object-fit:cover!important;object-position:50% 0}.app.outside .lv-art{display:none}' +
    '.lv-sh{position:absolute;inset:0;background:linear-gradient(180deg,rgba(0,0,0,.82),rgba(0,0,0,.35) 20%,transparent 34%,transparent 44%,#0e1315 76%);pointer-events:none}.app.outside .lv-sh{background:#0e1315}' +
    '.lv-ln{position:absolute;left:0;right:0;top:0;height:3px;background:var(--pink);box-shadow:0 0 18px 4px rgba(255,61,154,.75);opacity:0;pointer-events:none;z-index:5}.lv.conn .lv-ln{animation:lvLn .3s cubic-bezier(0.23,1,0.32,1)}@keyframes lvLn{0%{transform:translateY(0);opacity:1}85%{opacity:1}100%{transform:translateY(100vh);opacity:0}}' +
    '.lv-top{position:absolute;left:0;right:0;top:0;padding:calc(env(safe-area-inset-top,0px) + 14px) 16px 0;display:flex;align-items:flex-start;gap:12px;z-index:3}' +
    '.lv-av{display:none;flex:none;width:48px;height:48px;border-radius:50%;background:#9be8c9 url(assets/lena/cat.jpg) center/cover;border:2px solid #000;box-shadow:2px 2px 0 var(--mint)}.app.outside .lv-av{display:block}' +
    '.lv-ttl{flex:1;min-width:0;color:#fff;text-shadow:0 1px 6px rgba(0,0,0,.9),0 0 2px rgba(0,0,0,.9)}.lv-ttl b{display:block;font:400 28px/1.1 "Black Han Sans",sans-serif;letter-spacing:.5px}' +
    '.lv-ttl p{margin:6px 0 0;font-size:15px;line-height:1.45;font-weight:600;color:#fff;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;word-break:keep-all}' +
    '.lv-md{flex:none;min-height:44px;padding:0 14px;border-radius:22px;background:rgba(0,0,0,.6);border:1px solid rgba(255,255,255,.3);color:#fff;font-size:13px;font-weight:700;display:flex;align-items:center;gap:6px}.lv-md i{width:8px;height:8px;border-radius:50%;background:var(--pink);box-shadow:0 0 8px var(--pink)}.app.outside .lv-md i{background:var(--mint);box-shadow:0 0 8px var(--mint)}' +
    /* 시트를 창구 내용판으로 */
    '.sheet.ln,.sheet.ln.open{background:transparent;z-index:30;pointer-events:none}.sheet.ln.open .panel{pointer-events:auto}' +
    '.sheet.ln .panel{height:64%;max-height:none;background:#0e1315;border-top:2px solid var(--teal);box-shadow:0 -10px 30px rgba(0,0,0,.5);transition:transform .32s var(--ease),height .28s cubic-bezier(0.32,0.72,0,1)}.sheet.ln .panel::before{display:none}' +
    '.app.outside .sheet.ln .panel{height:calc(100% - env(safe-area-inset-top,0px) - 148px)}.sheet.ln.lnfull .panel{height:calc(100% - env(safe-area-inset-top,0px) - 64px)}' +
    '.sheet.ln .sbody{flex:1;min-height:0;padding-top:8px}.sheet.ln .shead{display:none}.sheet.ln[data-k="1"] .sbody>.tabs:first-child{display:none}' +
    '.ln-hd{display:none;flex:none;height:20px;cursor:pointer;touch-action:manipulation}.sheet.ln .ln-hd{display:block}.ln-hd:before{content:"";display:block;width:44px;height:5px;border-radius:3px;background:rgba(255,255,255,.4);margin:8px auto 0}' +
    '.ln-bar{display:none;flex:none;padding:2px 14px 6px}.sheet.ln .ln-bar{display:block}' +
    '.ln-tabs{display:flex;gap:4px;padding:4px;border-radius:14px;background:rgba(255,255,255,.08)}.ln-tabs button{flex:1;min-height:42px;border-radius:10px;background:none;border:0;color:#c3cfd1;font-size:15px;font-weight:700}.ln-tabs button.on{background:var(--paper);color:#111}' +
    '.ln-nav{display:none;flex:none;padding:6px 8px;border-top:1px solid rgba(255,255,255,.14);background:#090d0e}.sheet.ln .ln-nav{display:flex}' +
    '.ln-nav button{flex:1;min-height:52px;border-radius:12px;background:none;border:0;color:#aebabc;font-size:13px;font-weight:700;display:flex;align-items:center;justify-content:center;position:relative}.ln-nav button.on{background:rgba(47,224,200,.16);color:var(--teal)}.ln-nav button.bk{flex:.8;color:#fff}' +
    '.ln-nav em{position:absolute;top:6px;right:14%;min-width:16px;height:16px;border-radius:8px;background:var(--hot);color:#fff;font:700 10px/16px "Space Mono",monospace;font-style:normal;padding:0 4px}' +
    /* 오늘 */
    '.lv-st{display:flex;gap:6px;flex-wrap:wrap;margin:2px 0 10px}.lv-st span{font-size:13px;font-weight:700;padding:6px 10px;border-radius:12px;background:#1a2124;color:#e6eeef}.lv-st span b{color:var(--mint)}.lv-st span.late b{color:var(--hot)}' +
    '.lv-sec{margin:16px 2px 8px;font-size:14px;font-weight:700;color:var(--mint);display:flex;align-items:center;gap:6px}.lv-sec:before{content:"";width:4px;height:13px;border-radius:2px;background:var(--pink)}' +
    '.tv-r{display:flex;align-items:center;gap:10px;min-height:56px;padding:8px 8px 8px 12px;border-radius:14px;background:#1a2124;margin-bottom:6px;border-left:4px solid var(--c,#667)}.tv-r.past{opacity:.6}.tv-r.dn{opacity:.55}.tv-r.dn .tv-w{text-decoration:line-through}.tv-r.late{background:rgba(255,46,110,.14)}' +
    '.tv-t{flex:none;width:48px;font:700 14px "Space Mono",monospace;color:#fff}.tv-t small{display:block;font-size:11px;color:#b5c2c4;font-weight:400}' +
    '.tv-w{flex:1;min-width:0;font-size:15px;line-height:1.4;color:#fff;word-break:keep-all;overflow-wrap:anywhere}.tv-w em{font-style:normal;font-size:12px;font-weight:700;color:var(--c,#9fb0b3);display:block}' +
    '.tv-ck{flex:none;width:40px;height:40px;border-radius:50%;border:2px solid rgba(255,255,255,.45);background:none;display:grid;place-items:center;transition:transform .14s cubic-bezier(0.23,1,0.32,1)}.tv-ck:active{transform:scale(.9)}.tv-ck svg{width:18px;height:18px;fill:none;stroke:#fff;stroke-width:2.6;stroke-linecap:round;stroke-linejoin:round;opacity:.5}.tv-r.dn .tv-ck{background:var(--teal);border-color:var(--teal)}.tv-r.dn .tv-ck svg{stroke:#04201c;opacity:1}' +
    '.tv-now{display:flex;align-items:center;gap:8px;margin:8px 2px;font:700 11px "Space Mono",monospace;color:var(--pink)}.tv-now:after{content:"";flex:1;height:2px;background:var(--pink);box-shadow:0 0 8px var(--pink)}' +
    '.tv-em{padding:18px 10px;text-align:center;color:#9fb0b3;font-size:14px;line-height:1.6;white-space:pre-line}' +
    '.tv-add{padding:0;background:none;border:0;margin-bottom:6px}.tv-add .r1{display:flex;gap:8px}.tv-add input.tx{flex:1;min-width:0;height:44px;border-radius:12px;border:0;padding:0 14px;font-size:16px;background:#f3efe6;color:#111}' +
    '.tv-add .go{flex:none;min-width:64px;height:44px;border-radius:12px;border:0;background:var(--teal);color:#04201c;font-weight:800;font-size:14px}.tv-add .r2{display:none;gap:8px;margin-top:8px;align-items:center}.tv-add.open .r2{display:flex}' +
    '.tv-add .kd{display:flex;border-radius:12px;overflow:hidden;border:1px solid rgba(255,255,255,.25);flex:none}.tv-add .kd button{min-height:44px;padding:0 12px;background:none;border:0;color:#cfd9da;font-size:13px;font-weight:700}.tv-add .kd button.on{background:var(--yel);color:#111}.tv-add .kd button.kev.on{background:var(--pink);color:#fff}' +
    '.tv-add input.dt{flex:1;min-width:0;height:44px;border-radius:12px;border:0;padding:0 8px;font-size:16px;background:rgba(255,255,255,.14);color:#fff;color-scheme:dark}' +
    '@media (prefers-reduced-motion:reduce){.lv,.lv.on,.lv.out{clip-path:none;transition:opacity .2s ease,visibility 0s;opacity:0}.lv.on{opacity:1}.lv.conn .lv-ln{animation:none}.sheet.ln .panel{transition:none}}';
  document.head.appendChild(css);

  var E = function (t, c, x) { var e = document.createElement(t); if (c) e.className = c; if (x != null) e.textContent = x; return e; };
  // 배경(창구)
  var lv = E('section', 'lv'); lv.id = 'lvLine';
  var art = E('img', 'lv-art'); art.alt = ''; art.decoding = 'async';
  var top = E('div', 'lv-top'), ttl = E('div', 'lv-ttl'), md = E('button', 'lv-md'); top.append(E('div', 'lv-av'), ttl, md);
  lv.append(art, E('div', 'lv-sh'), E('div', 'lv-ln'), top); app.appendChild(lv);
  // 시트에 손잡이·한마디·탭·아래 메뉴를 끼움
  var panel = sheet.querySelector('.panel'), shead = panel.querySelector('.shead'), sbody = panel.querySelector('.sbody');
  var hdl = E('div', 'ln-hd'); hdl.setAttribute('role', 'button'); hdl.setAttribute('aria-label', '판 크기 바꾸기'); panel.insertBefore(hdl, shead);
  var bar = E('div', 'ln-bar'), tabs = E('div', 'ln-tabs'); bar.appendChild(tabs); panel.insertBefore(bar, sbody);
  var nav = E('div', 'ln-nav'); panel.appendChild(nav);
  hdl.onclick = function () { sheet.classList.toggle('lnfull'); };

  var cur = null, key = null, last = {}, shown = null, guard = 0;
  var outside = function () { return app.classList.contains('outside'); };
  var tk = function () { return window.lenaStudy ? lenaStudy.todayK() : new Date().toISOString().slice(0, 10); };
  var toT = function (m) { return window.lenaStudy ? lenaStudy.toT(m) : ''; };

  // ---------- 창구별 한마디 (실제 상황으로, 반말) ----------
  function todayStat() {
    var now = new Date(), nowM = now.getHours() * 60 + now.getMinutes(), rows = []; try { rows = lenaStudy.dayRows(tk(), lenaStudy.plan().days[0] || null); } catch (e) {}
    var free = S.items.filter(function (t) { return !t.done && !t.rid && !isEv(t) && !t.due; });
    var lateIt = S.items.filter(function (t) { return isLate(t) && t.due.slice(0, 10) < tk(); });
    var act = rows.filter(function (o) { return (o.kind === 'ev' || o.kind === 'todo' || o.kind === 'st') && !o.done; });
    var doneN = rows.filter(function (o) { return o.kind === 'log' || o.done; }).length;
    var next = rows.filter(function (o) { return o.s >= nowM && !o.done && (o.kind === 'ev' || o.kind === 'todo' || o.kind === 'st' || o.kind === 'fix'); })[0];
    var lateToday = rows.filter(function (o) { return o.kind === 'todo' && !o.done && o.s < nowM; }).length;
    return { rows: rows, nowM: nowM, free: free, lateIt: lateIt, act: act, doneN: doneN, next: next, late: lateIt.length + lateToday };
  }
  var SAY = {
    1: function () {
      var st = todayStat(), n = S.name || '';
      if (st.late) return '밀린 거 ' + st.late + '개 있네. 그것부터 치우자' + (n ? ', ' + n : '') + '.';
      if (st.next) { var m = Math.round(st.next.s - st.nowM); return (m <= 60 ? m + '분 뒤에 ' : toT(st.next.s) + '에 ') + '\'' + st.next.txt.replace(/ \(마감\)$/, '').slice(0, 16) + '\'. ' + (m <= 20 ? '슬슬 준비해.' : '그 전까진 여유 있어.'); }
      if (st.free.length) return '시간 정해진 건 끝. 남은 할 일 ' + st.free.length + '개는 천천히 해도 돼.';
      if (st.act.length + st.doneN) return '오늘 할 건 다 했네. 잘했어' + (n ? ', ' + n : '') + '.';
      return '오늘은 비어 있어. 뭐 할지 적어 볼래?';
    },
    2: function () {
      var t = tk(), ex = ((S.study || {}).exams || []).filter(function (e) { return e.date >= t; }).sort(function (a, b) { return a.date < b.date ? -1 : 1; })[0];
      if (ex) { var d = Math.round((new Date(ex.date + 'T00:00') - new Date(t + 'T00:00')) / 86400e3); return ex.name + (d ? '까지 D-' + d : ' 당일') + '. 하루치만 하면 돼, 내가 나눠 놨어.'; }
      var wk = S.items.filter(function (x) { return !x.done && isEv(x) && x.due && x.due.slice(0, 10) >= t && (new Date(x.due) - Date.now()) < 7 * 86400e3; }).length;
      return wk ? '이번 주 일정 ' + wk + '개. 달력에 다 넣어 놨어.' : '아직 계획이 비었어. 시험이나 일정부터 넣자.';
    },
    3: function () {
      var ms = 0; try { ms = missed().length; } catch (e) {} if (ms) return '부재중 ' + ms + '개 와 있어. 확인해.';
      var rs = (S.calls || []).filter(function (c) { return !c.done && c.at > Date.now(); }).length; if (rs) return '예약 전화 ' + rs + '개 걸어 놨어. 시간 되면 내가 걸게.';
      var mm = (S.memos || []).length; return mm ? '메모 ' + mm + '개 맡아 두고 있어.' : '조용하네. 맡길 메모나 전화 있어?';
    },
    4: function () { var g = S.gc || 0; return g ? '동전 ' + g + '개 있네. 한 판 할래?' : '동전이 없네. 내일 또 들어와.'; }
  };

  // ---------- 그리기 ----------
  function paint() {
    if (!cur) return; var o = outside();
    var txt = ''; try { txt = SAY[cur.n](); } catch (e) {}
    ttl.innerHTML = ''; ttl.append(E('b', null, cur.name), E('p', null, txt));
    md.innerHTML = ''; md.append(E('i'), o ? '밖이야' : '혼자야'); md.setAttribute('aria-label', o ? '지금 밖 모드. 누르면 영상 회선으로' : '지금 영상 회선. 누르면 밖 모드로');
    if (!o) { var src = 'assets/lena/menu/' + cur.art + '.webp'; if (art.getAttribute('src') !== src) { art.src = src; try { art.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 220, easing: 'ease' }); } catch (e) {} } }
    sheet.dataset.k = String(norm(key));
    tabs.innerHTML = ''; cur.tabs.forEach(function (t) { var b = E('button', norm(key) === t[0] ? 'on' : '', t[1]); b.onclick = function () { if (t[0] === 1) try { boardTab = 'all'; } catch (e) {} openSheet(t[0]); }; tabs.appendChild(b); });
    nav.innerHTML = ''; var bk = E('button', 'bk', '‹ 통화'); bk.onclick = function () { closeSheet(); }; nav.appendChild(bk);
    var ms = 0; try { ms = missed().length; } catch (e) {}
    LINES.forEach(function (L) { var b = E('button', L === cur ? 'on' : '', L.name); if (L.n === 3 && ms) b.appendChild(E('em', null, String(ms))); b.onclick = function () { if (L !== cur) openLine(L.n); }; nav.appendChild(b); });
    if (sheet.classList.contains('ln')) document.getElementById('shNum').textContent = String(cur.n);
  }
  function enter(L, k) {
    var fresh = !cur; if (cur !== L) sheet.classList.remove('lnfull');
    cur = L; key = k; last[L.n] = k; sheet.classList.add('ln'); if (k === 8) sheet.classList.add('lnfull'); paint();
    if (fresh) { lv.classList.remove('out'); void lv.offsetWidth; lv.classList.add('on', 'conn'); setTimeout(function () { lv.classList.remove('conn'); }, 400); }
  }
  function leave() { if (!cur) return; cur = null; key = null; sheet.classList.remove('ln', 'lnfull'); lv.classList.add('out'); lv.classList.remove('on'); }
  function openLine(n) { var L = LINES[n - 1]; if (!L) return; try { dtmf(n); } catch (e) {} var k = last[n] || L.tabs[0][0]; if (k === 1) try { boardTab = 'all'; } catch (e) {} openSheet(k); }

  // 어떤 길로 열든 창구에 속한 시트면 그 창구로 들어감
  var _os = openSheet;
  openSheet = function (n) {
    if (norm(n) === 1) try { boardTab = 'all'; } catch (e) {}
    guard++; try { _os(n); } finally { guard--; }
    var k = norm(typeof curSheet !== 'undefined' ? curSheet : n), L = sheet.classList.contains('open') ? OF[k] : null;
    shown = sheet.classList.contains('open') ? k : null;
    if (L) enter(L, k); else if (cur) { sheet.classList.remove('ln', 'lnfull'); }          // 설정 같은 창구 밖 시트는 평소 모양으로 위에 뜸
  };
  var _rs = refreshSheet; refreshSheet = function () { _rs(); if (cur && sheet.classList.contains('ln')) { paint(); } };
  var _ob = openBoard; openBoard = function (tab) { if (!tab || tab === 'today') return openSheet('today'); return _ob(tab); };
  document.getElementById('shX').onclick = function () { closeSheet(); };
  // 시트가 닫히면: 창구 시트였으면 통화로 돌아가고, 창구 위에 띄운 다른 시트였으면 창구로 돌아옴
  new MutationObserver(function () {
    if (guard || sheet.classList.contains('open') || !cur) return;
    var was = shown; shown = null;
    if (was != null && !OF[was]) { var n = cur.n; setTimeout(function () { if (cur && !sheet.classList.contains('open')) openSheet(last[n] || cur.tabs[0][0]); }, 30); }
    else leave();
  }).observe(sheet, { attributes: true, attributeFilter: ['class'] });
  // 밖 ↔ 영상 회선
  md.onclick = function () { try { if (outside()) toVideo(); else { dtmf(1); toAudio(); } } catch (e) {} paint(); };
  new MutationObserver(function () { if (cur) paint(); }).observe(app, { attributes: true, attributeFilter: ['class'] });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && cur) closeSheet(); });

  // ---------- 1번 창구 '오늘' 시트 ----------
  var COL = { ev: 'var(--pink)', todo: 'var(--yel)', fix: '#8a9aa0', play: '#6b7a80', ex: 'var(--hot)', log: 'var(--teal)' }, LB = { ev: '일정', todo: '할 일 마감', fix: '고정', play: '휴식', ex: '시험', log: '끝낸 공부' }, WDN = '일월화수목금토', addKind = 'todo', addOpen = false;
  function ck(fn, done) { var b = E('button', 'tv-ck'); b.setAttribute('aria-label', done ? '끝냄 취소' : '끝냄'); b.innerHTML = '<svg viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>'; b.onclick = fn; return b; }
  function fin(t, r) {
    if (t.done) { setDone(t, false); save(); refreshSheet(); return; }
    try { tearSound(); } catch (e) {} r.classList.add('dn'); setTimeout(function () { setDone(t, true); save(); try { pushSync(true); } catch (e) {} refreshSheet(); }, 260);
    toast('\'' + t.text + '\' 끝', function () { setDone(t, false); save(); refreshSheet(); });
  }
  function addBox(B) {
    var w = E('div', 'tv-add' + (addOpen ? ' open' : '')), tx = E('input', 'tx'); tx.type = 'text'; tx.placeholder = '오늘 할 것 적기…'; tx.autocomplete = 'off'; tx.enterKeyHint = 'done'; tx.setAttribute('aria-label', '할 일이나 일정');
    var go = E('button', 'go', '붙이기'), r1 = E('div', 'r1'); r1.append(tx, go);
    var kd = E('div', 'kd'), bT = E('button', addKind === 'todo' ? 'on' : '', '할 일'), bE = E('button', 'kev' + (addKind === 'event' ? ' on' : ''), '일정'), dt = E('input', 'dt'); dt.type = 'datetime-local'; dt.setAttribute('aria-label', '시간');
    kd.append(bT, bE); var r2 = E('div', 'r2'); r2.append(kd, dt); w.append(r1, r2);
    var setK = function (k) { addKind = k; bT.classList.toggle('on', k === 'todo'); bE.classList.toggle('on', k === 'event'); };
    bT.onclick = function () { setK('todo'); }; bE.onclick = function () { setK('event'); if (!dt.value) { var d = new Date(Date.now() + 3600e3); dt.value = tk() + 'T' + String(d.getHours()).padStart(2, '0') + ':00'; } };
    tx.addEventListener('focus', function () { addOpen = true; w.classList.add('open'); sheet.classList.add('lnfull'); });
    var submit = function () {
      var v = tx.value.trim(); if (!v) { tx.focus(); return; }
      if (addKind === 'event' && !dt.value) { toast('일정은 시간을 넣어 줘.'); dt.focus(); return; }
      addItem(v, dt.value, addKind); save(); try { pushSync(true); } catch (e) {} addOpen = false; addKind = 'todo'; tx.blur(); refreshSheet(); toast('\'' + v + '\' 붙였어.');
    };
    go.onclick = submit; tx.addEventListener('keydown', function (e) { if (e.key === 'Enter' && !e.isComposing) submit(); });
    B.appendChild(w);
  }
  SH.today = {
    t: '오늘',
    s: function () { var d = new Date(); return (d.getMonth() + 1) + '월 ' + d.getDate() + '일 ' + WDN[d.getDay()] + '요일'; },
    r: function (B) {
      var st = todayStat(), rows = st.rows, nowM = st.nowM;
      var stats = E('div', 'lv-st'), chip = function (l, v, c) { var s = E('span', c || ''); s.append(l + ' ', E('b', null, v)); stats.appendChild(s); };
      chip('끝냄', st.doneN + '/' + (st.act.length + st.doneN)); if (st.late) chip('밀림', st.late, 'late'); if (st.free.length) chip('언제든', st.free.length);
      var stM = rows.filter(function (o) { return o.kind === 'st'; }).reduce(function (a, o) { return a + (o.mins || 0); }, 0); if (stM) chip('공부', Math.floor(stM / 60) ? Math.floor(stM / 60) + '시간' + (stM % 60 ? ' ' + stM % 60 + '분' : '') : stM + '분');
      B.appendChild(stats); addBox(B);
      if (st.lateIt.length) {
        B.appendChild(E('div', 'lv-sec', '밀린 것'));
        st.lateIt.forEach(function (t) { var r = E('div', 'tv-r late'); r.style.setProperty('--c', 'var(--hot)'); var w = E('div', 'tv-w'); w.append(E('em', null, when(t.due) + '까지였어'), t.text); r.append(E('div', 'tv-t', '지남'), w, ck(function () { fin(t, r); })); B.appendChild(r); });
      }
      B.appendChild(E('div', 'lv-sec', '오늘 시간표'));
      if (!rows.length) B.appendChild(E('div', 'tv-em', '시간 정해진 건 없어.\n위 칸에 적거나, 통화로 나한테 말해.'));
      var put = false;
      rows.forEach(function (o) {
        if (!put && o.s >= nowM) { put = true; B.appendChild(E('div', 'tv-now', '지금 ' + toT(nowM))); }
        var dn = o.kind === 'log' || o.done, end = o.s + (o.mins || 0), r = E('div', 'tv-r' + (dn ? ' dn' : '') + (!dn && o.s >= 0 && end < nowM && o.kind !== 'todo' ? ' past' : '') + (o.kind === 'todo' && !dn && o.s < nowM ? ' late' : ''));
        r.style.setProperty('--c', o.sub && window.lenaStudy ? lenaStudy.colOf(o.sub) : COL[o.kind] || '#667');
        var t = E('div', 'tv-t', o.s < 0 ? '종일' : toT(o.s)); if (o.mins && o.kind !== 'play') t.appendChild(E('small', null, o.mins + '분'));
        var w = E('div', 'tv-w'); w.append(E('em', null, o.sub ? (/^(할 일|루틴)$/.test(o.sub) ? o.sub : o.sub + ' 공부') + (o.kind === 'log' ? ' · 끝냄' : '') : LB[o.kind] || ''), o.txt.replace(/ \(마감\)$/, ''));
        r.append(t, w);
        if (o.kind === 'todo' && o.it) r.appendChild(ck(function () { fin(o.it, r); }, dn));
        else if (o.kind === 'st') r.appendChild(ck(function () { try { (o.bs || [o.b]).forEach(function (b) { lenaStudy.finishBlock(b); }); } catch (e) {} toast('끝! 수고했어.'); refreshSheet(); }));
        B.appendChild(r);
      });
      if (!put && rows.length) B.appendChild(E('div', 'tv-now', '지금 ' + toT(nowM)));
      if (st.free.length) {
        B.appendChild(E('div', 'lv-sec', '언제든 할 일'));
        st.free.forEach(function (t) { var r = E('div', 'tv-r'); r.style.setProperty('--c', 'var(--yel)'); var w = E('div', 'tv-w'); w.append(t.text); r.append(E('div', 'tv-t', '—'), w, ck(function () { fin(t, r); })); B.appendChild(r); });
      }
    }
  };
  try { NUMOF.today = '1'; } catch (e) {}
  setInterval(function () { if (cur && norm(key) === 'today' && !document.hidden && sheet.classList.contains('open') && !/^(INPUT|TEXTAREA)$/.test((document.activeElement || {}).tagName || '')) refreshSheet(); }, 30000);

  // ---------- 음성통화 화면 버튼 6개: 오늘 · 계획 · 영상 / 연락 · 놀이 · 설정 ----------
  var IC = {
    aPad: '<path d="M5 6.5h2M10 6.5h9M5 12h2M10 12h9M5 17.5h2M10 17.5h6"/>',
    aBoard: '<rect x="4" y="5" width="16" height="15" rx="2.5"/><path d="M4 10h16M8 3v4M16 3v4"/>',
    aCall: '<path d="M6.6 10.8a15 15 0 006.6 6.6l2.2-2.2a1 1 0 011-.25 11.4 11.4 0 003.6.57 1 1 0 011 1V20a1 1 0 01-1 1A17 17 0 013 4a1 1 0 011-1h3.5a1 1 0 011 1c0 1.25.2 2.45.57 3.57a1 1 0 01-.25 1z"/>',
    aMiss: '<rect x="4" y="4" width="16" height="16" rx="3.5"/><circle cx="9" cy="9" r="1.2"/><circle cx="15" cy="15" r="1.2"/><circle cx="15" cy="9" r="1.2"/><circle cx="9" cy="15" r="1.2"/>'
  };
  [['aPad', '오늘', 1], ['aBoard', '계획', 2], ['aCall', '연락', 3], ['aMiss', '놀이', 4]].forEach(function (x) {
    var b = document.getElementById(x[0]); if (!b) return; var badge = document.getElementById('aMissN');
    b.innerHTML = '<i><svg viewBox="0 0 24 24">' + IC[x[0]] + '</svg></i>'; b.appendChild(document.createTextNode(x[1]));
    if (x[2] === 3 && badge) b.appendChild(badge);
    b.onclick = function () { openLine(x[2]); };
  });
  var bb = document.getElementById('boardBtn'); if (bb) bb.onclick = function () { openLine(1); };
  // 0번 설정 맨 아래에 앱 버전
  try { var _r0 = SH[0].r; SH[0].r = function (B) { _r0(B); var h = el('div', 'hint', '앱 버전 확인 중…'); h.style.textAlign = 'center'; h.style.marginTop = '14px'; B.appendChild(h); lenaVer().then(function (v) { h.textContent = v ? '앱 버전 ' + v : '앱 버전을 알 수 없어요'; }); }; } catch (e) {}
  window.lenaLines = { open: openLine, get cur() { return cur; }, get key() { return key; }, paint: paint, LINES: LINES };
})();
