/**
 * ARC House 5 Comfort Survey — Google Sheets receiver
 * ---------------------------------------------------
 * Deploy this as a Web App and paste the /exec URL into CFG.endpoint
 * in survey/index.html. Full instructions in survey/README.md.
 *
 * Two jobs:
 *   1. receive finished surveys and append them to the Responses tab
 *   2. hand the roster (the Roster tab) to a phone — but only to one that
 *      sends the right access code, or a pass it was given for that code
 *
 * NOTHING SECRET LIVES IN THIS FILE. This repository is public.
 *   ACCESS_CODE  — set it in Apps Script: Project Settings → Script properties.
 *                  Change it there whenever you like; every phone then has to
 *                  be given the new code (their passes stop working at once).
 *   PASS_SECRET  — created automatically the first time it is needed.
 */

// Must match CFG.token in survey/index.html. It is public (it is in the page),
// so it only keeps out accidental junk; it does not protect anything.
var SUBMIT_TOKEN = 'arc-house5-2026';

// The sheet created for this: "ARC House 5 Comfort Survey — Responses".
// Blank it out to write into whatever sheet the script is bound to instead.
var SPREADSHEET_ID = '1SLIvoDLS1Mzw0S1IKZlXYy-W2cBEEe8MFuIBUcKIp0Q';

var SHEET_NAME  = 'Responses';
var ROSTER_NAME = 'Roster';

// Roster access
var PASS_DAYS   = 30;          // a phone's pass lasts this long after its last refresh
var MAX_FAILS   = 5;           // wrong codes allowed in FAIL_WINDOW before locking
var FAIL_WINDOW = 15 * 60e3;   // ms
var LOCK_FOR    = 15 * 60e3;   // ms

function doPost(e) {
  var body;
  try { body = JSON.parse(e.postData.contents); }
  catch (err) { return text('ERROR malformed payload'); }

  if (body && body.action === 'roster') return json(rosterRequest(body));

  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(20000);

    if (body.token !== SUBMIT_TOKEN) return text('ERROR bad token');

    var fields = body.fields;
    var row    = body.row;
    if (!fields || !fields.length || !row) return text('ERROR malformed payload');

    var ss = book();

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

    // A retry of a record that already landed (the reply was lost to a dropped
    // connection or a closed app) carries the same uid — or, from older app
    // versions, the same submitted_at. Accept it without writing it again, so
    // the phone stops retrying.
    var key = row.uid ? 'uid' : 'submitted_at';
    var idCol = header.indexOf(key);
    if (idCol > -1 && row[key] && sh.getLastRow() > 1) {
      var dup = sh.getRange(2, idCol + 1, sh.getLastRow() - 1, 1)
        .createTextFinder(String(row[key])).matchEntireCell(true).findNext();
      if (dup) return text('OK duplicate ignored');
    }

    // When it reached Google, by Google's clock: a phone's own clock can be wrong.
    row.received_at = new Date().toISOString();
    if (header.indexOf('received_at') === -1) {
      sh.getRange(1, header.length + 1).setValue('received_at').setFontWeight('bold');
      header.push('received_at');
    }

    // An untouched copy of every record, one JSON per line, in its own tab.
    // If rows in the main tab are ever edited, sorted or deleted, the
    // original is still here.
    var raw = ss.getSheetByName('Raw') || ss.insertSheet('Raw');
    if (raw.getLastRow() === 0) {
      raw.appendRow(['received_at', 'uid', 'submitted_at', 'json']);
      raw.setFrozenRows(1);
    }
    raw.appendRow([row.received_at, row.uid || '', row.submitted_at || '', JSON.stringify(row)]);


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

/* ============================================================
   roster
   ============================================================
   A phone asks with {action:'roster', code:'…'} the first time, and with
   {action:'roster', pass:'…'} afterwards. A right answer gets the roster and
   a fresh pass (good for PASS_DAYS). The code itself is never stored on the
   phone. A pass is signed with PASS_SECRET and the current ACCESS_CODE, so
   changing the code cancels every pass already handed out.

   Wrong codes are counted. MAX_FAILS within FAIL_WINDOW locks roster requests
   for LOCK_FOR — for everyone, because Apps Script cannot tell callers apart.
   Survey submissions are never affected by the lock. */
function rosterRequest(body) {
  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(20000);
    var props = PropertiesService.getScriptProperties();
    var code  = String(props.getProperty('ACCESS_CODE') || '').trim();
    if (!code) return {ok: false, error: 'not configured'};

    var st = JSON.parse(props.getProperty('ROSTER_FAILS') || '{"n":0,"first":0,"until":0}');
    var now = Date.now();
    if (st.until > now) return {ok: false, error: 'locked', retry_after_s: Math.ceil((st.until - now) / 1000)};

    if (body.code !== undefined && body.code !== null && String(body.code) !== '') {
      if (!same(String(body.code).trim(), code)) {
        if (now - st.first > FAIL_WINDOW) st = {n: 0, first: now, until: 0};
        st.n++;
        if (st.n >= MAX_FAILS) st.until = now + LOCK_FOR;
        props.setProperty('ROSTER_FAILS', JSON.stringify(st));
        return st.until > now
          ? {ok: false, error: 'locked', retry_after_s: Math.ceil(LOCK_FOR / 1000)}
          : {ok: false, error: 'wrong code', tries_left: MAX_FAILS - st.n};
      }
      props.setProperty('ROSTER_FAILS', JSON.stringify({n: 0, first: 0, until: 0}));
    } else if (body.pass) {
      // A forged pass cannot be guessed, so a bad one is not counted as an attempt;
      // it is most often an old pass from before the code was changed.
      if (!passOK(String(body.pass), code)) return {ok: false, error: 'expired'};
    } else {
      return {ok: false, error: 'no code'};
    }

    return {ok: true, people: readRoster(), pass: makePass(code), days: PASS_DAYS};
  } catch (err) {
    return {ok: false, error: 'server: ' + err};
  } finally {
    try { lock.releaseLock(); } catch (ignore) {}
  }
}

/* The Roster tab: one header row, then one row per person.
     person_id | display_name | role | default_bedroom | aliases | active
   Only what the dropdown needs is sent: never the aliases, and nobody with
   active set to FALSE / no / 0. */
function readRoster() {
  var sh = book().getSheetByName(ROSTER_NAME);
  if (!sh || sh.getLastRow() < 2) return [];
  var v = sh.getRange(1, 1, sh.getLastRow(), sh.getLastColumn()).getDisplayValues();
  var h = v[0].map(function (x) { return String(x).trim().toLowerCase(); });
  var c = function (n) { return h.indexOf(n); };
  var out = [];
  for (var i = 1; i < v.length; i++) {
    var r = v[i];
    var id = String(r[c('person_id')] || '').trim(), name = String(r[c('display_name')] || '').trim();
    if (!id || !name) continue;
    var act = c('active') > -1 ? String(r[c('active')]).trim().toLowerCase() : '';
    if (act === 'false' || act === 'no' || act === '0') continue;
    var bed = c('default_bedroom') > -1 ? String(r[c('default_bedroom')]).trim() : '';
    out.push({
      id  : id,
      name: name,
      role: c('role') > -1 ? String(r[c('role')]).trim() : '',
      bed : /^\d+$/.test(bed) ? Number(bed) : null
    });
  }
  return out;
}

function makePass(code) {
  var exp = Date.now() + PASS_DAYS * 864e5;
  return exp + '.' + sign(String(exp), code);
}
function passOK(pass, code) {
  var bits = pass.split('.');
  if (bits.length !== 2 || !/^\d+$/.test(bits[0])) return false;
  if (Number(bits[0]) < Date.now()) return false;
  return same(bits[1], sign(bits[0], code));
}
function sign(msg, code) {
  var props = PropertiesService.getScriptProperties();
  var secret = props.getProperty('PASS_SECRET');
  if (!secret) { secret = Utilities.getUuid() + Utilities.getUuid(); props.setProperty('PASS_SECRET', secret); }
  return Utilities.base64EncodeWebSafe(Utilities.computeHmacSha256Signature(msg, secret + '|' + code));
}
// Compare without stopping at the first difference.
function same(a, b) {
  if (a.length !== b.length) return false;
  var d = 0;
  for (var i = 0; i < a.length; i++) d |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return d === 0;
}

/* ============================================================ */
function book() {
  return SPREADSHEET_ID ? SpreadsheetApp.openById(SPREADSHEET_ID) : SpreadsheetApp.getActiveSpreadsheet();
}
function text(s) {
  return ContentService.createTextOutput(s).setMimeType(ContentService.MimeType.TEXT);
}
function json(o) {
  return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);
}
