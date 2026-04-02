# FishPosts

AI-powered meme generator with a full Windows 98 desktop experience.

## Features

- **Win98 Boot Sequence** - BIOS POST with fish-themed hardware detection, branded loading screen, and login dialog
- **9 Meme Modes** - Site Roast, Pitch Deck Roast, Code Roast, Tweet Dunks, Hot Takes, Fish Facts, Shower Thoughts, Conspiracy Theories, Motivational Quotes
- **Draggable Windows** - Win98-style window management with minimize, maximize, and close
- **CRT Monitor Effect** - Toggle scanlines and vignette overlay
- **Fullscreen Mode** - Immersive desktop experience
- **Start Menu** - User profile header, mode switching, and restart option
- **Recent Memes Gallery** - Browse previously generated memes
- **Sparkle Cursor Trail** - Because why not

## Tech Stack

- Next.js 16 / React 19
- TypeScript
- Tailwind CSS 4
- TinyFish WebAgent (AI meme generation)

## Getting Started

```bash
cd fishposts
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the desktop.

## Deployment

Deployed on Railway via Dockerfile. Requires `TINYFISH_SECRET` environment variable.
