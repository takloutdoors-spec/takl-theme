/* TAKL 3.0 — Theme JavaScript */

document.addEventListener('DOMContentLoaded', () => {

  // ── Custom Cursor ──────────────────────────────────────────
  const cur = document.getElementById('t-cursor');
  const ring = document.getElementById('t-cursor-ring');
  if (cur && ring && window.matchMedia('(pointer: fine)').matches) {
    let mx = 0, my = 0, rx = 0, ry = 0;
    document.addEventListener('mousemove', e => {
      mx = e.clientX; my = e.clientY;
      cur.style.left = mx + 'px'; cur.style.top = my + 'px';
    });
    (function loop() {
      rx += (mx - rx) * 0.12; ry += (my - ry) * 0.12;
      ring.style.left = rx + 'px'; ring.style.top = ry + 'px';
      requestAnimationFrame(loop);
    })();
    document.querySelectorAll('a, button, [role="button"]').forEach(el => {
      el.addEventListener('mouseenter', () => document.body.classList.add('cursor-grow'));
      el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-grow'));
    });
  }

  // ── Header scroll ──────────────────────────────────────────
  const header = document.getElementById('t-header');
  if (header) {
    const tick = () => header.classList.toggle('scrolled', window.scrollY > 60);
    window.addEventListener('scroll', tick, { passive: true });
    tick();
  }

  // ── Scroll reveal ──────────────────────────────────────────
  const reveals = document.querySelectorAll('.reveal');
  if (reveals.length) {
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('in'); });
    }, { threshold: 0.08, rootMargin: '0px 0px -30px 0px' });
    reveals.forEach(el => obs.observe(el));
  }

  // ── Nav drawer ─────────────────────────────────────────────
  const burger = document.getElementById('t-burger');
  const navDrawer = document.getElementById('t-nav-drawer');
  const overlay = document.getElementById('t-overlay');

  function openNav() {
    navDrawer?.classList.add('open');
    overlay?.classList.add('on');
    burger?.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
  function closeAll() {
    navDrawer?.classList.remove('open');
    cartDrawer?.classList.remove('open');
    overlay?.classList.remove('on');
    burger?.classList.remove('open');
    document.body.style.overflow = '';
  }
  burger?.addEventListener('click', openNav);
  overlay?.addEventListener('click', closeAll);
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeAll(); });
  document.querySelectorAll('.t-drawer__close').forEach(btn => btn.addEventListener('click', closeAll));

  // ── Cart drawer ─────────────────────────────────────────────
  const cartDrawer = document.getElementById('t-cart-drawer');
  const cartToggle = document.getElementById('t-cart-toggle');
  cartToggle?.addEventListener('click', () => {
    cartDrawer?.classList.add('open');
    overlay?.classList.add('on');
    refreshCart();
  });

  function refreshCart() {
    fetch('/cart.js')
      .then(r => r.json())
      .then(cart => renderCart(cart))
      .catch(() => {});
  }

  function renderCart(cart) {
    const body = document.getElementById('cart-drawer-body');
    const countEls = document.querySelectorAll('.t-cart-count');
    const subtotalEl = document.getElementById('cart-subtotal');

    countEls.forEach(el => {
      el.textContent = cart.item_count;
      el.style.display = cart.item_count > 0 ? 'inline-flex' : 'none';
    });

    if (subtotalEl) subtotalEl.textContent = formatMoney(cart.total_price);

    if (!body) return;

    if (cart.item_count === 0) {
      body.innerHTML = `
        <div class="cart-drawer__empty">
          <p>Your bag is empty.</p>
          <a href="/collections" class="btn-outline" style="display:inline-flex">Shop the Drop →</a>
        </div>`;
      return;
    }

    body.innerHTML = cart.items.map(item => `
      <div class="cart-item" data-key="${item.key}">
        <img class="cart-item__img" src="${item.image}" alt="${item.title}">
        <div>
          <p class="cart-item__name">${item.product_title}</p>
          <p class="cart-item__variant">${item.variant_title !== 'Default Title' ? item.variant_title : ''}</p>
          <p class="cart-item__price">${formatMoney(item.final_line_price)}</p>
          <div class="cart-item__qty">
            <button class="qty-minus" data-key="${item.key}" data-qty="${item.quantity - 1}">−</button>
            <span>${item.quantity}</span>
            <button class="qty-plus" data-key="${item.key}" data-qty="${item.quantity + 1}">+</button>
          </div>
          <button class="cart-item__remove" data-key="${item.key}" data-qty="0">Remove</button>
        </div>
      </div>`).join('');

    body.querySelectorAll('[data-key]').forEach(btn => {
      btn.addEventListener('click', () => {
        updateCart(btn.dataset.key, parseInt(btn.dataset.qty));
      });
    });
  }

  function updateCart(key, qty) {
    fetch('/cart/change.js', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: key, quantity: qty })
    }).then(r => r.json()).then(cart => renderCart(cart));
  }

  function formatMoney(cents) {
    return '$' + (cents / 100).toFixed(2);
  }

  // ── Add to cart ────────────────────────────────────────────
  document.querySelectorAll('.atc-form').forEach(form => {
    form.addEventListener('submit', e => {
      e.preventDefault();
      const btn = form.querySelector('.t-product__atc');
      const variantId = form.querySelector('[name="id"]')?.value;
      if (!variantId) return;

      const orig = btn.innerHTML;
      btn.innerHTML = '<span class="t-loading"></span>';
      btn.disabled = true;

      fetch('/cart/add.js', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: parseInt(variantId), quantity: 1 })
      })
      .then(r => r.json())
      .then(() => {
        btn.innerHTML = 'Added ✓';
        refreshCart();
        setTimeout(() => {
          btn.innerHTML = orig;
          btn.disabled = false;
          cartDrawer?.classList.add('open');
          overlay?.classList.add('on');
        }, 800);
      })
      .catch(() => {
        btn.innerHTML = 'Try again';
        btn.disabled = false;
        setTimeout(() => { btn.innerHTML = orig; }, 1500);
      });
    });
  });

  // Quick add buttons
  document.querySelectorAll('.t-card__quick').forEach(btn => {
    btn.addEventListener('click', () => {
      const variantId = btn.dataset.variant;
      if (!variantId) return;
      btn.textContent = '...';
      fetch('/cart/add.js', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: parseInt(variantId), quantity: 1 })
      })
      .then(r => r.json())
      .then(() => {
        btn.textContent = 'Added ✓';
        refreshCart();
        setTimeout(() => {
          btn.textContent = 'Quick Add';
          cartDrawer?.classList.add('open');
          overlay?.classList.add('on');
        }, 700);
      });
    });
  });

  // ── Product page — variant selector ───────────────────────
  document.querySelectorAll('.t-product__option').forEach(btn => {
    btn.addEventListener('click', () => {
      const group = btn.dataset.group;
      document.querySelectorAll(`.t-product__option[data-group="${group}"]`).forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      updateVariant();
    });
  });

  function updateVariant() {
    const selected = {};
    document.querySelectorAll('.t-product__option.selected').forEach(b => {
      selected[b.dataset.group] = b.dataset.value;
    });
    const variants = window.TAKL_VARIANTS || [];
    const match = variants.find(v =>
      v.options.every((opt, i) => selected[`option${i + 1}`] === opt)
    );
    if (match) {
      const idInput = document.querySelector('[name="id"]');
      const priceEl = document.querySelector('.t-product__price');
      const atcBtn = document.querySelector('.t-product__atc');
      if (idInput) idInput.value = match.id;
      if (priceEl) priceEl.textContent = formatMoney(match.price);
      if (atcBtn) {
        if (match.available) {
          atcBtn.textContent = 'Add to Bag';
          atcBtn.disabled = false;
        } else {
          atcBtn.textContent = 'Sold Out';
          atcBtn.disabled = true;
        }
      }
    }
  }

  // ── Product gallery thumbnails ─────────────────────────────
  document.querySelectorAll('.t-product__thumb').forEach(thumb => {
    thumb.addEventListener('click', () => {
      const main = document.querySelector('.t-product__main-img');
      if (main) main.src = thumb.src.replace('_small', '');
      document.querySelectorAll('.t-product__thumb').forEach(t => t.classList.remove('active'));
      thumb.classList.add('active');
    });
  });

  // ── Countdown timer ────────────────────────────────────────
  const countdownEl = document.getElementById('t-countdown');
  if (countdownEl) {
    const target = new Date(countdownEl.dataset.target);
    function tick() {
      const now = new Date();
      const diff = target - now;
      if (diff <= 0) {
        countdownEl.innerHTML = '<span style="font-size:.8rem;letter-spacing:.1em;text-transform:uppercase;color:var(--clay)">Drop is Live</span>';
        return;
      }
      const d = Math.floor(diff / 86400000);
      const h = Math.floor((diff % 86400000) / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      countdownEl.innerHTML = [
        [String(d).padStart(2,'0'), 'Days'],
        [String(h).padStart(2,'0'), 'Hrs'],
        [String(m).padStart(2,'0'), 'Min'],
        [String(s).padStart(2,'0'), 'Sec'],
      ].map(([n, l]) => `<div class="t-countdown__unit"><span class="t-countdown__num">${n}</span><span class="t-countdown__label">${l}</span></div>`).join('');
    }
    tick();
    setInterval(tick, 1000);
  }

  // ── Initial cart count ─────────────────────────────────────
  refreshCart();

});
