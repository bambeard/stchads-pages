export async function onRequestGet({ request, env }) {
  const auth = request.headers.get("Authorization") || "";
  const token = auth.replace("Bearer ", "").trim();
  const stored = (env.ADMIN_PASSWORD || "").trim();

  if (!stored) {
    return new Response(
      JSON.stringify({ ok: false, error: "ADMIN_PASSWORD secret not set on this project" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }

  if (token !== stored) {
    return new Response(
      JSON.stringify({ ok: false }),
      { status: 401, headers: { "Content-Type": "application/json" } }
    );
  }

  return new Response(
    JSON.stringify({ ok: true }),
    { headers: { "Content-Type": "application/json" } }
  );
}
