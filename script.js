/* Applitrust home page script: the app buttons, the narrow-screen menu and the scroll reveal. Nothing here loads anything. */

/* This is the full address of the app. The Log in, Get started, Build your record and Open Applitrust
   buttons go there (the same address is written in the page itself, so they also work without JavaScript). */
const APP_URL = 'https://app.applitrust.com';

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

  /* ---------- the app buttons ---------- */
  var appLinks = Array.prototype.slice.call(document.querySelectorAll('[data-app-link]'));
  appLinks.forEach(function (a) { a.setAttribute('href', APP_URL); });

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
