(function () {
    var menuButton = document.querySelector('[data-menu-button]');
    var mainNav = document.querySelector('[data-main-nav]');

    if (menuButton && mainNav) {
        menuButton.addEventListener('click', function () {
            mainNav.classList.toggle('is-open');
        });
    }

    var carousel = document.querySelector('[data-hero-carousel]');

    if (carousel) {
        var slides = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-dot]'));
        var current = 0;

        function showSlide(index) {
            if (!slides.length) {
                return;
            }

            current = (index + slides.length) % slides.length;

            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === current);
            });

            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === current);
            });
        }

        dots.forEach(function (dot, dotIndex) {
            dot.addEventListener('click', function () {
                showSlide(dotIndex);
            });
        });

        if (slides.length > 1) {
            window.setInterval(function () {
                showSlide(current + 1);
            }, 5600);
        }
    }

    var filterInput = document.querySelector('[data-card-filter]');
    var cardList = document.querySelector('[data-card-list]');
    var countLabel = document.querySelector('[data-filter-count]');

    if (filterInput && cardList) {
        var cards = Array.prototype.slice.call(cardList.querySelectorAll('.movie-card'));
        var total = cards.length;

        filterInput.addEventListener('input', function () {
            var keyword = filterInput.value.trim().toLowerCase();
            var visible = 0;

            cards.forEach(function (card) {
                var text = [
                    card.getAttribute('data-title'),
                    card.getAttribute('data-year'),
                    card.getAttribute('data-region'),
                    card.getAttribute('data-genre'),
                    card.textContent
                ].join(' ').toLowerCase();
                var matched = !keyword || text.indexOf(keyword) !== -1;

                card.classList.toggle('is-filter-hidden', !matched);

                if (matched) {
                    visible += 1;
                }
            });

            if (countLabel) {
                countLabel.textContent = visible + ' / ' + total + ' 部影片';
            }
        });
    }
}());
