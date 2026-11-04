// 단축어 연결: B2 진짜 알람 자동 맞추기 · C3 공유하기로 보내기 · C4 잠금화면·제어센터 버튼
// 서버는 box-worker.js (Cloudflare Worker "lena-box"). 주소와 열쇠는 이 폰에만 저장.
'use strict';
(() => {
const css = `
.guide{font-size:13.5px;line-height:1.65;color:#dfe7ea;word-break:keep-all}
.guide b{color:var(--mint)}
.guide ol{padding-left:20px;margin:6px 0}
.cp{display:flex;align-items:center;gap:8px;margin-top:8px}
.cp code{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-family:'Space Mono',monospace;font-size:11.5px;background:#0b0d10;border:1px solid var(--line);border-radius:8px;padding:9px 10px;color:var(--mint)}
.cp .btn{height:38px;padding:0 12px;font-size:13px}
.ck2{display:flex;align-items:center;gap:8px;font-size:12.5px;color:var(--mute);margin-top:8px}
`;
document.head.appendChild(Object.assign(document.createElement('style'), { textContent: css }));
const B = () => (S.box || '').replace(/\/+$/, '');
const rnd = n => [...crypto.getRandomValues(new Uint8Array(n))].map(b => b.toString(16).padStart(2, '0')).join('');
if (!S.boxTok) { S.boxTok = rnd(16); save(); }
const url = (path, q) => `${B()}${path}?t=${S.boxTok}${q || ''}`;

// ---------- B2: 알람 목록 올리기 ----------
function alarms() {
  const L = [], now = Date.now();
  if (S.morning) for (let i = 0; i < 8; i++) { const d = new Date(); d.setDate(d.getDate() + i); const m = mcAt(d); if (m && m.getTime() > now) L.push({ at: localISO(m), label: '레나 모닝콜' }); }
  S.items.forEach(t => { if (!t.done && t.alarm && t.due && new Date(t.due).getTime() > now) L.push({ at: t.due.slice(0, 16), label: '레나 · ' + t.text.slice(0, 30) }); });
  return L.sort((a, b) => a.at.localeCompare(b.at)).slice(0, 60);
}
let lastA = '', aT = 0;
async function syncAlarms(force) {
  if (!S.box) return; const list = alarms(), j = JSON.stringify(list); if (!force && j === lastA) return;
  try { const r = await fetch(B() + '/alarms', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ t: S.boxTok, alarms: list, tz: new Date().getTimezoneOffset() }) }); if (r.ok) { lastA = j; S.boxOk = Date.now(); } } catch (e) {}
}
const _ps = pushSync; pushSync = function (f) { _ps(f); clearTimeout(aT); aT = setTimeout(() => syncAlarms(f), 400); };

// ---------- C3·C4: 우편함 받아 오기 ----------
let polling = false;
async function inbox() {
  if (!S.box || polling) return; polling = true;
  try { const r = await fetch(url('/inbox')); if (r.ok) { const j = await r.json(); const it = (j.items || []).filter(x => x && x.text); if (it.length) handle(it); } } catch (e) {}
  polling = false;
}
function handle(list) {
  const text = list.map(x => x.text).join('\n---\n');
  if (!S.key) { list.forEach(x => addItem(x.text.split('\n')[0].slice(0, 80), '')); save(); renderHome(); toast(`단축어로 온 ${list.length}개를 할 일로 붙였어요.`); return; }
  if (!app.classList.contains('calling')) openCall();
  setTimeout(() => sendText(`(단축어로 보낸 메모${list.length > 1 ? ' ' + list.length + '개' : ''}) ${text}\n— 여기서 일정·할 일·예약이 있으면 정리해서 저장하고, 없으면 기억할 것만 남겨 줘. 짧게 대답해.`), 600);
}
document.addEventListener('visibilitychange', () => { if (!document.hidden) setTimeout(inbox, 800); });
setTimeout(inbox, 1800); setInterval(() => { if (!document.hidden) inbox(); }, 60000);

// 통화 중 알람 표시: 전단지에 🔔 붙이기 (항목 길게 누르기 대신 시트에서)
const _paper = paper; paper = function (t, i) {
  const p = _paper(t, i);
  if (t.due && !t.done && S.box) { const a = p.querySelector('.acts'), b = el('button', 'del', t.alarm ? '⏰' : '🔕'); b.title = '진짜 알람'; b.style.fontSize = '17px'; b.style.opacity = t.alarm ? '1' : '.45';
    b.onclick = () => { t.alarm = !t.alarm; save(); pushSync(true); refreshSheet(); toast(t.alarm ? `'${t.text}' 진짜 알람도 맞출게요. (밤에 단축어가 만들어요)` : '진짜 알람은 뺐어요.'); }; a.insertBefore(b, a.lastChild); }
  return p;
};

// ---------- 설정 화면 ----------
function copy(t) { (navigator.clipboard ? navigator.clipboard.writeText(t) : Promise.reject()).then(() => toast('복사했어요. 단축어에 붙여 넣어요.')).catch(() => { prompt('아래 주소를 길게 눌러 복사해요', t); }); }
function cpRow(label, text) { const r = el('div', 'cp'); r.append(el('code', null, text), btn('복사', 'ghost', () => copy(text))); const w = el('div'); w.append(el('div', 'hint', label), r); return w; }
SH.box = { t: '단축어 연결', s: '앱을 안 열어도 레나에게', r: Bx => {
  Bx.appendChild(lbl('1. 우편함 서버 주소'));
  const c = el('div', 'card'), i = inp('url', 'https://lena-box.○○.workers.dev', S.box || '');
  c.append(row(i, btn('저장', '', async () => { let v = i.value.trim(); if (v && !/^https?:\/\//.test(v)) v = 'https://' + v; S.box = v.replace(/\/+$/, ''); save(); try { const r = await fetch(S.box + '/'); toast(r.ok ? '서버 연결됐어요.' : '서버가 대답을 안 해요. 주소를 확인해요.'); } catch (e) { toast('서버에 닿지 않아요. 주소를 확인해요.'); } syncAlarms(true); refreshSheet(); })));
  const g = el('div', 'guide'); g.innerHTML = '처음 한 번만, 컴퓨터에서 해 주세요.<ol><li>Cloudflare 대시보드 → <b>Workers</b> → 새로 만들기, 이름 <b>lena-box</b></li><li>저장소의 <b>box-worker.js</b> 내용을 통째로 붙여 넣고 배포</li><li>Storage → <b>KV</b>에서 새 공간을 만들고, Worker 설정 → Bindings에 변수 이름 <b>BOX</b>로 연결</li><li>생긴 주소(…workers.dev)를 위 칸에 넣고 저장</li></ol>';
  c.appendChild(g); Bx.appendChild(c);
  if (!S.box) return;
  Bx.appendChild(lbl('2. 진짜 알람 자동으로 (B2)'));
  const a = el('div', 'card'), ga = el('div', 'guide');
  ga.innerHTML = '매일 밤 단축어가 내일 모닝콜과 ⏰ 표시한 전단지 시간을 받아 <b>시계 앱 알람</b>을 만들어요. 앱이 꺼져 있어도, 무음이어도 울려요.<ol><li>단축어 앱 → <b>자동화</b> → + → <b>특정 시간</b> → 밤 10:00, 매일, <b>즉시 실행</b></li><li>동작: <b>URL 콘텐츠 가져오기</b> — 아래 주소</li><li><b>사전 값 가져오기</b> — 키 <b>alarms</b></li><li><b>각 항목을 반복</b> 안에: <b>사전 값 가져오기</b> 키 time → <b>알람 생성</b>(시간 = 그 값, 레이블은 반복 항목의 label)</li></ol>전단지 종이의 🔕를 누르면 ⏰로 바뀌고, 그 일정도 진짜 알람이 돼요.';
  a.append(ga, cpRow('알람 받는 주소', url('/alarms')));
  const n = alarms(); a.appendChild(el('div', 'hint', n.length ? `지금 올라간 알람 ${n.length}개 · 가장 가까운 것 ${when(n[0].at)} ${n[0].label}` : '아직 알람이 없어요. 7번 모닝콜을 켜거나 전단지에 ⏰를 눌러요.'));
  a.appendChild(row(btn('지금 다시 올리기', 'ghost wide', () => { syncAlarms(true).then(() => toast('알람 목록을 올렸어요.')); })));
  Bx.appendChild(a);
  Bx.appendChild(lbl('3. 공유하기로 보내기 (C3)'));
  const s = el('div', 'card'), gs = el('div', 'guide');
  gs.innerHTML = '문자·카톡·사파리의 예약 안내를 <b>공유 → 레나에게</b>로 보내면, 레나가 일정만 뽑아 전단지에 붙여요.<ol><li>단축어 앱 → + → 이름 <b>레나에게</b></li><li>설정(ⓘ) → <b>공유 시트에서 보기</b> 켜기, 받는 것: 텍스트·URL</li><li>동작: <b>URL 콘텐츠 가져오기</b> — 아래 주소 뒤에 <b>단축어 입력</b>을 붙임</li><li>동작: <b>알림 표시</b> — URL의 콘텐츠</li></ol>';
  s.append(gs, cpRow('보내는 주소 (끝에 내용 붙이기)', url('/in', '&src=share&text=')));
  Bx.appendChild(s);
  Bx.appendChild(lbl('4. 잠금화면·제어센터 버튼 (C4)'));
  const l = el('div', 'card'), gl = el('div', 'guide');
  gl.innerHTML = '잠금화면에서 바로 "내일 3시 치과"라고 말하면 레나에게 가요.<ol><li>단축어 앱 → + → 이름 <b>레나 메모</b></li><li>동작: <b>텍스트 받아쓰기</b>(또는 입력 요청)</li><li>동작: <b>URL 콘텐츠 가져오기</b> — 아래 주소 뒤에 받아쓴 텍스트</li><li>동작: <b>알림 표시</b></li><li>잠금화면 꾸미기 → 아래 버튼 자리 또는 <b>제어 센터</b> → 컨트롤 추가 → <b>단축어</b> → 레나 메모</li></ol>동작 버튼이 있는 아이폰이면 설정 → 동작 버튼 → 단축어에도 연결할 수 있어요.';
  l.append(gl, cpRow('메모 보내는 주소 (끝에 내용 붙이기)', url('/in', '&src=lock&text=')));
  l.appendChild(row(btn('시험으로 하나 보내 보기', 'ghost wide', async () => { try { await fetch(url('/in', '&src=test&text=' + encodeURIComponent('단축어 시험이에요'))); toast('보냈어요. 잠시 뒤 통화에 나타나요.'); setTimeout(inbox, 800); } catch (e) { toast('서버에 닿지 않아요.'); } })));
  Bx.appendChild(l);
  const k = el('div', 'hint', '주소 속 t=… 는 내 열쇠예요. 다른 사람에게 보여 주지 마세요.'); Bx.appendChild(k);
  Bx.appendChild(row(btn('열쇠 새로 만들기', 'ghost wide', () => { if (!confirm('열쇠를 바꾸면 만들어 둔 단축어 주소도 다시 넣어야 해요. 바꿀까요?')) return; S.boxTok = rnd(16); save(); syncAlarms(true); refreshSheet(); })));
} };
const _s0 = SH[0].r; SH[0].r = Bx => { _s0(Bx); const bk = [...Bx.querySelectorAll('.lbl')].find(x => x.textContent === '백업') || null; const c = el('div', 'card'); c.append(row(btn(S.box ? '단축어 연결 설정 보기' : '단축어 연결하기 (알람·공유·잠금화면)', 'teal wide', () => openSheet('box')))); c.appendChild(el('div', 'hint', S.box ? '연결됨 · 진짜 알람 자동, 공유하기, 잠금화면 메모' : '앱을 안 열고도 레나에게 맡기고, 진짜 알람도 자동으로 맞춰요.')); Bx.insertBefore(lbl('단축어'), bk); Bx.insertBefore(c, bk); };
// 7번 모닝콜 화면에도 안내
const _s7 = SH[7].r; SH[7].r = Bx => { _s7(Bx); const c = el('div', 'card'); c.append(row(btn(S.box ? '⏰ 진짜 알람 자동 설정 보기' : '⏰ 진짜 알람을 매일 자동으로', 'wide', () => openSheet('box')))); Bx.appendChild(lbl('자동 알람')); Bx.appendChild(c); };
})();
