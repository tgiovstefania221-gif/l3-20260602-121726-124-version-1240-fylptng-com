(function () {
  function qs(selector, root) {
    return (root || document).querySelector(selector);
  }

  function qsa(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function setupHero() {
    var slider = qs('[data-hero-slider]');
    if (!slider) {
      return;
    }

    var slides = qsa('.hero-slide', slider);
    var dots = qsa('.hero-dot', slider);
    var current = 0;

    function show(index) {
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
        show(i);
      });
    });

    if (slides.length > 1) {
      window.setInterval(function () {
        show(current + 1);
      }, 5200);
    }
  }

  function setupLocalFilter() {
    var root = qs('[data-local-filter]');
    var grid = qs('[data-filter-grid]');
    if (!root || !grid) {
      return;
    }

    var input = qs('input', root);
    var select = qs('select', root);
    var cards = qsa('.movie-card', grid);

    function apply() {
      var keyword = (input.value || '').trim().toLowerCase();
      var year = select.value;

      cards.forEach(function (card) {
        var text = card.textContent.toLowerCase();
        var cardYear = card.getAttribute('data-year') || '';
        var okKeyword = !keyword || text.indexOf(keyword) !== -1;
        var okYear = !year || cardYear === year;
        card.style.display = okKeyword && okYear ? '' : 'none';
      });
    }

    input.addEventListener('input', apply);
    select.addEventListener('change', apply);
  }

  function setupPlayer() {
    var cards = qsa('[data-player-card]');
    cards.forEach(function (card) {
      var video = qs('video[data-source]', card);
      var button = qs('[data-player-start]', card);
      var status = qs('[data-player-status]', card);
      var initialized = false;

      if (!video || !button) {
        return;
      }

      function setStatus(text) {
        if (status) {
          status.textContent = text;
        }
      }

      function initAndPlay() {
        var source = video.getAttribute('data-source');
        if (!source) {
          setStatus('当前播放源为空');
          return;
        }

        button.classList.add('is-hidden');
        setStatus('正在连接播放源');

        if (!initialized) {
          if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = source;
            initialized = true;
          } else if (window.Hls && window.Hls.isSupported()) {
            var hls = new window.Hls({
              enableWorker: true,
              lowLatencyMode: false
            });
            hls.loadSource(source);
            hls.attachMedia(video);
            initialized = true;
          } else {
            setStatus('当前浏览器需要更换播放环境');
            return;
          }
        }

        var playPromise = video.play();
        if (playPromise && typeof playPromise.catch === 'function') {
          playPromise
            .then(function () {
              setStatus('正在播放');
            })
            .catch(function () {
              setStatus('请再次点击播放');
              button.classList.remove('is-hidden');
            });
        } else {
          setStatus('正在播放');
        }
      }

      button.addEventListener('click', initAndPlay);
      card.addEventListener('click', function (event) {
        if (event.target === video) {
          initAndPlay();
        }
      });
      video.addEventListener('play', function () {
        button.classList.add('is-hidden');
        setStatus('正在播放');
      });
      video.addEventListener('pause', function () {
        setStatus('已暂停');
      });
      video.addEventListener('error', function () {
        setStatus('播放源暂时无法连接');
        button.classList.remove('is-hidden');
      });
    });
  }

  function createResultCard(movie) {
    var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
      return '<span>' + escapeHtml(tag) + '</span>';
    }).join('');

    return [
      '<article class="movie-card">',
      '  <a class="poster-wrap" href="' + escapeHtml(movie.url) + '">',
      '    <span class="poster-fallback">' + escapeHtml(movie.title.slice(0, 1)) + '</span>',
      '    <img class="poster-image" src="' + escapeHtml(movie.poster) + '" alt="' + escapeHtml(movie.title) + ' 海报" loading="lazy" onerror="this.classList.add(\'is-missing\');">',
      '    <span class="poster-badge">' + escapeHtml(movie.year) + '</span>',
      '  </a>',
      '  <div class="card-body">',
      '    <div class="card-meta"><span>' + escapeHtml(movie.category) + '</span><span>' + escapeHtml(movie.type) + '</span></div>',
      '    <h3><a href="' + escapeHtml(movie.url) + '">' + escapeHtml(movie.title) + '</a></h3>',
      '    <p>' + escapeHtml(movie.oneLine) + '</p>',
      '    <div class="tag-row">' + tags + '</div>',
      '  </div>',
      '</article>'
    ].join('');
  }

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function setupSearch() {
    var panel = qs('[data-search-panel]');
    var resultRoot = qs('[data-search-results]');
    var countRoot = qs('[data-search-count]');
    if (!panel || !resultRoot || !countRoot || !window.SEARCH_MOVIES) {
      return;
    }

    var input = qs('input', panel);
    var select = qs('select', panel);
    var button = qs('button', panel);

    function runSearch() {
      var keyword = (input.value || '').trim().toLowerCase();
      var category = select.value;
      var results = window.SEARCH_MOVIES.filter(function (movie) {
        var text = [
          movie.title,
          movie.year,
          movie.region,
          movie.type,
          movie.genre,
          (movie.tags || []).join(' '),
          movie.oneLine,
          movie.category
        ].join(' ').toLowerCase();
        var okKeyword = !keyword || text.indexOf(keyword) !== -1;
        var okCategory = !category || movie.category === category;
        return okKeyword && okCategory;
      }).slice(0, 80);

      countRoot.textContent = '找到 ' + results.length + ' 条匹配结果，最多展示前 80 条。';
      resultRoot.innerHTML = results.map(createResultCard).join('');
    }

    input.addEventListener('input', runSearch);
    select.addEventListener('change', runSearch);
    button.addEventListener('click', runSearch);
  }

  document.addEventListener('DOMContentLoaded', function () {
    setupHero();
    setupLocalFilter();
    setupPlayer();
    setupSearch();
  });
})();
