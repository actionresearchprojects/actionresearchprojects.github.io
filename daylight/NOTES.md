# Method and where this differs from the AECB workbook

Re-implementation of the AECB Daylight Calculator (`DaylightCalcV2_LEAP_MASTER_BLANK`),
which follows BS 8206-2, informed by BRE BR209, BRE IP 15/88 and BRE Digest 309.

## The calculation

Average daylight factor, per room:

    DF = Σ(M · Tvis · θ · Aw) / (A · (1 − R²))

- `M` — maintenance (dirt) factor, `(100 − orientation × building type × exposure × special) / 100`
- `Tvis` — visible light transmittance of the glazing
- `θ` — angle of visible sky at the window, in degrees
- `Aw` — net glazed area (rough opening less frame widths), times the number of windows
- `A` — total internal surface area, `perimeter × height + 2 × floor area`
- `R` — area-weighted reflectance of floor, walls and ceiling

Angle of visible sky:

    vertical window:  θ = 90 − a − b
    rooflight:        θ = 180 − a − b − inclination

where `a = atan((½ × window height + y) / x)` is the angle to the external obstruction
(`x` horizontal distance, `y` obstruction height above the window head), and `b` is the angle
subtended by the reveal, or by reveal plus overhang where there is one.

Two further checks, both from the AECB guidance:

- **Daylight uniformity** — the no-sky line sits at `(x − overhang) × h / y` from the window wall,
  where `h` is the window head above the working plane. The daylit fraction is that distance over
  the room dimension the light penetrates. AECB asks for more than 80%.
- **Limiting room depth** — `L/W + L/Hw ≤ 2/(1 − R)`.

## Two deliberate departures from the spreadsheet

**1. The Design-mode shading factors.** In the workbook's Design mode, the "additional shading
reduction factor, winter" column (`DAYLIGHT FACTOR!U`) and the summer column (`V`) are filled with
`VLOOKUP`s pointing at the Win Type sheet's **Tvis** and **maintenance factor** columns rather than at
a shading factor. The winter daylight factor therefore comes out as `M · Tvis² · θ · Aw` and the
summer one as `M² · Tvis · θ · Aw`. There is no physical basis for either extra factor and it looks
like a fill-right error; PHPP mode uses the correct columns (`rother,w` and `rother,s`).

This tool instead takes an explicit shading factor per window, defaulting to 1.0, so the result is
`M · Tvis · θ · Aw`. **Results will therefore read higher than the workbook's Design mode** — by a
factor of about 1/0.66 in winter. Set the winter shading factor to the glazing's Tvis if you need to
reproduce the workbook's numbers exactly for a submission.

**2. The HQM targets.** The workbook's standard selector maps "HQM" to the Lists sheet's **BREEAM**
column (`J`), leaving the column actually labelled HQM (`I`) unused. This tool uses the labelled HQM
column. The two differ for Kitchen (HQM 1.0 vs BREEAM 2.0), Living Room, Dining and Study/Office.

## Not carried over

- The PHPP Windows paste-in route (`PHPP Window` sheet). Only the Design-mode input path is built.
- The country list on the Summary sheet, and the PHPP-styled verification report layout.
