// 공부 (다이얼 4, 시트 id 6): 시험 3주 전부터 회독 단계(블로그 방식) · 평일 2과목/주말 3~4과목 · 빈 시간에 50분 블록 · 블록을 눌러 간단히 조정
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
.cal .ex{align-self:flex-start;font-size:10.5px;font-weight:900;line-height:1.5;color:#fff;background:var(--hot);border-radius:4px;padding:0 4px;white-space:nowrap}
.cal button.exd{border-color:rgba(255,46,110,.7)}
.cal .ds{display:flex;gap:2px;flex-wrap:wrap}.cal .ds i{width:6px;height:6px;border-radius:50%}
.cal .sb{position:absolute;left:3px;right:3px;bottom:3px;height:4px;border-radius:2px;background:rgba(255,255,255,.08);overflow:hidden}.cal .sb b{display:block;height:100%;background:var(--teal)}
.calh{display:flex;align-items:center;justify-content:space-between;margin-bottom:8px}
.calh b{font-family:'Black Han Sans';font-weight:400;font-size:20px}
.calh .btn{height:36px;padding:0 12px}
.dlist .r{display:flex;gap:10px;align-items:baseline;padding:6px 0;border-bottom:1px dashed rgba(255,255,255,.07);font-size:14px}
.dlist .r b{flex:none;width:46px;font-family:'Space Mono',monospace;font-size:12px;color:var(--yel)}
.sj{display:inline-block;flex:none;font-size:11.5px;font-weight:800;color:#111;border-radius:6px;padding:1px 7px;border:1.5px solid #000;vertical-align:1px}
/* 6 공부: 부스 유리에 붙은 전단지 + 레나 쪽지 + 구겨진 종이 시간표 (앱의 .fly/.ask/.fslip 말투 그대로) */
.dfly{position:relative;margin:14px 6px 16px;padding:18px 16px 14px;color:#fff;background:url(assets/lena/paper_pink.webp) center/100% 100%;filter:drop-shadow(3px 4px 0 rgba(0,0,0,.6));transform:rotate(.8deg)}
.dfly .tp{position:absolute;left:50%;top:-10px;width:78px;height:20px;margin-left:-39px;background:url(assets/lena/tape_white.webp) 0 0/100% 100%;transform:rotate(-4deg)}
.dfly .dtop{display:flex;align-items:flex-end;justify-content:space-between;gap:10px}
.dfly small{display:block;font-family:'Space Mono',monospace;font-size:11px;font-weight:700;opacity:.9}
.dfly .dnm{font-size:17px;font-weight:900;line-height:1.3;margin-top:2px;word-break:keep-all}
.dfly .ddn{flex:none;font-family:'Black Han Sans';font-size:32px;line-height:1;color:#fff;text-shadow:3px 3px 0 #000;padding-right:2px}
.dfly .stg{display:flex;gap:5px;margin-top:12px}
.dfly .stg span{flex:1;height:30px;display:grid;place-items:center;border-radius:7px;font-size:12px;font-weight:800;background:rgba(0,0,0,.22);color:rgba(255,255,255,.75)}
.dfly .stg span.past{background:rgba(0,0,0,.4);color:rgba(255,255,255,.45);text-decoration:line-through}
.dfly .stg span.cur{background:#fff;color:#111;border:2px solid #000;box-shadow:2px 2px 0 #000}
.dfly p{font-size:13.5px;font-weight:700;line-height:1.45;margin-top:10px;word-break:keep-all}
.dfly.none{background-image:url(assets/lena/paper_teal.webp);color:#111;padding-bottom:44px}.dfly .ddn em{font-style:normal;font-size:.9em;margin-right:1px}
.dfly.none .ddn{color:var(--yel);font-size:30px}
.lena{margin:0 2px 14px}
.lena .lbtn{display:flex;gap:6px;margin-top:10px}.lena .lbtn .btn{flex:1 1 auto;height:40px;padding:0 8px;font-size:13px}.lena .lbtn .btn.teal{flex:1.4 1 auto}
.lena .lsub{display:block;font-size:12px;font-weight:600;opacity:.6;margin-top:6px}
.sheetp{position:relative;margin:16px 4px 8px;padding:22px 14px 12px;color:#17181a;background:linear-gradient(rgba(243,239,230,.62),rgba(243,239,230,.62)),#f3efe6 url(assets/lena/paper_white.webp) center/cover;border-radius:3px;box-shadow:4px 5px 0 rgba(0,0,0,.55);transform:rotate(-.5deg)}
.sheetp>.tape{position:absolute;top:-11px;left:24px;width:80px;height:22px;background:url(assets/lena/tape_teal1.webp) 0 0/100% 100%;transform:rotate(-5deg)}
.sheetp>.tape.r{left:auto;right:20px;background-image:url(assets/lena/tape_yellow.webp);transform:rotate(5deg)}
.sheetp .hd{display:flex;align-items:baseline;justify-content:space-between;gap:8px;padding:0 2px 8px;border-bottom:2px solid #17181a}
.sheetp .hd b{font-family:'Black Han Sans';font-weight:400;font-size:21px}
.sheetp .hd span{font-family:'Space Mono',monospace;font-size:13px;font-weight:700;background:linear-gradient(transparent 50%,rgba(242,234,58,.9) 50%);padding:0 3px}
.pr{position:relative;display:flex;align-items:center;gap:8px;min-height:58px;border-bottom:1.5px dashed rgba(0,0,0,.2)}
.pr .t{flex:none;width:48px;font-family:'Space Mono',monospace;font-size:13px;font-weight:700;line-height:1.25}.pr .t small{display:block;font-size:10.5px;opacity:.55}
.pr .w{flex:1;min-width:0;min-height:48px;text-align:left;font-size:15px;font-weight:700;line-height:1.4;color:inherit;padding:4px 2px;word-break:keep-all}
.pr .w i{font-style:normal;font-weight:900;margin-right:6px;padding:0 2px;background:linear-gradient(transparent 52%,var(--c) 52%)}
.pr .st{flex:none;width:46px;height:46px;border-radius:50%;border:2px solid #000;background:#fff;box-shadow:2px 2px 0 #000;display:grid;place-items:center}
.pr .st img{width:40px;height:40px}
.pr.done .w{color:rgba(0,0,0,.45);text-decoration:line-through;text-decoration-color:rgba(0,0,0,.35)}
.pr.done .st{border:0;background:none;box-shadow:none;transform:rotate(-12deg)}
.pr.pfx{min-height:36px;color:rgba(0,0,0,.45);font-size:13px}.pr.pfx .w{min-height:0;font-size:13px;font-weight:600}
.pr.ed{background:rgba(47,224,200,.22);margin:0 -8px;padding:0 8px;border-radius:6px}
.ptools{display:flex;flex-wrap:wrap;gap:6px;padding:8px 0 10px;border-bottom:1.5px dashed rgba(0,0,0,.2)}
.ptools button{flex:1 0 auto;min-width:62px;height:44px;padding:0 10px;border-radius:10px;background:#fff;color:#111;border:2px solid #000;box-shadow:2px 2px 0 #000;font-size:13.5px;font-weight:800}
.ptools button.del{background:var(--hot);color:#fff}
.ptools .q{flex-basis:100%;font-size:12.5px;color:rgba(0,0,0,.6)}
.ptools .pills{flex-basis:100%}.ptools .pills button{flex:none;min-width:0;height:40px}
.padd{display:block;width:100%;height:48px;text-align:left;padding-left:56px;font-size:14px;font-weight:800;color:rgba(0,0,0,.5)}
.pfoot{font-size:12px;color:rgba(0,0,0,.5);padding:6px 2px 2px;line-height:1.5;word-break:keep-all}
.pempty{padding:18px 4px;font-size:14px;color:rgba(0,0,0,.6);line-height:1.6;white-space:pre-line}
.pedit .r{display:flex;align-items:center;gap:8px;min-height:52px;border-bottom:1px solid var(--line)}
.pedit .r>span{flex:1;font-size:14px}
.step{display:flex;align-items:center;gap:4px}.step .btn{width:44px;height:40px;padding:0;font-size:18px}
.step b{min-width:84px;text-align:center;font-family:'Space Mono',monospace;font-size:13px}
.pedit input.in{max-width:130px}
.warn{padding:9px 12px;border-radius:12px;background:rgba(255,46,110,.13);border:1px solid rgba(255,46,110,.5);font-size:13px;line-height:1.5;margin-bottom:10px;word-break:keep-all}
.mat{padding:10px 12px;border-radius:14px;background:var(--panel2);border:1px solid var(--line);margin-bottom:8px}
.mat .h{display:flex;gap:8px;align-items:center}.mat .h b{flex:1;min-width:0;font-size:14.5px}.mat .h em{font-style:normal;font-family:'Space Mono',monospace;font-size:12px;color:var(--mute)}
.mat .pg{height:5px;border-radius:3px;background:#0b0d10;margin-top:8px;overflow:hidden}.mat .pg i{display:block;height:100%;background:var(--teal)}
.mat .us{display:flex;flex-wrap:wrap;gap:5px;margin-top:9px}
.mat .us button{height:32px;padding:0 10px;border-radius:16px;border:1px solid var(--line);font-size:12.5px;color:#cdd6da}
.mat .us button.d{background:var(--teal);color:#000;border-color:var(--teal)}
.frm{display:flex;flex-direction:column;gap:8px}
.wkl{display:flex;flex-direction:column;gap:10px;margin:14px 0 2px}
.wkl div{display:flex;gap:10px;align-items:flex-start;font-size:13px;line-height:1.5;color:#d7dee1;word-break:keep-all}
.wkl b{flex:none;width:92px;padding:3px 0;text-align:center;border-radius:7px;background:#0b0d10;border:1px solid var(--line);font-size:12px;font-weight:800;color:var(--mint)}
.wkl div.now b{background:var(--pink);color:#fff;border:2px solid #000;box-shadow:2px 2px 0 #000}
`;
document.head.appendChild(Object.assign(document.createElement('style'), { textContent: css }));

// ---------- 데이터 ----------
const ST = () => { if (!S.study) S.study = {}; const s = S.study; s.mats = s.mats || []; s.exams = s.exams || []; s.log = s.log || {}; s.rev = s.rev || {}; s.fix = s.fix || {}; s.revq = s.revq || []; s.pl = s.pl || {};
  if (s.pref && s.pref.preset) { delete s.pref.preset; s.pref.wdMax = 0; s.pref.weMax = 0; delete s.presets; } // v54: 카드(프리셋) 없앰 → 자동
  s.pref = Object.assign({ wdS: '17:00', weS: '10:00', end: '23:00', wdMax: 0, weMax: 0, block: 50, wdSubs: 2, weSubs: 4, focus: null }, s.pref || {}); return s; };
// 하루 최대(자동): 그날 빈 시간의 75%, 평일 4시간·주말 7시간까지. 직접 정하면(wdMax/weMax) 그 값.
const AUTO_CAP = [240, 420];
// 최근 7일 계획 대비 실제로 한 비율(최근에 덜 했으면 평소 양을 줄인다)
function keepRate() { const st = ST(); let P = 0, D = 0; for (let i = 1; i <= 7; i++) { const k = dkey(dAdd(new Date(), -i)); if (!st.pl[k]) continue; P += st.pl[k]; D += (st.log[k] || []).reduce((a, b) => a + b.mins, 0); } return P >= 60 ? Math.min(1, D / P) : null; }
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
const chip = sub => { const c = el('span', 'sj', sub); c.style.background = colOf(sub); return c; };
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
  const fm = new Map(), freeMin = x => { const kk = dkey(x); if (!fm.has(kk)) fm.set(kk, freeIv(x, false).reduce((a, [p1, p2]) => a + p2 - p1, 0)); return fm.get(kk); };
  const dmax = x => { const we = x.getDay() === 0 || x.getDay() === 6, u = we ? P.weMax : P.wdMax; return u || Math.min(AUTO_CAP[we ? 1 : 0], Math.floor(freeMin(x) * .75 / 10) * 10); };
  const kr = keepRate(), habit = we => Math.round((we ? 120 : 90) * (kr == null ? 1 : Math.max(.6, kr + .15)) / 10) * 10, adj = st.adj && st.adj.d === dkey(today) ? st.adj.mul : 1, focus = P.focus && P.focus.until >= dkey(today) ? P.focus.sub : '';
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
    if (capMode !== 'max' && T.some(t => t.rem > 0 && !t.due)) cap = Math.max(cap, Math.min(dmax(d), habit(we)));
    if (di === 0 && capMode !== 'max') cap = Math.round(cap * adj / 10) * 10;
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
          const elig = T.filter(t => t.rem > 0 && (!t.from || t.from <= k) && (!t.seq || head.get(t.m) === t.i) && (daySubs.has(t.sub) || daySubs.size < lim || t.sub === focus));
          if (!elig.length) break;
          elig.sort((x, y) => (x.due || '9999') < (y.due || '9999') ? -1 : (x.due || '9999') > (y.due || '9999') ? 1 : (x.mi || 0) - (y.mi || 0));
          const minDue = elig[0].due || '9999', near = elig.filter(t => (t.due || '9999') <= dkey(dAdd(pDate(minDue === '9999' ? '2099-01-01' : minDue), 2)) || minDue === '9999');
          const pick = bsub ? (near.find(t => t.sub === bsub) || elig.find(t => t.sub === bsub) || null) : (near.find(t => t.sub === focus && t.sub !== last) || near.find(t => t.sub !== last) || near[0]);
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
  cache = { sig, ...r, strained };
  try { const k = todayK(), D = r.days[0], tot = (D ? D.mins : 0) + (ST().log[k] || []).reduce((a, b) => a + b.mins, 0); if (tot > (ST().pl[k] || 0)) { ST().pl[k] = tot; const ks = Object.keys(ST().pl).sort(); while (ks.length > 14) delete ST().pl[ks.shift()]; } } catch (e) {}
  return cache;
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
  if (curSheet !== 1) return; // 캘린더(2)·시간표(3)는 따로 번호라 탭이 없음
  const T = el('div', 'tabs'); [['today', '오늘'], ['all', '할 일']].forEach(([v, l]) => { const b = el('button', boardTab === v ? 'on' : '', l); b.onclick = () => { boardTab = v; refreshSheet(); }; T.appendChild(b); }); B.appendChild(T);
};
const _br = boardRender; boardRender = function (B) {
  if (curSheet === 1 && !['today', 'all'].includes(boardTab)) boardTab = 'today';
  if (boardTab === 'cal') return renderCal(B);
  _br(B);
};

// ---------- 2 캘린더 · 3 시간표 (따로 번호) ----------
SH.cal = { t: '캘린더', s: () => '시험·숙제·학원·일정·공부량을 한눈에', r: B => { boardTab = 'cal'; renderCal(B); } };
SH.tt = { t: '시간표', s: () => `매주 반복 ${(S.reps || []).length}개 · 이 시간은 피해서 짜요`, r: B => { boardTab = 'tt'; _br(B); } };
const _ob = openBoard; openBoard = function (tab) { if (tab === 'cal' || tab === 'week') return openSheet('cal'); if (tab === 'tt') return openSheet('tt'); if (tab === 'study') return openSheet(6); _ob(tab); };

// 달력 칸이 좁아서 시험 이름은 짧게(중간·기말·수행…), 전체 이름은 아래 그날 목록에
const exShort = n => { const m = String(n).match(/중간|기말|모의|수행|듣기|쪽지|실기|퀴즈/); return m ? m[0] : String(n).replace(/\s/g, '').slice(0, 3); };
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
    { const E = ST().exams.filter(e => e.date === k); if (E.length) { c.classList.add('exd'); c.appendChild(el('span', 'ex', exShort(E[0].name) + (E.length > 1 ? `+${E.length - 1}` : ''))); } }
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
  const c = el('div', 'card'), t = inp('text', '일정 (예: 수행평가)'), tm = inp('time', '', ''); c.style.marginTop = '10px'; tm.style.maxWidth = '120px';
  c.append(row(t, tm), row(btn('붙이기', 'wide', () => { const v = t.value.trim(); if (!v) return; addItem(v, `${k}T${tm.value || '09:00'}`); save(); pushSync(true); dirty(); refreshSheet(); renderHome(); toast('붙였어요.'); })));
  B.appendChild(c);
}

// ---------- 6 공부 ----------
let sub = 'today', ed = -1, edMode = '', addOpen = false, formOpen = false, openMat = null, timeOpen = false;
SH[6] = {
  t: '공부',
  s: () => { const e = nextExam(); if (!e) return '빈 시간에 맞춰 레나가 짜요'; const dd = dTo(e.date); return `${e.name} ${dd ? 'D-' + dd : 'D-DAY'} · ${phaseOf(dd)[0]}`; },
  r: B => {
    const T = el('div', 'tabs'); [['today', '오늘'], ['exam', '시험'], ['mat', '과목·교재'], ['note', '노트']].forEach(([v, l]) => { const b = el('button', sub === v ? 'on' : '', l); b.onclick = () => { if (v === 'note' && window.lenaNotes) lenaNotes.reset(); sub = v; ed = -1; addOpen = formOpen = timeOpen = false; refreshSheet(); }; T.appendChild(b); }); B.appendChild(T);
    ({ today: stToday, exam: stExam, mat: stMat, note: B2 => window.lenaNotes ? lenaNotes.render(B2) : null })[sub](B);
  }
};
// 유리에 붙은 분홍 전단지: 시험까지 남은 날과 이번 주 할 것
function dFlyer(B) {
  const e = nextExam(), f = el('div', 'dfly' + (e ? '' : ' none')); f.appendChild(el('i', 'tp'));
  const top = el('div', 'dtop'), L = el('div');
  if (!e) { L.append(el('small', null, '다가오는 시험'), el('div', 'dnm', '아직 없어요')); top.append(L, el('div', 'ddn', '평소')); f.append(top, el('p', null, '교재 진도를 날마다 조금씩. 시험을 넣으면 3주 전부터 회독으로 바꿔 짜요.')); B.appendChild(f); return; }
  const dd = dTo(e.date); L.append(el('small', null, `${e.date.slice(5).replace('-', '/')} 시험까지`), el('div', 'dnm', e.name)); const dn = el('div', 'ddn'); if (dd) { dn.append(el('em', null, 'D-'), document.createTextNode(dd)); } else dn.append(el('em', null, 'D-'), document.createTextNode('DAY')); top.append(L, dn); f.appendChild(top);
  const G = el('div', 'stg'), stages = [['3주 전', 21], ['2주 전', 14], ['1주 전', 7], ['전날', 1]], cur = stages.findIndex(([, n], k) => dd <= n && (k === 3 || dd > stages[k + 1][1]));
  stages.forEach(([n], k) => G.appendChild(el('span', cur >= 0 && k < cur ? 'past' : k === cur ? 'cur' : '', n)));
  f.append(G, el('p', null, phaseOf(dd)[1])); B.appendChild(f);
}
// 레나 쪽지: 오늘 양을 왜 이렇게 잡았는지 + 오늘만 바꾸기 + 말로 바꾸기
function lenaNote(B, D, lg) {
  const st = ST(), P = st.pref, k = todayK(), tot = D.mins + lg.reduce((a, b) => a + b.mins, 0), e = nextExam(), kr = keepRate(), adj = st.adj && st.adj.d === k ? st.adj.mul : 1;
  let say;
  if (adj === 0) say = '오늘은 쉬는 날로 했어요. 내일 제가 조금씩 나눠서 메워 둘게요.';
  else if (!tot) say = '오늘은 빈 시간이 없거나 할 게 다 끝났어요. 푹 쉬어요.';
  else if (e && dTo(e.date) <= 7) say = `시험 주간이에요. 오늘 ${hm(tot)}, 남은 범위를 날짜로 나눠서 딱 필요한 만큼만 넣었어요.`;
  else if (adj < 1) say = `알았어요, 오늘은 ${hm(tot)}만. 나머지는 뒤로 고르게 밀어 뒀어요.`;
  else if (adj > 1) say = `의욕 좋네요. 오늘 ${hm(tot)}로 늘렸어요.`;
  else say = `오늘은 ${hm(tot)}. 남은 양을 마감까지 고르게 나눠서 잡았어요.${kr != null && kr < .7 ? ' 요즘 좀 밀려서 양을 살짝 줄였어요.' : ''}`;
  const c = el('div', 'ask lena'); c.append(el('span', 'who', '레나'), document.createTextNode(say));
  const lim = (we, u) => u ? hm(u) : `자동(최대 ${hm(AUTO_CAP[we])})`;
  if (P.focus && P.focus.until >= k) c.appendChild(el('span', 'lsub', `${P.focus.sub} 먼저 하는 중 (${P.focus.until.slice(5).replace('-', '/')}까지)`));
  const set = mul => { st.adj = { d: k, mul }; delete st.fix[k]; ed = -1; save(); dirty(); pushSync(true); refreshSheet(); };
  const R = el('div', 'lbtn'); R.append(...(adj === 1 ? [btn('조금만', 'ghost', () => set(.5)), btn('쉴래', 'ghost', () => set(0)), btn('더 할래', 'ghost', () => set(1.4))] : [btn('원래대로', 'ghost', () => set(1))]), btn('레나랑 얘기', 'teal', () => { closeSheet(); openCall(); setTimeout(() => sendText('공부 계획 얘기하자'), 400); }));
  c.appendChild(R); B.appendChild(c);
}
function stToday(B) {
  const st = ST(), P = splan(), D = P.days[0] || { blocks: [], mins: 0 }, k = todayK(), lg = st.log[k] || [], now = new Date();
  dFlyer(B);
  if (!subs().length) {
    const sp = el('div', 'sheetp'); sp.append(el('i', 'tape'), el('div', 'pempty', '아직 빈 시간표예요.\n교재나 시험을 하나 넣으면 제가 빈 시간에 맞춰 날마다 채워요.\n통화로 "기말 12월 10일, 수학 쎈 1~8단원"이라고 해도 돼요.')); B.appendChild(sp);
    B.appendChild(row(btn('교재 넣기', 'teal wide', () => { sub = 'mat'; formOpen = true; refreshSheet(); }), btn('시험 넣기', 'wide', () => { sub = 'exam'; formOpen = true; refreshSheet(); })));
    return;
  }
  lenaNote(B, D, lg);
  if (P.late.length) B.appendChild(el('div', 'warn', `시간이 모자라요: ${[...new Set(P.late.map(t => t.sub))].join(', ')}. "레나랑 얘기"에서 하루 시간을 늘려 달라고 하거나, 아래 시간 설정에서 늘려요.`));
  const sp = el('div', 'sheetp'), tot = D.mins + lg.reduce((a, b) => a + b.mins, 0);
  sp.append(el('i', 'tape'), el('i', 'tape r'));
  const hd = el('div', 'hd'); hd.append(el('b', null, `${now.getMonth() + 1}월 ${now.getDate()}일 ${WD[now.getDay()]}요일`), el('span', null, tot ? hm(tot) : '쉬는 날')); sp.appendChild(hd);
  const first = D.blocks.length ? D.blocks[0].s : 0, lastE = D.blocks.length ? D.blocks[D.blocks.length - 1].e : 0;
  const fixd = busyOn(now).filter(([s0, e2]) => s0 < lastE && e2 > first);
  const list = [...lg.map(l => ({ s: l.s, lg: l })), ...D.blocks.map((b, i) => ({ s: b.s, b, i })), ...fixd.map(f => ({ s: f[0], fx: f }))].sort((a, b) => a.s - b.s);
  const subWord = (sb, txt) => { const w = el('span'), i2 = el('i', null, sb); i2.style.setProperty('--c', colOf(sb)); w.append(i2, document.createTextNode(txt)); return w; };
  list.forEach(x => {
    if (x.fx) { const r = el('div', 'pr pfx'); r.append(el('span', 't', toT(x.fx[0])), el('span', 'w', `${x.fx[2] || '일정'} ~${toT(x.fx[1])}`)); sp.appendChild(r); return; }
    if (x.lg) { const r = el('div', 'pr done'), t = el('span', 't'); t.append(document.createTextNode(toT(x.lg.s)), el('small', null, `${x.lg.mins}분`)); const w = el('span', 'w'); w.appendChild(subWord(x.lg.sub, x.lg.label)); const st2 = el('span', 'st'), im = el('img'); im.src = CUR('todo'); im.alt = '끝냄'; st2.appendChild(im); r.append(t, w, st2); sp.appendChild(r); return; }
    const b = x.b, i = x.i, r = el('div', 'pr' + (ed === i ? ' ed' : '')), t = el('span', 't'); t.append(document.createTextNode(toT(b.s)), el('small', null, `${b.e - b.s}분`));
    const w = el('button', 'w'); w.appendChild(subWord(b.sub, b.parts.map(p => p.t.label).join(' + '))); w.onclick = () => { ed = ed === i ? -1 : i; edMode = ''; addOpen = false; refreshSheet(); };
    const ok = el('button', 'st'); ok.setAttribute('aria-label', '끝냄'); ok.onclick = () => { finishBlock(b); ed = -1; refreshSheet(); toast('한 블록 끝! 동전 +1'); };
    r.append(t, w, ok); sp.appendChild(r);
    if (ed === i) sp.appendChild(editRow(i));
  });
  if (!list.length) sp.appendChild(el('div', 'pempty', '오늘은 남은 공부가 없어요.'));
  if (addOpen) { const w = el('div', 'ptools'); w.appendChild(el('div', 'q', '어떤 과목 블록을 더 넣을까요?')); w.appendChild(pills(subs().map(x => [x, x]), '', sb => { const F = freeze(), P2 = st.pref, n = new Date(), nowM = Math.ceil((n.getHours() * 60 + n.getMinutes()) / 10) * 10, we = n.getDay() === 0 || n.getDay() === 6, s0 = Math.max(nowM, toM(we ? P2.weS : P2.wdS), F.length ? F[F.length - 1].e + 10 : 0); F.push({ s: s0, e: s0 + P2.block, sub: sb, parts: nextOf(sb, P2.block) }); addOpen = false; commit(); })); sp.appendChild(w); }
  sp.appendChild(Object.assign(el('button', 'padd', addOpen ? '닫기' : '+ 블록 더 넣기'), { onclick: () => { addOpen = !addOpen; ed = -1; refreshSheet(); } }));
  sp.appendChild(el('div', 'pfoot', st.fix[k] ? '직접 고친 시간표예요.' : '줄을 누르면 시간·순서·과목을 바꿔요. 50분 공부하고 10분 쉬어요.'));
  B.appendChild(sp);
  if (st.fix[k]) B.appendChild(row(btn('레나가 다시 짜기', 'ghost wide', () => { delete st.fix[k]; ed = -1; save(); dirty(); pushSync(true); refreshSheet(); })));
  const tg = btn(timeOpen ? '닫기' : '시간 직접 바꾸기', 'ghost wide', () => { timeOpen = !timeOpen; refreshSheet(); }); tg.style.marginTop = '10px'; B.appendChild(tg);
  if (timeOpen) timeEditor(B);
}
function timeEditor(B) {
  const st = ST(), P = st.pref, c = el('div', 'card pedit'), k = todayK(), up = () => { delete st.fix[k]; save(); dirty(); pushSync(true); refreshSheet(); };
  const time = (lab, key) => { const r = el('div', 'r'), i2 = inp('time', '', P[key]); i2.onchange = () => { if (i2.value) { P[key] = i2.value; up(); } }; r.append(el('span', null, lab), i2); return r; };
  const cap = (lab, key, we) => { const r = el('div', 'r'), S3 = el('div', 'step'); S3.append(btn('−', 'ghost', () => { P[key] = P[key] ? (P[key] - 30 < 30 ? 0 : P[key] - 30) : 0; up(); }), el('b', null, P[key] ? hm(P[key]) : '자동'), btn('+', 'ghost', () => { P[key] = Math.min(we ? 720 : 600, (P[key] || AUTO_CAP[we ? 1 : 0]) + 30); up(); })); r.append(el('span', null, lab), S3); return r; };
  const cnt = (lab, key) => { const r = el('div', 'r'), S3 = el('div', 'step'); S3.append(btn('−', 'ghost', () => { P[key] = Math.max(1, P[key] - 1); up(); }), el('b', null, `${P[key]}과목`), btn('+', 'ghost', () => { P[key] = Math.min(6, P[key] + 1); up(); })); r.append(el('span', null, lab), S3); return r; };
  c.append(time('평일 시작', 'wdS'), time('주말 시작', 'weS'), time('끝 (잘 준비)', 'end'), cap('평일 하루 최대', 'wdMax', 0), cap('주말 하루 최대', 'weMax', 1), cnt('평일 과목 수', 'wdSubs'), cnt('주말 과목 수', 'weSubs'));
  c.prepend(el('div', 'hint', `지금: 평일 ${P.wdS}~ · 주말 ${P.weS}~ · ${P.end}까지`));
  c.appendChild(el('div', 'hint', '하루 최대를 0까지 내리면 "자동"이에요. 자동은 그날 빈 시간과 마감까지 남은 양으로 레나가 정해요. 통화로 "주말엔 9시부터" "수학 먼저 해 줘"처럼 말해도 바꿔요.'));
  B.appendChild(c);
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
  { const b = (ST().fix[todayK()] || splan().days[0].blocks)[i], lab = b ? b.parts.map(p => (p.t || p).label).join(' ') : '';
    if (b && window.lenaNotes && lenaNotes.has(b.sub)) w.appendChild(B2(/필승/.test(lab) ? '필승노트 보기' : /백지/.test(lab) ? '백지 복습 문제' : `${b.sub} 노트`, () => { lenaNotes.open(b.sub, /필승/.test(lab) ? 'cram' : /백지/.test(lab) ? 'quiz' : ''); sub = 'note'; ed = -1; refreshSheet(); })); }
  return w;
}
const xbtnS = fn => { const b = el('button', 'x', '×'); b.onclick = fn; b.setAttribute('aria-label', '지우기'); return b; };
function stExam(B) {
  const today = todayK(), E = ST().exams.filter(e => e.date >= today).sort((a, b) => a.date.localeCompare(b.date));
  E.forEach((e, n) => {
    const dd = dTo(e.date), c = el('div', 'mat'), h = el('div', 'h'), ch = el('span', 'sj', dd ? `D-${dd}` : 'D-DAY'); ch.style.background = dd <= 7 ? 'var(--hot)' : 'var(--yel)';
    h.append(ch, el('b', null, `${e.name} · ${e.date.slice(5).replace('-', '/')}`), xbtnS(() => { if (!confirm(`'${e.name}' 지울까요?`)) return; ST().exams = ST().exams.filter(x => x !== e); save(); dirty(); refreshSheet(); })); c.appendChild(h);
    const sp = el('div', 'hint'); exSubs(e).forEach(s => sp.append(chip(s), document.createTextNode(' '))); c.appendChild(sp);
    e.ranges.forEach(r => { const m = matOf(r.mat); if (m) c.appendChild(el('div', 'hint', `${m.title} ${m.units[r.from] ? m.units[r.from].name : ''}~${m.units[r.to] ? m.units[r.to].name : ''}`)); });
    if (n === 0) { // 블로그 주차별 계획을 날짜로
      const W = el('div', 'wkl'), d0 = pDate(e.date), md = x => `${x.getMonth() + 1}/${x.getDate()}`, cur = phaseOf(dd)[0];
      [['3주 전', -21, -15, 21], ['2주 전', -14, -8, 14], ['1주 전', -7, -2, 7], ['시험 전날', -1, -1, 1]].forEach(([nm, a, b, pd]) => { if (dkey(dAdd(d0, b)) < today) return; const r = el('div', nm === cur || (nm === '시험 전날' && cur === '시험 전날') ? 'now' : ''); const lb = el('b'); lb.append(nm, el('br'), a === b ? md(dAdd(d0, a)) : `${md(dAdd(d0, a))}~${md(dAdd(d0, b))}`); r.append(lb, el('span', null, phaseOf(pd)[1])); W.appendChild(r); });
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
if (SH.brief) { const _r = SH.brief.r; SH.brief.r = B => { _r(B); try { const D = splan().days[0]; if (!D || !D.blocks.length) return; const w = B.querySelector('.brief'); const s = el('div', 'bsec'); s.appendChild(el('h5', null, `오늘 공부 ${hm(D.mins)}`)); D.blocks.slice(0, 4).forEach(b => { const r = el('div', 'r'); r.append(el('b', null, toT(b.s)), document.createTextNode(`${b.sub} · ${b.parts.map(p => p.t.label).join(' / ')}`)); s.appendChild(r); }); s.appendChild(row(btn('4 공부 보기', 'ghost wide', () => { sub = 'today'; openSheet(6); }))); w && w.appendChild(s); } catch (e) {} }; }

// ---------- 알림: 오늘 공부 블록 시작 ----------
const _plan = window.plan; window.plan = function () {
  const p = _plan(); try { const now = Date.now(), add = []; splan().days.slice(0, 2).forEach(D => D.blocks.forEach(b => { const at = new Date(pDate(D.k)); at.setHours(0, b.s, 0, 0); if (at.getTime() > now) add.push({ id: `st_${D.k}_${b.s}`, at: at.getTime(), body: `${nmc()}${b.sub} 시간이에요. ${b.parts[0].t.label}${b.parts.length > 1 ? ' 외' : ''} (${b.e - b.s}분)` }); })); p.reminders = p.reminders.concat(add).sort((a, b) => a.at - b.at).slice(0, 180); } catch (e) {}
  return p;
};

// ---------- Gemini: 말로 넣기 ----------
const _sys = sysPrompt; sysPrompt = function (sp) {
  const s = _sys(sp), st = ST();
  return s.replace('JSON만 출력:', `- 공부: 교재·문제집(몇 단원/몇 쪽), 학원 숙제, 시험 날짜·과목·범위를 말하면 study에 넣는다. study={"mats":[{"sub":"과목","title":"교재 이름","kind":"book|hw","from":1,"to":12,"unit":"단원|쪽","chunk":쪽일 때 덩어리 쪽수,"mins":단원 하나 걸리는 분(모르면 40),"due":"YYYY-MM-DD 숙제면 다음 학원 날"}],"exams":[{"name":"시험 이름","date":"YYYY-MM-DD","subs":["과목"],"ranges":[{"sub":"과목","title":"교재 이름","from":시작 번호,"to":끝 번호}]}]}. 교재가 이미 있으면 mats에 다시 넣지 않는다. 계획은 앱이 시험 3주 전부터 회독 단계로 빈 시간에 짠다(4번 공부).
- 공부 계획 고치기: 송휘님이 공부 시간·양·순서를 바꿔 달라고 하면 study.set에 바꿀 것만 넣는다. set={"wdS":"HH:MM 평일 시작","weS":"HH:MM 주말 시작","end":"HH:MM 끝","wdMax":평일 하루 최대 분(0=자동),"weMax":주말 하루 최대 분(0=자동),"wdSubs":평일 과목 수,"weSubs":주말 과목 수,"block":한 블록 분(30~90),"focus":"먼저 할 과목"(없애려면 ""),"focusDays":며칠 동안,"today":"less|off|more|normal"(오늘만 조금/쉬기/더/원래대로)}. 피곤하다·아프다면 today:"less"나 "off"를 권하고, 바꾼 뒤엔 reply에서 짧게 무엇을 바꿨는지 말한다.
지금 공부 설정: ${JSON.stringify({ wdS: st.pref.wdS, weS: st.pref.weS, end: st.pref.end, wdMax: st.pref.wdMax || '자동', weMax: st.pref.weMax || '자동', wdSubs: st.pref.wdSubs, weSubs: st.pref.weSubs, block: st.pref.block, focus: st.pref.focus && st.pref.focus.sub || '' })} 오늘 계획: ${(() => { try { const D = splan().days[0]; return D.blocks.map(b => `${toT(b.s)} ${b.sub} ${b.parts.map(p => p.t.label).join('+')}`).join(', ') || '없음'; } catch (e) { return '?'; } })()}
지금 공부 목록: ${JSON.stringify(st.mats.map(m => `${m.sub}/${m.title}(${m.kind === 'hw' ? '숙제' : m.units.length + '개'}, 남은 ${m.units.filter(u => !u.done).length})`).slice(0, 20))} 시험: ${JSON.stringify(st.exams.map(e => `${e.name} ${e.date} ${exSubs(e).join('·')}`))}
JSON만 출력:`).replace(/"follow":\[\]\}/, '"follow":[],"study":{"mats":[],"exams":[],"set":{}}}');
};
const _ap = apply; apply = function (r) {
  const res = _ap(r), x = r && r.study, got = [];
  if (x && typeof x === 'object') {
    (x.mats || []).forEach(o => { if (!o || !o.title) return; if (ST().mats.some(m => m.title === o.title && m.sub === (o.sub || m.sub) && m.kind === (o.kind === 'hw' ? 'hw' : 'book'))) return; const m = addMat({ ...o, unit: o.unit === '쪽' ? '쪽' : '단원' }); got.push(`${m.sub} ${m.title}`); });
    (x.exams || []).forEach(o => { if (!o || !o.name || !/^\d{4}-\d\d-\d\d$/.test(o.date || '')) return; const ranges = (o.ranges || []).map(rg => { if (!rg || !rg.title) return null; let m = ST().mats.find(mm => mm.kind === 'book' && mm.title === rg.title) || ST().mats.find(mm => mm.kind === 'book' && (mm.title.includes(rg.title) || rg.title.includes(mm.title))); if (!m) m = addMat({ sub: rg.sub, title: rg.title, kind: 'book', from: 1, to: +rg.to || 1 }); const fi = Math.max(0, m.units.findIndex(u => u.n === +rg.from)), ti = m.units.findIndex(u => u.n === +rg.to); return { mat: m.id, from: fi, to: ti < 0 ? m.units.length - 1 : ti }; }).filter(Boolean); addExam({ name: o.name, date: o.date, subs: [...(o.subs || []), ...(o.ranges || []).map(rg => rg && rg.sub).filter(Boolean)], ranges }); got.push(`시험 ${o.name}`); });
  }
  if (x && x.set && typeof x.set === 'object') {
    const P = ST().pref, o = x.set, tm = v => /^\d{1,2}:\d\d$/.test(v || '') ? v.padStart(5, '0') : null, ch = [];
    [['wdS', '평일 시작'], ['weS', '주말 시작'], ['end', '끝']].forEach(([kk, n]) => { const v = tm(o[kk]); if (v && v !== P[kk]) { P[kk] = v; ch.push(`${n} ${v}`); } });
    [['wdMax', '평일 최대', 600], ['weMax', '주말 최대', 720]].forEach(([kk, n, hi]) => { if (o[kk] == null || o[kk] === '') return; const v = Math.max(0, Math.min(hi, Math.round(+o[kk] / 10) * 10 || 0)); if (v !== P[kk]) { P[kk] = v; ch.push(`${n} ${v ? hm(v) : '자동'}`); } });
    [['wdSubs', '평일'], ['weSubs', '주말']].forEach(([kk, n]) => { const v = Math.round(+o[kk]); if (v >= 1 && v <= 6 && v !== P[kk]) { P[kk] = v; ch.push(`${n} ${v}과목`); } });
    if (+o.block >= 30 && +o.block <= 90) { P.block = Math.round(+o.block / 5) * 5; ch.push(`블록 ${P.block}분`); }
    if (typeof o.focus === 'string') { if (o.focus.trim()) { P.focus = { sub: o.focus.trim().slice(0, 12), until: dkey(dAdd(new Date(), Math.max(1, Math.min(30, +o.focusDays || 7)) - 1)) }; ch.push(`${P.focus.sub} 먼저`); } else if (P.focus) { P.focus = null; ch.push('먼저 할 과목 없앰'); } }
    const tmap = { less: .5, off: 0, more: 1.4, normal: 1 }; if (o.today in tmap) { ST().adj = { d: todayK(), mul: tmap[o.today] }; ch.push({ less: '오늘 조금만', off: '오늘 쉬기', more: '오늘 더', normal: '오늘 원래대로' }[o.today]); }
    if (ch.length) { delete ST().fix[todayK()]; got.push('계획 바꿈(' + ch.join(', ') + ')'); }
  }
  if (!got.length) return res;
  dirty(); save(); pushSync(true);
  const txt = `공부에 넣음: ${got.join(', ')} · 4번 공부에서 확인`;
  if (res) { res.querySelector('span').textContent += ' · ' + txt; return res; } return noteEl(txt);
};
window.lenaStudy = { keepRate, plan: () => splan(), simulate, freeIv, addMat, addExam, finishBlock, dirty, freeze, phaseOf };
})();
