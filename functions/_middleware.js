// 依赖 Cloudflare 环境变量 AUTH_SECRET（在控制台 Settings → Environment variables 设置）
async function hmacHex(secret, msg) {
  const key = await crypto.subtle.importKey(
    'raw', new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']
  );
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(msg));
  return Array.from(new Uint8Array(sig)).map(b => b.toString(16).padStart(2, '0')).join('');
}

export async function onRequest(context) {
  const url = new URL(context.request.url);
  if (!url.pathname.startsWith('/home')) return context.next();

  const secret = context.env.AUTH_SECRET;
  if (!secret) return context.next();  // 未配置密钥则不拦截（开发阶段）

  const cookie = context.request.headers.get('Cookie') || '';
  const m = cookie.match(/leleo-token=([^;]+)/);
  let ok = false;
  if (m) {
    const parts = m[1].split('.');
    if (parts.length === 2) {
      const expected = await hmacHex(secret, parts[0]);
      const age = Date.now() / 1000 - Number(parts[0]);
      ok = parts[1] === expected && age < 30 * 24 * 3600;  // 30 天有效
    }
  }
  if (!ok) return Response.redirect(new URL('/', context.request.url), 302);
  return context.next();
}
