// ARC site-wide internationalization
// Phase 1: nav, footer, dots-menu, orientation overlay, language menu, page titles.
// Element tagging: data-i18n="<key>" on plain-text elements; the script swaps textContent.
// For elements with child HTML, use a wrapper <span data-i18n="..."> around the translatable
// substring, or — when whole-element HTML must change — add data-i18n-html alongside data-i18n.
// Attribute translation: data-i18n-attr="title:foo,placeholder:bar" maps attr->key.
(function () {
  var STORAGE_KEY = 'arc-lang';
  var DEFAULT_LANG = 'en';
  var SUPPORTED = { en: 1, sw: 1 };

  function dict() {
    return (window.ARC_TRANSLATIONS && window.ARC_TRANSLATIONS) || { en: {}, sw: {} };
  }

  function getLang() {
    var stored = null;
    try { stored = localStorage.getItem(STORAGE_KEY); } catch (e) {}
    if (stored && SUPPORTED[stored]) return stored;
    return DEFAULT_LANG;
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

  window.setLanguage = function (lang) {
    if (!SUPPORTED[lang]) return;
    try { localStorage.setItem(STORAGE_KEY, lang); } catch (e) {}
    apply();
    var menu = document.getElementById('lang-menu');
    if (menu) menu.classList.remove('open');
  };

  window.ARCi18n = { apply: apply, t: t, getLang: getLang };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', apply);
  } else {
    apply();
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
