// 레나 메모 — 공부 노트와 분리된 빠른 메모
'use strict';
(() => {
  const get = () => { if (!S.memo || !Array.isArray(S.memo)) S.memo = []; return S.memo; };
  let editing = '';
  SH.memo = { t: '음성사서함', s: () => `저장한 메모 ${get().length}개`, r: B => {
    const wrap = el('div', 'card paperc memo-card');
    const ta = el('textarea', 'in'); ta.placeholder = '잊지 말아야 할 생각이나 기록을 적어 둬…'; ta.rows = 4;
    const saveMemo = () => {
      const value = ta.value.trim(); if (!value) { toast('내용을 적어 줘.'); return; }
      if (editing) { const x = get().find(x => x.id === editing); if (x) { x.text = value.slice(0, 3000); x.at = Date.now(); } }
      else get().unshift({ id: 'memo_' + Date.now().toString(36), text: value.slice(0, 3000), at: Date.now() });
      editing = ''; save(); refreshSheet(); toast('메모해 뒀어.');
    };
    const actions = row(btn(editing ? '수정 저장' : '메모 저장', 'teal wide', saveMemo), btn('새 메모', 'ghost', () => { editing = ''; refreshSheet(); }));
    wrap.append(el('div', 'hint', editing ? '메모를 고치는 중이야.' : '공부 노트와 별도로 가볍게 적어 두는 공간이야.'), ta, actions);
    if (editing) { const x = get().find(x => x.id === editing); if (x) ta.value = x.text; }
    B.appendChild(wrap);
    B.appendChild(lbl('저장한 메모'));
    if (!get().length) { B.appendChild(empty('아직 메모가 없어.\n위에 적고 저장하면 여기에 모아 둘게.', 'st_tape')); return; }
    const list = el('div', 'list card paperc');
    get().slice().sort((a,b) => b.at-a.at).forEach(x => {
      const item = el('div', 'it'), body = el('button', 't', x.text);
      body.style.cssText = 'text-align:left;white-space:pre-wrap;word-break:break-word;line-height:1.5';
      body.appendChild(el('small', null, new Date(x.at).toLocaleString('ko-KR', {month:'numeric',day:'numeric',hour:'2-digit',minute:'2-digit'})));
      body.onclick = () => { editing = x.id; refreshSheet(); };
      item.append(body, xbtn(() => { if (!confirm('이 메모를 지울까?')) return; S.memo = get().filter(y => y !== x); if (editing === x.id) editing = ''; save(); refreshSheet(); }));
      list.appendChild(item);
    });
    B.appendChild(list);
  }};
  window.lenaMemo = { open: () => openSheet(5), render: B => SH.memo.r(B) };
  const css = '.memo-card textarea{width:100%;min-height:110px;padding:12px;border-radius:8px;background:#fff;color:#111;border:2px solid #17181a;resize:vertical}.memo-card .hint{color:#444}.memo-card .row{display:flex;gap:8px}';
  document.head.appendChild(Object.assign(document.createElement('style'), {textContent:css}));
})();
