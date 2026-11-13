// 레나 위젯 그리기 (v146) — Scriptable 위젯이 이 파일을 받아서 실행한다. U = 위젯 주소, APP = 앱 주소.
// 여기만 고치면 사용자가 위젯 코드를 다시 붙여 넣지 않아도 다음 새로 고침 때 바뀐다.
let d = null; try { d = await new Request(U).loadJSON(); } catch (e) {}
const fam = config.widgetFamily || 'large', big = fam === 'large', small = fam === 'small';
const C = { bg: new Color('#0b0f12'), teal: new Color('#2fe0c8'), pink: new Color('#ff3d9a'), yel: new Color('#f2ea3a'), txt: new Color('#eef4f1'), dim: new Color('#7f8f8b'), bar: new Color('#1f2a2c') };
const w = new ListWidget(); w.backgroundColor = C.bg; w.url = APP; w.setPadding(small ? 12 : 14, 14, 10, 14);
const T = (st, s, c, size, mono) => { const t = st.addText(String(s)); t.textColor = c; t.font = mono ? Font.boldMonospacedSystemFont(size) : Font.semiboldSystemFont(size); t.lineLimit = 1; return t; };
const pad = n => String(n).padStart(2, '0');
if (!d || !d.rows) { T(w, '레나', C.teal, 14); T(w, '레나 앱을 한 번 열어 줘', C.dim, 12); }
else {
  const now = Date.now();
  // 머리: 날짜 · 날씨 · 시험 D-day
  const h = w.addStack(); h.centerAlignContent(); T(h, '☎ ' + d.date, C.teal, small ? 12 : 14); h.addSpacer();
  if (!small && d.wx) { T(h, d.wx, C.dim, 11); h.addSpacer(8); }
  if (d.exam) T(h, d.exam, C.pink, small ? 10 : 12, true);
  // 오늘 공부 막대
  const sd = d.study || { done: 0, plan: 0 };
  if (sd.plan > 0) {
    w.addSpacer(6); const r = w.addStack(); r.centerAlignContent(); r.spacing = 8;
    T(r, `공부 ${sd.done}/${sd.plan}분`, d.now && d.now.study ? C.pink : C.teal, 11, true);
    const W = small ? 60 : 140, f = Math.max(0, Math.min(1, sd.done / sd.plan));
    const bar = r.addStack(); bar.size = new Size(W, 6); bar.backgroundColor = C.bar; bar.cornerRadius = 3; bar.layoutHorizontally();
    if (f > 0) { const fill = bar.addStack(); fill.size = new Size(Math.max(6, W * f), 6); fill.backgroundColor = C.teal; fill.cornerRadius = 3; }
    bar.addSpacer();
    if (d.now && d.now.study && !small) T(r, `지금 공부 중 ~${d.now.until}`, C.pink, 10);
  }
  w.addSpacer(8);
  const rowsOf = (st, list, n) => list.filter(x => x.e > now).slice(0, n).forEach(x => { const s = st.addStack(); s.spacing = 6; T(s, x.t || '종일', x.k === 'st' ? C.teal : x.k === 'todo' ? C.yel : x.k === 'play' ? C.dim : C.pink, 11, true); T(s, x.x, C.txt, 12); st.addSpacer(3); });
  const body = w.addStack(); body.topAlignContent();
  const L = body.addStack(); L.layoutVertically();
  const left = d.rows.filter(x => x.e > now);
  if (!small) T(L, '오늘', C.dim, 10, true), L.addSpacer(2);
  if (!left.length) T(L, '오늘 남은 일정 없음', C.dim, 12); else rowsOf(L, left, small ? 4 : big ? 7 : 4);
  if (big && (d.tom || []).length) { L.addSpacer(8); T(L, '내일 ' + (d.tdate || ''), C.dim, 10, true); L.addSpacer(2); rowsOf(L, d.tom, 5); }
  if (!small) {
    body.addSpacer(12); const R = body.addStack(); R.layoutVertically();
    T(R, d.late ? `할 일 · 밀림 ${d.late}` : '할 일', d.late ? C.pink : C.yel, 11, true); R.addSpacer(3);
    const td = (d.todos || []).slice(0, big ? 12 : 4);
    if (!td.length) T(R, '다 했어', C.dim, 12);
    td.forEach(x => { T(R, (x.l ? '! ' : '□ ') + x.x, x.l ? C.pink : C.txt, 12); if (big && x.d) T(R, '   ' + x.d, C.dim, 9); R.addSpacer(2); });
  }
  w.addSpacer();
  const f = w.addStack(); f.spacing = 10; f.centerAlignContent();
  if (!small && d.mc) T(f, '⏰ ' + d.mc, C.teal, 10, true);
  if (!small && d.miss) T(f, '부재중 ' + d.miss, C.pink, 10, true);
  f.addSpacer(); const up = new Date(d.up || 0); T(f, `올린 시각 ${pad(up.getHours())}:${pad(up.getMinutes())}`, C.dim, 9);
}
w.refreshAfterDate = new Date(Date.now() + 15 * 60 * 1000);
if (config.runsInWidget) Script.setWidget(w); else await w.presentLarge();
Script.complete();
