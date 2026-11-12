/* 꼬마 레나 펫 — 머리·몸·팔·다리 층을 스프링으로 움직이고, 버튼을 발판 삼아 돌아다닌다(중력·착지·튕김).
   LenaPet(stage, {img, meta, size, platforms(r), floor(r), active(), onTap()}) — 좌표는 stage 기준, st.x/st.y = 발 위치 */
(function () {
  'use strict';
  var CSS = '.lp{position:absolute;left:0;top:0;touch-action:none;user-select:none;-webkit-user-select:none;cursor:grab;will-change:transform;-webkit-tap-highlight-color:transparent}' +
    '.lp.grab{cursor:grabbing}.lp i{position:absolute;inset:0;display:block;will-change:transform}' +
    '.lp img{position:absolute;inset:0;width:100%;height:100%;pointer-events:none;-webkit-user-drag:none}' +
    '.lp .lp-hc{opacity:0}.lp.shut .lp-hc{opacity:1}.lp.shut .lp-ho{opacity:0}' +
    '.lp-sh{position:absolute;left:0;top:0;border-radius:50%;background:rgba(0,0,0,.45);filter:blur(2px);pointer-events:none;will-change:transform,opacity}' +
    '.lp-b{position:absolute;left:0;top:0;max-width:190px;padding:8px 12px;border-radius:14px;background:#f3efe6;color:#111;border:2px solid #111;font:600 13px/1.35 Pretendard,system-ui,sans-serif;box-shadow:3px 3px 0 #ff3d9a;opacity:0;transform-origin:50% 100%;transition:opacity .16s cubic-bezier(0.23,1,0.32,1),scale .16s cubic-bezier(0.23,1,0.32,1);scale:.95;will-change:transform,opacity;cursor:pointer;-webkit-tap-highlight-color:transparent;pointer-events:none}.lp-b.on{opacity:1;scale:1;pointer-events:auto}.lp-b:after{content:"";position:absolute;left:50%;bottom:-8px;width:12px;height:12px;margin-left:-6px;background:#f3efe6;border-right:2px solid #111;border-bottom:2px solid #111;transform:rotate(45deg)}' +
    '.lp-alt{position:absolute;left:0;top:6px;padding:4px 9px;border-radius:12px;background:#111;color:#f2ea3a;border:2px solid #f2ea3a;font:700 12px/1 "Space Mono",monospace;opacity:0;transition:opacity .15s cubic-bezier(0.23,1,0.32,1);pointer-events:none;will-change:transform,opacity;white-space:nowrap}.lp-alt.on{opacity:1}' +
    '.lp-p{position:absolute;left:0;top:0;pointer-events:none;font:700 18px/1 system-ui,sans-serif;will-change:transform,opacity;text-shadow:0 1px 4px rgba(0,0,0,.5)}';
  function css() { if (document.getElementById('lp-css')) return; var s = document.createElement('style'); s.id = 'lp-css'; s.textContent = CSS; document.head.appendChild(s); }
  function el(t, c, p) { var e = document.createElement(t); if (c) e.className = c; if (p) p.appendChild(e); return e; }
  function Sp(v, k, c) { this.x = v; this.v = 0; this.t = v; this.k = k; this.c = c; }   // 스프링: k 세기, c 감쇠
  Sp.prototype.step = function (dt) { this.v += (-this.k * (this.x - this.t) - this.c * this.v) * dt; this.x += this.v * dt; return this.x; };
  var R = function (a, b) { return a + Math.random() * (b - a); }, CL = function (v, a, b) { return v < a ? a : v > b ? b : v; }, G = 1900;

  window.LenaPet = function (stage, o) {
    css();
    var M = o.meta, H = o.size || 170, W = H * M.w / M.h, I = o.img, fxp = M.feet[0] / 100;
    var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
    var sh = el('div', 'lp-sh', stage), root = el('div', 'lp', stage), bub = el('div', 'lp-b', stage), alt = el('div', 'lp-alt', stage);
    root.style.width = W + 'px'; root.style.height = H + 'px'; sh.style.width = W * .56 + 'px'; sh.style.height = H * .06 + 'px';
    var rig = el('i', '', root), lL = el('i', '', rig), lR = el('i', '', rig), torso = el('i', '', rig), arm = el('i', ''), head = el('i', '');
    function im(src, p, c) { var g = el('img', c, p); g.src = src; g.alt = ''; g.draggable = false; return g; }
    im(I.legl, lL); im(I.legr, lR); im(I.body, torso); torso.appendChild(arm); if (I.arm) im(I.arm, arm); torso.appendChild(head); im(I.head, head, 'lp-ho'); im(I.headc, head, 'lp-hc');
    var og = function (e, p) { e.style.transformOrigin = p[0] + '% ' + p[1] + '%'; };
    root.style.transformOrigin = '50% 55%'; og(rig, M.feet); og(lL, M.hipL); og(lR, M.hipR); og(torso, [50, M.hipL[1]]); og(head, M.neck); og(arm, M.sh || [16, 45]);
    root.setAttribute('role', 'img'); root.setAttribute('aria-label', '고양이');
    root.addEventListener('click', function (e) { e.stopPropagation(); });

    var st = { x: 0, y: 0, vx: 0, vy: 0, mode: 'air', on: false, gel: null, t: 0, next: R(1, 2.5), ph: 0, quiet: 0, tx: 0, hop: 0, blink: R(2, 5), shut: 0, eyes: 0, pt: 0, wave: 0, busy: 0, cb: null, land: null, jv: null, look: 0, lookEnd: 0, spin: 0, rot: 0, peak: 0, dizzy: 0, shake: 0, held: 0, gx: null, gy: null, petT: 0 };
    var sq = new Sp(1, 260, 16), tilt = new Sp(0, 150, 13), hr = new Sp(0, 90, 11), hy = new Sp(0, 140, 14), la = new Sp(0, 190, 15), lb = new Sp(0, 190, 15), ya = new Sp(0, 320, 20), yb = new Sp(0, 320, 20), ty = new Sp(0, 220, 18), ar = new Sp(0, 130, 11), rs = new Sp(0, 170, 13);
    var bw = 0, bh = 0, plats = [], scanT = 0, was = false;
    function find(e) { for (var i = 0; i < plats.length; i++) if (plats[i].el === e) return plats[i]; return null; }
    function scan() {                                 // 발판(버튼 윗면) 다시 재기 — 화면이 바뀌면 발밑 발판을 따라감
      var r = stage.getBoundingClientRect(); bw = r.width; bh = r.height;
      var L = (o.platforms ? o.platforms(r) : []) || []; L.push({ l: 6, r: bw - 6, y: o.floor ? o.floor(r) : bh, el: 'floor' }); plats = L;
      if (st.on) { var p = find(st.gel); if (p) { var cx = (p.l + p.r) / 2; if (st.gx != null) { var mv = Math.abs(cx - st.gx) + Math.abs(p.y - st.gy); st.x += cx - st.gx; if (mv > 3) { st.shake += mv; tilt.v += (cx - st.gx) * 14; if (st.shake > 90 && !st.dizzy && st.mode !== 'drag') { st.shake = 0; dizzy(1.6); react('shake'); } } } st.gx = cx; st.gy = p.y; st.y = p.y; st.x = CL(st.x, p.l, p.r); if (st.mode === 'walk') st.tx = CL(st.tx, p.l, p.r); } else { st.on = false; if (st.mode !== 'drag') go('air'); } } else st.gx = null;
    }
    function eyes(shut) { if (st.eyes === shut) return; st.eyes = shut; root.classList.toggle('shut', !!shut); }
    function puff(ch, col, n) {
      for (var i = 0; i < (n || 1); i++) (function (i) {
        var p = el('span', 'lp-p', stage); p.textContent = ch; p.style.color = col;
        var x = st.x + (M.top[0] / 100 - fxp) * W + R(-W * .3, W * .3), y = st.y - H * (1 - M.top[1] / 100) + R(-8, 8), dx = R(-26, 26), up = R(46, 78), r = R(-18, 18);
        var a = p.animate([{ transform: 'translate(' + x + 'px,' + y + 'px) scale(.6) rotate(0deg)', opacity: 0 },
          { transform: 'translate(' + (x + dx * .4) + 'px,' + (y - up * .45) + 'px) scale(1) rotate(' + r * .5 + 'deg)', opacity: 1, offset: .25 },
          { transform: 'translate(' + (x + dx) + 'px,' + (y - up) + 'px) scale(.9) rotate(' + r + 'deg)', opacity: 0 }],
          { duration: 1100 + i * 90, delay: i * 70, easing: 'cubic-bezier(0.23, 1, 0.32, 1)', fill: 'both' });
        a.onfinish = function () { p.remove(); };
      })(i);
    }
    var LN = o.lines || {}, rxT = 0;
    function react(k, a) {                            // 상황에 맞는 한마디 (권하는 말풍선이 떠 있으면 안 끼어듦)
      var L = LN[k]; if (!L || (bubOn && !bubRx) || performance.now() - rxT < 1400) return; rxT = performance.now();
      var t = L[Math.floor(Math.random() * L.length)]; if (typeof t === 'function') t = t(a); sayB(t, 2000); bubRx = 1;
    }
    function dizzy(sec) { st.dizzy = Math.max(st.dizzy, sec); eyes(1); if (st.mode === 'walk') { st.cb = null; go('idle'); } }
    function go(m) { st.mode = m; st.t = 0; }
    function jump(v) { if (!st.on) return; st.vy = -(v || 540); st.vx = 0; st.on = false; sq.v += 3.2; if (st.mode !== 'happy') go('air'); }
    function wake() { if (st.mode === 'sleep') { eyes(0); go('idle'); jump(300); puff('!', '#f2ea3a'); react('wake'); } st.quiet = 0; }
    function fire(k) { var f = st[k]; if (f) { st[k] = null; f(); } }
    function hopTo(p, cb, x) {                        // 다른 발판으로 뛰기: 웅크렸다가 포물선으로
      if (!st.on || !p) return false; wake();
      var tx = x == null ? CL((p.l + p.r) / 2 + R(-6, 6), p.l, p.r) : CL(x, p.l, p.r), dx = tx - st.x, dy = p.y - st.y;
      var V = dy < 0 ? Math.sqrt(2 * G * (-dy + H * .38)) : 300 + Math.min(120, Math.abs(dx)), T = (V + Math.sqrt(V * V + 2 * G * dy)) / G;   // 항상 위로 뛰어올랐다가 떨어짐
      st.jv = { vx: dx / T, vy: -V }; st.skip = dy > 6 ? st.gel : null; st.cb = cb || null; go('crouch'); return true;
    }
    function walkTo(x, cb) { if (!st.on) return false; wake(); var p = find(st.gel); st.tx = p ? CL(x, p.l, p.r) : x; st.cb = cb || null; if (Math.abs(st.tx - st.x) < 2) { fire('cb'); return true; } go('walk'); return true; }
    function goTo(e, cb) { var p = find(e); if (!p || !st.on) return false; return st.gel === e ? walkTo((p.l + p.r) / 2, cb) : hopTo(p, cb, (p.l + p.r) / 2); }
    function press(cb) { if (!st.on) return false; st.land = cb; st.vy = -430; st.vx = 0; st.on = false; sq.v += 3; go('air'); return true; }
    var bubOn = 0, bubT = 0, bubRx = 0;
    function sayB(t, ms, fn) { clearTimeout(bubT); bubRx = 0; if (!t) { bubOn = 0; bub.classList.remove('on'); return; } bub.textContent = t; bubOn = 1; bub.classList.add('on'); bub.onclick = function (e) { e.stopPropagation(); if (fn) fn(); }; if (ms) bubT = setTimeout(function () { sayB(''); }, ms); }

    // 손가락: 누름=점프, 두 번=신남, 길게=쓰다듬기, 끌기=들기, 놓으면 떨어지거나 던져짐
    var P = null, lastTap = 0;
    root.addEventListener('pointerdown', function (e) {
      root.setPointerCapture(e.pointerId); var woke = st.mode === 'sleep'; wake();
      P = { id: e.pointerId, x0: e.clientX, y0: e.clientY, x: e.clientX, y: e.clientY, t0: performance.now(), vx: 0, vy: 0, drag: 0, ox: e.clientX - st.x, oy: e.clientY - st.y, woke: woke };
      P.lp = setTimeout(function () { if (P && !P.drag && st.on) { go('pet'); st.pt = 0; st.petT = 0; st.dizzy = 0; eyes(1); } }, 420);
      e.preventDefault(); e.stopPropagation();
    });
    root.addEventListener('pointermove', function (e) {
      if (!P || e.pointerId !== P.id) return;
      var now = performance.now(), dt = Math.max(8, now - (P.tm || P.t0)); P.tm = now;
      P.vx = P.vx * .6 + (e.clientX - P.x) / dt * 400; P.vy = P.vy * .6 + (e.clientY - P.y) / dt * 400; P.x = e.clientX; P.y = e.clientY;
      if (!P.drag && st.mode !== 'pet' && Math.hypot(P.x - P.x0, P.y - P.y0) > 8) { P.drag = 1; clearTimeout(P.lp); st.on = false; st.cb = st.land = null; st.spin = 0; st.dizzy = 0; st.held = 0; go('drag'); eyes(0); root.classList.add('grab'); }
    });
    function up(e) {
      if (!P || e.pointerId !== P.id) return; clearTimeout(P.lp); root.classList.remove('grab');
      var now = performance.now();
      if (st.mode === 'drag') { var still = now - (P.tm || 0) > 90; st.vx = still ? 0 : CL(P.vx * 1.15, -2200, 2200); st.vy = still ? 0 : CL(P.vy * 1.25, -3600, 2000); go('air'); st.peak = 0; if (Math.hypot(st.vx, st.vy) > 1100) { st.spin = (st.vx >= 0 ? 1 : -1) * CL(Math.hypot(st.vx, st.vy) * .45, 420, 1100); rs.x = rs.x % 360; st.rot = rs.x; react('throw'); } }
      else if (st.mode === 'pet') { eyes(0); go('idle'); st.next = R(1, 2); }
      else if (!P.woke) {
        if (now - lastTap < 330) { go('happy'); st.hop = 3; eyes(1); puff('♥', '#ff3d9a', 4); puff('✦', '#f2ea3a', 3); jump(430); lastTap = 0; }
        else if (o.onTap && o.onTap()) lastTap = 0;
        else { lastTap = now; jump(); }
      }
      P = null;
    }
    root.addEventListener('pointerup', up); root.addEventListener('pointercancel', up);

    function landOn(p, hit) {
      st.y = p.y; st.x = CL(st.x, p.l, p.r); st.skip = null; st.gx = null;
      if (st.spin) { st.spin = 0; var rem = ((st.rot % 360) + 540) % 360 - 180; rs.x = rem; rs.v = 0; }
      if (hit > 760 && st.mode !== 'happy' && !st.land && !st.cb) { st.vy = -hit * .3; st.vx *= .5; sq.v -= CL(hit / 150, 1.5, 6); return; }   // 세게 떨어지면 한 번 튕김
      st.on = true; st.gel = p.el; st.vx = 0; st.vy = 0; sq.v -= CL(hit / 150, 1.5, 6);
      if (st.mode === 'happy') { if (--st.hop > 0) { st.vy = -400; st.on = false; puff('♥', '#ff3d9a', 2); } else { eyes(0); go('idle'); st.next = R(1.2, 2.2); } return; }
      go('idle'); st.next = R(.7, 1.8); var pk = st.peak; st.peak = 0;
      if (pk > 2) { dizzy(1.8); puff('✦', '#f2ea3a', 4); react('sky', pk); } else if (hit > 1150) { dizzy(1); puff('✦', '#f2ea3a', 2); react('ouch'); }
      fire('land'); fire('cb');
    }
    var last = 0, raf = 0, vis = true, altOn = false;
    function frame(now) {
      raf = requestAnimationFrame(frame);
      var act = !o.active || o.active(); if (!act) { was = false; last = now; return; }
      var dt = Math.min(.033, (now - last) / 1000 || .016); last = now;
      if (!was || now - scanT > (st.on ? 100 : 350)) { scanT = now; scan(); was = true; }
      var m = st.mode; st.t += dt; st.quiet += dt;
      var breathe = Math.sin(now / 1000 * (m === 'sleep' ? 1.5 : 2.4)), tT = 0, hT = 0, hyT = 0, aT = 0, bT = 0, yA = 0, yB = 0, sT = 1, tyT = 0, arT = 0;

      if (m === 'drag' && P) {                        // 들려서 매달림
        st.x = CL(P.x - P.ox, 8, bw - 8); st.y = CL(P.y - P.oy, H * .7, bh);
        tT = CL(-P.vx * .035, -38, 38); aT = tT * .9 + 8; bT = tT * .9 - 8; hT = -tT * .25; sT = 1.04; arT = 30 + tT * .6; P.vx *= .9; P.vy *= .9; st.held += dt; if (st.held > 3.2) { st.held = -6; react('held'); }
      } else if (!st.on) {                            // 공중: 중력 → 내려오다 발판 윗면에 닿으면 착지
        var py = st.y; st.vy = Math.min(2700, st.vy + G * dt); st.x += st.vx * dt; st.y += st.vy * dt; if (st.spin) st.rot += st.spin * dt;
        var up = Math.round((H - st.y) / 38); if (up > st.peak) st.peak = up;
        if (st.x < 8) { st.x = 8; st.vx = -st.vx * .55; } else if (st.x > bw - 8) { st.x = bw - 8; st.vx = -st.vx * .55; }
        if (st.vy > 0) { var hitP = null; for (var i = 0; i < plats.length; i++) { var p = plats[i]; if (p.el !== st.skip && py <= p.y + .5 && st.y >= p.y && st.x >= p.l - 5 && st.x <= p.r + 5 && (!hitP || p.y < hitP.y)) hitP = p; } if (hitP) landOn(hitP, st.vy); }
        if (st.y > bh + H * 2) { st.y = -H; st.vy = 0; st.spin = 0; }                       // 혹시 밖으로 빠지면 위에서 다시
        tT = CL(st.vx * .035, -28, 28); aT = 13; bT = -13; yA = yB = -H * .02; sT = 1 + CL(Math.abs(st.vy) / 5000, 0, .12); hT = CL(st.vy * .006, -6, 6); arT = 36;
      } else if (m === 'crouch') {                    // 뛰기 전 웅크림
        sT = .82; arT = -8; if (st.t > .13) { st.vx = st.jv.vx; st.vy = st.jv.vy; st.on = false; sq.v += 3.6; go('air'); }
      } else if (m === 'walk') {                      // 뒤뚱뒤뚱: 몸이 좌우로 기울며 반대쪽 발을 들어 옮김
        var d = st.tx - st.x, dir = d > 0 ? 1 : -1; st.ph += dt * 10; var s = Math.sin(st.ph), c = Math.abs(s);
        st.x += dir * Math.min(Math.abs(d), (26 + 44 * c) * (H / 78) * dt);
        tT = s * 6 + dir * 2.5; yA = -Math.max(0, s) * H * .06; yB = -Math.max(0, -s) * H * .06; aT = Math.max(0, s) * 9 - dir * 3 * Math.max(0, s); bT = -Math.max(0, -s) * 9 - dir * 3 * Math.max(0, -s);
        tyT = -c * H * .022; hT = -s * 4; arT = -s * 10; sT = 1 - (1 - c) * .025;
        if (Math.abs(d) < 1) { go('idle'); st.next = R(1.2, 3.5); fire('cb'); }
      } else if (m === 'pet') {
        st.pt += dt; st.petT += dt; hyT = H * .022; sT = .955; hT = Math.sin(now / 130) * 3.5; if (st.pt > .34) { st.pt = 0; puff('♥', '#ff3d9a'); } if (st.petT > 2.2) { st.petT = -8; react('pet'); }
      } else if (m === 'sleep') {
        hT = 9 + breathe * 1.2; hyT = H * .016; sT = .975 + breathe * .012; tT = 2; st.pt += dt; if (st.pt > 1.7) { st.pt = 0; puff('z', '#9ff5e4'); }
      } else if (st.dizzy > 0) {                      // 어지러움: 눈 감고 머리가 빙글, 별
        st.dizzy -= dt; hT = Math.sin(now / 85) * 10; tT = Math.sin(now / 150) * 5; sT = .97; st.pt += dt; if (st.pt > .4) { st.pt = 0; puff('✦', '#f2ea3a'); }
        if (st.dizzy <= 0) { st.dizzy = 0; eyes(0); st.t = 0; st.next = R(.6, 1.4); }
      } else {                                        // 가만히: 숨 + 가끔 딴짓(걷기·옆 버튼으로 뛰기·갸웃)
        sT = 1 + breathe * (reduce ? .004 : .011); hyT = breathe * H * .004;
        if (st.look) { hT = st.look; if (st.t > st.lookEnd) st.look = 0; }
        if (!reduce && !st.busy && st.t > st.next) {
          var r = Math.random(), cur = find(st.gel); st.t = 0; st.next = R(.8, 2.2);
          if (st.quiet > 40) { go('sleep'); eyes(1); st.pt = 0; }
          else if (r < .3 && cur && cur.r - cur.l > 30) { var nx = st.x < (cur.l + cur.r) / 2 ? R((cur.l + cur.r) / 2, cur.r) : R(cur.l, (cur.l + cur.r) / 2); if (Math.abs(nx - st.x) > 8) walkTo(nx); }
          else if (r < .84) {
            var onFloor = st.gel === 'floor', C = plats.filter(function (p) { return p !== cur && Math.abs((p.l + p.r) / 2 - st.x) < (o.reachX || 230) && p.y - st.y > -(o.reachUp || 200) && (p.el !== 'floor' || Math.random() < .12); });
            if (C.length) hopTo(C[Math.floor(Math.random() * C.length)]); else if (onFloor && cur) walkTo(R(cur.l, cur.r));
          }
          else if (r < .92) { st.look = R(4, 8) * (Math.random() < .5 ? -1 : 1); st.lookEnd = R(.8, 1.6); st.next = st.lookEnd + R(1, 3); }
          else jump(360);
        }
      }
      st.shake *= .97;
      if (m !== 'sleep' && m !== 'pet' && m !== 'happy' && !st.dizzy) {                     // 눈 깜빡임
        if (st.shut > 0) { st.shut -= dt; if (st.shut <= 0) eyes(0); }
        else if ((st.blink -= dt) <= 0) { eyes(1); st.shut = .12; st.blink = Math.random() < .2 ? .28 : R(2.2, 5.5); }
      }
      if (M.ak != null) arT *= M.ak;
      if (M.wag && st.on && (m === 'idle' || m === 'sleep')) arT += Math.sin(now / (m === 'sleep' ? 1400 : 520)) * M.wag * (m === 'sleep' ? .4 : 1);   // 꼬리 살랑
      if (st.wave) arT = M.wave ? M.wave[0] + Math.sin(now / 95) * M.wave[1] : 118 + Math.sin(now / 95) * 16; else if (st.mode === 'happy') arT = M.wave ? M.wave[0] + Math.sin(now / 70) * M.wave[1] : 120;
      sq.t = sT; tilt.t = tT; hr.t = hT * (M.hk == null ? 1 : M.hk); hy.t = hyT; la.t = aT; lb.t = bT; ya.t = yA; yb.t = yB; ty.t = tyT; ar.t = arT;
      var S = CL(sq.step(dt), .7, 1.3);
      var rot = st.spin ? (rs.x = st.rot, rs.v = 0, st.rot) : rs.step(dt);
      root.style.transform = 'translate3d(' + (st.x - W * fxp).toFixed(2) + 'px,' + (st.y - H).toFixed(2) + 'px,0) rotate(' + rot.toFixed(1) + 'deg)';
      var hi = st.y < H * .2; if (hi !== altOn) { altOn = hi; alt.classList.toggle('on', hi); }
      if (hi) { alt.textContent = '▲ ' + Math.max(1, Math.round((H - st.y) / 38)) + 'm'; alt.style.transform = 'translate3d(' + CL(st.x - 26, 6, bw - 70).toFixed(1) + 'px,0,0)'; }
      rig.style.transform = 'rotate(' + tilt.step(dt).toFixed(2) + 'deg) scale(' + (2 - S).toFixed(3) + ',' + S.toFixed(3) + ')';
      lL.style.transform = 'translateY(' + ya.step(dt).toFixed(2) + 'px) rotate(' + la.step(dt).toFixed(2) + 'deg)';
      lR.style.transform = 'translateY(' + yb.step(dt).toFixed(2) + 'px) rotate(' + lb.step(dt).toFixed(2) + 'deg)';
      torso.style.transform = 'translateY(' + ty.step(dt).toFixed(2) + 'px)';
      arm.style.transform = 'rotate(' + ar.step(dt).toFixed(2) + 'deg)';
      head.style.transform = 'translateY(' + hy.step(dt).toFixed(2) + 'px) rotate(' + hr.step(dt).toFixed(2) + 'deg)';
      sh.style.transform = 'translate3d(' + (st.x - W * .28).toFixed(1) + 'px,' + (st.y - H * .03).toFixed(1) + 'px,0)'; sh.style.opacity = st.on ? '.7' : '0';
      if (bubOn) { var bwid = bub.offsetWidth, bx = CL(st.x - bwid / 2, 6, bw - bwid - 6); bub.style.transform = 'translate3d(' + bx.toFixed(1) + 'px,' + Math.max(st.y < H * .2 ? 36 : 4, st.y - H - bub.offsetHeight - 12).toFixed(1) + 'px,0)'; }
    }
    function onVis() { var v = !document.hidden; if (v && !vis) { last = performance.now(); raf = requestAnimationFrame(frame); } else if (!v) cancelAnimationFrame(raf); vis = v; }
    document.addEventListener('visibilitychange', onVis); scan(); st.x = bw / 2; st.y = -H; raf = requestAnimationFrame(frame);
    return {
      state: st, jump: jump, wake: wake, say: sayB, walkTo: walkTo, hopTo: hopTo, goTo: goTo, press: press, puff: puff, el: root, W: W, H: H, scan: scan,
      plats: function () { return plats; },
      bump: function () { if (!st.on) return; wake(); st.dizzy = 0; eyes(0); st.vy = -640; st.vx = R(-60, 60); st.on = false; sq.v += 4; go('air'); puff('!', '#f2ea3a'); react('bump'); },
      drop: function (x, y) { st.on = false; st.cb = st.land = null; st.skip = null; st.spin = 0; st.dizzy = 0; st.x = x; st.y = y; st.vx = 0; st.vy = 0; eyes(0); go('air'); st.quiet = 0; },
      wave: function (v) { st.wave = v ? 1 : 0; }, busy: function (v) { st.busy = v ? 1 : 0; st.t = 0; st.next = R(1.5, 3); },
      sleep: function () { st.quiet = 99; st.t = 99; },
      destroy: function () { cancelAnimationFrame(raf); document.removeEventListener('visibilitychange', onVis); root.remove(); sh.remove(); bub.remove(); alt.remove(); }
    };
  };
})();

/* ---- 앱에 붙이기: 음성통화 화면(버튼 6개)과 다이얼 화면(키패드)에서 버튼을 발판 삼아 돌아다닌다.
   음성통화에선 볼 게 있으면 그 버튼 위로 뛰어가 손 흔들고, 누르면 그 버튼을 밟아서 눌러 준다 ---- */
(function () {
  'use strict';
  var cv = document.getElementById('callv'), grid = document.getElementById('agrid'), app = document.querySelector('.app'), sPad = document.getElementById('sPad');
  if (!cv || !grid || !app || typeof S === 'undefined') return;
  var META = {w:356,h:370,neck:[43.95,42.29],hipL:[34.38,92.58],hipR:[58.4,92.58],feet:[46.48,98.12],sh:[75.39,79.51],top:[43.95,11.28],ak:-0.18,wave:[-16,9],wag:5,hk:0.5}, A = 'assets/lena/pet/';
  var IMG = { head: A + 'head.webp', headc: A + 'headc.webp', body: A + 'body.webp', arm: A + 'arm.webp', legl: A + 'legl.webp', legr: A + 'legr.webp' };
  var css = document.createElement('style');
  css.textContent = '#lpStage,#lpPad,#lpLine{position:absolute!important;inset:0;z-index:3!important;pointer-events:none;overflow:hidden}#lpLine{display:none;z-index:4!important}#lpLine.on{display:block}#lpLine .lp{pointer-events:auto}#lpStage{display:none}.app.outside #lpStage.on{display:block}#lpStage .lp,#lpPad .lp{pointer-events:auto}#lpPad{display:none}#sPad.open #lpPad.on{display:block}' +
    '.app.outside .callv.haspet .log{margin-bottom:56px}' +
    '.ab{transition:transform .14s cubic-bezier(0.23,1,0.32,1)}.ab.lp-press{transform:scale(.88)}.ab.lp-hl i{outline:2px solid #ff3d9a;outline-offset:3px;box-shadow:0 0 16px rgba(255,61,154,.6)}';
  document.head.appendChild(css);
  var LINES = {
    throw: ['야—!', '꺄, 잠깐만!', '어디까지 던질 건데!'],
    sky: [function (m) { return m + 'm 날았어. 재밌어?'; }, function (m) { return '방금 ' + m + 'm… 다음엔 받아 줘.'; }, function (m) { return m + 'm. 신기록 노려?'; }],
    ouch: ['아야… 살살 좀 해.', '냐… 아프거든?'],
    shake: ['흔들지 마… 어지러워.', '멀미 나거든?'],
    held: ['언제까지 들고 있을 거야?', '내려 줘. …아니면 계속 들고 있든가.'],
    pet: ['…더 해도 돼.', '손버릇이 좋네.', '거기, 좋아.'],
    wake: ['자는데 깨우기야?', '음… 왜, 보고 싶었어?'],
    bump: ['야, 나 서 있잖아.', '깜짝이야!']
  };
  function bumpOn(box, sel, getPet, pick) { box.addEventListener('pointerdown', function (e) { var b = e.target.closest && e.target.closest(sel), p = getPet(); if (!b || !p || !p.state.on) return; if (p.state.gel === pick(b)) p.bump(); }, true); }
  function rects(list, r, inx, iny) { var L = []; for (var i = 0; i < list.length; i++) { var q = list[i].getBoundingClientRect(); if (q.width > 20) L.push({ l: q.left - r.left + inx, r: q.right - r.left - inx, y: q.top - r.top + iny, el: list[i] }); } return L; }

  // ---------- 음성통화 화면 ----------
  var stage = document.createElement('div'); stage.id = 'lpStage'; cv.appendChild(stage);
  var pet = null, cur = null, curT = 0, nextAt = Date.now() + 7000, seen = {}, typing = false;
  var quick = document.getElementById('quick'), inrow = cv.querySelector('.inrow');
  function place() {
    var on = !S.petOff && !typing && app.classList.contains('outside') && grid.getBoundingClientRect().height > 0;
    stage.classList.toggle('on', on); cv.classList.toggle('haspet', on); if (!on) { if (cur) cancel(); return; }
    if (!pet) {
      pet = LenaPet(stage, { img: IMG, meta: META, size: 62, lines: LINES,
        active: function () { return stage.classList.contains('on'); },
        platforms: function (r) { return rects(grid.querySelectorAll('.ab i'), r, 9, 5); },
        floor: function (r) { var e = quick && quick.offsetHeight ? quick : inrow, q = e ? e.getBoundingClientRect() : null; return q && q.top ? q.top - r.top + 2 : r.height; },
        onTap: function () { if (cur && !cur.walking) { act(); return true; } return false; } });
      var g = grid.getBoundingClientRect(), s = stage.getBoundingClientRect(); pet.drop(g.left - s.left + g.width * (.2 + Math.random() * .6), g.top - s.top - 170);
    } else pet.scan();
  }
  function ideas() {
    var a = [], now = Date.now(), h = new Date().getHours();
    try { var ms = missed().length; if (ms) a.push({ k: 'miss', b: 'aCall', t: '부재중 ' + ms + '개 왔어. 안 볼 거야?', p: 1 }); } catch (e) {}
    try { var late = S.items.filter(isLate).length; if (late) a.push({ k: 'late', b: 'aPad', t: '밀린 거 ' + late + '개 있는데… 모른 척할 거야?', p: 1 }); } catch (e) {}
    try { var ev = S.items.filter(function (t) { return !t.done && isEv(t) && t.due && new Date(t.due) > now && new Date(t.due) - now < 2 * 3600e3; }).sort(function (x, y) { return new Date(x.due) - new Date(y.due); })[0]; if (ev) a.push({ k: 'ev' + ev.id, b: 'aPad', t: '곧 ' + String(ev.text).slice(0, 14) + ' 있어. 준비됐어?', p: 1 }); } catch (e) {}
    try { var td = S.items.filter(function (t) { return !t.done && !isEv(t) && !t.rid; }).length; if (td) a.push({ k: 'todo', b: 'aPad', t: '할 일 ' + td + '개 남았어. 같이 볼까?' }); } catch (e) {}
    try { if (S.study && (S.study.mats || []).length && h >= 15) a.push({ k: 'study', b: 'aBoard', t: '오늘 공부 짜 놨는데, 볼래?' }); } catch (e) {}
    a.push({ k: 'vid', b: 'aVid', t: '얼굴 보고 얘기할래?' }, { k: 'play', b: 'aMiss', t: '4번 창구 열었어. 한 판 할래?' });
    return a.filter(function (x) { return !seen[x.k] || now - seen[x.k] > (x.p ? 10 : 30) * 60000; });
  }
  function clear() { clearTimeout(curT); if (cur) cur.btn.classList.remove('lp-hl'); pet.wave(0); pet.say(''); }
  function cancel() { if (!cur) return; clear(); cur = null; pet.busy(0); }
  function act() {
    if (!cur) return; var c = cur; clear(); cur = null;
    var done = function () { c.btn.classList.add('lp-press'); setTimeout(function () { c.btn.classList.remove('lp-press'); }, 180); pet.busy(0); setTimeout(function () { c.btn.click(); }, 120); };
    if (!pet.press(done)) done();
  }
  function suggest() {
    var L = ideas(); if (!L.length) return;
    var imp = L.filter(function (x) { return x.p; }), it = imp.length ? imp[0] : L[Math.floor(Math.random() * L.length)], btn = document.getElementById(it.b), ic = btn && btn.querySelector('i');
    if (!ic || !btn.offsetWidth) return;
    seen[it.k] = Date.now(); pet.busy(1); cur = { btn: btn, walking: 1, n: 0 };
    var me = cur, arrive = function () {
      if (cur !== me) return;
      if (pet.state.gel !== ic) { if (++me.n > 4 || !pet.goTo(ic, arrive)) setTimeout(function () { if (cur === me) { if (me.n > 4) cancel(); else arrive(); } }, 500); return; }   // 다른 버튼에 떨어졌으면 다시
      me.walking = 0; btn.classList.add('lp-hl'); pet.wave(1); pet.say(it.t, 0, act); clearTimeout(curT); curT = setTimeout(cancel, 8000);
    };
    arrive(); curT = setTimeout(function () { if (cur === me && me.walking) cancel(); }, 9000);
  }
  setInterval(function () {
    if (!pet || document.hidden || !stage.classList.contains('on') || cur) return;
    var now = Date.now(); if (now < nextAt) return;
    var m = pet.state.mode; if ((m !== 'idle' && m !== 'walk') || !pet.state.on) { nextAt = now + 3000; return; }
    var g = grid.getBoundingClientRect(), top = document.elementFromPoint(g.left + g.width / 2, g.top + g.height * .75);
    if (!top || !(grid.contains(top) || stage.contains(top))) { nextAt = now + 5000; return; }       // 다른 화면이 덮고 있으면 쉼
    nextAt = now + 40000 + Math.random() * 30000; suggest();
  }, 1000);
  bumpOn(grid, '.ab', function () { return pet; }, function (b) { return b.querySelector('i'); });
  if (sPad) bumpOn(sPad, '#keys > *', function () { return pad; }, function (b) { return b; });
  var msg = document.getElementById('msg');
  if (msg) { msg.addEventListener('focus', function () { typing = true; place(); }); msg.addEventListener('blur', function () { typing = false; setTimeout(place, 250); }); }
  if (window.ResizeObserver) { var ro = new ResizeObserver(place); ro.observe(cv); ro.observe(grid); }
  new MutationObserver(place).observe(app, { attributes: true, attributeFilter: ['class'] });
  addEventListener('resize', place); setTimeout(place, 1200);

  // ---------- 다이얼 화면: 키 위를 돌아다님 ----------
  var pad = null, pst = null;
  function padOn() {
    if (!sPad) return; var open = sPad.classList.contains('open') && !S.petOff;
    if (!pst) { pst = document.createElement('div'); pst.id = 'lpPad'; sPad.appendChild(pst); }
    pst.classList.toggle('on', open); if (!open) return;
    var body = sPad.querySelector('.pad'), keys = document.getElementById('keys'), lcd = sPad.querySelector('.lcd');
    if (!pad) pad = LenaPet(pst, { img: IMG, meta: META, size: 50, lines: LINES,
      active: function () { return pst.classList.contains('on'); },
      platforms: function (r) { var L = rects(keys.children, r, 8, 3); if (body) L = L.concat(rects([body], r, 16, 3)); return L; } });
    setTimeout(function () { if (!pst.classList.contains('on')) return; var b = body.getBoundingClientRect(), s = pst.getBoundingClientRect(); pad.scan(); pad.drop(b.left - s.left + b.width * (.25 + Math.random() * .5), Math.max(40, b.top - s.top - 150)); }, 340);
  }
  if (sPad) new MutationObserver(padOn).observe(sPad, { attributes: true, attributeFilter: ['class'] });

  // ---------- 창구의 방(v126): 그림 속 물건 꼬리표·말풍선 위를 뛰어다님 (밖·안 모드 둘 다) ----------
  var sheetEl = document.getElementById('sheet'), lnPet = null, lst = null, lnWas = false, hubEl = null;
  function lineOn() {
    if (!hubEl) { hubEl = document.getElementById('lvLine'); if (!hubEl) return; lst = document.createElement('div'); lst.id = 'lpLine'; hubEl.insertBefore(lst, hubEl.querySelector('.lv-top'));
      new MutationObserver(lineOn).observe(hubEl, { attributes: true, attributeFilter: ['class'] });
      bumpOn(hubEl, '.lv-tag', function () { return lnPet; }, function (t) { return 'tag' + [].indexOf.call(t.parentNode.children, t); }); }
    var on = hubEl.classList.contains('on') && !(sheetEl && sheetEl.classList.contains('open')) && !S.petOff;
    lst.classList.toggle('on', on); if (!on) { lnWas = false; return; }
    if (!lnPet) lnPet = LenaPet(lst, { img: IMG, meta: META, size: 46, lines: LINES,
      active: function () { return lst.classList.contains('on'); },
      platforms: function (r) { var L = [], T = hubEl.querySelectorAll('.lv-tag'), i, q;
        for (i = 0; i < T.length; i++) { q = T[i].getBoundingClientRect(); if (q.width > 20) L.push({ l: q.left - r.left + 8, r: q.right - r.left - 8, y: q.top - r.top + 2, el: 'tag' + i }); }
        var bb = hubEl.querySelector('.lv-bub'); if (bb) { q = bb.getBoundingClientRect(); if (q.width > 40) L.push({ l: q.left - r.left + 10, r: q.right - r.left - 10, y: q.top - r.top + 2, el: 'bub' }); }
        return L; }, reachX: 400, reachUp: 760,
      floor: function (r) { var n = hubEl.querySelector('.lv-nav'), q = n ? n.getBoundingClientRect() : null; return q && q.height ? q.top - r.top + 2 : r.height; } });
    if (!lnWas) { lnWas = true; setTimeout(function () { if (!lst.classList.contains('on')) return; var s = lst.getBoundingClientRect(); lnPet.scan(); lnPet.drop(s.width * (.25 + Math.random() * .5), 150); }, 420); }
  }
  if (sheetEl) { new MutationObserver(lineOn).observe(sheetEl, { attributes: true, attributeFilter: ['class'] }); new MutationObserver(lineOn).observe(app, { attributes: true, attributeFilter: ['class'] }); }
  addEventListener('load', lineOn); setTimeout(lineOn, 0);

  // 0번 설정: 켜기/끄기
  try {
    var _r = SH[0].r; SH[0].r = function (B) {
      _r(B); var sec = el('div', 'card'), r1 = el('div', 'row'); r1.appendChild(el('div', 't', '고양이')).style.flex = '1';
      r1.appendChild(pills([[true, '켜기'], [false, '끄기']], !S.petOff, function (v) { S.petOff = !v; save(); place(); lineOn(); refreshSheet(); })); sec.appendChild(r1);
      sec.appendChild(el('div', 'hint', '음성통화 화면·다이얼·창구 화면에서 버튼 위를 뛰어다녀요. 볼 게 있으면 그 버튼으로 가서 손을 흔들고, 누르면 대신 눌러 줘요. 끌어서 떨어뜨리거나 던지고, 길게 눌러 쓰다듬을 수도 있어요.'));
      var bk = [].slice.call(B.querySelectorAll('.lbl')).find(function (x) { return x.textContent === '백업'; }) || null;
      B.insertBefore(lbl('고양이'), bk); B.insertBefore(sec, bk);
    };
  } catch (e) {}
  window.lenaPet = { get pet() { return pet; }, get pad() { return pad; }, get line() { return lnPet; }, suggest: function () { nextAt = 0; }, place: place, get cur() { return cur; } };
})();
