# Tinytag Converter: `/tinytag/`

Drop Tinytag `.ttd` files on the page, any number at once. Each one is converted to
`.xlsx` (Readings + Statistics sheets) and `.csv` in the browser, and, once the
endpoint below is set, the original `.ttd` and both conversions are sent to the ARC
Google Drive automatically, so nobody has to email logger files.

Password-gated like `/wiki/`, `/daylight/` and `/survey/` (shared `arc_auth` gate).

## How the conversion works

A `.ttd` saved by Tinytag Explorer 4 is a short text header followed by a zip. Inside,
`export/readings.csv` and `export/statistics.csv` hold the calibrated table Explorer's
own Export would produce, including dew point. `ttd.js` reads those. The per-channel
`<n>/data.ttd` files are raw, proprietary logger memory and are not decoded, so a
`.ttd` without the embedded export (very old software) is rejected with a message
to re-save it in Tinytag Explorer 4.

## Connecting Google Drive (one-time, needs a Google login)

1. Go to https://script.google.com → **New project**, name it *ARC Tinytag uploads*
2. Replace the placeholder with all of `apps-script.gs`, save
3. Choose `setup` in the function dropdown → **Run**, and authorise it (Google warns the
   app is unverified: it is your own script; Advanced → Go to project). The log shows
   the URL of the new **ARC Tinytag uploads** folder in your Drive
4. **Deploy → New deployment → Web app.** *Execute as* **Me**, *Who has access* **Anyone**
5. Copy the `/exec` URL into `CFG.endpoint` in `index.html` and push

Opening the `/exec` URL in a browser should say `OK ARC Tinytag upload endpoint is live.`

Uploads land in `ARC Tinytag uploads / <date> <sender name> /`. The sender's name is
optional and remembered on their computer. `CFG.token` must match `SUBMIT_TOKEN` in
the script. Like the survey token, it only keeps out casual junk, because it is
readable in the page source.

*Who has access* has to be **Anyone** because the person uploading has no Google login
of ours. It is still free: Apps Script and Drive cost nothing at this volume.

Why not commit uploads to a repo, like `/admin/` does for blog posts: this repository
is public, and a write token in a public page could be lifted by anyone.
