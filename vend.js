// 레나의 자판기 사업 (9번 자판기). 기획: design/vend_plan.md
// 계산 코어(advance/settle)는 S에 안 기대는 순수 함수 → window.lenaBiz로 시험. 화면은 SH.shop을 덮어씀. shop.js 뒤에 불러온다.
'use strict';
(() => {
const css = `
.bz-top{display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;margin:6px 0 12px}
.bz-top div{position:relative;background:url(assets/lena/paper_white.webp) center/cover,#f3efe6;background-blend-mode:multiply;color:#111;border:2px solid #000;border-radius:4px;padding:9px 8px 7px;min-width:0;box-shadow:3px 3px 0 #000;transform:rotate(-1.2deg)}
.bz-top div:nth-child(2){transform:rotate(1deg);background-image:url(assets/lena/paper_yellow.webp)}.bz-top div:nth-child(3){transform:rotate(-.4deg);background-image:url(assets/lena/paper_teal.webp)}
.bz-top div::before{content:"";position:absolute;left:50%;top:-9px;width:36px;height:14px;margin-left:-18px;background:url(assets/lena/tape_pink1.webp) center/100% 100%;opacity:.95}
.bz-top div:nth-child(2)::before{background-image:url(assets/lena/tape_white.webp)}.bz-top div:nth-child(3)::before{background-image:url(assets/lena/tape_yellow.webp)}
.bz-top small{display:block;font-size:11px;font-weight:800;opacity:.7}.bz-top b{display:block;font-family:'Space Mono',monospace;font-size:15px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.bz-top .neg b{color:#d0124f}.bz-top .pos b{color:#0b7d6e}
.bz-rank{display:flex;flex-wrap:wrap;justify-content:space-between;align-items:center;gap:4px 8px;font-size:12.5px;color:var(--mint);margin:-2px 2px 12px}.bz-rank>:first-child{font-family:'Black Han Sans'}.bz-rank i{flex:1 1 100%;order:2;height:10px;border-radius:5px;background:#0b0d10;border:2px solid #000;overflow:hidden}.bz-rank i u{display:block;height:100%;background:repeating-linear-gradient(-45deg,var(--pink) 0 6px,#ff79b8 6px 12px)}
.bz-loc{position:relative;display:flex;align-items:center;gap:10px;width:100%;min-height:68px;padding:12px 12px 10px;margin:4px 0 10px;border-radius:3px;background:url(assets/lena/paper_white.webp) center/cover,#f3efe6;color:#111;border:2px solid #000;box-shadow:4px 4px 0 var(--teal);text-align:left}
.bz-loc:nth-of-type(odd){transform:rotate(-.6deg)}.bz-loc:nth-of-type(even){transform:rotate(.5deg);box-shadow:4px 4px 0 var(--pink)}
.bz-loc::before{content:"";position:absolute;left:14px;top:-8px;width:44px;height:15px;background:url(assets/lena/tape_teal1.webp) center/100% 100%;transform:rotate(-6deg)}
.bz-loc img{flex:none;width:44px;height:44px;filter:drop-shadow(2px 2px 0 rgba(0,0,0,.35))}.bz-loc .t{flex:1;min-width:0}.bz-loc .t b{display:block;font-family:'Black Han Sans';font-weight:400;font-size:17px}.bz-loc .t small{display:block;font-size:12px;opacity:.72;line-height:1.4;word-break:keep-all}
.bz-loc em{flex:none;font-style:normal;font-family:'Black Han Sans';font-size:22px;color:var(--pink)}.bz-loc.lock{background:#2a2d33;color:#cfd8dc;box-shadow:4px 4px 0 #000;border-style:dashed}.bz-loc.lock::before{background-image:url(assets/lena/tape_white.webp);opacity:.6}.bz-loc.lock img{filter:grayscale(1) brightness(.7)}.bz-loc .warnd{color:#d0124f;font-weight:800;opacity:1}
.bz-mc{position:relative;border-radius:18px 18px 10px 10px;padding:12px 10px 12px;margin-bottom:14px;background:linear-gradient(160deg,#2a8f86,#1a5f5a);border:3px solid #000;box-shadow:inset 0 0 0 3px rgba(255,255,255,.12),5px 5px 0 var(--pink)}
.bz-mc::after{content:"";display:block;height:12px;margin:10px 18% 0;border-radius:6px;background:#0b0d10;border:2px solid #000;box-shadow:inset 0 3px 0 rgba(255,255,255,.08)}
.bz-mc.t1{background:linear-gradient(160deg,#3b5c8f,#22355a)}.bz-mc.t2{background:linear-gradient(160deg,#8f2a6a,#4a1240);box-shadow:inset 0 0 0 3px rgba(255,255,255,.12),0 0 18px rgba(255,61,154,.45),5px 5px 0 var(--teal)}
.bz-mc .hd{display:flex;justify-content:space-between;align-items:center;gap:6px;margin:0 2px 10px;color:#e6fffa}.bz-mc .hd span:first-child{font-family:'Black Han Sans';font-size:16px;text-shadow:2px 2px 0 #000}.bz-mc .hd span:last-child{font-family:'Space Mono',monospace;font-size:11px;opacity:.85}
.bz-mc.broken{filter:grayscale(.8)}
.bz-g{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:7px;padding:7px;border-radius:8px;background:#0b0d10;border:2px solid #000;box-shadow:inset 0 0 14px rgba(47,224,200,.18)}
.bz-s{position:relative;min-height:74px;padding:8px;border-radius:6px;background:url(assets/lena/paper_white.webp) center/cover,#f3efe6;color:#111;border:2px solid #000;text-align:left;display:flex;gap:8px;align-items:center}
.bz-s img{flex:none;width:36px;height:36px;filter:drop-shadow(1px 2px 0 rgba(0,0,0,.3))}.bz-s .t{min-width:0}.bz-s b{display:block;font-size:13px;line-height:1.25;word-break:keep-all}.bz-s small{display:block;font-family:'Space Mono',monospace;font-size:11px;opacity:.72}
.bz-s.empty{background:rgba(255,255,255,.06);color:#9ff5e4;border:2px dashed rgba(159,245,228,.5);justify-content:center;font-weight:800}.bz-s.low{box-shadow:inset 0 0 0 3px var(--hot)}.bz-s.sel{outline:3px solid var(--yel);outline-offset:1px}
.bz-s .tx{flex:none;width:36px;height:36px;border-radius:8px;background:#ffd36b;border:2px solid #000;display:grid;place-items:center;font-weight:900;font-size:14px}
.bz-ed{margin:-4px 0 14px;padding:12px;border-radius:4px;background:url(assets/lena/paper_yellow.webp) center/cover,#f2ea3a;color:#111;border:2px solid #000;box-shadow:4px 4px 0 #000}
.bz-ed .pills button{height:38px}.bz-ed .r{display:flex;align-items:center;gap:8px;margin-top:8px}.bz-ed .r>span{flex:1;font-size:13.5px;font-weight:700}.bz-ed .hint{color:#333}
.bz-ed .step b{min-width:70px}
.bz-chart{display:flex;align-items:flex-end;gap:4px;height:96px;padding:8px;border-radius:4px;background:url(assets/lena/paper_white.webp) center/cover,#f3efe6;border:2px solid #000;box-shadow:3px 3px 0 var(--teal)}
.bz-chart i{flex:1;background:#0b7d6e;border:1.5px solid #000;border-bottom:0;border-radius:3px 3px 0 0;min-height:2px}.bz-chart i.neg{background:var(--hot)}
.bz-log{font-size:13px;line-height:1.6;color:#111;background:url(assets/lena/paper_white.webp) center/cover,#f3efe6;border:2px solid #000;border-radius:3px;padding:6px 12px;box-shadow:3px 3px 0 #000}.bz-log div{padding:5px 0;border-bottom:1px dashed rgba(0,0,0,.18)}.bz-log div:last-child{border:0}
`;
document.head.appendChild(Object.assign(document.createElement('style'), { textContent: css }));
const MIN = 60e3, HR = 3600e3, DAYMS = 864e5, OFFLINE = 12 * HR, LIMIT = -100000;

// ---------- 데이터 ----------
const IMG = n => n.startsWith('assets') ? n : `assets/lena/s/${n}.webp`;
// pop: 자리별 잘 팔림(기본 1). rk: 열리는 사업 등급. wx: 날씨 반응
const P = {
  coffee: { n: '아이스 아메리카노', w: 900, b: 1500, d: 1, exp: 2, i: 'g_coffee', rk: 0, wx: { rain: 1.3, hot: 1.4 } },
  milk: { n: '딸기 우유', w: 750, b: 1300, d: 1, exp: 2, i: 'g_milk', rk: 0, wx: { hot: 1.3 } },
  gum: { n: '껌', w: 400, b: 700, d: 0.8, exp: 0, t: '껌', rk: 0 },
  kimbap: { n: '삼각김밥', w: 1000, b: 1600, d: 0.9, exp: 1, t: '밥', rk: 0 },
  ramen: { n: '컵라면', w: 1100, b: 1800, d: 0.8, exp: 0, t: '면', rk: 0, wx: { cold: 1.6, rain: 1.3 } },
  umb: { n: '우산', w: 5000, b: 8000, d: 0.3, exp: 0, i: 'assets/lena/g/c_umb.webp', rk: 0, wx: { rain: 6, dry: .08 } },
  energy: { n: '에너지 드링크', w: 1400, b: 2200, d: 0.8, exp: 0, i: 'assets/lena/cur/energy.webp', rk: 1, wx: { hot: 1.3 } },
  hotpack: { n: '핫팩', w: 700, b: 1200, d: 0.5, exp: 0, t: '핫', rk: 1, wx: { cold: 4, hot: .05, mild: .3 } },
  cake: { n: '딸기 케이크', w: 2900, b: 4500, d: 0.35, exp: 1, i: 'g_cake', rk: 2 },
  rose: { n: '검은 장미', w: 3800, b: 6000, d: 0.25, exp: 2, i: 'g_rose', rk: 2 },
  lip: { n: '핑크 립스틱', w: 5600, b: 9000, d: 0.2, exp: 0, i: 'g_lip', rk: 3 },
  tape: { n: '믹스테이프', w: 6300, b: 10000, d: 0.15, exp: 0, i: 'g_tape', rk: 4 },
  cam: { n: '즉석 카메라 필름', w: 7600, b: 12000, d: 0.12, exp: 0, i: 'g_cam', rk: 5 },
  card: { n: '레나 포토카드', w: 2500, b: 5000, d: 0.3, exp: 0, i: 'g_lip', t: 'L', rk: 6 }
};
// h: 시간대 배수 함수, pop: 잘 팔리는 상품
const flat = () => 1, NIGHT = [.6, .5, .4, .3, .2, .2, .4, .8, 1, .9, .8, .9, 1.1, 1, .9, .9, 1, 1.2, 1.3, 1.3, 1.2, 1.1, 1, .8];
const L = [
  { id: 'booth', n: '공중전화 부스 앞', gc: 0, rent: 0, c: 6, i: 'assets/lena/g/b_red.webp', h: h => NIGHT[h], pop: { coffee: 2.5, umb: 2.5, card: 3 } },
  { id: 'acad', n: '학원 앞', gc: 20, rent: 3000, c: 14, i: 'assets/lena/g/b_teal.webp', h: h => (h >= 16 && h < 23 ? 2 : h >= 23 || h < 7 ? .15 : .6), pop: { energy: 2.5, kimbap: 2.5, gum: 1.5 }, exam: 1 },
  { id: 'alley', n: '편의점 옆 골목', gc: 70, rent: 9000, c: 18, i: 'assets/lena/g/b_neon.webp', h: h => NIGHT[h], pop: { ramen: 2.5, hotpack: 2.5 }, rival: ['coffee', 'milk', 'kimbap'] },
  { id: 'subway', n: '지하철역', gc: 70, rent: 9000, c: 30, i: 'assets/lena/g/b_gold.webp', h: h => ((h >= 7 && h < 10) || (h >= 18 && h < 21) ? 2 : h < 6 ? .05 : .8), pop: { coffee: 2.5, umb: 2.5, gum: 2 } },
  { id: 'club', n: '클럽 골목', gc: 110, rent: 12000, c: 25, i: 'assets/lena/g/b_vip.webp', h: h => (h >= 22 || h < 4 ? 3 : .2), pop: { energy: 2.5, lip: 2.5, gum: 1.5 }, rough: 1 },
  { id: 'hosp', n: '병원 로비', gc: 160, rent: 10000, c: 16, i: 'assets/lena/g/b_star.webp', h: flat, pop: { milk: 2.5, hotpack: 2, rose: 2.5 }, cheap: 1 },
  { id: 'univ', n: '대학가', gc: 240, rent: 15000, c: 35, i: 'assets/lena/g/b_skull.webp', h: h => NIGHT[h], pop: {} }
];
const M = [
  { n: '낡은 자판기', gc: 0, slots: 4, cap: 8, brk: .06, cls: '' },
  { n: '냉온장 자판기', gc: 20, slots: 6, cap: 12, brk: .03, exp: 1, cls: 't1' },
  { n: '네온 VIP 자판기', gc: 50, slots: 8, cap: 15, brk: .02, boost: 1.2, cls: 't2' }
];
const STAFF = { fill: { n: '채우기 해골', w: 4000, d: '앱을 안 열어도 반쯤 비면 가득 채워요(도매가는 사업 자금에서)' }, fix: { n: '수리 해골', w: 3000, d: '고장 나면 바로 고쳐요(수리비·쉬는 날 없음)' }, guard: { n: '경비 해골', w: 5000, d: '클럽 골목 기계 부숨·도둑을 막아요' } };
const UP = { card: { n: '카드 결제 단말기', c: 50000, d: '모든 자판기 판매 +15%' }, cold: { n: '냉장 강화', c: 80000, d: '유통기한 +1일' }, sign: { n: '네온 간판', c: 120000, d: '모든 자리 손님 +10%' } };
const RANK = [['골목 노점', 0, 1], ['부스 앞 사장', 50000, 1], ['동네 자판기', 200000, 2], ['밤거리 체인', 600000, 3], ['역세권 사장', 1500000, 4], ['네온 사업가', 3000000, 5], ['밤의 큰손', 6000000, 6], ['밤거리의 자판기왕', 12000000, 7]];
const REPAIR = 15000;

// ---------- 계산 코어 ----------
const dkey = t => { const d = new Date(t); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; };
const rnd = seed => { let s = 0; for (const c of seed) s = (s * 31 + c.charCodeAt(0)) >>> 0; return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; };
const newMachine = type => ({ type, broken: false, slots: Array.from({ length: M[type].slots }, () => ({ p: null, n: 0, price: 0, exp: 0, acc: 0 })) });
function fresh(now) {
  return { v: 1, cash: 30000, t: now, open: now, day: dkey(now), locs: { booth: { machines: [newMachine(0)] } }, staff: {}, up: {}, rank: 0, life: 0, today: { rev: 0, cogs: 0, waste: 0, sold: 0 }, log: [], ev: [], seen: {} };
}
const capOf = (b, m) => M[m.type].cap;
const expDays = (b, m, p) => P[p].exp ? P[p].exp + (M[m.type].exp || 0) + (b.up.cold ? 1 : 0) : 0;
// 날씨: env.wx = {rain, hot, cold, mild, dry}
function wxMul(p, wx) { const w = P[p].wx || {}; let m = 1; for (const k in w) if (wx[k]) m *= w[k]; return m; }
const conv = r => Math.min(1.8, Math.exp(-2.2 * (r - 1)));
const evOn = (b, type, loc, t) => b.ev.some(e => e.type === type && (!loc || e.loc === loc) && e.until > t);
function locMul(b, loc, t, env) {
  let m = 1; if (b.up.sign) m *= 1.1;
  if (evOn(b, 'rivalm', loc.id, t)) m *= .7;
  if (evOn(b, 'fest', loc.id, t)) m *= 3;
  if (loc.exam && env.exam) m *= 1.5;
  return m;
}
// 한 분 동안의 장사
function minute(b, t, env) {
  const h = new Date(t).getHours();
  for (const loc of L) { const st = b.locs[loc.id]; if (!st) continue;
    const cust = loc.c * loc.h(h) * locMul(b, loc, t, env) / 60;
    for (const m of st.machines) { if (m.broken) continue; const boost = (M[m.type].boost || 1) * (b.up.card ? 1.15 : 1);
      for (const s of m.slots) { if (!s.p || s.n <= 0) continue;
        if (s.exp && t >= s.exp) { b.today.waste += s.n * P[s.p].w; s.n = 0; s.exp = 0; continue; }
        let r = s.price / P[s.p].b; if (loc.cheap && r > 1) r = 1 + (r - 1) * 1.8;
        const rival = loc.rival && loc.rival.includes(s.p) ? .7 : 1;
        s.acc += cust * .03 * P[s.p].d * (loc.pop[s.p] || 1) * wxMul(s.p, env.wx || {}) * conv(r) * boost * rival;
        while (s.acc >= 1 && s.n > 0) { s.acc -= 1; s.n--; b.today.rev += s.price; b.today.sold++; b.cash += s.price; }
        if (s.n <= 0) { s.acc = 0; s.exp = 0; } } }
    if (b.staff.fill) for (const m of st.machines) for (const s of m.slots) if (s.p && s.n < capOf(b, m) / 2) fill(b, m, s, t, true);
  }
}
// 채우기: 도매가로 가득
function fill(b, m, s, t, auto) {
  const need = capOf(b, m) - s.n; if (!s.p || need <= 0) return 0;
  const cost = need * P[s.p].w; if (b.cash - cost < LIMIT) return 0;
  b.cash -= cost; b.today.cogs += cost; if (!s.n || !s.exp) { const d = expDays(b, m, s.p); s.exp = d ? t + d * DAYMS : 0; } s.n += need; return need;
}
// 자정 결산(그날 장사 정리 + 다음 날 사건)
function settle(b, dayKey, env) {
  const r = rnd(dayKey + (env.seed || '')), log = { d: dayKey, rev: b.today.rev, cogs: b.today.cogs, waste: b.today.waste, sold: b.today.sold, rent: 0, wage: 0, int: 0, ev: [] };
  for (const loc of L) if (b.locs[loc.id]) log.rent += loc.rent;
  for (const k in STAFF) if (b.staff[k]) log.wage += STAFF[k].w;
  b.cash -= log.rent + log.wage;
  if (b.cash < 0) { log.int = Math.round(-b.cash * .05); b.cash -= log.int; }
  // 사건
  const next = new Date(dayKey + 'T00:00').getTime() + DAYMS;
  for (const loc of L) { const st = b.locs[loc.id]; if (!st) continue;
    st.machines.forEach(m => { if (!m.broken && r() < M[m.type].brk) { if (b.staff.fix) log.ev.push(`${loc.n} ${M[m.type].n} 고장 → 수리 해골이 고침`); else { m.broken = true; log.ev.push(`${loc.n} ${M[m.type].n} 고장`); } } });
    if (loc.rough && !b.staff.guard && r() < .25) { const m = st.machines[Math.floor(r() * st.machines.length)]; m.broken = true; log.ev.push(`${loc.n}: 술 취한 손님이 기계를 부숨`); }
    if (loc.id !== 'booth' && r() < .04 && !evOn(b, 'rivalm', loc.id, next)) { b.ev.push({ type: 'rivalm', loc: loc.id, until: next + 14 * DAYMS }); log.ev.push(`${loc.n}에 경쟁 자판기 등장(14일 손님 −30%)`); }
    if (loc.id === 'univ' && r() < .1) { b.ev.push({ type: 'fest', loc: loc.id, until: next + DAYMS }); log.ev.push('내일 대학가 축제(손님 ×3)'); }
  }
  if (!b.staff.guard && log.rev > 0 && r() < .06) { const lost = Math.round(log.rev * .2); b.cash -= lost; log.ev.push(`도둑이 동전통을 털어 감(−${lost.toLocaleString()}원)`); log.theft = lost; }
  // 사채 한도 넘으면 가장 비싼 기계 압류
  if (b.cash < LIMIT) { let best = null; for (const id in b.locs) b.locs[id].machines.forEach((m, i) => { if ((!best || m.type > best.m.type) && !(id === 'booth' && b.locs[id].machines.length === 1)) best = { id, i, m }; }); if (best) { b.locs[best.id].machines.splice(best.i, 1); b.cash = LIMIT / 2; log.ev.push(`해골 사채업자가 ${M[best.m.type].n}를 압류해 감`); log.seized = 1; } }
  log.profit = log.rev - log.cogs - log.rent - log.wage - log.int - (log.theft || 0);
  log.gc = log.profit >= 30000 ? Math.min(5, Math.floor(log.profit / 30000)) : 0;
  b.life += Math.max(0, log.profit);
  b.ev = b.ev.filter(e => e.until > next);
  b.log.push(log); while (b.log.length > 30) b.log.shift();
  b.today = { rev: 0, cogs: 0, waste: 0, sold: 0 };
  // 사업 등급
  const locs = Object.keys(b.locs).length; while (b.rank < RANK.length - 1 && b.life >= RANK[b.rank + 1][1] && locs >= RANK[b.rank + 1][2]) b.rank++;
  return log;
}
// t0 → t1 진행. 앱을 닫아 둔 지 12시간 넘은 분은 손님이 안 옴(결산은 날마다 함)
function advance(b, t1, env) {
  const out = []; let t = b.t;
  while (t + MIN <= t1) { t += MIN;
    if (dkey(t) !== b.day) { out.push(settle(b, b.day, env)); b.day = dkey(t); }
    if (t - b.open <= OFFLINE) minute(b, t, env);
  }
  b.t = t; return out;
}

// ---------- 앱 쪽 ----------
const B = () => { if (!S.biz) S.biz = fresh(Date.now()); return S.biz; };
function env() {
  const d = S.wx && S.wx.on && S.wx.data && S.wx.data.days && S.wx.data.days[0], wx = {};
  if (d) { if (d.pop >= 60 || [61, 63, 65, 80, 81, 82].includes(d.code)) wx.rain = 1; else wx.dry = 1; if (d.max >= 28) wx.hot = 1; if (d.min <= 0) wx.cold = 1; if (!wx.hot && !wx.cold) wx.mild = 1; } else wx.dry = 1;
  const ex = S.study && (S.study.exams || []).some(e => { const n = (new Date(e.date + 'T00:00') - Date.now()) / DAYMS; return n >= 0 && n <= 21; });
  return { wx, exam: ex, seed: S.name || '' };
}
let lastSettles = [];
function tick(opened) {
  const b = B(), now = Date.now(); if (opened) { /* 열면 그때부터 다시 12시간 */ }
  const logs = advance(b, now, env()); if (opened) b.open = now;
  logs.forEach(l => { if (l.gc) S.gc = Math.min(999, (S.gc || 0) + l.gc); });
  if (logs.length) lastSettles = logs.concat(lastSettles).slice(0, 3);
  save(); return logs;
}
// ---------- 화면 ----------
const won = n => (n < 0 ? '−' : '') + Math.abs(Math.round(n)).toLocaleString() + '원';
const LS = window.lenaShop;
let tab = 'street', cur = null, sel = null;
function pimg(p, cls) { const x = P[p]; if (!x.i || x.t === 'L') return el('span', 'tx', x.t); const i = el('img', cls); i.src = IMG(x.i); i.alt = ''; return i; }
const unlocked = b => Object.keys(P).filter(k => P[k].rk <= b.rank);
function top(Bx, b) {
  const t = el('div', 'bz-top'), today = b.today.rev - b.today.cogs;
  [['사업 자금', won(b.cash), b.cash < 0 ? 'neg' : ''], ['게임 동전', String(S.gc || 0), ''], ['오늘 이익', won(today), today >= 0 ? 'pos' : 'neg']].forEach(([a, v, c]) => { const d = el('div', c); d.append(el('small', null, a), el('b', null, v)); t.appendChild(d); });
  Bx.appendChild(t);
  const nx = RANK[b.rank + 1], rk = el('div', 'bz-rank'), bar = el('i'), u = el('u'); u.style.width = nx ? Math.min(100, b.life / nx[1] * 100) + '%' : '100%'; bar.appendChild(u);
  rk.append(document.createTextNode(`${RANK[b.rank][0]}`), bar, document.createTextNode(nx ? `다음: 누적 이익 ${won(nx[1])}·자리 ${nx[2]}곳` : '최고 등급')); Bx.appendChild(rk);
  if (b.cash < 0) Bx.appendChild(el('div', 'warn', `해골 사채 ${won(-b.cash)} · 매일 자정 이자 5%. ${won(LIMIT)} 밑으로 가면 기계를 압류당해요.`));
}
function street(Bx, b) {
  L.forEach(loc => { const st = b.locs[loc.id], c = el('button', 'bz-loc' + (st ? '' : ' lock')), im = el('img'); im.src = loc.i; im.alt = ''; const t = el('div', 't');
    if (st) { let low = 0, empty = 0, brk = 0; st.machines.forEach(m => { if (m.broken) brk++; m.slots.forEach(s => { if (!s.p) empty++; else if (s.n <= capOf(b, m) * .25) low++; }); });
      const w = []; if (brk) w.push(`고장 ${brk}`); if (low) w.push(`거의 빔 ${low}칸`); if (empty) w.push(`빈 칸 ${empty}`);
      t.append(el('b', null, loc.n), el('small', null, `자판기 ${st.machines.length}대 · 자릿세 ${won(loc.rent)}/일`)); if (w.length) t.appendChild(el('small', 'warnd', w.join(' · ')));
      c.onclick = () => { cur = loc.id; sel = null; tab = 'loc'; refreshSheet(); };
    } else { t.append(el('b', null, loc.n), el('small', null, `열기: 게임 동전 ${loc.gc}개 · 자릿세 ${won(loc.rent)}/일 · 손님 ${loc.c}/시간`));
      c.onclick = () => { if ((S.gc || 0) < loc.gc) { toast(`게임 동전이 ${loc.gc - (S.gc || 0)}개 모자라요.`); return; } if (!confirm(`${loc.n}을 열까요? 게임 동전 ${loc.gc}개, 매일 자릿세 ${won(loc.rent)}`)) return; S.gc -= loc.gc; b.locs[loc.id] = { machines: [newMachine(0)] }; save(); cur = loc.id; tab = 'loc'; refreshSheet(); }; }
    c.append(im, t); if (st) c.appendChild(el('em', null, '›')); Bx.appendChild(c); });
  Bx.appendChild(el('div', 'hint', '앱을 닫아도 장사해요(최대 12시간). 자정에 자릿세·알바 일당이 나가고, 하루 이익 3만 원마다 게임 동전 1개(하루 최대 5).'));
}
function locView(Bx, b) {
  const loc = L.find(x => x.id === cur), st = b.locs[cur]; if (!st) { tab = 'street'; return street(Bx, b); }
  Bx.appendChild(row(btn('‹ 거리', 'ghost', () => { tab = 'street'; refreshSheet(); }), btn('전부 채우기', 'teal wide', () => { let n = 0, c0 = b.cash; st.machines.forEach(m => { if (!m.broken) m.slots.forEach(s => { n += fill(b, m, s, Date.now()); }); }); save(); refreshSheet(); toast(n ? `${n}개 채웠어요 (${won(c0 - b.cash)})` : '채울 게 없거나 자금이 모자라요.'); })));
  const tips = Object.entries(loc.pop).filter(([k]) => P[k].rk <= b.rank).map(([k]) => P[k].n); Bx.appendChild(el('div', 'hint', `${loc.n} · 잘 팔림: ${tips.join(', ') || '고르게'}${loc.rival ? ' · 편의점 때문에 ' + loc.rival.map(k => P[k].n).join('·') + ' 덜 팔림' : ''}${loc.cheap ? ' · 비싸면 잘 안 팔림' : ''}`));
  st.machines.forEach((m, mi) => {
    const W = el('div', 'bz-mc ' + M[m.type].cls + (m.broken ? ' broken' : '')), hd = el('div', 'hd'); hd.append(el('span', null, M[m.type].n + (m.broken ? ' · 고장' : '')), el('span', null, `칸 ${m.slots.length} · 칸당 ${capOf(b, m)}개`)); W.appendChild(hd);
    if (m.broken) W.appendChild(row(btn(`수리하기 ${won(REPAIR)}`, 'wide', () => { if (b.cash - REPAIR < LIMIT) { toast('자금이 모자라요.'); return; } b.cash -= REPAIR; b.today.cogs += REPAIR; m.broken = false; save(); refreshSheet(); })));
    const G = el('div', 'bz-g');
    m.slots.forEach((s, si) => { const k = mi + ':' + si, c = el('button', 'bz-s' + (s.p ? '' : ' empty') + (s.p && s.n <= capOf(b, m) * .25 ? ' low' : '') + (sel === k ? ' sel' : ''));
      if (s.p) { const t = el('div', 't'); const left = s.exp ? Math.max(0, Math.ceil((s.exp - Date.now()) / HR)) : 0; t.append(el('b', null, P[s.p].n), el('small', null, `${s.n}/${capOf(b, m)} · ${won(s.price)}${left ? ` · ${left}시간` : ''}`)); c.append(pimg(s.p), t); } else c.textContent = '+ 상품 넣기';
      c.onclick = () => { sel = sel === k ? null : k; refreshSheet(); }; G.appendChild(c); });
    W.appendChild(G); Bx.appendChild(W);
    if (sel && sel.startsWith(mi + ':')) Bx.appendChild(editor(b, m, m.slots[+sel.split(':')[1]]));
  });
  if (st.machines.length < 3) { const r = el('div', 'pills'); M.forEach((x, i) => { const bt = el('button', null, `${x.n} 놓기 · 동전 ${x.gc || 10}`); bt.onclick = () => { const cost = x.gc || 10; if ((S.gc || 0) < cost) { toast(`게임 동전이 ${cost - (S.gc || 0)}개 모자라요.`); return; } S.gc -= cost; st.machines.push(newMachine(i)); save(); refreshSheet(); }; r.appendChild(bt); }); Bx.append(lbl('자판기 더 놓기 (3대까지)'), r); }
}
function editor(b, m, s) {
  const w = el('div', 'bz-ed');
  w.appendChild(el('div', 'hint', '상품 고르기 (도매가 → 기본 값)'));
  w.appendChild(pills(unlocked(b).map(k => [k, `${P[k].n} ${P[k].w}→${P[k].b}`]), s.p || '', k => { if (s.p && s.p !== k && s.n) { if (!confirm(`남은 ${P[s.p].n} ${s.n}개를 버리고 바꿀까요?`)) return; b.today.waste += s.n * P[s.p].w; s.n = 0; } s.p = k; s.price = P[k].b; s.exp = 0; s.acc = 0; save(); refreshSheet(); }));
  if (s.p) {
    const r1 = el('div', 'r'), st = el('div', 'step'), r0 = s.price / P[s.p].b; st.append(btn('−', 'ghost', () => { s.price = Math.max(100, s.price - 100); save(); refreshSheet(); }), el('b', null, won(s.price)), btn('+', 'ghost', () => { s.price += 100; save(); refreshSheet(); }));
    r1.append(el('span', null, `값 (기본의 ${Math.round(r0 * 100)}% · 팔리는 정도 ${Math.round(conv(r0) * 100)}%)`), st); w.appendChild(r1);
    const need = capOf(b, m) - s.n; w.appendChild(row(btn(need ? `가득 채우기 +${need}개 · ${won(need * P[s.p].w)}` : '가득 찼어요', 'teal wide', () => { const n = fill(b, m, s, Date.now()); save(); refreshSheet(); if (!n && need) toast('자금이 모자라요(사채 한도).'); }), btn('비우기', 'ghost', () => { if (s.n && !confirm(`${s.n}개를 버릴까요?`)) return; b.today.waste += s.n * P[s.p].w; s.p = null; s.n = 0; s.exp = 0; save(); refreshSheet(); })));
    if (P[s.p].exp) w.appendChild(el('div', 'hint', `유통기한 ${expDays(b, m, s.p)}일 — 지나면 남은 건 버려요.`));
  }
  return w;
}
function staffView(Bx, b) {
  Bx.appendChild(lbl('해골 알바 (자정마다 일당)'));
  const c = el('div', 'card pedit'); for (const k in STAFF) { const x = STAFF[k], r = el('div', 'r'), t = el('span'); t.append(el('b', null, `${x.n} · ${won(x.w)}/일`), el('br'), el('small', null, x.d)); t.lastChild.style.cssText = 'font-size:12px;color:var(--mute)'; r.append(t, pills([[true, '켜기'], [false, '끄기']], !!b.staff[k], v => { b.staff[k] = v; save(); refreshSheet(); })); c.appendChild(r); } Bx.appendChild(c);
  Bx.appendChild(lbl('설비 (사업 자금)'));
  const u = el('div', 'card pedit'); for (const k in UP) { const x = UP[k], r = el('div', 'r'), t = el('span'); t.append(el('b', null, x.n), el('br'), el('small', null, x.d)); t.lastChild.style.cssText = 'font-size:12px;color:var(--mute)';
    r.append(t, b.up[k] ? el('b', null, '설치됨') : btn(won(x.c), 'ghost', () => { if (b.cash < x.c) { toast('자금이 모자라요(설비는 사채로 못 사요).'); return; } b.cash -= x.c; b.up[k] = 1; save(); refreshSheet(); })); u.appendChild(r); } Bx.appendChild(u);
}
function lenaView(Bx, b) {
  LS.decay(); const a = LS.A(), n = LS.lv(a.pt), [, mt] = LS.mood(), s = LS.today();
  const c = el('div', 'card'); c.append(el('b', null, LS.tierOf(n).name), el('div', 'hint', mt));
  const hb = el('div', 'bz-rank'), bar = el('i'), uu = el('u'); uu.style.width = Math.min(100, (a.pt - LS.need(n)) / Math.max(1, LS.need(n + 1) - LS.need(n)) * 100) + '%'; bar.appendChild(uu); hb.append(bar, document.createTextNode(`「${LS.tierOf(n + 1).name}」까지 ${LS.need(n + 1) - a.pt}점`)); c.appendChild(hb);
  const want = wantP(s); c.appendChild(el('div', 'hint', `오늘의 주파수: ${P[want].n} — 납품하면 회선 점수 2배`)); Bx.appendChild(c);
  Bx.appendChild(lbl('레나에게 납품 (도매가로 사서 바로 드림)'));
  const G = el('div', 'bz-g'); unlocked(b).forEach(k => { const pt = Math.max(1, Math.round(P[k].b / 700)) * (k === want ? 2 : 1), cost = P[k].w * 2, x = el('button', 'bz-s'), t = el('div', 't'); t.append(el('b', null, P[k].n), el('small', null, `${won(cost)} · 회선 +${pt}`)); x.append(pimg(k), t);
    x.onclick = () => { if (b.cash < cost) { toast('자금이 모자라요.'); return; } b.cash -= cost; const before = LS.lv(a.pt); a.pt += pt; a.last = dk(new Date()); a.gifts = a.gifts || {}; a.gifts[k] = (a.gifts[k] || 0) + 1; save(); LS.renderAff();
      const after = LS.lv(a.pt); toast(`${P[k].n} 납품 · 회선 +${pt}` + (after > before ? ` · 「${LS.tierOf(after).name}」` : '')); refreshSheet(); setTimeout(() => say(pick(['…제 가게 물건을 저한테 주는 거예요? 귀엽네.', '납품 확인. 사장님, 오늘 밤 저랑 퇴근해요.', '이거 제일 잘 팔리는 거잖아요. 아깝지 않아요?']), 'happy', false), 400); }; G.appendChild(x); });
  Bx.appendChild(G);
  Bx.appendChild(lbl('부스 꾸미기 (사업 자금으로 스티커)'));
  const D = LS.D(), Dg = el('div', 'dl'); LS.DECOR.forEach(d => { const own = D.own.includes(d.id), on = D.on.includes(d.id), price = d.p * 10000, t = el('button', 'dt' + (on ? ' on' : '') + (own ? '' : ' lock')), im = el('img'); im.src = LS.SI(d.i); im.alt = d.n; t.appendChild(im);
    t.onclick = () => { if (!own) { if (b.cash < price) { toast(`${d.n}: ${won(price)} 필요해요.`); return; } if (!confirm(`${d.n}을 ${won(price)}에 살까요?`)) return; b.cash -= price; D.own.push(d.id); if (D.on.length < 6) D.on.push(d.id); save(); refreshSheet(); renderHome(); return; }
      const o = D.on; if (on) o.splice(o.indexOf(d.id), 1); else { if (o.length >= 6) o.shift(); o.push(d.id); } save(); refreshSheet(); renderHome(); }; Dg.appendChild(t); });
  Bx.appendChild(Dg); if (D.on.length) Bx.appendChild(row(btn('부스 유리에 직접 붙이기 (위치 옮기기)', 'wide', LS.decorEdit)));
  Bx.appendChild(el('div', 'hint', `모은 스티커 ${D.own.length}/${LS.DECOR.length} · 잠긴 건 눌러서 사요 · 6개까지 붙여요`));
}
function wantP(s) { const k = Object.keys(P), r = rnd(dk(new Date()) + 'w'); const u = unlocked(B()); return u[Math.floor(r() * u.length)] || k[0]; }
function book(Bx, b) {
  const D = b.log.slice(-14); if (!D.length) { Bx.appendChild(empty('아직 결산한 날이 없어요.\n자정이 지나면 하루 장부가 생겨요.', 'st_coin')); return; }
  const mx = Math.max(1, ...D.map(l => Math.abs(l.profit))), C = el('div', 'bz-chart'); D.forEach(l => { const i = el('i', l.profit < 0 ? 'neg' : ''); i.style.height = Math.max(2, Math.abs(l.profit) / mx * 100) + '%'; i.title = l.d; C.appendChild(i); }); Bx.append(lbl('최근 14일 이익'), C);
  const lg = el('div', 'bz-log'); D.slice().reverse().forEach(l => { const r = el('div'); r.innerHTML = `<b>${l.d.slice(5).replace('-', '/')}</b> 이익 <b style="color:${l.profit < 0 ? '#d0124f' : '#0b7d6e'}">${won(l.profit)}</b> · 매출 ${won(l.rev)} (${l.sold}개) · 도매 ${won(l.cogs)}${l.waste ? ` · 버림 ${won(l.waste)}` : ''} · 자릿세 ${won(l.rent)}${l.wage ? ` · 일당 ${won(l.wage)}` : ''}${l.int ? ` · 이자 ${won(l.int)}` : ''}${l.gc ? ` · 게임 동전 +${l.gc}` : ''}${l.ev.length ? '<br>' + l.ev.join('<br>') : ''}`; lg.appendChild(r); }); Bx.append(lbl('장부'), lg);
}
SH.shop = { t: '자판기 사업', s: () => { const b = B(); return `${RANK[b.rank][0]} · 자리 ${Object.keys(b.locs).length}곳`; }, open: () => {}, r: Bx => {
  const b = B(); tick(true);
  if (lastSettles.length && !b.seen[lastSettles[0].d]) { const l = lastSettles[0]; b.seen = { [l.d]: 1 }; const c = el('div', 'ask lena'); c.append(el('span', 'who', '레나'), document.createTextNode(`어제(${l.d.slice(5).replace('-', '/')}) 장사 — 이익 ${won(l.profit)}${l.gc ? `, 게임 동전 +${l.gc}` : ''}${l.ev.length ? ' · ' + l.ev[0] : ''}. ${l.profit < 0 ? '…이러다 해골 사채 써요.' : '잘했어요, 사장님.'}`)); Bx.appendChild(c); }
  else if (tab === 'street') { const c = el('div', 'ask lena'), say = b.cash < 0 ? '사채 이자가 붙고 있어요. 값 내리고 잘 팔리는 것부터 채워요.' : pick(['비 오면 우산, 시험 기간엔 학원 앞. 장사는 눈치예요.', '빈 칸은 돈이 새는 구멍이에요. 채워 둬요.', '비싸게 걸면 안 팔려요. 손님은 송휘만큼 너그럽지 않거든요.']); c.append(el('span', 'who', '레나'), document.createTextNode(say)); Bx.appendChild(c); }
  top(Bx, b);
  const T = el('div', 'tabs'); [['street', '거리'], ['staff', '알바·설비'], ['lena', '레나'], ['book', '장부']].forEach(([v, l]) => { const x = el('button', (tab === v || (v === 'street' && tab === 'loc')) ? 'on' : '', l); x.onclick = () => { tab = v; sel = null; refreshSheet(); }; T.appendChild(x); }); Bx.appendChild(T);
  ({ street, loc: locView, staff: staffView, lena: lenaView, book })[tab](Bx, b);
} };
SH[3] = SH.shop;
// 화면이 열려 있으면 10초마다 장사 진행·숫자 갱신
setInterval(() => { if (curSheet === 'shop' || curSheet === 3) { tick(false); if (!document.querySelector('.bz-ed') && tab !== 'lena') refreshSheet(); } }, 10000);
document.addEventListener('visibilitychange', () => { if (!document.hidden) { try { tick(true); } catch (e) {} } });
try { tick(true); } catch (e) {}
window.lenaBiz = { P, L, M, RANK, fresh, advance, settle, fill, minute, conv, newMachine, B, tick, env };
})();
