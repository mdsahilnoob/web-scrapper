# Crawlee + PlaywrightCrawler + TypeScript project

This template is a production ready boilerplate for developing with `PlaywrightCrawler`. Use this to bootstrap your projects using the most up-to-date code.

If you're looking for examples or want to learn more visit:

- [Documentation](https://crawlee.dev/js/api/playwright-crawler/class/PlaywrightCrawler)
- [Examples](https://crawlee.dev/js/docs/examples/playwright-crawler)

🏗️ High-Level Repo Structure
```
seo-saas/
├── apps/
│   ├── crawler/          ← Crawlee workers
│   ├── api/              ← Backend API
│   └── web/              ← Dashboard (Next.js)
│
├── packages/
│   ├── seo-core/         ← Shared SEO logic
│   ├── db/               ← Database schema & client
│   ├── config/           ← Shared config
│   └── utils/            ← Shared helpers
│
├── infra/
│   ├── docker/
│   ├── terraform/
│   └── scripts/
│
├── docs/
├── .env.example
├── package.json
└── README.md
```

This is a modular monorepo.
It scales from solo → startup → team.

```
🕷️ apps/crawler/ (MOST IMPORTANT)
apps/crawler/
├── src/
│   ├── index.ts               ← Entry point
│   ├── crawler.ts             ← Crawlee setup
│   │
│   ├── fetchers/
│   │   ├── html.fetcher.ts
│   │   ├── playwright.fetcher.ts
│   │   └── robots.fetcher.ts
│   │
│   ├── routers/
│   │   ├── html.router.ts
│   │   ├── js.router.ts
│   │   └── sitemap.router.ts
│   │
│   ├── parsers/
│   │   ├── html.parser.ts
│   │   ├── meta.parser.ts
│   │   ├── heading.parser.ts
│   │   └── links.parser.ts
│   │
│   ├── audits/
│   │   ├── technical/
│   │   │   ├── broken-links.audit.ts
│   │   │   ├── redirects.audit.ts
│   │   │   ├── indexability.audit.ts
│   │   ├── content/
│   │   │   ├── title.audit.ts
│   │   │   ├── meta.audit.ts
│   │   │   ├── headings.audit.ts
│   │   └── performance/
│   │       ├── ttfb.audit.ts
│   │       └── load-time.audit.ts
│   │
│   ├── scoring/
│   │   ├── score-engine.ts
│   │   └── weights.ts
│   │
│   ├── limits/
│   │   ├── depth.limit.ts
│   │   ├── pages.limit.ts
│   │   └── rate.limit.ts
│   │
│   ├── storage/
│   │   ├── dataset.store.ts
│   │   └── db.store.ts
│   │
│   ├── types/
│   │   └── crawl.types.ts
│   │
│   └── utils/
│       ├── url.utils.ts
│       └── timing.utils.ts
│
└── package.json
```