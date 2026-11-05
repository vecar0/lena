// 레나 — DOWNPOUR (오락실): 공을 튕겨 내려오는 해골 벽돌을 부수는 로그라이크. 계산 코어 make()는 DOM 없이 Node에서 봇으로 돌린다.
'use strict';
(() => {
const BT = {
  rain: { n: '빗방울', c: '#9ff5e4', d: '기본 공 묶음' },
  fire: { n: '불씨', c: '#ff7a3d', d: '맞으면 불이 붙어 계속 피해' },
  ice: { n: '우박', c: '#bfe8ff', d: '맞으면 느려짐 · 3레벨은 얼림' },
  bolt: { n: '번개', c: '#f2ea3a', d: '가까운 적 2·3·4마리로 번짐' },
  poison: { n: '독', c: '#8cff5a', d: '독이 쌓여 초당 피해' },
  ghost: { n: '유령', c: '#c9b6ff', d: '적을 뚫고 지나감' },
  bomb: { n: '폭죽', c: '#ff3d9a', d: '맞으면 터져 주변 피해' },
  split: { n: '쌍둥이', c: '#2fe0c8', d: '맞을 때 작은 공이 갈라져 나옴' },
  sun: { n: '★ 태양', c: '#ffd36b', d: '큰 폭발 + 불 (불씨+폭죽)', f: 1 },
  storm: { n: '★ 폭풍', c: '#7fd8ff', d: '번개가 4마리로 번지며 얼림 (우박+번개)', f: 1 },
  curse: { n: '★ 저주', c: '#b46bff', d: '뚫고 지나가며 독 6 (독+유령)', f: 1 },
  swarm: { n: '★ 빗줄기', c: '#5ff2d8', d: '맞을 때마다 작은 공 2개 (쌍둥이+폭죽)', f: 1 }
};
const FUSE = [['fire', 'bomb', 'sun'], ['ice', 'bolt', 'storm'], ['poison', 'ghost', 'curse'], ['split', 'bomb', 'swarm']];
const PS = { more: ['빗방울 +2', '기본 공이 2개 늘어요'], spd: ['공 속도 +15%', '더 빨리 돌아와요'], dmg: ['피해 +25%', '모든 공'], hp: ['체력 +1', '최대 체력도 +1'], crit: ['치명타 +10%', '두 배 피해'], xp: ['경험치 +25%', '레벨이 빨리 올라요'] };
const SLOTS = 4, STAGES = 3, STAGE_T = 140;
const SMUL = [1, 1.6, 2.3];

function make(W, H, rnd = Math.random) {
  const cw = W / 7, ch = cw * .62, top = 56, floor = H - 120;
  const G = { fx0: 1, W, H, cw, ch, top, floor, px: W / 2, hp: 5, maxHp: 5, t: 0, st: 0, en: [], balls: [], stock: [], gems: [], shots: [], fx: [], own: { rain: 1 }, pas: {}, xp: 0, lv: 1, need: 6, rowT: 1, fireT: 0, boss: null, ph: 'play', kills: 0, choices: null, id: 0, shake: 0 };
  const rp = () => 3 + (G.pas.more || 0) * 2;
  G.reload = () => { G.stock = []; for (let i = 0; i < rp(); i++) G.stock.push('rain'); Object.keys(G.own).forEach(k => { if (k !== 'rain') G.stock.push(k); }); G.balls = G.balls.filter(b => b.mini); };
  G.reload();
  G.fx = [{ k: 'ban', t: '1번째 밤', l: 1.6 }];
  const lvOf = k => G.own[k] || 0;
  const dmgMul = () => (1 + .25 * (G.pas.dmg || 0));
  const spd = () => 560 * (1 + .15 * (G.pas.spd || 0));
  function hpFor(boss) { const m = SMUL[G.st] * (1 + G.t / 90); return boss ? Math.round(750 * SMUL[G.st]) : Math.round(22 * m); }
  function row() {
    const n = 3 + Math.floor(rnd() * (3 + G.st)), cols = [0, 1, 2, 3, 4, 5, 6].sort(() => rnd() - .5).slice(0, Math.min(7, n));
    cols.forEach(c => { const r = rnd(), ty = G.st >= 1 && r < .12 ? 'gun' : r < .22 ? 'arm' : r < .3 ? 'fast' : G.st >= 1 && r < .36 ? 'split' : 'sk'; const hp = hpFor() * (ty === 'arm' ? 2.2 : ty === 'fast' ? .6 : 1);
      G.en.push({ id: ++G.id, x: c * cw + 2, y: top - ch, w: cw - 4, h: ch - 4, hp, max: hp, ty, slow: 0, frz: 0, burn: 0, poi: 0, gun: 2 + rnd() * 3 }); });
  }
  function hurt(e, d, b) {
    if (e.hp <= 0) return; if (rnd() < (G.pas.crit || 0) * .1) d *= 2; e.hp -= d; if (d > 3) e.hit = .12; G.fx.push({ k: 'n', x: e.x + e.w / 2, y: e.y, v: Math.round(d), l: .5 });
    if (e.hp <= 0) kill(e);
  }
  function kill(e) {
    G.kills++; G.fx.push({ k: 'shred', x: e.x + e.w / 2, y: e.y + e.h / 2, l: .7, c: e.ty, p: Array.from({ length: e.boss ? 18 : 7 }, () => [(rnd() - .5) * 220, -60 - rnd() * 160, rnd() * 6, 4 + rnd() * 7]) }); G.gems.push({ x: e.x + e.w / 2, y: e.y + e.h / 2, v: e.boss ? 12 : 1 }); G.fx.push({ k: 'pop', x: e.x + e.w / 2, y: e.y + e.h / 2, l: .35, c: e.boss ? '#ff3d9a' : '#f3efe6' });
    if (e.ty === 'split' && !e.small) for (const dx of [0, e.w / 2]) G.en.push({ ...e, id: ++G.id, x: e.x + dx, w: e.w / 2 - 2, hp: e.max * .4, max: e.max * .4, small: 1, ty: 'sk' });
    if (e.boss) { G.boss = null; G.ph = G.st + 1 >= STAGES ? 'win' : 'clear'; }
  }
  const near = (x, y, r, skip) => G.en.filter(e => e !== skip && e.hp > 0 && Math.hypot(e.x + e.w / 2 - x, e.y + e.h / 2 - y) < r);
  function hit(b, e) {
    const L = b.lv || 1, k = b.k, base = 11 * dmgMul() * (b.mini ? .5 : 1) * (BT[k].f ? 1.6 : 1);
    hurt(e, base * (k === 'rain' ? 1 : 1 + .25 * (L - 1)), b);
    const cx = e.x + e.w / 2, cy = e.y + e.h / 2;
    if (k === 'fire' || k === 'sun') { e.burn = 3; e.bd = (k === 'sun' ? 14 : 4 * L) * dmgMul(); }
    if (k === 'ice' || k === 'storm') { e.slow = 2.5; if (L >= 3 || k === 'storm') e.frz = .8; }
    if (k === 'bolt' || k === 'storm') near(cx, cy, 150, e).slice(0, k === 'storm' ? 4 : 1 + L).forEach(o => { hurt(o, base * .6); if (k === 'storm') o.slow = 2; G.fx.push({ k: 'z', x: cx, y: cy, x2: o.x + o.w / 2, y2: o.y + o.h / 2, l: .18 }); });
    if (k === 'poison' || k === 'curse') e.poi = Math.min(60, e.poi + (k === 'curse' ? 6 : 2 * L));
    if ((k === 'bomb' || k === 'sun') && !(b.cd > 0)) { const R = k === 'sun' ? 110 : 50 + 15 * L; near(cx, cy, R, e).forEach(o => hurt(o, base * .7)); G.fx.push({ k: 'boom', x: cx, y: cy, r: R, l: .3, c: BT[k].c }); b.cd = .35; }
    if ((k === 'split' && !b.sp) || k === 'swarm') { b.sp = 1; const n = k === 'swarm' ? 2 : L; for (let i = 0; i < n && G.balls.length < 90; i++) { const a = -Math.PI / 2 + (rnd() - .5) * 2; G.balls.push({ x: b.x, y: b.y, vx: Math.cos(a) * spd(), vy: Math.sin(a) * spd(), k: 'rain', mini: 1, r: 4, lv: 1 }); } }
  }
  function fire() {
    if (!G.stock.length || !G.en.length) return; const k = G.stock.shift();
    let tg = null; G.en.forEach(e => { if (e.hp > 0 && (!tg || e.y > tg.y)) tg = e; });
    const tx = tg.x + tg.w / 2 + (rnd() - .5) * cw * .6, ty = tg.y + tg.h / 2, a = Math.atan2(Math.min(ty - (floor - 10), -40), tx - G.px);
    G.balls.push({ x: G.px, y: floor - 10, vx: Math.cos(a) * spd(), vy: Math.sin(a) * spd(), k, lv: lvOf(k) || 1, r: k === 'rain' ? 6 : 8 });
  }
  G.step = (dt, inX) => {
    if (G.ph !== 'play') return;
    if (inX != null) G.px = Math.max(20, Math.min(W - 20, inX));
    G.t += dt; if (G.shake > 0) G.shake -= dt;
    // 적 줄
    if (!G.boss) { G.rowT -= dt; if (G.rowT <= 0) { row(); G.rowT = Math.max(1.6, 3.4 - G.st * .5 - G.t / 120); } if (G.t >= STAGE_T && !G.en.some(e => e.boss)) { const bw = cw * 3 - 4; G.boss = { id: ++G.id, x: W / 2 - bw / 2, y: top - ch * 2, w: bw, h: ch * 2 - 4, hp: hpFor(1), max: hpFor(1), ty: 'boss', boss: 1, slow: 0, frz: 0, burn: 0, poi: 0, gun: 3, sum: 6 }; G.en.push(G.boss); G.fx.push({ k: 'ban', t: '해골 사장 등장!', l: 1.8 }); } }
    const vy = (8 + G.st * 2.5) * (G.boss ? .45 : 1);
    G.en.forEach(e => {
      if (e.frz > 0) e.frz -= dt; else e.y += vy * dt * (e.slow > 0 ? .4 : 1) * (e.ty === 'fast' ? 1.7 : 1);
      if (e.slow > 0) e.slow -= dt;
      if (e.burn > 0) { e.burn -= dt; hurt(e, e.bd * dt); }
      if (e.poi > 0) { hurt(e, e.poi * 1.3 * dt); e.poi = Math.max(0, e.poi - dt * .8); }
      if ((e.ty === 'gun' || e.boss) && e.y > top) { e.gun -= dt; if (e.gun <= 0) { e.gun = e.boss ? 1.6 : 3.5 + rnd() * 2; const sx = e.x + e.w / 2, sy = e.y + e.h, a = Math.atan2(floor - sy, G.px - sx); G.shots.push({ x: sx, y: sy, vx: Math.cos(a) * 150, vy: Math.sin(a) * 150 }); } }
      if (e.boss) { e.sum -= dt; if (e.sum <= 0) { e.sum = 7; row(); } }
      if (e.hp > 0 && e.y + e.h >= floor) { G.hp -= e.boss ? 99 : 1; e.hp = 0; e.dead = 1; G.shake = .3; G.fx.push({ k: 'pop', x: e.x + e.w / 2, y: floor, l: .4, c: '#ff2e6e' }); }
    });
    G.en = G.en.filter(e => e.hp > 0);
    // 공
    G.fireT -= dt; if (G.fireT <= 0) { fire(); G.fireT = .085; }
    const sub = 3, h = dt / sub;
    for (let s = 0; s < sub; s++) for (const b of G.balls) {
      if (b.dead) continue; b.x += b.vx * h; b.y += b.vy * h; if (b.cd > 0) b.cd -= h;
      if (b.x < b.r) { b.x = b.r; b.vx = Math.abs(b.vx); } if (b.x > W - b.r) { b.x = W - b.r; b.vx = -Math.abs(b.vx); } if (b.y < top - 10 + b.r) { b.y = top - 10 + b.r; b.vy = Math.abs(b.vy); }
      if (b.y > floor && b.vy > 0) { b.dead = 1; if (!b.mini) G.stock.push(b.k); continue; }
      const pierce = b.k === 'ghost' || b.k === 'curse';
      for (const e of G.en) { if (e.hp <= 0) continue; const cx = Math.max(e.x, Math.min(b.x, e.x + e.w)), cy = Math.max(e.y, Math.min(b.y, e.y + e.h)), dx = b.x - cx, dy = b.y - cy;
        if (dx * dx + dy * dy < b.r * b.r) {
          if (pierce) { if (b.last === e.id && b.lt > 0) continue; b.last = e.id; b.lt = .25; hit(b, e); continue; }
          if (Math.abs(dx) > Math.abs(dy)) { b.vx = Math.sign(dx || 1) * Math.abs(b.vx); b.x = cx + Math.sign(dx || 1) * b.r; } else { b.vy = Math.sign(dy || -1) * Math.abs(b.vy); b.y = cy + Math.sign(dy || -1) * b.r; }
          hit(b, e); break; } }
      if (b.lt > 0) b.lt -= h;
      const v = Math.hypot(b.vx, b.vy), sp = b.mini ? spd() * .9 : spd(); if (Math.abs(b.vy) < sp * .25) b.vy = Math.sign(b.vy || -1) * sp * .25; const v2 = Math.hypot(b.vx, b.vy); b.vx *= sp / v2; b.vy *= sp / v2; void v;
    }
    G.balls = G.balls.filter(b => !b.dead);
    // 적 탄
    G.shots.forEach(s => { s.x += s.vx * dt; s.y += s.vy * dt; if (s.y >= floor - 14 && Math.abs(s.x - G.px) < 18) { s.dead = 1; G.hp--; G.shake = .25; } if (s.y > floor + 10) s.dead = 1; }); G.shots = G.shots.filter(s => !s.dead);
    // 경험치
    G.gems.forEach(g => { g.y += 260 * dt; g.x += (G.px - g.x) * Math.min(1, dt * 3); if (g.y >= floor - 10) { g.dead = 1; G.xp += g.v * (1 + .25 * (G.pas.xp || 0)); } }); G.gems = G.gems.filter(g => !g.dead);
    G.fx.forEach(f => { f.l -= dt; if (f.k === 'n') f.y -= 30 * dt; if (f.k === 'shred') f.p.forEach(q => { q[1] += 380 * dt; }); }); G.fx = G.fx.filter(f => f.l > 0);
    if (G.hp <= 0) { G.ph = 'over'; return; }
    if (G.ph === 'play' && G.xp >= G.need) { G.xp -= G.need; G.lv++; G.need = Math.round(6 + G.lv * 3.2); G.ph = 'lv'; G.choices = offers(); }
  };
  function offers() {
    const o = [];
    FUSE.forEach(([a, b, c]) => { if (lvOf(a) >= 3 && lvOf(b) >= 3) o.push({ t: 'fuse', a, b, k: c }); });
    const sp = Object.keys(G.own).filter(k => k !== 'rain').length;
    Object.keys(BT).filter(k => !BT[k].f && k !== 'rain').forEach(k => { if (lvOf(k) && lvOf(k) < 3) o.push({ t: 'up', k }); else if (!lvOf(k) && sp < SLOTS) o.push({ t: 'new', k }); });
    Object.keys(PS).forEach(k => { if ((G.pas[k] || 0) < 5) o.push({ t: 'pas', k }); });
    const fu = o.filter(x => x.t === 'fuse'), rest = o.filter(x => x.t !== 'fuse').sort(() => rnd() - .5);
    return fu.concat(rest).slice(0, 3);
  }
  G.choose = i => {
    const c = G.choices[i]; if (!c) return;
    if (c.t === 'fuse') { delete G.own[c.a]; delete G.own[c.b]; G.own[c.k] = 3; G.stock = G.stock.filter(k => k !== c.a && k !== c.b); G.stock.push(c.k); G.balls.forEach(b => { if (b.k === c.a || b.k === c.b) { b.k = c.k; } }); }
    else if (c.t === 'new') { G.own[c.k] = 1; G.stock.push(c.k); }
    else if (c.t === 'up') G.own[c.k]++;
    else { G.pas[c.k] = (G.pas[c.k] || 0) + 1; if (c.k === 'more') { G.stock.push('rain', 'rain'); } if (c.k === 'hp') { G.maxHp++; G.hp = Math.min(G.maxHp, G.hp + 1); } }
    G.choices = null; G.ph = 'play';
  };
  G.next = () => { G.st++; G.t = 0; G.en = []; G.shots = []; G.boss = null; G.rowT = 1; G.hp = Math.min(G.maxHp, G.hp + 2); G.reload(); G.ph = 'play'; G.fx.push({ k: 'ban', t: `${G.st + 1}번째 밤`, l: 1.6 }); };
  return G;
}
const POUR = { BT, FUSE, PS, make, STAGES };
if (typeof module !== 'undefined') module.exports = POUR;
if (typeof window === 'undefined' || !window.ARC) return;

// ---------- 화면 ----------
const { frame, talk, gcAdd, gc } = window.ARC;
const NAME = 'DOWNPOUR', COST = 3;
const css = `
.dp{position:relative;flex:1;min-height:0;display:flex}
.dp canvas{flex:1;width:100%;min-height:0;display:block;touch-action:none}
.dps{position:absolute;left:12px;right:12px;top:48px;z-index:4;display:flex;align-items:center;gap:8px;padding:6px 10px;border-radius:12px;background:rgba(0,0,0,.6);border:1px solid var(--line);font-size:13px;font-weight:700;pointer-events:none;opacity:0;transition:opacity .3s}.dps.on{opacity:1}.dps i{flex:none;width:26px;height:26px;border-radius:50%;background:url(assets/lena/face.jpg) 50% 30%/cover;border:2px solid #000}.app.outside .dps i{background-image:url(assets/lena/cat.jpg)}
.dpo{position:absolute;inset:0;z-index:5;display:flex;flex-direction:column;justify-content:center;gap:10px;padding:16px;background:rgba(5,7,11,.72);backdrop-filter:blur(2px)}
.dpo h3{font-family:'Black Han Sans';font-weight:400;font-size:26px;text-align:center;color:var(--yel);text-shadow:2px 2px 0 var(--pink),4px 4px 0 #000;margin:0}
.dpc{display:flex;align-items:center;gap:12px;min-height:74px;padding:10px 12px;border:2px solid #000;border-radius:6px;background:url(assets/lena/paper_white.webp) center/cover,#f3efe6;color:#111;text-align:left;box-shadow:4px 4px 0 var(--teal);animation:dpin .35s cubic-bezier(.2,1.5,.4,1) backwards}
.dpc:nth-child(3){animation-delay:.06s}.dpc:nth-child(4){animation-delay:.12s}@keyframes dpin{from{transform:translateY(16px) scale(.9);opacity:0}}
.dpc i{flex:none;width:38px;height:38px;border-radius:50%;border:3px solid #000;box-shadow:0 0 12px var(--bc)}.dpc b{display:block;font-size:16px}.dpc small{display:block;font-size:12.5px;opacity:.75;word-break:keep-all}
.dpc.fu{background:#fff7b0;box-shadow:4px 4px 0 var(--pink)}.dpc em{font-style:normal;font-size:11px;font-weight:800;padding:1px 6px;border-radius:8px;background:#111;color:#fff;margin-left:4px}
`;
document.head.appendChild(Object.assign(document.createElement('style'), { textContent: css }));
const meta = () => (S.pour = S.pour || { best: 0, wins: 0, runs: 0 });
const IMG = n => { const i = new Image(); i.src = 'assets/lena/' + n; return i; }; const cat = IMG('cat.jpg'), bgI = IMG('poster.jpg'), PAP = { sk: IMG('paper_white.webp'), arm: IMG('paper_teal.webp'), fast: IMG('paper_yellow.webp'), gun: IMG('paper_pink.webp'), split: IMG('paper_yellow.webp'), boss: IMG('paper_pink.webp') }, tape = IMG('tape_white.webp'), tapeP = IMG('tape_pink1.webp'); const sk = new Image(); sk.src = 'assets/lena/st_skull.webp';
function lobby() {
  frame(NAME, B => {
    const M = meta(), nm = el('div', 'bp-name'); nm.innerHTML = `${NAME}<small>공을 튕겨 해골 벽돌 부수기</small>`; B.appendChild(nm);
    talk(B, 'sk', '(해골 벽돌이 줄지어 내려온다) …바닥에 닿게 두면 안 돼요. 레나가 그랬어요.');
    const P = el('div', 'bp-panel'); P.appendChild(el('h4', null, '하는 법'));
    P.appendChild(el('div', 'hint', '공은 저절로 가장 아래 해골을 향해 날아가요. 손가락으로 끌어 좌우로 움직여 각도를 바꾸고, 빨간 탄은 피해요. 해골이 바닥 선에 닿으면 체력 −1. 레벨이 오르면 새 공·강화 중 하나. 같은 짝의 공 둘이 3레벨이 되면 합쳐서 ★공으로 진화. 밤 3번(각 2분 20초 + 해골 사장)을 버티면 끝.'));
    B.appendChild(P);
    const r = el('div', 'bp-row'), g = el('button', 'bp-go'); g.innerHTML = `시작<small>게임 동전 ${COST} · 최고 ${M.best}번째 밤 · 클리어 ${M.wins}번</small>`; g.onclick = () => { if (gc() < COST) { toast(`게임 동전이 모자라요. (${COST}개)`); return; } gcAdd(-COST); coinSound(); play(); }; r.appendChild(g); B.appendChild(r);
  }, true);
}
function play() {
  meta().runs++; save();
  const B = frame(NAME, () => {}, true, true), W = el('div', 'dp'); B.appendChild(W);
  const cv = el('canvas'); W.appendChild(cv); const x = cv.getContext('2d');
  const dpr = Math.min(2, devicePixelRatio || 1); let vw = cv.clientWidth, vh = cv.clientHeight; cv.width = vw * dpr; cv.height = vh * dpr;
  const G = make(vw, vh); window.__dp = G;
  const sb = el('div', 'dps'); sb.append(el('i'), el('span')); W.appendChild(sb); let sbT = 0; const say = t => { sb.lastChild.textContent = t; sb.classList.add('on'); clearTimeout(sbT); sbT = setTimeout(() => sb.classList.remove('on'), 2600); };
  say(pick(['전단지가 바닥에 닿으면 안 돼요!', '비 많이 오네요. 공 잘 튕겨요.', '저 여기서 보고 있을게요.']));
  let bossSaid = 0;
  let inX = null, raf = 0, last = performance.now(), rain = Array.from({ length: 60 }, () => [Math.random(), Math.random()]), lastHp = G.hp, kills = 0;
  const mv = e => { const r = cv.getBoundingClientRect(); inX = e.clientX - r.left; };
  cv.addEventListener('pointerdown', e => { mv(e); cv.setPointerCapture(e.pointerId); }); cv.addEventListener('pointermove', e => { if (e.buttons || e.pointerType === 'touch') mv(e); });
  let ov = null;
  function overlay(h, cards) { if (ov) ov.remove(); ov = el('div', 'dpo'); ov.appendChild(el('h3', null, h)); cards.forEach(c => ov.appendChild(c)); W.appendChild(ov); }
  function card(col, t, d, tag, fu, fn) { const b = el('button', 'dpc' + (fu ? ' fu' : '')), i = el('i'); i.style.background = col; i.style.setProperty('--bc', col); const tx = el('div'), bb = el('b', null, t); if (tag) bb.appendChild(el('em', null, tag)); tx.append(bb, el('small', null, d)); b.append(i, tx); b.onclick = fn; return b; }
  function lvUI() {
    tone([660, 880, 1320], .08, .06, 'triangle');
    overlay(`레벨 ${G.lv}!`, G.choices.map((c, i) => {
      const go = () => { G.choose(i); ov.remove(); ov = null; last = performance.now(); };
      if (c.t === 'fuse') return card(BT[c.k].c, `진화: ${BT[c.k].n}`, BT[c.k].d, '', 1, go);
      if (c.t === 'pas') return card('#555', PS[c.k][0], PS[c.k][1], `${(G.pas[c.k] || 0) + 1}/5`, 0, go);
      return card(BT[c.k].c, BT[c.k].n, BT[c.k].d, c.t === 'new' ? '새 공' : `레벨 ${G.own[c.k] + 1}`, 0, go);
    }));
  }
  function end(win) {
    cancelAnimationFrame(raf); const M = meta(), n = G.st + (win ? 1 : 0), g = n * 3 + (win ? 15 : 0); M.best = Math.max(M.best, n); if (win) M.wins++; save(); if (g) gcAdd(g);
    tone(win ? [523, 659, 784, 1046] : [300, 200, 120], .15, .07, win ? 'triangle' : 'sawtooth');
    const t = el('div', 'bp-panel'); t.append(el('h4', null, win ? '비가 그쳤어요 — 클리어!' : `${G.st + 1}번째 밤에서 쓰러졌어요`), el('div', 'hint', `부순 해골 ${G.kills} · 레벨 ${G.lv} · 게임 동전 +${g}`));
    const rb = el('div', 'bp-row'); rb.append(btn('다시', 'teal', () => { if (gc() < COST) { toast('게임 동전이 모자라요.'); return; } gcAdd(-COST); play(); }), btn('나가기', 'ghost', lobby)); t.appendChild(rb);
    overlay(win ? 'CLEAR' : 'GAME OVER', [t]);
  }
  ARC.cleanup = () => cancelAnimationFrame(raf);
  const loop = now => {
    const dt = Math.min(.033, (now - last) / 1000); last = now;
    if (G.ph === 'play') { G.step(dt, inX); if (G.kills > kills && Math.random() < .5) tone([900 + Math.random() * 300], .02, .02, 'square'); kills = G.kills; if (G.hp < lastHp) { tone([140, 90], .15, .08, 'sawtooth'); say(G.hp <= 1 ? '송휘님! 하나 남았어요!' : pick(['아야, 하나 닿았어요.', '바닥 지켜요!', '빨간 탄 피해요!'])); } lastHp = G.hp; if (G.boss && !bossSaid) { bossSaid = 1; say('해골 사장이에요. 빨간 잉크 조심!'); tone([110, 147, 110], .2, .08, 'sawtooth'); } if (!G.boss) bossSaid = 0;
      if (G.ph === 'lv') lvUI(); else if (G.ph === 'clear') { coinSound(); overlay(`${G.st + 1}번째 밤 클리어!`, [card('#2fe0c8', '다음 밤으로', '체력 +2 회복 · 해골이 더 단단해져요', '', 0, () => { ov.remove(); ov = null; G.next(); last = performance.now(); })]); } else if (G.ph === 'win') return end(true), draw(); else if (G.ph === 'over') return end(false), draw(); }
    draw(); raf = requestAnimationFrame(loop);
  };
  function draw() {
    x.setTransform(dpr, 0, 0, dpr, 0, 0); if (G.shake > 0) x.translate((Math.random() - .5) * 9, (Math.random() - .5) * 9);
    // 배경: 비 오는 부스 그림을 어둡게 + 네온 안개
    if (bgI.complete && bgI.naturalWidth) { const k = Math.max(vw / bgI.naturalWidth, vh / bgI.naturalHeight); x.drawImage(bgI, (vw - bgI.naturalWidth * k) / 2, (vh - bgI.naturalHeight * k) / 2, bgI.naturalWidth * k, bgI.naturalHeight * k); }
    x.fillStyle = 'rgba(6,8,13,.87)'; x.fillRect(-10, -10, vw + 20, vh + 20);
    let g = x.createLinearGradient(0, G.floor - 160, 0, vh); g.addColorStop(0, 'rgba(255,61,154,0)'); g.addColorStop(1, 'rgba(255,61,154,.22)'); x.fillStyle = g; x.fillRect(0, G.floor - 160, vw, vh);
    x.strokeStyle = 'rgba(190,225,255,.22)'; x.lineWidth = 1; x.beginPath(); rain.forEach(d => { d[1] += .014; if (d[1] > 1) { d[1] = 0; d[0] = Math.random(); } x.moveTo(d[0] * vw, d[1] * vh); x.lineTo(d[0] * vw - 2.5, d[1] * vh + 14); }); x.stroke();
    // 유리 바닥 선(네온)
    x.shadowColor = '#ff3d9a'; x.shadowBlur = 12; x.strokeStyle = '#ff3d9a'; x.lineWidth = 2.5; x.beginPath(); x.moveTo(0, G.floor); x.lineTo(vw, G.floor); x.stroke(); x.shadowBlur = 0;
    // 적 = 유리에 붙은 빚 독촉 전단지
    G.en.forEach(e => { x.save(); const cx = e.x + e.w / 2, cy = e.y + e.h / 2, tilt = ((e.id * 37) % 9 - 4) * .012; x.translate(cx, cy); x.rotate(tilt); const w = e.w, h = e.h;
      x.shadowColor = 'rgba(0,0,0,.6)'; x.shadowOffsetX = 3; x.shadowOffsetY = 4; x.fillStyle = e.boss ? '#ffb3cf' : '#f3efe6'; x.fillRect(-w / 2, -h / 2, w, h); x.shadowColor = 'transparent';
      const pi = PAP[e.boss ? 'boss' : e.ty]; if (pi && pi.complete) x.drawImage(pi, (e.id * 53) % 300, (e.id * 71) % 300, 260, 160, -w / 2, -h / 2, w, h);
      if (e.hit > 0) { x.fillStyle = `rgba(255,255,255,${e.hit * 4})`; x.fillRect(-w / 2, -h / 2, w, h); }
      if (e.frz > 0 || e.slow > 0) { x.fillStyle = 'rgba(160,220,255,.35)'; x.fillRect(-w / 2, -h / 2, w, h); } if (e.burn > 0) { x.fillStyle = 'rgba(255,110,40,.3)'; x.fillRect(-w / 2, -h / 2, w, h); } if (e.poi > 0) { x.fillStyle = 'rgba(120,255,80,.22)'; x.fillRect(-w / 2, -h / 2, w, h); }
      x.strokeStyle = '#000'; x.lineWidth = 2; x.strokeRect(-w / 2, -h / 2, w, h);
      const tp = e.boss ? tapeP : tape; if (tp.complete) x.drawImage(tp, -w * .22, -h / 2 - 6, w * .44, 11);
      const s = Math.min(w * .5, h * .72); if (sk.complete) x.drawImage(sk, -w / 2 + 3, -s / 2, s, s);
      x.fillStyle = '#111'; x.textAlign = 'right'; x.font = `${e.boss ? 20 : 12}px 'Black Han Sans'`; x.fillText(e.boss ? '해골 사장' : e.ty === 'gun' ? '독촉' : e.ty === 'arm' ? '압류' : e.ty === 'fast' ? '급함' : e.ty === 'split' ? '분할' : '빚', w / 2 - 5, -h / 2 + (e.boss ? 24 : 14));
      x.font = `${e.boss ? 15 : 11}px 'Space Mono'`; x.fillStyle = e.boss ? '#c4004f' : '#333'; x.fillText(Math.ceil(e.hp), w / 2 - 5, h / 2 - 8);
      x.fillStyle = 'rgba(0,0,0,.25)'; x.fillRect(-w / 2 + 3, h / 2 - 5, w - 6, 3); x.fillStyle = e.boss ? '#ff2e6e' : '#ff3d9a'; x.fillRect(-w / 2 + 3, h / 2 - 5, (w - 6) * Math.max(0, e.hp / e.max), 3);
      if (e.ty === 'gun' || e.boss) { x.fillStyle = '#ff2e6e'; x.beginPath(); x.arc(w / 2 - 6, -h / 2 + 6, 3 + Math.sin(G.t * 10), 0, 7); x.fill(); }
      x.restore(); if (e.hit > 0) e.hit -= .016; });
    // 적 탄 = 빨간 잉크 방울
    G.shots.forEach(s => { x.fillStyle = '#ff2e6e'; x.shadowColor = '#ff2e6e'; x.shadowBlur = 10; x.beginPath(); x.arc(s.x, s.y, 5, 0, 7); x.fill(); x.shadowBlur = 0; });
    // 공 = 네온 빗방울
    G.balls.forEach(b => { const c = BT[b.k].c; x.strokeStyle = c; x.globalAlpha = .3; x.lineWidth = b.r * 1.4; x.lineCap = 'round'; x.beginPath(); x.moveTo(b.x, b.y); x.lineTo(b.x - b.vx * .045, b.y - b.vy * .045); x.stroke(); x.globalAlpha = 1;
      x.fillStyle = c; x.shadowColor = c; x.shadowBlur = BT[b.k].f ? 22 : 12; x.beginPath(); x.arc(b.x, b.y, b.r, 0, 7); x.fill(); x.shadowBlur = 0; x.fillStyle = 'rgba(255,255,255,.8)'; x.beginPath(); x.arc(b.x - b.r * .3, b.y - b.r * .3, b.r * .35, 0, 7); x.fill(); });
    x.fillStyle = '#9ff5e4'; x.shadowColor = '#2fe0c8'; x.shadowBlur = 8; G.gems.forEach(m => { x.beginPath(); x.moveTo(m.x, m.y - 5); x.lineTo(m.x + 4, m.y); x.lineTo(m.x, m.y + 5); x.lineTo(m.x - 4, m.y); x.fill(); }); x.shadowBlur = 0;
    // 효과
    G.fx.forEach(f => { if (f.k === 'n') { x.globalAlpha = Math.min(1, f.l * 3); x.font = "14px 'Black Han Sans'"; x.textAlign = 'center'; x.fillStyle = '#fff36b'; x.strokeStyle = '#000'; x.lineWidth = 3; x.strokeText(f.v, f.x, f.y); x.fillText(f.v, f.x, f.y); x.globalAlpha = 1; }
      else if (f.k === 'boom') { x.globalAlpha = f.l / .3 * .6; x.fillStyle = f.c; x.shadowColor = f.c; x.shadowBlur = 20; x.beginPath(); x.arc(f.x, f.y, f.r * (1.2 - f.l / .3 * .4), 0, 7); x.fill(); x.shadowBlur = 0; x.globalAlpha = 1; }
      else if (f.k === 'z') { x.strokeStyle = '#fff36b'; x.shadowColor = '#f2ea3a'; x.shadowBlur = 10; x.lineWidth = 2; x.beginPath(); x.moveTo(f.x, f.y); x.lineTo((f.x + f.x2) / 2 + 8, (f.y + f.y2) / 2 - 6); x.lineTo(f.x2, f.y2); x.stroke(); x.shadowBlur = 0; }
      else if (f.k === 'shred') { const u = .7 - f.l; f.p.forEach(q => { x.save(); x.translate(f.x + q[0] * u, f.y + q[1] * u); x.rotate(q[2] + u * 8); x.globalAlpha = Math.min(1, f.l * 2); x.fillStyle = f.c === 'gun' ? '#ffb3cf' : f.c === 'arm' ? '#bff5ea' : f.c === 'fast' || f.c === 'split' ? '#fff6a8' : '#f3efe6'; x.fillRect(-q[3] / 2, -q[3] / 3, q[3], q[3] * .66); x.strokeStyle = 'rgba(0,0,0,.5)'; x.lineWidth = 1; x.strokeRect(-q[3] / 2, -q[3] / 3, q[3], q[3] * .66); x.restore(); }); x.globalAlpha = 1; }
      else if (f.k === 'pop') { x.strokeStyle = f.c; x.lineWidth = 3; x.globalAlpha = f.l / .4; x.beginPath(); x.arc(f.x, f.y, 26 * (1 - f.l / .4) + 6, 0, 7); x.stroke(); x.globalAlpha = 1; }
      else if (f.k === 'ban') { const a = Math.min(1, f.l * 2, (1.8 - f.l) * 4); x.globalAlpha = Math.max(0, a); x.fillStyle = 'rgba(0,0,0,.55)'; x.fillRect(0, vh * .36, vw, 64); x.font = "34px 'Black Han Sans'"; x.textAlign = 'center'; x.fillStyle = f.t.includes('사장') ? '#ff2e6e' : '#9ff5e4'; x.strokeStyle = '#000'; x.lineWidth = 5; x.strokeText(f.t, vw / 2, vh * .36 + 44); x.fillText(f.t, vw / 2, vh * .36 + 44); x.globalAlpha = 1; } });
    // 고양이 + 분홍 우산
    const py = G.floor + 26; x.fillStyle = '#ff3d9a'; x.strokeStyle = '#000'; x.lineWidth = 2; x.beginPath(); x.arc(G.px, py - 16, 30, Math.PI, 0); x.closePath(); x.fill(); x.stroke();
    x.strokeStyle = 'rgba(0,0,0,.4)'; [-15, 0, 15].forEach(d => { x.beginPath(); x.moveTo(G.px, py - 46); x.lineTo(G.px + d, py - 16); x.stroke(); });
    x.save(); x.beginPath(); x.arc(G.px, py, 17, 0, 7); x.closePath(); x.clip(); if (cat.complete) x.drawImage(cat, G.px - 17, py - 17, 34, 34); x.restore(); x.strokeStyle = '#fff'; x.lineWidth = 2.5; x.beginPath(); x.arc(G.px, py, 17, 0, 7); x.stroke();
    // HUD
    x.font = "16px 'Black Han Sans'"; x.textAlign = 'left'; x.fillStyle = '#fff'; x.strokeStyle = '#000'; x.lineWidth = 3; const ht = `${G.st + 1}번째 밤 · ${G.boss ? '해골 사장!' : `${Math.max(0, Math.ceil(140 - G.t))}초`}`; x.strokeText(ht, 12, 22); x.fillText(ht, 12, 22);
    for (let i = 0; i < G.maxHp; i++) { const hx = vw - 16 - i * 20; x.fillStyle = i < G.hp ? '#ff3d9a' : 'rgba(255,255,255,.15)'; x.beginPath(); x.moveTo(hx, 24); x.bezierCurveTo(hx - 9, 16, hx - 7, 8, hx, 13); x.bezierCurveTo(hx + 7, 8, hx + 9, 16, hx, 24); x.fill(); }
    x.fillStyle = 'rgba(0,0,0,.5)'; x.fillRect(12, 32, vw - 24, 7); g = x.createLinearGradient(12, 0, vw - 12, 0); g.addColorStop(0, '#2fe0c8'); g.addColorStop(1, '#9ff5e4'); x.fillStyle = g; x.fillRect(12, 32, (vw - 24) * Math.min(1, G.xp / G.need), 7);
    x.textAlign = 'center'; x.font = "12px 'Black Han Sans'"; x.fillStyle = 'rgba(255,255,255,.7)'; x.fillText(`LV ${G.lv} · 공 ${G.stock.length + G.balls.filter(b => !b.mini).length}개 · 끌어서 움직이기`, vw / 2, vh - 10);
    let ox = 14; Object.keys(G.own).forEach(k => { x.fillStyle = BT[k].c; x.shadowColor = BT[k].c; x.shadowBlur = 8; x.beginPath(); x.arc(ox + 6, vh - 32, 6, 0, 7); x.fill(); x.shadowBlur = 0; x.fillStyle = '#fff'; x.textAlign = 'left'; x.fillText(G.own[k] > 1 ? G.own[k] : '', ox + 14, vh - 28); ox += 30; });
  }
  raf = requestAnimationFrame(loop);
}
window.ARC.reg({ id: 'pour', order: 1, name: NAME, icon: 'assets/lena/st_bolt.webp', color: '#9ff5e4', cost: COST, sub: () => `공 튕기기 로그라이크 · 최고 ${meta().best}번째 밤`, start: lobby });
window.lenaPour = { make, lobby };
})();
