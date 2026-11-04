// 오락실 — 해골과 카드 대결 (덱 빌딩 로그라이크): 지하 클럽 10층을 내려간다
'use strict';
(() => {
const { frame, talk, gcAdd, gimg, img } = ARC;
const css = `
.cb{position:relative;flex:1;min-height:0;display:flex;flex-direction:column;background:radial-gradient(ellipse at 50% 20%,rgba(255,61,154,.25),transparent 60%),url(assets/lena/g/ban_cards.jpg) center 20%/cover;overflow:hidden;user-select:none;-webkit-user-select:none}
.cb::before{content:"";position:absolute;inset:0;background:linear-gradient(rgba(6,7,10,.72),rgba(6,7,10,.86))}
.cb>*{position:relative}
.cbt{display:flex;justify-content:space-between;padding:8px 12px 0;font-family:'Space Mono',monospace;font-size:12px;color:var(--mint)}
.foe{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px;min-height:0;padding:4px}
.intent{display:flex;align-items:center;gap:6px;padding:5px 12px;border-radius:14px;background:#111;border:2px solid var(--pink);font-weight:800;font-size:14px;box-shadow:2px 2px 0 #000}
.intent.d{border-color:var(--teal)}.intent.b{border-color:var(--yel)}
.foe img{height:min(30vh,210px);max-width:70%;object-fit:contain;filter:drop-shadow(5px 6px 0 rgba(0,0,0,.6));transition:transform .1s}
.foe img.hurt{animation:hurt .3s}
@keyframes hurt{25%{transform:translateX(-10px) rotate(-3deg);filter:drop-shadow(5px 6px 0 rgba(0,0,0,.6)) brightness(2)}75%{transform:translateX(8px)}}
.foe .fn{font-family:'Black Han Sans';font-size:19px;text-shadow:2px 2px 0 #000}
.hpb{position:relative;width:200px;height:16px;border-radius:8px;background:#000;border:2px solid #000;overflow:hidden}
.hpb i{position:absolute;left:0;top:0;bottom:0;background:linear-gradient(90deg,#ff2e6e,#ff6fb6);transition:width .25s}
.hpb span{position:absolute;inset:0;text-align:center;font-family:'Space Mono',monospace;font-size:11px;font-weight:700;line-height:12px;text-shadow:1px 1px 0 #000}
.sts{display:flex;gap:5px;flex-wrap:wrap;justify-content:center;min-height:20px}
.sts span{font-size:11.5px;font-weight:800;padding:2px 7px;border-radius:9px;background:#111;border:1px solid var(--line)}
.blk{color:var(--yel)}.vul{color:#ff8fb6}.wk{color:#9ff5e4}.psn{color:#b5ff6b}.str{color:#ffb35c}
.dmg{position:absolute;font-family:'Black Han Sans';font-size:34px;color:#fff;text-shadow:3px 3px 0 var(--hot);pointer-events:none;animation:dmg .8s ease-out forwards}
@keyframes dmg{to{transform:translateY(-60px);opacity:0}}
.me{display:flex;align-items:center;gap:10px;padding:6px 12px;flex-wrap:wrap}
.me .hpb{flex:1;width:auto;min-width:140px;height:18px}
.me .hpb span{line-height:14px;font-size:12px}
.en{display:flex;gap:4px}
.en i{width:20px;height:20px;border-radius:50%;background:var(--yel);border:2px solid #000;box-shadow:0 0 8px var(--yel)}
.en i.x{background:#333;box-shadow:none}
.hand{overflow:hidden;display:flex;justify-content:center;padding:6px 8px 4px 18px;min-height:150px;align-items:flex-end}
.hand::-webkit-scrollbar{display:none}
.hand .card{margin-left:-12px;width:min(84px,calc((100vw - 30px) / 4.4));height:140px;padding-top:18px}.hand .card img{width:50px;height:44px}.hand .card b{font-size:12px}.hand .card small{font-size:10.5px}.hand .card:nth-child(odd){transform:rotate(-1.5deg)}.hand .card:nth-child(even){transform:rotate(1.5deg) translateY(-3px)}
.hand .card:active{transform:translateY(-14px) scale(1.04);z-index:2}
.card{position:relative;flex:none;width:96px;height:156px;border-radius:10px;background:var(--paper);color:#111;border:2.5px solid #000;box-shadow:3px 4px 0 rgba(0,0,0,.6);padding:20px 6px 6px;display:flex;flex-direction:column;align-items:center;text-align:center;transition:transform .15s;animation:draw .25s var(--ease)}
.card:active{transform:translateY(-10px)}
.card.no{filter:grayscale(.7) brightness(.8)}
.card.atk{box-shadow:3px 4px 0 var(--pink)}.card.def{box-shadow:3px 4px 0 var(--teal)}.card.sk{box-shadow:3px 4px 0 var(--yel)}
@keyframes draw{from{transform:translateY(40px);opacity:0}}
.card .cost{position:absolute;left:-6px;top:-6px;width:28px;height:28px;border-radius:50%;background:var(--yel);border:2.5px solid #000;font-family:'Space Mono',monospace;font-weight:700;font-size:15px;display:grid;place-items:center}
.card img{width:60px;height:52px;object-fit:contain}
.card b{font-size:13px;font-weight:800;margin-top:3px;line-height:1.15}
.card small{font-size:11px;line-height:1.3;margin-top:3px;opacity:.85;word-break:keep-all}
.cbb{display:flex;gap:8px;padding:6px 12px calc(var(--sb) + 10px);align-items:center}
.cbb .pile{font-family:'Space Mono',monospace;font-size:11.5px;color:var(--mute)}
.cbb .btn{margin-left:auto}
.map{display:flex;flex-direction:column-reverse;gap:6px}
.fl{display:flex;align-items:center;gap:10px;padding:8px 12px;border-radius:12px;background:var(--panel2);border:1px solid var(--line);font-size:14px}
.fl.now{border:2px solid var(--pink);box-shadow:3px 3px 0 var(--pink)}
.fl.done{opacity:.45}
.fl b{font-family:'Space Mono',monospace;color:var(--mint);width:34px}
.rew{display:flex;gap:8px;justify-content:center;flex-wrap:wrap}
.rew .card{animation:none}
`;
document.head.appendChild(Object.assign(document.createElement('style'), { textContent: css }));

const C = {
  whip: { n: '전화선 채찍', c: 1, t: 'atk', d: '피해 6', a: gimg('c_whip'), f: (b) => atk(b, 6) },
  shield: { n: '하트 방패', c: 1, t: 'def', d: '방어 5', a: gimg('c_shield'), f: (b) => blk(b, 5) },
  laser: { n: '선글라스 레이저', c: 2, t: 'atk', d: '피해 4를 세 번', a: gimg('c_laser'), f: (b) => { atk(b, 4); atk(b, 4); atk(b, 4); } },
  kiss: { n: '키스 마크', c: 1, t: 'sk', d: '중독 4 (매 턴 피해)', a: gimg('c_kiss'), f: (b) => { b.e.psn += 4; } },
  bolt: { n: '번개 콜', c: 2, t: 'atk', d: '피해 12, 취약 2', a: gimg('c_bolt'), f: (b) => { atk(b, 12); b.e.vul += 2; } },
  tape: { n: '카세트 힐', c: 1, t: 'sk', d: '체력 6 회복 · 한 번만', a: gimg('c_tape'), ex: 1, f: (b) => { R.hp = Math.min(R.mhp, R.hp + 6); } },
  coin: { n: '동전 던지기', c: 0, t: 'atk', d: '피해 3, 카드 1장', a: gimg('c_coin'), f: (b) => { atk(b, 3); draw(b, 1); } },
  key: { n: '해골 열쇠', c: 1, t: 'sk', d: '에너지 +2 · 한 번만', a: gimg('c_key'), ex: 1, f: (b) => { b.en += 2; } },
  umb: { n: '검은 우산', c: 1, t: 'def', d: '방어 8', a: gimg('c_umb'), f: (b) => blk(b, 8) },
  cord: { n: '전화선 감기', c: 1, t: 'def', d: '방어 4, 약화 2', a: gimg('s_phone'), f: (b) => { blk(b, 4); b.e.wk += 2; } },
  rage: { n: '핑크 분노', c: 1, t: 'sk', d: '힘 +2 (이번 판 내내)', a: img('st_heart'), f: (b) => { b.str += 2; } },
  slam: { n: '하트 박치기', c: 1, t: 'atk', d: '내 방어만큼 피해', a: img('st_skull'), f: (b) => atk(b, b.blk, true) },
  lips: { n: '립스틱 연타', c: 1, t: 'atk', d: '피해 3을 두 번, 중독 2', a: img('st_lips'), f: (b) => { atk(b, 3); atk(b, 3); b.e.psn += 2; } },
  dial: { n: '긴급 다이얼', c: 1, t: 'sk', d: '카드 3장 뽑기', a: img('st_phone'), f: (b) => draw(b, 3) }
};
const REWARD = Object.keys(C).filter(k => !['whip', 'shield'].includes(k));
// 적: 행동 순서 반복. a=공격(값,횟수) b=방어 s=힘 w=약화 v=취약
const E = {
  thug: { n: '해골 깡패', im: 'e_thug', hp: 30, mv: [{ a: 7 }, { a: 7 }, { a: 12 }] },
  dog: { n: '해골 개', im: 'e_dog', hp: 24, mv: [{ a: 4, x: 2 }, { a: 6 }, { a: 4, x: 2, s: 1 }] },
  dj: { n: '해골 디제이', im: 'e_dj', hp: 34, mv: [{ s: 2 }, { a: 6 }, { a: 5, x: 2 }] },
  bouncer: { n: '해골 경비', im: 'e_bouncer', hp: 48, elite: 1, mv: [{ b: 9, a: 6 }, { a: 12 }, { b: 14 }, { a: 8, x: 2 }] },
  bride: { n: '해골 신부', im: 'e_bride', hp: 44, elite: 1, mv: [{ w: 2, a: 5 }, { a: 11 }, { v: 2, a: 6 }, { a: 4, x: 3 }] },
  boss: { n: '해골 사장', im: 'e_boss', hp: 140, boss: 1, mv: [{ a: 6, x: 3 }, { b: 16, s: 3 }, { a: 18 }, { w: 2, v: 2 }, { a: 8, x: 2 }] }
};
const FLOORS = ['f', 'f', 'f', 'r', 'e', 'f', 'f', 'r', 'e', 'boss'];
let R = null, Bt = null;

function atk(b, n, raw) { let d = raw ? n : n + b.str; if (b.wk > 0 && !raw) d = Math.floor(d * .75); if (b.e.vul > 0) d = Math.floor(d * 1.5); d = Math.max(0, d); const take = Math.max(0, d - b.e.blk); b.e.blk = Math.max(0, b.e.blk - d); b.e.hp -= take; fx('e', take || '막음'); tone([180 + Math.random() * 60], .06, .06, 'square'); }
function blk(b, n) { b.blk += n; tone([600], .05, .04, 'triangle'); }
function draw(b, n) { for (let i = 0; i < n; i++) { if (!b.draw.length) { b.draw = shuffle(b.disc); b.disc = []; } if (!b.draw.length || b.hand.length >= 9) break; b.hand.push(b.draw.pop()); } }
function shuffle(a) { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.random() * (i + 1) | 0; [a[i], a[j]] = [a[j], a[i]]; } return a; }
function fx(who, v) { const host = who === 'e' ? document.querySelector('.foe') : document.querySelector('.me'); if (!host) return; const d = el('div', 'dmg', typeof v === 'number' ? '-' + v : v); d.style.left = (40 + Math.random() * 20) + '%'; d.style.top = who === 'e' ? '35%' : '-20px'; host.appendChild(d); setTimeout(() => d.remove(), 800); if (who === 'e') { const im = host.querySelector('img'); if (im) { im.classList.remove('hurt'); void im.offsetWidth; im.classList.add('hurt'); } } }

function intro() {
  R = S.cardRun || null;
  frame('해골과 카드 대결', B => {
    talk(B, 'l', R ? `${R.floor}층에서 멈췄었죠? 이어서 내려가요.` : '지하 클럽 10층 맨 아래에 해골 사장이 있어요. 카드로 한 층씩 뚫고 내려가요. 제가 응원할게요.');
    const r = el('div', 'rules'); r.innerHTML = '<b>하는 법</b><br>· 매 턴 <b>에너지 3</b>과 카드 5장. 카드 왼쪽 위 숫자만큼 에너지를 써요.<br>· 적 머리 위에 <b>다음 행동</b>이 보여요. 공격이 오면 <b>방어</b> 카드로 막아요(방어는 내 턴이 오면 사라져요).<br>· 이기면 새 카드를 하나 골라 덱에 넣어요. 중간에 <b>쉼터</b>에서 체력을 회복해요.<br>· 상태: 취약(받는 피해 +50%) · 약화(주는 피해 −25%) · 중독(매 턴 피해, 1씩 줄어듦) · 힘(공격마다 +).<br>· 내려간 층만큼, 사장을 이기면 +10 게임 동전.';
    B.appendChild(r);
    B.appendChild(el('div', 'rules', `최고 기록: ${S.cardBest ? S.cardBest + '층' : '없음'}${S.cardWin ? ` · 사장 격파 ${S.cardWin}번` : ''}`));
    if (R) B.appendChild(row(btn('이어서 하기', 'wide', map), btn('새로 시작', 'ghost wide', () => { if (confirm('지금 판을 버리고 새로 시작할까요?')) start(); })));
    else B.appendChild(row(btn('클럽으로 내려가기', 'wide', start)));
  }, true);
}
function start() { R = { hp: 60, mhp: 60, floor: 1, deck: ['whip', 'whip', 'whip', 'whip', 'whip', 'shield', 'shield', 'shield', 'shield', 'laser'] }; S.cardRun = R; save(); map(); }
function map() {
  frame('해골과 카드 대결', B => {
    const type = FLOORS[R.floor - 1];
    talk(B, type === 'r' ? 'l' : 'sk', type === 'r' ? '쉼터예요. 잠깐 쉬어 가요. …제 어깨 빌려줄까요?' : type === 'boss' ? '(문 너머에서 금니가 번쩍인다)' : type === 'e' ? '(덩치 큰 해골이 길을 막고 있다)' : '(어둠 속에서 뼈가 달그락거린다)');
    const M = el('div', 'map');
    FLOORS.forEach((f, i) => { const n = i + 1, d = el('div', 'fl' + (n === R.floor ? ' now' : n < R.floor ? ' done' : '')); d.append(el('b', null, `B${n}`), document.createTextNode(f === 'r' ? '쉼터' : f === 'e' ? '강한 해골' : f === 'boss' ? '해골 사장' : '해골')); M.appendChild(d); });
    B.appendChild(el('div', 'rules', `체력 ${R.hp}/${R.mhp} · 덱 ${R.deck.length}장`));
    if (type === 'r') B.appendChild(row(btn(`쉬기 (체력 +${Math.round(R.mhp * .3)})`, 'teal wide', () => { R.hp = Math.min(R.mhp, R.hp + Math.round(R.mhp * .3)); next(); }), btn('카드 하나 빼기', 'ghost wide', removeCard)));
    else B.appendChild(row(btn(type === 'boss' ? '사장실 문 열기' : '싸우러 가기', 'wide', fight)));
    B.appendChild(M);
  }, true);
}
function removeCard() {
  frame('카드 빼기', B => {
    talk(B, 'l', '약한 카드를 빼면 좋은 카드가 더 자주 와요.');
    const W = el('div', 'rew'); [...new Set(R.deck)].forEach(k => { const c = cardEl(k, true); c.onclick = () => { R.deck.splice(R.deck.indexOf(k), 1); next(); }; W.appendChild(c); }); B.appendChild(W);
    B.appendChild(row(btn('그냥 쉬기', 'ghost wide', () => { R.hp = Math.min(R.mhp, R.hp + Math.round(R.mhp * .3)); next(); })));
  }, true);
}
function next() { R.floor++; S.cardRun = R; save(); map(); }
function pickFoe() { const t = FLOORS[R.floor - 1]; if (t === 'boss') return 'boss'; if (t === 'e') return pick(['bouncer', 'bride']); return pick(R.floor <= 2 ? ['thug', 'dog'] : ['thug', 'dog', 'dj']); }
function fight() {
  const id = pickFoe(), e = E[id], sc = e.boss ? 1 : 1 + (R.floor - 1) * .07, hp = Math.round(e.hp * sc);
  Bt = { id, e: { hp, mhp: hp, blk: 0, str: 0, wk: 0, vul: 0, psn: 0, mi: 0 }, draw: shuffle(R.deck), disc: [], hand: [], en: 3, blk: 0, str: 0, wk: 0, vul: 0, turn: 0 };
  turnStart();
}
function turnStart() { const b = Bt; b.turn++; b.en = 3; b.blk = 0; if (b.wk) b.wk--; if (b.vul) b.vul--; draw(b, 5); drawUI(); }
function intentText(m) { const p = []; if (m.a) p.push(`공격 ${m.a + (Bt ? Bt.e.str : 0)}${m.x ? '×' + m.x : ''}`); if (m.b) p.push(`방어 ${m.b}`); if (m.s) p.push(`힘 +${m.s}`); if (m.w) p.push('약화'); if (m.v) p.push('취약'); return p.join(' · '); }
function cardEl(k, big) { const c = C[k], d = el('button', `card ${c.t}`); d.append(el('div', 'cost', c.c)); const i = el('img'); i.src = c.a; i.alt = ''; d.append(i, el('b', null, c.n), el('small', null, c.d)); return d; }
function drawUI() {
  const b = Bt, e = E[b.id], m = e.mv[b.e.mi % e.mv.length];
  const B = frame('해골과 카드 대결', () => {}, true, true);
  const W = el('div', 'cb'); B.appendChild(W);
  W.appendChild(el('div', 'cbt')).append(el('span', null, `B${R.floor} · ${b.turn}턴`), el('span', null, `덱 ${R.deck.length}장`));
  const F = el('div', 'foe');
  const it = el('div', 'intent' + (m.a ? '' : m.b ? ' b' : ' d'), intentText(m)); F.appendChild(it);
  const im = el('img'); im.src = gimg(e.im); im.alt = e.n; F.appendChild(im);
  F.appendChild(el('div', 'fn', e.n));
  const hb = el('div', 'hpb'); const hi = el('i'); hi.style.width = Math.max(0, b.e.hp / b.e.mhp * 100) + '%'; hb.append(hi, el('span', null, `${Math.max(0, b.e.hp)} / ${b.e.mhp}`)); F.appendChild(hb);
  const es = el('div', 'sts'); if (b.e.blk) es.appendChild(el('span', 'blk', `방어 ${b.e.blk}`)); if (b.e.str) es.appendChild(el('span', 'str', `힘 ${b.e.str}`)); if (b.e.vul) es.appendChild(el('span', 'vul', `취약 ${b.e.vul}`)); if (b.e.wk) es.appendChild(el('span', 'wk', `약화 ${b.e.wk}`)); if (b.e.psn) es.appendChild(el('span', 'psn', `중독 ${b.e.psn}`)); F.appendChild(es);
  W.appendChild(F);
  const me = el('div', 'me'); const en = el('div', 'en'); for (let i = 0; i < Math.max(3, b.en); i++) en.appendChild(el('i', i < b.en ? '' : 'x'));
  const ph = el('div', 'hpb'); const pi = el('i'); pi.style.width = (R.hp / R.mhp * 100) + '%'; ph.append(pi, el('span', null, `${R.hp} / ${R.mhp}`));
  const ms = el('div', 'sts'); if (b.blk) ms.appendChild(el('span', 'blk', `방어 ${b.blk}`)); if (b.str) ms.appendChild(el('span', 'str', `힘 ${b.str}`)); if (b.vul) ms.appendChild(el('span', 'vul', `취약 ${b.vul}`)); if (b.wk) ms.appendChild(el('span', 'wk', `약화 ${b.wk}`));
  me.append(en, ph, ms); W.appendChild(me);
  const H = el('div', 'hand'); b.hand.forEach((k, i) => { const c = cardEl(k); if (C[k].c > b.en) c.classList.add('no'); c.onclick = () => play(i); H.appendChild(c); }); W.appendChild(H);
  const bb = el('div', 'cbb'); bb.appendChild(el('span', 'pile', `뽑을 ${b.draw.length} · 버린 ${b.disc.length}`)); bb.appendChild(btn('턴 끝내기', '', endTurn)); W.appendChild(bb);
}
function play(i) {
  const b = Bt, k = b.hand[i], c = C[k]; if (!c || c.c > b.en) { tone([120], .08, .05, 'square'); return; }
  b.en -= c.c; b.hand.splice(i, 1); c.f(b); if (!c.ex) b.disc.push(k); else { const di = R.deck.indexOf(k); }
  dtmf(Math.min(9, c.c + 1));
  if (b.e.hp <= 0) return win();
  drawUI();
}
async function endTurn() {
  const b = Bt, e = E[b.id]; b.disc.push(...b.hand); b.hand = [];
  if (b.e.psn) { b.e.hp -= b.e.psn; fx('e', b.e.psn); b.e.psn--; if (b.e.hp <= 0) return win(); }
  b.e.blk = 0; const m = e.mv[b.e.mi % e.mv.length]; b.e.mi++;
  if (m.b) b.e.blk += m.b; if (m.s) b.e.str += m.s; if (m.w) b.wk += m.w; if (m.v) b.vul += m.v;
  drawUI();
  if (m.a) { for (let i = 0; i < (m.x || 1); i++) { await sleep(260); let d = m.a + b.e.str; if (b.e.wk) d = Math.floor(d * .75); if (b.vul) d = Math.floor(d * 1.5); const take = Math.max(0, d - b.blk); b.blk = Math.max(0, b.blk - d); R.hp -= take; fx('p', take || '막음'); tone([120], .1, .08, 'sawtooth'); if (R.hp <= 0) return lose(); } }
  if (b.e.wk) b.e.wk--; if (b.e.vul) b.e.vul--;
  await sleep(250); turnStart();
}
function win() {
  const boss = FLOORS[R.floor - 1] === 'boss'; coinSound(); S.cardBest = Math.max(S.cardBest || 0, R.floor); save();
  if (boss) { S.cardWin = (S.cardWin || 0) + 1; const reward = R.floor + 10; gcAdd(reward); S.cardRun = null; save();
    return frame('해골과 카드 대결', B => { B.appendChild(el('div', 'res w', '해골 사장 격파!')); talk(B, 'sk', '(사장이 금니를 떨어뜨리고 무너진다)'); talk(B, 'l', `…해냈어요. 진짜 멋있었어요. 게임 동전 ${reward}개, 다 송휘님 거예요.`); B.appendChild(row(btn('다시 도전', 'wide', start), btn('오락실로', 'ghost wide', () => ARC.hub()))); }, true); }
  const opts = shuffle(REWARD).slice(0, 3);
  frame('해골과 카드 대결', B => {
    B.appendChild(el('div', 'res w', `B${R.floor} 돌파!`));
    talk(B, 'l', pick(['깔끔했어요. 카드 하나 골라 가요.', '해골이 울면서 도망갔어요. 뭐 가져갈래요?', '역시. 다음 층도 부탁해요.']));
    const W = el('div', 'rew'); opts.forEach(k => { const c = cardEl(k); c.onclick = () => { R.deck.push(k); next(); }; W.appendChild(c); }); B.appendChild(W);
    B.appendChild(row(btn('안 받기', 'ghost wide', next)));
  }, true);
}
function lose() {
  const fl = R.floor - 1, reward = fl; S.cardBest = Math.max(S.cardBest || 0, fl); S.cardRun = null; save(); if (reward) gcAdd(reward);
  frame('해골과 카드 대결', B => { B.appendChild(el('div', 'res l', '쓰러졌어요…')); talk(B, 'l', fl ? `B${fl}까지 내려갔어요. 게임 동전 ${reward}개 받아요. …다음엔 사장 얼굴 보러 가요.` : '첫 층에서… 괜찮아요. 방어 카드를 더 써 봐요.'); B.appendChild(row(btn('다시 도전', 'wide', start), btn('오락실로', 'ghost wide', () => ARC.hub()))); }, true);
  tone([200, 150], .5, .08, 'triangle'); R = null;
}

ARC.reg({ id: 'cards', order: 4, name: '해골과 카드 대결', ban: 'cards', sub: () => `덱 빌딩 · 지하 10층 · 최고 B${S.cardBest || 0}`, start: intro });
})();
