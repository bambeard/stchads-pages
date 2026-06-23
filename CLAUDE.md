# CLAUDE.md — St. Chads Projects

Context for Claude Code to pick up this project without re-discovering everything.

---

## What this is

A rebuild of https://www.stchadsprojects.com/ as a Cloudflare Pages site with a CMS admin.
The original was built in Adobe Muse (deprecated) — an absolute-position float layout.
The rebuild uses vanilla HTML/CSS/JS on the frontend, matching the original's visual design exactly.

Live site: https://stchads-pages.pages.dev  
Admin: https://stchads-pages.pages.dev/admin  
GitHub: https://github.com/bambeard/stchads-pages

---

## Stack

| Layer | Technology |
|---|---|
| Hosting | Cloudflare Pages |
| API | Cloudflare Pages Functions (`/functions/api/`) |
| Data | Cloudflare KV — binding: `EXHIBITIONS_KV`, key: `"exhibitions"` |
| Image uploads | Cloudflare R2 — binding: `IMAGES_R2`, bucket: `stchads-images` |
| Auth | Bearer token checked against `ADMIN_PASSWORD` env secret (trimmed both sides) |
| Frontend | Vanilla HTML/CSS/JS — no build step, no framework |

---

## Key files

```
public/
  index.html          — main site frontend
  admin/index.html    — admin CMS
  data/exhibitions.json — seed data (18 historical exhibitions)
  images/             — static assets

functions/api/
  exhibitions.js      — GET (public), POST, PUT, DELETE (auth)
  auth.js             — GET — validates Bearer token, returns {ok:true/false}
  upload.js           — POST — accepts multipart file, stores to R2, returns {url}
  seed.js             — POST (seed from exhibitions.json), DELETE (reset to [])

images/r2/[file].js   — serves R2 objects via HTTP
```

---

## Data model

Each exhibition in KV:
```json
{
  "id": "show-name-2025",
  "title": "Show Name",
  "artists": ["Artist One"],
  "year": 2025,
  "status": "current",
  "dates": "1–28 March 2025",
  "media": [
    { "type": "image", "src": "/images/r2/filename.jpg", "role": "invite" },
    { "type": "text",  "content": "Materials, dimensions.\n\nArtist statement." },
    { "type": "video", "platform": "vimeo", "id": "123456789" },
    { "type": "image", "src": "https://www.stchadsprojects.com/images/photo.jpg" }
  ]
}
```

- `media` is a flat ordered array — rendered top to bottom
- `role: "invite"` marks the flyer/poster image (displayed centred, max-width 74%)
- Text blocks split on `\n\n` into separate `<p>` tags
- Images not in R2 hotlink to the original stchadsprojects.com domain

---

## CSS values from original site (reverse-engineered from the Muse CSS)

These were pulled from `https://www.stchadsprojects.com/css/index.css`:

| Element | Value |
|---|---|
| Page max-width | 960px, no horizontal padding |
| Header: padding-top on text column | 71px |
| Logo | 214×214px, position:absolute top-right |
| Site title font | 24px / 29px, Times |
| Address margin-top | 15px |
| Address min-height | 83px |
| Email margin-top | 12px |
| Instagram margin-top | 4px |
| Gap before first exhibition | 158px |
| Gap between exhibitions | 191px |
| Invite image max-width | 74% |
| Gap after invite | 55px |
| Regular image width | 86.96% centred |
| Photo-to-photo gap | 17px |
| Text block width | 86.96% centred |
| Text block margin-top | 16px |
| Video width | 86.96%, 16:9 ratio |
| Video margin-top | 23px |
| Gap after video | 34px |

---

## Header layout (important — do not revert)

The header uses **position:absolute for the logo**, not flex columns.
This is necessary to centre the text on the full page width.

```css
#header        { position: relative; min-height: 214px; }
#header-text   { text-align: center; padding-top: 71px; }  /* spans full width */
#header-logo   { position: absolute; top: 0; right: 0; }
#address a     { display: block; text-align: center; }
#contact       { text-align: center; }
```

Previous attempts used `flex: 0 0 65%` for the text column — this centred the text
within the left 65% only, not the full page. Reverted.

The address block uses `<br>` separators (not `<p>` inside `<a>` — that is invalid HTML
and causes Chrome to reorganise the DOM, breaking text-align inheritance).

---

## Admin CMS

- **MediaBuilder class** in `admin/index.html` — handles both add and edit forms
- Blocks are drag-and-drop (HTML5 DnD API) with a ⠿ grip handle
- Block previews mirror the live site: full-width images, centred text, 16:9 video box
- Invite toggle in the block toolbar marks the flyer image
- First image auto-marked as invite if none is set on save

---

## Known outstanding issues

1. **Text blocks in seeded data are combined** — when the historical data was extracted
   from the original Muse HTML, all text per exhibition was merged into one text block
   placed immediately after the invite image. On the original, some exhibitions had
   multiple text blocks at different positions between photos.
   **Fix**: Edit each exhibition in admin → drag text block to correct position,
   split content manually using `+ Text Block` button.

2. **Image/text order in seed data** — the order of elements was approximated during
   migration. Some exhibitions may not match the original exactly.
   **Fix**: Same as above — use admin Edit to reorder blocks with drag-and-drop.

3. **Custom domain** — stchadsprojects.com is not yet pointed at Cloudflare Pages.
   Do this in Cloudflare Pages dashboard → Custom domains → Add `stchadsprojects.com`.
   (DNS will need to be updated at the registrar.)

4. **GitHub auto-deploys** — pushing to `main` on GitHub triggers a Cloudflare Pages
   build automatically (connected via the Pages dashboard). No manual deploy needed.

---

## Auth flow

- `GET /api/auth` — validates `Authorization: Bearer <token>` against `ADMIN_PASSWORD` env secret
- All write endpoints (POST/PUT/DELETE on exhibitions, upload, seed) also check this header
- Both sides `.trim()` before comparing (env vars can have trailing whitespace)

---

## Wrangler commands (Wrangler 4.x syntax — note: no colon)

```bash
npx wrangler kv namespace create EXHIBITIONS_KV
npx wrangler r2 bucket create stchads-images
npx wrangler pages secret put ADMIN_PASSWORD
npx wrangler pages deploy public
npm run dev   # local dev at localhost:8788
```
