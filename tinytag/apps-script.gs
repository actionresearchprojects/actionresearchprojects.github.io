/**
 * ARC Tinytag uploads: Google Drive receiver
 * -----------------------------------------
 * Deploy this as a Web App and paste the /exec URL into CFG.endpoint in
 * tinytag/index.html. Full instructions in tinytag/README.md.
 *
 * Each POST carries one logger: the original .ttd and the .xlsx the page made
 * from it. Both are saved into
 *   ARC Tinytag uploads / <date> <sender> /
 */

// Must match CFG.token in tinytag/index.html.
var SUBMIT_TOKEN = 'arc-tinytag-2026';

// Leave blank and the script creates "ARC Tinytag uploads" in the Drive root
// on first use (and remembers it). Or paste an existing folder's id, the part
// of its URL after /folders/.
var FOLDER_ID = '';

var MAX_BYTES = 20 * 1024 * 1024;

function doPost(e) {
  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(20000);

    var body = JSON.parse(e.postData.contents);
    if (body.token !== SUBMIT_TOKEN) return text('ERROR bad token');
    if (!body.files || !body.files.length) return text('ERROR no files');

    var sender = clean(body.sender) || 'unknown';
    var day = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd');
    var folder = subfolder(root(), day + ' ' + sender);

    var saved = [];
    body.files.forEach(function (f) {
      var bytes = Utilities.base64Decode(f.b64);
      if (bytes.length > MAX_BYTES) throw new Error(f.name + ' is too large');
      var name = clean(f.name) || 'upload';
      // A second upload of the same file that day gets a time suffix instead of
      // sitting beside the first under an identical name.
      if (folder.getFilesByName(name).hasNext()) {
        var t = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'HHmmss');
        var dot = name.lastIndexOf('.');
        name = dot > 0 ? name.slice(0, dot) + ' ' + t + name.slice(dot) : name + ' ' + t;
      }
      var file = folder.createFile(Utilities.newBlob(bytes, f.mime || 'application/octet-stream', name));
      if (body.note) file.setDescription(String(body.note).slice(0, 1000));
      saved.push(name);
    });

    return text('OK ' + folder.getUrl());
  } catch (err) {
    return text('ERROR ' + err);
  } finally {
    try { lock.releaseLock(); } catch (ignore) {}
  }
}

function root() {
  if (FOLDER_ID) return DriveApp.getFolderById(FOLDER_ID);
  var props = PropertiesService.getScriptProperties();
  var id = props.getProperty('FOLDER_ID');
  if (id) { try { return DriveApp.getFolderById(id); } catch (gone) {} }
  var f = DriveApp.createFolder('ARC Tinytag uploads');
  props.setProperty('FOLDER_ID', f.getId());
  return f;
}

function subfolder(parent, name) {
  var it = parent.getFoldersByName(name);
  return it.hasNext() ? it.next() : parent.createFolder(name);
}

function clean(s) {
  return String(s == null ? '' : s).replace(/[\\\/:*?"<>|\x00-\x1f]+/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 80);
}

// Run this once from the editor (Run > setup) to trigger the permission prompt
// and create the folder, then check the log for its URL.
function setup() {
  Logger.log('Uploads go to: ' + root().getUrl());
}

function doGet() {
  return text('OK ARC Tinytag upload endpoint is live. POST to submit.');
}

function text(s) {
  return ContentService.createTextOutput(s).setMimeType(ContentService.MimeType.TEXT);
}
