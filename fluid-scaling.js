/*
 * Smooth scaling for the 1440px layout on desktop browsers.
 *
 * Mobile/tablet browsers respect the width=1440 viewport meta
 * and handle scaling automatically. Desktop browsers ignore it,
 * so this script applies zoom to scale the fixed 1440px layout
 * to fit any window size.
 *
 * This works because all Framer breakpoints have been stripped —
 * there are no media queries competing with the zoom.
 */
(function () {
  var DESIGN_WIDTH = 1440;

  function update() {
    var main = document.getElementById('main');
    if (!main) return;

    var vw = document.documentElement.clientWidth;

    // Only scale if viewport differs from design width
    if (vw !== DESIGN_WIDTH) {
      main.style.zoom = vw / DESIGN_WIDTH;
    } else {
      main.style.zoom = '';
    }
  }

  // Run on load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', update);
  } else {
    update();
  }

  // Update on resize
  window.addEventListener('resize', update);
})();
