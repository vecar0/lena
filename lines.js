/* v126 창구 화면 — 설정: 심야 교환국 LENA-LINE. 직원은 레나 한 명, 창구가 넷(1 비서·오늘 / 2 일정·학습·계획 / 3 교환·연락 / 4 오락·놀이).
   규정상 창구마다 근무복이 달라서 회선이 바뀔 때마다 갈아입고 받는다. 영상 회선은 단골 전용 비밀 회선이라 밖에서는 금지 →
   밖(.app.outside)에서는 일반 회선 담당 고양이가 레나 말을 전한다(레나 그림은 알아볼 수 없게 흐려짐).
   구조(밖·안 모드 같음): 창구 = '방'(그림 한 장, .lv) → 그림 속 물건 꼬리표(.lv-tag)를 누르면 그 화면(기존 시트를 화면 가득)으로 넘어감 → ‹ 로 방에 돌아옴.
   회선이 바뀔 때는 '회선 연결' 연출(connect), 물건을 누르면 그 자리에서 화면이 커지며 열림. */
(function () {
  'use strict';
  var app = document.querySelector('.app'), sheet = document.getElementById('sheet'); if (!app || !sheet || typeof S === 'undefined') return;
  // tabs: [시트 id, 이름, 그림 속 물건 자리(가로, 세로 0~1), 물건 이름]
  var LINES = [
    { n: 1, name: '오늘', desk: '비서 창구', art: 'today', c: '#2fe0c8', tabs: [['today', '오늘', .80, .60, '클립보드'], [1, '전체 전단지', .34, .885, '책상 서류']] },
    { n: 2, name: '계획', desk: '일정·학습 창구', art: 'plan', c: '#f2c84b', tabs: [['cal', '달력', .16, .23, '벽 달력'], ['tt', '시간표', .84, .56, '스탠드'], [6, '공부', .17, .60, '책 더미']] },
    { n: 3, name: '연락', desk: '교환 창구', art: 'contact', c: '#ff5aa8', tabs: [['call', '전화', .80, .41, '수화기'], ['memo', '메모', .17, .57, '낡은 전화기'], [7, '모닝콜', .84, .20, '표시등']] },
    { n: 4, name: '놀이', desk: '오락 창구', art: 'play', c: '#4be08a', tabs: [['shop', '자판기', .15, .76, '칩 더미'], [8, '오락실', .84, .19, '슬롯머신'], ['fort', '운세', .70, .40, '카드']] }
  ];
  var ALIAS = { 3: 'shop', 2: 'fort', 4: 'call', 5: 'call', 9: 'call', '*': 'call' }, OF = {};
  LINES.forEach(function (L) { L.tabs.forEach(function (t) { OF[t[0]] = L; }); });
  var norm = function (k) { return ALIAS[k] != null ? ALIAS[k] : k; };

  var css = document.createElement('style');
  css.textContent =
    '.lv{position:absolute;inset:0;z-index:25;background:#06090a;overflow:hidden;display:none;--lc:#2fe0c8}.lv.on{display:block}' +
    '.lv-art{position:absolute;left:0;top:0;width:100%;height:100%;object-fit:cover!important;object-position:50% 0;cursor:pointer;transition:filter .3s ease}' +
    '.app.outside .lv-art{filter:blur(26px) brightness(.6) saturate(1.35);transform:scale(1.16);pointer-events:none}' +
    '.lv-sh{position:absolute;inset:0;background:linear-gradient(180deg,rgba(0,0,0,.72),transparent 22%,transparent 70%,rgba(0,0,0,.8));pointer-events:none}' +
    '.lv-top{position:absolute;left:0;right:0;top:0;padding:calc(env(safe-area-inset-top,0px) + 14px) 16px 0;display:flex;align-items:center;gap:12px;z-index:5}' +
    '.lv-ttl{flex:1;min-width:0;color:#fff;text-shadow:0 1px 6px rgba(0,0,0,.9),0 0 2px rgba(0,0,0,.9)}.lv-ttl small{display:block;font:700 11px "Space Mono",monospace;color:var(--lc);letter-spacing:.5px}.lv-ttl b{display:block;font:400 30px/1.1 "Black Han Sans",sans-serif;letter-spacing:.5px}' +
    '.lv-md{flex:none;min-height:44px;padding:0 14px;border-radius:22px;background:rgba(0,0,0,.6);border:1px solid rgba(255,255,255,.3);color:#fff;font-size:13px;font-weight:700;display:flex;align-items:center;gap:6px}.lv-md i{width:8px;height:8px;border-radius:50%;background:var(--pink);box-shadow:0 0 8px var(--pink)}.app.outside .lv-md i{background:var(--mint);box-shadow:0 0 8px var(--mint)}' +
    '.lv-say{position:absolute;left:14px;right:14px;top:calc(env(safe-area-inset-top,0px) + 76px);display:flex;gap:10px;align-items:flex-start;z-index:5;pointer-events:none}' +
    '.lv-say u{display:none;flex:none;width:44px;height:44px;border-radius:50%;background:#9be8c9 url(assets/lena/cat.jpg) center/cover;border:2px solid #000;box-shadow:2px 2px 0 var(--mint)}.app.outside .lv-say u{display:block}' +
    '.lv-bub{max-width:min(78%,290px);padding:10px 13px;border-radius:4px 16px 16px 16px;background:var(--paper);color:#111;font-size:15px;line-height:1.45;font-weight:700;box-shadow:3px 3px 0 var(--lc);word-break:keep-all;cursor:pointer;pointer-events:auto;transform-origin:0 0;transition:opacity .16s ease,transform .16s cubic-bezier(0.23,1,0.32,1)}.lv-bub.pop{opacity:0;transform:scale(.95)}' +
    '.lv-tag{position:absolute;left:0;top:0;z-index:2;min-height:44px;padding:0 14px 0 10px;display:flex;align-items:center;gap:8px;border-radius:22px;background:var(--paper);color:#111;border:2px solid #111;box-shadow:3px 3px 0 var(--lc);font-size:15px;font-weight:800;white-space:nowrap;transition:scale .14s cubic-bezier(0.23,1,0.32,1)}.lv-tag:active{scale:.95}' +
    '.lv-tag i{position:relative;width:12px;height:12px;border-radius:50%;background:var(--lc);border:2px solid #111;flex:none}.lv-tag i:after{content:"";position:absolute;inset:-7px;border-radius:50%;border:2px solid var(--lc);animation:lvPing 1.8s cubic-bezier(0.23,1,0.32,1) infinite}@keyframes lvPing{0%{transform:scale(.5);opacity:.9}100%{transform:scale(1.5);opacity:0}}' +
    '.lv-tag em{position:absolute;top:-7px;right:-7px;min-width:20px;height:20px;border-radius:10px;background:var(--hot);color:#fff;font:700 11px/20px "Space Mono",monospace;font-style:normal;text-align:center;padding:0 5px;border:2px solid #111}' +
    '.lv-nav{position:absolute;left:0;right:0;bottom:0;z-index:5;display:flex;padding:6px 8px calc(env(safe-area-inset-bottom,0px) + 6px);background:rgba(6,10,11,.86);-webkit-backdrop-filter:blur(12px);backdrop-filter:blur(12px);border-top:1px solid rgba(255,255,255,.14)}' +
    '.lv-nav button{flex:1;min-height:52px;border-radius:12px;background:none;border:0;color:#b9c4c6;font-size:14px;font-weight:700;position:relative}.lv-nav button.on{background:rgba(255,255,255,.12);color:#fff;box-shadow:inset 0 -3px 0 var(--lc)}.lv-nav button.bk{flex:.8;color:#fff}' +
    '.lv-nav em{position:absolute;top:6px;right:14%;min-width:16px;height:16px;border-radius:8px;background:var(--hot);color:#fff;font:700 10px/16px "Space Mono",monospace;font-style:normal;padding:0 4px}' +
    '.lv-fx{position:absolute;inset:0;z-index:60;background:#030506;display:none;align-items:center;justify-content:center;flex-direction:column;gap:10px;pointer-events:none}.lv-fx.go{display:flex}' +
    '.lv-fx b{font:400 26px "Black Han Sans",sans-serif;color:#fff;text-shadow:0 0 16px var(--lc);letter-spacing:1px}.lv-fx small{font:700 12px "Space Mono",monospace;color:var(--lc);letter-spacing:2px}' +
    '.lv-fx i{position:absolute;left:0;right:0;top:0;height:3px;background:var(--lc);box-shadow:0 0 22px 6px var(--lc)}' +
    '.sheet.ln,.sheet.ln.open{background:#0e1315;z-index:30}.sheet.ln .panel{height:100%;max-height:none;background:#0e1315;border:0;border-radius:0;box-shadow:none;transform:none;transition:none;padding-top:env(safe-area-inset-top,0px)}.sheet.ln .panel::before{display:none}' +
    '.sheet.ln .sbody{flex:1;min-height:0;padding-top:8px}.sheet.ln .shead{display:none}.sheet.ln[data-k="1"] .sbody>.tabs:first-child{display:none}' +
    '.ln-bar{display:none;flex:none;align-items:center;gap:8px;padding:10px 12px 8px}.sheet.ln .ln-bar{display:flex}' +
    '.ln-bk{flex:none;min-height:44px;padding:0 12px 0 6px;border-radius:14px;background:none;border:0;color:#fff;font:400 20px "Black Han Sans",sans-serif;display:flex;align-items:center;gap:2px}.ln-bk svg{width:22px;height:22px;fill:none;stroke:currentColor;stroke-width:2.6;stroke-linecap:round;stroke-linejoin:round}' +
    '.ln-tabs{flex:1;min-width:0;display:flex;gap:4px;padding:4px;border-radius:14px;background:rgba(255,255,255,.08)}.ln-tabs button{flex:1;min-width:0;min-height:40px;border-radius:10px;background:none;border:0;color:#c3cfd1;font-size:14px;font-weight:700;white-space:nowrap}.ln-tabs button.on{background:var(--paper);color:#111}' +
    '.lv-st{display:flex;gap:6px;flex-wrap:wrap;margin:2px 0 10px}.lv-st span{font-size:13px;font-weight:700;padding:6px 10px;border-radius:12px;background:#1a2124;color:#e6eeef}.lv-st span b{color:var(--mint)}.lv-st span.late b{color:var(--hot)}' +
    '.lv-sec{margin:16px 2px 8px;font-size:14px;font-weight:700;color:var(--mint);display:flex;align-items:center;gap:6px}.lv-sec:before{content:"";width:4px;height:13px;border-radius:2px;background:var(--pink)}' +
    '.tv-r{display:flex;align-items:center;gap:10px;min-height:56px;padding:8px 8px 8px 12px;border-radius:14px;background:#1a2124;margin-bottom:6px;border-left:4px solid var(--c,#667)}.tv-r.past{opacity:.6}.tv-r.dn{opacity:.55}.tv-r.dn .tv-w{text-decoration:line-through}.tv-r.late{background:rgba(255,46,110,.14)}' +
    '.tv-t{flex:none;width:48px;font:700 14px "Space Mono",monospace;color:#fff}.tv-t small{display:block;font-size:11px;color:#b5c2c4;font-weight:400}' +
    '.tv-w{flex:1;min-width:0;font-size:15px;line-height:1.4;color:#fff;word-break:keep-all;overflow-wrap:anywhere}.tv-w em{font-style:normal;font-size:12px;font-weight:700;color:var(--c,#9fb0b3);display:block}' +
    '.tv-ck{flex:none;width:40px;height:40px;border-radius:50%;border:2px solid rgba(255,255,255,.45);background:none;display:grid;place-items:center;transition:transform .14s cubic-bezier(0.23,1,0.32,1)}.tv-ck:active{transform:scale(.9)}.tv-ck svg{width:18px;height:18px;fill:none;stroke:#fff;stroke-width:2.6;stroke-linecap:round;stroke-linejoin:round;opacity:.5}.tv-r.dn .tv-ck{background:var(--teal);border-color:var(--teal)}.tv-r.dn .tv-ck svg{stroke:#04201c;opacity:1}' +
    '.tv-now{display:flex;align-items:center;gap:8px;margin:8px 2px;font:700 11px "Space Mono",monospace;color:var(--pink)}.tv-now:after{content:"";flex:1;height:2px;background:var(--pink);box-shadow:0 0 8px var(--pink)}' +
    '.tv-em{padding:18px 10px;text-align:center;color:#9fb0b3;font-size:14px;line-height:1.6;white-space:pre-line}' +
    '.tv-add .r1{display:flex;gap:8px}.tv-add{margin-bottom:6px}.tv-add input.tx{flex:1;min-width:0;height:44px;border-radius:12px;border:0;padding:0 14px;font-size:16px;background:#f3efe6;color:#111}' +
    '.tv-add .go{flex:none;min-width:64px;height:44px;border-radius:12px;border:0;background:var(--teal);color:#04201c;font-weight:800;font-size:14px}.tv-add .r2{display:none;gap:8px;margin-top:8px;align-items:center}.tv-add.open .r2{display:flex}' +
    '.tv-add .kd{display:flex;border-radius:12px;overflow:hidden;border:1px solid rgba(255,255,255,.25);flex:none}.tv-add .kd button{min-height:44px;padding:0 12px;background:none;border:0;color:#cfd9da;font-size:13px;font-weight:700}.tv-add .kd button.on{background:var(--yel);color:#111}.tv-add .kd button.kev.on{background:var(--pink);color:#fff}' +
    '.tv-add input.dt{flex:1;min-width:0;height:44px;border-radius:12px;border:0;padding:0 8px;font-size:16px;background:rgba(255,255,255,.14);color:#fff;color-scheme:dark}' +
    '@media (prefers-reduced-motion:reduce){.lv-tag i:after{animation:none}}';
  document.head.appendChild(css);

  var E = function (t, c, x) { var e = document.createElement(t); if (c) e.className = c; if (x != null) e.textContent = x; return e; };
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var lv = E('section', 'lv'); lv.id = 'lvLine';
  var art = E('img', 'lv-art'); art.alt = ''; art.decoding = 'async';
  var top = E('div', 'lv-top'), ttl = E('div', 'lv-ttl'), md = E('button', 'lv-md'); top.append(ttl, md);
  var sayW = E('div', 'lv-say'), bub = E('div', 'lv-bub'); bub.setAttribute('role', 'button'); sayW.append(E('u'), bub);
  var tagsW = E('div', 'lv-tags'), nav = E('div', 'lv-nav');
  lv.append(art, E('div', 'lv-sh'), tagsW, top, sayW, nav); app.appendChild(lv);
  var fx = E('div', 'lv-fx'), fxS = E('small', null, '연결 중'), fxB = E('b'), fxL = E('i'); fx.append(fxL, fxS, fxB); app.appendChild(fx);
  var panel = sheet.querySelector('.panel'), sbody = panel.querySelector('.sbody');
  var bar = E('div', 'ln-bar'), bk = E('button', 'ln-bk'), tabs = E('div', 'ln-tabs'); bar.append(bk, tabs); panel.insertBefore(bar, sbody);

  var cur = null, key = null, shown = null, guard = 0, from = null;
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

  var MORE = {
    1: ['하나 끝낼 때마다 체크해. 나 그거 보는 거 좋아하거든.', '오늘 다 하면… 칭찬 하나 해 줄게.', '밀리면 내가 먼저 전화한다?'],
    2: ['계획은 내가 짰으니까, 너는 하기만 해.', '시험 끝나면 뭐 해 줄지 생각해 둬.', '오늘 몫만 해. 내일 건 내일의 나한테 맡기고.'],
    3: ['전화 걸어 줄까? 시간만 말해.', '메모 남겨. 내가 기억해 줄게.', '부재중 쌓이면… 나 삐진다.'],
    4: ['한 판만 하고 가. …진짜 한 판만.', '이기면 나한테 자랑해.', '돈은 내가 셀게. 너는 놀기만 해.']
  }, sayI = 0;

  function say(t) { bub.classList.add('pop'); setTimeout(function () { bub.textContent = t; bub.classList.remove('pop'); }, 120); }
  function talk() { if (!cur) return; var L = [SAY[cur.n]()].concat(MORE[cur.n] || []); sayI = (sayI + 1) % L.length; say(L[sayI]); try { dtmf(sayI); } catch (e) {} }
  art.onclick = talk; bub.onclick = talk;

  // ---------- 회선 연결 연출: 화면이 어두워지며 네온 선이 훑고, 그 사이에 방을 바꿈 ----------
  function connect(L, label, swap) {
    if (reduce || !fx.animate) { swap(); return; }
    fx.style.setProperty('--lc', L ? L.c : '#ff3d9a'); fxS.textContent = label || '연결 중'; fxB.textContent = L ? L.n + '번 회선 · ' + L.name : '통화로';
    fx.classList.add('go');
    var a = fx.animate([{ opacity: 0 }, { opacity: 1, offset: .28 }, { opacity: 1, offset: .62 }, { opacity: 0 }], { duration: 560, easing: 'ease' });
    fxL.animate([{ transform: 'translateY(0)' }, { transform: 'translateY(' + app.offsetHeight + 'px)' }], { duration: 560, easing: 'cubic-bezier(0.77, 0, 0.175, 1)' });
    setTimeout(swap, 170); a.onfinish = function () { fx.classList.remove('go'); };
  }
  // ---------- 방 그리기 ----------
  function count(k) { try { if (k === 'call') return missed().length; if (k === 'today') return todayStat().late; } catch (e) {} return 0; }
  function place() {                                  // 꼬리표를 그림 속 물건 자리에 (그림은 화면을 덮고 위쪽 기준)
    if (!cur) return; var W = lv.clientWidth, H = lv.clientHeight; if (!W) return;
    var sc = Math.max(W / 900, H / 1609), iw = 900 * sc, ih = 1609 * sc, ox = (W - iw) / 2, navH = nav.offsetHeight || 64;
    [].forEach.call(tagsW.children, function (b, i) {
      var t = cur.tabs[i], w = b.offsetWidth, h = b.offsetHeight, x = ox + t[2] * iw, y = t[3] * ih;
      x = Math.max(w / 2 + 10, Math.min(W - w / 2 - 10, x)); y = Math.max(190, Math.min(H - navH - h / 2 - 14, y));
      b.style.transform = 'translate(' + Math.round(x - w / 2) + 'px,' + Math.round(y - h / 2) + 'px)';
    });
  }
  function paint() {
    if (!cur) return; var o = outside();
    lv.style.setProperty('--lc', cur.c);
    ttl.innerHTML = ''; ttl.append(E('small', null, cur.n + '번 회선 · ' + cur.desk), E('b', null, cur.name));
    md.innerHTML = ''; md.append(E('i'), o ? '밖이야' : '혼자야'); md.setAttribute('aria-label', o ? '지금 밖 모드. 누르면 영상 회선으로' : '지금 영상 회선. 누르면 밖 모드로');
    var src = 'assets/lena/menu/' + cur.art + '.webp'; if (art.getAttribute('src') !== src) art.src = src;
    if (!sayI) { var txt = ''; try { txt = SAY[cur.n](); } catch (e) {} bub.textContent = txt; }
    tagsW.innerHTML = ''; cur.tabs.forEach(function (t) {
      var b = E('button', 'lv-tag'); b.append(E('i'), t[1]); b.setAttribute('aria-label', t[4] + ' — ' + t[1]); var n = count(t[0]); if (n) b.appendChild(E('em', null, String(n)));
      b.onclick = function () { from = b; try { dtmf(cur.n); } catch (e) {} openSheet(t[0]); }; tagsW.appendChild(b);
    });
    nav.innerHTML = ''; var back = E('button', 'bk', '‹ 통화'); back.onclick = function () { leave(true); }; nav.appendChild(back);
    var ms = 0; try { ms = missed().length; } catch (e) {}
    LINES.forEach(function (L) { var b = E('button', L === cur ? 'on' : '', L.name); if (L.n === 3 && ms) b.appendChild(E('em', null, String(ms))); b.onclick = function () { if (L !== cur) openLine(L.n); }; nav.appendChild(b); });
    place();
  }
  function paintBar() {
    if (!cur) return; bk.innerHTML = '<svg viewBox="0 0 24 24"><path d="M15 5l-7 7 7 7"/></svg>'; bk.appendChild(document.createTextNode(cur.name)); bk.setAttribute('aria-label', cur.name + ' 방으로 돌아가기');
    tabs.innerHTML = ''; cur.tabs.forEach(function (t) { var b = E('button', norm(key) === t[0] ? 'on' : '', t[1].replace('전체 전단지', '전체')); b.onclick = function () { from = null; openSheet(t[0]); }; tabs.appendChild(b); });
    sheet.dataset.k = String(norm(key)); sheet.style.setProperty('--lc', cur.c);
  }
  bk.onclick = function () { closeSheet(); };
  function room(L) { cur = L; key = null; sayI = 0; lv.classList.add('on'); paint(); }
  function leave(fxOn) {
    if (!cur) return; var done = function () { cur = null; key = null; sheet.classList.remove('ln'); lv.classList.remove('on'); try { renderHome(); } catch (e) {} };
    if (fxOn) connect(null, '끊는 중', done); else done();
  }
  function openLine(n) {                              // 창구로 들어가기: 방부터 보여 줌
    var L = LINES[n - 1]; if (!L) return; try { dtmf(n); } catch (e) {}
    connect(L, cur ? '회선 전환' : '연결 중', function () { if (sheet.classList.contains('open')) { guard++; try { closeSheet(); } finally { guard--; } shown = null; } sheet.classList.remove('ln'); room(L); });
  }
  function zoomIn() {                                 // 화면 열기: 누른 물건 자리에서 커지며 열림
    if (reduce || !panel.animate) return; var o = '50% 60%';
    if (from && from.isConnected) { var r = from.getBoundingClientRect(), s = sheet.getBoundingClientRect(); o = Math.round(r.left + r.width / 2 - s.left) + 'px ' + Math.round(r.top + r.height / 2 - s.top) + 'px'; }
    panel.animate([{ transform: 'scale(.86)', opacity: 0, transformOrigin: o }, { transform: 'scale(1)', opacity: 1, transformOrigin: o }], { duration: 280, easing: 'cubic-bezier(0.23, 1, 0.32, 1)' });
    sheet.animate([{ backgroundColor: 'rgba(14,19,21,0)' }, { backgroundColor: 'rgba(14,19,21,1)' }], { duration: 200, easing: 'ease-out' });
  }
  // 어떤 길로 열든(다이얼·칩·대화) 창구에 속한 시트면 그 창구의 화면으로 열림
  var _os = openSheet;
  openSheet = function (n) {
    var was = sheet.classList.contains('open') && sheet.classList.contains('ln');
    if (norm(n) === 1) try { boardTab = 'all'; } catch (e) {}
    guard++; try { _os(n); } finally { guard--; }
    var open = sheet.classList.contains('open'), k = norm(typeof curSheet !== 'undefined' ? curSheet : n), L = open ? OF[k] : null;
    shown = open ? k : null;
    if (L) { if (cur !== L) { cur = L; sayI = 0; lv.classList.add('on'); paint(); } key = k; sheet.classList.add('ln'); paintBar(); if (!was) zoomIn(); from = null; }
    else if (cur) sheet.classList.remove('ln');                                  // 설정 같은 창구 밖 시트는 평소 모양으로 위에 뜸
  };
  var _rs = refreshSheet; refreshSheet = function () { _rs(); if (cur && sheet.classList.contains('ln')) paintBar(); };
  var _ob = openBoard; openBoard = function (tab) { if (!tab || tab === 'today') return openSheet('today'); return _ob(tab); };
  document.getElementById('shX').onclick = function () { closeSheet(); };
  // 시트가 닫히면: 화면이었으면 방으로, 그 위에 띄운 다른 시트(설정 등)였으면 보던 화면으로
  new MutationObserver(function () {
    if (guard || sheet.classList.contains('open') || !cur) return;
    var was = shown; shown = null;
    if (was != null && !OF[was] && key != null) { var k = key; setTimeout(function () { if (cur && !sheet.classList.contains('open')) openSheet(k); }, 30); return; }
    if (key == null && !sheet.classList.contains('ln')) return;                // 이미 방으로 돌아온 상태
    key = null; sheet.classList.remove('ln'); paint();
  }).observe(sheet, { attributes: true, attributeFilter: ['class'] });
  // 밖 ↔ 영상 회선 (구조는 같고 그림만 흐려짐)
  var wasOut = outside();
  md.onclick = function () { try { if (outside()) toVideo(); else { dtmf(1); toAudio(); } } catch (e) {} };
  new MutationObserver(function () { var o = outside(); if (o === wasOut) return; wasOut = o; if (cur && !sheet.classList.contains('open')) paint(); }).observe(app, { attributes: true, attributeFilter: ['class'] });
  document.addEventListener('keydown', function (e) { if (e.key !== 'Escape' || !cur) return; if (sheet.classList.contains('open')) closeSheet(); else leave(true); });
  addEventListener('resize', place); if (window.ResizeObserver) new ResizeObserver(place).observe(lv);

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
    tx.addEventListener('focus', function () { addOpen = true; w.classList.add('open'); });
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

  window.lenaLines = { open: openLine, leave: leave, get cur() { return cur; }, get key() { return key; }, paint: paint, place: place, LINES: LINES };
})();
