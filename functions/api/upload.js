function checkAuth(request, env) {
  const auth = request.headers.get("Authorization") || "";
  const token = auth.replace("Bearer ", "").trim();
  return token === (env.ADMIN_PASSWORD || "").trim();
}

export async function onRequestPost({ request, env }) {
  if (!checkAuth(request, env)) {
    return new Response("Unauthorized", { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("file");

  if (!file || !(file instanceof File)) {
    return new Response("file required", { status: 400 });
  }

  // Sanitize filename: lowercase, replace spaces with hyphens
  const ext = file.name.split(".").pop().toLowerCase();
  const safe = file.name
    .replace(/\.[^.]+$/, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  const filename = `${safe}-${Date.now()}.${ext}`;

  await env.IMAGES_R2.put(filename, file.stream(), {
    httpMetadata: { contentType: file.type || "image/jpeg" },
  });

  const url = `/images/r2/${filename}`;
  return new Response(JSON.stringify({ url, filename }), {
    status: 201,
    headers: { "Content-Type": "application/json" },
  });
}
