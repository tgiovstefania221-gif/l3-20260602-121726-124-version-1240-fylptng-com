(function () {
  var toggle = document.querySelector('.nav-toggle');
  var mobile = document.querySelector('.mobile-nav');
  if (toggle && mobile) {
    toggle.addEventListener('click', function () {
      mobile.classList.toggle('open');
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dot'));
  var current = 0;
  function showSlide(index) {
    if (!slides.length) {
      return;
    }
    current = (index + slides.length) % slides.length;
    slides.forEach(function (slide, i) {
      slide.classList.toggle('active', i === current);
    });
    dots.forEach(function (dot, i) {
      dot.classList.toggle('active', i === current);
    });
  }
  dots.forEach(function (dot, i) {
    dot.addEventListener('click', function () {
      showSlide(i);
    });
  });
  if (slides.length) {
    showSlide(0);
    setInterval(function () {
      showSlide(current + 1);
    }, 5200);
  }

  var filterInput = document.querySelector('[data-filter-input]');
  var yearSelect = document.querySelector('[data-filter-year]');
  var typeSelect = document.querySelector('[data-filter-type]');
  var cards = Array.prototype.slice.call(document.querySelectorAll('.movie-card'));
  function applyFilter() {
    var keyword = filterInput ? filterInput.value.trim().toLowerCase() : '';
    var year = yearSelect ? yearSelect.value : '';
    var type = typeSelect ? typeSelect.value : '';
    cards.forEach(function (card) {
      var ok = true;
      var title = (card.getAttribute('data-title') || '').toLowerCase();
      var region = (card.getAttribute('data-region') || '').toLowerCase();
      if (keyword && title.indexOf(keyword) === -1 && region.indexOf(keyword) === -1) {
        ok = false;
      }
      if (year && (card.getAttribute('data-year') || '') !== year) {
        ok = false;
      }
      if (type && (card.getAttribute('data-type') || '') !== type) {
        ok = false;
      }
      card.style.display = ok ? '' : 'none';
    });
  }
  [filterInput, yearSelect, typeSelect].forEach(function (item) {
    if (item) {
      item.addEventListener('input', applyFilter);
      item.addEventListener('change', applyFilter);
    }
  });

  var playCover = document.querySelector('.play-cover');
  var video = document.querySelector('#movie-player');
  if (playCover && video) {
    var source = playCover.getAttribute('data-video');
    var started = false;
    function startVideo() {
      if (!source) {
        return;
      }
      playCover.classList.add('hidden');
      if (!started) {
        started = true;
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = source;
          video.play();
        } else if (window.Hls && window.Hls.isSupported()) {
          var hls = new Hls();
          hls.loadSource(source);
          hls.attachMedia(video);
          hls.on(Hls.Events.MANIFEST_PARSED, function () {
            video.play();
          });
        } else {
          video.src = source;
          video.play();
        }
      } else {
        video.play();
      }
    }
    playCover.addEventListener('click', startVideo);
    video.addEventListener('click', function () {
      if (video.paused) {
        startVideo();
      }
    });
  }
})();
