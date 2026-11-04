// 레나 — 오락실 (다이얼 8번): 허브·게임 동전·해골 빚 슬롯. 다른 게임은 g_*.js가 ARC.reg로 등록한다
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
.gban{position:relative;display:flex;align-items:center;gap:12px;min-height:96px;padding:12px 14px;border-radius:16px;border:2px solid #000;background:var(--panel2);box-shadow:4px 4px 0 var(--gc,var(--pink));overflow:hidden;text-align:left}
.gban::before{content:"";position:absolute;inset:0;background:radial-gradient(circle at 88% 50%,var(--gc,var(--pink)),transparent 55%);opacity:.22}
.gban:active{transform:translate(2px,2px);box-shadow:2px 2px 0 var(--gc,var(--pink))}
.gban img{position:relative;width:76px;height:76px;object-fit:contain;flex:none;order:2;margin-left:auto;filter:drop-shadow(3px 3px 0 rgba(0,0,0,.5))}
.gbt{position:relative;flex:1;min-width:0}
.gbt b{display:block;font-family:'Black Han Sans';font-weight:400;font-size:20px}
.gbt small{display:block;font-size:12.5px;color:var(--mute);margin-top:3px;line-height:1.4;word-break:keep-all}
.gban>em{position:absolute;left:14px;top:-1px;font-style:normal;font-size:10.5px;font-weight:800;background:var(--yel);color:#111;padding:2px 7px;border-radius:0 0 8px 8px;border:2px solid #000;border-top:0}
.abody.flat{padding:0;overflow:hidden;gap:0}
.abody>*{flex-shrink:0}
.abody.flat>*{flex-shrink:1}
.gcard{display:flex;align-items:center;gap:14px;padding:14px;border-radius:16px;background:var(--panel2);border:2px solid #000;box-shadow:4px 4px 0 var(--pink);text-align:left}
.gcard:nth-child(2){box-shadow:4px 4px 0 var(--teal)}
.gcard img{width:62px;height:62px;flex:none}
.gcard b{display:block;font-family:'Black Han Sans';font-weight:400;font-size:20px}
.gcard small{display:block;font-size:12.5px;color:var(--mute);margin-top:3px;line-height:1.45;word-break:keep-all}
/* common */
.res{font-family:'Black Han Sans';font-size:28px;text-align:center;text-shadow:2px 2px 0 #000;min-height:32px}
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
  if (S.gc == null) S.gc = 0;
  const t = dk(new Date());
  if (S.gcDay !== t) { S.gcDay = t; S.gc = Math.min(99, (S.gc || 0) + 10); S.gcLoan = ''; save(); return true; }
  return false;
}
const gc = () => S.gc || 0;
function gcAdd(n) { S.gc = Math.max(0, Math.min(999, gc() + n)); save(); hdr(); }

// ---------- 화면 틀 ----------
let cur = '', cleanup = null;
function frame(title, body, back, flat) {
  if (cleanup) { try { cleanup(); } catch (e) {} cleanup = null; }
  A.innerHTML = ''; A.scrollLeft = A.scrollTop = 0; $('app').scrollLeft = $('app').scrollTop = 0;
  const h = el('div', 'ahd');
  if (back) { const b = el('button', 'sx'); b.innerHTML = '<svg viewBox="0 0 24 24"><path d="M14.5 6l-6 6 6 6"/></svg>'; b.onclick = () => { dtmf('*'); hub(); }; h.appendChild(b); }
  h.appendChild(el('h2', null, title));
  const g = el('div', 'gcb'); g.id = 'gcb'; h.appendChild(g);
  const x = el('button', 'sx'); x.innerHTML = '<svg viewBox="0 0 24 24"><path d="M7 7l10 10M17 7L7 17"/></svg>'; x.onclick = closeArc; h.appendChild(x);
  const B = el('div', 'abody' + (flat ? ' flat' : '')); A.append(h, B); body(B); hdr(); return B;
}
function hdr() { const g = $('gcb'); if (!g) return; g.innerHTML = ''; const i = el('img'); i.src = img('st_coin'); i.alt = ''; g.append(i, document.createTextNode(gc())); }
function talk(B, who, t) { const r = el('div', 'talkr'), i = el('i', who === 'sk' ? 'sk' : ''); const s = el('span', null, t); r.append(i, s); B.appendChild(r); return s; }
function openArc() { const fresh = gcInit(); A.classList.add('on'); hub(fresh); }
function closeArc() { if (cleanup) { try { cleanup(); } catch (e) {} cleanup = null; } A.classList.remove('on'); cur = ''; if (typeof renderHome === 'function') renderHome(); }
window.openArc = openArc;
window.ARC = { A, frame, talk, gc, gcAdd, hub, reg, img, gimg: n => `assets/lena/g/${n}.webp`, set cleanup(f) { cleanup = f; }, get cleanup() { return cleanup; }, closeArc };

const GAMES = [];
function reg(g) { GAMES.push(g); GAMES.sort((x, y) => (x.order || 9) - (y.order || 9)); }
function hub(fresh) {
  cur = 'hub';
  frame('오락실', B => {
    talk(B, 'l', fresh ? `${nmc()}오늘 게임 동전 10개 넣어 뒀어요. …다 잃어도 울지 마요.` : pick(['한 판 해요? 저 보는 앞에서 지면 더 재밌는데.', '해골들이 기다려요. 오늘은 뭐 할래요?', '오늘은 운 좋은 얼굴이네요.']));
    const G = el('div', 'gcards');
    GAMES.forEach((g, i) => {
      const c = el('button', 'gban'); c.style.setProperty('--gc', g.color || 'var(--pink)'); const ic = el('img'); ic.src = g.icon; ic.alt = '';
      const t = el('div', 'gbt'); t.append(el('b', null, g.name), el('small', null, g.sub()));
      c.append(t, ic); if (g.cost) c.appendChild(el('em', null, `입장 동전 ${g.cost}`)); c.onclick = () => { dtmf((i % 9) + 1); g.start(); }; G.appendChild(c);
    });
    B.appendChild(G);
    B.appendChild(el('div', 'rules', '게임 동전은 매일 10개씩 들어와요(최대 99). 게임을 잘하면 더 받아요. 다 잃으면 하루 한 번 레나가 3개 빌려줘요.'));
    if (gc() < 1) B.appendChild(row(btn('레나에게 동전 빌리기', 'wide', () => { if (S.gcLoan === dk(new Date())) { toast('오늘은 이미 빌렸어요. 내일 또 와요.'); return; } S.gcLoan = dk(new Date()); gcAdd(3); coinSound(); hub(); })));
    const sp = el('div', 'rules'); sp.innerHTML = `할 일 동전 <b>${S.coins}</b>개 · 3개로 레나와 <b>특별 통화</b>(길게 칭찬)`;
    B.appendChild(sp);
    B.appendChild(row(btn('할 일 동전 3개로 특별 통화', 'ghost wide', () => { if (S.coins < 3) { toast(`할 일 동전이 ${3 - S.coins}개 모자라요.`); return; } S.coins -= 3; save(); closeArc(); openCall(); setTimeout(() => sendText('(동전 3개를 넣었어. 특별 통화로 칭찬이랑 응원 듬뿍 해줘)', true), 500); })));
  });
}

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
function quota(n) { return Math.round(26 * Math.pow(1.36, n - 1) * (has('bk') ? .85 : 1)); }
function spinsPer() { return 8 + (has('ph') ? 2 : 0); }
function slotEnter() {
  R = S.slotRun || null;
  if (R) return slotDraw();
  frame('해골 빚 슬롯', B => {
    talk(B, 'sk', '(해골이 두꺼운 장부를 펼쳐 보인다. 첫 장에 당신 이름이 적혀 있다)');
    talk(B, 'l', '빚 갚는 게임이에요. 밤마다 정해진 만큼 벌어서 해골한테 갚으면 돼요. …못 갚으면? 끝이죠, 뭐.');
    const r = el('div', 'rules'); r.innerHTML = '<b>하는 법</b><br>· 밤마다 레버를 <b>8번</b> 당길 수 있어요. 5×3칸에 그림이 나와요.<br>· 같은 그림이 <b>가로로 3칸 이상</b>, <b>세로 3칸</b>, <b>대각선 3칸</b> 이어지면 칩을 벌어요. 해골은 아무 그림 대신이 돼요.<br>· 그림 값: 동전 1 · 하트 2 · 입술 3 · 번개 3 · 별 5. 가로 3칸 ×2, 4칸 ×5, 5칸 ×12, 세로 ×3, 대각선 ×2.<br>· 밤이 끝나면 벌어 둔 칩으로 <b>빚</b>을 갚아요. 남은 칩으로 <b>부적</b>을 사서 기계를 유리하게 바꿔요.<br>· 빚은 밤마다 커져요. 못 갚으면 끝. 버틴 밤 × 3개만큼 게임 동전을 받아요.';
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
  if (R.chips < q) { if (!R.loan) return loanAsk(q); return over(false); }
  R.chips -= q; R.night++; R.spins = spinsPer(); R.rr = true; R.grid = null;
  const pool = CH.filter(c => !R.ch.includes(c.id)); R.offers = []; while (R.offers.length < 3 && pool.length) R.offers.push(pool.splice(Math.random() * pool.length | 0, 1)[0].id);
  R.say = ''; S.slotBest = Math.max(S.slotBest || 0, R.night - 1); S.slotRun = R; save(); coinSound();
  slotDraw();
}
function loanAsk(q) {
  frame('해골 빚 슬롯', B => {
    B.appendChild(el('div', 'res l', `빚 ${q - R.chips} 모자라요`));
    talk(B, 'sk', '(해골이 장부를 덮으려다 멈춘다)');
    talk(B, 'l', '…한 번만 제가 대신 갚아 줄게요. 대신 다음 밤엔 더 열심히 해요? 약속.');
    B.appendChild(row(btn('레나 외상으로 버티기 (한 번만)', 'teal wide', () => { R.loan = 1; R.chips = q; settle(); }), btn('여기서 끝내기', 'ghost wide', () => over(false))));
  }, true);
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

reg({ id: 'slot', order: 5, name: '해골 빚 슬롯', ban: 'slot', icon: img('st_lips'), color: '#f2ea3a', cost: 3, sub: () => `밤마다 해골에게 빚 갚기 · 최고 ${S.slotBest || 0}밤`, start: slotEnter });

// 다이얼 8번 = 오락실
SH[8] = { t: '오락실', s: '', r: () => {}, direct: openArc };
})();
