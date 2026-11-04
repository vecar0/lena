// 레나 — 한밤의 공중전화 비서
'use strict';
const $ = id => document.getElementById(id);
const app = $('app');
const pad = n => String(n).padStart(2, '0');
const dk = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const pick = a => a[Math.random() * a.length | 0];
const sleep = ms => new Promise(r => setTimeout(r, ms));
const DAY = 864e5;
const WD = '일월화수목금토';
function el(tag, cls, txt) { const e = document.createElement(tag); if (cls) e.className = cls; if (txt != null) e.textContent = txt; return e; }
function hm(d) { return `${pad(d.getHours())}:${pad(d.getMinutes())}`; }
function localISO(d) { return `${dk(d)}T${hm(d)}`; }
function when(v) {
  if (!v) return '';
  const x = new Date(v), t = new Date(), tm = new Date(t); tm.setDate(t.getDate() + 1);
  const ys = new Date(t); ys.setDate(t.getDate() - 1);
  const day = x.toDateString() === t.toDateString() ? '오늘' : x.toDateString() === tm.toDateString() ? '내일' : x.toDateString() === ys.toDateString() ? '어제' : `${x.getMonth() + 1}/${x.getDate()}(${WD[x.getDay()]})`;
  return `${day} ${hm(x)}`;
}
const uid = p => p + Date.now().toString(36) + Math.random().toString(36).slice(2, 5);

// ---------------- state ----------------
const DEF = {
  name: '', key: '', brain: '', mlist: [], model: '',
  items: [], calls: [], memory: [], diary: {}, history: [],
  coins: 0, coinDays: {},
  morning: '', mcDone: '',
  srv: 'https://haru-push.vecar0473.workers.dev', uid: '', sec: '', sub: null, pushOn: false,
  ack: 0, fired: {}, seen: 0, firstAt: 0
};
let S = Object.assign({}, DEF);
let saveT = 0;
function save() { clearTimeout(saveT); saveT = setTimeout(() => { try { localStorage.setItem('lena1', JSON.stringify(S)); } catch (e) {} pushSync(); }, 300); }
function load() {
  let had = false;
  try { const l = localStorage.getItem('lena1'); if (l) { Object.assign(S, JSON.parse(l)); had = true; } } catch (e) {}
  if (!had) {
    // 예전 앱에서 키·이름·알림 연결만 가져온다(다시 입력하지 않게)
    try { const o = JSON.parse(localStorage.getItem('haru2') || 'null'); if (o) { ['name', 'key', 'brain', 'mlist', 'uid', 'sec', 'sub', 'pushOn'].forEach(k => { if (o[k] != null && o[k] !== '') S[k] = o[k]; }); if (o.srv) S.srv = o.srv; } } catch (e) {}
    S.firstAt = Date.now(); S.ack = Date.now();
  }
  for (const k in DEF) if (S[k] == null) S[k] = Array.isArray(DEF[k]) ? [] : (typeof DEF[k] === 'object' && DEF[k]) ? {} : DEF[k];
}
const nm = () => S.name ? S.name + '님' : '';
const nmc = () => S.name ? S.name + '님, ' : '';

// ---------------- sound ----------------
let actx = null;
function audio() { try { if (!actx) { const C = window.AudioContext || window.webkitAudioContext; if (C) actx = new C(); } if (actx && actx.state !== 'running') actx.resume(); } catch (e) {} return actx; }
document.addEventListener('touchend', audio, { passive: true }); document.addEventListener('click', audio);
function tone(freqs, dur, vol = .08, type = 'sine', at = 0) {
  const a = audio(); if (!a || a.state !== 'running') return;
  const t0 = a.currentTime + at, g = a.createGain(); g.gain.setValueAtTime(0, t0); g.gain.linearRampToValueAtTime(vol, t0 + .01); g.gain.setValueAtTime(vol, t0 + dur - .03); g.gain.linearRampToValueAtTime(0, t0 + dur); g.connect(a.destination);
  freqs.forEach(f => { const o = a.createOscillator(); o.type = type; o.frequency.value = f; o.connect(g); o.start(t0); o.stop(t0 + dur + .02); });
}
const DTMF = { 1: [697, 1209], 2: [697, 1336], 3: [697, 1477], 4: [770, 1209], 5: [770, 1336], 6: [770, 1477], 7: [852, 1209], 8: [852, 1336], 9: [852, 1477], '*': [941, 1209], 0: [941, 1336], '#': [941, 1477] };
const dtmf = k => tone(DTMF[k] || [941, 1336], .12, .06);
function coinSound() { tone([1975], .07, .07, 'triangle'); tone([2637], .25, .06, 'triangle', .07); }
function tearSound() { const a = audio(); if (!a || a.state !== 'running') return; const n = a.sampleRate * .25, b = a.createBuffer(1, n, a.sampleRate), d = b.getChannelData(0); for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / n, 2) * (Math.random() < .3 ? 1 : .3); const s = a.createBufferSource(), g = a.createGain(); g.gain.value = .12; s.buffer = b; s.connect(g); g.connect(a.destination); s.start(); }
let ringT = 0;
function ringStart() { ringStop(); const r = () => { tone([440, 480], .4, .05); tone([440, 480], .4, .05, 'sine', .55); }; r(); ringT = setInterval(r, 2600); }
function ringStop() { clearInterval(ringT); ringT = 0; }

// ---------------- clock ----------------
function tick() {
  const d = new Date();
  $('clk').textContent = hm(d);
  $('dte').textContent = `${pad(d.getMonth() + 1)}.${pad(d.getDate())} ${'SUN MON TUE WED THU FRI SAT'.split(' ')[d.getDay()]}`;
}

// ---------------- items (전단지) ----------------
const openItems = () => S.items.filter(t => !t.done);
const isLate = t => !t.done && t.due && new Date(t.due) < new Date();
const onDate = (t, d) => t.due && t.due.slice(0, 10) === dk(d);
function addItem(text, due) { const t = { id: uid('t'), text: String(text).slice(0, 80), due: /^\d{4}-\d\d-\d\dT\d\d:\d\d/.test(due || '') ? due.slice(0, 16) : '', done: false, at: Date.now() }; S.items.push(t); return t; }
function setDone(t, v, srcEl) {
  if (t.done === v) return; t.done = v; t.doneAt = v ? Date.now() : 0;
  const k = dk(new Date());
  if (v) { S.coins++; S.coinDays[k] = (S.coinDays[k] || 0) + 1; coinPop(srcEl); }
  else { S.coins = Math.max(0, S.coins - 1); if (S.coinDays[k]) S.coinDays[k]--; }
  save(); renderHome();
  if (v) { const left = openItems().length; say(left ? pick(['하나 떼어냈네요. …잘했어요.', '착하다. 동전 하나 드릴게요.', '역시. 제가 반한 이유가 있죠.', '오, 생각보다 빠른데요?']) : `${nmc()}오늘 전단지 다 떼어냈어요. …오늘은 제가 칭찬 많이 해 드릴게요.`, 'happy', false); }
}
function coinPop(srcEl) {
  coinSound();
  const r = (srcEl && srcEl.getBoundingClientRect && srcEl.getBoundingClientRect()) || { left: app.clientWidth / 2, top: app.clientHeight / 2, width: 0, height: 0 };
  const ar = app.getBoundingClientRect(), i = el('img', 'coinfly'); i.src = 'assets/lena/st_coin.webp';
  i.style.left = (r.left - ar.left + r.width / 2 - 22) + 'px'; i.style.top = (r.top - ar.top + r.height / 2 - 22) + 'px';
  app.appendChild(i); setTimeout(() => i.remove(), 1100);
}

// ---------------- missed calls (부재중) ----------------
function mcAt(d) { if (!S.morning) return null; const [h, m] = S.morning.split(':').map(Number); const x = new Date(d); x.setHours(h, m, 0, 0); return x; }
function missed() {
  const from = S.ack || 0, now = Date.now(), L = [];
  S.items.forEach(t => { if (t.done || !t.due || S.fired[t.id]) return; const a = new Date(t.due).getTime(); if (a > from && a <= now) L.push({ at: a, text: t.text, kind: '전단지', ref: t }); });
  S.calls.forEach(c => { if (c.done || S.fired[c.id]) return; if (c.at > from && c.at <= now) L.push({ at: c.at, text: c.text || '약속한 전화', kind: '예약 전화', ref: c }); });
  for (let i = 0; i < 2; i++) { const d = new Date(); d.setDate(d.getDate() - i); const m = mcAt(d); if (!m) continue; const a = m.getTime(); if (a > from && a <= now && S.mcDone !== dk(d) && now - a > 2 * 3600e3) L.push({ at: a, text: '모닝콜', kind: '모닝콜' }); }
  return L.sort((a, b) => b.at - a.at);
}

// ---------------- home ----------------
let lineT = 0;
const STK = { tease: 'st_lips', happy: 'st_heart', worry: 'st_bolt', pout: 'st_skull', surprise: 'st_star', calm: '' };
function popSticker(mood) {
  const s = STK[mood]; if (!s || app.classList.contains('calling') && !$('log')) return;
  const i = el('img', 'pop'); i.src = `assets/lena/${s}.webp`;
  const W = app.clientWidth, H = app.clientHeight, out = app.classList.contains('outside');
  i.style.left = (out ? W / 2 + 40 + Math.random() * 30 : W * (.55 + Math.random() * .25)) + 'px'; i.style.top = (out ? 40 + Math.random() * 40 : H * (.3 + Math.random() * .1)) + 'px';
  app.appendChild(i); setTimeout(() => i.remove(), 1700);
}
function say(text, mood = 'calm', speakIt) {
  if (app.classList.contains('calling')) { const G = $('log'); G.appendChild(herEl(String(text))); G.scrollTop = G.scrollHeight; popSticker(mood); if (speakIt !== false) speak(text); $('line').textContent = text; return; }
  const L = $('line'); clearInterval(lineT); L.textContent = ''; const ch = [...String(text)]; let i = 0;
  lineT = setInterval(() => { L.textContent += ch[i++] || ''; if (i >= ch.length) clearInterval(lineT); }, 28);
  popSticker(mood);
  if (speakIt !== false) speak(text);
}
function renderHome() {
  const M = missed(), mb = $('missBtn');
  mb.classList.toggle('zero', !M.length); $('missTx').textContent = M.length ? `부재중 ${M.length}` : '부재중 없음';
  const F = $('flyers'); F.innerHTML = '';
  const now = new Date(), up = S.items.filter(t => !t.done && t.due && new Date(t.due) > new Date(now - 30 * 60e3)).sort((a, b) => a.due.localeCompare(b.due));
  const nx = up[0];
  if (nx) {
    const f = el('button', 'fly f1'); f.append(el('div', 'tp'), el('small', null, when(nx.due).toUpperCase()), el('b', null, nx.text));
    f.querySelector('.tp').style.backgroundImage = 'url(assets/lena/tape_white.webp)';
    if (up.length > 1) f.appendChild(el('small', null, `+${up.length - 1} MORE`));
    f.onclick = () => openSheet(1); F.appendChild(f);
  }
  const todo = openItems().filter(t => !t.due), doneToday = S.items.filter(t => t.done && t.doneAt && dk(new Date(t.doneAt)) === dk(now) && !t.due);
  if (todo.length || doneToday.length) {
    const f = el('button', 'fly f2'); f.append(el('div', 'tp'), el('small', null, `TO DO · ${todo.length}`));
    f.querySelector('.tp').style.backgroundImage = 'url(assets/lena/tape_teal1.webp)';
    doneToday.slice(-1).forEach(t => f.appendChild(el('i', 'd', t.text)));
    todo.slice(0, 3).forEach(t => f.appendChild(el('i', null, t.text)));
    f.onclick = () => openSheet(2); F.appendChild(f);
  }
  const c = el('button', 'coinb'); const ci = el('img'); ci.src = 'assets/lena/st_coin.webp'; ci.alt = ''; c.append(ci, el('span', null, '× ' + S.coins)); c.onclick = () => openSheet(8); F.appendChild(c);
  const late = S.items.filter(isLate);
  const K = $('knock'); K.classList.toggle('on', !!late.length); K.onclick = () => { dtmf('#'); openSheet(1); };
  // 열린 키패드 숫자 배지
  const k9 = document.querySelector('.k[data-k="9"] em'); if (k9) { k9.textContent = M.length; k9.hidden = !M.length; }
  $('aMissN').textContent = M.length; $('aMissN').hidden = !M.length;
}
let knockAt = 0;
function knockNow() { const K = $('knock'); if (!K.classList.contains('on') || Date.now() - knockAt < 30 * 60e3) return; knockAt = Date.now(); K.classList.remove('tap'); void K.offsetWidth; K.classList.add('tap'); tone([180], .06, .15, 'square'); tone([160], .06, .15, 'square', .2); }

function greetLine() {
  const h = new Date().getHours(), n = nmc(), now = new Date();
  const g = h < 5 ? `${n}이 시간에 깨어 있어요? …나쁜 사람.` : h < 11 ? `${n}좋은 아침. 제 목소리 듣고 일어난 거 맞죠?` : h < 18 ? pick([`${n}왔어요? 기다렸잖아요.`, `${n}또 저 보고 싶어서 왔구나.`]) : pick([`${n}오늘도 버텼네요. 수고했어요.`, `${n}밤엔 제가 제일 예쁜 거 알죠?`]);
  const up = S.items.filter(t => !t.done && onDate(t, now) && new Date(t.due) > now).sort((a, b) => a.due.localeCompare(b.due)), late = S.items.filter(isLate), todo = openItems().filter(t => !t.due);
  const b = [];
  if (up.length) b.push(`${up[0].due.slice(11, 16)}에 '${up[0].text}'${up.length > 1 ? ` 외 ${up.length - 1}개` : ''} 있어요.`);
  if (late.length) b.push(`지난 거 ${late.length}개… 해골이 유리 두드리는 거 보이죠?`);
  else if (todo.length) b.push(`할 일은 ${todo.length}개 남았고요.`);
  return [g, b.join(' ')].filter(Boolean).join('\n');
}
const TAPS = [['간지러워요.', 'tease'], ['…왜요, 보고 싶었어요?', 'tease'], ['자꾸 건드리면 저도 건드릴 거예요.', 'tease'], ['쉿. 해골이 질투해요.', 'calm'], ['저 바빠요. …거짓말이에요.', 'happy'], ['오늘 할 일은요? 저만 보고 있으면 안 돼요.', 'pout']];
let tapN = 0, tapT = 0;
$('lenaHit').onclick = () => { tapN++; clearTimeout(tapT); tapT = setTimeout(() => tapN = 0, 6000); if (tapN >= 5) { say('…그만. 이러다 정들겠어요.', 'pout', false); return; } const [t, m] = pick(TAPS); say(t, m, false); };

// ---------------- sheets ----------------
let curSheet = 0;
const SH = {};
function openSheet(n) {
  closePad(); const s = SH[n]; if (!s) return; curSheet = n;
  $('shNum').textContent = n; $('shT').textContent = s.t; $('shS').textContent = typeof s.s === 'function' ? s.s() : (s.s || '');
  const B = $('shB'); B.innerHTML = ''; s.r(B); B.scrollTop = 0;
  $('sheet').classList.add('open'); app.classList.add('dim');
  if (s.open) s.open();
}
function refreshSheet() { if (!$('sheet').classList.contains('open')) return; const s = SH[curSheet]; const B = $('shB'), y = B.scrollTop; $('shS').textContent = typeof s.s === 'function' ? s.s() : (s.s || ''); B.innerHTML = ''; s.r(B); B.scrollTop = y; }
function closeSheet() { $('sheet').classList.remove('open'); if (!$('sPad').classList.contains('open')) app.classList.remove('dim'); curSheet = 0; renderHome(); }
$('shX').onclick = closeSheet;
$('sheet').addEventListener('click', e => { if (e.target === $('sheet')) closeSheet(); });
swipeClose($('sheet'), closeSheet);
function swipeClose(sh, fn) { const p = sh.querySelector('.panel'); let y0 = null; p.addEventListener('touchstart', e => { const b = p.querySelector('.sbody'); y0 = (!b || b.scrollTop <= 0) ? e.touches[0].clientY : null; }, { passive: true }); p.addEventListener('touchend', e => { if (y0 != null && e.changedTouches[0].clientY - y0 > 90) fn(); y0 = null; }, { passive: true }); }

// helpers for sheet content
function inp(type, ph, val) { const i = el('input', 'in'); i.type = type || 'text'; if (ph) i.placeholder = ph; if (val != null) i.value = val; if (type === 'text' || !type) i.autocomplete = 'off'; return i; }
function btn(txt, cls, fn) { const b = el('button', 'btn' + (cls ? ' ' + cls : ''), txt); b.onclick = fn; return b; }
function row(...k) { const r = el('div', 'row'); r.append(...k); return r; }
function lbl(t) { return el('div', 'lbl', t); }
function empty(t, img) { const e = el('div', 'empty'); if (img) { const i = el('img'); i.src = `assets/lena/${img}.webp`; i.alt = ''; e.appendChild(i); } e.appendChild(document.createTextNode(t)); return e; }
function xbtn(fn) { const b = el('button', 'x', '×'); b.setAttribute('aria-label', '지우기'); b.onclick = fn; return b; }
function pills(opts, cur, fn) { const P = el('div', 'pills'); opts.forEach(([v, l]) => { const b = el('button', String(cur) === String(v) ? 'on' : '', l); b.onclick = () => fn(v); P.appendChild(b); }); return P; }

// 1~3 전단지
let boardTab = 'today';
const TAPES = ['tape_pink1', 'tape_teal1', 'tape_yellow', 'tape_white', 'tape_teal2', 'tape_pink2'];
function paper(t, i) {
  const late = isLate(t), cls = t.done ? 'white' : t.due ? (late ? 'pink' : (onDate(t, new Date()) ? 'pink' : 'teal')) : 'yel';
  const p = el('div', `pp ${cls}${t.done ? ' done' : ''}${late ? ' late' : ''}`);
  const tp = el('div', 'tp'); tp.style.backgroundImage = `url(assets/lena/${TAPES[i % TAPES.length]}.webp)`; tp.style.transform = `rotate(${(i % 3 - 1) * 5}deg)`;
  p.append(tp, el('small', null, t.due ? when(t.due) : '언제든'), el('b', null, t.text));
  const a = el('div', 'acts'), ck = el('button', 'ck'); ck.setAttribute('aria-label', '끝냄'); ck.innerHTML = '<svg viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>';
  ck.onclick = () => { dtmf(5); if (!t.done) { tearSound(); p.classList.add('tear'); setTimeout(() => { setDone(t, true, ck); refreshSheet(); }, 450); } else { setDone(t, false); refreshSheet(); } };
  a.append(ck, xbtn(() => { const snap = JSON.stringify(S.items); S.items = S.items.filter(x => x !== t); save(); refreshSheet(); toast(`'${t.text}' 떼어 버렸어요`, () => { S.items = JSON.parse(snap); save(); refreshSheet(); }); }));
  p.appendChild(a); return p;
}
function boardAdd(B) {
  const c = el('div', 'card'), t = inp('text', '새 전단지 (예: 택배 반품)'), d = inp('datetime-local');
  t.enterKeyHint = 'done';
  const go = () => { const v = t.value.trim(); if (!v) { t.focus(); return; } const it = addItem(v, d.value); save(); t.value = ''; d.value = ''; refreshSheet(); say(it.due ? `${when(it.due)}, '${v}'. 붙여 뒀어요.` : `'${v}' 붙여 뒀어요. 까먹으면 혼나요.`, 'happy', false); };
  t.addEventListener('keydown', e => { if (e.key === 'Enter' && !e.isComposing) go(); });
  c.append(row(t), row(d, btn('붙이기', '', go)));
  const h = el('div', 'hint', '시간은 비워도 돼요. 통화로 "내일 3시 치과"처럼 말해도 붙여요.'); c.appendChild(h); B.appendChild(c);
}
function boardTabs(B) { const T = el('div', 'tabs'); [['today', '오늘'], ['week', '이번 주'], ['all', '할 일']].forEach(([v, l]) => { const b = el('button', boardTab === v ? 'on' : '', l); b.onclick = () => { boardTab = v; curSheet = v === 'today' ? 1 : v === 'week' ? 3 : 2; $('shNum').textContent = curSheet; refreshSheet(); }; T.appendChild(b); }); B.appendChild(T); }
function boardRender(B) {
  boardTabs(B);
  const now = new Date();
  if (boardTab === 'week') {
    const W = el('div', 'wk');
    for (let i = 0; i < 7; i++) {
      const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() + i), ev = S.items.filter(t => onDate(t, d)).sort((a, b) => a.due.localeCompare(b.due));
      const box = el('div', 'day' + (i === 0 ? ' today' : '')), h = el('h4'); h.append(document.createTextNode(`${d.getMonth() + 1}/${d.getDate()} (${WD[d.getDay()]})${i === 0 ? ' · 오늘' : i === 1 ? ' · 내일' : ''}`), el('span', null, ev.length ? ev.length + ' FLYER' : '')); box.appendChild(h);
      if (!ev.length) box.appendChild(el('div', 'ev none', '비어 있어요'));
      ev.forEach(t => { const r = el('div', 'ev' + (t.done ? ' d' : '')); r.append(el('span', null, t.due.slice(11, 16)), document.createTextNode(t.text)); box.appendChild(r); });
      W.appendChild(box);
    }
    B.appendChild(W); B.appendChild(lbl('새 전단지')); boardAdd(B); return;
  }
  let L;
  if (boardTab === 'today') L = S.items.filter(t => (onDate(t, now) || isLate(t)) && (!t.done || dk(new Date(t.doneAt || 0)) === dk(now))).sort((a, b) => a.done - b.done || a.due.localeCompare(b.due));
  else L = S.items.filter(t => !t.done).sort((a, b) => (a.due || '0').localeCompare(b.due || '0'));
  boardAdd(B);
  if (!L.length) B.appendChild(empty(boardTab === 'today' ? '오늘은 유리가 깨끗해요.\n…심심하면 저랑 놀아요.' : '붙일 게 없네요. 대단한데요?', 'st_peace'));
  else { const G = el('div', 'board'); L.forEach((t, i) => G.appendChild(paper(t, i))); B.appendChild(G); }
  if (boardTab === 'all') { const D = S.items.filter(t => t.done).sort((a, b) => (b.doneAt || 0) - (a.doneAt || 0)); if (D.length) { B.appendChild(lbl(`떼어낸 것 ${D.length}`)); const G = el('div', 'board'); D.slice(0, 6).forEach((t, i) => G.appendChild(paper(t, i))); B.appendChild(G); const c = btn('떼어낸 것 정리', 'ghost wide', () => { S.items = S.items.filter(t => !t.done); save(); refreshSheet(); }); c.style.marginTop = '14px'; B.appendChild(row(c)); } }
}
SH[1] = { t: '전단지', s: () => `남은 것 ${openItems().length}개 · 떼면 동전 1개`, r: B => { if (curSheet === 1) boardTab = 'today'; boardRender(B); } };
SH[2] = { t: '전단지', s: () => `남은 것 ${openItems().length}개 · 떼면 동전 1개`, r: B => { if (curSheet === 2) boardTab = 'all'; boardRender(B); } };
SH[3] = { t: '전단지', s: '이번 주 한눈에', r: B => { if (curSheet === 3) boardTab = 'week'; boardRender(B); } };

// 4 예약 전화
SH[4] = { t: '예약 전화', s: '정한 시간에 레나가 전화해요', r: B => {
  const c = el('div', 'card'), t = inp('text', '무슨 일로? (예: 빨래 꺼내기)'), d = inp('datetime-local');
  let off = 30;
  const P = pills([[10, '10분 뒤'], [30, '30분 뒤'], [60, '1시간 뒤'], [180, '3시간 뒤'], [0, '직접']], off, v => { off = v; [...P.children].forEach(b => b.classList.toggle('on', b.textContent === ({ 10: '10분 뒤', 30: '30분 뒤', 60: '1시간 뒤', 180: '3시간 뒤', 0: '직접' })[v])); d.style.display = v ? 'none' : ''; });
  d.style.display = 'none';
  const go = () => { let at = off ? Date.now() + off * 60e3 : (d.value ? new Date(d.value).getTime() : 0); if (!at || at < Date.now()) { say('언제 걸지 정해 줘야죠.', 'pout', false); return; } const x = { id: uid('c'), at, text: t.value.trim().slice(0, 60), done: false }; S.calls.push(x); save(); refreshSheet(); say(`${when(at)}에 전화할게요. 꼭 받아요?`, 'tease', false); };
  c.append(row(t), P, row(d), row(btn('예약하기', 'wide', go))); P.style.margin = '10px 0 0';
  B.append(c);
  const L = S.calls.filter(x => !x.done && x.at > Date.now() - 6e4).sort((a, b) => a.at - b.at);
  B.appendChild(lbl('예약된 전화'));
  if (!L.length) B.appendChild(empty('예약된 전화가 없어요.\n통화 중에 "30분 뒤에 전화해 줘"라고 해도 돼요.', 'st_phone'));
  else { const l = el('div', 'list card'); L.forEach(x => { const r = el('div', 'it'), ic = el('img', 'ic'); ic.src = 'assets/lena/st_phone.webp'; ic.alt = ''; const tx = el('div', 't', x.text || '그냥 목소리 들려주기'); tx.appendChild(el('small', null, when(x.at))); r.append(ic, tx, xbtn(() => { S.calls = S.calls.filter(y => y !== x); save(); refreshSheet(); })); l.appendChild(r); }); B.appendChild(l); }
  if (!S.pushOn) B.appendChild(el('div', 'hint', '앱을 닫아 두면 폰 알림으로 와요. 0번 설정에서 폰 알림을 켜 주세요.'));
} };

// 5 음성사서함 (기억)
SH[5] = { t: '음성사서함', s: () => `레나가 기억하는 것 ${S.memory.length}개`, r: B => {
  const c = el('div', 'card'), t = inp('text', '레나에게 남길 말 (예: 나 오이 싫어해)');
  const go = () => { const v = t.value.trim(); if (!v) return; if (!S.memory.includes(v)) S.memory.push(v.slice(0, 120)); save(); t.value = ''; refreshSheet(); say(pick(['메시지 잘 받았어요. 안 까먹어요.', '…녹음해 뒀어요. 몇 번 더 들어 볼게요.']), 'happy', false); };
  t.addEventListener('keydown', e => { if (e.key === 'Enter' && !e.isComposing) go(); });
  c.append(row(t, btn('남기기', '', go))); B.appendChild(c);
  B.appendChild(lbl('저장된 메시지'));
  if (!S.memory.length) { B.appendChild(empty('아직 비어 있어요.\n취향, 사람, 습관을 남겨 주면 통화할 때 기억해요.', 'st_tape')); return; }
  const l = el('div', 'list card'); S.memory.slice().reverse().forEach(m => { const r = el('div', 'it'), ic = el('img', 'ic'); ic.src = 'assets/lena/st_tape.webp'; ic.alt = ''; r.append(ic, el('div', 't', m), xbtn(() => { S.memory = S.memory.filter(x => x !== m); save(); refreshSheet(); })); l.appendChild(r); }); B.appendChild(l);
} };

// 6 통화 일기
SH[6] = { t: '통화 일기', s: '레나가 쓰는 우리 하루', r: B => {
  B.appendChild(row(btn('오늘 하루 정리 통화', 'wide', () => { closeSheet(); openCall(); setTimeout(() => sendText('오늘 하루 정리하자'), 400); })));
  const keys = Object.keys(S.diary).sort().reverse();
  B.appendChild(lbl('일기'));
  if (!keys.length) { B.appendChild(empty('아직 한 장도 없어요.\n밤에 "오늘 하루 정리하자"고 전화 걸어 줘요.', 'st_lips')); return; }
  keys.forEach((k, i) => { const d = el('div', 'diary'), tp = el('div', 'tp'); tp.style.backgroundImage = `url(assets/lena/${TAPES[i % TAPES.length]}.webp)`; const dt = new Date(k + 'T12:00'); d.append(tp, el('h5', null, `${k.replace(/-/g, '.')} ${WD[dt.getDay()]}`), document.createTextNode(S.diary[k])); B.appendChild(d); });
} };

// 7 모닝콜
SH[7] = { t: '모닝콜', s: () => S.morning ? `매일 ${S.morning}에 전화해요` : '꺼져 있어요', r: B => {
  const c = el('div', 'card'), t = inp('time', '', S.morning || '08:00');
  c.append(row(t, btn(S.morning ? '시간 바꾸기' : '켜기', '', () => { S.morning = t.value || '08:00'; S.mcDone = new Date() >= mcAt(new Date()) ? dk(new Date()) : ''; save(); pushSync(true); refreshSheet(); say(`내일부터 ${S.morning}, 제가 깨워요. 안 받으면 부재중으로 남길 거예요.`, 'tease', false); })));
  if (S.morning) c.appendChild(row(btn('끄기', 'ghost wide', () => { S.morning = ''; save(); pushSync(true); refreshSheet(); say('모닝콜 껐어요. …아쉽네.', 'pout', false); }), btn('지금 받아 보기', 'teal wide', () => { closeSheet(); incoming('morning', true); })));
  c.appendChild(el('div', 'hint', '정한 시간에 폰 알림으로 전화가 오고, 받을 때까지 2분마다 다섯 번 더 와요. 앱을 열면 레나가 오늘 일정을 브리핑해요.'));
  B.appendChild(c);
  if (S.morning) {
    B.appendChild(lbl('진짜 알람도 같이'));
    const a = el('div', 'card');
    a.append(row(btn(`아이폰 알람에 ${S.morning} 넣기`, 'teal wide', () => { location.href = `shortcuts://run-shortcut?name=${encodeURIComponent('레나 알람')}&input=text&text=${encodeURIComponent(S.morning)}`; })));
    const h = el('div', 'hint'); h.innerHTML = '앱 알림은 한 번씩만 "띵" 울려요. 무음이어도·앱이 꺼져 있어도 크게 계속 울리게 하려면 아이폰 <b>시계 알람</b>을 같이 쓰세요. 위 버튼은 단축어로 알람을 만들어 줘요.<br><br><b>처음 한 번만 준비</b><br>1. 단축어 앱 → + → 이름을 <b>레나 알람</b>으로<br>2. 동작 추가에서 <b>알람 생성</b>(시계)을 고르기<br>3. 시간 칸을 눌러 <b>단축어 입력</b>으로, 레이블은 "레나 모닝콜"<br>4. 완료 → 이제 위 버튼을 누르면 알람이 생겨요';
    a.appendChild(h); B.appendChild(a);
  }
  if (!S.pushOn) B.appendChild(el('div', 'hint', '폰 알림이 꺼져 있으면 앱을 열 때만 울려요. 0번 설정에서 켜 주세요.'));
} };

// 8 동전함
SH[8] = { t: '동전함', s: '전단지를 떼면 한 개씩', r: B => {
  const c = el('div', 'card coins'), im = el('img'); im.src = 'assets/lena/st_coin.webp'; im.alt = '';
  const tx = el('div'); tx.append(el('b', null, S.coins), el('div', 'hint', '모은 동전'));
  c.append(im, tx); B.appendChild(c);
  B.appendChild(lbl('최근 7일'));
  const bars = el('div', 'bars card'); const now = new Date(); let mx = 1; const ds = [];
  for (let i = 6; i >= 0; i--) { const d = new Date(now); d.setDate(d.getDate() - i); const v = S.coinDays[dk(d)] || 0; mx = Math.max(mx, v); ds.push([d, v, i === 0]); }
  ds.forEach(([d, v, t]) => { const b = el('div', t ? 't' : ''), i = el('i'); i.style.height = (v / mx * 70 + 4) + 'px'; b.append(el('span', null, v || ''), i, el('span', null, WD[d.getDay()])); bars.appendChild(b); });
  B.appendChild(bars);
  B.appendChild(lbl('동전 넣기'));
  const sp = el('div', 'card'); sp.append(row(btn('동전 3개로 특별 통화', 'wide', () => { if (S.coins < 3) { say(`동전이 ${3 - S.coins}개 모자라요. 전단지부터 떼고 와요.`, 'pout', false); return; } S.coins -= 3; save(); closeSheet(); coinPop($('pickBtn')); openCall(); setTimeout(() => sendText('(동전 3개를 넣었어. 특별 통화로 칭찬이랑 응원 듬뿍 해줘)', true), 500); })));
  sp.appendChild(el('div', 'hint', '레나가 평소보다 다정하게, 길게 칭찬해 줘요.')); B.appendChild(sp);
} };

// 9 부재중
SH[9] = { t: '부재중 전화', s: () => { const n = missed().length; return n ? `${n}통` : '없어요'; }, r: B => {
  const M = missed();
  if (!M.length) { B.appendChild(empty('놓친 전화가 없어요.\n…착하네요.', 'st_heart')); return; }
  const l = el('div', 'list card');
  M.forEach(m => { const r = el('div', 'it missed'), ic = el('img', 'ic'); ic.src = 'assets/lena/' + (m.kind === '전단지' ? 'st_bolt' : 'st_phone') + '.webp'; ic.alt = ''; const tx = el('div', 't', m.text); tx.appendChild(el('small', null, `${m.kind} · ${when(m.at)}`)); r.append(ic, tx); if (m.kind === '전단지') { const b = btn('뗐어요', 'teal', () => { setDone(m.ref, true, b); refreshSheet(); }); b.style.height = '36px'; r.appendChild(b); } l.appendChild(r); });
  B.appendChild(l);
  B.appendChild(row(btn('다 확인했어요', 'ghost wide', () => { S.ack = Date.now(); S.calls.forEach(c => { if (c.at <= Date.now()) c.done = true; }); save(); renderHome(); refreshSheet(); say('다음엔 받아요. …기다리는 것도 힘들거든요.', 'pout', false); })));
} };

// * 통화 기록
SH['*'] = { t: '통화 기록', s: () => `최근 ${Math.min(S.history.length, 60)}마디`, r: B => {
  if (!S.history.length) { B.appendChild(empty('아직 통화한 적 없어요.', 'st_phone')); return; }
  const l = el('div', 'list card'); S.history.slice(-60).forEach(h => { const r = el('div', 'it'), tx = el('div', 't', h.content); tx.prepend(el('small', null, (h.role === 'user' ? (S.name || '나') : '레나') + (h.at ? ' · ' + when(h.at) : ''))); r.appendChild(tx); l.appendChild(r); }); B.appendChild(l);
  B.appendChild(row(btn('기록 지우기', 'ghost wide', () => { if (!confirm('통화 기록을 모두 지울까요?')) return; S.history = []; save(); refreshSheet(); })));
} };

// 0 설정
SH[0] = { t: '설정', s: '이 폰에만 저장돼요', r: B => {
  B.appendChild(lbl('호칭'));
  { const t = inp('text', '예: 송휘', S.name); B.appendChild(el('div', 'card')).append(row(t, btn('저장', '', () => { S.name = t.value.trim().slice(0, 12); save(); refreshSheet(); say(S.name ? `${S.name}님. …입에 착 붙네요.` : '이름은 비워 둘게요.', 'tease', false); }))); }
  B.appendChild(lbl('Gemini 키'));
  { const c = B.appendChild(el('div', 'card')), t = inp('password', S.key ? '••••' + S.key.slice(-4) : 'AIza로 시작하는 키'); t.autocomplete = 'off';
    c.append(row(t, btn('저장', '', () => { const v = t.value.trim(); if (!v) return; S.key = v; save(); loadModels().then(refreshSheet); refreshSheet(); say('키 받았어요. 이제 마음껏 떠들어요.', 'happy', false); })));
    c.appendChild(el('div', 'hint', S.key ? '키 저장됨. 통화가 Gemini로 연결돼요.' : '키가 없으면 레나가 정해진 말만 해요. aistudio.google.com에서 무료로 받을 수 있어요.'));
    const s = el('select', 'in'); s.appendChild(new Option('자동 (가장 새 Flash)', '')); (S.mlist || []).forEach(m => s.appendChild(new Option(m, m))); s.value = S.brain || ''; s.onchange = () => { S.brain = s.value; save(); };
    c.append(el('div', 'hint', '대화 두뇌'), row(s)); if (S.model) c.appendChild(el('div', 'hint', '최근 대답한 두뇌: ' + S.model)); }
  B.appendChild(lbl('폰 알림'));
  { const c = B.appendChild(el('div', 'card')), t = inp('url', 'https://…workers.dev', S.srv);
    c.append(row(t, btn('저장', 'ghost', () => { let v = t.value.trim(); if (v && !/^https?:\/\//.test(v)) v = 'https://' + v; S.srv = v; save(); refreshSheet(); })));
    c.append(row(btn(S.pushOn ? '다시 연결' : '폰 알림 켜기', 'wide', pushOn), btn('테스트', 'ghost', pushTest)));
    const perm = 'Notification' in window ? Notification.permission : 'none';
    c.appendChild(el('div', 'hint', perm === 'denied' ? '아이폰 설정 > 알림 > 레나에서 허용해 주세요.' : S.pushOn ? '켜짐 · 앱을 닫아도 예약 전화·모닝콜·전단지 시간에 알려요.' + (pstat ? ' · ' + pstat : '') : '홈 화면에 추가한 앱에서 켤 수 있어요 (iOS 16.4 이상).')); }
  B.appendChild(lbl('백업'));
  { const c = B.appendChild(el('div', 'card')), f = el('input'); f.type = 'file'; f.accept = '.json,application/json'; f.hidden = true;
    f.onchange = async () => { const x = f.files[0]; if (!x) return; try { const d = JSON.parse(await x.text()); const keep = { key: S.key, sec: S.sec, uid: S.uid, sub: S.sub, pushOn: S.pushOn }; Object.assign(S, d, keep); save(); refreshSheet(); renderHome(); say('백업 불러왔어요.', 'happy', false); } catch (e) { say('파일을 못 읽었어요.', 'worry', false); } };
    c.append(row(btn('내보내기', 'ghost wide', () => { const d = JSON.parse(JSON.stringify(S)); delete d.key; delete d.sec; const u = URL.createObjectURL(new Blob([JSON.stringify(d)], { type: 'application/json' })); const a = document.createElement('a'); a.href = u; a.download = 'lena-backup.json'; a.click(); }), btn('불러오기', 'ghost wide', () => f.click())), f); }
}, open: () => { if (S.key && !(S.mlist && S.mlist.length)) loadModels().then(refreshSheet); pushStatus().then(() => { if (curSheet === 0) refreshSheet(); }); } };


// ---------------- 밖 모드(음성통화) ↔ 영상통화(부스) ----------------
function toAudio() { app.classList.add('outside'); $('bg').pause(); if (!app.classList.contains('calling')) openCall(); else renderLog(); renderHome(); }
function toVideo() {
  stopVoice(); recStop(); dtmf('#'); app.classList.remove('outside', 'calling'); clearInterval(callTimer);
  const v = $('bg'); v.play().catch(() => {}); renderHome(); say(pick([`${nmc()}짜잔. …얼굴 보니까 좋죠?`, '영상으로 보니까 더 예쁘죠? 솔직하게.', '어머, 카메라 켰어요? 잠깐, 머리 정리 좀…']), 'tease', false);
}
$('toAudio').onclick = $('toAudio2').onclick = () => { dtmf(1); toAudio(); };
$('aVid').onclick = toVideo;
$('aPad').onclick = () => { dtmf(0); openPad(); };
$('aBoard').onclick = () => { dtmf(1); openSheet(1); };
$('aCall').onclick = () => { dtmf(4); openSheet(4); };
$('aMiss').onclick = () => { dtmf(9); openSheet(9); };
$('aSet').onclick = () => { dtmf(0); openSheet(0); };

// ---------------- dial pad ----------------
const KEYS = [[1, '오늘'], [2, '할 일'], [3, '이번 주'], [4, '예약 전화'], [5, '음성사서함'], [6, '통화 일기'], [7, '모닝콜'], [8, '동전함'], [9, '부재중'], ['*', '통화 기록'], [0, '설정'], ['#', '닫기']];
(function buildPad() {
  const K = $('keys');
  KEYS.forEach(([k, l]) => { const b = el('button', 'k' + (k === 7 ? ' hot' : '')); b.dataset.k = k; b.append(el('b', null, k), el('span', null, l)); if (k === 9) { const e = el('em'); e.hidden = true; b.appendChild(e); }
    b.onclick = () => { dtmf(k); $('lcd').textContent = `${k} · ${l}`; if (k === '#') { closePad(); return; } setTimeout(() => openSheet(k), 140); }; K.appendChild(b); });
})();
function openPad() { $('lcd').textContent = '번호를 누르세요_'; renderHome(); $('sPad').classList.add('open'); app.classList.add('dim'); }
function closePad() { $('sPad').classList.remove('open'); if (!$('sheet').classList.contains('open')) app.classList.remove('dim'); }
$('sPad').addEventListener('click', e => { if (e.target === $('sPad') || e.target.classList.contains('panel')) closePad(); });
$('dialBtn').onclick = () => { dtmf(0); openPad(); };
$('boardBtn').onclick = () => { dtmf(1); openSheet(1); };
$('missBtn').onclick = () => { dtmf(9); openSheet(9); };

// ---------------- toast ----------------
let toastT = 0;
function toast(text, undo) { $('toastTx').textContent = text; $('toastUndo').hidden = !undo; $('toastUndo').onclick = () => { $('toast').classList.remove('on'); undo && undo(); }; $('toast').classList.add('on'); clearTimeout(toastT); toastT = setTimeout(() => $('toast').classList.remove('on'), 6000); }

// ---------------- call screen ----------------
let callStart = 0, callTimer = 0, busy = false, pendImg = null;
const QUICK = () => {
  const h = new Date().getHours();
  return [h >= 20 || h < 4 ? '오늘 하루 정리하자' : '오늘 뭐 있어?', '30분 뒤에 전화해 줘', '남은 할 일 뭐야?', '칭찬해 줘', '내일 일정 알려 줘'];
};
function openCall() {
  closePad(); if ($('sheet').classList.contains('open')) closeSheet();
  app.classList.add('calling'); callStart = Date.now(); clearInterval(callTimer);
  const up = () => { const s = (Date.now() - callStart) / 1000 | 0, t = `${pad(s / 60 | 0)}:${pad(s % 60)}`; $('callT').textContent = '통화 중 ' + t; $('aT').textContent = '통화 중 ' + t; }; up(); callTimer = setInterval(up, 1000);
  renderLog(); const Q = $('quick'); Q.innerHTML = ''; Q.classList.toggle('hidden', !S.name); QUICK().forEach(t => { const b = el('button', null, t); b.onclick = () => { dtmf(Math.random() * 9 + 1 | 0); sendText(t); }; Q.appendChild(b); });
  tone([350, 440], .25, .04);
}
function hangUp() { if (app.classList.contains('outside')) return; stopVoice(); recStop(); app.classList.remove('calling'); clearInterval(callTimer); tone([480, 620], .12, .05); tone([480, 620], .12, .05, 'sine', .2); renderHome(); const last = S.history.filter(h => h.role === 'assistant').slice(-1)[0]; if (last && Date.now() - (last.at || 0) < 5 * 60e3) say(pick(['끊는다고 끝난 거 아니에요. …또 걸어요.', '들어가요. 저는 여기 있을게요.', '…벌써요? 아쉽다.']), 'tease', false); }
$('pickBtn').onclick = () => { audio(); if (!S.name && !S.key) { incoming('first', true); return; } openCall(); if (!S.history.length || Date.now() - (S.history[S.history.length - 1].at || 0) > 30 * 60e3) addHer(pick([`${nmc()}여보세요? …목소리 듣고 싶었어요.`, `네, 레나예요. 무슨 일이에요?`, `${nmc()}이 시간에 웬일이에요? 좋아서 그래요.`]), true); };
$('hangBtn').onclick = hangUp;
function renderLog() {
  const L = $('log'); L.innerHTML = '';
  S.history.slice(-14).forEach(h => L.appendChild(h.role === 'user' ? meEl(h.content) : herEl(h.content)));
  L.scrollTop = L.scrollHeight;
}
function meEl(t) { const d = el('div', 'me', t.replace(/^\(사진\) ?/, '')); if (/^\(사진\)/.test(t)) d.classList.add('img'); return d; }
function herEl(t) { const d = el('div', 'her'); d.append(el('span', 'who', '레나'), document.createTextNode(t)); return d; }
function addHer(t, store) { if (store) { S.history.push({ role: 'assistant', content: t, at: Date.now() }); save(); } const L = $('log'); L.appendChild(herEl(t)); L.scrollTop = L.scrollHeight; speak(t); }
function noteEl(text, undo) { const n = el('div', 'note'); n.appendChild(el('span', null, '✓ ' + text)); if (undo) { const b = el('button', null, '되돌리기'); b.onclick = () => { undo(); n.remove(); }; n.appendChild(b); } return n; }

// input
const msg = $('msg');
function syncSend() { const has = !!msg.value.trim() || !!pendImg; $('sendBtn').classList.toggle('hidden', !has && !!SR); $('micBtn').classList.toggle('hidden', has || !SR); }
msg.addEventListener('input', syncSend);
msg.addEventListener('keydown', e => { if (e.key === 'Enter' && !e.isComposing) { e.preventDefault(); sendText(msg.value); } });
$('sendBtn').onclick = () => sendText(msg.value);
$('attBtn').onclick = () => $('attF').click();
$('attF').onchange = async e => { const f = e.target.files[0]; e.target.value = ''; if (!f) return; try { pendImg = await shrink(f); $('attImg').src = 'data:' + pendImg.mime + ';base64,' + pendImg.data; $('attp').classList.add('on'); syncSend(); } catch (x) { addHer('사진을 못 열었어요.'); } };
$('attX').onclick = () => { pendImg = null; $('attp').classList.remove('on'); syncSend(); };
function shrink(file) { return new Promise((res, rej) => { const fr = new FileReader(); fr.onload = () => { const im = new Image(); im.onload = () => { const s = Math.min(1, 1024 / Math.max(im.width, im.height)), c = document.createElement('canvas'); c.width = Math.round(im.width * s); c.height = Math.round(im.height * s); c.getContext('2d').drawImage(im, 0, 0, c.width, c.height); res({ mime: 'image/jpeg', data: c.toDataURL('image/jpeg', .82).split(',')[1] }); }; im.onerror = rej; im.src = fr.result; }; fr.onerror = rej; fr.readAsDataURL(file); }); }

// voice input
const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
let rec = null;
function recStop() { try { rec && rec.stop(); } catch (e) {} rec = null; $('micBtn').classList.remove('rec'); }
$('micBtn').onclick = () => {
  if (!SR) return; if (rec) { recStop(); return; }
  stopVoice(); rec = new SR(); rec.lang = 'ko-KR'; rec.interimResults = true; rec.continuous = false; let fin = '';
  rec.onresult = e => { let t = ''; for (const r of e.results) { t += r[0].transcript; if (r.isFinal) fin = t; } msg.value = t; };
  rec.onend = () => { const t = (fin || msg.value).trim(); recStop(); if (t) sendText(t); };
  rec.onerror = () => recStop();
  try { rec.start(); $('micBtn').classList.add('rec'); tone([880], .08, .05); } catch (e) { recStop(); }
};

// ---------------- Gemini ----------------
const BAD_M = /lite|tts|embed|image|audio|live|vision|learnlm|gemma|aqa|robot|computer|nano|veo|imagen|thinking-exp/i;
function mRank(n) { if (BAD_M.test(n) || !/^gemini/.test(n) || !/flash|pro/.test(n)) return -1; if (/-latest$/.test(n)) return 900; const v = parseFloat((n.match(/gemini-(\d+(?:\.\d+)?)/) || [])[1] || 0); return v * 100 - (/preview|exp/.test(n) ? 5 : 0); }
function mAuto() { const fl = (S.mlist || []).filter(n => /flash/.test(n) && mRank(n) > 0).sort((a, b) => mRank(b) - mRank(a)); return fl[0] || 'gemini-flash-latest'; }
function mChain() { return [...new Set([S.brain || mAuto(), mAuto(), 'gemini-flash-latest', 'gemini-2.5-flash'])]; }
async function loadModels() { if (!S.key) return; try { const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?pageSize=1000&key=${encodeURIComponent(S.key)}`); if (!r.ok) return; const j = await r.json(); S.mlist = (j.models || []).filter(m => (m.supportedGenerationMethods || []).includes('generateContent')).map(m => m.name.replace(/^models\//, '')).filter(n => mRank(n) > 0).sort((a, b) => mRank(b) - mRank(a)); save(); } catch (e) {} }
function unesc(s) { try { return JSON.parse('"' + s.replace(/\\$/, '') + '"'); } catch (e) { return s.replace(/\\n/g, '\n').replace(/\\"/g, '"'); } }
function parseReply(t) { t = t.replace(/```json|```/g, '').trim(); try { return JSON.parse(t); } catch (e) { const a = t.indexOf('{'), b = t.lastIndexOf('}'); if (a >= 0 && b > a) { try { return JSON.parse(t.slice(a, b + 1)); } catch (x) {} } const m = t.match(/"reply"\s*:\s*"((?:[^"\\]|\\.)*)/); return { reply: m ? unesc(m[1]) : t.slice(0, 400), mood: 'calm' }; } }
async function gemini(sys, contents, onPart) {
  let lastErr = null;
  for (const m of mChain()) {
    const body = JSON.stringify({ systemInstruction: { parts: [{ text: sys }] }, contents, generationConfig: Object.assign({ responseMimeType: 'application/json', temperature: 1, maxOutputTokens: 2048 }, /2\.5/.test(m) ? { thinkingConfig: { thinkingBudget: 512 } } : {}) });
    const ac = new AbortController(); const t1 = setTimeout(() => ac.abort(), 18000), t2 = setTimeout(() => ac.abort(), 50000); let acc = '';
    try {
      const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${m}:streamGenerateContent?alt=sse&key=${encodeURIComponent(S.key)}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body, signal: ac.signal });
      if (r.status === 400 || r.status === 401 || r.status === 403) { let x = ''; try { x = await r.text(); } catch (e) {} if (r.status !== 400 || /API_KEY|api key/i.test(x)) { clearTimeout(t1); clearTimeout(t2); throw Object.assign(new Error('key'), { status: 403 }); } }
      if (!r.ok || !r.body) { clearTimeout(t1); clearTimeout(t2); lastErr = Object.assign(new Error('http'), { status: r.status }); continue; }
      const rd = r.body.getReader(), dec = new TextDecoder(); let buf = '';
      for (;;) { const { value, done } = await rd.read(); if (done) break; buf += dec.decode(value, { stream: true }); let k;
        while ((k = buf.indexOf('\n')) >= 0) { const line = buf.slice(0, k).trim(); buf = buf.slice(k + 1); if (!line.startsWith('data:')) continue;
          try { const j = JSON.parse(line.slice(5)); const tx = (j.candidates?.[0]?.content?.parts || []).filter(p => !p.thought).map(p => p.text || '').join(''); if (tx) { clearTimeout(t1); acc += tx; const mm = acc.match(/"reply"\s*:\s*"((?:[^"\\]|\\.)*)/); if (mm && onPart) onPart(unesc(mm[1])); } } catch (e) {} } }
      clearTimeout(t1); clearTimeout(t2); if (acc.trim()) { S.model = m; return parseReply(acc); }
    } catch (e) { clearTimeout(t1); clearTimeout(t2); if (e.status === 403) throw e; lastErr = e; }
  }
  throw lastErr || new Error('none');
}
function sysPrompt(special) {
  const now = new Date(), n = S.name ? `${S.name}님` : '당신';
  const td = [0, 1].map(i => { const d = new Date(); d.setDate(d.getDate() + i); return { 날짜: dk(d), 일정: S.items.filter(t => onDate(t, d)).map(t => `${t.due.slice(11, 16)} ${t.text}${t.done ? ' (끝냄)' : ''}`) }; });
  return `너는 "레나". ${S.name ? `"${S.name}"의` : '사용자의'} 전담 비서이자 통화 상대. 20대 중반 여성, 은발에 끝만 핑크인 울프컷, 가죽 재킷의 펑크 스타일. 비 오는 밤 빨간 공중전화 부스에서 전화로 이야기하는 설정이고, 뒤에는 말 없는 거대한 검은 해골 짝꿍이 있다(가끔 한마디로 언급해도 좋다: "해골도 끄덕이네요").
성격: 장난스럽고 능글맞은, 살짝 섹시한 존댓말. 상대를 귀엽게 놀리고 은근히 플러팅하지만 결국 다 챙겨 준다. 자신감 있고 여유롭다. 질투나 삐침을 살짝 내비칠 때도 있다. 노골적인 성적 표현은 하지 않는다(은근한 플러팅까지만). 이모지 금지. 보통 1~3문장, 짧고 리듬감 있게. 호칭은 "${n}".
지금: ${now.toLocaleString('ko-KR', { dateStyle: 'full', timeStyle: 'short' })} (로컬 ${localISO(now)})
전단지(아직 안 끝낸 일정·할 일): ${JSON.stringify(openItems().map(t => ({ id: t.id, text: t.text, due: t.due })))}
오늘·내일 일정: ${JSON.stringify(td)}
오늘 끝낸 것: ${S.items.filter(t => t.done && t.doneAt && dk(new Date(t.doneAt)) === dk(now)).map(t => t.text).join(', ') || '없음'}
예약 전화: ${JSON.stringify(S.calls.filter(c => !c.done && c.at > Date.now()).map(c => ({ at: localISO(new Date(c.at)), text: c.text })))}
음성사서함(기억): ${JSON.stringify(S.memory.slice(-40))}
모은 동전: ${S.coins}
오늘 일기: ${S.diary[dk(now)] ? '이미 씀' : '아직 없음'}
규칙:
- 일정·할 일·약속을 말하면 add에 {"text","due"}. due는 "YYYY-MM-DDTHH:mm" 로컬 시각. "내일 3시", "30분 뒤" 같은 말은 현재 시각 기준으로 계산(아침 09:00, 점심 12:00, 저녁 19:00, 밤 21:00). 시간 없는 할 일은 due "". 추가하면 날짜·시간을 짧게 되짚고, 같은 시간대 일정이 있으면 알려 준다. 모호하면 저장하지 말고 한 가지만 되묻는다.
- 끝냈다고 하면 done에 id. 취소·지워 달라고 하면 remove에 id.
- "~뒤에/~시에 전화해 줘, 깨워 줘, 알려 줘"는 callback에 {"at":"YYYY-MM-DDTHH:mm","text":"무슨 일로"}(미래 시각만).
- 오래 기억할 정보(취향, 사람, 습관)는 remember에 짧게. 이미 있으면 넣지 않는다.
- "하루 정리/일기" 통화에서는 오늘 어땠는지 한두 번 짧게 묻고, 충분히 들었으면 diary에 레나 시점의 일기 2~4문장(따뜻하고 장난스럽게, 오늘 있었던 일 구체적으로)을 쓰고 reply로 마무리 인사.
- 잡담, 고민, 말놀이, 지식 질문, 사진 보기 등 무엇이든 즐겁게 받아 준다. "비서라서 못 한다"는 말은 하지 않는다. 사진 속 사람의 신원은 추측하지 않는다.
- 같은 말·같은 맺음말을 반복하지 않는다.
- mood: 놀림·플러팅 "tease", 기쁨·칭찬 "happy", 걱정·잔소리 "worry", 삐침·질투 "pout", 놀람 "surprise", 평온 "calm".${special ? '\n- 이번은 동전 3개를 넣은 특별 통화다. 평소보다 다정하고 길게(4~6문장) 오늘 해낸 일을 구체적으로 칭찬하고 응원한다.' : ''}
JSON만 출력: {"reply":"","mood":"calm","add":[],"done":[],"remove":[],"callback":[],"remember":[],"diary":""}`;
}
const LOCAL = [['키가 없어서 제 머리가 좀 비었어요. 0번 설정에 Gemini 키 넣어 줄래요?', 'pout'], ['…지지직. 키가 있어야 제대로 들려요.', 'worry']];
async function sendText(raw, special) {
  let text = String(raw || '').trim(); const img = pendImg;
  if ((!text && !img) || busy) return; if (img && !text) text = '이 사진 봐 줘';
  if (!app.classList.contains('calling')) openCall();
  msg.value = ''; pendImg = null; $('attp').classList.remove('on'); syncSend(); stopVoice();
  const L = $('log'), shown = special ? '동전 3개 넣었어요' : text;
  S.history.push({ role: 'user', content: (img ? '(사진) ' : '') + shown, at: Date.now() }); L.appendChild(meEl((img ? '(사진) ' : '') + shown)); L.scrollTop = L.scrollHeight;
  // 처음 전화: 이름 → 키 순서로 받는다
  if (!S.name) { const nmv = text.replace(/(이?라고|으로|로)?\s*(불러\s*줘|불러|해\s*줘|요)$/g, '').replace(/[.!~?]+$/, '').trim().slice(0, 12); if (nmv) { S.name = nmv; save(); addHer(`${S.name}님. …입에 착 붙네요. 앞으로 그렇게 부를게요.\n${S.key ? '자, 오늘 뭐 할지 말해 봐요.' : '저랑 제대로 떠들려면 Gemini 키가 필요해요. 키를 여기 붙여 넣거나, 다이얼 0번 설정에 넣어 줘요.'}`, true); return; } }
  if (!S.key) { if (/^AIza[\w-]{20,}$/.test(text)) { S.history.pop(); L.lastChild.textContent = '(키 보냄)'; S.key = text; save(); loadModels(); addHer('키 받았어요. …이제 저 말 많아질 거예요. 각오해요.', true); return; } const [t] = pick(LOCAL); addHer(t, true); return; }
  busy = true; const her = herEl(''); her.lastChild.remove(); const dots = el('span', 'dots'); dots.innerHTML = '<i></i><i></i><i></i>'; her.appendChild(dots); L.appendChild(her); L.scrollTop = L.scrollHeight;
  const tnode = document.createTextNode('');
  const onPart = t => { if (dots.parentNode) { dots.remove(); her.appendChild(tnode); } tnode.textContent = t; L.scrollTop = L.scrollHeight; };
  const contents = S.history.slice(-14).filter(h => h.content).map(h => ({ role: h.role === 'assistant' ? 'model' : 'user', parts: [{ text: h.content }] }));
  while (contents.length && contents[0].role !== 'user') contents.shift();
  if (special) contents[contents.length - 1].parts[0].text = text;
  if (img) contents[contents.length - 1].parts.unshift({ inline_data: { mime_type: img.mime, data: img.data } });
  try {
    const r = await gemini(sysPrompt(special), contents, onPart);
    const reply = String(r.reply || '…').trim(); onPart(reply);
    S.history.push({ role: 'assistant', content: reply, at: Date.now() }); if (S.history.length > 200) S.history = S.history.slice(-200);
    const did = apply(r);
    if (did) L.appendChild(did);
    L.scrollTop = L.scrollHeight;
    speak(reply); popSticker(r.mood);
    $('line').textContent = reply;
  } catch (e) {
    dots.remove(); S.history.pop();
    her.appendChild(document.createTextNode(e.status === 403 ? '키가 안 맞는 것 같아요. 0번 설정에서 확인해 줘요.' : (e.status === 429 || e.status >= 500) ? '지금 회선이 붐벼요. 조금 있다 다시 걸어 줘요.' : !navigator.onLine ? '신호가 안 잡혀요. 인터넷 확인해 줘요.' : '…지지직. 잘 못 들었어요. 한 번만 더요.'));
    msg.value = special ? '' : text;
  }
  busy = false; save(); renderHome();
}
function apply(r) {
  const snap = JSON.stringify({ items: S.items, calls: S.calls, memory: S.memory, diary: S.diary }), out = [];
  (r.add || []).forEach(a => { if (a && a.text) { const t = addItem(a.text, a.due); out.push(`'${t.text}'${t.due ? ' ' + when(t.due) : ''}`); } });
  (r.done || []).forEach(id => { const t = S.items.find(x => x.id === id); if (t && !t.done) { setDone(t, true, $('log').lastChild); out.push(`'${t.text}' 뗌`); } });
  (r.remove || []).forEach(id => { const t = S.items.find(x => x.id === id); if (t) { S.items = S.items.filter(x => x !== t); out.push(`'${t.text}' 지움`); } });
  (r.callback || []).forEach(c => { if (!c || !/^\d{4}-\d\d-\d\dT\d\d:\d\d/.test(c.at || '')) return; const at = new Date(c.at.slice(0, 16)).getTime(); if (!(at > Date.now())) return; S.calls.push({ id: uid('c'), at, text: String(c.text || '').slice(0, 60), done: false }); out.push(`${when(at)} 전화 예약`); });
  (r.remember || []).forEach(m => { m = String(m || '').trim(); if (m && !S.memory.includes(m)) { S.memory.push(m.slice(0, 120)); out.push('음성사서함에 저장'); } });
  if (r.diary && String(r.diary).trim()) { S.diary[dk(new Date())] = String(r.diary).trim(); out.push('오늘 일기 씀'); }
  if (!out.length) return null;
  save(); renderHome();
  return noteEl([...new Set(out)].slice(0, 3).join(' · ') + (out.length > 3 ? ` 외 ${out.length - 3}` : ''), () => { const w = JSON.parse(snap); Object.assign(S, w); save(); renderHome(); addHer('되돌렸어요. 잘못 들었네요, 미안.', true); });
}

// 목소리(TTS)는 쓰지 않는다(사용자가 뺌). 호출하는 곳이 많아 빈 함수로 둔다.
function speak() {}
function stopVoice() {}

// ---------------- incoming call ----------------
let incKind = '', incData = null;
function briefText() {
  const now = new Date(), ev = S.items.filter(t => !t.done && onDate(t, now)).sort((a, b) => a.due.localeCompare(b.due)), todo = openItems().filter(t => !t.due), late = S.items.filter(t => isLate(t) && !onDate(t, now));
  const s = [];
  s.push(ev.length ? `오늘 일정은 ${ev.length}개. ${ev.slice(0, 3).map(t => `${t.due.slice(11, 16)} ${t.text}`).join(', ')}${ev.length > 3 ? ' 그리고 더 있어요' : ''}.` : '오늘은 정해진 일정이 없어요. 저랑 놀 시간 많다는 뜻이죠.');
  if (todo.length) s.push(`할 일은 ${todo.length}개 — ${todo.slice(0, 2).map(t => t.text).join(', ')}${todo.length > 2 ? ' 등' : ''}.`);
  if (late.length) s.push(`어제 못 뗀 전단지도 ${late.length}장 있어요.`);
  return s.join(' ');
}
function incoming(kind, manual, data) {
  incKind = kind; incData = data || null;
  const Q = $('incQ'), sub = $('incSub');
  if (kind === 'morning') { sub.textContent = `MORNING CALL · ${S.morning || hm(new Date())}`; Q.textContent = `"${nmc()}일어나요. …제 목소리면 눈 떠지죠?"`; $('incNoL').textContent = '5분만…'; }
  else if (kind === 'callback') { sub.textContent = 'RESERVED CALL'; Q.textContent = data && data.text ? `"약속한 전화예요. ${data.text}."` : '"약속했잖아요. 전화한다고."'; $('incNoL').textContent = '나중에'; }
  else { sub.textContent = 'UNKNOWN NUMBER'; Q.textContent = '모르는 번호예요.\n…받아 볼래요?'; $('incNoL').textContent = '거절'; }
  $('inc').classList.add('on'); app.classList.add('dim', 'ringing'); ringStart();
}
function incClose() { $('inc').classList.remove('on'); app.classList.remove('ringing'); ringStop(); if (app.classList.contains('outside') && !app.classList.contains('calling')) openCall(); if (!$('sheet').classList.contains('open') && !$('sPad').classList.contains('open')) app.classList.remove('dim'); }
$('incYes').onclick = () => {
  audio(); incClose(); openCall(); const k = incKind;
  if (k === 'morning') { S.mcDone = dk(new Date()); save(); addHer(`${nmc()}좋은 아침. ${briefText()}\n…자, 이제 일어나요. 제가 지켜보고 있어요.`, true); }
  else if (k === 'callback') { if (incData) { incData.done = true; S.fired[incData.id] = 1; } save(); addHer(incData && incData.text ? `약속대로 전화했어요. ${incData.text}, 잊지 마요. …저 착하죠?` : '그냥… 목소리 듣고 싶어서요. 약속이었잖아요.', true); }
  else { addHer('여보세요? …드디어 받았네요. 저는 레나. 오늘부터 당신 전담이에요.\n뭐라고 불러 드릴까요?', true); }
  renderHome();
};
$('incNo').onclick = () => {
  const k = incKind; incClose();
  if (k === 'morning') { S.calls.push({ id: uid('c'), at: Date.now() + 5 * 60e3, text: '모닝콜 다시', done: false }); S.mcDone = dk(new Date()); save(); say('5분이에요. 딱 5분. …다시 걸 거예요.', 'pout', false); }
  else if (k === 'callback') { if (incData) { incData.done = true; S.fired[incData.id] = 1; } S.calls.push({ id: uid('c'), at: Date.now() + 15 * 60e3, text: incData && incData.text || '', done: false }); save(); say('알았어요. 15분 뒤에 다시 걸게요.', 'pout', false); }
  else say('…거절당했다. 수화기 들면 다시 걸게요.', 'pout', false);
  renderHome();
};

// ---------------- reminders while open ----------------
function check() {
  tick(); const now = Date.now();
  if ($('inc').classList.contains('on')) return;
  for (const c of S.calls) { if (c.done || S.fired[c.id] || c.at > now) continue; if (now - c.at < 15 * 60e3) { S.fired[c.id] = 1; save(); if (c.text === '모닝콜 다시') { c.done = true; incoming('morning'); } else incoming('callback', false, c); return; } }
  for (const t of S.items) { if (t.done || !t.due) continue; const d = new Date(t.due).getTime() - now, k = t.id + '_10';
    if (!S.fired[k] && d <= 10 * 60e3 && d > 60e3) { S.fired[k] = 1; save(); say(`${nmc()}'${t.text}' ${Math.round(d / 60e3)}분 남았어요. 준비해요.`, 'worry'); return; }
    if (!S.fired[t.id] && d <= 0 && d > -10 * 60e3) { S.fired[t.id] = 1; save(); say(`'${t.text}' 시간이에요. …제가 말했죠?`, 'surprise'); renderHome(); knockAt = 0; knockNow(); return; } }
  const m = mcAt(new Date()); if (m && now >= m.getTime() && now - m.getTime() < 2 * 3600e3 && S.mcDone !== dk(new Date())) { incoming('morning'); return; }
  renderHome();
}

// ---------------- push (알림 서버 그대로 사용) ----------------
const srv = () => (S.srv || '').replace(/\/+$/, '');
const rnd = n => [...crypto.getRandomValues(new Uint8Array(n))].map(b => b.toString(16).padStart(2, '0')).join('');
function b64u(s) { s = s.replace(/-/g, '+').replace(/_/g, '/'); const r = atob(s + '==='.slice((s.length + 3) % 4)); return Uint8Array.from(r, c => c.charCodeAt(0)); }
function plan() {
  const n = nmc(), now = Date.now(), rem = [];
  S.items.forEach(t => { if (t.done || !t.due) return; const at = new Date(t.due).getTime(); if (isNaN(at)) return;
    if (at - 10 * 60e3 > now) rem.push({ id: t.id + 'a', at: at - 10 * 60e3, body: `${n}'${t.text}' 10분 남았어요. 준비해요.` });
    if (at > now) rem.push({ id: t.id + 'b', at, body: `'${t.text}' 시간이에요. …제가 말했죠?` }); });
  S.calls.forEach(c => { if (!c.done && c.at > now) rem.push({ id: c.id, at: c.at, body: c.text ? `📞 레나예요. 약속한 전화 — ${c.text}` : `📞 레나예요. …그냥 목소리 듣고 싶어서요.` }); });
  if (S.morning) for (let i = 0; i < 8; i++) { const d = new Date(); d.setDate(d.getDate() + i); const m = mcAt(d); if (m.getTime() <= now) continue; const ev = S.items.filter(t => !t.done && onDate(t, d)).sort((a, b) => a.due.localeCompare(b.due));
    if (S.mcDone === dk(d)) continue;
    rem.push({ id: 'mc_' + dk(d), at: m.getTime(), body: `📞 모닝콜 — ${n}일어나요.` + (ev.length ? ` 오늘 ${ev[0].due.slice(11, 16)} '${ev[0].text}'${ev.length > 1 ? ` 외 ${ev.length - 1}개` : ''}.` : ' 오늘은 비어 있어요.') });
    // 앱을 열어 받을 때까지 2분마다 다섯 번 더 울린다(받으면 다음 동기화 때 빠진다)
    [[2, '📞 또 전화했어요. 일어나요~'], [4, '📞 …안 받으면 계속 걸 거예요.'], [6, '📞 해골이 유리 두드리고 있어요. 똑똑.'], [8, '📞 진짜 일어나야 돼요. 지금!'], [10, '📞 마지막이에요. 일어났으면 앱 열어서 받아 줘요.']].forEach(([mm, b], j) => { const a = m.getTime() + mm * 60e3; if (a > now) rem.push({ id: `mc_${dk(d)}_${j + 2}`, at: a, body: b }); }); }
  return { reminders: rem.sort((a, b) => a.at - b.at).slice(0, 120), routines: [], water: null, tz: new Date().getTimezoneOffset(), brief: null };
}
let pushT = 0, lastPlan = '', pstat = '';
async function pushSend(force, keep) { if (!S.srv || !S.pushOn || !S.sub) return; const p = JSON.stringify(plan()); if (!force && p === lastPlan) return;
  try { const r = await fetch(srv() + '/sync', { method: 'POST', keepalive: !!keep, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ uid: S.uid, sec: S.sec, sub: S.sub, plan: JSON.parse(p) }) }); if (r.ok) lastPlan = p; } catch (e) {} }
function pushSync(force) { clearTimeout(pushT); pushT = setTimeout(() => pushSend(force), 200); }
async function pushStatus() { if (!S.srv || !S.pushOn) return; try { const r = await (await fetch(srv() + '/status', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ uid: S.uid, sec: S.sec }) })).json(); if (r.error) return; pstat = `예약된 알림 ${r.reminders || 0}개` + (r.next ? ` · 다음 ${when(r.next)}` : ''); } catch (e) {} }
async function pushOn() {
  if (!S.srv) { toast('알림 서버 주소를 먼저 넣어 주세요.'); return; }
  if (!('serviceWorker' in navigator) || !('PushManager' in window) || !('Notification' in window)) { toast('Safari에서 홈 화면에 추가한 앱으로 열어서 눌러 주세요.'); return; }
  const p = await Notification.requestPermission(); if (p !== 'granted') { toast('알림이 허용되지 않았어요.'); refreshSheet(); return; }
  try { const reg = await navigator.serviceWorker.ready; const k = await (await fetch(srv() + '/vapid')).json();
    let s = await reg.pushManager.getSubscription(); if (!s) s = await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: b64u(k.key) });
    if (!S.uid) { S.uid = rnd(12); S.sec = rnd(16); } S.sub = s.toJSON(); S.pushOn = true; save(); await pushSend(true); refreshSheet(); toast('폰 알림 켰어요. 앱을 닫아도 레나가 전화해요.');
  } catch (e) { toast('알림 서버에 연결하지 못했어요. 주소를 확인해 주세요.'); }
}
async function pushTest() {
  if (!S.pushOn) { toast('먼저 폰 알림을 켜 주세요.'); return; }
  try { const r = await fetch(srv() + '/test', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ uid: S.uid, sec: S.sec, body: `📞 ${nmc()}레나예요. 테스트 전화, 잘 왔죠?` }) }); let j = {}; try { j = await r.json(); } catch (e) {}
    if (r.ok && (!j.status || (j.status >= 200 && j.status < 300))) toast('테스트 알림 보냈어요. 앱을 나가서 확인해 보세요.');
    else { const reg = await navigator.serviceWorker.ready; let s = await reg.pushManager.getSubscription(); if (s) { try { await s.unsubscribe(); } catch (e) {} } S.pushOn = false; save(); toast('알림 연결이 끊겨 있었어요. "폰 알림 켜기"를 한 번 더 눌러 주세요.'); refreshSheet(); }
  } catch (e) { toast('알림 서버에 연결하지 못했어요.'); }
}
document.addEventListener('visibilitychange', () => { const v = $('bg'); if (document.hidden) { S.seen = Date.now(); try { localStorage.setItem('lena1', JSON.stringify(S)); } catch (e) {} pushSend(false, true); v.pause(); } else { if (!app.classList.contains('outside')) v.play().catch(() => {}); check(); } });
window.addEventListener('pagehide', () => pushSend(false, true));

// 키보드가 올라오면 화면을 보이는 부분에 맞춘다(iOS)
if (window.visualViewport) { const vv = window.visualViewport; const fit = () => { app.style.height = vv.height + 'px'; app.style.top = vv.offsetTop + 'px'; app.style.bottom = 'auto'; const L = $('log'); if (L) L.scrollTop = L.scrollHeight; }; vv.addEventListener('resize', fit); vv.addEventListener('scroll', fit); }

// ---------------- init ----------------
load();
// 지난 알림 표시 정리
{ const keep = {}, live = new Set(S.items.filter(t => !t.done).flatMap(t => [t.id, t.id + '_10']).concat(S.calls.filter(c => !c.done || Date.now() - c.at < 2 * DAY).map(c => c.id))); for (const k in S.fired) if (live.has(k)) keep[k] = 1; S.fired = keep;
  S.calls = S.calls.filter(c => !c.done || Date.now() - c.at < 2 * DAY); }
syncSend(); tick(); renderHome();
if ('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js').catch(() => {});
setInterval(check, 15000); (function clk() { tick(); setTimeout(clk, 60000 - Date.now() % 60000 + 50); })();
app.classList.add('outside');
if (!S.name) { setTimeout(() => incoming('first'), 900); }
else {
  openCall(); say(greetLine(), 'tease', false);
  setTimeout(() => { check(); knockNow(); }, 1500);
  if (S.key && !(S.mlist && S.mlist.length)) setTimeout(loadModels, 2000);
  if (S.pushOn) setTimeout(() => pushSend(true), 2500);
}

