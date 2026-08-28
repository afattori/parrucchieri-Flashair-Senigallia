// Flashair Parrucchieri — interazioni base del sito

document.addEventListener('DOMContentLoaded', () => {

document.addEventListener('DOMContentLoaded', () => {

  // --- Menu mobile ---
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

  // --- Reveal-on-scroll ---
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
    revealTargets.forEach((el) => el.classList.add('is-visible'));
  }

  // --- Gestione dinamica orario "Aperto ora / Chiuso" ---
  updateBusinessStatus();
});

function updateBusinessStatus() {
  // Orari settimanali: 0 = Domenica, 1 = Lunedì, ecc.
  const schedule = {
    0: [], // Domenica chiusi
    1: [], // Lunedì chiusi
    2: [{ start: "08:30", end: "12:30" }, { start: "14:30", end: "18:30" }], // Martedì
    3: [{ start: "08:30", end: "12:30" }, { start: "14:30", end: "18:30" }], // Mercoledì
    4: [{ start: "08:30", end: "12:30" }, { start: "14:30", end: "18:30" }], // Giovedì
    5: [{ start: "08:30", end: "18:30" }], // Venerdì orario continuato
    6: [{ start: "08:30", end: "18:00" }]  // Sabato orario continuato
  };

  const dayNames = ["domenica", "lunedì", "martedì", "mercoledì", "giovedì", "venerdì", "sabato"];
  
  const now = new Date();
  const currentDay = now.getDay();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  const parseTime = (timeStr) => {
    const [h, m] = timeStr.split(':').map(Number);
    return h * 60 + m;
  };

  const todaySlots = schedule[currentDay];
  let isOpen = false;
  let currentClosingTime = "";
  let nextOpeningText = "";

  // 1. Verifica se è aperto ora
  for (const slot of todaySlots) {
    const startMin = parseTime(slot.start);
    const endMin = parseTime(slot.end);
    if (currentMinutes >= startMin && currentMinutes < endMin) {
      isOpen = true;
      currentClosingTime = slot.end;
      break;
    }
  }

  // 2. Se chiuso, calcola la prossima apertura
  if (!isOpen) {
    let foundNext = false;
    
    // Controlla se apre più tardi oggi stesso
    for (const slot of todaySlots) {
      const startMin = parseTime(slot.start);
      if (currentMinutes < startMin) {
        nextOpeningText = `oggi alle ${slot.start}`;
        foundNext = true;
        break;
      }
    }

    // Se non apre più oggi, cerca nei giorni successivi
    if (!foundNext) {
      for (let i = 1; i <= 7; i++) {
        const nextDayIndex = (currentDay + i) % 7;
        const nextSlots = schedule[nextDayIndex];
        if (nextSlots.length > 0) {
          const dayLabel = (i === 1) ? "domani" : `il ${dayNames[nextDayIndex]}`;
          nextOpeningText = `${dayLabel} alle ${nextSlots[0].start}`;
          break;
        }
      }
    }
  }

  // 3. Genera il messaggio e aggiorna i DOM elements
  const statusText = isOpen 
    ? `Aperto ora — chiude alle ${currentClosingTime}`
    : `Chiuso — apre ${nextOpeningText}`;

  const renderBadge = (containerId) => {
    const el = document.getElementById(containerId);
    if (!el) return;
    const dot = el.querySelector('.status-dot');
    const txt = el.querySelector('.status-text');

    if (dot) {
      if (isOpen) {
        dot.classList.remove('closed');
      } else {
        dot.classList.add('closed');
      }
    }
    if (txt) txt.textContent = statusText;
  };

  renderBadge('heroStatusBadge');
  renderBadge('contactStatusBadge');
}
