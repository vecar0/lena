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
    /* 전환 층: 어두운 문 → 연결 중 … → 지지직 → 딸깍 → 문이 열림 */
    '.scfx{position:absolute;inset:0;z-index:80;display:none;pointer-events:none;overflow:hidden;--lc:#2fe0c8}.scfx.go{display:block}' +
    '.scfx s{position:absolute;left:0;right:0;height:50.5%;background:#05080a repeating-linear-gradient(0deg,rgba(255,255,255,.035) 0 1px,transparent 1px 4px)}.scfx s.a{top:0;box-shadow:0 2px 0 var(--lc),0 0 34px 4px var(--lc)}.scfx s.b{bottom:0;box-shadow:0 -2px 0 var(--lc),0 0 34px 4px var(--lc)}' +
    '.scfx u{position:absolute;inset:-96px;opacity:0;background-size:96px 96px;mix-blend-mode:screen;filter:contrast(1.6)}.scfx u:after{content:"";position:absolute;inset:0;background:repeating-linear-gradient(0deg,rgba(0,0,0,.55) 0 2px,transparent 2px 5px),linear-gradient(180deg,transparent 38%,rgba(255,255,255,.35) 40%,transparent 43%,transparent 66%,rgba(255,255,255,.22) 67%,transparent 69%)}' +
    '.scfx p em{font-style:normal;margin-left:2px}' +
    '.scfx.st s,.scfx.st p{display:none}.scfx.st u{mix-blend-mode:normal;filter:contrast(1.4) brightness(.9)}' +
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
    /* v141 브리핑 = 비 오는 부스 유리 위에 테이프로 붙인 종이 쪽지들 */
    '.sheet.scn:before{content:"";position:absolute;inset:-40px;background:url(assets/lena/poster.jpg) center 30%/cover;filter:blur(22px) brightness(.32) saturate(1.3);pointer-events:none}' +
    '.sheet.scn:after{content:"";position:absolute;inset:0;pointer-events:none;background:repeating-linear-gradient(101deg,transparent 0 24px,rgba(159,245,228,.06) 24px 25px,transparent 25px 64px)}' +
    '.sheet.scn .panel{position:relative;z-index:1}.scn-hero{z-index:0}' +
    '.sheet.scn .brief{background:none;box-shadow:none;margin:0;padding:6px 2px 8px;gap:18px}' +
    '.sheet.scn .bhead{position:relative;display:block;padding:30px 16px 16px;background:url(assets/lena/paper_pink.webp) center/cover #ffd3e6;color:#2a0f1c;border:2px solid #000;border-radius:3px;box-shadow:5px 6px 0 rgba(0,0,0,.55);transform:rotate(-1.2deg)}' +
    '.sheet.scn .bhead:before{content:"☎ 레나한테서 온 메모";position:absolute;left:16px;top:9px;font:400 14px "Black Han Sans",sans-serif;color:#b0105a}' +
    '.sheet.scn .bhead:after{content:"";position:absolute;right:18px;top:-11px;width:66px;height:20px;background:url(assets/lena/tape_white.webp) center/100% 100%;transform:rotate(8deg)}' +
    '.sheet.scn .bhead p{font-size:16.5px;font-weight:700;line-height:1.6;color:#2a0f1c}.app.outside .sheet.scn .bhead i{position:absolute;right:12px;bottom:-18px;width:44px;height:44px}' +
    '.sheet.scn .bsec{position:relative;padding:18px 14px 12px;background:url(assets/lena/paper_white.webp) center/cover #f3efe6;color:#141414;border:2px solid #000;border-radius:2px;box-shadow:4px 5px 0 rgba(0,0,0,.5)}' +
    '.sheet.scn .bsec:nth-child(odd){transform:rotate(.5deg)}.sheet.scn .bsec:nth-child(even){transform:rotate(-.4deg)}' +
    '.sheet.scn .bsec:before{content:"";position:absolute;left:50%;top:-10px;width:58px;height:18px;margin-left:-29px;background:url(assets/lena/tape_teal1.webp) center/100% 100%;opacity:.95}' +
    '.sheet.scn .bsec h5{display:inline-block;margin:0 0 8px;font:400 18px/1.1 "Black Han Sans",sans-serif;color:#111;background:linear-gradient(transparent 58%,rgba(242,234,58,.85) 58%)}' +
    '.sheet.scn .bsec .r{font-size:15px;color:#1b1b1b;border-bottom:1px dashed rgba(0,0,0,.18);padding:6px 0}.sheet.scn .bsec .r:last-child{border-bottom:0}' +
    '.sheet.scn .bsec .r b{color:#d0124f;font-size:13px;font-weight:700}.sheet.scn .bsec .r.late b{color:#d0124f}' +
    '.sheet.scn .bsec .muted,.sheet.scn .bsec .hint{color:#555}.sheet.scn .bsec .row{margin-top:8px}' +
    '.sheet.scn .bsec .btn{border:2px solid #000;box-shadow:0 3px 0 #000;color:#111}.sheet.scn .bsec .btn.ghost{background:rgba(255,255,255,.6)}.sheet.scn .bsec .btn.teal{background:var(--teal)}' +
    '.sheet.scn .bsec:has(.eve-ch){background-image:url(assets/lena/paper_yellow.webp);background-color:#fff6b0}.sheet.scn .bsec:has(.eve-ch):before{background-image:url(assets/lena/tape_pink1.webp)}' +
    '.sheet.scn .eve-ch input{background:#fff;color:#111;border:2px solid #000}' +
    /* 기능 버튼은 다이얼 하나로 */
    '#missBtn,#boardBtn,#aBoard,#aCall,#aMiss,#aSet,#affB{display:none!important}' +
    '#boardBtn+.lb,.ctl>div:has(#boardBtn){display:none!important}' +
    '.app.outside .agrid{grid-template-columns:repeat(2,1fr)!important;padding-left:56px!important;padding-right:56px!important}' +
    '#flyers,#flyers *,#aInfo,#aInfo *{pointer-events:none!important}#knock{pointer-events:none!important}' +
    '.dbad{position:absolute;top:-4px;right:-6px;min-width:20px;height:20px;padding:0 5px;border-radius:10px;background:var(--hot);color:#fff;font:700 11px/20px "Space Mono",monospace;font-style:normal;text-align:center;border:2px solid #000;pointer-events:none}.dbad[hidden]{display:none}' +
    '#dialBtn,#aPad{position:relative}#aPad>.dbad{top:-9px;right:-9px}' +
    /* 1 전단지·2 캘린더·3 시간표·4 공부: 바깥 틀 = 비 오는 부스 유리 */
    '.sheet.boothgl .panel{background:#0a0e10;box-shadow:0 -1px 0 rgba(159,245,228,.55),0 -10px 28px rgba(47,224,200,.18);border-top:1px solid rgba(255,255,255,.22);overflow:hidden}.sheet.boothgl .panel::before{display:none}' +
    '.glbg{position:absolute;inset:0;z-index:0;pointer-events:none;border-radius:inherit;overflow:hidden}.glbg:before{content:"";position:absolute;inset:-40px;background:url(assets/lena/poster.jpg) center top/cover;filter:blur(24px) brightness(.36) saturate(1.35)}' +
    '.glbg:after{content:"";position:absolute;inset:0;background:repeating-linear-gradient(103deg,transparent 0 26px,rgba(159,245,228,.05) 26px 27px,transparent 27px 70px),linear-gradient(180deg,rgba(255,255,255,.07),transparent 90px),rgba(6,9,11,.5)}' +
    '.sheet.boothgl .shead,.sheet.boothgl .sbody{position:relative;z-index:1}' +
    '@media (prefers-reduced-motion:reduce){.scfx{display:none!important}}';
  document.head.appendChild(css);

  // ---------- 전환 연출 (v141: 전화 연결) ----------
  // 문이 닫힌 어두운 화면 → '연결 중 …'(연결음 뚜—) → 지지직 잡음(화면 노이즈·찢김 + 잡음 소리) → 딸깍(수화기 드는 소리)에 화면을 바꾸고 → 문이 위아래로 열림
  var fx = E('div', 'scfx'), dA = E('s', 'a'), dB = E('s', 'b'), nz = E('u'), t1 = E('p', 't1'), t2 = E('p', 't2'), dots = E('em'), fxT = 0, fxT2 = 0;
  dots.textContent = '…'; t1.append(document.createTextNode(''), dots); fx.append(dA, dB, nz, t1, t2); app.appendChild(fx);
  (function () { try { var c = document.createElement('canvas'); c.width = c.height = 96; var g = c.getContext('2d'), im = g.createImageData(96, 96); for (var i = 0; i < im.data.length; i += 4) { var v = Math.random() * 255 | 0; im.data[i] = im.data[i + 1] = im.data[i + 2] = v; im.data[i + 3] = 255; } g.putImageData(im, 0, 0); nz.style.backgroundImage = 'url(' + c.toDataURL() + ')'; } catch (e) {} })();
  function snd(kind, L) {
    try { if (typeof audio !== 'function') return; var a = audio(); if (!a || a.state !== 'running') return; var t = a.currentTime;
      if (kind === 'ring') { tone([440, 480], .42, .05); return; }
      var len = kind === 'hiss' ? (L || .34) : .05, buf = a.createBuffer(1, Math.ceil(a.sampleRate * len), a.sampleRate), d = buf.getChannelData(0);
      for (var i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * (kind === 'hiss' ? (Math.random() < .08 ? 1 : .45) : 1 - i / d.length);
      var src = a.createBufferSource(), f = a.createBiquadFilter(), g = a.createGain(); src.buffer = buf;
      f.type = kind === 'hiss' ? 'bandpass' : 'lowpass'; f.frequency.value = kind === 'hiss' ? 2600 : 900; f.Q.value = .8;
      g.gain.setValueAtTime(kind === 'hiss' ? .07 : .22, t); g.gain.linearRampToValueAtTime(0, t + len);
      src.connect(f); f.connect(g); g.connect(a.destination); src.start(t);
      if (kind === 'click') tone([120], .06, .09, 'square', .03);
    } catch (e) {}
  }
  function door(sub, title, color, swap, D, mode) {
    if (reduce() || !fx.animate) { swap(); return; }
    if (mode === 'static') { // 오락실: 글자·문 없이 지지직만 하다가 바뀜
      D = D || 650; fx.getAnimations({ subtree: true }).forEach(function (a) { a.cancel(); }); clearTimeout(fxT); clearTimeout(fxT2); fx.classList.add('go', 'st');
      var sk = [{ opacity: 0, transform: 'translate(0,0)' }];
      for (var q = 1; q <= 12; q++) sk.push({ opacity: q < 3 ? .5 * q : q > 9 ? .9 - (q - 9) * .28 : (q % 2 ? .95 : .8), transform: 'translate(' + (-Math.random() * 96 | 0) + 'px,' + (-Math.random() * 96 | 0) + 'px)', offset: q / 13, easing: 'steps(1,end)' });
      sk.push({ opacity: 0, transform: 'translate(0,0)' });
      nz.animate(sk, { duration: D, fill: 'both' }).onfinish = function () { fx.classList.remove('go', 'st'); };
      snd('hiss', D / 1000); fxT = setTimeout(swap, D * .5); return;
    }
    D = D || 1250; fx.style.setProperty('--lc', color || '#2fe0c8'); t1.firstChild.textContent = sub || '연결 중'; t2.textContent = title || '';
    fx.getAnimations({ subtree: true }).forEach(function (a) { a.cancel(); }); clearTimeout(fxT); clearTimeout(fxT2); fx.classList.add('go');
    var o = { duration: D, fill: 'both' }, R = .42, Z = .7; // R: 잡음 시작, Z: 딸깍(화면 바꿈)
    // 문: 처음 120ms에 어둡게 켜지고, 딸깍 뒤 위아래로 열림
    var dr = function (el, to) { return el.animate([{ opacity: 0, transform: 'none' }, { opacity: 1, offset: 120 / D }, { opacity: 1, transform: 'none', offset: Z, easing: EO }, { opacity: 1, transform: 'translateY(' + to + ')' }], o); };
    var a = dr(dA, '-104%'); dr(dB, '104%');
    // 글자: 연결 중 … → 잡음 구간에 흔들리며 번쩍 → 딸깍에 사라짐
    var jit = []; for (var k = 0; k <= 8; k++) jit.push({ transform: 'translateX(' + (k % 2 ? 1 : -1) * (2 + Math.random() * 7) + 'px)', opacity: Math.random() < .3 ? .35 : 1, offset: R + (Z - R) * k / 8, easing: 'steps(1,end)' });
    [t1, t2].forEach(function (el, i) { el.animate([{ opacity: 0, transform: 'translateY(' + (i ? -6 : 6) + 'px)', easing: EO }, { opacity: 1, transform: 'none', offset: .16 }, { opacity: 1, transform: 'none', offset: R }].concat(jit).concat([{ opacity: 0, transform: 'none', offset: Z + .04 }, { opacity: 0 }]), o); });
    dots.animate([{ opacity: .2 }, { opacity: 1 }], { duration: 300, iterations: 3, easing: 'ease-out' });
    // 잡음 층: 잡음 구간에만 깜빡이며 위치가 튐(transform 단계 이동)
    var nk = [{ opacity: 0, transform: 'translate(0,0)', offset: 0 }, { opacity: 0, offset: R, easing: 'steps(1,end)' }];
    for (var j = 1; j <= 10; j++) nk.push({ opacity: j % 3 ? .55 : .3, transform: 'translate(' + (-Math.random() * 96 | 0) + 'px,' + (-Math.random() * 96 | 0) + 'px)', offset: R + (Z - R) * j / 10, easing: 'steps(1,end)' });
    nk.push({ opacity: .7, offset: Z }, { opacity: 0, offset: Z + .08 }, { opacity: 0, offset: 1 }); nz.animate(nk, o);
    snd('ring'); fxT = setTimeout(function () { snd('hiss'); }, D * R);
    fxT2 = setTimeout(function () { snd('click'); swap(); }, D * Z); a.onfinish = function () { fx.classList.remove('go'); };
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
  var scnKey = 'brief';
  function ttl() {
    var d = new Date(), w = '일월화수목금토'[d.getDay()], h = d.getHours(), t = E('div', 'scn-ttl');
    t.append(E('small', null, (d.getMonth() + 1) + '월 ' + d.getDate() + '일 ' + w + '요일'), E('b', null, scnKey === 'eve' ? '저녁 브리핑' : h < 11 ? '아침 브리핑' : h < 17 ? '오후 브리핑' : '저녁 브리핑'));
    return t;
  }
  function decorate() { if (!sheet.classList.contains('scn')) return; var t = ttl(); sbody.insertBefore(t, sbody.firstChild); return t; }
  function on() { sheet.classList.add('scn'); if (!hero.isConnected) panel.insertBefore(hero, panel.firstChild); if (!cat.isConnected) panel.insertBefore(cat, hero.nextSibling); if (!x.isConnected) panel.appendChild(x); }
  function off() { sheet.classList.remove('scn'); [hero, cat, x].forEach(function (e) { if (e.isConnected) e.remove(); }); }
  function closeBrief() { fadeOut(sheet, function () { closeSheet(); }); }

  var _os = openSheet;
  openSheet = function (n) {
    if (n !== 'brief' && n !== 'eve') { if (sheet.classList.contains('scn')) off(); return _os(n); }
    scnKey = n; var show = function () { on(); _os(n); var t = decorate(); settle(hero, [t, sbody.querySelector('.brief'), sbody.querySelector('.brief + .row, .row')], 0); };
    if (sheet.classList.contains('scn') && sheet.classList.contains('open')) { show(); return; }
    var nm = n === 'eve' ? '저녁 브리핑' : '오늘 브리핑'; door('연결 중', outside() ? '고양이가 받았어 · ' + nm : '레나 · ' + nm, n === 'eve' ? '#ff3d9a' : '#2fe0c8', show, 1250);
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
    SH[8].direct = function () { door('연결 중', outside() ? '고양이가 받았어 · 오락실' : '딜러 레나 · 오락실', '', function () { _oa(); }, 650, 'static'); };
  }

  // ---------- 다이얼 버튼 배지: 부재중 + 밀린 것 ----------
  var badge = function (host) { if (!host) return null; var b = host.querySelector('.dbad'); if (!b) { b = E('em', 'dbad'); b.hidden = true; host.appendChild(b); } return b; };
  var b1 = badge(document.getElementById('dialBtn')), b2 = badge(document.getElementById('aPad'));
  function count() { var n = 0; try { n += missed().length; } catch (e) {} try { n += S.items.filter(isLate).length; } catch (e) {} return n; }
  function paintBadge() { var n = count(); [b1, b2].forEach(function (b) { if (!b) return; b.hidden = !n; b.textContent = n > 9 ? '9+' : String(n); }); }
  var _rh = renderHome; renderHome = function () { _rh.apply(this, arguments); paintBadge(); };
  paintBadge(); setInterval(paintBadge, 30000);
})();
