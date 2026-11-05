// 레나 — SNAKE EYES (오락실): 주사위를 장비 칸에 끼워 해골과 싸우는 로그라이크. 계산 코어는 Node에서 봇으로 돌린다.
'use strict';
(() => {
// 장비: c 조건(any|max n|min n|even|odd|eq n), u 한 턴 쓰는 횟수(기본 1), f(d, me, foe, up) → 결과 {dmg, blk, heal, poi, frz, ret:[주사위]}
const EQ = {
  sword: { n: '접이식 칼', c: ['any'], d: '피해 □', f: (d, u) => ({ dmg: d + u * 2 }) },
  dagger: { n: '네일 단검', c: ['max', 3], u: 3, d: '피해 □+1 · 한 턴 3번', f: (d, u) => ({ dmg: d + 1 + u }) },
  hammer: { n: '공구 망치', c: ['min', 5], d: '피해 □×2', f: (d, u) => ({ dmg: d * 2 + u * 3 }) },
  spear: { n: '우산 끝', c: ['even'], d: '피해 □+3', f: (d, u) => ({ dmg: d + 3 + u * 2 }) },
  lucky: { n: '행운의 동전', c: ['eq', 6], d: '피해 15', f: (d, u) => ({ dmg: 15 + u * 5 }) },
  kiss: { n: '레나의 키스', c: ['odd'], d: '피해 □ · 회복 2', f: (d, u) => ({ dmg: d + u, heal: 2 + u }) },
  shield: { n: '전화번호부', c: ['any'], d: '막기 □', f: (d, u) => ({ blk: d + u * 2 }) },
  door: { n: '부스 문', c: ['min', 4], d: '막기 □×2', f: (d, u) => ({ blk: d * 2 + u * 2 }) },
  band: { n: '반창고', c: ['max', 3], d: '회복 □', f: (d, u) => ({ heal: d + u * 2 }) },
  needle: { n: '독 바늘', c: ['any'], d: '독 □ (턴마다 피해)', f: (d, u) => ({ poi: Math.ceil(d / 2) + 1 + u }) },
  frost: { n: '얼음 사탕', c: ['min', 4], d: '상대 다음 주사위 하나를 1로', f: (d, u) => ({ frz: 1 + u }) },
  bump: { n: '동전 넣기', c: ['max', 5], u: 2, d: '□+1 주사위로 돌려받음', f: (d, u) => ({ ret: [Math.min(6, d + 1 + u)] }) },
  flip: { n: '거꾸로 다이얼', c: ['any'], d: '7−□ 주사위로', f: d => ({ ret: [7 - d] }) },
  split: { n: '반으로 찢기', c: ['min', 2], d: '주사위 둘로 나눔', f: d => ({ ret: [Math.floor(d / 2), Math.ceil(d / 2)] }) },
  reroll: { n: '다시 걸기', c: ['any'], u: 2, d: '새로 굴림 · 한 턴 2번', f: (d, u, R) => ({ ret: [1 + Math.floor(R() * 6)] }) },
  mirror: { n: '되받아치기', c: ['any'], d: '막기 □ · 피해 □/2', f: (d, u) => ({ blk: d, dmg: Math.ceil(d / 2) + u }) },
  // 적 전용
  bite: { n: '물기', c: ['any'], d: '피해 □', f: d => ({ dmg: d }) },
  claw: { n: '할퀴기', c: ['max', 4], u: 2, d: '피해 □+1', f: d => ({ dmg: d + 1 }) },
  crush: { n: '짓밟기', c: ['min', 5], d: '피해 □×2', f: d => ({ dmg: d * 2 }) },
  bone: { n: '뼈 방패', c: ['any'], d: '막기 □', f: d => ({ blk: d }) },
  rot: { n: '썩은 숨', c: ['odd'], d: '독 □', f: d => ({ poi: d }) },
  chill: { n: '찬바람', c: ['eq', 6], d: '내 다음 주사위 하나를 1로', f: () => ({ frz: 1 }) },
  ledger: { n: '빚 장부', c: ['even'], d: '피해 □+4', f: d => ({ dmg: d + 4 }) }
};
const POOL = ['sword', 'dagger', 'hammer', 'spear', 'lucky', 'kiss', 'shield', 'door', 'band', 'needle', 'frost', 'bump', 'flip', 'split', 'reroll', 'mirror'];
const FOES = [
  [{ n: '쥐 해골', hp: 14, dice: 2, eq: ['bite', 'bone'] }, { n: '깡통 해골', hp: 16, dice: 2, eq: ['claw', 'bone'] }],
  [{ n: '우산 도둑', hp: 19, dice: 2, eq: ['claw', 'bite'] }, { n: '빗물 유령', hp: 17, dice: 3, eq: ['rot', 'bone'] }],
  [{ n: '빚쟁이 해골', hp: 30, dice: 3, eq: ['ledger', 'bone', 'bite'] }, { n: '고장 난 자판기', hp: 34, dice: 3, eq: ['crush', 'bone', 'claw'] }],
  [{ n: '네온 해골', hp: 38, dice: 3, eq: ['crush', 'rot', 'claw'] }, { n: '얼음 해골', hp: 36, dice: 3, eq: ['chill', 'ledger', 'bone'] }],
  [{ n: '해골 경비', hp: 48, dice: 4, eq: ['crush', 'bone', 'ledger', 'claw'] }, { n: '쌍둥이 해골', hp: 44, dice: 4, eq: ['claw', 'claw', 'rot', 'bone'] }],
  [{ n: '해골 사장', hp: 60, dice: 4, eq: ['crush', 'ledger', 'chill', 'bone', 'rot'], boss: 1 }]
];
const ok = (c, d) => c[0] === 'any' || (c[0] === 'max' && d <= c[1]) || (c[0] === 'min' && d >= c[1]) || (c[0] === 'even' && d % 2 === 0) || (c[0] === 'odd' && d % 2) || (c[0] === 'eq' && d === c[1]);
const condTxt = c => c[0] === 'any' ? '' : c[0] === 'max' ? `${c[1]} 이하` : c[0] === 'min' ? `${c[1]} 이상` : c[0] === 'even' ? '짝수' : c[0] === 'odd' ? '홀수' : `${c[1]}만`;
const slot = (id, up = 0) => ({ id, up, used: 0 });

function newRun(R = Math.random) { return { R, hp: 30, max: 30, lv: 1, dice: 3, eq: [slot('sword'), slot('shield'), slot('dagger')], fl: 0, win: 0, ph: 'map', foe: null, log: [] }; }
function roll(R, n, frz) { const a = Array.from({ length: n }, () => 1 + Math.floor(R() * 6)); for (let i = 0; i < Math.min(frz || 0, n); i++) { let m = 0; a.forEach((v, j) => { if (v > a[m]) m = j; }); a[m] = 1; } return a; }
function startFight(run) {
  const f = FOES[run.fl][Math.floor(run.R() * FOES[run.fl].length)];
  run.foe = { ...f, hp: f.hp, max: f.hp, eq: f.eq.map(id => slot(id)), blk: 0, poi: 0, frz: 0 };
  run.me = { blk: 0, poi: 0, frz: 0 }; run.turn = 0; run.ph = 'fight'; myTurn(run);
}
function tickStart(side) { side.blk = 0; if (side.poi > 0) { side.hpLoss = side.poi; side.poi--; } else side.hpLoss = 0; }
function myTurn(run) { run.turn++; tickStart(run.me); run.hp -= run.me.hpLoss; run.eq.forEach(e => { e.used = 0; }); run.hand = roll(run.R, run.dice, run.me.frz); run.me.frz = 0; if (run.hp <= 0) run.ph = 'over'; }
// 주사위 i를 장비 k에 끼우기
function use(run, side, i, k) {
  const isMe = side === 'me', hand = isMe ? run.hand : run.foe.hand, eqs = isMe ? run.eq : run.foe.eq, s = eqs[k], E = EQ[s.id], d = hand[i];
  if (d == null || !s || s.used >= (E.u || 1) || !ok(E.c, d)) return null;
  const r = E.f(d, s.up, run.R); s.used++; hand.splice(i, 1);
  const me = isMe ? run.me : run.foe, foe = isMe ? run.foe : run.me;
  if (r.dmg) { const b = Math.min(foe.blk, r.dmg); foe.blk -= b; const dmg = r.dmg - b; if (isMe) run.foe.hp -= dmg; else run.hp -= dmg; r.real = dmg; }
  if (r.blk) me.blk += r.blk;
  if (r.heal) { if (isMe) run.hp = Math.min(run.max, run.hp + r.heal); else run.foe.hp = Math.min(run.foe.max, run.foe.hp + r.heal); }
  if (r.poi) foe.poi += r.poi;
  if (r.frz) foe.frz += r.frz;
  if (r.ret) hand.push(...r.ret);
  if (run.foe.hp <= 0) win(run); else if (run.hp <= 0) run.ph = 'over';
  return r;
}
// 간단한 AI: 높은 주사위부터 가장 이득이 큰 칸에 (적 · 봇 공용)
function best(run, side) {
  const isMe = side === 'me', hand = isMe ? run.hand : run.foe.hand, eqs = isMe ? run.eq : run.foe.eq; let b = null;
  hand.forEach((d, i) => eqs.forEach((s, k) => { const E = EQ[s.id]; if (s.used >= (E.u || 1) || !ok(E.c, d)) return; const r = E.f(d, s.up, () => .5);
    const hpR = isMe ? run.hp / run.max : run.foe.hp / run.foe.max, foeHp = isMe ? run.foe.hp : run.hp;
    let v = (r.dmg || 0) * (r.dmg >= foeHp ? 3 : 1) + (r.blk || 0) * (hpR < .5 ? .9 : .5) + (r.heal || 0) * (hpR < .6 ? 1 : .2) + (r.poi || 0) * 1.6 + (r.frz || 0) * 3;
    if (r.ret) v = r.ret.reduce((a, x) => a + x, 0) - d + .5 + (r.ret.length > 1 ? 2 : 0);
    if (v > 0 && (!b || v > b.v)) b = { i, k, v }; }));
  return b;
}
function foeTurn(run) {
  const f = run.foe; tickStart(f); f.hp -= f.hpLoss; if (f.hp <= 0) { win(run); return []; }
  f.eq.forEach(e => { e.used = 0; }); f.hand = roll(run.R, f.dice, f.frz); f.frz = 0;
  const acts = []; let g = 0, b; while ((b = best(run, 'foe')) && g++ < 12) { const d = f.hand[b.i], s = f.eq[b.k].id, r = use(run, 'foe', b.i, b.k); acts.push({ d, s, r }); if (run.ph !== 'fight') break; }
  return acts;
}
function win(run) { run.ph = 'reward'; run.fl++; run.lv++; run.max += 4; run.hp = Math.min(run.max, run.hp + 6); if (run.lv === 3 || run.lv === 5) run.dice++; if (run.fl >= FOES.length) run.ph = 'win'; else run.offer = offers(run); }
function offers(run) { const own = run.eq.map(e => e.id), a = POOL.filter(id => !own.includes(id)).sort(() => run.R() - .5).slice(0, 2).map(id => ({ t: 'new', id })); const up = run.eq.filter(e => e.up < 2); if (up.length) a.push({ t: 'up', k: run.eq.indexOf(up[Math.floor(run.R() * up.length)]) }); a.push({ t: 'rest' }); return a; }
function take(run, i, swap) { const o = run.offer[i]; if (o.t === 'new') { if (run.eq.length < 6) run.eq.push(slot(o.id)); else if (swap != null) run.eq[swap] = slot(o.id); } else if (o.t === 'up') run.eq[o.k].up++; else run.hp = Math.min(run.max, run.hp + Math.ceil(run.max * .4)); run.offer = null; run.ph = 'map'; }
const DICE = { EQ, POOL, FOES, ok, condTxt, newRun, startFight, myTurn, use, best, foeTurn, take };
if (typeof module !== 'undefined') module.exports = DICE;
if (typeof window === 'undefined' || !window.ARC) return;

// ---------- 화면 ----------
const { frame, talk, gcAdd, gc } = window.ARC;
const NAME = 'SNAKE EYES', COST = 3;
const css = `
.se-foe{display:flex;align-items:center;gap:12px;padding:12px;border:2px solid #000;border-radius:6px;background:linear-gradient(160deg,#2a1420,#14090f);box-shadow:4px 4px 0 var(--hot)}
.se-foe img{width:64px;height:64px;flex:none;filter:drop-shadow(2px 3px 0 #000)}.se-foe.hit img{animation:sehit .3s}@keyframes sehit{30%{transform:translateX(-6px) rotate(-6deg);filter:brightness(2)}}
.se-foe .t{flex:1;min-width:0}.se-foe b{font-family:'Black Han Sans';font-weight:400;font-size:19px}
.se-bar{position:relative;height:16px;margin-top:5px;border:2px solid #000;border-radius:8px;background:#111;overflow:hidden}.se-bar u{display:block;height:100%;background:var(--hot);transition:width .3s}.se-bar.me u{background:var(--teal)}
.se-bar span{position:absolute;inset:0;font:700 11px 'Space Mono',monospace;color:#fff;text-align:center;line-height:13px;text-shadow:1px 1px 0 #000}
.se-st{display:flex;gap:6px;flex-wrap:wrap;margin-top:5px;font-size:12px;font-weight:800}.se-st i{font-style:normal;padding:1px 7px;border-radius:9px;border:1.5px solid #000;background:#fff;color:#111}.se-st .p{background:#8cff5a}.se-st .b{background:#bfe8ff}.se-st .f{background:#e0f4ff}
.se-feq{display:flex;gap:5px;flex-wrap:wrap;margin-top:6px}.se-feq span{font-size:11px;padding:2px 6px;border-radius:6px;background:rgba(255,255,255,.1);border:1px solid rgba(255,255,255,.2)}
.se-hand{display:flex;justify-content:center;gap:10px;flex-wrap:wrap;min-height:64px;padding:8px;border-radius:10px;background:rgba(0,0,0,.4);border:1px dashed var(--line)}
.se-d{width:54px;height:54px;border-radius:12px;border:3px solid #000;background:#f3efe6;box-shadow:0 4px 0 #000;display:grid;grid-template:repeat(3,1fr)/repeat(3,1fr);padding:7px;gap:2px;animation:seroll .45s cubic-bezier(.2,1.5,.4,1) backwards}
.se-d i{border-radius:50%;background:transparent}.se-d i.on{background:#111}.se-d.six i.on,.se-d.one i.on{background:var(--hot)}
.se-d.sel{transform:translateY(-8px);box-shadow:0 10px 0 var(--pink);border-color:var(--pink)}
@keyframes seroll{0%{transform:rotate(-200deg) scale(.3);opacity:0}}
.se-eq{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:9px}
.se-e{position:relative;min-height:86px;padding:9px 9px 8px;border:2px solid #000;border-radius:6px;background:url(assets/lena/paper_white.webp) center/cover,#f3efe6;color:#111;text-align:left;box-shadow:3px 3px 0 var(--teal)}
.se-e b{display:block;font-size:14px}.se-e small{display:block;font-size:12px;opacity:.8;word-break:keep-all}.se-e .slotb{position:absolute;right:8px;bottom:8px;width:30px;height:30px;border:2.5px dashed #555;border-radius:8px;display:grid;place-items:center;font:700 10px 'Space Mono',monospace;color:#555}
.se-e em{font-style:normal;display:inline-block;margin-top:3px;font-size:11px;font-weight:800;padding:0 6px;border-radius:7px;background:#111;color:#fff}
.se-e.can{box-shadow:3px 3px 0 var(--pink);outline:3px solid var(--yel)}.se-e.done{opacity:.45;filter:grayscale(.8)}
.se-e.up{background-image:url(assets/lena/paper_yellow.webp)}
.se-log{min-height:40px;font-size:13px;line-height:1.5;color:#cfd8dc;text-align:center}
.se-pop{position:fixed;z-index:60;left:50%;top:30%;transform:translateX(-50%);font-family:'Black Han Sans';font-size:44px;color:#fff36b;-webkit-text-stroke:2px #000;text-shadow:4px 4px 0 #000;pointer-events:none;animation:sepop .8s forwards}.se-pop.r{color:#ff2e6e}.se-pop.b{color:#bfe8ff}
@keyframes sepop{0%{transform:translate(-50%,10px) scale(.4)}25%{transform:translate(-50%,0) scale(1.2)}45%{transform:translate(-50%,0) scale(1)}100%{transform:translate(-50%,-30px);opacity:0}}
.se-map{display:flex;justify-content:space-between;gap:4px}.se-map i{flex:1;height:10px;border-radius:5px;border:2px solid #000;background:#2a2d33}.se-map i.on{background:var(--teal)}.se-map i.now{background:var(--yel)}.se-map i.boss{background:#5a1030}
`;
document.head.appendChild(Object.assign(document.createElement('style'), { textContent: css }));
const PIPS = { 1: [4], 2: [0, 8], 3: [0, 4, 8], 4: [0, 2, 6, 8], 5: [0, 2, 4, 6, 8], 6: [0, 2, 3, 5, 6, 8] };
function die(v) { const d = el('div', 'se-d' + (v === 6 ? ' six' : v === 1 ? ' one' : '')); for (let i = 0; i < 9; i++) d.appendChild(el('i', PIPS[v].includes(i) ? 'on' : '')); return d; }
const meta = () => (S.dice = S.dice || { best: 0, wins: 0 });
let run = null, sel = null, busy = false, msg = '';
function pop(t, c) { const p = el('div', 'se-pop' + (c ? ' ' + c : ''), t); document.body.appendChild(p); setTimeout(() => p.remove(), 820); }
function lobby() {
  frame(NAME, B => {
    const M = meta(), nm = el('div', 'bp-name'); nm.innerHTML = `${NAME}<small>주사위 끼워 해골과 싸우기</small>`; B.appendChild(nm);
    talk(B, 'l', '주사위는 제가 굴려 줄게요. 어디에 끼울지는 송휘님 몫. …6 나오면 저 보고 웃어요.');
    const P = el('div', 'bp-panel'); P.appendChild(el('h4', null, '하는 법'));
    P.appendChild(el('div', 'hint', '내 차례마다 주사위를 굴려요. 주사위를 누르고 → 장비 칸을 누르면 끼워져요(칸마다 조건: 짝수만·4 이상 등). 다 쓰면 "차례 끝". 해골도 주사위와 장비가 보여요. 6층을 내려가 해골 사장을 이기면 끝. 이길 때마다 새 장비·강화·쉬기 중 하나.'));
    B.appendChild(P);
    if (S.dice2 && S.dice2.ph !== 'over' && S.dice2.ph !== 'win') { const c = el('div', 'bp-row'); c.appendChild(btn(`이어하기 (${S.dice2.fl + 1}층)`, 'teal wide', () => { run = { ...S.dice2, R: Math.random }; draw(); })); B.appendChild(c); }
    const r = el('div', 'bp-row'), g = el('button', 'bp-go'); g.innerHTML = `새로 시작<small>게임 동전 ${COST} · 최고 ${M.best}층 · 클리어 ${M.wins}번</small>`;
    g.onclick = () => { if (gc() < COST) { toast(`게임 동전이 모자라요. (${COST}개)`); return; } gcAdd(-COST); coinSound(); run = newRun(); persist(); draw(); }; r.appendChild(g); B.appendChild(r);
  }, true);
}
function persist() { const c = { ...run }; delete c.R; S.dice2 = c; save(); }
function draw() {
  if (run.ph === 'map') return mapUI();
  if (run.ph === 'reward') return rewardUI();
  if (run.ph === 'over' || run.ph === 'win') return endUI();
  frame(NAME, B => {
    const f = run.foe, F = el('div', 'se-foe'), im = el('img'); im.src = 'assets/lena/st_skull.webp'; im.alt = ''; if (f.boss) im.style.filter = 'drop-shadow(0 0 8px #ff3d9a) drop-shadow(2px 3px 0 #000)'; F.id = 'sefoe';
    const t = el('div', 't'); t.append(el('b', null, `${f.n}${f.boss ? ' 👑' : ''}`)); const bar = el('div', 'se-bar'), u = el('u'); u.style.width = Math.max(0, f.hp / f.max * 100) + '%'; bar.append(u, el('span', null, `${Math.max(0, f.hp)}/${f.max}`)); t.appendChild(bar);
    const st = el('div', 'se-st'); if (f.blk) st.appendChild(el('i', 'b', `막기 ${f.blk}`)); if (f.poi) st.appendChild(el('i', 'p', `독 ${f.poi}`)); if (f.frz) st.appendChild(el('i', 'f', `얼음 ${f.frz}`)); st.appendChild(el('i', null, `주사위 ${f.dice}`)); t.appendChild(st);
    const fe = el('div', 'se-feq'); f.eq.forEach(s => fe.appendChild(el('span', null, `${EQ[s.id].n}${condTxt(EQ[s.id].c) ? '·' + condTxt(EQ[s.id].c) : ''}: ${EQ[s.id].d}`))); t.appendChild(fe);
    F.append(im, t); B.appendChild(F);
    B.appendChild(el('div', 'se-log', msg || `${run.fl + 1}층 · ${run.turn}번째 차례 — 주사위를 누르고 장비를 눌러요`));
    // 내 상태
    const me = el('div'); const mb = el('div', 'se-bar me'), mu = el('u'); mu.style.width = Math.max(0, run.hp / run.max * 100) + '%'; mb.append(mu, el('span', null, `송휘님 ${run.hp}/${run.max}`)); me.appendChild(mb);
    const ms = el('div', 'se-st'); if (run.me.blk) ms.appendChild(el('i', 'b', `막기 ${run.me.blk}`)); if (run.me.poi) ms.appendChild(el('i', 'p', `독 ${run.me.poi}`)); me.appendChild(ms); B.appendChild(me);
    const H = el('div', 'se-hand'); run.hand.forEach((v, i) => { const d = die(v); if (sel === i) d.classList.add('sel'); d.style.animationDelay = i * .05 + 's'; d.onclick = () => { if (busy) return; sel = sel === i ? null : i; dtmf(v); draw(); }; H.appendChild(d); });
    if (!run.hand.length) H.appendChild(el('div', 'hint', '주사위를 다 썼어요'));
    B.appendChild(H);
    const E = el('div', 'se-eq'); run.eq.forEach((s, k) => { const q = EQ[s.id], c = el('button', 'se-e' + (s.up ? ' up' : '')), left = (q.u || 1) - s.used; const can = sel != null && left > 0 && ok(q.c, run.hand[sel]);
      if (can) c.classList.add('can'); if (left <= 0) c.classList.add('done');
      c.append(el('b', null, q.n + (s.up ? ' +'.repeat(s.up) : '')), el('small', null, q.d + (s.up ? ` (+${s.up} 강화)` : ''))); if (condTxt(q.c)) c.appendChild(el('em', null, condTxt(q.c))); c.appendChild(el('span', 'slotb', (q.u || 1) > 1 ? `×${left}` : '□'));
      c.onclick = () => { if (busy || sel == null) { if (sel == null) toast('먼저 아래 주사위를 눌러요.'); return; } const d = run.hand[sel]; const r = use(run, 'me', sel, k); if (!r) { toast(`이 칸은 ${condTxt(q.c) || '지금 못 써요'}`); return; } sel = null; fxOf(r, d); persist(); draw(); }; E.appendChild(c); });
    B.appendChild(E);
    const r = el('div', 'bp-row'), end = el('button', 'bp-go t', '차례 끝'); end.onclick = () => endTurn(); r.appendChild(end); B.appendChild(r);
  }, true);
}
function fxOf(r, d) {
  if (r.real != null) { pop(`-${r.real}`); tone([200 + r.real * 30], .08, .07, 'square'); const f = $('sefoe'); if (f) { f.classList.remove('hit'); void f.offsetWidth; f.classList.add('hit'); } }
  else if (r.blk) { pop(`막기 +${r.blk}`, 'b'); tone([500], .06, .05, 'triangle'); }
  else if (r.heal) { pop(`+${r.heal}`, 'b'); tone([660, 880], .06, .05, 'triangle'); }
  else if (r.poi) { pop(`독 ${r.poi}`); tone([300], .08, .04, 'sine'); }
  else if (r.ret) { tone([900, 1200], .04, .04, 'square'); }
  msg = '';
  if (run.ph !== 'fight') setTimeout(() => { persist(); draw(); }, 600);
}
async function endTurn() {
  if (busy || run.ph !== 'fight') return; busy = true; sel = null;
  const acts = foeTurn(run); msg = `${run.foe.n}의 차례…`; draw();
  for (const a of acts) { await new Promise(r => setTimeout(r, 650)); msg = `${run.foe.n}: [${a.d}] → ${EQ[a.s].n}${a.r.real != null ? ` · 피해 ${a.r.real}` : a.r.blk ? ` · 막기 ${a.r.blk}` : a.r.poi ? ` · 독 ${a.r.poi}` : a.r.frz ? ' · 얼림' : ''}`; if (a.r.real) { pop(`-${a.r.real}`, 'r'); tone([150], .12, .08, 'sawtooth'); } draw(); }
  await new Promise(r => setTimeout(r, acts.length ? 700 : 300));
  if (run.ph === 'fight') { myTurn(run); msg = run.me.hpLoss ? `독 피해 ${run.me.hpLoss}` : ''; [0, 80, 160].forEach(t => setTimeout(() => tone([700 + Math.random() * 400], .03, .04, 'square'), t)); }
  busy = false; persist(); draw();
}
function mapUI() {
  frame(NAME, B => {
    const m = el('div', 'se-map'); FOES.forEach((f, i) => m.appendChild(el('i', i < run.fl ? 'on' : i === run.fl ? 'now' : f[0].boss ? 'boss' : ''))); B.appendChild(m);
    talk(B, run.fl === 5 ? 'sk' : 'l', run.fl === 5 ? '(해골 사장이 빚 장부를 펼친다)' : pick([`${run.fl + 1}층이에요. 계단 밑에서 뼈 소리 나요.`, '조심해요. 송휘님 다치면 저 화낼 거예요.', '주사위 운도 실력이에요.']));
    const P = el('div', 'bp-panel'); P.appendChild(el('h4', null, `송휘님 · 체력 ${run.hp}/${run.max} · 레벨 ${run.lv} · 주사위 ${run.dice}개`)); P.appendChild(el('div', 'hint', run.eq.map(s => EQ[s.id].n + (s.up ? '+' + s.up : '')).join(' · '))); B.appendChild(P);
    const r = el('div', 'bp-row'), g = el('button', 'bp-go'); g.innerHTML = `${run.fl + 1}층 내려가기<small>${run.fl === 5 ? '해골 사장' : '해골이 기다려요'}</small>`; g.onclick = () => { startFight(run); msg = ''; persist(); draw(); }; r.appendChild(g); B.appendChild(r);
    B.appendChild(el('div', 'bp-row')).appendChild(btn('그만두기', 'ghost wide', () => { if (confirm('그만둘까요?')) { run.ph = 'over'; endUI(); } }));
  }, true);
}
function rewardUI() {
  coinSound();
  frame(NAME, B => {
    talk(B, 'l', `이겼어요! 레벨 ${run.lv}${run.lv === 3 || run.lv === 5 ? ' — 주사위 하나 더!' : ''} 하나 골라요.`);
    const G = el('div', 'se-eq'); run.offer.forEach((o, i) => { const c = el('button', 'se-e');
      if (o.t === 'new') { const q = EQ[o.id]; c.append(el('b', null, `새 장비: ${q.n}`), el('small', null, q.d)); if (condTxt(q.c)) c.appendChild(el('em', null, condTxt(q.c))); }
      else if (o.t === 'up') { const s = run.eq[o.k]; c.classList.add('up'); c.append(el('b', null, `강화: ${EQ[s.id].n} +1`), el('small', null, '숫자가 더 커져요')); }
      else c.append(el('b', null, '쉬기'), el('small', null, `체력 ${Math.ceil(run.max * .4)} 회복`));
      c.onclick = () => { let sw = null; if (o.t === 'new' && run.eq.length >= 6) { const nm = prompt(`장비가 6개예요. 바꿀 번호(1~6):\n${run.eq.map((s, j) => `${j + 1}. ${EQ[s.id].n}`).join('\n')}`); sw = parseInt(nm) - 1; if (!(sw >= 0 && sw < 6)) return; } take(run, i, sw); persist(); draw(); }; G.appendChild(c); });
    B.appendChild(G);
  }, true);
}
function endUI() {
  const M = meta(), w = run.ph === 'win', fl = run.fl, g = fl * 2 + (w ? 15 : 0); if (!run.paid) { run.paid = 1; M.best = Math.max(M.best, fl); if (w) M.wins++; if (g) gcAdd(g); S.dice2 = null; save(); }
  frame(NAME, B => {
    talk(B, w ? 'l' : 'sk', w ? '해골 사장이 장부를 찢었어요. …송휘님 진짜 멋있었어요.' : '(해골이 주사위를 주머니에 넣는다)');
    const P = el('div', 'bp-panel'); P.append(el('h4', null, w ? '클리어!' : `${fl + 1}층에서 쓰러졌어요`), el('div', 'hint', `게임 동전 +${g}`)); B.appendChild(P);
    B.appendChild(el('div', 'bp-row')).appendChild(btn('처음으로', 'teal wide', lobby));
  }, true);
}
window.ARC.reg({ id: 'dice', order: 2, name: NAME, icon: 'assets/lena/st_star.webp', color: '#ff3d9a', cost: COST, sub: () => `주사위 로그라이크 · 최고 ${meta().best}층`, start: lobby });
window.lenaDice = { DICE, get run() { return run; }, set run(v) { run = v; }, draw, lobby };
})();
