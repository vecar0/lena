/* v130 장면 화면 — 아침 브리핑(비서 옷 레나)·오락실(딜러 옷 레나) 전용 화면과 '회선 연결' 전환 연출.
   그림은 영상 모드에서만(밖 모드 = 사람들 앞이라 레나 그림 없음, 고양이).
   그리고 기능 버튼은 다이얼 하나로 통일: 남는 버튼 = 다이얼 · 음성/영상 전환 · 수화기 들기/끊기. */
(function () {
  'use strict';
  var app = document.querySelector('.app'), sheet = document.getElementById('sheet'); if (!app || !sheet) return;
  var EO = 'cubic-bezier(0.23, 1, 0.32, 1)', EIO = 'cubic-bezier(0.77, 0, 0.175, 1)';
  var reduce = function () { return window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches; };
  var outside = function () { return app.classList.contains('outside'); };
  var E = function (t, c, x) { var e = document.createElement(t); if (c) e.className = c; if (x != null) e.textContent = x; return e; };

  var css = document.createElement('style');
  css.textContent =
    /* 전환 층: 위아래 문이 가운데로 닫힘 → 네온 선·제목 → 문이 열림 */
    '.scfx{position:absolute;inset:0;z-index:80;display:none;pointer-events:none;overflow:hidden;--lc:#2fe0c8}.scfx.go{display:block}' +
    '.scfx s{position:absolute;left:0;right:0;height:50.5%;background:#05080a repeating-linear-gradient(0deg,rgba(255,255,255,.035) 0 1px,transparent 1px 4px)}.scfx s.a{top:0;box-shadow:0 2px 0 var(--lc),0 0 34px 4px var(--lc)}.scfx s.b{bottom:0;box-shadow:0 -2px 0 var(--lc),0 0 34px 4px var(--lc)}' +
    '.scfx i{position:absolute;left:0;right:0;top:50%;height:2px;margin-top:-1px;background:#fff;box-shadow:0 0 10px 2px #fff,0 0 40px 10px var(--lc);opacity:0}' +
    '.scfx p{position:absolute;left:0;right:0;top:50%;text-align:center;opacity:0;margin:0}.scfx p.t1{margin-top:-44px;font:700 12px "Space Mono",monospace;color:var(--lc);letter-spacing:3px}.scfx p.t2{margin-top:16px;font:400 30px/1 "Black Han Sans",sans-serif;color:#fff;text-shadow:0 0 18px var(--lc)}' +
    /* 아침 브리핑 = 화면 가득. 그림은 뒤에 고정, 내용이 그 위로 올라오며 스크롤 */
    '.sheet.scn{background:#07090b}.sheet.scn .panel{height:100%;max-height:none;border:0;border-radius:0;box-shadow:none;background:transparent;transform:none;transition:none}.sheet.scn .panel::before{display:none}.sheet.scn .shead{display:none}' +
    '.scn-hero{position:absolute;left:0;right:0;top:0;height:68%;overflow:hidden;pointer-events:none}.scn-hero img{width:100%;height:100%;object-fit:cover!important;object-position:50% 4%}' +
    '.scn-hero:after{content:"";position:absolute;inset:0;background:linear-gradient(180deg,rgba(7,9,11,.55),transparent 18%,transparent 52%,#07090b 98%)}' +
    '.app.outside .scn-hero img{display:none}.app.outside .scn-hero{height:42%;background:radial-gradient(circle at 50% 46%,rgba(47,224,200,.22),transparent 60%)}' +
    '.scn-cat{display:none;position:absolute;left:50%;top:calc(var(--st) + 54px);width:120px;height:120px;margin-left:-60px;border-radius:50%;background:#9be8c9 url(assets/lena/cat.jpg) center/cover;border:3px solid #000;box-shadow:0 0 0 3px var(--teal),0 0 36px rgba(47,224,200,.45)}.app.outside .scn-cat{display:block}' +
    '.scn-x{position:absolute;right:14px;top:calc(var(--st) + 12px);z-index:3;width:44px;height:44px;border-radius:50%;background:rgba(0,0,0,.55);border:1px solid rgba(255,255,255,.28);display:grid;place-items:center;-webkit-backdrop-filter:blur(10px);backdrop-filter:blur(10px)}.scn-x svg{width:20px;height:20px;fill:none;stroke:#fff;stroke-width:2.4;stroke-linecap:round}' +
    '.sheet.scn .sbody{position:relative;z-index:2;flex:1;min-height:0;padding-top:52vh}.app.outside .sheet.scn .sbody{padding-top:calc(var(--st) + 200px)}' +
    '.scn-ttl{margin:0 2px 14px;color:#fff;text-shadow:0 2px 12px rgba(0,0,0,.8)}.scn-ttl small{display:block;font:700 13px "Space Mono",monospace;color:var(--teal);margin-bottom:4px}.scn-ttl b{display:block;font:400 40px/1 "Black Han Sans",sans-serif;letter-spacing:.5px}' +
    '.sheet.scn .brief{background:#07090b;border-radius:18px 18px 0 0;margin:0 -14px;padding:16px 14px 4px;box-shadow:0 -20px 30px #07090b}.sheet.scn .bhead i{display:none}.app.outside .sheet.scn .bhead i{display:block}.sheet.scn .bhead p{font-size:16px}' +
    '.sheet.scn .sbody>.hint{display:none}' +
    /* 기능 버튼은 다이얼 하나로 */
    '#missBtn,#boardBtn,#aBoard,#aCall,#aMiss,#aSet,#affB{display:none!important}' +
    '#boardBtn+.lb,.ctl>div:has(#boardBtn){display:none!important}' +
    '.app.outside .agrid{grid-template-columns:repeat(2,1fr)!important;padding-left:56px!important;padding-right:56px!important}' +
    '#flyers,#flyers *,#aInfo,#aInfo *{pointer-events:none!important}#knock{pointer-events:none!important}' +
    '.dbad{position:absolute;top:-4px;right:-6px;min-width:20px;height:20px;padding:0 5px;border-radius:10px;background:var(--hot);color:#fff;font:700 11px/20px "Space Mono",monospace;font-style:normal;text-align:center;border:2px solid #000;pointer-events:none}.dbad[hidden]{display:none}' +
    '#dialBtn,#aPad i{position:relative}' +
    /* 1 전단지·2 캘린더·3 시간표·4 공부: 바깥 틀 = 비 오는 부스 유리 */
    '.sheet.boothgl .panel{background:#0a0e10;box-shadow:0 -1px 0 rgba(159,245,228,.55),0 -10px 28px rgba(47,224,200,.18);border-top:1px solid rgba(255,255,255,.22);overflow:hidden}.sheet.boothgl .panel::before{display:none}' +
    '.glbg{position:absolute;inset:0;z-index:0;pointer-events:none;border-radius:inherit;overflow:hidden}.glbg:before{content:"";position:absolute;inset:-40px;background:url(assets/lena/poster.jpg) center top/cover;filter:blur(24px) brightness(.36) saturate(1.35)}' +
    '.glbg:after{content:"";position:absolute;inset:0;background:repeating-linear-gradient(103deg,transparent 0 26px,rgba(159,245,228,.05) 26px 27px,transparent 27px 70px),linear-gradient(180deg,rgba(255,255,255,.07),transparent 90px),rgba(6,9,11,.5)}' +
    '.sheet.boothgl .shead,.sheet.boothgl .sbody{position:relative;z-index:1}' +
    '@media (prefers-reduced-motion:reduce){.scfx{display:none!important}}';
  document.head.appendChild(css);

  // ---------- 전환 연출 ----------
  var fx = E('div', 'scfx'), dA = E('s', 'a'), dB = E('s', 'b'), ln = E('i'), t1 = E('p', 't1'), t2 = E('p', 't2'), fxT = 0;
  fx.append(dA, dB, ln, t1, t2); app.appendChild(fx);
  // 위아래 문이 닫히고(30%) 그 사이 swap, 선과 글자가 떴다가 문이 열림. D: 전체 길이
  function door(sub, title, color, swap, D) {
    if (reduce() || !fx.animate) { swap(); return; }
    D = D || 780; fx.style.setProperty('--lc', color || '#2fe0c8'); t1.textContent = sub || ''; t2.textContent = title || '';
    fx.getAnimations({ subtree: true }).forEach(function (a) { a.cancel(); }); fx.classList.add('go');
    var o = { duration: D, fill: 'both' }, dr = function (el, from) { return el.animate([{ transform: 'translateY(' + from + ')', easing: EIO }, { transform: 'translateY(0)', offset: .3 }, { transform: 'translateY(0)', offset: .56, easing: EIO }, { transform: 'translateY(' + from + ')' }], o); };
    var a = dr(dA, '-104%'); dr(dB, '104%');
    ln.animate([{ opacity: 0, transform: 'scaleX(0)' }, { opacity: 0, transform: 'scaleX(0)', offset: .24, easing: EO }, { opacity: 1, transform: 'scaleX(1)', offset: .38 }, { opacity: 1, offset: .56 }, { opacity: 0, offset: .7 }, { opacity: 0 }], o);
    [t1, t2].forEach(function (el, i) { var y = i ? -8 : 8; el.animate([{ opacity: 0, transform: 'translateY(' + y + 'px)' }, { opacity: 0, transform: 'translateY(' + y + 'px)', offset: .28, easing: EO }, { opacity: 1, transform: 'none', offset: .42 }, { opacity: 1, offset: .56 }, { opacity: 0, offset: .64 }, { opacity: 0 }], o); });
    clearTimeout(fxT); fxT = setTimeout(swap, D * .34); a.onfinish = function () { fx.classList.remove('go'); };
  }
  // 문이 열린 뒤 장면이 자리 잡는 움직임: 그림이 1.1배에서 내려앉고, 글·카드가 차례로 올라옴
  function settle(hero, items, wait) {
    if (reduce() || !hero || !hero.animate) return;
    hero.animate([{ transform: 'scale(1.1)' }, { transform: 'scale(1)' }], { duration: 900, delay: wait, easing: EO, fill: 'backwards' });
    items.forEach(function (el, i) { if (el) el.animate([{ opacity: 0, transform: 'translateY(16px)' }, { opacity: 1, transform: 'none' }], { duration: 280, delay: wait + 160 + i * 60, easing: EO, fill: 'backwards' }); });
  }
  // 나갈 때: 짧게 어두워지며 사라짐
  function fadeOut(el, done) {
    if (reduce() || !el.animate) { done(); return; }
    el.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 200, easing: 'ease-out' }).onfinish = done;
  }
  window.lenaScene = { door: door, settle: settle, fadeOut: fadeOut };

  // ---------- 아침 브리핑 화면 ----------
  var panel = sheet.querySelector('.panel'), sbody = document.getElementById('shB');
  var hero = E('div', 'scn-hero'), himg = E('img'); himg.alt = ''; himg.decoding = 'async'; himg.src = 'assets/lena/menu/today.webp'; hero.appendChild(himg);
  var cat = E('div', 'scn-cat'), x = E('button', 'scn-x'); x.setAttribute('aria-label', '브리핑 닫기');
  x.innerHTML = '<svg viewBox="0 0 24 24"><path d="M7 7l10 10M17 7L7 17"/></svg>';
  x.onclick = function () { closeBrief(); };
  function ttl() {
    var d = new Date(), w = '일월화수목금토'[d.getDay()], h = d.getHours(), t = E('div', 'scn-ttl');
    t.append(E('small', null, (d.getMonth() + 1) + '월 ' + d.getDate() + '일 ' + w + '요일'), E('b', null, h < 11 ? '아침 브리핑' : h < 17 ? '오후 브리핑' : '저녁 브리핑'));
    return t;
  }
  function decorate() { if (!sheet.classList.contains('scn')) return; var t = ttl(); sbody.insertBefore(t, sbody.firstChild); return t; }
  function on() { sheet.classList.add('scn'); if (!hero.isConnected) panel.insertBefore(hero, panel.firstChild); if (!cat.isConnected) panel.insertBefore(cat, hero.nextSibling); if (!x.isConnected) panel.appendChild(x); }
  function off() { sheet.classList.remove('scn'); [hero, cat, x].forEach(function (e) { if (e.isConnected) e.remove(); }); }
  function closeBrief() { fadeOut(sheet, function () { closeSheet(); }); }

  var _os = openSheet;
  openSheet = function (n) {
    if (n !== 'brief') { if (sheet.classList.contains('scn')) off(); return _os(n); }
    var show = function () { on(); _os('brief'); var t = decorate(); settle(hero, [t, sbody.querySelector('.brief'), sbody.querySelector('.brief + .row, .row')], 0); };
    if (sheet.classList.contains('scn') && sheet.classList.contains('open')) { show(); return; }
    door('연결 중', outside() ? '고양이가 받았어 · 오늘 브리핑' : '1번 회선 · 오늘 브리핑', '#2fe0c8', show, 860);
  };
  // 부스 유리 틀: 자주 쓰는 네 화면에만
  var GL = { 1: 1, cal: 1, tt: 1, 6: 1 }, glbg = E('div', 'glbg');
  var _os2 = openSheet;
  openSheet = function (n) { _os2(n); var on = sheet.classList.contains('open') && GL[curSheet]; sheet.classList.toggle('boothgl', !!on); if (on && !glbg.isConnected) panel.insertBefore(glbg, panel.firstChild); else if (!on && glbg.isConnected) glbg.remove(); };
  var _rs = refreshSheet; refreshSheet = function () { _rs(); decorate(); };
  new MutationObserver(function () { if (!sheet.classList.contains('open') && sheet.classList.contains('scn')) off(); }).observe(sheet, { attributes: true, attributeFilter: ['class'] });

  // ---------- 오락실: 들어갈 때 문 연출 ----------
  if (typeof SH !== 'undefined' && SH[8] && window.openArc) {
    var _oa = window.openArc;
    SH[8].direct = function () { door('연결 중', outside() ? '고양이가 받았어 · 오락실' : '4번 회선 · 오락실', '#ff3d9a', function () { _oa(); }, 720); };
  }

  // ---------- 다이얼 버튼 배지: 부재중 + 밀린 것 ----------
  var badge = function (host) { if (!host) return null; var b = host.querySelector('.dbad'); if (!b) { b = E('em', 'dbad'); b.hidden = true; host.appendChild(b); } return b; };
  var b1 = badge(document.getElementById('dialBtn')), b2 = badge(document.querySelector('#aPad i'));
  function count() { var n = 0; try { n += missed().length; } catch (e) {} try { n += S.items.filter(isLate).length; } catch (e) {} return n; }
  function paintBadge() { var n = count(); [b1, b2].forEach(function (b) { if (!b) return; b.hidden = !n; b.textContent = n > 9 ? '9+' : String(n); }); }
  var _rh = renderHome; renderHome = function () { _rh.apply(this, arguments); paintBadge(); };
  paintBadge(); setInterval(paintBadge, 30000);
})();
