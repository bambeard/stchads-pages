export async function onRequestGet({ params, env }) {
  const path = params.path.join("/");
  const obj = await env.IMAGES_R2.get(path);

  if (!obj) {
    return new Response("Not found", { status: 404 });
  }

  const headers = new Headers();
  obj.writeHttpMetadata(headers);
  headers.set("Cache-Control", "public, max-age=31536000, immutable");

  return new Response(obj.body, { headers });
}
