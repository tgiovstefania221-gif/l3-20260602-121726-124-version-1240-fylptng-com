(function () {
    const toggle = document.querySelector('[data-nav-toggle]');
    const nav = document.querySelector('[data-main-nav]');

    if (toggle && nav) {
        toggle.addEventListener('click', function () {
            nav.classList.toggle('is-open');
        });
    }

    document.querySelectorAll('[data-hero-slider]').forEach(function (slider) {
        const slides = Array.from(slider.querySelectorAll('[data-hero-slide]'));
        const prev = slider.querySelector('[data-hero-prev]');
        const next = slider.querySelector('[data-hero-next]');
        const dots = slider.querySelector('[data-hero-dots]');
        let current = 0;
        let timer = null;

        function render() {
            slides.forEach(function (slide, index) {
                slide.classList.toggle('is-active', index === current);
            });
            if (dots) {
                Array.from(dots.children).forEach(function (dot, index) {
                    dot.classList.toggle('is-active', index === current);
                });
            }
        }

        function go(step) {
            current = (current + step + slides.length) % slides.length;
            render();
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                go(1);
            }, 5200);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        if (dots) {
            slides.forEach(function (_slide, index) {
                const button = document.createElement('button');
                button.type = 'button';
                button.setAttribute('aria-label', '切换推荐内容');
                button.addEventListener('click', function () {
                    current = index;
                    render();
                    start();
                });
                dots.appendChild(button);
            });
        }

        if (prev) {
            prev.addEventListener('click', function () {
                go(-1);
                start();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                go(1);
                start();
            });
        }

        slider.addEventListener('mouseenter', stop);
        slider.addEventListener('mouseleave', start);
        render();
        start();
    });

    document.querySelectorAll('[data-filter-scope]').forEach(function (scope) {
        const input = scope.querySelector('[data-card-filter]');
        const cards = Array.from(scope.querySelectorAll('[data-filter-card]'));
        const empty = scope.querySelector('[data-no-results]');

        if (!input || cards.length === 0) {
            return;
        }

        input.addEventListener('input', function () {
            const keyword = input.value.trim().toLowerCase();
            let visible = 0;

            cards.forEach(function (card) {
                const text = ((card.dataset.title || '') + ' ' + (card.dataset.tags || '')).toLowerCase();
                const matched = !keyword || text.includes(keyword);
                card.hidden = !matched;
                if (matched) {
                    visible += 1;
                }
            });

            if (empty) {
                empty.hidden = visible !== 0;
            }
        });
    });

    const globalInput = document.getElementById('global-search');
    const globalResults = document.getElementById('global-search-results');

    if (globalInput && globalResults && Array.isArray(window.MOVIE_SEARCH_INDEX)) {
        globalInput.addEventListener('input', function () {
            const keyword = globalInput.value.trim().toLowerCase();
            globalResults.innerHTML = '';

            if (!keyword) {
                globalResults.hidden = true;
                return;
            }

            const matched = window.MOVIE_SEARCH_INDEX.filter(function (movie) {
                return movie.search.includes(keyword);
            }).slice(0, 24);

            matched.forEach(function (movie) {
                const link = document.createElement('a');
                link.href = movie.url;

                const title = document.createElement('strong');
                title.textContent = movie.title;

                const meta = document.createElement('small');
                meta.textContent = movie.meta;

                link.appendChild(title);
                link.appendChild(meta);
                globalResults.appendChild(link);
            });

            if (matched.length === 0) {
                const item = document.createElement('a');
                item.href = './categories.html';
                item.textContent = '浏览分类片库';
                globalResults.appendChild(item);
            }

            globalResults.hidden = false;
        });
    }
})();
