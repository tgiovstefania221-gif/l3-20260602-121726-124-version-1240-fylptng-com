(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function text(value) {
    return (value || "").toString().toLowerCase().trim();
  }

  function initNavigation() {
    const toggle = document.querySelector("[data-nav-toggle]");
    const nav = document.querySelector("[data-site-nav]");
    if (!toggle || !nav) {
      return;
    }
    toggle.addEventListener("click", function () {
      nav.classList.toggle("is-open");
    });
  }

  function initHero() {
    const hero = document.querySelector("[data-hero]");
    if (!hero) {
      return;
    }
    const slides = Array.from(hero.querySelectorAll("[data-hero-slide]"));
    const dots = Array.from(hero.querySelectorAll("[data-hero-dot]"));
    const prev = hero.querySelector("[data-hero-prev]");
    const next = hero.querySelector("[data-hero-next]");
    if (!slides.length) {
      return;
    }
    let active = 0;
    let timer = null;

    function show(index) {
      active = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === active);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === active);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(active + 1);
      }, 6200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    if (prev) {
      prev.addEventListener("click", function () {
        show(active - 1);
        start();
      });
    }
    if (next) {
      next.addEventListener("click", function () {
        show(active + 1);
        start();
      });
    }
    dots.forEach(function (dot, index) {
      dot.addEventListener("click", function () {
        show(index);
        start();
      });
    });
    hero.addEventListener("mouseenter", stop);
    hero.addEventListener("mouseleave", start);
    show(0);
    start();
  }

  function initFilters() {
    const scopes = Array.from(document.querySelectorAll("[data-filter-scope]"));
    scopes.forEach(function (scope) {
      const input = scope.querySelector("[data-search-input]");
      const yearFilter = scope.querySelector("[data-year-filter]");
      const typeFilter = scope.querySelector("[data-type-filter]");
      const regionFilter = scope.querySelector("[data-region-filter]");
      const items = Array.from(scope.querySelectorAll("[data-filter-item]"));
      if (!items.length) {
        return;
      }

      function apply() {
        const query = text(input ? input.value : "");
        const year = yearFilter ? yearFilter.value : "";
        const type = typeFilter ? typeFilter.value : "";
        const region = regionFilter ? regionFilter.value : "";
        items.forEach(function (item) {
          const haystack = text(item.getAttribute("data-title"));
          const itemYear = item.getAttribute("data-year") || "";
          const itemType = item.getAttribute("data-type") || "";
          const itemRegion = item.getAttribute("data-region") || "";
          const visible = (!query || haystack.indexOf(query) !== -1) &&
            (!year || itemYear === year) &&
            (!type || itemType === type) &&
            (!region || itemRegion === region);
          item.classList.toggle("is-hidden", !visible);
        });
      }

      [input, yearFilter, typeFilter, regionFilter].forEach(function (control) {
        if (control) {
          control.addEventListener("input", apply);
          control.addEventListener("change", apply);
        }
      });
    });
  }

  window.initMoviePlayer = function (videoId, buttonId, coverId, source) {
    const video = document.getElementById(videoId);
    const button = document.getElementById(buttonId);
    const cover = document.getElementById(coverId);
    if (!video || !button || !cover || !source) {
      return;
    }
    let hlsInstance = null;

    function load() {
      if (video.getAttribute("data-ready") === "1") {
        return;
      }
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;
      } else if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls();
        hlsInstance.loadSource(source);
        hlsInstance.attachMedia(video);
      } else {
        video.src = source;
      }
      video.setAttribute("data-ready", "1");
      video.setAttribute("controls", "controls");
    }

    function start() {
      load();
      cover.classList.add("is-hidden");
      const playTask = video.play();
      if (playTask && typeof playTask.catch === "function") {
        playTask.catch(function () {});
      }
    }

    button.addEventListener("click", start);
    cover.addEventListener("click", start);
    video.addEventListener("click", function () {
      if (video.paused) {
        start();
      }
    });
    window.addEventListener("beforeunload", function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  };

  ready(function () {
    initNavigation();
    initHero();
    initFilters();
  });
})();
