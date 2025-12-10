# Evergreen Systems Website

A Next.js website for Evergreen Systems, built with TypeScript, Tailwind CSS, and shadcn/ui.

## Tech Stack

- **Next.js 16** - React framework with App Router
- **TypeScript** - Type safety
- **Tailwind CSS 3** - Utility-first CSS framework
- **shadcn/ui** - High-quality component library
- **Lucide React** - Icon library

## Project Structure

```
evergreenlabs/
├── src/
│   ├── app/
│   │   ├── (public)/
│   │   │   └── page.tsx          # Public landing page
│   │   ├── admin/
│   │   │   ├── layout.tsx        # Admin layout shell
│   │   │   └── page.tsx          # Admin dashboard placeholder
│   │   ├── layout.tsx            # Root layout
│   │   └── globals.css           # Global styles + Tailwind
│   ├── components/
│   │   └── ui/                   # All shadcn/ui components
│   └── lib/
│       └── utils.ts              # Utility functions (cn helper)
├── public/                       # Static assets
├── components.json               # shadcn configuration
├── tailwind.config.js            # Tailwind configuration
└── package.json
```

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up environment variables (see [Environment Variables](#environment-variables) below)

3. Run the development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Routes

- `/` - Public landing page (scrollable, single page)
- `/admin` - Admin dashboard (empty shell, ready for future development)

## shadcn/ui Components

All shadcn/ui components have been installed and are available in `src/components/ui/`. You can import and use them directly:

```tsx
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
```

## Path Aliases

- `@/*` - Points to `src/*`
- `@/components/*` - Components directory
- `@/lib/*` - Utility functions and helpers

## Environment Variables

Create a `.env.local` file in the root directory with the following variables:

### Required

- `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Your Supabase anonymous key
- `SUPABASE_SERVICE_ROLE_KEY` - Your Supabase service role key (used for public analytics tracking to bypass RLS)

### Bunny CDN (Required for file uploads)

- `BUNNY_STORAGE_ZONE` - Your Bunny CDN storage zone name
- `BUNNY_STORAGE_PASSWORD` - Your Bunny CDN storage access key/password
- `BUNNY_PULL_ZONE_URL` - Your Bunny CDN pull zone URL (e.g., `https://yourdomain.b-cdn.net` or `yourdomain.b-cdn.net`)
- `BUNNY_STORAGE_HOSTNAME` (optional) - Bunny storage hostname, defaults to `storage.bunnycdn.com`

Example `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
BUNNY_STORAGE_ZONE=your-storage-zone
BUNNY_STORAGE_PASSWORD=your-storage-password
BUNNY_PULL_ZONE_URL=https://yourdomain.b-cdn.net
```

## Next Steps

- Add content to the landing page sections
- Implement admin section features
- Configure environment variables as needed
- Set up deployment pipeline

## Cache busting, CDN, and deploy checks

- HTML/SSR responses are forced to revalidate (`Cache-Control: no-store, must-revalidate, max-age=0`) so content updates show immediately.
- Built assets (`/_next/static/**`, images, fonts, CSS) are cacheable long-term (`Cache-Control: public, max-age=31536000, immutable`) and are content-hashed by Next.js. No action needed beyond normal builds.
- CDN alignment: ensure Bunny respects origin cache headers. If Bunny overrides them, set an origin shield rule or disable custom TTLs for HTML/API; keep long TTL for hashed assets only.
- On deploy: trigger a Bunny purge for the site (or at least HTML routes) so edge nodes drop any stale cached HTML/API. Hashed assets usually do not need purging.
- Post-deploy mobile check: load the site, then hard-refresh/close-reopen to confirm fresh content; for stubborn mobile caches, clear site data in browser settings and retry.
