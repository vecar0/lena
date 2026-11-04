// 레나가 먼저 움직이기: A1 하루 리듬 알림 · A2 일정 앞뒤 챙기기 · A3 밀린 일 재촉
//                       D1 시간 제안 · D2 끝났는지 묻기 · D3 반복 일정 · D4 한 번에 정리
// app.js의 전역 함수를 감싸서 덧붙인다(plan, sysPrompt, apply, check, boardRender, SH[0]).
'use strict';
(() => {
const css = `
.ask{align-self:stretch;background:var(--paper);color:#151515;border:2px solid #000;border-radius:4px;box-shadow:3px 3px 0 var(--teal);padding:10px 12px;font-size:14.5px;font-weight:700;line-height:1.45;word-break:keep-all;transform:rotate(-.6deg)}
.ask .who{margin-right:6px;font-size:11px}
.ask .row{margin-top:8px;flex-wrap:wrap}
.ask .btn{height:38px;padding:0 12px;font-size:13.5px}
.ask .btn.ghost{color:#151515;border:1.5px solid rgba(0,0,0,.35)}
.ask.done{opacity:.55;box-shadow:none}
.sug{display:flex;flex-direction:column;gap:10px}
.cln .it .btn{height:34px;padding:0 10px;font-size:12.5px}
.rep{display:flex;flex-direction:column}
`;
document.head.appendChild(Object.assign(document.createElement('style'), { textContent: css }));
const P = () => { if (!S.pro) S.pro = { lunch: '12:30', night: '22:00', before: true, after: true, nag: true }; return S.pro; };
const at = (d, t) => { const [h, m] = t.split(':').map(Number); const x = new Date(d); x.setHours(h, m, 0, 0); return x; };
const dayAdd = (n) => { const d = new Date(); d.setHours(0, 0, 0, 0); d.setDate(d.getDate() + n); return d; };

// ---------- D3 반복 일정 ----------
if (!S.reps) S.reps = []; if (!S.repSkip) S.repSkip = {};
function materialize() {
  let n = 0;
  for (const r of S.reps) for (let i = 0; i < 14; i++) {
    const d = dayAdd(i); if (r.days.length && !r.days.includes(d.getDay())) continue;
    const key = r.id + '_' + dk(d); if (S.repSkip[key]) continue;
    if (S.items.some(t => t.rkey === key)) continue;
    const due = `${dk(d)}T${r.time}`; if (new Date(due) < new Date(Date.now() - 6 * 3600e3)) continue;
    const t = addItem(r.text, due); t.rkey = key; t.rid = r.id; n++;
  }
  // 오래된 건너뛰기 기록 정리
  const lim = dk(dayAdd(-3)); for (const k in S.repSkip) if (k.slice(-10) < lim) delete S.repSkip[k];
  if (n) save();
}
window.materialize = materialize;
const daysTxt = d => !d.length || d.length === 7 ? '매일' : d.length === 5 && [1, 2, 3, 4, 5].every(x => d.includes(x)) ? '평일' : d.length === 2 && d.includes(0) && d.includes(6) ? '주말' : [...d].sort((a, b) => ((a + 6) % 7) - ((b + 6) % 7)).map(x => WD[x]).join('·');
function addRep(text, time, days) { const r = { id: uid('r'), text: String(text).slice(0, 60), time, days: days.filter(v => Number.isInteger(v) && v >= 0 && v < 7) }; S.reps.push(r); materialize(); save(); return r; }
function delRep(r) { S.reps = S.reps.filter(x => x !== r); S.items = S.items.filter(t => !(t.rid === r.id && !t.done && new Date(t.due) > new Date())); save(); }

// ---------- D1 시간 제안 ----------
function busyNear(d) { return S.items.some(t => !t.done && t.due && Math.abs(new Date(t.due) - d) < 75 * 60e3); }
function suggest() {
  const now = new Date(), cand = [];
  for (let i = 0; i < 3; i++) for (const t of ['12:30', '19:30', '21:00', '10:00']) { const d = at(dayAdd(i), t); if (d > new Date(now.getTime() + 40 * 60e3)) cand.push(d); }
  cand.sort((a, b) => a - b); return cand.find(d => !busyNear(d)) || cand[0];
}
function suggestCard(t, onDone) {
  const d = suggest(), c = el('div', 'ask'); c.append(el('span', 'who', '레나'), document.createTextNode(`'${t.text}', ${when(d)}에 할까요? 시간 정해 두면 제가 챙길게요.`));
  const di = inp('datetime-local'); di.style.display = 'none'; di.style.flex = '1 1 100%';
  const fin = (msg, v) => { c.classList.add('done'); c.querySelector('.row') && c.querySelector('.row').remove(); c.appendChild(el('div', 'hint', msg)); if (onDone) onDone(v); };
  c.appendChild(row(btn('좋아', 'teal', () => { t.due = localISO(d); save(); pushSync(true); fin(`${when(d)}로 붙였어요.`); renderHome(); }), btn('다른 때', 'ghost', () => { di.style.display = ''; di.focus(); }), btn('그냥 둘래', 'ghost', () => { t.noSug = dk(new Date()); save(); fin('알았어요. 언제든이에요.'); })));
  c.querySelector('.row').appendChild(di); di.onchange = () => { if (!di.value) return; t.due = di.value; save(); pushSync(true); fin(`${when(di.value)}로 붙였어요.`); renderHome(); };
  return c;
}
const undated = () => openItems().filter(t => !t.due && t.noSug !== dk(new Date()));

// ---------- D2 끝났는지 묻기 ----------
const pastDue = () => S.items.filter(t => !t.done && t.due && Date.now() - new Date(t.due) > 30 * 60e3 && Date.now() - new Date(t.due) < 3 * DAY);
function askDone(t) {
  const c = el('div', 'ask'); c.append(el('span', 'who', '레나'), document.createTextNode(pick([`'${t.text}' 했어요?`, `'${t.text}' 끝났어요? 솔직하게.`, `${when(t.due)} '${t.text}'… 어떻게 됐어요?`])));
  const fin = msg => { c.classList.add('done'); c.querySelector('.row').remove(); c.appendChild(el('div', 'hint', msg)); };
  c.appendChild(row(btn('응, 끝났어', 'teal', () => { setDone(t, true, c); fin('잘했어요. 동전 하나 넣어 뒀어요.'); }), btn('내일로', 'ghost', () => { moveTomorrow(t); fin(`${when(t.due)}로 옮겼어요.`); }), btn('안 할래', 'ghost', () => { delItem(t); fin('떼어 버렸어요.'); })));
  t.asked = 1; save(); return c;
}
function moveTomorrow(t) { const d = new Date(t.due || Date.now()), n = dayAdd(1); n.setHours(t.due ? d.getHours() : 12, t.due ? d.getMinutes() : 0); if (t.rkey) S.repSkip[t.rkey] = 1; t.due = localISO(n); delete t.rkey; t.asked = 0; save(); pushSync(true); renderHome(); }
function delItem(t) { if (t.rkey) S.repSkip[t.rkey] = 1; S.items = S.items.filter(x => x !== t); save(); pushSync(true); renderHome(); }
window.delItem = delItem;

// 통화 화면에 한 번씩 꺼내는 질문
let lastAsk = 0;
function prompts(force) {
  if (!app.classList.contains('calling') || busy || $('sheet').classList.contains('open') || $('arc') && $('arc').classList.contains('on')) return;
  if (!force && Date.now() - lastAsk < 90e3) return;
  const L = $('log');
  const pd = pastDue().filter(t => !t.asked);
  if (pd.length) { lastAsk = Date.now(); L.appendChild(askDone(pd[0])); L.scrollTop = L.scrollHeight; return; }
  const late = S.items.filter(isLate);
  if (late.length >= 2 && S.cleanAsk !== dk(new Date())) { lastAsk = Date.now(); S.cleanAsk = dk(new Date()); save(); const c = el('div', 'ask'); c.append(el('span', 'who', '레나'), document.createTextNode(`지난 전단지가 ${late.length}장이에요. 한 번에 정리할래요? 1분이면 돼요.`)); c.appendChild(row(btn('정리하기', 'teal', () => openSheet('cl')))); L.appendChild(c); L.scrollTop = L.scrollHeight; return; }
  const ud = undated();
  if (ud.length && S.sugDay !== dk(new Date())) { lastAsk = Date.now(); S.sugDay = dk(new Date()); save(); L.appendChild(suggestCard(ud[0])); L.scrollTop = L.scrollHeight; }
}
window.proPrompts = prompts;
setInterval(() => { try { if (S.matDay !== dk(new Date())) { S.matDay = dk(new Date()); materialize(); } if (!document.hidden) prompts(); } catch (e) {} }, 20000);
document.addEventListener('visibilitychange', () => { if (!document.hidden) setTimeout(() => { try { materialize(); prompts(true); } catch (e) {} }, 1500); });

// ---------- D4 한 번에 정리 ----------
SH.cl = { t: '밀린 전단지 정리', s: () => `${S.items.filter(isLate).length}장`, r: B => {
  const L = S.items.filter(isLate).sort((a, b) => a.due.localeCompare(b.due));
  if (!L.length) { B.appendChild(empty('밀린 게 하나도 없어요. …반했어요.', 'st_heart')); return; }
  B.appendChild(row(btn('전부 내일로', 'ghost wide', () => { L.forEach(moveTomorrow); refreshSheet(); toast(`${L.length}장을 내일로 옮겼어요.`); }), btn('전부 끝남', 'teal wide', () => { L.forEach(t => setDone(t, true)); refreshSheet(); })));
  const box = el('div', 'list card cln'); box.style.marginTop = '12px';
  L.forEach(t => { const r = el('div', 'it'), tx = el('div', 't', t.text); tx.appendChild(el('small', null, when(t.due))); r.appendChild(tx);
    r.append(btn('끝남', 'teal', () => { setDone(t, true, r); refreshSheet(); }), btn('내일로', 'ghost', () => { moveTomorrow(t); refreshSheet(); }), btn('지우기', 'ghost', () => { delItem(t); refreshSheet(); })); box.appendChild(r); });
  B.appendChild(box);
} };
$('knock').onclick = () => { dtmf('#'); openSheet('cl'); };
const _rh = renderHome; renderHome = function () { _rh(); $('knock').onclick = () => { dtmf('#'); openSheet('cl'); }; };

// ---------- 전단지 시트에 제안·정리·반복 일정 덧붙이기 ----------
const _br = boardRender; boardRender = function (B) {
  _br(B);
  if (boardTab === 'today') {
    const late = S.items.filter(isLate).length, ud = undated().slice(0, 2);
    if (late || ud.length) { const box = el('div', 'sug'); if (late) box.appendChild(row(btn(`밀린 거 ${late}장 한 번에 정리`, 'wide', () => openSheet('cl')))); ud.forEach(t => box.appendChild(suggestCard(t, () => setTimeout(refreshSheet, 900)))); B.insertBefore(lbl('레나의 제안'), B.children[1]); B.insertBefore(box, B.children[2]); }
  }
  if (boardTab === 'all' || boardTab === 'week') {
    B.appendChild(lbl('반복 일정'));
    const c = el('div', 'card'), t = inp('text', '예: 헬스, 영어 학원'), tm = inp('time', '', '19:00'); let sel = [];
    const P2 = el('div', 'pills'); [1, 2, 3, 4, 5, 6, 0].forEach(i => { const b = el('button', null, WD[i]); b.onclick = () => { sel = sel.includes(i) ? sel.filter(x => x !== i) : [...sel, i]; b.classList.toggle('on'); }; P2.appendChild(b); });
    P2.style.margin = '10px 0';
    c.append(row(t), P2, row(tm, btn('반복으로 붙이기', '', () => { const v = t.value.trim(); if (!v || !tm.value) { toast('이름과 시간을 넣어 주세요.'); return; } addRep(v, tm.value, sel); pushSync(true); refreshSheet(); toast(`${daysTxt(sel)} ${tm.value} '${v}' 계속 붙일게요.`); })));
    c.appendChild(el('div', 'hint', '요일을 안 고르면 매일이에요. 앞으로 2주 치 전단지가 알아서 붙어요. 통화로 "월수금 7시 헬스"라고 해도 돼요.'));
    B.appendChild(c);
    if (S.reps.length) { const l = el('div', 'list card'); l.style.marginTop = '10px'; S.reps.forEach(r => { const it = el('div', 'it'), tx = el('div', 't', r.text); tx.appendChild(el('small', null, `${daysTxt(r.days)} ${r.time}`)); it.append(tx, xbtn(() => { delRep(r); pushSync(true); refreshSheet(); })); l.appendChild(it); }); B.appendChild(l); }
  }
};

// ---------- Gemini: 반복 일정·알람 ----------
const _sys = sysPrompt; sysPrompt = function (sp) {
  let s = _sys(sp);
  s = s.replace('JSON만 출력:', `- 매주 같은 요일·시간에 하는 일(학원, 운동, 수업 등)은 repeat에 {"text","time":"HH:mm","days":[요일 번호 0=일…6=토, 매일이면 []]}. 한 번뿐인 일은 add.
- "알람 맞춰 줘", "꼭 깨워 줘"처럼 진짜 알람이 필요한 일정이면 add 항목에 "alarm":true.
반복 일정: ${JSON.stringify(S.reps.map(r => `${daysTxt(r.days)} ${r.time} ${r.text}`))}
JSON만 출력:`);
  return s.replace('"diary":""}', '"diary":"","repeat":[]}');
};
const _apply = apply; apply = function (r) {
  const extra = [];
  (r.repeat || []).forEach(x => { if (x && x.text && /^\d\d:\d\d$/.test(x.time || '')) { addRep(x.text, x.time, Array.isArray(x.days) ? x.days : []); extra.push(`반복 '${x.text}' ${daysTxt(x.days || [])} ${x.time}`); } });
  const before = new Set(S.items.map(t => t.id));
  const res = _apply(r);
  (r.add || []).forEach(a => { if (a && a.alarm) { const t = S.items.find(x => !before.has(x.id) && x.text === String(a.text).slice(0, 80)); if (t) { t.alarm = true; extra.push(`'${t.text}' 알람`); } } });
  if (extra.length) { save(); pushSync(true); const n = noteEl(extra.slice(0, 3).join(' · ')); if (res) { res.querySelector('span').textContent += ' · ' + extra.join(' · '); return res; } return n; }
  return res;
};

// ---------- A1·A2·A3 레나가 먼저 연락 ----------
const _plan = plan; plan = function () {
  const p = _plan(), o = P(), n = nmc(), now = Date.now(), add = [];
  const push = (id, d, body) => { const t = d.getTime ? d.getTime() : d; if (t > now) add.push({ id, at: t, body }); };
  for (let i = 0; i < 7; i++) {
    const d = dayAdd(i), ev = S.items.filter(t => !t.done && onDate(t, d)).sort((a, b) => a.due.localeCompare(b.due));
    if (o.lunch) { const pm = ev.filter(t => t.due.slice(11) >= o.lunch); push('pa_l_' + dk(d), at(d, o.lunch), `${n}점심은 먹었어요? ` + (pm.length ? `오후엔 ${pm[0].due.slice(11, 16)} '${pm[0].text}'${pm.length > 1 ? ` 외 ${pm.length - 1}개` : ''} 있어요.` : '오후는 비어 있어요. …저랑 놀래요?')); }
    if (o.night) { push('pa_n_' + dk(d), at(d, o.night), pick([`${n}오늘 하루 어땠어요? 전화 걸어서 정리해요. 일기는 제가 쓸게요.`, `${n}잘 시간 다 됐죠? 자기 전에 저한테 하루 얘기해 줘요.`, `${n}오늘도 수고했어요. 내일 일정 같이 볼래요?`])); }
    if (o.nag) for (const tm of ['15:00', '21:00']) { const due = ev.filter(t => t.due.slice(11) < tm); if (due.length) push(`pa_g_${tm}_${dk(d)}`, at(d, tm), pick([`'${due[0].text}' 아직이죠? …해골이 장부 펼쳤어요.`, `${n}'${due[0].text}' 했어요? 했으면 떼 주세요. 동전 줄게요.`]) + (due.length > 1 ? ` (밀린 거 ${due.length}장)` : '')); }
  }
  for (const t of S.items) { if (t.done || !t.due) continue; const a = new Date(t.due).getTime();
    if (o.before) push(t.id + '_h', a - 3600e3, `${n}'${t.text}' 1시간 남았어요. 준비해요?`);
    if (o.after) push(t.id + '_f', a + 3600e3, `'${t.text}' 끝났어요? 어땠는지 들려줘요. 끝났으면 떼 주기.`); }
  const late = S.items.filter(isLate); if (o.nag && late.length) { const d = new Date(); for (const tm of ['15:00', '21:00']) push('pa_late_' + tm + dk(d), at(d, tm), `밀린 전단지 ${late.length}장… '${late[0].text}'부터 정리해요. 1분이면 돼요.`); }
  p.reminders = p.reminders.concat(add).sort((a, b) => a.at - b.at).slice(0, 180);
  return p;
};

// 설정에 "레나가 먼저 연락" 덧붙이기
const _s0 = SH[0].r; SH[0].r = B => {
  _s0(B); const o = P();
  const sec = el('div', 'card');
  const tg = (label, key) => { const r = el('div', 'row'); r.appendChild(el('div', 't', label)).style.flex = '1'; r.appendChild(pills([[true, '켜기'], [false, '끄기']], !!o[key], v => { o[key] = v; save(); pushSync(true); refreshSheet(); })); return r; };
  const tm = (label, key, def) => { const i = inp('time', '', o[key] || def); const r = row(el('div', 't', label), i, pills([[true, '켜기'], [false, '끄기']], !!o[key], v => { o[key] = v ? (i.value || def) : ''; save(); pushSync(true); refreshSheet(); })); r.firstChild.style.flex = '1'; i.onchange = () => { if (o[key]) { o[key] = i.value; save(); pushSync(true); } }; return r; };
  sec.append(tm('점심 체크', 'lunch', '12:30'), tm('밤 마무리', 'night', '22:00'), tg('일정 1시간 전', 'before'), tg('일정 끝나고 물어보기', 'after'), tg('밀린 일 재촉 (15시·21시)', 'nag'));
  sec.appendChild(el('div', 'hint', '폰 알림이 켜져 있으면 앱을 닫아 둬도 레나가 먼저 연락해요. 아침은 7번 모닝콜에서 정해요.'));
  const bk = [...B.querySelectorAll('.lbl')].find(x => x.textContent === '백업') || null;
  B.insertBefore(lbl('레나가 먼저 연락'), bk); B.insertBefore(sec, bk);
};

// 시작할 때
materialize();
setTimeout(() => { try { prompts(true); } catch (e) {} }, 2500);
})();
