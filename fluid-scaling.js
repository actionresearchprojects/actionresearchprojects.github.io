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

  /*
   * Fix content-area iframe position.
   *
   * Framer positions the content iframe with top:calc(50% - Xpx), which is a
   * percentage of the parent's height. When min-height:100vh makes the parent
   * taller than the 670px design height (e.g. on large monitors), the iframe
   * drifts down. The nav buttons use fixed top values so they stay correct.
   *
   * We find the iframe container (identified by being to the right of the nav,
   * offsetLeft > 300px) and pin its top/height to the ARC Projects and
   * Reflections buttons, which are already tagged with data-nav-button.
   */
  function fixIframePosition() {
    var projectsBtn = document.querySelector('a[data-nav-button="projects"]');
    var reflectionsBtn = document.querySelector('a[data-nav-button="reflections"]');
    if (!projectsBtn || !reflectionsBtn) return;

    var allIframes = document.querySelectorAll('#main iframe');
    for (var i = 0; i < allIframes.length; i++) {
      var container = allIframes[i].parentElement;
      if (container.offsetLeft > 300) {
        var top = projectsBtn.offsetTop;
        var bottom = reflectionsBtn.offsetTop + reflectionsBtn.offsetHeight;
        container.style.top = top + 'px';
        container.style.height = (bottom - top) + 'px';
        break;
      }
    }
  }

  function runAll() {
    update();
    fixIframePosition();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', runAll);
  } else {
    runAll();
  }

  window.addEventListener('resize', runAll);
})();
