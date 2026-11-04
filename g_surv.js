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
L('cake', 'assets/lena/s/g_cake.webp'); L('key', gimg('i_magnet')); L('gcoin', gimg('i_bag')); L('watch', gimg('i_watch'));
['i_chest', 'i_lamp', 'i_gemb', 'i_gemg', 'i_gemr'].forEach(k => L(k, gimg(k)));

const WP = {
  whip: { n: '전화선 채찍', d: '바라보는 쪽을 가로로 크게 베요. 2레벨부터 뒤쪽도', i: gimg('s_phone') },
  laser: { n: '선글라스 레이저', d: '가장 가까운 적에게 꿰뚫는 레이저', i: gimg('c_laser') },
  heart: { n: '하트 실드', d: '하트가 몸 주위를 돌며 막고 때려요', i: gimg('s_heart') },
  bolt: { n: '번개 콜', d: '화면 속 적에게 번개가 떨어져요', i: img('st_bolt') },
  kiss: { n: '키스 미사일', d: '적을 쫓아가는 입술 키스', i: img('st_lips') },
  shoe: { n: '운동화', d: '이동 속도 +12%', i: gimg('c_coin'), pass: 1 },
  milk: { n: '딸기 우유', d: '최대 체력 +20, 체력 회복', i: gimg('c_tape'), pass: 1 },
  mag: { n: '동전 자석', d: '보석 끌어오는 거리 +45%', i: gimg('c_key'), pass: 1 },
  cof: { n: '진한 커피', d: '모든 무기 재사용 시간 −8%', i: gimg('c_umb'), pass: 1 }
};
const MAXL = 8, PMAX = 5; // 무기 8레벨, 보조 5레벨
// 진화: 무기 8레벨 + 짝 보조 아이템을 가진 채로 보물 상자를 열면 진화
const EVO = { whip: ['milk', '피의 전화선', '더 길게 베고, 맞힐 때마다 체력 회복'], laser: ['cof', '프리즘 레이저', '레이저 5갈래, 더 세게'], heart: ['mag', '하트 은하', '하트 8개가 크게 돌아요'], bolt: ['shoe', '천둥 폭풍', '번개 두 배, 더 넓게'], kiss: ['milk', '키스 폭풍', '키스가 쏟아져요'] };
const PICK = { cake: ['딸기 케이크', '체력 30% 회복'], key: ['자석', '맵의 보석을 전부 끌어와요'], bolt: ['번개 부적', '화면의 적을 한 번에 쓸어요'], gcoin: ['동전 주머니', '끝나고 받을 동전 +2'], watch: ['멈춘 시계', '10초 동안 적이 얼어붙어요'] };
let G = null;

const MV = () => { if (!S.sv) S.sv = { bones: 0, up: {}, asc: 0, ascMax: 0 }; S.sv.up = S.sv.up || {}; return S.sv; };
const upLv = () => 0; // 영구 강화 없음: 한 판 한 판 처음부터
const NIGHT = n => n ? `밤 ${n + 1} · 적 체력 +${n * 25}% · 수 +${n * 12}% · 공격 +${n * 10}% · 동전 보상 +${n * 25}%` : '밤 1 · 기본';
function intro() {
  const M = MV();
  frame('빗속의 고양이', B => {
    talk(B, 'l', '비 오는 골목에 해골들이 몰려와요. 5분 버티면 새벽이에요. …한 판에 다 걸어요. 레벨업 고르는 게 전부예요.');
    const r = el('div', 'rules'); r.innerHTML = '<b>하는 법</b><br>· 화면을 <b>끌면</b> 고양이가 움직이고, 공격은 알아서 해요.<br>· 초록 보석으로 레벨업 → 무기·능력 <b>하나 고르기</b>. 1분마다 해골 떼, 2:30·4:30에 보스.<br>· 무기는 8레벨까지. <b>무기 8레벨 + 짝 아이템</b>을 가진 채로 강한 해골·보스의 <b>보물 상자</b>를 열면 <b>진화</b>해요.<br>· 분홍 <b>가로등</b>을 부수면 케이크·자석·멈춘 시계·번개 부적·동전 주머니가 나와요.<br>· 레벨업 때 <b>다시 뽑기</b> 3번, 고른 것 <b>빼기</b> 2번, <b>건너뛰기</b>를 쓸 수 있어요.<br>· 보석은 파랑 < 초록 < 빨강 순으로 경험치가 커요.<br>· 영구 강화는 없어요. 매 판 레벨 1부터예요.<br>· 5분 버티면 다음 <b>밤 단계</b>가 열려요. 단계가 높을수록 어렵고 보상이 커요.';
    B.appendChild(lbl('밤 단계'));
    const P = el('div', 'pills'); for (let n = 0; n <= Math.min(9, M.ascMax); n++) { const b = el('button', M.asc === n ? 'on' : ''); b.innerHTML = n ? `${ci('danger')}밤 ${n + 1}` : '밤 1'; b.onclick = () => { M.asc = n; save(); intro(); }; P.appendChild(b); } B.appendChild(P);
    B.appendChild(el('div', 'hint', NIGHT(M.asc)));
    B.appendChild(row(btn(`밤 ${M.asc + 1} 골목으로 들어가기`, 'wide', play)));
    B.appendChild(r);
    B.appendChild(el('div', 'rules', `최고 기록: ${S.svBest ? `${Math.floor(S.svBest / 60)}분 ${S.svBest % 60}초` : '없음'} · 최다 처치 ${S.svKill || 0} · 깬 밤 ${M.ascMax}`));
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
  const fit = () => { vw = cv.clientWidth || W.clientWidth; vh = cv.clientHeight || W.clientHeight; cv.width = vw * dpr; cv.height = vh * dpr; };
  fit(); const ro = new ResizeObserver(fit); ro.observe(W);
  const M = MV(), A = M.asc; G = { t: 0, asc: A, dm: 1 + .1 * upLv('dmg'), revs: upLv('rev'), elite: 60, p: { x: 0, y: 0, hp: 130 * (1 + .1 * upLv('hp')), mhp: 130 * (1 + .1 * upLv('hp')), spd: 150 * (1 + .05 * upLv('spd')), mag: 70 * (1 + .15 * upLv('mag')), inv: 0, face: 1, fx: 1, fy: 0, cd: 1 }, en: [], gems: [], pr: [], fx: [], nums: [], lv: 1, xp: 0, need: 6, kills: 0, w: { whip: 1 }, wt: {}, ev: {}, chests: [], items: [], lampT: 6, bonus: 0, rr: 3, ban: 2, banned: [], freeze: 0, paused: false, over: false, spawn: 0, boss: [150, 270], shake: 0, rain: [...Array(70)].map(() => ({ x: Math.random(), y: Math.random(), s: .6 + Math.random() * .8 })) };
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
  function nearest(maxD) { let best = null, bd = maxD * maxD; const frz = G.freeze > G.t;
    for (const e of G.en) { if (e.type === 'lamp') continue; if (frz) { e.flash = Math.max(0, e.flash - dt); if (!p.inv && dist2(e, p) < (e.r + 16) ** 2) { /* 얼어 있어도 닿으면 아픔은 없음 */ } continue; } const d = dist2(e, G.p); if (d < bd) { bd = d; best = e; } } return best; }
  function hit(e, dmg, kx, ky) {
    if (e.dead) return; dmg *= G.dm; e.hp -= dmg; e.flash = .1; if (kx || ky) { e.x += kx; e.y += ky; }
    if (G.nums.length < 40) G.nums.push({ x: e.x, y: e.y - e.r, v: Math.round(dmg), t: .6 });
    if (e.hp <= 0 && e.type === 'lamp') { e.dead = true; const r = Math.random(); G.items.push({ x: e.x, y: e.y, k: r < .38 ? 'cake' : r < .6 ? 'gcoin' : r < .76 ? 'key' : r < .9 ? 'watch' : 'bolt' }); tone([700], .05, .03, 'triangle'); return; }
    if (e.hp <= 0) { e.dead = true; G.kills++; if (e.elite || e.type === 'boss') G.chests.push({ x: e.x, y: e.y }); G.gems.push({ x: e.x, y: e.y, v: e.xp, h: Math.random() < .02 + upLv('luck') * .006 + (e.elite ? 1 : 0) }); if (e.elite) { for (let i = 0; i < 8; i++) G.gems.push({ x: e.x + (Math.random() - .5) * 80, y: e.y + (Math.random() - .5) * 80, v: 2 }); } if (e.type === 'boss') { for (let i = 0; i < 14; i++) G.gems.push({ x: e.x + (Math.random() - .5) * 120, y: e.y + (Math.random() - .5) * 120, v: 3 }); G.shake = .5; tone([90], .3, .12, 'square'); } }
  }
  const T = { ghost: { hp: 6, spd: 72, dmg: 8, r: 15, s: 46, xp: 1, im: 's_ghost' }, bat: { hp: 4, spd: 125, dmg: 6, r: 13, s: 46, xp: 1, im: 's_bat' }, hand: { hp: 20, spd: 46, dmg: 12, r: 19, s: 54, xp: 2, im: 's_hand' }, boss: { hp: 700, spd: 58, dmg: 25, r: 44, s: 132, xp: 10, im: 's_boss' } };
  function spawn(type) { const t = T[type], a = Math.random() * Math.PI * 2, R = Math.hypot(vw, vh) / 2 + 60, k = (1 + G.t / 220) * (1 + .25 * G.asc); G.en.push({ type, x: G.p.x + Math.cos(a) * R, y: G.p.y + Math.sin(a) * R, hp: t.hp * (type === 'boss' ? 1 + .35 * G.asc : k), mhp: t.hp * k, spd: t.spd * (1 + .03 * G.asc), dmg: t.dmg * (1 + .1 * G.asc), r: t.r, s: t.s, xp: t.xp, im: t.im, ph: Math.random() * 6, flash: 0 }); }
  const lvOf = k => G.w[k] || 0;
  function weapons(dt) {
    const p = G.p, cdm = Math.pow(.92, lvOf('cof'));
    const ready = (k, cd) => { G.wt[k] = (G.wt[k] || 0) - dt; if (G.wt[k] <= 0) { G.wt[k] = cd * cdm; return true; } return false; };
    if (lvOf('whip') && ready('whip', 1.15 - lvOf('whip') * .08)) {
      // 뱀파이어 서바이버식 채찍: 바라보는 쪽을 가로로 넓게 베고, 2레벨부터 0.15초 뒤 반대쪽도 벤다
      const L = lvOf('whip'), E = G.ev.whip, len = (120 + L * 16) * (E ? 1.4 : 1), dmg = 10 + L * 4 + (E ? 12 : 0), sd0 = p.face;
      const slash = (sd, yo) => { G.fx.push({ k: 'whip', x: p.x, y: p.y + yo, sd, len, t: .28, t0: .28, ev: E, ph: Math.random() * 6 }); tone([220 + Math.random() * 40], .05, .025, 'sawtooth'); for (const e of G.en) { const dx = (e.x - p.x) * sd, dy = Math.abs(e.y - (p.y + yo - 10)); if (dx > -12 && dx < len + e.r && dy < (E ? 38 : 26) + e.r) { hit(e, dmg, sd * 9, 0); if (E && e.type !== 'lamp') p.hp = Math.min(p.mhp, p.hp + .6); } } };
      slash(sd0, -4); if (L >= 2) G.later = (G.later || []).concat({ at: G.t + .15, f: () => slash(-sd0, 10) });
      tone([200], .04, .03, 'sawtooth');
    }
    if (lvOf('laser') && ready('laser', 1.7 - lvOf('laser') * .12)) {
      const L = lvOf('laser'), tg = nearest(420); if (tg) { const n = G.ev.laser ? 5 : L >= 6 ? 4 : L >= 4 ? 3 : L >= 2 ? 2 : 1, base = Math.atan2(tg.y - p.y, tg.x - p.x);
        for (let i = 0; i < n; i++) { const a = base + (i - (n - 1) / 2) * .25, ex = p.x + Math.cos(a) * 420, ey = p.y + Math.sin(a) * 420; G.fx.push({ k: 'laser', x: p.x, y: p.y, ex, ey, t: .18 });
          for (const e of G.en) { const vx = ex - p.x, vy = ey - p.y, l2 = vx * vx + vy * vy, u = Math.max(0, Math.min(1, ((e.x - p.x) * vx + (e.y - p.y) * vy) / l2)), cx = p.x + vx * u, cy = p.y + vy * u; if ((e.x - cx) ** 2 + (e.y - cy) ** 2 < (e.r + 8) ** 2) hit(e, 7 + L * 3 + (G.ev.laser ? 10 : 0)); } }
        tone([1200, 1600], .05, .02, 'square'); }
    }
    if (lvOf('heart')) { const L = lvOf('heart'), n = G.ev.heart ? 8 : Math.min(6, 1 + L), R = (64 + L * 5) * (G.ev.heart ? 1.3 : 1); G.ha = (G.ha || 0) + dt * (2.4 + L * .2);
      for (let i = 0; i < n; i++) { const a = G.ha + i * Math.PI * 2 / n, hx = p.x + Math.cos(a) * R, hy = p.y + Math.sin(a) * R;
        for (const e of G.en) { if ((e.hc || 0) > G.t) continue; if ((e.x - hx) ** 2 + (e.y - hy) ** 2 < (e.r + 14) ** 2) { hit(e, 5 + L * 2.5 + (G.ev.heart ? 6 : 0), Math.cos(a) * 10, Math.sin(a) * 10); e.hc = G.t + .4; } } } }
    if (lvOf('bolt') && ready('bolt', 2.3 - lvOf('bolt') * .2)) {
      const L = lvOf('bolt'); const vis = G.en.filter(e => e.type !== 'lamp' && Math.abs(e.x - p.x) < vw / 2 && Math.abs(e.y - p.y) < vh / 2);
      const nb = Math.min(6, L) * (G.ev.bolt ? 2 : 1), rr = G.ev.bolt ? 95 : 60; for (let i = 0; i < nb && vis.length; i++) { const e = vis.splice(Math.random() * vis.length | 0, 1)[0]; G.fx.push({ k: 'bolt', x: e.x, y: e.y, t: .25 }); for (const o of G.en) if (dist2(o, e) < rr * rr) hit(o, 18 + L * 6); }
      if (L) { G.shake = Math.max(G.shake, .12); tone([140], .08, .06, 'square'); }
    }
    if (lvOf('kiss') && ready('kiss', 1.45 - lvOf('kiss') * .1)) { const L = lvOf('kiss'); for (let i = 0; i < Math.ceil(L / 2) + (L >= 5 ? 1 : 0) + (G.ev.kiss ? 4 : 0); i++) G.pr.push({ x: p.x, y: p.y, vx: (Math.random() - .5) * 200, vy: -160, t: 2.2, dmg: 8 + L * 2.5 + (G.ev.kiss ? 6 : 0) }); }
  }
  function choose() {
    G.lvlup = true; let banMode = false; const pool = Object.keys(WP).filter(k => lvOf(k) < (WP[k].pass ? PMAX : MAXL) && !G.banned.includes(k));
    const opts = []; while (opts.length < 3 && pool.length) opts.push(pool.splice(Math.random() * pool.length | 0, 1)[0]);
    const M = el('div', 'lvl'); M.appendChild(el('h3', null, `레벨 ${G.lv}!`));
    opts.forEach(k => { const w = WP[k], b = el('button', 'up'), i = el('img'); i.src = w.i; i.alt = ''; const t = el('div'); t.append(el('em', null, lvOf(k) ? `LV ${lvOf(k)} → ${lvOf(k) + 1}${lvOf(k) + 1 === MAXL && !w.pass ? ' MAX' : ''}` : 'NEW'), el('b', null, w.n), el('small', null, w.d + (EVO[k] && !w.pass ? ` · 진화: ${WP[EVO[k][0]].n}와 함께` : ''))); b.append(i, t);
      b.onclick = () => { if (banMode) { G.banned.push(k); G.ban--; M.remove(); return choose(); } G.w[k] = lvOf(k) + 1; if (k === 'shoe') G.p.spd *= 1.12; if (k === 'milk') { G.p.mhp += 20; G.p.hp = Math.min(G.p.mhp, G.p.hp + 40); } if (k === 'mag') G.p.mag *= 1.45; M.remove(); G.lvlup = false; last = performance.now(); dtmf(5); };
      M.appendChild(b); });
    if (!opts.length) { const b = btn('체력 회복하기', 'teal wide', () => { G.p.hp = G.p.mhp; M.remove(); G.lvlup = false; last = performance.now(); }); M.appendChild(b); }
    // 다시 뽑기 3번 · 건너뛰기 · 빼기(이번 판에 다시 안 나옴) 2번
    if (opts.length) { const bar = el('div', 'row'); bar.style.gap = '6px';
      const rr = btn(`다시 뽑기 ${G.rr}`, 'ghost', () => { if (G.rr <= 0) return; G.rr--; M.remove(); choose(); }); rr.disabled = G.rr <= 0;
      const ban = btn(`빼기 ${G.ban}`, 'ghost', () => { if (G.ban <= 0) return; banMode = !banMode; ban.textContent = banMode ? '뺄 것 고르기…' : `빼기 ${G.ban}`; }); ban.disabled = G.ban <= 0;
      const sk = btn('건너뛰기', 'ghost', () => { G.xp += Math.round(G.need * .3); M.remove(); G.lvlup = false; last = performance.now(); });
      bar.append(rr, ban, sk); M.appendChild(bar); }
    W.appendChild(M); coinSound();
  }
  // 보물 상자: 진화할 수 있으면 진화, 아니면 가진 것 1~3개 레벨업
  function openChest() {
    G.lvlup = true; const got = [];
    const evo = Object.keys(EVO).find(k => !G.ev[k] && lvOf(k) >= MAXL && lvOf(EVO[k][0]) > 0);
    if (evo) { G.ev[evo] = 1; got.push([WP[evo].i, `진화! ${EVO[evo][1]}`, EVO[evo][2]]); }
    else { const n = Math.random() < .12 ? 5 : Math.random() < .3 ? 3 : 1; for (let i = 0; i < n; i++) { const pool = Object.keys(G.w).filter(k => lvOf(k) < (WP[k].pass ? PMAX : MAXL)); if (!pool.length) { G.bonus += 2; got.push([CUR('gc'), '게임 동전 +2', '더 올릴 게 없어서 동전으로']); continue; } const k = pick(pool); G.w[k] = lvOf(k) + 1; if (k === 'shoe') G.p.spd *= 1.12; if (k === 'milk') G.p.mhp += 20; if (k === 'mag') G.p.mag *= 1.45; got.push([WP[k].i, `${WP[k].n} LV ${lvOf(k)}`, WP[k].d]); } }
    const M = el('div', 'lvl'); M.appendChild(el('h3', null, evo ? '✨ 진화!' : `보물 상자 · ${got.length}개`));
    got.forEach(([im, n, d]) => { const b = el('div', 'up'), i = el('img'); i.src = im; i.alt = ''; const t = el('div'); t.append(el('b', null, n), el('small', null, d)); b.append(i, t); M.appendChild(b); });
    M.appendChild(row(btn('좋아요', 'wide', () => { M.remove(); G.lvlup = false; last = performance.now(); })));
    W.appendChild(M); coinSound(); setTimeout(coinSound, 150); if (got.length > 1 || evo) setTimeout(coinSound, 300);
  }
  function revive() {
    G.lvlup = true; const M = el('div', 'lvl'); M.appendChild(el('h3', null, '쓰러지기 직전!'));
    const tk = el('div', 'talkr'), ti = el('i', $('app').classList.contains('outside') ? '' : 'face'); tk.append(ti, el('span', null, '안 돼요. …딱 한 번, 제가 일으켜 줄게요.')); M.appendChild(tk);
    M.appendChild(row(btn('레나 손 잡고 일어나기', 'teal wide', () => { G.rev = 1; G.p.hp = G.p.mhp * .6; G.p.inv = 2; G.en = G.en.filter(e => dist2(e, G.p) > 260 * 260); G.lvlup = false; M.remove(); last = performance.now(); coinSound(); }), btn('그만하기', 'ghost wide', () => { M.remove(); G.lvlup = false; end(false); })));
    W.appendChild(M);
  }
  function end(win) {
    G.over = true; const t = Math.floor(G.t), reward = Math.max(0, Math.round((Math.floor(G.kills / 30) + Math.floor(t / 60) * 2 + (win && !G.paid ? 10 : 0)) * (1 + .25 * G.asc)) + G.bonus - (G.paidR || 0)); G.paid = G.paid || win; G.paidR = (G.paidR || 0) + reward;
    const M2 = MV(); if (win && G.asc >= M2.ascMax) M2.ascMax = Math.min(9, G.asc + 1); S.svBest = Math.max(S.svBest || 0, t); S.svKill = Math.max(S.svKill || 0, G.kills); save(); if (reward) gcAdd(reward);
    const M = el('div', 'lvl'); M.appendChild(el('h3', null, win ? '새벽이 왔어요!' : '쓰러졌어요…'));
    const s = el('div', 'rules'); s.innerHTML = `버틴 시간 <b>${Math.floor(t / 60)}:${String(t % 60).padStart(2, '0')}</b> · 처치 <b>${G.kills}</b> · 레벨 <b>${G.lv}</b><br>${ci('gc')}게임 동전 <b>+${reward}</b>${win && G.asc + 1 === MV().ascMax ? `<br>🔓 밤 ${G.asc + 2} 열림!` : ''}`; M.appendChild(s);
    const tk = el('div', 'talkr'), ti = el('i', $('app').classList.contains('outside') ? '' : 'face'); tk.append(ti, el('span', null, win ? '진짜 버텼어요? …멋있다. 오늘은 제가 반했어요.' : pick(['괜찮아요, 고양이는 무사해요. 다시 해요.', '해골들이 너무 많았죠. 다음엔 레이저부터 챙겨요.'])));
    M.appendChild(tk); if (win && !G.endless) M.appendChild(row(btn('계속 버티기 (끝없는 밤)', 'teal wide', () => { M.remove(); G.over = false; G.endless = true; G.nb = G.t + 60; last = performance.now(); }))); M.appendChild(row(btn('처음 화면', 'wide', intro), btn('바로 다시', 'ghost wide', play)));
    W.appendChild(M); win ? (coinSound(), setTimeout(coinSound, 200)) : tone([220, 160], .5, .08, 'triangle');
  }
  function step(dt) {
    const p = G.p; G.t += dt;
    // 이동
    let mx = (keys.ArrowRight || keys.d ? 1 : 0) - (keys.ArrowLeft || keys.a ? 1 : 0), my = (keys.ArrowDown || keys.s ? 1 : 0) - (keys.ArrowUp || keys.w ? 1 : 0);
    if (J.on) { const dx = J.x - J.ox, dy = J.y - J.oy, d = Math.hypot(dx, dy); if (d > 6) { mx = dx / Math.max(d, 50); my = dy / Math.max(d, 50); } }
    const m = Math.hypot(mx, my); if (m > 1) { mx /= m; my /= m; }
    p.x += mx * p.spd * dt; p.y += my * p.spd * dt; if (Math.abs(mx) > .1) p.face = mx > 0 ? 1 : -1;
    p.inv = Math.max(0, p.inv - dt); p.hp = Math.min(p.mhp, p.hp + dt * (.5 + .5 * lvOf('milk')));
    // 등장
    G.spawn += dt * (0.7 + G.t / 42) * (1 + .12 * G.asc);
    if (G.t >= G.elite) { G.elite += 60; for (let i = 0; i < 14; i++) spawn('ghost'); spawn('hand'); const el2 = G.en[G.en.length - 1]; el2.hp *= 6; el2.mhp = el2.hp; el2.s *= 1.5; el2.r *= 1.4; el2.elite = 1; G.shake = .25; tone([110], .3, .08, 'sawtooth'); }
    while (G.spawn > 1 && G.en.length < 230) { G.spawn--; const r = Math.random(); spawn(G.t > 90 && r < .28 ? 'hand' : G.t > 45 && r < .55 ? 'bat' : 'ghost'); }
    if (G.boss.length && G.t >= G.boss[0]) { G.boss.shift(); spawn('boss'); G.shake = .4; tone([70, 90], .6, .1, 'sawtooth'); }
    // 가로등(부수면 아이템)
    G.lampT -= dt; if (G.lampT <= 0) { G.lampT = 11 + Math.random() * 6; if (G.en.filter(e => e.type === 'lamp').length < 5) { const a = Math.random() * 7, d = 140 + Math.random() * 120; G.en.push({ type: 'lamp', x: p.x + Math.cos(a) * d, y: p.y + Math.sin(a) * d, hp: 1, mhp: 1, spd: 0, dmg: 0, r: 14, s: 60, xp: 0, ph: 0, flash: 0 }); } }
    for (const c of G.chests) if (dist2(c, p) < 30 * 30) { c.got = true; openChest(); }
    G.chests = G.chests.filter(c => !c.got);
    for (const it of G.items) if (dist2(it, p) < 26 * 26) { it.got = true; coinSound();
      if (it.k === 'cake') p.hp = Math.min(p.mhp, p.hp + p.mhp * .3);
      if (it.k === 'gcoin') G.bonus += 2;
      if (it.k === 'watch') G.freeze = G.t + 10;
      if (it.k === 'key') G.gems.forEach(g => g.vac = 1);
      if (it.k === 'bolt') { G.shake = .4; G.fx.push({ k: 'flash', t: .3 }); for (const e of G.en) if (e.type !== 'lamp' && Math.abs(e.x - p.x) < vw / 2 + 40 && Math.abs(e.y - p.y) < vh / 2 + 40) hit(e, e.type === 'boss' ? 120 : 9999); }
      G.nums.push({ x: p.x, y: p.y - 40, v: PICK[it.k][0], t: 1 }); }
    G.items = G.items.filter(i => !i.got);
    if (G.lvlup) return;
    // 적
    const frz = G.freeze > G.t;
    for (const e of G.en) { if (e.type === 'lamp') continue; if (frz) { e.flash = Math.max(0, e.flash - dt); if (!p.inv && dist2(e, p) < (e.r + 16) ** 2) { /* 얼어 있어도 닿으면 아픔은 없음 */ } continue; } const a = Math.atan2(p.y - e.y, p.x - e.x); let sp = e.spd; if (e.type === 'bat') { e.ph += dt * 6; e.x += Math.cos(a + Math.sin(e.ph) * .9) * sp * dt; e.y += Math.sin(a + Math.sin(e.ph) * .9) * sp * dt; } else { e.x += Math.cos(a) * sp * dt; e.y += Math.sin(a) * sp * dt; }
      e.flash = Math.max(0, e.flash - dt);
      if (!p.inv && dist2(e, p) < (e.r + 16) ** 2) { p.hp -= e.dmg; p.inv = .55; G.shake = .2; tone([160], .08, .08, 'square'); if (p.hp <= 0) { p.hp = 0; return G.rev ? (G.revs > 0 ? (G.revs--, G.p.hp = G.p.mhp * .5, G.p.inv = 2, G.en = G.en.filter(e => dist2(e, G.p) > 260 * 260), coinSound(), undefined) : end(false)) : revive(); } } }
    // 서로 밀어내기(가볍게)
    for (let i = 0; i < G.en.length; i += 2) { const a = G.en[i], b = G.en[i + 1]; if (!b) break; if (a.type === 'lamp' || b.type === 'lamp') continue; const d = Math.sqrt(dist2(a, b)) || 1, o = a.r + b.r - d; if (o > 0) { const ux = (a.x - b.x) / d, uy = (a.y - b.y) / d; a.x += ux * o / 2; a.y += uy * o / 2; b.x -= ux * o / 2; b.y -= uy * o / 2; } }
    weapons(dt);
    // 키스 미사일
    for (const k of G.pr) { const tg = nearest(500); if (tg) { const a = Math.atan2(tg.y - k.y, tg.x - k.x); k.vx += Math.cos(a) * 900 * dt; k.vy += Math.sin(a) * 900 * dt; } const s = Math.hypot(k.vx, k.vy), mx2 = 330; if (s > mx2) { k.vx *= mx2 / s; k.vy *= mx2 / s; } k.x += k.vx * dt; k.y += k.vy * dt; k.t -= dt;
      for (const e of G.en) if (!e.dead && dist2(e, k) < (e.r + 10) ** 2) { hit(e, k.dmg); k.t = 0; break; } }
    G.pr = G.pr.filter(k => k.t > 0);
    G.en = G.en.filter(e => !e.dead && Math.abs(e.x - p.x) < vw + 400 && Math.abs(e.y - p.y) < vh + 400);
    // 보석
    for (const g of G.gems) { const d2 = dist2(g, p); if (g.vac || d2 < p.mag * p.mag) { const d = Math.sqrt(d2) || 1; const sp = g.vac ? 900 : 420; g.x += (p.x - g.x) / d * sp * dt; g.y += (p.y - g.y) / d * sp * dt; } if (d2 < 22 * 22) { g.got = true; if (g.h) p.hp = Math.min(p.mhp, p.hp + 20); G.xp += g.v; tone([1500 + Math.random() * 300], .03, .02); } }
    G.gems = G.gems.filter(g => !g.got && (g.vac || dist2(g, p) < 1600 * 1600)); if (G.gems.length > 300) G.gems.splice(0, G.gems.length - 300);
    if (G.xp >= G.need) { G.xp -= G.need; G.lv++; G.need = Math.round(6 + G.lv * 4.5); choose(); }
    if (G.later && G.later.length) { const due = G.later.filter(x => x.at <= G.t); G.later = G.later.filter(x => x.at > G.t); due.forEach(x => x.f()); }
    G.fx.forEach(f => f.t -= dt); G.fx = G.fx.filter(f => f.t > 0); G.nums.forEach(n => { n.t -= dt; n.y -= 40 * dt; }); G.nums = G.nums.filter(n => n.t > 0); G.shake = Math.max(0, G.shake - dt);
    if (G.t >= 300 && !G.endless) end(true);
    if (G.endless && G.t >= G.nb) { G.nb += 120; spawn('boss'); G.shake = .4; }
  }
  function draw() {
    const p = G.p; if (Math.abs(cv.clientWidth - vw) > 1 || Math.abs(cv.clientHeight - vh) > 1) fit(); ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const sx = G.shake ? (Math.random() - .5) * 10 * G.shake / .2 : 0, sy = G.shake ? (Math.random() - .5) * 10 * G.shake / .2 : 0;
    const cx = p.x - vw / 2 + sx, cy = p.y - vh / 2 + sy, tile = IM.tile;
    if (tile.complete && tile.naturalWidth) { const ts = 256, ox = -((cx % ts) + ts) % ts, oy = -((cy % ts) + ts) % ts; for (let x = ox; x < vw; x += ts) for (let y = oy; y < vh; y += ts) ctx.drawImage(tile, x, y, ts, ts); } else { ctx.fillStyle = '#141a1f'; ctx.fillRect(0, 0, vw, vh); }
    const S2 = (im, x, y, s, flip, a) => { const i = IM[im]; if (!i || !i.complete || !i.naturalWidth) return; const h = s, w = s * i.naturalWidth / i.naturalHeight; ctx.save(); ctx.translate(x - cx, y - cy); if (flip) ctx.scale(-1, 1); if (a != null) ctx.globalAlpha = a; ctx.drawImage(i, -w / 2, -h / 2, w, h); ctx.restore(); };
    for (const g of G.gems) S2(g.h ? 's_heart' : g.v >= 5 ? 'i_gemr' : g.v >= 2 ? 'i_gemg' : 'i_gemb', g.x, g.y, g.h ? 22 : g.v >= 5 ? 22 : g.v >= 2 ? 19 : 16);
    for (const it of G.items) { const by = Math.sin(G.t * 5 + it.x) * 3; ctx.save(); ctx.shadowColor = '#fff'; ctx.shadowBlur = 10; S2(it.k, it.x, it.y + by, it.k === 'gcoin' ? 24 : 30); ctx.restore(); }
    for (const c of G.chests) { ctx.save(); ctx.shadowColor = '#f2ea3a'; ctx.shadowBlur = 16 + Math.sin(G.t * 8) * 6; S2('i_chest', c.x, c.y + Math.sin(G.t * 4) * 2, 40); ctx.restore(); }
    // 그림자 + 적
    ctx.fillStyle = 'rgba(0,0,0,.35)'; for (const e of G.en) { ctx.beginPath(); ctx.ellipse(e.x - cx, e.y - cy + e.s * .42, e.r * .9, e.r * .3, 0, 0, 7); ctx.fill(); }
    for (const e of G.en) { if (e.type === 'lamp') { ctx.save(); ctx.shadowColor = '#ff3d9a'; ctx.shadowBlur = 18 + Math.sin(G.t * 9 + e.x) * 6; S2('i_lamp', e.x, e.y - 6, 54, false, e.flash ? .6 : 1); ctx.restore(); continue; }
      S2(e.im, e.x, e.y, e.s, e.x > p.x, e.flash ? .55 : 1); if (e.type === 'boss') { ctx.fillStyle = '#000'; ctx.fillRect(e.x - cx - 40, e.y - cy - 76, 80, 7); ctx.fillStyle = '#ff2e6e'; ctx.fillRect(e.x - cx - 39, e.y - cy - 75, 78 * Math.max(0, e.hp / e.mhp), 5); } }
    // 하트 실드
    if (lvOf('heart')) { const L = lvOf('heart'), n = G.ev.heart ? 8 : Math.min(6, 1 + L), R = (64 + L * 5) * (G.ev.heart ? 1.3 : 1); for (let i = 0; i < n; i++) { const a = G.ha + i * Math.PI * 2 / n; S2('s_heart', p.x + Math.cos(a) * R, p.y + Math.sin(a) * R, 26); } }
    for (const k of G.pr) S2('lips', k.x, k.y, 24);
    // 효과
    for (const f of G.fx) { ctx.save(); ctx.globalAlpha = Math.min(1, f.t * 6);
      if (f.k === 'whip') { // 채찍: 고양이 쪽은 옅게 시작해 멀리 갈수록 밝아지고, 끝이 깃털처럼 여러 갈래로 퍼지는 하늘색 붓질
        const age = f.t0 - f.t, rev = Math.min(1, age / .06), fade = Math.min(1, f.t / (f.t0 * .6)), sd = f.sd, x0 = f.x - cx + sd * 14, y0 = f.y - cy - 8, L = f.len * rev, th = f.ev ? 13 : 9;
        const C1 = f.ev ? '255,120,170' : '120,235,255', C2 = f.ev ? '255,210,230' : '225,252,255';
        ctx.globalAlpha = fade; ctx.lineCap = 'round';
        // 몸통: 뒤는 가늘고 투명, 앞으로 갈수록 두껍고 밝게
        const g = ctx.createLinearGradient(x0, 0, x0 + sd * L, 0); g.addColorStop(0, `rgba(${C1},0)`); g.addColorStop(.45, `rgba(${C1},.55)`); g.addColorStop(.8, `rgba(${C2},.95)`); g.addColorStop(1, `rgba(${C2},.2)`);
        ctx.fillStyle = g; ctx.shadowColor = `rgba(${C1},.9)`; ctx.shadowBlur = 14; ctx.beginPath();
        const N = 20, top = [], bot = [];
        for (let i = 0; i <= N; i++) { const u = i / N, w = th * Math.pow(u, .9) * (u > .82 ? (1 - u) / .18 : 1) + 1, yy = y0 + Math.sin(u * 5 + f.ph) * 2.2; top.push([x0 + sd * L * u, yy - w]); bot.push([x0 + sd * L * u, yy + w * .8]); }
        ctx.moveTo(...top[0]); top.forEach(p => ctx.lineTo(...p)); bot.reverse().forEach(p => ctx.lineTo(...p)); ctx.closePath(); ctx.fill(); ctx.shadowBlur = 0;
        // 깃털 갈래: 앞쪽 끝에서 여러 가닥이 살짝 퍼짐
        for (let j = 0; j < 7; j++) { const off = (j - 3) * (th * .55), u0 = .35 + (j % 3) * .08, len = .62 + (j * 37 % 10) / 40, spread = off * 1.4;
          const gx = ctx.createLinearGradient(x0 + sd * L * u0, 0, x0 + sd * L * Math.min(1.08, u0 + len), 0); gx.addColorStop(0, `rgba(${C2},0)`); gx.addColorStop(.6, `rgba(${C2},.75)`); gx.addColorStop(1, `rgba(${C1},0)`);
          ctx.strokeStyle = gx; ctx.lineWidth = 1 + (3 - Math.abs(j - 3)) * .6; ctx.beginPath(); ctx.moveTo(x0 + sd * L * u0, y0 + off * .35);
          ctx.quadraticCurveTo(x0 + sd * L * (u0 + len * .6), y0 + off * .5, x0 + sd * L * Math.min(1.08, u0 + len), y0 + spread); ctx.stroke(); }
        // 가운데 하얀 심
        ctx.strokeStyle = 'rgba(255,255,255,.9)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x0 + sd * L * .4, y0); ctx.lineTo(x0 + sd * L * .93, y0 - 1); ctx.stroke(); }
      if (f.k === 'frz') {}
      if (f.k === 'flash') { ctx.globalAlpha = f.t / .3 * .8; ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, vw, vh); }
      if (f.k === 'laser') { ctx.strokeStyle = '#ff3d9a'; ctx.lineWidth = 9; ctx.shadowColor = '#ff3d9a'; ctx.shadowBlur = 16; ctx.beginPath(); ctx.moveTo(f.x - cx, f.y - cy - 14); ctx.lineTo(f.ex - cx, f.ey - cy); ctx.stroke(); ctx.strokeStyle = '#fff'; ctx.lineWidth = 3; ctx.stroke(); }
      if (f.k === 'bolt') { ctx.strokeStyle = '#f2ea3a'; ctx.lineWidth = 5; ctx.shadowColor = '#f2ea3a'; ctx.shadowBlur = 14; ctx.beginPath(); let x = f.x - cx + (Math.random() - .5) * 20, y = f.y - cy - 260; ctx.moveTo(x, y); while (y < f.y - cy) { y += 30; x += (Math.random() - .5) * 34; ctx.lineTo(x, Math.min(y, f.y - cy)); } ctx.stroke(); ctx.beginPath(); ctx.arc(f.x - cx, f.y - cy, 46 * (1 - f.t * 2), 0, 7); ctx.strokeStyle = 'rgba(242,234,58,.7)'; ctx.lineWidth = 3; ctx.stroke(); }
      ctx.restore(); }
    if (G.freeze > G.t) { ctx.fillStyle = 'rgba(120,200,255,.13)'; ctx.fillRect(0, 0, vw, vh); }
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
    const t = Math.floor(G.t); $('svT').textContent = `${Math.floor(t / 60)}:${String(t % 60).padStart(2, '0')}${G.endless ? ' · 끝없는 밤' : ' / 5:00'}`; $('svK').textContent = `LV${G.lv} · ${G.kills}`;
  }
  function loop(now) {
    if (!G) return; const dt = Math.min(.05, (now - last) / 1000); last = now;
    if (!G.paused && !G.lvlup && !G.over) step(dt);
    if (G) draw(); raf = requestAnimationFrame(loop);
  }
  raf = requestAnimationFrame(loop);
}

ARC.reg({ id: 'surv', order: 1, name: '빗속의 고양이', ban: 'surv', icon: gimg('s_cat'), color: '#ff3d9a', sub: () => `밤 ${(MV().ascMax || 0) + 1}단계까지 열림 · 최고 ${S.svBest ? Math.floor(S.svBest / 60) + '분 ' + S.svBest % 60 + '초' : '-'}`, start: intro });
})();
