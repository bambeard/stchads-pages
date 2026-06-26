import { checkAuth, json, unauthorized, getExhibitions, putExhibitions } from "./_utils.js";

export async function onRequestPost({ request, env }) {
  if (!checkAuth(request, env)) return unauthorized();

  const existing = await getExhibitions(env);
  if (existing.exhibitions.length > 0) {
    return json({ ok: false, message: "Already seeded. Reset first if you want to re-seed." }, 409);
  }

  const seedUrl = `${new URL(request.url).origin}/data/exhibitions.json`;
  const seedRes = await fetch(seedUrl);
  if (!seedRes.ok) {
    return json({ ok: false, message: "Could not load seed data" }, 500);
  }

  const seedData = await seedRes.json();
  await putExhibitions(env, seedData);
  return json({ ok: true, count: seedData.exhibitions.length });
}

export async function onRequestDelete({ request, env }) {
  if (!checkAuth(request, env)) return unauthorized();
  await putExhibitions(env, { exhibitions: [] });
  return json({ ok: true });
}
