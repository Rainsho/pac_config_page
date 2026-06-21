# PAC

PAC is a private Next.js app for NAS file management and service dashboards. It provides:

- NAS browsing, upload, download, delete, move, and video preview workflows
- Authenticated file operations backed by Next.js API routes
- Service tabs for Droppy, Aria2, Xunlei, and host info
- Server-sent upload/progress updates

The previous Node/React implementation has been archived in `_archive_/`.

## Requirements

- Node.js 20+
- pnpm

## Setup

Install dependencies:

```bash
pnpm install
```

Create local environment config:

```bash
cp .env.local.example .env.local
```

Set at least these values before running outside local development:

```bash
JWT_SECRET=change-me-to-a-random-string
JWT_CODE=change-me-to-your-login-code
```

NAS paths are optional in development. When `NODE_ENV=development`, the app uses `/tmp/nexus-dev/*` paths automatically. In production, configure these if the defaults do not match the host:

```bash
NAS_DIR=/home/rainsho/nas
BRIDGE_DIR=/mnt/modok/bridge
XUNLEI_DIR=/mnt/raind/downloads/bridge
VOID_DIR=/mnt/raind/void
```

## Development

Run the dev server:

```bash
pnpm dev
```

Open http://localhost:3000.

## Production

Build and run:

```bash
pnpm build
pnpm start
```

The app listens on `PORT` when provided, otherwise Next.js defaults to port `3000`.

## Scripts

```bash
pnpm dev      # start Next.js development server
pnpm build    # create production build
pnpm start    # run production server
pnpm lint     # run ESLint
```

## Project Layout

```text
src/app/              Next.js App Router pages and API routes
src/components/       UI components
src/hooks/            Client hooks
src/lib/              Auth, filesystem, DB, SSE, and constants
public/               Static assets
_archive_/            Archived pre-migration app
```
