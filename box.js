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
  try { const r = await fetch(B() + '/alarms', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ t: S.boxTok, alarms: list, tz: new Date().getTimezoneOffset() }) }); if (r.ok) { lastA = j; S.boxOk = Date.now(); S.boxN = list.length; S.boxErr = ''; save(); } else S.boxErr = '알람 올리기 실패 (' + r.status + ')'; } catch (e) { S.boxErr = '서버에 닿지 않음'; }
}
const _ps = pushSync; pushSync = function (f) { _ps(f); clearTimeout(aT); aT = setTimeout(() => syncAlarms(f), 400); };

// ---------- C3·C4: 우편함 받아 오기 ----------
let polling = false, checking = false;
async function inbox() {
  if (!S.box || polling || checking) return; polling = true;
  try { const r = await fetch(url('/inbox')); if (r.ok) { const j = await r.json(); const all = (j.items || []).filter(x => x && x.src !== 'check'); const it = all.filter(x => x.text), fl = all.filter(x => x.file); if (it.length) handle(it); if (fl.length) await gotFiles(fl); } } catch (e) {}
  polling = false;
}
// ---------- 공유하기로 온 파일(사진·PDF): 받아서 '레나한테 보여주기' 또는 '노트로 정리' ----------
const b64 = blob => new Promise((res, rej) => { const fr = new FileReader(); fr.onload = () => res(String(fr.result).split(',')[1]); fr.onerror = rej; fr.readAsDataURL(blob); });
let boxFiles = [];
async function gotFiles(list) {
  for (const x of list) { try { const r = await fetch(url('/file', '&id=' + encodeURIComponent(x.file))); if (!r.ok) continue; const blob = await r.blob(), type = x.type || blob.type, name = x.name || (/pdf/.test(type) ? '공유한 PDF' : '공유한 사진');
      if (/^image\//.test(type)) { const im = await shrink(blob); boxFiles.push({ name, mime: im.mime, data: im.data, kind: 'img' }); }
      else if (/pdf/.test(type)) boxFiles.push({ name, mime: 'application/pdf', data: await b64(blob), kind: 'pdf' });
      else if (/^text\//.test(type)) handle([{ text: (await blob.text()).slice(0, 2000) }]);
    } catch (e) {} }
  if (!boxFiles.length) return;
  S.boxIn = Date.now(); S.boxInN = (S.boxInN || 0) + boxFiles.length; save();
  if (!(S.key || S.ckey)) { toast(`공유한 파일 ${boxFiles.length}개를 받았어요. 0번 설정에 Gemini 키가 있어야 레나가 볼 수 있어요.`); boxFiles = []; return; }
  if (!app.classList.contains('calling')) openCall();
  setTimeout(fileAsk, 500);
}
function fileAsk() {
  if (!boxFiles.length) return;
  const F = boxFiles.slice(), n = F.length, im = F.filter(f => f.kind === 'img').length, pd = n - im;
  const c = el('div', 'ask'); c.append(el('span', 'who', '레나'), document.createTextNode(`공유한 ${[im ? `사진 ${im}장` : '', pd ? `PDF ${pd}개` : ''].filter(Boolean).join(', ')} 받았어요. 어떻게 할까요?`));
  const fin = msg => { boxFiles = []; c.classList.add('done'); c.querySelector('.row').remove(); c.appendChild(el('div', 'hint', msg)); };
  c.appendChild(row(btn('레나한테 보여주기', 'teal', () => { fin('보여 줬어요.'); window.pendFiles = F.slice(0, 6); sendText(`(공유로 보낸 ${n > 1 ? '파일 ' + n + '개' : im ? '사진' : 'PDF'}) 여기서 일정·할 일·예약이 있으면 정리해서 저장하고, 아니면 뭔지 짧게 알려 줘.`); }),
    btn('노트로 정리', 'ghost', () => { fin('4번 공부 > 노트로 넘겼어요.'); if (window.lenaNotes && lenaNotes.prefill) { lenaNotes.prefill(F); window.lenaStudy && lenaStudy.tab && lenaStudy.tab('note'); openSheet(6); } }),
    btn('버리기', 'ghost', () => fin('버렸어요.'))));
  const L = $('log'); L.appendChild(c); L.scrollTop = L.scrollHeight;
}
window.lenaBox = { gotFiles, files: () => boxFiles };
function handle(list) {
  S.boxIn = Date.now(); S.boxInN = (S.boxInN || 0) + list.length; save();
  const text = list.map(x => x.text).join('\n---\n');
  if (!(S.key || S.ckey)) { list.forEach(x => addItem(x.text.split('\n')[0].slice(0, 80), '')); save(); renderHome(); toast(`단축어로 온 ${list.length}개를 할 일로 붙였어요.`); return; }
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
  const c = el('div', 'card'), i = inp('url', 'https://….workers.dev', S.box || '');
  c.append(row(i, btn('저장', '', async () => { let v = i.value.trim(); if (v && !/^https?:\/\//.test(v)) v = 'https://' + v; S.box = v.replace(/\/+$/, ''); save(); try { const r = await fetch(S.box + '/'); toast(r.ok ? '서버 연결됐어요.' : '서버가 대답을 안 해요. 주소를 확인해요.'); } catch (e) { toast('서버에 닿지 않아요. 주소를 확인해요.'); } syncAlarms(true); refreshSheet(); })));
  const g = el('div', 'guide'); g.innerHTML = '처음 한 번만, 컴퓨터에서 해 주세요.<ol><li>Cloudflare 대시보드 → <b>Workers</b> → 새로 만들기, 이름 <b>lena-box</b></li><li>저장소의 <b>box-worker.js</b> 내용을 통째로 붙여 넣고 배포</li><li>Storage → <b>KV</b>에서 새 공간을 만들고, Worker 설정 → Bindings에 변수 이름 <b>BOX</b>로 연결</li><li>생긴 주소(…workers.dev)를 위 칸에 넣고 저장</li></ol>';
  c.appendChild(g); Bx.appendChild(c);
  if (!S.box) return;
  Bx.appendChild(lbl('연결 상태'));
  const st = el('div', 'card'), ago = t => { if (!t) return '아직 없음'; const m = Math.round((Date.now() - t) / 60000); return m < 1 ? '방금' : m < 60 ? `${m}분 전` : m < 1440 ? `${Math.round(m / 60)}시간 전` : `${Math.round(m / 1440)}일 전`; };
  const vw = el('div', 'warn'); vw.hidden = true; fetch(B() + '/').then(r => r.text()).then(t => { if (!/v3/.test(t)) { vw.hidden = false; vw.innerHTML = '서버 코드가 예전 버전이라 <b>' + (/v2/.test(t) ? '홈 화면 위젯·공부 시간 지키기가 안 돼요' : '사진·PDF·위젯·공부 시간 지키기가 안 돼요') + '</b>. 컴퓨터에서 Cloudflare → Workers → <b>lena-box</b> → <b>코드 편집</b>(Edit code) → 전부 지우고 아래 버튼으로 복사한 새 코드를 붙여 넣기 → <b>배포</b>(Deploy).'; vw.appendChild(row(btn('새 서버 코드 복사', 'ghost wide', async () => { try { copy(await (await fetch('box-worker.js', { cache: 'no-store' })).text()); } catch (e) { toast('못 가져왔어요. 저장소의 box-worker.js를 써 주세요.'); } }))); } }).catch(() => {});
  st.appendChild(vw);
  const sl = el('div', 'guide'); sl.innerHTML = `알람 목록 올림: <b>${ago(S.boxOk)}</b>${S.boxOk ? ` (${S.boxN || 0}개)` : ''}<br>단축어로 받은 메모: <b>${ago(S.boxIn)}</b>${S.boxInN ? ` (지금까지 ${S.boxInN}개)` : ''}${S.boxErr ? `<br><span style="color:var(--hot)">문제: ${S.boxErr}</span>` : ''}`;
  const out = el('div', 'guide'); out.style.marginTop = '8px';
  st.append(sl, out, row(btn('전체 점검', 'teal wide', async () => {
    const L = []; const show = () => { out.innerHTML = L.map(([k, v]) => `${v ? '✅' : '❌'} ${k}`).join('<br>'); };
    const step = async (k, f) => { try { const v = await f(); L.push([k, !!v]); } catch (e) { L.push([k, false]); } show(); return L[L.length - 1][1]; };
    out.textContent = '점검 중…'; checking = true;
    if (!await step('서버 주소에 닿음', async () => (await fetch(B() + '/')).ok)) { checking = false; out.innerHTML += '<br>→ 1번 주소를 다시 확인해요.'; return; }
    await step('알람 목록 올리기', async () => { await syncAlarms(true); return S.boxOk && Date.now() - S.boxOk < 15000; });
    await step('단축어 쪽에서 알람 받기', async () => { const j = await (await fetch(url('/alarms', '&h=72'))).json(); return Array.isArray(j.alarms); });
    const word = '점검 ' + Math.random().toString(36).slice(2, 6) + ' & 확인';
    await step('특수문자 섞인 메모 보내기(&·띄어쓰기)', async () => (await fetch(url('/in', '&src=check&text=' + encodeURIComponent(word)))).ok);
    await step('앱이 우편함에서 꺼내기', async () => { const j = await (await fetch(url('/inbox'))).json(); return (j.items || []).some(x => x.text === word); });
    checking = false; out.innerHTML += '<br>모두 ✅면 서버와 앱은 정상이에요. 그래도 안 되면 단축어 쪽(아래 순서)을 확인해요.';
  })));
  Bx.appendChild(st);
  Bx.appendChild(lbl('2. 진짜 알람 자동으로 (B2)'));
  const a = el('div', 'card'), ga = el('div', 'guide');
  ga.innerHTML = '매일 밤 단축어가 모닝콜과 ⏰ 전단지 시간을 받아 <b>시계 앱 알람</b>을 만들어요. 무음이어도 울려요.<br><b>가. 단축어 만들기</b><ol><li>단축어 앱 → 아래 <b>단축어</b> 탭 → 오른쪽 위 <b>+</b></li><li>맨 위 이름을 눌러 <b>레나 알람 받기</b>로 바꾸기</li><li>아래 검색창에 <b>URL 콘텐츠</b> → <b>URL의 콘텐츠 가져오기</b></li><li>그 줄의 파란 <b>URL</b>을 누르고, 아래 <b>알람 받는 주소</b>(복사 버튼)를 붙여 넣기</li><li>검색창에 <b>사전 값</b> → <b>사전 값 가져오기</b>. 파란 <b>키</b>를 누르고 <b>alarms</b> 입력</li><li>검색창에 <b>반복</b> → <b>각 항목 반복</b>. 아래에 <b>반복 종료</b>가 같이 생겨요</li><li>검색창에 <b>사전 값</b> → <b>사전 값 가져오기</b> 한 번 더. 이 줄이 <b>반복 종료 위</b>에 있어야 해요(아니면 길게 눌러 끌어 올리기). 파란 <b>키</b> → <b>time</b></li><li>검색창에 <b>알람</b> → <b>알람 생성</b>(Create Alarm). 이것도 <b>반복 종료 위</b>. 파란 <b>시간</b>을 누르고 키보드 위 줄에서 <b>사전 값</b> 고르기, 레이블은 <b>레나</b></li><li><b>지난 알람 지우기</b>(쌓이지 않게): 검색창에 <b>알람 찾기</b>(Find Alarms) → <b>필터 추가</b> → <b>레이블</b> · <b>다음을 포함</b> · <b>레나</b>. 그 아래 검색창에 <b>알람 삭제</b>(Delete Alarms). 이 두 칸을 길게 눌러 <b>맨 위</b>(URL 칸보다 위)로 끌어 올리기</li><li>오른쪽 위 <b>완료</b></li><li>아이폰 <b>설정 → 단축어 → 고급 → 확인 없이 삭제 허용</b> 켜기 (안 켜면 밤마다 지울지 물어봐요)</li></ol>다 만들면 이렇게 보여요:<pre style="white-space:pre-wrap;font-size:12px;background:#0b0d10;border-radius:8px;padding:8px;margin:6px 0">알람 찾기 (레이블에 레나 포함)\n알람 삭제\nURL의 콘텐츠 가져오기 (알람 주소)\n사전 값 가져오기 (키 alarms)\n각 항목 반복\n   사전 값 가져오기 (키 time)\n   알람 생성 (시간 = 사전 값)\n반복 종료</pre><b>나. 시험</b>: 단축어 카드를 눌러 실행 → 접근 허용을 물으면 <b>항상 허용</b> → 시계 앱 알람 탭에 생기면 성공. 다시 실행해도 레나 알람이 두 배로 늘지 않으면 지우기도 성공. (7번 모닝콜이 꺼져 있고 ⏰ 전단지도 없으면 아무것도 안 생겨요)<br><b>다. 매일 밤 자동으로</b><ol><li>단축어 앱 아래 <b>자동화</b> 탭 → <b>+</b>(또는 새로운 자동화)</li><li><b>특정 시간</b>(Time of Day) → <b>오후 10:00</b>, <b>매일</b> → <b>즉시 실행</b> → 다음</li><li><b>새로운 빈 자동화</b> → 검색창에 <b>단축어 실행</b> → <b>단축어 실행</b> → 파란 <b>단축어</b>를 눌러 <b>레나 알람 받기</b> → 완료</li></ol>전단지 종이의 🔕를 누르면 ⏰로 바뀌고, 그 일정도 진짜 알람이 돼요.';
  a.append(ga, cpRow('알람 받는 주소', url('/alarms')));
  const n = alarms(); a.appendChild(el('div', 'hint', n.length ? `지금 올라간 알람 ${n.length}개 · 가장 가까운 것 ${when(n[0].at)} ${n[0].label}` : '아직 알람이 없어요. 7번 모닝콜을 켜거나 전단지에 ⏰를 눌러요.'));
  a.appendChild(row(btn('지금 다시 올리기', 'ghost wide', () => { syncAlarms(true).then(() => toast('알람 목록을 올렸어요.')); })));
  Bx.appendChild(a);
  Bx.appendChild(lbl('3. 공유하기로 보내기 (C3)'));
  const s = el('div', 'card'), gs = el('div', 'guide');
  gs.innerHTML = '문자·카톡·사파리 글을 <b>공유 → 레나에게</b>로 보내면 레나가 일정만 뽑아 전단지에 붙여요.<div class="hint">동작 추가: 편집 화면 아래 <b>검색창</b>에 <b>[검색어]</b>를 치고 나온 동작을 눌러요. 괄호 안은 영어 이름.</div>단축어 탭 → + → 이름 <b>레나에게</b><ol><li>아래 <b>ⓘ</b>(세부사항) → <b>공유 시트에서 보기</b> 켜기</li><li>[인코딩] → <b>URL 인코딩</b> (URL Encode). 입력 자리는 <b>단축어 입력</b> <span style="color:var(--yel)">(이게 없으면 &·#·줄바꿈에서 글이 잘려요)</span></li><li>[URL 콘텐츠] → <b>URL의 콘텐츠 가져오기</b>. URL 자리에 아래 <b>보내는 주소</b>를 붙여 넣고, 커서를 <b>맨 끝(text= 뒤)</b>에 둔 채 키보드 위 변수 줄에서 <b>URL 인코딩된 텍스트</b> 누르기</li><li>(있으면 좋아요) [알림] → <b>알림 보기</b> (Show Notification), 내용 <b>URL의 콘텐츠</b></li></ol>▶ 메모 앱 글을 고르고 공유 → <b>레나에게</b> → “레나가 받았어요…”가 뜨면 성공.';
  const gf = el('div', 'guide'); gf.style.marginTop = '14px'; gf.innerHTML = '<b style="color:var(--yel)">사진·PDF도 보내려면 (새 방식, 글도 같이 돼요)</b><ol><li>레나에게 단축어를 열고 <b>URL 인코딩</b> 동작은 지우기(길게 눌러 삭제)</li><li><b>URL의 콘텐츠 가져오기</b>의 URL을 아래 <b>파일 보내는 주소</b>로 바꾸기(뒤에 아무것도 안 붙임)</li><li>그 동작의 <b>›</b>(더 보기)를 펼쳐서 <b>방법: POST</b>, <b>요청 본문: 파일</b>, 파일 자리에 <b>단축어 입력</b></li><li>ⓘ(세부사항) → 공유 시트에서 보기 켜기, 받는 유형은 <b>이미지·PDF·텍스트·URL</b> 켜 두기</li><li>(사진 여러 장) [반복] → <b>각 항목을 반복</b>(Repeat with Each) 안에 3번 동작을 넣고, 파일 자리를 <b>반복 항목</b>으로</li></ol>▶ 사진을 공유 → <b>레나에게</b> → “레나가 파일을 받았어요…”가 뜨면 성공. 앱을 열면 레나가 <b>보여주기 / 노트로 정리</b>를 물어봐요.';
  s.append(gs, cpRow('보내는 주소 (끝에 내용 붙이기)', url('/in', '&src=share&text=')), gf, cpRow('파일 보내는 주소 (사진·PDF·글)', url('/in', '&src=share')));
  Bx.appendChild(s);
  Bx.appendChild(lbl('4. 잠금화면·제어센터 버튼 (C4)'));
  const l = el('div', 'card'), gl = el('div', 'guide');
  gl.innerHTML = '잠금화면에서 바로 “내일 3시 치과”라고 말하면 레나에게 가요.<div class="hint">동작 추가: 편집 화면 아래 <b>검색창</b>에 <b>[검색어]</b>를 치고 나온 동작을 눌러요. 괄호 안은 영어 이름.</div>단축어 탭 → + → 이름 <b>레나 메모</b><ol><li>[받아쓰기] → <b>텍스트 받아쓰기</b> (Dictate Text) — 말 대신 글로 쓰려면 [입력] → <b>입력 요청</b> (Ask for Input)</li><li>[인코딩] → <b>URL 인코딩</b>, 입력 자리는 <b>받아쓴 텍스트</b>(또는 제공된 입력)</li><li>[URL 콘텐츠] → <b>URL의 콘텐츠 가져오기</b>. 아래 <b>메모 보내는 주소</b>를 붙이고 맨 끝에 <b>URL 인코딩된 텍스트</b></li><li>[알림] → <b>알림 보기</b>, 내용 <b>URL의 콘텐츠</b></li></ol>잠금화면을 길게 눌러 <b>사용자화</b> → 잠금 화면 → 아래 버튼(손전등·카메라)의 <b>−</b>로 빼고 <b>+</b> → <b>단축어</b> → 레나 메모. 또는 제어 센터 → 왼쪽 위 <b>+</b> → 컨트롤 추가 → <b>단축어</b>.';
  l.append(gl, cpRow('메모 보내는 주소 (끝에 내용 붙이기)', url('/in', '&src=lock&text=')));
  l.appendChild(row(btn('시험으로 하나 보내 보기', 'ghost wide', async () => { try { await fetch(url('/in', '&src=test&text=' + encodeURIComponent('단축어 시험이에요'))); toast('보냈어요. 잠시 뒤 통화에 나타나요.'); setTimeout(inbox, 800); } catch (e) { toast('서버에 닿지 않아요.'); } })));
  Bx.appendChild(l);
  const k = el('div', 'hint', '주소 속 t=… 는 내 열쇠예요. 다른 사람에게 보여 주지 마세요.'); Bx.appendChild(k);
  Bx.appendChild(row(btn('열쇠 새로 만들기', 'ghost wide', () => { if (!confirm('열쇠를 바꾸면 만들어 둔 단축어 주소도 다시 넣어야 해요. 바꿀까요?')) return; S.boxTok = rnd(16); save(); syncAlarms(true); refreshSheet(); })));
} };
const _s0 = SH[0].r; SH[0].r = Bx => { _s0(Bx); const bk = [...Bx.querySelectorAll('.lbl')].find(x => x.textContent === '백업') || null; const c = el('div', 'card'); c.append(row(btn(S.box ? '단축어 연결 설정 보기' : '단축어 연결하기 (알람·공유·잠금화면)', 'teal wide', () => openSheet('box')))); c.appendChild(el('div', 'hint', S.box ? '연결됨 · 진짜 알람 자동, 공유하기, 잠금화면 메모' : '앱을 안 열고도 레나에게 맡기고, 진짜 알람도 자동으로 맞춰요.')); Bx.insertBefore(lbl('단축어'), bk); Bx.insertBefore(c, bk); };
// 6번 모닝콜(SH[7]) 화면에도 안내
const _s7 = SH[7].r; SH[7].r = Bx => { _s7(Bx); const c = el('div', 'card'); c.append(row(btn(S.box ? '⏰ 진짜 알람 자동 설정 보기' : '⏰ 진짜 알람을 매일 자동으로', 'wide', () => openSheet('box')))); Bx.appendChild(lbl('자동 알람')); Bx.appendChild(c); };
})();
