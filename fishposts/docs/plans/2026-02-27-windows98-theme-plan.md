# Windows 98 Theme Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Reskin FishPosts from ocean/aquarium theme to a full Windows 98 desktop simulation.

**Architecture:** Replace `globals.css` entirely with Win98 design system (3D borders, teal desktop, taskbar, neon accents). Rewrite `page.tsx` JSX to use Win98 window frames, desktop icons, taskbar, and terminal instead of aquarium. Update `layout.tsx` to remove Nunito font. All existing functionality (dual mode, SSE, localStorage) is preserved — only the visual layer changes.

**Tech Stack:** Next.js 16, React 19, Tailwind CSS v4 (minimal usage — mostly raw CSS for pixel-perfect Win98), TypeScript. No new dependencies — all fonts are system fonts (Comic Sans MS, Impact, Segoe UI, Courier New).

**Reference files:**
- Win98 demo: `fishposts/demo.html` — CSS patterns for 3D borders, window frame, terminal, progress bar, buttons
- Design doc: `fishposts/docs/plans/2026-02-27-windows98-theme-design.md`
- Current page: `fishposts/src/app/page.tsx` (preserve all state logic, handlers, types)
- Current CSS: `fishposts/src/app/globals.css` (replace entirely)

---

### Task 1: Update layout.tsx — Remove Nunito Font

**Files:**
- Modify: `fishposts/src/app/layout.tsx`

**Step 1: Remove Nunito import and variable**

Replace the entire file. Remove the `Nunito` import from `next/font/google`, remove the `nunito` const, remove `className={nunito.variable}` from the html tag. Update the page title to "FishPosts.exe" for the Win98 vibe.

```tsx
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "FishPosts.exe — Paste your URL. Get memed.",
  description:
    "AI reads your website and makes a meme so specific, so accurate, it hurts. Powered by TinyFish Web Agent.",
  openGraph: {
    title: "FishPosts.exe — Paste your URL. Get memed.",
    description:
      "AI reads your website and makes a meme so specific, so accurate, it hurts.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
```

**Step 2: Build check**

Run: `cd fishposts && npm run build`
Expected: Build succeeds (page.tsx will still reference old CSS classes but that's fine — we're replacing everything).

**Step 3: Commit**

```bash
git add fishposts/src/app/layout.tsx
git commit -m "chore: remove Nunito font, update title for Win98 theme"
```

---

### Task 2: Rewrite globals.css — Win98 Design System

**Files:**
- Rewrite: `fishposts/src/app/globals.css` (replace entirely)

This is the largest task. Write the complete CSS file with all Win98 styling. Reference `demo.html` lines 8-493 for the exact 3D border patterns, color values, and component styles.

**Key CSS sections to include (in order):**

1. **Tailwind import + CSS tokens** — `:root` with all `--win-*`, `--neon-*`, `--desktop` tokens
2. **Base/body** — `font-family: 'Comic Sans MS'`, `background: var(--desktop)`, cursor
3. **Desktop layout** — `.desktop` full viewport wrapper, padding for taskbar
4. **Marquee bar** — navy gradient bg, yellow scrolling text, `@keyframes marquee`
5. **Win98 window frame** — `.win-window` with exact 3D border pattern from demo.html:57-65:
   ```css
   border: 2px solid #fff;
   border-top-color: #dfdfdf;
   border-left-color: #dfdfdf;
   border-right-color: #404040;
   border-bottom-color: #404040;
   background: #C0C0C0;
   box-shadow: 4px 4px 0 rgba(0,0,0,0.5), inset 1px 1px 0 #fff;
   ```
6. **Win98 titlebar** — blue gradient, white text, flex row with title + buttons
7. **Win98 titlebar buttons** — min/max/close with exact 3D borders from demo.html:92-117
8. **Win98 body** — padding, overflow
9. **Win98 input** — sunken 3D border (top/left #808080, bottom/right #fff) from demo.html:158-177
10. **Win98 textarea** — same sunken style, resize vertical
11. **Win98 button (.win98-btn)** — raised 3D, Impact font, active state inverts borders (demo.html:199-252)
12. **Win98 tab control** — for mode toggle (URL/Text tabs)
13. **Terminal** — black bg, sunken border, green Courier New text, cursor blink (demo.html:255-294)
14. **Win98 progress bar** — sunken container, `repeating-linear-gradient` navy fill (demo.html:297-326)
15. **Meme frame** — sunken 3D border (demo.html:329-341)
16. **Error dialog** — icon + text row, Segoe UI font
17. **Result title** — Impact font, neon green glow (`text-shadow: 0 0 10px #00FF00, 0 0 20px #00FF00`)
18. **Desktop content grid** — two-column layout at 1024px+
19. **Desktop icons** — 64x64 icon + label, grid layout, hidden below 1024px
20. **Taskbar** — fixed bottom, z-index 50, gray bg, 3D top border, flex row
21. **Start button** — green-ish, bold, raised 3D
22. **Taskbar window buttons** — sunken active state
23. **System tray** — right side, sunken border, clock + icons
24. **Marquee** — `@keyframes marquee { 0% { transform: translateX(100vw); } 100% { transform: translateX(-100%); } }`
25. **Sparkle cursor** — fixed position, `@keyframes sparkle-fade`
26. **Neon glow utilities** — `.neon-pink`, `.neon-cyan`, `.neon-green`, `.neon-yellow`
27. **Hit counter** — black bg, green monospace text, border
28. **Footer** — centered, small gray text
29. **Neon sparkle burst** (replaces confetti) — fixed sparkle elements that fade
30. **How-it-works steps** — Win98 list style (numbered, Segoe UI)
31. **Fish fact status bar** — sunken bar at bottom of window
32. **Sticker wall** — grid of recent memes in sunken frames
33. **Responsive** — `@media (max-width: 1024px)` collapse to single column, hide desktop icons
34. **Scrollbar** — thin, gray Win98 style
35. **Animations** — `blink` (cursor), `marquee` (scroll), `sparkle-fade`, `state-enter`

**Step 1: Write the complete globals.css**

Replace the entire file. Use the demo.html CSS as the source of truth for all Win98 border patterns, but adapt for the component structure in page.tsx.

**Step 2: Commit**

```bash
git add fishposts/src/app/globals.css
git commit -m "feat: rewrite globals.css with Win98 design system"
```

---

### Task 3: Rewrite page.tsx — Static Data and Types

**Files:**
- Modify: `fishposts/src/app/page.tsx` (top section only — types through static data)

**Keep unchanged:**
- `AppState` type
- `InputMode` type
- `ProgressEvent` interface
- `TAGLINES` array (still used for rotating text)
- `FISH_LOGS` array (used in terminal)
- `STATUS_MESSAGES` array
- `EXAMPLE_URLS` array (used as desktop icons now)
- `STEPS` array (used in left window)
- `FISH_FACTS` array (used in status bar)

**Remove:**
- `BUBBLES` array (no aquarium)
- `FLOAT_ITEMS` array (no floating emojis)
- `FISH_GIFS` array (no GIF stickers)
- `PAGE_STICKERS` array (no page stickers)
- `CONFETTI` array (replaced by sparkle burst)
- `AQUARIUM_FISH` array (no aquarium)
- `FloatingElements` component (no floating emojis)

**Add:**
- `SPARKLES` array — emoji characters for cursor trail: `['✦', '✧', '★', '·', '⋆']`
- `NEON_COLORS` array — `['#FF00FF', '#00FFFF', '#FFFF00', '#00FF00']`
- `DESKTOP_ICONS` — remap EXAMPLE_URLS to have icon emojis for desktop shortcut display

**Modify `EXAMPLE_URLS` entries** to add `icon` field for desktop shortcut display:
```ts
const EXAMPLE_URLS = [
  { label: "Stripe", url: "https://stripe.com", icon: "💳" },
  { label: "Notion", url: "https://notion.so", icon: "📝" },
  { label: "Figma", url: "https://figma.com", icon: "🎨" },
  { label: "Vercel", url: "https://vercel.com", icon: "▲" },
  { label: "Linear", url: "https://linear.app", icon: "⚡" },
  { label: "Shopify", url: "https://shopify.com", icon: "🛍️" },
];
```

Remove `emoji` and `color` fields (no longer needed — Win98 doesn't use colored pills).

**Step 1: Update static data section**

Make the changes described above. Keep all state logic, handlers, hooks unchanged.

**Step 2: Commit**

```bash
git add fishposts/src/app/page.tsx
git commit -m "refactor: update static data for Win98 theme"
```

---

### Task 4: Rewrite page.tsx — Sub-Components

**Files:**
- Modify: `fishposts/src/app/page.tsx` (sub-components section)

**Keep unchanged:**
- `IconCopy`, `IconDownload`, `IconRefresh`, `IconCheck` SVG components

**Remove:**
- `FloatingElements` component

**Add new sub-components:**

```tsx
function Win98Window({ title, children, className }: {
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`win-window ${className || ''}`}>
      <div className="win-titlebar">
        <div className="win-title">
          <span>🐟</span> {title}
        </div>
        <div className="win-buttons">
          <button className="win-btn" aria-label="Minimize">_</button>
          <button className="win-btn" aria-label="Maximize">□</button>
          <button className="win-btn" aria-label="Close">×</button>
        </div>
      </div>
      <div className="win-body">
        {children}
      </div>
    </div>
  );
}

function Taskbar({ memeCount }: { memeCount: number }) {
  const [time, setTime] = useState('');

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      }));
    };
    update();
    const interval = setInterval(update, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="taskbar">
      <button className="start-btn">
        <span className="start-flag">🪟</span> Start
      </button>
      <div className="taskbar-windows">
        <button className="taskbar-window-btn taskbar-window-active">
          🐟 fishposts.exe
        </button>
        <button className="taskbar-window-btn">
          📁 recent_memes
        </button>
      </div>
      <div className="system-tray">
        {memeCount > 0 && (
          <span className="tray-item" title={`${memeCount} memes generated`}>
            🔥 {memeCount}
          </span>
        )}
        <span className="tray-item">🐟</span>
        <span className="tray-clock">{time}</span>
      </div>
    </div>
  );
}

function Marquee() {
  return (
    <div className="marquee-bar">
      <div className="marquee-text">
        ★ WELCOME TO FISHPOSTS DOT COM ★ OUR FISH READS YOUR WEBSITE AND MAKES A MEME ★ 100% FREE ★ NO LOGIN ★ POWERED BY A LITERAL FISH BROWSING THE INTERNET ★ FISHPOSTS DOT COM ★
      </div>
    </div>
  );
}
```

**Step 1: Replace sub-components section**

**Step 2: Commit**

```bash
git add fishposts/src/app/page.tsx
git commit -m "feat: add Win98Window, Taskbar, Marquee components"
```

---

### Task 5: Rewrite page.tsx — Main Component Render (Desktop Layer)

**Files:**
- Modify: `fishposts/src/app/page.tsx` (render section of Home component)

**Add to Home component:**

1. **Sparkle trail effect** — `useEffect` that adds mousemove listener, creates/removes sparkle elements
2. **Clock state** already in Taskbar component

**Rewrite the entire return JSX:**

The render structure should be:

```
<div className="desktop">
  <Marquee />

  {/* Desktop icons — visible 1024px+ */}
  <div className="desktop-icons">
    {EXAMPLE_URLS.map(...)} — click fills URL input + switches to URL mode
  </div>

  {/* Desktop content grid — two columns */}
  <div className="desktop-content">

    {/* LEFT: recent_memes.exe window */}
    <Win98Window title="recent_memes.exe" className="win-window-side">
      {/* How it works steps */}
      <div className="win-section-label">How it works:</div>
      <div className="win-steps">
        {STEPS.map(...)} — numbered list, Segoe UI, simple
      </div>
      <hr className="hr98" />
      {/* Recent memes */}
      <div className="win-section-label">Recent memes:</div>
      {recentMemes grid or "No files found." empty state}
      {/* Fish fact in status bar */}
      <div className="win-statusbar">
        {FISH_FACTS[factIdx].emoji} {FISH_FACTS[factIdx].fact}
      </div>
    </Win98Window>

    {/* RIGHT: fishposts.exe window (main) */}
    <Win98Window title="fishposts.exe" className="win-window-main">
      {state === "idle" && (
        <>
          {/* Fishstick GIF + headline */}
          <div style={{textAlign:'center',marginBottom:12}}>
            <img src="sussy-baka.gif" className="win-fishstick" />
          </div>
          <h1 className="impact headline">FISHPOSTS</h1>
          <p className="subhead">{TAGLINES[taglineIdx]}</p>

          {/* Mode tabs */}
          <div className="win-tabs">
            <button className={`win-tab ${inputMode==='url' ? 'active' : ''}`}>🔗 URL</button>
            <button className={`win-tab ${inputMode==='text' ? 'active' : ''}`}>✍️ Text</button>
          </div>

          {/* URL input or textarea */}
          {inputMode === "url" ? (
            <>
              <label className="input-label">Target URL:</label>
              <input className="win-input" ... />
              <div className="examples">
                or try: {EXAMPLE_URLS.map(link)}
              </div>
            </>
          ) : (
            <>
              <label className="input-label">What's the meme about?</label>
              <textarea className="win-input win-textarea" ... />
            </>
          )}

          <button className="win98-btn win98-btn-full" onClick={handleGenerate} disabled={!canGenerate}>
            ► MEME ME ◄
          </button>
        </>
      )}

      {state === "generating" && (
        <>
          <div className="terminal">
            {fishLogs.map(log line)}
          </div>
          <div className="progress-wrap">
            <div className="progress-label">{statusMessage} {Math.round(progress)}%</div>
            <div className="win-progress">
              <div className="win-progress-fill" style={{width: `${progress}%`}} />
            </div>
          </div>
          <p className="wait-text">the fish is literally browsing the internet rn 🐟</p>
        </>
      )}

      {state === "done" && memeUrl && (
        <>
          {/* Sparkle burst */}
          <div className="sparkle-burst" aria-hidden="true">
            {sparkle elements}
          </div>
          <h2 className="impact result-title">✦ YOUR MEME IS READY ✦</h2>
          <div className="meme-frame">
            <img src={memeUrl} ... />
          </div>
          <div className="btn-group">
            <button className="win98-btn win98-btn-sm" onClick={handleCopy}>📋 {copied ? 'Copied!' : 'Copy Link'}</button>
            <button className="win98-btn win98-btn-sm" onClick={handleDownload}>💾 Save</button>
            <button className="win98-btn win98-btn-sm" onClick={handleReset}>🔄 Make Another</button>
          </div>
        </>
      )}

      {state === "error" && (
        <>
          <div className="error-row">
            <div className="error-icon">⚠️</div>
            <div className="error-text">
              <strong>fishposts.exe has encountered an error.</strong><br/><br/>
              {errorMsg || "Something went wrong"}
            </div>
          </div>
          <div style={{textAlign:'center'}}>
            <button className="win98-btn" onClick={handleReset}>OK</button>
          </div>
        </>
      )}
    </Win98Window>
  </div>

  {/* Footer */}
  <div className="footer">
    <div className="hit-counter">visitors: 042069</div>
    <br />
    powered by <a href="https://tinyfish.ai">tinyfish.ai</a> 🐟
    <div className="construction">🚧 always under construction 🚧</div>
    <div className="netscape">best viewed in netscape navigator 4.0 at 800×600</div>
  </div>

  <Taskbar memeCount={memeCount} />
</div>
```

**Step 1: Rewrite the Home component return JSX**

All state variables, handlers, useEffects STAY THE SAME. Only the return JSX changes.

Remove: FloatingElements usage, page-stickers div, aquarium section, BUBBLES/AQUARIUM_FISH usage, confetti section, hero-section, mode-toggle modern styling, modern tags/badges, btn-aqua usage, btn-pill usage.

Add: Marquee, desktop-icons, Win98Window wrappers, terminal (replacing aquarium), sparkle burst (replacing confetti), Win98 buttons, error dialog, taskbar, footer with hit counter.

**Step 2: Add sparkle trail useEffect to Home component**

```tsx
useEffect(() => {
  const SPARKLES = ['✦', '✧', '★', '·', '⋆'];
  const NEON_COLORS = ['#FF00FF', '#00FFFF', '#FFFF00', '#00FF00'];
  let lastSparkle = 0;

  const handleMouseMove = (e: MouseEvent) => {
    const now = Date.now();
    if (now - lastSparkle < 80) return;
    lastSparkle = now;

    const spark = document.createElement('span');
    spark.className = 'sparkle';
    spark.textContent = SPARKLES[Math.floor(Math.random() * SPARKLES.length)];
    spark.style.left = e.clientX + 'px';
    spark.style.top = e.clientY + 'px';
    spark.style.color = NEON_COLORS[Math.floor(Math.random() * NEON_COLORS.length)];
    document.body.appendChild(spark);
    setTimeout(() => spark.remove(), 600);
  };

  document.addEventListener('mousemove', handleMouseMove);
  return () => document.removeEventListener('mousemove', handleMouseMove);
}, []);
```

**Step 3: Commit**

```bash
git add fishposts/src/app/page.tsx
git commit -m "feat: rewrite page.tsx with Win98 desktop layout"
```

---

### Task 6: Build, Fix, Verify

**Files:**
- May need minor fixes in: `fishposts/src/app/globals.css`, `fishposts/src/app/page.tsx`

**Step 1: Run build**

Run: `cd fishposts && npm run build`

Fix any TypeScript errors, missing class references, or build failures.

**Step 2: Start dev server and take screenshots**

Use preview_start with `fishposts-dev` server.

Verify:
- Desktop teal background visible
- Win98 window frame renders correctly (3D borders, blue titlebar)
- Taskbar at bottom with Start button and clock
- Desktop icons visible on wide viewport (1024px+)
- Marquee scrolls at top
- Mode toggle (URL/Text) works
- Generating state shows terminal + progress bar
- Done state shows meme + neon glow title
- Error state shows dialog
- Recent memes window on left
- Sparkle trail follows mouse
- Footer shows hit counter and nostalgic text

**Step 3: Fix any visual issues**

Iterate on CSS until it matches the Win98 demo aesthetic.

**Step 4: Commit final**

```bash
git add -A
git commit -m "feat: complete Win98 theme — desktop simulation with taskbar, windows, neon accents"
```

---

## Implementation Notes

- **No new npm dependencies needed** — all fonts are system fonts
- **Tailwind CSS v4** still imported but barely used — almost all styling is raw CSS for pixel-perfect Win98 control
- **All existing React state/hooks/handlers preserved** — this is purely a visual reskin
- **demo.html is the CSS reference** — copy border patterns exactly from there
- **The generating state terminal replaces the aquarium** — same fish logs, different visual container
- **The sparkle trail replaces floating emojis** — more on-theme
- **The neon sparkle burst replaces confetti** — same celebration, different aesthetic
