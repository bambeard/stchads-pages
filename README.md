# St. Chads Projects — Cloudflare Pages

Rebuilt version of stchadsprojects.com with a CMS backend for uploading new exhibitions.

## Stack

- **Frontend**: Vanilla HTML/CSS/JS (matches original design)
- **Hosting**: Cloudflare Pages
- **API**: Cloudflare Pages Functions
- **Data**: Cloudflare KV (exhibition JSON)
- **Images**: Cloudflare R2 (new uploads); original images hotlinked

---

## One-time Setup

### 1. Install Wrangler

```bash
npm install
```

### 2. Login to Cloudflare

```bash
npx wrangler login
```

### 3. Create a KV namespace

```bash
npx wrangler kv:namespace create EXHIBITIONS_KV
npx wrangler kv:namespace create EXHIBITIONS_KV --preview
```

Copy the `id` and `preview_id` values into `wrangler.toml`.

### 4. Create an R2 bucket

```bash
npx wrangler r2 bucket create stchads-images
```

### 5. Create the CF Pages project

```bash
npx wrangler pages project create stchads-pages
```

### 6. Set the admin password secret

```bash
npx wrangler pages secret put ADMIN_PASSWORD
# Enter your chosen password when prompted
```

### 7. Deploy

```bash
npx wrangler pages deploy public
```

### 8. Seed historical data

After deploying, open `https://your-site.pages.dev/admin`, log in, go to **Seed / Reset**, and click **Seed Historical Data**.

Or via CLI:
```bash
ADMIN_PASSWORD=yourpassword SITE_URL=https://your-site.pages.dev node scripts/seed.js
```

---

## Local development

```bash
npm run dev
# Opens at http://localhost:8788
```

Note: local dev uses a local KV/R2 emulator. The seed step still applies.

---

## Adding a new exhibition

1. Go to `https://your-site.pages.dev/admin`
2. Log in with your admin password
3. Fill in the exhibition details:
   - **Title** — e.g. "New Show"
   - **Artist(s)** — comma-separated
   - **Year** / **Dates**
   - **Status** — "Current" places it first and marks the previous as past
   - **Description** — materials, dimensions, artist statement
4. Upload images (drag & drop or click). The first image uploaded becomes the "invite" image (square format works best).
5. Add Vimeo or YouTube URLs if needed.
6. Click **Save Exhibition**.

The site updates immediately — no redeploy needed.

---

## Exhibition data format

```json
{
  "id": "show-name-2025",
  "title": "Show Name",
  "artists": ["Artist One"],
  "year": 2025,
  "status": "current",
  "dates": "1–28 March 2025",
  "description": "Materials, dimensions, year.\nArtist statement.",
  "media": [
    { "type": "image", "src": "/images/r2/filename.jpg", "role": "invite" },
    { "type": "video", "platform": "vimeo", "id": "123456789" },
    { "type": "image", "src": "/images/r2/filename2.jpg" }
  ]
}
```

---

## Custom domain

In the Cloudflare Pages dashboard → your project → Custom domains → Add custom domain → `stchadsprojects.com`.
