# Voltora Store

E-commerce store for Exotech MPPT solar charge controllers and battery chargers.

The project is split into two repositories:

| Part | Stack | Repository / folder |
|---|---|---|
| Storefront (this repo) | Next.js 16 (App Router) · Tailwind v4 · shadcn/ui · Motion · Zustand | `Shahzaib` |
| Backend & admin dashboard | Strapi 5 · GraphQL · PostgreSQL (Docker) | `Shahzaib-backend` (separate repo, see its README) |

```bash
# 1. backend — in the backend repo
pnpm install && pnpm db:up && pnpm develop   # http://localhost:1337/admin
pnpm seed                                    # first run only

# 2. storefront — in this repo (another terminal)
cp .env.example .env.local   # STRAPI_URL + REVALIDATE_SECRET (same value as the backend's .env)
pnpm install && pnpm dev     # http://localhost:3000
```

Without `STRAPI_URL` the storefront falls back to the bundled mock catalogue (`src/data`), so the UI still runs on its own.

## Rebranding / theme

| What | Where |
|---|---|
| Store name, announcements, contact, WhatsApp, socials, shipping rules, trust badges | **Strapi → Store settings** (fallbacks in `src/config/site.ts`) |
| Colors (light + dark), radius, store tokens (`--sale`, `--rating`, `--brand-accent`…) | `:root` / `.dark` in `src/app/globals.css` |
| Fonts | `src/app/layout.tsx` (`next/font`) |
| Logo | `src/components/common/logo.tsx` (placeholder wordmark) |

Light/dark/system theming uses `next-themes`; the toggle is in the header.

## Project layout

```
src/
  app/(store)/        pages: home, shop, category/[slug], product/[slug], search, cart,
                      checkout, wishlist, compare, account, login/register, about, contact, faq, policies
  app/(store)/track-order   guest order tracking
  app/actions/        server actions → Strapi GraphQL (checkout, coupons, auth, reviews, contact, newsletter)
  app/api/products    route handler for client-side lookups (instant search, wishlist, compare)
  app/api/revalidate  webhook target — Strapi publishes → cached pages refresh
  components/
    ui/               shadcn/ui primitives (new-york-v4)
    layout/           announcement bar, header, mega menu, search dialog, footer, floating widgets
    product/          card, gallery, purchase panel, quick view, carousel, tabs…
    shop/             filters, toolbar, results, pagination (URL-driven)
    home/             hero, flash sale + countdown, tabs, promos, stats, marquee, testimonials
    motion/           Reveal/Stagger, AnimatedCounter, Marquee, fly-to-cart
  lib/api/            data layer: strapi.ts (GraphQL) or mock.ts, chosen by STRAPI_URL
  lib/strapi/         GraphQL client (server-only), media URLs
  lib/session.ts      customer session (Strapi JWT in an httpOnly cookie)
  lib/site.ts         store settings from Strapi (+ SiteProvider for client components)
  stores/             zustand: cart, wishlist/compare/recently-viewed (persisted), UI state
  types/              domain types shaped like Strapi v5 responses
  data/               mock catalogue + static content (also the source for the backend's data/ seed)
public/products/      client product photos (backgrounds removed, WebP) — move to Strapi media later
public/manuals/       downloadable user manuals linked from product pages
docs/                 source material from the client (photos + Exotech MPPT manual)
```

## How the storefront uses Strapi

- **Catalogue & content** are read server-side over GraphQL and cached (5 min); Strapi's webhook calls `/api/revalidate` so published edits appear immediately.
- **Checkout** sends only product ids + quantities to the `placeOrder` mutation; prices, stock, coupons and shipping are computed in Strapi.
- **Accounts**: register / sign in with a password or an emailed 6-digit code; the JWT is kept in an httpOnly cookie. `/account` has Orders, Profile (name, phone, change password) and Addresses tabs. Checkout pre-fills from the default address and offers saved addresses. The cart and wishlist are saved to the account (`AccountSync`) and merged in on sign-in. Guests can check out and use `/track-order`. Password reset: `/forgot-password` → email → `/reset-password`.
- **Advance payments**: bank / wallet orders show the store's payment accounts (success page, confirmation email, order cards) and let the customer submit the transaction ID for verification.
- **Emails** (order confirmation, store alert, status updates, password reset) are sent by Strapi — see the backend repo's README.
- **Rate limiting**: customer actions forward the shopper's IP to Strapi so limits apply per visitor; a 429 shows as "Too many requests — please wait a minute".
- **Reviews** are submitted for moderation and appear once approved (published) in the dashboard.

## Notes

- Filters, sorting, view mode and pagination all live in the URL, so every state is shareable and works with the back button.
- Every animation respects `prefers-reduced-motion` (`MotionConfig reducedMotion="user"` plus CSS fallbacks).
- Prices are placeholders (`Rs. 9,999`) until the client supplies real ones — edit them in Strapi → Product.
- The shadcn components were added from the shadcn GitHub source because `ui.shadcn.com` was unreachable from this machine; `components.json` is set up, so `pnpm dlx shadcn@latest add <component>` works once it is reachable.
