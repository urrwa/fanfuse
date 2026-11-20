/* FanFuse: progressive enhancement for the public editorial site. */
(function () {
  'use strict';
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)');

  var faqAnimations = new WeakMap();
  function setFaqState(item, open) {
    var button = item.querySelector('.fq');
    var answer = item.querySelector('.fa');
    if (!button || !answer) return;
    var start = answer.hidden ? 0 : answer.getBoundingClientRect().height;
    var previous = faqAnimations.get(answer);
    if (previous) previous.cancel();
    item.classList.toggle('open', open);
    button.setAttribute('aria-expanded', String(open));
    answer.hidden = false;
    answer.style.maxHeight = 'none';
    answer.style.height = 'auto';
    var end = open ? answer.scrollHeight : 0;
    if (reduced.matches || !answer.animate) {
      answer.hidden = !open;
      answer.style.height = '';
      return;
    }
    answer.style.height = open ? 'auto' : '0px';
    var animation = answer.animate([
      {height:start+'px',opacity:start ? 1 : 0},
      {height:end+'px',opacity:open ? 1 : 0}
    ], {duration:230,easing:'cubic-bezier(.22,.61,.36,1)'});
    faqAnimations.set(answer, animation);
    animation.onfinish = function () {
      if (faqAnimations.get(answer) !== animation) return;
      faqAnimations.delete(answer);
      answer.hidden = !open;
      answer.style.height = '';
    };
  }
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
      var open = button.getAttribute('aria-expanded') !== 'true';
      document.querySelectorAll('.fitem.open').forEach(function (other) {
        if (other !== item) setFaqState(other, false);
      });
      setFaqState(item, open);
    });
  });

  // The poster paints first; only load a movie while its background is visible.
  var video = document.getElementById('heroVid');
  var hero = document.getElementById('hero');
  var videoWrap = document.querySelector('.bg-vid-wrap');
  var videoToggle = document.querySelector('.hero-motion-toggle');
  var connection = navigator.connection;
  var userPaused = reduced.matches || Boolean(connection && connection.saveData);
  var heroVisible = false;
  var sourceLoaded = false;
  var playbackUnlocked = ['','#hero','#stats','#problem'].indexOf(location.hash) !== -1;
  var playbackFailed = false;
  var modalOpen = false;
  var portrait = window.matchMedia('(max-width:600px)');
  function syncToggle() {
    if (!videoToggle || !video) return;
    videoToggle.hidden = !heroVisible;
    var playing = !video.paused && !playbackFailed;
    videoToggle.textContent = playing ? 'Pause film' : 'Play film';
    videoToggle.setAttribute('aria-label', playing ? 'Pause background video' : 'Play background video');
    videoToggle.setAttribute('aria-pressed', String(playing));
  }
  function loadVideo() {
    if (sourceLoaded || !video) return;
    video.src = portrait.matches ? video.dataset.mobileSrc : video.dataset.desktopSrc;
    sourceLoaded = true;
    video.preload = 'auto';
    video.load();
  }
  function tryPlay() {
    if (!playbackUnlocked || !video || !heroVisible || userPaused || playbackFailed || document.hidden || modalOpen) return;
    loadVideo();
    var attempt = video.play();
    if (attempt && attempt.catch) attempt.catch(function () { syncToggle(); });
  }
  function pauseVideo() { if (video) video.pause(); syncToggle(); }
  if (video && hero) {
    video.muted = true;
    video.defaultMuted = true;
    video.addEventListener('playing', function () {
      playbackFailed = false;
      video.classList.add('video-playing');
      if (!heroVisible || document.hidden || modalOpen) pauseVideo();
      else syncToggle();
    });
    video.addEventListener('pause', syncToggle);
    video.addEventListener('canplay', tryPlay);
    video.addEventListener('error', function () {
      playbackFailed = true;
      video.classList.remove('video-playing');
      pauseVideo();
    });
    if (videoToggle) videoToggle.addEventListener('click', function () {
      if (!video.paused) { userPaused = true; pauseVideo(); return; }
      userPaused = false;
      playbackUnlocked = true;
      if (playbackFailed) { playbackFailed = false; sourceLoaded = false; }
      tryPlay();
      syncToggle();
    });
    function setHeroVisible(visible) {
      heroVisible = visible;
      if (visible && playbackUnlocked) document.body.classList.add('hero-media-ready');
      if (videoWrap) videoWrap.classList.toggle('media-dormant', !visible);
      if (visible) tryPlay(); else pauseVideo();
      syncToggle();
    }
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        setHeroVisible(entries[0].isIntersecting);
      }, {rootMargin:'80% 0px'}).observe(hero);
    } else setHeroVisible(hero.getBoundingClientRect().bottom > -innerHeight * .8);
    document.addEventListener('visibilitychange', function () {
      if (document.hidden) pauseVideo(); else tryPlay();
    });
    window.addEventListener('pagehide', pauseVideo);
    window.addEventListener('pageshow', tryPlay);
    if (reduced.addEventListener) reduced.addEventListener('change', function () {
      userPaused = reduced.matches;
      if (userPaused) pauseVideo(); else tryPlay();
    });
    function syncModal() {
      modalOpen = Boolean(document.querySelector('dialog[open]'));
      if (modalOpen) pauseVideo(); else tryPlay();
    }
    document.querySelectorAll('dialog').forEach(function (dialog) {
      new MutationObserver(syncModal).observe(dialog, {attributes:true,attributeFilter:['open']});
    });
    syncToggle();
    if (!playbackUnlocked) setTimeout(function () {
      playbackUnlocked = true;
      var rect = hero.getBoundingClientRect();
      setHeroVisible(rect.bottom > -innerHeight * .8 && rect.top < innerHeight * 1.8);
    }, 300);
  }

  // Decorate upcoming sections before they enter view, without loading the whole page.
  function whenNear(element, callback, margin) {
    if (!element) return;
    if (!('IntersectionObserver' in window)) { callback(); return; }
    var observer = new IntersectionObserver(function (entries) {
      if (!entries[0].isIntersecting) return;
      observer.disconnect();
      callback();
    }, {rootMargin:margin || '1000px 0px'});
    observer.observe(element);
  }
  var services = document.getElementById('services');
  whenNear(services, function () {
    services.querySelectorAll('[data-bg]').forEach(function (background) {
      background.style.backgroundImage = 'url("' + background.dataset.bg + '")';
    });
  }, '1200px 0px');
  var footer = document.getElementById('studio-footer');
  whenNear(footer, function () { footer.classList.add('media-ready'); });
  var spots = document.getElementById('spots');
  if (spots) whenNear(spots, function () {
    function warmVisibleCards() {
      Array.prototype.slice.call(spots.querySelectorAll('.spot-film'), 0, 5).forEach(function (card) {
        var image = card.querySelector('img');
        if (image) image.loading = 'eager';
      });
    }
    warmVisibleCards();
    var track = spots.querySelector('.spots-track');
    if (track) new MutationObserver(warmVisibleCards).observe(track, {childList:true});
  });

  // Correct an initial deep link once, never after a late movie/image load.
  var userMoved = false;
  var settled = false;
  function stopSettling() { userMoved = true; }
  window.addEventListener('wheel', stopSettling, {passive:true});
  window.addEventListener('touchstart', stopSettling, {passive:true});
  window.addEventListener('pointerdown', stopSettling, {passive:true});
  window.addEventListener('keydown', function (event) {
    if (['PageUp','PageDown','Home','End','ArrowUp','ArrowDown',' '].indexOf(event.key) !== -1) stopSettling();
  });
  function settleHashOnce() {
    if (settled) return;
    settled = true;
    if (userMoved || !location.hash) return;
    var id;
    try { id = decodeURIComponent(location.hash.slice(1)); } catch (_) { return; }
    var target = document.getElementById(id);
    if (!target) return;
    requestAnimationFrame(function () {
      if (userMoved) return;
      var nav = document.getElementById('nav');
      var top = scrollY + target.getBoundingClientRect().top - (nav ? nav.offsetHeight + 16 : 80);
      window.scrollTo({top:Math.max(0,top),behavior:'instant'});
    });
  }
  if (location.hash) {
    setTimeout(settleHashOnce, 200);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(settleHashOnce);
  }
  window.addEventListener('hashchange', stopSettling);
})();

(function(){document.querySelectorAll('[data-footer-spot]').forEach(function(link){link.addEventListener('click',function(){var label='Show '+link.getAttribute('data-footer-spot');var dot=Array.prototype.find.call(document.querySelectorAll('#spots .spots-dot'),function(button){return button.getAttribute('aria-label')===label;});if(dot)dot.click();});});})();
