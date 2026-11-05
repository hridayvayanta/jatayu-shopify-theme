/**
 * JATAYU (जटायु) — Official Luxury Fashion Theme JS
 * Shopify Online Store 2.0
 * Handles Cinematic Hero Scroll, Real Shopify Ajax Cart API, Variant Selection & Interactions
 */

(function () {
  'use strict';

  // State Management
  const state = {
    cart: null,
    isCartOpen: false,
    isMobileNavOpen: false,
    isSearchOpen: false
  };

  // DOM Elements cache helper
  const $ = (selector, parent = document) => parent.querySelector(selector);
  const $$ = (selector, parent = document) => Array.from(parent.querySelectorAll(selector));

  // Initialize once DOM is ready
  document.addEventListener('DOMContentLoaded', () => {
    initHeaderScroll();
    initHeroCinematicScroll();
    initCartDrawer();
    initMobileNav();
    initAccordions();
    initPDPGallery();
    initPDPVariants();
    initQuickAddButtons();
    initScrollReveals();
  });

  /* ==========================================================================
     1. Header Sticky Scroll Listener
     ========================================================================== */
  function initHeaderScroll() {
    const header = $('.site-header');
    if (!header) return;

    let lastScrollY = window.scrollY;

    const onScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > 40) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
      lastScrollY = currentScrollY;
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll(); // Initial check
  }

  /* ==========================================================================
     2. Cinematic Hero Scroll Transition (GSAP ScrollTrigger + Fallback)
     ========================================================================== */
  function initHeroCinematicScroll() {
    const heroSection = $('.hero-section');
    const heroWrapper = $('.hero-video-wrapper');
    const heroVideo = $('.hero-video');

    if (!heroSection || !heroWrapper) return;

    // Check if user prefers reduced motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    // Ensure hero video autoplays safely
    if (heroVideo) {
      heroVideo.muted = true;
      const playPromise = heroVideo.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          // Autoplay was prevented; video fallback handles poster
          console.info('Hero video autoplay muted fallback');
        });
      }
    }

    // If GSAP and ScrollTrigger are loaded and screen is desktop/tablet (> 768px)
    if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined' && window.innerWidth > 768) {
      gsap.registerPlugin(ScrollTrigger);

      // Signature JATAYU camera-like scale-down into warm ivory canvas
      gsap.to(heroWrapper, {
        scrollTrigger: {
          trigger: heroSection,
          start: 'top 80px',
          end: 'bottom top',
          scrub: 0.8,
          pin: false
        },
        scale: 0.95,
        borderRadius: '20px',
        boxShadow: '0 24px 60px rgba(33, 27, 25, 0.2)',
        ease: 'power2.out'
      });

      // Fade out scroll indicator
      const scrollIndicator = $('.hero-scroll-indicator');
      if (scrollIndicator) {
        gsap.to(scrollIndicator, {
          scrollTrigger: {
            trigger: heroSection,
            start: 'top top',
            end: '20% top',
            scrub: true
          },
          opacity: 0,
          y: 20
        });
      }
    } else {
      // High-performance native scroll listener for mobile or if GSAP is deferred
      window.addEventListener('scroll', () => {
        const scrolled = window.scrollY;
        const vh = window.innerHeight;
        if (scrolled < vh) {
          const ratio = Math.min(scrolled / vh, 1);
          const scale = 1 - (ratio * 0.08); // Scale to 0.92
          const radius = ratio * 16;
          heroWrapper.style.transform = `scale(${scale})`;
          heroWrapper.style.borderRadius = `${radius}px`;
        }
      }, { passive: true });
    }
  }

  /* ==========================================================================
     3. Scroll Reveal Animations
     ========================================================================== */
  function initScrollReveals() {
    const revealElements = $$('.brand-intro-title, .brand-intro-sub, .section-header-row, .statement-text, .brand-story-title, .brand-story-text, .product-card');

    if (!('IntersectionObserver' in window)) {
      revealElements.forEach(el => el.classList.add('is-visible'));
      return;
    }

    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          obs.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.12,
      rootMargin: '0px 0px -40px 0px'
    });

    revealElements.forEach(el => {
      el.style.opacity = '0';
      el.style.transform = 'translateY(24px)';
      el.style.transition = 'opacity 0.6s cubic-bezier(0.25, 1, 0.5, 1), transform 0.6s cubic-bezier(0.25, 1, 0.5, 1)';
      observer.observe(el);
    });

    // Handle is-visible class
    const styleSheet = document.createElement('style');
    styleSheet.textContent = `
      .is-visible {
        opacity: 1 !important;
        transform: translateY(0) !important;
      }
    `;
    document.head.appendChild(styleSheet);
  }

  /* ==========================================================================
     4. Shopify Ajax Cart API & Drawer System
     ========================================================================== */
  const CartAPI = {
    async getCart() {
      try {
        const res = await fetch('/cart.js');
        if (!res.ok) throw new Error('Cart fetch error');
        const cart = await res.json();
        state.cart = cart;
        return cart;
      } catch (err) {
        console.warn('Shopify Cart API (local preview mode fallback):', err);
        return state.cart || { items: [], item_count: 0, total_price: 0 };
      }
    },

    async addItem(id, quantity = 1) {
      try {
        const res = await fetch('/cart/add.js', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({ id: Number(id), quantity: Number(quantity) })
        });
        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.description || 'Could not add to cart');
        }
        const item = await res.json();
        await CartAPI.getCart();
        return item;
      } catch (err) {
        console.warn('Shopify Cart add (preview fallback):', err);
        // Fallback for local preview: add item into mock state
        if (!state.cart) state.cart = { items: [], item_count: 0, total_price: 0 };
        const existing = state.cart.items.find(i => i.id == id);
        if (existing) {
          existing.quantity += Number(quantity);
        } else {
          state.cart.items.push({
            id: id,
            title: 'Jatayu Heritage Apparel',
            variant_title: 'Oversized / Deep Maroon / L',
            price: 249900,
            image: '/assets/jatayu-logo.jpg',
            quantity: Number(quantity)
          });
        }
        state.cart.item_count = state.cart.items.reduce((s, i) => s + i.quantity, 0);
        state.cart.total_price = state.cart.items.reduce((s, i) => s + (i.price * i.quantity), 0);
        return state.cart;
      }
    },

    async changeItem(lineOrKey, quantity) {
      try {
        const res = await fetch('/cart/change.js', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({ id: lineOrKey, quantity: Number(quantity) })
        });
        const cart = await res.json();
        state.cart = cart;
        return cart;
      } catch (err) {
        console.warn('Shopify Cart change fallback:', err);
        if (state.cart && state.cart.items) {
          const item = state.cart.items.find(i => i.id == lineOrKey);
          if (item) {
            item.quantity = Number(quantity);
            if (item.quantity <= 0) {
              state.cart.items = state.cart.items.filter(i => i.id != lineOrKey);
            }
          }
          state.cart.item_count = state.cart.items.reduce((s, i) => s + i.quantity, 0);
          state.cart.total_price = state.cart.items.reduce((s, i) => s + (i.price * i.quantity), 0);
        }
        return state.cart;
      }
    }
  };

  function formatMoney(cents) {
    if (cents === null || cents === undefined) return '₹0';
    const rupees = Math.round(cents / 100);
    return '₹' + rupees.toLocaleString('en-IN');
  }

  function initCartDrawer() {
    const drawer = $('#cart-drawer');
    const overlay = $('#cart-drawer-overlay');
    const openBtns = $$('[data-cart-open]');
    const closeBtns = $$('[data-cart-close]');

    if (!drawer || !overlay) return;

    const openCart = async () => {
      drawer.classList.add('is-active');
      overlay.classList.add('is-active');
      document.body.style.overflow = 'hidden';
      state.isCartOpen = true;
      await renderCartDrawer();
    };

    const closeCart = () => {
      drawer.classList.remove('is-active');
      overlay.classList.remove('is-active');
      document.body.style.overflow = '';
      state.isCartOpen = false;
    };

    openBtns.forEach(btn => btn.addEventListener('click', (e) => {
      e.preventDefault();
      openCart();
    }));

    closeBtns.forEach(btn => btn.addEventListener('click', (e) => {
      e.preventDefault();
      closeCart();
    }));

    overlay.addEventListener('click', closeCart);

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && state.isCartOpen) {
        closeCart();
      }
    });

    // Make functions globally available for inline events
    window.JatayuCart = {
      open: openCart,
      close: closeCart,
      add: async (variantId, qty = 1, buttonEl = null) => {
        if (buttonEl) {
          buttonEl.disabled = true;
          const origText = buttonEl.innerHTML;
          buttonEl.innerHTML = `<span>Adding...</span>`;
          try {
            await CartAPI.addItem(variantId, qty);
            await openCart();
          } finally {
            buttonEl.disabled = false;
            buttonEl.innerHTML = origText;
          }
        } else {
          await CartAPI.addItem(variantId, qty);
          await openCart();
        }
      },
      updateQty: async (id, newQty) => {
        await CartAPI.changeItem(id, newQty);
        await renderCartDrawer();
      }
    };

    // Load initial cart count
    CartAPI.getCart().then(updateHeaderCount);
  }

  async function renderCartDrawer() {
    const container = $('#cart-drawer-items');
    const subtotalEl = $('#cart-drawer-subtotal');
    if (!container) return;

    const cart = state.cart || await CartAPI.getCart();
    updateHeaderCount(cart);

    if (!cart.items || cart.items.length === 0) {
      container.innerHTML = `
        <div class="cart-empty-message">
          <p>Your shopping bag is empty.</p>
          <a href="/collections/all" class="btn btn-secondary" style="margin-top: 12px;" onclick="window.JatayuCart.close();">Explore Collection</a>
        </div>
      `;
      if (subtotalEl) subtotalEl.textContent = formatMoney(0);
      return;
    }

    container.innerHTML = cart.items.map(item => `
      <div class="cart-item" data-line-id="${item.id}">
        <img src="${item.image || item.featured_image?.url || '/assets/jatayu-logo.jpg'}" alt="${item.title}" class="cart-item-img" />
        <div class="cart-item-details">
          <h4 class="cart-item-title">${item.product_title || item.title}</h4>
          ${item.variant_title ? `<span class="cart-item-variant">${item.variant_title}</span>` : ''}
          <span class="cart-item-price">${formatMoney(item.price)}</span>
          <div class="cart-item-qty-stepper">
            <button class="qty-btn" onclick="window.JatayuCart.updateQty('${item.key || item.id}', ${item.quantity - 1})">-</button>
            <input type="text" class="qty-input" value="${item.quantity}" readonly />
            <button class="qty-btn" onclick="window.JatayuCart.updateQty('${item.key || item.id}', ${item.quantity + 1})">+</button>
          </div>
        </div>
        <button class="cart-item-remove" onclick="window.JatayuCart.updateQty('${item.key || item.id}', 0)" title="Remove item">Remove</button>
      </div>
    `).join('');

    if (subtotalEl) {
      subtotalEl.textContent = formatMoney(cart.total_price);
    }
  }

  function updateHeaderCount(cart) {
    const badge = $('.header-cart-count');
    if (badge && cart) {
      badge.textContent = cart.item_count || 0;
      badge.style.display = (cart.item_count > 0) ? 'flex' : 'none';
    }
  }

  /* ==========================================================================
     5. Mobile Menu Drawer
     ========================================================================== */
  function initMobileNav() {
    const toggle = $('.mobile-menu-toggle');
    const drawer = $('#mobile-nav-drawer');
    const overlay = $('#mobile-nav-overlay');
    const closeBtn = $('#mobile-nav-close');

    if (!toggle || !drawer) return;

    const openMenu = () => {
      drawer.classList.add('is-active');
      if (overlay) overlay.classList.add('is-active');
      document.body.style.overflow = 'hidden';
      state.isMobileNavOpen = true;
    };

    const closeMenu = () => {
      drawer.classList.remove('is-active');
      if (overlay) overlay.classList.remove('is-active');
      document.body.style.overflow = '';
      state.isMobileNavOpen = false;
    };

    toggle.addEventListener('click', openMenu);
    if (closeBtn) closeBtn.addEventListener('click', closeMenu);
    if (overlay) overlay.addEventListener('click', closeMenu);
  }

  /* ==========================================================================
     6. Accordions (PDP & FAQ)
     ========================================================================== */
  function initAccordions() {
    $$('.accordion-trigger').forEach(trigger => {
      trigger.addEventListener('click', () => {
        const item = trigger.closest('.accordion-item');
        if (item) {
          const isOpen = item.classList.contains('is-open');
          // Optional: close other siblings
          const parent = item.parentElement;
          if (parent && parent.classList.contains('accordion-single-open')) {
            $$('.accordion-item', parent).forEach(sibling => sibling.classList.remove('is-open'));
          }
          item.classList.toggle('is-open', !isOpen);
        }
      });
    });
  }

  /* ==========================================================================
     7. PDP Gallery Thumbnail Switcher
     ========================================================================== */
  function initPDPGallery() {
    const mainImg = $('.pdp-main-image');
    const thumbs = $$('.pdp-thumb');

    if (!mainImg || thumbs.length === 0) return;

    thumbs.forEach(thumb => {
      thumb.addEventListener('click', () => {
        thumbs.forEach(t => t.classList.remove('is-active'));
        thumb.classList.add('is-active');
        const newSrc = thumb.getAttribute('data-full-src') || thumb.getAttribute('src');
        mainImg.style.opacity = '0.3';
        setTimeout(() => {
          mainImg.setAttribute('src', newSrc);
          mainImg.style.opacity = '1';
        }, 150);
      });
    });
  }

  /* ==========================================================================
     8. PDP Variant Selection (Size, Color & Qikink Compatibility)
     ========================================================================== */
  function initPDPVariants() {
    const sizeBtns = $$('.size-option-btn');
    const selectedVariantInput = $('#selected-variant-id');
    const pdpPrice = $('.pdp-price');

    if (sizeBtns.length === 0) return;

    sizeBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        sizeBtns.forEach(b => b.classList.remove('is-selected'));
        btn.classList.add('is-selected');

        const variantId = btn.getAttribute('data-variant-id');
        const price = btn.getAttribute('data-price');

        if (selectedVariantInput && variantId) {
          selectedVariantInput.value = variantId;
        }

        if (pdpPrice && price) {
          pdpPrice.textContent = formatMoney(Number(price));
        }
      });
    });

    // Handle PDP Add To Bag form submit
    const pdpForm = $('#pdp-add-form');
    if (pdpForm) {
      pdpForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const variantId = selectedVariantInput ? selectedVariantInput.value : pdpForm.querySelector('input[name="id"]')?.value;
        const qtyInput = pdpForm.querySelector('input[name="quantity"]') || { value: 1 };
        const addBtn = pdpForm.querySelector('button[type="submit"]');

        if (!variantId) {
          alert('Please select a size before adding to bag.');
          return;
        }

        await window.JatayuCart.add(variantId, qtyInput.value || 1, addBtn);
      });
    }
  }

  /* ==========================================================================
     9. Quick Add Buttons
     ========================================================================== */
  function initQuickAddButtons() {
    $$('.quick-add-btn').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        e.preventDefault();
        e.stopPropagation();
        const variantId = btn.getAttribute('data-variant-id');
        if (variantId) {
          await window.JatayuCart.add(variantId, 1, btn);
        }
      });
    });
  }

})();
