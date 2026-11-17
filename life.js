/* v149 새 구성 — 아래 탭(오늘·할 일·레나·놀기·다이얼) + 할 일 자리 잡기 + 시험 체크리스트 + 놀기(게임 일퀘·유튜브 구독)
   할 일(todo)은 `t.plan`(시작 'YYYY-MM-DDTHH:MM')·`t.mins`(걸리는 분)·`t.play`(놀기)로 시간표 빈 곳에 들어간다.
   빈 시간 = 일어난 시각 ~ 잘 시각(기본 01:30) − 고정 일정(S.reps)·일정 − 학원 30분 전(이동) − 학원 끝나고 90분(밥·씻기) − 이미 잡힌 할 일. */
(function () {
  'use strict';
  if (typeof SH === 'undefined') return;
  const L = () => { const o = S.life = S.life || {}; o.end = o.end || '01:30'; o.wake = o.wake || { d: '07:00', 6: '11:00', 0: '09:00' }; if (o.rest == null) o.rest = 90; if (o.pre == null) o.pre = 30; o.games = o.games || []; return o; };
  L(); S.exams2 = S.exams2 || [];
  const toM = t => { const m = /^(\d{1,2}):(\d\d)/.exec(t || ''); return m ? +m[1] * 60 + +m[2] : null; };
  const hmM = m => `${pad(Math.floor(((m % 1440) + 1440) % 1440 / 60))}:${pad(((m % 60) + 60) % 60)}`;
  const day0 = d => new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const addD = (d, n) => { const x = day0(d); x.setDate(x.getDate() + n); return x; };
  const lday = ms => { const d = new Date(ms); if (d.getHours() < 5) d.setDate(d.getDate() - 1); return day0(d); }; // 새벽 5시 전은 전날
  const relM = (d, iso) => Math.round((new Date(iso).getTime() - d.getTime()) / 60e3);
  const ACAD = /학원|클리닉|과외/, SUBJ = /^(국어|영어|수학|과학|사회|한국사|역사|물리|화학|생명|지구|윤리|탐구)$/;
  const isAcad = x => ACAD.test(x) || SUBJ.test(String(x).trim());
  const mins = t => t.mins || 40;
  const isTodo = t => !t.rid && !isEv(t);
  const DEND = () => { const e = toM(L().end); return e < 12 * 60 ? e + 1440 : e; };
  const wakeOf = d => toM(L().wake[d.getDay()] || L().wake.d) || 420;
  const WDN = '일월화수목금토';
  const dLabel = d => { const n = Math.round((d - day0(new Date())) / 864e5); return n === 0 ? '오늘' : n === 1 ? '내일' : n === 2 ? '모레' : `${d.getMonth() + 1}/${d.getDate()} ${WDN[d.getDay()]}`; };
  const whenTxt = iso => { const ms = new Date(iso).getTime(), d = lday(ms), n = Math.round((d - lday(Date.now())) / 864e5); return `${n === 0 ? '오늘' : n === 1 ? '내일' : WDN[d.getDay()] + '요일'} ${hmM(new Date(ms).getHours() * 60 + new Date(ms).getMinutes())}`; };

  // ---------- 하루의 고정 칸 ----------
  function fixed(d) {
    const k = dk(d), wd = d.getDay(), list = [], extra = [];
    (S.reps || []).forEach(r => { if (r.days && r.days.length && !r.days.includes(wd)) return; if ((S.repSkip || {})[r.id + '_' + k]) return; const s = toM(r.time); if (s == null) return; let e = toM(r.end); if (e == null) e = s + 60; if (e <= s) e += 1440; list.push({ s, e, txt: r.text, kind: 'fix', acad: isAcad(r.text) }); });
    S.items.forEach(t => { if (t.rid || !isEv(t) || !t.due || t.due.slice(0, 10) !== k) return; const s = toM(t.due.slice(11, 16)); list.push({ s, e: s + (t.mins || 60), txt: t.text, kind: 'ev', it: t, acad: isAcad(t.text) }); });
    list.sort((a, b) => a.s - b.s);
    list.filter(x => x.acad).forEach(a => { extra.push({ s: a.s - L().pre, e: a.s, kind: 'move' }); extra.push({ s: a.e, e: a.e + L().rest, kind: 'rest', txt: '밥 먹고 씻기' }); });
    return { list, extra };
  }
  const plannedOn = d => S.items.filter(t => t.plan && isTodo(t) && lday(new Date(t.plan).getTime()).getTime() === d.getTime());
  function free(d, skipId, endM) {
    const { list, extra } = fixed(d), busy = list.concat(extra).map(x => [x.s, x.e]);
    plannedOn(d).forEach(t => { if (t.id === skipId || t.done) return; const s = relM(d, t.plan); busy.push([s, s + mins(t)]); });
    busy.sort((a, b) => a[0] - b[0]);
    const out = []; let cur = wakeOf(d) + 60; /* 일어나서 1시간은 준비 */ const end = endM || DEND();
    busy.forEach(([a, b]) => { if (a > cur) out.push([cur, Math.min(a, end)]); cur = Math.max(cur, b); });
    if (cur < end) out.push([cur, end]);
    return out.filter(([a, b]) => b - a >= 10);
  }
  // 걸리는 시간이 들어가는 가장 빠른 자리(ms). 마감이 있으면 그 전에 끝나야 함
  function findSlot(m, dueMs, skipId, late, fromMs) {
    const start = Math.max(Date.now() + 5 * 60e3, fromMs || 0), endM = late ? DEND() + 120 : DEND();
    for (let i = 0; i < 21; i++) { const d = addD(lday(Date.now()), i);
      for (const [a, b] of free(d, skipId, endM)) { const s = Math.max(a, Math.ceil((start - d.getTime()) / 60e3 / 5) * 5); if (s + m > b) continue;
        const ms = d.getTime() + s * 60e3; if (dueMs && ms + m * 60e3 > dueMs) return null; return ms; } }
    return null;
  }
  const dueMs = t => { if (!t.due) return 0; const ms = new Date(t.due.length > 10 ? t.due : t.due + 'T23:59').getTime(); return ms > Date.now() ? ms : 0; };
  function placeOne(t, late) { const ms = findSlot(mins(t), dueMs(t), t.id, late); if (ms == null) return false; t.plan = localISO(new Date(ms)); delete t.noPlan; return true; }
  const missedL = () => S.items.filter(t => isTodo(t) && !t.done && t.plan && new Date(t.plan).getTime() + mins(t) * 60e3 < Date.now());
  function autoPlace(force) {
    let n = 0; const list = S.items.filter(t => isTodo(t) && !t.done && !t.plan && (force || !t.noPlan)).sort((a, b) => (dueMs(a) || 9e15) - (dueMs(b) || 9e15));
    list.forEach(t => { if (placeOne(t)) n++; });
    if (n) save(); return n;
  }
  function replanMissed() { const L2 = missedL(); L2.forEach(t => { t.plan = ''; }); L2.forEach(t => placeOne(t)); save(); return L2; }

  // ---------- 빠르게 넣기: 글 하나로 (마감·시간·걸리는 분·놀기 알아서) ----------
  function parse(txt) {
    let t = ' ' + txt + ' ', m = 0, due = '', at = null, play = false;
    t = t.replace(/(\d+(?:\.\d+)?)\s*시간\s*(반)?/, (x, h, b) => { m = Math.round(+h * 60) + (b ? 30 : 0); return ' '; });
    const tm = /(오전|오후|아침|저녁|밤|새벽)?\s*(\d{1,2})\s*(?:시\s*(?:(\d{1,2})\s*분|(반))?|:(\d\d))/.exec(t);
    let hh = null, mm = 0, ap = '';
    if (tm) { ap = tm[1] || ''; hh = +tm[2]; mm = tm[3] ? +tm[3] : tm[4] ? 30 : tm[5] ? +tm[5] : 0; t = t.replace(tm[0], ' '); }
    t = t.replace(/(\d+)\s*분/, (x, v) => { m += +v; return ' '; });
    const dm = /((?:이번\s?주|다음\s?주|담주|다다음\s?주)?\s*[월화수목금토일]요일|오늘|내일|모레|글피|이번\s?주|(\d{1,2})\/(\d{1,2}))\s*(까지)?/.exec(t);
    let date = null, isDue = /까지/.test(t);
    if (dm) { const w = dm[1].replace(/\s/g, ''); if (/^이번주$/.test(w)) { const d = day0(new Date()); d.setDate(d.getDate() + ((7 - d.getDay()) % 7)); date = dk(d); } else if (dm[2]) { const y = new Date().getFullYear(), d = new Date(y, +dm[2] - 1, +dm[3]); if (d < day0(new Date())) d.setFullYear(y + 1); date = dk(d); } else date = wantDate(dm[1]); t = t.replace(dm[0], ' '); }
    t = t.replace(/까지/g, ' ');
    if (/게임|유튜브|영상\s?보|놀기|넷플|롤\b|웹툰/.test(txt)) play = true;
    const H = h => { if (/오전|아침|새벽/.test(ap)) return h % 12; if (/오후|저녁|밤/.test(ap)) return h < 12 ? h + 12 : h; return h >= 1 && h <= 5 ? h : h < 12 ? h + 12 : h; };
    if (hh != null) { const h = H(hh); if (isDue) due = `${date || dk(new Date())}T${pad(h)}:${pad(mm)}`; else { let d = date ? new Date(date + 'T00:00') : day0(new Date()); let ms = d.getTime() + (h * 60 + mm) * 60e3; if (h < 5) ms += 864e5; if (!date && ms < Date.now()) ms += 864e5; at = ms; } }
    else if (date) due = isDue || !at ? date + 'T23:59' : '';
    return { text: t.replace(/\s+/g, ' ').trim() || txt.trim(), mins: m || 0, due, at, play };
  }
  function quickAdd(txt, opt) {
    const p = parse(txt); if (!p.text) return null; opt = opt || {};
    const t = addItem(p.text, p.due || opt.due || '', 'todo'); t.mins = p.mins || opt.mins || (p.play ? 60 : 40); if (p.play || opt.play) t.play = true;
    if (p.at || opt.at) t.plan = localISO(new Date(p.at || opt.at)); else if (!placeOne(t)) { t.noPlan = 1; }
    save(); return t;
  }

  // ---------- 화면 ----------
  const IC = {
    today: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="17" rx="3"/><path d="M3 9h18M8 2v4M16 2v4"/></svg>',
    tasks: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M9 6h11M9 12h11M9 18h11M4 6l1 1 2-2M4 12l1 1 2-2M4 18l1 1 2-2"/></svg>',
    lena: '<svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.2" stroke-linejoin="round"><path d="M5 4h4l2 5-2.5 1.5a11 11 0 005 5L15 13l5 2v4a2 2 0 01-2 2A16 16 0 013 6a2 2 0 012-2z"/></svg>',
    play: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="2" y="7" width="20" height="11" rx="5"/><path d="M7 11v3M5.5 12.5h3M16 12h.01M18 14h.01"/></svg>',
    dial: '<svg viewBox="0 0 24 24" fill="currentColor"><circle cx="6" cy="6" r="1.8"/><circle cx="12" cy="6" r="1.8"/><circle cx="18" cy="6" r="1.8"/><circle cx="6" cy="12" r="1.8"/><circle cx="12" cy="12" r="1.8"/><circle cx="18" cy="12" r="1.8"/><circle cx="6" cy="18" r="1.8"/><circle cx="12" cy="18" r="1.8"/><circle cx="18" cy="18" r="1.8"/></svg>',
    plus: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>',
    check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><path d="M5 12l5 5 9-10"/></svg>',
    game: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="2" y="7" width="20" height="11" rx="5"/><path d="M7 11v3M5.5 12.5h3M16 12h.01M18 14h.01"/></svg>',
    yt: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><rect x="2" y="5" width="20" height="14" rx="4"/><path d="M10 9.5v5l4.5-2.5z"/></svg>'
  };
  const css = document.createElement('style');
  css.textContent = `
.lf{position:absolute;left:0;right:0;top:0;bottom:calc(62px + var(--sb));z-index:25;background:#0f1719;color:#eef4f1;display:none}
.app.lv .lf{display:block}
.app.lt #callv,.app.lt #home{bottom:calc(62px + var(--sb))}
.lf-pane{position:absolute;inset:0;overflow-y:auto;-webkit-overflow-scrolling:touch;padding:calc(var(--st) + 16px) 16px 110px;display:none}
.lf-pane.on{display:block}
.lf h1{margin:0;font:400 28px/1.15 'Black Han Sans',sans-serif}
.lf-hd{display:flex;align-items:flex-end;justify-content:space-between;gap:10px}
.lf-hd .tm{font:700 14px 'Space Mono',monospace;color:#9ff5e4}
.lf-say{display:flex;gap:10px;align-items:flex-start;margin-top:14px}
.lf-say img{width:42px;height:42px;border-radius:50%;object-fit:cover;border:2px solid #2fe0c8;flex-shrink:0}
.lf-say p{margin:0;background:#f3efe6;color:#1a1a1a;border-radius:4px 14px 14px 14px;padding:10px 12px;font-size:14px;line-height:1.5}
.lf-st{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px;margin-top:14px}
.lf-st div{border:1px solid rgba(255,255,255,.18);border-radius:10px;padding:8px 10px}
.lf-st small{display:block;font-size:11px;color:#9aa6a3}.lf-st b{font:400 21px 'Black Han Sans',sans-serif}
.lf-st .y{border-color:rgba(242,234,58,.45)}.lf-st .y b{color:#f2ea3a}.lf-st .m{border-color:rgba(159,245,228,.45)}.lf-st .m b{color:#9ff5e4}
.lf-miss{margin-top:12px;border:1.5px solid #ff3d9a;border-radius:12px;padding:10px 12px;display:flex;align-items:center;gap:10px}
.lf-miss div{flex:1;min-width:0}.lf-miss b{display:block;color:#ff3d9a;font-size:14px}.lf-miss small{display:block;color:#c9b6c0;font-size:12px;margin-top:2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.lf-miss button{height:44px;padding:0 14px;border-radius:10px;border:0;background:#ff3d9a;color:#fff;font-weight:700;font-size:14px;flex-shrink:0}
.lf-tl{display:flex;flex-direction:column;gap:6px;margin-top:16px}
.lf-r{display:flex;gap:10px;align-items:center;min-height:40px}
.lf-r .t{width:84px;flex-shrink:0;font:12px 'Space Mono',monospace;color:#c4cfcc}
.lf-r .b{flex:1;min-width:0;display:flex;align-items:center;gap:10px;border-radius:8px;padding:9px 10px;font-size:14px;font-weight:500;text-align:left;border:0;color:inherit;font-family:inherit;background:none}
.lf-r .b span{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.lf-r .b em{font-style:normal;font-size:11px;flex-shrink:0;opacity:.8}
.lf-r.fix,.lf-r.rest,.lf-r.end{opacity:.55}.lf-r.fix .b{border-left:2px solid #5d6b68;border-radius:0;padding:6px 10px;font-weight:400}
.lf-r.rest .b{border-left:2px dashed #5d6b68;border-radius:0;padding:6px 10px;font-weight:400}.lf-r.end .b{border-left:2px solid #5d6b68;border-radius:0;padding:6px 10px;font-weight:400}
.lf-r.ev .b{background:#ffd1e6;color:#1a1a1a}.lf-r.todo .b{background:#f2ea3a;color:#1a1a1a}.lf-r.play .b{background:#9ff5e4;color:#10302a}
.lf-r.done{opacity:.5}.lf-r.done .b span{text-decoration:line-through}.lf-r.late .b{box-shadow:inset 0 0 0 2px #ff3d9a}
.lf-r.gap .b{border:1px dashed rgba(159,245,228,.35);color:#9ff5e4;font-weight:400;font-size:13px}
.lf-ck{width:24px;height:24px;border-radius:50%;border:2px solid currentColor;background:transparent;padding:0;flex-shrink:0;display:grid;place-items:center;color:inherit}
.lf-ck svg{width:14px;height:14px}.lf-r.done .lf-ck{background:currentColor}.lf-r.done .lf-ck svg{stroke:#f2ea3a}
.lf-ico{width:20px;height:20px;flex-shrink:0}
.lf-now{display:flex;align-items:center;gap:8px}.lf-now b{width:84px;font:700 12px 'Space Mono',monospace;color:#ff3d9a}.lf-now i{flex:1;height:2px;background:#ff3d9a;border-radius:2px}
.lf h2{margin:22px 0 8px;font-size:15px;font-weight:700;color:#9ff5e4;display:flex;justify-content:space-between;align-items:baseline}
.lf h2 small{font-size:12px;color:#9aa6a3;font-weight:400}
.lf-day{font-size:12px;color:#9aa6a3;margin:8px 0 2px}
.lf-un{display:flex;gap:10px;align-items:center;border:1px dashed rgba(242,234,58,.6);border-radius:8px;padding:10px;font-size:14px;width:100%;background:none;color:inherit;text-align:left;font-family:inherit;margin-bottom:6px}
.lf-un span{flex:1}.lf-un em{font-style:normal;font-size:11px;color:#c9c27a}
.lf-big{width:100%;height:50px;border-radius:12px;border:0;background:#2fe0c8;color:#062420;font-size:15px;font-weight:700;margin-top:8px}
.lf-ghost{width:100%;min-height:46px;border-radius:10px;border:1px solid rgba(159,245,228,.5);background:transparent;color:#9ff5e4;font-size:14px;margin-top:8px}
.lf-fab{position:absolute;right:16px;bottom:16px;z-index:3;height:54px;padding:0 20px;border-radius:27px;border:0;background:#2fe0c8;color:#062420;font-size:15px;font-weight:700;display:none;align-items:center;gap:6px;box-shadow:0 6px 20px rgba(0,0,0,.45)}
.lf-fab svg{width:18px;height:18px}.lf.fab .lf-fab{display:flex}
.lf-qa{position:absolute;left:0;right:0;bottom:0;z-index:4;background:#162124;border-top:1px solid rgba(47,224,200,.4);padding:12px 12px 10px;display:none;box-shadow:0 -10px 30px rgba(0,0,0,.5)}
.lf.qa .lf-qa{display:block}.lf.qa .lf-fab{display:none}
.lf-qa .r1{display:flex;gap:8px}.lf-qa input{flex:1;min-width:0;height:48px;border-radius:10px;border:1px solid rgba(255,255,255,.22);background:#0f1719;color:#eef4f1;font-size:16px;padding:0 12px;font-family:inherit}
.lf-qa .go{height:48px;padding:0 16px;border-radius:10px;border:0;background:#2fe0c8;color:#062420;font-weight:700;font-size:15px}
.lf-qa .x{width:44px;height:48px;border:0;background:none;color:#9aa6a3;font-size:22px}
.lf-qa .r2{display:flex;gap:6px;margin-top:8px;overflow-x:auto;scrollbar-width:none}.lf-qa .r2::-webkit-scrollbar{display:none}
.lf-qa .r2 button{flex-shrink:0;height:36px;padding:0 12px;border-radius:18px;border:1px solid rgba(255,255,255,.22);background:transparent;color:#c4cfcc;font-size:13px}
.lf-qa .r2 button.on{background:#f2ea3a;color:#1a1a1a;border-color:#f2ea3a}.lf-qa .r2 button.pl.on{background:#9ff5e4;border-color:#9ff5e4;color:#10302a}
.lf-qa .hint{font-size:12px;color:#7f8f8b;margin-top:6px}
.lf-tab{position:absolute;left:0;right:0;bottom:0;height:calc(62px + var(--sb));padding-bottom:var(--sb);z-index:26;background:#0b1113;border-top:1px solid rgba(255,255,255,.1);display:grid;grid-template-columns:repeat(5,minmax(0,1fr));box-sizing:border-box}
.lf-tab button{background:none;border:0;color:#9aa6a3;font-size:11px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:3px;font-family:inherit;position:relative}
.lf-tab button.on{color:#2fe0c8}.lf-tab svg{width:22px;height:22px}
.lf-tab .lena i{width:50px;height:50px;margin-top:-24px;border-radius:50%;background:#ff3d9a;display:grid;place-items:center;box-shadow:0 0 0 4px #0b1113}.lf-tab .lena{color:#ff3d9a}.lf-tab .lena.on i{box-shadow:0 0 0 4px #0b1113,0 0 0 6px #ff3d9a}
.lf-tab em{position:absolute;top:6px;left:calc(50% + 6px);min-width:16px;height:16px;border-radius:8px;background:#ff3d9a;color:#fff;font:700 10px/16px 'Space Mono',monospace;font-style:normal;padding:0 4px}
.lf-ex{display:block;width:100%;text-align:left;border:1px solid rgba(255,255,255,.18);border-radius:12px;padding:12px;background:#162124;color:inherit;font-family:inherit;margin-bottom:8px}
.lf-ex .h{display:flex;justify-content:space-between;align-items:baseline}.lf-ex b{font-size:15px}.lf-ex .d{font:400 18px 'Black Han Sans',sans-serif;color:#ff3d9a}
.lf-bar{height:8px;border-radius:4px;background:#26383c;overflow:hidden;margin-top:8px}.lf-bar i{display:block;height:100%;background:#2fe0c8;border-radius:4px}
.lf-ex .s{display:flex;flex-wrap:wrap;gap:6px 12px;margin-top:8px;font-size:12px;color:#c4cfcc}
.lf-card{background:#162124;border-radius:12px;padding:6px 12px;margin-bottom:8px}
.lf-card .gh{display:flex;align-items:center;gap:8px;min-height:44px}.lf-card .gh b{flex:1;font-size:15px}.lf-card .gh small{font-size:12px;color:#9aa6a3}
.lf-q{display:flex;align-items:center;gap:10px;min-height:44px;border-top:1px solid rgba(255,255,255,.07);width:100%;background:none;border-left:0;border-right:0;border-bottom:0;color:inherit;font-family:inherit;font-size:14px;text-align:left;padding:0}
.lf-q i{width:22px;height:22px;border-radius:6px;border:2px solid #9ff5e4;display:grid;place-items:center;flex-shrink:0}.lf-q.on i{background:#9ff5e4}.lf-q.on i svg{stroke:#10302a}.lf-q i svg{width:14px;height:14px;stroke:transparent}
.lf-q.on span{color:#9aa6a3;text-decoration:line-through}
.lf-addq{display:flex;gap:6px;padding:6px 0 8px}.lf-addq input{flex:1;min-width:0;height:40px;border-radius:8px;border:1px solid rgba(255,255,255,.18);background:transparent;color:inherit;font-size:16px;padding:0 10px;font-family:inherit}
.lf-addq button{height:40px;padding:0 12px;border-radius:8px;border:0;background:#26383c;color:#9ff5e4;font-size:14px}
.lf-vid{display:flex;gap:12px;width:100%;background:#162124;border:0;border-radius:12px;padding:10px;margin-bottom:8px;color:inherit;text-align:left;font-family:inherit}
.lf-vid .th{width:112px;aspect-ratio:16/9;border-radius:6px;background:#26383c center/cover;flex-shrink:0;position:relative}
.lf-vid .th em{position:absolute;right:4px;bottom:4px;background:rgba(0,0,0,.8);color:#fff;font:700 10px 'Space Mono',monospace;font-style:normal;padding:1px 4px;border-radius:3px}
.lf-vid .tx{flex:1;min-width:0}.lf-vid .tx b{display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;font-size:14px;font-weight:500;line-height:1.35}
.lf-vid .tx small{display:block;font-size:12px;color:#9aa6a3;margin-top:4px}
.lf-muted{font-size:13px;color:#9aa6a3;line-height:1.6}
.lf-ytp{position:relative;width:100%;aspect-ratio:16/9;background:#000;border-radius:10px;overflow:hidden}.lf-ytp iframe{position:absolute;inset:0;width:100%;height:100%;border:0}
.lf-guide{font-size:14px;line-height:1.65}.lf-guide ol{padding-left:20px;margin:6px 0}.lf-guide li{margin-bottom:8px}.lf-guide code{word-break:break-all;background:rgba(255,255,255,.08);padding:1px 4px;border-radius:4px;font-size:12px}
.lf-ed .opt{display:flex;gap:6px;flex-wrap:wrap;margin:6px 0 4px}.lf-ed .opt button{min-height:40px;padding:0 12px;border-radius:8px;font-size:14px}

/* v150 앱 재료로: 비 오는 부스 유리 + 종이·테이프 + 다이얼 키 */
.lf{background:#07090b;overflow:hidden}
.lf:before{content:"";position:absolute;inset:-40px;background:url(assets/lena/poster.jpg) center top/cover;filter:blur(24px) brightness(.36) saturate(1.35);pointer-events:none}
.lf:after{content:"";position:absolute;inset:0;pointer-events:none;background:repeating-linear-gradient(103deg,transparent 0 26px,rgba(159,245,228,.05) 26px 27px,transparent 27px 70px),linear-gradient(180deg,rgba(255,255,255,.06),transparent 90px),rgba(6,9,11,.42)}
.lf-pane{z-index:1}
.lf h1{display:inline;padding:0 4px;color:#fff;background:linear-gradient(transparent 60%,rgba(242,234,58,.55) 60% 94%,transparent 94%)}
.lf-hd .tm{color:#ff4d7d;font-size:15px}
.lf-say{display:block;position:relative;margin:20px 2px 4px;padding:30px 54px 14px 16px;background:url(assets/lena/paper_pink.webp) center/cover #ffd3e6;border:2px solid #000;border-radius:3px;box-shadow:5px 6px 0 rgba(0,0,0,.55);transform:rotate(-1.2deg)}
.lf-say:before{content:"☎ 레나한테서 온 메모";position:absolute;left:16px;top:9px;font:400 14px "Black Han Sans",sans-serif;color:#b0105a}
.lf-say:after{content:"";position:absolute;right:20px;top:-11px;width:66px;height:20px;background:url(assets/lena/tape_white.webp) center/100% 100%;transform:rotate(8deg)}
.lf-say img{position:absolute;right:10px;bottom:-16px;width:44px;height:44px;border:2px solid #000;background:#fff}
.lf-say p{margin:0;background:none;padding:0;border-radius:0;color:#2a0f1c;font-size:15.5px;font-weight:700;line-height:1.55}
.lf-st{gap:10px;margin-top:24px}
.lf-st div,.lf-st .y,.lf-st .m{position:relative;background:url(assets/lena/paper_white.webp) center/cover #f3efe6;border:2px solid #000;border-radius:2px;box-shadow:3px 4px 0 rgba(0,0,0,.5);color:#141414;padding:12px 10px 8px}
.lf-st div:nth-child(1){background:url(assets/lena/paper_yellow.webp) center/cover #f2ea3a;transform:rotate(-1.2deg)}
.lf-st div:nth-child(2){background:url(assets/lena/paper_teal.webp) center/cover #9ff5e4;transform:rotate(.9deg)}
.lf-st div:nth-child(3){transform:rotate(-.5deg)}
.lf-st div:before{content:"";position:absolute;top:-9px;left:50%;width:42px;height:16px;margin-left:-21px;background:url(assets/lena/tape_white.webp) 0 0/100% 100%;transform:rotate(-5deg)}
.lf-st small{color:#3b3b3b;font-weight:700}.lf-st b,.lf-st .y b,.lf-st .m b{color:#141414}
.lf-miss{margin-top:18px;background:url(assets/lena/paper_white.webp) center/cover #f3efe6;border:2px solid #000;border-radius:2px;box-shadow:4px 5px 0 rgba(0,0,0,.5);color:#141414;transform:rotate(.4deg)}
.lf-miss b{color:#d1003f;font-family:"Black Han Sans",sans-serif;font-weight:400;font-size:16px}.lf-miss small{color:#4a4a4a}
.lf-miss button{background:linear-gradient(#ff6fb3,#ff3d9a);border:3px solid #000;box-shadow:0 3px 0 #000;font-weight:800}
.lf-miss button:active,.lf-ghost:active,.lf-big:active,.lf-fab:active,.lf-qa .go:active{transform:translateY(3px);box-shadow:0 1px 0 #000}
.lf-paper{position:relative;margin:22px 2px 6px;padding:24px 12px 14px;background:linear-gradient(rgba(243,239,230,.62),rgba(243,239,230,.62)),#f3efe6 url(assets/lena/paper_white.webp) center/cover;color:#17181a;border:2px solid #000;border-radius:3px;box-shadow:4px 5px 0 rgba(0,0,0,.55);transform:rotate(-.4deg)}
.lf-paper .tp{position:absolute;top:-11px;left:22px;width:80px;height:22px;background:url(assets/lena/tape_teal1.webp) 0 0/100% 100%;transform:rotate(-5deg)}
.lf-paper .tp.r{left:auto;right:22px;background-image:url(assets/lena/tape_pink1.webp);transform:rotate(4deg)}
.lf-paper .lf-r .t{color:#3d3d3d}
.lf-paper .lf-r.fix,.lf-paper .lf-r.rest,.lf-paper .lf-r.end{opacity:1}
.lf-paper .lf-r.fix .b,.lf-paper .lf-r.end .b{border-left:3px solid #8a8a8a;color:#555}
.lf-paper .lf-r.rest .b{border-left:3px dashed #8a8a8a;color:#666}
.lf-r.todo .b{background:url(assets/lena/paper_yellow.webp) center/cover #f2ea3a;border:2px solid #000;box-shadow:2px 3px 0 rgba(0,0,0,.45);color:#141414}
.lf-r.play .b{background:url(assets/lena/paper_teal.webp) center/cover #9ff5e4;border:2px solid #000;box-shadow:2px 3px 0 rgba(0,0,0,.45);color:#0d2a25}
.lf-r.ev .b{background:url(assets/lena/paper_pink.webp) center/cover #ffd1e6;border:2px solid #000;box-shadow:2px 3px 0 rgba(0,0,0,.45);color:#2a0f1c}
.lf-r.late .b{box-shadow:2px 3px 0 rgba(0,0,0,.45),0 0 0 3px #ff2e6e}
.lf-r.late .b em{color:#d1003f;font-weight:800}
.lf-paper .lf-r.gap .b{border:1.5px dashed #1a8f7f;color:#0e6b5f;font-weight:700}
.lf-ck{border-color:#141414;color:#141414}.lf-r.done .lf-ck{background:#141414}.lf-r.done .lf-ck svg{stroke:#f2ea3a}
.lf-paper .lf-now b{color:#e0004f}.lf-paper .lf-now i{background:#e0004f}
.lf h2{color:#9ff5e4;font-size:14px;border-left:4px solid #ff3d9a;padding-left:8px}
.lf h2 small{color:#b9c4c1}
.lf-paper .lf-day{color:#4a4a4a;font:400 15px "Black Han Sans",sans-serif;margin:10px 0 4px}.lf-paper .lf-day:first-of-type{margin-top:0}
.lf-un{background:url(assets/lena/paper_yellow.webp) center/cover #f2ea3a;border:2px dashed #000;color:#141414;font-weight:600}.lf-un em{color:#5a5200}
.lf-un:nth-child(odd){transform:rotate(-.4deg)}
.lf-ghost{border-radius:14px;background:linear-gradient(#f2f3ee,#c9cdc4);border:3px solid #000;box-shadow:0 4px 0 #000;color:#111;font-weight:800;font-size:15px;min-height:50px;margin-top:12px}
.lf-big{border-radius:14px;background:linear-gradient(#ff6fb3,#ff3d9a);border:3px solid #000;box-shadow:0 4px 0 #000;color:#fff;font-weight:800;height:54px;margin-top:12px}
.lf-fab{border-radius:16px;background:linear-gradient(#ff6fb3,#ff3d9a);border:3px solid #000;box-shadow:0 4px 0 #000;color:#fff;font-weight:800}
.lf-fab svg{stroke:#fff}
.lf-ex{position:relative;background:url(assets/lena/paper_white.webp) center/cover #f3efe6;border:2px solid #000;border-radius:2px;box-shadow:4px 5px 0 rgba(0,0,0,.5);color:#141414;margin:16px 2px 10px;padding:16px 14px 12px;transform:rotate(-.6deg)}
.lf-ex:before{content:"";position:absolute;top:-10px;left:24px;width:70px;height:20px;background:url(assets/lena/tape_yellow.webp) 0 0/100% 100%;transform:rotate(-4deg)}
.lf-ex b{font:400 18px "Black Han Sans",sans-serif}
.lf-ex .d{display:inline-block;border:2.5px solid #d1003f;border-radius:4px;padding:0 6px;color:#d1003f;transform:rotate(-5deg)}
.lf-bar{background:rgba(0,0,0,.12);border:1.5px solid #000;height:10px}.lf-bar i{background:#16c4ad;border-radius:0}
.lf-ex .s{color:#333;font-weight:600}
.lf-card{position:relative;background:linear-gradient(rgba(243,239,230,.55),rgba(243,239,230,.55)),#f3efe6 url(assets/lena/paper_white.webp) center/cover;border:2px solid #000;border-radius:2px;box-shadow:4px 5px 0 rgba(0,0,0,.5);color:#141414;margin:18px 2px 12px;padding:10px 12px}
.lf-card:before{content:"";position:absolute;top:-10px;right:26px;width:66px;height:20px;background:url(assets/lena/tape_teal2.webp) 0 0/100% 100%;transform:rotate(5deg)}
.lf-card .gh b{font:400 18px "Black Han Sans",sans-serif}.lf-card .gh small{color:#555}
.lf-card .x{color:#555}
.lf-q{border-top:1px dashed rgba(0,0,0,.25)}.lf-q i{border-color:#141414}.lf-q.on i{background:#141414}.lf-q.on i svg{stroke:#9ff5e4}.lf-q.on span{color:#777}
.lf-card .lf-addq input{border:2px solid #000;background:rgba(255,255,255,.7);color:#141414}
.lf-card .lf-addq button{background:#141414;color:#9ff5e4;font-weight:700}
.lf-card .lf-ghost{margin-top:4px;margin-bottom:6px}
.lf-pane>.lf-addq input{background:rgba(0,0,0,.35)}
.lf-vid{background:url(assets/lena/paper_white.webp) center/cover #f3efe6;border:2px solid #000;border-radius:2px;box-shadow:3px 4px 0 rgba(0,0,0,.5);color:#141414;margin-bottom:12px}
.lf-vid:nth-child(even){transform:rotate(.4deg)}.lf-vid:nth-child(odd){transform:rotate(-.3deg)}
.lf-vid .th{border:2px solid #000;border-radius:2px}.lf-vid .tx small{color:#555}
.lf-muted{color:#c4cfcc}
.lf-qa{background:#14181a;border-top:2px solid #000;box-shadow:0 -2px 0 rgba(47,224,200,.45),0 -12px 30px rgba(0,0,0,.6)}
.lf-qa:before{content:"LENA-LINE · 할 일 넣기";display:block;background:#0d1f17;border:2px solid #000;border-radius:8px;padding:6px 10px;margin-bottom:8px;font:12px 'Space Mono',monospace;color:#7dffb5;text-shadow:0 0 6px rgba(125,255,181,.6)}
.lf-qa input{background:url(assets/lena/paper_white.webp) center/cover #f3efe6;color:#141414;border:2px solid #000}
.lf-qa .go{background:linear-gradient(#ff6fb3,#ff3d9a);color:#fff;border:3px solid #000;box-shadow:0 3px 0 #000;font-weight:800}
.lf-qa .r2 button{border:2px solid #000;background:linear-gradient(#f2f3ee,#c9cdc4);color:#111;font-weight:700}
.lf-qa .r2 button.on{background:url(assets/lena/paper_yellow.webp) center/cover #f2ea3a;border-color:#000}.lf-qa .r2 button.pl.on{background:url(assets/lena/paper_teal.webp) center/cover #9ff5e4;border-color:#000}
.lf-tab{background:#101315;border-top:2px solid #000;box-shadow:inset 0 2px 0 rgba(47,224,200,.28)}
.lf-tab button.on{color:#7dffb5;text-shadow:0 0 8px rgba(125,255,181,.6)}.lf-tab button.on svg{filter:drop-shadow(0 0 4px rgba(125,255,181,.6))}
.lf-tab .lena i{background:linear-gradient(#ff6fb3,#ff3d9a);border:3px solid #000;box-shadow:0 4px 0 #000,0 0 0 4px #101315}
.lf-tab .lena.on i{box-shadow:0 4px 0 #000,0 0 0 4px #101315,0 0 16px rgba(255,61,154,.7)}
.lf-tab em{border:1.5px solid #000}

/* v151 레나 대화 = 기본 화면, 깔끔하게 */
.app.lt.outside .agrid,.app.lt.outside .ainfo,.app.lt.outside #hangBtn{display:none!important}
.app.lt.outside .ahead{flex-direction:row;justify-content:flex-start;align-items:center;gap:12px;padding:calc(var(--st) + 10px) 16px 10px;border-bottom:2px solid #000;box-shadow:0 2px 0 rgba(47,224,200,.25);background:rgba(7,9,11,.55)}
.app.lt.outside .aava{width:46px;height:46px;box-shadow:2px 2px 0 var(--pink)}
.app.lt.outside .ahead .hd{align-items:flex-start;flex:1;min-width:0}
.app.lt.outside .ahead h1{font-size:24px}
.app.lt.outside .ahead .hd>p{margin-top:4px;padding:3px 8px;font-size:11px}
.lf-vbtn{flex:none;height:40px;padding:0 12px;border-radius:12px;background:linear-gradient(#ff6fb3,#ff3d9a);border:2px solid #000;box-shadow:0 3px 0 #000;color:#fff;font-weight:800;font-size:13px;display:flex;align-items:center;gap:6px}
.lf-vbtn svg{width:18px;height:18px;stroke:#fff;fill:none;stroke-width:2}
.app.lt.outside .log{flex:1}
#decorL{display:none!important}
/* 다이얼 = 할 일 프리셋 */
#keys .k.pre span{flex:none;display:block!important;height:auto!important;max-height:none!important;font-size:12px;line-height:1.2;max-width:100%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
#keys .k.pre small{display:block;font:10px 'Space Mono',monospace;opacity:.7;margin-top:1px}
#keys .k.pre.play{background:linear-gradient(#c8fff3,#8fe9d8)}
#keys .k.empty span{opacity:.55}
.lf-menu{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px}
.lf-menu button{min-height:72px;border-radius:14px;background:linear-gradient(#f2f3ee,#c9cdc4);border:3px solid #000;box-shadow:0 4px 0 #000;color:#111;font-weight:800;font-size:14px}
.lf-menu button:active{transform:translateY(3px);box-shadow:0 1px 0 #000}

/* v152 레나 화면 배치: 탭 바 위로 올림 + 할 일 띠 */
.app.lt .ctl{bottom:calc(62px + var(--sb) + 36px)}
.app.lt .sub{bottom:calc(62px + var(--sb) + 150px)}
.app.lt .ctl>div:has(#dialBtn){display:none!important}
.lf-strip{display:none;gap:8px;padding:10px 14px 4px;overflow-x:auto;scrollbar-width:none;flex:none}
.lf-strip::-webkit-scrollbar{display:none}
.app.lt.outside .lf-strip{display:flex}
.lf-strip button{flex:none;max-width:200px;display:flex;align-items:center;gap:6px;height:40px;padding:0 12px;border:2px solid #000;border-radius:4px;box-shadow:2px 3px 0 rgba(0,0,0,.55);background:url(assets/lena/paper_yellow.webp) center/cover #f2ea3a;color:#141414;font-size:13.5px;font-weight:700;white-space:nowrap}
.lf-strip button:nth-child(odd){transform:rotate(-1deg)}.lf-strip button:nth-child(even){transform:rotate(1deg)}
.lf-strip button.pl{background:url(assets/lena/paper_teal.webp) center/cover #9ff5e4}
.lf-strip button.ev{background:url(assets/lena/paper_pink.webp) center/cover #ffd1e6}
.lf-strip button.late{box-shadow:2px 3px 0 rgba(0,0,0,.55),0 0 0 2px #ff2e6e}
.lf-strip button.more{background:linear-gradient(#f2f3ee,#c9cdc4)}
.lf-strip b{font:700 12px 'Space Mono',monospace}
.lf-strip span{overflow:hidden;text-overflow:ellipsis}
`;
  document.head.appendChild(css);

  const root = el('div', 'lf'); root.id = 'life';
  const panes = {}; ['today', 'tasks', 'play'].forEach(k => { panes[k] = el('div', 'lf-pane'); root.appendChild(panes[k]); });
  const fab = el('button', 'lf-fab'); fab.innerHTML = IC.plus; fab.appendChild(document.createTextNode('할 일 넣기')); root.appendChild(fab);
  const qa = el('div', 'lf-qa'); root.appendChild(qa);
  const tab = el('nav', 'lf-tab'); tab.setAttribute('aria-label', '메뉴');
  const TABS = [['today', '오늘'], ['tasks', '할 일'], ['lena', '레나'], ['play', '놀기'], ['dial', '다이얼']];
  const tb = {}; TABS.forEach(([k, l]) => { const b = el('button', k === 'lena' ? 'lena' : ''); b.innerHTML = k === 'lena' ? `<i>${IC.lena}</i>` : IC[k]; b.appendChild(document.createTextNode(l)); b.onclick = () => go(k); tb[k] = b; tab.appendChild(b); });
  app.append(root, tab); app.classList.add('lt');

  let cur = 'lena'; // v151: 열면 늘 레나 대화부터
  function go(k) {
    try { audio(); } catch (e) {}
    if (k === 'dial') { dtmf(0); openPad(); return; }
    cur = k; L().tab = k; save();
    Object.entries(tb).forEach(([x, b]) => b.classList.toggle('on', x === k));
    app.classList.toggle('lv', k !== 'lena');
    root.classList.remove('qa');
    if (k === 'lena') { if (!app.classList.contains('calling') && app.classList.contains('outside')) openCall(); render(); return; }
    Object.entries(panes).forEach(([x, p]) => p.classList.toggle('on', x === k));
    root.classList.toggle('fab', k === 'today' || k === 'tasks');
    render();
  }

  // ---------- 빠르게 넣기 바 ----------
  let qo = {};
  function qaOpen(o) {
    qo = o || {}; qa.innerHTML = '';
    const i = el('input'); i.placeholder = qo.at ? `${whenTxt(localISO(new Date(qo.at)))}에 할 거` : '예: 수학 숙제 목요일까지 50분'; i.enterKeyHint = 'done'; i.autocomplete = 'off';
    const goB = el('button', 'go', '넣기'), x = el('button', 'x', '×'); x.setAttribute('aria-label', '닫기');
    const r1 = el('div', 'r1'); r1.append(i, goB, x);
    const r2 = el('div', 'r2'), chip = (l, on, fn, cls) => { const b = el('button', (cls || '') + (on ? ' on' : ''), l); b.onclick = () => { fn(); qaOpen(Object.assign(qo, {})); qa.querySelector('input').value = i.value; qa.querySelector('input').focus(); }; r2.appendChild(b); };
    const dOpt = [['오늘까지', 0], ['내일까지', 1], ['이번 주까지', 'w']];
    dOpt.forEach(([l, v]) => chip(l, qo.dv === v, () => { qo.dv = qo.dv === v ? undefined : v; }));
    [30, 60, 90].forEach(m => chip(m + '분', qo.mins === m, () => { qo.mins = qo.mins === m ? undefined : m; }));
    chip('놀기', !!qo.play, () => { qo.play = !qo.play; }, 'pl');
    const send = () => { const v = i.value.trim(); if (!v) { root.classList.remove('qa'); return; }
      let due = ''; if (qo.dv != null) { const d = day0(new Date()); if (qo.dv === 'w') d.setDate(d.getDate() + ((7 - d.getDay()) % 7)); else d.setDate(d.getDate() + qo.dv); due = dk(d) + 'T23:59'; }
      const t = quickAdd(v, { due, mins: qo.mins, play: qo.play, at: qo.at }); if (!t) return;
      i.value = ''; qo.at = 0; i.placeholder = '하나 더? 다 넣었으면 ×';
      toast(t.plan ? `${whenTxt(t.plan)}에 넣었어 · ${mins(t)}분` : '빈 자리가 없어서 시간은 아직이야. 할 일 탭에서 골라.', () => { S.items = S.items.filter(x2 => x2 !== t); save(); render(); });
      render(); i.focus(); };
    goB.onclick = send; i.onkeydown = e => { if (e.key === 'Enter') { e.preventDefault(); send(); } }; x.onclick = () => { root.classList.remove('qa'); i.blur(); };
    qa.append(r1, r2, el('div', 'hint', '마감·시간·걸리는 분은 글로 써도 알아들어. 시간 적으면(예: 8시) 그 시간에 넣어.'));
    root.classList.add('qa'); setTimeout(() => i.focus(), 30);
  }
  fab.onclick = () => qaOpen();

  // ---------- 오늘 ----------
  const sayEl = txt => { const w = el('div', 'lf-say'), im = el('img'); im.src = app.classList.contains('outside') ? 'assets/lena/cat.jpg' : 'assets/lena/face.jpg'; im.alt = '레나'; w.append(im, el('p', null, txt)); return w; };
  function rowsOf(d, withGaps) {
    const { list, extra } = fixed(d), rows = [];
    list.forEach(x => rows.push({ s: x.s, e: x.e, kind: x.kind, txt: x.txt, it: x.it }));
    extra.filter(x => x.kind === 'rest').forEach(x => rows.push({ s: x.s, e: x.e, kind: 'rest', txt: x.txt }));
    plannedOn(d).forEach(t => { const s = relM(d, t.plan); rows.push({ s, e: s + mins(t), kind: t.play ? 'play' : 'todo', txt: t.text, it: t }); });
    if (withGaps) { const nowM = (Date.now() - d.getTime()) / 60e3; free(d).forEach(([a, b]) => { a = Math.max(a, Math.ceil(nowM / 5) * 5); if (b - a >= 30) rows.push({ s: a, e: b, kind: 'gap', txt: `빈 시간 ${Math.round((b - a) / 6) / 10}시간` }); }); }
    return rows.sort((a, b) => a.s - b.s || (a.kind === 'fix' ? -1 : 1));
  }
  function rowEl(o, d) {
    const r = el('div', 'lf-r ' + o.kind), late = o.it && !o.it.done && isTodo(o.it) && o.it.plan && d.getTime() + o.e * 60e3 < Date.now();
    if (o.it && o.it.done) r.classList.add('done'); if (late) r.classList.add('late');
    r.appendChild(el('span', 't', o.kind === 'end' ? hmM(o.s) : `${hmM(o.s)}–${hmM(o.e)}`));
    const b = el(o.it || o.kind === 'gap' ? 'button' : 'div', 'b');
    if (o.kind === 'todo' || o.kind === 'play') {
      const ck = el('i', 'lf-ck'); ck.innerHTML = IC.check; ck.setAttribute('role', 'checkbox'); ck.setAttribute('aria-checked', o.it.done ? 'true' : 'false'); ck.setAttribute('aria-label', '끝냄');
      ck.onclick = e => { e.stopPropagation(); setDone(o.it, !o.it.done, ck); save(); render(); }; b.appendChild(ck);
    }
    b.appendChild(el('span', null, o.txt));
    if (o.it && o.kind === 'todo' && o.it.due && !isEv(o.it)) { const dd = new Date(o.it.due); b.appendChild(el('em', null, `${dLabel(day0(dd))}까지`)); }
    if (late) b.appendChild(el('em', null, '못 함'));
    if (o.it) b.onclick = () => edit(o.it);
    if (o.kind === 'gap') b.onclick = () => qaOpen({ at: d.getTime() + o.s * 60e3 });
    r.appendChild(b); return r;
  }
  function lineToday(d) {
    const now = Date.now(), ms = missedL(), td = plannedOn(d).filter(t => !t.done), curT = td.find(t => new Date(t.plan) <= now && now < new Date(t.plan).getTime() + mins(t) * 60e3), next = td.filter(t => new Date(t.plan) > now).sort((a, b) => a.plan.localeCompare(b.plan))[0];
    if (curT) return `지금 '${curT.text}' 할 시간이야. ${hmM(relM(d, curT.plan) + mins(curT))}까지만 집중해. 끝나면 동그라미 눌러.`;
    if (ms.length) return `못 한 거 ${ms.length}개 있네. 아래 '다시 잡기' 누르면 빈 자리로 옮겨 줄게.`;
    if (next) { const m = Math.round((new Date(next.plan) - now) / 60e3); return m < 90 ? `다음은 ${hmM(relM(d, next.plan))} '${next.text}'. ${m}분 남았어.` : `오늘 남은 건 ${td.length}개. 첫 번째는 ${hmM(relM(d, next.plan))} '${next.text}'.`; }
    if (plannedOn(d).length) return '오늘 잡은 거 다 했네. 이제 놀아도 돼. …칭찬은 나중에.';
    return '오늘은 비어 있어. 할 일 생기면 아래 + 눌러서 던져. 자리는 내가 잡을게.';
  }
  function renderToday() {
    const P = panes.today, d = lday(Date.now()), now = new Date(); P.innerHTML = '';
    const hd = el('div', 'lf-hd'); hd.append(el('h1', null, `${d.getMonth() + 1}월 ${d.getDate()}일 ${WDN[d.getDay()]}요일`), el('span', 'tm', hm(now))); P.appendChild(hd);
    P.appendChild(sayEl(lineToday(d)));
    const td = plannedOn(d), left = td.filter(t => !t.done && !t.play).length, playM = td.filter(t => t.play).reduce((a, t) => a + mins(t), 0);
    const st = el('div', 'lf-st'); [['y', '남은 할 일', left + '개'], ['m', '놀기', playM ? (playM >= 60 ? Math.round(playM / 6) / 10 + '시간' : playM + '분') : '0분'], ['', '잘 시간', L().end]].forEach(([c, a, b]) => { const x = el('div', c); x.append(el('small', null, a), el('b', null, b)); st.appendChild(x); }); P.appendChild(st);
    const ms = missedL(); if (ms.length) { const m = el('div', 'lf-miss'), tx = el('div'); tx.append(el('b', null, `못 한 거 ${ms.length}개`), el('small', null, ms.map(t => t.text).join(', '))); const b = el('button', null, '다시 잡기'); b.onclick = () => { const r = replanMissed(); toast(r.map(t => `${t.text} → ${t.plan ? whenTxt(t.plan) : '자리 없음'}`).join(' / ')); render(); }; m.append(tx, b); P.appendChild(m); }
    const tl = el('div', 'lf-tl lf-paper'), nowM = (Date.now() - d.getTime()) / 60e3; let nowPut = false; tl.append(el('i', 'tp'), el('i', 'tp r'));
    const rows = rowsOf(d, true); rows.push({ s: DEND(), e: DEND(), kind: 'end', txt: `잘 시간${S.morning ? ' · 알람 ' + S.morning : ''}` });
    rows.forEach(o => { if (!nowPut && o.s > nowM) { const n = el('div', 'lf-now'); n.append(el('b', null, '지금'), el('i')); tl.appendChild(n); nowPut = true; }
      if (o.kind === 'end') { const r = el('div', 'lf-r end'); r.append(el('span', 't', hmM(o.s)), el('div', 'b', o.txt)); tl.appendChild(r); } else tl.appendChild(rowEl(o, d)); });
    P.appendChild(tl);
    const un = S.items.filter(t => isTodo(t) && !t.done && !t.plan); if (un.length) { const b = el('button', 'lf-ghost', `시간 안 정한 할 일 ${un.length}개 — 할 일 탭에서`); b.onclick = () => go('tasks'); P.appendChild(b); }
  }

  // ---------- 할 일 ----------
  function renderTasks() {
    const P = panes.tasks; P.innerHTML = '';
    const open = S.items.filter(t => isTodo(t) && !t.done);
    const hd = el('div', 'lf-hd'); hd.append(el('h1', null, '할 일'), el('span', 'tm', `${open.length}개 남음`)); P.appendChild(hd);
    // 시험
    const exs = S.exams2.filter(e => !e.date || e.date >= dk(new Date())).sort((a, b) => (a.date || '9').localeCompare(b.date || '9'));
    const h2 = el('h2'); h2.append('시험 체크리스트', el('small', null, '')); P.appendChild(h2);
    exs.forEach(e => { const b = el('button', 'lf-ex'), h = el('div', 'h'), p = exProg(e); h.append(el('b', null, e.name), el('span', 'd', e.date ? ddayTxt(e.date) : '')); const bar = el('div', 'lf-bar'), i = el('i'); i.style.width = p.pct + '%'; bar.appendChild(i);
      const s = el('div', 's'); e.subs.forEach(x => { const q = subProg(x); s.appendChild(el('span', null, `${x.name} ${q.n ? Math.round(q.d / q.n * 100) + '%' : '—'}`)); });
      b.append(h, bar, s); b.onclick = () => { exOpen = e.id; openSheet('lexam'); }; P.appendChild(b); });
    const ab = el('button', 'lf-ghost', exs.length ? '+ 시험 넣기' : '+ 시험 넣기 (과목마다 체크리스트)'); ab.onclick = () => { exOpen = 'new'; openSheet('lexam'); }; P.appendChild(ab);
    // 못 한 것
    const ms = missedL(); if (ms.length) { const m = el('div', 'lf-miss'), tx = el('div'); tx.append(el('b', null, `못 한 거 ${ms.length}개`), el('small', null, ms.map(t => t.text).join(', '))); const b = el('button', null, '다시 잡기'); b.onclick = () => { replanMissed(); render(); }; m.append(tx, b); P.appendChild(m); }
    // 시간 정한 것
    const pl = open.filter(t => t.plan && !ms.includes(t)).sort((a, b) => a.plan.localeCompare(b.plan));
    const h3 = el('h2'); h3.append('시간 정한 것', el('small', null, pl.length + '개')); P.appendChild(h3);
    const pp = el('div', 'lf-tl lf-paper'); pp.append(el('i', 'tp'), el('i', 'tp r')); let lastD = ''; pl.forEach(t => { const d = lday(new Date(t.plan).getTime()), k = dk(d); if (k !== lastD) { pp.appendChild(el('div', 'lf-day', dLabel(d))); lastD = k; } const s = relM(d, t.plan); pp.appendChild(rowEl({ s, e: s + mins(t), kind: t.play ? 'play' : 'todo', txt: t.text, it: t }, d)); }); if (pl.length) P.appendChild(pp);
    if (!pl.length) P.appendChild(el('div', 'lf-muted', '아직 없어. 오른쪽 아래 + 로 넣어.'));
    // 안 정한 것
    const un = open.filter(t => !t.plan);
    if (un.length) { const h4 = el('h2'); h4.style.color = '#f2ea3a'; h4.append('시간 안 정한 것', el('small', null, un.length + '개')); P.appendChild(h4);
      un.forEach(t => { const b = el('button', 'lf-un'); b.append(el('span', null, t.text), el('em', null, t.due ? `${dLabel(day0(new Date(t.due)))}까지` : '마감 없음')); b.onclick = () => edit(t); P.appendChild(b); });
      const go2 = el('button', 'lf-big', `레나한테 시간 맡기기 (${un.length}개)`); go2.onclick = () => { const n = autoPlace(true); toast(n ? `${n}개 자리 잡았어.` : '01:30 전엔 빈 자리가 없어. 하나씩 눌러서 늦게라도 넣을 수 있어.'); render(); }; P.appendChild(go2); }
    const dn = S.items.filter(t => isTodo(t) && t.done && t.doneAt && dk(new Date(t.doneAt)) === dk(new Date())); if (dn.length) P.appendChild(el('div', 'lf-muted', `오늘 끝낸 것 ${dn.length}개: ${dn.map(t => t.text).join(', ')}`));
  }

  // ---------- 할 일 하나 고치기 ----------
  let edT = null;
  function edit(t) { edT = t; openSheet('ltask'); }
  SH.ltask = { t: '할 일', s: () => '', r: B => {
    const t = edT; if (!t || !S.items.includes(t)) { B.appendChild(empty('지워졌어.')); return; }
    const w = el('div', 'lf-ed');
    const ti = inp('text', '할 일', t.text); ti.onchange = () => { t.text = ti.value.trim().slice(0, 80) || t.text; save(); };
    w.append(lbl('뭘 해'), ti);
    w.appendChild(lbl('언제'));
    w.appendChild(el('div', 'hint', t.plan ? `${whenTxt(t.plan)} ~ ${mins(t)}분` : '아직 안 정함'));
    const opt = el('div', 'opt'); let from = Date.now();
    for (let i = 0; i < 4; i++) { const ms = findSlot(mins(t), dueMs(t), t.id, false, from); if (ms == null) break; from = ms + Math.max(mins(t), 60) * 60e3; if (t.plan && Math.abs(new Date(t.plan) - ms) < 60e3) continue; const iso = localISO(new Date(ms)); opt.appendChild(btn(whenTxt(iso), 'ghost', () => { t.plan = iso; delete t.noPlan; save(); refreshSheet(); render(); })); }
    const lateMs = findSlot(mins(t), dueMs(t), t.id, true); if (lateMs != null && !opt.children.length) opt.appendChild(btn(`${whenTxt(localISO(new Date(lateMs)))} (늦게)`, 'ghost', () => { t.plan = localISO(new Date(lateMs)); save(); refreshSheet(); render(); }));
    w.appendChild(opt);
    const dt = inp('datetime-local', '', t.plan || ''); dt.onchange = () => { if (dt.value) { t.plan = dt.value.slice(0, 16); delete t.noPlan; save(); render(); refreshSheet(); } };
    w.append(el('div', 'hint', '직접 고르기 (01:30 넘어도 돼)'), dt);
    w.appendChild(lbl('얼마나 걸려'));
    w.appendChild(row(btn('−10분', 'ghost', () => { t.mins = Math.max(10, mins(t) - 10); save(); refreshSheet(); render(); }), el('b', null, mins(t) + '분'), btn('+10분', 'ghost', () => { t.mins = mins(t) + 10; save(); refreshSheet(); render(); })));
    w.appendChild(lbl('마감'));
    const du = inp('datetime-local', '', t.due || ''); du.onchange = () => { t.due = du.value ? du.value.slice(0, 16) : ''; save(); render(); }; w.appendChild(du);
    w.appendChild(row(btn(t.play ? '놀기 ✓' : '놀기로 바꾸기', 'ghost', () => { t.play = !t.play; save(); refreshSheet(); render(); }), btn('시간 빼기', 'ghost', () => { t.plan = ''; t.noPlan = 1; save(); refreshSheet(); render(); })));
    w.appendChild(row(btn(t.done ? '안 끝낸 걸로' : '끝냄', 'teal wide', () => { setDone(t, !t.done); save(); closeSheet(); render(); })));
    w.appendChild(row(btn('지우기', 'ghost wide', () => { S.items = S.items.filter(x => x !== t); save(); closeSheet(); render(); toast(`'${t.text}' 지웠어.`, () => { S.items.push(t); save(); render(); }); })));
    B.appendChild(w);
  } };

  // ---------- 시험 체크리스트 ----------
  let exOpen = null;
  const subProg = x => ({ n: x.items.length, d: x.items.filter(i => i.done).length });
  const exProg = e => { let n = 0, d = 0; e.subs.forEach(x => { const q = subProg(x); n += q.n; d += q.d; }); return { n, d, pct: n ? Math.round(d / n * 100) : 0 }; };
  const ddayTxt = date => { const n = Math.round((new Date(date + 'T00:00') - day0(new Date())) / 864e5); return n > 0 ? `D-${n}` : n === 0 ? 'D-DAY' : '끝남'; };
  // 예전 공부 화면의 시험(이름·날짜·과목)을 한 번 옮김
  if (!L().exMig) { L().exMig = 1; try { (S.study && S.study.exams || []).forEach(e => { if (!e.date || S.exams2.some(x => x.name === e.name && x.date === e.date)) return; S.exams2.push({ id: uid('x'), name: e.name || '시험', date: e.date, subs: (e.subs || []).map(s => ({ id: uid('s'), name: s, items: [] })) }); }); } catch (e) {} save(); }
  let exNew = { name: '', date: '', subs: [] };
  SH.lexam = { t: '시험 체크리스트', s: () => '과목마다 할 것을 적고 하나씩 체크', r: B => {
    const list = S.exams2.slice().sort((a, b) => (a.date || '9').localeCompare(b.date || '9'));
    if (exOpen === 'new' || !list.length) {
      B.appendChild(lbl('새 시험'));
      const n = inp('text', '시험 이름 (예: 기말고사)', exNew.name); n.oninput = () => { exNew.name = n.value; };
      const d = inp('date', '', exNew.date); d.onchange = () => { exNew.date = d.value; };
      B.append(n, d, el('div', 'hint', '과목 고르기'));
      const ch = el('div', 'opt'); ['국어', '영어', '수학', '사회', '과학', '한국사'].forEach(s => { const on = exNew.subs.includes(s); ch.appendChild(btn(on ? '✓ ' + s : s, on ? 'teal' : 'ghost', () => { exNew.subs = on ? exNew.subs.filter(x => x !== s) : exNew.subs.concat(s); refreshSheet(); })); });
      const o = inp('text', '다른 과목 (쉼표로 여러 개)'); o.onchange = () => { o.value.split(/[,·\s]+/).filter(Boolean).forEach(s => { if (!exNew.subs.includes(s)) exNew.subs.push(s); }); refreshSheet(); };
      const w = el('div', 'lf-ed'); w.append(ch); B.append(w, o);
      B.appendChild(row(btn('시험 넣기', 'teal wide', () => { if (!exNew.name.trim() || !exNew.date) { toast('이름이랑 날짜 넣어 줘.'); return; } const e = { id: uid('x'), name: exNew.name.trim(), date: exNew.date, subs: exNew.subs.map(s => ({ id: uid('s'), name: s, items: [] })) }; S.exams2.push(e); exNew = { name: '', date: '', subs: [] }; exOpen = e.id; save(); refreshSheet(); render(); })));
      if (list.length) B.appendChild(row(btn('취소', 'ghost wide', () => { exOpen = list[0].id; refreshSheet(); })));
      return;
    }
    const e = list.find(x => x.id === exOpen) || list[0]; exOpen = e.id;
    if (list.length > 1) { const tabs = el('div', 'tabs'); list.forEach(x => { const b = el('button', x === e ? 'on' : '', x.name); b.onclick = () => { exOpen = x.id; refreshSheet(); }; tabs.appendChild(b); }); B.appendChild(tabs); }
    const p = exProg(e), hd = el('div', 'lf-ex'); const h = el('div', 'h'); h.append(el('b', null, `${e.name} · ${e.date.slice(5).replace('-', '/')}`), el('span', 'd', ddayTxt(e.date))); const bar = el('div', 'lf-bar'), bi = el('i'); bi.style.width = p.pct + '%'; bar.appendChild(bi); hd.append(h, bar, el('div', 's', `전체 ${p.d}/${p.n} · ${p.pct}%`)); B.appendChild(hd);
    e.subs.forEach(x => {
      const q = subProg(x), c = el('div', 'lf-card'), gh = el('div', 'gh'); gh.append(el('b', null, x.name), el('small', null, q.n ? `${q.d}/${q.n} · ${Math.round(q.d / q.n * 100)}%` : '할 것 적기'));
      gh.appendChild(xbtn(() => { if (x.items.length && !confirm(`${x.name} 과목을 지울까?`)) return; e.subs = e.subs.filter(y => y !== x); save(); refreshSheet(); render(); })); c.appendChild(gh);
      if (q.n) { const bar2 = el('div', 'lf-bar'), i2 = el('i'); i2.style.width = Math.round(q.d / q.n * 100) + '%'; bar2.style.margin = '0 0 6px'; bar2.appendChild(i2); c.appendChild(bar2); }
      x.items.forEach(it => { const b = el('button', 'lf-q' + (it.done ? ' on' : '')), ck = el('i'); ck.innerHTML = IC.check; b.append(ck, el('span', null, it.t)); b.setAttribute('aria-pressed', it.done ? 'true' : 'false');
        b.onclick = () => { it.done = !it.done; save(); refreshSheet(); render(); };
        let pt = 0; b.oncontextmenu = ev => { ev.preventDefault(); itemMenu(e, x, it); }; b.ontouchstart = () => { pt = setTimeout(() => itemMenu(e, x, it), 600); }; b.ontouchend = b.ontouchmove = () => clearTimeout(pt);
        c.appendChild(b); });
      const a = el('div', 'lf-addq'), ai = inp('text', '할 것 (줄바꿈·쉼표로 여러 개)'), ab = el('button', null, '넣기');
      const add = () => { ai.value.split(/\n|,/).map(s => s.trim()).filter(Boolean).forEach(s => x.items.push({ id: uid('i'), t: s.slice(0, 60), done: false })); ai.value = ''; save(); refreshSheet(); render(); };
      ab.onclick = add; ai.onkeydown = ev => { if (ev.key === 'Enter') { ev.preventDefault(); add(); } }; a.append(ai, ab); c.appendChild(a);
      B.appendChild(c); });
    const ns = inp('text', '과목 더하기'); ns.onchange = () => { const v = ns.value.trim(); if (v) { e.subs.push({ id: uid('s'), name: v, items: [] }); save(); refreshSheet(); } }; B.appendChild(ns);
    B.appendChild(el('div', 'hint', '체크 칸을 길게 누르면: 할 일로 시간 잡기 · 지우기'));
    B.appendChild(row(btn('+ 다른 시험', 'ghost', () => { exOpen = 'new'; refreshSheet(); }), btn('이 시험 지우기', 'ghost', () => { if (!confirm(`${e.name}을(를) 지울까?`)) return; S.exams2 = S.exams2.filter(y => y !== e); exOpen = null; save(); refreshSheet(); render(); })));
  } };
  function itemMenu(e, x, it) {
    const ok = confirm(`'${x.name} ${it.t}'\n\n확인 = 할 일로 시간 잡기\n취소 = 다음 질문(지우기)`);
    if (ok) { const due = new Date(e.date + 'T00:00'); due.setDate(due.getDate() - 1); const t = addItem(`${x.name} ${it.t}`, dk(due) + 'T23:59', 'todo'); t.mins = 60; t.ex = it.id; placeOne(t); save(); toast(t.plan ? `${whenTxt(t.plan)}에 잡았어.` : '빈 자리가 없어. 할 일 탭에서 골라.'); render(); return; }
    if (confirm(`'${it.t}' 지울까?`)) { x.items = x.items.filter(y => y !== it); save(); refreshSheet(); render(); }
  }
  // 시험에서 만든 할 일을 끝내면 체크리스트도 체크
  const _sd = setDone; setDone = function (t, v) { const r = _sd.apply(this, arguments); if (t && t.ex) S.exams2.forEach(e => e.subs.forEach(x => x.items.forEach(i => { if (i.id === t.ex) i.done = !!v; }))); return r; };
  // 다이얼 4 = 시험
  { const k4 = document.querySelector('#keys .k[data-k="4"] span'); if (k4) k4.textContent = '시험'; }
  const _os = openSheet; openSheet = function (n) { if (n === 6) n = 'lexam'; return _os.call(this, n); };
  if (typeof NUMOF !== 'undefined') { NUMOF.lexam = '4'; NUMOF.ltask = '✓'; NUMOF.lgame = '★'; NUMOF.lyt = '▶'; NUMOF.lplay = '▶'; }

  // ---------- 놀기: 게임 ----------
  const gday = g => { const r = toM(g.reset || '05:00') || 0, d = new Date(Date.now() - r * 60e3); return dk(d); };
  function renderPlay() {
    const P = panes.play; P.innerHTML = '';
    const d = lday(Date.now()), td = plannedOn(d).filter(t => t.play), pm = td.reduce((a, t) => a + mins(t), 0);
    const hd = el('div', 'lf-hd'); hd.append(el('h1', null, '놀기'), el('span', 'tm', `오늘 ${pm >= 60 ? Math.round(pm / 6) / 10 + '시간' : pm + '분'}`)); P.appendChild(hd);
    if (td.length) { const tl = el('div', 'lf-tl lf-paper'); tl.append(el('i', 'tp'), el('i', 'tp r')); td.forEach(t => { const s = relM(d, t.plan); tl.appendChild(rowEl({ s, e: s + mins(t), kind: 'play', txt: t.text, it: t }, d)); }); P.appendChild(tl); }
    else P.appendChild(sayEl('오늘 놀기 시간은 아직 안 잡았어. 할 일 넣는 칸에 "게임 1시간"처럼 쓰면 빈 자리에 넣어 줄게.'));
    const add = el('button', 'lf-ghost', '+ 놀기 시간 넣기'); add.onclick = () => { go('today'); qaOpen({ play: true, mins: 60 }); }; P.appendChild(add);
    // 게임
    const h2 = el('h2'); h2.append('게임 · 매일 할 것', el('small', null, '초기화 시간 지나면 다시 빈칸')); P.appendChild(h2);
    L().games.forEach(g => {
      const c = el('div', 'lf-card'), gh = el('div', 'gh'), k = gday(g); gh.append(el('b', null, g.name), el('small', null, `${g.reset || '05:00'} 초기화`));
      gh.appendChild(xbtn(() => { if (!confirm(`${g.name} 지울까?`)) return; L().games = L().games.filter(x => x !== g); save(); render(); })); c.appendChild(gh);
      g.q.forEach(q => { const on = q.d === k, b = el('button', 'lf-q' + (on ? ' on' : '')), ck = el('i'); ck.innerHTML = IC.check; b.append(ck, el('span', null, q.t)); b.setAttribute('aria-pressed', on ? 'true' : 'false');
        b.onclick = () => { q.d = on ? '' : k; save(); render(); }; let pt = 0; b.ontouchstart = () => { pt = setTimeout(() => { if (confirm(`'${q.t}' 지울까?`)) { g.q = g.q.filter(y => y !== q); save(); render(); } }, 600); }; b.ontouchend = b.ontouchmove = () => clearTimeout(pt); c.appendChild(b); });
      const a = el('div', 'lf-addq'), ai = inp('text', '매일 할 것 (쉼표로 여러 개)'), ab = el('button', null, '넣기');
      const addq = () => { ai.value.split(/\n|,/).map(s => s.trim()).filter(Boolean).forEach(s => g.q.push({ id: uid('q'), t: s.slice(0, 40), d: '' })); save(); render(); };
      ab.onclick = addq; ai.onkeydown = ev => { if (ev.key === 'Enter') { ev.preventDefault(); addq(); } }; a.append(ai, ab); c.appendChild(a);
      const ask = el('button', 'lf-ghost', `레나한테 ${g.name} 공략 물어보기`); ask.onclick = () => askLena(`${g.name} 공략 찾아봐 줘: `); c.appendChild(ask);
      P.appendChild(c); });
    const ga = el('div', 'lf-addq'), gn = inp('text', '게임 이름'), gr = inp('time', '', '05:00'), gb = el('button', null, '+ 게임'); gr.style.maxWidth = '126px'; gr.setAttribute('aria-label', '초기화 시간');
    gb.onclick = () => { const n = gn.value.trim(); if (!n) { gn.focus(); return; } L().games.push({ id: uid('g'), name: n.slice(0, 30), reset: gr.value || '05:00', q: [] }); save(); render(); };
    ga.append(gn, gr, gb); P.appendChild(ga);
    // 유튜브
    const h3 = el('h2'); h3.append('유튜브 · 구독 새 영상', el('small', null, '')); P.appendChild(h3);
    ytRender(P, h3.lastChild);
    const ar = el('button', 'lf-ghost', '레나 딜러 오락실'); ar.style.borderColor = 'rgba(255,61,154,.5)'; ar.style.color = '#ff3d9a'; ar.onclick = () => openSheet(8); P.appendChild(ar);
  }
  function askLena(txt) { go('lena'); setTimeout(() => { const m = $('msg'); if (m) { m.value = txt; m.focus(); try { syncSend(); } catch (e) {} } }, 200); }

  // ---------- 유튜브 (우편함 서버 v4가 구글 로그인을 맡음) ----------
  const BOX = () => (S.box || '').replace(/\/+$/, '');
  const YT = {
    async token() { const y = S.yt = S.yt || {}; if (y.tok && y.exp > Date.now() + 60e3) return y.tok;
      const r = await fetch(`${BOX()}/yt/token?t=${S.boxTok}`); const j = await r.json().catch(() => ({})); if (!j.access_token) { const e = new Error(j.error || 'token'); e.code = j.error; throw e; }
      y.tok = j.access_token; y.exp = Date.now() + (j.expires_in || 3600) * 1000; y.on = 1; save(); return y.tok; },
    async api(path, q) { const tok = await this.token(); const r = await fetch(`https://www.googleapis.com/youtube/v3/${path}?${new URLSearchParams(q)}`, { headers: { Authorization: 'Bearer ' + tok } }); if (r.status === 401) { S.yt.tok = ''; throw new Error('401'); } if (!r.ok) throw new Error('api ' + r.status); return r.json(); },
    async feed() {
      const ch = []; let pt = '';
      for (let i = 0; i < 6; i++) { const j = await this.api('subscriptions', { part: 'snippet', mine: 'true', maxResults: 50, ...(pt ? { pageToken: pt } : {}) }); (j.items || []).forEach(s => ch.push(s.snippet.resourceId.channelId)); pt = j.nextPageToken; if (!pt) break; }
      const vids = [], since = Date.now() - 7 * 864e5; let i = 0;
      const work = async () => { while (i < ch.length) { const c = ch[i++]; try { const j = await this.api('playlistItems', { part: 'snippet,contentDetails', playlistId: 'UU' + c.slice(2), maxResults: 4 }); (j.items || []).forEach(v => { const at = Date.parse(v.contentDetails.videoPublishedAt || v.snippet.publishedAt); if (at > since) vids.push({ id: v.contentDetails.videoId, t: v.snippet.title, ch: v.snippet.channelTitle, at, th: ((v.snippet.thumbnails || {}).medium || {}).url || '' }); }); } catch (e) {} } };
      await Promise.all([1, 2, 3, 4, 5, 6].map(work));
      vids.sort((a, b) => b.at - a.at); const top = vids.slice(0, 50);
      if (top.length) { const j = await this.api('videos', { part: 'contentDetails', id: top.map(v => v.id).join(',') }); (j.items || []).forEach(x => { const v = top.find(y => y.id === x.id); if (v) v.dur = isoDur(x.contentDetails.duration); }); }
      S.ytFeed = { at: Date.now(), list: top }; save(); return top;
    }
  };
  const isoDur = s => { const m = /P(?:(\d+)D)?T?(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/.exec(s || '') || []; return (+m[1] || 0) * 86400 + (+m[2] || 0) * 3600 + (+m[3] || 0) * 60 + (+m[4] || 0); };
  const durTxt = s => { if (!s) return ''; const h = Math.floor(s / 3600), m = Math.floor(s % 3600 / 60), x = s % 60; return h ? `${h}:${pad(m)}:${pad(x)}` : `${m}:${pad(x)}`; };
  const agoTxt = ms => { const h = Math.round((Date.now() - ms) / 3600e3); return h < 1 ? '방금' : h < 24 ? `${h}시간 전` : `${Math.round(h / 24)}일 전`; };
  let ytBusy = false, ytErr = '', ytShorts = false;
  function ytRender(P, sm) {
    if (!S.box || !S.boxTok) { P.appendChild(el('div', 'lf-muted', '유튜브는 단축어 우편함 서버(0번 설정 › 단축어)를 먼저 연결해야 써.')); return; }
    const f = S.ytFeed;
    if (!(S.yt && S.yt.on) && !f) { P.appendChild(el('div', 'lf-muted', '구글 로그인을 한 번 해 두면 구독한 채널의 새 영상이 여기 뜨고, 앱 안에서 바로 봐.')); const b = el('button', 'lf-big', '유튜브 연결하기'); b.onclick = () => openSheet('lyt'); P.appendChild(b); return; }
    sm.textContent = f ? `${agoTxt(f.at)} 새로 고침` : '';
    if (ytErr) P.appendChild(el('div', 'lf-muted', ytErr));
    const top = el('div', 'row'); top.append(btn(ytBusy ? '불러오는 중…' : '새로 고침', 'ghost', () => ytLoad(true)), btn(ytShorts ? '쇼츠 보는 중' : '쇼츠 빼는 중', 'ghost', () => { ytShorts = !ytShorts; render(); }), btn('설정', 'ghost', () => openSheet('lyt'))); P.appendChild(top);
    ((f && f.list) || []).filter(v => ytShorts || !(v.dur && v.dur <= 70)).slice(0, 30).forEach(v => { const b = el('button', 'lf-vid'), th = el('div', 'th'), tx = el('div', 'tx'); if (v.th) th.style.backgroundImage = `url("${v.th}")`; if (v.dur) th.appendChild(el('em', null, durTxt(v.dur))); tx.append(el('b', null, v.t), el('small', null, `${v.ch} · ${agoTxt(v.at)}`)); b.append(th, tx); b.onclick = () => { ytCur = v; openSheet('lplay'); }; P.appendChild(b); });
    if (f && !f.list.length) P.appendChild(el('div', 'lf-muted', '최근 7일 동안 올라온 새 영상이 없어.'));
    if (!f || Date.now() - f.at > 30 * 60e3) ytLoad();
  }
  async function ytLoad(force) {
    if (ytBusy || (!force && S.ytFeed && Date.now() - S.ytFeed.at < 30 * 60e3)) return; ytBusy = true; ytErr = ''; if (cur === 'play') render();
    try { await YT.feed(); } catch (e) { ytErr = e.code === 'login' ? '구글 로그인이 풀렸어. 설정에서 다시 로그인해 줘.' : e.code === 'setup' ? '서버에 구글 열쇠(YT_ID·YT_SECRET)가 아직 없어. 설정 안내 3~5번을 봐.' : '유튜브를 못 불러왔어. 잠시 뒤 새로 고침.'; if (e.code === 'login' && S.yt) S.yt.on = 0; }
    ytBusy = false; if (cur === 'play') render();
  }
  let ytCur = null;
  SH.lplay = { t: '유튜브', s: () => ytCur ? ytCur.ch : '', r: B => {
    const v = ytCur; if (!v) return;
    const w = el('div', 'lf-ytp'), fr = document.createElement('iframe'); fr.src = `https://www.youtube.com/embed/${v.id}?playsinline=1&autoplay=1&rel=0`; fr.allow = 'autoplay; encrypted-media; picture-in-picture; fullscreen'; fr.allowFullscreen = true; fr.title = v.t; w.appendChild(fr); B.appendChild(w);
    B.appendChild(el('div', 'lbl', v.t)); B.appendChild(el('div', 'hint', `${v.ch} · ${agoTxt(v.at)}${v.dur ? ' · ' + durTxt(v.dur) : ''}`));
    B.appendChild(row(btn('나중에 보기 (놀기 시간에 넣기)', 'teal wide', () => { const t = addItem(`유튜브 · ${v.t}`.slice(0, 80), '', 'todo'); t.play = true; t.yt = v.id; t.mins = Math.max(10, Math.ceil((v.dur || 600) / 60 / 5) * 5); placeOne(t); save(); toast(t.plan ? `${whenTxt(t.plan)}에 넣어 놨어.` : '빈 자리가 없어서 할 일 탭에 뒀어.'); closeSheet(); render(); })));
    const a = el('a', 'btn ghost wide', '유튜브 앱에서 열기'); a.href = `https://youtu.be/${v.id}`; a.target = '_blank'; a.rel = 'noopener'; B.appendChild(row(a));
    B.appendChild(el('div', 'hint', '안 나오는 영상(퍼가기 막힘)은 유튜브 앱에서 열어 줘.'));
  } };
  // 놀기 칸에서 유튜브 할 일을 누르면 바로 재생
  const _edit = edit; edit = function (t) { if (t.yt) { ytCur = (S.ytFeed && S.ytFeed.list.find(v => v.id === t.yt)) || { id: t.yt, t: t.text.replace(/^유튜브 · /, ''), ch: '', at: t.at }; openSheet('lplay'); return; } _edit(t); };
  SH.lyt = { t: '유튜브 연결', s: () => '처음 한 번만', r: B => {
    const cb = `${BOX()}/yt/cb`, g = el('div', 'lf-guide');
    g.innerHTML = `<p>구독 목록을 읽으려면 <b>내 구글 계정으로 로그인</b>해야 해. 레나 우편함 서버가 로그인 열쇠를 대신 들고 있어서, 한 번 해 두면 계속 돼.</p><ol>
<li><b>우편함 서버 코드 바꾸기</b>: 아래 '새 서버 코드 복사' → 클라우드플레어 → Workers → <b>lena-box</b> → 코드 편집 → 전부 지우고 붙여 넣기 → 배포.</li>
<li><b>구글 클라우드</b>(console.cloud.google.com) → 위에서 새 프로젝트 <b>lena</b> 만들기 → 검색창에 <b>YouTube Data API v3</b> → <b>사용</b>.</li>
<li>왼쪽 메뉴 <b>Google 인증 플랫폼</b>(OAuth 동의 화면) → 시작하기 → 앱 이름 <b>레나</b>, 이메일은 내 거 → 대상 <b>외부</b> → 만들기. 그다음 <b>대상</b> 화면에서 <b>앱 게시</b>(프로덕션)를 눌러 둬. (안 누르면 7일마다 다시 로그인해야 해.)</li>
<li><b>클라이언트</b> → 클라이언트 만들기 → 유형 <b>웹 애플리케이션</b> → 승인된 리디렉션 URI에 이 주소 붙여 넣기:<br><code>${cb.replace(/</g, '')}</code><br>→ 만들기 → <b>클라이언트 ID</b>와 <b>클라이언트 보안 비밀</b>이 나와.</li>
<li>클라우드플레어 → lena-box → <b>설정</b> → <b>변수 및 비밀</b> → 추가: 이름 <b>YT_ID</b> = 클라이언트 ID, 이름 <b>YT_SECRET</b> = 보안 비밀(유형 '비밀') → 배포.</li>
<li>아래 <b>구글 로그인</b> → 내 계정 고르기 → '확인되지 않은 앱'이 나오면 <b>고급 → 레나(으)로 이동</b> → 허용 → '연결됐어'가 뜨면 레나 앱으로 돌아와서 <b>연결 확인</b>.</li></ol>`;
    B.appendChild(g);
    const st = el('div', 'hint', '서버 확인 중…'); B.appendChild(st);
    fetch(BOX() + '/').then(r => r.text()).then(t => { st.textContent = /v4/.test(t) ? '서버: v4 준비됨 ✓' : `서버: ${t.trim() || '?'} — 1번(새 코드)부터 해 줘.`; }).catch(() => { st.textContent = '서버에 닿지 않음 (0번 설정 › 단축어 주소 확인)'; });
    B.appendChild(row(btn('새 서버 코드 복사', 'ghost', () => fetch('box-worker.js?' + Date.now()).then(r => r.text()).then(t => navigator.clipboard.writeText(t)).then(() => toast('복사했어. 클라우드플레어에 붙여 넣어.')).catch(() => toast('복사가 안 돼. 앱 폴더의 box-worker.js를 써.'))), btn('리디렉션 주소 복사', 'ghost', () => navigator.clipboard.writeText(cb).then(() => toast('복사했어.')).catch(() => prompt('길게 눌러 복사', cb)))));
    B.appendChild(row(btn('구글 로그인', 'teal wide', () => { window.open(`${BOX()}/yt/login?t=${S.boxTok}`, '_blank'); })));
    B.appendChild(row(btn('연결 확인', 'ghost wide', async () => { try { if (S.yt) S.yt.tok = ''; await YT.token(); toast('연결됐어! 놀기 탭에 새 영상 불러올게.'); closeSheet(); go('play'); ytLoad(true); } catch (e) { toast(e.code === 'setup' ? '서버에 YT_ID·YT_SECRET이 없어. 5번 확인.' : e.code === 'login' ? '아직 로그인 안 됐어. 6번 해 줘.' : '서버가 v4가 아니거나 닿지 않아. 1번 확인.'); } })));
    if (S.yt && S.yt.on) B.appendChild(row(btn('연결 끊기', 'ghost wide', () => { fetch(`${BOX()}/yt/off?t=${S.boxTok}`).catch(() => {}); S.yt = {}; S.ytFeed = null; save(); closeSheet(); render(); })));
  } };

  // ---------- 그리기 ----------
  function render() {
    try { autoPlace(); } catch (e) {}
    const ms = missedL().length; tb.tasks.querySelector('em') && tb.tasks.querySelector('em').remove(); if (ms) tb.tasks.appendChild(el('em', null, String(ms)));
    try { renderStrip(); } catch (e) {}
    if (!app.classList.contains('lv')) return;
    if (cur === 'today') renderToday(); else if (cur === 'tasks') renderTasks(); else if (cur === 'play') renderPlay();
  }
  const _cs = closeSheet; closeSheet = function () { const r = _cs.apply(this, arguments); render(); return r; };
  setInterval(() => { if (!document.hidden) render(); }, 60e3);
  document.addEventListener('visibilitychange', () => { if (!document.hidden) render(); });

  // 할 일 시작 알림(폰)
  const _p = window.plan; window.plan = function () { const p = _p.apply(this, arguments); try { const now = Date.now(); S.items.filter(t => isTodo(t) && !t.done && t.plan).forEach(t => { const at = new Date(t.plan).getTime(); if (at > now && at < now + 8 * 864e5) p.reminders.push({ id: 'pl_' + t.id + '_' + t.plan.replace(/\D/g, ''), at, body: t.play ? `놀 시간! '${t.text}' ${mins(t)}분.` : `지금 '${t.text}' 할 시간이야. ${mins(t)}분만 집중.` }); }); p.reminders.sort((a, b) => a.at - b.at); } catch (e) {} return p; };
  // 레나 프롬프트: 할 일은 걸리는 분까지, 자리는 앱이 잡음
  if (typeof sysPrompt === 'function') { const _sp = sysPrompt; sysPrompt = function () { const s = _sp.apply(this, arguments); try { const d = lday(Date.now()); const pl = S.items.filter(t => isTodo(t) && !t.done && t.plan).sort((a, b) => a.plan.localeCompare(b.plan)).slice(0, 20).map(t => `${t.plan.replace('T', ' ')} ${t.text}(${mins(t)}분${t.play ? ',놀기' : ''})`); const ex = S.exams2.filter(e => e.date >= dk(new Date())).map(e => `${e.name} ${e.date}: ` + e.subs.map(x => `${x.name} ${subProg(x).d}/${subProg(x).n}`).join(', '));
    return s + `\n--- 할 일 자리 잡기(v149) ---\n할 일(type todo)은 앱이 송휘 시간표의 빈 시간(학원 끝나고 90분은 밥·씻기, ${L().end}까지)에 자동으로 넣는다. add에 "mins"(걸리는 분, 꼭)와 마감이 있으면 due를 넣어라. 게임·유튜브 같은 노는 일은 add에 "play":true. 공부 계획(study)은 더 이상 쓰지 않는다 — 시험 준비는 앱의 '시험 체크리스트'(할 일 탭)에서 송휘가 체크한다.\n잡힌 할 일: ${pl.join(' / ') || '없음'}\n시험 체크리스트: ${ex.join(' / ') || '없음'}\n오늘 빈 시간: ${free(d).map(([a, b]) => hmM(a) + '~' + hmM(b)).join(', ') || '없음'}`; } catch (e) { return s; } }; }
  { const _ap2 = apply; apply = function (r) { if (r && r.add) { const before = new Set(S.items.map(t => t.id)); const x = _ap2.apply(this, arguments); S.items.forEach(t => { if (before.has(t.id)) return; const a = r.add.find(y => y && norm(y.text) === norm(t.text)); if (a && a.play) t.play = true; if (a && +a.mins > 0) t.mins = Math.round(+a.mins); }); if (autoPlace()) render(); return x; } const x = _ap2.apply(this, arguments); try { if (autoPlace()) render(); } catch (e) {} return x; }; }


  // ---------- v151: 레나 대화 머리에 영상통화 버튼, 자판기 빼기 ----------
  { const hd = document.querySelector('#callv .ahead'), vb = el('button', 'lf-vbtn'); vb.innerHTML = '<svg viewBox="0 0 24 24"><rect x="2.5" y="6" width="13" height="12" rx="2.5"/><path d="M15.5 10.5l6-3.5v10l-6-3.5z"/></svg>영상'; vb.setAttribute('aria-label', '영상통화'); vb.onclick = () => $('aVid').click(); if (hd) hd.appendChild(vb); }
  { const _o = openSheet; openSheet = function (n) { if (n === 'shop' || n === 3) return; return _o.apply(this, arguments); }; }

  // ---------- v151: 다이얼 = 할 일 프리셋 (누르면 바로 빈 시간에, 길게 누르면 고치기) ----------
  const PDEF = { 1: ['수학 숙제', 60], 2: ['영어 숙제', 60], 3: ['국어 숙제', 60], 4: ['영어 단어', 30], 5: ['수행평가 준비', 60], 6: ['시험 공부', 90], 7: ['책 읽기', 30], 8: ['게임', 60, 1], 9: ['유튜브', 30, 1], '*': ['', 30] };
  const PRE = () => { const o = L(); if (!o.keys || typeof o.keys !== 'object') { o.keys = {}; Object.entries(PDEF).forEach(([k, v]) => { o.keys[k] = { t: v[0], m: v[1], p: !!v[2] }; }); } return o.keys; }; // (S.life.pre는 학원 전 이동 시간)
  let preK = null;
  function buildPad() {
    const K = $('keys'); if (!K) return; K.innerHTML = '';
    ['1', '2', '3', '4', '5', '6', '7', '8', '9', '*', '0', '#'].forEach(k => {
      const o = PRE()[k], b = el('button', 'k'); b.dataset.k = k;
      if (k === '0') { b.append(el('b', null, '0'), el('span', null, '메뉴')); b.onclick = () => { dtmf(0); openSheet('lmenu'); }; }
      else if (k === '#') { b.append(el('b', null, '#'), el('span', null, '닫기')); b.onclick = () => { dtmf('#'); closePad(); }; }
      else {
        b.classList.add('pre'); if (o && o.p) b.classList.add('play'); if (!o || !o.t) b.classList.add('empty');
        const sp = el('span', null, o && o.t ? o.t : '+ 비어 있음'); if (o && o.t) sp.appendChild(el('small', null, `${o.m}분`)); b.append(el('b', null, k), sp);
        let lt = 0, long = false;
        b.addEventListener('pointerdown', () => { long = false; lt = setTimeout(() => { long = true; preK = k; openSheet('lpre'); }, 550); });
        ['pointerup', 'pointerleave', 'pointercancel'].forEach(e => b.addEventListener(e, () => clearTimeout(lt)));
        b.oncontextmenu = e => e.preventDefault();
        b.onclick = () => { if (long) return; dtmf(k); const p = PRE()[k]; if (!p || !p.t) { preK = k; openSheet('lpre'); return; }
          const t = quickAdd(p.t, { mins: p.m, play: p.p }); if (!t) return;
          $('lcd').textContent = `${k} · ${p.t} → ${t.plan ? whenTxt(t.plan) : '자리 없음'}`;
          toast(t.plan ? `${p.t} ${p.m}분 → ${whenTxt(t.plan)}에 넣었어` : `${p.t}: 빈 자리가 없어. 할 일 탭에서 골라.`, () => { S.items = S.items.filter(x => x !== t); save(); render(); });
          render(); };
      }
      K.appendChild(b); });
  }
  buildPad();
  { const _op = openPad; openPad = function () { const r = _op.apply(this, arguments); buildPad(); $('lcd').textContent = '누르면 바로 넣기 · 길게 = 고치기'; return r; }; }
  SH.lpre = { t: '프리셋 고치기', s: () => preK ? `${preK}번` : '', r: B => {
    const o = PRE()[preK] = PRE()[preK] || { t: '', m: 60, p: false }; if (!o.m) o.m = 30;
    const n = inp('text', '할 일 이름 (예: 수학 숙제)', o.t); n.oninput = () => { o.t = n.value.trim().slice(0, 20); save(); };
    B.append(lbl('이름'), n, lbl('걸리는 시간'));
    B.appendChild(row(btn('−10분', 'ghost', () => { o.m = Math.max(10, o.m - 10); save(); refreshSheet(); }), el('b', null, o.m + '분'), btn('+10분', 'ghost', () => { o.m += 10; save(); refreshSheet(); })));
    B.appendChild(row(btn(o.p ? '놀기 ✓' : '할 일 (놀기로 바꾸기)', 'ghost wide', () => { o.p = !o.p; save(); refreshSheet(); })));
    B.appendChild(row(btn('저장', 'teal wide', () => { closeSheet(); openPad(); })));
    B.appendChild(row(btn('이 번호 비우기', 'ghost wide', () => { o.t = ''; save(); closeSheet(); openPad(); })));
  } };
  SH.lmenu = { t: '메뉴', s: () => '', r: B => {
    const M = el('div', 'lf-menu');
    [['시험 체크', 'lexam'], ['캘린더', 'cal'], ['시간표', 'tt'], ['전화·부재중', 'call'], ['모닝콜', 7], ['메모', 'memo'], ['전단지', 1], ['운세', 'fort'], ['오락실', 8], ['설정', 0]].forEach(([l, id]) => { const b = el('button', null, l); b.onclick = () => openSheet(id); M.appendChild(b); });
    B.appendChild(M);
  } };
  if (typeof NUMOF !== 'undefined') { NUMOF.lpre = '#'; NUMOF.lmenu = '0'; }

  // ---------- v152: 레나 대화 화면에 오늘 할 일 띠 ----------
  const strip = el('div', 'lf-strip'); { const hd = document.querySelector('#callv .ahead'); if (hd) hd.after(strip); }
  function renderStrip() {
    strip.innerHTML = ''; const d = lday(Date.now()), now = Date.now();
    const ms = missedL(), td = plannedOn(d).filter(t => !t.done && !ms.includes(t)).sort((a, b) => a.plan.localeCompare(b.plan));
    const evs = fixed(d).list.filter(x => x.kind === 'ev' && d.getTime() + x.e * 60e3 > now);
    const list = ms.map(t => ({ c: 'late', b: '못 함', t: t.text, it: t })).concat(evs.map(x => ({ c: 'ev', b: hmM(x.s), t: x.txt, s: x.s })), td.map(t => ({ c: t.play ? 'pl' : '', b: hmM(relM(d, t.plan)), t: t.text, it: t, s: relM(d, t.plan) }))).sort((a, b) => (a.c === 'late' ? -1 : a.s) - (b.c === 'late' ? -1 : b.s));
    list.slice(0, 4).forEach(o => { const b = el('button', o.c); b.append(el('b', null, o.b), el('span', null, o.t)); b.onclick = () => o.it ? edit(o.it) : go('today'); strip.appendChild(b); });
    const left = list.length - 4, un = S.items.filter(t => isTodo(t) && !t.done && !t.plan).length;
    if (left > 0 || un) { const b = el('button', 'more'); b.append(el('span', null, left > 0 ? `+${left}개 더` : `시간 안 정한 ${un}개`)); b.onclick = () => go(left > 0 ? 'today' : 'tasks'); strip.appendChild(b); }
    if (!list.length && !un) { const b = el('button', 'more'); b.append(el('span', null, '오늘 할 일 없음 · + 넣기')); b.onclick = () => { go('today'); qaOpen(); }; strip.appendChild(b); }
  }

  window.lenaLife = { go, render, parse, quickAdd, findSlot, free, fixed, autoPlace, replanMissed, missedL, rowsOf, lday, YT, ends: d => plannedOn(d).map(t => relM(d, t.plan) + mins(t)) };
  go(cur);
})();
