// 음성사서함 — 레나가 내용을 공부 노트처럼 정리해 저장
'use strict';
(() => {
  const get = () => { if (!Array.isArray(S.memo)) S.memo = []; return S.memo; };
  let editing = '', busy = false, error = '';
  const sourceOf = x => String(x && (x.source || x.text) || '');
  const stamp = t => new Date(t || Date.now()).toLocaleString('ko-KR', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  function renderPaper(B, x) {
    const p = el('div', 'npaper memo-paper');
    p.append(el('i', 'tape'), el('h3', null, x.title || '메모'));
    p.appendChild(el('div', 'meta', stamp(x.at) + ' · 레나가 정리함'));
    (x.secs || []).forEach(sec => {
      p.appendChild(el('h4', null, sec.h));
      const ul = el('ul'); (sec.pts || []).forEach(t => ul.appendChild(el('li', null, t))); p.appendChild(ul);
    });
    if (x.keys && x.keys.length) {
      p.appendChild(el('h4', null, '기억할 내용'));
      const kw = el('div', 'kw'); x.keys.forEach(k => kw.append(el('b', null, k.t), el('span', null, k.d))); p.appendChild(kw);
    }
    if (x.traps && x.traps.length) {
      p.appendChild(el('h4', null, '확인할 점'));
      const ul = el('ul'); x.traps.forEach(t => ul.appendChild(el('li', null, t))); p.appendChild(ul);
    }
    if (x.qs && x.qs.length) {
      p.appendChild(el('h4', null, '다시 확인하기'));
      x.qs.forEach((q, i) => { const d = el('div', 'qa'); d.append(el('b', null, `${i + 1}. ${q.q}`), el('p', null, q.a || '')); p.appendChild(d); });
    }
    if (x.text && !x.secs) p.appendChild(el('p', null, x.text));
    B.appendChild(p);
    B.appendChild(row(btn('내용 고치기', 'ghost', () => { editing = x.id; error = ''; refreshSheet(); }), btn('삭제', 'ghost', () => {
      if (!confirm('이 음성사서함을 삭제할까요?')) return;
      S.memo = get().filter(y => y !== x); if (editing === x.id) editing = ''; save(); refreshSheet();
    })));
  }
  async function saveFromText(raw) {
    const value = String(raw || '').trim();
    if (!value) throw new Error('정리할 대화 내용이 없어요.');
    if (!window.lenaNotes || !window.lenaNotes.summarizeMemo) throw new Error('노트 정리 기능을 불러오지 못했어요.');
    const summary = await window.lenaNotes.summarizeMemo(value);
    get().unshift({ id: 'memo_' + Date.now().toString(36), source: value.slice(0, 6000), ...summary });
    save();
    return summary.title;
  }
  async function saveMemo(ta) {
    if (busy) return;
    const value = ta.value.trim(); if (!value) { toast('정리할 내용을 적어 줘.'); return; }
    if (!window.lenaNotes || !window.lenaNotes.summarizeMemo) { toast('노트 정리 기능을 불러오지 못했어요.'); return; }
    busy = true; error = ''; refreshSheet();
    try {
      const old = editing ? get().find(x => x.id === editing) : null;
      const summary = await window.lenaNotes.summarizeMemo(value);
      const item = { id: old ? old.id : 'memo_' + Date.now().toString(36), source: value.slice(0, 6000), ...summary };
      if (old) Object.assign(old, item); else get().unshift(item);
      editing = ''; save(); toast('레나가 정리해서 음성사서함에 저장했어요.');
    } catch (e) { error = e.message || '정리하지 못했어요.'; }
    busy = false; refreshSheet();
  }
  SH.memo = { t: '음성사서함', s: () => `저장한 메모 ${get().length}개`, r: B => {
    const wrap = el('div', 'memo-compose');
    const ta = el('textarea', 'in'); ta.rows = 5;
    const old = editing && get().find(x => x.id === editing);
    ta.placeholder = '정리해서 저장하고 싶은 내용을 편하게 적어 줘…';
    if (old) ta.value = sourceOf(old);
    const actions = row(btn(busy ? '정리하는 중…' : '레나에게 정리해서 저장', 'teal wide', () => saveMemo(ta)), btn('새로 쓰기', 'ghost', () => { editing = ''; error = ''; refreshSheet(); }));
    if (busy) actions.querySelectorAll('button').forEach(b => b.disabled = true);
    wrap.append(el('div', 'memo-compose-title', editing ? '음성사서함 수정' : '새 음성사서함'), el('p', 'memo-compose-hint', '내용을 편하게 적어 두면 레나가 제목과 핵심 내용으로 정리해 저장해요.'), ta, actions);
    if (error) wrap.appendChild(el('div', 'warn', error));
    B.appendChild(wrap);
    B.appendChild(el('div', 'memo-section-title', '보관된 음성사서함'));
    if (!get().length) { B.appendChild(empty('아직 저장된 내용이 없어요.\n위에 적고 레나에게 정리를 맡겨 보세요.', 'st_tape')); return; }
    get().slice().sort((a, b) => (b.at || 0) - (a.at || 0)).forEach(x => renderPaper(B, typeof x === 'string' ? { text: x, at: Date.now() } : x));
  }};
  window.lenaMemo = { open: () => openSheet(5), render: B => SH.memo.r(B), saveFromText };
  const css = `
.memo-compose{position:relative;margin:4px 0 18px;padding:18px 14px 14px;background:#f3efe6 url(assets/lena/paper_white.webp) center/cover;color:#17181a;border:2px solid #111;box-shadow:3px 4px 0 rgba(0,0,0,.45)}.memo-compose::before{content:'';position:absolute;top:-8px;left:42%;width:68px;height:16px;background:url(assets/lena/tape_pink1.webp) center/100% 100%}.memo-compose-title{font-family:'Black Han Sans';font-size:18px;margin-bottom:4px}.memo-compose-hint{font-size:12.5px;color:#555;line-height:1.45;margin:0 0 10px}.memo-compose textarea{display:block;width:100%;min-height:110px;padding:11px;border:1.5px solid #333;border-radius:2px;background:rgba(255,255,255,.8);color:#111;font-size:14px;line-height:1.55;resize:vertical}.memo-compose .row{display:flex;gap:7px;flex-wrap:wrap;margin-top:10px}.memo-section-title{margin:10px 0 8px;font-size:14px;font-weight:900;color:var(--mint);letter-spacing:.04em}.memo-paper{margin-top:10px}
.memo-paper .qa{border-top:1px dashed rgba(0,0,0,.2);padding:7px 0}
.memo-paper .qa b{display:block;font-size:14px;line-height:1.45}
.memo-paper .qa p{font-size:13.5px;line-height:1.5;color:#0f6f62}
`;
  document.head.appendChild(Object.assign(document.createElement('style'), { textContent: css }));
})();