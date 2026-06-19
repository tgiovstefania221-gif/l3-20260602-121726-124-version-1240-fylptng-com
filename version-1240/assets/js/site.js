(function () {
  var menuButton = document.querySelector("[data-menu-button]");
  var mobileNav = document.querySelector("[data-mobile-nav]");

  if (menuButton && mobileNav) {
    menuButton.addEventListener("click", function () {
      mobileNav.classList.toggle("open");
    });
  }

  document.querySelectorAll("[data-hero]").forEach(function (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll(".hero-dots button"));
    var prev = hero.querySelector("[data-hero-prev]");
    var next = hero.querySelector("[data-hero-next]");
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, itemIndex) {
        slide.classList.toggle("active", itemIndex === index);
      });
      dots.forEach(function (dot, itemIndex) {
        dot.classList.toggle("active", itemIndex === index);
      });
    }

    function move(step) {
      show(index + step);
    }

    function restart() {
      if (timer) {
        clearInterval(timer);
      }
      timer = setInterval(function () {
        move(1);
      }, 5000);
    }

    if (slides.length > 0) {
      show(0);
      restart();
    }

    if (prev) {
      prev.addEventListener("click", function () {
        move(-1);
        restart();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        move(1);
        restart();
      });
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener("click", function () {
        show(dotIndex);
        restart();
      });
    });
  });

  document.querySelectorAll("[data-filter-panel]").forEach(function (panel) {
    var scope = document.querySelector(panel.getAttribute("data-target"));
    if (!scope) {
      return;
    }

    var input = panel.querySelector("[data-search-input]");
    var yearSelect = panel.querySelector("[data-year-select]");
    var sortSelect = panel.querySelector("[data-sort-select]");
    var empty = document.querySelector(panel.getAttribute("data-empty"));
    var cards = Array.prototype.slice.call(scope.querySelectorAll(".movie-card"));

    function getText(card) {
      return [
        card.getAttribute("data-title") || "",
        card.getAttribute("data-tags") || "",
        card.getAttribute("data-category") || ""
      ].join(" ").toLowerCase();
    }

    function apply() {
      var keyword = input ? input.value.trim().toLowerCase() : "";
      var year = yearSelect ? yearSelect.value : "";
      var visible = 0;

      cards.forEach(function (card) {
        var matchedKeyword = !keyword || getText(card).indexOf(keyword) !== -1;
        var matchedYear = !year || card.getAttribute("data-year") === year;
        var show = matchedKeyword && matchedYear;
        card.style.display = show ? "" : "none";
        if (show) {
          visible += 1;
        }
      });

      if (empty) {
        empty.style.display = visible === 0 ? "block" : "none";
      }
    }

    function sortCards() {
      if (!sortSelect) {
        return;
      }

      var mode = sortSelect.value;
      var sorted = cards.slice().sort(function (a, b) {
        if (mode === "year") {
          return Number(b.getAttribute("data-year")) - Number(a.getAttribute("data-year"));
        }
        if (mode === "rating") {
          return Number(b.getAttribute("data-rating")) - Number(a.getAttribute("data-rating"));
        }
        if (mode === "views") {
          return Number(b.getAttribute("data-views")) - Number(a.getAttribute("data-views"));
        }
        return (a.getAttribute("data-title") || "").localeCompare(b.getAttribute("data-title") || "", "zh-Hans-CN");
      });

      sorted.forEach(function (card) {
        scope.appendChild(card);
      });
      cards = sorted;
      apply();
    }

    if (input) {
      input.addEventListener("input", apply);
    }
    if (yearSelect) {
      yearSelect.addEventListener("change", apply);
    }
    if (sortSelect) {
      sortSelect.addEventListener("change", sortCards);
    }

    sortCards();
  });
})();

function initMoviePlayer(streamUrl) {
  var video = document.getElementById("moviePlayer");
  var shell = document.querySelector(".player-shell");
  var button = document.querySelector(".player-start");
  var hls = null;
  var started = false;

  if (!video || !streamUrl) {
    return;
  }

  function bindStream() {
    if (video.src) {
      return;
    }

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = streamUrl;
    } else if (window.Hls && window.Hls.isSupported()) {
      hls = new Hls();
      hls.loadSource(streamUrl);
      hls.attachMedia(video);
    } else {
      video.src = streamUrl;
    }
  }

  function startPlayback() {
    bindStream();
    started = true;
    if (shell) {
      shell.classList.add("active");
    }
    var playPromise = video.play();
    if (playPromise && typeof playPromise.catch === "function") {
      playPromise.catch(function () {});
    }
  }

  if (button) {
    button.addEventListener("click", startPlayback);
  }

  video.addEventListener("click", function () {
    if (!started) {
      startPlayback();
    }
  });

  window.addEventListener("beforeunload", function () {
    if (hls) {
      hls.destroy();
    }
  });
}
