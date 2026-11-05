// 레나 — 오락실 (다이얼 8번): 허브·게임 동전·해골 빚 슬롯. 다른 게임은 g_*.js가 ARC.reg로 등록한다
// app.js의 전역(S, save, el, $, btn, row, lbl, pick, tone, coinSound, dtmf, toast, SH, openSheet, closeSheet, refreshSheet, dk, sleep, nmc)을 쓴다.
'use strict';
(() => {
const css = `
.arc{position:absolute;inset:0;z-index:45;display:none;flex-direction:column;background:#0b0d11;overflow:hidden}
.arc.on{display:flex}
.arc img{object-fit:contain}
.arc::before{content:"";position:absolute;inset:0;pointer-events:none;background:radial-gradient(rgba(255,255,255,.04) 1px,transparent 1.2px) 0 0/4px 4px,radial-gradient(ellipse at 50% 0%,rgba(255,61,154,.18),transparent 60%),radial-gradient(ellipse at 50% 100%,rgba(47,224,200,.14),transparent 60%)}
.ahd{position:relative;display:flex;align-items:center;gap:10px;padding:calc(var(--st) + 12px) 14px 8px}
.ahd h2{font-family:'Black Han Sans';font-weight:400;font-size:22px;text-shadow:2px 2px 0 var(--pink);flex:1;line-height:1.1}
.gcb{display:flex;align-items:center;gap:5px;height:34px;padding:0 12px 0 6px;border-radius:17px;background:rgba(0,0,0,.6);border:1px solid var(--line);font-family:'Space Mono',monospace;font-weight:700;font-size:15px;color:var(--yel)}
.gcb img{width:24px;height:24px}
.abody{position:relative;flex:1;overflow-y:auto;padding:4px 14px calc(var(--sb) + 16px);display:flex;flex-direction:column;gap:12px}
.talkr{display:flex;align-items:center;gap:10px;min-height:52px;padding:8px 12px;background:rgba(0,0,0,.5);border:1px solid var(--line);border-radius:14px}
.talkr i{width:38px;height:38px;flex:none;border-radius:50%;background:url(assets/lena/cat.jpg) center/cover;border:2px solid #000;box-shadow:2px 2px 0 var(--pink)}
.talkr i.face{background:url(assets/lena/face.jpg) 50% 30%/cover}
.talkr i.sk{background:#151515 url(assets/lena/st_skull.webp) center/80% no-repeat;box-shadow:2px 2px 0 var(--teal)}
.talkr span{font-size:14.5px;font-weight:700;line-height:1.45;word-break:keep-all}
.gcards{display:grid;gap:12px}
.gban{position:relative;display:flex;align-items:center;gap:12px;min-height:96px;padding:12px 14px;border-radius:16px;border:2px solid #000;background:var(--panel2);box-shadow:4px 4px 0 var(--gc,var(--pink));overflow:hidden;text-align:left}
.gban::before{content:"";position:absolute;inset:0;background:radial-gradient(circle at 88% 50%,var(--gc,var(--pink)),transparent 55%);opacity:.22}
.gban:active{transform:translate(2px,2px);box-shadow:2px 2px 0 var(--gc,var(--pink))}
.gban>img{position:relative;width:76px;height:76px;object-fit:contain;flex:none;order:2;margin-left:auto;filter:drop-shadow(3px 3px 0 rgba(0,0,0,.5))}
.gbt{position:relative;flex:1;min-width:0}
.gbt b{display:block;font-family:'Black Han Sans';font-weight:400;font-size:20px}
.gbt small{display:block;font-size:12.5px;color:var(--mute);margin-top:3px;line-height:1.4;word-break:keep-all}
.gban>em{position:absolute;left:14px;top:-1px;font-style:normal;font-size:10.5px;font-weight:800;background:var(--yel);color:#111;padding:2px 7px;border-radius:0 0 8px 8px;border:2px solid #000;border-top:0}
.gban>em{display:flex;align-items:center;gap:1px}.gban>em .ci{width:14px;height:14px;margin:0 1px}
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
.cabw{position:relative;width:100%;max-width:330px;margin:0 auto;padding-right:30px}
.cab{position:relative;width:100%;aspect-ratio:760/1144;background:url(assets/lena/g/slot_cab.webp) center/100% 100% no-repeat;filter:drop-shadow(5px 7px 0 rgba(0,0,0,.55))}
.rwin{position:absolute;left:17.9%;top:28.3%;width:64%;height:24.7%;display:grid;grid-template-columns:repeat(5,1fr);gap:2px;background:#0b0b0f;border-radius:4px;overflow:hidden}
.rwin::after{content:"";position:absolute;inset:0;pointer-events:none;background:linear-gradient(rgba(0,0,0,.55),transparent 22%,transparent 78%,rgba(0,0,0,.55)),linear-gradient(105deg,transparent 30%,rgba(255,255,255,.18) 38%,transparent 46%)}
.reel{position:relative;overflow:hidden;background:#f3efe6}
.strip{position:absolute;left:0;right:0;top:0;will-change:transform}
.sc{height:calc(100% / var(--n));display:grid;place-items:center;position:relative}
.sc img{width:78%;height:78%;object-fit:contain}
.strip.blur .sc img{filter:blur(2px) saturate(.8)}
.sc.hit{background:#fff36b;animation:hit .5s var(--ease) 3}
.sc.hit::after{content:"";position:absolute;inset:1px;border:2px solid var(--pink);border-radius:3px}
.tray{position:absolute;left:28%;right:28%;bottom:8.5%;height:6%;display:grid;place-items:center;font-family:'Black Han Sans';font-size:clamp(16px,6vw,24px);color:var(--yel);text-shadow:2px 2px 0 #000,0 0 10px rgba(242,234,58,.7);pointer-events:none}
.lvr{position:absolute;right:0;top:22%;width:30px;height:46%;touch-action:none;cursor:grab}
.lvr .bs{position:absolute;left:4px;right:4px;top:46%;height:16%;border-radius:6px;background:linear-gradient(#3a3f47,#15181c);border:2px solid #000}
.lvr .arm{position:absolute;left:11px;width:8px;border-radius:4px;background:linear-gradient(90deg,#8a8f96,#f2f4f6 45%,#6d7279);border:1.5px solid #000}
.lvr .ball{position:absolute;left:50%;width:28px;height:28px;margin:-14px 0 0 -14px;border-radius:50%;background:radial-gradient(circle at 35% 30%,#ffd1e6,#ff3d9a 45%,#a3105a);border:2px solid #000;box-shadow:2px 3px 0 rgba(0,0,0,.5)}
.pullb{display:block;margin:10px auto 0;height:44px;padding:0 18px;border-radius:22px;border:2px solid #000;background:var(--pink);color:#fff;font-weight:800;font-size:14px;box-shadow:0 3px 0 #000}
.pullb:disabled{filter:grayscale(.6);opacity:.6}
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
function hdr() { const g = $('gcb'); if (!g) return; g.innerHTML = ''; const i = el('img'); i.src = CUR('gc'); i.alt = ''; g.append(i, document.createTextNode(gc())); g.title = '게임 동전'; }
function talk(B, who, t) { const r = el('div', 'talkr'), i = el('i', who === 'sk' ? 'sk' : $('app').classList.contains('outside') ? '' : 'face'); const s = el('span', null, t); r.append(i, s); B.appendChild(r); return s; }
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
      c.append(t, ic); if (g.cost) { const em = el('em'); em.innerHTML = `입장 ${ci('gc')}${g.cost}`; c.appendChild(em); } c.onclick = () => { dtmf((i % 9) + 1); g.start(); }; G.appendChild(c);
    });
    B.appendChild(G);
    B.appendChild(el('div', 'rules', '게임 동전은 매일 10개씩 들어와요(최대 99). 게임을 잘하면 더 받아요. 다 잃으면 하루 한 번 레나가 3개 빌려줘요.'));
    if (gc() < 1) B.appendChild(row(btn('레나에게 동전 빌리기', 'wide', () => { if (S.gcLoan === dk(new Date())) { toast('오늘은 이미 빌렸어요. 내일 또 와요.'); return; } S.gcLoan = dk(new Date()); gcAdd(3); coinSound(); hub(); })));
    const vb = btn('', 'ghost wide', () => { closeArc(); openSheet('shop'); }); vb.innerHTML = `${ci('gc')}게임 동전으로 자판기 가기`; B.appendChild(row(vb));
    const lg = el('div', 'hint'); lg.innerHTML = `${ci('gc')}<b>게임 동전</b>: 매일 +10(최대 99) · 오락실 입장·보상 · 레나 자판기(선물·부스 장식)`; B.appendChild(lg);
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
    const r = el('div', 'rules'); r.innerHTML = '<b>하는 법</b><br>· 밤마다 레버를 <b>8번</b> 당길 수 있어요. 5×3칸에 그림이 나와요.<br>· 같은 그림이 <b>가로로 3칸 이상</b>, <b>세로 3칸</b>, <b>대각선 3칸</b> 이어지면 칩을 벌어요. 해골은 아무 그림 대신이 돼요.<br>· 그림 값: 동전 1 · 하트 2 · 입술 3 · 번개 3 · 별 5. 가로 3칸 ×2, 4칸 ×5, 5칸 ×12, 세로 ×3, 대각선 ×2.<br>· 빚을 갚고 남은 칩에는 <b>이자 10%</b>(최대 15)가 붙어요.<br>· 빚을 갚으면 <b>기계에 그림 하나를 넣어요</b>. 넣은 그림은 더 자주, 더 비싸게 나와요. 나만의 기계를 키우는 게 핵심!<br>· 밤이 끝나면 벌어 둔 칩으로 <b>빚</b>을 갚아요. 남은 칩으로 <b>부적</b>을 사서 기계를 유리하게 바꿔요.<br>· 빚은 밤마다 커져요. 못 갚으면 끝. 버틴 밤 × 3개만큼 게임 동전을 받아요.';
    B.appendChild(r);
    B.appendChild(row(btn(gc() >= 3 ? '동전 3개 넣고 시작' : '동전이 모자라요 (3개 필요)', 'wide', () => { if (gc() < 3) { toast('게임 동전이 모자라요.'); return; } gcAdd(-3); coinSound(); R = { night: 1, spins: 7, chips: 0, ch: [], rr: true, grid: null, offers: null }; R.spins = spinsPer(); S.slotRun = R; save(); slotDraw(); })));
  }, true);
}
function roll() { const w = Object.entries(SYM).map(([k, s]) => [k, s.w * (k === 'heart' && has('hrt') ? 2 : 1) * (k === 'skull' && has('sk') ? 2 : 1) + ((R.add || {})[k] || 0) * 9]); const t = w.reduce((a, x) => a + x[1], 0); let r = Math.random() * t; for (const [k, x] of w) if ((r -= x) < 0) return k; return 'coin'; }
function sv(k) { return SYM[k].v + (k === 'lips' && has('lip') ? 3 : 0) + (k === 'star' && has('st') ? 4 : 0) * 1 + 0 || 0; }
function symVal(k) { let v = SYM[k].v + ((R && R.add || {})[k] || 0); if (k === 'lips' && has('lip')) v += 3; if (k === 'star' && has('st')) v += 4; if (k === 'coin' && has('cn')) v *= 3; return v; }
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
    const st = el('div', 'stat');
    [['NIGHT', R.night, '', 'danger'], ['CHIPS', R.chips, '', 'chip'], ['DEBT', quota(R.night), 'due', 'debt']].forEach(([a, b, c, k]) => { const d = el('div', c), sm = el('small'); sm.innerHTML = ci(k) + a; d.append(sm, el('b', null, b)); st.appendChild(d); });
    B.appendChild(st);
    // 진짜 슬롯머신: 기계 그림의 창 안에 릴 5개, 오른쪽에 당기는 레버
    const W = el('div', 'cabw'), C = el('div', 'cab'), win = el('div', 'rwin'); win.id = 'rwin';
    const g = R.grid || [0, 1, 2].map(() => [0, 1, 2, 3, 4].map(roll));
    for (let c = 0; c < 5; c++) { const reel = el('div', 'reel'), strip = el('div', 'strip'); strip.style.setProperty('--n', 3); strip.style.height = '100%';
      for (let r = 0; r < 3; r++) { const sc = el('div', 'sc' + (hits && hits.has(r * 5 + c) ? ' hit' : '')), i = el('img'); i.src = img(SIMG[g[r][c]]); i.alt = SYM[g[r][c]].n; sc.appendChild(i); strip.appendChild(sc); }
      reel.appendChild(strip); win.appendChild(reel); }
    C.appendChild(win);
    const tray = el('div', 'tray', gain == null ? '' : gain ? `+${gain}` : '꽝'); tray.id = 'tray'; C.appendChild(tray);
    W.appendChild(C);
    if (!R.offers && !R.symOpts) W.appendChild(lever());
    B.appendChild(W);
    if (!R.offers && !R.symOpts) { const pb = el('button', 'pullb', R.spins > 0 ? `레버 당기기 · 남은 ${R.spins}번` : '빚 갚으러 가기'); pb.id = 'lever'; pb.onclick = () => R.spins > 0 ? pullAnim() : settle(); B.appendChild(pb); }
    if (R.offers || R.symOpts) shop(B);
    else talk(B, R.chips >= quota(R.night) ? 'l' : 'sk', R.say || (R.chips >= quota(R.night) ? '빚은 다 모았어요. 남은 건 더 벌어서 부적 사요.' : `(해골이 장부를 톡톡 친다) 오늘 밤 갚을 빚 ${quota(R.night)}.`));
    const CC = el('div', 'charms'); if (!R.ch.length) CC.appendChild(el('span', 'hint', '부적 없음 — 밤을 넘기면 살 수 있어요')); R.ch.forEach(id => { const x = CH.find(c => c.id === id); const t = el('div', 'charm'), i = el('img'); i.src = img(x.i); i.alt = ''; t.append(i, document.createTextNode(x.n)); t.title = x.d; t.onclick = () => toast(`${x.n}: ${x.d}`); CC.appendChild(t); });
    B.append(lbl('내 부적 (최대 5개)'), CC);
    B.appendChild(row(btn('그만두기', 'ghost wide', () => { if (!confirm('이번 판을 그만둘까요? 버틴 밤만큼 동전을 받아요.')) return; over(true); })));
  }, true);
}
// 레버: 공을 아래로 끌어내리면(또는 누르면) 당겨진다. p=0 위, p=1 끝까지 내림
let lvSet = null;
function lever() {
  const L = el('div', 'lvr'), bs = el('div', 'bs'), arm = el('div', 'arm'), ball = el('div', 'ball'); L.append(bs, arm, ball); L.id = 'lvr';
  const set = p => { const H = L.clientHeight || 200, piv = H * .54, len = H * .48, by = piv - len * Math.cos(Math.PI * p), sc = 1 + .35 * Math.sin(Math.PI * p);
    ball.style.top = by + 'px'; ball.style.transform = `scale(${sc})`; arm.style.top = Math.min(by, piv) + 'px'; arm.style.height = Math.abs(by - piv) + 'px'; arm.style.width = (8 * (1 + .3 * Math.sin(Math.PI * p))) + 'px'; };
  lvSet = set; requestAnimationFrame(() => set(0));
  let drag = null;
  L.onpointerdown = e => { if (spinning || R.spins <= 0) { if (!spinning && R.spins <= 0) settle(); return; } drag = { y: e.clientY, p: 0 }; L.setPointerCapture(e.pointerId); };
  L.onpointermove = e => { if (!drag) return; drag.p = Math.max(0, Math.min(1, (e.clientY - drag.y) / (L.clientHeight * .8))); set(drag.p); };
  L.onpointerup = L.onpointercancel = () => { if (!drag) return; const p = drag.p; drag = null; if (p < .08) return pullAnim(); if (p > .55) { springBack(p); spin(); } else springBack(p); };
  return L;
}
function springBack(from) { const t0 = performance.now(); const f = now => { const u = Math.min(1, (now - t0) / 380), p = from * (1 - u) * Math.cos(u * 8) ** 2; lvSet && lvSet(Math.max(0, p)); if (u < 1) requestAnimationFrame(f); }; requestAnimationFrame(f); tone([180], .06, .04, 'square'); }
function pullAnim() { if (spinning || R.spins <= 0) return; const t0 = performance.now(); const f = now => { const u = Math.min(1, (now - t0) / 260); lvSet && lvSet(u); if (u < 1) requestAnimationFrame(f); else { springBack(1); spin(); } }; requestAnimationFrame(f); }
async function spin() {
  if (spinning || R.spins <= 0) return; spinning = true; R.spins--; R.say = '';
  const g = [0, 1, 2].map(() => [0, 1, 2, 3, 4].map(roll)), old = R.grid || g;
  const pb = $('lever'); if (pb) { pb.disabled = true; pb.textContent = `돌아가는 중… · 남은 ${R.spins}번`; }
  const tray = $('tray'); if (tray) tray.textContent = '';
  const keys = Object.keys(SYM).filter(k => k !== 'skull'), N = 20;
  const reels = [...document.querySelectorAll('#rwin .reel')];
  // 릴마다 긴 띠를 만들어 위에서 아래로 굴린다: [새 3칸][무작위 14칸][지금 3칸]
  const done = reels.map((reel, c) => new Promise(res => {
    const strip = reel.querySelector('.strip'); strip.innerHTML = ''; strip.style.setProperty('--n', N); strip.style.height = (N / 3 * 100) + '%';
    const list = [g[0][c], g[1][c], g[2][c], ...Array.from({ length: N - 6 }, () => pick(keys)), old[0][c], old[1][c], old[2][c]];
    list.forEach(k => { const sc = el('div', 'sc'), i = el('img'); i.src = img(SIMG[k]); i.alt = ''; sc.appendChild(i); strip.appendChild(sc); });
    strip.style.transition = 'none'; strip.style.transform = `translateY(${-(N - 3) / N * 100}%)`; strip.classList.add('blur');
    void strip.offsetHeight;
    const dur = 900 + c * 260;
    strip.style.transition = `transform ${dur}ms cubic-bezier(.25,.75,.3,1.06)`; strip.style.transform = 'translateY(0)';
    setTimeout(() => { strip.classList.remove('blur'); tone([300 + c * 70], .05, .05, 'square'); res(); }, dur);
  }));
  const tick = setInterval(() => tone([900 + Math.random() * 200], .015, .015, 'square'), 90);
  await Promise.all(done); clearInterval(tick);
  let s = score(g);
  if (!s.tot && has('rr') && R.rr) { R.rr = false; R.spins++; R.say = '(다시 걸기 부적이 반짝였다) 꽝은 없던 걸로 해요.'; }
  R.grid = g; R.chips += s.tot; S.slotRun = R; save();
  if (s.tot >= 20) { coinSound(); setTimeout(coinSound, 180); } else if (s.tot) coinSound();
  if (!R.say) R.say = s.tot >= 40 ? pick(['대박! …지금 저 보고 웃은 거 맞죠?', '와, 기계가 송휘님한테 반했나 봐요.']) : s.tot >= 15 ? pick(['좋아요, 그 손맛.', '해골이 장부에 뭔가 적다가 멈췄어요.']) : s.tot ? pick(['조금씩이라도 모아요.', '티끌 모아 빚 갚기.']) : pick(['꽝. …괜찮아요, 저 아직 여기 있어요.', '(해골이 어깨를 으쓱한다)']);
  spinning = false; slotDraw(s.tot, s.hits);
  // 받은 칩 숫자가 동전 받침에서 올라가며 세어진다
  const tr = $('tray'); if (tr && s.tot) { let v = 0; const step = Math.max(1, Math.ceil(s.tot / 18)); const iv = setInterval(() => { v = Math.min(s.tot, v + step); tr.textContent = `+${v}`; tone([1200 + v * 3], .02, .02, 'triangle'); if (v >= s.tot) clearInterval(iv); }, 45); }
}
function settle() {
  const q = quota(R.night);
  if (R.chips < q) { if (!R.loan) return loanAsk(q); return over(false); }
  R.chips -= q; const intr = Math.min(15, Math.floor(R.chips * .1)); R.chips += intr; R.intr = intr; R.night++; R.spins = spinsPer(); R.rr = true; R.grid = null;
  const pool = CH.filter(c => !R.ch.includes(c.id)); R.offers = []; while (R.offers.length < 3 && pool.length) R.offers.push(pool.splice(Math.random() * pool.length | 0, 1)[0].id);
  R.symOpts = Object.keys(SYM).filter(k => k !== 'skull').sort(() => Math.random() - .5).slice(0, 3);
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
  if (R.symOpts) { // 밤마다 기계에 그림 하나를 더 넣어 나만의 슬롯을 만든다
    talk(B, 'l', `빚 갚았어요! ${R.night - 1}번째 밤 통과.${R.intr ? ` 남은 칩 이자 +${R.intr}.` : ''} 먼저 기계에 그림 하나 넣어요. 넣은 그림은 더 자주 나오고 값도 +1이에요.`);
    const P = el('div', 'shop'); R.symOpts.forEach(k => { const o = el('div', 'offer'), i = el('img'); i.src = img(SIMG[k]); i.alt = ''; const t = el('div'), n = (R.add || {})[k] || 0; t.append(el('b', null, `${SYM[k].n} 넣기${n ? ` (지금 ${n}개)` : ''}`), el('small', null, `값 ${symVal(k)} → ${symVal(k) + 1} · 더 자주 나와요`)); o.append(i, t, btn('넣기', '', () => { R.add = R.add || {}; R.add[k] = (R.add[k] || 0) + 1; R.symOpts = null; S.slotRun = R; save(); coinSound(); slotDraw(); })); P.appendChild(o); });
    B.appendChild(P); B.appendChild(row(btn('안 넣기', 'ghost wide', () => { R.symOpts = null; S.slotRun = R; save(); slotDraw(); }))); return;
  }
  talk(B, 'l', `남은 칩 ${R.chips}개로 부적 하나 골라 봐요.`);
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
