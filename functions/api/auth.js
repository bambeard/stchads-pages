import { checkAuth, json } from "./_utils.js";

export async function onRequestGet({ request, env }) {
  if (!(env.ADMIN_PASSWORD || "").trim()) {
    return json({ ok: false, error: "ADMIN_PASSWORD secret not set on this project" }, 500);
  }
  const ok = checkAuth(request, env);
  return json({ ok }, ok ? 200 : 401);
}
