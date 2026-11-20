/* Creator life cards: hover, keyboard and touch share one visible detail. */
(function () {
  'use strict';
  var root = document.getElementById('lifestyle');
  if (!root) return;
  var cards = Array.prototype.slice.call(root.querySelectorAll('[data-creator-card]'));
  if (!cards.length) return;
  var items = cards.map(function (card) {
    var button = card.querySelector('.creator-life-toggle');
    var detail = card.querySelector('.creator-life-detail');
    return {card:card, button:button, detail:detail};
  });
  // Leave the plain, readable cards alone when their markup is incomplete.
  if (items.some(function (item) {
    return !item.button || !item.detail || !item.detail.id ||
      item.button.getAttribute('aria-controls') !== item.detail.id;
  })) return;

  var fineHover = window.matchMedia('(hover:hover) and (pointer:fine)');
  var pinned = null;
  var hovered = null;
  var focused = null;

  function render() {
    var active = hovered !== null ? hovered : focused !== null ? focused : pinned;
    items.forEach(function (item, index) {
      var open = index === active;
      item.card.classList.toggle('is-open', open);
      item.button.setAttribute('aria-expanded', String(open));
      item.detail.setAttribute('aria-hidden', String(!open));
    });
  }

  items.forEach(function (item, index) {
    item.card.addEventListener('pointerenter', function (event) {
      if (!fineHover.matches || event.pointerType === 'touch') return;
      hovered = index;
      render();
    });
    item.card.addEventListener('pointerleave', function () {
      if (hovered !== index) return;
      hovered = null;
      render();
    });
    item.button.addEventListener('focus', function () {
      // Pointer focus should not undo a second tap that closes a card.
      if (!item.button.matches(':focus-visible')) return;
      focused = index;
      render();
    });
    item.button.addEventListener('blur', function () {
      if (focused !== index) return;
      focused = null;
      render();
    });
    item.button.addEventListener('click', function () {
      pinned = pinned === index ? null : index;
      hovered = null;
      focused = null;
      render();
    });
  });

  root.addEventListener('keydown', function (event) {
    if (event.key !== 'Escape') return;
    pinned = null;
    hovered = null;
    focused = null;
    render();
  });
  function clearHover() {
    hovered = null;
    render();
  }
  if (fineHover.addEventListener) fineHover.addEventListener('change', clearHover);
  else if (fineHover.addListener) fineHover.addListener(clearHover);

  render();
  root.classList.add('creator-life-enhanced');
  items.forEach(function (item) { item.button.hidden = false; });
})();
