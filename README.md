# Prasoon Katiyar — portfolio

A scroll-scrubbed liquid-chrome self-portrait, built with Next.js (App Router), TypeScript, Tailwind CSS v4, GSAP and Lenis.

**Live:** https://my-portfolio-two-sigma-88.vercel.app

## 1. Add your frames

The hero plays whatever is inside `public/hero/frames`. Files must be named `frame_0001.jpg`, `frame_0002.jpg`, … (the first one is also the poster, the mobile still and the social preview).

If you only have the video, install ffmpeg and run:

```bash
npm run frames -- path/to/melt.mp4          # 24 fps, 1600px wide (recommended)
npm run frames -- path/to/melt.mp4 30 1920  # smoother but heavier
npm run frames -- melt.mp4 24 1280 1128:568:64:64  # also paint out a corner logo (x:y:w:h in video pixels)
```

Aim for **120–200 frames and under ~25 MB total**. Every frame is held in memory for instant scrubbing, so huge sets hurt low-end laptops. The frame count is never hardcoded: `/api/frames` reads the folder, so re-extracting is all it takes to change the sequence.

## 2. Run it

```bash
npm install
cp .env.example .env.local   # optional, fill in the keys you want (see below)
npm run dev
```

Open http://localhost:3000. Every key is optional: without them the contact form falls back to the visitor's mail app and the counters save to `.data/stats.json`.

## 3. Deploy

1. Push the repo to GitHub. `.gitignore` already keeps `.env*` files (except `.env.example`), `.data/`, `.next/`, `node_modules/` and key/credential files out of the repo. Before your first commit, check `git status` and make sure no `.env` file is listed.
2. Import the repo on vercel.com.
3. Under Project Settings → Environment Variables, add whichever of these you use, then deploy:

| Variable | What it does |
| --- | --- |
| `NEXT_PUBLIC_WEB3FORMS_KEY` | Sends contact form messages straight to your inbox ([web3forms.com](https://web3forms.com)) |
| `UPSTASH_REDIS_REST_URL` | Stores the views and loves counters ([upstash.com](https://upstash.com), free tier) |
| `UPSTASH_REDIS_REST_TOKEN` | Auth token for the Redis database above |

On Vercel, set up Upstash if you want the counters to work: serverless disks are wiped between requests, so the `.data/` file fallback won't keep the numbers.

## Editing content

Everything you'd want to change lives in `lib/content.ts`: the three rolling headlines, About text and stats, the journey timeline, projects (swap in each project's real repo URL; three currently point to your GitHub profile), toolkit, certifications, and your phone number (hidden while empty).

## Contact form

Without any setup, "Send message" opens the visitor's mail app with their message filled in. To have messages delivered straight to your inbox instead, get a free access key at web3forms.com and put it in `.env.local`:

```bash
NEXT_PUBLIC_WEB3FORMS_KEY=your-key
```

On Vercel, add the same variable under Project Settings → Environment Variables.

## Views & loves counters

The counters (`app/api/stats`, `lib/stats-store.ts`) use Upstash Redis when `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` are set. Without those keys they save to `.data/stats.json`, which is git-ignored and only suits local development.

## How the hero works

| Piece | Where |
| --- | --- |
| Single rAF loop (GSAP ticker drives Lenis → ScrollTrigger → hero) | `components/SmoothScroll.tsx`, `components/Hero.tsx` |
| Frame list read from disk | `app/api/frames/route.ts` |
| Preload, poster, 600 ms canvas fade, cross-blended frames, `0.1` lerp + `0.001` snap | `components/Hero.tsx`, `lib/frames.ts`, `lib/canvas.ts` |
| Floating-sculpture cursor tilt (fades out over the first 4 frames) | `components/Hero.tsx` |
| Headlines rolling on a 3D drum, synced to the shared eased progress ref | `components/HeadlineCylinder.tsx`, `lib/hero-progress.ts` |
| Mobile (≤768px) and reduced motion: still frame only, no Lenis | `lib/media.ts`, `.hero-track` in `app/globals.css` |

The page background is sampled from the corners of `frame_0001.jpg` at load, so the scrims, tilt edges and every section below sit in the same studio gray as your video.
