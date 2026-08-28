// Flashair Parrucchieri — interazioni del sito

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

  updateBusinessStatus();
  initInstagramEmbed();
  window.setInterval(updateBusinessStatus, 60 * 1000);
});

function updateBusinessStatus() {
  const hoursRows = [...document.querySelectorAll('.hours-list li[data-weekday]')];
  const badge = document.getElementById('heroStatusBadge');
  if (!hoursRows.length || !badge) return;

  const schedule = Object.fromEntries(hoursRows.map((row) => {
    const day = Number(row.dataset.weekday);
    const hours = row.querySelectorAll('span')[1]?.textContent.trim() || '';
    const slots = [...hours.matchAll(/(\d{1,2}:\d{2})\s*[–-]\s*(\d{1,2}:\d{2})/g)]
      .map(([, start, end]) => ({ start, end }));
    return [day, slots];
  }));

  const now = new Date();
  const currentDay = now.getDay();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const parseTime = (time) => {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  };

  const todaySlots = schedule[currentDay] || [];
  const currentSlot = todaySlots.find(({ start, end }) =>
    currentMinutes >= parseTime(start) && currentMinutes < parseTime(end)
  );

  let statusText;
  if (currentSlot) {
    statusText = `Aperto ora — chiude alle ${currentSlot.end}`;
  } else {
    const laterToday = todaySlots.find(({ start }) => currentMinutes < parseTime(start));
    if (laterToday) {
      statusText = `Chiuso — apre oggi alle ${laterToday.start}`;
    } else {
      const days = ['domenica', 'lunedì', 'martedì', 'mercoledì', 'giovedì', 'venerdì', 'sabato'];
      let nextOpening = null;

      for (let offset = 1; offset <= 7; offset += 1) {
        const day = (currentDay + offset) % 7;
        if (schedule[day]?.length) {
          const label = offset === 1 ? 'domani' : `lunedì ${days[day]}`;
          nextOpening = `${label} alle ${schedule[day][0].start}`;
          break;
        }
      }
      statusText = nextOpening ? `Chiuso — apre ${nextOpening}` : 'Chiuso';
    }
  }

  const dot = badge.querySelector('.status-dot');
  const text = badge.querySelector('.status-text');
  dot?.classList.toggle('closed', !currentSlot);
  if (text) text.textContent = statusText;

  hoursRows.forEach((row) => {
    const isToday = Number(row.dataset.weekday) === currentDay;
    row.classList.toggle('is-today', isToday);
    if (isToday) row.setAttribute('aria-current', 'date');
    else row.removeAttribute('aria-current');
  });
}


function initInstagramEmbed() {
  const container = document.getElementById('instagramEmbed');
  const postUrl = container?.dataset.instagramPostUrl?.trim();
  if (!container || !postUrl) return;

  const embed = document.createElement('blockquote');
  embed.className = 'instagram-media';
  embed.dataset.instgrmPermalink = postUrl;
  embed.dataset.instgrmVersion = '14';
  container.replaceChildren(embed);

  const existingScript = document.querySelector('script[src="https://www.instagram.com/embed.js"]');
  if (existingScript && window.instgrm?.Embeds) {
    window.instgrm.Embeds.process();
    return;
  }

  if (!existingScript) {
    const script = document.createElement('script');
    script.async = true;
    script.src = 'https://www.instagram.com/embed.js';
    script.addEventListener('load', () => window.instgrm?.Embeds.process());
    document.body.append(script);
  }
}
