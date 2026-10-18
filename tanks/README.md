# Tank Monitoring — `/tanks/`

A full-screen, one-question-at-a-time version of the paper sheet
*Tank Monitoring Sheet / Rekodi ya Ukaguzi wa Tangi* (v2, 17 Sep 2026), for the
composting sewage tanks 1–3 at the Children's Ecovillage. Tank 4 (the CEV test
unit) is a different design and needs its own sheet.

It is built on the same shell as `/survey/` (the House 5 Comfort Survey), and
everything that README says about the gate, offline use, the send queue and
Export data applies here unchanged. Only the differences are written down below.

- Same password gate (`sessionStorage.arc_auth`), so one password unlocks both
- `robots.txt` disallows `/tanks/`; the page carries `noindex, nofollow`
- Its own `localStorage` keys (`arc_tank_*`), so drafts and queues never mix with
  the survey's on a shared phone

## Where the data goes

**ARC Tank Monitoring — Responses** in Archie's Drive:
https://docs.google.com/spreadsheets/d/1biYqJmrsa8e-__uqlZs5RkiR59LuyApss1YG82Dmj0c/edit

It is a separate sheet from the comfort survey on purpose: the survey holds
answers about named children, this does not, and the two should not share a
script or a file.

### Connecting it (one-off, has to be done by hand)

Until `CFG.endpoint` in `index.html` is set, sheets are kept on the device and
the start screen says so; **Export data** gets them off as a CSV. To connect:

1. Open the sheet → **Extensions → Apps Script**
2. Delete the placeholder, paste in all of `apps-script.gs`, save
3. **Deploy → New deployment → Web app.** *Execute as* **Me**, *Who has access* **Anyone**
4. Authorise it (Google warns the app is unverified — it is your own script;
   Advanced → Go to project)
5. Paste the `/exec` URL into `CFG.endpoint` in `index.html`, bump `CACHE` in
   `sw.js`, rebuild the offline files, commit

Opening the `/exec` URL in a browser should say `OK ARC tank endpoint is live.`
`survey/README.md` explains why this step cannot be automated.

## Offline

Same as the survey: install from the hosted page (Add to Home Screen), or use the
standalone file. Rebuild both after **any** change to `index.html`:

```bash
node build-offline.js           # tanks-offline.html        -> Google Sheet
node build-offline.js --local   # tanks-offline-local.html  -> saves a CSV per sheet
```

Local-build files are named `ARC tank <n> - <date> <time>.csv`.

## How it differs from the paper sheet

- **Heavy rain** is asked on the start screen with the tank, the checker and the
  date, as in the paper header. Q4 (tank unusually full) only appears if it was yes.
- **Follow-ups appear only when they apply**: Q5 "where?" after a leak; the jam-jar
  test after water in the trench (Q13); Q14 (oily film) and its "where does it
  start?" only when there *is* water in the trench; the depth only when Q15 found
  water.
- **Section D** opens with one gate question, *has the tank been re-set for the
  year today?* — no skips the section, which is the app's version of "leave
  blank in other months".
- **Q19** is a month and a year picked from buttons (this year and the two before),
  and can be skipped if nobody knows.
- **Q17 "None"** is exclusive: picking it clears the others and vice versa.
- **Next tank** on the finish screen keeps the checker, the date and the rain
  answer — they are the same for all three tanks on one round.
- No photo upload. The paper says photos are only needed if something looks very
  worrying; those can go on WhatsApp as now.

Yes/no buttons are coloured by good/bad rather than by yes/no: for "is the lid
damaged?" *yes* is red, for "are the plants healthy?" *yes* is green.

## What lands in the sheet

One row per tank per visit, columns in the order of `FIELDS`. Ids follow the
paper's question numbers. Values are numbers, not labels:

- yes/no — `1` / `0`; `rain_2days` likewise
- `a12_plant_growth` — `0` normal for this area … `5` exceptional
- `a13_jar_looks` — comma-separated: `1` clear, `2` cloudy, `3` brown
- `a13_jar_smell`, `b16_smell_inside` — `0` none, `1` slight, `2` strong
- `b15_standing_water` — `0` none, `1` small puddles, `2` surface covered;
  `b15_depth_cm` a number
- `b17_creatures` — comma-separated 1–8 in the paper's order, `0` none
- `c19_last_raked` — `YYYY-MM`
- `c20_compost_look` — `1` not decomposing, `2` decomposing, `3` well composted
- `d_yearly_reset` — `1` / `0`; when `0`, `d21`–`d24` are blank
- `d24_metal_sheet` — `1` good, `2` rusty but whole, `3` rusted through
- free text: `a5_leak_where`, `a14_film_where`, `b17_other`, `b18_alien_objects`, `e_notes`

A question that was not shown is blank, never a leftover answer from before an
earlier answer changed.

## Changing a question

As for the survey: edit `QS`, add the id to `FIELDS`, bump `CACHE` in `sw.js`,
rebuild. `type` is one of `choice`, `multi`, `scale`, `text`, `number`, `month`.
Icons are inline `<symbol>`s at the top of `index.html`, drawn on a 64×64 grid
in `currentColor`.
