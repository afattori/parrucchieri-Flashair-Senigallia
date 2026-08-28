// Flashair Parrucchieri — interazioni base del sito

document.addEventListener('DOMContentLoaded', () => {

  // Menu mobile
  const navToggle = document.getElementById('navToggle');
  const mobileNav = document.getElementById('mobileNav');

  if (navToggle && mobileNav) {
    navToggle.addEventListener('click', () => {
      const isOpen = mobileNav.classList.toggle('open');
      navToggle.setAttribute('aria-expanded', String(isOpen));
    });

    mobileNav.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        mobileNav.classList.remove('open');
        navToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  // Reveal-on-scroll per le sezioni principali
  const revealTargets = document.querySelectorAll(
    '.section-head, .menu-list, .salone-copy, .salone-visual, .review-card, .contact-copy, .contact-map'
  );
  revealTargets.forEach((el) => el.classList.add('reveal'));

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });

    revealTargets.forEach((el) => observer.observe(el));
  } else {
    // Fallback: nessun IntersectionObserver disponibile, mostra tutto subito
    revealTargets.forEach((el) => el.classList.add('is-visible'));
  }

});
