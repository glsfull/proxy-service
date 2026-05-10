# WB Analytics Frontend

Nuxt 4 + Nuxt UI frontend for Wildberries analytics workflows. The app includes authentication, profile setup, marketplace connections, analytics dashboards, support tickets, admin screens, and server API routes.

The previous marketplace label generator remains available at `/labels`.

## Requirements

- Node.js 22+ recommended
- npm 11+

## Commands

```bash
npm install
npm run dev
npm test
npm run typecheck
npm run build
npm run baklog
```

`npm run lint` requires a Node runtime with `Object.groupBy` support.

## Documentation

- [Backlog](docs/Backlog.md)
- [API backlog](docs/Backlog-api.md)
- [Roadmap](docs/Roadmap.md)
- [WB API research plan](docs/WB_API_Research_Plan.md)
- [Label generator scenario](docs/barcode-dashboard.md)
- [Label generator user guide](docs/user-guide.md)
- [Label generator feature description](docs/feature-description.md)

Root [`baklog.md`](../baklog.md) contains the current and planned work summary, updated by `npm run baklog`.
