/**
 * Section titles and the service list of the home animate in once their section reaches 85%
 * of the screen height ([data-reveal] → [data-revealed]). The .hm-js class tells the CSS that
 * someone will reveal them, so without this script nothing stays hidden.
 */
const REVEAL_MARGIN = '0px 0px -15% 0px';

function reveal(section: Element): void {
  section.setAttribute('data-revealed', '');
}

function setupReveal(): void {
  const sections = document.querySelectorAll('[data-reveal]');
  if (sections.length === 0) return;

  if (!('IntersectionObserver' in window)) {
    sections.forEach(reveal);
    return;
  }

  document.documentElement.classList.add('hm-js');
  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;

        reveal(entry.target);
        observer.unobserve(entry.target);
      }
    },
    { rootMargin: REVEAL_MARGIN },
  );
  sections.forEach((section) => {
    observer.observe(section);
  });
}

setupReveal();
