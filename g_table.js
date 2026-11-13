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
.tb-felt{position:relative;border-radius:22px;padding:16px 12px;background:radial-gradient(ellipse at 50% 30%,rgba(31,107,71,.35),rgba(4,20,13,.82) 78%),url(assets/lena/tb/felt.webp) center/320px #0d3324;border:3px solid #000;box-shadow:inset 0 0 0 3px #b8925a,inset 0 0 40px rgba(0,0,0,.55),4px 4px 0 var(--pink);display:flex;flex-direction:column;gap:12px}
.tb-lb{display:flex;align-items:center;gap:8px;font-size:13px;font-weight:800;color:#d9f2e4}.tb-lb b{font-family:'Space Mono',monospace;font-size:15px;color:var(--yel);min-width:26px}
.tb-row{display:flex;gap:8px;flex-wrap:wrap;min-height:86px;align-items:center}
.tc{width:58px;height:82px;border-radius:9px;background:url(assets/lena/tb/card_face.webp) center/cover var(--paper);border:2px solid #111;box-shadow:2px 3px 0 rgba(0,0,0,.55);display:flex;flex-direction:column;align-items:center;justify-content:center;color:#111;line-height:1}
.tc b{font-family:'Black Han Sans';font-weight:400;font-size:26px}.tc i{font-style:normal;font-size:20px;margin-top:2px}
.tc.red{color:#e8217a}
.tc.pic{background-size:cover;background-position:center}.tc.pic b,.tc.pic i{display:none}
.tc.back{background:url(assets/lena/tb/card_back.webp) center/cover #111;border-color:#000}
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
.rl-p{flex:none;width:50px;height:50px;border-radius:10px;display:grid;place-items:center;font-family:'Space Mono',monospace;font-weight:700;font-size:18px;color:#fff;border:2px solid #000}
.rl-p.r{background:#d6245f}.rl-p.k{background:#151515}.rl-p.z{background:#1a9c5b}
.rl-bets{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:6px}
.rl-bets button{min-height:46px;border-radius:10px;border:2px solid #000;font-size:14px;font-weight:800;color:#fff;background:#151515;box-shadow:0 3px 0 #000}
.rl-bets button.r{background:#d6245f}.rl-bets button.g{background:#1d5d40}
.rl-bets button.on{outline:3px solid var(--yel);outline-offset:1px}
.rl-bets small{display:block;font-family:'Space Mono',monospace;font-size:11px;opacity:.8}
@media (prefers-reduced-motion:reduce){.tb *{transition:none!important}}

.rl-wheel{display:block;flex:none;height:100%;max-height:200px;aspect-ratio:1;filter:drop-shadow(0 6px 10px rgba(0,0,0,.6))}
/* v137 한 화면(스크롤 없음): 딜러 띠가 남는 높이를 다 쓰고, 게임 부분은 꼭 필요한 만큼 */
.abody.tbg{display:flex;flex-direction:column;gap:8px;padding:0 12px calc(var(--sb) + 10px);overflow:hidden}
.abody.tbg>*{flex:none}
.tb-dl{position:relative;flex:1 1 0!important;min-height:110px;margin:0 -12px;overflow:hidden;background:#06080a;container-type:size}
.tb-dl img{position:absolute;max-width:none}
.tb-dl img.bg{inset:0;width:100%;height:100%;transform:scale(1.15);object-fit:cover!important;filter:blur(16px) brightness(.42) saturate(1.3)}
.tb-dl img.lena{top:0;left:50%;height:150cqh;width:auto;transform:translateX(-50%)}
.tb-dl img.ct{left:50%;top:44%;width:min(62cqh,70cqw);height:auto;aspect-ratio:1;object-fit:cover!important;border-radius:50%;transform:translate(-50%,-50%);border:3px solid #000;box-shadow:0 0 0 4px var(--teal),0 0 40px rgba(47,224,200,.45)}
.tb-dl::after{content:"";position:absolute;inset:0;background:linear-gradient(180deg,transparent 60%,#0b0d11 99%);pointer-events:none}
.tb-cap{position:absolute;left:12px;right:12px;bottom:8px;z-index:1;padding:8px 12px;border-radius:14px;background:rgba(6,8,10,.8);-webkit-backdrop-filter:blur(10px);backdrop-filter:blur(10px);border:1px solid rgba(255,255,255,.16);font-size:14px;font-weight:700;line-height:1.4;word-break:keep-all;color:#fff}
.tbg .tb-felt{padding:10px;gap:6px;border-radius:18px;height:clamp(196px,27vh,236px);justify-content:center}
.tb-dl.sl{flex:none!important;height:clamp(150px,22vh,200px);margin:-4px -14px 6px}
.tb-room{flex:0 0 clamp(110px,16vh,150px)!important;position:relative}.tb-say{display:none}
.tbg.out .tb-felt{flex:1 1 0!important;height:auto;min-height:0;gap:12px}
.tbg.out .tc{width:62px;height:88px}.tbg.out .tc b{font-size:28px}.tbg.out .tc i{font-size:20px}
.tbg.out .tc.big{width:104px;height:146px}.tbg.out .tc.big b{font-size:48px}.tbg.out .tc.big i{font-size:34px}
.tbg.out .rl-top{flex-direction:column;gap:12px}.tbg.out .rl-wheel{height:auto;width:min(100%,290px);max-height:none;flex:0 1 auto;min-height:0}
.tbg.out .rl-top .rl-bets{flex:none;width:100%;align-self:auto;grid-template-columns:repeat(4,minmax(0,1fr));grid-template-rows:none}.tbg.out .rl-top .rl-bets button{height:46px}.tbg.out .rl-num{height:46px}
.tbg .tb-row{min-height:0;flex-wrap:nowrap;gap:6px}
.tbg .tc{width:46px;height:64px;border-radius:7px}.tbg .tc b{font-size:20px}.tbg .tc i{font-size:15px}
.tbg .tc.big{width:72px;height:100px}.tbg .tc.big b{font-size:34px}.tbg .tc.big i{font-size:24px}
.tbg .tb-res{min-height:26px;font-size:22px;line-height:26px}
.tbg .tb-bet button{min-height:44px}
.tbg .tb-act button{min-height:50px}
.tbg .tb-hint{font-size:12px}
.rl-top{display:flex;gap:10px;height:100%;align-items:center}
.rl-top .rl-bets{grid-template-rows:repeat(3,minmax(0,1fr))}
.rl-top .rl-bets{flex:1;min-width:0;grid-template-columns:repeat(2,minmax(0,1fr));gap:5px;align-self:stretch;align-content:center}
.rl-top .rl-bets button{min-height:0;height:100%;max-height:46px;font-size:13px;padding:2px 0;line-height:1.15}
.rl-num{grid-column:1 / -1;display:flex;gap:5px;border-radius:12px}.rl-num.on{outline:3px solid var(--yel);outline-offset:1px}
.rl-num button{flex:1;min-height:0;height:100%;max-height:46px;border-radius:10px;border:2px solid #000;background:#f2f3ee;color:#111;font-size:20px;font-weight:800;box-shadow:0 3px 0 #000}.rl-num button.nv{flex:1.6;color:#fff;font-family:'Space Mono',monospace;font-size:18px;line-height:1.05}.rl-num button.nv small{display:block;font-size:11px;opacity:.8}
`;
document.head.appendChild(Object.assign(document.createElement('style'), { textContent: css }));
const EO = 'cubic-bezier(0.23, 1, 0.32, 1)', reduce = () => window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
const BETS = [1, 2, 3, 5];
// 딜러 레나: 영상 모드면 몸통까지 보이는 그림 띠 + 아래쪽 대사, 밖 모드면 고양이 대사 줄. 게임에 들어올 때 한 번 입구 그림 크기에서 줄어듦
let enter = false;
// 영상 모드 = 레나 딜러 띠(머리~가슴) / 밖 모드 = 띠 없이 테이블을 크게, 대사는 돌아다니는 큰 고양이 말풍선(pet.js lenaPet.arcSay)
function band(B, t) {
  const d = el('div', 'tb-dl'), bg = el('img', 'bg'), im = el('img', 'lena'); bg.src = im.src = 'assets/lena/menu/play.webp'; bg.alt = im.alt = ''; im.decoding = 'async';
  const cap = el('div', 'tb-cap'), sp = el('span', null, t); cap.appendChild(sp); d.append(bg, im, cap); B.appendChild(d);
  if (enter) { enter = false; if (!reduce() && d.animate) { d.animate([{ transform: 'scale(1.06)', opacity: .4 }, { transform: 'none', opacity: 1 }], { duration: 420, easing: EO }); cap.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 200, delay: 260, easing: 'ease-out', fill: 'backwards' }); } }
  return sp;
}
function catSay(B, t) {
  const sp = el('span', 'tb-say', t), say = () => { if (window.lenaPet && lenaPet.arcSay) lenaPet.arcSay(sp.textContent); };
  const room = el('div', 'tb-room'); room.appendChild(sp); B.appendChild(room); enter = false;
  new MutationObserver(say).observe(sp, { childList: true, characterData: true, subtree: true }); setTimeout(say, 60);
  return sp;
}
function dealer(B, t) { B.classList.add('tbg'); if ($('app').classList.contains('outside')) { B.classList.add('out'); return catSay(B, t); } return band(B, t); }
ARC.dealer = dealer; ARC.band = (B, t) => $('app').classList.contains('outside') ? null : band(B, t);
let bet = 1;
const SUF = { '♠': 's', '♥': 'h', '♦': 'd', '♣': 'c' }; // v142 카드 52장 그림 assets/lena/tb/c/{A..K}{s,h,d,c}.webp
function cardEl(c, back, big) { const e = el('div', 'tc' + (back ? ' back' : '') + (big ? ' big' : '') + (!back && (c.s === '♥' || c.s === '♦') ? ' red' : '')); if (!back) { e.classList.add('pic'); e.style.backgroundImage = `url(assets/lena/tb/c/${RK[c.r - 1]}${SUF[c.s]}.webp)`; e.setAttribute('aria-label', RK[c.r - 1] + c.s); e.append(el('b', null, RK[c.r - 1]), el('i', null, c.s)); } return e; }
function dealIn(e, i) { if (!reduce() && e.animate) e.animate([{ opacity: 0, transform: 'translateY(-28px) rotate(-6deg)' }, { opacity: 1, transform: 'none' }], { duration: 240, delay: (i || 0) * 90, easing: EO, fill: 'backwards' }); }
function betRow(B, onPick, lock) {
  const r = el('div', 'tb-bet'); if (bet > ARC.gc()) bet = Math.max(1, BETS.filter(x => x <= ARC.gc()).pop() || 1);
  BETS.forEach(v => { const b = el('button', v === bet ? 'on' : ''); b.innerHTML = `${ci('gc')}${v}`; b.disabled = lock || v > ARC.gc(); b.setAttribute('aria-label', `판돈 동전 ${v}개`); b.onclick = () => { bet = v; dtmf(v); onPick(); }; r.appendChild(b); });
  B.appendChild(r);
}
function act(B, list) { const r = el('div', 'tb-act'); list.forEach(([t, c, f, dis]) => { const b = el('button', c || '', t); if (dis) b.disabled = true; b.onclick = f; r.appendChild(b); }); B.appendChild(r); return r; }
function res(B, t, k) { const d = el('div', 'tb-res ' + (k || ''), t); B.appendChild(d); if (t && !reduce() && d.animate) d.animate([{ opacity: 0, transform: 'scale(.9)' }, { opacity: 1, transform: 'none' }], { duration: 220, easing: EO }); }
const noCoin = B => { if (ARC.gc() >= 1) return false; B.appendChild(el('div', 'tb-hint', '동전이 없어. 오락실 입구에서 하루 한 번 빌릴 수 있어.')); return true; };
const pay = n => { if (n > 0) { ARC.gcAdd(n); coinSound(); } };

// ---------- 블랙잭 ----------
function blackjack() {
  enter = true;
  let st = { ph: 'bet' }, line = null;
  const say = t => { if (line) line.textContent = t; };
  const draw = () => ARC.frame('블랙잭', B => {
    line = dealer(B, st.say || '앉아. 21에 가까우면 이기는 거야. 얼마 걸래?');
    const F = el('div', 'tb-felt');
    if (st.ph !== 'bet') {
      const hideHole = st.ph === 'play';
      F.appendChild(el('div', 'tb-lb')).append(el('span', null, '레나'), el('b', null, hideHole ? '?' : String(bjv(st.dl))));
      const dr = el('div', 'tb-row'); st.dl.forEach((c, i) => { const e = cardEl(c, hideHole && i === 1); if (st.nd.includes(c)) dealIn(e, st.nd.indexOf(c)); dr.appendChild(e); }); F.appendChild(dr);
      F.appendChild(el('div', 'tb-lb')).append(el('span', null, nmc().replace(/[,\s]+$/, '') || '나'), el('b', null, String(bjv(st.p))));
      const pr = el('div', 'tb-row'); st.p.forEach(c => { const e = cardEl(c); if (st.nd.includes(c)) dealIn(e, st.nd.indexOf(c)); pr.appendChild(e); }); F.appendChild(pr);
      st.nd = [];
    } else F.appendChild(el('div', 'tb-hint', '합이 21에 가까우면 이겨. 넘으면 져. 그림 카드는 10, A는 1이나 11. 처음 두 장이 21이면 블랙잭(1.5배 더).'));
    B.appendChild(F);
    res(B, st.ph === 'done' ? st.res : '', st.rk);
    if (st.ph === 'bet' || st.ph === 'done') { if (noCoin(B)) return; betRow(B, draw); act(B, [[st.ph === 'done' ? '한 판 더' : '카드 받기', 'go', deal]]); }
    else { betRow(B, draw, true); act(B, [['더 받기', 'tl', hit], ['멈추기', '', stand], ['두 배', 'go', dbl, st.p.length !== 2 || ARC.gc() < st.bet]]); }
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
  enter = true;
  let st = { ph: 'bet' };
  const draw = () => ARC.frame('하이로우', B => {
    dealer(B, st.say || '다음 장이 높을까 낮을까? 맞힐수록 배수가 쌓여. 언제 멈출지는 네 몫이야.');
    const F = el('div', 'tb-felt');
    if (st.ph !== 'bet') {
      const r = el('div', 'tb-row'); r.style.justifyContent = 'center'; r.style.gap = '14px';
      if (st.prev) { const pe = cardEl(st.prev); pe.style.opacity = '.45'; r.appendChild(pe); }
      const ce = cardEl(st.c, false, true); if (st.fresh) dealIn(ce, 0); r.appendChild(ce); F.appendChild(r);
      F.appendChild(el('div', 'tb-lb')).append(el('span', null, `맞힌 수 ${st.n} · 지금 받으면`), el('b', null, String(Math.round(st.bet * st.m))));
    } else F.appendChild(el('div', 'tb-hint', '같은 숫자가 나오면 져. A가 가장 낮고 K가 가장 높아. 확률이 낮은 쪽일수록 배수가 커.'));
    B.appendChild(F);
    res(B, st.ph === 'done' ? st.res : '', st.rk);
    if (st.ph === 'bet' || st.ph === 'done') { if (noCoin(B)) return; betRow(B, draw); act(B, [[st.ph === 'done' ? '한 판 더' : '시작', 'go', start]]); }
    else {
      const v = st.c.r, mh = hlMult(v, 'hi'), ml = hlMult(v, 'lo');
      betRow(B, draw, true); const a = act(B, [['높게', 'tl', () => guess('hi'), !mh], ['낮게', 'tl', () => guess('lo'), !ml], ['멈추고 받기', 'go', cash, st.n === 0]]);
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
  enter = true;
  let st = { ph: 'bet', t: 'red', v: 0, wr: 0, ba: 0, br: 128 };
  const LAB = { red: '빨강', black: '검정', odd: '홀', even: '짝', num: '숫자' };
  const pc = n => n === 0 ? 'z' : RED.has(n) ? 'r' : 'k';
  const draw = () => ARC.frame('룰렛', B => {
    dealer(B, st.say || '어디에 걸래? 색이나 홀짝은 2배, 숫자 하나는 36배.');
    const F = el('div', 'tb-felt');
    const WH = wheel(st), top = el('div', 'rl-top'); top.appendChild(WH.svg); F.appendChild(top);
    const G = el('div', 'rl-bets');
    [['red', '빨강', 'r'], ['black', '검정', ''], ['odd', '홀', 'g'], ['even', '짝', 'g']].forEach(([t, lab, c]) => { const b = el('button', c + (st.t === t ? ' on' : '')); b.append(document.createTextNode(lab), el('small', null, '×2')); b.disabled = st.ph === 'spin'; b.onclick = () => { st.t = t; dtmf(5); draw(); }; G.appendChild(b); });
    // 숫자 하나(×36): 가운데 숫자를 누르면 숫자에 걸기, − + 로 숫자 바꾸기
    const nr = el('div', 'rl-num' + (st.t === 'num' ? ' on' : '')), nv = el('button', 'nv'), mv = d => { if (st.ph === 'spin') return; st.v = (st.v + d + 37) % 37; st.t = 'num'; dtmf(st.v % 10); draw(); };
    nv.append(document.createTextNode(String(st.v)), el('small', null, '×36')); nv.style.background = st.v === 0 ? '#1a9c5b' : RED.has(st.v) ? '#d6245f' : '#151515'; nv.onclick = () => { if (st.ph !== 'spin') { st.t = 'num'; draw(); } };
    const m = el('button', null, '−'), p = el('button', null, '+'); m.setAttribute('aria-label', '숫자 줄이기'); p.setAttribute('aria-label', '숫자 늘리기'); m.onclick = () => mv(-1); p.onclick = () => mv(1); nr.append(m, nv, p); G.appendChild(nr);
    top.appendChild(G);
    B.appendChild(F);
    res(B, st.res || '', st.rk);
    if (st.ph === 'spin') return; if (noCoin(B)) return; betRow(B, draw);
    const what = st.t === 'num' ? `${st.v}` : LAB[st.t];
    act(B, [[`${what}에 걸고 돌리기`, 'go', () => spin(WH)]]);
  }, true);
  function spin(WH) {
    if (ARC.gc() < bet) return; ARC.gcAdd(-bet); dtmf(1);
    const n = Math.random() * 37 | 0, i = ORDER.indexOf(n), wr0 = st.wr, ba0 = st.ba, wr1 = wr0 + 720 + Math.random() * 360, base = wr1 + i * SEG, m = Math.ceil((base - (ba0 - 1440)) / 360), ba1 = base - 360 * m;
    st.ph = 'spin'; st.res = ''; [...document.querySelectorAll('.rl-bets button,.tb-act button,.tb-bet button,.rl-nums button')].forEach(b => b.disabled = true);
    const sp = document.querySelector('.tb-cap span,.talkr span'); if (sp) sp.textContent = '공 굴린다. 눈 떼지 마.';
    const done = () => { st.wr = wr1 % 360; st.ba = ((ba1 % 360) + 360) % 360; st.br = 92; const back = bet * rlWin(st.t, st.v, n); pay(back); st.ph = 'bet';
      st.res = `${n} ${n === 0 ? '초록' : RED.has(n) ? '빨강' : '검정'} — ${back ? `이겼어 +${back - bet}` : `졌어 −${bet}`}`; st.rk = back ? 'w' : 'l';
      st.say = back ? (st.t === 'num' ? '숫자를 맞혀? …너 뭐야, 무섭게.' : '좋아, 이번 판은 네 거.') : (n === 0 ? '0이네. 집이 다 가져가는 날이야.' : '아깝다. 한 번 더 굴려 줄까?'); draw(); };
    if (reduce() || !WH.rot.animate) return done();
    const D = 4200;
    WH.rot.animate([{ transform: `rotate(${wr0}deg)` }, { transform: `rotate(${wr1}deg)` }], { duration: D, easing: 'cubic-bezier(0.15, 0.6, 0.2, 1)', fill: 'forwards' });
    WH.arm.animate([{ transform: `rotate(${ba0}deg)` }, { transform: `rotate(${ba1}deg)` }], { duration: D, easing: 'cubic-bezier(0.1, 0.7, 0.15, 1)', fill: 'forwards' });
    WH.ball.animate([{ transform: `translateY(-${st.br}px)` }, { transform: 'translateY(-128px)', offset: .12 }, { transform: 'translateY(-128px)', offset: .62 }, { transform: 'translateY(-98px)', offset: .78 }, { transform: 'translateY(-106px)', offset: .86 }, { transform: 'translateY(-92px)' }], { duration: D, easing: 'ease-in-out', fill: 'forwards' }).onfinish = done;
  }
  draw();
}

const ORDER = [0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30, 8, 23, 10, 5, 24, 16, 33, 1, 20, 14, 31, 9, 22, 18, 29, 7, 28, 12, 35, 3, 26], SEG = 360 / 37;
function wheel(st) {
  const NS = 'http://www.w3.org/2000/svg', mk = (t, a, p) => { const e = document.createElementNS(NS, t); for (const k in a) e.setAttribute(k, a[k]); if (p) p.appendChild(e); return e; };
  const svg = mk('svg', { viewBox: '-150 -150 300 300', class: 'rl-wheel', role: 'img', 'aria-label': '룰렛 바퀴' });
  const df = mk('defs', {}, svg);
  const g = (id, stops, rad) => { const x = mk(rad ? 'radialGradient' : 'linearGradient', rad ? { id } : { id, x1: 0, y1: 0, x2: 1, y2: 1 }, df); stops.forEach(([o, c]) => mk('stop', { offset: o, 'stop-color': c }, x)); };
  g('rlWood', [[0, '#7a3a17'], [.7, '#4a1f0b'], [1, '#2a1006']], 1); g('rlSil', [[0, '#f4f6f7'], [.5, '#9aa2a8'], [1, '#e6e9eb']]); g('rlCone', [[0, '#8a5a32'], [.6, '#5a3216'], [1, '#2e1608']], 1); g('rlBall', [[0, '#ffffff'], [.7, '#e7e2d6'], [1, '#b9b1a0']], 1);
  mk('circle', { r: 148, fill: 'url(#rlWood)', stroke: '#1a0a04', 'stroke-width': 2 }, svg);
  mk('circle', { r: 135, fill: 'none', stroke: 'url(#rlSil)', 'stroke-width': 9 }, svg);
  mk('circle', { r: 130, fill: '#3a1a0a' }, svg);
  const rot = mk('g', { style: `transform:rotate(${st.wr}deg)` }, svg), P = (r, a) => [r * Math.sin(a * Math.PI / 180), -r * Math.cos(a * Math.PI / 180)];
  ORDER.forEach((n, i) => {
    const a0 = i * SEG - SEG / 2, a1 = a0 + SEG, col = n === 0 ? '#169a54' : RED.has(n) ? '#c8102e' : '#111';
    const w = (r0, r1, c) => { const [x0, y0] = P(r1, a0), [x1, y1] = P(r1, a1), [x2, y2] = P(r0, a1), [x3, y3] = P(r0, a0); mk('path', { d: `M${x0} ${y0}A${r1} ${r1} 0 0 1 ${x1} ${y1}L${x2} ${y2}A${r0} ${r0} 0 0 0 ${x3} ${y3}Z`, fill: c }, rot); };
    w(100, 126, col); w(82, 100, n === 0 ? '#0e6b3a' : RED.has(n) ? '#7d0a1d' : '#0a0a0a');
    const [lx, ly] = P(82, a0), [ox, oy] = P(126, a0); mk('line', { x1: lx, y1: ly, x2: ox, y2: oy, stroke: '#c9ced2', 'stroke-width': 1.2 }, rot);
    const t = mk('text', { x: 0, y: -109, 'text-anchor': 'middle', 'dominant-baseline': 'middle', fill: '#fff', 'font-size': 11, 'font-weight': 700, 'font-family': 'Space Mono,monospace', transform: `rotate(${i * SEG})` }, rot); t.textContent = n;
  });
  mk('circle', { r: 100, fill: 'none', stroke: '#c9ced2', 'stroke-width': 1.5 }, rot); mk('circle', { r: 82, fill: 'url(#rlCone)', stroke: '#c9ced2', 'stroke-width': 2 }, rot);
  [0, 90, 180, 270].forEach(a => mk('rect', { x: -4, y: -46, width: 8, height: 30, rx: 4, fill: 'url(#rlSil)', transform: `rotate(${a})` }, rot));
  mk('circle', { r: 22, fill: 'url(#rlSil)', stroke: '#6b7277', 'stroke-width': 1.5 }, rot); mk('circle', { r: 10, fill: '#dfe3e6', stroke: '#8a9196', 'stroke-width': 1 }, rot);
  const arm = mk('g', { style: `transform:rotate(${st.ba}deg)` }, svg), ball = mk('g', { style: `transform:translateY(-${st.br}px)` }, arm);
  mk('circle', { r: 6.5, fill: 'url(#rlBall)', stroke: '#8d8574', 'stroke-width': .8 }, ball);
  return { svg, rot, arm, ball };
}
const IM = n => `assets/lena/${n}.webp`;
ARC.reg({ id: 'bj', order: 1, name: '블랙잭', icon: IM('st_heart'), color: '#ff3d9a', cost: 0, sub: () => '21에 가깝게 — 레나와 한 판', start: blackjack });
ARC.reg({ id: 'hilo', order: 2, name: '하이로우', icon: IM('st_star'), color: '#2fe0c8', cost: 0, sub: () => '다음 장이 높을까 낮을까', start: hilo });
ARC.reg({ id: 'rl', order: 3, name: '룰렛', icon: IM('s/d_disco'), color: '#f2ea3a', cost: 0, sub: () => '색·홀짝·숫자에 걸기', start: roulette });
})();
