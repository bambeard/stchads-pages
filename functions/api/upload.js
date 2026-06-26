import { checkAuth, json, unauthorized } from "./_utils.js";

export async function onRequestPost({ request, env }) {
  if (!checkAuth(request, env)) return unauthorized();

  const formData = await request.formData();
  const file = formData.get("file");
  if (!file || !(file instanceof File)) return json({ error: "file required" }, 400);

  const ext = file.name.split(".").pop().toLowerCase();
  const base = file.name.replace(/\.[^.]+$/, "").toLowerCase()
    .replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  const filename = `${base}-${Date.now()}.${ext}`;

  await env.IMAGES_R2.put(filename, file.stream(), {
    httpMetadata: { contentType: file.type || "image/jpeg" },
  });

  return json({ url: `/images/r2/${filename}`, filename }, 201);
}
