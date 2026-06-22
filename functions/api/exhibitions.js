const KV_KEY = "exhibitions";

function checkAuth(request, env) {
  const auth = request.headers.get("Authorization") || "";
  const token = auth.replace("Bearer ", "").trim();
  return token === (env.ADMIN_PASSWORD || "").trim();
}

async function getExhibitions(env) {
  const data = await env.EXHIBITIONS_KV.get(KV_KEY, "json");
  if (!data) {
    // Return empty on first run — seed via /api/seed or admin
    return { exhibitions: [] };
  }
  return data;
}

export async function onRequestGet({ env }) {
  const data = await getExhibitions(env);
  return new Response(JSON.stringify(data), {
    headers: { "Content-Type": "application/json", "Cache-Control": "no-cache" },
  });
}

export async function onRequestPost({ request, env }) {
  if (!checkAuth(request, env)) {
    return new Response("Unauthorized", { status: 401 });
  }

  const body = await request.json();
  const data = await getExhibitions(env);

  // Validate required fields
  if (!body.title && !body.artists?.length) {
    return new Response("title or artists required", { status: 400 });
  }

  const id =
    body.id ||
    `${body.title || body.artists[0] || "exhibition"}-${body.year || new Date().getFullYear()}`
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");

  const exhibition = {
    id,
    title: body.title || null,
    artists: body.artists || [],
    year: body.year || new Date().getFullYear(),
    status: body.status || "current",
    description: body.description || "",
    media: body.media || [],
    dates: body.dates || null,
    createdAt: new Date().toISOString(),
  };

  // New exhibitions go to the front (current position)
  if (body.prepend !== false) {
    // Mark previous current as past
    data.exhibitions = data.exhibitions.map((ex) =>
      ex.status === "current" ? { ...ex, status: "past" } : ex
    );
    data.exhibitions.unshift(exhibition);
  } else {
    data.exhibitions.push(exhibition);
  }

  await env.EXHIBITIONS_KV.put(KV_KEY, JSON.stringify(data));
  return new Response(JSON.stringify(exhibition), {
    status: 201,
    headers: { "Content-Type": "application/json" },
  });
}

export async function onRequestDelete({ request, env }) {
  if (!checkAuth(request, env)) {
    return new Response("Unauthorized", { status: 401 });
  }

  const url = new URL(request.url);
  const id = url.searchParams.get("id");
  if (!id) return new Response("id required", { status: 400 });

  const data = await getExhibitions(env);
  data.exhibitions = data.exhibitions.filter((ex) => ex.id !== id);
  await env.EXHIBITIONS_KV.put(KV_KEY, JSON.stringify(data));

  return new Response(JSON.stringify({ ok: true }), {
    headers: { "Content-Type": "application/json" },
  });
}

export async function onRequestPut({ request, env }) {
  if (!checkAuth(request, env)) {
    return new Response("Unauthorized", { status: 401 });
  }

  const body = await request.json();
  const data = await getExhibitions(env);
  const idx = data.exhibitions.findIndex((ex) => ex.id === body.id);
  if (idx === -1) return new Response("Not found", { status: 404 });

  data.exhibitions[idx] = { ...data.exhibitions[idx], ...body };
  await env.EXHIBITIONS_KV.put(KV_KEY, JSON.stringify(data));

  return new Response(JSON.stringify(data.exhibitions[idx]), {
    headers: { "Content-Type": "application/json" },
  });
}
