// 오락실 — 해골 전화국 (방치형): 부스를 늘려 동전을 번다. 앱을 꺼 둬도 쌓인다.
'use strict';
(() => {
const { frame, talk, gcAdd, gimg } = ARC;
const css = `
.idt{display:flex;flex-direction:column;align-items:center;gap:2px;padding:6px 0 2px}
.idt b{font-family:'Space Mono',monospace;font-size:34px;color:var(--yel);text-shadow:3px 3px 0 #000;line-height:1.1}
.idt small{font-family:'Space Mono',monospace;font-size:13px;color:var(--mint)}
.itap{position:relative;height:190px;border-radius:18px;border:3px solid #000;background:radial-gradient(ellipse at 50% 85%,rgba(255,61,154,.35),transparent 60%),linear-gradient(#1b2027,#0f1216);box-shadow:5px 5px 0 var(--pink);overflow:hidden;display:flex;align-items:flex-end;justify-content:center;gap:4px}
.itap::after{content:"누르면 동전";position:absolute;top:8px;left:10px;font-size:11.5px;font-weight:800;background:rgba(0,0,0,.6);padding:3px 8px;border-radius:9px}
.itap img.bm{height:150px;filter:drop-shadow(4px 4px 0 rgba(0,0,0,.6));transition:transform .08s}
.itap img.wk{height:84px;margin-bottom:6px;filter:drop-shadow(3px 3px 0 rgba(0,0,0,.6))}
.itap:active img.bm{transform:scale(.95)}
.fly$ {position:absolute;font-family:'Space Mono',monospace;font-weight:700;color:var(--yel);text-shadow:2px 2px 0 #000;pointer-events:none;animation:fl 0.9s ease-out forwards}
@keyframes fl{to{transform:translateY(-70px);opacity:0}}
.boost{display:flex;align-items:center;gap:10px;padding:10px 12px;border-radius:14px;background:rgba(0,0,0,.5);border:1px solid var(--line);font-size:13.5px}
.boost b{color:var(--yel)}
.boost .btn{height:38px;padding:0 12px;font-size:13px;margin-left:auto}
.bl{display:flex;flex-direction:column;gap:8px}
.bo{display:flex;align-items:center;gap:10px;padding:8px 10px;border-radius:14px;background:var(--panel2);border:1px solid var(--line)}
.bo.lock{opacity:.45}
.bo img{width:46px;height:56px;object-fit:contain;flex:none}
.bo .t{flex:1;min-width:0}.bo .t b{display:block;font-size:15px;font-weight:800}.bo .t small{display:block;font-family:'Space Mono',monospace;font-size:11.5px;color:var(--mute);margin-top:2px}
.bo .btn{height:44px;min-width:92px;padding:0 10px;font-size:13px;display:flex;flex-direction:column;justify-content:center;line-height:1.15}
.bo .btn small{font-family:'Space Mono',monospace;font-size:11px;font-weight:700;opacity:.9}
.bo .btn:disabled{filter:grayscale(.8);opacity:.5}
.mul{display:flex;gap:6px;justify-content:flex-end}
.mul button{height:30px;padding:0 10px;border-radius:15px;border:1px solid var(--line);font-size:12.5px;font-weight:700;color:#dfe7ea}
.mul button.on{background:var(--teal);color:#000;border-color:var(--teal)}
.itop{display:flex;align-items:center;gap:10px;font-family:'Space Mono',monospace;font-size:13px;color:var(--mint)}
.itop .tm{margin-left:auto;font-size:20px;font-weight:700;color:var(--yel)}
.itop .tm.low{color:var(--hot);animation:blink .5s steps(2) infinite}
@keyframes blink{50%{opacity:.4}}
.igoal{height:12px;border-radius:6px;background:rgba(0,0,0,.6);border:2px solid #000;position:relative;overflow:hidden}
.igoal i{position:absolute;left:0;top:0;bottom:0;background:linear-gradient(90deg,var(--teal),var(--pink));transition:width .2s}
.igoal b{position:absolute;top:-1px;width:2px;bottom:-1px;background:#fff;opacity:.8}
.gcall{position:absolute;right:10px;top:10px;z-index:2;height:44px;padding:0 14px;border-radius:22px;background:var(--yel);color:#000;font-weight:900;border:2.5px solid #000;box-shadow:3px 3px 0 var(--pink);animation:ring .25s ease-in-out infinite alternate}
@keyframes ring{from{transform:rotate(-6deg)}to{transform:rotate(6deg)}}
.itap.fever{box-shadow:5px 5px 0 var(--yel),0 0 24px var(--yel)}
`.replace('.fly$ ', '.icn');
document.head.appendChild(Object.assign(document.createElement('style'), { textContent: css }));

// 한 판 = 3분 영업. 매번 빨간 부스 하나로 처음부터 시작, 영구 강화 없음.
const BO = [
  { id: 'red', n: '낡은 빨간 부스', im: 'b_red', inc: 1, cost: 10 },
  { id: 'neon', n: '핑크 네온 부스', im: 'b_neon', inc: 6, cost: 70 },
  { id: 'teal', n: '장거리 유리 부스', im: 'b_teal', inc: 36, cost: 500 },
  { id: 'gold', n: '황금 국제전화', im: 'b_gold', inc: 216, cost: 3600 },
  { id: 'skull', n: '해골 핫라인', im: 'b_skull', inc: 1296, cost: 26000 },
  { id: 'vip', n: '레나 VIP 회선', im: 'b_vip', inc: 7776, cost: 190000 }
];
const UP = [
  { id: 'worker', n: '해골 직원 고용', d: '누를 때 초당 수익의 15%를 더 벌어요', im: 'b_worker', cost: 150, need: ['neon', 1] },
  { id: 'sign', n: '네온 간판', d: '모든 부스 수익 ×1.5', im: 'b_star', cost: 4000, need: ['teal', 5] },
  { id: 'ad', n: '레나 광고판', d: '모든 부스 수익 ×2', im: 'b_vip', cost: 120000, need: ['skull', 3] },
  { id: 'gold', n: '황금 수화기', d: '누를 때 벌이 ×5', im: 'b_gold', cost: 600000, need: ['vip', 3] }
];
const TIME = 180, GOAL = [[80000, 'C', 2], [300000, 'B', 4], [900000, 'A', 7], [2500000, 'S', 12]];
let I = null, mul = 1, s = null;
if (S.idl) { delete S.idl; save(); } // 예전 방치형 저장 지우기
const lv = id => s.b[id] || 0, hasU = id => s.up.includes(id);
function fmt(n) { n = Math.floor(n); if (n < 1e4) return n.toLocaleString(); if (n < 1e8) return (n / 1e4).toFixed(n < 1e5 ? 1 : 0) + '만'; return (n / 1e8).toFixed(1) + '억'; }
const MS = [10, 25, 50, 100]; // 이 개수를 넘을 때마다 그 부스 수익 ×2
const msMul = l => Math.pow(2, MS.filter(m => l >= m).length), nextMs = l => MS.find(m => l < m);
function incOf(b) { const l = lv(b.id); return b.inc * l * msMul(l); }
const maxN = b => { let n = 0, t = 0; while (n < 500) { const c = b.cost * Math.pow(1.15, lv(b.id) + n); if (t + c > s.c) break; t += c; n++; } return Math.max(1, n); };
const nOf = b => mul === 'max' ? maxN(b) : mul;
function rate() { let r = BO.reduce((a, b) => a + incOf(b), 0); if (hasU('sign')) r *= 1.5; if (hasU('ad')) r *= 2; if (s.fever > s.t) r *= 3; return r; }
function costOf(b, n) { let t = 0, l = lv(b.id); for (let i = 0; i < n; i++) t += b.cost * Math.pow(1.15, l + i); return Math.ceil(t); }
function earn(x) { s.c += x; s.tot += x; }
const grade = () => { let g = null; GOAL.forEach(x => { if (s.tot >= x[0]) g = x; }); return g; };

function intro() {
  frame('해골 전화국', B => {
    talk(B, 'l', '오늘 밤 딱 3분 영업이에요. 부스 하나로 시작해서 얼마나 벌어 오나 볼게요. …손 빠른 사람 좋아해요.');
    const r = el('div', 'rules'); r.innerHTML = `<b>하는 법</b><br>· 큰 부스를 <b>누르면</b> ${ci('phone')}동전, 부스를 사면 초당 동전이 늘어요.<br>· 같은 부스를 <b>10·25·50·100개</b> 모으면 그 부스 수익이 두 배씩.<br>· 가끔 <b>따르릉!</b> 황금 전화가 와요. 3초 안에 받으면 열광(수익 ×3)·불타는 손(누르기 ×7)·행운(돈 바로) 중 하나.<br>· 3분 동안 번 돈으로 등급이 정해져요: C ${fmt(GOAL[0][0])} · B ${fmt(GOAL[1][0])} · A ${fmt(GOAL[2][0])} · S ${fmt(GOAL[3][0])}<br>· 매 판 처음부터, 영구 강화는 없어요.`;
    B.appendChild(r);
    const best = S.idr || {}; B.appendChild(el('div', 'rules', `최고 기록: ${best.tot ? `${fmt(best.tot)} (${best.g || '-'})` : '없음'}`));
    const go = btn('', 'wide', () => { if (ARC.gc() < 2) { toast('게임 동전이 모자라요.'); return; } gcAdd(-2); coinSound(); play(); }); go.innerHTML = `${ci('gc')}2개 넣고 영업 시작`; B.appendChild(row(go));
    B.appendChild(el('div', 'hint', `보상 ${ci('gc')} C ${GOAL[0][2]} · B ${GOAL[1][2]} · A ${GOAL[2][2]} · S ${GOAL[3][2]}`)).innerHTML = `보상 ${ci('gc')} C ${GOAL[0][2]} · B ${GOAL[1][2]} · A ${GOAL[2][2]} · S ${GOAL[3][2]}`;
  }, true);
}

function play() {
  s = { c: 0, tot: 0, b: { red: 1 }, up: [], t: 0, fever: -1, call: 20 + Math.random() * 15, callEnd: 0, done: false };
  let tm = 0, last = performance.now();
  render();
  tm = setInterval(() => {
    const now = performance.now(), dt = Math.min(.5, (now - last) / 1000); last = now; if (!s || s.done) return;
    s.t += dt; earn(rate() * dt);
    if (!s.callEnd && s.t >= s.call) { s.callEnd = s.t + 3; I && I.ring(true); tone([1300, 1600], .12, .05, 'square'); }
    if (s.callEnd && s.t > s.callEnd) { s.callEnd = 0; s.call = s.t + 22 + Math.random() * 18; I && I.ring(false); }
    if (s.t >= TIME) return finish();
    I && I.upd();
  }, 100);
  ARC.cleanup = () => { clearInterval(tm); I = null; s && (s.done = true); };
}

function render() {
  frame('해골 전화국', B => {
    const T = el('div', 'itop'); const sc = el('span'), tmEl = el('span', 'tm'); T.append(sc, tmEl); B.appendChild(T);
    const gb = el('div', 'igoal'), gi = el('i'); gb.appendChild(gi); GOAL.forEach(g => { const m = el('b'); m.style.left = (g[0] / GOAL[3][0] * 100) + '%'; gb.appendChild(m); }); B.appendChild(gb);
    const D = el('div', 'idt'); const cb = el('b'), rs = el('small'); D.append(cb, rs); B.appendChild(D);
    const tap = el('button', 'itap'); const bm = el('img', 'bm'); bm.alt = ''; tap.appendChild(bm); const wk = el('img', 'wk'); wk.src = gimg('b_worker'); wk.alt = ''; tap.appendChild(wk);
    const gc = el('button', 'gcall', '따르릉! 받기'); gc.style.display = 'none'; gc.onclick = e => { e.stopPropagation(); if (!s.callEnd) return; s.callEnd = 0; s.call = s.t + 22 + Math.random() * 18; gc.style.display = 'none'; coinSound();
      const r = Math.random(); if (r < .45) { s.fever = s.t + 15; toast('황금 전화: 열광! 15초 동안 수익 ×3'); } else if (r < .75) { s.cf = s.t + 10; toast('황금 전화: 손이 불타요! 10초 동안 누르기 ×7'); } else { const v = Math.max(13, Math.min(s.c * .15 + 13, rate() * 900)); earn(v); toast(`황금 전화: 행운! +${fmt(v)}`); } }; tap.appendChild(gc);
    tap.onclick = e => { if (s.done) return; const v = (1 + rate() * (hasU('worker') ? .15 : 0)) * (hasU('gold') ? 5 : 1) * (s.cf > s.t ? 7 : 1); earn(v); tone([1600 + Math.random() * 400], .04, .03, 'triangle'); const f = el('div', 'icn', '+' + fmt(v)); const r = tap.getBoundingClientRect(); f.style.left = (e.clientX - r.left - 10) + 'px'; f.style.top = (e.clientY - r.top - 20) + 'px'; tap.appendChild(f); setTimeout(() => f.remove(), 900); I.upd(); };
    B.appendChild(tap);
    const M = el('div', 'mul'); [1, 10, 'max'].forEach(m => { const b = el('button', mul === m ? 'on' : '', m === 'max' ? 'MAX' : '×' + m); b.onclick = () => { mul = m; M.querySelectorAll('button').forEach(x => x.classList.toggle('on', x === b)); I.upd(); }; M.appendChild(b); }); B.append(lbl('부스'), M);
    const L = el('div', 'bl'), rows = [];
    BO.forEach((b, i) => { const r = el('div', 'bo'); const im = el('img'); im.src = gimg(b.im); im.alt = ''; const t = el('div', 't'); const nm2 = el('b'), sm = el('small'); t.append(nm2, sm); const bb = el('button', 'btn'); r.append(im, t, bb); L.appendChild(r);
      bb.onclick = () => { const n = nOf(b), c = costOf(b, n); if (s.c < c || s.done) return; const before = msMul(lv(b.id)); s.c -= c; s.b[b.id] = lv(b.id) + n; if (msMul(lv(b.id)) > before) toast(`${b.n} ${lv(b.id)}개 달성! 수익 ×2`); tone([700, 900], .06, .04); I.upd(); };
      rows.push({ b, nm2, sm, bb, r, i }); });
    B.appendChild(L);
    B.appendChild(lbl('업그레이드'));
    const U = el('div', 'bl'), ups = [];
    UP.forEach(u => { const r = el('div', 'bo'); const im = el('img'); im.src = gimg(u.im); im.alt = ''; const t = el('div', 't'); t.append(el('b', null, u.n), el('small', null, u.d)); const bb = el('button', 'btn'); r.append(im, t, bb); U.appendChild(r);
      bb.onclick = () => { if (hasU(u.id) || s.c < u.cost || s.done) return; s.c -= u.cost; s.up.push(u.id); coinSound(); I.upd(); };
      ups.push({ u, r, bb }); });
    B.appendChild(U);
    const upd = () => {
      if (!s) return; const left = Math.max(0, TIME - s.t), g = grade();
      tmEl.textContent = `${Math.floor(left / 60)}:${String(Math.floor(left % 60)).padStart(2, '0')}`; tmEl.classList.toggle('low', left < 20);
      sc.innerHTML = `번 돈 ${fmt(s.tot)} · 등급 <b style="color:var(--yel)">${g ? g[1] : '-'}</b>`;
      gi.style.width = Math.min(100, s.tot / GOAL[3][0] * 100) + '%';
      cb.innerHTML = `${ci('phone')}${fmt(s.c)}`; rs.textContent = `초당 ${rate() < 10 ? rate().toFixed(1) : fmt(rate())}${s.fever > s.t ? ` · 열광 ×3 ${Math.ceil(s.fever - s.t)}초` : ''}${s.cf > s.t ? ` · 누르기 ×7 ${Math.ceil(s.cf - s.t)}초` : ''}`;
      tap.classList.toggle('fever', s.fever > s.t || s.cf > s.t);
      const top = [...BO].reverse().find(b => lv(b.id)) || BO[0]; const src = gimg(top.im); if (bm.dataset.s !== src) { bm.src = src; bm.dataset.s = src; } wk.style.display = hasU('worker') ? '' : 'none';
      rows.forEach(x => { const l = lv(x.b.id), n = nOf(x.b), c = costOf(x.b, n), prev = BO[x.i - 1], locked = prev && !lv(prev.id); x.r.classList.toggle('lock', !!locked); x.nm2.textContent = locked ? '???' : `${x.b.n} · Lv ${l}`; x.sm.textContent = locked ? '앞 부스를 먼저 열어요' : `초당 ${fmt(incOf(x.b))}${nextMs(l) ? ` · ${nextMs(l)}개면 ×2` : ' · 최고 등급'}`; x.bb.innerHTML = `${l ? '확장' : '개업'} ×${n}<small>${fmt(c)}</small>`; x.bb.disabled = !!locked || s.c < c; });
      ups.forEach(x => { const own = hasU(x.u.id), ok = lv(x.u.need[0]) >= x.u.need[1]; x.r.classList.toggle('lock', !ok && !own); x.bb.innerHTML = own ? '보유' : `구입<small>${fmt(x.u.cost)}</small>`; x.bb.disabled = own || !ok || s.c < x.u.cost; });
    };
    I = { upd, ring: on => { gc.style.display = on ? '' : 'none'; } }; upd();
  }, true);
}

function finish() {
  s.done = true; ARC.cleanup && ARC.cleanup(); ARC.cleanup = null; const g = grade(), reward = g ? g[2] : 0, res = { tot: s.tot };
  const best = S.idr || {}; if (!best.tot || s.tot > best.tot) S.idr = { tot: Math.floor(s.tot), g: g ? g[1] : '-' }; save(); if (reward) gcAdd(reward);
  frame('해골 전화국', B => {
    B.appendChild(el('div', 'res ' + (g ? 'w' : 'l'), g ? `영업 끝! 등급 ${g[1]}` : '영업 끝… 등급 없음'));
    talk(B, 'l', !g ? '오늘은 손님이 없었네요. …다음엔 황금 전화부터 받아요.' : g[1] === 'S' ? '진짜 사장님이네요. …저 여기 취직해도 돼요?' : g[1] === 'A' ? '오~ 장사 수완 좋은데요? 반할 뻔.' : '나쁘지 않아요. 다음엔 큰 부스로 빨리 넘어가 봐요.');
    const r = el('div', 'rules'); r.innerHTML = `3분 동안 번 돈 <b>${fmt(res.tot)}</b><br>${ci('gc')}게임 동전 <b>+${reward}</b>${S.idr && S.idr.tot === Math.floor(res.tot) ? '<br>🏆 최고 기록!' : ''}`; B.appendChild(r);
    B.appendChild(row(btn('다시 영업하기', 'wide', intro), btn('오락실로', 'ghost wide', () => ARC.hub())));
  }, true);
  s = null;
}

ARC.reg({ id: 'idle', order: 3, name: '해골 전화국', ban: 'idle', icon: gimg('b_neon'), color: '#9ff5e4', cost: 2, sub: () => `3분 영업 · 최고 ${S.idr ? fmt(S.idr.tot) + ' (' + S.idr.g + ')' : '없음'}`, start: intro });
})();
