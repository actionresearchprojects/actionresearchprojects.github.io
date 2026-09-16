# House 5 Comfort Survey — `/survey/`

A full-screen, one-question-at-a-time version of the paper form
*House 5 Comfort Survey / Utafiti wa Hali ya Hewa Ndani ya Nyumba* (v2).
Bilingual, picture-led, big targets, works on a phone in portrait.

Password-gated the same way as `/wiki/`, `/daylight/` and `/graphs/` — the shared
SHA-256 gate writing `sessionStorage.arc_auth`, so one password unlocks all of them
for the session. `robots.txt` disallows it and the page carries `noindex, nofollow`.

## The three things you have to set

All at the top of `index.html`, in `var CFG`:

| key | what it is |
|---|---|
| `endpoint` | the Google Apps Script `/exec` URL (below). **Blank until you do the setup** |
| `token` | shared secret; must equal `SUBMIT_TOKEN` in `apps-script.gs` |
| `roster` | the girls' names, e.g. `['Amina','Zawadi',…]`. Leave `[]` for a free-text box |

## Connecting the Google Sheet

The spreadsheet already exists — **ARC House 5 Comfort Survey — Responses**:
https://docs.google.com/spreadsheets/d/1SLIvoDLS1Mzw0S1IKZlXYy-W2cBEEe8MFuIBUcKIp0Q/edit

`apps-script.gs` is already pointed at it. What is left is the one step that has to
be done by a human, because Google will not let a script write to your Drive until
*you* grant it consent in a browser:

1. Open the sheet → **Extensions → Apps Script**
2. Delete the placeholder, paste in all of `apps-script.gs`, save
3. **Deploy → New deployment → Web app.** *Execute as* **Me**, *Who has access*
   **Anyone**
4. Authorise it (Google will warn that the app is unverified — it is your own
   script; Advanced → Go to project)
5. Copy the `/exec` URL and paste it into `CFG.endpoint` in `index.html`

*Who has access* has to be **Anyone**: the survey posts with no Google login, from
a phone that may belong to nobody in particular. `token` is what keeps junk out —
it must match `SUBMIT_TOKEN` in the script.

To check it is alive, open the `/exec` URL in a browser — it should say
`OK ARC survey endpoint is live.`

The script writes a header row on first submission and then appends one row per
survey. If you later add a question to `QS`, it appends a **new column** rather
than shifting existing data.

### Why this step cannot be automated

Everything else here was set up without you. This one cannot be, and it is worth
knowing why so nobody goes looking for a shortcut:

A page served from GitHub Pages is static — there is no server of ours to hold a
credential. To write into a Google Sheet something has to authenticate, and the
only three options are a deployed Apps Script (one human consent, then anonymous
POSTs work forever), OAuth sign-in by every person filling in a survey, or a
service-account key embedded in the page — which would be readable by anyone who
views source, and which Google blocks for Sheets anyway.

The Apps Script route is the cheap one, but its consent screen is deliberately
interactive: Google requires a signed-in human to approve a script that writes to
their own Drive. No API can grant that on your behalf.

The obvious alternative — have the survey commit responses to this repo, the way
`/admin/` commits blog posts — was rejected on safeguarding grounds, not technical
ones. **This repository is public.** Survey answers about named children must not
be published, so a private Google Sheet is the right destination and a repo file is
not.

## Offline

There are two ways to run this without a connection, and they use the same source.

### 1. Install it as an app (the hosted page)

Open `/survey/` once somewhere with signal, then **Add to Home Screen** (Share →
Add to Home Screen on iOS; ⋮ → Install app / Add to Home screen on Android). After
that it opens full-screen from the home icon and works with no signal at all.

`sw.js` precaches the page, the four fonts and the icons on first visit. Nothing is
fetched from anyone else — the Ubuntu webfont is served from `fonts/` rather than
from Google, so there is no third-party request to fail.

**When you change `index.html`, bump `CACHE` in `sw.js`.** Installed devices key
their cache on that string. Forgetting is not fatal — the worker is
stale-while-revalidate, so an online device serves the old page once and picks the
new one up in the background for next launch — but bumping makes it immediate and
clears files you removed.

### 2. The standalone file (no server, no install, no internet ever)

`survey-offline.html` is one 172 KB file with the fonts and icon inlined. Put it on
a laptop, a USB stick, or send it over WhatsApp, and open it — it runs from
`file://` on a machine that has never been online. Verified in Chrome with
networking disabled.

Build it after **any** change to `index.html`:

```bash
node build-offline.js
```

It inlines the fonts and icon, strips the service worker and manifest (meaningless
off a server), tags the version `2.0-offline`, and fails loudly if anything external
is left behind. Do not edit `survey-offline.html` by hand — edit `index.html` and
rebuild, or the two drift apart.

The offline file still carries the full submission logic, so if that laptop is later
online and `CFG.endpoint` is set, its queue flushes on its own. Otherwise the data
comes off with **Export data**.

### What was already offline-tolerant

Every answer is written to `localStorage` as you go, so a closed tab or a flat
battery does not lose a part-finished survey — reopening offers to resume it.

On submit, if the POST fails, the survey is queued on the device and sent
automatically next time the page is open with a connection. The hourglass badge in
the top bar counts what is still waiting, and a **nje ya mtandao / offline** marker
appears next to it when the browser reports no connection. **Export data** on the
start and finish screens downloads the queue as a CSV, so nothing is ever stranded
on one phone.

### Two things to know

- The password is asked again on each app launch — the gate uses `sessionStorage`,
  which a fresh launch clears. That is deliberate on a shared device holding
  answers from minors.
- Installing the app does not install the Apps Script endpoint. If `CFG.endpoint`
  was blank when a device cached the page, that device keeps the blank one until
  the cache updates. Set the endpoint *before* handing devices out.

### Fonts

Ubuntu is redistributed here under the **Ubuntu Font Licence 1.0**, which permits
it. Files are the latin subset only, four weights, 14 KB each, in `fonts/`.

## Two modes

Picked on the start screen.

- **A grown-up** — the full form, Section A included.
- **The girl herself** — Section A is skipped, and the wording switches to
  second person ("What are you wearing now?").

Section A is dropped in self mode deliberately: doors open, people in the room,
fan, curtains and sun are *observations*, and the paper form says explicitly not
to ask the girl about them. A self-administered run therefore produces no room
context. If you want that context for self-run surveys, someone has to record it
separately, or a surveyor does a Section-A-only pass for the room.

## Q13 and Q14 lock once Q15 is shown

The open questions — *"How do you feel in this room right now?"* and *"What does
that word mean to you?"* — go read-only as soon as the seven-point scale has been
displayed, and say so with a padlock.

This is the point of the exercise: establishing what the words actually mean
before the standard vocabulary is put in front of her. Once she has seen
*baridi kidogo / sawa / joto kidogo* on screen, anything typed back into Q13 is
contaminated, so going back and "tidying it up" is blocked rather than trusted.

## What lands in the sheet

One row per survey, columns in the order listed in `FIELDS`. Ids follow the paper
form's question numbers so the two can be cross-referenced. Values are stored as
numbers, not labels, so they sort and plot directly:

- `b6_bedroom_last_night`, `c15_sensation_now` — **−3 … +3**:
  −3 cold, −2 cool, −1 a bit cool, 0 OK, +1 a bit warm, +2 warm, +3 hot
- `c16_preference` — **−3 … +3**: −3 a lot colder … 0 no change … +3 a lot warmer
- yes/no fields — `1` / `0`
- `a3_fans_on`, `a4_curtains_closed`, `a1_doors_open`, `a2_people`, `c18_layers` — counts
- `a5_used_in_room` — comma-separated: `1` stove, `2` iron, `3` TV, `4` something
  else (detail in `a5_other_detail`), `0` none of these. `0` is exclusive — picking
  it clears the others and vice versa
- `b10_covering` — `1` all night, `2` part of the night, `0` nothing
- `b12_woke_hot_cold` — `1` too hot, `2` too cold, `0` no
- `c18_clothing` — comma-separated codes 1–8 in the paper form's order
- `c19_activity` — 1–6 in the paper form's order
- `c20_went_outside` — `1`/`0`; `c20_outside_activity` — 1–4, blank if she did not
- `a_room` — `living` / `bedroom` / `other`
- `d21_mosquito_bother` — `0` not at all, `1` a little, `2` a lot
- `d22_where_house` — comma-separated 1–6 (`6` only outside is exclusive)
- `d23_where_room` — comma-separated 1–5, or `0` I do not know (exclusive)
- `d24_time_of_day` — comma-separated 1–4
- `d25_seasonal` — free text

`c13_feel_words` and `c14_more_detail` are free text, and are the two columns the
study is actually about. `d25_seasonal` and `e_notes` are free text too.

## Kept in step with the paper form

This is the digital version of the paper form as of **16 Sep 2026**. If the PDF
changes again, the things to check are the `QS` array, `FIELDS`, and `SEC_NAME` —
and bump `CACHE` in `sw.js` and re-run `build-offline.js`.

Added in the latest revision:

- **Section D, mosquitoes** (Q21–25) — how much they bothered her last night, where
  in the house and where in a room she notices them, what time of day, and whether
  some times of year are worse. These ask what she notices *generally*, not just
  last night, because the point is working out where they get in despite the mesh
- Notes moved from Section D to **Section E** (`d_notes` is now `e_notes`)

Carried over from the first version of the form:

- Section A is now "the room she is in now" — explicitly the same room as Section C,
  everything scoped to the last 30 minutes, and the room field moved here from C
- the fan and curtain questions became counts rather than yes/no and open/closed
- the "sun shining on the windows" question was replaced by "has any of these been
  used in the room" (stove / iron / TV / something else / none)
- new: sheet or blanket covering you (Q10), and went outside beforehand (Q20)
- Q14 now asks her to say more about how hot or cold it feels and why, rather than
  what her one word means
- clothing dropped "short skirt or shorts" and split sleeves from garment type;
  the activity list dropped "playing outside", which Q20 now covers

## Adding or changing a question

Edit the `QS` array. Each entry needs `id`, `sec`, `type` and the `sw`/`en` text;
`type` is one of `scale`, `choice`, `multi`, `count`, `text`. Then add the `id` to
`FIELDS` so it gets a column. Optional extras: `optional` (allows skipping),
`surveyorOnly`, `showIf(answers)` for conditional questions (Q9 uses it),
`swSelf`/`enSelf` for self-mode wording, `hintSw`/`hintEn` for the italic note.

Icons are inline `<symbol>`s at the top of the file, drawn on a 64×64 grid in
`currentColor` so each option's colour tints its picture.

## Not wired up

- No photographs — the pictures are drawn, so the page stays one file with no
  image requests and no consent questions about using the girls' images.
- No voice input. Typing free text in Swahili on a phone is the weak point of
  self-administered mode; the Web Speech API has poor `sw-TZ` support and needs a
  connection, so a broken microphone button seemed worse than none.
