// 공부 (다이얼 4, 시트 id 6): v79 기본 = 문제집 풀기 + 오답(학원 과목은 학원 숙제만) · 빈 시간에 50분 블록
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
.calp{padding:24px 10px 12px;transform:rotate(.4deg)}
.calp .calh{padding:0 2px 8px;margin-bottom:6px;border-bottom:2px solid #17181a}
.calp .calh b{font-size:22px;color:#17181a}.calp .calh b em{font-style:normal;color:var(--pink)}
.calp .calh .btn{width:40px;height:40px;padding:0;background:#fff;color:#111;border:2px solid #000;border-radius:10px;box-shadow:2px 2px 0 #000;font-size:18px;font-weight:900}
.calp .cal{gap:0;border-left:1px solid rgba(0,0,0,.18)}
.calp .cal .wd{color:rgba(0,0,0,.55);font-family:'Space Mono',monospace;border-right:1px solid rgba(0,0,0,.18);border-bottom:1.5px solid #17181a}.calp .cal .wd.su{color:#e0306e}.calp .cal .wd.sa{color:#3a72c8}
.calp .cal button{min-height:56px;border:0;border-radius:0;background:transparent;border-right:1px solid rgba(0,0,0,.18);border-bottom:1px dashed rgba(0,0,0,.2)}
.calp .cal button.out{opacity:.28}
.calp .cal .dn{color:#17181a;font-size:12px;align-self:flex-start;min-width:20px;height:20px;line-height:20px;text-align:center;border-radius:50%}
.calp .cal button.td{box-shadow:none}.calp .cal button.td .dn{background:var(--pink);color:#fff;border:1.5px solid #000}
.calp .cal button.sel{background:rgba(242,234,58,.45)}
.calp .cal button.exd{border-color:rgba(0,0,0,.18)}
.calp .cal .ex{position:absolute;right:2px;top:3px;background:transparent;color:#d6204f;border:2px solid #d6204f;border-radius:5px;padding:0 3px;font-size:10px;line-height:1.35;transform:rotate(-10deg);box-shadow:none;opacity:.9}
.calp .cal .ds i{width:6px;height:6px;border:1px solid rgba(0,0,0,.35)}
.calp .cal .sb{left:4px;right:4px;bottom:4px;height:6px;background:transparent;border-radius:0}.calp .cal .sb b{background:rgba(47,224,200,.75);border-radius:1px;transform:skewX(-12deg)}
.calg{display:flex;flex-wrap:wrap;gap:4px 12px;padding:9px 2px 0;font-size:11.5px;font-weight:700;color:rgba(0,0,0,.6)}.calg span{display:flex;align-items:center;gap:4px}
.calg i.dot{width:7px;height:7px;border-radius:50%;border:1px solid rgba(0,0,0,.35)}.calg i.ex{width:14px;height:10px;border:2px solid #d6204f;border-radius:3px;transform:rotate(-10deg)}.calg i.bar{width:16px;height:6px;background:rgba(47,224,200,.75);transform:skewX(-12deg)}
.exp{padding:24px 14px 10px}
.exp.sm{padding:20px 12px 10px;transform:rotate(.6deg)}.exp.sm .exd{font-size:22px}
.exp .exh{display:flex;align-items:center;gap:12px;padding-bottom:10px;border-bottom:2px solid #17181a}
.exp .exd{flex:none;font-family:'Black Han Sans';font-size:28px;line-height:1;padding:6px 8px 4px;color:#e0b000;border:3px solid currentColor;border-radius:8px;transform:rotate(-6deg);background:rgba(255,255,255,.4)}
.exp .exd.hot{color:#d6204f}
.exp .exn{flex:1;min-width:0}.exp .exn b{display:block;font-size:17px;font-weight:900;line-height:1.3;word-break:keep-all}.exp .exn small{font-family:'Space Mono',monospace;font-size:12px;font-weight:700;opacity:.6}
.exp .x{flex:none;width:40px;height:40px;border-radius:50%;color:rgba(0,0,0,.5);font-size:22px}
.exp .exl{padding-top:2px}
.exp .exr{display:flex;align-items:baseline;gap:10px;padding:10px 2px;border-bottom:1.5px dashed rgba(0,0,0,.2)}.exp .exr:last-child{border-bottom:0}
.exp .exr i,.exp .exs i{flex:none;font-style:normal;font-weight:900;font-size:15px;padding:0 3px;background:linear-gradient(transparent 50%,var(--c) 50%)}
.exp .exr .exk{flex:none;width:64px}
.exp .exr span{flex:1;font-size:14px;font-weight:700;line-height:1.45;word-break:keep-all}.exp .exr span.ac{color:#6a3fd0}
.exp .exr small{display:block;font-size:12px;font-weight:600;opacity:.6}
.exp .exs{display:flex;flex-wrap:wrap;gap:6px 10px;padding-top:9px}
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
.pr.done .st{background:var(--teal);color:#000;font-size:22px;font-weight:900;transform:rotate(-8deg)}
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
.mat .us2{flex:1 1 100%;display:flex;flex-wrap:wrap;gap:4px;margin:-1px 0 5px 14px;padding-left:8px;border-left:2px solid rgba(0,0,0,.18)}.mat .us2 button{min-height:30px;font-size:12px;padding:0 8px}
.pr.pplay{min-height:40px;background:repeating-linear-gradient(-45deg,rgba(47,224,200,.16) 0 8px,transparent 8px 16px);border-radius:6px}.pr.pplay .w{font-size:13.5px;font-weight:700;color:#0b6e61}
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
  s.pref = Object.assign({ wdS: '17:00', weS: '10:00', end: '23:00', wdMax: 0, weMax: 0, block: 50, wdSubs: 2, weSubs: 4, focus: null, wdPlay: 60, wePlay: 120 }, s.pref || {}); return s; };
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
const KIND = k => k === 'hw' || k === 'perf' ? k : 'book';
const TIER = { perf: 0, hw: 1, book: 2 }; // 우선순위: 수행평가 → 학원 숙제 → 개인 공부
// 단원 구성 글 → 단원·소단원. 줄 앞에 - 가 있으면 소단원, 끝의 숫자는 걸리는 분
function parseOutline(txt, defM) {
  const U = []; String(txt || '').split(/\n/).forEach(line => { const raw = line.trim(); if (!raw) return; const isSub = /^[-·•*]/.test(raw) || /^\s{2,}/.test(line); let t = raw.replace(/^[-·•*]\s*/, ''); const mm = t.match(/(\d{1,3})\s*분?\s*$/); let mins = 0; if (mm && t.length > mm[0].length) { mins = +mm[1]; t = t.slice(0, -mm[0].length).trim(); }
    if (isSub && U.length) U[U.length - 1].subs.push({ id: uid('s'), name: t.slice(0, 30), mins: Math.max(5, mins || defM), prog: 0, done: false });
    else U.push({ id: uid('u'), name: t.slice(0, 30), mins: Math.max(5, mins || defM), prog: 0, done: false, subs: [] }); });
  U.forEach(u => { if (u.subs.length) u.mins = u.subs.reduce((a, x) => a + x.mins, 0); else delete u.subs; }); return U.slice(0, 60);
}
function addMat(o) { const kind = KIND(o.kind), m = { id: uid('m'), sub: String(o.sub || '기타').slice(0, 12), title: String(o.title || '교재').slice(0, 30), kind, due: o.due || '', units: o.outline ? parseOutline(o.outline, +o.mins || 30) : kind === 'book' ? (o.from ? makeUnits('book', +o.from, +o.to || +o.from, +o.chunk, +o.mins || 60, o.unit) : []) : makeUnits('hw', 1, 1, 0, +o.mins, o.what || o.title) }; if (kind === 'book') m.umins = +o.mins || 60; if (kind === 'hw' && Array.isArray(o.days) && o.days.length) { m.rep = { days: [...new Set(o.days.map(Number).filter(d => d >= 0 && d <= 6))], mins: +o.mins || 40 }; m.units = []; m.due = ''; } ST().mats.push(m); save(); return m; }
// v76: 시험 범위(몇~몇 단원)를 넣으면 그 단원을 자동으로 만든다. 단원 순서가 바뀌면 다른 시험 범위 번호도 다시 맞춤
function ensureUnits(m, from, to) { const ids = ST().exams.flatMap(e => e.ranges.filter(r => r.mat === m.id).map(r => [r, m.units[r.from] && m.units[r.from].id, m.units[r.to] && m.units[r.to].id])); for (let n = Math.min(from, to); n <= Math.max(from, to) && m.units.length < 120; n++) if (!m.units.some(u => u.n === n)) m.units.push({ id: uid('u'), name: `${n}단원`, n, mins: m.umins || 60, prog: 0, done: false }); m.units.sort((a, b) => (a.n || 0) - (b.n || 0)); ids.forEach(([r, a, b]) => { const ia = m.units.findIndex(u => u.id === a), ib = m.units.findIndex(u => u.id === b); if (ia >= 0) r.from = ia; if (ib >= 0) r.to = ib; }); return [m.units.findIndex(u => u.n === Math.min(from, to)), m.units.findIndex(u => u.n === Math.max(from, to))]; }
// 같은 것 찾기(대화로 같은 시험·교재가 또 오면 새로 만들지 않음)
const nm2 = x => String(x || '').toLowerCase().replace(/[\s·.,!?~'"()\[\]\-_/]/g, '');
const near = (a, b) => { a = nm2(a); b = nm2(b); return !!a && !!b && (a === b || a.includes(b) || b.includes(a)); };
const findMat = o => ST().mats.find(m => m.kind === KIND(o.kind) && (!o.sub || m.sub === o.sub) && near(m.title, o.title));
// 중간·기말은 학기마다 하나라 '2학기 기말'·'기말고사'도 같은 시험으로 본다(수행·듣기 등은 이름이 거의 같아야 같음)
const exType = n => (String(n).match(/중간|기말/) || [''])[0];
const sameExam = (a, b) => near(a, b) || (!!exType(a) && exType(a) === exType(b));
const findExam = o => ST().exams.find(e => sameExam(e.name, o.name) && (e.date === o.date || e.date >= todayK()));
function mergeExam(e, date, subs, ranges) {
  let ch = false; if (date && /^\d{4}-\d\d-\d\d$/.test(date) && date !== e.date) { e.date = date; ch = true; }
  (subs || []).forEach(s2 => { if (!(e.subs || (e.subs = [])).includes(s2)) { e.subs.push(s2); ch = true; } });
  (ranges || []).forEach(r => { if (!e.ranges.some(x => x.mat === r.mat)) { e.ranges.push(r); ch = true; } else { const x = e.ranges.find(y => y.mat === r.mat); if (x.from !== r.from || x.to !== r.to) { x.from = r.from; x.to = r.to; ch = true; } } });
  if (ch) save(); return ch;
}
// 이미 쌓인 중복 시험 정리: 이름이 같은(거의 같은) 같은 날 시험은 하나로
function dedupExams() { const E = ST().exams, keep = []; let n = 0; E.forEach(e => { const k = keep.find(x => x.date === e.date && sameExam(x.name, e.name)); if (k) { mergeExam(k, null, e.subs, e.ranges); n++; } else keep.push(e); }); if (n) { ST().exams = keep; save(); } return n; }
function addExam(o) { const e = { id: uid('x'), name: String(o.name || '시험').slice(0, 20), date: o.date, subs: [...new Set(o.subs || [])], ranges: (o.ranges || []).filter(r => r.mat) }; ST().exams.push(e); save(); return e; }

// 문제집 범위 = 시험 1주 전까지 다 풀기(블로그: 1주 전 '문제집 진도까지 다 풀기'). 그게 이미 너무 가까우면 이틀 전까지.
function dueOf(m, u, i) {
  let d = m.due || ''; const today = todayK();
  for (const e of ST().exams) { if (e.date < today) continue; for (const r of e.ranges) if (r.mat === m.id && i >= r.from && i <= r.to) { let k = dkey(dAdd(pDate(e.date), -Math.max(2, Math.round(dTo(e.date) * .2)))); if (k < dkey(dAdd(new Date(), 1))) k = dkey(dAdd(pDate(e.date), -1)); if (!d || k < d) d = k; } }
  if ((m.kind === 'hw' || m.kind === 'perf') && m.due) d = dkey(dAdd(pDate(m.due), -1)); // 숙제·수행평가는 그 전날까지
  if (!d && m.kind === 'book') { const e = ST().exams.filter(x => x.date > today && exSubs(x).includes(m.sub)).sort((x, y) => x.date.localeCompare(y.date))[0]; if (e) d = dkey(dAdd(pDate(e.date), -2)); } // v75: 마감 없는 교재도 그 과목 시험 이틀 전까지 고르게
  return d;
}

// v79: 회독·백지·필승노트는 뺌. 오늘부터 시험 전날까지 비율(a~b)로 문제집 풀기·오답 창
// v79: 교과서·프린트는 오답할 때 같이 보니 따로 안 넣는다. 기본 = 문제집 풀기 + 오답(학원 있는 과목은 학원 숙제만)
const STEPS = [
  { a: 0, b: .7, m: 50, n: 4, t: '문제집 풀기' },
  { a: .45, b: .95, m: 40, n: 2, t: '오답 정리' }];
const stepWin = (e, st) => { const N = Math.max(1, dTo(e.date) - 1), t0 = dAdd(new Date(), 0); if (st.last) { const k1 = dkey(dAdd(pDate(e.date), -1)); return [k1 < todayK() ? todayK() : k1, k1]; } return [dkey(dAdd(t0, Math.floor(N * st.a))), dkey(dAdd(t0, Math.max(Math.floor(N * st.a), Math.floor(N * st.b))))]; };
function phaseOf(dd) {
  if (dd < 0) return null;
  if (dd === 0) return ['시험 날', '오답만 한 번 훑고 들어가요'];
  if (dd <= 7) return ['마무리', '남은 문제집 풀고 오답 정리'];
  return ['시험까지', '문제집 풀기 → 오답, 학원 과목은 학원 숙제'];
}
const nextExam = () => ST().exams.filter(e => e.date >= todayK()).sort((a, b) => a.date.localeCompare(b.date))[0];

// ---------- 그날 빈 시간 ----------
function busyOn(d) {
  const L = [], k = dkey(d), wd = d.getDay();
  S.items.forEach(t => { if (t.done || !t.due || t.due.slice(0, 10) !== k || t.rid || !isEv(t)) return; /* v84: 할 일 마감은 시간을 막지 않음 */ const s = toM(t.due.slice(11, 16)); L.push([s, s + (t.mins || 60), t.text]); });
  (S.reps || []).forEach(r => { if (r.days.length && !r.days.includes(wd)) return; if ((S.repSkip || {})[r.id + '_' + k]) return; L.push([toM(r.time), toM(r.end || toT(toM(r.time) + 60)), r.text]); });
  return L.sort((a, b) => a[0] - b[0]);
}
const ACAD = /학원|클리닉|과외|수업/;
const SUBJN = /^(국어|영어|수학|사회|과학|한국사|역사|윤리|경제|물리|화학|생명|생명과학|지구|지구과학|정보|일본어|중국어|문학|독서|화법|언어|미적분|확통|기하)$/;
const isAcad = tx => ACAD.test(tx || '') || SUBJN.test(String(tx || '').replace(/[\s\d:~·-]/g, '')); // v94: '국어'처럼 과목 이름만 있는 고정 일정도 학원
// 학원 다니는 과목: 시간표(고정) 이름에 '과목+학원/클리닉/과외'가 있거나 그 과목 학원 숙제가 있으면
const acadSub = sub => (S.reps || []).some(r => r.text.includes(sub) && (ACAD.test(r.text) || r.text.replace(/[\s\d:~·-]/g, '').length <= sub.length + 1)) /* v86: 시간표에 '국어'처럼 과목 이름만 있어도 학원으로 봄 */ || ST().mats.some(m => m.kind === 'hw' && (m.sub === sub || (m.title || '').includes(sub)));
function freeIv(d, isToday, loose) {
  const P = ST().pref, we = d.getDay() === 0 || d.getDay() === 6; let s = toM(we ? P.weS : P.wdS); const e = toM(P.end);
  if (isToday) { const n = new Date(); s = Math.max(s, Math.ceil((n.getHours() * 60 + n.getMinutes() + 5) / 5) * 5); }
  const out = []; let cur = s;
  // v94: 학원 앞뒤로 1시간씩 비움(이동 시간), 다른 일정은 앞뒤 10분
  for (const [bs, be, tx] of busyOn(d)) { const g = isAcad(tx) && !loose ? 60 : 10; /* loose = 휴식 시간 자리 찾기(학원 앞뒤 1시간 규칙은 공부에만) */ if (be + g <= cur) continue; if (bs - g > cur) out.push([cur, Math.min(e, bs - g)]); cur = Math.max(cur, be + g); if (cur >= e) break; }
  if (cur < e) out.push([cur, e]);
  return out.filter(([a, b]) => b - a >= 30); // v84: 30분 안 되는 자투리는 안 씀
}

// ---------- 계산 ----------
function tasks() {
  const T = [], today = todayK();
  ST().mats.forEach((m, mi) => { if (!m.rep) return; const occ = []; for (let j = 0; j <= 35 && occ.length < 12; j++) { const d = dAdd(new Date(), j); if (m.rep.days.includes(d.getDay())) occ.push(dkey(d)); }
    occ.forEach((k2, j) => { const key = `${m.id}_${k2}`, due = dkey(dAdd(pDate(k2), -1)); if (ST().rev[key] || due < today) return; T.push({ key, rev: 1, tier: 1, mi, sub: m.sub, label: `숙제 · ${m.title} (${k2.slice(5).replace('-', '/')}까지)`, rem: m.rep.mins, due, from: j ? occ[j - 1] : today }); }); });
  ST().mats.forEach((m, mi) => m.units.forEach((u, i) => { if (u.done) return; const due = dueOf(m, u, i), tier = TIER[m.kind] == null ? 2 : TIER[m.kind], pre = m.kind === 'hw' ? '숙제 · ' : m.kind === 'perf' ? '수행 · ' : '';
    if (u.subs && u.subs.length) u.subs.forEach((x, si) => { if (x.done) return; T.push({ key: x.id, m, u, x, i: i * 100 + si, mi, tier, sub: m.sub, label: `${pre}${m.title} ${u.name} › ${x.name}`, rem: Math.max(5, x.mins - (x.prog || 0)), due, seq: m.kind === 'book' }); });
    else T.push({ key: u.id, m, u, i: i * 100, mi, tier, sub: m.sub, label: m.kind === 'book' ? `${m.title} ${u.name} 풀기` : `${pre}${m.title}${m.units.length > 1 ? ' ' + u.name : ''}`, rem: Math.max(5, u.mins - (u.prog || 0)), due, seq: m.kind === 'book' });
    if (m.kind === 'book' && !ST().rev[u.id + '_o']) T.push({ key: u.id + '_o', rev: 1, m, i: i * 100 + 99, mi, tier, sub: m.sub, label: `${m.title} ${u.name} 오답`, rem: Math.max(15, Math.round(u.mins / 3 / 5) * 5), due, seq: true }); }));
  ST().mats.forEach(m => m.units.forEach(u => { if (u.done && m.kind === 'book' && !ST().rev[u.id + '_o']) { const t = T.find(x => x.key === u.id + '_o'); if (!t) T.push({ key: u.id + '_o', rev: 1, m, i: -1, sub: m.sub, tier: 2, label: `${m.title} ${u.name} 오답`, rem: Math.max(15, Math.round(u.mins / 3 / 5) * 5), due: dueOf(m, u, m.units.indexOf(u)), seq: true }); } }));
  ST().exams.forEach(e => { if (e.date < today) return; exSubs(e).forEach(sub => { if (acadSub(sub) || ST().mats.some(m => m.kind === 'book' && m.sub === sub && m.units.length)) return; STEPS.forEach((st, j) => { const [from, day] = stepWin(e, st); for (let q = 0; q < st.n; q++) { const key = `${e.id}_${sub}_g${j}_${q}`; if (ST().rev[key] || day < today) continue; T.push({ key, rev: 1, tier: 2, sub, label: st.t, rem: st.m, due: day, from, mi: 50 + j }); } }); }); });
  // 끝낸 단원은 1·3·7일 뒤 짧게 다시 보기(간격 복습)
  // v79: 간격 복습(1·3·7일)은 뺌
  return T;
}
function simulate(nDays, capMode) {
  const st = ST(), P = st.pref, T = tasks().map(t => ({ ...t })), days = [], today = new Date(); today.setHours(0, 0, 0, 0);
  const fm = new Map(), freeMin = x => { const kk = dkey(x); if (!fm.has(kk)) fm.set(kk, freeIv(x, false).reduce((a, [p1, p2]) => a + p2 - p1, 0)); return fm.get(kk); };
  const eveSet = new Set(st.exams.map(e => dkey(dAdd(pDate(e.date), -1)))), acadEnd = x => (x.getDay() >= 1 && x.getDay() <= 5 && !eveSet.has(dkey(x))) ? Math.max(0, ...busyOn(x).filter(y => ACAD.test(y[2] || '')).map(y => y[1])) : 0, playOf = x => eveSet.has(dkey(x)) ? 0 : (x.getDay() === 0 || x.getDay() === 6) ? (P.wePlay || 0) : (P.wdPlay || 0); /* v96: 휴식 시간 다시(시험 전날만 0) */ const looseMin = x => freeIv(x, false, true).reduce((a, [p1, p2]) => a + p2 - p1, 0); /* 시험 전날은 휴식 시간 없이 필승노트 */ const dmax = x => { const we = x.getDay() === 0 || x.getDay() === 6, u = we ? P.weMax : P.wdMax, room = Math.max(0, freeMin(x) - Math.max(0, playOf(x) - Math.max(0, looseMin(x) - freeMin(x)))); /* 휴식은 학원 앞뒤 빈 시간에 먼저 들어감 */ return Math.min(room, u || Math.min(AUTO_CAP[we ? 1 : 0], Math.floor(room * .85 / 10) * 10)); };
  const kr = keepRate(), habit = we => Math.round((we ? 120 : 90) * (kr == null ? 1 : Math.max(.6, kr + .15)) / 10) * 10, adj = st.adj && st.adj.d === dkey(today) ? st.adj.mul : 1, focus = P.focus && P.focus.until >= dkey(today) ? P.focus.sub : '';
  for (let di = 0; di < nDays; di++) {
    const d = dAdd(today, di), k = dkey(d), we = d.getDay() === 0 || d.getDay() === 6;
    if (di === 0 && st.fix[k]) { // 손으로 고친 오늘은 그대로
      const blocks = st.fix[k].map(b => ({ s: b.s, e: b.e, sub: b.sub, parts: b.parts.map(p => { const t = T.find(x => x.key === p.key); if (t) t.rem = Math.max(0, t.rem - p.mins); return { t: t || { key: p.key, label: p.label, sub: b.sub, rev: 1 }, mins: p.mins }; }) }));
      days.push({ k, blocks, mins: blocks.reduce((a, b) => a + (b.e - b.s), 0), fixed: 1 }); continue;
    }
    // 고르게 나누기: 마감마다 (그때까지 할 양 ÷ 그때까지 쓸 수 있는 시간) 중 가장 큰 비율만큼만 오늘 한다
    let f = 0; const live = T.filter(t => t.rem > 0 && t.due);
    [...new Set(live.map(t => t.due))].forEach(dl => { const bef = live.filter(t => t.due <= dl), tmax = Math.max(...bef.map(t => t.tier || 0)), W = live.filter(t => t.due <= dl || (t.tier || 0) < tmax).reduce((a, t) => a + t.rem, 0); /* 우선순위가 높은 일은 먼저 하므로 함께 셈 */ let C = 0; for (let j = 0; dkey(dAdd(d, j)) <= dl && j < 90; j++) C += dmax(dAdd(d, j)); if (C <= 0) C = dmax(d); f = Math.max(f, W / C); });
    let cap = capMode === 'max' ? 24 * 60 : Math.min(dmax(d), Math.ceil(dmax(d) * Math.min(1, f * 1.1) / 10) * 10);
    if (capMode !== 'max' && T.some(t => t.rem > 0 && !t.due)) cap = Math.max(cap, Math.min(dmax(d), habit(we)));
    if (di === 0 && (capMode !== 'max' || adj < 1)) cap = Math.round(Math.min(cap, capMode === 'max' ? dmax(d) * 2 : cap) * adj / 10) * 10;
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
          const elig = T.filter(t => t.rem > 0 && (!t.from || t.from <= k) && (!t.seq || head.get(t.m) === t.i) && (daySubs.has(t.sub) || daySubs.size < lim || t.sub === focus || (t.rev && t.due === k)));
          if (!elig.length) break;
          // 우선순위: 수행평가 → 학원 숙제 → 개인 공부, 같은 단계 안에서는 마감 가까운 것부터
          elig.sort((x, y) => ((x.tier || 0) - (y.tier || 0)) || ((x.due || '9999') < (y.due || '9999') ? -1 : (x.due || '9999') > (y.due || '9999') ? 1 : (x.mi || 0) - (y.mi || 0)));
          const t0 = elig[0].tier || 0, near = elig.filter(t => (t.tier || 0) === t0);
          const pick = bsub ? (near.find(t => t.sub === bsub) || elig.find(t => t.sub === bsub) || null) : (near.find(t => t.sub === focus && t.sub !== last) || near.find(t => t.sub !== last) || near[0]);
          if (!pick) break;
          if (parts.length && pick.rem > left) break; // 자투리로 쪼개지 않음
          let use = Math.min(pick.rem, left); if (pick.rem - use > 0 && pick.rem - use < 15 && cur + (len - left) + pick.rem <= b) use = pick.rem; /* v84: 15분 미만 자투리는 남기지 않고 붙여서 끝냄 */ pick.rem -= use; left -= use; bsub = pick.sub; daySubs.add(pick.sub);
          parts.push({ t: pick, mins: use, late: pick.due && k > pick.due });
          if (pick.rem > 0) break;
        }
        if (!parts.length) break;
        const used = len - left, end = cur + used;
        blocks.push({ s: cur, e: end, sub: bsub, parts }); cap -= used; last = bsub; cur = end + 10;
      }
    }
    // 휴식 시간: 공부 블록 사이 빈 곳 중 가장 늦은 곳에 넣는다
    let play = null; const ae = 0, pl = playOf(d); if (ae) { const fs = (freeIv(d, di === 0)[0] || [0])[0]; if (fs - ae >= 60) play = { s: ae + 10, e: fs - 10, rest: 1 }; } /* 학원 끝나고 쉬는 시간 = 휴식 시간 */ if (pl >= 20) { const gaps = []; for (const [a, b] of freeIv(d, di === 0, true)) { let c0 = a; blocks.filter(x => x.s >= a && x.e <= b).sort((x, y) => x.s - y.s).forEach(x => { if (x.s - 10 - c0 >= 20) gaps.push([c0, x.s - 10]); c0 = x.e + 10; }); if (b - c0 >= 20) gaps.push([c0, b]); } const g = gaps.sort((x, y) => (y[1] - y[0] >= pl) - (x[1] - x[0] >= pl) || y[0] - x[0])[0]; if (g) play = { s: g[0], e: Math.min(g[1], g[0] + pl) }; }
    days.push({ k, blocks, play, mins: blocks.reduce((a, b) => a + (b.e - b.s), 0) });
  }
  const left = T.filter(t => t.rem > 0 && t.due), late = [];
  days.forEach(D => D.blocks.forEach(b => b.parts.forEach(p => { if (p.late && !p.t.soft && !late.includes(p.t)) late.push(p.t); })));
  left.forEach(t => { if (!t.soft && !late.includes(t) && t.due < dkey(dAdd(today, nDays))) late.push(t); });
  return { days, late };
}
function horizon() { let far = dkey(dAdd(new Date(), 31)); ST().mats.forEach(m => m.units.forEach((u, i) => { const d = dueOf(m, u, i); if (d && d > far) far = d; })); ST().exams.forEach(e => { if (e.date > far) far = e.date; }); return Math.min(70, dTo(far) + 1); }
let cache = null;
// v93: 대화로 들어온 반복 일정·교재·시험에 빈 칸이 있어도 계산이 멈추지 않게 정리
function tidy() { (S.reps || []).forEach(r => { r.text = String(r.text || '일정'); if (!Array.isArray(r.days)) r.days = []; if (!/^\d\d:\d\d$/.test(r.time || '')) r.time = '00:00'; });
  const st = ST(); st.mats = (st.mats || []).filter(Boolean); st.mats.forEach(m => { m.sub = String(m.sub || '기타'); m.title = String(m.title || (m.kind === 'hw' ? '숙제' : '문제집')); if (!Array.isArray(m.units)) m.units = []; });
  st.exams = (st.exams || []).filter(e => e && e.date); st.exams.forEach(e => { if (!Array.isArray(e.subs)) e.subs = []; if (!Array.isArray(e.ranges)) e.ranges = []; }); }
const EMPTY = { days: [], late: [] };
function splan() {
  try { tidy(); } catch (e) {}
  const sig = JSON.stringify([S.study, S.reps, S.items.filter(t => t.due && !t.done).map(t => t.due), todayK(), Math.floor(Date.now() / 300000)]);
  if (cache && cache.sig === sig) return cache;
  let r, strained = false; const n = (() => { try { return horizon(); } catch (e) { return 31; } })();
  try { r = simulate(n); } catch (e) { console.warn('plan', e); S.planErr = String(e && e.message || e).slice(0, 120); cache = { sig, ...EMPTY, strained }; return cache; }
  S.planErr = '';
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
  b.parts.forEach(p => { const key = p.t ? p.t.key : p.key; if (/^free_/.test(key)) return; let u = null, sx = null; st.mats.forEach(m => m.units.forEach(x => { if (x.id === key) u = x; (x.subs || []).forEach(y => { if (y.id === key) { sx = y; u = x; } }); })); if (sx) { sx.prog = (sx.prog || 0) + p.mins; if (sx.prog >= sx.mins - 1) sx.done = true; u.prog = u.subs.reduce((a, y) => a + Math.min(y.mins, y.prog || 0), 0); if (u.subs.every(y => y.done)) u.done = true; } if (u && sx && !u.done) {} else if (u) { u.prog = (u.prog || 0) + p.mins; if (u.prog >= u.mins - 1 && !u.done) { u.done = true; u.doneAt = Date.now(); const m = st.mats.find(mm => mm.units.includes(u));  } } else st.rev[key] = 1; });
  st.revq = st.revq.filter(q => !st.rev[q.key] && q.at >= dkey(dAdd(new Date(), -3))).slice(-120);
  (st.log[k] = st.log[k] || []).push({ s: b.s, e: b.e, sub: b.sub, label: b.parts.map(p => (p.t || p).label).join(' / '), mins: b.e - b.s });
  if (st.fix[k]) st.fix[k] = st.fix[k].filter(x => x.s !== b.s);
  const ks = Object.keys(st.log).sort(); while (ks.length > 60) delete st.log[ks.shift()];
  save(); dirty(); pushSync(true); renderHome();
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
SH.tt = { t: '시간표', s: () => '이번 주 — 고정·한 번만·공부를 한 장에', r: B => { boardTab = 'tt'; _br(B); } };
const _ob = openBoard; openBoard = function (tab) { if (tab === 'cal' || tab === 'week') return openSheet('cal'); if (tab === 'tt') return openSheet('tt'); if (tab === 'study') return openSheet(6); _ob(tab); };

// 달력 칸이 좁아서 시험 이름은 짧게(중간·기말·수행…), 전체 이름은 아래 그날 목록에
const exShort = n => { const m = String(n).match(/중간|기말|모의|수행|듣기|쪽지|실기|퀴즈/); return m ? m[0] : String(n).replace(/\s/g, '').slice(0, 3); };
// ---------- 캘린더 ----------
function renderCal(B) {
  boardTabs(B);
  const now = new Date(); calM = calM || new Date(now.getFullYear(), now.getMonth(), 1); calSel = calSel || dkey(now);
  const P = splan(), pm = {}; P.days.forEach(D => pm[D.k] = D);
  const PP = el('div', 'sheetp calp'); PP.append(el('i', 'tape'), el('i', 'tape r'));
  const H = el('div', 'calh'); H.append(btn('‹', 'ghost', () => { calM = new Date(calM.getFullYear(), calM.getMonth() - 1, 1); refreshSheet(); }), (() => { const b = el('b'); b.innerHTML = `${calM.getMonth() + 1}월 <em>${calM.getFullYear()}</em>`; return b; })(), btn('›', 'ghost', () => { calM = new Date(calM.getFullYear(), calM.getMonth() + 1, 1); refreshSheet(); })); PP.appendChild(H);
  const G = el('div', 'cal'); [...'일월화수목금토'].forEach((w, i) => G.appendChild(el('div', 'wd' + (i === 0 ? ' su' : i === 6 ? ' sa' : ''), w)));
  const start = new Date(calM); start.setDate(1 - calM.getDay());
  for (let i = 0; i < 42; i++) {
    const d = dAdd(start, i), k = dkey(d); if (i >= 35 && d.getMonth() !== calM.getMonth()) break;
    const c = el('button', (d.getMonth() !== calM.getMonth() ? 'out ' : '') + (k === dkey(now) ? 'td ' : '') + (k === calSel ? 'sel' : ''));
    c.appendChild(el('span', 'dn', String(d.getDate())));
    { const E = ST().exams.filter(e => e.date === k); if (E.length) { c.classList.add('exd'); c.appendChild(el('span', 'ex', exShort(E[0].name) + (E.length > 1 ? `+${E.length - 1}` : ''))); } }
    const ds = el('div', 'ds');
    S.items.filter(t => t.due && t.due.slice(0, 10) === k && !t.rid).slice(0, 4).forEach(() => { const x = el('i'); x.style.background = 'var(--pink)'; ds.appendChild(x); });
    ST().mats.filter(m => m.kind === 'hw' && m.due === k && m.units.some(u => !u.done)).forEach(() => { const x = el('i'); x.style.background = '#e0b800'; ds.appendChild(x); });
    if ((S.reps || []).some(r => !r.days.length || r.days.includes(d.getDay()))) { const x = el('i'); x.style.background = '#5b8fe0'; ds.appendChild(x); }
    c.appendChild(ds);
    const D = pm[k], lg = (ST().log[k] || []).reduce((a, b) => a + b.mins, 0), mins = (D ? D.mins : 0) + lg;
    if (mins) { const sb = el('div', 'sb'), bb = el('b'); bb.style.width = Math.min(100, mins / 300 * 100) + '%'; sb.appendChild(bb); c.appendChild(sb); }
    c.onclick = () => { calSel = k; refreshSheet(); };
    G.appendChild(c);
  }
  PP.appendChild(G);
  const LG = el('div', 'calg'); [['dot', 'var(--pink)', '일정'], ['dot', '#e0b800', '숙제'], ['dot', '#5b8fe0', '학원'], ['ex', '', '시험'], ['bar', '', '공부량']].forEach(([k, c, l]) => { const s = el('span', null, l), i = el('i', k); if (c) i.style.background = c; s.prepend(i); LG.appendChild(s); }); PP.appendChild(LG);
  B.appendChild(PP);
  dayPaper(B, calSel, pm[calSel]);
}
// v79: 하루 종이 시간표(공부 오늘 화면과 같은 모양) — 시험·고정·일정·할 일·공부·휴식 시간, 같은 시각·같은 글은 한 번만
function dayPaper(B, k, D) {
  const d = pDate(k), isT = k === todayK(), lg = ST().log[k] || [], rows = [], seen = new Set();
  const add = (s, o) => { const key = s + '|' + (o.txt || '') + '|' + (o.sub || ''); if (seen.has(key)) return; seen.add(key); rows.push({ s, ...o }); };
  ST().exams.filter(e => e.date === k).forEach(e => add(-1, { kind: 'ex', txt: `${e.name} 시험 · ${exSubs(e).join('·')}` }));
  (S.reps || []).filter(r => (!r.days.length || r.days.includes(d.getDay())) && !(S.repSkip || {})[r.id + '_' + k]).forEach(r => add(toM(r.time), { kind: 'fix', txt: `${r.text} ~${r.end || ''}` }));
  S.items.filter(t => !t.rid && t.due && t.due.slice(0, 10) === k).forEach(t => add(toM(t.due.slice(11, 16)), { kind: t.kind === 'event' ? 'ev' : 'todo', txt: t.kind === 'event' ? t.text : `${t.text} (마감)`, done: t.done }));
  lg.forEach(l => add(l.s, { kind: 'log', sub: l.sub, txt: l.label, mins: l.mins }));
  (D ? D.blocks : []).forEach(b => add(b.s, { kind: 'st', sub: b.sub, txt: b.parts.map(p => p.t.label).join(' + '), mins: b.e - b.s, b }));
  if (D && D.play) add(D.play.s, { kind: 'play', txt: `휴식 시간 ${D.play.e - D.play.s}분`, mins: D.play.e - D.play.s });
  const tot = (D ? D.mins : 0) + lg.reduce((a, x) => a + x.mins, 0);
  const sp = el('div', 'sheetp'); sp.style.marginTop = '12px'; sp.append(el('i', 'tape'), el('i', 'tape r'));
  const hd = el('div', 'hd'); hd.append(el('b', null, `${d.getMonth() + 1}월 ${d.getDate()}일 ${WD[d.getDay()]}요일`), el('span', null, tot ? hm(tot) : '공부 없음')); sp.appendChild(hd);
  const sw = (sb, txt) => { const w = el('span'), i2 = el('i', null, sb); i2.style.setProperty('--c', colOf(sb)); w.append(i2, document.createTextNode(txt)); return w; };
  rows.sort((a, b) => a.s - b.s).forEach(o => {
    const r = el('div', 'pr' + (o.kind === 'fix' ? ' pfx' : o.kind === 'play' ? ' pplay' : o.kind === 'log' || o.done ? ' done' : '')), t = el('span', 't');
    t.append(document.createTextNode(o.s < 0 ? '시험' : toT(o.s))); if (o.mins && o.kind !== 'play') t.appendChild(el('small', null, `${o.mins}분`));
    const w = el('span', 'w'); if (o.sub) w.appendChild(sw(o.sub, o.txt)); else w.textContent = (o.kind === 'ev' ? '일정 · ' : o.kind === 'todo' ? '할 일 · ' : '') + o.txt; r.append(t, w);
    if (o.kind === 'log') r.appendChild(el('span', 'st', '✓'));
    else if (o.kind === 'st' && isT) { const ok = el('button', 'st'); ok.setAttribute('aria-label', '끝냄'); ok.onclick = () => { finishBlock(o.b); refreshSheet(); toast('한 블록 끝! 수고했어요.'); }; r.appendChild(ok); }
    sp.appendChild(r); });
  if (!rows.length) sp.appendChild(el('div', 'pempty', '이날은 비어 있어요.'));
  sp.appendChild(el('div', 'pfoot', '일정·할 일은 1번 전단지에서 붙여요. 고정 일정은 3번 시간표에서.'));
  B.appendChild(sp);
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
  if (!e) { L.append(el('small', null, '다가오는 시험'), el('div', 'dnm', '아직 없어요')); top.append(L, el('div', 'ddn', '평소')); f.append(top, el('p', null, '시험을 넣으면 오늘부터 시험까지 문제집 풀기·오답을 고르게 나눠 짜요.')); B.appendChild(f); return; }
  const dd = dTo(e.date); L.append(el('small', null, `${e.date.slice(5).replace('-', '/')} 시험까지`), el('div', 'dnm', e.name)); const dn = el('div', 'ddn'); if (dd) { dn.append(el('em', null, 'D-'), document.createTextNode(dd)); } else dn.append(el('em', null, 'D-'), document.createTextNode('DAY')); top.append(L, dn); f.appendChild(top);
  const G = el('div', 'stg'), wins = STEPS.map(stp => stepWin(e, stp)), tk = todayK(), stages = [['문제집 풀기', 0], ['오답', 1], ['시험', -1]]; let cur = dd <= 0 ? 2 : wins[1][0] <= tk ? 1 : 0;
  stages.forEach(([n], k) => G.appendChild(el('span', k < cur ? 'past' : k === cur ? 'cur' : '', n)));
  f.append(G, el('p', null, dd <= 0 ? '오늘 시험이에요. 오답만 한 번 훑고 가요.' : '문제집 풀고 → 틀린 건 오답(교과서·프린트 같이 보기). 학원 다니는 과목은 학원 숙제만 넣어요.')); B.appendChild(f);
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
  const list = [...lg.map(l => ({ s: l.s, lg: l })), ...D.blocks.map((b, i) => ({ s: b.s, b, i })), ...fixd.map(f => ({ s: f[0], fx: f })), ...(D.play ? [{ s: D.play.s, pl: D.play }] : [])].sort((a, b) => a.s - b.s);
  const subWord = (sb, txt) => { const w = el('span'), i2 = el('i', null, sb); i2.style.setProperty('--c', colOf(sb)); w.append(i2, document.createTextNode(txt)); return w; };
  list.forEach(x => {
    if (x.pl) { const r = el('div', 'pr pplay'); r.append(el('span', 't', toT(x.pl.s)), el('span', 'w', `휴식 시간 ${x.pl.e - x.pl.s}분 — 푹 쉬어요`)); sp.appendChild(r); return; }
    if (x.fx) { const r = el('div', 'pr pfx'); r.append(el('span', 't', toT(x.fx[0])), el('span', 'w', `${x.fx[2] || '일정'} ~${toT(x.fx[1])}`)); sp.appendChild(r); return; }
    if (x.lg) { const r = el('div', 'pr done'), t = el('span', 't'); t.append(document.createTextNode(toT(x.lg.s)), el('small', null, `${x.lg.mins}분`)); const w = el('span', 'w'); w.appendChild(subWord(x.lg.sub, x.lg.label)); const st2 = el('span', 'st', '✓'); st2.setAttribute('aria-label', '끝냄'); r.append(t, w, st2); sp.appendChild(r); return; }
    const b = x.b, i = x.i, r = el('div', 'pr' + (ed === i ? ' ed' : '')), t = el('span', 't'); t.append(document.createTextNode(toT(b.s)), el('small', null, `${b.e - b.s}분`));
    const w = el('button', 'w'); w.appendChild(subWord(b.sub, b.parts.map(p => p.t.label).join(' + '))); w.onclick = () => { ed = ed === i ? -1 : i; edMode = ''; addOpen = false; refreshSheet(); };
    const ok = el('button', 'st'); ok.setAttribute('aria-label', '끝냄'); ok.onclick = () => { finishBlock(b); ed = -1; refreshSheet(); toast('한 블록 끝! 수고했어요.'); };
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
  const play = (lab, key) => { const r = el('div', 'r'), S3 = el('div', 'step'); S3.append(btn('−', 'ghost', () => { P[key] = Math.max(0, (P[key] || 0) - 30); up(); }), el('b', null, P[key] ? hm(P[key]) : '없음'), btn('+', 'ghost', () => { P[key] = Math.min(300, (P[key] || 0) + 30); up(); })); r.append(el('span', null, lab), S3); return r; };
  const cnt = (lab, key) => { const r = el('div', 'r'), S3 = el('div', 'step'); S3.append(btn('−', 'ghost', () => { P[key] = Math.max(1, P[key] - 1); up(); }), el('b', null, `${P[key]}과목`), btn('+', 'ghost', () => { P[key] = Math.min(6, P[key] + 1); up(); })); r.append(el('span', null, lab), S3); return r; };
  c.append(time('평일 시작', 'wdS'), time('주말 시작', 'weS'), time('끝 (잘 준비)', 'end'), cap('평일 하루 최대', 'wdMax', 0), cap('주말 하루 최대', 'weMax', 1), cnt('평일 과목 수', 'wdSubs'), cnt('주말 과목 수', 'weSubs'), play('평일 휴식 시간', 'wdPlay'), play('주말 휴식 시간', 'wePlay'));
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
    // v81: 시험 = 종이 한 장(테이프·D-숫자 도장·과목 형광펜 줄)
    const dd = dTo(e.date), c = el('div', 'sheetp exp' + (n ? ' sm' : '')), dt = pDate(e.date);
    c.append(el('i', 'tape'), el('i', 'tape r'));
    const h = el('div', 'exh'), dn = el('div', 'exd' + (dd <= 7 ? ' hot' : ''), dd ? `D-${dd}` : 'D-DAY'), nm = el('div', 'exn');
    nm.append(el('b', null, e.name), el('small', null, `${dt.getMonth() + 1}월 ${dt.getDate()}일 ${WD[dt.getDay()]}요일`));
    h.append(dn, nm, xbtnS(() => { if (!confirm(`'${e.name}' 지울까요?`)) return; ST().exams = ST().exams.filter(x => x !== e); save(); dirty(); refreshSheet(); })); c.appendChild(h);
    if (n === 0) { // 과목마다 기본으로 뭘 넣는지
      const W = el('div', 'exl'); exSubs(e).forEach(sb => { const r = el('div', 'exr'), lb = el('i', null, sb), lw = el('span', 'exk'), bk = ST().mats.filter(m => m.kind === 'book' && m.sub === sb && m.units.length), rg = e.ranges.map(x => [x, matOf(x.mat)]).filter(([, m]) => m && m.sub === sb);
        lb.style.setProperty('--c', colOf(sb)); const ac = acadSub(sb) && !bk.length, tx = el('span', ac ? 'ac' : null, ac ? '학원 숙제만' : bk.length ? bk.map(m => `${m.title} 풀기 → 오답`).join(' · ') : '문제집 풀기 → 오답');
        rg.forEach(([x, m]) => tx.appendChild(el('small', null, `${m.title} ${m.units[x.from] ? m.units[x.from].name : ''}~${m.units[x.to] ? m.units[x.to].name : ''}`)));
        lw.appendChild(lb); r.append(lw, tx); W.appendChild(r); });
      c.appendChild(W);
    } else { const sp = el('div', 'exs'); exSubs(e).forEach(sb => { const i = el('i', null, sb); i.style.setProperty('--c', colOf(sb)); sp.appendChild(i); }); c.appendChild(sp); }
    B.appendChild(c);
  });
  if (!E.length && !formOpen) B.appendChild(el('div', 'hint', '시험을 넣으면 오늘부터 시험까지 문제집 풀기·오답을 나눠 넣어요. 학원 다니는 과목은 학원 숙제만.'));
  if (!formOpen) { B.appendChild(row(btn('+ 시험 넣기', 'teal wide', () => { formOpen = true; refreshSheet(); }))); return; }
  const f = el('div', 'card frm'), nm = inp('text', '시험 이름 (예: 2학기 기말)'), dt = inp('date', '', ''); let sel = [];
  const sp = el('div', 'pills'); [...new Set([...subs(), ...SUBP])].forEach(s => { const b = el('button', null, s); b.onclick = () => { sel = sel.includes(s) ? sel.filter(x => x !== s) : [...sel, s]; b.classList.toggle('on'); }; sp.appendChild(b); });
  const R = el('div', 'frm'), ranges = [];
  const addR = () => { const books = ST().mats.filter(m => m.kind === 'book'); if (!books.length) { toast('문제집은 "과목·교재"에서 먼저 넣어요(이름만).'); return; } const ms = el('select', 'in'), fr = inp('number', '시작', '1'), to = inp('number', '끝', '5');
    books.forEach(m => ms.appendChild(Object.assign(document.createElement('option'), { value: m.id, textContent: `${m.sub} · ${m.title}` }))); fr.style.maxWidth = to.style.maxWidth = '90px';
    ranges.push({ ms, fr, to }); R.append(row(ms), row(fr, el('span', 'hint', '~'), to, el('span', 'hint', '단원'))); };
  f.append(row(nm), row(el('span', 'hint', '시험 날'), dt), el('div', 'hint', '시험 과목 (여러 개)'), sp, R, row(btn('+ 문제집 범위 (선택)', 'ghost wide', addR)), row(btn('취소', 'ghost', () => { formOpen = false; refreshSheet(); }), btn('넣기', 'teal wide', () => {
    if (!nm.value.trim() || !dt.value) { toast('시험 이름과 날짜를 넣어 주세요.'); return; }
    const rg = ranges.map(o => { const m = matOf(o.ms.value); if (!m) return null; const [a2, b2] = ensureUnits(m, Math.max(1, +o.fr.value || 1), Math.max(1, +o.to.value || +o.fr.value || 1)); return { mat: m.id, from: a2, to: b2 }; }).filter(Boolean);
    if (!sel.length && !rg.length) { toast('시험 과목을 하나 이상 골라 주세요.'); return; }
    addExam({ name: nm.value.trim(), date: dt.value, subs: sel, ranges: rg }); formOpen = false; dirty(); pushSync(true); refreshSheet(); toast('넣었어요. 오늘부터 시험 전날까지 나눠 짤게요.'); })));
  B.appendChild(f);
}
function stMat(B) {
  ST().mats.slice().sort((a, b) => a.sub.localeCompare(b.sub)).forEach(m => {
    const c = el('div', 'mat paperc slim' + (m.kind === 'hw' ? ' yel' : '')), h = el('div', 'h'), dn = m.units.filter(u => u.done).length;
    h.append(chip(m.sub), el('b', null, (m.kind === 'hw' ? (/^숙제$/.test(m.title) ? '학원 ' : '숙제 · ') : m.kind === 'perf' ? '수행 · ' : '') + m.title), el('em', null, m.rep ? `매주 ${m.rep.days.slice().sort().map(d => WD[d]).join('·')} · ${m.rep.mins}분` : m.kind !== 'book' ? (m.due ? `${m.kind === 'perf' ? '수행' : '학원'} ${m.due.slice(5).replace('-', '/')}` : '') : !m.units.length ? '시험 범위를 넣으면 단원이 생겨요' : `${dn}/${m.units.length} · ${hm(m.units.filter(u => !u.done).reduce((a, u) => a + Math.max(0, u.mins - (u.prog || 0)), 0))} 남음`), xbtnS(() => { if (!confirm(`'${m.title}' 지울까요?`)) return; ST().mats = ST().mats.filter(x => x !== m); ST().exams.forEach(e => e.ranges = e.ranges.filter(r => r.mat !== m.id)); save(); dirty(); refreshSheet(); }));
    const pg = el('div', 'pg'), i = el('i'); i.style.width = (m.units.length ? dn / m.units.length * 100 : 0) + '%'; pg.appendChild(i); c.append(h, pg);
    c.onclick = ev => { if (ev.target.closest('.x') || ev.target.closest('.us') || ev.target.closest('.row')) return; openMat = openMat === m.id ? null : m.id; refreshSheet(); };
    if (openMat === m.id) {
      const U = el('div', 'us'); m.units.forEach(u => { const b = el('button', u.done ? 'd' : '', u.name + (u.subs ? ` (${u.subs.length})` : '')); b.onclick = () => { u.done = !u.done; u.prog = u.done ? u.mins : 0; (u.subs || []).forEach(y => { y.done = u.done; y.prog = u.done ? y.mins : 0; }); save(); dirty(); refreshSheet(); }; U.appendChild(b);
        if (u.subs) { const W2 = el('div', 'us2'); u.subs.forEach(y => { const yb = el('button', y.done ? 'd' : '', `${y.name} ${y.mins}분`); yb.onclick = () => { y.done = !y.done; y.prog = y.done ? y.mins : 0; u.done = u.subs.every(z => z.done); u.prog = u.subs.reduce((a2, z) => a2 + (z.prog || 0), 0); save(); dirty(); refreshSheet(); }; W2.appendChild(yb); }); U.appendChild(W2); } }); c.appendChild(U);
      const mi = inp('number', '분', String(m.units[0] ? m.units[0].mins : 40)); mi.style.maxWidth = '80px';
      if (!m.units.some(u => u.subs)) c.appendChild(row(el('span', 'hint', m.kind !== 'book' ? '걸리는 분' : '하나에 걸리는 분'), mi, btn('바꾸기', 'ghost', () => { const v = Math.max(10, Math.min(600, +mi.value || 40)); m.units.forEach(u => u.mins = v); save(); dirty(); refreshSheet(); toast(`${v}분으로 다시 짰어요.`); })));
    }
    B.appendChild(c);
  });
  if (ST().mats.length && !formOpen) B.appendChild(el('div', 'hint', '누르면 단원이 펼쳐져요. 끝낸 단원을 누르면 체크돼요.'));
  if (!ST().mats.length && !formOpen) B.appendChild(el('div', 'hint', '문제집·교과서·학원 숙제를 넣으면 진도에 맞춰 나눠 넣어요.'));
  if (!formOpen) { B.appendChild(row(btn('+ 교재·숙제 넣기', 'teal wide', () => { formOpen = true; refreshSheet(); }))); return; }
  const f = el('div', 'card frm'); let kind = 'book', sb = '', days = [], other = false;
  const sbIn = inp('text', '과목 직접 쓰기'), tt = inp('text', ''), mn = inp('number', '분', '60'), du = inp('date', '', '');
  const kinds = el('div'), sp = el('div', 'pills'), box = el('div', 'frm');
  const draw = () => {
    kinds.innerHTML = ''; kinds.appendChild(pills([['book', '문제집'], ['hw', '학원 숙제'], ['perf', '수행평가']], kind, v => { kind = v; mn.value = v === 'book' ? '60' : '40'; draw(); }));
    sp.innerHTML = ''; [...new Set([...subs(), ...SUBP])].filter(x => x !== '학원').forEach(x => { const b = el('button', sb === x ? 'on' : '', x); b.onclick = () => { sb = sb === x ? '' : x; other = false; sbIn.value = ''; draw(); }; sp.appendChild(b); }); const ob = el('button', other ? 'on' : '', '다른 과목'); ob.onclick = () => { other = !other; sb = ''; draw(); }; sp.appendChild(ob); sbIn.style.display = other ? '' : 'none';
    box.innerHTML = ''; tt.style.display = kind === 'perf' ? 'none' : '';
    if (kind === 'book') { tt.placeholder = '문제집 이름 (안 써도 돼요)'; box.append(row(el('span', 'hint', '단원 하나 대충'), mn, el('span', 'hint', '분')), el('div', 'hint', '단원은 안 넣어도 돼요. 시험 탭에서 범위(몇~몇 단원)를 넣으면 레나가 단원을 만들어 시험까지 나눠요.')); }
    else if (kind === 'hw') { tt.placeholder = '숙제 이름 (예: 수학 클리닉 숙제)'; const W2 = el('div', 'pills'); [1, 2, 3, 4, 5, 6, 0].forEach(d => { const b = el('button', days.includes(d) ? 'on' : '', WD[d]); b.onclick = () => { days = days.includes(d) ? days.filter(x => x !== d) : [...days, d]; draw(); }; W2.appendChild(b); }); box.append(el('div', 'hint', '무슨 요일까지 해야 돼요? (매주 반복 — 그 요일 전날까지 끝내게 넣어요)'), W2); }
    else { tt.placeholder = '수행평가 (예: 국어 발표 준비)'; box.append(row(el('span', 'hint', '대충 걸리는 시간'), mn, el('span', 'hint', '분')), row(el('span', 'hint', '수행평가 날'), du)); }
  };
  f.append(kinds, sp, row(sbIn), row(tt), box, row(btn('취소', 'ghost', () => { formOpen = false; refreshSheet(); }), btn('넣기', 'teal wide', () => {
    const x = sbIn.value.trim() || sb || (kind === 'hw' ? '학원' : ''); if (!x) { toast('과목을 골라 주세요.'); return; } if (kind === 'hw' && !tt.value.trim()) { toast('숙제 이름을 넣어 주세요.'); return; }
    const title = tt.value.trim() || (kind === 'perf' ? '수행평가' : '문제집');
    if (kind === 'hw' && !days.length) { toast('무슨 요일까지 해야 하는지 골라 주세요.'); return; }
    if (kind === 'perf' && !du.value) { toast('수행평가 날짜를 넣어 주세요.'); return; }
    const m = addMat({ sub: x, title, kind, mins: kind === 'hw' ? 40 : +mn.value || 60, days: kind === 'hw' ? days : null, due: kind === 'perf' ? du.value : '' }); formOpen = false; dirty(); pushSync(true); refreshSheet(); toast(kind === 'book' ? `${m.title} 넣었어요. 시험 범위를 넣으면 나눠 줄게요.` : `${m.sub} · ${m.title} 넣었어요.`); })));
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
  return s.replace('JSON만 출력:', `- 공부: 교재·문제집(몇 단원/몇 쪽), 학원 숙제, 시험 날짜·과목·범위를 말하면 study에 넣는다. study={"mats":[{"sub":"과목","title":"교재 이름","kind":"perf|hw|book"(perf=학교 수행평가 준비, hw=학원 숙제, book=문제집·교재 개인 공부),"from":1,"to":12,"unit":"단원|쪽","chunk":쪽일 때 덩어리 쪽수,"outline":"단원·소단원을 말하면 줄마다(소단원은 앞에 - , 끝에 걸리는 분 숫자)","mins":단원 하나(숙제·수행평가면 전체) 걸리는 분(모르면 40),"days":[학원 숙제면 학원 가는 요일 번호들, 일0 월1 … 토6 — 매주 반복],"due":"YYYY-MM-DD 수행평가면 그 날"}],"exams":[{"name":"시험 이름","date":"YYYY-MM-DD","subs":["과목"],"ranges":[{"sub":"과목","title":"교재 이름","from":시작 번호,"to":끝 번호}]}]}. 교재·시험이 이미 아래 목록에 있으면 mats/exams에 다시 넣지 않는다(날짜·범위가 바뀌었을 때만 같은 이름으로 다시 보낸다). 계획은 앱이 오늘부터 시험까지 빈 시간에 짠다(4번 공부). 기본 = 문제집 풀기 + 오답, 학원 다니는 과목은 학원 숙제만. 회독·백지 복습·필승노트·기출은 넣지 않는다.
- 공부 계획 고치기: 송휘이 공부 시간·양·순서를 바꿔 달라고 하면 study.set에 바꿀 것만 넣는다. set={"wdS":"HH:MM 평일 시작","weS":"HH:MM 주말 시작","end":"HH:MM 끝","wdMax":평일 하루 최대 분(0=자동),"weMax":주말 하루 최대 분(0=자동),"wdSubs":평일 과목 수,"weSubs":주말 과목 수,"block":한 블록 분(30~90),"focus":"먼저 할 과목"(없애려면 ""),"focusDays":며칠 동안,"today":"less|off|more|normal"(오늘만 조금/쉬기/더/원래대로)}. 피곤하다·아프다면 today:"less"나 "off"를 권하고, 바꾼 뒤엔 reply에서 짧게 무엇을 바꿨는지 말한다.
지금 공부 설정: ${JSON.stringify({ wdS: st.pref.wdS, weS: st.pref.weS, end: st.pref.end, wdMax: st.pref.wdMax || '자동', weMax: st.pref.weMax || '자동', wdSubs: st.pref.wdSubs, weSubs: st.pref.weSubs, block: st.pref.block, focus: st.pref.focus && st.pref.focus.sub || '' })} 오늘 계획: ${(() => { try { const D = splan().days[0]; return D.blocks.map(b => `${toT(b.s)} ${b.sub} ${b.parts.map(p => p.t.label).join('+')}`).join(', ') || '없음'; } catch (e) { return '?'; } })()}
지금 공부 목록: ${JSON.stringify(st.mats.map(m => `${m.sub}/${m.title}(${m.kind === 'hw' ? '숙제' : m.kind === 'perf' ? '수행평가' : m.units.length + '개'}, 남은 ${m.units.filter(u => !u.done).length})`).slice(0, 20))} 시험: ${JSON.stringify(st.exams.map(e => `${e.name} ${e.date} ${exSubs(e).join('·')}`))}
JSON만 출력:`).replace(/"follow":\[\]\}/, '"follow":[],"study":{"mats":[],"exams":[],"set":{}}}');
};
const _ap = apply; apply = function (r) {
  const res = _ap(r), x = r && r.study, got = [];
  if (x && typeof x === 'object') {
    (x.mats || []).forEach(o => { if (!o || !o.title) return; if (findMat(o)) return; const m = addMat({ ...o, unit: o.unit === '쪽' ? '쪽' : '단원' }); got.push(`${m.sub} ${m.title}`); });
    (x.exams || []).forEach(o => { if (!o || !o.name || !/^\d{4}-\d\d-\d\d$/.test(o.date || '')) return; const ranges = (o.ranges || []).map(rg => { if (!rg || !rg.title) return null; let m = ST().mats.find(mm => mm.kind === 'book' && mm.title === rg.title) || ST().mats.find(mm => mm.kind === 'book' && (mm.title.includes(rg.title) || rg.title.includes(mm.title))); if (!m) m = addMat({ sub: rg.sub, title: rg.title, kind: 'book' }); const [fi, ti] = ensureUnits(m, Math.max(1, +rg.from || 1), Math.max(1, +rg.to || +rg.from || 1)); return { mat: m.id, from: fi, to: ti }; }).filter(Boolean); const subs2 = [...(o.subs || []), ...(o.ranges || []).map(rg => rg && rg.sub).filter(Boolean)], ex = findExam(o); if (ex) { if (mergeExam(ex, o.date, subs2, ranges)) got.push(`시험 ${ex.name} 고침`); return; } addExam({ name: o.name, date: o.date, subs: subs2, ranges }); got.push(`시험 ${o.name}`); });
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
try { dedupExams(); if (window.dedupItems && dedupItems()) save(); } catch (e) {}
window.lenaStudy = { dedupExams, findExam, tab: v => { sub = v; ed = -1; addOpen = formOpen = timeOpen = false; }, keepRate, colOf, plan: () => splan(), splan: () => { dirty(); return splan(); }, tasks, parseOutline, simulate, freeIv, addMat, addExam, finishBlock, dirty, freeze, phaseOf };
})();
