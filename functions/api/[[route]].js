export async function onRequest(context) {
  const url = new URL(context.request.url);
  const target = 'https://api.ceru.shiqianjiang.cn' + url.pathname + url.search;
  const response = await fetch(target);

  const isJson = (response.headers.get('Content-Type') || '').includes('json');
  const cache = isJson ? 'public, max-age=300' : 'public, max-age=60';

  const headers = new Headers(response.headers);
  headers.set('Cache-Control', cache);

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}
