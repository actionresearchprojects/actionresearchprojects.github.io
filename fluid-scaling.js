/*
 * Smooth scaling for the 1440px layout.
 *
 * Mobile browsers respect viewport width=1440 and scale automatically.
 * Desktop browsers ignore it, so this applies zoom to the <body>
 * to scale the fixed 1440px layout to fit any window size.
 *
 * Zoom is applied to <body> (not #main) so the entire page scales
 * uniformly without clipping from parent overflow rules.
 */
(function () {
  var DESIGN_WIDTH = 1440;

  function update() {
    var vw = document.documentElement.clientWidth;
    var zoom = vw / DESIGN_WIDTH;
    document.body.style.zoom = zoom;
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', update);
  } else {
    update();
  }

  window.addEventListener('resize', update);
})();
