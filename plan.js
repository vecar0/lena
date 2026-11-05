// 비서 기능: 아침 브리핑 카드 · 시간표(학원·수업 같은 매주 반복) · 레나가 오늘 시간표 짜 주기
// app.js·proactive.js·follow.js 뒤에 불러온다. proactive.js의 S.reps(반복 일정)를 시간표로 쓴다.
'use strict';
(() => {
const css = `
.tt{position:relative;display:grid;grid-template-columns:30px repeat(7,1fr);border:1px solid var(--line);border-radius:12px;background:#0b0d10;overflow:hidden}
.tt .hd{height:28px;display:grid;place-items:center;font-size:12px;font-weight:800;color:var(--mint);border-bottom:1px solid var(--line)}
.tt .hd.td{background:rgba(255,61,154,.18);color:#fff}
.tt .col{position:relative;border-left:1px solid rgba(255,255,255,.06)}
.tt .ax{position:relative}
.tt .ax span{position:absolute;right:3px;font-family:'Space Mono',monospace;font-size:9.5px;color:var(--mute);transform:translateY(-50%)}
.tt .ln{position:absolute;left:0;right:0;border-top:1px dashed rgba(255,255,255,.06)}
.tt .blk{position:absolute;left:2px;right:2px;border-radius:6px;padding:2px 3px;font-size:10.5px;font-weight:800;line-height:1.2;color:#111;overflow:hidden;word-break:keep-all;border:1.5px solid #000;text-align:left}
.tt .blk small{display:block;font-family:'Space Mono',monospace;font-size:9px;font-weight:700;opacity:.7}
.tt .now{position:absolute;left:0;right:0;border-top:2px solid var(--hot);z-index:2}
.brief{display:flex;flex-direction:column;gap:12px}
.brief .bhead{display:flex;gap:12px;align-items:center}
.brief .bhead i{flex:none;width:52px;height:52px;border-radius:50%;background:url(assets/lena/face.jpg) 50% 30%/cover;border:2px solid #000;box-shadow:3px 3px 0 var(--pink)}
.brief .bhead i.cat{background-image:url(assets/lena/cat.jpg);background-position:center}
.brief .bhead p{font-size:15px;font-weight:700;line-height:1.5;word-break:keep-all}
.bsec{background:var(--panel2);border:1px solid var(--line);border-radius:14px;padding:10px 12px}
.bsec h5{font-size:12.5px;color:var(--mint);margin-bottom:6px;font-weight:800}
.bsec .r{display:flex;gap:10px;align-items:baseline;font-size:14px;padding:3px 0}
.bsec .r b{font-family:'Space Mono',monospace;font-size:12.5px;color:var(--yel);flex:none;width:44px}
.bsec .r.late b{color:var(--hot)}
.bsec .top3{counter-reset:t}
.bsec .top3 .r::before{counter-increment:t;content:counter(t);flex:none;width:20px;height:20px;border-radius:50%;background:var(--pink);color:#fff;font-size:12px;font-weight:800;display:grid;place-items:center}
.bsec .muted{font-size:13px;color:var(--mute)}
.pl .it{display:flex;align-items:center;gap:10px;padding:9px 10px;border-radius:12px;background:var(--panel2);border:1px solid var(--line);margin-bottom:6px}
.pl .it b{font-family:'Space Mono',monospace;font-size:12.5px;color:var(--yel);flex:none;width:92px}
.pl .it span{flex:1;font-size:14px;font-weight:700}
.pl .it.fix{opacity:.55}.pl .it.fix b{color:var(--mute)}
.pl .it.off{opacity:.35;text-decoration:line-through}
.pl .it .m{height:30px;padding:0 9px;border-radius:15px;border:1px solid var(--line);font-size:12px;color:var(--mint);flex:none}
`;
document.head.appendChild(Object.assign(document.createElement('style'), { textContent: css }));
const today = () => dk(new Date());
const toM = t => { const [h, m] = t.split(':').map(Number); return h * 60 + m; };
const toT = m => `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;
const repEnd = r => r.end || toT(Math.min(24 * 60 - 1, toM(r.time) + 60));
const durOf = t => { if (t.rid) { const r = (S.reps || []).find(x => x.id === t.rid); if (r) return toM(repEnd(r)) - toM(r.time); } return t.mins || 60; };
const B0 = () => { if (!S.pro) S.pro = {}; if (S.pro.brief === undefined) S.pro.brief = true; return S.pro; };

// ---------- 시간표 탭 (전단지 시트 안) ----------
let ttEd = null;
const _bt = boardTabs; boardTabs = function (B) {
  const T = el('div', 'tabs'); [['today', '오늘'], ['week', '이번 주'], ['tt', '시간표'], ['all', '할 일']].forEach(([v, l]) => { const b = el('button', boardTab === v ? 'on' : '', l); b.onclick = () => { boardTab = v; refreshSheet(); }; T.appendChild(b); }); B.appendChild(T);
};
const _br = boardRender; boardRender = function (B) {
  if (boardTab !== 'tt') {
    _br(B);
    if (boardTab === 'today') { const r = row(btn('오늘 브리핑', 'ghost wide', () => openSheet('brief')), btn('레나가 시간표 짜기', 'teal wide', () => openSheet('plan'))); r.style.marginBottom = '12px'; B.insertBefore(r, B.children[1]); }
    return;
  }
  boardTabs(B);
  const R = (S.reps || []).slice();
  const lo = Math.min(9, ...R.map(r => Math.floor(toM(r.time) / 60))), hi = Math.max(18, ...R.map(r => Math.ceil(toM(repEnd(r)) / 60)));
  const PX = 34, H = (hi - lo) * PX, order = [1, 2, 3, 4, 5, 6, 0], tdw = new Date().getDay();
  const G = el('div', 'tt');
  G.appendChild(el('div', 'hd')); order.forEach(d => G.appendChild(el('div', 'hd' + (d === tdw ? ' td' : ''), WD[d])));
  const ax = el('div', 'ax'); ax.style.height = H + 'px'; for (let h = lo; h <= hi; h++) { const s = el('span', null, String(h)); s.style.top = ((h - lo) * PX) + 'px'; if (h > lo && h < hi) ax.appendChild(s); } G.appendChild(ax);
  const cols = ['#ff8fc4', '#7fecd9', '#f2ea3a', '#b89cff', '#ffb27a', '#9ff5e4'];
  order.forEach(d => {
    const c = el('div', 'col'); c.style.height = H + 'px';
    for (let h = lo + 1; h < hi; h++) { const l = el('div', 'ln'); l.style.top = ((h - lo) * PX) + 'px'; c.appendChild(l); }
    R.filter(r => !r.days.length || r.days.includes(d)).forEach(r => {
      const s = toM(r.time), e = toM(repEnd(r)), b = el('button', 'blk'); b.style.top = ((s - lo * 60) / 60 * PX) + 'px'; b.style.height = Math.max(18, (e - s) / 60 * PX - 2) + 'px';
      b.style.background = cols[S.reps.indexOf(r) % cols.length]; b.append(document.createTextNode(r.text), el('small', null, r.time));
      if (ttEd === r) b.style.outline = '3px solid #fff'; b.onclick = () => { ttEd = ttEd === r ? null : r; refreshSheet(); };
      c.appendChild(b); });
    if (d === tdw) { const n = new Date(), m = n.getHours() * 60 + n.getMinutes(); if (m > lo * 60 && m < hi * 60) { const l = el('div', 'now'); l.style.top = ((m - lo * 60) / 60 * PX) + 'px'; c.appendChild(l); } }
    G.appendChild(c); });
  B.appendChild(G);
  if (!R.length) B.appendChild(el('div', 'hint', '아직 비어 있어요. 학원·수업·운동처럼 매주 정해진 걸 넣으면, 레나가 그 시간은 피해서 하루를 짜 줘요.'));
  // 넣기/고치기: 프리셋을 누르면 칸이 채워지고, 시간표 칸을 누르면 그 블록을 고친다
  const E = ttEd && (S.reps || []).includes(ttEd) ? ttEd : null; if (!E) ttEd = null;
  B.appendChild(lbl(E ? `'${E.text}' 고치기` : '시간표에 넣기'));
  const c = el('div', 'card'), t = inp('text', '이름 (예: 영어 학원)', E ? E.text : ''), s1 = inp('time', '', E ? E.time : '19:00'), e1 = inp('time', '', E ? repEnd(E) : '21:00'); let sel = E ? E.days.slice() : [];
  const P2 = el('div', 'pills'); P2.style.margin = '10px 0';
  const drawDays = () => { P2.innerHTML = ''; order.forEach(i => { const b = el('button', sel.includes(i) ? 'on' : '', WD[i]); b.onclick = () => { sel = sel.includes(i) ? sel.filter(x => x !== i) : [...sel, i]; b.classList.toggle('on'); }; P2.appendChild(b); }); }; drawDays();
  if (!E) { const PR = el('div', 'pills'); PR.style.marginBottom = '10px';
    [['학교', '08:30', '16:30', [1, 2, 3, 4, 5]], ['학원', '18:00', '20:00', [1, 3, 5]], ['학원', '18:00', '20:00', [2, 4]], ['과외', '20:00', '22:00', []], ['독서실', '19:00', '22:00', []]].forEach(([n, a1, b1, ds]) => { const b = el('button', null, `${n}${ds.length ? ' ' + daysTxt(ds) : ''}`); b.onclick = () => { t.value = n; s1.value = a1; e1.value = b1; sel = ds.slice(); drawDays(); t.focus(); }; PR.appendChild(b); });
    c.append(el('div', 'hint', '빠르게 고르기 (고른 뒤 이름·시간을 고쳐도 돼요)'), PR); }
  const tm = row(s1, el('span', 'hint', '~'), e1); tm.style.alignItems = 'center';
  const go = () => { const v = t.value.trim(); if (!v || !s1.value || !e1.value) { toast('이름과 시간을 넣어 주세요.'); return null; } if (e1.value <= s1.value) { toast('끝나는 시간이 더 늦어야 해요.'); return null; } return v; };
  if (E) c.append(row(t), P2, tm, row(btn('지우기', 'ghost', () => { delRep(E); ttEd = null; pushSync(true); refreshSheet(); renderHome(); toast('지웠어요.'); }), btn('취소', 'ghost', () => { ttEd = null; refreshSheet(); }), btn('바꾸기', 'teal wide', () => { const v = go(); if (!v) return; delRep(E); const r = addRep(v, s1.value, sel); r.end = e1.value; ttEd = null; save(); pushSync(true); refreshSheet(); renderHome(); toast(`${daysTxt(sel)} ${s1.value}~${e1.value} '${v}'로 바꿨어요.`); })));
  else c.append(row(t), P2, tm, row(btn('시간표에 넣기', 'wide', () => { const v = go(); if (!v) return; const r = addRep(v, s1.value, sel); r.end = e1.value; save(); pushSync(true); refreshSheet(); renderHome(); toast(`${daysTxt(sel)} ${s1.value}~${e1.value} '${v}' 넣었어요.`); })));
  c.appendChild(el('div', 'hint', E ? '요일·시간을 바꾸고 "바꾸기"를 눌러요.' : '요일을 안 고르면 매일이에요. 시간표 칸을 누르면 고치거나 지울 수 있어요.'));
  B.appendChild(c);
};

// ---------- 레나가 오늘 시간표 짜기 ----------
function busyToday() {
  const d = new Date(), L = [];
  S.items.forEach(t => { if (t.done || !t.due || !onDate(t, d)) return; const s = toM(t.due.slice(11, 16)); L.push([s, s + durOf(t), t.text]); });
  if (window.studyBusy) L.push(...window.studyBusy());
  return L.sort((a, b) => a[0] - b[0]);
}
function slotPlan(todos) {
  const n = new Date(), busy = busyToday(); let cur = Math.max(9 * 60, Math.ceil((n.getHours() * 60 + n.getMinutes() + 15) / 15) * 15); const end = 23 * 60, out = [];
  for (const t of todos) { const m = t.mins || 45;
    for (;;) { const hit = busy.find(([s, e]) => cur < e + 10 && cur + m > s - 10); if (!hit) break; cur = Math.ceil((hit[1] + 10) / 15) * 15; }
    if (cur + m > end) break; out.push({ t, s: cur, e: cur + m }); busy.push([cur, cur + m]); cur = cur + m + 15; }
  return out;
}
let draft = null, drafting = false;
async function makeDraft() {
  const todos = openItems().filter(t => !t.due).slice(0, 8);
  if (!todos.length) return { list: [], say: '시간 정할 할 일이 없어요. 오늘은 이미 다 정리돼 있네요.' };
  let say = '';
  if (S.key) { try {
    const sys = `너는 비서 "레나"(장난스럽고 다정한 존댓말). 오늘(${today()}) 할 일들의 순서와 걸리는 시간(분)을 정해. 이미 잡힌 일정: ${JSON.stringify(busyToday().map(([s, e, x]) => `${toT(s)}~${toT(e)} ${x}`))}. 지금 ${hm(new Date())}. 급하거나 짧은 걸 앞에, 머리 쓰는 일은 오전·이른 오후에.
JSON만: {"order":[{"id":"할 일 id","mins":15~180}],"say":"레나의 한두 문장 코멘트"}`;
    const j = await gemini(sys, [{ role: 'user', parts: [{ text: JSON.stringify(todos.map(t => ({ id: t.id, text: t.text }))) }] }]);
    if (j && Array.isArray(j.order)) { const o = j.order.map(x => { const t = todos.find(y => y.id === x.id); if (t) t.mins = Math.max(15, Math.min(180, Math.round((+x.mins || 45) / 15) * 15)); return t; }).filter(Boolean); todos.splice(0, todos.length, ...o, ...todos.filter(t => !o.includes(t))); say = j.say || ''; }
  } catch (e) {} }
  const list = slotPlan(todos).map(x => ({ ...x, on: true }));
  return { list, say: say || (list.length ? '빈 시간에 맞춰 넣어 봤어요. 마음에 안 드는 건 빼고 붙여요.' : '오늘은 빈 시간이 없어요. 내일로 미뤄도 돼요.') };
}
SH.plan = { t: '오늘 시간표', s: () => `${new Date().getMonth() + 1}월 ${new Date().getDate()}일 · 빈 시간에 할 일 넣기`, open: async () => { if (draft || drafting) return; drafting = true; draft = await makeDraft(); drafting = false; refreshSheet(); }, r: B => {
  const h = el('div', 'brief'), hd = el('div', 'bhead'), f = el('i', app.classList.contains('outside') ? 'cat' : ''); hd.append(f, el('p', null, drafting || !draft ? '잠깐만요, 오늘 빈 시간 보고 있어요…' : draft.say)); h.appendChild(hd); B.appendChild(h);
  if (!draft) return;
  const P = el('div', 'pl'); P.style.marginTop = '12px';
  const fixed = busyToday().map(([s, e, x]) => ({ s, e, x, fix: 1 })), rows = [...fixed, ...draft.list].sort((a, b) => a.s - b.s);
  rows.forEach(x => { const it = el('div', 'it' + (x.fix ? ' fix' : x.on ? '' : ' off')); it.append(el('b', null, `${toT(x.s)}~${toT(x.e)}`), el('span', null, x.fix ? x.x : x.t.text));
    if (!x.fix) { const m = el('button', 'm', x.on ? '빼기' : '넣기'); m.onclick = () => { x.on = !x.on; refreshSheet(); }; it.appendChild(m); } P.appendChild(it); });
  B.appendChild(P);
  const sel = draft.list.filter(x => x.on);
  if (draft.list.length) B.appendChild(row(btn(sel.length ? `${sel.length}개 전단지로 붙이기` : '고른 게 없어요', 'teal wide', () => { if (!sel.length) return; sel.forEach(x => { x.t.due = `${today()}T${toT(x.s)}`; }); save(); pushSync(true); renderHome(); const n = sel.length; draft = null; closeSheet(); say(`${n}개 시간 정해서 붙였어요. 시간 되면 제가 먼저 부를게요.`, 'happy', false); }), btn('다시 짜기', 'ghost', () => { draft = null; SH.plan.open(); refreshSheet(); })));
  B.appendChild(el('div', 'hint', '흐린 줄은 이미 잡힌 일정·시간표예요. 붙이면 시간에 맞춰 레나가 알림을 보내요.'));
} };

// ---------- 아침 브리핑 ----------
function top3() {
  const n = new Date(), late = S.items.filter(t => isLate(t) && onDate(t, n) === false).slice(0, 3);
  const tod = S.items.filter(t => !t.done && t.due && !t.rid && onDate(t, n) && new Date(t.due) > n).sort((a, b) => a.due.localeCompare(b.due));
  const und = openItems().filter(t => !t.due);
  return [...late, ...tod, ...und].filter((t, i, a) => a.indexOf(t) === i).slice(0, 3);
}
SH.brief = { t: '오늘 브리핑', s: () => { const d = new Date(); return `${d.getMonth() + 1}월 ${d.getDate()}일 ${WD[d.getDay()]}요일`; }, r: B => {
  const n = new Date(), h = n.getHours(), wrap = el('div', 'brief');
  const ev = S.items.filter(t => !t.done && t.due && onDate(t, n)).sort((a, b) => a.due.localeCompare(b.due)), late = S.items.filter(t => isLate(t) && !onDate(t, n)), und = openItems().filter(t => !t.due);
  const w = S.wx && S.wx.on && S.wx.data && S.wx.data.days.find(x => x.d === today());
  const greet = h < 11 ? `좋은 아침이에요, ${S.name || ''}님.` : h < 17 ? `${S.name || ''}님, 오늘 반 지났어요.` : `${S.name || ''}님, 오늘 남은 거 볼까요?`;
  const sum = ev.length ? `오늘 일정 ${ev.length}개${late.length ? `, 밀린 거 ${late.length}개` : ''}예요.` : late.length ? `오늘 일정은 없고 밀린 게 ${late.length}개 있어요.` : '오늘은 잡힌 일정이 없어요.';
  const hd = el('div', 'bhead'); hd.append(el('i', app.classList.contains('outside') ? 'cat' : ''), el('p', null, `${greet} ${sum}`)); wrap.appendChild(hd);
  if (w) { const s = el('div', 'bsec'); s.append(el('h5', null, '날씨'), el('div', 'r', `${w.code === 0 ? '맑음' : w.pop >= 50 ? '비 소식' : '구름'} · ${w.min}~${w.max}° · 강수 ${w.pop}%${w.pop >= 50 ? ' — 우산 챙겨요' : ''}`)); wrap.appendChild(s); }
  const s1 = el('div', 'bsec'); s1.appendChild(el('h5', null, '오늘 일정'));
  if (ev.length) ev.forEach(t => { const r = el('div', 'r' + (isLate(t) ? ' late' : '')); r.append(el('b', null, t.due.slice(11, 16)), document.createTextNode(t.text)); s1.appendChild(r); }); else s1.appendChild(el('div', 'muted', '비어 있어요.'));
  wrap.appendChild(s1);
  const t3 = top3(); if (t3.length) { const s2 = el('div', 'bsec'), L = el('div', 'top3'); s2.appendChild(el('h5', null, '레나가 고른 오늘 꼭 할 3가지')); t3.forEach(t => { const r = el('div', 'r'); r.appendChild(document.createTextNode(t.text + (isLate(t) ? ' (밀림)' : t.due ? ` · ${t.due.slice(11, 16)}` : ''))); L.appendChild(r); }); s2.appendChild(L); wrap.appendChild(s2); }
  const f = S.fort && S.fort[today()]; const s3 = el('div', 'bsec'); s3.appendChild(el('h5', null, '운세 한 줄'));
  if (f) s3.appendChild(el('div', 'r', `${'★'.repeat(f.total)}${'☆'.repeat(5 - f.total)} ${f.line}`)); else s3.appendChild(row(btn('오늘 운세 쪽지 펴기', 'ghost wide', () => openSheet(2))));
  wrap.appendChild(s3);
  B.appendChild(wrap);
  B.appendChild(row(btn(und.length ? `할 일 ${und.length}개 시간표 짜 주기` : '오늘 시간표 보기', 'teal wide', () => openSheet('plan')), btn('전단지', 'ghost', () => openBoard('today'))));
  B.appendChild(el('div', 'hint', '하루에 한 번, 앱을 처음 열 때 레나가 먼저 보여 줘요. 0번 설정 > 레나가 챙길 것에서 끌 수 있어요.'));
} };
const _on = openSheet; openSheet = function (n) { if (n === 'plan' && !drafting) draft = null; _on(n); if (n === 'plan' || n === 'brief') $('shNum').textContent = '☎'; };
function autoBrief() {
  if (!S.name || B0().brief === false || S.briefDay === today()) return;
  if ($('inc') && $('inc').classList.contains('on')) return setTimeout(autoBrief, 4000);
  if ($('sheet').classList.contains('open')) return setTimeout(autoBrief, 4000);
  S.briefDay = today(); save(); openSheet('brief');
}
setTimeout(autoBrief, 4500);
document.addEventListener('visibilitychange', () => { if (!document.hidden) setTimeout(autoBrief, 2000); });

// 설정: 아침 브리핑 켜기/끄기 (follow.js의 '레나가 챙길 것' 카드에 한 줄 더)
const _s0 = SH[0].r; SH[0].r = Bx => { _s0(Bx); const L = [...Bx.querySelectorAll('.lbl')].find(x => x.textContent === '레나가 챙길 것'); const card = L && L.nextElementSibling; if (!card) return; const o = B0(); const r = el('div', 'row'); r.style.marginTop = '12px'; r.appendChild(el('div', 't', '하루 첫 브리핑')).style.flex = '1'; r.appendChild(pills([[true, '켜기'], [false, '끄기']], o.brief !== false, v => { o.brief = v; save(); refreshSheet(); })); card.appendChild(r); card.appendChild(el('div', 'hint', '그날 앱을 처음 열면 일정·날씨·꼭 할 3가지를 먼저 보여 줘요.')); };
window.lenaPlan = { slotPlan, busyToday, top3 };
})();
