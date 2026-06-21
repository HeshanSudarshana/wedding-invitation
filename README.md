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
reads that party from the script, shows its name, an accept/decline choice, and
(for parties with more than one seat) a guest-count picker, then writes the
response back to the sheet.

- Backend code to paste into Apps Script: `rsvp-backend.gs`
- Deployed web-app URL is set in `script.js` (`RSVP_API`).

**Guests sheet columns** (tab named `Guests`, header in row 1):

| A | B | C | D | E | F | G |
|---|---|---|---|---|---|---|
| token | party_label | max_count | responded | attending | coming_count | responded_at |

- `party_label` — the family or individual name shown on the page
  (e.g. `The Perera Family` or `Nimal Perera`).
- `max_count` — seats invited for that party. Set `1` for a single guest, and
  the page hides the count picker. Set e.g. `4` for a family.
- `attending` — `yes`/`no`; a `no` is a whole-party decline and stores
  `coming_count` `0`. Columns D–G are filled in automatically on response.

**Privacy:** the published site is public even if the repo is private — visitors
can View Source and see the `RSVP_API` URL. That is by design; protection comes
from the unguessable per-party token, not from secrecy of the URL. **Never commit
the guest list to this repo** — guest names, tokens, and responses live only in
the Google Sheet. The `.gitignore` blocks common guest-data exports as a
safety net, but the rule is simply: keep guest data in Sheets, not in git.
