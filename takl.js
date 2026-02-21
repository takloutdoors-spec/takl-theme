/* ============================================================
   TAKL OUTDOOR CO. — Theme JavaScript
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {

  // ── Custom Cursor ──────────────────────────────────────────
  const cursor = document.getElementById('takl-cursor');
  const ring   = document.getElementById('takl-cursor-ring');

  if (cursor && ring && window.matchMedia('(pointer: fine)').matches) {
    let mx = 0, my = 0, rx = 0, ry = 0;

    document.addEventListener('mousemove', e => {
      mx = e.clientX; my = e.clientY;
      cursor.style.left = mx + 'px';
      cursor.style.top  = my + 'px';
    });

    (function animRing() {
      rx += (mx - rx) * 0.1;
      ry += (my - ry) * 0.1;
      ring.style.left = rx + 'px';
      ring.style.top  = ry + 'px';
      requestAnimationFrame(animRing);
    })();
  }

  // ── Header scroll state ────────────────────────────────────
  const header = document.getElementById('takl-header');
  if (header) {
    const onScroll = () => {
      header.classList.toggle('scrolled', window.scrollY > 50);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  // ── Mobile nav drawer ──────────────────────────────────────
  const burger  = document.getElementById('takl-burger');
  const drawer  = document.getElementById('takl-drawer');
  const overlay = document.getElementById('takl-overlay');
  const closeBtn= document.getElementById('takl-drawer-close');

  function openDrawer() {
    drawer?.classList.add('open');
    overlay?.classList.add('active');
    burger?.classList.add('open');
    burger?.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  }
  function closeDrawer() {
    drawer?.classList.remove('open');
    overlay?.classList.remove('active');
    burger?.classList.remove('open');
    burger?.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }

  burger?.addEventListener('click', openDrawer);
  overlay?.addEventListener('click', closeDrawer);
  closeBtn?.addEventListener('click', closeDrawer);

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeDrawer();
  });

  // ── Scroll Reveal ──────────────────────────────────────────
  const revealEls = document.querySelectorAll('.takl-reveal');
  if (revealEls.length) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
        }
      });
    }, { threshold: 0.07, rootMargin: '0px 0px -40px 0px' });

    revealEls.forEach(el => observer.observe(el));
  }

  // ── Newsletter form ────────────────────────────────────────
  const nlForm = document.querySelector('.takl-newsletter__form-el');
  if (nlForm) {
    nlForm.addEventListener('submit', e => {
      // Let Shopify handle native form submission
      // Add any analytics tracking here if needed
    });
  }

});
