export async function onRequest(context) {
  const { request } = context;
  const url = new URL(request.url);
  const apiPath = url.pathname.replace('/api/ceru', '');
  const apiUrl = `https://api.ceru.shiqianjiang.cn${apiPath}${url.search}`;

  const apiReq = new Request(apiUrl, {
    method: request.method,
    headers: request.headers,
    body: request.method !== 'GET' && request.method !== 'HEAD' ? request.body : undefined,
    redirect: 'follow',
  });

  const response = await fetch(apiReq);
  const headers = new Headers(response.headers);
  headers.set('Access-Control-Allow-Origin', request.headers.get('Origin') || '*');
  headers.set('Vary', 'Origin');

  return new Response(response.body, {
    status: response.status,
    headers,
  });
}
