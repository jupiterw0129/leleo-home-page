export async function onRequest(context) {
  const { request } = context;
  const url = new URL(request.url);
  const apiPath = url.pathname.replace('/api/ceru', '');
  const apiUrl = `https://api.ceru.shiqianjiang.cn${apiPath}${url.search}`;

  const response = await fetch(apiUrl);

  return new Response(response.body, {
    status: response.status,
    headers: {
      'Content-Type': response.headers.get('Content-Type') || 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'no-cache',
    },
  });
}
