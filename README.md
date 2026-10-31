# EXLS

ERP EXLS

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Supabase

Set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` in `.env` (see `.env.example`). The Supabase SSR clients are available from `lib/supabase/client.ts` in Client Components and `lib/supabase/server.ts` in Server Components, Server Actions, and Route Handlers. The root `proxy.ts` refreshes authentication cookies; use `getAuthenticatedUser` from `lib/supabase/auth.ts` when server code needs the verified current user.

For a new database, run `supabase/migrations/20261031130000_create_erp_tables.sql` once in the Supabase SQL Editor. It creates the 18 application tables, their relations and indexes, enforces enum values with PostgreSQL `CHECK` constraints, and enables Row Level Security without adding client policies. If you already ran the earlier version of this table migration, run `supabase/migrations/20261031150000_add_enum_constraints.sql` once instead; do not rerun the table-creation migration.

Prisma 8 stores these enums as text columns and enforces their allowed values with database `CHECK` constraints (not native PostgreSQL `CREATE TYPE` enums). RLS denies direct `anon`/`authenticated` API access until appropriate policies are added; the application accesses ERP data through its server-side Prisma connection. Do not put a Supabase secret or service-role key in a `NEXT_PUBLIC_` variable. Define policies for any table or Storage bucket that should be exposed through the publishable key.

Email/password authentication is available at `/auth/sign-in` and `/auth/sign-up`. Configure the Supabase Auth email redirect allowlist to include your application's `/auth/callback` URL and enable email/password sign-in. Email confirmation, password recovery, and account password changes are supported. Users can optionally enable TOTP in `/account`; enabled factors are challenged after sign-in and protected account access requires the second factor. Enforce any additional MFA requirements for database access in Supabase RLS policies as well.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
