/* Applitrust home page script: the private testing pop-up, the narrow-screen menu and the scroll reveal. Nothing here loads anything. */

/* LAUNCH SWITCH. While this is an empty string, the Log in, Get started, Build your record and Open Applitrust
   buttons open the "private testing" pop-up (and without JavaScript they are plain email links).
   To go live, put the full address of the app between the quotes (starting with https://). The same buttons then
   go there and the pop-up is not used. */
const APP_URL = '';

(function () {
  'use strict';
  var root = document.documentElement;
  // The page works without this file. These classes only switch on the extras.
  root.classList.add('js');

  /* ---------- menu (below 760 pixels) ---------- */
  var button = document.querySelector('.menu-btn');
  var list = document.getElementById('nav-links');
  if (button && list) {
    var wide = window.matchMedia('(min-width: 760px)');
    var setOpen = function (open, returnFocus) {
      list.classList.toggle('open', open);
      button.setAttribute('aria-expanded', open ? 'true' : 'false');
      if (!open && returnFocus) { button.focus(); }
    };
    button.addEventListener('click', function () {
      setOpen(button.getAttribute('aria-expanded') !== 'true', false);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && button.getAttribute('aria-expanded') === 'true') {
        setOpen(false, true);
      }
    });
    list.addEventListener('click', function (e) {
      if (e.target && e.target.closest && e.target.closest('a')) { setOpen(false, false); }
    });
    var onWide = function () { if (wide.matches) { setOpen(false, false); } };
    if (wide.addEventListener) { wide.addEventListener('change', onWide); } else if (wide.addListener) { wide.addListener(onWide); }
  }

  /* ---------- the app buttons: pop-up now, the app address after launch ---------- */
  var appLinks = Array.prototype.slice.call(document.querySelectorAll('[data-app-link]'));
  var dialog = document.getElementById('beta-dialog');
  if (APP_URL) {
    // launched: the same buttons go to the app, the pop-up is not used
    appLinks.forEach(function (a) { a.setAttribute('href', APP_URL); });
  } else if (dialog && typeof dialog.showModal === 'function') {
    var opener = null;
    appLinks.forEach(function (a) {
      a.addEventListener('click', function (e) {
        if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) { return; }
        e.preventDefault();
        opener = a;
        dialog.showModal();
      });
    });
    var closeBtn = dialog.querySelector('[data-close]');
    if (closeBtn) { closeBtn.addEventListener('click', function () { dialog.close(); }); }
    // Tab and Shift+Tab go round inside the pop-up (a native dialog would otherwise let focus slip out to the browser's own controls)
    dialog.addEventListener('keydown', function (e) {
      if (e.key !== 'Tab') { return; }
      var items = dialog.querySelectorAll('a[href], button');
      if (!items.length) { return; }
      var first = items[0], last = items[items.length - 1];
      if (e.shiftKey && (document.activeElement === first || document.activeElement === dialog)) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    });
    // a click on the dimmed area outside the box closes it too
    dialog.addEventListener('click', function (e) { if (e.target === dialog) { dialog.close(); } });
    // Escape and Close both end here: put focus back on the button that opened the pop-up
    dialog.addEventListener('close', function () { if (opener && opener.focus) { opener.focus(); } opener = null; });
  }
  // (if the browser cannot show a dialog, the buttons stay plain email links)

  /* ---------- scroll reveal ---------- */
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce || !('IntersectionObserver' in window)) { return; }

  var marked = [];
  try {
    var targets = Array.prototype.slice.call(document.querySelectorAll('[data-reveal]'));
    var viewport = window.innerHeight || document.documentElement.clientHeight;
    targets.forEach(function (el) {
      var r = el.getBoundingClientRect();
      // already on screen when the page loads: leave it alone, never hide it first
      if (r.top < viewport && r.bottom > 0) { return; }
      el.classList.add('rv');
      marked.push(el);
    });

    var show = function (el) { el.classList.add('in'); io.unobserve(el); };
    var io = new IntersectionObserver(function (entries) {
      var batch = entries.filter(function (en) { return en.isIntersecting || en.boundingClientRect.bottom < 0; });
      // cards that arrive together in the same row start 80 milliseconds apart
      var seen = new Map();
      batch.forEach(function (en) {
        var parent = en.target.parentNode;
        var n = seen.get(parent) || 0;
        seen.set(parent, n + 1);
        en.target.style.setProperty('--rd', (n * 80) + 'ms');
        show(en.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
    marked.forEach(function (el) { io.observe(el); });
  } catch (err) {
    // if anything goes wrong, show everything
    marked.forEach(function (el) { el.classList.remove('rv'); });
  }
})();
