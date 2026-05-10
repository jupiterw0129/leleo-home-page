export async function onRequest(context) {
  const path = context.params.path || '';
  const parts = path.split('/');
  if (parts.length < 2) {
    return new Response('Invalid path', { status: 400 });
  }

  const shareId = parts[0];
  const songmid = parts[1];
  const apiUrl = `https://api.ceru.shiqianjiang.cn/api/share/playlist/${shareId}/song/${songmid}/audio`;

  return fetch(apiUrl);
}
