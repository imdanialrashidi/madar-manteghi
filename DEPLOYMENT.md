# Deployment

The site is **static-first**: no server, no database, no runtime API. The build
produces a `dist/` directory that any static host can serve.

Nothing in this repository is provider-specific. The same source deploys to
GitHub Pages, Cloudflare Pages, Netlify, or an object store.

---

## How the base path works

Astro is configured with `base` and `site`:

```js
// astro.config.mjs
const basePath = (process.env.BASE_PATH ?? '').replace(/\/$/, '');
const site = process.env.SITE_URL ?? 'https://imdanialrashidi.github.io';
```

| Deployment | `BASE_PATH` | Resulting URL |
|---|---|---|
| Custom domain / root host | *(empty)* | `https://example.com/lessons` |
| GitHub Pages project site | `/physics2` | `https://user.github.io/physics2/lessons` |
| Sub-path on a shared host | `/courses/calculus` | `https://host/courses/calculus/lessons` |

Two things must carry the prefix:

1. **Assets** — Astro handles these automatically.
2. **Internal links** — Astro does **not** rewrite `<a href>` strings you write
   yourself. Every internal link therefore goes through `withBase()` in
   `src/lib/url.ts`.

> This is the most common way a project-site deployment breaks: the build
> succeeds, the homepage renders, and every navigation link 404s. Always build
> with `BASE_PATH` set and verify, as shown below.

---

## GitHub Pages

`.github/workflows/deploy.yml` builds and publishes on every push to `main`.

This repo serves `https://madar-manteghi.danialrashidi.ir` at the root.
The origin (`SITE_URL`) and root base path (`BASE_PATH: ""`) are fixed in the
workflow and as code defaults, so **no repository variables are needed**.
A plain `npm run build` with no env produces the production output.

### Custom domain (`madar-manteghi.danialrashidi.ir`)

DNS already points at GitHub Pages (`CNAME madar-manteghi.danialrashidi.ir → imdanialrashidi.github.io`).
Everything else lives in the repo:

1. `public/CNAME` contains exactly `madar-manteghi.danialrashidi.ir` (one line,
   no protocol). Astro copies it to `dist/CNAME` on every build.
2. The workflow hardcodes `BASE_PATH: ""` (root serve) and
   `SITE_URL: https://madar-manteghi.danialrashidi.ir` (canonical + sitemap origin).
3. `astro.config.mjs` and `src/config/site.ts` default to the same origin with
   an empty base path, so local builds match CI with zero env.

The only clicks left are in GitHub (cannot be stored in code):

1. Repository **Settings → Pages → Build and deployment → Source: GitHub Actions**.
2. Repository **Settings → Pages → Custom domain**: enter `madar-manteghi.danialrashidi.ir`,
   save, then **Enforce HTTPS** once the certificate is issued.
3. Push to `main` and wait for the `deploy` workflow to go green.

If Pages still shows 404 after a green deploy, it is almost always one of the
two clicks above (wrong Source, or the custom domain not saved yet) — the
build itself needs no variables.

The workflow fails the build if content validation finds a problem, so a broken
course never reaches production.

---

## Cloudflare Pages

**Settings → Builds & deployments**

| Field | Value |
|---|---|
| Build command | `npm run build` |
| Build output directory | `dist` |
| Node version | `22` (set `NODE_VERSION=22`) |
| Environment variable `BASE_PATH` | leave **empty** for a root domain |
| Environment variable `SITE_URL` | `https://courses.example.com` |

For a course served under a sub-path, set `BASE_PATH` to that prefix (without a
trailing slash).

---

## Local verification of a deployment

Production for this repo is a plain build — no env needed:

```bash
npm run build
npm run validate:links
npm run budgets
cat dist/CNAME   # must print madar-manteghi.danialrashidi.ir
```

(The workflow sets the same `BASE_PATH=""` / `SITE_URL` explicitly, so CI
and local builds match. A sub-path preview can still be built with
`BASE_PATH=/prefix` explicitly set.)

`npm run validate:links` is base-path aware: it strips `BASE_PATH` before
resolving each link against the files in `dist/`.

---

## Adding a course site to a new repository

1. Create an empty repository named after the course, e.g. `physics2`.
2. Copy this template in (or use it as a starting point).
3. Edit `src/config/course.ts`.
4. Replace the content in `src/content/`.
5. Push to `main`. The deploy workflow publishes to
   `https://imdanialrashidi.github.io/physics2/`.

The creator identity (name, website, Telegram) stays identical across all
courses; only the course configuration and content change.