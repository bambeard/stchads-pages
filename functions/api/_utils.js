const KV_KEY = "exhibitions";

export function checkAuth(request, env) {
  const token = (request.headers.get("Authorization") || "").replace("Bearer ", "").trim();
  return token === (env.ADMIN_PASSWORD || "").trim();
}

export function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

export function unauthorized() {
  return new Response("Unauthorized", { status: 401 });
}

export async function getExhibitions(env) {
  return (await env.EXHIBITIONS_KV.get(KV_KEY, "json")) || { exhibitions: [] };
}

export async function putExhibitions(env, data) {
  return env.EXHIBITIONS_KV.put(KV_KEY, JSON.stringify(data));
}

export { KV_KEY };
