# AHEA Career Positioning Tool Frontend

Frontend-only Next.js app for the AHEA Career Positioning Tool.

## Stack
- Next.js (App Router)
- TypeScript
- Tailwind CSS
- Zod

## Environment
Create `.env.local` from `.env.example`:

```bash
NEXT_PUBLIC_AHEA_BACKEND_URL=https://api.americanhealthequity.org
NEXT_PUBLIC_AHEA_TOOL_ID=career-positioning
```

## Run
```bash
npm install
npm run dev
```

## Scripts
- `npm run lint`
- `npm run typecheck`
- `npm run test`
- `npm run build`

## Backend dependency
This frontend calls the shared backend only:
- `GET /api/me`
- `POST /api/generate`

No local OpenAI or backend generation routes are included.
