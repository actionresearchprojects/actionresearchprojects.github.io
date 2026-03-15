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
    var isSmall = Math.min(screen.width, screen.height) <= 1024;
    document.body.style.zoom = zoom;
    document.body.classList.toggle('fluid-zoom-active', zoom < 1);

    var root = document.querySelector('[data-site-root]');
    var overlay = document.getElementById('orientation-overlay');

    /*
     * Vertical sizing.
     *
     * The Framer root has min-height:100vh. With body zoom < 1, that 100vh
     * value renders visually smaller than the viewport, leaving blank space
     * below. We override min-height with the compensated pixel value so the
     * background fills the full viewport. Since framer-sxt1tt is centred
     * inside via top:calc(50% - 335px), this also centres the content block.
     *
     * On mobile (zoom === 1, small screen), viewport width=1440 makes 100vh
     * much taller than the design height, creating a blank gap at the bottom.
     * We clear min-height so the CSS height class rule takes control instead.
     * Only do this when the orientation overlay exists (pages that block
     * portrait); pages without it (e.g. support.html) need min-height:100vh
     * so the background fills the viewport in portrait.
     */
    if (root) {
      if (zoom < 1) {
        root.style.minHeight = Math.ceil(window.innerHeight / zoom) + 'px';
      } else if (isSmall && overlay) {
        root.style.minHeight = '';
      }
    }

    /*
     * Portrait content scaling for pages without orientation lock
     * (e.g. support.html). In portrait on mobile, viewport width=1440
     * makes 100vh much taller than the design height (~3100px vs 2375px),
     * leaving ~25% empty space at the bottom. We scale the content
     * container up to fill the viewport height using transform: scale()
     * with center-top origin so text and centred elements stay visible.
     * The far-left and far-right edges clip symmetrically via
     * overflow:hidden on the root.
     */
    if (root && isSmall && !overlay) {
      var isPortraitNoOverlay = window.innerHeight > window.innerWidth;
      var contentEl = root.querySelector('.framer-1qy8bnr');
      if (contentEl) {
        if (isPortraitNoOverlay) {
          var scale = root.offsetHeight / contentEl.offsetHeight;
          if (scale > 1.01) {
            contentEl.style.transformOrigin = '50% 0';
            contentEl.style.transform = 'scale(' + scale.toFixed(6) + ')';
            root.style.setProperty('overflow', 'hidden', 'important');
          }
        } else {
          contentEl.style.transform = '';
          contentEl.style.transformOrigin = '';
          contentEl.style.top = '';
          root.style.removeProperty('overflow');
        }
      }
    }

    /*
     * Orientation overlay show/hide.
     *
     * With viewport width=1440, CSS max-width media queries check the layout
     * viewport (always 1440px), so we use JS to detect small screens instead.
     * window.innerWidth/innerHeight give the actual device dimensions.
     *
     * When body zoom != 1 (desktop), position:fixed is in the zoomed
     * coordinate system so we compensate the overlay size with explicit px.
     */
    if (overlay) {
      var isPortrait = window.innerHeight > window.innerWidth;
      if (isSmall && isPortrait) {
        overlay.style.display = 'flex';
        if (zoom !== 1) {
          overlay.style.width  = Math.ceil(window.innerWidth  / zoom) + 'px';
          overlay.style.height = Math.ceil(window.innerHeight / zoom) + 'px';
        } else {
          overlay.style.width  = '';
          overlay.style.height = '';
        }
      } else {
        overlay.style.display = 'none';
      }
    }
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
  window.addEventListener('orientationchange', function () {
    requestAnimationFrame(runAll);
  });
})();
