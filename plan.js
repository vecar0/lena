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
.tt .hd{height:36px;line-height:1.05;text-align:center}.tt .hd small{display:block;font-family:'Space Mono',monospace;font-size:9px;font-weight:700;opacity:.7}
.tt .blk.fix{background:var(--bc)}
.tt .blk.one{background:#0b0d10;color:#fff;border:2px dashed var(--bc);z-index:1}
.tt .blk.study{background:color-mix(in srgb,var(--bc) 55%,#0b0d10);color:#fff;border:1.5px solid var(--bc);border-left:4px solid var(--bc)}
.tt .blk.play{background:repeating-linear-gradient(-45deg,rgba(47,224,200,.28) 0 6px,rgba(47,224,200,.08) 6px 12px);color:#9ff5e4;border:1px solid rgba(47,224,200,.5)}
.ttpop{position:fixed;inset:0;z-index:300;background:rgba(0,0,0,.45);display:flex;align-items:flex-end;justify-content:center;padding:16px 16px calc(24px + env(safe-area-inset-bottom))}
.ttpc{width:100%;max-width:420px;background:#f3efe6;color:#111;border:2px solid #000;border-radius:6px;padding:16px 16px 12px;box-shadow:4px 4px 0 #000;transform:rotate(-.6deg);animation:ttpIn .18s ease-out}
@keyframes ttpIn{from{transform:translateY(30px) rotate(-.6deg);opacity:0}}
.ttpc .tk{display:inline-block;font-size:12px;font-weight:800;padding:3px 8px;border:1.5px solid #000;border-radius:3px;background:var(--bc,#e6e1d3)}.ttpc .tk.play{background:repeating-linear-gradient(45deg,#e6e1d3 0 5px,#fff 5px 10px)}.ttpc .tk.one{background:#ffd0e6}.ttpc .tk.dl{background:#f2ea3a}
.ttpc h3{font:22px 'Black Han Sans',sans-serif;margin:10px 0 4px;line-height:1.25;word-break:keep-all}
.ttpc .tm{font:700 14px 'Space Mono',monospace;color:#333}
.ttpc .tl{margin-top:10px;border-top:1.5px dashed rgba(0,0,0,.3);padding-top:8px;display:grid;gap:6px;max-height:40vh;overflow:auto}
.ttpc .tr{display:flex;gap:8px;font-size:14px;line-height:1.35}.ttpc .tr b{font:700 12px 'Space Mono',monospace;flex:none;padding-top:2px}
.ttpc .hint{color:#555;margin-top:6px}.ttpc .qrow{margin-top:12px;display:flex;gap:8px;flex-wrap:wrap}.ttpc .qrow button{flex:1;min-height:44px;color:#111;border-color:#000;background:#fff}
.ttlg{display:flex;flex-wrap:wrap;gap:6px 12px;margin:2px 2px 8px;font-size:11.5px;font-weight:700;color:#cfd8dc}.ttlg span{display:flex;align-items:center;gap:5px}.ttlg i{width:16px;height:11px;border-radius:3px}
.ttlg i.fix{background:#ff8fc4;border:1.5px solid #000}.ttlg i.one{border:2px dashed #ff8fc4}.ttlg i.study{background:#7fecd9;border-left:4px solid #2fe0c8}.ttlg i.play{background:repeating-linear-gradient(-45deg,rgba(47,224,200,.5) 0 3px,transparent 3px 6px)}
.ttp{padding:24px 8px 10px;transform:rotate(-.3deg)}
.ttp .ttlg{color:rgba(0,0,0,.62);margin:0 2px 8px}
.ttp .ttlg i.fix{background:#ff9ccb;border:1.5px solid #000}.ttp .ttlg i.one{border:2px dashed #17181a}.ttp .ttlg i.study{background:linear-gradient(transparent 30%,rgba(127,236,217,.9) 30%)}.ttp .ttlg i.play{background:repeating-linear-gradient(-45deg,rgba(47,224,200,.55) 0 3px,transparent 3px 6px);border:1px solid rgba(0,0,0,.25)}
.ttp .tt{grid-template-columns:26px repeat(7,minmax(0,1fr));background:transparent;border:2px solid #17181a;border-radius:4px}
.ttp .tt .hd{display:block;padding:5px 0 0;gap:0;justify-content:normal;color:#17181a;border-bottom:2px solid #17181a;font-family:'Black Han Sans';font-weight:400;font-size:14px}.ttp .tt .hd small{font-family:'Space Mono',monospace;font-size:9px;margin-top:1px}.ttp .tt .hd b{font:inherit}
.ttp .tt .hd.td{background:linear-gradient(transparent 0,rgba(255,61,154,.9) 0);color:#fff}
.ttp .tt .col{border-left:1px solid rgba(0,0,0,.2)}
.ttp .tt .ax span{color:rgba(0,0,0,.5);font-weight:700}
.ttp .tt .ln{border-top:1px dashed rgba(0,0,0,.14)}
.ttp .tt .blk{border-radius:3px;box-shadow:1.5px 1.5px 0 rgba(0,0,0,.55)}
.ttp .tt .blk.fix{background:color-mix(in srgb,var(--bc) 78%,#fff);border:1.5px solid #17181a}
.ttp .tt .blk.one{background:rgba(255,255,255,.7);color:#17181a;border:2px dashed #17181a;box-shadow:none}
.ttp .tt .blk.study{background:color-mix(in srgb,var(--bc) 45%,#f3efe6);color:#17181a;border:1.5px solid rgba(0,0,0,.55);border-left:5px solid var(--bc)}
.ttp .tt .blk.play{background:repeating-linear-gradient(-45deg,rgba(47,224,200,.4) 0 6px,rgba(47,224,200,.12) 6px 12px);color:#0b6b5c;border:1.5px dashed rgba(0,0,0,.4);box-shadow:none}
.ttp .tt .now{border-top:2px solid #d6204f}.ttp .tt .now::before{content:"";position:absolute;left:-3px;top:-5px;width:8px;height:8px;border-radius:50%;background:#d6204f}
.ttwk{display:flex;align-items:center;justify-content:space-between;margin-bottom:6px}.ttwk b{font-family:'Black Han Sans';font-weight:400;font-size:18px}.ttwk .btn{width:44px;height:40px;padding:0}
.ttp .tt .blk.one{background:color-mix(in srgb,#ff5fa8 30%,#fff);border:2px dashed #d6204f}
.ttp .tt .blk.dl{background:#f2ea3a;border:1.5px solid #17181a;border-radius:8px;font-size:10px;font-weight:800;padding:1px 5px;line-height:12px;box-shadow:1px 1px 0 #17181a;z-index:4;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.ttp .tt .blk.sh{white-space:nowrap;text-overflow:ellipsis;font-size:9.5px;line-height:1.1;padding-top:1px}
.ttp .ttlg i.one{border:2px dashed #d6204f;background:color-mix(in srgb,#ff5fa8 30%,#fff)}.ttp .ttlg i.dl{background:#f2ea3a;border:1.5px solid #17181a}
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
const toT = m => `${String(Math.floor(m / 60) % 24).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;
const repEnd = r => r.end || toT(Math.min(24 * 60 - 1, toM(r.time) + 60));
const durOf = t => { if (t.rid) { const r = (S.reps || []).find(x => x.id === t.rid); if (r) return toM(repEnd(r)) - toM(r.time); } return t.mins || 60; };
const B0 = () => { if (!S.pro) S.pro = {}; if (S.pro.brief === undefined) S.pro.brief = true; return S.pro; };

// ---------- 시간표 탭 (전단지 시트 안) ----------
let ttEd = null, ttAdd = false; let ttW = 0;
const _bt = boardTabs; boardTabs = function (B) {
  const T = el('div', 'tabs'); [['today', '오늘'], ['week', '이번 주'], ['tt', '시간표'], ['all', '전체']].forEach(([v, l]) => { const b = el('button', boardTab === v ? 'on' : '', l); b.onclick = () => { boardTab = v; refreshSheet(); }; T.appendChild(b); }); B.appendChild(T);
};
// v102: 시간표 칸을 누르면 자세한 이름·시간 쪽지
function ttPop(o, day) {
  document.querySelectorAll('.ttpop').forEach(x => x.remove());
  const WDN = ['일', '월', '화', '수', '목', '금', '토'], KN = { fix: '고정 (매주)', one: '일정', dl: '할 일 마감', study: '공부', play: '휴식 시간' };
  const bg = el('div', 'ttpop'), P = el('div', 'ttpc'); bg.onclick = e => { if (e.target === bg) bg.remove(); };
  const tag = el('span', 'tk ' + o.k, KN[o.k] || ''); if (o.c && o.k !== 'play') tag.style.setProperty('--bc', o.c);
  P.append(tag, el('h3', null, o.full || o.t));
  const mins = o.e - o.s, tm = o.k === 'dl' ? `${toT(o.e)} 마감` : `${toT(o.s)} ~ ${toT(o.e)} · ${mins >= 60 ? Math.floor(mins / 60) + '시간' + (mins % 60 ? ' ' + mins % 60 + '분' : '') : mins + '분'}`;
  P.appendChild(el('div', 'tm', `${day.getMonth() + 1}/${day.getDate()} (${WDN[day.getDay()]}) ${tm}`));
  if (o.raw) { const ul = el('div', 'tl'); o.raw.forEach(b => b.parts.forEach(p => { const r = el('div', 'tr'); r.append(el('b', null, `${toT(b.s)}~${toT(b.e)}`), el('span', null, `${p.t.sub} · ${p.t.label} (${p.mins}분)`)); ul.appendChild(r); })); P.appendChild(ul); }
  if (o.k === 'fix' && o.r && o.r.days) P.appendChild(el('div', 'hint', '매주 ' + (o.r.days.length ? o.r.days.map(d => WDN[d]).join('·') : '매일')));
  const row = el('div', 'qrow');
  if (o.k === 'fix') row.append(btn(ttEd === o.r ? '고치기 닫기' : '고치기', 'ghost', () => { bg.remove(); ttEd = ttEd === o.r ? null : o.r; refreshSheet(); }));
  if (o.k === 'study' || o.k === 'play') row.append(btn('공부 화면 열기', 'ghost', () => { bg.remove(); openSheet(6); }));
  if (o.k === 'one' || o.k === 'dl') row.append(btn('전단지에서 보기', 'ghost', () => { bg.remove(); openBoard(o.k === 'one' ? 'today' : 'all'); }));
  row.append(btn('닫기', 'ghost', () => bg.remove())); P.appendChild(row);
  bg.appendChild(P); document.body.appendChild(bg);
}
const _br = boardRender; boardRender = function (B) {
  if (boardTab !== 'tt') {
    _br(B);
    if (boardTab === 'today') { const r = el('div', 'qrow'); r.append(btn('☎ 오늘 브리핑', 'ghost', () => openSheet('brief')), btn('레나가 시간표 짜기', 'ghost', () => openSheet('plan'))); r.lastChild.style.color = 'var(--teal)'; B.insertBefore(r, B.children[1]); }
    return;
  }
  boardTabs(B);
  // v77: 이번 주(월~일) 한 장에 — 고정(매주) · 한 번만(일정) · 공부(과목 색) · 휴식 시간
  const R = (S.reps || []).slice(), LS = window.lenaStudy, SUBJ = /국어|영어|수학|사회|과학|한국사|역사|물리|화학|생명|지구|도덕|기술|가정|음악|미술|체육|정보|일본어|중국어/;
  const colF = t => { const m = String(t || '').match(SUBJ); return m && LS && LS.colOf ? LS.colOf(m[0]) : '#e6e1d3'; };
  const now0 = new Date(), mon = new Date(now0); mon.setHours(0, 0, 0, 0); mon.setDate(mon.getDate() - ((mon.getDay() + 6) % 7) + ttW * 7);
  const order = [1, 2, 3, 4, 5, 6, 0], dates = order.map((d, i) => { const x = new Date(mon); x.setDate(mon.getDate() + i); return x; });
  const ev = {}; dates.forEach(x => { ev[dk(x)] = []; });
  dates.forEach((x, i) => { const d = order[i], k = dk(x); R.filter(r => (!r.days.length || r.days.includes(d)) && !(S.repSkip || {})[r.id + '_' + k]).forEach(r => ev[k].push({ s: toM(r.time), e: toM(repEnd(r)), t: r.text, k: 'fix', r, c: colF(r.text) })); });
  S.items.forEach(t => { if (t.done || t.rid || !t.due || !ev[t.due.slice(0, 10)]) return; const s = toM(t.due.slice(11, 16)); if (!s && t.due.slice(11, 16) !== '00:00') return; if (isEv(t)) ev[t.due.slice(0, 10)].push({ s, e: s + (t.mins || 60), t: t.text, k: 'one', c: '#ff5fa8' }); else ev[t.due.slice(0, 10)].push({ s: Math.max(0, s - 25), e: s, t: t.text + ' 마감', k: 'dl', c: '#f2ea3a' }); });
  try { const P = LS && LS.plan(); (P ? P.days : []).forEach(D => { if (!ev[D.k]) return; { let cur = null; D.blocks.forEach(b => { if (cur && b.s - cur.e <= 20 && !b.school === !cur.school) { cur.e = b.e; cur.raw.push(b); if (!cur.subs.includes(b.sub)) cur.subs.push(b.sub); } else { cur = { s: b.s, e: b.e, subs: [b.sub], raw: [b], school: b.school }; ev[D.k].push(cur); } }); ev[D.k].forEach(o => { if (o.subs) Object.assign(o, { t: o.school ? `🏫 ${o.subs.join('·')}` : `${o.subs.join('·')} 공부`, full: o.school ? `학교에서 ${o.subs.join('·')} 공부` : undefined, k: 'study', c: LS.colOf(o.subs[0]), sub: o.subs[0] }); }); } if (D.play) ev[D.k].push({ s: D.play.s, e: D.play.e, t: '휴식 시간', k: 'play' }); }); } catch (e) {}
  const all = Object.values(ev).flat(), lo = Math.min(9, ...all.map(x => Math.floor(x.s / 60))), hi = Math.max(18, ...all.map(x => Math.ceil(x.e / 60)));
  const PX = 34, H = (hi - lo) * PX, tdw = now0.getDay();
  const WN = el('div', 'ttwk'); WN.append(btn('‹', 'ghost', () => { ttW--; refreshSheet(); }), el('b', null, ttW === 0 ? '이번 주' : ttW === 1 ? '다음 주' : ttW === -1 ? '지난 주' : `${mon.getMonth() + 1}/${mon.getDate()} 주`), btn('›', 'ghost', () => { ttW++; refreshSheet(); })); B.appendChild(WN);
  const LG = el('div', 'ttlg'); [['fix', '고정(매주)'], ['one', '일정'], ['dl', '할 일 마감'], ['study', '공부(과목 색)'], ['play', '휴식']].forEach(([k, l]) => { const s = el('span', null, l); s.prepend(el('i', k)); LG.appendChild(s); }); const PP = el('div', 'sheetp ttp'); PP.append(el('i', 'tape'), el('i', 'tape r'), LG); B.appendChild(PP);
  const G = el('div', 'tt');
  G.appendChild(el('div', 'hd')); dates.forEach((x, i) => { const h = el('div', 'hd' + (order[i] === tdw && ttW === 0 ? ' td' : '')); h.append(WD[order[i]], el('small', null, `${x.getMonth() + 1}/${x.getDate()}`)); G.appendChild(h); });
  const ax = el('div', 'ax'); ax.style.height = H + 'px'; for (let h = lo; h <= hi; h++) { const s = el('span', null, String(h % 24)); s.style.top = ((h - lo) * PX) + 'px'; if (h > lo && h < hi) ax.appendChild(s); } G.appendChild(ax);
  dates.forEach((x, i) => {
    const c = el('div', 'col'); c.style.height = H + 'px';
    for (let h = lo + 1; h < hi; h++) { const l = el('div', 'ln'); l.style.top = ((h - lo) * PX) + 'px'; c.appendChild(l); }
    // 같은 시간에 겹치면 옆으로 나란히(덮지 않게)
    const evs = ev[dk(x)].sort((a, b) => a.s - b.s || b.e - a.e); let cl = [], clE = -1; const flush = () => { const n = Math.max(...cl.map(o => o.lane)) + 1; cl.forEach(o => { o.n = n; }); cl = []; clE = -1; };
    evs.filter(o => !o.school && o.k !== 'dl').forEach(o => { if (cl.length && o.s >= clE) flush(); const used = new Set(cl.filter(y => y.e > o.s).map(y => y.lane)); let ln = 0; while (used.has(ln)) ln++; o.lane = ln; cl.push(o); clE = Math.max(clE, o.e); }); if (cl.length) flush();
    evs.forEach(o => {
      const b = el('button', 'blk ' + o.k); b.style.top = ((o.s - lo * 60) / 60 * PX) + 'px'; b.style.height = Math.max(16, (o.e - o.s) / 60 * PX - 2) + 'px';
      if (o.k === 'dl') { b.style.top = ((o.e - lo * 60) / 60 * PX - 16) + 'px'; b.style.height = '16px'; b.style.left = 'auto'; b.style.right = '1px'; b.style.width = 'auto'; b.style.maxWidth = '94%'; b.style.zIndex = 4; b.textContent = '⏰ ' + o.t.replace(/ 마감$/, ''); b.classList.add('sh'); } /* v109: 마감은 칸을 나누지 않고 오른쪽 위에 작은 꼬리표 */
      else if (o.school) { b.style.left = '22%'; b.style.right = '3px'; b.style.zIndex = 3; b.style.boxShadow = '0 0 0 2px #fff'; } /* v108: 학교 안에 겹쳐서 보이게 */
      else if (o.n > 1) { b.style.left = `calc(${o.lane / o.n * 100}% + 1px)`; b.style.right = 'auto'; b.style.width = `calc(${100 / o.n}% - 2px)`; b.style.fontSize = '9px'; }
      if (o.k !== 'play') b.style.setProperty('--bc', o.c); if (o.k !== 'dl') b.append(document.createTextNode(o.t)); if (o.k === 'dl') {} else if ((o.e - o.s) >= 45) b.appendChild(el('small', null, toT(o.s))); else b.classList.add('sh');
      if (o.k === 'fix' && ttEd === o.r) b.style.outline = '3px solid #fff';
      b.onclick = () => ttPop(o, x); /* v102: 누르면 이름·정확한 시간이 나오는 쪽지 */
      c.appendChild(b); });
    if (order[i] === tdw && ttW === 0) { const m = now0.getHours() * 60 + now0.getMinutes(); if (m > lo * 60 && m < hi * 60) { const l = el('div', 'now'); l.style.top = ((m - lo * 60) / 60 * PX) + 'px'; c.appendChild(l); } }
    G.appendChild(c); });
  PP.appendChild(G); if (S.planErr) B.appendChild(el('div', 'warn', '공부 계획을 못 만들었어요: ' + S.planErr + ' — 이 화면을 캡처해서 보내 주세요.'));
  if (!R.length) B.appendChild(el('div', 'hint', '아직 비어 있어요. 학원·수업·운동처럼 매주 정해진 걸 넣으면, 레나가 그 시간은 피해서 하루를 짜 줘요.'));
  // 넣기/고치기: 프리셋을 누르면 칸이 채워지고, 시간표 칸을 누르면 그 블록을 고친다
  const E = ttEd && (S.reps || []).includes(ttEd) ? ttEd : null; if (!E) ttEd = null;
  if (!E && !ttAdd) { const ob = btn('+ 고정 일정 넣기 (매주 반복)', 'ghost wide', () => { ttAdd = true; refreshSheet(); }); ob.style.marginTop = '12px'; B.appendChild(ob); B.appendChild(el('div', 'hint', '한 번만 있는 일정·할 일은 1번 전단지에서 붙여요.')); return; }
  B.appendChild(lbl(E ? `'${E.text}' 고치기` : '고정 일정 넣기'));
  const c = el('div', 'card'), t = inp('text', '이름 (예: 영어 학원)', E ? E.text : ''), s1 = inp('time', '', E ? E.time : '19:00'), e1 = inp('time', '', E ? repEnd(E) : '21:00'); let sel = E ? E.days.slice() : [];
  const P2 = el('div', 'pills'); P2.style.margin = '10px 0';
  const drawDays = () => { P2.innerHTML = ''; order.forEach(i => { const b = el('button', sel.includes(i) ? 'on' : '', WD[i]); b.onclick = () => { sel = sel.includes(i) ? sel.filter(x => x !== i) : [...sel, i]; b.classList.toggle('on'); }; P2.appendChild(b); }); }; drawDays();
  if (!E) { const PR = el('div', 'pills'); PR.style.marginBottom = '10px';
    [['학교', '08:30', '16:30', [1, 2, 3, 4, 5]], ['학원', '18:00', '20:00', [1, 3, 5]], ['학원', '18:00', '20:00', [2, 4]], ['과외', '20:00', '22:00', []], ['독서실', '19:00', '22:00', []]].forEach(([n, a1, b1, ds]) => { const b = el('button', null, `${n}${ds.length ? ' ' + daysTxt(ds) : ''}`); b.onclick = () => { t.value = n; s1.value = a1; e1.value = b1; sel = ds.slice(); drawDays(); t.focus(); }; PR.appendChild(b); });
    c.append(el('div', 'hint', '빠르게 고르기 (고른 뒤 이름·시간을 고쳐도 돼요)'), PR); }
  const tm = row(s1, el('span', 'hint', '~'), e1); tm.style.alignItems = 'center';
  const go = () => { const v = t.value.trim(); if (!v || !s1.value || !e1.value) { toast('이름과 시간을 넣어 주세요.'); return null; } if (e1.value <= s1.value) { toast('끝나는 시간이 더 늦어야 해요.'); return null; } return v; };
  if (E) c.append(row(t), P2, tm, row(btn('지우기', 'ghost', () => { delRep(E); ttEd = null; pushSync(true); refreshSheet(); renderHome(); toast('지웠어요.'); }), btn('취소', 'ghost', () => { ttEd = null; refreshSheet(); }), btn('바꾸기', 'teal wide', () => { const v = go(); if (!v) return; delRep(E); const r = addRep(v, s1.value, sel); r.end = e1.value; ttEd = null; save(); pushSync(true); refreshSheet(); renderHome(); toast(`${daysTxt(sel)} ${s1.value}~${e1.value} '${v}'로 바꿨어요.`); })));
  else c.append(row(t), P2, tm, row(btn('넣기', 'wide', () => { const v = go(); if (!v) return; ttAdd = false; const r = addRep(v, s1.value, sel); r.end = e1.value; save(); pushSync(true); refreshSheet(); renderHome(); toast(`${daysTxt(sel)} ${s1.value}~${e1.value} '${v}' 넣었어요.`); })));
  c.appendChild(el('div', 'hint', E ? '요일·시간을 바꾸고 "바꾸기"를 눌러요.' : '요일을 안 고르면 매일이에요. 시간표 칸을 누르면 고치거나 지울 수 있어요.'));
  B.appendChild(c);
};

// ---------- 레나가 오늘 시간표 짜기 ----------
function busyToday() {
  const d = new Date(), L = [];
  S.items.forEach(t => { if (t.done || !t.due || !onDate(t, d) || t.rid) return; const s = toM(t.due.slice(11, 16)); L.push([s, s + durOf(t), t.text]); });
  (S.reps || []).forEach(r => { if (r.days.length && !r.days.includes(d.getDay())) return; if ((S.repSkip || {})[r.id + '_' + dk(d)]) return; L.push([toM(r.time), toM(repEnd(r)), r.text]); }); // v78: 고정 일정은 전단지가 아니라 시간표에서 읽음
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
  if (S.key || S.ckey) { try {
    const sys = `너는 비서 "레나"(능글맞은 누나 반말(존댓말 금지)). 오늘(${today()}) 할 일들의 순서와 걸리는 시간(분)을 정해. 이미 잡힌 일정: ${JSON.stringify(busyToday().map(([s, e, x]) => `${toT(s)}~${toT(e)} ${x}`))}. 지금 ${hm(new Date())}. 급하거나 짧은 걸 앞에, 머리 쓰는 일은 오전·이른 오후에.
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
  const greet = h < 11 ? `좋은 아침이에요, ${S.name || ''}.` : h < 17 ? `${S.name || ''}, 오늘 반 지났어요.` : `${S.name || ''}, 오늘 남은 거 볼까요?`;
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
