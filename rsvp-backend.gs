/**
 * RSVP backend for the wedding invitation.
 *
 * This is Google Apps Script — it does NOT run in the website. Paste it into
 * the Apps Script editor bound to your guest-list Google Sheet, then deploy it
 * as a Web App (see the step-by-step guide in the chat / README).
 *
 * Expected sheet tab named "Guests" with this header row in row 1:
 *   A: token | B: party_label | C: guest_names | D: responded |
 *   E: coming_count | F: attendees | G: responded_at
 *
 *   - token        : unique random id (run generateTokens() to fill these)
 *   - party_label  : e.g. "The Perera Family"  (shown on the page)
 *   - guest_names  : comma-separated, e.g. "Nimal, Kamala"
 *   - D–G          : filled in automatically when the guest responds
 */

const SHEET_NAME = "Guests";

// Column numbers (1-based) for the writeback fields.
const COL_RESPONDED = 4; // D
const COL_COUNT = 5; // E
const COL_ATTENDEES = 6; // F
const COL_RESPONDED_AT = 7; // G

function doGet(e) {
  const token = String((e.parameter && e.parameter.g) || "").trim();
  const out = { ok: false };

  if (token) {
    const row = findRow(token);
    if (row) {
      out.ok = true;
      out.partyLabel = row.data[1];
      out.guests = splitList(row.data[2]);
      out.responded = Boolean(row.data[COL_RESPONDED - 1]);
      out.attendees = splitList(row.data[COL_ATTENDEES - 1]);
    }
  }

  return json(out);
}

function doPost(e) {
  let body;
  try {
    body = JSON.parse(e.postData.contents);
  } catch (err) {
    return json({ ok: false, error: "bad_body" });
  }

  const token = String(body.token || "").trim();
  const attendees = Array.isArray(body.attendees) ? body.attendees : [];
  const row = findRow(token);
  if (!row) return json({ ok: false, error: "not_found" });

  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
  sheet.getRange(row.index, COL_RESPONDED).setValue("yes");
  sheet.getRange(row.index, COL_COUNT).setValue(attendees.length);
  sheet.getRange(row.index, COL_ATTENDEES).setValue(attendees.join(", "));
  sheet.getRange(row.index, COL_RESPONDED_AT).setValue(new Date());

  return json({ ok: true });
}

/** Find the data row for a token. Returns { index (1-based), data[] } or null. */
function findRow(token) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
  const values = sheet.getDataRange().getValues();
  for (let i = 1; i < values.length; i++) {
    if (String(values[i][0]).trim() === token) {
      return { index: i + 1, data: values[i] };
    }
  }
  return null;
}

function splitList(value) {
  return String(value || "")
    .split(",")
    .map(function (s) {
      return s.trim();
    })
    .filter(Boolean);
}

function json(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(
    ContentService.MimeType.JSON
  );
}

/**
 * Run this ONCE from the Apps Script editor to fill an opaque random token for
 * every row that has a party_label but no token yet. Safe to re-run — it only
 * fills blanks.
 */
function generateTokens() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
  const values = sheet.getDataRange().getValues();
  for (let i = 1; i < values.length; i++) {
    if (!values[i][0] && values[i][1]) {
      sheet.getRange(i + 1, 1).setValue(randomToken());
    }
  }
}

function randomToken() {
  // No look-alike characters (0/o, 1/l) so links are easy to read/share.
  const chars = "abcdefghjkmnpqrstuvwxyz23456789";
  let t = "";
  for (let i = 0; i < 8; i++) {
    t += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return t;
}
