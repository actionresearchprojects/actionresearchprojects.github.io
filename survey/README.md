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

1. Create a Google Sheet. **Extensions → Apps Script.**
2. Delete the placeholder and paste in `apps-script.gs` from this folder.
3. **Deploy → New deployment → Web app.** Set *Execute as* **Me** and
   *Who has access* **Anyone**. (It has to be "Anyone" — the survey posts without
   a Google login. The `token` is what keeps casual junk out.)
4. Authorise it, copy the `/exec` URL.
5. Paste that URL into `CFG.endpoint` in `index.html`, commit, push.

The script writes a header row on first submission and then appends one row per
survey. If you later add a question to `QS`, it appends a **new column** rather
than shifting existing data.

To check it is alive, open the `/exec` URL in a browser — it should say
`OK ARC survey endpoint is live.`

## It works with no internet

This matters on site. Every answer is written to `localStorage` as you go, so a
closed tab or a flat battery does not lose a part-finished survey — reopening
offers to resume it.

On submit, if the POST fails (no signal, endpoint not set yet), the survey is
queued on the device and sent automatically next time the tab is open with a
connection. The hourglass badge in the top bar counts what is still waiting.
**Export data** on the start and finish screens downloads the queue as a CSV, so
nothing is ever stranded on one phone.

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

One row per survey, columns in the order listed in `FIELDS`. Values are stored as
numbers, not labels, so they sort and plot directly:

- `b7_bedroom_last_night`, `c15_sensation_now` — **−3 … +3**:
  −3 cold, −2 cool, −1 a bit cool, 0 OK, +1 a bit warm, +2 warm, +3 hot
- `c16_preference` — **−3 … +3**: −3 a lot colder … 0 no change … +3 a lot warmer
- yes/no fields — `1` / `0`
- `b12_woke_hot_cold` — `1` too hot, `2` too cold, `0` no
- `c18_clothing` — comma-separated codes 1–9 in the paper form's order
- `c19_activity` — 1–6 in the paper form's order
- `c_room` — `living` / `bedroom` / `other`
- `a4_curtains` — `open` / `closed`

`c13_feel_words` and `c14_word_meaning` are free text, and are the two columns
the study is actually about.

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
