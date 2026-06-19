(() => {
  const menuButton = document.querySelector('[data-menu-toggle]');
  const mobileMenu = document.querySelector('[data-mobile-menu]');
  if (menuButton && mobileMenu) {
    menuButton.addEventListener('click', () => {
      mobileMenu.classList.toggle('open');
    });
  }

  const hero = document.querySelector('[data-hero]');
  if (hero) {
    const slides = Array.from(hero.querySelectorAll('.hero-slide'));
    const dots = Array.from(hero.querySelectorAll('.hero-dot'));
    let current = 0;
    const show = (index) => {
      current = (index + slides.length) % slides.length;
      slides.forEach((slide, i) => slide.classList.toggle('active', i === current));
      dots.forEach((dot, i) => dot.classList.toggle('active', i === current));
    };
    dots.forEach((dot, i) => dot.addEventListener('click', () => show(i)));
    if (slides.length > 1) {
      window.setInterval(() => show(current + 1), 5200);
    }
  }

  const localSearch = document.querySelector('[data-local-search]');
  if (localSearch) {
    const cards = Array.from(document.querySelectorAll('[data-card]'));
    localSearch.addEventListener('input', () => {
      const value = localSearch.value.trim().toLowerCase();
      cards.forEach((card) => {
        const text = card.getAttribute('data-card') || '';
        card.style.display = text.toLowerCase().includes(value) ? '' : 'none';
      });
    });
  }
})();
