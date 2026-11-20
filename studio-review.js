/* FanFuse: progressive enhancement for the public editorial site. */
(function () {
  'use strict';
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)');

  document.querySelectorAll('.fitem').forEach(function (item, index) {
    var button = item.querySelector('.fq');
    var answer = item.querySelector('.fa');
    if (!button || !answer) return;
    button.type = 'button';
    button.id = 'faq-question-' + index;
    answer.id = 'faq-answer-' + index;
    answer.setAttribute('role', 'region');
    answer.setAttribute('aria-labelledby', button.id);
    button.setAttribute('aria-controls', answer.id);
    button.setAttribute('aria-expanded', 'false');
    answer.hidden = true;
    var icon = button.querySelector('.ftog');
    if (icon) icon.setAttribute('aria-hidden', 'true');
    button.addEventListener('click', function () {
      var open = button.getAttribute('aria-expanded') === 'true';
      document.querySelectorAll('.fitem').forEach(function (other) {
        other.classList.remove('open');
        var q = other.querySelector('.fq');
        var a = other.querySelector('.fa');
        if (q) q.setAttribute('aria-expanded', 'false');
        if (a) a.hidden = true;
      });
      if (!open) {
        item.classList.add('open');
        button.setAttribute('aria-expanded', 'true');
        answer.hidden = false;
      }
    });
  });

  var video = document.getElementById('heroVid');
  var videoToggle = document.querySelector('.hero-motion-toggle');
  var userPaused = reduced.matches;
  var failed = false;
  function syncToggle() {
    if (!videoToggle || !video) return;
    videoToggle.hidden = failed || video.readyState < 2;
    videoToggle.textContent = video.paused ? 'Play film' : 'Pause film';
    videoToggle.setAttribute('aria-label', video.paused ? 'Play background video' : 'Pause background video');
    videoToggle.setAttribute('aria-pressed', String(!video.paused));
  }
  function tryPlay() {
    if (!video || userPaused || failed || document.hidden) return;
    var result = video.play();
    if (result && result.catch) result.catch(function () { syncToggle(); });
  }
  if (video) {
    video.muted = true;
    video.defaultMuted = true;
    video.addEventListener('playing', function () {
      video.classList.add('video-playing');
      syncToggle();
    });
    video.addEventListener('pause', syncToggle);
    video.addEventListener('canplay', function () { syncToggle(); tryPlay(); });
    function usePoster() {
      failed = true;
      video.classList.remove('video-playing');
      video.pause();
      syncToggle();
    }
    video.addEventListener('error', usePoster);
    var source = video.querySelector('source');
    if (source) source.addEventListener('error', usePoster);
    if (videoToggle) videoToggle.addEventListener('click', function () {
      userPaused = !video.paused;
      if (userPaused) video.pause();
      else {
        // An explicit Play gesture is allowed even with reduced motion enabled.
        var result = video.play();
        if (result && result.catch) result.catch(usePoster);
      }
      syncToggle();
    });
    function motionPreference() {
      userPaused = reduced.matches;
      if (userPaused) video.pause();
      else tryPlay();
      syncToggle();
    }
    if (reduced.addEventListener) reduced.addEventListener('change', motionPreference);
    if (reduced.matches) {
      video.autoplay = false;
      video.pause();
    } else tryPlay();
    document.addEventListener('visibilitychange', function () {
      if (document.hidden) video.pause();
      else tryPlay();
    });
    // Avoid decoding a background movie behind the opaque lower sections.
    if ('IntersectionObserver' in window) {
      var hero = document.getElementById('hero');
      new IntersectionObserver(function (entries) {
        if (entries[0].isIntersecting) tryPlay();
        else video.pause();
      }, { rootMargin: '60% 0px' }).observe(hero);
    }
    syncToggle();
  }

  // Account for service-scene sizing, web fonts and images before settling a deep link.
  var userMoved = false;
  var settling = false;
  function stopSettling() { userMoved = true; }
  window.addEventListener('wheel', stopSettling, { passive: true });
  window.addEventListener('touchstart', stopSettling, { passive: true });
  window.addEventListener('keydown', function (event) {
    if (['PageUp', 'PageDown', 'Home', 'End', 'ArrowUp', 'ArrowDown', ' '].indexOf(event.key) !== -1) stopSettling();
  });
  function settleHash() {
    if (userMoved || settling || !location.hash) return;
    var id;
    try { id = decodeURIComponent(location.hash.slice(1)); } catch (_) { return; }
    var target = document.getElementById(id);
    if (!target) return;
    settling = true;
    var nav = document.getElementById('nav');
    var top = window.scrollY + target.getBoundingClientRect().top - (nav ? nav.getBoundingClientRect().height + 16 : 80);
    window.scrollTo({ top: Math.max(0, top), behavior: 'instant' });
    requestAnimationFrame(function () { settling = false; });
  }
  if (location.hash) {
    requestAnimationFrame(function () { requestAnimationFrame(settleHash); });
    window.addEventListener('load', function () {
      settleHash();
      if (document.fonts && document.fonts.ready) document.fonts.ready.then(settleHash);
    }, { once: true });
  }
  window.addEventListener('hashchange', function () { userMoved = false; requestAnimationFrame(settleHash); });

  // Give the next carousel image an early network slot without eager-loading the whole page.
  var spots = document.getElementById('spots');
  if (spots) {
    var warmImages = function () {
      Array.prototype.slice.call(spots.querySelectorAll('.spot-film'), 0, 5).forEach(function (card) {
        var img = card.querySelector('img');
        if (img) img.loading = 'eager';
      });
    };
    warmImages();
    var track = spots.querySelector('.spots-track');
    if (track && 'MutationObserver' in window) new MutationObserver(warmImages).observe(track, { childList: true });
  }
})();

(function(){document.querySelectorAll('[data-footer-spot]').forEach(function(link){link.addEventListener('click',function(){var label='Show '+link.getAttribute('data-footer-spot');var dot=Array.prototype.find.call(document.querySelectorAll('#spots .spots-dot'),function(button){return button.getAttribute('aria-label')===label;});if(dot)dot.click();});});})();
