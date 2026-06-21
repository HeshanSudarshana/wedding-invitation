# Wedding Invitation

Static animated wedding invitation built from the public published Webflow template assets:

- Webflow responsive CMS envelope animation
- Webflow Sachini & Heshan wedding template content style

Open `index.html` in a browser, or serve the folder locally:

```bash
python3 -m http.server 4173
```

Common edits:

- Names and invitation copy: `index.html`
- Date, wedding details, countdown, RSVP, and contact copy: `index.html`
- Colors and envelope animation: `styles.css`
- Open, photo slider, and RSVP interactions: `script.js`

Notes:

- Envelope image layers are loaded from the published `responsive-cms-envelope.webflow.io` asset CDN.
- Sachini & Heshan photos, floral SVG, colors, and split layout follow the published `wedme.webflow.io` template.

## RSVP

RSVP is backed by a Google Sheet + Google Apps Script web app (`rsvp-backend.gs`).
Each party gets a personal link with a random token: `/?g=<token>`. The page
reads that party from the script, shows a per-guest attendance checklist, and
writes the response back to the sheet.

- Backend code to paste into Apps Script: `rsvp-backend.gs`
- Deployed web-app URL is set in `script.js` (`RSVP_API`).

**Privacy:** the published site is public even if the repo is private — visitors
can View Source and see the `RSVP_API` URL. That is by design; protection comes
from the unguessable per-party token, not from secrecy of the URL. **Never commit
the guest list to this repo** — guest names, tokens, and responses live only in
the Google Sheet. The `.gitignore` blocks common guest-data exports as a
safety net, but the rule is simply: keep guest data in Sheets, not in git.
