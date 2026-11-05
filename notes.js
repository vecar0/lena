// 노트 (4번 공부 > 노트 탭): 필기·교과서 사진/PDF/글을 레나(Gemini)가 과목·단원별로 정리
// 정리된 글만 S.study.notes에 저장(사진 원본은 저장 안 함). 공부 계획의 '백지 복습'·'필승노트' 블록과 연결.
'use strict';
(() => {
const css = `
.nlist .nh{display:flex;align-items:center;gap:8px;margin:16px 2px 8px;font-weight:800;font-size:15px}
.nrow{display:flex;align-items:center;gap:10px;width:100%;min-height:56px;padding:10px 12px;margin-bottom:7px;border-radius:12px;background:var(--panel2);border:1px solid var(--line);text-align:left}
.nrow b{flex:1;min-width:0;font-size:15px;line-height:1.35;word-break:keep-all}
.nrow small{flex:none;font-family:'Space Mono',monospace;font-size:11.5px;color:var(--mute)}
.nfrm .pills{margin:2px 0 4px}
.nfrm textarea{width:100%;min-height:110px;resize:vertical;font:inherit;font-size:16px;line-height:1.5;padding:10px 12px;border-radius:12px;border:1px solid var(--line);background:#0b0d10;color:#fff}
.nfiles{display:flex;flex-wrap:wrap;gap:6px}
.nfiles span{display:inline-flex;align-items:center;gap:4px;max-width:100%;height:30px;padding:0 10px;border-radius:15px;background:#0b0d10;border:1px solid var(--line);font-size:12.5px;overflow:hidden;white-space:nowrap;text-overflow:ellipsis}
.npick{position:relative;display:flex;align-items:center;justify-content:center;gap:8px;height:56px;border-radius:12px;border:2px dashed rgba(255,255,255,.3);font-weight:800;color:#e6eef0}
.npick input{position:absolute;inset:0;opacity:0;width:100%}
.nbusy{display:flex;align-items:center;gap:10px;padding:14px;border-radius:12px;background:#0b0d10;border:1px solid var(--line);font-size:14px;line-height:1.5}
.nbusy i{flex:none;width:18px;height:18px;border-radius:50%;border:3px solid var(--teal);border-right-color:transparent;animation:nspin .8s linear infinite}
@keyframes nspin{to{transform:rotate(360deg)}}
@media (prefers-reduced-motion:reduce){.nbusy i{animation:none}}
.npaper{position:relative;margin:16px 4px 10px;padding:22px 16px 16px;color:#17181a;background:#f3efe6 url(assets/lena/paper_white.webp) center/cover;border-radius:3px;box-shadow:4px 5px 0 rgba(0,0,0,.55)}
.npaper>.tape{position:absolute;top:-11px;left:50%;width:84px;height:22px;margin-left:-42px;background:url(assets/lena/tape_pink1.webp) 0 0/100% 100%;transform:rotate(-3deg)}
.npaper h3{font-family:'Black Han Sans';font-weight:400;font-size:22px;line-height:1.25;word-break:keep-all}
.npaper .meta{font-size:12px;color:rgba(0,0,0,.55);margin-top:4px}
.npaper h4{display:inline-block;margin:18px 0 6px;font-size:15.5px;font-weight:900;background:linear-gradient(transparent 55%,var(--c,#9ff5e4) 55%);padding:0 3px;word-break:keep-all}
.npaper ul{list-style:none;margin:0;padding:0}
.npaper li{position:relative;padding:3px 0 3px 14px;font-size:14.5px;line-height:1.6;word-break:keep-all;overflow-wrap:anywhere}
.npaper li::before{content:"";position:absolute;left:2px;top:12px;width:5px;height:5px;border-radius:50%;background:#17181a}
.npaper .sec{padding-top:2px}
.npaper .kw{display:grid;grid-template-columns:minmax(72px,34%) 1fr;gap:4px 10px;font-size:14px;line-height:1.5;margin-top:4px}
.npaper .kw b{font-weight:900;word-break:keep-all;overflow-wrap:anywhere}.npaper .kw span{word-break:keep-all;overflow-wrap:anywhere}
.npaper .trap li{color:#c4122f}.npaper .trap li::before{background:#c4122f}
.npaper .qa{border-top:1.5px dashed rgba(0,0,0,.2);padding:8px 0}
.npaper .qa b{display:block;font-size:14.5px;line-height:1.5;word-break:keep-all}
.npaper .qa button{margin-top:6px;min-height:40px;padding:0 12px;border-radius:10px;background:#fff;border:2px solid #000;box-shadow:2px 2px 0 #000;font-size:13px;font-weight:800;color:#111}
.npaper .qa p{margin-top:6px;font-size:14px;line-height:1.55;color:#0f6f62;font-weight:700;word-break:keep-all}
.npaper .warnl{margin-top:14px;font-size:12px;color:rgba(0,0,0,.5);line-height:1.5}
.nedit textarea{min-height:360px;font-family:'Space Mono',monospace;font-size:13px}
`;
document.head.appendChild(Object.assign(document.createElement('style'), { textContent: css }));

const ST = () => { if (!S.study) S.study = {}; S.study.notes = S.study.notes || []; return S.study; };
const SUBP = ['국어', '영어', '수학', '사회', '과학', '한국사'];
const PAL = ['#ff8fc4', '#7fecd9', '#f2ea3a', '#b89cff', '#ffb27a', '#9ff5e4', '#7fb6ff', '#c9f27a'];
const colOf = sub => { let h = 0; for (const c of sub || '') h = (h * 31 + c.charCodeAt(0)) >>> 0; return PAL[h % PAL.length]; };
const chip = sub => { const c = el('span', 'sj', sub); c.style.background = colOf(sub); return c; };
const subsAll = () => [...new Set([...(ST().mats || []).map(m => m.sub), ...ST().notes.map(n => n.sub), ...SUBP])];
const md = t => { const d = new Date(t); return `${d.getMonth() + 1}/${d.getDate()}`; };

// 상태
let view = 'list', openId = null, fSub = '', fTitle = '', fText = '', files = [], busy = false, err = '', filterSub = '', mode = '', shown = {};

// ---------- 파일 → Gemini 부분 ----------
function readImg(file) { return new Promise((res, rej) => { const fr = new FileReader(); fr.onload = () => { const im = new Image(); im.onload = () => { const s = Math.min(1, 1800 / Math.max(im.width, im.height)), c = document.createElement('canvas'); c.width = Math.round(im.width * s); c.height = Math.round(im.height * s); c.getContext('2d').drawImage(im, 0, 0, c.width, c.height); res({ name: file.name, mime: 'image/jpeg', data: c.toDataURL('image/jpeg', .85).split(',')[1] }); }; im.onerror = rej; im.src = fr.result; }; fr.onerror = rej; fr.readAsDataURL(file); }); }
function readRaw(file) { return new Promise((res, rej) => { const fr = new FileReader(); fr.onload = () => res({ name: file.name, mime: file.type || 'application/pdf', data: String(fr.result).split(',')[1] }); fr.onerror = rej; fr.readAsDataURL(file); }); }
async function readFile(f) {
  if (/^image\//.test(f.type) || /\.(heic|jpe?g|png|webp)$/i.test(f.name)) return readImg(f);
  if (f.type === 'application/pdf' || /\.pdf$/i.test(f.name)) { if (f.size > 15e6) throw new Error('PDF가 너무 커요(15MB까지). 필요한 쪽만 나눠서 넣어요.'); return readRaw(f); }
  if (/^text\//.test(f.type) || /\.(txt|md)$/i.test(f.name)) return { name: f.name, text: await f.text() };
  throw new Error(`${f.name}: 사진·PDF·글 파일만 돼요.`);
}

// ---------- 정리 요청 ----------
const SCHEMA = '{"sub":"과목","title":"단원/주제 이름(짧게)","secs":[{"h":"소제목","pts":["핵심 내용 한 줄씩"]}],"keys":[{"t":"용어·공식·연도","d":"뜻·설명(짧게)"}],"traps":["헷갈리기 쉬운 것·자주 틀리는 것"],"qs":[{"q":"백지 복습 질문","a":"모범 답(짧게)"}]}';
function sysNote(old) {
  return `너는 고등학생의 필기·교과서를 정리하는 꼼꼼한 조수다. 받은 사진·PDF·글에 실제로 있는 내용만 근거로, 시험공부용 개념 노트를 한국어로 만든다.
규칙:
- 자료에 없는 내용을 지어내지 않는다. 이해에 꼭 필요한 짧은 보충만 끝에 "(보충)"을 붙여 쓴다.
- 손글씨를 읽기 어려운 부분은 추측하지 말고 "(읽기 어려움)"으로 표시한다.
- secs: 자료의 흐름대로 소제목 3~8개, 소제목마다 핵심을 1~6줄. 한 줄은 짧고 분명하게(시험에 나올 말 위주, 수식은 그대로).
- keys: 꼭 외울 용어·공식·연도·인물 5~15개.
- traps: 헷갈리기 쉬운 것·비슷한 개념 구별·자주 틀리는 것 2~6개.
- qs: 노트를 가리고 답해 보는 백지 복습 질문 5~10개(서술형·빈칸형 섞어서), 답은 짧게.
- 과목·단원 이름이 주어지면 그대로 쓰고, 없으면 자료를 보고 정한다.${old ? `
- 아래는 같은 단원의 기존 노트다. 새 자료 내용을 기존 노트에 합쳐서(중복은 하나로, 순서는 자연스럽게) 전체 노트를 다시 출력한다.
기존 노트: ${JSON.stringify(old)}` : ''}
JSON만 출력: ${SCHEMA}`;
}
async function askNote(parts, old) {
  let lastErr = null;
  for (const m of mChain()) {
    const ac = new AbortController(), t = setTimeout(() => ac.abort(), 120000);
    try {
      const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${m}:generateContent?key=${encodeURIComponent(S.key)}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, signal: ac.signal,
        body: JSON.stringify({ systemInstruction: { parts: [{ text: sysNote(old) }] }, contents: [{ role: 'user', parts }], generationConfig: Object.assign({ responseMimeType: 'application/json', temperature: .3, maxOutputTokens: 8192 }, /gemini-3/.test(m) ? { thinkingConfig: { thinkingLevel: 'low' } } : /2\.5/.test(m) ? { thinkingConfig: { thinkingBudget: 1024 } } : {}) }) });
      clearTimeout(t);
      if (r.status === 401 || r.status === 403) throw Object.assign(new Error('키가 안 맞아요. 0번 설정에서 확인해 주세요.'), { fatal: 1 });
      if (!r.ok) { lastErr = new Error(r.status === 429 ? '지금 요청이 많아요. 1분 뒤에 다시 해 주세요.' : `서버 오류(${r.status})`); if (r.status === 429 || r.status >= 500) COOL[m] = Date.now() + (r.status === 429 ? 90e3 : 30e3); continue; }
      const j = await r.json(), tx = (j.candidates?.[0]?.content?.parts || []).filter(p => !p.thought).map(p => p.text || '').join('');
      const o = JSON.parse(tx.slice(tx.indexOf('{'), tx.lastIndexOf('}') + 1));
      if (!o || !Array.isArray(o.secs)) throw new Error('정리 결과가 이상해요.');
      return o;
    } catch (e) { clearTimeout(t); if (e.fatal) throw e; lastErr = e.name === 'AbortError' ? new Error('시간이 너무 걸렸어요. 사진을 몇 장 줄여서 다시 해 주세요.') : e; }
  }
  throw lastErr || new Error('정리하지 못했어요.');
}
const clean = o => ({ secs: (o.secs || []).filter(s => s && s.h).slice(0, 12).map(s => ({ h: String(s.h).slice(0, 60), pts: (s.pts || []).map(String).filter(Boolean).slice(0, 12).map(x => x.slice(0, 300)) })), keys: (o.keys || []).filter(k => k && k.t).slice(0, 25).map(k => ({ t: String(k.t).slice(0, 60), d: String(k.d || '').slice(0, 200) })), traps: (o.traps || []).map(String).filter(Boolean).slice(0, 10).map(x => x.slice(0, 240)), qs: (o.qs || []).filter(q => q && q.q).slice(0, 15).map(q => ({ q: String(q.q).slice(0, 240), a: String(q.a || '').slice(0, 300) })) });

async function run() {
  if (busy) return;
  if (!S.key) { err = '0번 설정에 Gemini 키를 넣어야 정리할 수 있어요.'; refreshSheet(); return; }
  if (!files.length && !fText.trim()) { err = '사진·PDF를 고르거나 글을 붙여 넣어 주세요.'; refreshSheet(); return; }
  if (!fSub) { err = '과목을 골라 주세요.'; refreshSheet(); return; }
  busy = true; err = ''; refreshSheet();
  try {
    const parts = [{ text: `과목: ${fSub}${fTitle ? `\n단원/주제: ${fTitle}` : ''}\n아래 자료를 정리해 주세요.` }];
    files.forEach(f => parts.push(f.text != null ? { text: `[${f.name}]\n${f.text.slice(0, 60000)}` } : { inline_data: { mime_type: f.mime, data: f.data } }));
    if (fText.trim()) parts.push({ text: fText.slice(0, 60000) });
    const old = fTitle ? ST().notes.find(n => n.sub === fSub && n.title === fTitle) : null;
    const o = await askNote(parts, old ? { secs: old.secs, keys: old.keys, traps: old.traps, qs: old.qs } : null);
    const title = String(fTitle || o.title || '정리 노트').slice(0, 40), sub = fSub;
    let n = ST().notes.find(x => x.sub === sub && x.title === title);
    if (n) Object.assign(n, clean(o), { at: Date.now(), src: (n.src || 0) + files.length + (fText.trim() ? 1 : 0) });
    else { n = { id: uid('n'), sub, title, at: Date.now(), src: files.length + (fText.trim() ? 1 : 0), ...clean(o) }; ST().notes.push(n); }
    save(); files = []; fText = ''; busy = false; view = 'note'; openId = n.id; mode = ''; shown = {};
    refreshSheet(); toast(`'${title}' 정리했어요.`);
    try { if (JSON.stringify(S).length > 4.2e6) toast('저장 공간이 거의 찼어요. 안 쓰는 노트를 지워 주세요.'); } catch (e) {}
  } catch (e) { busy = false; err = e.message || '정리하지 못했어요.'; refreshSheet(); }
}

// ---------- 글로 고치기(간단한 형식) ----------
function toText(n) {
  const L = [`# 제목: ${n.title}`, ''];
  n.secs.forEach(s => { L.push(`## ${s.h}`); s.pts.forEach(p => L.push(`- ${p}`)); L.push(''); });
  L.push('## [꼭 외울 것]'); n.keys.forEach(k => L.push(`- ${k.t} : ${k.d}`)); L.push('');
  L.push('## [헷갈리기 쉬운 것]'); n.traps.forEach(t => L.push(`- ${t}`)); L.push('');
  L.push('## [백지 복습]'); n.qs.forEach(q => L.push(`- Q: ${q.q} | A: ${q.a}`));
  return L.join('\n');
}
function fromText(n, txt) {
  const o = { secs: [], keys: [], traps: [], qs: [] }; let cur = null, kind = 'sec';
  txt.split('\n').forEach(raw => { const l = raw.trim(); if (!l) return;
    let m;
    if ((m = l.match(/^#\s*제목\s*:\s*(.+)/))) { n.title = m[1].trim().slice(0, 40); return; }
    if (l.startsWith('##')) { const h = l.replace(/^#+\s*/, ''); kind = /꼭 외울/.test(h) ? 'key' : /헷갈/.test(h) ? 'trap' : /백지/.test(h) ? 'q' : 'sec'; if (kind === 'sec') { cur = { h, pts: [] }; o.secs.push(cur); } return; }
    const v = l.replace(/^[-•*]\s*/, '');
    if (kind === 'key') { const i = v.indexOf(':'); o.keys.push(i > 0 ? { t: v.slice(0, i).trim(), d: v.slice(i + 1).trim() } : { t: v, d: '' }); }
    else if (kind === 'trap') o.traps.push(v);
    else if (kind === 'q') { const mm = v.match(/^Q:\s*(.*?)(?:\s*\|\s*A:\s*(.*))?$/); o.qs.push(mm ? { q: mm[1], a: mm[2] || '' } : { q: v, a: '' }); }
    else { if (!cur) { cur = { h: '정리', pts: [] }; o.secs.push(cur); } cur.pts.push(v); } });
  Object.assign(n, clean(o), { at: Date.now() });
}

// ---------- 화면 ----------
function render(B) {
  if (busy) { const w = el('div', 'nbusy'); w.append(el('i'), el('span', null, `레나가 ${fSub} 자료를 읽고 정리하는 중이에요… 사진이 많으면 1분쯤 걸려요. 화면을 닫아도 돼요.`)); B.appendChild(w); return; }
  if (view === 'new') return renderNew(B);
  if (view === 'edit') return renderEdit(B);
  if (view === 'note' && openId) { const n = ST().notes.find(x => x.id === openId); if (n) return renderNote(B, n); view = 'list'; }
  if (view === 'cram' || view === 'quiz') return renderBundle(B);
  renderList(B);
}
function renderList(B) {
  const N = ST().notes;
  B.appendChild(row(btn('+ 필기·교과서 정리하기', 'teal wide', () => { view = 'new'; err = ''; refreshSheet(); })));
  if (!N.length) { B.appendChild(empty('아직 노트가 없어요.\n필기·교과서 사진이나 PDF를 주면\n레나가 단원별로 개념을 정리하고\n백지 복습 문제도 만들어요.', 'st_tape')); return; }
  const L = el('div', 'nlist');
  [...new Set(N.map(n => n.sub))].forEach(sb => {
    const h = el('div', 'nh'); h.append(chip(sb), document.createTextNode(`${N.filter(n => n.sub === sb).length}개`));
    const tools = el('span'); tools.style.cssText = 'margin-left:auto;display:flex;gap:6px';
    tools.append(btn('필승노트', 'ghost', () => { view = 'cram'; filterSub = sb; refreshSheet(); }), btn('백지 복습', 'ghost', () => { view = 'quiz'; filterSub = sb; shown = {}; refreshSheet(); }));
    tools.querySelectorAll('.btn').forEach(b => { b.style.height = '36px'; b.style.padding = '0 10px'; b.style.fontSize = '12.5px'; });
    h.appendChild(tools); L.appendChild(h);
    N.filter(n => n.sub === sb).sort((a, b) => b.at - a.at).forEach(n => { const r = el('button', 'nrow'); r.append(el('b', null, n.title), el('small', null, `${md(n.at)} · 개념 ${n.secs.length} · 문제 ${n.qs.length}`)); r.onclick = () => { view = 'note'; openId = n.id; shown = {}; refreshSheet(); }; L.appendChild(r); });
  });
  B.appendChild(L);
}
function renderNew(B) {
  const f = el('div', 'card frm nfrm');
  f.appendChild(el('div', 'hint', '과목'));
  f.appendChild(pills(subsAll().map(s => [s, s]), fSub, v => { fSub = v; refreshSheet(); }));
  const units = [...new Set((ST().mats || []).filter(m => m.sub === fSub && m.kind === 'book').flatMap(m => m.units.map(u => `${m.title} ${u.name}`)).concat(ST().notes.filter(n => n.sub === fSub).map(n => n.title)))];
  const t = inp('text', '단원 (예: 함수의 극한)', fTitle); t.oninput = () => { fTitle = t.value.trim(); };
  const dl = el('datalist'); dl.id = 'nUnits'; units.forEach(u => dl.appendChild(Object.assign(document.createElement('option'), { value: u }))); t.setAttribute('list', 'nUnits');
  f.append(row(t), dl, el('div', 'hint', '단원을 비우면 레나가 자료를 보고 정해요.'));
  if (fTitle && ST().notes.some(n => n.sub === fSub && n.title === fTitle)) f.appendChild(el('div', 'hint', '이미 있는 노트예요. 새 자료를 기존 노트에 합쳐요.'));
  const pk = el('label', 'npick'), fi = el('input'); fi.type = 'file'; fi.multiple = true; fi.accept = 'image/*,application/pdf,.pdf,.txt,.md';
  pk.append(document.createTextNode(files.length ? `+ 더 고르기 (${files.length}개 골랐어요)` : '사진 · PDF 고르기'), fi);
  fi.onchange = async () => { const L = [...fi.files]; fi.value = ''; err = ''; for (const x of L) { if (files.length >= 12) { err = '한 번에 12개까지예요. 나머지는 다음에 합쳐서 넣어요.'; break; } try { files.push(await readFile(x)); } catch (e) { err = e.message; } } refreshSheet(); };
  f.appendChild(pk);
  if (files.length) { const F = el('div', 'nfiles'); files.forEach((x, i) => { const s = el('span', null, x.name || `사진 ${i + 1}`), xb = el('button', null, '×'); xb.setAttribute('aria-label', '빼기'); xb.style.cssText = 'margin-left:2px;font-size:15px;color:#ff7a9c'; xb.onclick = () => { files.splice(i, 1); refreshSheet(); }; s.appendChild(xb); F.appendChild(s); }); f.appendChild(F); }
  const ta = el('textarea'); ta.placeholder = '또는 글을 붙여 넣기 (필기 내용, 교과서 본문 등)'; ta.value = fText; ta.oninput = () => { fText = ta.value; };
  f.appendChild(ta);
  if (err) f.appendChild(el('div', 'warn', err));
  f.append(row(btn('취소', 'ghost', () => { view = 'list'; files = []; fText = ''; err = ''; refreshSheet(); }), btn('레나한테 정리 맡기기', 'teal wide', run)));
  f.appendChild(el('div', 'hint', '사진 원본은 저장하지 않고 정리된 글만 저장해요. 손글씨는 잘못 읽을 수 있어서 한 번 훑어보고 틀린 곳은 "고치기"로 바꿔요. 한 번에 사진 12장까지, 단원별로 넣는 게 가장 깔끔해요.'));
  B.appendChild(f);
}
function paper(B, title, meta, sub) { const p = el('div', 'npaper'); p.style.setProperty('--c', colOf(sub)); p.append(el('i', 'tape'), el('h3', null, title)); if (meta) p.appendChild(el('div', 'meta', meta)); B.appendChild(p); return p; }
const ul = (arr, cls) => { const u = el('ul', cls || ''); arr.forEach(x => u.appendChild(el('li', null, x))); return u; };
function keysEl(keys) { const g = el('div', 'kw'); keys.forEach(k => g.append(el('b', null, k.t), el('span', null, k.d))); return g; }
function qaEl(qs, pre) { const w = el('div'); qs.forEach((q, i) => { const id = pre + i, d = el('div', 'qa'); d.appendChild(el('b', null, `${i + 1}. ${q.q}`)); if (shown[id]) d.appendChild(el('p', null, q.a || '(답 없음)')); else { const b = el('button', null, '답 보기'); b.onclick = () => { shown[id] = 1; refreshSheet(); }; d.appendChild(b); } w.appendChild(d); }); return w; }
function renderNote(B, n) {
  B.appendChild(row(btn('‹ 노트 목록', 'ghost', () => { view = 'list'; refreshSheet(); })));
  const p = paper(B, n.title, `${n.sub} · ${md(n.at)} 정리 · 자료 ${n.src || 1}개`, n.sub);
  n.secs.forEach(s => { const d = el('div', 'sec'); d.append(el('h4', null, s.h), ul(s.pts)); p.appendChild(d); });
  if (n.keys.length) { p.appendChild(el('h4', null, '꼭 외울 것')); p.appendChild(keysEl(n.keys)); }
  if (n.traps.length) { p.appendChild(el('h4', null, '헷갈리기 쉬운 것')); p.appendChild(ul(n.traps, 'trap')); }
  if (n.qs.length) { p.appendChild(el('h4', null, `백지 복습 ${n.qs.length}문제`)); p.appendChild(qaEl(n.qs, n.id + '_')); }
  p.appendChild(el('div', 'warnl', '사진에서 읽어 정리한 거라 원문과 다를 수 있어요. 틀린 곳은 "고치기"로 바꿔요.'));
  B.appendChild(row(btn('자료 더 넣어 합치기', 'ghost wide', () => { view = 'new'; fSub = n.sub; fTitle = n.title; err = ''; refreshSheet(); }), btn('고치기', 'ghost', () => { view = 'edit'; refreshSheet(); })));
  B.appendChild(row(btn('레나랑 이 단원 공부하기', 'teal wide', () => { const k = n.keys.slice(0, 6).map(x => x.t).join(', '); closeSheet(); openCall(); setTimeout(() => sendText(`${n.sub} '${n.title}' 노트로 나 퀴즈 내 줘. 핵심: ${k}`), 400); }), btn('지우기', 'ghost', () => { if (!confirm(`'${n.title}' 노트를 지울까요?`)) return; ST().notes = ST().notes.filter(x => x !== n); save(); view = 'list'; refreshSheet(); })));
}
function renderEdit(B) {
  const n = ST().notes.find(x => x.id === openId); if (!n) { view = 'list'; return renderList(B); }
  const c = el('div', 'card frm nfrm nedit'), ta = el('textarea'); ta.value = toText(n);
  c.append(el('div', 'hint', '"## 소제목", "- 내용" 형식 그대로 고쳐요. [꼭 외울 것]은 "용어 : 뜻", [백지 복습]은 "Q: 질문 | A: 답".'), ta, row(btn('취소', 'ghost', () => { view = 'note'; refreshSheet(); }), btn('저장', 'teal wide', () => { fromText(n, ta.value); save(); view = 'note'; refreshSheet(); toast('고쳤어요.'); })));
  B.appendChild(c);
}
// 필승노트(시험 전날) = 과목 노트의 꼭 외울 것 + 헷갈리기 쉬운 것 / 백지 복습 = 과목 노트 문제 전부
function renderBundle(B) {
  const N = ST().notes.filter(n => n.sub === filterSub);
  B.appendChild(row(btn('‹ 노트 목록', 'ghost', () => { view = 'list'; refreshSheet(); })));
  if (!N.length) { B.appendChild(empty(`${filterSub} 노트가 아직 없어요.\n필기나 교과서를 넣으면 여기서 모아 볼 수 있어요.`, 'st_tape')); B.appendChild(row(btn('+ 필기·교과서 정리하기', 'teal wide', () => { view = 'new'; fSub = filterSub; refreshSheet(); }))); return; }
  if (view === 'cram') {
    const p = paper(B, `${filterSub} 필승노트`, `노트 ${N.length}개에서 꼭 외울 것·헷갈리기 쉬운 것만 모았어요`, filterSub);
    N.forEach(n => { if (!n.keys.length && !n.traps.length) return; p.appendChild(el('h4', null, n.title)); if (n.keys.length) p.appendChild(keysEl(n.keys)); if (n.traps.length) p.appendChild(ul(n.traps, 'trap')); });
  } else {
    const p = paper(B, `${filterSub} 백지 복습`, '노트를 가리고 먼저 말해 보거나 써 본 뒤 답을 열어요', filterSub);
    N.forEach(n => { if (!n.qs.length) return; p.appendChild(el('h4', null, n.title)); p.appendChild(qaEl(n.qs, 'b_' + n.id + '_')); });
  }
}

window.lenaNotes = {
  render,
  has: sb => ST().notes.some(n => n.sub === sb),
  open: (sb, m) => { filterSub = sb; view = m === 'cram' ? 'cram' : m === 'quiz' ? 'quiz' : 'list'; shown = {}; },
  reset: () => { if (!busy && view !== 'new') { view = 'list'; } },
  _test: { fromText, toText, clean, set: o => { ({ view, openId, filterSub } = Object.assign({ view, openId, filterSub }, o)); } }
};
// 레나 대화에도 노트 핵심을 조금 넘긴다(퀴즈·설명할 때 쓰게)
const _sys = sysPrompt; sysPrompt = function (sp) {
  const s = _sys(sp), N = ST().notes.slice().sort((a, b) => b.at - a.at).slice(0, 6);
  if (!N.length) return s;
  return s.replace('JSON만 출력:', `- 공부 노트(송휘님 필기 정리, 퀴즈·설명할 때 근거로 쓴다): ${JSON.stringify(N.map(n => ({ 과목: n.sub, 단원: n.title, 핵심: n.keys.slice(0, 8).map(k => k.t + ': ' + k.d) })))}
JSON만 출력:`);
};
})();
