import { checkAuth, json, unauthorized, getExhibitions, putExhibitions } from "./_utils.js";

export async function onRequestGet({ env }) {
  return json(await getExhibitions(env));
}

export async function onRequestPost({ request, env }) {
  if (!checkAuth(request, env)) return unauthorized();

  const body = await request.json();
  if (!body.title && !body.artists?.length) {
    return json({ error: "title or artists required" }, 400);
  }

  const id = body.id || `${body.title || body.artists[0] || "exhibition"}-${body.year || new Date().getFullYear()}`
    .toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

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

  const data = await getExhibitions(env);

  if (body.prepend !== false) {
    // Demote any existing current exhibition and prepend the new one
    data.exhibitions = data.exhibitions.map(ex =>
      ex.status === "current" ? { ...ex, status: "past" } : ex
    );
    data.exhibitions.unshift(exhibition);
  } else {
    data.exhibitions.push(exhibition);
  }

  await putExhibitions(env, data);
  return json(exhibition, 201);
}

export async function onRequestPut({ request, env }) {
  if (!checkAuth(request, env)) return unauthorized();

  const body = await request.json();
  const data = await getExhibitions(env);
  const idx = data.exhibitions.findIndex(ex => ex.id === body.id);
  if (idx === -1) return json({ error: "Not found" }, 404);

  data.exhibitions[idx] = { ...data.exhibitions[idx], ...body };
  await putExhibitions(env, data);
  return json(data.exhibitions[idx]);
}

export async function onRequestDelete({ request, env }) {
  if (!checkAuth(request, env)) return unauthorized();

  const id = new URL(request.url).searchParams.get("id");
  if (!id) return json({ error: "id required" }, 400);

  const data = await getExhibitions(env);
  data.exhibitions = data.exhibitions.filter(ex => ex.id !== id);
  await putExhibitions(env, data);
  return json({ ok: true });
}
