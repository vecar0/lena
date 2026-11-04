// 레나 — 오락실 (다이얼 8번): 해골 딜러 블랙잭, 해골 빚 슬롯
// app.js의 전역(S, save, el, $, btn, row, lbl, pick, tone, coinSound, dtmf, toast, SH, openSheet, closeSheet, refreshSheet, dk, sleep, nmc)을 쓴다.
'use strict';
(() => {
const css = `
.arc{position:absolute;inset:0;z-index:45;display:none;flex-direction:column;background:#0b0d11;overflow:hidden}
.arc.on{display:flex}
.arc::before{content:"";position:absolute;inset:0;pointer-events:none;background:radial-gradient(rgba(255,255,255,.04) 1px,transparent 1.2px) 0 0/4px 4px,radial-gradient(ellipse at 50% 0%,rgba(255,61,154,.18),transparent 60%),radial-gradient(ellipse at 50% 100%,rgba(47,224,200,.14),transparent 60%)}
.ahd{position:relative;display:flex;align-items:center;gap:10px;padding:calc(var(--st) + 12px) 14px 8px}
.ahd h2{font-family:'Black Han Sans';font-weight:400;font-size:22px;text-shadow:2px 2px 0 var(--pink);flex:1;line-height:1.1}
.gcb{display:flex;align-items:center;gap:5px;height:34px;padding:0 12px 0 6px;border-radius:17px;background:rgba(0,0,0,.6);border:1px solid var(--line);font-family:'Space Mono',monospace;font-weight:700;font-size:15px;color:var(--yel)}
.gcb img{width:24px;height:24px}
.abody{position:relative;flex:1;overflow-y:auto;padding:4px 14px calc(var(--sb) + 16px);display:flex;flex-direction:column;gap:12px}
.talkr{display:flex;align-items:center;gap:10px;min-height:52px;padding:8px 12px;background:rgba(0,0,0,.5);border:1px solid var(--line);border-radius:14px}
.talkr i{width:38px;height:38px;flex:none;border-radius:50%;background:url(assets/lena/cat.jpg) center/cover;border:2px solid #000;box-shadow:2px 2px 0 var(--pink)}
.talkr i.sk{background:#151515 url(assets/lena/st_skull.webp) center/80% no-repeat;box-shadow:2px 2px 0 var(--teal)}
.talkr span{font-size:14.5px;font-weight:700;line-height:1.45;word-break:keep-all}
.gcards{display:grid;gap:12px}
.gcard{display:flex;align-items:center;gap:14px;padding:14px;border-radius:16px;background:var(--panel2);border:2px solid #000;box-shadow:4px 4px 0 var(--pink);text-align:left}
.gcard:nth-child(2){box-shadow:4px 4px 0 var(--teal)}
.gcard img{width:62px;height:62px;flex:none}
.gcard b{display:block;font-family:'Black Han Sans';font-weight:400;font-size:20px}
.gcard small{display:block;font-size:12.5px;color:var(--mute);margin-top:3px;line-height:1.45;word-break:keep-all}
/* blackjack */
.felt{border-radius:18px;padding:12px;background:radial-gradient(ellipse at 50% 40%,#16483f,#0b231f);border:3px solid #000;box-shadow:inset 0 0 0 2px rgba(47,224,200,.25),5px 5px 0 var(--pink)}
.hand{display:flex;flex-direction:column;gap:6px;min-height:118px}
.hand h4{display:flex;justify-content:space-between;font-family:'Space Mono',monospace;font-size:12px;color:var(--mint);letter-spacing:1px}
.cards{display:flex;gap:6px;flex-wrap:wrap}
.cd{width:54px;height:78px;border-radius:7px;background:#f6f2ea;border:2px solid #111;box-shadow:2px 3px 0 rgba(0,0,0,.5);color:#111;position:relative;font-family:'Space Mono',monospace;font-weight:700;animation:deal .28s var(--ease)}
.cd.r{color:#e0247a}
.cd b{position:absolute;left:5px;top:3px;font-size:16px;line-height:1}
.cd span{position:absolute;right:5px;bottom:2px;font-size:24px;line-height:1}
.cd.back{background:repeating-linear-gradient(45deg,#ff3d9a 0 6px,#d81f73 6px 12px);}
.cd.back::after{content:"";position:absolute;inset:16px 10px;background:url(assets/lena/st_skull.webp) center/contain no-repeat}
@keyframes deal{from{transform:translateY(-30px) rotate(-8deg);opacity:0}}
.mid{height:1px;background:rgba(255,255,255,.12);margin:10px 0}
.bets{display:flex;gap:8px;justify-content:center}
.bets button{width:56px;height:56px;border-radius:50%;border:3px dashed #111;font-family:'Space Mono',monospace;font-weight:700;font-size:16px;background:var(--yel);color:#111;box-shadow:2px 3px 0 #000}
.bets button.on{background:var(--pink);color:#fff;transform:translateY(-3px)}
.bets button:disabled{opacity:.35}
.acts{display:flex;gap:8px}
.acts .btn{flex:1}
.res{font-family:'Black Han Sans';font-size:26px;text-align:center;text-shadow:2px 2px 0 #000;min-height:32px}
.res.w{color:var(--yel)}.res.l{color:var(--hot)}
/* slot */
.mach{border-radius:22px;padding:12px;background:linear-gradient(#22262e,#14171c);border:3px solid #000;box-shadow:0 0 0 3px var(--pink),0 0 22px rgba(255,61,154,.45),6px 8px 0 #000}
.stat{display:grid;grid-template-columns:repeat(3,1fr);gap:6px;margin-bottom:10px}
.stat div{background:#0d1f17;border:2px solid #000;border-radius:8px;padding:5px 6px;text-align:center;font-family:'Space Mono',monospace}
.stat small{display:block;font-size:10px;color:#7dffb5;opacity:.75;letter-spacing:1px}
.stat b{display:block;font-size:17px;color:#7dffb5;text-shadow:0 0 6px rgba(125,255,181,.6)}
.stat .due b{color:#ff8fb6;text-shadow:0 0 6px rgba(255,61,154,.6)}
.grid{display:grid;grid-template-columns:repeat(5,1fr);gap:5px;background:#000;padding:5px;border-radius:12px}
.cell{aspect-ratio:1;border-radius:8px;background:#f6f2ea;display:grid;place-items:center;position:relative;overflow:hidden}
.cell img{width:82%;height:82%;object-fit:contain}
.cell.spin img{filter:blur(1.5px);transform:translateY(4px)}
.cell.hit{background:#fff36b;box-shadow:inset 0 0 0 3px var(--pink);animation:hit .5s var(--ease) 2}
@keyframes hit{50%{transform:scale(.9)}}
.gain{font-family:'Black Han Sans';font-size:30px;text-align:center;color:var(--yel);text-shadow:3px 3px 0 #000;min-height:36px;margin-top:6px}
.lever{width:100%;height:58px;border-radius:14px;background:linear-gradient(#ff6fb6,#e0247a);border:3px solid #000;box-shadow:0 4px 0 #000;font-family:'Black Han Sans';font-size:22px;color:#fff;letter-spacing:2px;margin-top:10px}
.lever:active{transform:translateY(3px);box-shadow:0 1px 0 #000}
.lever:disabled{filter:grayscale(.6);opacity:.6}
.charms{display:flex;gap:6px;flex-wrap:wrap;min-height:34px}
.charm{display:flex;align-items:center;gap:6px;height:32px;padding:0 10px 0 4px;border-radius:16px;background:var(--panel2);border:1px solid var(--line);font-size:12.5px;font-weight:700}
.charm img{width:24px;height:24px}
.shop{display:grid;gap:10px}
.offer{display:flex;align-items:center;gap:10px;padding:10px;border-radius:14px;background:var(--paper);color:#111;border:2px solid #000;box-shadow:3px 3px 0 var(--teal)}
.offer img{width:44px;height:44px;flex:none}
.offer div{flex:1}.offer b{font-size:15px;font-weight:800}.offer small{display:block;font-size:12.5px;opacity:.75;margin-top:2px;line-height:1.4;word-break:keep-all}
.offer .btn{height:40px;padding:0 12px;font-size:14px}
.rules{font-size:13px;color:#cfd8dc;line-height:1.6;word-break:keep-all;background:rgba(0,0,0,.4);border:1px solid var(--line);border-radius:12px;padding:10px 12px}
.rules b{color:var(--mint)}
`;
document.head.appendChild(Object.assign(document.createElement('style'), { textContent: css }));
const A = el('div', 'arc'); A.id = 'arc'; $('app').appendChild(A);
const img = n => `assets/lena/${n}.webp`;

// ---------- 게임 동전 ----------
function gcInit() {
  if (S.gc == null) S.gc = 10;
  const t = dk(new Date());
  if (S.gcDay !== t) { S.gcDay = t; S.gc = Math.min(99, (S.gc || 0) + 10); S.gcLoan = ''; save(); return true; }
  return false;
}
const gc = () => S.gc || 0;
function gcAdd(n) { S.gc = Math.max(0, Math.min(999, gc() + n)); save(); hdr(); }

// ---------- 화면 틀 ----------
let cur = '';
function frame(title, body, back) {
  A.innerHTML = '';
  const h = el('div', 'ahd');
  if (back) { const b = el('button', 'sx'); b.innerHTML = '<svg viewBox="0 0 24 24"><path d="M14.5 6l-6 6 6 6"/></svg>'; b.onclick = () => { dtmf('*'); hub(); }; h.appendChild(b); }
  h.appendChild(el('h2', null, title));
  const g = el('div', 'gcb'); g.id = 'gcb'; h.appendChild(g);
  const x = el('button', 'sx'); x.innerHTML = '<svg viewBox="0 0 24 24"><path d="M7 7l10 10M17 7L7 17"/></svg>'; x.onclick = closeArc; h.appendChild(x);
  const B = el('div', 'abody'); A.append(h, B); body(B); hdr();
}
function hdr() { const g = $('gcb'); if (!g) return; g.innerHTML = ''; const i = el('img'); i.src = img('st_coin'); i.alt = ''; g.append(i, document.createTextNode(gc())); }
function talk(B, who, t) { const r = el('div', 'talkr'), i = el('i', who === 'sk' ? 'sk' : ''); const s = el('span', null, t); r.append(i, s); B.appendChild(r); return s; }
function openArc() { const fresh = gcInit(); A.classList.add('on'); hub(fresh); }
function closeArc() { A.classList.remove('on'); cur = ''; if (typeof renderHome === 'function') renderHome(); }
window.openArc = openArc;

function hub(fresh) {
  cur = 'hub';
  frame('오락실', B => {
    talk(B, 'l', fresh ? `${nmc()}오늘 게임 동전 10개 넣어 뒀어요. …다 잃어도 울지 마요.` : pick(['한 판 해요? 저 보는 앞에서 지면 더 재밌는데.', '해골이 카드 섞고 기다려요.', '오늘은 운 좋은 얼굴이네요.']));
    const G = el('div', 'gcards');
    const c1 = el('button', 'gcard'), i1 = el('img'); i1.src = img('st_skull'); i1.alt = ''; const t1 = el('div'); t1.append(el('b', null, '해골 딜러 블랙잭'), el('small', null, '21에 가깝게. 해골이 딜러, 레나가 훈수. 동전 걸고 한 판.')); c1.append(i1, t1); c1.onclick = () => { dtmf(1); bj(); };
    const c2 = el('button', 'gcard'), i2 = el('img'); i2.src = img('st_lips'); i2.alt = ''; const t2 = el('div'); const best = S.slotBest || 0; t2.append(el('b', null, '해골 빚 슬롯'), el('small', null, `밤마다 해골에게 빚을 갚아요. 부적으로 기계를 길들여서 얼마나 버틸까. 입장 동전 3개 · 최고 기록 ${best}밤`)); c2.append(i2, t2); c2.onclick = () => { dtmf(2); slotEnter(); };
    G.append(c1, c2); B.appendChild(G);
    B.appendChild(el('div', 'rules', '게임 동전은 매일 10개씩 들어와요(최대 99). 다 잃으면 하루 한 번 레나가 3개 빌려줘요. 할 일을 떼고 받는 동전과는 따로예요.'));
    if (gc() < 1) B.appendChild(row(btn('레나에게 동전 빌리기', 'wide', () => { if (S.gcLoan === dk(new Date())) { toast('오늘은 이미 빌렸어요. 내일 또 와요.'); return; } S.gcLoan = dk(new Date()); gcAdd(3); coinSound(); hub(); })));
    const sp = el('div', 'rules'); sp.innerHTML = `할 일 동전 <b>${S.coins}</b>개 · 3개로 레나와 <b>특별 통화</b>(길게 칭찬)`;
    B.appendChild(sp);
    B.appendChild(row(btn('할 일 동전 3개로 특별 통화', 'ghost wide', () => { if (S.coins < 3) { toast(`할 일 동전이 ${3 - S.coins}개 모자라요.`); return; } S.coins -= 3; save(); closeArc(); openCall(); setTimeout(() => sendText('(동전 3개를 넣었어. 특별 통화로 칭찬이랑 응원 듬뿍 해줘)', true), 500); })));
  });
}

// ---------- 블랙잭 ----------
const SU = ['♠', '♥', '♦', '♣'], RK = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
let D = null, bet = 1, bjS = null;
function deck() { const d = []; for (let k = 0; k < 4; k++) for (const s of SU) for (const r of RK) d.push({ s, r }); for (let i = d.length - 1; i > 0; i--) { const j = Math.random() * (i + 1) | 0; [d[i], d[j]] = [d[j], d[i]]; } return d; }
function val(h) { let t = 0, a = 0; h.forEach(c => { if (c.r === 'A') { a++; t += 11; } else t += /[JQK]/.test(c.r) ? 10 : +c.r; }); while (t > 21 && a) { t -= 10; a--; } return t; }
function soft(h) { let t = 0, a = 0; h.forEach(c => { if (c.r === 'A') { a++; t += 11; } else t += /[JQK]/.test(c.r) ? 10 : +c.r; }); while (t > 21 && a) { t -= 10; a--; } return a > 0 && t <= 21; }
function cardEl(c, hide) { const d = el('div', 'cd' + (hide ? ' back' : (c.s === '♥' || c.s === '♦') ? ' r' : '')); if (!hide) d.append(el('b', null, c.r), el('span', null, c.s)); return d; }
function advise(p, up) {
  const t = val(p), u = up.r === 'A' ? 11 : /[JQK]/.test(up.r) ? 10 : +up.r, sf = soft(p);
  if (sf) return t >= 19 || (t === 18 && u <= 8) ? '멈추기' : '한 장 더';
  if (t >= 17) return '멈추기'; if (t <= 11) return t >= 10 && p.length === 2 && u < t ? '두 배' : '한 장 더';
  if (t === 12) return u >= 4 && u <= 6 ? '멈추기' : '한 장 더';
  return u <= 6 ? '멈추기' : '한 장 더';
}
function bj() {
  cur = 'bj'; if (!D || D.length < 20) D = deck(); bjS = { st: 'bet' }; bet = Math.max(1, Math.min(bet, gc() || 1)); bjDraw();
}
function bjDraw(msg, res) {
  frame('해골 딜러 블랙잭', B => {
    const F = el('div', 'felt');
    const dh = el('div', 'hand'), dv = bjS.st === 'play' ? '?' : bjS.d ? val(bjS.d) : '';
    dh.appendChild(el('h4')).append(document.createTextNode('해골 (딜러)'), el('span', null, dv === '' ? '' : '합 ' + dv));
    const dc = el('div', 'cards'); (bjS.d || []).forEach((c, i) => dc.appendChild(cardEl(c, bjS.st === 'play' && i === 1))); dh.appendChild(dc);
    const ph = el('div', 'hand'); ph.appendChild(el('h4')).append(document.createTextNode(`${S.name || '나'} · 건 동전 ${bjS.bet || bet}`), el('span', null, bjS.p ? '합 ' + val(bjS.p) : ''));
    const pc = el('div', 'cards'); (bjS.p || []).forEach(c => pc.appendChild(cardEl(c))); ph.appendChild(pc);
    F.append(dh, el('div', 'mid'), ph); B.appendChild(F);
    const R = el('div', 'res' + (res ? ' ' + res : ''), msg || ''); B.appendChild(R);
    if (bjS.st === 'play') {
      talk(B, 'l', `저라면… ${advise(bjS.p, bjS.d[0])}. 믿어 봐요.`);
      const a = el('div', 'acts');
      a.append(btn('한 장 더', 'teal', () => { dtmf(2); bjS.p.push(D.pop()); if (val(bjS.p) > 21) bjEnd(); else if (val(bjS.p) === 21) bjDealer(); else bjDraw(); }), btn('멈추기', '', () => { dtmf(3); bjDealer(); }));
      if (bjS.p.length === 2 && gc() >= bjS.bet) a.appendChild(btn('두 배', 'ghost', () => { dtmf(4); gcAdd(-bjS.bet); bjS.bet *= 2; bjS.p.push(D.pop()); if (val(bjS.p) > 21) bjEnd(); else bjDealer(); }));
      B.appendChild(a);
    } else {
      talk(B, bjS.st === 'bet' && !msg ? 'sk' : 'l', bjS.say || (gc() ? '(해골이 카드를 섞으며 턱을 딸깍인다)' : '동전이 없네요. 오락실 첫 화면에서 빌려 가요.'));
      const bs = el('div', 'bets'); [1, 2, 5, 10].forEach(v => { const b = el('button', bet === v ? 'on' : '', v); b.disabled = v > gc(); b.onclick = () => { bet = v; dtmf(v % 10); bjDraw(msg, res); }; bs.appendChild(b); }); B.appendChild(bs);
      B.appendChild(row(btn(msg ? '한 판 더' : '카드 받기', 'wide', bjDeal)));
      B.appendChild(el('div', 'rules', '<b>규칙</b> 카드 합이 21에 가까우면 이겨요. 21을 넘으면 져요. A는 1이나 11, 그림 카드는 10. 해골은 16 이하면 무조건 더 받고 17부터 멈춰요. 처음 두 장이 21(블랙잭)이면 1.5배.'));
      B.lastChild.innerHTML = B.lastChild.textContent.replace('규칙', '<b>규칙</b>');
    }
  }, true);
}
function bjDeal() {
  if (gc() < 1) { toast('게임 동전이 없어요.'); return; } if (bet > gc()) bet = gc();
  if (!D || D.length < 20) D = deck();
  gcAdd(-bet); bjS = { st: 'play', bet, p: [D.pop(), D.pop()], d: [D.pop(), D.pop()] }; tone([520], .06, .05);
  const pb = val(bjS.p) === 21, db = val(bjS.d) === 21;
  if (pb || db) { bjS.st = 'end'; if (pb && db) return bjPay(bjS.bet, '둘 다 블랙잭. 비겼어요.', '', '…이런 우연이. 운명인가 봐요?'); if (pb) return bjPay(bjS.bet + Math.floor(bjS.bet * 1.5), '블랙잭!', 'w', pick(['어머, 블랙잭? 오늘 무슨 날이에요?', '와. 반할 뻔했어요.'])); return bjPay(0, '해골 블랙잭…', 'l', '(해골이 조용히 동전을 쓸어 간다) …아파라.'); }
  bjDraw();
}
async function bjDealer() {
  bjS.st = 'dealer'; bjDraw();
  while (val(bjS.d) < 17) { await sleep(520); bjS.d.push(D.pop()); tone([440], .05, .04); bjDraw(); }
  await sleep(380); bjEnd();
}
function bjEnd() {
  bjS.st = 'end'; const p = val(bjS.p), d = val(bjS.d);
  if (p > 21) return bjPay(0, '버스트!', 'l', pick(['욕심 냈죠? 귀엽네.', '…넘었어요. 해골이 웃는 거 봤어요?']));
  if (d > 21) return bjPay(bjS.bet * 2, '해골 버스트! 이겼어요', 'w', pick(['해골이 넘었어요. 오늘 운 좋네요.', '봐요, 제 훈수 덕분이죠?']));
  if (p > d) return bjPay(bjS.bet * 2, `${p} 대 ${d} · 이겼어요`, 'w', pick(['멋있었어요. …진짜로.', '이긴 김에 저한테 한턱 쏴요.']));
  if (p === d) return bjPay(bjS.bet, `${p} 대 ${d} · 비겼어요`, '', '비겼네요. 다시 해요.');
  return bjPay(0, `${p} 대 ${d} · 졌어요`, 'l', pick(['졌다. …위로해 줄까요?', '해골이 오늘 독하네요.']));
}
function bjPay(n, msg, res, say) { if (n) { gcAdd(n); coinSound(); } bjS.say = say; bjS.st = 'end'; bjDraw(msg + (n > (bjS.bet || 0) ? `  +${n - bjS.bet}` : ''), res); }

// ---------- 해골 빚 슬롯 ----------
const SYM = { coin: { w: 30, v: 1, n: '동전' }, heart: { w: 22, v: 2, n: '하트' }, lips: { w: 18, v: 3, n: '입술' }, bolt: { w: 14, v: 3, n: '번개' }, star: { w: 10, v: 5, n: '별' }, skull: { w: 6, v: 0, n: '해골' } };
const SIMG = { coin: 'st_coin', heart: 'st_heart', lips: 'st_lips', bolt: 'st_bolt', star: 'st_star', skull: 'st_skull' };
const CH = [
  { id: 'lip', n: '레나의 립스틱', d: '입술 값 +3', p: 14, i: 'st_lips' },
  { id: 'hrt', n: '네온 하트', d: '하트가 두 배 잘 나와요', p: 16, i: 'st_heart' },
  { id: 'cn', n: '행운의 동전', d: '동전 값 ×3', p: 14, i: 'st_coin' },
  { id: 'sk', n: '해골 손', d: '해골(아무 그림 대신)이 두 배 잘 나와요', p: 22, i: 'st_skull' },
  { id: 'bt', n: '번개 배터리', d: '번개 줄 보상 ×2', p: 18, i: 'st_bolt' },
  { id: 'st', n: '별빛 선글라스', d: '별 값 +4', p: 18, i: 'st_star' },
  { id: 'ph', n: '여분의 수화기', d: '매 밤 돌리기 +2번', p: 24, i: 'st_phone' },
  { id: 'bk', n: '외상 장부', d: '갚을 빚 −15%', p: 26, i: 'st_tape' },
  { id: 'col', n: '세로 테이프', d: '세로줄 보상 ×3', p: 16, i: 'st_peace' },
  { id: 'dg', n: '사선 스티커', d: '대각선 보상 ×2', p: 16, i: 'st_star' },
  { id: 'jp', n: '잭팟 껌', d: '가로 5칸 보상 ×2', p: 12, i: 'st_heart' },
  { id: 'rr', n: '다시 걸기', d: '꽝이면 매 밤 한 번 공짜로 다시', p: 20, i: 'st_phone' }
];
const has = id => (R && R.ch.includes(id));
let R = null, spinning = false;
function quota(n) { return Math.round(30 * Math.pow(1.55, n - 1) * (has('bk') ? .85 : 1)); }
function spinsPer() { return 7 + (has('ph') ? 2 : 0); }
function slotEnter() {
  R = S.slotRun || null;
  if (R) return slotDraw();
  frame('해골 빚 슬롯', B => {
    talk(B, 'sk', '(해골이 두꺼운 장부를 펼쳐 보인다. 첫 장에 당신 이름이 적혀 있다)');
    talk(B, 'l', '빚 갚는 게임이에요. 밤마다 정해진 만큼 벌어서 해골한테 갚으면 돼요. …못 갚으면? 끝이죠, 뭐.');
    const r = el('div', 'rules'); r.innerHTML = '<b>하는 법</b><br>· 밤마다 레버를 <b>7번</b> 당길 수 있어요. 5×3칸에 그림이 나와요.<br>· 같은 그림이 <b>가로로 3칸 이상</b>, <b>세로 3칸</b>, <b>대각선 3칸</b> 이어지면 칩을 벌어요. 해골은 아무 그림 대신이 돼요.<br>· 그림 값: 동전 1 · 하트 2 · 입술 3 · 번개 3 · 별 5. 가로 3칸 ×2, 4칸 ×5, 5칸 ×12, 세로 ×3, 대각선 ×2.<br>· 밤이 끝나면 벌어 둔 칩으로 <b>빚</b>을 갚아요. 남은 칩으로 <b>부적</b>을 사서 기계를 유리하게 바꿔요.<br>· 빚은 밤마다 커져요. 못 갚으면 끝. 버틴 밤 × 3개만큼 게임 동전을 받아요.';
    B.appendChild(r);
    B.appendChild(row(btn(gc() >= 3 ? '동전 3개 넣고 시작' : '동전이 모자라요 (3개 필요)', 'wide', () => { if (gc() < 3) { toast('게임 동전이 모자라요.'); return; } gcAdd(-3); coinSound(); R = { night: 1, spins: 7, chips: 0, ch: [], rr: true, grid: null, offers: null }; R.spins = spinsPer(); S.slotRun = R; save(); slotDraw(); })));
  }, true);
}
function roll() { const w = Object.entries(SYM).map(([k, s]) => [k, s.w * (k === 'heart' && has('hrt') ? 2 : 1) * (k === 'skull' && has('sk') ? 2 : 1)]); const t = w.reduce((a, x) => a + x[1], 0); let r = Math.random() * t; for (const [k, x] of w) if ((r -= x) < 0) return k; return 'coin'; }
function sv(k) { return SYM[k].v + (k === 'lips' && has('lip') ? 3 : 0) + (k === 'star' && has('st') ? 4 : 0) * 1 + 0 || 0; }
function symVal(k) { let v = SYM[k].v; if (k === 'lips' && has('lip')) v += 3; if (k === 'star' && has('st')) v += 4; if (k === 'coin' && has('cn')) v *= 3; return v; }
function score(g) {
  let tot = 0; const hits = new Set(), lines = [];
  const add = (cells, base, mul, kind) => { let m = mul; if (base === 'bolt' && has('bt')) m *= 2; const v = symVal(base) * m; if (v <= 0) return; tot += v; cells.forEach(([r, c]) => hits.add(r * 5 + c)); lines.push(kind); };
  for (let r = 0; r < 3; r++) { let c = 0; while (c < 5) { let base = null, e = c; for (; e < 5; e++) { const s = g[r][e]; if (base === null && s !== 'skull') base = s; if (!(s === 'skull' || base === null || s === base)) break; } const L = e - c; if (L >= 3) { add([...Array(L)].map((_, i) => [r, c + i]), base || 'star', L === 3 ? 2 : L === 4 ? 5 : 12 * (has('jp') ? 2 : 1), '가로'); c = e; } else c++; } }
  for (let c = 0; c < 5; c++) { const col = [g[0][c], g[1][c], g[2][c]], b = col.find(s => s !== 'skull') || 'star'; if (col.every(s => s === 'skull' || s === b)) add([[0, c], [1, c], [2, c]], b, 3 * (has('col') ? 3 : 1), '세로'); }
  for (let c = 0; c < 3; c++) for (const d of [[[0, 0], [1, 1], [2, 2]], [[2, 0], [1, 1], [0, 2]]]) { const cells = d.map(([r, k]) => [r, c + k]), sy = cells.map(([r, k]) => g[r][k]), b = sy.find(s => s !== 'skull') || 'star'; if (sy.every(s => s === 'skull' || s === b)) add(cells, b, 2 * (has('dg') ? 2 : 1), '대각'); }
  return { tot, hits, lines };
}
function slotDraw(gain, hits) {
  cur = 'slot';
  frame('해골 빚 슬롯', B => {
    const M = el('div', 'mach'), st = el('div', 'stat');
    [['NIGHT', R.night, ''], ['CHIPS', R.chips, ''], ['DEBT', quota(R.night), 'due']].forEach(([a, b, c]) => { const d = el('div', c); d.append(el('small', null, a), el('b', null, b)); st.appendChild(d); });
    M.appendChild(st);
    const G = el('div', 'grid'); G.id = 'sgrid';
    const g = R.grid || [0, 1, 2].map(() => [0, 1, 2, 3, 4].map(roll));
    for (let r = 0; r < 3; r++) for (let c = 0; c < 5; c++) { const cell = el('div', 'cell' + (hits && hits.has(r * 5 + c) ? ' hit' : '')), i = el('img'); i.src = img(SIMG[g[r][c]]); i.alt = SYM[g[r][c]].n; cell.appendChild(i); G.appendChild(cell); }
    M.appendChild(G);
    M.appendChild(el('div', 'gain', gain == null ? '' : gain ? `+${gain}` : '꽝'));
    if (!R.offers) {
      const L = el('button', 'lever', R.spins > 0 ? `레버 당기기 · 남은 ${R.spins}번` : '빚 갚으러 가기'); L.id = 'lever';
      L.onclick = () => R.spins > 0 ? spin() : settle(); M.appendChild(L);
    }
    B.appendChild(M);
    if (R.offers) shop(B);
    else talk(B, R.chips >= quota(R.night) ? 'l' : 'sk', R.say || (R.chips >= quota(R.night) ? '빚은 다 모았어요. 남은 건 더 벌어서 부적 사요.' : `(해골이 장부를 톡톡 친다) 오늘 밤 갚을 빚 ${quota(R.night)}.`));
    const C = el('div', 'charms'); if (!R.ch.length) C.appendChild(el('span', 'hint', '부적 없음 — 밤을 넘기면 살 수 있어요')); R.ch.forEach(id => { const x = CH.find(c => c.id === id); const t = el('div', 'charm'), i = el('img'); i.src = img(x.i); i.alt = ''; t.append(i, document.createTextNode(x.n)); t.title = x.d; t.onclick = () => toast(`${x.n}: ${x.d}`); C.appendChild(t); });
    B.append(lbl('내 부적 (최대 5개)'), C);
    B.appendChild(row(btn('그만두기', 'ghost wide', () => { if (!confirm('이번 판을 그만둘까요? 버틴 밤만큼 동전을 받아요.')) return; over(true); })));
  }, true);
}
async function spin() {
  if (spinning || R.spins <= 0) return; spinning = true; R.spins--; R.say = '';
  const g = [0, 1, 2].map(() => [0, 1, 2, 3, 4].map(roll));
  const cells = [...document.querySelectorAll('#sgrid .cell')], lv = $('lever'); if (lv) lv.disabled = true;
  cells.forEach(c => { c.classList.remove('hit'); c.classList.add('spin'); });
  const keys = Object.keys(SYM); const t0 = Date.now();
  const iv = setInterval(() => cells.forEach(c => { if (c.classList.contains('spin')) c.firstChild.src = img(SIMG[pick(keys)]); }), 70);
  for (let c = 0; c < 5; c++) { await sleep(c ? 220 : 480); for (let r = 0; r < 3; r++) { const cell = cells[r * 5 + c]; cell.classList.remove('spin'); cell.firstChild.src = img(SIMG[g[r][c]]); } tone([300 + c * 70], .05, .05, 'square'); }
  clearInterval(iv);
  let s = score(g);
  if (!s.tot && has('rr') && R.rr) { R.rr = false; R.spins++; R.say = '(다시 걸기 부적이 반짝였다) 꽝은 없던 걸로 해요.'; }
  R.grid = g; R.chips += s.tot; S.slotRun = R; save();
  if (s.tot >= 20) { coinSound(); setTimeout(coinSound, 180); } else if (s.tot) coinSound();
  if (!R.say) R.say = s.tot >= 40 ? pick(['대박! …지금 저 보고 웃은 거 맞죠?', '와, 기계가 송휘님한테 반했나 봐요.']) : s.tot >= 15 ? pick(['좋아요, 그 손맛.', '해골이 장부에 뭔가 적다가 멈췄어요.']) : s.tot ? pick(['조금씩이라도 모아요.', '티끌 모아 빚 갚기.']) : pick(['꽝. …괜찮아요, 저 아직 여기 있어요.', '(해골이 어깨를 으쓱한다)']);
  spinning = false; slotDraw(s.tot, s.hits);
}
function settle() {
  const q = quota(R.night);
  if (R.chips < q) return over(false);
  R.chips -= q; R.night++; R.spins = spinsPer(); R.rr = true; R.grid = null;
  const pool = CH.filter(c => !R.ch.includes(c.id)); R.offers = []; while (R.offers.length < 3 && pool.length) R.offers.push(pool.splice(Math.random() * pool.length | 0, 1)[0].id);
  R.say = ''; S.slotBest = Math.max(S.slotBest || 0, R.night - 1); S.slotRun = R; save(); coinSound();
  slotDraw();
}
function shop(B) {
  talk(B, 'l', `빚 갚았어요! ${R.night - 1}번째 밤 통과. 남은 칩 ${R.chips}개로 부적 하나 골라 봐요.`);
  const S2 = el('div', 'shop');
  R.offers.forEach(id => { const x = CH.find(c => c.id === id), price = Math.round(x.p * (1 + (R.night - 2) * .15)); const o = el('div', 'offer'), i = el('img'); i.src = img(x.i); i.alt = ''; const t = el('div'); t.append(el('b', null, x.n), el('small', null, `${x.d} · ${price}칩`));
    const b = btn('사기', '', () => { if (R.chips < price) { toast('칩이 모자라요.'); return; } if (R.ch.length >= 5) { toast('부적은 5개까지예요.'); return; } R.chips -= price; R.ch.push(id); R.offers = R.offers.filter(y => y !== id); if (id === 'ph') R.spins = spinsPer(); S.slotRun = R; save(); coinSound(); slotDraw(); });
    b.disabled = R.chips < price || R.ch.length >= 5; o.append(i, t, b); S2.appendChild(o); });
  B.appendChild(S2);
  B.appendChild(row(btn(`${R.night}번째 밤 시작 · 빚 ${quota(R.night)}`, 'teal wide', () => { R.offers = null; R.say = ''; S.slotRun = R; save(); slotDraw(); })));
}
function over(quit) {
  const n = R.night - 1, reward = n * 3; S.slotBest = Math.max(S.slotBest || 0, n); S.slotRun = null; save(); if (reward) gcAdd(reward);
  frame('해골 빚 슬롯', B => {
    B.appendChild(el('div', 'res l', quit ? '그만뒀어요' : '빚을 못 갚았어요'));
    talk(B, 'sk', '(해골이 장부를 덮는다. 쿵.)');
    talk(B, 'l', n ? `${n}밤 버텼어요. 게임 동전 ${reward}개 받아 가요. …다음엔 더 오래 버텨 봐요.` : '첫날 밤에 끝났네요. …괜찮아요, 제가 위로해 줄게요.');
    B.appendChild(el('div', 'rules', `최고 기록 ${S.slotBest}밤`));
    B.appendChild(row(btn('다시 하기', 'wide', () => { R = null; slotEnter(); }), btn('오락실로', 'ghost wide', hub)));
  }, true);
  R = null;
}

// 다이얼 8번 = 오락실
SH[8] = { t: '오락실', s: '', r: () => {}, open: () => { closeSheet(); openArc(); } };
})();
