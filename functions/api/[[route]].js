export async function onRequest(context) {
  const url = new URL(context.request.url);

  // 只放行音乐分享相关的已知路径，其余一律拒绝。
  // 这个 catch-all 原本会把 /api/* 的任意路径反代到上游，等于一个公开代理，
  // 容易被扫描器/爬虫拿去白嫖，一天就能刷爆免费额度的 10 万次请求。
  if (context.request.method !== 'GET' && context.request.method !== 'HEAD') {
    return new Response('Method Not Allowed', { status: 405 });
  }
  if (!url.pathname.startsWith('/api/share/playlist/')) {
    return new Response('Not Found', { status: 404 });
  }

  const target = 'https://api.ceru.shiqianjiang.cn' + url.pathname + url.search;

  const reqHeaders = new Headers();
  for (const h of ['range', 'if-range', 'if-none-match', 'if-modified-since']) {
    const val = context.request.headers.get(h);
    if (val) reqHeaders.set(h, val);
  }

  const response = await fetch(target, { headers: reqHeaders });

  const isJson = (response.headers.get('Content-Type') || '').includes('json');

  const respHeaders = new Headers(response.headers);
  if (isJson) {
    respHeaders.set('Cache-Control', 'public, max-age=300');
  } else {
    respHeaders.set('Cache-Control', 'public, max-age=86400, immutable');
    respHeaders.set('Accept-Ranges', 'bytes');
  }

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: respHeaders,
  });
}
