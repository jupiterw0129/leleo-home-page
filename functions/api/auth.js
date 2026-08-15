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
  if (!secret) return new Response('未配置 AUTH_SECRET', { status: 500 });

  let answer = '';
  try { answer = (await context.request.json()).answer || ''; } catch (e) {}

  // 谜题答案校验（门槛，真正的安全来自下面的 HMAC 签名）
  if (answer !== 'fool1349') {
    return new Response(JSON.stringify({ error: '密语错误' }), {
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
