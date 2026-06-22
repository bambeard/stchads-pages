const KV_KEY = "exhibitions";

function checkAuth(request, env) {
  const auth = request.headers.get("Authorization") || "";
  const token = auth.replace("Bearer ", "").trim();
  return token === (env.ADMIN_PASSWORD || "").trim();
}

export async function onRequestPost({ request, env }) {
  if (!checkAuth(request, env)) {
    return new Response("Unauthorized", { status: 401 });
  }

  const existing = await env.EXHIBITIONS_KV.get(KV_KEY, "json");
  if (existing && existing.exhibitions?.length > 0) {
    return new Response(
      JSON.stringify({ ok: false, message: "Already seeded. Reset first if you want to re-seed." }),
      { status: 409, headers: { "Content-Type": "application/json" } }
    );
  }

  // Fetch seed data from the static file served alongside this site
  const url = new URL(request.url);
  const seedUrl = `${url.origin}/data/exhibitions.json`;
  const seedRes = await fetch(seedUrl);
  if (!seedRes.ok) {
    return new Response(
      JSON.stringify({ ok: false, message: "Could not load seed data" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }

  const seedData = await seedRes.json();
  await env.EXHIBITIONS_KV.put(KV_KEY, JSON.stringify(seedData));

  return new Response(
    JSON.stringify({ ok: true, count: seedData.exhibitions.length }),
    { headers: { "Content-Type": "application/json" } }
  );
}

export async function onRequestDelete({ request, env }) {
  if (!checkAuth(request, env)) {
    return new Response("Unauthorized", { status: 401 });
  }
  await env.EXHIBITIONS_KV.put(KV_KEY, JSON.stringify({ exhibitions: [] }));
  return new Response(JSON.stringify({ ok: true }), {
    headers: { "Content-Type": "application/json" },
  });
}
