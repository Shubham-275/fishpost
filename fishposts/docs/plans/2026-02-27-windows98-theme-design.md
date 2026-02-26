# FishPosts Windows 98 Theme — Design Document

**Date**: 2026-02-27
**Approach**: Full Desktop Simulation (Approach A)

## Overview

Complete visual reskin of FishPosts from the current ocean/aquarium theme to a Windows 98 retro desktop experience. The entire page becomes a Win98 desktop with teal wallpaper, a taskbar, desktop icons, and Win98-styled windows containing the meme generator.

## Design Elements

### 1. Desktop Layer
- Background: Classic teal `#008080`
- Taskbar: Fixed bottom, gray `#C0C0C0` with 3D beveled borders
  - Start button (green flag + "Start")
  - Taskbar window buttons for open "programs"
  - System tray: fish icon, meme counter, clock
- Desktop Icons: Example URLs as classic shortcut icons (desktop only, 1024px+)

### 2. Main Window — fishposts.exe
- Win98 window frame: `#C0C0C0`, 3D beveled borders, blue gradient titlebar
- Mode toggle: Win98 tab control (URL | Text)
- Input: Sunken Win98 text field / textarea
- "MEME ME" button: Impact font, raised 3D button
- Example chips: Win98 hyperlinks (blue, underline)

### 3. Generating State
- Terminal: Green-on-black Courier New, sunken Win98 border
- Progress bar: Segmented navy-blue blocks
- Status text: Comic Sans, neon glow
- No aquarium — terminal + progress replaces it

### 4. Done State
- Neon green glow title (Impact font)
- Meme in sunken frame
- Win98 buttons: Copy Link, Save, Make Another
- Neon sparkle burst instead of confetti

### 5. Error State
- Classic Windows error dialog: warning icon + monospace text
- Single "OK" button

### 6. Second Window — recent_memes.exe (left side)
- Smaller Win98 window with recent memes grid
- "How it works" steps as Win98 list
- Fish facts in status bar at bottom

### 7. Extras
- Marquee bar: yellow text on navy, scrolling welcome
- Mouse sparkle trail (neon ✦ ✧ ★)
- Footer: Hit counter, construction banner, Netscape notice
- Sussy baka fishstick GIF preserved in window body

## Typography
- UI labels: Segoe UI, Tahoma
- Fun text: Comic Sans MS
- Headlines/Buttons: Impact, Arial Black
- Terminal: Courier New

## Color Tokens
- `--win-gray`: #C0C0C0 (window body, buttons)
- `--win-title`: #000080 (titlebar gradient start)
- `--win-title-end`: #1084D0 (titlebar gradient end)
- `--desktop`: #008080 (desktop background)
- `--border-light`: #FFFFFF (3D raised top/left)
- `--border-dark`: #404040 (3D raised bottom/right)
- `--border-shadow`: #808080 (sunken top/left)
- `--neon-pink`: #FF00FF
- `--neon-cyan`: #00FFFF
- `--neon-green`: #00FF00
- `--neon-yellow`: #FFFF00

## Responsive Behavior
- Desktop 1024px+: Two-window layout, desktop icons, full taskbar
- Tablet/Mobile: Single stacked window, minimal taskbar (Start + clock), no desktop icons

## Preserved Functionality
- Dual input mode (URL / Text)
- SSE streaming + progress tracking
- Fish logs (terminal style)
- Recent memes from localStorage
- Meme counter
- All 4 states (idle, generating, done, error)
- Sussy baka fishstick GIF
- Fish facts
- Example URL quick-picks
- Copy/Save/Make Another actions
- TinyFish branding

## Key Changes
- Ocean gradient bg -> Win98 teal desktop
- Mac window chrome -> Win98 window frame
- Aquarium -> Terminal + segmented progress bar
- Confetti -> Neon sparkle burst
- Rounded corners -> Sharp/beveled edges
- Nunito -> Comic Sans / Impact / Segoe UI / Courier New
- Modern pills -> Win98 3D buttons
- Floating emojis -> Desktop icons
- Page sticker GIFs -> Removed
- Modern tags -> Removed (desktop icons replace them)
- NEW: Taskbar + Start button + system tray
- NEW: Marquee scrolling bar
- NEW: Mouse sparkle cursor trail
- NEW: Hit counter + nostalgic footer
