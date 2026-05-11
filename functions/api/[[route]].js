export async function onRequest(context) {
  const url = new URL(context.request.url);
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
