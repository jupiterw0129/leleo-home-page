export async function onRequest(context) {
  const url = new URL(context.request.url);
  const shareId = url.searchParams.get('shareId');
  if (!shareId) {
    return new Response(JSON.stringify({ error: 'Missing shareId' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const apiUrl = `https://api.ceru.shiqianjiang.cn/api/share/playlist/${shareId}`;
  const res = await fetch(apiUrl);
  if (!res.ok) {
    return new Response(JSON.stringify({ error: 'Upstream error' }), {
      status: 502,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const data = await res.json();
  const songs = (data?.data?.playlist?.songs || []).map(song => ({
    title: song.name,
    author: song.singer,
    url: `/api/audio/${shareId}/${song.songmid}`,
    pic: song.img || '',
    lrc: '',
  }));

  return new Response(JSON.stringify(songs), {
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'no-cache',
    },
  });
}
