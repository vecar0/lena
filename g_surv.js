// 오락실 — 빗속의 고양이 (서바이버 형식): 5분 동안 해골 무리를 버틴다
'use strict';
(() => {
const { frame, talk, gcAdd, gimg, img } = ARC;
const css = `
.sv{position:relative;flex:1;min-height:0;touch-action:none;user-select:none;-webkit-user-select:none}
.sv canvas{position:absolute;inset:0;width:100%;height:100%;display:block}
.svh{position:absolute;left:10px;right:10px;top:8px;display:flex;flex-direction:column;gap:5px;pointer-events:none}
.svr{display:flex;align-items:center;gap:8px}
.bar{flex:1;height:10px;border-radius:5px;background:rgba(0,0,0,.6);border:2px solid #000;overflow:hidden}
.bar i{display:block;height:100%;background:var(--hot);transition:width .15s}
.bar.xp i{background:var(--teal)}
.svt{font-family:'Space Mono',monospace;font-weight:700;font-size:14px;color:#fff;text-shadow:2px 2px 0 #000;white-space:nowrap}
.svp{position:absolute;right:10px;top:50px;width:40px;height:40px;border-radius:50%;background:rgba(0,0,0,.6);border:1px solid var(--line);color:#fff;font-weight:800;pointer-events:auto}
.lvl{position:absolute;inset:0;background:rgba(5,6,8,.78);display:flex;flex-direction:column;justify-content:center;gap:10px;padding:18px;z-index:3}
.lvl h3{font-family:'Black Han Sans';font-weight:400;font-size:28px;text-align:center;text-shadow:3px 3px 0 var(--pink)}
.up{display:flex;align-items:center;gap:12px;padding:12px;border-radius:14px;background:var(--paper);color:#111;border:2.5px solid #000;box-shadow:4px 4px 0 var(--teal);text-align:left}
.up:nth-child(3){box-shadow:4px 4px 0 var(--pink)}
.up img{width:50px;height:50px;flex:none;object-fit:contain}
.up b{display:block;font-size:16px;font-weight:800}.up small{display:block;font-size:13px;opacity:.75;line-height:1.4;margin-top:2px;word-break:keep-all}
.up em{font-style:normal;font-family:'Space Mono',monospace;font-size:11px;color:#c2185b;font-weight:700}
`;
document.head.appendChild(Object.assign(document.createElement('style'), { textContent: css }));
const IM = {}; const L = (k, src) => { if (!IM[k]) { const i = new Image(); i.src = src; IM[k] = i; } return IM[k]; };
['s_cat', 's_cathurt', 's_ghost', 's_hand', 's_bat', 's_boss', 's_gem', 's_heart', 's_phone'].forEach(k => L(k, gimg(k)));
L('lips', img('st_lips')); L('tile', 'assets/lena/g/tile.jpg'); L('bolt', img('st_bolt'));

const WP = {
  whip: { n: '전화선 채찍', d: '바라보는 쪽을 전화선으로 후려쳐요', i: gimg('s_phone') },
  laser: { n: '선글라스 레이저', d: '가장 가까운 적에게 꿰뚫는 레이저', i: gimg('c_laser') },
  heart: { n: '하트 실드', d: '하트가 몸 주위를 돌며 막고 때려요', i: gimg('s_heart') },
  bolt: { n: '번개 콜', d: '화면 속 적에게 번개가 떨어져요', i: img('st_bolt') },
  kiss: { n: '키스 미사일', d: '적을 쫓아가는 입술 키스', i: img('st_lips') },
  shoe: { n: '운동화', d: '이동 속도 +12%', i: gimg('c_coin'), pass: 1 },
  milk: { n: '딸기 우유', d: '최대 체력 +20, 체력 회복', i: gimg('c_tape'), pass: 1 },
  mag: { n: '동전 자석', d: '보석 끌어오는 거리 +45%', i: gimg('c_key'), pass: 1 },
  cof: { n: '진한 커피', d: '모든 무기 재사용 시간 −8%', i: gimg('c_umb'), pass: 1 }
};
const MAXL = 5;
let G = null;

function intro() {
  frame('빗속의 고양이', B => {
    talk(B, 'l', '비 오는 골목에 해골들이 몰려와요. 5분만 버티면 새벽이에요. …제 고양이 잘 지켜 줘요?');
    const r = el('div', 'rules'); r.innerHTML = '<b>하는 법</b><br>· 화면 아무 데나 대고 <b>끌면</b> 고양이가 움직여요. 공격은 알아서 해요.<br>· 해골이 떨어뜨린 <b>초록 보석</b>을 모으면 레벨이 올라요. 그때 무기나 능력을 <b>하나 골라요</b>.<br>· 2분 30초, 4분 30초에 큰 해골이 나와요.<br>· 5분 버티면 승리. 쓰러뜨린 수와 버틴 시간만큼 게임 동전을 받아요.';
    B.appendChild(r);
    B.appendChild(el('div', 'rules', `최고 기록: ${S.svBest ? `${Math.floor(S.svBest / 60)}분 ${S.svBest % 60}초` : '없음'} · 최다 처치 ${S.svKill || 0}`));
    B.appendChild(row(btn('골목으로 들어가기', 'wide', play)));
  }, true);
}

function play() {
  const B = frame('빗속의 고양이', () => {}, true, true);
  const W = el('div', 'sv'); B.appendChild(W);
  const cv = el('canvas'); W.appendChild(cv); const ctx = cv.getContext('2d');
  const hud = el('div', 'svh'); hud.innerHTML = '<div class="svr"><div class="bar"><i id="svHp"></i></div><span class="svt" id="svT">0:00</span></div><div class="svr"><div class="bar xp"><i id="svXp"></i></div><span class="svt" id="svK">LV1 · 0</span></div>';
  W.appendChild(hud);
  const pb = el('button', 'svp', 'Ⅱ'); W.appendChild(pb);
  let vw = 0, vh = 0, dpr = Math.min(2, devicePixelRatio || 1);
  const fit = () => { const r = W.getBoundingClientRect(); vw = r.width; vh = r.height; cv.width = vw * dpr; cv.height = vh * dpr; };
  fit(); const ro = new ResizeObserver(fit); ro.observe(W);
  G = { t: 0, p: { x: 0, y: 0, hp: 100, mhp: 100, spd: 150, mag: 70, inv: 0, face: 1, fx: 1, fy: 0, cd: 1 }, en: [], gems: [], pr: [], fx: [], nums: [], lv: 1, xp: 0, need: 6, kills: 0, w: { whip: 1 }, wt: {}, paused: false, over: false, spawn: 0, boss: [150, 270], shake: 0, rain: [...Array(70)].map(() => ({ x: Math.random(), y: Math.random(), s: .6 + Math.random() * .8 })) };
  // 입력: 아무 데나 끌면 조이스틱
  const J = { on: false, ox: 0, oy: 0, x: 0, y: 0 }, keys = {};
  const pos = e => { const r = cv.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top]; };
  cv.addEventListener('pointerdown', e => { [J.ox, J.oy] = pos(e); J.x = J.ox; J.y = J.oy; J.on = true; cv.setPointerCapture(e.pointerId); audio(); });
  cv.addEventListener('pointermove', e => { if (J.on) [J.x, J.y] = pos(e); });
  const up = () => { J.on = false; }; cv.addEventListener('pointerup', up); cv.addEventListener('pointercancel', up);
  const kd = e => { keys[e.key] = 1; }, ku = e => { keys[e.key] = 0; };
  addEventListener('keydown', kd); addEventListener('keyup', ku);
  pb.onclick = () => pause(!G.paused);
  const vis = () => { if (document.hidden) pause(true); }; document.addEventListener('visibilitychange', vis);
  let raf = 0, last = performance.now();
  ARC.cleanup = () => { cancelAnimationFrame(raf); ro.disconnect(); removeEventListener('keydown', kd); removeEventListener('keyup', ku); document.removeEventListener('visibilitychange', vis); G = null; };

  function pause(v) { if (!G || G.over || G.lvlup) return; G.paused = v; pb.textContent = v ? '▶' : 'Ⅱ'; if (!v) last = performance.now(); }
  const dist2 = (a, b) => (a.x - b.x) ** 2 + (a.y - b.y) ** 2;
  function nearest(maxD) { let best = null, bd = maxD * maxD; for (const e of G.en) { const d = dist2(e, G.p); if (d < bd) { bd = d; best = e; } } return best; }
  function hit(e, dmg, kx, ky) {
    if (e.dead) return; e.hp -= dmg; e.flash = .1; if (kx || ky) { e.x += kx; e.y += ky; }
    if (G.nums.length < 40) G.nums.push({ x: e.x, y: e.y - e.r, v: Math.round(dmg), t: .6 });
    if (e.hp <= 0) { e.dead = true; G.kills++; G.gems.push({ x: e.x, y: e.y, v: e.xp, h: Math.random() < .02 }); if (e.type === 'boss') { for (let i = 0; i < 14; i++) G.gems.push({ x: e.x + (Math.random() - .5) * 120, y: e.y + (Math.random() - .5) * 120, v: 3 }); G.shake = .5; tone([90], .3, .12, 'square'); } }
  }
  const T = { ghost: { hp: 6, spd: 72, dmg: 8, r: 15, s: 46, xp: 1, im: 's_ghost' }, bat: { hp: 4, spd: 125, dmg: 6, r: 13, s: 46, xp: 1, im: 's_bat' }, hand: { hp: 20, spd: 46, dmg: 12, r: 19, s: 54, xp: 2, im: 's_hand' }, boss: { hp: 700, spd: 58, dmg: 25, r: 44, s: 132, xp: 10, im: 's_boss' } };
  function spawn(type) { const t = T[type], a = Math.random() * Math.PI * 2, R = Math.hypot(vw, vh) / 2 + 60, k = 1 + G.t / 140; G.en.push({ type, x: G.p.x + Math.cos(a) * R, y: G.p.y + Math.sin(a) * R, hp: t.hp * (type === 'boss' ? 1 : k), mhp: t.hp * k, spd: t.spd, dmg: t.dmg, r: t.r, s: t.s, xp: t.xp, im: t.im, ph: Math.random() * 6, flash: 0 }); }
  const lvOf = k => G.w[k] || 0;
  function weapons(dt) {
    const p = G.p, cdm = Math.pow(.92, lvOf('cof'));
    const ready = (k, cd) => { G.wt[k] = (G.wt[k] || 0) - dt; if (G.wt[k] <= 0) { G.wt[k] = cd * cdm; return true; } return false; };
    if (lvOf('whip') && ready('whip', 1.15 - lvOf('whip') * .08)) {
      const L = lvOf('whip'), len = 105 + L * 14, dmg = 9 + L * 4, sides = L >= 3 ? [p.face, -p.face] : [p.face];
      sides.forEach(sd => { G.fx.push({ k: 'whip', x: p.x, y: p.y, sd, len, t: .22 }); for (const e of G.en) { const dx = (e.x - p.x) * sd, dy = Math.abs(e.y - p.y); if (dx > -10 && dx < len + e.r && dy < 34 + e.r) hit(e, dmg, sd * 8, 0); } });
      tone([200], .04, .03, 'sawtooth');
    }
    if (lvOf('laser') && ready('laser', 1.7 - lvOf('laser') * .12)) {
      const L = lvOf('laser'), tg = nearest(420); if (tg) { const n = L >= 4 ? 3 : L >= 2 ? 2 : 1, base = Math.atan2(tg.y - p.y, tg.x - p.x);
        for (let i = 0; i < n; i++) { const a = base + (i - (n - 1) / 2) * .25, ex = p.x + Math.cos(a) * 420, ey = p.y + Math.sin(a) * 420; G.fx.push({ k: 'laser', x: p.x, y: p.y, ex, ey, t: .18 });
          for (const e of G.en) { const vx = ex - p.x, vy = ey - p.y, l2 = vx * vx + vy * vy, u = Math.max(0, Math.min(1, ((e.x - p.x) * vx + (e.y - p.y) * vy) / l2)), cx = p.x + vx * u, cy = p.y + vy * u; if ((e.x - cx) ** 2 + (e.y - cy) ** 2 < (e.r + 8) ** 2) hit(e, 7 + L * 3); } }
        tone([1200, 1600], .05, .02, 'square'); }
    }
    if (lvOf('heart')) { const L = lvOf('heart'), n = 1 + L, R = 64 + L * 5; G.ha = (G.ha || 0) + dt * (2.4 + L * .2);
      for (let i = 0; i < n; i++) { const a = G.ha + i * Math.PI * 2 / n, hx = p.x + Math.cos(a) * R, hy = p.y + Math.sin(a) * R;
        for (const e of G.en) { if ((e.hc || 0) > G.t) continue; if ((e.x - hx) ** 2 + (e.y - hy) ** 2 < (e.r + 14) ** 2) { hit(e, 5 + L * 2.5, Math.cos(a) * 10, Math.sin(a) * 10); e.hc = G.t + .4; } } } }
    if (lvOf('bolt') && ready('bolt', 2.3 - lvOf('bolt') * .2)) {
      const L = lvOf('bolt'); const vis = G.en.filter(e => Math.abs(e.x - p.x) < vw / 2 && Math.abs(e.y - p.y) < vh / 2);
      for (let i = 0; i < L && vis.length; i++) { const e = vis.splice(Math.random() * vis.length | 0, 1)[0]; G.fx.push({ k: 'bolt', x: e.x, y: e.y, t: .25 }); for (const o of G.en) if (dist2(o, e) < 60 * 60) hit(o, 18 + L * 6); }
      if (L) { G.shake = Math.max(G.shake, .12); tone([140], .08, .06, 'square'); }
    }
    if (lvOf('kiss') && ready('kiss', 1.45 - lvOf('kiss') * .1)) { const L = lvOf('kiss'); for (let i = 0; i < Math.ceil(L / 2) + (L >= 5 ? 1 : 0); i++) G.pr.push({ x: p.x, y: p.y, vx: (Math.random() - .5) * 200, vy: -160, t: 2.2, dmg: 8 + L * 2.5 }); }
  }
  function choose() {
    G.lvlup = true; const pool = Object.keys(WP).filter(k => lvOf(k) < MAXL && !(WP[k].pass && lvOf(k) >= 5));
    const opts = []; while (opts.length < 3 && pool.length) opts.push(pool.splice(Math.random() * pool.length | 0, 1)[0]);
    const M = el('div', 'lvl'); M.appendChild(el('h3', null, `레벨 ${G.lv}!`));
    opts.forEach(k => { const w = WP[k], b = el('button', 'up'), i = el('img'); i.src = w.i; i.alt = ''; const t = el('div'); t.append(el('em', null, lvOf(k) ? `LV ${lvOf(k)} → ${lvOf(k) + 1}` : 'NEW'), el('b', null, w.n), el('small', null, w.d)); b.append(i, t);
      b.onclick = () => { G.w[k] = lvOf(k) + 1; if (k === 'shoe') G.p.spd *= 1.12; if (k === 'milk') { G.p.mhp += 20; G.p.hp = Math.min(G.p.mhp, G.p.hp + 40); } if (k === 'mag') G.p.mag *= 1.45; M.remove(); G.lvlup = false; last = performance.now(); dtmf(5); };
      M.appendChild(b); });
    W.appendChild(M); coinSound();
  }
  function end(win) {
    G.over = true; const t = Math.floor(G.t), reward = Math.floor(G.kills / 30) + Math.floor(t / 60) * 2 + (win ? 10 : 0);
    S.svBest = Math.max(S.svBest || 0, t); S.svKill = Math.max(S.svKill || 0, G.kills); save(); if (reward) gcAdd(reward);
    const M = el('div', 'lvl'); M.appendChild(el('h3', null, win ? '새벽이 왔어요!' : '쓰러졌어요…'));
    const s = el('div', 'rules'); s.innerHTML = `버틴 시간 <b>${Math.floor(t / 60)}:${String(t % 60).padStart(2, '0')}</b> · 처치 <b>${G.kills}</b> · 레벨 <b>${G.lv}</b><br>게임 동전 <b>+${reward}</b>`; M.appendChild(s);
    const tk = el('div', 'talkr'), ti = el('i'); tk.append(ti, el('span', null, win ? '진짜 버텼어요? …멋있다. 오늘은 제가 반했어요.' : pick(['괜찮아요, 고양이는 무사해요. 다시 해요.', '해골들이 너무 많았죠. 다음엔 레이저부터 챙겨요.'])));
    M.appendChild(tk); M.appendChild(row(btn('다시 하기', 'wide', play), btn('오락실로', 'ghost wide', () => ARC.hub())));
    W.appendChild(M); win ? (coinSound(), setTimeout(coinSound, 200)) : tone([220, 160], .5, .08, 'triangle');
  }
  function step(dt) {
    const p = G.p; G.t += dt;
    // 이동
    let mx = (keys.ArrowRight || keys.d ? 1 : 0) - (keys.ArrowLeft || keys.a ? 1 : 0), my = (keys.ArrowDown || keys.s ? 1 : 0) - (keys.ArrowUp || keys.w ? 1 : 0);
    if (J.on) { const dx = J.x - J.ox, dy = J.y - J.oy, d = Math.hypot(dx, dy); if (d > 6) { mx = dx / Math.max(d, 50); my = dy / Math.max(d, 50); } }
    const m = Math.hypot(mx, my); if (m > 1) { mx /= m; my /= m; }
    p.x += mx * p.spd * dt; p.y += my * p.spd * dt; if (Math.abs(mx) > .1) p.face = mx > 0 ? 1 : -1;
    p.inv = Math.max(0, p.inv - dt); p.hp = Math.min(p.mhp, p.hp + dt * .4 * lvOf('milk'));
    // 등장
    G.spawn += dt * (0.9 + G.t / 26);
    while (G.spawn > 1 && G.en.length < 230) { G.spawn--; const r = Math.random(); spawn(G.t > 90 && r < .28 ? 'hand' : G.t > 45 && r < .55 ? 'bat' : 'ghost'); }
    if (G.boss.length && G.t >= G.boss[0]) { G.boss.shift(); spawn('boss'); G.shake = .4; tone([70, 90], .6, .1, 'sawtooth'); }
    // 적
    for (const e of G.en) { const a = Math.atan2(p.y - e.y, p.x - e.x); let sp = e.spd; if (e.type === 'bat') { e.ph += dt * 6; e.x += Math.cos(a + Math.sin(e.ph) * .9) * sp * dt; e.y += Math.sin(a + Math.sin(e.ph) * .9) * sp * dt; } else { e.x += Math.cos(a) * sp * dt; e.y += Math.sin(a) * sp * dt; }
      e.flash = Math.max(0, e.flash - dt);
      if (!p.inv && dist2(e, p) < (e.r + 16) ** 2) { p.hp -= e.dmg; p.inv = .55; G.shake = .2; tone([160], .08, .08, 'square'); if (p.hp <= 0) { p.hp = 0; return end(false); } } }
    // 서로 밀어내기(가볍게)
    for (let i = 0; i < G.en.length; i += 2) { const a = G.en[i], b = G.en[i + 1]; if (!b) break; const d = Math.sqrt(dist2(a, b)) || 1, o = a.r + b.r - d; if (o > 0) { const ux = (a.x - b.x) / d, uy = (a.y - b.y) / d; a.x += ux * o / 2; a.y += uy * o / 2; b.x -= ux * o / 2; b.y -= uy * o / 2; } }
    weapons(dt);
    // 키스 미사일
    for (const k of G.pr) { const tg = nearest(500); if (tg) { const a = Math.atan2(tg.y - k.y, tg.x - k.x); k.vx += Math.cos(a) * 900 * dt; k.vy += Math.sin(a) * 900 * dt; } const s = Math.hypot(k.vx, k.vy), mx2 = 330; if (s > mx2) { k.vx *= mx2 / s; k.vy *= mx2 / s; } k.x += k.vx * dt; k.y += k.vy * dt; k.t -= dt;
      for (const e of G.en) if (!e.dead && dist2(e, k) < (e.r + 10) ** 2) { hit(e, k.dmg); k.t = 0; break; } }
    G.pr = G.pr.filter(k => k.t > 0);
    G.en = G.en.filter(e => !e.dead && Math.abs(e.x - p.x) < vw + 400 && Math.abs(e.y - p.y) < vh + 400);
    // 보석
    for (const g of G.gems) { const d2 = dist2(g, p); if (d2 < p.mag * p.mag) { const d = Math.sqrt(d2) || 1; g.x += (p.x - g.x) / d * 420 * dt; g.y += (p.y - g.y) / d * 420 * dt; } if (d2 < 22 * 22) { g.got = true; if (g.h) p.hp = Math.min(p.mhp, p.hp + 20); G.xp += g.v; tone([1500 + Math.random() * 300], .03, .02); } }
    G.gems = G.gems.filter(g => !g.got && dist2(g, p) < 1600 * 1600); if (G.gems.length > 300) G.gems.splice(0, G.gems.length - 300);
    if (G.xp >= G.need) { G.xp -= G.need; G.lv++; G.need = Math.round(6 + G.lv * 4.5); choose(); }
    G.fx.forEach(f => f.t -= dt); G.fx = G.fx.filter(f => f.t > 0); G.nums.forEach(n => { n.t -= dt; n.y -= 40 * dt; }); G.nums = G.nums.filter(n => n.t > 0); G.shake = Math.max(0, G.shake - dt);
    if (G.t >= 300) end(true);
  }
  function draw() {
    const p = G.p; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const sx = G.shake ? (Math.random() - .5) * 10 * G.shake / .2 : 0, sy = G.shake ? (Math.random() - .5) * 10 * G.shake / .2 : 0;
    const cx = p.x - vw / 2 + sx, cy = p.y - vh / 2 + sy, tile = IM.tile;
    if (tile.complete && tile.naturalWidth) { const ts = 256, ox = -((cx % ts) + ts) % ts, oy = -((cy % ts) + ts) % ts; for (let x = ox; x < vw; x += ts) for (let y = oy; y < vh; y += ts) ctx.drawImage(tile, x, y, ts, ts); } else { ctx.fillStyle = '#141a1f'; ctx.fillRect(0, 0, vw, vh); }
    const S2 = (im, x, y, s, flip, a) => { const i = IM[im]; if (!i || !i.complete || !i.naturalWidth) return; const h = s, w = s * i.naturalWidth / i.naturalHeight; ctx.save(); ctx.translate(x - cx, y - cy); if (flip) ctx.scale(-1, 1); if (a != null) ctx.globalAlpha = a; ctx.drawImage(i, -w / 2, -h / 2, w, h); ctx.restore(); };
    for (const g of G.gems) S2(g.h ? 's_heart' : 's_gem', g.x, g.y, g.h ? 22 : 16);
    // 그림자 + 적
    ctx.fillStyle = 'rgba(0,0,0,.35)'; for (const e of G.en) { ctx.beginPath(); ctx.ellipse(e.x - cx, e.y - cy + e.s * .42, e.r * .9, e.r * .3, 0, 0, 7); ctx.fill(); }
    for (const e of G.en) { S2(e.im, e.x, e.y, e.s, e.x > p.x, e.flash ? .55 : 1); if (e.type === 'boss') { ctx.fillStyle = '#000'; ctx.fillRect(e.x - cx - 40, e.y - cy - 76, 80, 7); ctx.fillStyle = '#ff2e6e'; ctx.fillRect(e.x - cx - 39, e.y - cy - 75, 78 * Math.max(0, e.hp / e.mhp), 5); } }
    // 하트 실드
    if (lvOf('heart')) { const L = lvOf('heart'), n = 1 + L, R = 64 + L * 5; for (let i = 0; i < n; i++) { const a = G.ha + i * Math.PI * 2 / n; S2('s_heart', p.x + Math.cos(a) * R, p.y + Math.sin(a) * R, 26); } }
    for (const k of G.pr) S2('lips', k.x, k.y, 24);
    // 효과
    for (const f of G.fx) { ctx.save(); ctx.globalAlpha = Math.min(1, f.t * 6);
      if (f.k === 'whip') { ctx.strokeStyle = '#3ee07a'; ctx.lineWidth = 6; ctx.lineCap = 'round'; ctx.beginPath(); const x0 = f.x - cx, y0 = f.y - cy; ctx.moveTo(x0, y0); for (let i = 1; i <= 12; i++) { const u = i / 12; ctx.lineTo(x0 + f.sd * f.len * u, y0 - Math.sin(u * Math.PI) * 26 + Math.sin(u * 30) * 5); } ctx.stroke(); ctx.strokeStyle = '#eaffef'; ctx.lineWidth = 2; ctx.stroke(); }
      if (f.k === 'laser') { ctx.strokeStyle = '#ff3d9a'; ctx.lineWidth = 9; ctx.shadowColor = '#ff3d9a'; ctx.shadowBlur = 16; ctx.beginPath(); ctx.moveTo(f.x - cx, f.y - cy - 14); ctx.lineTo(f.ex - cx, f.ey - cy); ctx.stroke(); ctx.strokeStyle = '#fff'; ctx.lineWidth = 3; ctx.stroke(); }
      if (f.k === 'bolt') { ctx.strokeStyle = '#f2ea3a'; ctx.lineWidth = 5; ctx.shadowColor = '#f2ea3a'; ctx.shadowBlur = 14; ctx.beginPath(); let x = f.x - cx + (Math.random() - .5) * 20, y = f.y - cy - 260; ctx.moveTo(x, y); while (y < f.y - cy) { y += 30; x += (Math.random() - .5) * 34; ctx.lineTo(x, Math.min(y, f.y - cy)); } ctx.stroke(); ctx.beginPath(); ctx.arc(f.x - cx, f.y - cy, 46 * (1 - f.t * 2), 0, 7); ctx.strokeStyle = 'rgba(242,234,58,.7)'; ctx.lineWidth = 3; ctx.stroke(); }
      ctx.restore(); }
    // 고양이
    ctx.fillStyle = 'rgba(0,0,0,.4)'; ctx.beginPath(); ctx.ellipse(vw / 2 - sx * 0, vh / 2 + 24, 20, 7, 0, 0, 7); ctx.fill();
    const bob = Math.sin(G.t * 12) * (J.on ? 2.5 : .8);
    S2(p.inv > 0 ? 's_cathurt' : 's_cat', p.x, p.y + bob, 60, p.face < 0, p.inv > 0 && Math.floor(G.t * 20) % 2 ? .5 : 1);
    // 숫자
    ctx.font = "700 14px 'Space Mono',monospace"; ctx.textAlign = 'center'; for (const n of G.nums) { ctx.globalAlpha = Math.min(1, n.t * 3); ctx.fillStyle = '#000'; ctx.fillText(n.v, n.x - cx + 1.5, n.y - cy + 1.5); ctx.fillStyle = '#fff'; ctx.fillText(n.v, n.x - cx, n.y - cy); } ctx.globalAlpha = 1;
    // 비
    ctx.strokeStyle = 'rgba(200,240,255,.22)'; ctx.lineWidth = 1.2; ctx.beginPath(); for (const r of G.rain) { r.y += .02 * r.s; r.x -= .004 * r.s; if (r.y > 1) { r.y = 0; r.x = Math.random() * 1.1; } const x = r.x * vw, y = r.y * vh; ctx.moveTo(x, y); ctx.lineTo(x - 4, y + 14 * r.s); } ctx.stroke();
    // 어둠 가장자리
    const gr = ctx.createRadialGradient(vw / 2, vh / 2, Math.min(vw, vh) * .35, vw / 2, vh / 2, Math.max(vw, vh) * .75); gr.addColorStop(0, 'rgba(0,0,0,0)'); gr.addColorStop(1, 'rgba(0,0,0,.55)'); ctx.fillStyle = gr; ctx.fillRect(0, 0, vw, vh);
    // 조이스틱
    if (J.on) { ctx.strokeStyle = 'rgba(255,255,255,.35)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(J.ox, J.oy, 46, 0, 7); ctx.stroke(); const dx = J.x - J.ox, dy = J.y - J.oy, d = Math.hypot(dx, dy), k = d > 46 ? 46 / d : 1; ctx.fillStyle = 'rgba(255,61,154,.6)'; ctx.beginPath(); ctx.arc(J.ox + dx * k, J.oy + dy * k, 18, 0, 7); ctx.fill(); }
    // HUD
    $('svHp').style.width = (p.hp / p.mhp * 100) + '%'; $('svXp').style.width = (G.xp / G.need * 100) + '%';
    const t = Math.floor(G.t); $('svT').textContent = `${Math.floor(t / 60)}:${String(t % 60).padStart(2, '0')} / 5:00`; $('svK').textContent = `LV${G.lv} · ${G.kills}`;
  }
  function loop(now) {
    if (!G) return; const dt = Math.min(.05, (now - last) / 1000); last = now;
    if (!G.paused && !G.lvlup && !G.over) step(dt);
    if (G) draw(); raf = requestAnimationFrame(loop);
  }
  raf = requestAnimationFrame(loop);
}

ARC.reg({ id: 'surv', order: 1, name: '빗속의 고양이', ban: 'surv', sub: () => `5분 버티기 · 최고 ${S.svBest ? Math.floor(S.svBest / 60) + '분 ' + S.svBest % 60 + '초' : '-'}`, start: intro });
})();
