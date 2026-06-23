# St. Chads Projects

Rebuilt version of [stchadsprojects.com](https://www.stchadsprojects.com/) as a Cloudflare Pages site with a CMS admin for managing exhibitions.

**Live site**: https://stchads-pages.pages.dev  
**Admin**: https://stchads-pages.pages.dev/admin

---

## Stack

- **Frontend**: Vanilla HTML/CSS/JS, Times serif, matching original design
- **Hosting**: Cloudflare Pages (auto-deploys from GitHub `main` branch)
- **API**: Cloudflare Pages Functions
- **Data**: Cloudflare KV (exhibition JSON)
- **Image uploads**: Cloudflare R2 (`stchads-images` bucket)

---

## One-time setup (already done — for reference only)

```bash
npm install
npx wrangler login
npx wrangler kv namespace create EXHIBITIONS_KV
npx wrangler kv namespace create EXHIBITIONS_KV --preview
npx wrangler r2 bucket create stchads-images
npx wrangler pages project create stchads-pages
npx wrangler pages secret put ADMIN_PASSWORD
```

Copy the KV namespace IDs into `wrangler.toml`.

---

## Local development

```bash
npm run dev
# Site at http://localhost:8788
```

---

## Deploying

Push to `main` on GitHub — Cloudflare Pages builds and deploys automatically.

```bash
git push
```

---

## Using the admin

Go to `/admin` on the live site. Log in with the admin password set via `ADMIN_PASSWORD`.

### Adding a new exhibition

1. **Add Exhibition** tab
2. Fill in title, artists, year, dates, status
3. Upload images — drop them onto the upload area or click to select
   - The first image is automatically the **invite/flyer** (displayed centred and smaller on the site)
   - You can toggle the invite marker on any image using the **invite** button in its block toolbar
4. Add **text blocks** with `+ Text Block` — type materials, dimensions, artist statement
5. Add **videos** by pasting a Vimeo or YouTube URL and clicking `+ Video`
6. **Drag blocks** using the ⠿ grip handle to reorder them — the block list shows a preview of how content will appear on the site
7. Click **Save Exhibition**

Setting status to **Current** places the exhibition first and marks the previous current as past.

### Editing an exhibition

Go to **All Exhibitions** tab → **Edit** next to any show. The same block builder opens pre-filled. Drag to reorder, add or remove blocks, then **Save Changes**.

### Seeding historical data

**Seed / Reset** tab → **Seed Historical Data** — populates the database with the 18 historical exhibitions from the original site. Only works on an empty database. To start fresh, **Reset All Data** first.

---

## Exhibition data format

Each exhibition has a flat `media` array rendered top to bottom:

```json
{
  "id": "show-name-2025",
  "title": "Show Name",
  "artists": ["Artist One", "Artist Two"],
  "year": 2025,
  "status": "current",
  "dates": "1–28 March 2025",
  "media": [
    { "type": "image", "src": "/images/r2/flyer.jpg", "role": "invite" },
    { "type": "text",  "content": "Oil on canvas, 200 × 150 cm.\n\n2025" },
    { "type": "video", "platform": "vimeo", "id": "123456789" },
    { "type": "image", "src": "/images/r2/install1.jpg" },
    { "type": "image", "src": "/images/r2/install2.jpg" }
  ]
}
```

Text blocks split on double newlines (`\n\n`) into separate paragraphs.

---

## Known issues / to do

- **Text blocks in seeded data** — the historical migration combined all text per exhibition into one block at the top. To match the original layout, edit each exhibition in admin and split/reorder text blocks manually.
- **Custom domain** — point `stchadsprojects.com` to Cloudflare Pages via the Pages dashboard → Custom domains. DNS update required at the registrar.

---

## File structure

```
public/
  index.html              main site
  admin/index.html        CMS admin
  data/exhibitions.json   historical seed data
functions/api/
  exhibitions.js          CRUD API
  auth.js                 password check
  upload.js               R2 image upload
  seed.js                 seed / reset
  images/r2/[file].js     R2 image serving
wrangler.toml             Cloudflare bindings config
```
