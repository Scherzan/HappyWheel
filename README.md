# HappyWheel 🎡

A motivational reward lottery — spin a lucky wheel to win a small reward. Built as
an installable Progressive Web App (PWA) with **Vite**, **React** (TypeScript), and
**vite-plugin-pwa**.

## How it works

Press **Get Reward** to spin the wheel. Unlike a typical "pick a random prize" app,
HappyWheel decides the outcome the way a real prize wheel does — through physics:

1. Each spin draws a random **duration** between **2 and 5 seconds**.
2. Each spin draws a random **speed** between **10 and 30 rounds per second**.
3. The total rotation is `speed × duration × 360°`. The wheel eases out (decelerates)
   to a smooth stop over the chosen duration.
4. Whichever segment comes to rest under the pointer at the top is your reward.

Because the landing spot is determined entirely by the random speed and duration,
the reward is never picked directly — it falls out of where the wheel actually stops.

## Rewards

The wheel has **seven** segments:

| Segment | Reward |
|---------|--------|
| 🎉 | Supi gemacht! |
| 📸 | Send a selfie |
| 🤗 | Get a praise from your buddy |
| 💰 | 2€ personal use |
| ☕ | Coffee outside |
| 🏦 | 5€ Gemeinschaftskasse |
| 🃏 | Joker — choose any reward you like! |

The **Joker** is a wildcard: land on it and you may pick whatever reward you fancy.

## Getting Started

```bash
npm install
npm run dev
```

Then open the printed local URL in your browser.

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start the development server with HMR |
| `npm run build` | Type-check and build for production |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run ESLint |

## Tech notes

- The wheel is a single inline SVG; its seven segments and emoji labels are generated
  from the `REWARDS` array, so adding or changing a reward updates the wheel automatically.
- PWA support (installable, offline-capable) is provided by `vite-plugin-pwa`.
- The app is configured to deploy under the `/HappyWheel/` base path (see `vite.config.ts`)
  and ships via GitHub Pages (`.github/workflows/deploy.yml`).
