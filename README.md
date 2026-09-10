# GVR Caliber — Website

Single-page marketing site for GVR Caliber, an IT services company (RPA, hyperautomation,
agentic AI, ML & data analytics, web and mobile development).

## Files

| File | Purpose |
|------|---------|
| `index.html` | Markup, copy, meta tags, inline SVG favicon |
| `style.css` | All styling: tokens, layout, animations, responsive, reduced-motion |
| `script.js` | Boot loader, scroll reveal, HUD, service cards, Three.js hero field, form, easter eggs |

No build step. Three.js loads from a CDN; if it is blocked the hero falls back to a Canvas2D
particle field, and if that fails too the site still works as static content.

## Run locally

```
python -m http.server 8123
# then open http://localhost:8123
```

Any static file server works. Open `index.html` directly also works, though a server is
closer to production.

## Deploy

Upload the three files (and this README if you like) to any static host: Netlify, Vercel,
GitHub Pages, Cloudflare Pages, S3 + CloudFront, or plain nginx. No server-side code.

## Notes

- The contact form has no backend. On submit it validates and shows a success message.
  Wire the `form.addEventListener("submit", ...)` handler in `script.js` to your endpoint
  (Formspree, a Lambda, etc.) when ready.
- Update social links (`href="#"`) and email addresses in the Contact and Footer sections.
- Replace the `og:url` and `og:image` values in `index.html` with real production URLs.
- Easter eggs: click the hero background for particle bursts; enter the Konami code
  (up up down down left right left right B A) to "overclock" the accent gradient.
- Respects `prefers-reduced-motion`: the loader, canvases, and transitions are disabled.
