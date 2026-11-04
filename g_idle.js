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
`.replace('.fly$ ', '.icn');
document.head.appendChild(Object.assign(document.createElement('style'), { textContent: css }));

const BO = [
  { id: 'red', n: '낡은 빨간 부스', im: 'b_red', inc: .5, cost: 10 },
  { id: 'neon', n: '핑크 네온 부스', im: 'b_neon', inc: 3, cost: 120 },
  { id: 'teal', n: '장거리 유리 부스', im: 'b_teal', inc: 16, cost: 1400 },
  { id: 'gold', n: '황금 국제전화', im: 'b_gold', inc: 90, cost: 16000 },
  { id: 'skull', n: '해골 핫라인', im: 'b_skull', inc: 500, cost: 190000 },
  { id: 'vip', n: '레나 VIP 회선', im: 'b_vip', inc: 3000, cost: 2400000 }
];
const UP = [
  { id: 'worker', n: '해골 직원 고용', d: '누를 때 초당 수익의 15%를 더 벌어요', im: 'b_worker', cost: 300, need: ['neon', 1] },
  { id: 'sign', n: '네온 간판', d: '모든 부스 수익 ×1.5', im: 'b_star', cost: 6000, need: ['teal', 5] },
  { id: 'pile', n: '동전 금고', d: '자리 비운 사이 쌓이는 시간 8시간 → 16시간', im: 'b_coins', cost: 40000, need: ['gold', 3] },
  { id: 'ad', n: '레나 광고판', d: '모든 부스 수익 ×2', im: 'b_vip', cost: 900000, need: ['skull', 5] },
  { id: 'gold', n: '황금 수화기', d: '누를 때 벌이 ×5', im: 'b_gold', cost: 6000000, need: ['vip', 5] }
];
const MILE = [1e3, 1e4, 1e5, 1e6, 1e7, 1e8, 1e9, 1e10];
let I = null, mul = 1, tmr = 0;
function st() { if (!S.idl) S.idl = { c: 0, b: { red: 1 }, up: [], last: Date.now(), boost: 0, tot: 0, mile: 0 }; return S.idl; }
const lv = id => st().b[id] || 0;
const hasU = id => st().up.includes(id);
function fmt(n) { n = Math.floor(n); if (n < 1e4) return n.toLocaleString(); if (n < 1e8) return (n / 1e4).toFixed(n < 1e5 ? 1 : 0) + '만'; if (n < 1e12) return (n / 1e8).toFixed(n < 1e9 ? 1 : 0) + '억'; return (n / 1e12).toFixed(1) + '조'; }
function incOf(b) { const l = lv(b.id); return b.inc * l * Math.pow(2, Math.floor(l / 25)); }
function rate() { let r = BO.reduce((a, b) => a + incOf(b), 0); if (hasU('sign')) r *= 1.5; if (hasU('ad')) r *= 2; if (st().boost > Date.now()) r *= 2; return r; }
function costOf(b, n) { let t = 0, l = lv(b.id); for (let i = 0; i < n; i++) t += b.cost * Math.pow(1.15, l + i); return Math.ceil(t); }
function earn(x) { const s = st(); s.c += x; s.tot += x; while (s.mile < MILE.length && s.tot >= MILE[s.mile]) { s.mile++; gcAdd(3); toast(`전화국 누적 ${fmt(MILE[s.mile - 1])} 돌파! 게임 동전 +3`); } }
function offline() { const s = st(), now = Date.now(), cap = (hasU('pile') ? 16 : 8) * 3600e3, dt = Math.min(cap, Math.max(0, now - (s.last || now))); s.last = now; if (dt < 60e3) return 0; const r = rate(); const g = r * dt / 1000; earn(g); return g; }
setInterval(() => { if (S.idl && !document.hidden) { const s = st(), now = Date.now(); const dt = Math.min(5000, now - (s.last || now)); s.last = now; earn(rate() * dt / 1000); if (I && I.upd) I.upd(); } }, 250);
setInterval(() => { if (S.idl) save(); }, 5000);

function open() {
  const got = offline(); render(got);
}
function render(got) {
  const s = st();
  frame('해골 전화국', B => {
    if (got) talk(B, 'l', `사장님, 자리 비운 사이 ${fmt(got)} 벌었어요. …해골들이 일 잘하죠?`);
    else talk(B, 'sk', pick(['(해골 직원이 모자를 살짝 들어 인사한다)', '(해골 직원이 동전 자루를 끌고 지나간다)', '(부스마다 전화벨이 울린다. 따르릉.)']));
    const T = el('div', 'idt'); const cb = el('b'), rs = el('small'); T.append(cb, rs); B.appendChild(T);
    const tap = el('button', 'itap'); const top = [...BO].reverse().find(b => lv(b.id)) || BO[0]; const bm = el('img', 'bm'); bm.src = gimg(top.im); bm.alt = ''; tap.appendChild(bm);
    if (hasU('worker')) { const w = el('img', 'wk'); w.src = gimg('b_worker'); w.alt = ''; tap.appendChild(w); }
    tap.onclick = e => { const v = (1 + rate() * (hasU('worker') ? .15 : 0)) * (hasU('gold') ? 5 : 1); earn(v); tone([1600 + Math.random() * 400], .04, .03, 'triangle'); const f = el('div', 'icn', '+' + fmt(v)); const r = tap.getBoundingClientRect(); f.style.left = (e.clientX - r.left - 10) + 'px'; f.style.top = (e.clientY - r.top - 20) + 'px'; tap.appendChild(f); setTimeout(() => f.remove(), 900); upd(); };
    B.appendChild(tap);
    const bo = el('div', 'boost'); const bt = el('span'); bo.appendChild(bt);
    bo.appendChild(btn('할 일 동전 1개', 'teal', () => { if (S.coins < 1) { toast('할 일 동전이 없어요. 전단지를 떼고 와요.'); return; } S.coins--; s.boost = Math.max(Date.now(), s.boost) + 3600e3; save(); coinSound(); upd(); toast('1시간 동안 수익 ×2!'); }));
    B.appendChild(bo);
    const M = el('div', 'mul'); [1, 10].forEach(m => { const b = el('button', mul === m ? 'on' : '', '×' + m); b.onclick = () => { mul = m; render(); }; M.appendChild(b); }); B.append(lbl('부스'), M);
    const L = el('div', 'bl'), rows = [];
    BO.forEach((b, i) => { const prev = BO[i - 1]; const locked = prev && !lv(prev.id); const r = el('div', 'bo' + (locked ? ' lock' : '')); const im = el('img'); im.src = gimg(b.im); im.alt = ''; const t = el('div', 't'); const nm2 = el('b'), sm = el('small'); t.append(nm2, sm); const bb = el('button', 'btn'); r.append(im, t, bb); L.appendChild(r);
      bb.onclick = () => { const c = costOf(b, mul); if (s.c < c) return; s.c -= c; s.b[b.id] = lv(b.id) + mul; tone([700, 900], .06, .04); if (lv(b.id) === mul && mul) toast(`${b.n} 개업!`); upd(); };
      rows.push({ b, nm2, sm, bb, locked, r }); });
    B.appendChild(L);
    B.appendChild(lbl('업그레이드'));
    const U = el('div', 'bl'), ups = [];
    UP.forEach(u => { const r = el('div', 'bo'); const im = el('img'); im.src = gimg(u.im); im.alt = ''; const t = el('div', 't'); t.append(el('b', null, u.n), el('small', null, u.d)); const bb = el('button', 'btn'); r.append(im, t, bb); U.appendChild(r);
      bb.onclick = () => { if (hasU(u.id) || s.c < u.cost) return; s.c -= u.cost; s.up.push(u.id); coinSound(); render(); };
      ups.push({ u, r, bb }); });
    B.appendChild(U);
    B.appendChild(el('div', 'rules', '부스를 사면 초당 동전이 늘어요. 같은 부스 25단계마다 수익 2배. 앱을 꺼 둬도 최대 8시간까지 쌓여요. 전화국 누적 수익이 1천, 1만, 10만… 을 넘을 때마다 게임 동전 3개를 받아요.'));
    const upd = () => {
      if (!$('gcb')) return; cb.textContent = fmt(s.c); rs.textContent = `초당 ${rate() < 10 ? rate().toFixed(1) : fmt(rate())}${s.boost > Date.now() ? ' · ×2 부스트' : ''}`;
      const left = s.boost - Date.now(); bt.innerHTML = left > 0 ? `부스트 <b>${Math.floor(left / 60000)}분</b> 남음 · 더 넣으면 연장` : '할 일 동전 1개로 <b>1시간 수익 ×2</b>';
      rows.forEach(x => { const l = lv(x.b.id), c = costOf(x.b, mul), prev = BO[BO.indexOf(x.b) - 1], locked = prev && !lv(prev.id); x.r.classList.toggle('lock', !!locked); x.nm2.textContent = locked ? '???' : `${x.b.n} · Lv ${l}`; x.sm.textContent = locked ? '앞 부스를 먼저 열어요' : `초당 ${fmt(incOf(x.b))} · 다음 +${x.b.inc}`; x.bb.innerHTML = `${l ? '확장' : '개업'} ×${mul}<small>${fmt(c)}</small>`; x.bb.disabled = !!locked || s.c < c; });
      ups.forEach(x => { const own = hasU(x.u.id), ok = lv(x.u.need[0]) >= x.u.need[1]; x.r.classList.toggle('lock', !ok && !own); x.bb.innerHTML = own ? '보유' : `구입<small>${fmt(x.u.cost)}</small>`; x.bb.disabled = own || !ok || s.c < x.u.cost; });
    };
    I = { upd }; upd();
  }, true);
  ARC.cleanup = () => { I = null; save(); };
}

ARC.reg({ id: 'idle', order: 3, name: '해골 전화국', ban: 'idle', icon: gimg('b_neon'), color: '#9ff5e4', sub: () => S.idl ? `동전 ${fmt(st().c)} · 초당 ${rate() < 10 ? rate().toFixed(1) : fmt(rate())}` : '부스를 늘려 부자 되기 · 꺼 둬도 쌓임', start: open });
})();
