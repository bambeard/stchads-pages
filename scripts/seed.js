#!/usr/bin/env node
// Seed the KV database via the API.
// Usage: ADMIN_PASSWORD=xxx SITE_URL=https://your-site.pages.dev node scripts/seed.js

const { ADMIN_PASSWORD, SITE_URL = "http://localhost:8788" } = process.env;

if (!ADMIN_PASSWORD) {
  console.error("ADMIN_PASSWORD env var required");
  process.exit(1);
}

async function run() {
  const res = await fetch(`${SITE_URL}/api/seed`, {
    method: "POST",
    headers: { Authorization: "Bearer " + ADMIN_PASSWORD },
  });
  const data = await res.json();
  if (res.ok && data.ok) {
    console.log(`Seeded ${data.count} exhibitions.`);
  } else {
    console.error("Seed failed:", data.message || res.status);
    process.exit(1);
  }
}

run().catch((e) => { console.error(e); process.exit(1); });
