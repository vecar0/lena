/* v141 홈 화면 위젯(Scriptable) + 공부 시간 지키기(단축어 자동화)
   앱이 우편함 서버(box-worker.js v3)의 /state에 오늘 시간표·할 일·공부 시간을 올린다.
   위젯은 /widget을, 단축어 자동화(유튜브·인스타 같은 앱을 열 때)는 /now를 물어본다. */
'use strict';
(() => {
if (typeof SH === 'undefined' || !SH.box) return;
const B = () => (S.box || '').replace(/\/+$/, '');
const url = p => `${B()}${p}?t=${S.boxTok}`;
const pad = n => String(n).padStart(2, '0'), hm = m => `${pad(Math.floor(m / 60) % 24)}:${pad(m % 60)}`;
const WDK = ['일', '월', '화', '수', '목', '금', '토'];
const mid = k => { const [y, m, d] = k.split('-').map(Number); return new Date(y, m - 1, d).getTime(); };

// ---------- 올릴 내용 ----------
function stateData() {
  const LS = window.lenaStudy, now = new Date(), k = LS.todayK(), P = LS.plan(), D = P.days.find(x => x.k === k), base = mid(k);
  const rows = LS.dayRows(k, D).filter(r => r.kind !== 'log' && !r.done).map(r => {
    const endM = r.kind === 'fix' ? ((/~(\d\d):(\d\d)/.exec(r.txt) || []).slice(1).reduce((a, v, i) => a + (+v) * (i ? 1 : 60), 0) || r.s + 60) : r.kind === 'ev' ? r.s + ((r.it && r.it.mins) || 60) : r.s + (r.mins || 0);
    return { t: r.s >= 0 ? hm(r.s) : '', x: r.txt.replace(/\s*~\d\d:\d\d\s*$/, '').replace(/\s*~$/, ''), k: r.kind, e: r.s >= 0 ? base + Math.max(endM, r.s + 1) * 60e3 : base + 864e5 };
  });
  const todos = openItems().filter(t => !isEv(t)).sort((a, b) => (a.due || '9').localeCompare(b.due || '9')).slice(0, 10).map(t => ({ x: t.text, d: t.due ? t.due.slice(5, 16).replace('-', '/').replace('T', ' ') : '' }));
  const st = [];
  P.days.slice(0, 2).forEach(Dy => { const b0 = mid(Dy.k); (Dy.blocks || []).forEach(b => { if (b.school || b.sub === '할 일' || b.sub === '루틴') return; st.push({ s: b0 + b.s * 60e3, e: b0 + b.e * 60e3, l: [b.sub, ...(b.parts || []).map(p => p.t && p.t.label)].filter(Boolean).join(' ').slice(0, 40) || '공부' }); }); });
  return { w: { date: `${now.getMonth() + 1}/${now.getDate()} ${WDK[now.getDay()]}`, rows, todos }, st: st.filter(b => b.e > Date.now()), on: S.lockOn !== false, pause: S.lockPause || 0, tz: now.getTimezoneOffset() };
}
let last = '', sT = 0;
async function syncState(force) {
  if (!S.box || !window.lenaStudy) return;
  let d; try { d = stateData(); } catch (e) { return; }
  const j = JSON.stringify(d); if (!force && j === last) return;
  try { const r = await fetch(B() + '/state', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ t: S.boxTok, ...d }) }); if (r.ok) { last = j; S.wgOk = Date.now(); save(); } } catch (e) {}
}
const _ps = pushSync; pushSync = function (f) { _ps(f); clearTimeout(sT); sT = setTimeout(() => syncState(f), 900); };
setTimeout(syncState, 4000); setInterval(() => { if (!document.hidden) syncState(); }, 10 * 60e3);
document.addEventListener('visibilitychange', () => { if (!document.hidden) setTimeout(syncState, 1500); });

// ---------- Scriptable 위젯 코드 ----------
function widgetCode() {
  return `// 레나 위젯 — Scriptable 앱에 붙여 넣기
const U = ${JSON.stringify(url('/widget'))};
const APP = "https://vecar0.github.io/lena/";
let d = null; try { d = await new Request(U).loadJSON(); } catch (e) {}
const fam = config.widgetFamily || "medium";
const C = { bg: new Color("#0b0f12"), teal: new Color("#2fe0c8"), pink: new Color("#ff3d9a"), yel: new Color("#f2ea3a"), txt: new Color("#eef4f1"), dim: new Color("#7f8f8b") };
const w = new ListWidget(); w.backgroundColor = C.bg; w.url = APP; w.setPadding(12, 14, 10, 14);
function T(st, s, c, size, mono) { const t = st.addText(s); t.textColor = c; t.font = mono ? Font.boldMonospacedSystemFont(size) : Font.semiboldSystemFont(size); t.lineLimit = 1; return t; }
if (!d || !d.rows) { T(w, "레나", C.teal, 14); T(w, "레나 앱을 한 번 열어 줘", C.dim, 12); }
else {
  const now = Date.now(), h = w.addStack(); h.centerAlignContent();
  T(h, "☎ " + d.date, C.teal, 13); h.addSpacer();
  if (d.now && d.now.study) T(h, "공부 중 ~" + d.now.until, C.pink, 11, true);
  w.addSpacer(6);
  const body = w.addStack(); body.topAlignContent();
  const L = body.addStack(); L.layoutVertically();
  const rows = d.rows.filter(r => r.e > now).slice(0, fam === "small" ? 4 : fam === "large" ? 13 : 5);
  if (!rows.length) T(L, "오늘 남은 일정 없음", C.dim, 12);
  rows.forEach(r => { const s = L.addStack(); s.spacing = 6; T(s, r.t || "종일", r.k === "st" ? C.teal : r.k === "todo" ? C.yel : C.pink, 11, true); T(s, r.x, C.txt, 12); L.addSpacer(3); });
  if (fam !== "small") {
    body.addSpacer(12); const R = body.addStack(); R.layoutVertically();
    T(R, "할 일", C.yel, 11, true); R.addSpacer(3);
    const td = (d.todos || []).slice(0, fam === "large" ? 12 : 4);
    if (!td.length) T(R, "다 했어", C.dim, 12);
    td.forEach(x => { T(R, "□ " + x.x, C.txt, 12); R.addSpacer(2); });
  }
  w.addSpacer();
  const up = new Date(d.up || 0); T(w, "앱에서 올린 시각 " + String(up.getHours()).padStart(2, "0") + ":" + String(up.getMinutes()).padStart(2, "0"), C.dim, 9);
}
w.refreshAfterDate = new Date(Date.now() + 15 * 60 * 1000);
if (config.runsInWidget) Script.setWidget(w); else await w.presentMedium();
Script.complete();
`;
}
function copy(t, msg) { (navigator.clipboard ? navigator.clipboard.writeText(t) : Promise.reject()).then(() => toast(msg)).catch(() => { prompt('길게 눌러 복사해', t); }); }

// ---------- 단축어 연결 화면에 5·6번 ----------
const _r = SH.box.r; SH.box.r = Bx => {
  _r(Bx); if (!S.box) return;
  const ago = t => !t ? '아직' : Math.round((Date.now() - t) / 60000) < 1 ? '방금' : Math.round((Date.now() - t) / 60000) + '분 전';
  Bx.appendChild(lbl('5. 홈 화면 위젯 (시간표·할 일)'));
  const a = el('div', 'card'), ga = el('div', 'guide');
  ga.innerHTML = '앱을 안 열어도 홈 화면에서 오늘 남은 일정·공부·할 일을 봐요. 앱을 열 때마다 내용이 서버에 올라가고, 위젯은 15분쯤마다 새로 받아요.<ol><li>App Store에서 무료 앱 <b>Scriptable</b> 설치</li><li>아래 <b>위젯 코드 복사</b> → Scriptable 열기 → 오른쪽 위 <b>+</b> → 붙여 넣기 → 위 제목을 <b>레나</b>로 → 완료</li><li>홈 화면 빈 곳 길게 누르기 → 왼쪽 위 <b>+</b>(편집) → <b>Scriptable</b> → 중간 크기 → 위젯 추가</li><li>추가된 위젯을 길게 누르기 → <b>위젯 편집</b> → Script: <b>레나</b></li></ol>';
  a.append(ga, el('div', 'hint', `마지막으로 올린 때: ${ago(S.wgOk)}`), row(btn('위젯 코드 복사', 'teal', () => copy(widgetCode(), '복사했어. Scriptable에 붙여 넣어.')), btn('지금 올리기', 'ghost', () => syncState(true).then(() => { toast('올렸어.'); refreshSheet(); }))));
  Bx.appendChild(a);

  Bx.appendChild(lbl('6. 공부 시간 지키기'));
  const c = el('div', 'card'), gc = el('div', 'guide'), on = S.lockOn !== false, paused = (S.lockPause || 0) > Date.now();
  gc.innerHTML = '공부 시간표(4번)의 공부 시간에 <b>유튜브·인스타·게임</b> 같은 앱을 열면 바로 홈 화면으로 돌려보내요. 고르지 않은 앱(음악 앱 등)은 그대로 돼요. 아이폰 스크린 타임은 다른 앱이 바꿀 수 없어서, 단축어 <b>자동화</b>로 해요.<ol><li>단축어 앱 → 아래 <b>자동화</b> → <b>+</b> → <b>앱</b></li><li><b>앱 선택</b>에서 막을 앱들 고르기(음악 앱은 고르지 않기) → <b>열릴 때</b> 체크 → <b>즉시 실행</b> → 다음</li><li><b>새로운 빈 자동화</b> → 동작 추가:<br>① <b>[URL]</b> → <b>URL</b>(URL) 동작에 아래 주소 붙여 넣기<br>② <b>[URL의 콘텐츠 가져오기]</b>(Get Contents of URL)<br>③ <b>[만약]</b>(If) → 조건 <b>다음을 포함함</b>(contains) → <b>공부 중</b></li><li>만약 안에: <b>[알림 보기]</b>(Show Notification) — 내용에 ②의 결과(URL의 콘텐츠)를 넣기 → <b>[홈 화면으로 이동]</b>(Go to Home Screen)</li><li>완료. 이제 공부 시간에 그 앱을 열면 “공부 중 · 수학 · 21:50까지” 알림이 뜨고 홈 화면으로 나가요.</li></ol>';
  const sw = btn(on ? '켜짐 — 공부 시간에 막기' : '꺼짐 — 막지 않기', on ? 'teal wide' : 'ghost wide', () => { S.lockOn = !on; save(); syncState(true); refreshSheet(); });
  const st = el('div', 'hint', '지금 상태: 확인 중…'); fetch(url('/now')).then(r => r.text()).then(t => { st.textContent = '지금 상태: ' + t; }).catch(() => { st.textContent = '지금 상태: 서버에 닿지 않음'; });
  const cp = el('div', 'cp'), code = el('code', null, url('/now')); cp.append(code, btn('복사', 'ghost', () => copy(url('/now'), '복사했어. 단축어 URL 동작에 붙여 넣어.')));
  c.append(gc, cp, row(sw), st);
  c.appendChild(row(btn(paused ? `풀림 — ${new Date(S.lockPause).toTimeString().slice(0, 5)}까지` : '급할 때 15분만 풀기', 'ghost wide', () => { S.lockPause = paused ? 0 : Date.now() + 15 * 60e3; save(); syncState(true).then(refreshSheet); })));
  Bx.appendChild(c);
};
window.lenaWidget = { stateData, syncState, widgetCode };
})();
