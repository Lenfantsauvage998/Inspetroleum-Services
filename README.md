# Inspetroleum Services

A petroleum services e-commerce platform with a marketplace, order tracking, and Wompi payment integration (PSE, Nequi, cards, Bancolombia).

## Tech Stack

- **Frontend**: React 18 + TypeScript + Vite + Tailwind CSS — hosted on Vercel
- **Backend/DB/Auth**: Supabase (PostgreSQL + RLS + Edge Functions) — free tier
- **Payments**: Wompi (PSE, Nequi, credit/debit cards, Bancolombia transfer)

## Prerequisites

- Node.js 18+
- [Supabase CLI](https://supabase.com/docs/guides/cli) — `npm install -g supabase`
- A [Supabase](https://supabase.com) project (free)
- A [Wompi](https://wompi.co) merchant account (free sandbox)
- A [Vercel](https://vercel.com) account (free)

## Local Development

### 1. Clone and install

```bash
git clone https://github.com/your-org/inspetroleum-services.git
cd inspetroleum-services
```

### 2. Start Supabase locally

```bash
npx supabase start
# Outputs: API URL, anon key, service_role key
npx supabase db push   # Apply migrations
```

### 3. Set up environment variables

```bash
cp frontend/.env.example frontend/.env.local
# Fill in VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY from `supabase start` output
```

### 4. Seed the database

Run the seed SQL in Supabase Studio (http://localhost:54323) or:
```bash
npx supabase db seed
```

This creates:
- Admin user: `admin@inspetroleum.com` / `Admin123!`
- Regular user: `user@inspetroleum.com` / `User123!`
- 10 sample services across all categories

### 5. Run the frontend

```bash
cd frontend
npm install
npm run dev
# Opens http://localhost:5173
```

### 6. Run Edge Functions locally (optional)

```bash
npx supabase functions serve
```

## Environment Variables

### Frontend (`frontend/.env.local`)

| Variable | Description |
|---|---|
| `VITE_SUPABASE_URL` | Your Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Supabase anon/public key |
| `VITE_WOMPI_PUBLIC_KEY` | Wompi public key (sandbox: `pub_test_...`) |

### Supabase Edge Function Secrets

Set via `npx supabase secrets set KEY=value`:

| Secret | Description |
|---|---|
| `WOMPI_PRIVATE_KEY` | Wompi private key |
| `WOMPI_EVENTS_SECRET` | Wompi webhook events secret |
| `SUPABASE_SERVICE_ROLE_KEY` | Auto-available in Edge Functions |

## Deployment

### Frontend → Vercel

```bash
# Connect repo to Vercel and set env vars in dashboard
# Or use CLI:
npx vercel --prod
```

### Edge Functions → Supabase

```bash
npx supabase functions deploy create-order
npx supabase functions deploy initiate-payment
npx supabase functions deploy wompi-webhook
```

## Features

- Attractive landing page (Baker Hughes-inspired)
- Marketplace with category filters and price range
- Cart with quantity controls (persisted)
- Checkout with PSE, Nequi, card, and Bancolombia payment methods
- User dashboard: order history and status tracking
- Admin dashboard: order management, services CRUD, user management
- Role-based access control (user / admin)
- Secure: RLS, JWT auth, HMAC webhook verification, security headers
