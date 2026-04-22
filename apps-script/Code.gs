/**
 * Google Apps Script — Koulibaly Leads
 *
 * Deployed as a Web App (Execute as: Me, Access: Anyone).
 * URL stored in Vercel env var: GOOGLE_APPS_SCRIPT_URL
 *
 * Sheet columns (row 1 = headers):
 *   A: ID | B: Date | C: Catégorie | D: Prénom | E: Nom
 *   F: Email | G: Téléphone | H: Entreprise | I: Pays | J: Message
 */

var NOTIFICATION_EMAIL = "youssef.koutari@koutquekout.com";

// ---------------------------------------------------------------------------
// POST — append a new lead row
// ---------------------------------------------------------------------------
function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();

    sheet.appendRow([
      data.id          || "",   // A: ID
      data.createdAt   || "",   // B: Date
      data.category    || "",   // C: Catégorie
      data.firstName   || "",   // D: Prénom
      data.lastName    || "",   // E: Nom
      data.email       || "",   // F: Email
      data.phone       || "",   // G: Téléphone
      data.company     || "",   // H: Entreprise
      data.country     || "",   // I: Pays
      data.message     || ""    // J: Message
    ]);

    // Email notification
    var subject = "🎯 Nouveau lead — " + (data.category || "");
    var body = [
      "Nom : "        + (data.firstName || "") + " " + (data.lastName || ""),
      "Email : "      + (data.email     || ""),
      "Téléphone : "  + (data.phone     || "—"),
      "Entreprise : " + (data.company   || "—"),
      "Pays : "       + (data.country   || "—"),
      "Catégorie : "  + (data.category  || ""),
      "",
      "Message :",
      data.message || ""
    ].join("\n");

    MailApp.sendEmail(NOTIFICATION_EMAIL, subject, body);

    return ContentService
      .createTextOutput(JSON.stringify({ status: "ok" }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ status: "error", message: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// ---------------------------------------------------------------------------
// GET — read all rows (used by admin dashboard)
// ---------------------------------------------------------------------------
function doGet(e) {
  try {
    var action = (e && e.parameter && e.parameter.action) || "";

    if (action === "getAll") {
      var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
      var rows  = sheet.getDataRange().getValues();
      return ContentService
        .createTextOutput(JSON.stringify({ rows: rows }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    return ContentService
      .createTextOutput(JSON.stringify({ status: "ok" }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ status: "error", message: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
