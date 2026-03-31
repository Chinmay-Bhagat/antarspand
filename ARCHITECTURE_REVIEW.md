# Architecture & UX Review — antarspand.com

**Date:** 2026-03-22
**Codebase:** `/Users/chinmay/blog_astro/`
**Live:** https://antarspand.com
**Stack:** Astro 6, static output, GitHub Pages

---

## 1. Architecture Understanding

### Routing

| Route | File | Purpose |
|-------|------|---------|
| `/` | `src/pages/index.astro` | Homepage: hero + slider + articles + about |
| `/blog/[slug]` | `src/pages/blog/[slug].astro` | Dynamic article pages via `getStaticPaths()` |

No other routes exist. Everything is a single-page scroll on the homepage.

### Layout system

Single `Layout.astro` wrapping all pages. Contains header, footer, custom cursor, mobile nav. Pages inject content via `<slot />`.

### Content-UI coupling

Article data flows through Astro Content Collections (clean separation), but the homepage is a monolith — hero, slider, articles, and about section are all hardcoded in one **507-line file** with **250+ lines of inline `<script>`**.

### Key limitation

Zero component extraction. There is one component file (`Welcome.astro`) — an unused Astro default template. Everything lives directly in page files.

---

## 2. UX Failures Mapped to Code

### 2.1 Homepage monolith

- **Where:** `src/pages/index.astro` — 507 lines
- **Why it hurts:** Every edit to the hero risks breaking the slider. Every slider change risks breaking filters. The about section is welded to the article grid. This is a maintenance and iteration bottleneck.
- **Type:** Architecture problem

### 2.2 Two hero CTAs go to the same place

- **Where:** `index.astro:32-33`
  ```html
  <a href="#articles" class="btn-primary">Read Latest</a>
  <a href="#articles" class="btn-ghost">Browse Topics</a>
  ```
- **Why:** Both buttons scroll to `#articles`. "Browse Topics" has no distinct behavior — it's a dead affordance. Confuses users about what action to take.
- **Type:** Design problem

### 2.3 Health Insights slider feels disconnected

- **Where:** `index.astro:38-111`, `global.css:800-915`
- **Why:** The slider sits between the hero and articles with no clear relationship to either. It uses product pitch language (19.8M deaths, $0 monitoring costs) while the site brand is "a blog about engineering." The blog and the startup are fighting for the same page.
- **Type:** Content / product identity problem

### 2.4 No article images or visual hierarchy in cards

- **Where:** `index.astro:127-156`, `global.css:457-550`
- **Why:** Article cards are text-only boxes. The featured card (`card-feat`) spans 2 columns but has no image or visual anchor. Every card looks structurally identical — tag, title, excerpt, meta. On a grid of 8 articles, this creates a wall of text.
- **Type:** Design problem

### 2.5 Article page lacks engagement structure

- **Where:** `[slug].astro:44-47` — the body is just `<Content />` with no wrapping structure
- **Why:** For 12–14 min reads on dense technical content, there's no table of contents, no reading progress bar, no "related articles" section, and no newsletter/CTA at the end. Users drop off after the hero.
- **Type:** Design + architecture problem

### 2.6 Category filter uses opacity hide instead of removing

- **Where:** `index.astro:438-443`
  ```js
  el.setAttribute('aria-hidden', show ? 'false' : 'true');
  ```
- **CSS:** `global.css:488`
  ```css
  .card[aria-hidden="true"] { opacity: .2; pointer-events: none; }
  ```
- **Why:** Filtered-out articles remain visible at 20% opacity. Users see "ghost" cards they can't click. Proper filtering should hide or collapse them.
- **Type:** Design problem

### 2.7 Single 992-line CSS file with dead styles

- **Where:** `public/styles/global.css`
- **Why:** Contains styles for components that don't exist in any page (`.an-grid`, `.ticker-*`, `.hstrip`, `.donut-*`, `.sbar-*`, `.det-*`). These are leftovers from a previous version. ~80 lines of dead CSS ship to every user.
- **Type:** Code hygiene problem

### 2.8 Inline scripts duplicate REDUCED motion check

- **Where:** `Layout.astro:107` and `index.astro:255`
  ```js
  const REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  ```
- **Type:** Code duplication

### 2.9 Canvas animation runs at full viewport resolution

- **Where:** `index.astro:314-317`
  ```js
  w = c.width = window.innerWidth;
  h = c.height = window.innerHeight;
  ```
- **Why:** On a 4K display, this allocates a 3840x2160 canvas and draws 3 waveforms at 60fps across the full width. No DPR capping or resolution scaling. Performance problem on high-DPI screens.
- **Type:** Performance problem

### 2.10 No OG image

- **Where:** `Layout.astro:24-31`
- **Why:** OpenGraph and Twitter card tags exist but have no `og:image` or `twitter:image`. Shared links on social media show no preview image.
- **Type:** SEO / marketing problem

---

## 3. Architecture Rethink

### Proposed folder structure

```
src/
├── components/
│   ├── Hero.astro              # BCG canvas + headline + CTAs
│   ├── InsightsSlider.astro    # Health insights carousel
│   ├── ArticleGrid.astro       # Filter pills + card grid
│   ├── ArticleCard.astro       # Single card (featured vs regular variant)
│   ├── AboutSection.astro      # Author bio + projects
│   ├── ProjectCard.astro       # Single project item
│   ├── ReadingProgress.astro   # Progress bar for article pages
│   ├── TableOfContents.astro   # Auto-generated from headings
│   ├── RelatedArticles.astro   # End-of-article suggestions
│   ├── NewsletterCTA.astro     # Dormant CTA (wire up when product is ready)
│   └── SEO.astro               # OG tags, JSON-LD, canonical
├── layouts/
│   ├── Layout.astro            # Base shell (header, footer, cursor)
│   └── ArticleLayout.astro     # Article-specific (ToC, progress, related)
├── content/
│   └── blog/                   # Markdown stays here
├── pages/
│   ├── index.astro             # Composes: Hero + Slider + ArticleGrid + About
│   ├── blog/
│   │   └── [slug].astro
│   ├── about.astro             # (future) standalone about/team page
│   └── product.astro           # (future) product landing
├── scripts/
│   ├── bcg-canvas.ts           # Extracted canvas animation
│   ├── slider.ts               # Slider logic
│   └── cursor.ts               # Custom cursor
├── content.config.ts
└── styles/                     # Moved from public/ to src/
    ├── tokens.css              # Design tokens only
    ├── base.css                # Reset + typography
    ├── layout.css              # Header, footer, sections
    ├── components.css          # Card, slider, filter, portfolio
    └── article.css             # Article body typography
```

### Component hierarchy

```
Layout.astro
├── SEO.astro (head)
├── header (nav)
├── <slot /> ← index.astro
│   ├── Hero.astro
│   ├── InsightsSlider.astro
│   ├── ArticleGrid.astro
│   │   └── ArticleCard.astro (×8)
│   └── AboutSection.astro
│       └── ProjectCard.astro (×4)
└── footer

ArticleLayout.astro (extends Layout)
├── ReadingProgress.astro
├── article hero
├── TableOfContents.astro
├── <Content />
├── RelatedArticles.astro
└── NewsletterCTA.astro
```

### Routing strategy (future-ready)

```
/                   → Blog homepage (current)
/blog/[slug]        → Article pages (current)
/about              → Standalone about (extracted from homepage)
/product            → Product landing (when ready)
/product/demo       → Demo / waitlist (when ready)
/api/[...]          → API routes (when SSR is enabled)
```

---

## 4. UX-Driven Refactor Plan

### Hero section

- **Split CTAs:** "Read Latest" should link to the most recent article (`/blog/${posts[0].id}`). "Browse Topics" stays at `#articles`.
- **Add a cadence signal** below the description:
  ```html
  <p class="hero-note">8 deep dives · Updated monthly</p>
  ```
- **Cap canvas resolution:** Add DPR limiting (see section 5).

### Navigation

- Add an active state for current section using Intersection Observer on sections to highlight the corresponding nav link.
- Consider making "Connect →" a standalone `/about#connect` link when about is extracted to its own page.

### Article cards

- Add a cover image field to the content schema:
  ```ts
  image: z.string().optional()
  ```
  Even a generated gradient placeholder per category would break the text monotony.
- **Fix the filter** — replace opacity hide with actual hiding:
  ```css
  .card[aria-hidden="true"] {
    display: none;
  }
  ```

### Article page

- **TableOfContents.astro:** Parse rendered HTML headings in `[slug].astro`, render a sticky sidebar ToC on desktop.
- **ReadingProgress.astro:** A thin `--sig` colored bar at the top of the viewport tied to scroll position.
- **RelatedArticles.astro:** Show 2–3 articles from the same category at the bottom.

### Dormant CTAs

Add a `NewsletterCTA.astro` at the end of every article:

```astro
<aside class="newsletter-cta">
  <h3>Stay in the loop</h3>
  <p>New deep dives on BCG, sleep staging, and sensor engineering — straight to your inbox.</p>
  <form><!-- dormant: email input + submit, wired to nothing yet --></form>
</aside>
```

Costs nothing now. Wire to Mailchimp/Buttondown/Resend when ready.

---

## 5. Code Refactoring

### Extract inline scripts

The 250-line `<script>` block in `index.astro` should become separate files in `src/scripts/`. Astro supports `<script src="...">` with bundling.

### Remove dead CSS

These class families in `global.css` have no HTML consumers:

| Lines | Classes | Origin |
|-------|---------|--------|
| 661–669 | `.an-grid`, `.an-card`, `.an-wide`, `.an-full`, `.an-label`, `.an-big`, `.an-unit`, `.an-desc`, `.an-ghost` | Previous analytics grid |
| 672–678 | `.sbar-*` | Stat bars |
| 681–684 | `.donut-*` | Donut chart |
| 687–691 | `.det-*` | Detail list |
| 694 | `.hrv-axis` | HRV sparkline axis |
| 697–704 | `.ticker-*` | Ticker marquee |
| 351–385 | `.hero-strip`, `.hstrip`, `.hstrip-val`, `.hstrip-key` | Hero stat strip |
| 552 | `.card-mini-wave` | Card mini waveform |

**~80 lines of dead CSS** to remove.

### Split the CSS file

992 lines in one file is manageable today but won't scale. Recommended split:

| File | Contents |
|------|----------|
| `tokens.css` | CSS custom properties, font imports |
| `base.css` | Reset, typography, accessibility, cursor |
| `layout.css` | Header, footer, sections, responsive shell |
| `components.css` | Cards, slider, filter pills, portfolio |
| `article.css` | Article body typography and nav |

### Deduplicate REDUCED motion check

```ts
// src/scripts/utils.ts
export const REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
```

### Canvas DPR capping

```ts
function resize() {
  const dpr = Math.min(window.devicePixelRatio, 2);
  w = window.innerWidth;
  h = window.innerHeight;
  c.width = w * dpr;
  c.height = h * dpr;
  c.style.width = w + 'px';
  c.style.height = h + 'px';
  ctx.scale(dpr, dpr);
  bufs = [new Float32Array(w), new Float32Array(w), new Float32Array(w)];
  for (let i = 0; i < w; i++) {
    bufs[0][i] = gens[0].next();
    bufs[1][i] = gens[1].next();
    bufs[2][i] = gens[2].next();
  }
}
```

---

## 6. Future-Proofing for Product

| Need | Prepare now | Add later |
|------|-------------|-----------|
| **Authentication** | Keep Astro static. Structure pages so `/product/*` routes can be SSR while `/blog/*` stays static (Astro hybrid rendering). | Auth provider (Clerk, Auth0, Supabase Auth) + `@astrojs/node` adapter |
| **Dashboard / user data** | Nothing now. Astro serves as marketing + blog. Separate app handles product dashboard. | Subdomain split: `antarspand.com` (marketing/blog) + `app.antarspand.com` (dashboard) |
| **API / ML integration** | Add `src/pages/api/` directory structure. Astro supports API routes with SSR adapter. | FastAPI backend for ML inference, Astro API routes as BFF |
| **Newsletter / waitlist** | Add the dormant CTA component now. | Wire to email service + store subscribers |
| **Content scaling** | Content Collections already handle this well. Add `tags: z.array(z.string())` to schema for multi-tag filtering. | Full-text search via Pagefind (Astro-native, zero-config) |

---

## 7. Top 5 Critical Issues

1. **Homepage monolith** — 507 lines with zero component extraction. Every change is risky. #1 blocker for iteration speed.

2. **No OG image** — Every social share is a blank card. For a site trying to build audience, this is actively harmful.

3. **Dead CSS payload** — ~80 lines of unused styles ship to every user. Minor perf hit, but signals unmaintained codebase.

4. **Canvas perf on HiDPI** — Full-resolution canvas on 4K/Retina screens draws 4x the pixels needed. Will cause frame drops on lower-end devices.

5. **No article engagement structure** — No ToC, no progress bar, no related articles, no CTA. For 12+ min technical articles, this means high bounce rate after the first few paragraphs.

---

## 8. Action Plan

### Immediate (this week)

- [ ] Fix dual CTAs: "Read Latest" → link to newest article
- [ ] Fix filter: `display: none` instead of `opacity: .2`
- [ ] Add `og:image` meta tag (generate a simple branded image)
- [ ] Delete dead CSS (~80 lines)
- [ ] Cap canvas DPR at 2x

### Mid-term (next 2–3 weeks)

- [ ] Extract components: `Hero.astro`, `InsightsSlider.astro`, `ArticleGrid.astro`, `ArticleCard.astro`, `AboutSection.astro`
- [ ] Extract inline scripts to `src/scripts/`
- [ ] Add `ReadingProgress.astro` for article pages
- [ ] Add `RelatedArticles.astro` at bottom of articles
- [ ] Add dormant newsletter CTA component
- [ ] Split `global.css` into modular files

### Long-term (when product direction solidifies)

- [ ] Add `/about` as standalone page, slim down homepage
- [ ] Add Pagefind for full-text search
- [ ] Prepare `/product` route structure
- [ ] Evaluate hybrid SSR for product routes
- [ ] Consider subdomain split for app vs marketing
