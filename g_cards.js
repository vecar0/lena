// 오락실 — 해골과 카드 대결 (덱 빌딩 로그라이크): 지하 클럽 10층을 내려간다
'use strict';
(() => {
const { frame, talk, gcAdd, gimg, img } = ARC;
const css = `
.cb{position:relative;flex:1;min-height:0;display:flex;flex-direction:column;background:radial-gradient(ellipse at 50% 30%,rgba(255,61,154,.28),transparent 60%),linear-gradient(#171b22,#0b0d11);overflow:hidden;user-select:none;-webkit-user-select:none}
.cb::before{content:"";position:absolute;inset:0;background:radial-gradient(rgba(255,255,255,.035) 1px,transparent 1.2px) 0 0/4px 4px}
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
.cme{display:flex;align-items:center;gap:10px;padding:6px 12px;flex-wrap:wrap}
.cme .hpb{flex:1;width:auto;min-width:140px;height:18px}
.cme .hpb span{line-height:14px;font-size:12px}
.ken{display:flex;gap:4px}
.ken i{width:24px;height:24px;background:url(assets/lena/cur/energy.webp) center/contain no-repeat;filter:drop-shadow(0 0 5px rgba(242,234,58,.6))}
.ken i.x{filter:grayscale(1) brightness(.4)}
.khand{overflow:hidden;display:flex;justify-content:center;padding:6px 8px 4px 18px;min-height:150px;align-items:flex-end}
.khand::-webkit-scrollbar{display:none}
.khand .kc{margin-left:-12px;width:min(84px,calc((100vw - 30px) / 4.4));height:140px;padding-top:18px}.khand .kc img{width:50px;height:44px}.khand .kc b{font-size:12px}.khand .kc small{font-size:10.5px}.khand .kc:nth-child(odd){transform:rotate(-1.5deg)}.khand .kc:nth-child(even){transform:rotate(1.5deg) translateY(-3px)}
.khand .kc:active{transform:translateY(-14px) scale(1.04);z-index:2}
.kc{position:relative;flex:none;width:96px;height:156px;border-radius:10px;background:var(--paper);color:#111;border:2.5px solid #000;box-shadow:3px 4px 0 rgba(0,0,0,.6);padding:20px 6px 6px;display:flex;flex-direction:column;align-items:center;text-align:center;transition:transform .15s;animation:draw .25s var(--ease)}
.kc:active{transform:translateY(-10px)}
.kc.no{filter:grayscale(.7) brightness(.8)}
.kc.upg{background:linear-gradient(#fffbe0,#f6f2ea)}.kc.upg b{color:#c2185b}
.kc.atk{box-shadow:3px 4px 0 var(--pink)}.kc.def{box-shadow:3px 4px 0 var(--teal)}.kc.sk{box-shadow:3px 4px 0 var(--yel)}
@keyframes draw{from{transform:translateY(40px);opacity:0}}
.kc .cost{position:absolute;left:-6px;top:-6px;width:28px;height:28px;border-radius:50%;background:var(--yel);border:2.5px solid #000;font-family:'Space Mono',monospace;font-weight:700;font-size:15px;display:grid;place-items:center}
.kc img{width:60px;height:52px;object-fit:contain}
.kc b{font-size:13px;font-weight:800;margin-top:3px;line-height:1.15}
.kc small{font-size:11px;line-height:1.3;margin-top:3px;opacity:.85;word-break:keep-all}
.cbb{display:flex;gap:8px;padding:6px 12px calc(var(--sb) + 10px);align-items:center}
.cbb .pile{font-family:'Space Mono',monospace;font-size:11.5px;color:var(--mute)}
.cbb .btn{margin-left:auto}
.map{display:flex;flex-direction:column-reverse;gap:6px;margin-top:14px}
.rooms{display:flex;gap:8px;margin-top:10px}
.room{flex:1;min-height:84px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:4px;padding:10px 8px;border-radius:14px;border:2.5px solid #000;background:var(--paper);color:#111;box-shadow:4px 4px 0 var(--teal);text-align:center}
.room b{font-family:'Black Han Sans';font-weight:400;font-size:19px}.room small{font-size:11.5px;opacity:.7;line-height:1.3;word-break:keep-all}
.room.r-e{box-shadow:4px 4px 0 var(--hot)}.room.r-boss{background:#2a0f17;color:#fff;box-shadow:4px 4px 0 var(--hot)}.room.r-r{box-shadow:4px 4px 0 var(--mint)}.room.r-s{box-shadow:4px 4px 0 var(--yel)}.room.r-q{box-shadow:4px 4px 0 #b89cff}
.room:active{transform:translate(2px,2px);box-shadow:2px 2px 0 #000}
.gld{display:inline-block;width:1em;height:1em;border-radius:50%;vertical-align:-.12em;margin:0 3px 0 1px;background:radial-gradient(circle at 35% 30%,#fff6b0,#f2c94c 45%,#b8860b);border:1.5px solid #3a2800;box-shadow:inset 0 0 0 1.5px rgba(255,255,255,.35)}
.sitem{display:flex;flex-direction:column;align-items:center;gap:4px}.sitem .price{font-family:'Space Mono',monospace;font-weight:700;font-size:13px;color:var(--yel)}
.fl{display:flex;align-items:center;gap:10px;padding:8px 12px;border-radius:12px;background:var(--panel2);border:1px solid var(--line);font-size:14px}
.fl.now{border:2px solid var(--pink);box-shadow:3px 3px 0 var(--pink)}
.fl.done{opacity:.45}
.fl b{font-family:'Space Mono',monospace;color:var(--mint);width:34px}
.rew{display:flex;gap:8px;justify-content:center;flex-wrap:wrap}
.rew .kc{animation:none}
`;
document.head.appendChild(Object.assign(document.createElement('style'), { textContent: css }));

const C = {
  whip: { n: '전화선 채찍', c: 1, t: 'atk', d: '피해 6', a: gimg('c_whip'), f: (b) => atk(b, 6) },
  shield: { n: '하트 방패', c: 1, t: 'def', d: '방어 5', a: gimg('c_shield'), f: (b) => blk(b, 5) },
  laser: { n: '선글라스 레이저', c: 2, t: 'atk', d: '피해 4를 세 번', a: gimg('c_laser'), f: (b) => { atk(b, 4); atk(b, 4); atk(b, 4); } },
  kiss: { n: '키스 마크', c: 1, t: 'sk', d: '중독 4 (매 턴 피해)', a: gimg('c_kiss'), f: (b) => { b.e.psn += Math.round(4 * (b.um || 1)); } },
  bolt: { n: '번개 콜', c: 2, t: 'atk', d: '피해 12, 취약 2', a: gimg('c_bolt'), f: (b) => { atk(b, 12); b.e.vul += 2; } },
  tape: { n: '카세트 힐', c: 1, t: 'sk', d: '체력 6 회복 · 한 번만', a: gimg('c_tape'), ex: 1, f: (b) => { R.hp = Math.min(R.mhp, R.hp + 6); } },
  coin: { n: '동전 던지기', c: 0, t: 'atk', d: '피해 3, 카드 1장', a: gimg('c_coin'), f: (b) => { atk(b, 3); draw(b, 1); } },
  key: { n: '해골 열쇠', c: 1, t: 'sk', d: '에너지 +2 · 한 번만', a: gimg('c_key'), ex: 1, f: (b) => { b.en += 2; } },
  umb: { n: '검은 우산', c: 1, t: 'def', d: '방어 8', a: gimg('c_umb'), f: (b) => blk(b, 8) },
  cord: { n: '전화선 감기', c: 1, t: 'def', d: '방어 4, 약화 2', a: gimg('s_phone'), f: (b) => { blk(b, 4); b.e.wk += 2; } },
  rage: { n: '핑크 분노', c: 1, t: 'sk', d: '힘 +2 (이번 판 내내)', a: img('st_heart'), f: (b) => { b.str += 2; } },
  slam: { n: '하트 박치기', c: 1, t: 'atk', d: '내 방어만큼 피해', a: img('st_skull'), f: (b) => atk(b, b.blk, true) },
  lips: { n: '립스틱 연타', c: 1, t: 'atk', d: '피해 3을 두 번, 중독 2', a: img('st_lips'), f: (b) => { atk(b, 3); atk(b, 3); b.e.psn += Math.round(2 * (b.um || 1)); } },
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
// 층마다 갈 길을 고른다(덱 빌딩 로그라이크식 갈림길). R.cur = 이번 층에 고른 방
const ft = n => (R && R.cur && n === R.floor) ? R.cur : FLOORS[(n - 1) % 10];
const ROOM = { f: ['해골', '싸우면 카드·골드'], e: ['강한 해골', '세지만 유물을 줘요'], r: ['쉼터', '쉬기·카드 강화'], s: ['해골 상점', '골드로 카드·유물'], q: ['?', '무슨 일이 생길지 몰라요'], boss: ['해골 사장', '이 층의 끝'] };
const GOLD = () => '<i class="gld"></i>';
function roomOpts(n) { const i = (n - 1) % 10 + 1; if (i === 1) return ['f']; if (i === 10) return ['boss']; if (i === 9) return ['r'];
  const w = [['f', 45], ['q', 22], ['e', i >= 4 ? 16 : 0], ['s', i >= 3 ? 11 : 0], ['r', i >= 5 ? 9 : 0]], k = Math.random() < .4 ? 3 : 2, out = [];
  while (out.length < k) { const tot = w.reduce((a, x) => a + (out.includes(x[0]) ? 0 : x[1]), 0); let r = Math.random() * tot; for (const [t, v] of w) { if (out.includes(t)) continue; r -= v; if (r <= 0) { out.push(t); break; } } }
  return out; }
let R = null, Bt = null;
const base = k => k.replace(/\+$/, '');
const NUM = /(피해|방어|중독) (\d+)/g;
const cost = k => { const c = C[base(k)]; return k.endsWith('+') && !/(피해|방어|중독) \d/.test(c.d) ? Math.max(0, c.c - 1) : c.c; };
const desc = k => { const c = C[base(k)]; if (!k.endsWith('+')) return c.d; return /(피해|방어|중독) \d/.test(c.d) ? c.d.replace(NUM, (m, w, x) => `${w} ${Math.round(x * 1.5)}`) + ' (강화)' : c.d + ' (비용 −1)'; };
const RELIC = { lip: ['립밤', '전투 시작에 방어 8', 'g_lip'], coffee: ['아이스 아메리카노', '첫 턴 에너지 +1', 'g_coffee'], tape: ['믹스테이프', '전투가 끝나면 체력 6 회복', 'g_tape'], ring: ['핑크 반지', '전투 시작에 힘 +1', 'g_ring'], cam: ['필름 카메라', '첫 턴 카드 2장 더', 'g_cam'], neon: ['네온 하트', '매 턴 방어 3', 'd_neon'], choker: ['스터드 초커', '전투 시작에 적 취약 2', 'g_choker'], cake: ['딸기 케이크', '최대 체력 +12', 'g_cake'], rose: ['검은 장미', '적이 중독 상태면 피해 +3', 'g_rose'] };
const has = id => R && (R.relics || []).includes(id);
const ASC = () => S.cardAsc || 0;
function relicPick(after) {
  const pool = shuffle(Object.keys(RELIC).filter(k => !has(k))).slice(0, 3);
  if (!pool.length) return after();
  frame('유물 고르기', B => {
    talk(B, 'l', '해골이 떨어뜨린 거예요. 하나만 가져가요. 판 끝날 때까지 계속 효과가 있어요.');
    const G = el('div', 'shop'); pool.forEach(k => { const [n, d, im] = RELIC[k], o = el('div', 'offer'), i = el('img'); i.src = `assets/lena/s/${im}.webp`; i.alt = ''; const t = el('div'); t.append(el('b', null, n), el('small', null, d)); o.append(i, t, btn('가져가기', '', () => { R.relics = R.relics || []; R.relics.push(k); if (k === 'cake') { R.mhp += 12; R.hp += 12; } coinSound(); after(); })); G.appendChild(o); });
    B.appendChild(G);
  }, true);
}
function upgradeCard() {
  frame('카드 강화', B => {
    talk(B, 'l', '하나 골라요. 숫자가 1.5배가 돼요.');
    const W = el('div', 'rew'); [...new Set(R.deck.filter(k => !k.endsWith('+')))].forEach(k => { const c = cardEl(k + '+'); c.onclick = () => { R.deck[R.deck.indexOf(k)] = k + '+'; coinSound(); next(); }; W.appendChild(c); }); B.appendChild(W);
    B.appendChild(row(btn('그냥 쉬기', 'ghost wide', () => { R.hp = Math.min(R.mhp, R.hp + Math.round(R.mhp * .3)); next(); })));
  }, true);
}

function atk(b, n, raw) { if (!raw) n = Math.round(n * (b.um || 1)); let d = raw ? n : n + b.str + (has('rose') && b.e.psn > 0 ? 3 : 0); if (b.wk > 0 && !raw) d = Math.floor(d * .75); if (b.e.vul > 0) d = Math.floor(d * 1.5); d = Math.max(0, d); const take = Math.max(0, d - b.e.blk); b.e.blk = Math.max(0, b.e.blk - d); b.e.hp -= take; fx('e', take || '막음'); tone([180 + Math.random() * 60], .06, .06, 'square'); }
function blk(b, n) { b.blk += Math.round(n * (b.um || 1)); tone([600], .05, .04, 'triangle'); }
function draw(b, n) { for (let i = 0; i < n; i++) { if (!b.draw.length) { b.draw = shuffle(b.disc); b.disc = []; } if (!b.draw.length || b.hand.length >= 9) break; b.hand.push(b.draw.pop()); } }
function shuffle(a) { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.random() * (i + 1) | 0; [a[i], a[j]] = [a[j], a[i]]; } return a; }
function fx(who, v) { const host = who === 'e' ? document.querySelector('.foe') : document.querySelector('.cme'); if (!host) return; const d = el('div', 'dmg', typeof v === 'number' ? '-' + v : v); d.style.left = (40 + Math.random() * 20) + '%'; d.style.top = who === 'e' ? '35%' : '-20px'; host.appendChild(d); setTimeout(() => d.remove(), 800); if (who === 'e') { const im = host.querySelector('img'); if (im) { im.classList.remove('hurt'); void im.offsetWidth; im.classList.add('hurt'); } } }

function intro() {
  R = S.cardRun || null;
  frame('해골과 카드 대결', B => {
    talk(B, 'l', R ? `${R.floor}층에서 멈췄었죠? 이어서 내려가요.` : '지하 클럽 10층 맨 아래에 해골 사장이 있어요. 카드로 한 층씩 뚫고 내려가요. 제가 응원할게요.');
    const r = el('div', 'rules'); r.innerHTML = '<b>하는 법</b><br>· 매 턴 <b>에너지 3</b>과 카드 5장. 카드 왼쪽 위 숫자만큼 에너지를 써요.<br>· 적 머리 위에 <b>다음 행동</b>이 보여요. 공격이 오면 <b>방어</b> 카드로 막아요(방어는 내 턴이 오면 사라져요).<br>· 층마다 <b>갈림길</b>에서 방을 골라요: 해골 · 강한 해골(유물) · 쉼터 · 상점 · ?(사건).<br>· 이기면 새 카드 하나와 <b>골드</b>. 골드는 상점에서 카드·유물·카드 빼기에 써요.<br>· 상태: 취약(받는 피해 +50%) · 약화(주는 피해 −25%) · 중독(매 턴 피해, 1씩 줄어듦) · 힘(공격마다 +).<br>· 내려간 층만큼, 사장을 이기면 +10 게임 동전.';
    B.appendChild(r);
    B.appendChild(el('div', 'rules', `최고 기록: ${S.cardBest ? S.cardBest + '층' : '없음'}${S.cardWin ? ` · 사장 격파 ${S.cardWin}번` : ''} · 강한 해골을 이기면 유물, 쉼터에서 카드 강화`));
    if (!R) { B.appendChild(lbl('위험도 (사장을 이기면 다음 단계가 열려요)')); const P = el('div', 'pills'); for (let n = 0; n <= Math.min(10, S.cardAscMax || 0); n++) { const b = el('button', ASC() === n ? 'on' : ''); b.innerHTML = n ? `${ci('danger')}위험 ${n}` : '기본'; b.onclick = () => { S.cardAsc = n; save(); intro(); }; P.appendChild(b); } B.appendChild(P); B.appendChild(el('div', 'hint', ASC() ? `적 체력 +${ASC() * 12}% · 적 힘 +${Math.floor(ASC() / 2)} · 시작 체력 −${ASC() * 3} · 강화 카드가 더 자주 나와요` : '처음이면 기본으로 해요.')); }
    if (R) B.appendChild(row(btn('이어서 하기', 'wide', map), btn('새로 시작', 'ghost wide', () => { if (confirm('지금 판을 버리고 새로 시작할까요?')) start(); })));
    else B.appendChild(row(btn('클럽으로 내려가기', 'wide', start)));
  }, true);
}
function start() { const hp = 75 - ASC() * 3; R = { hp, mhp: hp, relics: [], gold: 60, path: [], floor: 1, deck: ['whip', 'whip', 'whip', 'whip', 'whip', 'shield', 'shield', 'shield', 'shield', 'laser', 'umb'] }; S.cardRun = R; save(); map(); }
function map() {
  R.path = R.path || []; R.gold = R.gold || 0;
  if (!R.opts || R.optsFor !== R.floor) { R.opts = roomOpts(R.floor); R.optsFor = R.floor; R.cur = null; S.cardRun = R; save(); }
  frame('해골과 카드 대결', B => {
    if (R.floor > 10) B.appendChild(el('div', 'rules', `끝없는 지하 ${Math.floor((R.floor - 1) / 10) + 1}번째 바퀴 · 적이 더 세요`));
    talk(B, 'l', R.opts.length > 1 ? pick(['갈림길이에요. 어느 문으로 갈래요?', '어디로 갈지 골라요. 저는 송휘님 따라갈게요.', '왼쪽? 오른쪽? …송휘님 감을 믿어요.']) : R.opts[0] === 'boss' ? '저 문 너머가 사장실이에요. …준비됐어요?' : R.opts[0] === 'r' ? '사장실 앞 쉼터예요. 숨 고르고 가요.' : '내려가 볼까요?');
    const st = el('div', 'rules'); st.innerHTML = `체력 <b>${R.hp}/${R.mhp}</b> · ${GOLD()}<b>${R.gold || 0}</b> · 덱 ${R.deck.length}장 · 위험도 ${ASC()}${(R.relics || []).length ? '<br>유물: ' + R.relics.map(k => RELIC[k][0]).join(', ') : ''}`; B.appendChild(st);
    const O = el('div', 'rooms'); R.opts.forEach(t => { const b = el('button', 'room r-' + t); b.append(el('b', null, ROOM[t][0]), el('small', null, ROOM[t][1])); b.onclick = () => enter(t); O.appendChild(b); }); B.appendChild(O);
    const M = el('div', 'map'); const base0 = Math.floor((R.floor - 1) / 10) * 10;
    for (let i = 1; i <= 10; i++) { const n = base0 + i, done = n < R.floor, now = n === R.floor, d = el('div', 'fl' + (now ? ' now' : done ? ' done' : '')); const t = done ? R.path[n - 1] : now ? null : i === 10 ? 'boss' : i === 9 ? 'r' : null; d.append(el('b', null, `B${n}`), document.createTextNode(now ? '여기서 고르기' : t ? ROOM[t][0] : '· · ·')); M.appendChild(d); }
    B.appendChild(M);
  }, true);
}
function enter(t) { R.cur = t; R.path[R.floor - 1] = t; S.cardRun = R; save();
  if (t === 'f' || t === 'e' || t === 'boss') return fight();
  if (t === 'r') return rest();
  if (t === 's') return shop();
  if (t === 'q') return qEvent(); }
function rest() {
  frame('쉼터', B => {
    talk(B, 'l', '잠깐 쉬어 가요. …제 어깨 빌려줄까요?');
    B.appendChild(el('div', 'rules', `체력 ${R.hp}/${R.mhp}`));
    B.appendChild(row(btn(`쉬기 (체력 +${Math.round(R.mhp * .3)})`, 'teal wide', () => { R.hp = Math.min(R.mhp, R.hp + Math.round(R.mhp * .3)); next(); }), btn('카드 강화', 'wide', upgradeCard)));
    B.appendChild(row(btn('카드 하나 빼기', 'ghost wide', removeCard)));
  }, true);
}
function shop() {
  if (!R.stock || R.stockFor !== R.floor) { R.stock = { cards: shuffle(REWARD).slice(0, 4).map(k => ({ k: Math.random() < .2 ? k + '+' : k, p: 45 + Math.floor(Math.random() * 30), sold: 0 })), relic: shuffle(Object.keys(RELIC).filter(k => !has(k)))[0] || null, rp: 120 + Math.floor(Math.random() * 40), rm: 0 }; R.stockFor = R.floor; R.stock.cards.forEach(c => { if (c.k.endsWith('+')) c.p += 25; }); }
  const K = R.stock, buy = (p, f) => { if ((R.gold || 0) < p) { toast('골드가 모자라요.'); return; } R.gold -= p; coinSound(); f(); S.cardRun = R; save(); shop(); };
  frame('해골 상점', B => {
    talk(B, 'sk', '(해골 점원이 금니를 드러내며 웃는다. 손님, 골드 있어?)');
    const st = el('div', 'rules'); st.innerHTML = `가진 골드 ${GOLD()}<b>${R.gold || 0}</b> · 덱 ${R.deck.length}장`; B.appendChild(st);
    const W = el('div', 'rew'); K.cards.forEach(c => { const w = el('div', 'sitem'), cd = cardEl(c.k); if (c.sold) cd.classList.add('no'); cd.onclick = () => { if (c.sold) return; buy(c.p, () => { R.deck.push(c.k); c.sold = 1; }); }; const pr = el('div', 'price'); pr.innerHTML = c.sold ? '팔림' : `${GOLD()}${c.p}`; w.append(cd, pr); W.appendChild(w); }); B.appendChild(W);
    if (K.relic) { const [n, d, im] = RELIC[K.relic], o = el('div', 'offer'), i = el('img'); i.src = `assets/lena/s/${im}.webp`; i.alt = ''; const t = el('div'); t.append(el('b', null, '유물 · ' + n), el('small', null, d)); const bb = btn('', '', () => buy(K.rp, () => { R.relics.push(K.relic); if (K.relic === 'cake') { R.mhp += 12; R.hp += 12; } K.relic = null; })); bb.innerHTML = `${GOLD()}${K.rp}`; o.append(i, t, bb); const sh = el('div', 'shop'); sh.style.marginTop = '12px'; sh.appendChild(o); B.appendChild(sh); }
    const rmP = 60 + K.rm * 25, rb = btn('', 'ghost wide', () => { if ((R.gold || 0) < rmP) { toast('골드가 모자라요.'); return; } frame('카드 빼기', B2 => { talk(B2, 'sk', '(어느 카드를 버릴래?)'); const W2 = el('div', 'rew'); [...new Set(R.deck)].forEach(k => { const c = cardEl(k, true); c.onclick = () => { R.gold -= rmP; K.rm++; R.deck.splice(R.deck.indexOf(k), 1); coinSound(); S.cardRun = R; save(); shop(); }; W2.appendChild(c); }); B2.appendChild(W2); B2.appendChild(row(btn('그만두기', 'ghost wide', shop))); }, true); });
    rb.innerHTML = `카드 하나 빼기 · ${GOLD()}${rmP}`; B.appendChild(row(rb));
    B.appendChild(row(btn('상점 나가기', 'wide', next)));
  }, true);
}
const EVENTS = [
  { t: '해골 바텐더', d: '(해골이 칵테일을 내민다. 마시면 뭔가 줄 것 같다)', o: [['마신다 (체력 −8, 유물 하나)', () => { R.hp = Math.max(1, R.hp - 8); return relicPick(next); }], ['사양한다', () => next()]] },
  { t: '버려진 공중전화', d: '(수화기에서 동전 소리가 난다)', o: [['동전을 털어 간다 (골드 +40)', () => { R.gold += 40; next(); }], ['통화 기록을 듣는다 (카드 하나 강화)', () => { const L = R.deck.filter(k => !k.endsWith('+')); if (L.length) { const k = pick(L); R.deck[R.deck.indexOf(k)] = k + '+'; toast(`${C[k].n} 강화!`); } next(); }]] },
  { t: '레나의 문자', d: '(휴대폰이 울린다. 레나다: "힘내요. 보고 있어요♥")', o: [['답장한다 (체력 30% 회복)', () => { R.hp = Math.min(R.mhp, R.hp + Math.round(R.mhp * .3)); next(); }], ['사진을 저장한다 (최대 체력 +7)', () => { R.mhp += 7; R.hp += 7; next(); }]] },
  { t: '수상한 자판기', d: '(골드를 넣으면 뭐가 나올지 모르는 자판기)', o: [['골드 50 넣기 (무작위 유물)', () => { if (R.gold < 50) { toast('골드가 모자라요.'); return; } R.gold -= 50; const k = shuffle(Object.keys(RELIC).filter(x => !has(x)))[0]; if (k) { R.relics.push(k); if (k === 'cake') { R.mhp += 12; R.hp += 12; } toast(`유물: ${RELIC[k][0]}`); } next(); }], ['발로 찬다 (체력 −5, 골드 +25)', () => { R.hp = Math.max(1, R.hp - 5); R.gold += 25; next(); }]] },
  { t: '함정!', d: '(어둠 속에서 해골이 튀어나왔다!)', o: [['싸운다', () => { R.cur = 'f'; fight(); }]] }
];
function qEvent() {
  const ev = pick(EVENTS);
  frame('? ' + ev.t, B => { talk(B, 'sk', ev.d); B.appendChild(el('div', 'rules', `체력 ${R.hp}/${R.mhp} · 골드 ${R.gold || 0}`)); ev.o.forEach(([l, f]) => B.appendChild(row(btn(l, 'wide', () => { f(); S.cardRun = R; save(); })))); }, true);
}
function removeCard() {
  frame('카드 빼기', B => {
    talk(B, 'l', '약한 카드를 빼면 좋은 카드가 더 자주 와요.');
    const W = el('div', 'rew'); [...new Set(R.deck)].forEach(k => { const c = cardEl(k, true); c.onclick = () => { R.deck.splice(R.deck.indexOf(k), 1); next(); }; W.appendChild(c); }); B.appendChild(W);
    B.appendChild(row(btn('그냥 쉬기', 'ghost wide', () => { R.hp = Math.min(R.mhp, R.hp + Math.round(R.mhp * .3)); next(); })));
  }, true);
}
function next() { R.floor++; R.cur = null; S.cardRun = R; save(); map(); }
function pickFoe() { const t = ft(R.floor); if (t === 'boss') return 'boss'; if (t === 'e') return pick(['bouncer', 'bride']); return pick(R.floor <= 2 ? ['thug', 'dog'] : ['thug', 'dog', 'dj']); }
function fight() {
  const id = pickFoe(), e = E[id], dp = Math.floor((R.floor - 1) / 10), sc = (e.boss ? 1 : 1 + ((R.floor - 1) % 10) * .06) * (1 + dp * .45) * (1 + ASC() * .12), hp = Math.round(e.hp * sc);
  Bt = { id, e: { hp, mhp: hp, blk: 0, str: dp * 2 + Math.floor(ASC() / 2), wk: 0, vul: has('choker') ? 2 : 0, psn: 0, mi: 0 }, draw: shuffle(R.deck), disc: [], hand: [], en: 3, blk: 0, str: has('ring') ? 1 : 0, wk: 0, vul: 0, turn: 0 };
  turnStart();
}
function turnStart() { const b = Bt; b.turn++; b.en = 3 + (b.turn === 1 && has('coffee') ? 1 : 0); b.blk = (b.turn === 1 && has('lip') ? 8 : 0) + (has('neon') ? 3 : 0); if (b.wk) b.wk--; if (b.vul) b.vul--; draw(b, 5 + (b.turn === 1 && has('cam') ? 2 : 0)); drawUI(); }
function intentText(m) { const p = []; if (m.a) p.push(`공격 ${m.a + (Bt ? Bt.e.str : 0)}${m.x ? '×' + m.x : ''}`); if (m.b) p.push(`방어 ${m.b}`); if (m.s) p.push(`힘 +${m.s}`); if (m.w) p.push('약화'); if (m.v) p.push('취약'); return p.join(' · '); }
function cardEl(k, big) { const c = C[base(k)], d = el('button', `kc ${c.t}${k.endsWith('+') ? ' upg' : ''}`); d.append(el('div', 'cost', cost(k))); const i = el('img'); i.src = c.a; i.alt = ''; d.append(i, el('b', null, c.n + (k.endsWith('+') ? '+' : '')), el('small', null, desc(k))); return d; }
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
  const me = el('div', 'cme'); const en = el('div', 'ken'); for (let i = 0; i < Math.max(3, b.en); i++) en.appendChild(el('i', i < b.en ? '' : 'x'));
  const ph = el('div', 'hpb'); const pi = el('i'); pi.style.width = (R.hp / R.mhp * 100) + '%'; ph.append(pi, el('span', null, `${R.hp} / ${R.mhp}`));
  const ms = el('div', 'sts'); if (b.blk) ms.appendChild(el('span', 'blk', `방어 ${b.blk}`)); if (b.str) ms.appendChild(el('span', 'str', `힘 ${b.str}`)); if (b.vul) ms.appendChild(el('span', 'vul', `취약 ${b.vul}`)); if (b.wk) ms.appendChild(el('span', 'wk', `약화 ${b.wk}`));
  me.append(en, ph, ms); W.appendChild(me);
  const H = el('div', 'khand'); b.hand.forEach((k, i) => { const c = cardEl(k); if (cost(k) > b.en) c.classList.add('no'); c.onclick = () => play(i); H.appendChild(c); }); W.appendChild(H);
  const bb = el('div', 'cbb'); bb.appendChild(el('span', 'pile', `뽑을 ${b.draw.length} · 버린 ${b.disc.length}`)); bb.appendChild(btn('턴 끝내기', '', endTurn)); W.appendChild(bb);
}
function play(i) {
  const b = Bt, k = b.hand[i], c = C[base(k)]; if (!c || cost(k) > b.en) { tone([120], .08, .05, 'square'); return; }
  b.en -= cost(k); b.hand.splice(i, 1); b.um = k.endsWith('+') ? 1.5 : 1; c.f(b); b.um = 1; if (!c.ex) b.disc.push(k);
  dtmf(Math.min(9, cost(k) + 1));
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
  const boss = ft(R.floor) === 'boss', elite = ft(R.floor) === 'e', gg = boss ? 90 : elite ? 30 + Math.floor(Math.random() * 10) : 12 + Math.floor(Math.random() * 8); R.gold = (R.gold || 0) + gg; if (has('tape')) R.hp = Math.min(R.mhp, R.hp + 6); coinSound(); S.cardBest = Math.max(S.cardBest || 0, R.floor); save();
  if (boss) { S.cardWin = (S.cardWin || 0) + 1; if (ASC() >= (S.cardAscMax || 0)) S.cardAscMax = Math.min(10, ASC() + 1); const reward = 10 + Math.floor(R.floor / 2); gcAdd(reward); R.mhp += 10; R.hp = R.mhp; S.cardRun = R; save();
    return frame('해골과 카드 대결', B => { B.appendChild(el('div', 'res w', `B${R.floor} 해골 사장 격파!`)); talk(B, 'sk', '(사장이 금니를 떨어뜨리고 무너진다. 바닥 아래로 계단이 하나 더 보인다)'); talk(B, 'l', `…해냈어요. 게임 동전 ${reward}개. 체력도 꽉 채워 뒀어요. 더 깊이 내려가 볼래요? 아래는 더 세요.`); B.appendChild(row(btn('유물 고르고 더 깊이', 'teal wide', () => relicPick(next)), btn('여기서 끝내기', 'ghost wide', () => { S.cardRun = null; save(); ARC.hub(); }))); }, true); }
  const opts = shuffle(REWARD).slice(0, 3);
  frame('해골과 카드 대결', B => {
    B.appendChild(el('div', 'res w', `B${R.floor} 돌파!`));
    talk(B, 'l', pick(['깔끔했어요. 카드 하나 골라 가요.', '해골이 울면서 도망갔어요. 뭐 가져갈래요?', '역시. 다음 층도 부탁해요.'])); const gl = el('div', 'rules'); gl.innerHTML = `${GOLD()}골드 +${gg} (가진 골드 ${R.gold})`; B.appendChild(gl);
    const go = () => elite ? relicPick(next) : next();
    const W = el('div', 'rew'); opts.forEach(k => { const c = cardEl(Math.random() < .12 + ASC() * .01 ? k + '+' : k); c.onclick = () => { R.deck.push(c.querySelector('b').textContent.endsWith('+') ? k + '+' : k); go(); }; W.appendChild(c); }); B.appendChild(W);
    B.appendChild(row(btn('안 받기', 'ghost wide', go)));
  }, true);
}
function lose() {
  const fl = R.floor - 1, reward = fl; S.cardBest = Math.max(S.cardBest || 0, fl); S.cardRun = null; save(); if (reward) gcAdd(reward);
  frame('해골과 카드 대결', B => { B.appendChild(el('div', 'res l', '쓰러졌어요…')); talk(B, 'l', fl ? `B${fl}까지 내려갔어요. 게임 동전 ${reward}개 받아요. …다음엔 사장 얼굴 보러 가요.` : '첫 층에서… 괜찮아요. 방어 카드를 더 써 봐요.'); B.appendChild(row(btn('다시 도전', 'wide', start), btn('오락실로', 'ghost wide', () => ARC.hub()))); }, true);
  tone([200, 150], .5, .08, 'triangle'); R = null;
}

ARC.reg({ id: 'cards', order: 4, name: '해골과 카드 대결', ban: 'cards', icon: gimg('e_boss'), color: '#ff2e6e', sub: () => `덱 빌딩 · 사장 너머 끝없는 지하 · 최고 B${S.cardBest || 0}`, start: intro });
})();
