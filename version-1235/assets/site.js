(function () {
    var navToggle = document.querySelector('[data-nav-toggle]');
    var mainNav = document.querySelector('[data-main-nav]');

    if (navToggle && mainNav) {
        navToggle.addEventListener('click', function () {
            mainNav.classList.toggle('open');
        });
    }

    function normalize(value) {
        return String(value || '').toLowerCase().trim();
    }

    function resolveUrl(prefix, itemUrl) {
        if (!prefix) {
            return itemUrl;
        }
        return prefix + itemUrl;
    }

    function renderSearchResults(input, resultsBox) {
        var query = normalize(input.value);
        var prefix = input.getAttribute('data-result-prefix') || '';
        var data = window.MOVIE_SEARCH_INDEX || [];

        if (!query) {
            resultsBox.hidden = true;
            resultsBox.innerHTML = '';
            return;
        }

        var matched = data.filter(function (item) {
            var haystack = normalize([
                item.title,
                item.year,
                item.region,
                item.type,
                item.genre,
                (item.tags || []).join(' '),
                item.oneLine,
                item.category
            ].join(' '));

            return haystack.indexOf(query) !== -1;
        }).slice(0, 30);

        if (!matched.length) {
            resultsBox.hidden = false;
            resultsBox.innerHTML = '<div class="search-result-item"><div></div><span>未找到匹配影片，请尝试更换关键词。</span></div>';
            return;
        }

        resultsBox.hidden = false;
        resultsBox.innerHTML = matched.map(function (item) {
            return [
                '<a class="search-result-item" href="' + resolveUrl(prefix, item.url) + '">',
                '<img src="' + prefix + item.cover + '" alt="' + item.title.replace(/"/g, '&quot;') + '">',
                '<span>',
                '<strong>' + item.title + '</strong>',
                '<span>' + item.year + ' · ' + item.region + ' · ' + item.genre + '</span>',
                '<span>' + item.oneLine + '</span>',
                '</span>',
                '</a>'
            ].join('');
        }).join('');
    }

    document.querySelectorAll('[data-global-search]').forEach(function (input) {
        var panel = input.closest('.search-panel');
        var resultsBox = panel ? panel.querySelector('[data-search-results]') : null;

        if (!resultsBox) {
            return;
        }

        input.addEventListener('input', function () {
            renderSearchResults(input, resultsBox);
        });
    });

    document.querySelectorAll('[data-clear-search]').forEach(function (button) {
        button.addEventListener('click', function () {
            var panel = button.closest('.search-panel');
            var input = panel ? panel.querySelector('[data-global-search]') : null;
            var resultsBox = panel ? panel.querySelector('[data-search-results]') : null;

            if (input) {
                input.value = '';
                input.focus();
            }

            if (resultsBox) {
                resultsBox.hidden = true;
                resultsBox.innerHTML = '';
            }
        });
    });

    document.querySelectorAll('[data-filter-scope]').forEach(function (scope) {
        var input = scope.querySelector('[data-filter-input]');
        var yearSelect = scope.querySelector('[data-filter-year]');
        var typeSelect = scope.querySelector('[data-filter-type]');
        var cards = Array.prototype.slice.call(scope.querySelectorAll('[data-card]'));
        var noResults = scope.querySelector('[data-no-results]');

        function applyFilter() {
            var keyword = normalize(input ? input.value : '');
            var year = yearSelect ? yearSelect.value : '';
            var type = typeSelect ? typeSelect.value : '';
            var visibleCount = 0;

            cards.forEach(function (card) {
                var text = normalize(card.getAttribute('data-search-text'));
                var cardYear = card.getAttribute('data-year') || '';
                var matchesKeyword = !keyword || text.indexOf(keyword) !== -1;
                var matchesYear = !year || cardYear === year;
                var matchesType = !type || text.indexOf(normalize(type)) !== -1;
                var show = matchesKeyword && matchesYear && matchesType;

                card.style.display = show ? '' : 'none';
                if (show) {
                    visibleCount += 1;
                }
            });

            if (noResults) {
                noResults.style.display = visibleCount ? 'none' : 'block';
            }
        }

        [input, yearSelect, typeSelect].forEach(function (control) {
            if (control) {
                control.addEventListener('input', applyFilter);
                control.addEventListener('change', applyFilter);
            }
        });
    });
})();
