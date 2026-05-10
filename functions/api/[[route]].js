export async function onRequest(context) {
  const url = new URL(context.request.url);
  const target = 'https://api.ceru.shiqianjiang.cn' + url.pathname + url.search;
  const response = await fetch(target);

  const isJson = (response.headers.get('Content-Type') || '').includes('json');
  const cache = isJson ? 'public, max-age=300' : 'public, max-age=60';

  return new Response(response.body, {
    status: response.status,
    headers: {
      'Content-Type': response.headers.get('Content-Type') || 'application/octet-stream',
      'Cache-Control': cache,
    },
  });
}
