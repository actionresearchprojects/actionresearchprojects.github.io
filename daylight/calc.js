(function () {
'use strict';
/* Daylight factor engine — BS 8206-2 / BRE BR209 average daylight factor method.
   Mirrors the AECB Daylight Calculator workbook; see NOTES.md for the two places
   this deliberately departs from the spreadsheet. */

const DEG = r => r * 180 / Math.PI;

const ORIENTATIONS = ['North', 'East', 'South', 'West'];
const LOCATIONS = ['Width', 'Length', 'Roof'];
const STANDARDS = ['LEAP', 'AECB Standard', 'BS:8206', 'HQM', 'BREEAM'];

/* Target daylight factors (%) by room type, per standard. From the workbook's
   Lists sheet. null = standard does not set a target for that room type. */
const ROOM_TYPES = [
  { group: 'Dwellings / multi-residential' },
  { name: 'Kitchen',                    t: { 'LEAP': 2,   'AECB Standard': 2,   'BS:8206': 2,   'HQM': 1,    'BREEAM': 2 } },
  { name: 'Utility',                    t: { 'LEAP': 1.5, 'AECB Standard': 1.5, 'BS:8206': null,'HQM': null, 'BREEAM': null } },
  { name: 'Living Room',                t: { 'LEAP': 1.5, 'AECB Standard': 1.5, 'BS:8206': 1.5, 'HQM': 1.5,  'BREEAM': 2 } },
  { name: 'Dining',                     t: { 'LEAP': 1.5, 'AECB Standard': 1.5, 'BS:8206': null,'HQM': 1.5,  'BREEAM': 2 } },
  { name: 'Family Room',                t: { 'LEAP': 1.5, 'AECB Standard': 1.5, 'BS:8206': null,'HQM': null, 'BREEAM': null } },
  { name: 'Study / Office',             t: { 'LEAP': 1.5, 'AECB Standard': 1.5, 'BS:8206': null,'HQM': 1.5,  'BREEAM': 2 } },
  { name: 'Hobby Area',                 t: { 'LEAP': 1.5, 'AECB Standard': null,'BS:8206': null,'HQM': null, 'BREEAM': null } },
  { name: 'Reading Area',               t: { 'LEAP': 1.5, 'AECB Standard': 1.5, 'BS:8206': null,'HQM': null, 'BREEAM': null } },
  { name: 'Bedroom',                    t: { 'LEAP': 1,   'AECB Standard': 1,   'BS:8206': 1,   'HQM': null, 'BREEAM': null } },
  { name: 'Bathroom',                   t: { 'LEAP': 1,   'AECB Standard': null,'BS:8206': null,'HQM': null, 'BREEAM': null } },
  { name: 'Media Lounge',               t: { 'LEAP': 1,   'AECB Standard': null,'BS:8206': null,'HQM': null, 'BREEAM': null } },
  { name: 'Circulation',                t: { 'LEAP': 1,   'AECB Standard': null,'BS:8206': null,'HQM': null, 'BREEAM': null } },
  { name: 'Stairs',                     t: { 'LEAP': 1,   'AECB Standard': null,'BS:8206': null,'HQM': null, 'BREEAM': null } },
  { name: 'Entrances',                  t: { 'LEAP': 1.5, 'AECB Standard': null,'BS:8206': null,'HQM': null, 'BREEAM': null } },
  { name: 'Non-residential spaces',     t: { 'LEAP': 2,   'AECB Standard': 2,   'BS:8206': null,'HQM': null, 'BREEAM': 2 } },
  { name: 'Communal occupied spaces',   t: { 'LEAP': 2,   'AECB Standard': 2,   'BS:8206': null,'HQM': null, 'BREEAM': 2 } },
  { group: 'Education' },
  { name: 'Preschools',                 t: { 'LEAP': 2, 'AECB Standard': 2, 'BS:8206': null, 'HQM': null, 'BREEAM': 2 } },
  { name: 'Schools',                    t: { 'LEAP': 2, 'AECB Standard': 2, 'BS:8206': null, 'HQM': null, 'BREEAM': 2 } },
  { name: 'Further education',          t: { 'LEAP': 2, 'AECB Standard': 2, 'BS:8206': null, 'HQM': null, 'BREEAM': 2 } },
  { name: 'Higher education — occupied spaces', t: { 'LEAP': 2, 'AECB Standard': 2, 'BS:8206': null, 'HQM': null, 'BREEAM': 2 } },
  { group: 'Healthcare' },
  { name: 'Staff and public areas',     t: { 'LEAP': 2, 'AECB Standard': 2, 'BS:8206': null, 'HQM': null, 'BREEAM': 2 } },
  { name: 'Occupied patient’s areas (dayrooms, wards)', t: { 'LEAP': 3, 'AECB Standard': 3, 'BS:8206': null, 'HQM': null, 'BREEAM': 3 } },
  { name: 'Consulting rooms',           t: { 'LEAP': 3, 'AECB Standard': 3, 'BS:8206': null, 'HQM': null, 'BREEAM': 3 } },
  { group: 'Retail' },
  { name: 'Sales areas',                t: { 'LEAP': null, 'AECB Standard': null, 'BS:8206': null, 'HQM': null, 'BREEAM': null } },
  { name: 'Other occupied areas',       t: { 'LEAP': 2, 'AECB Standard': 2, 'BS:8206': null, 'HQM': null, 'BREEAM': 2 } },
  { group: 'Other (courts, industrial, office, prison…)' },
  { name: 'Cells and custody cells',    t: { 'LEAP': 1.5, 'AECB Standard': 1.5, 'BS:8206': null, 'HQM': null, 'BREEAM': 1.5 } },
  { name: 'Internal association or atrium area', t: { 'LEAP': 3, 'AECB Standard': 3, 'BS:8206': null, 'HQM': null, 'BREEAM': 3 } },
  { name: 'Patient care spaces',        t: { 'LEAP': 3, 'AECB Standard': 3, 'BS:8206': null, 'HQM': null, 'BREEAM': 3 } },
  { name: 'Teaching, lecture and seminar spaces', t: { 'LEAP': 2, 'AECB Standard': 2, 'BS:8206': null, 'HQM': null, 'BREEAM': 2 } },
  { name: 'All occupied spaces, unless indicated', t: { 'LEAP': 2, 'AECB Standard': 2, 'BS:8206': null, 'HQM': null, 'BREEAM': 2 } },
];

function targetDF(roomTypeName, standard) {
  const row = ROOM_TYPES.find(r => r.name === roomTypeName);
  if (!row) return null;
  const v = row.t[standard];
  return (v === undefined) ? null : v;
}

/* Maintenance (dirt) factor: loss % = orientation x building type x exposure x special. */
function maintenanceFactor(g) {
  const loss = num(g.orientFactor) * num(g.buildingType) * num(g.exposure) * num(g.special);
  return (100 - loss) / 100;
}

function num(v) {
  const n = typeof v === 'number' ? v : parseFloat(v);
  return Number.isFinite(n) ? n : 0;
}

/* ---- Room geometry ---- */
function roomGeometry(room) {
  const L = num(room.depth), W = num(room.width), H = num(room.height);
  const perimeter = 2 * (L + W);
  const floorArea = L * W;
  const ceilingArea = floorArea;
  const A = perimeter * H + 2 * floorArea;          // total internal surface area
  const fFloor = A ? floorArea / A : 0;
  const fWall = A ? (A - 2 * floorArea) / A : 0;
  const fCeil = A ? ceilingArea / A : 0;
  const R = num(room.rFloor) * fFloor + num(room.rWall) * fWall + num(room.rCeil) * fCeil;
  return { L, W, H, perimeter, floorArea, ceilingArea, A, fFloor, fWall, fCeil, R };
}

/* BRE limiting room depth check: L/W + L/Hw <= 2/(1-R) */
function roomDepthCheck(room, geo, windowHeadAboveFloor) {
  const Hw = num(windowHeadAboveFloor);
  if (!geo.L || !geo.W || !Hw) return null;
  const lhs = geo.L / geo.W + geo.L / Hw;
  const rhs = 2 / (1 - geo.R);
  return { lhs, rhs, pass: lhs <= rhs };
}

/* ---- Window type derived values ---- */
function windowTypeDerived(wt, glazing, frame) {
  const w = num(wt.width), h = num(wt.height);
  const fl = num(frame?.left), fr = num(frame?.right), fb = num(frame?.bottom), ft = num(frame?.top);
  const windowArea = w * h;
  const glazingArea = Math.max(0, (w - fl - fr)) * Math.max(0, (h - fb - ft));
  const halfHeight = h / 2;
  const effShadeHeight = halfHeight + num(wt.overhangDist);
  const reveal = num(wt.wallThickness);
  const overhang = num(wt.overhangDepth);
  // Angle subtended by the reveal (or reveal + overhang) at the centre of the opening.
  let tanB = 0;
  if (h > 0) {
    tanB = overhang > 0
      ? DEG(Math.atan((reveal + overhang) / (effShadeHeight || 1e-9)))
      : DEG(Math.atan(reveal / (halfHeight || 1e-9)));
  }
  return {
    windowArea, glazingArea, halfHeight, effShadeHeight, tanB,
    tvis: num(glazing?.tvis),
    maint: glazing ? maintenanceFactor(glazing) : 0,
    inclination: num(wt.inclination),
    overhang,
  };
}

/* ---- Site: obstruction geometry per storey ---- */
/* Floor level of a storey = sum of (storeyHeight + floorThickness) of the storeys below. */
function storeyFloorLevel(storeys, index) {
  let level = 0;
  for (let i = 0; i < index; i++) {
    level += num(storeys[i].storeyHeight) + num(storeys[i].floorThickness);
  }
  return level;
}

/* Obstruction seen from a window on this storey.
   x = horizontal distance, y = height of obstruction above the window head. */
function obstruction(storeys, storeyIndex, orientation, isRoof) {
  const storey = storeys[storeyIndex];
  const obs = storey.obstructions?.[orientation] ?? { distance: 0, extraDistance: 0, height: 0 };
  const headAboveFloor = isRoof ? num(storey.rooflightHead) : num(storey.windowHead);
  const headLevel = storeyFloorLevel(storeys, storeyIndex) + headAboveFloor;
  const x = num(obs.distance) + (isRoof ? num(obs.extraDistance) : 0);
  const y = Math.max(1e-4, num(obs.height) - headLevel);
  return { x, y, headAboveFloor, headLevel };
}

/* ---- Per-window contribution within a room ---- */
function windowRowResult(row, ctx) {
  const { storeys, windowTypes, glazings, frames, room } = ctx;
  const wt = windowTypes.find(t => t.id === row.windowTypeId);
  if (!wt) return null;
  const glazing = glazings.find(g => g.id === wt.glazingId);
  const frame = frames.find(f => f.id === wt.frameId);
  const d = windowTypeDerived(wt, glazing, frame);

  const storeyIndex = storeys.findIndex(s => s.id === room.storeyId);
  if (storeyIndex < 0) return null;
  const isRoof = row.location === 'Roof';
  const { x, y, headAboveFloor } = obstruction(storeys, storeyIndex, row.orientation, isRoof);

  // Angle of obscured sky from the obstruction, measured at the window centre.
  const obstructionAboveCentre = d.halfHeight + y;
  const tanA = x > 0 ? DEG(Math.atan(obstructionAboveCentre / x)) : 90;

  // Angle of visible sky.
  const theta = isRoof
    ? 180 - tanA - d.tanB - d.inclination
    : 90 - tanA - d.tanB;
  const thetaClamped = Math.max(0, theta);

  const count = Math.max(0, num(row.count));
  const totalGlazing = d.glazingArea * count;

  const shadeW = row.shadeWinter === undefined || row.shadeWinter === '' ? 1 : num(row.shadeWinter);
  const shadeS = row.shadeSummer === undefined || row.shadeSummer === '' ? 1 : num(row.shadeSummer);

  const contribWinter = d.maint * d.tvis * shadeW * thetaClamped * totalGlazing;
  const contribSummer = d.maint * d.tvis * shadeS * thetaClamped * totalGlazing;

  // No-sky line: distance from the window wall to where sky is first visible on the working plane.
  const headAboveWorkingPlane = headAboveFloor - num(row.workingPlane);
  const noSkyLine = y > 0 ? ((x - d.overhang) * headAboveWorkingPlane) / y : 0;
  const roomDim = row.location === 'Length' ? num(room.depth) : num(room.width);
  const uniformity = roomDim > 0 ? Math.min(1, Math.max(0, noSkyLine / roomDim)) : 0;

  return {
    windowType: wt, x, y, tanA, tanB: d.tanB, theta: thetaClamped, thetaRaw: theta,
    glazingArea: d.glazingArea, totalGlazing, tvis: d.tvis, maint: d.maint,
    count, contribWinter, contribSummer, headAboveWorkingPlane, noSkyLine, roomDim, uniformity,
    inclination: d.inclination, isRoof,
  };
}

/* ---- Room result ---- */
function roomResult(room, ctx) {
  const geo = roomGeometry(room);
  const rows = (room.windows || [])
    .map(r => ({ row: r, res: windowRowResult(r, { ...ctx, room }) }))
    .filter(r => r.res);

  const sumW = rows.reduce((a, r) => a + r.res.contribWinter, 0);
  const sumS = rows.reduce((a, r) => a + r.res.contribSummer, 0);
  const denom = geo.A * (1 - geo.R * geo.R);

  const dfWinter = denom > 0 ? sumW / denom : 0;
  const dfSummer = denom > 0 ? sumS / denom : 0;

  const avg = sel => rows.length ? rows.reduce((a, r) => a + sel(r.res), 0) / rows.length : 0;
  const avgTheta = avg(r => r.theta);
  const avgTvis = avg(r => r.tvis);
  const avgMaint = avg(r => r.maint);
  const avgUniformity = avg(r => r.uniformity);
  const avgNoSkyLine = avg(r => r.noSkyLine);

  const target = targetDF(room.type, ctx.standard);
  const requiredAw = (target && avgTvis && avgTheta && avgMaint)
    ? (target * denom) / (avgTvis * avgTheta * avgMaint)
    : null;

  // Window head height comes from the storey the room sits on.
  const storeyIndex = ctx.storeys.findIndex(s => s.id === room.storeyId);
  const storey = ctx.storeys[storeyIndex];
  const anyRoof = rows.length > 0 && rows.every(r => r.res.isRoof);
  const headAboveFloor = storey ? num(anyRoof ? storey.rooflightHead : storey.windowHead) : 0;
  const depthCheck = roomDepthCheck(room, geo, headAboveFloor);

  return {
    geo, rows, dfWinter, dfSummer, target,
    verdictWinter: verdict(dfWinter, target),
    verdictSummer: verdict(dfSummer, target),
    avgTheta, avgTvis, avgMaint, avgUniformity, avgNoSkyLine,
    requiredAw, depthCheck, headAboveFloor,
    totalGlazing: rows.reduce((a, r) => a + r.res.totalGlazing, 0),
  };
}

function verdict(df, target) {
  if (target == null) return 'n/a';
  const rounded = Math.round(df * 10) / 10;
  if (rounded >= target) return 'Pass';
  if (rounded >= target - 0.1) return 'Borderline';
  return 'Fail';
}

/* Exposed as a global so the page works from file:// as well as over http. */
window.DL = {
  ORIENTATIONS, LOCATIONS, STANDARDS, ROOM_TYPES,
  targetDF, maintenanceFactor, num, roomGeometry, roomDepthCheck,
  windowTypeDerived, storeyFloorLevel, obstruction, windowRowResult, roomResult,
};

})();
