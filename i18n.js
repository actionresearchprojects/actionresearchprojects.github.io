// ARC site-wide internationalization
// Phase 1: nav, footer, dots-menu, orientation overlay, language menu, page titles.
// Element tagging: data-i18n="<key>" on plain-text elements; the script swaps textContent.
// For elements with child HTML, use a wrapper <span data-i18n="..."> around the translatable
// substring, or — when whole-element HTML must change — add data-i18n-html alongside data-i18n.
// Attribute translation: data-i18n-attr="title:foo,placeholder:bar" maps attr->key.
// ─── KILL SWITCH ──────────────────────────────────────────────────────
// Set to false to disable Kiswahili site-wide:
//   - Globe button + language menu hide on every page
//   - Runtime forces English regardless of any stored preference
//   - No translations are applied
// Flip back to true to re-enable. One-line change, deploys with the
// next git push.
var ARC_I18N_ENABLED = true;
// ──────────────────────────────────────────────────────────────────────

(function () {
  var STORAGE_KEY = 'arc-lang';            // localStorage: cross-visit (desktop globe)
  var SESSION_KEY = 'arc-lang-session';    // sessionStorage: per-tab (mobile picker)
  var DEFAULT_LANG = 'en';
  var SUPPORTED = { en: 1, sw: 1 };
  var MOBILE_MAX = 1024;                   // matches orientation-lock breakpoint

  // When disabled: hide the language UI + force English. Stored 'sw'
  // preferences are ignored (not deleted, so re-enabling restores the
  // user's previous choice).
  if (!ARC_I18N_ENABLED) {
    var hideLangUI = function () {
      var wrap = document.getElementById('lang-wrap');
      if (wrap) wrap.style.display = 'none';
      try { document.documentElement.setAttribute('lang', 'en'); } catch (e) {}
    };
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', hideLangUI);
    } else {
      hideLangUI();
    }
    window.setLanguage = function () {};
    window.ARCi18n = { apply: function () {}, t: function (k) { return k; }, getLang: function () { return 'en'; } };
    return;
  }

  function dict() {
    return (window.ARC_TRANSLATIONS && window.ARC_TRANSLATIONS) || { en: {}, sw: {} };
  }

  function getLang() {
    // Per-tab pick (mobile overlay or in-session change) takes priority.
    var session = null;
    try { session = sessionStorage.getItem(SESSION_KEY); } catch (e) {}
    if (session && SUPPORTED[session]) return session;
    // Cross-visit pick (desktop globe button).
    var stored = null;
    try { stored = localStorage.getItem(STORAGE_KEY); } catch (e) {}
    if (stored && SUPPORTED[stored]) return stored;
    return DEFAULT_LANG;
  }

  function isMobile() {
    // The viewport meta is locked to width=1440, so window.innerWidth reports
    // 1440 on phones too — useless here. screen.width/height give the actual
    // device pixels. Match fluid-scaling.js's detection: smaller dimension
    // ≤1024 == mobile/tablet. Fall back to innerWidth if screen is somehow
    // unavailable (very old browsers).
    if (typeof screen !== 'undefined' && screen.width && screen.height) {
      return Math.min(screen.width, screen.height) <= MOBILE_MAX;
    }
    return (window.innerWidth || 0) <= MOBILE_MAX;
  }

  function showPickerIfNeeded() {
    // Show mobile picker once per browser session, only when no choice has
    // been made yet in this tab. localStorage is intentionally ignored here
    // — the spec is "ask every fresh visit on mobile".
    if (!isMobile()) return;
    var sessionPick = null;
    try { sessionPick = sessionStorage.getItem(SESSION_KEY); } catch (e) {}
    if (sessionPick) return;
    var overlay = document.getElementById('lang-picker-overlay');
    if (overlay) overlay.classList.add('show');
  }

  function hidePicker() {
    var overlay = document.getElementById('lang-picker-overlay');
    if (overlay) overlay.classList.remove('show');
  }

  function t(key) {
    var d = dict();
    var lang = getLang();
    var langDict = d[lang] || {};
    if (langDict[key] != null) return langDict[key];
    if (d.en && d.en[key] != null) return d.en[key];
    return key;
  }

  function applyAttrSpec(el, spec) {
    // spec: "title:lang.title,placeholder:form.email"
    spec.split(',').forEach(function (pair) {
      var idx = pair.indexOf(':');
      if (idx < 0) return;
      var attr = pair.slice(0, idx).trim();
      var key = pair.slice(idx + 1).trim();
      if (attr && key) el.setAttribute(attr, t(key));
    });
  }

  function apply() {
    var lang = getLang();
    try { document.documentElement.setAttribute('lang', lang); } catch (e) {}

    var nodes = document.querySelectorAll('[data-i18n]');
    for (var i = 0; i < nodes.length; i++) {
      var el = nodes[i];
      var key = el.getAttribute('data-i18n');
      if (!key) continue;
      var val = t(key);
      if (el.hasAttribute('data-i18n-html')) {
        el.innerHTML = val;
      } else {
        el.textContent = val;
      }
    }

    var attrNodes = document.querySelectorAll('[data-i18n-attr]');
    for (var j = 0; j < attrNodes.length; j++) {
      applyAttrSpec(attrNodes[j], attrNodes[j].getAttribute('data-i18n-attr'));
    }

    // Title fallback: if <title> isn't tagged but a 'page.title' key exists for this page.
    var titleEl = document.querySelector('title[data-i18n]');
    if (titleEl) {
      titleEl.textContent = t(titleEl.getAttribute('data-i18n'));
    }

    // Highlight active language in menu
    var menuBtns = document.querySelectorAll('#lang-menu button[data-lang]');
    for (var k = 0; k < menuBtns.length; k++) {
      if (menuBtns[k].getAttribute('data-lang') === lang) {
        menuBtns[k].classList.add('active');
      } else {
        menuBtns[k].classList.remove('active');
      }
    }
  }

  // Desktop globe button: persist across visits AND for the rest of the tab session.
  window.setLanguage = function (lang) {
    if (!SUPPORTED[lang]) return;
    try { localStorage.setItem(STORAGE_KEY, lang); } catch (e) {}
    try { sessionStorage.setItem(SESSION_KEY, lang); } catch (e) {}
    apply();
    var menu = document.getElementById('lang-menu');
    if (menu) menu.classList.remove('open');
  };

  // Mobile picker button: per-tab only (no localStorage write — fresh visits re-prompt).
  function pickLanguage(lang) {
    if (!SUPPORTED[lang]) return;
    try { sessionStorage.setItem(SESSION_KEY, lang); } catch (e) {}
    apply();
    hidePicker();
  }

  window.ARCi18n = { apply: apply, t: t, getLang: getLang, pickLanguage: pickLanguage };

  // Detect if we're running inside an iframe — embedded sub-projects
  // (projects-grid, CBG-grid, arc-people, etc.) load this script via
  // /i18n.js and need translations applied, but the parent page already
  // owns the footer globe + mobile picker — so iframes skip those.
  function inIframe() {
    try { return window.self !== window.top; } catch (e) { return true; }
  }

  function init() {
    if (inIframe()) {
      // Iframe context: just translate. The parent decides language;
      // we read the same shared localStorage / sessionStorage.
      apply();
      return;
    }
    // If the picker will block the user, leave the page in its
    // static English state until they pick — avoids a Swahili flash
    // from a stale localStorage value behind the dimmed overlay.
    var willShowPicker = false;
    try {
      willShowPicker =
        isMobile() && !sessionStorage.getItem(SESSION_KEY);
    } catch (e) {}
    if (!willShowPicker) apply();
    showPickerIfNeeded();
  }

  // Re-apply translations when the parent page broadcasts a language
  // change. Same-origin iframes share storage, but a `storage` event
  // only fires in OTHER tabs/iframes, not the one that wrote it — so
  // when the desktop globe in the parent flips language, this fires
  // here and the iframe re-translates.
  window.addEventListener('storage', function (e) {
    if (e.key === STORAGE_KEY || e.key === SESSION_KEY) apply();
  });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Close menu on outside click / escape
  document.addEventListener('click', function (e) {
    var menu = document.getElementById('lang-menu');
    var btn = document.getElementById('lang-btn');
    if (!menu || !btn) return;
    if (menu.classList.contains('open') && !menu.contains(e.target) && e.target !== btn && !btn.contains(e.target)) {
      menu.classList.remove('open');
    }
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      var menu = document.getElementById('lang-menu');
      if (menu) menu.classList.remove('open');
    }
  });
})();
