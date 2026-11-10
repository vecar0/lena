/* SD 레나 펫 — 머리·몸·다리 층을 스프링으로 움직인다. LenaPet(stage, {img:{head,headc,body,legl,legr}, meta, size}) */
(function () {
  'use strict';
  var CSS = '.lp{position:absolute;left:0;top:0;touch-action:none;user-select:none;-webkit-user-select:none;cursor:grab;will-change:transform;-webkit-tap-highlight-color:transparent}' +
    '.lp.grab{cursor:grabbing}.lp i{position:absolute;inset:0;display:block;will-change:transform}' +
    '.lp img{position:absolute;inset:0;width:100%;height:100%;pointer-events:none;-webkit-user-drag:none}' +
    '.lp .lp-hc{opacity:0}.lp.shut .lp-hc{opacity:1}.lp.shut .lp-ho{opacity:0}' +
    '.lp-sh{position:absolute;left:0;top:0;border-radius:50%;background:rgba(0,0,0,.42);filter:blur(3px);pointer-events:none;will-change:transform,opacity}' +
    '.lp-b{position:absolute;left:0;top:0;max-width:190px;padding:8px 12px;border-radius:14px;background:#f3efe6;color:#111;border:2px solid #111;font:600 13px/1.35 Pretendard,system-ui,sans-serif;box-shadow:3px 3px 0 #ff3d9a;opacity:0;transform-origin:50% 100%;transition:opacity .16s cubic-bezier(0.23,1,0.32,1),scale .16s cubic-bezier(0.23,1,0.32,1);scale:.95;will-change:transform,opacity;cursor:pointer;-webkit-tap-highlight-color:transparent;pointer-events:none}.lp-b.on{opacity:1;scale:1;pointer-events:auto}.lp-b:after{content:"";position:absolute;left:50%;bottom:-8px;width:12px;height:12px;margin-left:-6px;background:#f3efe6;border-right:2px solid #111;border-bottom:2px solid #111;transform:rotate(45deg)}' +
    '.lp-p{position:absolute;left:0;top:0;pointer-events:none;font:700 18px/1 system-ui,sans-serif;will-change:transform,opacity;text-shadow:0 1px 4px rgba(0,0,0,.5)}';
  function css() { if (document.getElementById('lp-css')) return; var s = document.createElement('style'); s.id = 'lp-css'; s.textContent = CSS; document.head.appendChild(s); }
  function el(t, c, p) { var e = document.createElement(t); if (c) e.className = c; if (p) p.appendChild(e); return e; }
  // 스프링: 값·속도·목표 (k 세기, c 감쇠)
  function Sp(v, k, c) { this.x = v; this.v = 0; this.t = v; this.k = k; this.c = c; }
  Sp.prototype.step = function (dt) { this.v += (-this.k * (this.x - this.t) - this.c * this.v) * dt; this.x += this.v * dt; return this.x; };
  var R = function (a, b) { return a + Math.random() * (b - a); }, CL = function (v, a, b) { return v < a ? a : v > b ? b : v; };

  window.LenaPet = function (stage, o) {
    css();
    var M = o.meta, H = o.size || 170, W = H * M.w / M.h, I = o.img;
    var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
    var sh = el('div', 'lp-sh', stage), root = el('div', 'lp', stage);
    root.style.width = W + 'px'; root.style.height = H + 'px';
    sh.style.width = W * .62 + 'px'; sh.style.height = H * .07 + 'px';
    var flip = el('i', '', root), rig = el('i', '', flip), lL = el('i', '', rig), lR = el('i', '', rig), torso = el('i', '', rig), arm = el('i', ''), head = el('i', ''), bub = el('div', 'lp-b', stage);
    function im(src, p, c) { var g = el('img', c, p); g.src = src; g.alt = ''; g.draggable = false; return g; }
    im(I.legl, lL); im(I.legr, lR); im(I.body, torso); torso.appendChild(arm); if (I.arm) im(I.arm, arm); torso.appendChild(head); im(I.head, head, 'lp-ho'); im(I.headc, head, 'lp-hc');
    var og = function (e, p) { e.style.transformOrigin = p[0] + '% ' + p[1] + '%'; };
    og(flip, [50, 100]); og(rig, [M.feet[0], M.feet[1]]); og(lL, M.hipL); og(lR, M.hipR); og(torso, [50, M.hipL[1]]); og(head, M.neck); og(arm, M.sh || [16, 45]);
    root.setAttribute('role', 'img'); root.setAttribute('aria-label', '레나 펫');

    var st = { x: 0, y: 0, vx: 0, vy: 0, dir: 1, mode: 'idle', t: 0, next: R(1.5, 3), ph: 0, quiet: 0, tx: 0, hop: 0, blink: R(2, 5), shut: 0, eyes: 0, pt: 0, fl: 0, wave: 0, busy: 0, cb: null, land: null };
    var sq = new Sp(1, 260, 16), tilt = new Sp(0, 120, 12), hr = new Sp(0, 90, 11), hy = new Sp(0, 140, 14), la = new Sp(0, 160, 14), lb = new Sp(0, 160, 14), fl = new Sp(1, 300, 26), ty = new Sp(0, 200, 18), ar = new Sp(0, 130, 11);
    var bw = 0, bh = 0;
    function size() { var r = stage.getBoundingClientRect(); bw = r.width; bh = r.height; st.x = CL(st.x, 0, Math.max(0, bw - W)); }
    size(); st.x = (bw - W) / 2; st.tx = st.x;
    var ro = window.ResizeObserver ? new ResizeObserver(size) : null; if (ro) ro.observe(stage); else addEventListener('resize', size);

    function eyes(shut) { if (st.eyes === shut) return; st.eyes = shut; root.classList.toggle('shut', !!shut); }
    function puff(ch, col, n) {
      for (var i = 0; i < (n || 1); i++) (function (i) {
        var p = el('span', 'lp-p', stage); p.textContent = ch; p.style.color = col;
        var x = st.x + W * (M.top[0] / 100) + R(-W * .3, W * .3), y = bh - st.y - H * (1 - M.top[1] / 100) + R(-8, 8), dx = R(-26, 26), up = R(46, 78), r = R(-18, 18);
        var a = p.animate([{ transform: 'translate(' + x + 'px,' + y + 'px) scale(.6) rotate(0deg)', opacity: 0 },
          { transform: 'translate(' + (x + dx * .4) + 'px,' + (y - up * .45) + 'px) scale(1) rotate(' + r * .5 + 'deg)', opacity: 1, offset: .25 },
          { transform: 'translate(' + (x + dx) + 'px,' + (y - up) + 'px) scale(.9) rotate(' + r + 'deg)', opacity: 0 }],
          { duration: 1100 + i * 90, delay: i * 70, easing: 'cubic-bezier(0.23, 1, 0.32, 1)', fill: 'both' });
        a.onfinish = function () { p.remove(); };
      })(i);
    }
    function go(m) { st.mode = m; st.t = 0; }
    function jump(v) { if (st.y > 0) return; st.vy = v || 560; st.y = .01; sq.v += 3.2; if (st.mode !== 'happy') go('air'); }
    function wake() { if (st.mode === 'sleep') { eyes(0); go('idle'); jump(300); puff('!', '#f2ea3a'); } st.quiet = 0; }

    // 손가락: 누름=점프, 두 번=신남, 길게=쓰다듬기, 끌기=들어 올리기, 놓으면 던지기
    var bubOn = 0, bubT = 0;
    function sayB(t, ms, fn) { clearTimeout(bubT); if (!t) { bubOn = 0; bub.classList.remove('on'); return; } bub.textContent = t; bubOn = 1; bub.classList.add('on'); bub.onclick = fn || null; if (ms) bubT = setTimeout(function () { sayB(''); }, ms); }
    function walkTo(x, cb) { wake(); st.tx = CL(x, 0, Math.max(0, bw - W)); st.cb = cb || null; if (Math.abs(st.tx - st.x) < 2) { if (cb) { st.cb = null; cb(); } return; } go('walk'); }
    function stomp(drop, cb) { if (st.y > st.fl) return; st.land = cb; st.fl = -Math.max(0, drop); st.vy = 470; st.y = .01; sq.v += 3; go('air'); }
    var P = null, lastTap = 0;
    root.addEventListener('pointerdown', function (e) {
      root.setPointerCapture(e.pointerId); var was = st.mode === 'sleep'; wake();
      P = { id: e.pointerId, x0: e.clientX, y0: e.clientY, x: e.clientX, y: e.clientY, px: e.clientX, py: e.clientY, t0: performance.now(), vx: 0, vy: 0, drag: 0, ox: e.clientX - st.x, oy: e.clientY + st.y, woke: was };
      P.lp = setTimeout(function () { if (P && !P.drag && st.y <= 0) { go('pet'); st.pt = 0; eyes(1); } }, 420);
      e.preventDefault();
    });
    root.addEventListener('pointermove', function (e) {
      if (!P || e.pointerId !== P.id) return;
      var now = performance.now(), dt = Math.max(8, now - (P.tm || P.t0)); P.tm = now;
      P.vx = P.vx * .6 + (e.clientX - P.x) / dt * 1000 * .4; P.vy = P.vy * .6 + (e.clientY - P.y) / dt * 1000 * .4; P.x = e.clientX; P.y = e.clientY;
      if (!P.drag && st.mode !== 'pet' && Math.hypot(P.x - P.x0, P.y - P.y0) > 8) { P.drag = 1; clearTimeout(P.lp); go('drag'); eyes(0); root.classList.add('grab'); }
    });
    function up(e) {
      if (!P || e.pointerId !== P.id) return; clearTimeout(P.lp); root.classList.remove('grab');
      var now = performance.now();
      if (st.mode === 'drag') { st.vx = CL(P.vx, -1400, 1400); st.vy = CL(-P.vy, -1400, 1500); if (now - P.tm > 90) { st.vx = 0; st.vy = 0; } go('air'); if (st.y <= 0) { st.y = 0; go('idle'); } }
      else if (st.mode === 'pet') { eyes(0); go('idle'); st.next = R(1, 2); }
      else if (!P.woke) {
        if (now - lastTap < 330) { go('happy'); st.hop = 3; eyes(1); puff('♥', '#ff3d9a', 4); puff('✦', '#f2ea3a', 3); jump(430); lastTap = 0; }
        else if (o.onTap && o.onTap()) { lastTap = 0; }
        else { lastTap = now; jump(); }
      }
      P = null;
    }
    root.addEventListener('pointerup', up); root.addEventListener('pointercancel', up);

    var last = 0, raf = 0, on = true;
    function frame(now) {
      raf = requestAnimationFrame(frame);
      var dt = Math.min(.033, (now - last) / 1000 || .016); last = now;
      var m = st.mode, maxX = Math.max(0, bw - W); st.t += dt; st.quiet += dt;
      var breathe = Math.sin(now / 1000 * (m === 'sleep' ? 1.5 : 2.4)), tT = 0, hT = 0, hyT = 0, aT = 0, bT = 0, sT = 1;

      if (m === 'drag' && P) {                       // 들려서 매달림: 손 속도만큼 몸이 뒤로 쏠림
        st.x = CL(P.x - P.ox, -W * .3, maxX + W * .3); st.y = CL(P.oy - P.y, 0, Math.max(0, bh - H * .8));
        tT = CL(-P.vx * .035, -38, 38); aT = tT * .9 + 8; bT = tT * .9 - 8; hT = -tT * .25; sT = 1.04;
        P.vx *= .9; P.vy *= .9;
      } else if (st.y > st.fl || m === 'air') {          // 공중: 중력·벽 튕김
        st.vy -= 1900 * dt; st.x += st.vx * dt; st.y += st.vy * dt;
        if (st.x < 0) { st.x = 0; st.vx = -st.vx * .55; } else if (st.x > maxX) { st.x = maxX; st.vx = -st.vx * .55; }
        tT = CL(st.vx * .03, -30, 30); aT = -14; bT = 14; sT = 1 + CL(Math.abs(st.vy) / 5000, 0, .12); hT = CL(-st.vy * .006, -6, 6);
        if (st.fl < 0 && st.vy < 0 && !st.land && st.y > 0) st.fl = 0;
        if (st.y <= st.fl) {                          // 착지: 세게 떨어질수록 더 눌림
          var hit = -st.vy; st.y = st.fl;
          if (st.land) { var f = st.land; st.land = null; sq.v -= 4; st.vy = Math.sqrt(2 * 1900 * (-st.fl + H * .12)); st.y = st.fl + .01; st.vx = 0; f(); return draw(dt); }
          if (hit > 520 && m !== 'happy') { st.vy = hit * .32; st.y = st.fl + .01; st.vx *= .6; } else { st.vy = 0; st.vx = 0; }
          sq.v -= CL(hit / 150, 1.5, 6);
          if (m === 'happy') { if (--st.hop > 0) { st.vy = 400; st.y = .01; puff('♥', '#ff3d9a', 2); } else { eyes(0); go('idle'); st.next = R(1.2, 2.2); } }
          else if (st.vy === 0) { go('idle'); st.next = R(.8, 1.8); if (hit > 900) { eyes(1); st.shut = .5; puff('✦', '#f2ea3a', 2); } }
        }
        if (st.vx) st.dir = st.vx > 0 ? 1 : -1;
      } else if (m === 'walk') {
        var d = st.tx - st.x, sp = 52;
        st.dir = d > 0 ? 1 : -1; st.x += st.dir * Math.min(Math.abs(d), sp * dt); st.ph += dt * 9;
        var s = Math.sin(st.ph); aT = s * 17; bT = -s * 17; ty.t = -Math.abs(Math.cos(st.ph)) * H * .016; hT = s * 2.2; tT = 2.2;
        if (Math.abs(d) < 1) { go('idle'); st.next = R(1.5, 4); if (st.cb) { var c = st.cb; st.cb = null; c(); } }
      } else if (m === 'pet') {                       // 쓰다듬기: 눌린 머리가 살랑, 하트
        st.pt += dt; hyT = H * .022; sT = .955; hT = Math.sin(now / 130) * 3.5;
        if (st.pt > .34) { st.pt = 0; puff('♥', '#ff3d9a'); }
      } else if (m === 'sleep') {                     // 잠: 고개 떨구고 느린 숨
        hT = 9 + breathe * 1.2; hyT = H * .016; sT = .975 + breathe * .012; tT = 2;
        st.pt += dt; if (st.pt > 1.7) { st.pt = 0; puff('z', '#9ff5e4'); }
      } else {                                        // 가만히: 숨쉬기 + 가끔 딴짓
        sT = 1 + breathe * (reduce ? .004 : .011); hyT = breathe * H * .004;
        if (st.look) { hT = st.look; if (st.t > st.lookEnd) st.look = 0; }
        if (!reduce && !st.busy && st.t > st.next) {
          var r = Math.random(); st.t = 0;
          if (st.quiet > 40) { go('sleep'); eyes(1); st.pt = 0; }
          else if (r < .55 && maxX > 20) { st.tx = CL(st.x + R(-1, 1) * Math.max(80, bw * .45), 0, maxX); if (Math.abs(st.tx - st.x) > 24) go('walk'); else st.next = R(1, 2); }
          else if (r < .85) { st.look = R(4, 8) * (Math.random() < .5 ? -1 : 1); st.lookEnd = R(.8, 1.6); st.next = st.lookEnd + R(1, 3); }
          else { jump(380); }
        }
      }
      if (m !== 'walk') ty.t = 0;
      // 눈 깜빡임 (잠·쓰다듬기·신남은 감은 채)
      if (m !== 'sleep' && m !== 'pet' && m !== 'happy') {
        if (st.shut > 0) { st.shut -= dt; if (st.shut <= 0) eyes(0); }
        else if ((st.blink -= dt) <= 0) { eyes(1); st.shut = .12; st.blink = Math.random() < .2 ? .28 : R(2.2, 5.5); }
      }
      ar.t = st.wave ? 118 + Math.sin(now / 95) * 16 : m === 'drag' ? 30 + tT * .6 : (st.y > st.fl ? 34 : m === 'walk' ? Math.sin(st.ph) * 9 : m === 'happy' ? 120 : 0);
      sq.t = sT; tilt.t = tT; hr.t = hT; hy.t = hyT; la.t = aT; lb.t = bT; fl.t = st.dir;
      draw(dt);
    }
    function draw(dt) {
      var S = CL(sq.step(dt), .7, 1.3), T = tilt.step(dt), F = fl.step(dt);
      root.style.transform = 'translate3d(' + st.x.toFixed(2) + 'px,' + (bh - H - st.y).toFixed(2) + 'px,0)';
      flip.style.transform = 'scaleX(' + (Math.abs(F) < .08 ? (F < 0 ? -.08 : .08) : F).toFixed(3) + ')';
      rig.style.transform = 'rotate(' + (T * st.dir).toFixed(2) + 'deg) scale(' + (2 - S).toFixed(3) + ',' + S.toFixed(3) + ')';
      lL.style.transform = 'rotate(' + la.step(dt).toFixed(2) + 'deg)'; lR.style.transform = 'rotate(' + lb.step(dt).toFixed(2) + 'deg)';
      torso.style.transform = 'translateY(' + ty.step(dt).toFixed(2) + 'px)';
      arm.style.transform = 'rotate(' + ar.step(dt).toFixed(2) + 'deg)';
      head.style.transform = 'translateY(' + hy.step(dt).toFixed(2) + 'px) rotate(' + hr.step(dt).toFixed(2) + 'deg)';
      var k = CL(1 - st.y / (H * 1.6), .35, 1);
      sh.style.transform = 'translate3d(' + (st.x + W * (M.feet[0] / 100 - .36)).toFixed(1) + 'px,' + (bh - H * .05).toFixed(1) + 'px,0) scale(' + k.toFixed(3) + ')'; sh.style.opacity = st.fl < 0 ? 0 : (.25 + k * .6).toFixed(2);
      if (bubOn) { var bwid = bub.offsetWidth, bx = CL(st.x + W / 2 - bwid / 2, 6, bw - bwid - 6); bub.style.transform = 'translate3d(' + bx.toFixed(1) + 'px,' + (bh - H - st.y - bub.offsetHeight - 12).toFixed(1) + 'px,0)'; }
    }
    function vis() { var v = !document.hidden; if (v && !on) { last = performance.now(); raf = requestAnimationFrame(frame); } else if (!v) cancelAnimationFrame(raf); on = v; }
    document.addEventListener('visibilitychange', vis); raf = requestAnimationFrame(frame);
    return {
      state: st, jump: jump, wake: wake, say: sayB, walkTo: walkTo, stomp: stomp, el: root, W: W, H: H, puff: puff,
      wave: function (v) { st.wave = v ? 1 : 0; }, busy: function (v) { st.busy = v ? 1 : 0; st.t = 0; st.next = R(1.5, 3); }, resize: size,
      sleep: function () { st.quiet = 99; st.t = 99; },
      destroy: function () { cancelAnimationFrame(raf); document.removeEventListener('visibilitychange', vis); if (ro) ro.disconnect(); root.remove(); sh.remove(); bub.remove(); }
    };
  };
})();

/* ---- 앱에 붙이기 (v115): 음성통화 화면 버튼 줄 위를 돌아다니며, 볼 게 있으면 그 버튼으로 가서 손 흔들고, 누르면 밟아서 눌러 준다 ---- */
(function () {
  'use strict';
  var cv = document.getElementById('callv'), grid = document.getElementById('agrid'), app = document.querySelector('.app');
  if (!cv || !grid || !app || typeof S === 'undefined') return;
  var META = {"w": 356, "h": 575, "neck": [46.99, 34.06], "hipL": [38.49, 63.6], "hipR": [64.7, 63.6], "feet": [60.92, 99.12], "sh": [16.29, 45.03], "top": [50.3, 17.11]}, A = 'assets/lena/pet/';
  var st = document.createElement('style');
  st.textContent = '#lpStage{position:absolute!important;left:0;right:0;top:0;z-index:3!important;pointer-events:none;display:none}.app.outside #lpStage.on{display:block}#lpStage .lp{pointer-events:auto}' +
    '.app.outside .callv.haspet .log{margin-bottom:58px}' +
    '.ab{transition:transform .14s cubic-bezier(0.23,1,0.32,1)}.ab.lp-press{transform:scale(.88)}.ab.lp-hl i{outline:2px solid #ff3d9a;outline-offset:3px;box-shadow:0 0 16px rgba(255,61,154,.6)}';
  document.head.appendChild(st);
  var stage = document.createElement('div'); stage.id = 'lpStage'; cv.appendChild(stage);
  var pet = null, cur = null, curT = 0, nextAt = Date.now() + 6000, seen = {}, typing = false;
  function place() {
    var on = !S.petOff && !typing && app.classList.contains('outside');
    stage.classList.toggle('on', on); cv.classList.toggle('haspet', on); if (!on) { if (cur) cancel(); return; }
    var c = cv.getBoundingClientRect(), g = grid.getBoundingClientRect();
    if (!g.height || !c.height) { stage.classList.remove('on'); return; }
    stage.style.height = Math.round(g.top - c.top + 10) + 'px';
    if (!pet) pet = LenaPet(stage, { img: { head: A + 'head.webp', headc: A + 'headc.webp', body: A + 'body.webp', arm: A + 'arm.webp', legl: A + 'legl.webp', legr: A + 'legr.webp' }, meta: META, size: 78, onTap: function () { if (cur) { act(); return true; } return false; } });
    else pet.resize();
  }
  function ideas() {
    var a = [], now = Date.now(), h = new Date().getHours();
    try { var ms = missed().length; if (ms) a.push({ k: 'miss', b: 'aMiss', t: '부재중 ' + ms + '개 왔어. 안 볼 거야?', p: 1 }); } catch (e) {}
    try { var late = S.items.filter(isLate).length; if (late) a.push({ k: 'late', b: 'aBoard', t: '밀린 거 ' + late + '개 있는데… 모른 척할 거야?', p: 1 }); } catch (e) {}
    try { var ev = S.items.filter(function (t) { return !t.done && isEv(t) && t.due && new Date(t.due) > now && new Date(t.due) - now < 2 * 3600e3; }).sort(function (x, y) { return new Date(x.due) - new Date(y.due); })[0]; if (ev) a.push({ k: 'ev' + ev.id, b: 'aBoard', t: '곧 ' + String(ev.text).slice(0, 14) + ' 있어. 준비됐어?', p: 1 }); } catch (e) {}
    try { var td = S.items.filter(function (t) { return !t.done && !isEv(t) && !t.rid; }).length; if (td) a.push({ k: 'todo', b: 'aBoard', t: '할 일 ' + td + '개 남았어. 같이 볼까?' }); } catch (e) {}
    try { if (S.study && (S.study.mats || []).length && h >= 15) a.push({ k: 'study', b: 'aCall', t: '오늘 공부 짜 놨는데, 볼래?' }); } catch (e) {}
    a.push({ k: 'vid', b: 'aVid', t: '얼굴 보고 얘기할래?' }, { k: 'pad', b: 'aPad', t: '다이얼 눌러 봐. 운세도 있어.' });
    return a.filter(function (x) { return !seen[x.k] || now - seen[x.k] > (x.p ? 10 : 30) * 60000; });
  }
  function clear() { clearTimeout(curT); if (cur) cur.btn.classList.remove('lp-hl'); pet.wave(0); pet.say(''); }
  function cancel() { if (!cur) return; clear(); cur = null; pet.busy(0); }
  function act() {
    if (!cur) return; var c = cur; clear(); cur = null;
    var r = c.btn.getBoundingClientRect(), s = stage.getBoundingClientRect();
    pet.stomp(r.top + r.height * .45 - s.bottom, function () {
      c.btn.classList.add('lp-press'); setTimeout(function () { c.btn.classList.remove('lp-press'); }, 180);
      pet.busy(0); setTimeout(function () { c.btn.click(); }, 120);
    });
  }
  function suggest() {
    var L = ideas(); if (!L.length) return;
    var imp = L.filter(function (x) { return x.p; }), it = imp.length ? imp[0] : L[Math.floor(Math.random() * L.length)], btn = document.getElementById(it.b);
    if (!btn || !btn.offsetWidth) return;
    seen[it.k] = Date.now(); pet.busy(1); cur = { btn: btn, walking: 1 };
    var r = btn.getBoundingClientRect(), s = stage.getBoundingClientRect();
    pet.walkTo(r.left - s.left + r.width / 2 - pet.W * (META.feet[0] / 100), function () {
      if (!cur || cur.btn !== btn) return; cur.walking = 0;
      btn.classList.add('lp-hl'); pet.wave(1); pet.say(it.t, 0, act);
      curT = setTimeout(cancel, 8000);
    });
    curT = setTimeout(function () { if (cur && cur.walking) cancel(); }, 9000);
  }
  setInterval(function () {
    if (!pet || document.hidden || !stage.classList.contains('on') || cur) return;
    var now = Date.now(); if (now < nextAt) return;
    var m = pet.state.mode; if (m !== 'idle' && m !== 'walk') { nextAt = now + 4000; return; }
    var g = grid.getBoundingClientRect(), top = document.elementFromPoint(g.left + g.width / 2, g.top + g.height / 2);
    if (!top || !grid.contains(top)) { nextAt = now + 5000; return; }       // 다른 화면이 덮고 있으면 쉼
    nextAt = now + 40000 + Math.random() * 30000; suggest();
  }, 1000);
  var msg = document.getElementById('msg');
  if (msg) { msg.addEventListener('focus', function () { typing = true; place(); }); msg.addEventListener('blur', function () { typing = false; setTimeout(place, 250); }); }
  if (window.ResizeObserver) { var ro = new ResizeObserver(place); ro.observe(cv); ro.observe(grid); }
  new MutationObserver(place).observe(app, { attributes: true, attributeFilter: ['class'] });
  addEventListener('resize', place); setTimeout(place, 1200);
  // 0번 설정: 펫 켜기/끄기
  try {
    var _r = SH[0].r; SH[0].r = function (B) {
      _r(B); var sec = el('div', 'card'), r1 = el('div', 'row'); r1.appendChild(el('div', 't', '꼬마 레나')).style.flex = '1';
      r1.appendChild(pills([[true, '켜기'], [false, '끄기']], !S.petOff, function (v) { S.petOff = !v; save(); place(); refreshSheet(); })); sec.appendChild(r1);
      sec.appendChild(el('div', 'hint', '음성통화 화면 버튼 위를 돌아다녀요. 볼 게 있으면 그 버튼으로 가서 손을 흔들고, 누르면 대신 눌러 줘요. 끌어서 던지거나 길게 눌러 쓰다듬을 수도 있어요.'));
      var bk = [].slice.call(B.querySelectorAll('.lbl')).find(function (x) { return x.textContent === '백업'; }) || null;
      B.insertBefore(lbl('꼬마 레나'), bk); B.insertBefore(sec, bk);
    };
  } catch (e) {}
  window.lenaPet = { get pet() { return pet; }, suggest: function () { nextAt = 0; }, place: place, get cur() { return cur; } };
})();
