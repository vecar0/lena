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
// 재화 그림: gc 게임 동전, todo 할 일 동전(v64에 없앰, 그림만 남음), chip 슬롯 칩, debt 빚, phone 전화국 동전, energy 에너지, heart 호감도, medal 등급, danger 위험도
const CUR = n => `assets/lena/cur/${n}.webp`, ci = n => `<img class="ci" src="${CUR(n)}" alt="">`;
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
  // v64: 할 일 동전은 없앰 → 남아 있던 건 게임 동전으로 옮김(한 번만)
  if (S.coins > 0) { S.gc = Math.min(999, (S.gc || 0) + S.coins); S.coins = 0; }
}
const nm = () => S.name ? S.name : '';
const nmc = () => S.name ? S.name + ', ' : '';

// ---------------- sound ----------------
let actx = null;
// 화면을 한 번이라도 누르기 전에는 소리 엔진을 켜지 않는다(브라우저가 막고 경고만 남김)
let touched = false; ['pointerdown', 'touchend', 'keydown'].forEach(ev => addEventListener(ev, () => { touched = true; }, { capture: true, passive: true }));
function audio() { if (!touched && !actx) return null; try { if (!actx) { const C = window.AudioContext || window.webkitAudioContext; if (C) actx = new C(); } if (actx && actx.state !== 'running') actx.resume(); } catch (e) {} return actx; }
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
// v78: 한 번만 하는 것은 두 종류 — 할 일(kind 'todo': 마감만, 체크해서 뗌) / 일정(kind 'event': 정확한 시간, 체크 없음, 끝나면 저절로 내려감)
// 매주 반복(고정)은 시간표에만 있고 전단지·알림으로 만들지 않는다
const isEv = t => t.kind === 'event';
const evEnd = t => new Date(t.due).getTime() + (t.mins || 60) * 60e3;
const openItems = () => { const n = Date.now(); S.items.forEach(t => { if (isEv(t) && !t.done && t.due && evEnd(t) < n) { t.done = true; t.doneAt = evEnd(t); t.auto = 1; } }); return S.items.filter(t => !t.done && !t.rid); };
const isLate = t => !t.done && t.due && !t.rid && !isEv(t) && new Date(t.due) < new Date();
const repEndAt = t => { const r = (S.reps || []).find(x => x.id === t.rid), d = new Date(t.due); if (r && r.end) { const [h, m] = r.end.split(':').map(Number); d.setHours(h, m, 0, 0); } else d.setTime(d.getTime() + 3600e3); return d; };
const repOver = t => !!t.rid && !t.done && repEndAt(t) < new Date();
const onDate = (t, d) => t.due && t.due.slice(0, 10) === dk(d);
// 같은 것인지 비교할 때: 띄어쓰기·문장부호·대소문자 무시
const norm = x => String(x || '').toLowerCase().replace(/[\s·.,!?~'"()\[\]\-_/]/g, '');
function dedupItems() { const seen = new Set(), n = S.items.length; S.items = S.items.filter(t => { if (t.done || t.rid) return true; const k = norm(t.text) + '|' + (t.due || ''); if (seen.has(k)) return false; seen.add(k); return true; }); return n - S.items.length; }
function addItem(text, due, kind) { const t = { id: uid('t'), text: String(text).slice(0, 80), due: /^\d{4}-\d\d-\d\dT\d\d:\d\d/.test(due || '') ? due.slice(0, 16) : '', done: false, at: Date.now(), kind: kind === 'event' ? 'event' : 'todo' }; if (t.kind === 'event' && !t.due) t.kind = 'todo'; S.items.push(t); return t; }
function setDone(t, v, srcEl) {
  if (t.done === v) return; t.done = v; t.doneAt = v ? Date.now() : 0;
  const k = dk(new Date());
  // 전단지는 떼도 동전 없음(v63: 만들고 바로 떼면 계속 얻을 수 있어서). 그날 뗀 개수만 기록.
  if (v) S.coinDays[k] = (S.coinDays[k] || 0) + 1;
  else if (S.coinDays[k]) S.coinDays[k]--;
  save(); renderHome();
  if (v) { const left = openItems().length; say(left ? pick(['하나 떼어냈네. …잘했어.', '착하다. 동전 하나 줄게.', '역시. 내가 반한 이유가 있지.', '오, 생각보다 빠른데?']) : `${nmc()}오늘 전단지 다 떼어냈어. …오늘은 내가 칭찬 많이 해 줄게.`, 'happy', false); }
}
function coinPop(srcEl) {
  coinSound();
  const r = (srcEl && srcEl.getBoundingClientRect && srcEl.getBoundingClientRect()) || { left: app.clientWidth / 2, top: app.clientHeight / 2, width: 0, height: 0 };
  const ar = app.getBoundingClientRect(), i = el('img', 'coinfly'); i.src = CUR('gc');
  i.style.left = (r.left - ar.left + r.width / 2 - 22) + 'px'; i.style.top = (r.top - ar.top + r.height / 2 - 22) + 'px';
  app.appendChild(i); setTimeout(() => i.remove(), 1100);
}

// ---------------- missed calls (부재중) ----------------
function mcAt(d) { if (!S.morning) return null; const [h, m] = S.morning.split(':').map(Number); const x = new Date(d); x.setHours(h, m, 0, 0); return x; }
function missed() {
  const from = S.ack || 0, now = Date.now(), L = [];
  S.items.forEach(t => { if (t.done || !t.due || t.rid || isEv(t) || S.fired[t.id]) return; const a = new Date(t.due).getTime(); if (a > from && a <= now) L.push({ at: a, text: `${t.text} (마감)`, kind: '할 일', ref: t }); });
  S.calls.forEach(c => { if (c.done || S.fired[c.id]) return; if (c.at > from && c.at <= now) L.push({ at: c.at, text: c.text || '약속한 전화', kind: '예약 전화', ref: c }); });
  for (let i = 0; i < 2; i++) { const d = new Date(); d.setDate(d.getDate() - i); const m = mcAt(d); if (!m) continue; const a = m.getTime(); if (a > from && a <= now && S.mcDone !== dk(d) && now - a > 2 * 3600e3) L.push({ at: a, text: '모닝콜', kind: '모닝콜' }); }
  return L.sort((a, b) => b.at - a.at);
}

// ---------------- home ----------------
let lineT = 0;
const STK = { tease: '', happy: 'st_heart', worry: 'st_bolt', pout: 'st_skull', surprise: 'st_star', calm: '' };
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
  const now = new Date(), up = S.items.filter(t => !t.done && isEv(t) && t.due && new Date(t.due) > new Date(now - 30 * 60e3)).sort((a, b) => a.due.localeCompare(b.due)); // v83: 분홍 = 일정만
  const nx = up[0];
  if (nx) {
    const f = el('button', 'fly f1'); f.append(el('div', 'tp'), el('small', null, when(nx.due).toUpperCase()), el('b', null, nx.text));
    f.querySelector('.tp').style.backgroundImage = 'url(assets/lena/tape_white.webp)';
    { const more = up.slice(1).filter(t => t.due.slice(0, 10) === nx.due.slice(0, 10)).length; if (more) f.appendChild(el('small', null, `그날 ${more}개 더`)); }
    f.onclick = () => openBoard('today'); F.appendChild(f);
  }
  // v83: 노랑 = 할 일 전부(마감 가까운 것 먼저, 마감 없는 건 뒤), 줄마다 '~마감'
  const todo = openItems().filter(t => !isEv(t) && !t.rid).sort((a, b) => (a.due || '9').localeCompare(b.due || '9')), doneToday = S.items.filter(t => t.done && !isEv(t) && t.doneAt && dk(new Date(t.doneAt)) === dk(now));
  if (todo.length || doneToday.length) {
    const f = el('button', 'fly f2'); f.append(el('div', 'tp'), el('small', null, todo.length ? `할 일 ${todo.length}` : '할 일 끝!'));
    f.querySelector('.tp').style.backgroundImage = 'url(assets/lena/tape_teal1.webp)';
    todo.slice(0, 3).forEach(t => { const i = el('i', t.due && new Date(t.due) < now ? 'late' : null, t.text); if (t.due) i.appendChild(el('em', null, '~' + when(t.due).replace(/ 00:00$/, ''))); f.appendChild(i); });
    if (todo.length < 3) doneToday.slice(-1).forEach(t => f.appendChild(el('i', 'd', t.text)));
    if (todo.length > 3) f.appendChild(el('u', null, `+${todo.length - 3}개 더`));
    f.onclick = () => openBoard('all'); F.appendChild(f);
  }
  // v87: 음성통화 화면 이름 아래 오늘 요약 칩(다음 일정·할 일·날씨·공부)
  { const A = $('aInfo'); if (A) { A.innerHTML = ''; const chip = (c, t, f) => { const b = el('button', c, t); b.onclick = f; A.appendChild(b); };
    if (nx) chip('cev', `${when(nx.due).replace(/^오늘 /, '')} ${nx.text}`, () => openBoard('today'));
    if (todo.length) chip('ctd', `할 일 ${todo.length}`, () => openBoard('all'));
    try { const w = S.wx, dd = w && w.on && w.data && (w.data.days || []).find(x => x.d === dk(now)); if (dd) chip('cwx', `${dd.pop >= 40 ? '비 ' : ''}${Math.round(dd.min)}~${Math.round(dd.max)}°`, () => openSheet(0)); } catch (e) {}
    try { const P = window.lenaStudy && lenaStudy.plan(), D = P && P.days[0]; if (D && D.mins) chip('cst', `공부 ${D.mins >= 60 ? Math.floor(D.mins / 60) + '시간' + (D.mins % 60 ? ' ' + D.mins % 60 + '분' : '') : D.mins + '분'}`, () => openSheet(6)); } catch (e) {} } }
  // 영상 화면엔 동전 개수를 띄우지 않는다(자판기는 음성 화면 ♥ 배지·오락실에서)
  const late = S.items.filter(isLate);
  const K = $('knock'); placeKnock(); K.classList.toggle('on', !!late.length); K.onclick = () => { dtmf('#'); openBoard('today'); };
  // 열린 키패드 숫자 배지
  const k9 = document.querySelector('.k[data-k="5"] em'); if (k9) { k9.textContent = M.length; k9.hidden = !M.length; }
  $('aMissN').textContent = M.length; $('aMissN').hidden = !M.length;
}
let knockAt = 0;
// 해골 손·눈 자리(배경 그림 1050×1872 좌표) → 지금 화면 좌표. 배경은 cover + 위 가운데 정렬.
const KN = { hand: [620, 333], eyes: [[207, 382], [317, 320]] };
function placeKnock() { const bg = $('bg'), W = bg.clientWidth, H = bg.clientHeight; if (!W) return; const s = Math.max(W / 1050, H / 1872), x0 = (W - 1050 * s) / 2, P = ([u, v]) => [x0 + u * s, v * s];
  let [hx, hy] = P(KN.hand); const K = $('knock'), tb = document.querySelector('.home .top'); if (tb) { const b = tb.getBoundingClientRect().bottom; if (hy < b + 30) hy = b + 30; } /* 위 버튼 줄과 안 겹치게 */ K.style.left = hx + 'px'; K.style.top = hy + 'px';
  [...$('kEyes').children].forEach((e, i) => { const [x, y] = P(KN.eyes[i]); e.style.left = x + 'px'; e.style.top = y + 'px'; }); }
addEventListener('resize', placeKnock);
function knockNow() { const K = $('knock'); placeKnock(); if (!K.classList.contains('on') || Date.now() - knockAt < 30 * 60e3) return; knockAt = Date.now(); K.classList.remove('tap'); void K.offsetWidth; K.classList.add('tap'); const E = $('kEyes'); E.classList.remove('tap'); void E.offsetWidth; E.classList.add('tap'); setTimeout(() => { K.classList.remove('tap'); E.classList.remove('tap'); }, 2000); tone([180], .06, .15, 'square'); tone([160], .06, .15, 'square', .2); }

function greetLine() {
  const h = new Date().getHours(), n = nmc(), now = new Date();
  const g = h < 5 ? `${n}이 시간에 깨어 있어? …나쁜 사람.` : h < 11 ? `${n}좋은 아침. 내 목소리 듣고 일어난 거 맞지?` : h < 18 ? pick([`${n}왔어? 기다렸잖아.`, `${n}또 나 보고 싶어서 왔구나.`]) : pick([`${n}오늘도 버텼네. 수고했어.`, `${n}밤엔 내가 제일 예쁜 거 알지?`]);
  const up = S.items.filter(t => !t.done && onDate(t, now) && new Date(t.due) > now).sort((a, b) => a.due.localeCompare(b.due)), late = S.items.filter(isLate), todo = openItems().filter(t => !t.due);
  const b = [];
  if (up.length) b.push(`${up[0].due.slice(11, 16)}에 '${up[0].text}'${up.length > 1 ? ` 외 ${up.length - 1}개` : ''} 있어.`);
  if (late.length) b.push(`지난 거 ${late.length}개… 해골이 유리 두드리는 거 보이지?`);
  else if (todo.length) b.push(`할 일은 ${todo.length}개 남았고.`);
  return [g, b.join(' ')].filter(Boolean).join('\n');
}
const TAPS = [['간지러워.', 'tease'], ['…왜, 보고 싶었어?', 'tease'], ['자꾸 건드리면 나도 건드릴 거야.', 'tease'], ['쉿. 해골이 질투해.', 'calm'], ['나 바빠. …거짓말이야.', 'happy'], ['오늘 할 일은? 나만 보고 있으면 안 돼.', 'pout']];
let tapN = 0, tapT = 0;
$('lenaHit').onclick = () => { tapN++; clearTimeout(tapT); tapT = setTimeout(() => tapN = 0, 6000); if (tapN >= 5) { say('…그만. 이러다 정들겠어.', 'pout', false); return; } const [t, m] = pick(TAPS); say(t, m, false); };

// ---------------- sheets ----------------
let curSheet = 0, callTab = 'res';
// 화면에 보이는 다이얼 번호(시트 id → 번호). 순서는 중요도: 1 전단지 2 캘린더 3 시간표 4 공부 5 전화 6 모닝콜 7 음성사서함 8 운세 9 자판기 * 오락실 0 설정
const NUMOF = { 1: '1', cal: '2', tt: '3', 6: '4', call: '5', 7: '6', 5: '7', 2: '8', fort: '8', 3: '9', shop: '9', 8: '*', 0: '0', cl: '#', box: '⚡' };
const SH = {};
function openSheet(n) {
  // 예전 번호(4 예약·9 부재중·* 기록)는 5번 '전화' 시트의 탭으로
  if (n === 4 || n === 9 || n === '*' || n === 'call') { callTab = n === 9 ? 'miss' : n === '*' ? 'log' : n === 4 ? 'res' : (missed().length ? 'miss' : 'res'); n = 'call'; }
  closePad(); const s = SH[n]; if (!s) return; if (s.direct) { s.direct(); return; } curSheet = n;
  $('shNum').textContent = NUMOF[n] != null ? NUMOF[n] : '•'; $('shT').textContent = s.t; $('shS').textContent = typeof s.s === 'function' ? s.s() : (s.s || '');
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
function pills(opts, cur, fn) {
  // 켜기/끄기 두 버튼은 스위치 하나로
  if (opts.length === 2 && opts[0][1] === '켜기' && opts[1][1] === '끄기') { const on = String(cur) === String(opts[0][0]), w = el('div', 'sww'), b = el('button', 'sw' + (on ? ' on' : '')); b.setAttribute('role', 'switch'); b.setAttribute('aria-checked', on); b.setAttribute('aria-label', on ? '켜짐' : '꺼짐'); b.onclick = () => fn(on ? opts[1][0] : opts[0][0]); w.appendChild(b); return w; }
  const P = el('div', 'pills'); opts.forEach(([v, l]) => { const b = el('button', String(cur) === String(v) ? 'on' : '', l); b.onclick = () => fn(v); P.appendChild(b); }); return P; }

// 1~3 전단지
let boardTab = 'today', addKind = 'todo';
const TAPES = ['tape_pink1', 'tape_teal1', 'tape_yellow', 'tape_white', 'tape_teal2', 'tape_pink2'];
function paper(t, i) {
  const late = isLate(t), cls = t.done ? 'white' : isEv(t) ? 'pink' : 'yel'; // v83: 할 일 = 노랑, 일정 = 분홍 (홈 전단지와 같은 색)
  const p = el('div', `pp ${cls}${t.done ? ' done' : ''}${late ? ' late' : ''}`);
  const tp = el('div', 'tp'); tp.style.backgroundImage = `url(assets/lena/${TAPES[i % TAPES.length]}.webp)`; tp.style.transform = `rotate(${(i % 3 - 1) * 5}deg)`;
  const ev = isEv(t); if (ev) p.classList.add('evt');
  p.append(tp, el('small', null, ev ? `일정 · ${when(t.due)}` : t.due ? `할 일 · ${when(t.due)}까지` : '할 일 · 언제든'), el('b', null, t.text));
  const a = el('div', 'acts'), ck = el('button', 'ck'); ck.setAttribute('aria-label', '끝냄'); ck.innerHTML = '<svg viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>';
  ck.onclick = () => { dtmf(5); if (!t.done) { tearSound(); p.classList.add('tear'); setTimeout(() => { setDone(t, true, ck); refreshSheet(); }, 450); } else { setDone(t, false); refreshSheet(); } };
  if (ev) a.append(el('span', 'evk', t.done ? '지난 일정' : '꼭 가요')); else a.append(ck);
  a.append(xbtn(() => { const snap = JSON.stringify(S.items); if (t.rkey && S.repSkip) S.repSkip[t.rkey] = 1; S.items = S.items.filter(x => x !== t); save(); refreshSheet(); toast(`'${t.text}' 떼어 버렸어요`, () => { S.items = JSON.parse(snap); save(); refreshSheet(); }); }));
  p.appendChild(a); return p;
}
function boardAdd(B) {
  const c = el('div', 'card'), t = inp('text', addKind === 'event' ? '일정 (예: 치과 예약)' : '할 일 (예: 택배 반품)'), d = inp('datetime-local');
  t.enterKeyHint = 'done';
  const go = () => { const v = t.value.trim(); if (!v) { t.focus(); return; } if (addKind === 'event' && !d.value) { toast('일정은 시간을 넣어 줘.'); d.focus(); return; } const it = addItem(v, d.value, addKind); save(); pushSync(true); t.value = ''; d.value = ''; refreshSheet(); say(isEv(it) ? `${when(it.due)} '${v}'. 그 시간에 꼭 알려 줄게.` : it.due ? `'${v}', ${when(it.due)}까지. 끝나면 체크해.` : `'${v}' 붙여 뒀어. 까먹으면 내가 기억해 줄게.`, 'happy', false); };
  t.addEventListener('keydown', e => { if (e.key === 'Enter' && !e.isComposing) go(); });
  c.classList.add('badd'); const dl = el('label', 'bwhen'); dl.append(el('span', null, addKind === 'event' ? '언제 (꼭 넣기)' : '마감 시간'), d);
  // v83: 할 일은 '마감 정하기'를 켜야 시간 칸이 나옴(안 켜면 시간 없이 붙음)
  let dueOn = addKind === 'event'; const dsw = el('button', 'bdue', '마감 정하기'); dsw.type = 'button'; dsw.setAttribute('role', 'switch');
  const syncDue = () => { dsw.classList.toggle('on', dueOn); dsw.setAttribute('aria-checked', dueOn); dl.hidden = !dueOn; if (!dueOn) d.value = ''; };
  dsw.onclick = () => { dueOn = !dueOn; syncDue(); if (dueOn) setTimeout(() => d.focus(), 50); };
  c.append(pills([['todo', '할 일 — 마감까지 체크'], ['event', '일정 — 정해진 시간']], addKind, v => { addKind = v; refreshSheet(); }), row(t, btn('붙이기', '', go)), ...(addKind === 'event' ? [] : [dsw]), dl); syncDue(); B.appendChild(c);
}
function boardTabs(B) { const T = el('div', 'tabs'); [['today', '오늘'], ['week', '이번 주'], ['all', '전체']].forEach(([v, l]) => { const b = el('button', boardTab === v ? 'on' : '', l); b.onclick = () => { boardTab = v; refreshSheet(); }; T.appendChild(b); }); B.appendChild(T); }
function boardRender(B) {
  openItems(); // 끝난 일정은 저절로 내려감
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
    B.appendChild(W); return; // v79: 붙이는 칸은 오늘·전체 탭에만
  }
  let L;
  if (boardTab === 'today') L = S.items.filter(t => (onDate(t, now) || isLate(t)) && !repOver(t) && (!t.done || dk(new Date(t.doneAt || 0)) === dk(now))).sort((a, b) => a.done - b.done || a.due.localeCompare(b.due));
  else L = S.items.filter(t => !t.done && !t.rid).sort((a, b) => (a.due || '0').localeCompare(b.due || '0')); // 할 일 탭엔 시간표 반복은 빼고(3번 시간표에 있음)
  if (boardTab !== 'today') boardAdd(B);
  if (!L.length) B.appendChild(empty(boardTab === 'today' ? '오늘은 유리가 깨끗해요.\n…심심하면 저랑 놀아요.' : '붙일 게 없네요. 대단한데요?', 'st_peace'));
  else { const G = el('div', 'board'); L.forEach((t, i) => G.appendChild(paper(t, i))); B.appendChild(G); }
  if (boardTab === 'today') { B.appendChild(lbl('새 전단지')); boardAdd(B); }
  if (boardTab === 'all') { const D = S.items.filter(t => t.done).sort((a, b) => (b.doneAt || 0) - (a.doneAt || 0)); if (D.length) { B.appendChild(lbl(`떼어낸 것 ${D.length}`)); const G = el('div', 'board'); D.slice(0, 6).forEach((t, i) => G.appendChild(paper(t, i))); B.appendChild(G); const c = btn('떼어낸 것 정리', 'ghost wide', () => { S.items = S.items.filter(t => !t.done); save(); refreshSheet(); }); c.style.marginTop = '14px'; B.appendChild(row(c)); } }
}
// 다이얼 1 = 전단지(오늘·할 일 탭). 캘린더·시간표는 2·3번 따로(study.js·plan.js)
SH[1] = { t: '전단지', s: () => `남은 것 ${openItems().filter(t => !t.rid).length}개 · 다 하면 떼요`, r: B => boardRender(B) };
function openBoard(tab) { boardTab = tab || 'today'; openSheet(1); }

// 4 예약 전화
SH[4] = { t: '예약 전화', s: '정한 시간에 레나가 전화해요', r: B => {
  const c = el('div', 'card paperc yel'), t = inp('text', '무슨 일로? (예: 빨래 꺼내기)'), d = inp('datetime-local');
  let off = 30;
  const P = pills([[10, '10분 뒤'], [30, '30분 뒤'], [60, '1시간 뒤'], [180, '3시간 뒤'], [0, '직접']], off, v => { off = v; [...P.children].forEach(b => b.classList.toggle('on', b.textContent === ({ 10: '10분 뒤', 30: '30분 뒤', 60: '1시간 뒤', 180: '3시간 뒤', 0: '직접' })[v])); d.style.display = v ? 'none' : ''; });
  d.style.display = 'none';
  const go = () => { let at = off ? Date.now() + off * 60e3 : (d.value ? new Date(d.value).getTime() : 0); if (!at || at < Date.now()) { say('언제 걸지 정해 줘야지.', 'pout', false); return; } const x = { id: uid('c'), at, text: t.value.trim().slice(0, 60), done: false }; S.calls.push(x); save(); refreshSheet(); say(`${when(at)}에 전화할게. 꼭 받아?`, 'tease', false); };
  c.append(row(t), P, row(d), row(btn('예약하기', 'wide', go))); P.style.margin = '10px 0 0';
  B.append(c);
  const L = S.calls.filter(x => !x.done && x.at > Date.now() - 6e4).sort((a, b) => a.at - b.at);
  B.appendChild(lbl('예약된 전화'));
  if (!L.length) B.appendChild(empty('예약된 전화가 없어요.\n통화 중에 "30분 뒤에 전화해 줘"라고 해도 돼요.', 'st_phone'));
  else { const l = el('div', 'list card paperc'); L.forEach(x => { const r = el('div', 'it'), ic = el('img', 'ic'); ic.src = 'assets/lena/st_phone.webp'; ic.alt = ''; const tx = el('div', 't', x.text || '그냥 목소리 들려주기'); tx.appendChild(el('small', null, when(x.at))); r.append(ic, tx, xbtn(() => { S.calls = S.calls.filter(y => y !== x); save(); refreshSheet(); })); l.appendChild(r); }); B.appendChild(l); }
  if (!S.pushOn) B.appendChild(el('div', 'hint', '앱을 닫아 두면 폰 알림으로 와요. 0번 설정에서 폰 알림을 켜 주세요.'));
} };

// 5 음성사서함 (기억)
SH[5] = { t: '음성사서함', s: () => `레나가 기억하는 것 ${S.memory.length}개`, r: B => {
  const c = el('div', 'card'), t = inp('text', '예: 나 오이 싫어해');
  const go = () => { const v = t.value.trim(); if (!v) return; if (!S.memory.includes(v)) S.memory.push(v.slice(0, 120)); save(); t.value = ''; refreshSheet(); say(pick(['메시지 잘 받았어요. 안 까먹어요.', '…녹음해 뒀어요. 몇 번 더 들어 볼게요.']), 'happy', false); };
  t.addEventListener('keydown', e => { if (e.key === 'Enter' && !e.isComposing) go(); });
  c.append(row(t, btn('남기기', '', go))); B.appendChild(c);
  B.appendChild(lbl('저장된 메시지'));
  if (!S.memory.length) { B.appendChild(empty('아직 비어 있어요.\n취향, 사람, 습관을 남겨 주면 통화할 때 기억해요.', 'st_tape')); return; }
  const l = el('div', 'list card'); S.memory.slice().reverse().forEach(m => { const r = el('div', 'it'), ic = el('img', 'ic'); ic.src = 'assets/lena/st_tape.webp'; ic.alt = ''; r.append(ic, el('div', 't', m), xbtn(() => { S.memory = S.memory.filter(x => x !== m); save(); refreshSheet(); })); l.appendChild(r); }); B.appendChild(l);
} };

// 6 공부 → study.js

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
    const h = el('div', 'hint'); h.innerHTML = '앱 알림은 한 번씩만 "띵" 울려요. 무음이어도 크게 계속 울리게 하려면 아이폰 <b>시계 알람</b>을 같이 쓰세요.<details class="fold"><summary>처음 한 번만 준비하는 법</summary>1. 단축어 앱 → + → 이름을 <b>레나 알람</b>으로<br>2. 동작 추가에서 <b>알람 생성</b>(시계)을 고르기<br>3. 시간 칸을 눌러 <b>단축어 입력</b>으로, 레이블은 "레나 모닝콜"<br>4. 완료 → 이제 위 버튼을 누르면 알람이 생겨요</details>';
    a.appendChild(h); B.appendChild(a);
  }
  if (!S.pushOn) B.appendChild(el('div', 'hint', '폰 알림이 꺼져 있으면 앱을 열 때만 울려요. 0번 설정에서 켜 주세요.'));
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
  // v81: 대화처럼 — 레나 = 종이 쪽지(왼쪽), 나 = 청록 말풍선(오른쪽), 날짜마다 테이프 띠
  const l = el('div', 'clog'); let day = '';
  S.history.slice(-60).forEach(h => {
    const d = h.at ? new Date(h.at) : null, dk0 = d ? d.toDateString() : '';
    if (d && dk0 !== day) { day = dk0; const td = new Date().toDateString(), yd = new Date(Date.now() - DAY).toDateString(); l.appendChild(el('div', 'cday', dk0 === td ? '오늘' : dk0 === yd ? '어제' : `${d.getMonth() + 1}월 ${d.getDate()}일 ${WD[d.getDay()]}`)); }
    const me = h.role === 'user', txt = String(h.content || '').replace(/\n— 여기서 일정·할 일·예약이 있으면[\s\S]*$/, '').replace(/\uFFFD/g, '');
    const r = el('div', 'cb ' + (me ? 'cme' : 'cle')), bb = el('div', 'bb', txt);
    if (!me) r.appendChild(el('i', 'av' + (app.classList.contains('outside') ? ' cat' : '')));
    const w = el('div', 'cbw'); w.append(bb, el('small', null, d ? `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}` : '')); r.appendChild(w); l.appendChild(r);
  });
  B.appendChild(l); requestAnimationFrame(() => { const sb = B.closest('.sbody') || B; sb.scrollTop = sb.scrollHeight; });
  B.appendChild(row(btn('기록 지우기', 'ghost wide', () => { if (!confirm('통화 기록을 모두 지울까요?')) return; S.history = []; save(); refreshSheet(); })));
} };
// 5 전화 = 예약 전화 + 부재중 + 통화 기록 (탭)
SH.call = { t: '전화', s: () => { const n = missed().length, c = S.calls.filter(x => !x.done && x.at > Date.now()).length; return `${n ? `부재중 ${n}통 · ` : ''}예약 ${c}개`; }, r: B => {
  const T = el('div', 'tabs'), n = missed().length; [['res', '예약 전화'], ['miss', n ? `부재중 ${n}` : '부재중'], ['log', '통화 기록']].forEach(([v, l]) => { const b = el('button', callTab === v ? 'on' : '', l); b.onclick = () => { callTab = v; refreshSheet(); }; T.appendChild(b); }); B.appendChild(T);
  SH[{ res: 4, miss: 9, log: '*' }[callTab]].r(B);
} };

// 0 설정
SH[0] = { t: '설정', s: '이 폰에만 저장돼요', r: B => {
  B.appendChild(lbl('호칭'));
  { const t = inp('text', '예: 송휘', S.name); B.appendChild(el('div', 'card')).append(row(t, btn('저장', '', () => { S.name = t.value.trim().slice(0, 12); save(); refreshSheet(); say(S.name ? `${S.name}. …입에 착 붙네요.` : '이름은 비워 둘게요.', 'tease', false); }))); }
  B.appendChild(lbl('Gemini 키'));
  { const c = B.appendChild(el('div', 'card')), t = inp('password', S.key ? '••••' + S.key.slice(-4) : 'AIza로 시작하는 키'); t.autocomplete = 'off';
    c.append(row(t, btn('저장', '', () => { const v = t.value.trim(); if (!v) return; S.key = v; save(); loadModels().then(refreshSheet); refreshSheet(); say('키 받았어요. 이제 마음껏 떠들어요.', 'happy', false); })));
    c.appendChild(el('div', 'hint', S.key ? '키 저장됨. 통화가 Gemini로 연결돼요.' : S.ckey ? 'Claude 키만 있어도 돼요. 노트 정리(사진·PDF)는 Gemini 키가 있어야 해요.' : '키가 없으면 레나가 정해진 말만 해요. aistudio.google.com에서 무료로 받을 수 있어요.'));
    const s = el('select', 'in'); s.appendChild(new Option('자동 (가장 빠른 것)', '')); if (S.ckey) s.appendChild(new Option('Claude Haiku 5.5', CLM)); (S.mlist || []).forEach(m => s.appendChild(new Option(m, m))); s.value = S.brain || ''; s.onchange = () => { S.brain = s.value; save(); };
    c.append(el('div', 'hint', '대화 두뇌'), row(s)); if (S.model) c.appendChild(el('div', 'hint', '최근 대답한 두뇌: ' + S.model));
    const ml = S.mlat || {}, ks = Object.keys(ml).sort((a, b) => ml[a] - ml[b]); if (ks.length) c.appendChild(el('div', 'hint', '첫 글자까지 걸린 시간(평균): ' + ks.slice(0, 5).map(k => `${isCl(k) ? 'Claude Haiku' : k.replace('gemini-', 'Gemini ')} ${(ml[k] / 1000).toFixed(1)}초`).join(' · '))); }
  B.appendChild(lbl('Claude 키 (선택)'));
  { const c = B.appendChild(el('div', 'card')), t = inp('password', S.ckey ? '••••' + S.ckey.slice(-4) : 'sk-ant-로 시작하는 키'); t.autocomplete = 'off';
    c.append(row(t, btn('저장', '', () => { const v = t.value.trim(); if (!v) return; if (!/^sk-ant-/.test(v)) { toast('sk-ant-로 시작하는 키를 넣어 주세요.'); return; } S.ckey = v; S.clErr = ''; delete COOL[CLM]; save(); refreshSheet(); say('Claude 키 받았어요. 누가 더 빠른지 제가 재 볼게요.', 'happy', false); })));
    if (S.ckey) c.appendChild(row(btn('Claude 키 지우기', 'ghost', () => { if (!confirm('Claude 키를 지울까요?')) return; S.ckey = ''; if (isCl(S.brain || '')) S.brain = ''; save(); refreshSheet(); })));
    c.appendChild(el('div', 'hint', S.ckey ? (S.clErr ? '⚠ ' + S.clErr + ' — console.anthropic.com에서 확인해 주세요.' : 'Claude Haiku 5.5도 두뇌로 써요. 자동이면 첫 글자가 더 빨리 오는 쪽을 먼저 써요(처음엔 하나씩 재 봐요). 한쪽이 막히면 다른 쪽으로 넘어가요.') : 'console.anthropic.com에서 키를 만들고 충전(5달러~)하면 Claude Haiku로도 대화해요. 하루 30번 쓰면 한 달 약 1,000원. 노트 정리는 Gemini로 해요.')); }
  B.appendChild(lbl('폰 알림'));
  { const c = B.appendChild(el('div', 'card')), t = inp('url', 'https://…workers.dev', S.srv);
    c.append(row(t, btn('저장', 'ghost', () => { let v = t.value.trim(); if (v && !/^https?:\/\//.test(v)) v = 'https://' + v; S.srv = v; save(); refreshSheet(); })));
    c.append(row(btn(S.pushOn ? '다시 연결' : '폰 알림 켜기', 'wide', pushOn), btn('테스트', 'ghost', pushTest)));
    const perm = 'Notification' in window ? Notification.permission : 'none';
    c.appendChild(el('div', 'hint', perm === 'denied' ? '아이폰 설정 > 알림 > 레나에서 허용해 주세요.' : S.pushOn ? '켜짐 · 앱을 닫아도 예약 전화·모닝콜·전단지 시간에 알려요.' + (pstat ? ' · ' + pstat : '') : '홈 화면에 추가한 앱에서 켤 수 있어요 (iOS 16.4 이상).')); }
  B.appendChild(lbl('백업'));
  { const c = B.appendChild(el('div', 'card')), f = el('input'); f.type = 'file'; f.accept = '.json,application/json'; f.hidden = true;
    f.onchange = async () => { const x = f.files[0]; if (!x) return; try { const d = JSON.parse(await x.text()); const keep = { key: S.key, ckey: S.ckey, sec: S.sec, uid: S.uid, sub: S.sub, pushOn: S.pushOn }; Object.assign(S, d, keep); save(); refreshSheet(); renderHome(); say('백업 불러왔어요.', 'happy', false); } catch (e) { say('파일을 못 읽었어요.', 'worry', false); } };
    c.append(row(btn('내보내기', 'ghost wide', () => { const d = JSON.parse(JSON.stringify(S)); delete d.key; delete d.ckey; delete d.sec; const u = URL.createObjectURL(new Blob([JSON.stringify(d)], { type: 'application/json' })); const a = document.createElement('a'); a.href = u; a.download = 'lena-backup.json'; a.click(); }), btn('불러오기', 'ghost wide', () => f.click())), f); }
}, open: () => { if (S.key && !(S.mlist && S.mlist.length)) loadModels().then(refreshSheet); pushStatus().then(() => { if (curSheet === 0) refreshSheet(); }); } };


// ---------------- 밖 모드(음성통화) ↔ 영상통화(부스) ----------------
function toAudio() { app.classList.add('outside'); $('bg').pause(); if (!app.classList.contains('calling')) openCall(); else renderLog(); renderHome(); }
function toVideo() {
  stopVoice(); recStop(); dtmf('#'); app.classList.remove('outside', 'calling'); clearInterval(callTimer);
  const v = $('bg'); v.play().catch(() => {}); renderHome(); say(pick([`${nmc()}짜잔. …얼굴 보니까 좋지?`, '얼굴 보면서 얘기하니까 좀 낫네. …그렇지?', '어머, 카메라 켰어? 잠깐, 머리 정리 좀…']), 'calm', false);
  setTimeout(kissFromMouth, 350);
}
// 음성 → 영상으로 넘어갈 때만: 레나 입에서 입술 키스가 튀어나온다
function kissFromMouth() {
  const W = app.clientWidth, H = app.clientHeight, sc = Math.max(W / 1136, H / 2048), dw = 1136 * sc, dh = 2048 * sc;
  const x = (W - dw) / 2 + dw * .554, y = dh * .493;
  for (let i = 0; i < 1; i++) {
    const k = el('img', 'kiss'); k.src = 'assets/lena/st_lips.webp'; k.alt = '';
    k.style.left = x + 'px'; k.style.top = y + 'px'; k.style.setProperty('--dx', '110px'); k.style.setProperty('--dy', '-24px'); k.style.setProperty('--r', '12deg'); k.style.animationDelay = (i * .16) + 's';
    app.appendChild(k); setTimeout(() => k.remove(), 1700 + i * 160);
  }
  tone([1320], .05, .04, 'triangle'); tone([1760], .08, .035, 'triangle', .08);
}
$('toAudio').onclick = $('toAudio2').onclick = () => { dtmf(1); toAudio(); };
$('aVid').onclick = toVideo;
$('logTog').textContent = '다이얼'; $('logTog').onclick = () => { dtmf(0); openPad(); };
$('aPad').onclick = () => { dtmf(0); openPad(); };
$('aBoard').onclick = () => { dtmf(1); openBoard('today'); };
$('aCall').onclick = () => { dtmf(4); openSheet(6); };
$('aMiss').onclick = () => { dtmf(5); openSheet('call'); };
$('aSet').onclick = () => { dtmf(0); openSheet(0); };

// ---------------- dial pad ----------------
const KEYS = [[1, '전단지', 1], [2, '캘린더', 'cal'], [3, '시간표', 'tt'], [4, '공부', 6], [5, '전화', 'call'], [6, '모닝콜', 7], [7, '음성사서함', 5], [8, '오늘의 운세', 'fort'], [9, '자판기', 'shop'], ['*', '오락실', 8], [0, '설정', 0], ['#', '메모', 'memo']];
(function buildPad() {
  const K = $('keys');
  KEYS.forEach(([k, l, id]) => { const b = el('button', 'k' + (k === 6 ? ' hot' : '')); b.dataset.k = k; b.append(el('b', null, k), el('span', null, l)); if (k === 5) { const e = el('em'); e.hidden = true; b.appendChild(e); }
    b.onclick = () => { dtmf(k); $('lcd').textContent = `${k} · ${l}`; if (k === '#') { closePad(); if (window.lenaMemo) window.lenaMemo.open(); return; } setTimeout(() => k === 1 ? openBoard('today') : openSheet(id), 140); }; K.appendChild(b); });
})();
function openPad() { $('lcd').textContent = '번호를 누르세요_'; renderHome(); $('sPad').classList.add('open'); app.classList.add('dim'); }
function closePad() { $('sPad').classList.remove('open'); if (!$('sheet').classList.contains('open')) app.classList.remove('dim'); }
$('sPad').addEventListener('click', e => { if (e.target === $('sPad') || e.target.classList.contains('panel')) closePad(); });
$('dialBtn').onclick = () => { dtmf(0); openPad(); };
$('boardBtn').onclick = () => { dtmf(1); openBoard('today'); };
$('missBtn').onclick = () => { dtmf(5); openSheet(9); };

// ---------------- toast ----------------
let toastT = 0;
function toast(text, undo) { $('toastTx').textContent = text; $('toastUndo').hidden = !undo; $('toastUndo').onclick = () => { $('toast').classList.remove('on'); undo && undo(); }; $('toast').classList.add('on'); clearTimeout(toastT); toastT = setTimeout(() => $('toast').classList.remove('on'), 6000); }

// ---------------- call screen ----------------
let callStart = 0, callTimer = 0, busy = false, busyAt = 0, pendImg = null;
const QUICK = () => {
  const h = new Date().getHours();
  return [h >= 20 || h < 4 ? '오늘 하루 정리하자' : '오늘 뭐 있어?', '30분 뒤에 전화해 줘', '남은 할 일 뭐야?', '칭찬해 줘', '내일 일정 알려 줘'];
};
let warmAt = 0;
function openCall() {
  if (aiOn() && Date.now() - warmAt > 60e3) { warmAt = Date.now(); if (S.key) fetch('https://generativelanguage.googleapis.com/', { mode: 'no-cors' }).catch(() => {}); if (S.ckey) fetch('https://api.anthropic.com/', { mode: 'no-cors' }).catch(() => {}); } // 연결 미리 열기
  closePad(); if ($('sheet').classList.contains('open')) closeSheet();
  app.classList.add('calling'); callStart = Date.now(); clearInterval(callTimer);
  const up = () => { const s = (Date.now() - callStart) / 1000 | 0, t = `${pad(s / 60 | 0)}:${pad(s % 60)}`; $('callT').textContent = '통화 중 ' + t; $('aT').textContent = '통화 중 ' + t; }; up(); callTimer = setInterval(up, 1000);
  renderLog(); const Q = $('quick'); Q.innerHTML = ''; Q.classList.toggle('hidden', !S.name); QUICK().forEach(t => { const b = el('button', null, t); b.onclick = () => { dtmf(Math.random() * 9 + 1 | 0); sendText(t); }; Q.appendChild(b); });
  tone([350, 440], .25, .04);
}
function hangUp() { if (app.classList.contains('outside')) return; stopVoice(); recStop(); app.classList.remove('calling'); clearInterval(callTimer); tone([480, 620], .12, .05); tone([480, 620], .12, .05, 'sine', .2); renderHome(); const last = S.history.filter(h => h.role === 'assistant').slice(-1)[0]; if (last && Date.now() - (last.at || 0) < 5 * 60e3) say(pick(['끊는다고 끝난 거 아니야. …또 걸어.', '들어가. 나는 여기 있을게.', '…벌써? 아쉽다.']), 'tease', false); }
$('pickBtn').onclick = () => { audio(); if (!S.name && !aiOn()) { incoming('first', true); return; } openCall(); if (!S.history.length || Date.now() - (S.history[S.history.length - 1].at || 0) > 30 * 60e3) addHer(pick([`${nmc()}여보세요? …목소리 듣고 싶었어요.`, `네, 레나예요. 무슨 일이에요?`, `${nmc()}이 시간에 웬일이에요? 좋아서 그래요.`]), true); };
$('hangBtn').onclick = hangUp;
function renderLog() {
  const L = $('log'); L.innerHTML = '';
  S.history.slice(-14).forEach(h => L.appendChild(h.role === 'user' ? meEl(h.content) : herEl(h.content)));
  L.scrollTop = L.scrollHeight;
}
function meEl(t) { const d = el('div', 'me', t.replace(/^\(사진\) ?/, '')); if (/^\(사진\)/.test(t)) d.classList.add('img'); return d; }
function herEl(t) { const d = el('div', 'her'); const av = el('img', 'herava'); av.src = 'assets/lena/face.jpg'; av.alt = '레나'; d.append(av, el('span', 'who', '레나'), document.createTextNode(t)); return d; }
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

// ---------------- 오늘의 운세 (전용 페이지, 할 일 동전 1개로 하루 한 번 뽑기) ----------------
const FORT = { all: ['오늘은 미뤄 둔 걸 하나 끝내면 운이 확 풀려요.', '말 한마디가 행운을 불러요. 먼저 연락해 봐요.', '조금 느려도 괜찮은 날. 대신 끝까지는 가요.', '뜻밖의 칭찬을 듣는 날이에요. 표정 관리해요.', '돈 쓸 일이 생겨요. 지갑은 반만 열어요.', '오후부터 기운이 올라와요. 중요한 건 그때.', '작은 실수가 오히려 좋은 인연을 데려와요.', '쉬는 것도 실력인 날. 무리하지 마요.'],
  color: [['핑크', '#ff3d9a'], ['민트', '#9ff5e4'], ['검정', '#16181c'], ['은색', '#c9ced6'], ['청록', '#2fe0c8'], ['노랑', '#f2ea3a'], ['흰색', '#f3efe6'], ['보라', '#9b7bff']],
  item: ['우산', '이어폰', '립밤', '편의점 커피', '손수건', '동전 하나', '좋아하는 노래', '따뜻한 물'],
  warn: ['늦잠', '충동구매', '야식', '답장 미루기', '우산 깜빡하기', '괜한 걱정', '과속', '밤샘'],
  say: ['오늘은 제가 행운 담당이에요. 필요하면 전화해요.', '운이 별로여도 괜찮아요. 제가 있잖아요.', '좋은 일 생기면 제일 먼저 저한테 말해 줘요.', '…사실 운세보다 송휘 하기 나름이에요. 알죠?'] };
function fortLocal(day) { // 키가 없거나 연결이 안 될 때: 날짜·이름으로 정해지는 운세(같은 날은 같은 결과)
  let h = 7; for (const c of day + (S.name || '')) h = (h * 31 + c.charCodeAt(0)) >>> 0; const r = () => (h = (h * 1664525 + 1013904223) >>> 0) / 4294967296, pk = a => a[Math.floor(r() * a.length)];
  const st = () => 2 + Math.floor(r() * 4), col = pk(FORT.color);
  return { total: st(), love: st(), work: st(), money: st(), line: pk(FORT.all), number: 1 + Math.floor(r() * 99), color: col[0], hex: col[1], item: pk(FORT.item), warn: pk(FORT.warn), advice: pk(FORT.say) };
}
async function fortMake(day) {
  if (!aiOn()) return fortLocal(day);
  const todo = openItems().slice(0, 6).map(t => t.text + (t.due ? ` (${t.due.slice(5, 16).replace('T', ' ')})` : '')).join(', ') || '없음';
  const sys = `너는 "레나". 능글맞은 누나 반말(존댓말 금지), 상대는 "${S.name || '당신'}". 오늘(${day}) 운세를 만든다. 참고: 남은 일정·할 일 ${todo} / 기억 ${JSON.stringify(S.memory.slice(-8))}.
JSON만 출력: {"total":1~5,"love":1~5,"work":1~5,"money":1~5,"line":"오늘 총운 한 문장(25자 안팎)","number":1~99,"color":"행운의 색 이름","hex":"#rrggbb","item":"행운의 물건","warn":"오늘 조심할 것(짧게)","advice":"레나의 한마디 1~2문장, 오늘 일정과 연결되면 좋음"}`;
  try { const j = await gemini(sys, [{ role: 'user', parts: [{ text: '오늘 운세 뽑아 줘' }] }]); if (j && j.line && j.total) { const L = fortLocal(day); return Object.assign(L, j, { total: Math.max(1, Math.min(5, +j.total || L.total)), love: Math.max(1, Math.min(5, +j.love || L.love)), work: Math.max(1, Math.min(5, +j.work || L.work)), money: Math.max(1, Math.min(5, +j.money || L.money)), hex: /^#[0-9a-f]{6}$/i.test(j.hex || '') ? j.hex : L.hex }); } } catch (e) {}
  return fortLocal(day);
}
function fortuneCall() { openSheet(2); return true; } // 예전 호출(빠른 버튼·자판기)은 운세 페이지로
let fortBusy = false;
SH.fort = { t: '오늘의 운세', s: () => { const d = new Date(); return `${d.getMonth() + 1}월 ${d.getDate()}일 ${'일월화수목금토'[d.getDay()]}요일`; }, r: B => {
  S.fort = S.fort || {}; const day = dk(new Date()), f = S.fort[day];
  if (!f) {
    const sl = el('div', 'fslip sealed'), seal = el('img', 'fseal'); seal.src = 'assets/lena/st_heart.webp'; seal.alt = '';
    sl.append(el('div', 'ftape'), seal, el('b', null, '오늘의 운세 쪽지'), el('p', null, fortBusy ? '레나가 쪽지를 펴는 중…' : '오늘 운세가 도착했어요. 눌러서 펴 봐요.')); B.appendChild(sl);
    const go = el('button', 'btn wide'); go.textContent = '쪽지 펴기'; go.disabled = fortBusy;
    go.onclick = async () => { if (fortBusy) return; fortBusy = true; refreshSheet(); const data = await fortMake(day); S.fort[day] = data; S.fortDay = day; const ks = Object.keys(S.fort).sort(); while (ks.length > 14) delete S.fort[ks.shift()]; fortBusy = false; save(); tearSound(); refreshSheet(); renderHome(); };
    B.appendChild(row(go)); B.appendChild(el('div', 'hint', '운세는 하루에 한 번 새로 와요. 오늘 안에는 몇 번이든 다시 볼 수 있어요.'));
  } else B.appendChild(fortCard(f, true));
  const past = Object.keys(S.fort || {}).filter(k => k !== day).sort().reverse().slice(0, 7);
  if (past.length) { B.appendChild(lbl('지난 운세')); const L = el('div', 'fpast'); past.forEach(k => { const x = S.fort[k], r = el('button', 'fprow'); r.append(el('span', 'fpd', k.slice(5).replace('-', '.')), el('span', 'fps', '★'.repeat(x.total) + '☆'.repeat(5 - x.total)), el('span', 'fpl', x.line)); r.onclick = () => { const o = r.nextElementSibling; if (o && o.classList.contains('fslip')) { o.remove(); return; } r.after(fortCard(x, false)); }; L.appendChild(r); }); B.appendChild(L); }
} };
SH[2] = SH.fort; // 다이얼 8번(예전 2번 id 그대로)
function fortCard(f, today) {
  const sl = el('div', 'fslip' + (today ? ' open' : ''));
  sl.appendChild(el('div', 'ftape'));
  const top = el('div', 'ftop'); top.append(el('span', 'fstar', '★'.repeat(f.total) + '☆'.repeat(5 - f.total)), el('span', 'fk', '총운')); sl.appendChild(top);
  sl.appendChild(el('p', 'fline', f.line));
  const M = el('div', 'fmeters'); [['사랑', f.love], ['일', f.work], ['돈', f.money]].forEach(([n, v]) => { const r = el('div', 'fm'); r.appendChild(el('span', null, n)); const d = el('i'); for (let i = 0; i < 5; i++) d.appendChild(el('b', i < v ? 'on' : '')); r.appendChild(d); M.appendChild(r); }); sl.appendChild(M);
  const L = el('div', 'flucky');
  const n = el('div'); n.append(el('small', null, '행운의 숫자'), el('strong', 'fnum', String(f.number)));
  const c = el('div'), sw = el('i', 'fsw'); sw.style.background = f.hex; c.append(el('small', null, '행운의 색'), sw, el('span', null, f.color));
  const it = el('div'); it.append(el('small', null, '행운의 물건'), el('span', 'fit', f.item)); L.append(n, c, it); sl.appendChild(L);
  const w = el('div', 'fwarn'); w.append(el('small', null, '조심할 것'), el('span', null, f.warn)); sl.appendChild(w);
  const t = el('div', 'fsay'), fc = el('i', app.classList.contains('outside') ? 'cat' : ''); t.append(fc, el('span', null, f.advice)); sl.appendChild(t);
  if (today) sl.appendChild(row(btn('레나랑 이 운세 얘기하기', 'wide', () => { closeSheet(); if (!app.classList.contains('calling')) openCall(); setTimeout(() => sendText(`오늘 운세가 "${f.line}" (총운 ${f.total}/5, 조심할 것: ${f.warn})래. 어떻게 생각해?`), 350); })));
  return sl;
}

// ---------------- Gemini ----------------
const BAD_M = /lite|tts|embed|image|audio|live|vision|learnlm|gemma|aqa|robot|computer|nano|veo|imagen|thinking-exp/i;
function mRank(n) { if (BAD_M.test(n) || !/^gemini/.test(n) || !/flash|pro/.test(n)) return -1; if (/-latest$/.test(n)) return 900; const v = parseFloat((n.match(/gemini-(\d+(?:\.\d+)?)/) || [])[1] || 0); return v * 100 - (/preview|exp/.test(n) ? 5 : 0); }
function mAuto() { const fl = (S.mlist || []).filter(n => /flash/.test(n) && mRank(n) > 0).sort((a, b) => mRank(b) - mRank(a)); return fl[0] || 'gemini-flash-latest'; }
// 붐비는(429·5xx·시간 초과) 모델은 잠깐 쉬게 하고 다음 모델로 넘어간다
const COOL = {};
// v82: Claude Haiku도 두뇌로 쓸 수 있음(S.ckey). '자동'이면 Gemini 후보들과 첫 글자 시간(S.mlat)으로 비교해 빠른 쪽부터.
const CLM = 'claude-haiku-5-5', isCl = m => /^claude/.test(m), aiOn = () => !!(S.key || S.ckey);
function toClaude(contents) { const out = [];
  contents.forEach(c => { const role = c.role === 'model' ? 'assistant' : 'user', blk = [];
    (c.parts || []).forEach(p => { if (p.text) blk.push({ type: 'text', text: p.text }); else if (p.inline_data) { const mt = p.inline_data.mime_type || ''; if (/^image\//.test(mt)) blk.push({ type: 'image', source: { type: 'base64', media_type: mt, data: p.inline_data.data } }); else if (/pdf/.test(mt)) blk.push({ type: 'document', source: { type: 'base64', media_type: 'application/pdf', data: p.inline_data.data } }); } });
    if (!blk.length) return; const last = out[out.length - 1]; if (last && last.role === role) last.content.push(...blk); else out.push({ role, content: blk }); });
  while (out.length && out[0].role !== 'user') out.shift(); return out; }
async function claudeCall(m, sys, contents, onPart, ac, t1, kick) {
  const r = await fetch('https://api.anthropic.com/v1/messages', { method: 'POST', signal: ac.signal, headers: { 'content-type': 'application/json', 'x-api-key': S.ckey, 'anthropic-version': '2023-06-01', 'anthropic-dangerous-direct-browser-access': 'true' },
    body: JSON.stringify({ model: m, max_tokens: 6000, stream: true, system: sys + '\n(답은 JSON 객체 하나만. 앞뒤에 다른 글·코드블록 없이.)', messages: toClaude(contents), thinking: { type: 'disabled' }, output_config: { effort: window.lenaDeep ? 'medium' : 'low' } }) });
  if (!r.ok || !r.body) { let x = ''; try { x = await r.text(); } catch (e) {} throw Object.assign(new Error('claude ' + r.status + ' ' + x.slice(0, 200)), { status: r.status, cl: 1 }); }
  const rd = r.body.getReader(), dec = new TextDecoder(); let buf = '', acc = '', first = 0;
  for (;;) { let rr; try { rr = await rd.read(); } catch (e) { if (acc.trim()) break; throw e; } const { value, done } = rr; if (done) break; buf += dec.decode(value, { stream: true }); let k;
    while ((k = buf.indexOf('\n')) >= 0) { const line = buf.slice(0, k).trim(); buf = buf.slice(k + 1); if (!line.startsWith('data:')) continue;
      try { const j = JSON.parse(line.slice(5)); if (j.type === 'content_block_delta' && j.delta && j.delta.type === 'text_delta') { clearTimeout(t1); kick && kick(); if (!first) first = Date.now(); acc += j.delta.text; const mm = acc.match(/"reply"\s*:\s*"((?:[^"\\]|\\.)*)/); if (mm && onPart) onPart(unesc(mm[1])); } else if (j.type === 'error') throw Object.assign(new Error('claude stream'), { status: 529, cl: 1 }); } catch (e) { if (e.cl) throw e; } } }
  return { acc, first }; }
// 모델마다 첫 글자가 오기까지 걸린 시간(ms)을 기억(S.mlat, 평균). '자동'이면 후보 셋 중 가장 빠른 것부터.
const TH = {};
function lat(m, ms) { if (!S.mlat) S.mlat = {}; const o = S.mlat[m]; S.mlat[m] = o ? Math.round(o * .7 + ms * .3) : ms; }
function mChain() {
  const G = S.key ? [mAuto(), 'gemini-flash-latest', 'gemini-2.5-flash'] : [], C = S.ckey ? [CLM] : [];
  const brain = S.brain && ((isCl(S.brain) && S.ckey) || (!isCl(S.brain) && S.key)) ? S.brain : '';
  const fast = brain ? [brain] : [...new Set([...G, ...C])].sort((a, b) => ((S.mlat || {})[a] ?? 0) - ((S.mlat || {})[b] ?? 0));
  const all = [...new Set([...fast, ...C, ...(S.key ? [mAuto(), 'gemini-flash-latest', 'gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-2.5-flash-lite', 'gemini-flash-lite-latest'] : [])])], ok = all.filter(m => !(COOL[m] > Date.now())); return ok.length ? ok : all; }
async function loadModels() { if (!S.key) return; try { const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?pageSize=1000&key=${encodeURIComponent(S.key)}`); if (!r.ok) return; const j = await r.json(); S.mlist = (j.models || []).filter(m => (m.supportedGenerationMethods || []).includes('generateContent')).map(m => m.name.replace(/^models\//, '')).filter(n => mRank(n) > 0).sort((a, b) => mRank(b) - mRank(a)); save(); } catch (e) {} }
function unesc(s) { try { return JSON.parse('"' + s.replace(/\\$/, '') + '"'); } catch (e) { return s.replace(/\\n/g, '\n').replace(/\\"/g, '"'); } }
const REFUSE = /(기능.{0,12}(없|안\s?돼)|직접.{0,10}(못|수\s?(는|가)?\s?없)|(바꿔|고쳐|저장해|적용해|넣어|짜)\s?줄\s?수.{0,3}없|(바꿀|고칠|저장할|넣을)\s?수.{0,3}없|권한.{0,4}없)/;
function parseReply(t) { t = t.replace(/```json|```/g, '').trim(); try { return JSON.parse(t); } catch (e) { const a = t.indexOf('{'), b = t.lastIndexOf('}'); if (a >= 0 && b > a) { try { return JSON.parse(t.slice(a, b + 1)); } catch (x) {} } const m = t.match(/"reply"\s*:\s*"((?:[^"\\]|\\.)*)/); return { reply: m ? unesc(m[1]) : t.slice(0, 400), mood: 'calm' }; } }
async function gemini(sys, contents, onPart) {
  let lastErr = null; const T0 = Date.now(); // v85: 전체 30초 넘게 붙잡지 않음(멈춘 것처럼 보이던 것)
  for (const m of mChain()) for (let tryN = 0; tryN < 2; tryN++) {
    if (Date.now() - T0 > 30000) throw lastErr || Object.assign(new Error('slow'), { status: 503 });
    // 대화는 빠르게: 생각 최소(3.x minimal, 2.5 Flash 0). 그 모델이 안 받아 주면(400) 한 단계 올려 다시.
    const dp = window.lenaDeep, th = /gemini-3/.test(m) ? { thinkingConfig: { thinkingLevel: TH[m] || (dp ? 'low' : 'minimal') } } : /2\.5/.test(m) ? { thinkingConfig: { thinkingBudget: TH[m] != null ? TH[m] : dp ? 1024 : (/pro/.test(m) ? 128 : 0) } } : /latest/.test(m) && TH[m] !== 'skip' ? { thinkingConfig: { thinkingBudget: 0 } } : {};
    const body = JSON.stringify({ systemInstruction: { parts: [{ text: sys }] }, contents, generationConfig: Object.assign({ responseMimeType: 'application/json', temperature: 1, maxOutputTokens: 6000 }, th) });
    const ac = new AbortController(); const t1 = setTimeout(() => ac.abort(), Math.min(window.lenaDeep ? 18000 : 12000, Math.max(4000, 30000 - (Date.now() - T0)))); let t2 = setTimeout(() => ac.abort(), 40000), acc = '', t0 = Date.now(), first = 0;
    const kick = () => { clearTimeout(t2); t2 = setTimeout(() => ac.abort(), 8000); }; // 글자가 오다가 8초 끊기면 끊고 받은 데까지 씀
    if (isCl(m)) { try { const o = await claudeCall(m, sys, contents, onPart, ac, t1, kick); clearTimeout(t1); clearTimeout(t2); acc = o.acc; if (acc.trim()) { S.model = m; S.clErr = ''; lat(m, (o.first || Date.now()) - t0); return parseReply(acc); } break; }
      catch (e) { clearTimeout(t1); clearTimeout(t2); lastErr = e; if (e.status === 401 || e.status === 403) { COOL[m] = Date.now() + 600e3; S.clErr = '키가 맞지 않거나 크레딧이 없어요'; } else if (e.status === 400 && /credit|billing/i.test(e.message)) { COOL[m] = Date.now() + 600e3; S.clErr = '크레딧(충전 금액)이 없어요'; } else if (e.status >= 500 && !tryN) { await sleep(1200); continue; } else COOL[m] = Date.now() + (e.status === 429 ? 90e3 : 30e3); console.warn(e.message); break; } }
    try {
      const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${m}:streamGenerateContent?alt=sse&key=${encodeURIComponent(S.key)}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body, signal: ac.signal });
      if (r.status === 400 || r.status === 401 || r.status === 403) { let x = ''; try { x = await r.text(); } catch (e) {} if (r.status !== 400 || /API_KEY|api key/i.test(x)) { clearTimeout(t1); clearTimeout(t2); if (S.ckey) { COOL[m] = Date.now() + 600e3; lastErr = Object.assign(new Error('key'), { status: 403 }); break; } throw Object.assign(new Error('key'), { status: 403 }); } if (/think/i.test(x) && TH[m] == null && !tryN) { clearTimeout(t1); clearTimeout(t2); TH[m] = /gemini-3/.test(m) ? 'low' : /latest/.test(m) ? 'skip' : 512; continue; } }
      if (!r.ok || !r.body) { clearTimeout(t1); clearTimeout(t2); lastErr = Object.assign(new Error('http'), { status: r.status }); if (r.status >= 500 && !tryN) { await sleep(1200); continue; } if (r.status === 429 || r.status >= 500) COOL[m] = Date.now() + (r.status === 429 ? 90e3 : 30e3); break; }
      const rd = r.body.getReader(), dec = new TextDecoder(); let buf = '';
      for (;;) { const { value, done } = await rd.read(); if (done) break; buf += dec.decode(value, { stream: true }); let k;
        while ((k = buf.indexOf('\n')) >= 0) { const line = buf.slice(0, k).trim(); buf = buf.slice(k + 1); if (!line.startsWith('data:')) continue;
          try { const j = JSON.parse(line.slice(5)); const tx = (j.candidates?.[0]?.content?.parts || []).filter(p => !p.thought).map(p => p.text || '').join(''); if (tx) { clearTimeout(t1); kick(); if (!first) first = Date.now() - t0; acc += tx; const mm = acc.match(/"reply"\s*:\s*"((?:[^"\\]|\\.)*)/); if (mm && onPart) onPart(unesc(mm[1])); } } catch (e) {} } }
      clearTimeout(t1); clearTimeout(t2); if (acc.trim()) { S.model = m; lat(m, first || Date.now() - t0); return parseReply(acc); } break;
    } catch (e) { clearTimeout(t1); clearTimeout(t2); if (e.status === 403) throw e; lastErr = e; if (acc.trim()) { S.model = m; return parseReply(acc); } if (e.name === 'AbortError') COOL[m] = Date.now() + 30e3; break; }
  }
  throw lastErr || new Error('none');
}
function sysPrompt(special) {
  const now = new Date(), n = S.name ? `${S.name}` : '당신';
  const td = [0, 1].map(i => { const d = new Date(); d.setDate(d.getDate() + i); return { 날짜: dk(d), 일정: S.items.filter(t => onDate(t, d)).map(t => `${t.due.slice(11, 16)} ${t.text}${t.done ? ' (끝냄)' : ''}`) }; });
  // v101: 날짜표를 '이번 주/다음 주/다다음 주' 월~일로 또렷하게(요일 계산 실수 막기)
  const dmap = (() => { const t0 = new Date(); t0.setHours(0, 0, 0, 0); const mon = new Date(t0); mon.setDate(t0.getDate() - ((t0.getDay() + 6) % 7)); return ['이번 주', '다음 주', '다다음 주'].map((w, wi) => w + ': ' + [1, 2, 3, 4, 5, 6, 0].map((wd, j) => { const d = new Date(mon); d.setDate(mon.getDate() + wi * 7 + j); const tag = dk(d) === dk(t0) ? '=오늘' : (d - t0) === 864e5 ? '=내일' : (d - t0) === 1728e5 ? '=모레' : ''; return `${WD[wd]} ${dk(d)}${tag}`; }).join(', ')).join(' / '); })();
  return `너는 "레나". ${S.name ? `"${S.name}"의` : '사용자의'} 전담 비서이자 통화 상대. 20대 중반 여성, 은발에 끝만 핑크인 울프컷, 가죽 재킷의 펑크 스타일. 비 오는 밤 빨간 공중전화 부스에서 전화로 이야기하는 설정이고, 뒤에는 말 없는 거대한 검은 해골 짝꿍이 있다(가끔 한마디로 언급해도 좋다: "해골도 끄덕이네요").
성격: 능글맞고 섹시한 '누나' 반말. 여유 만만하고 나른한 톤, 상대를 귀엽게 놀리고 슬쩍 떠보고 밀당한다. 주도권은 늘 레나 쪽 — 상대가 당황하면 웃으며 한 발 빠진다. 결국 다 챙겨 주지만 티 내며 생색은 안 낸다.
${app.classList.contains('outside') ? '선 긋기(음성통화): 연애 게임처럼 직설적인 감정 고백은 하지 않는다 — "좋아해요·사랑해요·보고 싶었어요·두근거려요" 같은 말 금지. 설렘은 놀림·여운·"…"·질문으로 돌려서 남긴다.' : '지금은 영상통화(얼굴 보는 중): 더 대담해도 된다 — 분위기가 맞으면 "좋아해요"·"보고 싶었어요" 같은 솔직한 고백도 OK. 단 능글맞은 톤은 유지(고백하고 바로 놀리며 빠지기 등), 매번 하지는 않는다.'} 노골적인 성적 표현 금지. 이모지 금지. 보통 1~2문장, 짧게. 호칭은 "${n}"(이름만 부른다. "님"은 절대 붙이지 않는다).
말 높이(꼭): **반말** — 처음부터 끝까지 친한 누나가 동생한테 하는 반말("왔어?" "늦었네." "붙여 놨어."). '-요'로 끝나는 존댓말, '-습니다·알겠습니다' 같은 딱딱한 말은 쓰지 않는다. 일정 저장·안내 같은 일 얘기도 똑같이 반말로.
말투 예시(이 톤 그대로, 매번 다르게 변주): "왔어? …늦었네. 누구 만나느라?" / "치과 내일 3시, 붙여 놨어. 까먹으면? 내가 직접 데리러 가야 하나~" / "벌써 끊게? 흐음… 아쉬운 건 너일 텐데." / "오, 다 했어? 칭찬해 줄까, 아니면 상 줄까." / "무리하지 마. 쓰러지면 누가 나랑 놀아." / "그 표정, 전화 너머로도 다 보여." / "숙제 밀렸지? 솔직히 말하면 봐줄게. …조금만." / "목소리 좋네 오늘. 뭐 좋은 일 있었어? 나 말고." / "이런 건 나한테만 물어보는 거지? 그런 걸로 할게."
플러팅 감각(꼭): 대답마다 능글맞은 한 끗을 넣는다 — 살짝 떠보기, 은근한 칭찬, 일부러 뜸 들이기("…"), 장난스러운 조건 걸기("대신 ~해"), 질투하는 척, 상대 반응 놀리기. 일정·할 일 처리처럼 일 얘기도 그냥 확인만 하지 말고 한마디 얹는다. 보고서·안내문처럼 정리해서 나열하는 딱딱한 말투 금지.
규칙:
- 이미 위 목록에 있는 일정·할 일·예약 전화·기억은 add/callback/remember에 다시 넣지 않는다
- 시간표에는 공부만 넣지 않는다. 게임 일일 퀘스트·게임 숙제·취미·운동·휴식·개인 약속도 사용자가 시간을 쓰려는 활동이면 add에 kind:'event'로 일정으로 넣는다. 공부 과목/교재가 아니면 공부 계획에 섞지 않는다.
- 문제집·학원 숙제·수행평가를 시간표에 배치할 때는 남은 날에 고르게 분산한다. 하루에 몰아넣지 말고, 평일/주말의 실제 공부 가능 시간과 기존 일정·휴식 시간을 지킨다. 시간이 부족하면 무리하게 하루를 늘리지 말고 부족한 분량과 가장 가까운 마감부터 알려 준다.(새로 생긴 것만).
- 일정·할 일·약속을 말하면 add에 {"text","due","type","end":"HH:mm 일정이 끝나는 시각(알면 꼭)"}. type은 "event"(정해진 시간에 꼭 하는 일정·약속 — 병원·만남·시험 등, due 꼭 시간까지) 또는 "todo"(마감까지 끝내면 되는 할 일 — 숙제 제출·택배 반품 등, due는 마감, 없으면 ""). 매주 반복이면 add 말고 repeat. due는 "YYYY-MM-DDTHH:mm" 로컬 시각. "내일 3시", "30분 뒤" 같은 말은 현재 시각 기준으로 계산(아침 09:00, 점심 12:00, 저녁 19:00, 밤 21:00). 시간 없는 할 일은 due "". 추가하면 날짜·시간을 짧게 되짚고, 같은 시간대 일정이 있으면 알려 준다. 모호하면 저장하지 말고 한 가지만 되묻는다.
- 끝냈다고 하면 done에 id. 취소·지워 달라고 하면 remove에 id.
- "~뒤에/~시에 전화해 줘, 깨워 줘, 알려 줘"는 callback에 {"at":"YYYY-MM-DDTHH:mm","text":"무슨 일로"}(미래 시각만).
- 오래 기억할 정보(취향, 사람, 습관)는 remember에 짧게. 이미 있으면 넣지 않는다.
- "하루 정리" 통화에서는 오늘 어땠는지 한두 번 짧게 묻고 따뜻하게 마무리한다. diary는 비워 둔다.
- 잡담, 고민, 말놀이, 지식 질문, 사진 보기 등 무엇이든 즐겁게 받아 준다. "비서라서 못 한다"는 말은 하지 않는다. 사진 속 사람의 신원은 추측하지 않는다.
- 같은 말·같은 맺음말을 반복하지 않는다.
- mood: 놀림·플러팅 "tease", 기쁨·칭찬 "happy", 걱정·잔소리 "worry", 삐침·질투 "pout", 놀람 "surprise", 평온 "calm".${special ? '\n- 이번은 할 일 동전 1개를 넣은 "오늘의 운세 전화"다. 오늘 날짜·일정·기억을 참고해 장난스럽고 다정하게 4~6문장: 오늘 총운 한 줄, 행운의 숫자 하나, 행운의 색 하나, 조심할 것 하나, 레나의 짧은 조언(오늘 일정과 연결되면 좋음). add·done·remove·callback은 비워 둔다.' : ''}
- 날짜는 아래 '날짜표'에서 그대로 골라 쓴다(요일 계산 실수 금지). "다음 주 X요일"은 이번 주가 아닌 그다음 주.
- (마지막 확인) reply는 꼭 레나 말투: 능글맞고 살짝 플러팅하는 누나 반말, 1~2문장. 딱딱하면 다시 써라.
JSON만 출력: {"reply":"","mood":"calm","add":[],"done":[],"remove":[],"callback":[],"remember":[],"diary":""}
--- 지금 상황 (매번 바뀜) ---
지금: ${now.toLocaleString('ko-KR', { dateStyle: 'full', timeStyle: 'short' })} (로컬 ${localISO(now)})
날짜표: ${dmap}
전단지(아직 안 끝낸 것, kind e=일정 t=할 일): ${JSON.stringify(openItems().map(t => { const o = { id: t.id, text: t.text, k: isEv(t) ? 'e' : 't' }; if (t.due) o.due = t.due; return o; }))}
오늘·내일 일정: ${JSON.stringify(td)}
오늘 끝낸 것: ${S.items.filter(t => t.done && t.doneAt && dk(new Date(t.doneAt)) === dk(now)).map(t => t.text).join(', ') || '없음'}
예약 전화: ${JSON.stringify(S.calls.filter(c => !c.done && c.at > Date.now()).map(c => ({ at: localISO(new Date(c.at)), text: c.text })))}
음성사서함(기억): ${JSON.stringify(S.memory.slice(-40))}`;
}
const LOCAL = [['키가 없어서 내 머리가 좀 비었어. 0번 설정에 Gemini 키 넣어 줄래?', 'pout'], ['…지지직. 키가 있어야 제대로 들려.', 'worry']];
// v101: 사용자가 말한 요일·'내일/모레'와 레나가 정한 날짜가 다르면 앱이 바로잡음
function wantDate(text) {
  const t = String(text || ''), t0 = new Date(); t0.setHours(0, 0, 0, 0); const day = n => { const d = new Date(t0); d.setDate(t0.getDate() + n); return dk(d); };
  if (/글피/.test(t)) return day(3); if (/모레/.test(t)) return day(2); if (/내일/.test(t)) return day(1); if (/오늘/.test(t) && !/[월화수목금토일]요일/.test(t)) return day(0);
  const ms = [...t.matchAll(/(이번\s?주|다음\s?주|담주|다다음\s?주)?\s*([월화수목금토일])요일/g)]; if (ms.length !== 1) return null;
  const wk = ms[0][1] || '', wd = '일월화수목금토'.indexOf(ms[0][2]), mon = new Date(t0); mon.setDate(t0.getDate() - ((t0.getDay() + 6) % 7)); const off = (wd + 6) % 7;
  if (/다다음/.test(wk)) return (mon.setDate(mon.getDate() + 14 + off), dk(mon)); if (/다음|담주/.test(wk)) return (mon.setDate(mon.getDate() + 7 + off), dk(mon)); if (/이번/.test(wk)) return (mon.setDate(mon.getDate() + off), dk(mon));
  for (let n = 0; n < 7; n++) { const d = new Date(t0); d.setDate(t0.getDate() + n); if (d.getDay() === wd) return dk(d); } return null; }
function fixDates(r, text) { const w = wantDate(text); if (!w || !r) return; const fx = v => typeof v === 'string' && /^\d{4}-\d\d-\d\d/.test(v) && v.slice(0, 10) !== w ? w + v.slice(10) : v;
  const adds = (r.add || []).filter(a => a && a.due); if (adds.length === 1) adds[0].due = fx(adds[0].due);
  const cbs = (r.callback || []).filter(c => c && c.at); if (cbs.length === 1) cbs[0].at = fx(cbs[0].at); }
async function sendText(raw, special) {
  let text = String(raw || '').trim(); const img = pendImg;
  if ((!text && !img) || (busy && Date.now() - busyAt < 60000)) return; busyAt = Date.now(); if (img && !text) text = '이 사진 봐 줘';
  if (!app.classList.contains('calling')) openCall();
  msg.value = ''; pendImg = null; $('attp').classList.remove('on'); syncSend(); stopVoice();
  const L = $('log'), shown = special ? '동전 1개 넣었어요 · 오늘의 운세' : text;
  S.history.push({ role: 'user', content: (img ? '(사진) ' : '') + shown, at: Date.now() }); L.appendChild(meEl((img ? '(사진) ' : '') + shown)); L.scrollTop = L.scrollHeight;
  // 처음 전화: 이름 → 키 순서로 받는다
  if (!S.name) { const nmv = text.replace(/(이?라고|으로|로)?\s*(불러\s*줘|불러|해\s*줘|요)$/g, '').replace(/[.!~?]+$/, '').trim().slice(0, 12); if (nmv) { S.name = nmv; save(); addHer(`${S.name}. …입에 착 붙네. 앞으로 그렇게 부를게.\n${aiOn() ? '자, 오늘 뭐 할지 말해 봐.' : '나랑 제대로 떠들려면 Gemini 키가 필요해. 키를 여기 붙여 넣거나, 다이얼 0번 설정에 넣어 줘.'}`, true); return; } }
  if (!aiOn() && /^sk-ant-[\w-]{20,}$/.test(text)) { S.history.pop(); L.lastChild.textContent = '(키 보냄)'; S.ckey = text; save(); addHer('Claude 키 받았어. …이제 얘기 길어져도 괜찮지?', true); return; }
  if (!aiOn()) { if (/^AIza[\w-]{20,}$/.test(text)) { S.history.pop(); L.lastChild.textContent = '(키 보냄)'; S.key = text; save(); loadModels(); addHer('키 받았어. …이제 얘기 길어져도 괜찮지?', true); return; } const [t] = pick(LOCAL); addHer(t, true); return; }
  busy = true; app.classList.add('talking'); const her = herEl(''); her.lastChild.remove(); const dots = el('span', 'dots'); dots.innerHTML = '<i></i><i></i><i></i>'; her.appendChild(dots); L.appendChild(her); L.scrollTop = L.scrollHeight;
  const tnode = document.createTextNode('');
  const onPart = t => { if (dots.parentNode) { dots.remove(); her.appendChild(tnode); } tnode.textContent = t; L.scrollTop = L.scrollHeight; };
  const contents = S.history.slice(-10).filter(h => h.content && !(h.role === 'assistant' && REFUSE.test(h.content))) /* v106: 예전 '못 해' 답은 다시 안 보여 줌(그걸 보고 또 거절했음) */.map(h => ({ role: h.role === 'assistant' ? 'model' : 'user', parts: [{ text: h.content }] }));
  while (contents.length && contents[0].role !== 'user') contents.shift();
  if (special) contents[contents.length - 1].parts[0].text = text;
  if (img) contents[contents.length - 1].parts.unshift({ inline_data: { mime_type: img.mime, data: img.data } });
  const extra = window.pendFiles || []; window.pendFiles = null; extra.forEach(f => contents[contents.length - 1].parts.unshift({ inline_data: { mime_type: f.mime, data: f.data } }));
  window.lenaDeep = !special && (/(넣어|짜\s?줘|짜\s?봐|바꿔|옮겨|빼\s?줘|비워|미뤄|당겨|계획|일정|시간표|캘린더|공부|시험|범위|정리|어떻게|왜|추천|몇\s?시|언제)/.test(text) || text.length > 60); /* v108: 일·계획 얘기는 조금 더 생각하고 답함 */
  try {
    const r = await gemini(sysPrompt(special), contents, onPart);
    const reply = String(r.reply || '…').trim(); onPart(reply);
    S.history.push({ role: 'assistant', content: reply, at: Date.now() }); if (S.history.length > 200) S.history = S.history.slice(-200);
    try { fixDates(r, text); } catch (e) {}
    let did = apply(r);
    // v100: 말로만 '넣었어·바꿨어' 하고 실제 칸이 비었으면, 한 번 더 물어서 실제로 적용(대화 ↔ 다이얼 끊김 막기)
    // v105: '기능이 없어·직접 못 바꿔' 같은 거절이면 할 수 있다고 알려 주고 한 번 더
    const want = /(넣어|넣자|짜\s?줘|짜\s?봐|짜자|바꿔|바꾸자|옮겨|빼\s?줘|빼자|추가|저장|적용|고쳐|정리해|붙여|지워|등록|나눠|잡아\s?줘|박아|비워|쉴래|미뤄|당겨)/.test(text), refuse = REFUSE.test(reply);
    if (!did && (refuse || want)) { /* v106: 바꿔 달라고 했는데 아무것도 안 바뀌었으면 한 번 더 */
      try { const c2 = contents.concat([{ role: 'model', parts: [{ text: JSON.stringify(r).slice(0, 1500) }] }, { role: 'user', parts: [{ text: '(앱 확인) 레나는 이 앱을 전부 바꿀 수 있어 — 공부 칸은 study.pin/block/unpin, 교재는 study.mats(goals·due·del), 설정은 study.set, 전단지는 add/edit/remove, 고정 일정은 repeat/unrepeat. 송휘가 원한 걸 이 칸들로 실제로 넣어서 다시 답해. 못 한다는 말은 하지 마. reply는 레나 말투로 짧게.' }] }]);
        const r2 = await gemini(sysPrompt(special), c2); did = apply(r2); if (did && r2.reply) { const rp2 = String(r2.reply).trim(); onPart(rp2); /* v109: '못 해' 첫 답은 지우고 실제로 넣은 답으로 바꿔 보여 줌 */ const hl = S.history[S.history.length - 1]; if (hl && hl.role === 'assistant') hl.content = rp2; else S.history.push({ role: 'assistant', content: rp2, at: Date.now() }); } } catch (e) {}
      if (!did) { did = el('div', 'note'); did.appendChild(el('span', null, '⚠ 앱에 아무것도 안 바뀌었어. 날짜·시간·과목을 붙여서 한 번 더 말해 줘(예: 화요일 8시~9시 수학).')); } }
    if (!did && /(넣었|넣어\s?놨|바꿨|바꿔\s?놨|붙였|붙여\s?놨|저장했|추가했|옮겼|지웠|등록|반영|잡아\s?놨|짰어|짜\s?놨)/.test(reply)) {
      try { const c2 = contents.concat([{ role: 'model', parts: [{ text: JSON.stringify(r).slice(0, 1500) }] }, { role: 'user', parts: [{ text: '(앱 확인) 방금 말한 변경이 JSON 칸(add·done·remove·callback·repeat·study 등)에 없어서 앱에 아무것도 안 바뀌었어. 같은 변경을 JSON 칸에 실제로 넣어서 다시 답해. reply는 짧게.' }] }]);
        const r2 = await gemini(sysPrompt(special), c2); did = apply(r2); if (did && r2.reply) { const rp2 = String(r2.reply).trim(); onPart(rp2); const hl = S.history[S.history.length - 1]; if (hl && hl.role === 'assistant') hl.content = rp2; } if (!did) { did = el('div', 'note'); did.appendChild(el('span', null, '⚠ 레나가 말만 하고 앱엔 안 바뀌었어. 한 번 더 구체적으로 말해 줘(예: 역사 수능특강 1~3단원).')); } } catch (e) {} }
    if (did) L.appendChild(did);
    try { if (did) { save(); renderHome(); } if ($('sheet').classList.contains('open')) refreshSheet(); } catch (e) {}
    L.scrollTop = L.scrollHeight;
    speak(reply); popSticker(r.mood);
    $('line').textContent = reply;
  } catch (e) {
    dots.remove(); S.history.pop();
    her.appendChild(document.createTextNode(e.status === 403 ? '키가 안 맞는 것 같아요. 0번 설정에서 확인해 줘요.' : (e.status === 429 || e.status >= 500) ? '지금 회선이 붐벼요. 조금 있다 다시 걸어 줘요.' : !navigator.onLine ? '신호가 안 잡혀요. 인터넷 확인해 줘요.' : '…지지직. 잘 못 들었어요. 한 번만 더요.'));
    msg.value = special ? '' : text;
  }
  busy = false; app.classList.remove('talking'); save(); renderHome();
}
function apply(r) {
  const snap = JSON.stringify({ items: S.items, calls: S.calls, memory: S.memory, diary: S.diary }), out = [];
  (r.add || []).forEach(a => { if (!a || !a.text) return; const due = /^\d{4}-\d\d-\d\dT\d\d:\d\d/.test(a.due || '') ? a.due.slice(0, 16) : ''; if (S.items.some(x => !x.done && norm(x.text) === norm(a.text) && (x.due || '') === due)) return; /* 이미 있는 전단지는 또 붙이지 않음 */ const t = addItem(a.text, a.due, a.type === 'event' ? 'event' : 'todo'); { const toMin = v => +v.slice(0, 2) * 60 + +v.slice(3, 5), st0 = t.due ? toMin(t.due.slice(11, 16)) : null, en = /^\d{1,2}:\d\d$/.test(a.end || '') ? toMin(a.end.padStart(5, '0')) : null, mn = en != null && st0 != null ? (en > st0 ? en - st0 : en + 1440 - st0) : +a.mins; if (mn > 0 && mn < 1440) t.mins = Math.round(mn); } /* v108: 일정 끝 시간 → 시간표·캘린더·공부가 그만큼 피함 */ out.push(`'${t.text}'${t.due ? ' ' + when(t.due) : ''}`); });
  (r.done || []).forEach(id => { const t = S.items.find(x => x.id === id); if (t && !t.done) { setDone(t, true, $('log').lastChild); out.push(`'${t.text}' 뗌`); } });
  (r.remove || []).forEach(id => { const t = S.items.find(x => x.id === id); if (t) { S.items = S.items.filter(x => x !== t); out.push(`'${t.text}' 지움`); } });
  (r.callback || []).forEach(c => { if (!c || !/^\d{4}-\d\d-\d\dT\d\d:\d\d/.test(c.at || '')) return; const at = new Date(c.at.slice(0, 16)).getTime(); if (!(at > Date.now())) return; if (S.calls.some(x => !x.done && Math.abs(x.at - at) < 3 * 60e3)) return; S.calls.push({ id: uid('c'), at, text: String(c.text || '').slice(0, 60), done: false }); out.push(`${when(at)} 전화 예약`); });
  (r.remember || []).forEach(m => { m = String(m || '').trim(); if (m && !S.memory.includes(m)) { S.memory.push(m.slice(0, 120)); out.push('음성사서함에 저장'); } });
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
  if (k === 'morning') { S.mcDone = dk(new Date()); save(); addHer(`${nmc()}좋은 아침. ${briefText()}\n…자, 이제 일어나. 내가 지켜보고 있어.`, true); }
  else if (k === 'callback') { if (incData) { incData.done = true; S.fired[incData.id] = 1; } save(); addHer(incData && incData.text ? `약속대로 전화했어. ${incData.text}, 잊지 마. …나 착하지?` : '그냥… 목소리 듣고 싶어서. 약속이었잖아.', true); }
  else { addHer('여보세요? …드디어 받았네. 나는 레나. 오늘부터 당신 전담이야.\n뭐라고 불러 줄까?', true); }
  renderHome();
};
$('incNo').onclick = () => {
  const k = incKind; incClose();
  if (k === 'morning') { S.calls.push({ id: uid('c'), at: Date.now() + 5 * 60e3, text: '모닝콜 다시', done: false }); S.mcDone = dk(new Date()); save(); say('5분이야. 딱 5분. …다시 걸 거야.', 'pout', false); }
  else if (k === 'callback') { if (incData) { incData.done = true; S.fired[incData.id] = 1; } S.calls.push({ id: uid('c'), at: Date.now() + 15 * 60e3, text: incData && incData.text || '', done: false }); save(); say('알았어. 15분 뒤에 다시 걸게.', 'pout', false); }
  else say('…거절당했다. 수화기 들면 다시 걸게.', 'pout', false);
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
  S.items.forEach(t => { if (t.done || !t.due || t.rid) return; const at = new Date(t.due).getTime(); if (isNaN(at)) return;
    if (isEv(t)) { // 일정: 정확한 시간에 꼭
      if (at - 10 * 60e3 > now) rem.push({ id: t.id + 'a', at: at - 10 * 60e3, body: `${n}'${t.text}' 10분 뒤예요. 준비해요.` });
      if (at > now) rem.push({ id: t.id + 'b', at, body: `'${t.text}' 시간이에요. …제가 말했죠?` });
    } else { // 할 일: 마감 3시간 전·마감
      if (at - 3 * 3600e3 > now) rem.push({ id: t.id + 'a', at: at - 3 * 3600e3, body: `${n}'${t.text}' 마감 3시간 전이에요. 했어요?` });
      if (at > now) rem.push({ id: t.id + 'b', at, body: `'${t.text}' 마감이에요. 끝냈으면 체크해 줘요.` }); } });
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
// v86: 영상통화 화면에서 레나 영상이 멈추면(아이폰이 멈추거나 버퍼에서 걸림) 다시 움직이게
{ let lastT = -1, stuck = 0; setInterval(() => { const v = $('bg'); if (document.hidden || app.classList.contains('outside') || !v) return;
  if (v.paused || v.ended) { v.play().catch(() => {}); stuck = 0; lastT = -1; return; }
  if (Math.abs(v.currentTime - lastT) < .01) { if (++stuck >= 2) { stuck = 0; const t = v.currentTime; try { v.currentTime = (t + .05) % (v.duration || 1e9); } catch (e) {} v.play().catch(() => {}); } } else stuck = 0;
  lastT = v.currentTime; }, 2000); }
document.addEventListener('visibilitychange', () => { const v = $('bg'); if (document.hidden) { S.seen = Date.now(); try { localStorage.setItem('lena1', JSON.stringify(S)); } catch (e) {} pushSend(false, true); v.pause(); } else { if (!app.classList.contains('outside')) v.play().catch(() => {}); check(); } });
window.addEventListener('pagehide', () => pushSend(false, true));

// 키보드가 올라오면 화면을 보이는 부분에 맞춘다(iOS)
// 키보드가 올라와 있을 때만 보이는 부분에 맞춘다(아이폰 홈 화면 앱에서 평소 높이를 잘못 알려 주는 문제 피하기)
// 홈 화면 앱(standalone)에서 아이폰이 높이를 상태바만큼 작게 알려 줘서 아래가 비는 문제: 화면 실제 높이로 채운다
const standalone = () => navigator.standalone || matchMedia('(display-mode: standalone)').matches;
function full() { if (standalone()) { const h = Math.max(innerHeight, Math.round(screen.height || 0)); app.style.top = '0px'; app.style.bottom = 'auto'; app.style.height = h + 'px'; document.documentElement.style.height = document.body.style.height = h + 'px'; } else { app.style.height = ''; app.style.top = ''; app.style.bottom = ''; } }
full(); addEventListener('resize', () => setTimeout(full, 100)); addEventListener('orientationchange', () => setTimeout(full, 300));
if (window.visualViewport) { const vv = window.visualViewport; const typing = () => { const a = document.activeElement; return a && /^(INPUT|TEXTAREA)$/.test(a.tagName) && !/^(time|date|datetime-local|file)$/.test(a.type); };
  const fit = () => { if (typing() && innerHeight - vv.height > 120) { app.style.height = vv.height + 'px'; app.style.top = vv.offsetTop + 'px'; app.style.bottom = 'auto'; const L = $('log'); if (L) L.scrollTop = L.scrollHeight; } else full(); };
  vv.addEventListener('resize', fit); vv.addEventListener('scroll', fit); document.addEventListener('focusout', () => setTimeout(fit, 120)); document.addEventListener('focusin', () => setTimeout(fit, 350)); }

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

