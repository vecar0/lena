// 공부 플래너: 캘린더 · 과목/교재/문제집/학원 숙제/시험 범위 · 빈 시간에 맞춘 오늘 공부 계획(무슨 과목 무슨 책 몇 단원을 몇 시부터 몇 분)
// app.js·proactive.js·follow.js·plan.js 뒤에 불러온다. 전단지 시트 탭: 오늘 / 캘린더 / 시간표 / 공부 / 할 일
'use strict';
(() => {
const css = `
.cal{display:grid;grid-template-columns:repeat(7,1fr);gap:3px}
.cal .wd{text-align:center;font-size:11.5px;font-weight:800;color:var(--mute);padding:2px 0}
.cal .wd.su{color:#ff7a9c}.cal .wd.sa{color:#7fb6ff}
.cal button{position:relative;min-height:58px;border-radius:9px;background:var(--panel2);border:1px solid var(--line);padding:3px 3px 4px;display:flex;flex-direction:column;align-items:stretch;gap:2px;text-align:left;overflow:hidden}
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
.chip{display:inline-block;flex:none;font-size:11px;font-weight:800;color:#111;border-radius:6px;padding:1px 6px;border:1.5px solid #000}
.seg{display:flex;gap:6px;margin:0 0 12px;overflow-x:auto;scrollbar-width:none}.seg::-webkit-scrollbar{display:none}
.seg button{flex:none;height:34px;padding:0 13px;border-radius:17px;border:1px solid var(--line);font-size:13.5px;font-weight:700;color:#cdd6da;background:#0b0d10}
.seg button.on{background:var(--teal);color:#000;border-color:var(--teal)}
.sblk{display:flex;gap:10px;align-items:center;padding:10px;border-radius:14px;background:var(--panel2);border:1px solid var(--line);margin-bottom:7px}
.sblk .tm{flex:none;width:64px;font-family:'Space Mono',monospace;font-size:12px;color:var(--yel);line-height:1.35}
.sblk .bd{flex:1;min-width:0}.sblk .bd b{display:block;font-size:14.5px;line-height:1.4}.sblk .bd small{display:block;font-size:12px;color:var(--mute);margin-top:2px;line-height:1.4}
.sblk .ok{flex:none;width:44px;height:44px;border-radius:50%;border:2px solid var(--teal);color:var(--teal);font-size:20px;font-weight:900}
.sblk.done{opacity:.5}.sblk.done .ok{background:var(--teal);color:#000}
.sblk.fix{opacity:.55;border-style:dashed}
.warn{padding:10px 12px;border-radius:12px;background:rgba(255,46,110,.13);border:1px solid rgba(255,46,110,.5);font-size:13.5px;line-height:1.5;margin-bottom:10px;word-break:keep-all}
.mat{padding:10px 12px;border-radius:14px;background:var(--panel2);border:1px solid var(--line);margin-bottom:8px}
.mat .h{display:flex;gap:8px;align-items:center}.mat .h b{flex:1;min-width:0;font-size:14.5px}
.mat .pg{height:6px;border-radius:3px;background:#0b0d10;margin-top:8px;overflow:hidden}.mat .pg i{display:block;height:100%;background:var(--teal)}
.mat .us{display:flex;flex-wrap:wrap;gap:5px;margin-top:9px}
.mat .us button{height:30px;padding:0 9px;border-radius:15px;border:1px solid var(--line);font-size:12px;color:#cdd6da}
.mat .us button.d{background:var(--teal);color:#000;border-color:var(--teal)}
.mat .us button.e{border-color:var(--hot)}
.frm{display:flex;flex-direction:column;gap:8px}
.frm .row{gap:8px}
.wkp{display:grid;grid-template-columns:repeat(7,1fr);gap:4px;margin-top:6px}
.wkp div{text-align:center;font-size:11px;color:var(--mute)}.wkp b{display:block;font-family:'Space Mono',monospace;font-size:12px;color:#fff}.wkp i{display:block;height:34px;margin:3px 6px 0;border-radius:4px;background:#0b0d10;position:relative;overflow:hidden}.wkp i u{position:absolute;left:0;right:0;bottom:0;background:var(--teal)}
`;
document.head.appendChild(Object.assign(document.createElement('style'), { textContent: css }));

// ---------- 데이터 ----------
const ST = () => { if (!S.study) S.study = {}; const s = S.study; s.mats = s.mats || []; s.exams = s.exams || []; s.log = s.log || {}; s.rev = s.rev || {}; s.pref = Object.assign({ wdS: '17:00', weS: '10:00', end: '23:00', wdMax: 180, weMax: 300, block: 50 }, s.pref || {}); return s; };
const toM = t => { const [h, m] = String(t).split(':').map(Number); return h * 60 + (m || 0); };
const toT = m => `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(Math.round(m % 60)).padStart(2, '0')}`;
const dAdd = (d, n) => { const x = new Date(d); x.setHours(0, 0, 0, 0); x.setDate(x.getDate() + n); return x; };
const dkey = d => dk(d);
const pDate = k => { const [y, m, d] = k.split('-').map(Number); return new Date(y, m - 1, d); };
const PAL = ['#ff8fc4', '#7fecd9', '#f2ea3a', '#b89cff', '#ffb27a', '#9ff5e4', '#7fb6ff', '#c9f27a'];
const subs = () => [...new Set(ST().mats.map(m => m.sub))];
const colOf = sub => { let h = 0; for (const c of sub || '') h = (h * 31 + c.charCodeAt(0)) >>> 0; return PAL[h % PAL.length]; };
const chip = sub => { const c = el('span', 'chip', sub); c.style.background = colOf(sub); return c; };
function makeUnits(kind, from, to, chunk, mins, label) {
  const U = [];
  if (kind === 'hw') return [{ id: uid('u'), name: label || '숙제', mins: mins || 40, prog: 0, done: false }];
  if (label === '쪽') { const c = Math.max(1, chunk || 10); for (let p = from; p <= to; p += c) U.push({ id: uid('u'), name: `p.${p}~${Math.min(to, p + c - 1)}`, mins: mins || 40, prog: 0, done: false }); }
  else for (let n = from; n <= to; n++) U.push({ id: uid('u'), name: `${n}${label || '단원'}`, n, mins: mins || 40, prog: 0, done: false });
  return U.slice(0, 120);
}
function addMat(o) { const m = { id: uid('m'), sub: String(o.sub || '기타').slice(0, 12), title: String(o.title || '교재').slice(0, 30), kind: o.kind === 'hw' ? 'hw' : 'book', due: o.due || '', units: makeUnits(o.kind, +o.from || 1, +o.to || +o.from || 1, +o.chunk, +o.mins, o.kind === 'hw' ? (o.what || o.title) : o.unit) }; ST().mats.push(m); save(); return m; }
function addExam(o) { const e = { id: uid('x'), name: String(o.name || '시험').slice(0, 20), date: o.date, ranges: (o.ranges || []).filter(r => r.mat) }; ST().exams.push(e); save(); return e; }
const matOf = id => ST().mats.find(m => m.id === id);

// 단원 마감: 그 단원이 들어간 시험 날짜 2일 전(복습 날 남기기), 교재/숙제 마감 중 이른 것
function dueOf(m, u, i) {
  let d = m.due || '';
  for (const e of ST().exams) { if (e.date < dkey(new Date())) continue; for (const r of e.ranges) if (r.mat === m.id && i >= r.from && i <= r.to) { const k = dkey(dAdd(pDate(e.date), -2)); if (!d || k < d) d = k; } }
  if (m.kind === 'hw' && m.due) { const k = dkey(dAdd(pDate(m.due), -1)); d = k; } // 숙제는 학원 가는 날 전날까지
  return d;
}

// ---------- 그날 빈 시간 ----------
function busyOn(d) {
  const L = [], k = dkey(d), wd = d.getDay();
  S.items.forEach(t => { if (t.done || !t.due || t.due.slice(0, 10) !== k || t.rid) return; const s = toM(t.due.slice(11, 16)); L.push([s, s + (t.mins || 60)]); });
  (S.reps || []).forEach(r => { if (r.days.length && !r.days.includes(wd)) return; if ((S.repSkip || {})[r.id + '_' + k]) return; L.push([toM(r.time), toM(r.end || toT(toM(r.time) + 60))]); });
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

// ---------- 계산: 마감이 가까운 것부터, 같은 과목이 연달아 오지 않게, 시험 전 복습 ----------
function tasks() {
  const T = [], today = dkey(new Date());
  ST().mats.forEach((m, mi) => m.units.forEach((u, i) => { if (u.done) return; T.push({ key: u.id, m, u, i, mi, sub: m.sub, label: m.kind === 'hw' ? m.title : `${m.title} · ${u.name}`, rem: Math.max(5, u.mins - (u.prog || 0)), due: dueOf(m, u, i), seq: m.kind === 'book' }); }));
  ST().exams.forEach(e => { if (e.date < today) return; [...new Set(e.ranges.map(r => (matOf(r.mat) || {}).sub).filter(Boolean))].forEach(sub => [2, 1].forEach(back => { const day = dkey(dAdd(pDate(e.date), -back)), key = `${e.id}_${sub}_${back}`; if (ST().rev[key] || day < today) return; T.push({ key, rev: 1, sub, label: `${e.name} ${sub} 범위 ${back === 1 ? '총정리' : '복습·오답'}`, rem: 45, due: day, from: day, eid: e.id }); })); });
  return T;
}
function simulate(nDays, capMode) {
  const P = ST().pref, T = tasks().map(t => ({ ...t })), days = [], today = new Date(); today.setHours(0, 0, 0, 0);
  const seqNext = {}; // 교재는 앞 단원부터
  for (let di = 0; di < nDays; di++) {
    const d = dAdd(today, di), k = dkey(d), we = d.getDay() === 0 || d.getDay() === 6;
    const dmax = x => (x.getDay() === 0 || x.getDay() === 6) ? P.weMax : P.wdMax;
    // 고르게 나누기: 마감마다 (그때까지 할 양 ÷ 그때까지 쓸 수 있는 시간) 중 가장 큰 비율만큼만 오늘 한다
    let f = 0; const live = T.filter(t => t.rem > 0 && t.due);
    [...new Set(live.map(t => t.due))].forEach(dl => { const W = live.filter(t => t.due <= dl).reduce((a, t) => a + t.rem, 0); let C = 0; for (let j = 0; dkey(dAdd(d, j)) <= dl && j < 90; j++) C += dmax(dAdd(d, j)); if (C <= 0) C = dmax(d); f = Math.max(f, W / C); });
    let cap = capMode === 'max' ? 24 * 60 : Math.min(dmax(d), Math.ceil(dmax(d) * Math.min(1, f * 1.1) / 10) * 10);
    if (capMode !== 'max' && T.some(t => t.rem > 0 && !t.due)) cap = Math.max(cap, Math.round(dmax(d) * .5));
    if (di === 0) cap = Math.max(0, cap - ((ST().log[k] || []).reduce((a, b) => a + b.mins, 0)));
    const blocks = []; let last = '';
    for (const [a, b] of freeIv(d, di === 0)) {
      let cur = a;
      while (cap >= 20 && b - cur >= 25) {
        const len = Math.min(P.block, b - cur, cap); if (len < 20) break;
        const parts = []; let left = len, bsub = '';
        while (left >= 10) {
          const head = new Map(); for (const o of T) if (o.seq && o.rem > 0 && (!head.has(o.m) || o.i < head.get(o.m))) head.set(o.m, o.i);
          const elig = T.filter(t => t.rem > 0 && (!t.from || t.from <= k) && (!t.seq || head.get(t.m) === t.i));
          if (!elig.length) break;
          elig.sort((x, y) => (x.due || '9999') < (y.due || '9999') ? -1 : (x.due || '9999') > (y.due || '9999') ? 1 : (x.mi || 0) - (y.mi || 0));
          const minDue = elig[0].due || '9999', near = elig.filter(t => (t.due || '9999') <= dkey(dAdd(pDate(minDue === '9999' ? '2099-01-01' : minDue), 2)) || minDue === '9999');
          let pick = bsub ? (near.find(t => t.sub === bsub) || (parts.length ? null : near[0])) : (near.find(t => t.sub !== last) || near[0]);
          if (!pick) break;
          if (parts.length && pick.rem > left) break; // 자투리로 쪼개지 않음: 다 안 들어가면 블록을 여기서 끝냄
          const use = Math.min(pick.rem, left); pick.rem -= use; left -= use; bsub = pick.sub;
          parts.push({ t: pick, mins: use, late: pick.due && k > pick.due });
          if (pick.rem > 0) break; // 블록보다 긴 단원만 다음 블록으로 이어짐
        }
        if (!parts.length) break;
        const used = len - left, end = cur + used;
        blocks.push({ s: cur, e: end, sub: bsub, parts }); cap -= used; last = bsub; cur = end + 10;
      }
    }
    days.push({ k, blocks, mins: blocks.reduce((a, b) => a + (b.e - b.s), 0) });
  }
  const left = T.filter(t => t.rem > 0 && t.due), late = [];
  days.forEach(D => D.blocks.forEach(b => b.parts.forEach(p => { if (p.late && !late.includes(p.t)) late.push(p.t); })));
  left.forEach(t => { if (!late.includes(t) && t.due < dkey(dAdd(today, nDays))) late.push(t); });
  return { days, late };
}
function horizon() { let far = dkey(dAdd(new Date(), 31)); ST().mats.forEach((m, mi) => m.units.forEach((u, i) => { const d = dueOf(m, u, i); if (d && d > far) far = d; })); ST().exams.forEach(e => { if (e.date > far) far = e.date; }); return Math.min(70, Math.round((pDate(far) - dAdd(new Date(), 0)) / 864e5) + 1); }
let cache = null;
function splan() {
  const sig = JSON.stringify([S.study, S.reps, S.items.filter(t => t.due && !t.done).map(t => t.due), dkey(new Date()), Math.floor(Date.now() / 300000)]);
  if (cache && cache.sig === sig) return cache;
  const n = horizon(); let r = simulate(n), strained = false;
  if (r.late.length) { const r2 = simulate(n, 'max'); if (r2.late.length < r.late.length) { r = r2; strained = true; } }
  cache = { sig, ...r, strained }; return cache;
}
const dirty = () => { cache = null; };
window.studyBusy = () => { try { return (splan().days[0] || { blocks: [] }).blocks.map(b => [b.s, b.e, '공부']); } catch (e) { return []; } };

// ---------- 완료 처리 ----------
function finishBlock(b) {
  const k = dkey(new Date()), st = ST();
  b.parts.forEach(p => { const t = p.t; if (t.rev) st.rev[t.key] = 1; else { const u = t.u; u.prog = (u.prog || 0) + p.mins; if (u.prog >= u.mins - 1) { u.done = true; u.doneAt = Date.now(); } } });
  (st.log[k] = st.log[k] || []).push({ s: b.s, e: b.e, sub: b.sub, label: b.parts.map(p => p.t.label).join(' / '), mins: b.e - b.s });
  const ks = Object.keys(st.log).sort(); while (ks.length > 60) delete st.log[ks.shift()];
  S.coins = (S.coins || 0) + 1; save(); dirty(); pushSync(true); coinPop && coinPop(); renderHome();
}

// ---------- 화면: 탭 ----------
let sub = 'today', calM = null, calSel = null, openMat = null;
const _bt = boardTabs; boardTabs = function (B) {
  const T = el('div', 'tabs'); [['today', '오늘'], ['cal', '캘린더'], ['tt', '시간표'], ['study', '공부'], ['all', '할 일']].forEach(([v, l]) => { const b = el('button', boardTab === v ? 'on' : '', l); b.onclick = () => { boardTab = v; refreshSheet(); }; T.appendChild(b); }); B.appendChild(T);
};
const _br = boardRender; boardRender = function (B) {
  if (boardTab === 'week') boardTab = 'cal';
  if (boardTab === 'cal') return renderCal(B);
  if (boardTab === 'study') return renderStudy(B);
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
  B.appendChild(el('div', 'hint', '분홍 일정 · 노랑 숙제 마감 · 파랑 학원·수업 · 빨강 시험 · 아래 청록 막대 = 그날 공부량'));
  // 고른 날
  const d = pDate(calSel), k = calSel, L = el('div', 'card dlist'); L.style.marginTop = '10px';
  L.appendChild(el('b', null, `${d.getMonth() + 1}/${d.getDate()} (${WD[d.getDay()]})`));
  const rows = [];
  ST().exams.filter(e => e.date === k).forEach(e => rows.push(['시험', e.name + ' · ' + e.ranges.map(r => { const m = matOf(r.mat); return m ? `${m.sub} ${m.title} ${m.units[r.from] ? m.units[r.from].name : ''}~${m.units[r.to] ? m.units[r.to].name : ''}` : ''; }).join(', '), 0]));
  S.items.filter(t => t.due && t.due.slice(0, 10) === k).sort((a, b) => a.due.localeCompare(b.due)).forEach(t => rows.push([t.due.slice(11, 16), t.text + (t.done ? ' ✓' : ''), toM(t.due.slice(11, 16))]));
  if (!S.items.some(t => t.rid && t.due && t.due.slice(0, 10) === k)) (S.reps || []).filter(r => !r.days.length || r.days.includes(d.getDay())).forEach(r => rows.push([r.time, r.text, toM(r.time)]));
  ST().mats.filter(m => m.kind === 'hw' && m.due === k).forEach(m => rows.push(['마감', `${m.sub} 숙제: ${m.title}`, -1]));
  (ST().log[k] || []).forEach(l => rows.push([toT(l.s), `✓ ${l.sub} ${l.label}`, l.s]));
  (pm[k] ? pm[k].blocks : []).forEach(b => rows.push([toT(b.s), `${b.sub} · ${b.parts.map(p => p.t.label).join(' / ')} (${b.e - b.s}분)`, b.s]));
  rows.sort((a, b) => a[2] - b[2]).forEach(([t, x]) => { const r = el('div', 'r'); r.append(el('b', null, t), document.createTextNode(x)); L.appendChild(r); });
  if (!rows.length) L.appendChild(el('div', 'hint', '이날은 비어 있어요.'));
  B.appendChild(L);
  B.appendChild(lbl('이날 일정 붙이기')); const c = el('div', 'card'), t = inp('text', '예: 수행평가 제출'), tm = inp('time', '', '');
  c.append(row(t, tm), row(btn('붙이기', 'wide', () => { const v = t.value.trim(); if (!v) return; addItem(v, tm.value ? `${k}T${tm.value}` : `${k}T09:00`); save(); pushSync(true); dirty(); refreshSheet(); renderHome(); toast('붙였어요.'); })));
  c.appendChild(el('div', 'hint', '시간을 비우면 아침 9시로 붙어요. 시험·숙제·교재는 "공부" 탭에서 넣어요.')); B.appendChild(c);
}

// ---------- 공부 탭 ----------
function renderStudy(B) {
  boardTabs(B);
  const S2 = el('div', 'seg'); [['today', '오늘 계획'], ['week', '이번 주'], ['exam', '시험'], ['mat', '교재·숙제'], ['set', '설정']].forEach(([v, l]) => { const b = el('button', sub === v ? 'on' : '', l); b.onclick = () => { sub = v; refreshSheet(); }; S2.appendChild(b); }); B.appendChild(S2);
  if (!ST().mats.length && sub !== 'mat' && sub !== 'set') { B.appendChild(el('div', 'warn', '먼저 "교재·숙제"에 과목과 교재(문제집 몇 단원), 학원 숙제를 넣어 주세요. 시험이 있으면 "시험"에 날짜와 범위도요. 그러면 레나가 빈 시간에 맞춰 날마다 계획을 짜요. 통화로 "수학 쎈 1~12단원, 기말 12월 10일 범위 쎈 1~8단원"이라고 말해도 돼요.')); B.appendChild(row(btn('교재·숙제 넣으러 가기', 'teal wide', () => { sub = 'mat'; refreshSheet(); }))); return; }
  ({ today: stToday, week: stWeek, exam: stExam, mat: stMat, set: stSet })[sub](B);
}
function stToday(B) {
  const P = splan(), D = P.days[0] || { blocks: [], mins: 0 }, k = dkey(new Date()), lg = ST().log[k] || [];
  const done = lg.reduce((a, b) => a + b.mins, 0), tot = done + D.mins;
  const hd = el('div', 'card'); hd.append(el('b', null, `오늘 공부 ${Math.floor(tot / 60)}시간 ${tot % 60}분 · 블록 ${D.blocks.length + lg.length}개`), el('div', 'hint', `끝낸 것 ${Math.floor(done / 60)}시간 ${done % 60}분 · 남은 것 ${D.blocks.length}블록. 완료(✓)를 누르면 할 일 동전 1개. 못 한 블록은 시간이 지나면 다음 빈 시간으로 다시 짜여요.`)); B.appendChild(hd);
  if (P.late.length) B.appendChild(el('div', 'warn', `⚠ 마감까지 다 못 끝낼 것 같아요: ${[...new Set(P.late.map(t => t.label))].slice(0, 4).join(', ')}${P.late.length > 4 ? ` 외 ${P.late.length - 4}개` : ''}. 설정에서 하루 최대 공부 시간을 늘리거나 시작 시간을 당겨요.`));
  else if (P.strained) B.appendChild(el('div', 'warn', '마감을 맞추려고 하루 목표보다 더 넣었어요. 무리면 설정에서 시간을 조정해요.'));
  const L = el('div'); L.style.marginTop = '10px';
  const items = [...lg.map(l => ({ s: l.s, e: l.e, done: 1, sub: l.sub, t: l.label })), ...busyOn(new Date()).filter(([s]) => s >= toM(ST().pref.wdS) - 60).map(([s, e]) => ({ s, e, fix: 1 })), ...D.blocks.map(b => ({ s: b.s, e: b.e, b }))].sort((a, b) => a.s - b.s);
  const fixedNames = s => { const n = (S.reps || []).find(r => toM(r.time) === s && (!r.days.length || r.days.includes(new Date().getDay()))); const it = S.items.find(t => t.due && onDate(t, new Date()) && toM(t.due.slice(11, 16)) === s); return n ? n.text : it ? it.text : '일정'; };
  items.forEach(x => {
    const r = el('div', 'sblk' + (x.done ? ' done' : x.fix ? ' fix' : '')), tm = el('div', 'tm'); tm.innerHTML = `${toT(x.s)}<br>~${toT(x.e)}`;
    const bd = el('div', 'bd');
    if (x.fix) { bd.append(el('b', null, fixedNames(x.s)), el('small', null, '잡힌 일정')); r.append(tm, bd); }
    else if (x.done) { const b = el('b'); b.append(chip(x.sub), document.createTextNode(' ' + x.t)); bd.append(b, el('small', null, `${x.e - x.s}분 완료`)); r.append(tm, bd, el('button', 'ok', '✓')); }
    else { const b = el('b'); b.append(chip(x.b.sub)); x.b.parts.forEach((p, i) => b.appendChild(document.createTextNode((i ? ' + ' : ' ') + p.t.label))); bd.append(b, el('small', null, x.b.parts.map(p => `${p.mins}분${p.t.due ? ` · ${p.t.rev ? '시험 전' : '마감'} ${p.t.due.slice(5).replace('-', '/')}` : ''}${p.late ? ' ⚠늦음' : ''}`).join(' / '))); const ok = el('button', 'ok', '✓'); ok.onclick = () => { finishBlock(x.b); refreshSheet(); toast('한 블록 끝! 동전 +1'); }; r.append(tm, bd, ok); }
    L.appendChild(r);
  });
  if (!items.length) L.appendChild(el('div', 'hint', '오늘은 남은 공부가 없어요. (빈 시간이 없거나 다 끝냈어요)'));
  B.appendChild(L);
  B.appendChild(el('div', 'hint', '계산 방법: 시험 2일 전까지 범위를 끝내도록 마감이 가까운 것부터, 같은 과목이 연달아 오지 않게, 학원·일정 앞뒤 10분은 비우고 50분 공부 + 10분 쉬기로 넣어요. 시험 전날·이틀 전엔 범위 복습이 들어가요.'));
}
function stWeek(B) {
  const P = splan(), W = el('div', 'wkp'), mx = Math.max(60, ...P.days.slice(0, 7).map(D => D.mins + (ST().log[D.k] || []).reduce((a, b) => a + b.mins, 0)));
  P.days.slice(0, 7).forEach(D => { const d = pDate(D.k), m = D.mins + (ST().log[D.k] || []).reduce((a, b) => a + b.mins, 0), c = el('div'), i = el('i'), u = el('u'); u.style.height = (m / mx * 100) + '%'; i.appendChild(u); c.append(document.createTextNode(`${WD[d.getDay()]}`), el('b', null, `${(m / 60).toFixed(1)}h`), i); W.appendChild(c); });
  const c = el('div', 'card'); c.append(el('b', null, '앞으로 7일 공부량'), W); B.appendChild(c);
  P.days.slice(1, 7).forEach(D => { if (!D.blocks.length) return; const d = pDate(D.k), L = el('div', 'card dlist'); L.style.marginTop = '8px'; L.appendChild(el('b', null, `${d.getMonth() + 1}/${d.getDate()} (${WD[d.getDay()]}) · ${Math.floor(D.mins / 60)}시간 ${D.mins % 60}분`)); D.blocks.forEach(b => { const r = el('div', 'r'); r.append(el('b', null, toT(b.s)), chip(b.sub), document.createTextNode(' ' + b.parts.map(p => p.t.label).join(' / '))); L.appendChild(r); }); B.appendChild(L); });
  B.appendChild(el('div', 'hint', '오늘 한 만큼에 따라 매일 다시 계산돼요.'));
}
function stExam(B) {
  const today = dkey(new Date());
  ST().exams.slice().sort((a, b) => a.date.localeCompare(b.date)).forEach(e => {
    const dd = Math.round((pDate(e.date) - dAdd(new Date(), 0)) / 864e5); let tot = 0, dn = 0;
    e.ranges.forEach(r => { const m = matOf(r.mat); if (!m) return; m.units.slice(r.from, r.to + 1).forEach(u => { tot++; if (u.done) dn++; }); });
    const c = el('div', 'mat' + (e.date < today ? ' fix' : '')), h = el('div', 'h'); h.append(el('span', 'chip', dd > 0 ? `D-${dd}` : dd === 0 ? 'D-DAY' : '끝'), el('b', null, `${e.name} · ${e.date.slice(5).replace('-', '/')}`), xbtnS(() => { if (!confirm(`'${e.name}' 지울까요?`)) return; ST().exams = ST().exams.filter(x => x !== e); save(); dirty(); refreshSheet(); })); c.appendChild(h);
    c.querySelector('.chip').style.background = dd <= 7 ? 'var(--hot)' : 'var(--yel)';
    e.ranges.forEach(r => { const m = matOf(r.mat); if (m) c.appendChild(el('div', 'hint', `${m.sub} · ${m.title} ${m.units[r.from] ? m.units[r.from].name : ''} ~ ${m.units[r.to] ? m.units[r.to].name : ''}`)); });
    const pg = el('div', 'pg'), i = el('i'); i.style.width = (tot ? dn / tot * 100 : 0) + '%'; pg.appendChild(i); c.append(pg, el('div', 'hint', `범위 ${dn}/${tot} 끝냄`)); B.appendChild(c);
  });
  B.appendChild(lbl('시험 넣기'));
  const f = el('div', 'card frm'), nm = inp('text', '예: 2학기 기말'), dt = inp('date', '', ''), R = el('div'), ranges = [];
  const addR = () => { if (!ST().mats.length) { toast('먼저 교재를 넣어 주세요.'); return; } const ms = el('select', 'in'), fr = el('select', 'in'), to = el('select', 'in');
    ST().mats.filter(m => m.kind === 'book').forEach(m => ms.appendChild(Object.assign(document.createElement('option'), { value: m.id, textContent: `${m.sub} · ${m.title}` })));
    const fill = () => { const m = matOf(ms.value); fr.innerHTML = to.innerHTML = ''; (m ? m.units : []).forEach((u, i) => { fr.appendChild(Object.assign(document.createElement('option'), { value: i, textContent: u.name })); to.appendChild(Object.assign(document.createElement('option'), { value: i, textContent: u.name })); }); to.value = Math.max(0, (m ? m.units.length : 1) - 1); };
    ms.onchange = fill; fill(); const o = { ms, fr, to }; ranges.push(o); const rr = el('div', 'frm'); rr.append(row(ms), row(fr, el('span', 'hint', '~'), to)); R.appendChild(rr); };
  f.append(row(nm, dt), R, row(btn('+ 범위(교재) 추가', 'ghost wide', addR)), row(btn('시험 넣기', 'teal wide', () => {
    if (!nm.value.trim() || !dt.value) { toast('시험 이름과 날짜를 넣어 주세요.'); return; }
    addExam({ name: nm.value.trim(), date: dt.value, ranges: ranges.map(o => ({ mat: o.ms.value, from: Math.min(+o.fr.value, +o.to.value), to: Math.max(+o.fr.value, +o.to.value) })) }); dirty(); pushSync(true); refreshSheet(); toast('시험을 넣었어요. 범위를 시험 이틀 전까지 끝내게 짤게요.'); })));
  addR();
  f.appendChild(el('div', 'hint', '범위는 교재마다 하나씩 추가해요. 시험 전날·이틀 전엔 자동으로 과목별 복습이 들어가요.'));
  B.appendChild(f);
}
const xbtnS = fn => { const b = el('button', 'x', '×'); b.onclick = fn; b.setAttribute('aria-label', '지우기'); return b; };
function stMat(B) {
  subs().forEach(sb => {
    B.appendChild(lbl(sb));
    ST().mats.filter(m => m.sub === sb).forEach(m => {
      const c = el('div', 'mat'), h = el('div', 'h'), dn = m.units.filter(u => u.done).length;
      h.append(chip(m.kind === 'hw' ? '숙제' : '교재'), el('b', null, m.title + (m.due ? ` · ${m.kind === 'hw' ? '학원' : '마감'} ${m.due.slice(5).replace('-', '/')}` : '')), xbtnS(() => { if (!confirm(`'${m.title}' 지울까요?`)) return; ST().mats = ST().mats.filter(x => x !== m); ST().exams.forEach(e => e.ranges = e.ranges.filter(r => r.mat !== m.id)); save(); dirty(); refreshSheet(); }));
      h.firstChild.style.background = m.kind === 'hw' ? 'var(--yel)' : colOf(m.sub);
      const pg = el('div', 'pg'), i = el('i'); i.style.width = (dn / m.units.length * 100) + '%'; pg.appendChild(i);
      c.append(h, pg, el('div', 'hint', `${dn}/${m.units.length} 끝냄 · 하나에 ${m.units[0] ? m.units[0].mins : 40}분${m.kind === 'book' ? ' · 눌러서 단원 보기' : ''}`));
      c.onclick = ev => { if (ev.target.closest('button')) return; openMat = openMat === m.id ? null : m.id; refreshSheet(); };
      if (openMat === m.id || m.kind === 'hw') { const U = el('div', 'us'); m.units.forEach((u, idx) => { const b = el('button', u.done ? 'd' : '', u.name); b.onclick = () => { u.done = !u.done; u.prog = u.done ? u.mins : 0; save(); dirty(); refreshSheet(); }; U.appendChild(b); }); c.appendChild(U);
        if (m.kind === 'book') { const mi = inp('number', '분', String(m.units[0] ? m.units[0].mins : 40)); mi.style.maxWidth = '90px'; c.appendChild(row(el('span', 'hint', '단원 하나에 걸리는 시간'), mi, btn('바꾸기', 'ghost', () => { const v = Math.max(10, Math.min(240, +mi.value || 40)); m.units.forEach(u => u.mins = v); save(); dirty(); refreshSheet(); toast(`단원당 ${v}분으로 다시 계산했어요.`); }))); } }
      B.appendChild(c);
    });
  });
  B.appendChild(lbl('넣기'));
  const f = el('div', 'card frm'); let kind = 'book', ul = '단원';
  const sb = inp('text', '과목 (예: 수학)'); sb.setAttribute('list', 'stSubs'); const dl = el('datalist'); dl.id = 'stSubs'; subs().forEach(s => dl.appendChild(Object.assign(document.createElement('option'), { value: s })));
  const tt = inp('text', '교재·문제집 이름 (예: 쎈 수학)'), a = inp('number', '시작', '1'), z = inp('number', '끝', '12'), ch = inp('number', '쪽씩', '10'), mn = inp('number', '분', '40'), du = inp('date', '', '');
  const kinds = pills([['book', '교재·문제집'], ['hw', '학원 숙제']], kind, v => { kind = v; draw(); }), units = pills([['단원', '단원'], ['쪽', '쪽']], ul, v => { ul = v; draw(); });
  const box = el('div', 'frm');
  const draw = () => { kinds.querySelectorAll('button').forEach((b, i) => b.classList.toggle('on', ['book', 'hw'][i] === kind)); units.querySelectorAll('button').forEach((b, i) => b.classList.toggle('on', ['단원', '쪽'][i] === ul)); box.innerHTML = '';
    if (kind === 'book') { tt.placeholder = '교재·문제집 이름 (예: 쎈 수학)'; box.append(units, row(a, el('span', 'hint', '~'), z, ...(ul === '쪽' ? [ch] : [])), row(el('span', 'hint', ul === '쪽' ? '덩어리 하나에' : '단원 하나에'), mn, el('span', 'hint', '분')), row(el('span', 'hint', '끝낼 날(없으면 비움)'), du)); }
    else { tt.placeholder = '숙제 내용 (예: 단어 Day 5~6 외우기)'; box.append(row(el('span', 'hint', '걸리는 시간'), mn, el('span', 'hint', '분')), row(el('span', 'hint', '다음 학원 날'), du)); } };
  f.append(kinds, row(sb), dl, row(tt), box, row(btn('넣기', 'teal wide', () => {
    if (!sb.value.trim() || !tt.value.trim()) { toast('과목과 이름을 넣어 주세요.'); return; }
    if (kind === 'hw' && !du.value) { toast('학원 숙제는 다음 학원 날을 넣어 주세요.'); return; }
    const m = addMat({ sub: sb.value.trim(), title: tt.value.trim(), kind, from: +a.value || 1, to: +z.value || +a.value || 1, chunk: +ch.value, mins: +mn.value || 40, unit: ul, due: du.value }); dirty(); pushSync(true); refreshSheet(); toast(`${m.sub} · ${m.title} 넣었어요 (${m.units.length}개).`); })));
  draw(); B.appendChild(f);
  B.appendChild(el('div', 'hint', '통화로 "영어 학원 숙제 단어 Day 5~6, 목요일까지, 30분"처럼 말해도 레나가 넣어요.'));
}
function stSet(B) {
  const P = ST().pref, c = el('div', 'card frm');
  const f = (lab, key, type) => { const i = inp(type, '', String(P[key])); i.onchange = () => { P[key] = type === 'number' ? Math.max(0, +i.value || 0) : i.value; save(); dirty(); toast('다시 계산했어요.'); }; const r = row(el('div', 't', lab), i); r.firstChild.style.flex = '1'; i.style.maxWidth = '140px'; return r; };
  c.append(f('평일 공부 시작', 'wdS', 'time'), f('주말 공부 시작', 'weS', 'time'), f('공부 끝 (잠들기 전)', 'end', 'time'), f('평일 하루 최대(분)', 'wdMax', 'number'), f('주말 하루 최대(분)', 'weMax', 'number'), f('한 블록 길이(분)', 'block', 'number'));
  c.appendChild(el('div', 'hint', '학원·수업은 시간표 탭, 다른 일정은 전단지에 넣으면 그 시간은 피해요. 마감을 못 맞출 것 같으면 레나가 최대 시간을 넘겨서라도 넣고 알려 줘요.'));
  B.appendChild(c);
}

// ---------- 오늘 브리핑에 공부 덧붙이기 ----------
if (SH.brief) { const _r = SH.brief.r; SH.brief.r = B => { _r(B); try { const D = splan().days[0]; if (!D || !D.blocks.length) return; const w = B.querySelector('.brief'); const s = el('div', 'bsec'); s.appendChild(el('h5', null, `오늘 공부 ${Math.floor(D.mins / 60)}시간 ${D.mins % 60}분`)); D.blocks.slice(0, 4).forEach(b => { const r = el('div', 'r'); r.append(el('b', null, toT(b.s)), document.createTextNode(`${b.sub} · ${b.parts.map(p => p.t.label).join(' / ')}`)); s.appendChild(r); }); s.appendChild(row(btn('공부 계획 보기', 'ghost wide', () => { boardTab = 'study'; sub = 'today'; openSheet(1); }))); w && w.appendChild(s); } catch (e) {} }; }

// ---------- 알림: 오늘 공부 블록 시작 ----------
const _plan = window.plan; window.plan = function () {
  const p = _plan(); try { const now = Date.now(), add = [], P = studyPlanCached(); P.days.slice(0, 2).forEach(D => D.blocks.forEach(b => { const at = new Date(pDate(D.k)); at.setHours(0, b.s, 0, 0); if (at.getTime() > now) add.push({ id: `st_${D.k}_${b.s}`, at: at.getTime(), body: `${nmc()}${b.sub} 시간이에요. ${b.parts[0].t.label}${b.parts.length > 1 ? ' 외' : ''} (${b.e - b.s}분)` }); })); p.reminders = p.reminders.concat(add).sort((a, b) => a.at - b.at).slice(0, 180); } catch (e) {}
  return p;
};
function studyPlanCached() { return splan(); }

// ---------- Gemini: 말로 넣기 ----------
const _sys = sysPrompt; sysPrompt = function (sp) {
  const s = _sys(sp), st = ST();
  return s.replace('JSON만 출력:', `- 공부: 교재·문제집(몇 단원/몇 쪽), 학원 숙제, 시험 날짜·범위를 말하면 study에 넣는다. study={"mats":[{"sub":"과목","title":"교재 이름","kind":"book|hw","from":1,"to":12,"unit":"단원|쪽","chunk":쪽일 때 덩어리 쪽수,"mins":단원 하나 걸리는 분(모르면 40),"due":"YYYY-MM-DD 끝낼 날, 숙제면 다음 학원 날"}],"exams":[{"name":"시험 이름","date":"YYYY-MM-DD","ranges":[{"sub":"과목","title":"교재 이름","from":시작 번호,"to":끝 번호}]}]}. 교재가 이미 있으면 mats에 다시 넣지 않는다. 공부 계획은 앱이 자동으로 빈 시간에 짠다고 안내한다.
지금 공부 목록: ${JSON.stringify(st.mats.map(m => `${m.sub}/${m.title}(${m.kind === 'hw' ? '숙제' : m.units.length + '개'}, 남은 ${m.units.filter(u => !u.done).length})`).slice(0, 20))} 시험: ${JSON.stringify(st.exams.map(e => `${e.name} ${e.date}`))}
JSON만 출력:`).replace(/"follow":\[\]\}/, '"follow":[],"study":{"mats":[],"exams":[]}}');
};
const _ap = apply; apply = function (r) {
  const res = _ap(r), x = r && r.study, got = [];
  if (x && typeof x === 'object') {
    (x.mats || []).forEach(o => { if (!o || !o.title) return; if (ST().mats.some(m => m.title === o.title && m.sub === (o.sub || m.sub) && m.kind === (o.kind === 'hw' ? 'hw' : 'book'))) return; const m = addMat({ ...o, unit: o.unit === '쪽' ? '쪽' : '단원' }); got.push(`${m.sub} ${m.title}`); });
    (x.exams || []).forEach(o => { if (!o || !o.name || !/^\d{4}-\d\d-\d\d$/.test(o.date || '')) return; const ranges = (o.ranges || []).map(rg => { let m = ST().mats.find(mm => mm.kind === 'book' && mm.title === rg.title) || ST().mats.find(mm => mm.kind === 'book' && rg.title && (mm.title.includes(rg.title) || rg.title.includes(mm.title))); if (!m && rg.title) m = addMat({ sub: rg.sub, title: rg.title, kind: 'book', from: 1, to: +rg.to || 1 }); if (!m) return null; const fi = Math.max(0, m.units.findIndex(u => u.n === +rg.from)), ti = m.units.findIndex(u => u.n === +rg.to); return { mat: m.id, from: fi, to: ti < 0 ? m.units.length - 1 : ti }; }).filter(Boolean); addExam({ name: o.name, date: o.date, ranges }); got.push(`시험 ${o.name}`); });
  }
  if (!got.length) return res;
  dirty(); save(); pushSync(true);
  const txt = `공부에 넣음: ${got.join(', ')} · 1번 전단지 > 공부에서 계획 확인`;
  if (res) { res.querySelector('span').textContent += ' · ' + txt; return res; } return noteEl(txt);
};
window.lenaStudy = { plan: () => splan(), simulate, freeIv, addMat, addExam, finishBlock, dirty };
})();
