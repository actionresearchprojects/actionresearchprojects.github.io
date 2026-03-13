/*
 * Fluid scaling for Framer-generated layouts.
 *
 * Framer designs at fixed pixel widths per breakpoint.
 * This script applies a zoom factor so the layout scales
 * smoothly at ANY viewport width, not just the 7 fixed ones.
 *
 * At the exact design width, zoom = 1 (no change).
 * Between breakpoints, zoom interpolates proportionally.
 */

(function () {
  // Framer's breakpoints: each range has a fixed design width
  var breakpoints = [
    { max: 895.98, design: 640 },
    { min: 896, max: 1024.98, design: 896 },
    { min: 1025, max: 1365.98, design: 1025 },
    { min: 1366, max: 1439.98, design: 1366 },
    { min: 1440, max: 1919.98, design: 1440 },
    { min: 1920, max: 2559.98, design: 1920 },
    { min: 2560, design: 2560 },
  ];

  function updateScale() {
    var main = document.getElementById('main');
    if (!main) return;

    // Use documentElement.clientWidth to avoid scrollbar influence
    var vw = document.documentElement.clientWidth;

    // Find which breakpoint range we're in
    var designWidth = vw; // fallback: no scaling
    for (var i = 0; i < breakpoints.length; i++) {
      var bp = breakpoints[i];
      var aboveMin = bp.min === undefined || vw >= bp.min;
      var belowMax = bp.max === undefined || vw <= bp.max;
      if (aboveMin && belowMax) {
        designWidth = bp.design;
        break;
      }
    }

    var zoom = vw / designWidth;

    // Apply zoom (supported in all modern browsers including Firefox 126+)
    main.style.zoom = zoom;
  }

  // Run on load and resize
  updateScale();
  window.addEventListener('resize', updateScale);
})();
