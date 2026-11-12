// 레나 — 오락실 테이블 게임(v134): 블랙잭·하이로우·룰렛. 레나가 딜러. 판돈은 게임 동전(S.gc).
// 계산 코어는 순수 함수(module.exports)라 Node에서 확률 점검 가능(scratchpad t/table_sim.js).
'use strict';
(() => {
// ---------- 계산 코어 ----------
const SUITS = ['♠', '♥', '♦', '♣'], RK = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
function deck(n = 1) { const d = []; for (let k = 0; k < n; k++) for (const s of SUITS) for (let r = 1; r <= 13; r++) d.push({ r, s }); for (let i = d.length - 1; i > 0; i--) { const j = Math.random() * (i + 1) | 0; [d[i], d[j]] = [d[j], d[i]]; } return d; }
function bjv(h) { let v = 0, a = 0; h.forEach(c => { v += c.r === 1 ? 11 : Math.min(10, c.r); if (c.r === 1) a++; }); while (v > 21 && a) { v -= 10; a--; } return v; }
const isBJ = h => h.length === 2 && bjv(h) === 21;
function dealerPlay(d, h) { while (bjv(h) < 17) h.push(d.pop()); return h; }
// 돌려받는 동전(판돈 포함). 블랙잭은 3:2(내림)
function bjSettle(p, dl, bet) { const pv = bjv(p), dv = bjv(dl); if (pv > 21) return 0; if (isBJ(p) && !isBJ(dl)) return bet + Math.floor(bet * 1.5); if (isBJ(dl) && !isBJ(p)) return 0; if (dv > 21 || pv > dv) return bet * 2; return pv === dv ? bet : 0; }
// 하이로우: 같은 숫자는 짐. 배수 = 0.95 ÷ 맞힐 확률(소수 둘째 자리 내림)
function hlP(v, dir) { return dir === 'hi' ? (13 - v) / 13 : (v - 1) / 13; }
function hlMult(v, dir) { const p = hlP(v, dir); return p <= 0 ? 0 : Math.floor(.95 / p * 100) / 100; }
// 룰렛(유럽식 0~36): 받는 배수(판돈 포함)
const RED = new Set([1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36]);
function rlWin(type, val, n) { if (type === 'num') return n === val ? 36 : 0; if (n === 0) return 0; if (type === 'red') return RED.has(n) ? 2 : 0; if (type === 'black') return RED.has(n) ? 0 : 2; if (type === 'odd') return n % 2 ? 2 : 0; if (type === 'even') return n % 2 ? 0 : 2; if (type === 'doz') return Math.ceil(n / 12) === val ? 3 : 0; return 0; }
if (typeof module !== 'undefined') module.exports = { deck, bjv, isBJ, dealerPlay, bjSettle, hlP, hlMult, rlWin, RED };
if (typeof window === 'undefined' || !window.ARC) return;

// ---------- 화면 ----------
const css = `
.tb{position:relative;display:flex;flex-direction:column;gap:12px;min-height:100%}
.tb-felt{position:relative;border-radius:22px;padding:16px 12px;background:radial-gradient(ellipse at 50% 30%,#1f6b47,#0d3324 75%);border:3px solid #000;box-shadow:inset 0 0 0 3px #b8925a,inset 0 0 40px rgba(0,0,0,.55),4px 4px 0 var(--pink);display:flex;flex-direction:column;gap:12px}
.tb-lb{display:flex;align-items:center;gap:8px;font-size:13px;font-weight:800;color:#d9f2e4}.tb-lb b{font-family:'Space Mono',monospace;font-size:15px;color:var(--yel);min-width:26px}
.tb-row{display:flex;gap:8px;flex-wrap:wrap;min-height:86px;align-items:center}
.tc{width:58px;height:82px;border-radius:9px;background:var(--paper);border:2px solid #111;box-shadow:2px 3px 0 rgba(0,0,0,.55);display:flex;flex-direction:column;align-items:center;justify-content:center;color:#111;line-height:1}
.tc b{font-family:'Black Han Sans';font-weight:400;font-size:26px}.tc i{font-style:normal;font-size:20px;margin-top:2px}
.tc.red{color:#e8217a}
.tc.back{background:repeating-linear-gradient(45deg,#ff3d9a 0 6px,#d61f78 6px 12px);border-color:#000}
.tc.big{width:96px;height:136px}.tc.big b{font-size:44px}.tc.big i{font-size:32px}
.tb-bet{display:flex;gap:8px;align-items:center}
.tb-bet button{flex:1;min-height:48px;border-radius:24px;border:2px solid #000;background:#f2f3ee;color:#111;font-family:'Space Mono',monospace;font-weight:700;font-size:15px;display:flex;align-items:center;justify-content:center;gap:3px;box-shadow:0 3px 0 #000}
.tb-bet button.on{background:var(--yel);transform:translateY(2px);box-shadow:0 1px 0 #000}
.tb-bet button:disabled{opacity:.35}
.tb-bet .ci{width:18px;height:18px}
.tb-act{display:flex;gap:8px}
.tb-act button{flex:1;min-height:54px;border-radius:14px;border:3px solid #000;font-size:16px;font-weight:800;box-shadow:0 4px 0 #000;background:linear-gradient(#f2f3ee,#c9cdc4);color:#111;transition:transform .12s cubic-bezier(0.23,1,0.32,1),box-shadow .12s cubic-bezier(0.23,1,0.32,1)}
.tb-act button:active{transform:translateY(3px);box-shadow:0 1px 0 #000}
.tb-act button.go{background:linear-gradient(#ff6fb3,#ff3d9a);color:#fff}
.tb-act button.tl{background:linear-gradient(#5ff0dc,#2fe0c8)}
.tb-act button:disabled{opacity:.35}
.tb-res{text-align:center;font-family:'Black Han Sans';font-size:26px;min-height:30px;text-shadow:2px 2px 0 #000}.tb-res.w{color:var(--yel)}.tb-res.l{color:var(--hot)}.tb-res.p{color:#d9f2e4}
.tb-hint{font-size:12.5px;color:#a9c4b6;text-align:center;word-break:keep-all}
.tb-mul{font-family:'Space Mono',monospace;font-size:12px;display:block;opacity:.75;margin-top:2px}
.rl-win{position:relative;height:70px;border-radius:12px;background:#08140e;border:3px solid #000;overflow:hidden}
.rl-strip{position:absolute;left:0;top:7px;display:flex;gap:6px;will-change:transform}
.rl-p{flex:none;width:50px;height:50px;border-radius:10px;display:grid;place-items:center;font-family:'Space Mono',monospace;font-weight:700;font-size:18px;color:#fff;border:2px solid #000}
.rl-p.r{background:#d6245f}.rl-p.k{background:#151515}.rl-p.z{background:#1a9c5b}
.rl-win::after{content:"";position:absolute;left:50%;top:0;bottom:0;width:3px;margin-left:-1.5px;background:var(--yel);box-shadow:0 0 10px var(--yel)}
.rl-bets{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:6px}
.rl-bets button{min-height:46px;border-radius:10px;border:2px solid #000;font-size:14px;font-weight:800;color:#fff;background:#151515;box-shadow:0 3px 0 #000}
.rl-bets button.r{background:#d6245f}.rl-bets button.g{background:#1d5d40}
.rl-bets button.on{outline:3px solid var(--yel);outline-offset:1px}
.rl-bets small{display:block;font-family:'Space Mono',monospace;font-size:11px;opacity:.8}
.rl-nums{display:grid;grid-template-columns:repeat(7,minmax(0,1fr));gap:4px}
.rl-nums button{min-height:36px;border-radius:7px;border:1.5px solid #000;font-family:'Space Mono',monospace;font-weight:700;font-size:13px;color:#fff}
.rl-nums button.on{outline:3px solid var(--yel)}
@media (prefers-reduced-motion:reduce){.tb *{transition:none!important}}
`;
document.head.appendChild(Object.assign(document.createElement('style'), { textContent: css }));
const EO = 'cubic-bezier(0.23, 1, 0.32, 1)', reduce = () => window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
const BETS = [1, 2, 3, 5];
let bet = 1;
function cardEl(c, back, big) { const e = el('div', 'tc' + (back ? ' back' : '') + (big ? ' big' : '') + (!back && (c.s === '♥' || c.s === '♦') ? ' red' : '')); if (!back) e.append(el('b', null, RK[c.r - 1]), el('i', null, c.s)); return e; }
function dealIn(e, i) { if (!reduce() && e.animate) e.animate([{ opacity: 0, transform: 'translateY(-28px) rotate(-6deg)' }, { opacity: 1, transform: 'none' }], { duration: 240, delay: (i || 0) * 90, easing: EO, fill: 'backwards' }); }
function betRow(B, onPick) {
  const r = el('div', 'tb-bet'); if (bet > ARC.gc()) bet = Math.max(1, BETS.filter(x => x <= ARC.gc()).pop() || 1);
  BETS.forEach(v => { const b = el('button', v === bet ? 'on' : ''); b.innerHTML = `${ci('gc')}${v}`; b.disabled = v > ARC.gc(); b.setAttribute('aria-label', `판돈 동전 ${v}개`); b.onclick = () => { bet = v; dtmf(v); onPick(); }; r.appendChild(b); });
  B.appendChild(r);
}
function act(B, list) { const r = el('div', 'tb-act'); list.forEach(([t, c, f, dis]) => { const b = el('button', c || '', t); if (dis) b.disabled = true; b.onclick = f; r.appendChild(b); }); B.appendChild(r); return r; }
function res(B, t, k) { const d = el('div', 'tb-res ' + (k || ''), t); B.appendChild(d); if (t && !reduce() && d.animate) d.animate([{ opacity: 0, transform: 'scale(.9)' }, { opacity: 1, transform: 'none' }], { duration: 220, easing: EO }); }
const noCoin = B => { if (ARC.gc() >= 1) return false; B.appendChild(el('div', 'tb-hint', '동전이 없어. 오락실 입구에서 하루 한 번 빌릴 수 있어.')); return true; };
const pay = n => { if (n > 0) { ARC.gcAdd(n); coinSound(); } };

// ---------- 블랙잭 ----------
function blackjack() {
  let st = { ph: 'bet' }, line = null;
  const say = t => { if (line) line.textContent = t; };
  const draw = () => ARC.frame('블랙잭', B => {
    line = ARC.talk(B, 'l', st.say || '앉아. 21에 가까우면 이기는 거야. 얼마 걸래?');
    const F = el('div', 'tb-felt');
    if (st.ph !== 'bet') {
      const hideHole = st.ph === 'play';
      F.appendChild(el('div', 'tb-lb')).append(el('span', null, '레나'), el('b', null, hideHole ? '?' : String(bjv(st.dl))));
      const dr = el('div', 'tb-row'); st.dl.forEach((c, i) => { const e = cardEl(c, hideHole && i === 1); if (st.nd.includes(c)) dealIn(e, st.nd.indexOf(c)); dr.appendChild(e); }); F.appendChild(dr);
      F.appendChild(el('div', 'tb-lb')).append(el('span', null, nmc().replace(/[,\s]+$/, '') || '나'), el('b', null, String(bjv(st.p))));
      const pr = el('div', 'tb-row'); st.p.forEach(c => { const e = cardEl(c); if (st.nd.includes(c)) dealIn(e, st.nd.indexOf(c)); pr.appendChild(e); }); F.appendChild(pr);
      st.nd = [];
    } else F.appendChild(el('div', 'tb-hint', '카드 숫자 합이 21에 가까우면 이겨. 21을 넘으면 바로 져. 그림 카드는 10, A는 1이나 11. 처음 두 장이 21이면 블랙잭(1.5배 더).'));
    B.appendChild(F);
    if (st.ph === 'done') res(B, st.res, st.rk);
    if (st.ph === 'bet' || st.ph === 'done') { if (noCoin(B)) return; betRow(B, draw); act(B, [[st.ph === 'done' ? '한 판 더' : '카드 받기', 'go', deal]]); }
    else act(B, [['더 받기', 'tl', hit], ['멈추기', '', stand], ['두 배', 'go', dbl, st.p.length !== 2 || ARC.gc() < st.bet]]);
  }, true);
  function deal() {
    if (ARC.gc() < bet) return; ARC.gcAdd(-bet); dtmf(1);
    const d = deck(2), p = [d.pop()], dl = [d.pop()]; p.push(d.pop()); dl.push(d.pop());
    st = { ph: 'play', d, p, dl, bet, nd: [p[0], dl[0], p[1], dl[1]], say: '돌린다. …표정 관리 잘해.' };
    if (isBJ(p) || isBJ(dl)) return finish(); draw();
  }
  function hit() { const c = st.d.pop(); st.p.push(c); st.nd = [c]; dtmf(2); if (bjv(st.p) > 21) return finish(); st.say = bjv(st.p) >= 18 ? '거기서 더? 배짱 좋네.' : '한 장 더.'; draw(); }
  function stand() { st.nd = []; const n0 = st.dl.length; dealerPlay(st.d, st.dl); st.nd = st.dl.slice(n0); finish(); }
  function dbl() { if (ARC.gc() < st.bet) return; ARC.gcAdd(-st.bet); st.bet *= 2; const c = st.d.pop(); st.p.push(c); st.nd = [c]; if (bjv(st.p) <= 21) { const n0 = st.dl.length; dealerPlay(st.d, st.dl); st.nd = st.nd.concat(st.dl.slice(n0)); } finish(); }
  function finish() {
    const back = bjSettle(st.p, st.dl, st.bet), pv = bjv(st.p), dv = bjv(st.dl); pay(back); st.ph = 'done';
    if (pv > 21) { st.res = '버스트'; st.rk = 'l'; st.say = '너무 욕심냈지? 21 넘었어.'; }
    else if (isBJ(st.p) && !isBJ(st.dl)) { st.res = `블랙잭! +${back - st.bet}`; st.rk = 'w'; st.say = '블랙잭? …오늘 운 좋은 얼굴이더라.'; }
    else if (back > st.bet) { st.res = `이겼어 +${back - st.bet}`; st.rk = 'w'; st.say = dv > 21 ? '내가 넘었네. 이번만 봐준 거야.' : '…이번엔 네가 이겼어. 다음엔 안 봐줘.'; }
    else if (back === st.bet) { st.res = '비김'; st.rk = 'p'; st.say = '비겼네. 한 판 더?'; }
    else { st.res = `졌어 −${st.bet}`; st.rk = 'l'; st.say = isBJ(st.dl) ? '미안, 블랙잭이야.' : '아쉽네. 칩은 내가 잘 맡아 둘게.'; }
    draw();
  }
  draw();
}

// ---------- 하이로우 ----------
function hilo() {
  let st = { ph: 'bet' };
  const draw = () => ARC.frame('하이로우', B => {
    ARC.talk(B, 'l', st.say || '다음 장이 높을까 낮을까? 맞힐수록 배수가 쌓여. 언제 멈출지는 네 몫이야.');
    const F = el('div', 'tb-felt');
    if (st.ph !== 'bet') {
      const r = el('div', 'tb-row'); r.style.justifyContent = 'center'; r.style.gap = '14px';
      if (st.prev) { const pe = cardEl(st.prev); pe.style.opacity = '.45'; r.appendChild(pe); }
      const ce = cardEl(st.c, false, true); if (st.fresh) dealIn(ce, 0); r.appendChild(ce); F.appendChild(r);
      F.appendChild(el('div', 'tb-lb')).append(el('span', null, `맞힌 수 ${st.n} · 지금 받으면`), el('b', null, String(Math.round(st.bet * st.m))));
    } else F.appendChild(el('div', 'tb-hint', '같은 숫자가 나오면 져. A가 가장 낮고 K가 가장 높아. 확률이 낮은 쪽일수록 배수가 커.'));
    B.appendChild(F);
    if (st.ph === 'done') res(B, st.res, st.rk);
    if (st.ph === 'bet' || st.ph === 'done') { if (noCoin(B)) return; betRow(B, draw); act(B, [[st.ph === 'done' ? '한 판 더' : '시작', 'go', start]]); }
    else {
      const v = st.c.r, mh = hlMult(v, 'hi'), ml = hlMult(v, 'lo');
      const a = act(B, [['높게', 'tl', () => guess('hi'), !mh], ['낮게', 'tl', () => guess('lo'), !ml], ['멈추고 받기', 'go', cash, st.n === 0]]);
      if (mh) a.children[0].appendChild(el('span', 'tb-mul', `×${mh}`)); if (ml) a.children[1].appendChild(el('span', 'tb-mul', `×${ml}`));
    }
    st.fresh = false;
  }, true);
  function start() { if (ARC.gc() < bet) return; ARC.gcAdd(-bet); dtmf(1); const d = deck(1); st = { ph: 'play', d, c: d.pop(), bet, m: 1, n: 0, fresh: true, say: '첫 장. …높을까, 낮을까?' }; draw(); }
  function guess(dir) {
    const v = st.c.r, mul = hlMult(v, dir); if (!mul) return; if (!st.d.length) st.d = deck(1);
    const c = st.d.pop(), ok = dir === 'hi' ? c.r > v : c.r < v; st.prev = st.c; st.c = c; st.fresh = true; dtmf(c.r % 10);
    if (ok) { st.m *= mul; st.n++; st.say = st.n >= 4 ? '여기서 더 가? …그 배짱 마음에 드는데.' : '오, 감 좋은데?'; }
    else { st.ph = 'done'; st.res = c.r === v ? `같은 숫자 — 졌어 −${st.bet}` : `졌어 −${st.bet}`; st.rk = 'l'; st.say = '땡. 아쉽지? 그러니까 멈출 때 멈췄어야지.'; }
    draw();
  }
  function cash() { const got = Math.round(st.bet * st.m); pay(got); st.ph = 'done'; st.res = `받았어 +${got - st.bet}`; st.rk = got > st.bet ? 'w' : 'p'; st.say = '똑똑하네. 멈출 줄 아는 사람이 오래 가.'; draw(); }
  draw();
}

// ---------- 룰렛 ----------
function roulette() {
  let st = { ph: 'bet', t: 'red', v: 0 };
  const LAB = { red: '빨강', black: '검정', odd: '홀', even: '짝', num: '숫자' };
  const pc = n => n === 0 ? 'z' : RED.has(n) ? 'r' : 'k';
  const draw = () => ARC.frame('룰렛', B => {
    ARC.talk(B, 'l', st.say || '어디에 걸래? 색이나 홀짝은 2배, 12칸 묶음은 3배, 숫자 하나는 36배.');
    const F = el('div', 'tb-felt');
    const W = el('div', 'rl-win'), strip = el('div', 'rl-strip'); W.appendChild(strip); F.appendChild(W);
    const N = 60; st.seq = st.seq || Array.from({ length: N }, () => Math.random() * 37 | 0); st.seq.forEach(n => strip.appendChild(el('div', 'rl-p ' + pc(n), String(n))));
    const G = el('div', 'rl-bets'), opt = [['red', 0, '빨강', 'r'], ['black', 0, '검정', ''], ['odd', 0, '홀', 'g'], ['even', 0, '짝', 'g'], ['doz', 1, '1~12', 'g'], ['doz', 2, '13~24', 'g'], ['doz', 3, '25~36', 'g'], ['num', st.t === 'num' ? st.v : 0, '숫자 하나', 'g']];
    opt.forEach(([t, v, lab, c]) => { const b = el('button', c + (st.t === t && (t !== 'doz' || st.v === v) ? ' on' : '')); b.append(document.createTextNode(lab), el('small', null, t === 'num' ? '×36' : t === 'doz' ? '×3' : '×2')); b.disabled = st.ph === 'spin'; b.onclick = () => { st.t = t; st.v = t === 'num' ? st.v : v; dtmf(5); draw(); }; G.appendChild(b); });
    F.appendChild(G);
    if (st.t === 'num' && st.ph !== 'spin') { const g = el('div', 'rl-nums'); for (let n = 0; n <= 36; n++) { const b = el('button', 'rl-p ' + pc(n) + (st.v === n ? ' on' : ''), String(n)); b.style.width = 'auto'; b.style.height = 'auto'; b.onclick = () => { st.v = n; draw(); }; g.appendChild(b); } F.appendChild(g); }
    B.appendChild(F);
    if (st.res) res(B, st.res, st.rk);
    const at = () => { const W0 = W.clientWidth, i = st.at == null ? 30 : st.at; return W0 / 2 - (i * 56 + 25); };
    strip.style.transform = `translateX(${at()}px)`;
    if (st.ph === 'spin') return; if (noCoin(B)) return; betRow(B, draw);
    const what = st.t === 'num' ? `${st.v}` : st.t === 'doz' ? ['', '1~12', '13~24', '25~36'][st.v] : LAB[st.t];
    act(B, [[`${what}에 걸고 돌리기`, 'go', () => spin(strip, at)]]);
  }, true);
  function spin(strip, at) {
    if (ARC.gc() < bet) return; ARC.gcAdd(-bet); dtmf(1);
    const n = Math.random() * 37 | 0, idx = 48 + (Math.random() * 6 | 0); st.seq[idx] = n; strip.children[idx].textContent = n; strip.children[idx].className = 'rl-p ' + pc(n);
    const from = at(); st.at = idx; const to = at(); st.ph = 'spin'; st.res = ''; st.say = '공 굴린다. 눈 떼지 마.';
    [...document.querySelectorAll('.rl-bets button,.tb-act button,.tb-bet button')].forEach(b => b.disabled = true);
    const done = () => { const back = bet * rlWin(st.t, st.v, n); pay(back); st.ph = 'bet'; st.seq = st.seq.slice(idx - 30, idx + 30).concat([]); while (st.seq.length < 60) st.seq.push(Math.random() * 37 | 0); st.at = 30;
      st.res = `${n} ${n === 0 ? '초록' : RED.has(n) ? '빨강' : '검정'} — ${back ? `이겼어 +${back - bet}` : `졌어 −${bet}`}`; st.rk = back ? 'w' : 'l';
      st.say = back ? (st.t === 'num' ? '숫자를 맞혀? …너 뭐야, 무섭게.' : '좋아, 이번 판은 네 거.') : (n === 0 ? '0이네. 집이 다 가져가는 날이야.' : '아깝다. 한 번 더 굴려 줄까?'); draw(); };
    if (reduce() || !strip.animate) { strip.style.transform = `translateX(${to}px)`; return done(); }
    strip.animate([{ transform: `translateX(${from}px)` }, { transform: `translateX(${to}px)` }], { duration: 2600, easing: 'cubic-bezier(0.12, 0.7, 0.18, 1)', fill: 'forwards' }).onfinish = done;
  }
  draw();
}

const IM = n => `assets/lena/${n}.webp`;
ARC.reg({ id: 'bj', order: 1, name: '블랙잭', icon: IM('st_heart'), color: '#ff3d9a', cost: 0, sub: () => '21에 가깝게 — 레나와 한 판', start: blackjack });
ARC.reg({ id: 'hilo', order: 2, name: '하이로우', icon: IM('st_star'), color: '#2fe0c8', cost: 0, sub: () => '다음 장이 높을까 낮을까', start: hilo });
ARC.reg({ id: 'rl', order: 3, name: '룰렛', icon: IM('s/d_disco'), color: '#f2ea3a', cost: 0, sub: () => '색·홀짝·숫자에 걸기', start: roulette });
})();
