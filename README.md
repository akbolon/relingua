# Relingua

Relingua is a Next.js application for streaming curated public-domain world cinema from the Internet Archive. It includes email and Google sign-in, Stripe subscriptions at twenty U.S. dollars per month, and a complimentary tier of one film per calendar month without a subscription. Subtitles are delivered as timed JSON with per-word English glosses (hover a word to see the gloss). The UI uses a glass-style layout with light and dark themes.

## Requirements

- Node.js 20 or newer
- npm

## Setup

1. Copy `.env.example` to `.env` and fill in values.

2. Generate an auth secret (example):

   `openssl rand -base64 32`

3. Create a SQLite database and Prisma client:

   `npx prisma db push`

4. Install dependencies:

   `npm install`

5. Google OAuth (for “Continue with Google”):

   - In Google Cloud Console, create OAuth client credentials (Web application).
   - Authorized JavaScript origin: `http://localhost:3000` (and your production origin).
   - Authorized redirect URI: `http://localhost:3000/api/auth/callback/google`.
   - Set `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` in `.env`.

6. Stripe (subscriptions):

   - Create a Product with a recurring price of twenty U.S. dollars per month.
   - Copy the Price id into `STRIPE_PRICE_ID`.
   - Set `STRIPE_SECRET_KEY`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, and `STRIPE_WEBHOOK_SECRET`.
   - For local webhook testing: `stripe listen --forward-to localhost:3000/api/stripe/webhook`, then paste the signing secret into `STRIPE_WEBHOOK_SECRET`.

7. Run the dev server:

   `npm run dev`

Open `http://localhost:3000`. Register an account, sign in, and use **Library** to open a title. Use **Account** to start checkout or manage billing.

### Developer catalog access

- Set **`DEV_UNLIMITED_EMAILS`** in `.env` to a comma-separated list of emails that may stream the full catalog without a subscription (no one-film monthly cap). Useful for staging or `next start` where `NODE_ENV` is `production`.
- In **`npm run dev`** only (`NODE_ENV=development`), the account **`akbolon@gmail.com`** is also granted this access without env configuration.

## Subtitles

Cue times in `public/subtitles/*.json` are tuned for each Internet Archive file; adjust if a source file changes.

## Video URLs

Film download URLs and file names were checked against Internet Archive metadata. If a mirror changes, update `src/lib/movies.ts` (see `iaFile` helper).

## License

This project scaffolding is provided as-is for local use. Films are hosted by the Internet Archive; verify rights and terms on each item page before redistribution.
