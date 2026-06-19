(function () {
  "use strict";

  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  ready(function () {
    initMobileNav();
    initHeroCarousel();
    initFilters();
    initPlayers();
  });

  function initMobileNav() {
    var toggle = document.querySelector("[data-mobile-toggle]");
    var nav = document.querySelector("[data-mobile-nav]");

    if (!toggle || !nav) {
      return;
    }

    toggle.addEventListener("click", function () {
      nav.classList.toggle("open");
    });
  }

  function initHeroCarousel() {
    var hero = document.querySelector("[data-hero]");
    if (!hero) {
      return;
    }

    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    var prev = hero.querySelector("[data-hero-prev]");
    var next = hero.querySelector("[data-hero-next]");
    var current = 0;
    var timer = null;

    if (slides.length === 0) {
      return;
    }

    function show(index) {
      current = (index + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("active", slideIndex === current);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("active", dotIndex === current);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener("click", function () {
        show(index);
        start();
      });
    });

    if (prev) {
      prev.addEventListener("click", function () {
        show(current - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(current + 1);
        start();
      });
    }

    hero.addEventListener("mouseenter", stop);
    hero.addEventListener("mouseleave", start);

    show(0);
    start();
  }

  function initFilters() {
    var scopes = Array.prototype.slice.call(document.querySelectorAll("[data-filter-scope]"));

    scopes.forEach(function (scope) {
      var keywordInput = scope.querySelector("[data-filter-keyword]");
      var yearSelect = scope.querySelector("[data-filter-year]");
      var typeSelect = scope.querySelector("[data-filter-type]");
      var count = scope.querySelector("[data-filter-count]");
      var container = scope.parentElement || document;
      var cards = Array.prototype.slice.call(container.querySelectorAll(".movie-card, .ranking-row"));
      var empty = container.querySelector("[data-empty-state]");

      function matchesYear(cardYear, selected) {
        var year = parseInt(cardYear, 10);
        if (!selected) {
          return true;
        }

        if (selected === "2025") {
          return year >= 2025;
        }

        if (selected === "2020") {
          return year >= 2020 && year <= 2024;
        }

        if (selected === "2010") {
          return year >= 2010 && year <= 2019;
        }

        if (selected === "2000") {
          return year >= 2000 && year <= 2009;
        }

        if (selected === "1900") {
          return year < 2000;
        }

        return true;
      }

      function apply() {
        var keyword = keywordInput ? keywordInput.value.trim().toLowerCase() : "";
        var selectedYear = yearSelect ? yearSelect.value : "";
        var selectedType = typeSelect ? typeSelect.value : "";
        var visible = 0;

        cards.forEach(function (card) {
          var haystack = (card.getAttribute("data-search") || "").toLowerCase();
          var cardYear = card.getAttribute("data-year") || "";
          var cardType = card.getAttribute("data-type") || "";
          var okKeyword = keyword === "" || haystack.indexOf(keyword) !== -1;
          var okYear = matchesYear(cardYear, selectedYear);
          var okType = selectedType === "" || cardType === selectedType;
          var show = okKeyword && okYear && okType;

          card.style.display = show ? "" : "none";

          if (show) {
            visible += 1;
          }
        });

        if (count) {
          count.textContent = "当前显示 " + visible + " 部影片";
        }

        if (empty) {
          empty.style.display = visible === 0 ? "block" : "none";
        }
      }

      [keywordInput, yearSelect, typeSelect].forEach(function (element) {
        if (element) {
          element.addEventListener("input", apply);
          element.addEventListener("change", apply);
        }
      });

      apply();
    });
  }

  function initPlayers() {
    var players = Array.prototype.slice.call(document.querySelectorAll("[data-player]"));

    players.forEach(function (player) {
      var button = player.querySelector("[data-play-button]");
      var video = player.querySelector("video");
      var overlay = player.querySelector(".player-overlay");
      var status = player.querySelector("[data-player-status]");
      var source = player.getAttribute("data-video-source");
      var started = false;

      if (!button || !video || !source) {
        return;
      }

      function setStatus(message) {
        if (status) {
          status.textContent = message;
        }
      }

      function playVideo() {
        if (started) {
          video.play();
          return;
        }

        started = true;
        setStatus("正在加载视频...");

        if (window.Hls && window.Hls.isSupported()) {
          var hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });

          hls.loadSource(source);
          hls.attachMedia(video);

          hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
            setStatus("视频已就绪");
            video.play().catch(function () {
              setStatus("浏览器阻止了自动播放，请再次点击视频播放。");
            });
          });

          hls.on(window.Hls.Events.ERROR, function (event, data) {
            if (data && data.fatal) {
              setStatus("视频加载失败，请检查视频地址或网络连接。");
            }
          });
        } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = source;
          video.addEventListener("loadedmetadata", function () {
            setStatus("视频已就绪");
            video.play().catch(function () {
              setStatus("浏览器阻止了自动播放，请再次点击视频播放。");
            });
          });
        } else {
          video.src = source;
          setStatus("当前浏览器需要 HLS 支持或 hls.js 才能播放。");
        }

        if (overlay) {
          overlay.classList.add("hidden");
        }

        video.controls = true;
      }

      button.addEventListener("click", playVideo);
    });
  }
})();
