(function () {
  document.querySelectorAll('section[aria-roledescription="carousel"]').forEach(function (section) {
    var track = section.querySelector('ul.framer--carousel');
    var controls = section.querySelector('fieldset.framer--carousel-controls');
    if (!track || !controls) return;

    var slides = Array.prototype.slice.call(track.querySelectorAll(':scope > li'));
    if (slides.length === 0) return;

    var prevBtn = controls.querySelector('button[aria-label="Previous"]');
    var nextBtn = controls.querySelector('button[aria-label="Next"]');
    var dotBtns = Array.prototype.slice.call(
      controls.querySelectorAll('button[aria-label^="Scroll to page"]')
    );

    function getCurrentIndex() {
      var trackRect = track.getBoundingClientRect();
      var center = trackRect.left + trackRect.width / 2;
      var closest = 0;
      var closestDist = Infinity;
      for (var i = 0; i < slides.length; i++) {
        var r = slides[i].getBoundingClientRect();
        var slideCenter = r.left + r.width / 2;
        var dist = Math.abs(slideCenter - center);
        if (dist < closestDist) {
          closestDist = dist;
          closest = i;
        }
      }
      return closest;
    }

    function scrollToIndex(idx) {
      if (idx < 0) idx = 0;
      if (idx >= slides.length) idx = slides.length - 1;
      slides[idx].scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }

    function updateUI() {
      var idx = getCurrentIndex();

      if (prevBtn) {
        if (idx === 0) {
          prevBtn.style.opacity = '0';
          prevBtn.style.pointerEvents = 'none';
          prevBtn.style.cursor = 'default';
        } else {
          prevBtn.style.opacity = '1';
          prevBtn.style.pointerEvents = 'auto';
          prevBtn.style.cursor = 'pointer';
        }
      }

      if (nextBtn) {
        if (idx === slides.length - 1) {
          nextBtn.style.opacity = '0';
          nextBtn.style.pointerEvents = 'none';
          nextBtn.style.cursor = 'default';
        } else {
          nextBtn.style.opacity = '1';
          nextBtn.style.pointerEvents = 'auto';
          nextBtn.style.cursor = 'pointer';
        }
      }

      for (var i = 0; i < dotBtns.length; i++) {
        var dot = dotBtns[i].querySelector('div');
        if (dot) {
          dot.style.opacity = i === idx ? '1' : '0.5';
        }
      }
    }

    function addPressEffect(btn) {
      if (!btn) return;
      btn.style.transition = 'transform 0.1s ease';
      btn.addEventListener('mousedown', function () {
        btn.style.transform = 'scale(0.85)';
      });
      btn.addEventListener('mouseup', function () {
        btn.style.transform = 'none';
      });
      btn.addEventListener('mouseleave', function () {
        btn.style.transform = 'none';
      });
      btn.addEventListener('touchstart', function () {
        btn.style.transform = 'scale(0.85)';
      });
      btn.addEventListener('touchend', function () {
        btn.style.transform = 'none';
      });
    }

    addPressEffect(prevBtn);
    addPressEffect(nextBtn);

    if (prevBtn) {
      prevBtn.addEventListener('click', function () {
        var idx = getCurrentIndex();
        if (idx > 0) scrollToIndex(idx - 1);
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', function () {
        var idx = getCurrentIndex();
        if (idx < slides.length - 1) scrollToIndex(idx + 1);
      });
    }

    dotBtns.forEach(function (btn, i) {
      btn.addEventListener('click', function () {
        scrollToIndex(i);
      });
    });

    var scrollTimer;
    track.addEventListener('scroll', function () {
      clearTimeout(scrollTimer);
      scrollTimer = setTimeout(updateUI, 100);
    });

    updateUI();
  });
})();
