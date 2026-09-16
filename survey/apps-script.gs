/**
 * ARC House 5 Comfort Survey — Google Sheets receiver
 * ---------------------------------------------------
 * Deploy this as a Web App and paste the /exec URL into CFG.endpoint
 * in survey/index.html. Full instructions in survey/README.md.
 */

// Must match CFG.token in survey/index.html.
var SUBMIT_TOKEN = 'arc-house5-2026';

// The sheet created for this: "ARC House 5 Comfort Survey — Responses".
// Blank it out to write into whatever sheet the script is bound to instead.
var SPREADSHEET_ID = '1SLIvoDLS1Mzw0S1IKZlXYy-W2cBEEe8MFuIBUcKIp0Q';

var SHEET_NAME = 'Responses';

function doPost(e) {
  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(20000);

    var body = JSON.parse(e.postData.contents);
    if (body.token !== SUBMIT_TOKEN) return text('ERROR bad token');

    var fields = body.fields;
    var row    = body.row;
    if (!fields || !fields.length || !row) return text('ERROR malformed payload');

    var ss = SPREADSHEET_ID
      ? SpreadsheetApp.openById(SPREADSHEET_ID)
      : SpreadsheetApp.getActiveSpreadsheet();

    var sh = ss.getSheetByName(SHEET_NAME);
    if (!sh) {
      sh = ss.insertSheet(SHEET_NAME);
    }

    // Write the header once, and keep it as the authority on column order.
    if (sh.getLastRow() === 0) {
      sh.appendRow(fields);
      sh.setFrozenRows(1);
      sh.getRange(1, 1, 1, fields.length).setFontWeight('bold');
    }

    var header = sh.getRange(1, 1, 1, sh.getLastColumn()).getValues()[0];

    // A new field in the app appends a new column rather than shifting old data.
    fields.forEach(function (f) {
      if (header.indexOf(f) === -1) {
        sh.getRange(1, header.length + 1).setValue(f).setFontWeight('bold');
        header.push(f);
      }
    });

    sh.appendRow(header.map(function (h) {
      var v = row[h];
      return (v === undefined || v === null) ? '' : v;
    }));

    return text('OK');
  } catch (err) {
    return text('ERROR ' + err);
  } finally {
    try { lock.releaseLock(); } catch (ignore) {}
  }
}

function doGet() {
  return text('OK ARC survey endpoint is live. POST to submit.');
}

function text(s) {
  return ContentService.createTextOutput(s).setMimeType(ContentService.MimeType.TEXT);
}
