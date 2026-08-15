export async function onRequest(context) {
  const url = new URL(context.request.url);
  // 未登录访问 /home 一律弹回登录页
  if (url.pathname.startsWith('/home')) {
    const cookie = context.request.headers.get('Cookie') || '';
    if (!cookie.includes('leleo-auth=1')) {
      return Response.redirect(new URL('/', context.request.url), 302);
    }
  }
  return context.next();
}
