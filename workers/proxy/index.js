const ORIGIN = 'https://jupiterw.pages.dev';

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const target = ORIGIN + url.pathname + url.search;

    const headers = new Headers(request.headers);
    headers.set('Host', 'jupiterw.pages.dev');

    const res = await fetch(target, {
      method: request.method,
      headers,
      body: request.body,
      redirect: 'manual',
    });

    const respHeaders = new Headers(res.headers);

    const contentType = respHeaders.get('Content-Type') || '';
    if (contentType.includes('text/html') || contentType.includes('text/css') || contentType.includes('javascript')) {
      respHeaders.set('Cache-Control', 'public, max-age=3600');
    }

    return new Response(res.body, {
      status: res.status,
      statusText: res.statusText,
      headers: respHeaders,
    });
  },
};
