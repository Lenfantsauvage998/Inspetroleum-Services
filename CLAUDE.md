# Inspetroleum Services — CLAUDE.md

## Project Overview
Petroleum services e-commerce platform built for a Colombian market. Users can browse and purchase industrial/oilfield services. Admins manage orders, users, and the service catalog.

## Tech Stack
| Layer | Technology |
|---|---|
| Frontend | React 19 + TypeScript + Vite 8 + Tailwind CSS 4 |
| Backend | Supabase (PostgreSQL 15 + Auth + RLS + Edge Functions) |
| State | Zustand (auth/cart) + TanStack React Query (server data) |
| Routing | React Router 7 |
| Payments | Wompi (PSE, Nequi, Bancolombia, Card) |
| Hosting | Vercel (frontend) + Supabase Cloud (backend) |
| Icons | Lucide React |
| Sanitization | DOMPurify |

## Repository Structure
```
Inspetroleum-Services/
├── frontend/                  # React SPA
│   ├── src/
│   │   ├── components/
│   │   │   ├── cart/          # Cart drawer & items
│   │   │   ├── landing/       # Landing page sections
│   │   │   ├── layout/        # Navbar, Footer
│   │   │   ├── marketplace/   # Service cards, filters
│   │   │   └── ui/            # Reusable primitives (Spinner, etc.)
│   │   ├── contexts/
│   │   │   └── AuthContext.tsx
│   │   ├── hooks/             # useServices, useOrders, useAdminData
│   │   ├── lib/
│   │   │   └── supabase.ts    # Supabase singleton client
│   │   ├── pages/
│   │   │   ├── auth/          # Login / Register
│   │   │   ├── dashboard/     # UserDashboard, AdminDashboard
│   │   │   ├── Landing.tsx
│   │   │   ├── Marketplace.tsx
│   │   │   ├── Checkout.tsx
│   │   │   ├── CheckoutSuccess.tsx
│   │   │   ├── CheckoutFailed.tsx
│   │   │   └── NotFound.tsx
│   │   ├── services/          # API call functions (auth, services, orders, payments, admin)
│   │   ├── store/             # authStore.ts, cartStore.ts (Zustand)
│   │   └── types/             # Shared TypeScript types
│   ├── .env.local             # ← local secrets (never commit)
│   └── vite.config.ts
├── supabase/
│   ├── functions/
│   │   ├── create-order/      # Edge Function: creates order + items
│   │   ├── initiate-payment/  # Edge Function: calls Wompi API
│   │   └── wompi-webhook/     # Edge Function: receives Wompi callbacks
│   ├── migrations/
│   │   └── 001_initial.sql    # Full schema + RLS + helper functions
│   └── config.toml
└── vercel.json
```

## Routes
| Path | Component | Access |
|---|---|---|
| `/` | Landing | Public |
| `/marketplace` | Marketplace | Public |
| `/auth` | AuthPage | Public |
| `/checkout` | Checkout | Authenticated |
| `/checkout/success` | CheckoutSuccess | Public |
| `/checkout/failed` | CheckoutFailed | Public |
| `/dashboard` | UserDashboard | Authenticated |
| `/admin` | AdminDashboard | Admin only |

## Database Schema (Supabase / PostgreSQL)
- **profiles** — extends `auth.users`; has `role` field (`'user'` | `'admin'`)
- **services** — product catalog; `category`, `price`, `is_active`, `features[]`
- **orders** — status: `PENDING → PROCESSING → COMPLETED | CANCELLED`
- **order_items** — line items linking orders ↔ services (snapshot price)
- **payments** — Wompi gateway records; status: `PENDING → APPROVED | DECLINED | VOIDED | ERROR`

### RLS & Admin Check
All tables have RLS enabled. Admin policies use a `SECURITY DEFINER` function to avoid infinite recursion:
```sql
-- Safe admin check — use this in all policies, never query profiles directly inside a profiles policy
SELECT public.is_admin();
```

### Useful Admin SQL
```sql
-- Promote a user to admin
UPDATE public.profiles SET role = 'admin'
WHERE id = (SELECT id FROM auth.users WHERE email = 'EMAIL_HERE');

-- Manually confirm email
UPDATE auth.users SET email_confirmed_at = NOW(), confirmed_at = NOW()
WHERE email = 'EMAIL_HERE';

-- Check all users and roles
SELECT p.id, u.email, p.name, p.role, p.created_at
FROM public.profiles p JOIN auth.users u ON u.id = p.id;
```

## Environment Variables

### Frontend — `frontend/.env.local`
```env
VITE_SUPABASE_URL=https://<ref>.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
VITE_WOMPI_PUBLIC_KEY=pub_test_...
```

### Supabase Edge Function Secrets
Set via `npx supabase secrets set KEY=value`:
```
WOMPI_PRIVATE_KEY      # prv_test_... (sandbox) or prv_prod_...
WOMPI_EVENTS_SECRET    # webhook HMAC secret from Wompi dashboard
FRONTEND_URL           # https://your-domain.com (defaults to localhost:5173)
```
`SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are auto-injected by Supabase into Edge Functions.

## Common Dev Commands
```bash
# Frontend dev server (run from /frontend)
npm run dev              # http://localhost:5173

# Frontend production build
npm run build

# Lint
npm run lint

# Deploy Edge Functions (from project root)
npx supabase functions deploy create-order
npx supabase functions deploy initiate-payment
npx supabase functions deploy wompi-webhook

# List Supabase secrets
npx supabase secrets set KEY=value
```

## Color Palette
| Token | Hex | Usage |
|---|---|---|
| Primary | `#8DBF2E` | Buttons, highlights |
| Primary Dark | `#6FA12A` | Hover states |
| Primary Light | `#A6CE39` | Accents |
| Primary Deeper | `#4F7F1F` | Dark sections |
| Background | `#F2F2F2` | Page background |
| Text | `#333333` | Body text |
| Black | `#000000` | Headings |

Font: **Poppins** (sans-serif)

## Key Architectural Decisions
- **No Express/Node backend** — all server logic lives in Supabase Edge Functions (Deno runtime)
- **RLS as the security layer** — every table is row-level secured; admin bypass via `public.is_admin()` SECURITY DEFINER function
- **Zustand for client state** (auth session, cart) — React Query for all server/async data
- **Wompi sandbox** is free; switch `WOMPI_BASE` in `initiate-payment/index.ts` from `sandbox.wompi.co` to `production.wompi.co` when going live
- **DOMPurify** used to sanitize any user-generated content before rendering

## Known Issues & Gotchas
- **RLS recursion**: Never add a SELECT policy on `profiles` that queries `profiles` directly. Always use `public.is_admin()`.
- **Email confirmation**: For local/test environments, either disable "Confirm email" in Supabase Auth settings or run the manual SQL confirm above.
- **Wompi keys**: `pub_test_` / `prv_test_` for sandbox; `pub_prod_` / `prv_prod_` for production. Do not mix them.
- **Edge Functions cold start**: First call after inactivity may be slow (~1-2s). Expected behavior.
- **Cart persistence**: Cart state is in-memory (Zustand). Refreshing the page clears it — this is intentional for the current version.
