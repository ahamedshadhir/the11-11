# 11-11

Storefront captured from the live Qatar shop at the11-11.com: categories, catalogue, QAR prices, cart, wishlist, checkout and admin.

Wine `#420e15`, gold `#be923b`, cream `#f6f3ee`.

## Stack

TanStack Start · React 19 · Tailwind v4 · Better Auth · Postgres (Neon on Vercel, PGLite in preview)

## API

`GET /api/catalog` returns categories and products. Orders, checkout and SkipCash stay on signed-in server functions. Auth is `/api/auth/*`.

## Deploy

Publish on Vercel. The database is provisioned with the app (`DATABASE_URL`). Do not commit secrets.
