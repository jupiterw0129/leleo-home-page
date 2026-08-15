async function hmacHex(secret, msg) {
  const key = await crypto.subtle.importKey(
    'raw', new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']
  );
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(msg));
  return Array.from(new Uint8Array(sig)).map(b => b.toString(16).padStart(2, '0')).join('');
}

export async function onRequest(context) {
  const secret = context.env.AUTH_SECRET;
  const password = (context.env.AUTH_PASSWORD || '').trim();
  if (!secret || !password) {
    return new Response('未配置 AUTH_SECRET / AUTH_PASSWORD', { status: 500 });
  }

  let body = {};
  try { body = await context.request.json(); } catch (e) {}
  const keys = (body.keys || '').toString().toLowerCase();
  const stars = (body.stars || '').toString();
  const mobile = !!body.mobile;

  // 密码格式：前4位小写字母（键盘）+ 后4位数字1-9（群星）。
  // 真实密码只存在 Cloudflare 环境变量 AUTH_PASSWORD 里，绝不写进代码。
  const keyPart = password.slice(0, 4).toLowerCase();
  const starPart = password.slice(4);

  const ok = mobile
    ? (stars === starPart)
    : (keys === keyPart && stars === starPart);

  if (!ok) {
    return new Response(JSON.stringify({ error: '凭证错误' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const ts = Math.floor(Date.now() / 1000);
  const sig = await hmacHex(secret, String(ts));
  return new Response(JSON.stringify({ token: `${ts}.${sig}` }), {
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
  });
}
