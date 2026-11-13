/* v139 저녁 브리핑 — 오늘 시간표(고정·일정·공부·휴식)가 다 끝나고 10분 뒤(17시 전엔 안 뜸, 일정 없으면 21시)에
   하루 한 번 저절로 뜸 + 그 시각 폰 알림. 오늘 정리 → 내일 일정 → 기상 시간 정하기(모닝콜·시계 알람). */
(function () {
  'use strict';
  if (typeof SH === 'undefined') return;
  const pad = n => String(n).padStart(2, '0'), keyOf = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const toM = t => { const [h, m] = String(t || '').split(':').map(Number); return isNaN(h) ? null : h * 60 + (m || 0); };
  const hmOf = m => `${pad(Math.floor(((m % 1440) + 1440) % 1440 / 60))}:${pad(((m % 60) + 60) % 60)}`;
  // v147 하루의 경계 = 모닝콜 시각(없으면 6시). 그 전(새벽)은 아직 '어제' — 새벽까지 이어지는 일정이 끝난 뒤에 뜨게
  const wakeM = () => toM(S.morning) || 6 * 60;
  const baseDay = () => { const d = new Date(); if (d.getHours() * 60 + d.getMinutes() < wakeM()) d.setDate(d.getDate() - 1); d.setHours(0, 0, 0, 0); return d; };

  // 그날 시간표가 끝나는 시각(분). 없으면 null
  function dayEnd(d) {
    const k = keyOf(d), wd = d.getDay(), ends = [];
    (S.reps || []).forEach(r => { if ((r.days || []).length && !r.days.includes(wd)) return; if ((S.repSkip || {})[r.id + '_' + k]) return; const s = toM(r.time); if (s == null) return; ends.push(toM(r.end) || s + 60); });
    (S.items || []).forEach(t => { if (t.rid || !t.due || t.due.slice(0, 10) !== k || t.kind !== 'event') return; const s = toM(t.due.slice(11, 16)); if (s != null) ends.push(s + (t.mins || 60)); });
    try { const LS = window.lenaStudy, st = LS.ST(); (st.log[k] || []).forEach(l => ends.push(l.e || l.s + (l.mins || 0))); ((st.pk || {})[k] || []).forEach(b => ends.push(b.e)); if (k === LS.todayK()) { const D = LS.plan().days[0]; if (D) { D.blocks.forEach(b => ends.push(b.e)); if (D.play) ends.push(D.play.e); } } } catch (e) {}
    return ends.length ? Math.max(...ends) : null;
  }
  // 남은 공부는 '지금' 뒤로 계속 밀리니까, 한 번 정한 시각이 지나면 다시 계산하지 않음
  function when() {
    const d = baseDay(), k = keyOf(d), c = S.eveAt; if (c && c.k === k && Date.now() >= c.at) return c;
    const e = dayEnd(d), m = e == null ? 21 * 60 : Math.max(e + 10, 17 * 60), w = { k, m, at: d.getTime() + m * 60e3 };
    if (!c || c.k !== k || c.at !== w.at) { S.eveAt = w; save(); } return w;
  }

  // 내일 첫 일정 90분 전(10분 단위 내림, 5:00~10:00), 일정 없으면 지금 모닝콜이나 7:30
  function tomorrowRows() {
    const d = baseDay(); d.setDate(d.getDate() + 1); const k = keyOf(d);
    try { const LS = window.lenaStudy, D = LS.plan().days.find(x => x.k === k); return { d, rows: LS.dayRows(k, D) }; } catch (e) { return { d, rows: [] }; }
  }
  function recWake(rows) {
    const first = rows.filter(r => (r.kind === 'fix' || r.kind === 'ev') && r.s >= 4 * 60).sort((a, b) => a.s - b.s)[0];
    if (!first) return { m: toM(S.morning) || 7 * 60 + 30, why: S.morning ? '내일은 이른 일정이 없어서 평소 시간 그대로.' : '내일은 이른 일정이 없으니까 7시 반.' };
    const m = Math.min(10 * 60, Math.max(5 * 60, Math.floor((first.s - 90) / 10) * 10));
    const nm = first.txt.replace(/\s*~.*$/, ''), c = nm.charCodeAt(nm.length - 1), ga = c >= 0xAC00 && c <= 0xD7A3 && (c - 0xAC00) % 28 ? '이' : '가';
    return { m, why: `내일 ${hmOf(first.s)} '${nm}'${ga} 첫 일정이라, 준비 시간 90분 잡았어.` };
  }

  let pick = null;
  SH.eve = { t: '저녁 브리핑', s: () => '', r: B => {
    const d = baseDay(), k = keyOf(d), wrap = el('div', 'brief');
    const doneN = (S.items || []).filter(t => t.done && t.doneAt && keyOf(new Date(t.doneAt)) === k).length;
    let studied = 0, planned = 0; try { const st = window.lenaStudy.ST(); studied = (st.log[k] || []).reduce((a, l) => a + l.mins, 0); planned = st.pl[k] || 0; } catch (e) {}
    const miss = Math.max(0, planned - studied);
    const hd = el('div', 'bhead'); hd.append(el('i', app.classList.contains('outside') ? 'cat' : ''), el('p', null, `수고했어, ${S.name || ''}. 오늘 일정 다 끝났네. ${miss ? `공부는 ${miss}분 못 했는데, 남은 날에 다시 나눠 놨으니까 걱정 마.` : studied ? '공부도 계획만큼 다 했어. …칭찬해 줄까?' : '오늘은 푹 쉬어.'}`)); wrap.appendChild(hd);
    const s1 = el('div', 'bsec'); s1.appendChild(el('h5', null, '오늘 정리'));
    s1.appendChild(el('div', 'r', `끝낸 일 ${doneN}개 · 공부 ${studied}분${planned ? ` / 계획 ${planned}분` : ''}`)); wrap.appendChild(s1);
    const { d: td, rows } = tomorrowRows(), s2 = el('div', 'bsec'); s2.appendChild(el('h5', null, `내일 (${td.getMonth() + 1}/${td.getDate()})`));
    const show = rows.filter(r => r.kind !== 'log').slice(0, 6);
    if (show.length) show.forEach(r => { const x = el('div', 'r'); x.append(el('b', null, r.s >= 0 ? hmOf(r.s) : '종일'), document.createTextNode(r.txt)); s2.appendChild(x); }); else s2.appendChild(el('div', 'muted', '잡힌 게 없어.'));
    wrap.appendChild(s2);
    // 기상 시간
    const rec = recWake(rows); if (pick == null) pick = rec.m;
    const s3 = el('div', 'bsec'); s3.appendChild(el('h5', null, '내일 몇 시에 깨울까?')); s3.appendChild(el('div', 'r', rec.why));
    const ch = el('div', 'eve-ch'); [rec.m - 30, rec.m, rec.m + 30].forEach(m => { const b = btn(hmOf(m), m === pick ? 'teal' : 'ghost', () => { pick = m; refreshSheet(); }); ch.appendChild(b); });
    const t = inp('time', '', hmOf(pick)); t.onchange = () => { const m = toM(t.value); if (m != null) { pick = m; refreshSheet(); } }; ch.appendChild(t); s3.appendChild(ch);
    const set = S.morning === hmOf(pick);
    s3.appendChild(row(btn(set ? `✓ ${hmOf(pick)}에 깨울게` : `${hmOf(pick)}에 깨워 줘`, set ? 'ghost wide' : 'teal wide', () => {
      S.morning = hmOf(pick); const now = new Date(), mc = new Date(); mc.setHours(Math.floor(pick / 60), pick % 60, 0, 0); S.mcDone = now >= mc ? dk(now) : ''; save(); pushSync(true); refreshSheet(); toast(`내일 ${S.morning}에 전화할게. 안 받으면 부재중이야.`);
    })));
    if (set) { s3.appendChild(row(btn('시계 앱 알람도 지금 만들기', 'ghost wide', () => { location.href = `shortcuts://run-shortcut?name=${encodeURIComponent('레나 알람')}&input=text&text=${encodeURIComponent(S.morning)}`; }))); s3.appendChild(el('div', 'hint', '단축어 연결(0번 설정 › 단축어)을 해 뒀으면 밤 10시 자동화가 알아서 만들어 줘. 10시가 지났으면 위 버튼을 눌러.')); }
    wrap.appendChild(s3); B.appendChild(wrap);
  } };
  if (typeof NUMOF !== 'undefined') NUMOF.eve = '☎';

  // 하루 한 번 저절로
  function autoEve() {
    if (!S.name) return; const w = when(); if (S.eveDay === w.k || Date.now() < w.at) return;
    if (($('inc') && $('inc').classList.contains('on')) || $('sheet').classList.contains('open') || ($('arc') && $('arc').classList.contains('on'))) return;
    S.eveDay = w.k; pick = null; save(); openSheet('eve');
  }
  setInterval(autoEve, 60e3); setTimeout(autoEve, 6000);
  document.addEventListener('visibilitychange', () => { if (!document.hidden) setTimeout(autoEve, 2500); });
  // 그 시각 폰 알림
  const _p = window.plan; window.plan = function () { const p = _p.apply(this, arguments); try { const w = when(); if (S.eveDay !== w.k && w.at > Date.now()) p.reminders.push({ id: 'eve_' + w.k, at: w.at, body: '오늘 일정 다 끝났지? 저녁 브리핑 열어 봐. 내일 몇 시에 깨울지 정하자.' }); } catch (e) {} return p; };

  const css = document.createElement('style'); css.textContent = '.eve-ch{display:flex;gap:6px;margin:8px 0}.eve-ch button{flex:1;min-height:44px;padding:0 4px}.eve-ch input{flex:1.2;min-width:0;height:44px;font-size:16px}'; document.head.appendChild(css);
  window.lenaEve = { when, dayEnd, recWake, tomorrowRows, auto: autoEve };
})();
