(function () {
    var input = document.getElementById('siteSearchInput');
    var button = document.getElementById('siteSearchButton');
    var status = document.getElementById('siteSearchStatus');
    var results = document.getElementById('siteSearchResults');
    var data = window.SITE_MOVIES || [];

    if (!input || !button || !results || !status) {
        return;
    }

    function escapeHtml(value) {
        return String(value || '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    function render(items) {
        if (!items.length) {
            results.innerHTML = '';
            status.textContent = '没有找到匹配影片，请尝试更换关键词。';
            return;
        }

        status.textContent = '找到 ' + items.length + ' 条结果，最多显示前 120 条。';
        results.innerHTML = items.slice(0, 120).map(function (movie) {
            return [
                '<article class="movie-card">',
                '    <a class="poster-link" href="' + escapeHtml(movie.url) + '">',
                '        <img src="' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
                '        <span class="poster-badge">' + escapeHtml(movie.year) + '</span>',
                '    </a>',
                '    <div class="movie-card-body">',
                '        <div class="movie-meta-line"><span>' + escapeHtml(movie.region) + '</span><span>' + escapeHtml(movie.type) + '</span></div>',
                '        <h3><a href="' + escapeHtml(movie.url) + '">' + escapeHtml(movie.title) + '</a></h3>',
                '        <p>' + escapeHtml(movie.oneLine) + '</p>',
                '        <div class="tag-row"><span>' + escapeHtml(movie.genre) + '</span></div>',
                '    </div>',
                '</article>'
            ].join('\n');
        }).join('\n');
    }

    function search() {
        var keyword = input.value.trim().toLowerCase();

        if (!keyword) {
            results.innerHTML = '';
            status.textContent = '请输入关键词开始搜索。';
            return;
        }

        var items = data.filter(function (movie) {
            return movie.searchText.indexOf(keyword) !== -1;
        });

        render(items);
    }

    button.addEventListener('click', search);
    input.addEventListener('keydown', function (event) {
        if (event.key === 'Enter') {
            search();
        }
    });

    var params = new URLSearchParams(window.location.search);
    var q = params.get('q');

    if (q) {
        input.value = q;
        search();
    }
}());
