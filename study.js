// 공부 (다이얼 6): 시험 3주 전부터 회독 단계(블로그 방식) · 평일 2과목/주말 3~4과목 · 빈 시간에 50분 블록 · 블록을 눌러 간단히 조정
// 전단지 시트에는 '캘린더' 탭만 남긴다(오늘 / 캘린더 / 시간표 / 할 일). app.js·proactive.js·follow.js·plan.js 뒤에 불러온다.
'use strict';
(() => {
const css = `
.cal{display:grid;grid-template-columns:repeat(7,1fr);gap:3px}
.cal .wd{text-align:center;font-size:11.5px;font-weight:800;color:var(--mute);padding:2px 0}
.cal .wd.su{color:#ff7a9c}.cal .wd.sa{color:#7fb6ff}
.cal button{position:relative;min-height:54px;border-radius:9px;background:var(--panel2);border:1px solid var(--line);padding:3px 3px 4px;display:flex;flex-direction:column;align-items:stretch;gap:2px;text-align:left;overflow:hidden}
.cal button.out{opacity:.3}.cal button.td{border-color:var(--pink);box-shadow:inset 0 0 0 1px var(--pink)}.cal button.sel{background:#22303a}
.cal .dn{font-family:'Space Mono',monospace;font-size:11px;font-weight:700;color:#cfd8dc}
.cal .ex{font-size:9.5px;font-weight:800;color:#fff;background:var(--hot);border-radius:4px;padding:0 3px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.cal .ds{display:flex;gap:2px;flex-wrap:wrap}.cal .ds i{width:6px;height:6px;border-radius:50%}
.cal .sb{position:absolute;left:3px;right:3px;bottom:3px;height:4px;border-radius:2px;background:rgba(255,255,255,.08);overflow:hidden}.cal .sb b{display:block;height:100%;background:var(--teal)}
.calh{display:flex;align-items:center;justify-content:space-between;margin-bottom:8px}
.calh b{font-family:'Black Han Sans';font-weight:400;font-size:20px}
.calh .btn{height:36px;padding:0 12px}
.dlist .r{display:flex;gap:10px;align-items:baseline;padding:6px 0;border-bottom:1px dashed rgba(255,255,255,.07);font-size:14px}
.dlist .r b{flex:none;width:46px;font-family:'Space Mono',monospace;font-size:12px;color:var(--yel)}
.chip{display:inline-block;flex:none;font-size:11.5px;font-weight:800;color:#111;border-radius:6px;padding:1px 7px;border:1.5px solid #000;vertical-align:1px}
/* 6 공부: 부스 유리에 테이프로 붙여 둔 공부 시간표 */
.dstrip{position:relative;padding:12px 14px 14px;border-radius:16px;background:#0d1014;border:1px solid var(--line);margin-bottom:12px;overflow:hidden}
.dstrip::before{content:"";position:absolute;inset:0;background:radial-gradient(rgba(255,255,255,.07) 1px,transparent 1.3px) 0 0/6px 6px;pointer-events:none}
.dstrip .top{position:relative;display:flex;align-items:flex-end;justify-content:space-between;gap:10px}
.dstrip .nm{font-size:13px;font-weight:700;color:var(--mint);line-height:1.3}.dstrip .nm b{display:block;font-size:16px;color:#fff;font-weight:800;margin-top:1px}
.dstrip .dd{flex:none;padding-right:4px;font-family:'Black Han Sans';font-size:40px;line-height:.9;color:var(--pink);text-shadow:3px 3px 0 #000;letter-spacing:-1px}
.cord{position:relative;display:grid;grid-template-columns:repeat(4,1fr);margin:16px 2px 4px}
.cord::before,.cord i.on{content:"";position:absolute;left:6%;right:6%;top:5px;height:6px;border-radius:3px;background:repeating-linear-gradient(115deg,#3a4048 0 3px,#22262c 3px 6px)}
.cord i.on{right:auto;background:repeating-linear-gradient(115deg,var(--teal) 0 3px,#11806f 3px 6px);box-shadow:0 0 10px rgba(47,224,200,.45)}
.cord span{position:relative;display:flex;flex-direction:column;align-items:center;gap:6px;font-size:11.5px;font-weight:700;color:var(--mute)}
.cord span::before{content:"";width:16px;height:16px;border-radius:50%;background:#22262c;border:2px solid #000}
.cord span.past{color:#cfe9e4}.cord span.past::before{background:var(--teal)}
.cord span.cur{color:#fff}.cord span.cur::before{background:var(--pink);box-shadow:0 0 0 3px rgba(255,61,154,.35),0 0 14px var(--pink)}
.dstrip p{position:relative;font-size:13.5px;line-height:1.5;color:#dfe7ea;margin-top:8px;word-break:keep-all}
.cards{display:flex;gap:8px;overflow-x:auto;padding:4px 2px 10px;margin:0 -2px;scrollbar-width:none}.cards::-webkit-scrollbar{display:none}
.pcard{flex:none;position:relative;width:122px;height:76px;padding:9px 10px;border-radius:9px;border:2px solid #000;background:var(--c);color:#111;text-align:left;clip-path:polygon(0 0,calc(100% - 16px) 0,100% 16px,100% 100%,0 100%);box-shadow:inset 0 -18px 0 rgba(0,0,0,.12)}
.pcard .ic{position:absolute;right:10px;bottom:9px;width:20px;height:15px;border-radius:3px;background:linear-gradient(135deg,#f7e08a,#b8923a);border:1px solid rgba(0,0,0,.5)}
.pcard .ic::before{content:"";position:absolute;inset:3px 6px;border-left:1px solid rgba(0,0,0,.35);border-right:1px solid rgba(0,0,0,.35)}
.pcard b{display:block;font-size:14px;font-weight:900;line-height:1.2}
.pcard small{display:block;font-family:'Space Mono',monospace;font-size:10.5px;font-weight:700;margin-top:4px;opacity:.75;line-height:1.35}
.pcard.on{outline:3px solid #fff;outline-offset:-1px}
.pcard:not(.on):not(.edit){opacity:.72}
.pcard.on::after{content:"✓";position:absolute;right:9px;top:24px;width:20px;height:20px;border-radius:50%;display:grid;place-items:center;font-size:12px;font-weight:900;color:#fff;background:#000}
.pcard.edit{background:transparent;border:1.5px dashed rgba(255,255,255,.35);color:#cdd6da;box-shadow:none;display:grid;place-items:center;font-size:13.5px;font-weight:700;width:86px}
.sheetp{position:relative;margin:12px 2px 6px;padding:20px 14px 10px;background:var(--paper);color:#17181a;border-radius:3px;box-shadow:4px 5px 0 #000;transform:rotate(-.4deg)}
.sheetp::before{content:"";position:absolute;top:0;bottom:0;left:62px;border-left:1.5px solid rgba(255,61,154,.35)}
.sheetp>.tape{position:absolute;top:-10px;left:22px;width:74px;height:20px;background:url(assets/lena/tape_teal1.webp) 0 0/100% 100%;transform:rotate(-5deg)}
.sheetp>.tape.r{left:auto;right:18px;background-image:url(assets/lena/tape_pink1.webp);transform:rotate(6deg)}
.sheetp .hd{display:flex;align-items:baseline;justify-content:space-between;gap:8px;padding:0 2px 8px;border-bottom:2px solid #17181a}
.sheetp .hd b{font-family:'Black Han Sans';font-weight:400;font-size:20px}
.sheetp .hd span{font-family:'Space Mono',monospace;font-size:13px;font-weight:700;background:linear-gradient(transparent 50%,rgba(242,234,58,.9) 50%);padding:0 3px}
.pr{position:relative;display:flex;align-items:center;gap:8px;min-height:56px;border-bottom:1px dashed rgba(0,0,0,.18)}
.pr .t{flex:none;width:48px;font-family:'Space Mono',monospace;font-size:13px;font-weight:700;line-height:1.25}.pr .t small{display:block;font-size:10.5px;opacity:.55}
.pr .w{flex:1;min-width:0;min-height:48px;text-align:left;font-size:15px;font-weight:700;line-height:1.4;color:inherit;padding:4px 2px;word-break:keep-all}
.pr .w i{font-style:normal;font-weight:900;margin-right:6px;padding:0 2px;background:linear-gradient(transparent 52%,var(--c) 52%)}
.pr .st{flex:none;width:46px;height:46px;border-radius:50%;border:2px solid rgba(0,0,0,.55);display:grid;place-items:center}
.pr.done .w{color:rgba(0,0,0,.5);text-decoration:line-through;text-decoration-color:rgba(0,0,0,.35)}
.pr.done .st{border:2.5px solid #d8283f;color:#d8283f;font-family:'Black Han Sans';font-size:17px;transform:rotate(-14deg);opacity:.85;box-shadow:inset 0 0 0 2px rgba(216,40,63,.25)}
.pr.fx{min-height:36px;color:rgba(0,0,0,.45);font-size:13px}.pr.fx .w{min-height:0;font-size:13px;font-weight:600}
.pr.ed{background:rgba(47,224,200,.16);margin:0 -8px;padding:0 8px;border-radius:8px}
.ptools{display:flex;flex-wrap:wrap;gap:6px;padding:8px 0 10px;border-bottom:1px dashed rgba(0,0,0,.18)}
.ptools button{flex:1 0 auto;min-width:62px;height:44px;padding:0 10px;border-radius:10px;background:#17181a;color:var(--paper);font-size:13.5px;font-weight:700}
.ptools button.del{background:transparent;color:#d8283f;border:1.5px solid #d8283f}
.ptools .q{flex-basis:100%;font-size:12.5px;color:rgba(0,0,0,.6)}
.ptools .pills button{background:#17181a;color:var(--paper);border:0}
.padd{display:block;width:100%;height:48px;text-align:left;padding-left:56px;font-size:14px;font-weight:700;color:rgba(0,0,0,.5)}
.pfoot{font-size:12px;color:rgba(0,0,0,.5);padding:6px 2px 2px;line-height:1.5;word-break:keep-all}
.pempty{padding:18px 4px;font-size:14px;color:rgba(0,0,0,.55);line-height:1.6}
.pedit{display:flex;flex-direction:column;gap:2px}
.pedit .r{display:flex;align-items:center;gap:8px;min-height:50px;border-bottom:1px solid var(--line)}
.pedit .r>span{flex:1;font-size:14px}
.step{display:flex;align-items:center;gap:4px}.step button{width:44px;height:40px;border-radius:10px;border:1px solid var(--line);font-size:18px;color:#fff}
.step b{min-width:88px;text-align:center;font-family:'Space Mono',monospace;font-size:13.5px}
.pedit input.in{max-width:130px}
.warn{padding:9px 12px;border-radius:12px;background:rgba(255,46,110,.13);border:1px solid rgba(255,46,110,.5);font-size:13px;line-height:1.5;margin-bottom:10px;word-break:keep-all}
.mat{padding:10px 12px;border-radius:14px;background:var(--panel2);border:1px solid var(--line);margin-bottom:8px}
.mat .h{display:flex;gap:8px;align-items:center}.mat .h b{flex:1;min-width:0;font-size:14.5px}.mat .h em{font-style:normal;font-family:'Space Mono',monospace;font-size:12px;color:var(--mute)}
.mat .pg{height:5px;border-radius:3px;background:#0b0d10;margin-top:8px;overflow:hidden}.mat .pg i{display:block;height:100%;background:var(--teal)}
.mat .us{display:flex;flex-wrap:wrap;gap:5px;margin-top:9px}
.mat .us button{height:32px;padding:0 10px;border-radius:16px;border:1px solid var(--line);font-size:12.5px;color:#cdd6da}
.mat .us button.d{background:var(--teal);color:#000;border-color:var(--teal)}
.frm{display:flex;flex-direction:column;gap:8px}
.wkl{position:relative;display:flex;flex-direction:column;gap:12px;margin:12px 0 2px;padding-left:20px}
.wkl::before{content:"";position:absolute;left:6px;top:6px;bottom:6px;width:4px;border-radius:2px;background:repeating-linear-gradient(25deg,#3a4048 0 3px,#22262c 3px 6px)}
.wkl div{position:relative;font-size:13px;line-height:1.5;color:#d7dee1;word-break:keep-all}
.wkl div::before{content:"";position:absolute;left:-19px;top:4px;width:12px;height:12px;border-radius:50%;background:#22262c;border:2px solid #000}
.wkl div.now::before{background:var(--pink);box-shadow:0 0 10px var(--pink)}
.wkl b{display:block;font-weight:800;color:var(--mint)}.wkl div.now b{color:var(--pink)}
`;
document.head.appendChild(Object.assign(document.createElement('style'), { textContent: css }));

// ---------- 데이터 ----------
const PRESETS = () => [
  { id: 'light', name: '가볍게', c: '#9ff5e4', wd: 90, we: 180, wdS: '18:00', weS: '13:00', end: '22:30', wdSub: 2, weSub: 3 },
  { id: 'normal', name: '보통', c: '#f2ea3a', wd: 150, we: 300, wdS: '17:00', weS: '10:00', end: '23:00', wdSub: 2, weSub: 4 },
  { id: 'exam', name: '시험 모드', c: '#ff8fc4', wd: 240, we: 480, wdS: '16:30', weS: '09:00', end: '23:30', wdSub: 3, weSub: 4 }];
const CARDC = ['#9ff5e4', '#f2ea3a', '#ff8fc4', '#b89cff', '#ffb27a', '#7fb6ff'];
const ST = () => { if (!S.study) S.study = {}; const s = S.study; s.mats = s.mats || []; s.exams = s.exams || []; s.log = s.log || {}; s.rev = s.rev || {}; s.fix = s.fix || {}; s.revq = s.revq || []; s.pref = Object.assign({ wdS: '17:00', weS: '10:00', end: '23:00', wdMax: 150, weMax: 300, block: 50, preset: 'normal', wdSubs: 2, weSubs: 4 }, s.pref || {}); if (!s.presets) s.presets = PRESETS(); return s; };
const curPre = () => { const st = ST(); return st.presets.find(p => p.id === st.pref.preset) || st.presets[0]; };
// 고른 카드의 값을 계산에 쓰는 설정(pref)으로 옮긴다
const usePre = p => { Object.assign(ST().pref, { preset: p.id, wdMax: p.wd, weMax: p.we, wdS: p.wdS, weS: p.weS, end: p.end, wdSubs: p.wdSub, weSubs: p.weSub }); };
const toM = t => { const [h, m] = String(t).split(':').map(Number); return h * 60 + (m || 0); };
const toT = m => `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(Math.round(m % 60)).padStart(2, '0')}`;
const dAdd = (d, n) => { const x = new Date(d); x.setHours(0, 0, 0, 0); x.setDate(x.getDate() + n); return x; };
const dkey = d => dk(d);
const pDate = k => { const [y, m, d] = k.split('-').map(Number); return new Date(y, m - 1, d); };
const todayK = () => dkey(new Date());
const dTo = k => Math.round((pDate(k) - dAdd(new Date(), 0)) / 864e5);
const PAL = ['#ff8fc4', '#7fecd9', '#f2ea3a', '#b89cff', '#ffb27a', '#9ff5e4', '#7fb6ff', '#c9f27a'];
const SUBP = ['국어', '영어', '수학', '사회', '과학', '한국사'];
const matOf = id => ST().mats.find(m => m.id === id);
const exSubs = e => [...new Set([...(e.subs || []), ...e.ranges.map(r => (matOf(r.mat) || {}).sub).filter(Boolean)])];
const subs = () => [...new Set([...ST().mats.map(m => m.sub), ...ST().exams.filter(e => e.date >= todayK()).flatMap(exSubs)])];
const colOf = sub => { let h = 0; for (const c of sub || '') h = (h * 31 + c.charCodeAt(0)) >>> 0; return PAL[h % PAL.length]; };
const chip = sub => { const c = el('span', 'chip', sub); c.style.background = colOf(sub); return c; };
const hm = m => m >= 60 ? `${Math.floor(m / 60)}시간${m % 60 ? ` ${m % 60}분` : ''}` : `${m}분`;
function makeUnits(kind, from, to, chunk, mins, label) {
  const U = [];
  if (kind === 'hw') return [{ id: uid('u'), name: label || '숙제', mins: mins || 40, prog: 0, done: false }];
  if (label === '쪽') { const c = Math.max(1, chunk || 10); for (let p = from; p <= to; p += c) U.push({ id: uid('u'), name: `p.${p}~${Math.min(to, p + c - 1)}`, mins: mins || 40, prog: 0, done: false }); }
  else for (let n = from; n <= to; n++) U.push({ id: uid('u'), name: `${n}${label || '단원'}`, n, mins: mins || 40, prog: 0, done: false });
  return U.slice(0, 120);
}
function addMat(o) { const m = { id: uid('m'), sub: String(o.sub || '기타').slice(0, 12), title: String(o.title || '교재').slice(0, 30), kind: o.kind === 'hw' ? 'hw' : 'book', due: o.due || '', units: makeUnits(o.kind, +o.from || 1, +o.to || +o.from || 1, +o.chunk, +o.mins, o.kind === 'hw' ? (o.what || o.title) : o.unit) }; ST().mats.push(m); save(); return m; }
function addExam(o) { const e = { id: uid('x'), name: String(o.name || '시험').slice(0, 20), date: o.date, subs: [...new Set(o.subs || [])], ranges: (o.ranges || []).filter(r => r.mat) }; ST().exams.push(e); save(); return e; }

// 문제집 범위 = 시험 1주 전까지 다 풀기(블로그: 1주 전 '문제집 진도까지 다 풀기'). 그게 이미 너무 가까우면 이틀 전까지.
function dueOf(m, u, i) {
  let d = m.due || ''; const today = todayK();
  for (const e of ST().exams) { if (e.date < today) continue; for (const r of e.ranges) if (r.mat === m.id && i >= r.from && i <= r.to) { let k = dkey(dAdd(pDate(e.date), -7)); if (k < dkey(dAdd(new Date(), 2))) k = dkey(dAdd(pDate(e.date), -2)); if (!d || k < d) d = k; } }
  if (m.kind === 'hw' && m.due) d = dkey(dAdd(pDate(m.due), -1)); // 숙제는 학원 가는 날 전날까지
  return d;
}

// 블로그의 주차별 계획: 시험 과목마다 회독 단계를 그 주에 넣는다
const STEPS = [
  { f: -21, d: -15, m: 50, t: '교과서·프린트 1회독' },
  { f: -21, d: -15, m: 50, t: '2회독 · 문제집 개념 정리' },
  { f: -14, d: -8, m: 50, t: '3회독 · 나만의 시험지' },
  { f: -7, d: -5, m: 45, t: '4회독 · 백지 복습' },
  { f: -4, d: -2, m: 45, t: '5회독 · 백지 복습 · 기출' },
  { f: -1, d: -1, m: 45, t: '필승노트 · 오답 체크' }];
function phaseOf(dd) {
  if (dd < 0) return null;
  if (dd === 0) return ['시험 날', '아침에 필승노트만 훑고 들어가요'];
  if (dd === 1) return ['시험 전날', '필승노트(핵심·자주 틀린 것·실수) · 교과서 마지막 확인 · 오답 체크'];
  if (dd <= 7) return ['1주 전', '4·5회독 백지 복습 · 문제집 남은 범위 다 풀기 · 기출'];
  if (dd <= 14) return ['2주 전', '3회독(나만의 시험지) · 문제집 진도까지 풀고 오답'];
  if (dd <= 21) return ['3주 전', '교과서·프린트 1~2회독 · 문제집 개념 부분'];
  return ['평소', '교재 진도 고르게 · 시험 3주 전부터 회독 시작'];
}
const nextExam = () => ST().exams.filter(e => e.date >= todayK()).sort((a, b) => a.date.localeCompare(b.date))[0];

// ---------- 그날 빈 시간 ----------
function busyOn(d) {
  const L = [], k = dkey(d), wd = d.getDay();
  S.items.forEach(t => { if (t.done || !t.due || t.due.slice(0, 10) !== k || t.rid) return; const s = toM(t.due.slice(11, 16)); L.push([s, s + (t.mins || 60), t.text]); });
  (S.reps || []).forEach(r => { if (r.days.length && !r.days.includes(wd)) return; if ((S.repSkip || {})[r.id + '_' + k]) return; L.push([toM(r.time), toM(r.end || toT(toM(r.time) + 60)), r.text]); });
  return L.sort((a, b) => a[0] - b[0]);
}
function freeIv(d, isToday) {
  const P = ST().pref, we = d.getDay() === 0 || d.getDay() === 6; let s = toM(we ? P.weS : P.wdS); const e = toM(P.end);
  if (isToday) { const n = new Date(); s = Math.max(s, Math.ceil((n.getHours() * 60 + n.getMinutes() + 5) / 5) * 5); }
  const out = []; let cur = s;
  for (const [bs, be] of busyOn(d)) { if (be + 10 <= cur) continue; if (bs - 10 > cur) out.push([cur, Math.min(e, bs - 10)]); cur = Math.max(cur, be + 10); if (cur >= e) break; }
  if (cur < e) out.push([cur, e]);
  return out.filter(([a, b]) => b - a >= 25);
}

// ---------- 계산 ----------
function tasks() {
  const T = [], today = todayK();
  ST().mats.forEach((m, mi) => m.units.forEach((u, i) => { if (u.done) return; T.push({ key: u.id, m, u, i, mi, sub: m.sub, label: m.kind === 'hw' ? `숙제 · ${m.title}` : `${m.title} ${u.name}`, rem: Math.max(5, u.mins - (u.prog || 0)), due: dueOf(m, u, i), seq: m.kind === 'book' }); }));
  ST().exams.forEach(e => { if (e.date < today) return; exSubs(e).forEach(sub => STEPS.forEach((st, j) => { const day = dkey(dAdd(pDate(e.date), st.d)), from = dkey(dAdd(pDate(e.date), st.f)), key = `${e.id}_${sub}_s${j}`; if (ST().rev[key] || day < today) return; T.push({ key, rev: 1, sub, label: st.t, rem: st.m, due: day, from, mi: 50 + j }); })); });
  // 끝낸 단원은 1·3·7일 뒤 짧게 다시 보기(간격 복습)
  ST().revq.forEach(q => { if (ST().rev[q.key] || q.at > dkey(dAdd(new Date(), 60))) return; const due = dkey(dAdd(pDate(q.at), 2)); if (due < today) return; T.push({ key: q.key, rev: 1, soft: 1, sub: q.sub, label: q.label, rem: q.mins, due, from: q.at, mi: 40 }); });
  return T;
}
function simulate(nDays, capMode) {
  const st = ST(), P = st.pref, T = tasks().map(t => ({ ...t })), days = [], today = new Date(); today.setHours(0, 0, 0, 0);
  const dmax = x => (x.getDay() === 0 || x.getDay() === 6) ? P.weMax : P.wdMax;
  for (let di = 0; di < nDays; di++) {
    const d = dAdd(today, di), k = dkey(d), we = d.getDay() === 0 || d.getDay() === 6;
    if (di === 0 && st.fix[k]) { // 손으로 고친 오늘은 그대로
      const blocks = st.fix[k].map(b => ({ s: b.s, e: b.e, sub: b.sub, parts: b.parts.map(p => { const t = T.find(x => x.key === p.key); if (t) t.rem = Math.max(0, t.rem - p.mins); return { t: t || { key: p.key, label: p.label, sub: b.sub, rev: 1 }, mins: p.mins }; }) }));
      days.push({ k, blocks, mins: blocks.reduce((a, b) => a + (b.e - b.s), 0), fixed: 1 }); continue;
    }
    // 고르게 나누기: 마감마다 (그때까지 할 양 ÷ 그때까지 쓸 수 있는 시간) 중 가장 큰 비율만큼만 오늘 한다
    let f = 0; const live = T.filter(t => t.rem > 0 && t.due);
    [...new Set(live.map(t => t.due))].forEach(dl => { const W = live.filter(t => t.due <= dl).reduce((a, t) => a + t.rem, 0); let C = 0; for (let j = 0; dkey(dAdd(d, j)) <= dl && j < 90; j++) C += dmax(dAdd(d, j)); if (C <= 0) C = dmax(d); f = Math.max(f, W / C); });
    let cap = capMode === 'max' ? 24 * 60 : Math.min(dmax(d), Math.ceil(dmax(d) * Math.min(1, f * 1.1) / 10) * 10);
    if (capMode !== 'max' && T.some(t => t.rem > 0 && !t.due)) cap = Math.max(cap, Math.round(dmax(d) * .5));
    if (di === 0) cap = Math.max(0, cap - ((st.log[k] || []).reduce((a, b) => a + b.mins, 0)));
    // 블로그: 평일 2과목, 주말 3~4과목
    const lim = capMode === 'max' ? 99 : (we ? P.weSubs : P.wdSubs), daySubs = new Set((di === 0 ? st.log[k] || [] : []).map(l => l.sub));
    const blocks = []; let last = '';
    for (const [a, b] of freeIv(d, di === 0)) {
      let cur = a;
      while (cap >= 20 && b - cur >= 25) {
        const len = Math.min(P.block, b - cur, cap); if (len < 20) break;
        const parts = []; let left = len, bsub = '';
        while (left >= 10) {
          const head = new Map(); for (const o of T) if (o.seq && o.rem > 0 && (!head.has(o.m) || o.i < head.get(o.m))) head.set(o.m, o.i);
          const elig = T.filter(t => t.rem > 0 && (!t.from || t.from <= k) && (!t.seq || head.get(t.m) === t.i) && (daySubs.has(t.sub) || daySubs.size < lim));
          if (!elig.length) break;
          elig.sort((x, y) => (x.due || '9999') < (y.due || '9999') ? -1 : (x.due || '9999') > (y.due || '9999') ? 1 : (x.mi || 0) - (y.mi || 0));
          const minDue = elig[0].due || '9999', near = elig.filter(t => (t.due || '9999') <= dkey(dAdd(pDate(minDue === '9999' ? '2099-01-01' : minDue), 2)) || minDue === '9999');
          const pick = bsub ? (near.find(t => t.sub === bsub) || elig.find(t => t.sub === bsub) || null) : (near.find(t => t.sub !== last) || near[0]);
          if (!pick) break;
          if (parts.length && pick.rem > left) break; // 자투리로 쪼개지 않음
          const use = Math.min(pick.rem, left); pick.rem -= use; left -= use; bsub = pick.sub; daySubs.add(pick.sub);
          parts.push({ t: pick, mins: use, late: pick.due && k > pick.due });
          if (pick.rem > 0) break;
        }
        if (!parts.length) break;
        const used = len - left, end = cur + used;
        blocks.push({ s: cur, e: end, sub: bsub, parts }); cap -= used; last = bsub; cur = end + 10;
      }
    }
    days.push({ k, blocks, mins: blocks.reduce((a, b) => a + (b.e - b.s), 0) });
  }
  const left = T.filter(t => t.rem > 0 && t.due), late = [];
  days.forEach(D => D.blocks.forEach(b => b.parts.forEach(p => { if (p.late && !p.t.soft && !late.includes(p.t)) late.push(p.t); })));
  left.forEach(t => { if (!t.soft && !late.includes(t) && t.due < dkey(dAdd(today, nDays))) late.push(t); });
  return { days, late };
}
function horizon() { let far = dkey(dAdd(new Date(), 31)); ST().mats.forEach(m => m.units.forEach((u, i) => { const d = dueOf(m, u, i); if (d && d > far) far = d; })); ST().exams.forEach(e => { if (e.date > far) far = e.date; }); return Math.min(70, dTo(far) + 1); }
let cache = null;
function splan() {
  const sig = JSON.stringify([S.study, S.reps, S.items.filter(t => t.due && !t.done).map(t => t.due), todayK(), Math.floor(Date.now() / 300000)]);
  if (cache && cache.sig === sig) return cache;
  const n = horizon(); let r = simulate(n), strained = false;
  if (r.late.length) { const r2 = simulate(n, 'max'); if (r2.late.length < r.late.length) { r = r2; strained = true; } }
  cache = { sig, ...r, strained }; return cache;
}
const dirty = () => { cache = null; };
window.studyBusy = () => { try { return (splan().days[0] || { blocks: [] }).blocks.map(b => [b.s, b.e, '공부']); } catch (e) { return []; } };

// ---------- 오늘 블록 고치기: 처음 고칠 때 오늘 계획을 그대로 굳히고(S.study.fix), 그 위에서 바꾼다 ----------
function freeze() {
  const st = ST(), k = todayK(); Object.keys(st.fix).forEach(x => { if (x !== k) delete st.fix[x]; });
  if (!st.fix[k]) st.fix[k] = (splan().days[0] || { blocks: [] }).blocks.map(b => ({ s: b.s, e: b.e, sub: b.sub, parts: b.parts.map(p => ({ key: p.t.key, label: p.t.label, mins: p.mins })) }));
  return st.fix[k];
}
const commit = () => { const F = ST().fix[todayK()]; if (F) { F.sort((a, b) => a.s - b.s); for (let i = 1; i < F.length; i++) if (F[i].s < F[i - 1].e + 10) { const len = F[i].e - F[i].s; F[i].s = F[i - 1].e + 10; F[i].e = F[i].s + len; } } save(); dirty(); pushSync(true); refreshSheet(); };
// 그 과목에서 다음에 할 것(교재는 앞 단원부터, 오늘 이미 넣은 건 빼고)
function nextOf(sb, mins) {
  const k = todayK(), F = ST().fix[k] || [], used = {}; F.forEach(b => b.parts.forEach(p => used[p.key] = (used[p.key] || 0) + p.mins));
  const T = tasks().filter(t => t.sub === sb && (!t.from || t.from <= k) && t.rem - (used[t.key] || 0) > 0);
  const head = new Map(); T.forEach(o => { if (o.seq && (!head.has(o.m) || o.i < head.get(o.m))) head.set(o.m, o.i); });
  const t = T.filter(x => !x.seq || head.get(x.m) === x.i).sort((x, y) => (x.due || '9999').localeCompare(y.due || '9999'))[0];
  return t ? [{ key: t.key, label: t.label, mins: Math.min(mins, t.rem - (used[t.key] || 0)) }] : [{ key: 'free_' + sb, label: `${sb} 자유 공부`, mins }];
}
const resize = (b, len) => { const old = b.e - b.s; b.e = b.s + len; b.parts.forEach(p => p.mins = Math.max(5, Math.round(p.mins * len / old))); };

// ---------- 완료 처리 ----------
function finishBlock(b) {
  const k = todayK(), st = ST();
  b.parts.forEach(p => { const key = p.t ? p.t.key : p.key; if (/^free_/.test(key)) return; let u = null; st.mats.forEach(m => m.units.forEach(x => { if (x.id === key) u = x; })); if (u) { u.prog = (u.prog || 0) + p.mins; if (u.prog >= u.mins - 1 && !u.done) { u.done = true; u.doneAt = Date.now(); const m = st.mats.find(mm => mm.units.includes(u)); if (m && m.kind === 'book') [[1, 15, '복습'], [3, 10, '복습 2'], [7, 10, '복습 3']].forEach(([n, mn, w]) => st.revq.push({ key: `rq_${u.id}_${n}`, sub: m.sub, label: `${m.title} ${u.name} ${w}`, mins: mn, at: dkey(dAdd(new Date(), n)) })); } } else st.rev[key] = 1; });
  st.revq = st.revq.filter(q => !st.rev[q.key] && q.at >= dkey(dAdd(new Date(), -3))).slice(-120);
  (st.log[k] = st.log[k] || []).push({ s: b.s, e: b.e, sub: b.sub, label: b.parts.map(p => (p.t || p).label).join(' / '), mins: b.e - b.s });
  if (st.fix[k]) st.fix[k] = st.fix[k].filter(x => x.s !== b.s);
  const ks = Object.keys(st.log).sort(); while (ks.length > 60) delete st.log[ks.shift()];
  S.coins = (S.coins || 0) + 1; save(); dirty(); pushSync(true); coinPop && coinPop(); renderHome();
}

// ---------- 전단지 시트: 오늘 / 캘린더 / 시간표 / 할 일 ----------
let calM = null, calSel = null;
boardTabs = function (B) {
  const T = el('div', 'tabs'); [['today', '오늘'], ['cal', '캘린더'], ['tt', '시간표'], ['all', '할 일']].forEach(([v, l]) => { const b = el('button', boardTab === v ? 'on' : '', l); b.onclick = () => { boardTab = v; refreshSheet(); }; T.appendChild(b); }); B.appendChild(T);
};
const _br = boardRender; boardRender = function (B) {
  if (boardTab === 'week') boardTab = 'cal';
  if (boardTab === 'study') boardTab = 'today';
  if (boardTab === 'cal') return renderCal(B);
  _br(B);
};

// ---------- 캘린더 ----------
function renderCal(B) {
  boardTabs(B);
  const now = new Date(); calM = calM || new Date(now.getFullYear(), now.getMonth(), 1); calSel = calSel || dkey(now);
  const P = splan(), pm = {}; P.days.forEach(D => pm[D.k] = D);
  const H = el('div', 'calh'); H.append(btn('‹', 'ghost', () => { calM = new Date(calM.getFullYear(), calM.getMonth() - 1, 1); refreshSheet(); }), el('b', null, `${calM.getFullYear()}년 ${calM.getMonth() + 1}월`), btn('›', 'ghost', () => { calM = new Date(calM.getFullYear(), calM.getMonth() + 1, 1); refreshSheet(); })); B.appendChild(H);
  const G = el('div', 'cal'); [...'일월화수목금토'].forEach((w, i) => G.appendChild(el('div', 'wd' + (i === 0 ? ' su' : i === 6 ? ' sa' : ''), w)));
  const start = new Date(calM); start.setDate(1 - calM.getDay());
  for (let i = 0; i < 42; i++) {
    const d = dAdd(start, i), k = dkey(d); if (i >= 35 && d.getMonth() !== calM.getMonth()) break;
    const c = el('button', (d.getMonth() !== calM.getMonth() ? 'out ' : '') + (k === dkey(now) ? 'td ' : '') + (k === calSel ? 'sel' : ''));
    c.appendChild(el('span', 'dn', String(d.getDate())));
    ST().exams.filter(e => e.date === k).forEach(e => c.appendChild(el('span', 'ex', e.name)));
    const ds = el('div', 'ds');
    S.items.filter(t => t.due && t.due.slice(0, 10) === k && !t.rid).slice(0, 4).forEach(() => { const x = el('i'); x.style.background = 'var(--pink)'; ds.appendChild(x); });
    ST().mats.filter(m => m.kind === 'hw' && m.due === k && m.units.some(u => !u.done)).forEach(() => { const x = el('i'); x.style.background = 'var(--yel)'; ds.appendChild(x); });
    if ((S.reps || []).some(r => !r.days.length || r.days.includes(d.getDay()))) { const x = el('i'); x.style.background = '#7fb6ff'; ds.appendChild(x); }
    c.appendChild(ds);
    const D = pm[k], lg = (ST().log[k] || []).reduce((a, b) => a + b.mins, 0), mins = (D ? D.mins : 0) + lg;
    if (mins) { const sb = el('div', 'sb'), bb = el('b'); bb.style.width = Math.min(100, mins / 300 * 100) + '%'; sb.appendChild(bb); c.appendChild(sb); }
    c.onclick = () => { calSel = k; refreshSheet(); };
    G.appendChild(c);
  }
  B.appendChild(G);
  B.appendChild(el('div', 'hint', '분홍 일정 · 노랑 숙제 · 파랑 학원 · 빨강 시험 · 청록 막대 = 공부량'));
  const d = pDate(calSel), k = calSel, L = el('div', 'card dlist'); L.style.marginTop = '10px';
  L.appendChild(el('b', null, `${d.getMonth() + 1}/${d.getDate()} (${WD[d.getDay()]})`));
  const rows = [];
  ST().exams.filter(e => e.date === k).forEach(e => rows.push(['시험', `${e.name} · ${exSubs(e).join('·')}`, 0]));
  S.items.filter(t => t.due && t.due.slice(0, 10) === k).sort((a, b) => a.due.localeCompare(b.due)).forEach(t => rows.push([t.due.slice(11, 16), t.text + (t.done ? ' ✓' : ''), toM(t.due.slice(11, 16))]));
  if (!S.items.some(t => t.rid && t.due && t.due.slice(0, 10) === k)) (S.reps || []).filter(r => !r.days.length || r.days.includes(d.getDay())).forEach(r => rows.push([r.time, r.text, toM(r.time)]));
  ST().mats.filter(m => m.kind === 'hw' && m.due === k).forEach(m => rows.push(['학원', `${m.sub} 숙제 검사: ${m.title}`, -1]));
  (ST().log[k] || []).forEach(l => rows.push([toT(l.s), `✓ ${l.sub} ${l.label}`, l.s]));
  (pm[k] ? pm[k].blocks : []).forEach(b => rows.push([toT(b.s), `${b.sub} · ${b.parts.map(p => p.t.label).join(' / ')}`, b.s]));
  rows.sort((a, b) => a[2] - b[2]).forEach(([t, x]) => { const r = el('div', 'r'); r.append(el('b', null, t), document.createTextNode(x)); L.appendChild(r); });
  if (!rows.length) L.appendChild(el('div', 'hint', '이날은 비어 있어요.'));
  B.appendChild(L);
  const c = el('div', 'card'), t = inp('text', '이날 일정 붙이기 (예: 수행평가)'), tm = inp('time', '', ''); c.style.marginTop = '10px'; tm.style.maxWidth = '120px';
  c.append(row(t, tm), row(btn('붙이기', 'wide', () => { const v = t.value.trim(); if (!v) return; addItem(v, `${k}T${tm.value || '09:00'}`); save(); pushSync(true); dirty(); refreshSheet(); renderHome(); toast('붙였어요.'); })));
  B.appendChild(c);
}

// ---------- 6 공부 ----------
let sub = 'today', ed = -1, edMode = '', addOpen = false, formOpen = false, openMat = null, preEd = null;
SH[6] = {
  t: '공부',
  s: () => { const e = nextExam(); if (!e) return `${curPre().name} 카드로 짜는 중`; const dd = dTo(e.date); return `${e.name} ${dd ? 'D-' + dd : 'D-DAY'} · ${phaseOf(dd)[0]}`; },
  r: B => {
    const T = el('div', 'tabs'); [['today', '오늘'], ['exam', '시험'], ['mat', '과목·교재']].forEach(([v, l]) => { const b = el('button', sub === v ? 'on' : '', l); b.onclick = () => { sub = v; ed = -1; addOpen = formOpen = false; preEd = null; refreshSheet(); }; T.appendChild(b); }); B.appendChild(T);
    ({ today: stToday, exam: stExam, mat: stMat })[sub](B);
  }
};
// D-day 띠: 시험까지 남은 날 + 단계를 전화선으로
function dStrip(B) {
  const e = nextExam(), w = el('div', 'dstrip'), top = el('div', 'top');
  if (!e) { const nm = el('div', 'nm'); nm.append(document.createTextNode('다가오는 시험'), el('b', null, '아직 없어요')); top.append(nm, btn('시험 넣기', 'teal', () => { sub = 'exam'; formOpen = true; refreshSheet(); })); w.append(top, el('p', null, '시험을 넣으면 3주 전부터 회독 단계로 나눠 넣어요. 지금은 교재 진도만 고르게 짜요.')); B.appendChild(w); return; }
  const dd = dTo(e.date), nm = el('div', 'nm'); nm.append(document.createTextNode(`${e.date.slice(5).replace('-', '/')} 시험까지`), el('b', null, e.name));
  top.append(nm, el('div', 'dd', dd ? `D-${dd}` : 'D-DAY')); w.appendChild(top);
  const C = el('div', 'cord'), stages = [['3주 전', 21], ['2주 전', 14], ['1주 전', 7], ['전날', 1]], cur = stages.findIndex(([, n], k) => dd <= n && (k === 3 || dd > stages[k + 1][1]));
  const on = el('i', 'on'); on.style.width = cur < 0 ? '0' : `${Math.min(88, 6 + cur * 29.3)}%`; C.appendChild(on);
  stages.forEach(([n], k) => C.appendChild(el('span', k < cur ? 'past' : k === cur ? 'cur' : '', n)));
  w.append(C, el('p', null, phaseOf(dd)[1])); B.appendChild(w);
}
// 공부량 카드(전화카드 모양): 누르면 바로 쓰고, 고치기로 내용 바꾸기
function cardRow(B) {
  const st = ST(), R = el('div', 'cards');
  st.presets.forEach(p => { const c = el('button', 'pcard' + (p.id === st.pref.preset ? ' on' : '')); c.style.setProperty('--c', p.c); c.append(el('b', null, p.name), el('small', null, `평일 ${hm(p.wd)}\n주말 ${hm(p.we)}`), el('i', 'ic')); c.querySelector('small').style.whiteSpace = 'pre-line';
    c.onclick = () => { if (p.id === st.pref.preset) { preEd = preEd === p.id ? null : p.id; refreshSheet(); return; } usePre(p); delete st.fix[todayK()]; ed = -1; preEd = null; save(); dirty(); pushSync(true); refreshSheet(); toast(`${p.name} 카드로 다시 짰어요.`); }; R.appendChild(c); });
  const E = el('button', 'pcard edit', preEd ? '닫기' : '✎ 고치기'); E.onclick = () => { preEd = preEd ? null : st.pref.preset; refreshSheet(); }; R.appendChild(E);
  B.appendChild(R);
  if (preEd) preEditor(B, st.presets.find(p => p.id === preEd));
}
function preEditor(B, p) {
  if (!p) { preEd = null; return; }
  const st = ST(), c = el('div', 'card pedit'), apply2 = () => { if (p.id === st.pref.preset) { usePre(p); delete st.fix[todayK()]; } save(); dirty(); pushSync(true); refreshSheet(); };
  const step = (lab, key, d, lo, hi, fmt) => { const r = el('div', 'r'), S3 = el('div', 'step'), v = el('b', null, fmt(p[key])); S3.append(btn('−', 'ghost', () => { p[key] = Math.max(lo, p[key] - d); apply2(); }), v, btn('+', 'ghost', () => { p[key] = Math.min(hi, p[key] + d); apply2(); })); r.append(el('span', null, lab), S3); return r; };
  const time = (lab, key) => { const r = el('div', 'r'), i2 = inp('time', '', p[key]); i2.onchange = () => { if (i2.value) { p[key] = i2.value; apply2(); } }; r.append(el('span', null, lab), i2); return r; };
  const nm = inp('text', '카드 이름', p.name); nm.onchange = () => { p.name = nm.value.trim().slice(0, 8) || p.name; apply2(); };
  const sw = el('div', 'pills'); CARDC.forEach(col => { const b = el('button', p.c === col ? 'on' : ''); b.style.cssText = `width:36px;padding:0;background:${col};border:2px solid ${p.c === col ? '#fff' : '#000'}`; b.setAttribute('aria-label', '카드 색'); b.onclick = () => { p.c = col; apply2(); }; sw.appendChild(b); });
  const r0 = el('div', 'r'); r0.append(nm, sw); nm.style.maxWidth = '140px';
  c.append(r0, step('평일 하루 공부', 'wd', 30, 30, 600, hm), step('주말 하루 공부', 'we', 30, 30, 720, hm), time('평일 시작', 'wdS'), time('주말 시작', 'weS'), time('끝 (잘 준비)', 'end'), step('평일 과목 수', 'wdSub', 1, 1, 6, n => `${n}과목`), step('주말 과목 수', 'weSub', 1, 1, 6, n => `${n}과목`));
  const acts = [btn('새 카드 만들기', 'ghost wide', () => { if (st.presets.length >= 6) { toast('카드는 6장까지예요.'); return; } const n = { ...p, id: uid('p'), name: '내 카드', c: CARDC.find(x => !st.presets.some(q => q.c === x)) || p.c }; st.presets.push(n); preEd = n.id; save(); refreshSheet(); })];
  if (st.presets.length > 1) acts.unshift(btn('이 카드 버리기', 'ghost', () => { if (!confirm(`'${p.name}' 카드를 버릴까요?`)) return; st.presets = st.presets.filter(x => x !== p); if (st.pref.preset === p.id) usePre(st.presets[0]); preEd = null; save(); dirty(); pushSync(true); refreshSheet(); }));
  c.append(row(...acts), el('div', 'hint', '바꾸면 바로 다시 짜요. 학교·학원 시간은 1번 전단지 > 시간표에 넣으면 피해서 짜요.'));
  B.appendChild(c);
}
function stToday(B) {
  const st = ST(), P = splan(), D = P.days[0] || { blocks: [], mins: 0 }, k = todayK(), lg = st.log[k] || [], now = new Date();
  if (!subs().length) {
    dStrip(B);
    const sp = el('div', 'sheetp'); sp.append(el('i', 'tape'), el('div', 'pempty', '아직 빈 시간표예요.\n시험이나 교재를 하나 넣으면 레나가 빈 시간에 맞춰 날마다 채워요. 통화로 "기말 12월 10일, 수학 쎈 1~8단원"처럼 말해도 돼요.')); sp.lastChild.style.whiteSpace = 'pre-line'; B.appendChild(sp);
    B.appendChild(row(btn('교재 넣기', 'teal wide', () => { sub = 'mat'; formOpen = true; refreshSheet(); })));
    return;
  }
  dStrip(B); cardRow(B);
  if (P.late.length) B.appendChild(el('div', 'warn', `시간이 모자라요: ${[...new Set(P.late.map(t => t.sub))].join(', ')}. 더 큰 카드를 고르거나 카드를 고쳐서 하루 시간을 늘려요.`));
  // 종이 시간표
  const sp = el('div', 'sheetp'), tot = D.mins + lg.reduce((a, b) => a + b.mins, 0);
  sp.append(el('i', 'tape'), el('i', 'tape r'));
  const hd = el('div', 'hd'); hd.append(el('b', null, `${now.getMonth() + 1}월 ${now.getDate()}일 ${WD[now.getDay()]}요일`), el('span', null, tot ? hm(tot) : '쉬는 날')); sp.appendChild(hd);
  const first = D.blocks.length ? D.blocks[0].s : 0, lastE = D.blocks.length ? D.blocks[D.blocks.length - 1].e : 0;
  const fixd = busyOn(now).filter(([s0, e2]) => s0 < lastE && e2 > first);
  const list = [...lg.map(l => ({ s: l.s, lg: l })), ...D.blocks.map((b, i) => ({ s: b.s, b, i })), ...fixd.map(f => ({ s: f[0], fx: f }))].sort((a, b) => a.s - b.s);
  const subWord = (sb, txt) => { const w = el('span'), i2 = el('i', null, sb); i2.style.setProperty('--c', colOf(sb)); w.append(i2, document.createTextNode(txt)); return w; };
  list.forEach(x => {
    if (x.fx) { const r = el('div', 'pr fx'); r.append(el('span', 't', toT(x.fx[0])), el('span', 'w', `${x.fx[2] || '일정'} ~${toT(x.fx[1])}`)); sp.appendChild(r); return; }
    if (x.lg) { const r = el('div', 'pr done'), t = el('span', 't'); t.append(document.createTextNode(toT(x.lg.s)), el('small', null, `${x.lg.mins}분`)); const w = el('span', 'w'); w.appendChild(subWord(x.lg.sub, x.lg.label)); r.append(t, w, el('span', 'st', '끝')); sp.appendChild(r); return; }
    const b = x.b, i = x.i, r = el('div', 'pr' + (ed === i ? ' ed' : '')), t = el('span', 't'); t.append(document.createTextNode(toT(b.s)), el('small', null, `${b.e - b.s}분`));
    const w = el('button', 'w'); w.appendChild(subWord(b.sub, b.parts.map(p => p.t.label).join(' + '))); w.onclick = () => { ed = ed === i ? -1 : i; edMode = ''; addOpen = false; refreshSheet(); };
    const ok = el('button', 'st'); ok.setAttribute('aria-label', '끝냄'); ok.onclick = () => { finishBlock(b); ed = -1; refreshSheet(); toast('한 블록 끝! 동전 +1'); };
    r.append(t, w, ok); sp.appendChild(r);
    if (ed === i) sp.appendChild(editRow(i));
  });
  if (!list.length) sp.appendChild(el('div', 'pempty', '오늘은 남은 공부가 없어요. 빈 시간이 없거나 다 끝냈어요.'));
  if (addOpen) { const w = el('div', 'ptools'); w.appendChild(el('div', 'q', '어떤 과목 블록을 더 넣을까요?')); w.appendChild(pills(subs().map(x => [x, x]), '', sb => { const F = freeze(), P2 = st.pref, n = new Date(), nowM = Math.ceil((n.getHours() * 60 + n.getMinutes()) / 10) * 10, we = n.getDay() === 0 || n.getDay() === 6, s0 = Math.max(nowM, toM(we ? P2.weS : P2.wdS), F.length ? F[F.length - 1].e + 10 : 0); F.push({ s: s0, e: s0 + P2.block, sub: sb, parts: nextOf(sb, P2.block) }); addOpen = false; commit(); })); sp.appendChild(w); }
  sp.appendChild(Object.assign(el('button', 'padd', addOpen ? '닫기' : '+ 블록 더 넣기'), { onclick: () => { addOpen = !addOpen; ed = -1; refreshSheet(); } }));
  sp.appendChild(el('div', 'pfoot', st.fix[k] ? '직접 고친 시간표예요.' : `줄을 누르면 시간·순서·과목을 바꿔요. 50분 공부하고 10분 쉬어요.`));
  B.appendChild(sp);
  if (st.fix[k]) B.appendChild(row(btn('레나가 다시 짜기', 'ghost wide', () => { delete st.fix[k]; ed = -1; save(); dirty(); pushSync(true); refreshSheet(); })));
}
function editRow(i) {
  const w = el('div', 'ptools'), go = fn => () => { const F = freeze(); if (!F[i]) return; fn(F, F[i]); commit(); };
  if (edMode === 'sub') { w.appendChild(el('div', 'q', '어떤 과목으로 바꿀까요?')); w.appendChild(pills(subs().map(x => [x, x]), '', sb => go((F, b) => { b.sub = sb; b.parts = nextOf(sb, b.e - b.s); edMode = ''; })())); return w; }
  const B2 = (t, fn, c) => { const b = el('button', c || '', t); b.onclick = fn; return b; };
  w.append(
    B2('−10분', go((F, b) => { if (b.e - b.s > 20) resize(b, b.e - b.s - 10); })),
    B2('+10분', go((F, b) => { if (b.e - b.s < 120) resize(b, b.e - b.s + 10); })),
    B2('↑ 앞으로', go((F, b) => { if (i > 0) { const a = F[i - 1]; [a.sub, b.sub] = [b.sub, a.sub]; [a.parts, b.parts] = [b.parts, a.parts]; ed = i - 1; } })),
    B2('↓ 뒤로', go((F, b) => { if (i < F.length - 1) { const a = F[i + 1]; [a.sub, b.sub] = [b.sub, a.sub]; [a.parts, b.parts] = [b.parts, a.parts]; ed = i + 1; } })),
    B2('과목 바꾸기', () => { edMode = 'sub'; refreshSheet(); }),
    B2('빼기', go(F => { F.splice(i, 1); ed = -1; }), 'del'));
  return w;
}
const xbtnS = fn => { const b = el('button', 'x', '×'); b.onclick = fn; b.setAttribute('aria-label', '지우기'); return b; };
function stExam(B) {
  const today = todayK(), E = ST().exams.filter(e => e.date >= today).sort((a, b) => a.date.localeCompare(b.date));
  E.forEach((e, n) => {
    const dd = dTo(e.date), c = el('div', 'mat'), h = el('div', 'h'), ch = el('span', 'chip', dd ? `D-${dd}` : 'D-DAY'); ch.style.background = dd <= 7 ? 'var(--hot)' : 'var(--yel)';
    h.append(ch, el('b', null, `${e.name} · ${e.date.slice(5).replace('-', '/')}`), xbtnS(() => { if (!confirm(`'${e.name}' 지울까요?`)) return; ST().exams = ST().exams.filter(x => x !== e); save(); dirty(); refreshSheet(); })); c.appendChild(h);
    const sp = el('div', 'hint'); exSubs(e).forEach(s => sp.append(chip(s), document.createTextNode(' '))); c.appendChild(sp);
    e.ranges.forEach(r => { const m = matOf(r.mat); if (m) c.appendChild(el('div', 'hint', `${m.title} ${m.units[r.from] ? m.units[r.from].name : ''}~${m.units[r.to] ? m.units[r.to].name : ''}`)); });
    if (n === 0) { // 블로그 주차별 계획을 날짜로
      const W = el('div', 'wkl'), d0 = pDate(e.date), md = x => `${x.getMonth() + 1}/${x.getDate()}`, cur = phaseOf(dd)[0];
      [['3주 전', -21, -15, 21], ['2주 전', -14, -8, 14], ['1주 전', -7, -2, 7], ['시험 전날', -1, -1, 1]].forEach(([nm, a, b, pd]) => { if (dkey(dAdd(d0, b)) < today) return; const r = el('div', nm === cur || (nm === '시험 전날' && cur === '시험 전날') ? 'now' : ''); r.append(el('b', null, `${nm}  ${a === b ? md(dAdd(d0, a)) : `${md(dAdd(d0, a))}~${md(dAdd(d0, b))}`}`), document.createTextNode(phaseOf(pd)[1])); W.appendChild(r); });
      c.appendChild(W);
    }
    B.appendChild(c);
  });
  if (!E.length && !formOpen) B.appendChild(el('div', 'hint', '시험을 넣으면 3주 전부터 회독 단계를 나눠서 날마다 넣어요.'));
  if (!formOpen) { B.appendChild(row(btn('+ 시험 넣기', 'teal wide', () => { formOpen = true; refreshSheet(); }))); return; }
  const f = el('div', 'card frm'), nm = inp('text', '시험 이름 (예: 2학기 기말)'), dt = inp('date', '', ''); let sel = [];
  const sp = el('div', 'pills'); [...new Set([...subs(), ...SUBP])].forEach(s => { const b = el('button', null, s); b.onclick = () => { sel = sel.includes(s) ? sel.filter(x => x !== s) : [...sel, s]; b.classList.toggle('on'); }; sp.appendChild(b); });
  const R = el('div', 'frm'), ranges = [];
  const addR = () => { const books = ST().mats.filter(m => m.kind === 'book'); if (!books.length) { toast('문제집은 "과목·교재"에서 먼저 넣어요.'); return; } const ms = el('select', 'in'), fr = el('select', 'in'), to = el('select', 'in');
    books.forEach(m => ms.appendChild(Object.assign(document.createElement('option'), { value: m.id, textContent: `${m.sub} · ${m.title}` })));
    const fill = () => { const m = matOf(ms.value); fr.innerHTML = to.innerHTML = ''; (m ? m.units : []).forEach((u, i) => { fr.appendChild(Object.assign(document.createElement('option'), { value: i, textContent: u.name })); to.appendChild(Object.assign(document.createElement('option'), { value: i, textContent: u.name })); }); to.value = Math.max(0, (m ? m.units.length : 1) - 1); };
    ms.onchange = fill; fill(); ranges.push({ ms, fr, to }); R.append(row(ms), row(fr, el('span', 'hint', '~'), to)); };
  f.append(row(nm), row(el('span', 'hint', '시험 날'), dt), el('div', 'hint', '시험 과목 (여러 개)'), sp, R, row(btn('+ 문제집 범위 (선택)', 'ghost wide', addR)), row(btn('취소', 'ghost', () => { formOpen = false; refreshSheet(); }), btn('넣기', 'teal wide', () => {
    if (!nm.value.trim() || !dt.value) { toast('시험 이름과 날짜를 넣어 주세요.'); return; }
    const rg = ranges.map(o => ({ mat: o.ms.value, from: Math.min(+o.fr.value, +o.to.value), to: Math.max(+o.fr.value, +o.to.value) }));
    if (!sel.length && !rg.length) { toast('시험 과목을 하나 이상 골라 주세요.'); return; }
    addExam({ name: nm.value.trim(), date: dt.value, subs: sel, ranges: rg }); formOpen = false; dirty(); pushSync(true); refreshSheet(); toast('넣었어요. 3주 전부터 회독 단계로 나눠 짤게요.'); })));
  B.appendChild(f);
}
function stMat(B) {
  ST().mats.slice().sort((a, b) => a.sub.localeCompare(b.sub)).forEach(m => {
    const c = el('div', 'mat'), h = el('div', 'h'), dn = m.units.filter(u => u.done).length;
    h.append(chip(m.sub), el('b', null, (m.kind === 'hw' ? '숙제 · ' : '') + m.title), el('em', null, m.kind === 'hw' ? (m.due ? `학원 ${m.due.slice(5).replace('-', '/')}` : '') : `${dn}/${m.units.length}`), xbtnS(() => { if (!confirm(`'${m.title}' 지울까요?`)) return; ST().mats = ST().mats.filter(x => x !== m); ST().exams.forEach(e => e.ranges = e.ranges.filter(r => r.mat !== m.id)); save(); dirty(); refreshSheet(); }));
    const pg = el('div', 'pg'), i = el('i'); i.style.width = (dn / m.units.length * 100) + '%'; pg.appendChild(i); c.append(h, pg);
    c.onclick = ev => { if (ev.target.closest('.x') || ev.target.closest('.us') || ev.target.closest('.row')) return; openMat = openMat === m.id ? null : m.id; refreshSheet(); };
    if (openMat === m.id) {
      const U = el('div', 'us'); m.units.forEach(u => { const b = el('button', u.done ? 'd' : '', u.name); b.onclick = () => { u.done = !u.done; u.prog = u.done ? u.mins : 0; save(); dirty(); refreshSheet(); }; U.appendChild(b); }); c.appendChild(U);
      const mi = inp('number', '분', String(m.units[0] ? m.units[0].mins : 40)); mi.style.maxWidth = '80px';
      c.appendChild(row(el('span', 'hint', m.kind === 'hw' ? '걸리는 분' : '하나에 걸리는 분'), mi, btn('바꾸기', 'ghost', () => { const v = Math.max(10, Math.min(240, +mi.value || 40)); m.units.forEach(u => u.mins = v); save(); dirty(); refreshSheet(); toast(`${v}분으로 다시 짰어요.`); })));
    }
    B.appendChild(c);
  });
  if (ST().mats.length && !formOpen) B.appendChild(el('div', 'hint', '누르면 단원이 펼쳐져요. 끝낸 단원을 누르면 체크돼요.'));
  if (!ST().mats.length && !formOpen) B.appendChild(el('div', 'hint', '문제집·교과서·학원 숙제를 넣으면 진도에 맞춰 나눠 넣어요.'));
  if (!formOpen) { B.appendChild(row(btn('+ 교재·숙제 넣기', 'teal wide', () => { formOpen = true; refreshSheet(); }))); return; }
  const f = el('div', 'card frm'); let kind = 'book', ul = '단원', sb = '';
  const sbIn = inp('text', '과목 직접 쓰기'), tt = inp('text', ''), a = inp('number', '시작', '1'), z = inp('number', '끝', '12'), ch = inp('number', '쪽씩', '10'), mn = inp('number', '분', '40'), du = inp('date', '', '');
  const kinds = el('div'), sp = el('div', 'pills'), box = el('div', 'frm');
  const draw = () => {
    kinds.innerHTML = ''; kinds.appendChild(pills([['book', '문제집·교재'], ['hw', '학원 숙제']], kind, v => { kind = v; draw(); }));
    sp.innerHTML = ''; [...new Set([...subs(), ...SUBP])].forEach(s => { const b = el('button', sb === s ? 'on' : '', s); b.onclick = () => { sb = s; sbIn.value = ''; draw(); }; sp.appendChild(b); });
    box.innerHTML = '';
    if (kind === 'book') { tt.placeholder = '이름 (예: 쎈 수학)'; box.append(pills([['단원', '단원'], ['쪽', '쪽']], ul, v => { ul = v; draw(); }), row(a, el('span', 'hint', '~'), z, ...(ul === '쪽' ? [ch] : [])), row(el('span', 'hint', ul === '쪽' ? '한 덩어리' : '한 단원'), mn, el('span', 'hint', '분'))); }
    else { tt.placeholder = '숙제 (예: 단어 Day 5~6)'; box.append(row(el('span', 'hint', '걸리는 시간'), mn, el('span', 'hint', '분')), row(el('span', 'hint', '다음 학원 날'), du)); }
  };
  f.append(kinds, sp, row(sbIn), row(tt), box, row(btn('취소', 'ghost', () => { formOpen = false; refreshSheet(); }), btn('넣기', 'teal wide', () => {
    const s = sbIn.value.trim() || sb; if (!s || !tt.value.trim()) { toast('과목과 이름을 넣어 주세요.'); return; }
    if (kind === 'hw' && !du.value) { toast('학원 숙제는 다음 학원 날을 넣어 주세요.'); return; }
    const m = addMat({ sub: s, title: tt.value.trim(), kind, from: +a.value || 1, to: +z.value || +a.value || 1, chunk: +ch.value, mins: +mn.value || 40, unit: ul, due: kind === 'hw' ? du.value : '' }); formOpen = false; dirty(); pushSync(true); refreshSheet(); toast(`${m.sub} · ${m.title} 넣었어요.`); })));
  draw(); B.appendChild(f);
}

// ---------- 오늘 브리핑에 공부 덧붙이기 ----------
if (SH.brief) { const _r = SH.brief.r; SH.brief.r = B => { _r(B); try { const D = splan().days[0]; if (!D || !D.blocks.length) return; const w = B.querySelector('.brief'); const s = el('div', 'bsec'); s.appendChild(el('h5', null, `오늘 공부 ${hm(D.mins)}`)); D.blocks.slice(0, 4).forEach(b => { const r = el('div', 'r'); r.append(el('b', null, toT(b.s)), document.createTextNode(`${b.sub} · ${b.parts.map(p => p.t.label).join(' / ')}`)); s.appendChild(r); }); s.appendChild(row(btn('6 공부 보기', 'ghost wide', () => { sub = 'today'; openSheet(6); }))); w && w.appendChild(s); } catch (e) {} }; }

// ---------- 알림: 오늘 공부 블록 시작 ----------
const _plan = window.plan; window.plan = function () {
  const p = _plan(); try { const now = Date.now(), add = []; splan().days.slice(0, 2).forEach(D => D.blocks.forEach(b => { const at = new Date(pDate(D.k)); at.setHours(0, b.s, 0, 0); if (at.getTime() > now) add.push({ id: `st_${D.k}_${b.s}`, at: at.getTime(), body: `${nmc()}${b.sub} 시간이에요. ${b.parts[0].t.label}${b.parts.length > 1 ? ' 외' : ''} (${b.e - b.s}분)` }); })); p.reminders = p.reminders.concat(add).sort((a, b) => a.at - b.at).slice(0, 180); } catch (e) {}
  return p;
};

// ---------- Gemini: 말로 넣기 ----------
const _sys = sysPrompt; sysPrompt = function (sp) {
  const s = _sys(sp), st = ST();
  return s.replace('JSON만 출력:', `- 공부: 교재·문제집(몇 단원/몇 쪽), 학원 숙제, 시험 날짜·과목·범위를 말하면 study에 넣는다. study={"mats":[{"sub":"과목","title":"교재 이름","kind":"book|hw","from":1,"to":12,"unit":"단원|쪽","chunk":쪽일 때 덩어리 쪽수,"mins":단원 하나 걸리는 분(모르면 40),"due":"YYYY-MM-DD 숙제면 다음 학원 날"}],"exams":[{"name":"시험 이름","date":"YYYY-MM-DD","subs":["과목"],"ranges":[{"sub":"과목","title":"교재 이름","from":시작 번호,"to":끝 번호}]}]}. 교재가 이미 있으면 mats에 다시 넣지 않는다. 계획은 앱이 시험 3주 전부터 회독 단계로 빈 시간에 짠다(6번 공부).
지금 공부 목록: ${JSON.stringify(st.mats.map(m => `${m.sub}/${m.title}(${m.kind === 'hw' ? '숙제' : m.units.length + '개'}, 남은 ${m.units.filter(u => !u.done).length})`).slice(0, 20))} 시험: ${JSON.stringify(st.exams.map(e => `${e.name} ${e.date} ${exSubs(e).join('·')}`))}
JSON만 출력:`).replace(/"follow":\[\]\}/, '"follow":[],"study":{"mats":[],"exams":[]}}');
};
const _ap = apply; apply = function (r) {
  const res = _ap(r), x = r && r.study, got = [];
  if (x && typeof x === 'object') {
    (x.mats || []).forEach(o => { if (!o || !o.title) return; if (ST().mats.some(m => m.title === o.title && m.sub === (o.sub || m.sub) && m.kind === (o.kind === 'hw' ? 'hw' : 'book'))) return; const m = addMat({ ...o, unit: o.unit === '쪽' ? '쪽' : '단원' }); got.push(`${m.sub} ${m.title}`); });
    (x.exams || []).forEach(o => { if (!o || !o.name || !/^\d{4}-\d\d-\d\d$/.test(o.date || '')) return; const ranges = (o.ranges || []).map(rg => { if (!rg || !rg.title) return null; let m = ST().mats.find(mm => mm.kind === 'book' && mm.title === rg.title) || ST().mats.find(mm => mm.kind === 'book' && (mm.title.includes(rg.title) || rg.title.includes(mm.title))); if (!m) m = addMat({ sub: rg.sub, title: rg.title, kind: 'book', from: 1, to: +rg.to || 1 }); const fi = Math.max(0, m.units.findIndex(u => u.n === +rg.from)), ti = m.units.findIndex(u => u.n === +rg.to); return { mat: m.id, from: fi, to: ti < 0 ? m.units.length - 1 : ti }; }).filter(Boolean); addExam({ name: o.name, date: o.date, subs: [...(o.subs || []), ...(o.ranges || []).map(rg => rg && rg.sub).filter(Boolean)], ranges }); got.push(`시험 ${o.name}`); });
  }
  if (!got.length) return res;
  dirty(); save(); pushSync(true);
  const txt = `공부에 넣음: ${got.join(', ')} · 6번 공부에서 확인`;
  if (res) { res.querySelector('span').textContent += ' · ' + txt; return res; } return noteEl(txt);
};
window.lenaStudy = { usePre, plan: () => splan(), simulate, freeIv, addMat, addExam, finishBlock, dirty, freeze, phaseOf };
})();
