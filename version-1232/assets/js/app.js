(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function setupMenu() {
    const toggle = document.querySelector("[data-menu-toggle]");
    const nav = document.querySelector("[data-mobile-nav]");
    if (!toggle || !nav) {
      return;
    }
    toggle.addEventListener("click", function () {
      nav.classList.toggle("is-open");
    });
  }

  function setupHero() {
    const hero = document.querySelector("[data-hero]");
    if (!hero) {
      return;
    }
    const slides = Array.from(hero.querySelectorAll("[data-hero-slide]"));
    const dots = Array.from(hero.querySelectorAll("[data-hero-dot]"));
    const prev = hero.querySelector("[data-hero-prev]");
    const next = hero.querySelector("[data-hero-next]");
    if (slides.length < 2) {
      return;
    }
    let current = 0;
    let timer = null;

    function render(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === current);
      });
    }

    function schedule() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        render(current + 1);
      }, 5000);
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener("click", function () {
        render(dotIndex);
        schedule();
      });
    });

    if (prev) {
      prev.addEventListener("click", function () {
        render(current - 1);
        schedule();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        render(current + 1);
        schedule();
      });
    }

    schedule();
  }

  function uniqueValues(cards, key) {
    const values = new Set();
    cards.forEach(function (card) {
      const value = card.getAttribute(key);
      if (value) {
        if (key === "data-genre") {
          value.split(/[，,、/\s]+/).forEach(function (item) {
            const text = item.trim();
            if (text) {
              values.add(text);
            }
          });
        } else {
          values.add(value.trim());
        }
      }
    });
    return Array.from(values).sort(function (a, b) {
      return a.localeCompare(b, "zh-CN");
    });
  }

  function fillSelect(select, values) {
    if (!select) {
      return;
    }
    values.forEach(function (value) {
      const option = document.createElement("option");
      option.value = value;
      option.textContent = value;
      select.appendChild(option);
    });
  }

  function setupFilters() {
    const panel = document.querySelector("[data-filter-panel]");
    if (!panel) {
      return;
    }
    const cards = Array.from(document.querySelectorAll("[data-listing-card]"));
    const input = panel.querySelector("[data-search-input]");
    const region = panel.querySelector("[data-region-filter]");
    const year = panel.querySelector("[data-year-filter]");
    const genre = panel.querySelector("[data-genre-filter]");
    const empty = document.querySelector("[data-empty-state]");

    fillSelect(region, uniqueValues(cards, "data-region"));
    fillSelect(year, uniqueValues(cards, "data-year").reverse());
    fillSelect(genre, uniqueValues(cards, "data-genre"));

    function matches(card) {
      const query = input ? input.value.trim().toLowerCase() : "";
      const regionValue = region ? region.value : "";
      const yearValue = year ? year.value : "";
      const genreValue = genre ? genre.value : "";
      const searchText = (card.getAttribute("data-search") || "").toLowerCase();
      const cardRegion = card.getAttribute("data-region") || "";
      const cardYear = card.getAttribute("data-year") || "";
      const cardGenre = card.getAttribute("data-genre") || "";
      return (!query || searchText.indexOf(query) !== -1)
        && (!regionValue || cardRegion === regionValue)
        && (!yearValue || cardYear === yearValue)
        && (!genreValue || cardGenre.indexOf(genreValue) !== -1);
    }

    function apply() {
      let shown = 0;
      cards.forEach(function (card) {
        const ok = matches(card);
        card.hidden = !ok;
        if (ok) {
          shown += 1;
        }
      });
      if (empty) {
        empty.hidden = shown !== 0;
      }
    }

    [input, region, year, genre].forEach(function (control) {
      if (control) {
        control.addEventListener("input", apply);
        control.addEventListener("change", apply);
      }
    });
  }

  function setupCovers() {
    document.querySelectorAll("img[data-cover]").forEach(function (image) {
      image.addEventListener("error", function () {
        image.classList.add("is-missing");
      }, { once: true });
    });
  }

  ready(function () {
    setupMenu();
    setupHero();
    setupFilters();
    setupCovers();
  });
})();
