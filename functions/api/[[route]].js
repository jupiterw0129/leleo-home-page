export async function onRequest(context) {
  const url = new URL(context.request.url);
  const target = 'https://api.ceru.shiqianjiang.cn' + url.pathname + url.search;
  return fetch(target);
}
