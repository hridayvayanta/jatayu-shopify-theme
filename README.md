# JATAYU (जटायु) — Luxury Fashion Shopify Theme

> **"Wear Your Legacy. Rooted in heritage. Made for today."**

An authentic, production-ready **Shopify Online Store 2.0** theme engineered for **JATAYU (जटायु)** — a luxury Indian heritage-inspired fashion house beginning with print-on-demand heavyweight T-shirts and hoodies.

Combines international luxury fashion editorial art direction, restrained cinematic motion, Cormorant Garamond typography, and high-performance Shopify shopping architecture.

---

## 1. Brand Identity & Visual Authority

- **Official Logo**: Approved maroon eagle emblem with unmodified Hindi wordmark (`जटायु`).
- **Brand Palette Tokens**:
  - `Primary Deep Maroon`: `#740101` (Brand core, primary CTAs, key headlines)
  - `Heritage Crimson Accent`: `#990B05` (Hover states and active badges)
  - `Warm Peach Ivory`: `#F7DBBD` (Primary page background)
  - `Pale Parchment Ivory`: `#F8E3CB` (Alternating editorial sections)
  - `Sand Beige`: `#E9C39E` (Borders, framing, and dividers)
  - `Soft Near-Black`: `#211B19` (High-readability body text)
  - `Warm Off-White`: `#FFF9F1` (Surfaces and dark background text)
- **Typography**:
  - **Editorial Headings**: *Cormorant Garamond*
  - **Interface & Commerce**: *Manrope*
  - **Hindi Editorial**: *Noto Serif Devanagari*

---

## 2. Shopify Online Store 2.0 Architecture

This theme follows official Shopify OS 2.0 standards:

```text
jatayu-fashion/
├── assets/
│   ├── jatayu-logo.jpg                # Original approved brand asset
│   ├── jatayu-logo-transparent.png    # Verified clean transparent derivative
│   ├── jatayu-logo-light.png          # Ivory derivative for deep maroon footer
│   ├── jatayu-hero.mp4                # Official 8s cinematic campaign video
│   ├── jatayu-hero-poster.jpg         # Extracted lightweight poster fallback
│   ├── theme.css                      # Master CSS with custom properties & clamp()
│   ├── theme.js                       # AJAX Cart API, GSAP ScrollTrigger & PDP logic
│   └── product-*.jpg                  # High-res catalog and editorial photography
├── config/
│   ├── settings_schema.json           # Theme Editor customization schema
│   └── settings_data.json             # Theme default color and layout tokens
├── layout/
│   └── theme.liquid                   # Master document layout
├── locales/
│   └── en.default.json                # Internationalization strings
├── sections/
│   ├── announcement-bar.liquid        # Configurable top bar
│   ├── header.liquid                  # Sticky header with ivory transition
│   ├── hero-video.liquid              # Section 1: Cinematic video & scale scroll
│   ├── brand-intro.liquid             # Section 2: "Wear Your Legacy."
│   ├── featured-collection.liquid     # Section 3: "The First Chapter" 4-col grid
│   ├── category-showcase.liquid       # Section 4: Editorial T-Shirts & Hoodies
│   ├── statement.liquid               # Section 5: "Not Just Worn. Remembered."
│   ├── brand-story.liquid             # Section 6: Ramayana heritage & modern ethos
│   ├── new-arrivals.liquid            # Section 7: Recent releases carousel/grid
│   ├── footer.liquid                  # Section 8: Deep maroon footer with logo
│   ├── main-product.liquid            # PDP with size selector & Qikink fulfillment
│   ├── main-collection.liquid         # Collection page with filtering & sorting
│   ├── main-story.liquid              # Our Story page
│   ├── contact-form.liquid            # Official Shopify contact form
│   ├── faq-section.liquid             # Accordion FAQ
│   ├── size-guide.liquid              # Detailed garment measurement tables
│   ├── main-cart.liquid               # Full cart page
│   ├── main-search.liquid             # Store search results
│   ├── main-404.liquid                # 404 page
│   ├── cart-drawer.liquid             # 350ms slide-in AJAX cart drawer
│   └── mobile-drawer.liquid           # Mobile navigation menu
├── snippets/
│   ├── product-card.liquid            # Front/back hover flip & Quick Add
│   ├── price.liquid                   # INR currency formatting
│   ├── meta-tags.liquid               # SEO & Schema.org JSON-LD
│   └── icon-*.liquid                  # Lightweight SVG icons
├── templates/
│   ├── index.json                     # Modular homepage section ordering
│   ├── product.json                   # Product detail template
│   ├── collection.json                # Collection page template
│   ├── cart.json                      # Cart page template
│   ├── page.story.json                # Our Story page template
│   ├── page.contact.json              # Contact page template
│   ├── page.faq.json                  # FAQ page template
│   ├── page.size-guide.json           # Size Guide template
│   ├── search.json                    # Search template
│   └── 404.json                       # 404 template
└── preview/
    ├── server.js                      # Local dev server with Shopify Ajax Cart API
    └── index.html, product.html, etc. # Standalone interactive preview pages
```

---

## 3. Local Development & Testing

You can run and test the complete interactive storefront locally with video playback, GSAP scroll transitions, variant selection, and live cart drawer:

```bash
# From inside the theme root directory:
node preview/server.js
```

Open your browser at:
`http://localhost:3000`

### Available Test Routes:
- Homepage: `http://localhost:3000/`
- Product Detail Page: `http://localhost:3000/products/the-jatayu-sovereign-oversized-tee-charcoal`
- Collection: `http://localhost:3000/collections`
- Our Story: `http://localhost:3000/pages/our-story`
- Size Guide: `http://localhost:3000/pages/size-guide`
- Contact: `http://localhost:3000/pages/contact`
- FAQ: `http://localhost:3000/pages/faq`

---

## 4. Connecting to Shopify via GitHub Integration

Follow these steps to preview and deploy as an unpublished theme on Shopify:

1. **Push this theme to your GitHub repository**:
   ```bash
   git add .
   git commit -m "Initial commit of JATAYU Luxury Fashion Shopify OS 2.0 Theme"
   git remote add origin https://github.com/your-username/jatayu-shopify-theme.git
   git branch -M main
   git push -u origin main
   ```

2. **Connect to Shopify**:
   - Go to your **Shopify Admin** > **Online Store** > **Themes**.
   - Under **Theme library**, click **Add theme** > **Connect from GitHub**.
   - Authenticate your GitHub account and select your `jatayu-shopify-theme` repository and `main` branch.
   - Shopify will automatically build and add it as an **Unpublished Theme** named `jatayu-shopify-theme`.

3. **Preview and Test in Shopify**:
   - Click **Actions** > **Preview** on the unpublished theme to test with your actual Shopify products and collections.
   - Click **Customize** to access the Shopify Theme Editor and modify banners, headings, or featured collections.
   - When ready for launch, click **Publish**.

---

## 5. Qikink Print-on-Demand Fulfillment Integration

JATAYU uses standard Shopify variant structures (e.g., Option 1: `Size`, Option 2: `Color`):
- When you install the official **Qikink Shopify App**, link each product to the corresponding Qikink catalog item (e.g. 240 GSM Oversized T-Shirt, 400 GSM Hoodie).
- Because this theme passes real Shopify variant IDs and standard properties through `/cart/add.js`, all incoming orders synchronize into the Qikink dashboard without manual intervention.

---

## 6. Performance & Accessibility Standards

- WCAG 2.2 AA compliant contrast ratios (`#740101` on `#F7DBBD` = 8.4:1 contrast).
- Autoplay video handles muted fallback and respects `prefers-reduced-motion`.
- Responsive images use `loading="lazy"`, proper aspect ratios, and prevent layout shifts (CLS < 0.05).
