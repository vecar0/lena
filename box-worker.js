// 레나 우편함 서버 (Cloudflare Worker) — 단축어용
// 설정: Cloudflare 대시보드 > Workers > 새 Worker "lena-box" > 이 코드 붙여넣기 > 배포
//       Settings > Bindings > KV namespace 추가: 변수 이름 BOX (새 KV 하나 만들어 연결)
// 엔드포인트 (t = 앱 설정에 보이는 내 열쇠)
//   POST /alarms {t, alarms:[{at:"YYYY-MM-DDTHH:mm", label}]}   앱이 알람 목록을 올림
//   GET  /alarms?t=..&h=26                                       단축어가 앞으로 h시간 안의 알람을 받음
//   GET|POST /in?t=..&text=..                                    단축어(공유하기·잠금화면)가 레나에게 보냄
//   GET  /inbox?t=..                                             앱이 받은 걸 가져가고 비움
//   POST /in?t=..&src=share  (본문 = 파일 그대로: 사진·PDF·글)      v2: 공유하기로 파일 보내기. 글이면 메모로, 아니면 파일로 보관(15MB까지, 14일)
//   GET  /file?t=..&id=..                                        앱이 파일을 받아 가면 지움
const H = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET,POST,OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type' };
const J = (o, s = 200) => new Response(JSON.stringify(o), { status: s, headers: { ...H, 'Content-Type': 'application/json; charset=utf-8' } });
const T = (t, s = 200) => new Response(t, { status: s, headers: { ...H, 'Content-Type': 'text/plain; charset=utf-8' } });
const ok = t => typeof t === 'string' && /^[a-f0-9]{24,64}$/.test(t);
const VER = 'v2';

export default {
  async fetch(req, env) {
    if (req.method === 'OPTIONS') return new Response(null, { headers: H });
    const u = new URL(req.url), p = u.pathname.replace(/\/+$/, '');
    let body = {}, raw = null, ctype = '';
    if (req.method === 'POST') { const ct = (req.headers.get('content-type') || '').toLowerCase(); ctype = ct;
      if (ct.includes('json')) { try { body = await req.json(); } catch (e) {} }
      else if (ct.includes('form')) { try { const f = await req.formData(); for (const [k, v] of f) { if (typeof v === 'string') body[k] = v; else { raw = await v.arrayBuffer(); ctype = v.type || ''; body.name = v.name; } } } catch (e) {} }
      else { raw = await req.arrayBuffer(); } }
    const t = body.t || u.searchParams.get('t');
    if (p === '' || p === '/') return T('lena-box ok ' + VER);
    if (!ok(t)) return J({ error: 'key' }, 401);

    if (p === '/alarms' && req.method === 'POST') {
      const list = (Array.isArray(body.alarms) ? body.alarms : []).filter(a => a && /^\d{4}-\d\d-\d\dT\d\d:\d\d$/.test(a.at)).slice(0, 60).map(a => ({ at: a.at, label: String(a.label || '레나').slice(0, 40) }));
      await env.BOX.put('a:' + t, JSON.stringify({ list, tz: +body.tz || 0, up: Date.now() }), { expirationTtl: 60 * 60 * 24 * 40 });
      return J({ ok: true, n: list.length });
    }
    if (p === '/alarms') {
      const d = JSON.parse((await env.BOX.get('a:' + t)) || '{"list":[],"tz":0}');
      const hrs = Math.min(72, Math.max(1, +u.searchParams.get('h') || 26));
      const nowLocal = Date.now() - (d.tz || 0) * 60000, end = nowLocal + hrs * 3600e3;
      const out = d.list.filter(a => { const ms = Date.parse(a.at + ':00Z'); return ms > nowLocal && ms <= end; }).map(a => ({ at: a.at, time: a.at.slice(11, 16), label: a.label }));
      if (u.searchParams.get('f') === 'text') return T(out.map(a => a.time + ' ' + a.label).join('\n'));
      return J({ alarms: out, count: out.length });
    }
    if (p === '/in' && raw && raw.byteLength) {
      // 공유하기로 온 본문: 글이면 메모, 사진·PDF 등은 파일로 보관
      const isText = /^text\//.test(ctype) || (!ctype && raw.byteLength < 20000 && !new Uint8Array(raw.slice(0, 512)).some(b => b === 0));
      if (isText) body.text = new TextDecoder().decode(raw);
      else {
        if (raw.byteLength > 15e6) return T('파일이 너무 커요(15MB까지).', 413);
        const id = crypto.randomUUID().slice(0, 12), type = (ctype.split(';')[0] || 'application/octet-stream').trim();
        await env.BOX.put('f:' + t + ':' + id, raw, { expirationTtl: 60 * 60 * 24 * 14, metadata: { type } });
        const k = 'i:' + t, cur = JSON.parse((await env.BOX.get(k)) || '[]');
        cur.push({ file: id, type, size: raw.byteLength, name: String(body.name || u.searchParams.get('name') || '').slice(0, 80), at: Date.now(), src: String(u.searchParams.get('src') || 'share').slice(0, 20) });
        await env.BOX.put(k, JSON.stringify(cur.slice(-30)), { expirationTtl: 60 * 60 * 24 * 14 });
        return T(`레나가 파일을 받았어요(${type.split('/')[1] || '파일'}). 앱을 열면 보여 줄게요.`);
      }
    }
    if (p === '/file') {
      const id = u.searchParams.get('id') || '', key = 'f:' + t + ':' + id;
      const { value, metadata } = await env.BOX.getWithMetadata(key, { type: 'arrayBuffer' });
      if (!value) return T('없어요(이미 받았거나 14일이 지났어요).', 404);
      if (u.searchParams.get('keep') !== '1') await env.BOX.delete(key);
      return new Response(value, { headers: { ...H, 'Content-Type': (metadata && metadata.type) || 'application/octet-stream' } });
    }
    if (p === '/in') {
      const text = String(body.text || u.searchParams.get('text') || '').trim().slice(0, 2000);
      if (!text) return T('보낼 내용이 비어 있어요.', 400);
      const k = 'i:' + t, cur = JSON.parse((await env.BOX.get(k)) || '[]');
      cur.push({ text, at: Date.now(), src: String(body.src || u.searchParams.get('src') || '').slice(0, 20) });
      await env.BOX.put(k, JSON.stringify(cur.slice(-30)), { expirationTtl: 60 * 60 * 24 * 14 });
      return T('레나가 받았어요. 앱을 열면 정리해 둘게요.');
    }
    if (p === '/inbox') {
      const k = 'i:' + t, cur = JSON.parse((await env.BOX.get(k)) || '[]');
      if (cur.length) await env.BOX.delete(k);
      return J({ items: cur });
    }
    return J({ error: 'not found' }, 404);
  }
};
