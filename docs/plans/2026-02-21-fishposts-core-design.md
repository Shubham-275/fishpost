# FishPosts Core Engine — Design Document

## Date: 2026-02-21

---

## One-Liner

**Paste your URL. Get memed.** An AI that actually reads your website and makes a meme so specific, so accurate, it hurts.

---

## The Product

FishPosts is a web app where you paste any URL — your company, your competitor, any website — and TinyFish's web agent reads the page, picks a meme template, and generates a meme that's funny BECAUSE it references specific things from that actual page.

**Why people share:** The meme uses their exact tagline, their specific buzzwords, their real product promises against them. It's not a generic joke — it's a personalized dunk.

**Why it's different from brainrot.run:**
- brainrot.run takes text input → generic memes
- FishPosts takes a URL → the AI reads your live site and makes a meme about what it found
- The specificity is the product. You can't get this from ChatGPT because ChatGPT doesn't browse your live website.

**Who uses it:**
- People who want to meme their own company ("let's see what it says about us")
- People who want to dunk on competitors ("put their URL in and laugh")
- Social media managers looking for daily content
- TinyFish's own Twitter account (daily postable content that showcases the agent)

**Business model:** TinyFish decides later. Free first, get traction.

**Mandatory constraint:** TinyFish web agent is the automation engine. No alternatives.

---

## How It Works

```
User pastes URL → clicks "Meme Me"
         ↓
TinyFish agent reads the webpage
  - Company name, product, marketing claims
  - Buzzwords, promises, ironic contradictions
         ↓
TinyFish browses Imgflip template gallery (random page 1-10)
  - Visually picks the best template for the joke
  - Clicks "Add Caption"
         ↓
TinyFish generates meme text from page context
  - Humor comes from specific things on the actual page
  - Under 10 words per line
  - Matched to the template's joke structure
         ↓
TinyFish fills text boxes (hardened protocol)
  - DOM re-query, click, wait, type, verify
  - Visual confirmation before proceeding
  - Retry on failure
         ↓
TinyFish clicks "Generate Meme"
         ↓
Returns meme URL → displayed to user
```

---

## Proven Test Results

This engine was tested across 4 rounds before this design was written.

### Round 1 — Naive Prompt (10 runs, Tesla)
- Success rate: 40% (text rendering failures)
- Template: hardcoded, many broke
- Speed: ~18 min average
- Lesson: need hardened DOM interaction

### Round 2 — Hardened Prompt (3 runs, Anthropic/OpenAI/Netflix)
- Success rate: 100%
- Template: all Drake (variety problem)
- Speed: ~4.5 min average
- Lesson: need template diversity

### Round 3 — Hardened + Lowkey Sites (5 runs, Craigslist/Duolingo/Balsamiq/Zapier/Poolsuite)
- Success rate: 100%
- Template: all Drake (confirmed variety problem)
- Speed: ~3.9 min average
- Lesson: TinyFish defaults to Drake when given free choice

### Round 4 — Gallery Browsing + Deep Page Analysis (3 runs, Figma/Notion/Shopify)
- Success rate: 100%
- Templates: Gus Fring, Office Handshake, Ohio Astronaut (all different!)
- Speed: ~3 min average
- Joke quality: genuinely postable, referenced specific webpage content
- Lesson: THIS IS THE ENGINE

**Key stats from final engine:**
- 100% success rate (11 consecutive successful runs)
- ~2-4 min per meme
- Template variety via random gallery page browsing
- Context-specific jokes that reference actual page content
- No ChatGPT needed — TinyFish solo

---

## The Prompt (Proven, Guard-Safe)

The core prompt template with two variables: `{TARGET_URL}` and `{RANDOM_PAGE}` (1-10).

```
You are a careful autonomous web agent. You must reason independently,
choose the best meme template, and verify all UI state changes visually
before proceeding. Never assume success without confirmation.

---

## TASK 1 — ANALYZE TARGET PAGE

1. Read visible content on this page.
2. Extract:
   * Company name
   * One-sentence summary of its core product/mission
   * Notable marketing claims or buzzwords
   * What users actually experience vs what the site promises
3. Store everything.

---

## TASK 2 — BROWSE AND PICK A MEME TEMPLATE

1. Go to: https://imgflip.com/memetemplates?sort=top-30-days&page={RANDOM_PAGE}
2. Look at ALL the meme templates visible on this page.
3. Pick the ONE template that best fits a funny observation about the company.
4. Click "Add Caption" on your chosen template.
5. Wait for the meme editor to fully load.

---

## TASK 3 — PLAN THE MEME

1. Based on what you read on the webpage AND the template you chose,
   write funny meme text.
2. The humor should come from specific things on the webpage — irony,
   exaggeration, or honest observations.
3. Under 10 words per text line.
4. Only generate as many lines as the template needs.

---

## TASK 4 — FILL TEXT (HARDENED PROTOCOL)

### STEP A — INITIALIZE
1. Click once directly on the preview image.
2. Wait 800ms.

### STEP B — DETECT INPUT BOXES
1. Re-query the DOM for visible editable text input fields.
2. Count them → BOX_COUNT.
3. Only fill exactly BOX_COUNT fields.

### STEP C — ENTER TEXT (for each box i)
1. Re-query DOM for text inputs (fresh references).
2. Select the i-th visible input field.
3. Scroll it into view.
4. Click inside the input.
5. Wait 700ms.
6. Select all existing text.
7. Delete it completely.
8. Type your LINE_i slowly.
9. Press ENTER.
10. Wait 1000ms.
11. Click directly on the preview image.
12. Wait 700ms.
13. Visually confirm the text appears on the preview.

If text is NOT visible:
* Click the input again, retype, press ENTER, click preview, wait,
  verify again.
* Do NOT proceed until text is visibly rendered.

### STEP D — FINAL CHECK
1. Confirm ALL text lines are visible on the meme preview.
2. Fix any blank or incorrect panels before proceeding.

### STEP E — GENERATE
1. Do NOT check Private.
2. Click "Generate Meme".
3. Wait for result popup.
4. Return the URL starting with https://imgflip.com/i/
```

### Guard-Safe Language Rules
- Never use: "brutal", "roast", "satirical", "savage", "poking fun at"
- Always use: "funny", "honest", "punchline", "irony", "observations"
- Keep the prompt concise — longer prompts are more likely to trigger the guard

---

## Tech Stack

| Layer | Choice | Why |
|-------|--------|-----|
| Framework | Next.js 15+ (App Router) | Industry standard, SSR, API routes |
| Language | TypeScript | Type safety |
| Styling | Tailwind CSS | Fast to build |
| Browser Automation | TinyFish Web Agent (MCP) | Mandatory — sponsor's product |
| Meme Creation | Imgflip (via TinyFish browsing) | Proven pipeline |
| Real-time Updates | Server-Sent Events (SSE) | Live progress while agent works |
| Deployment | Vercel | Native Next.js support |

**No database.** No auth. No user accounts. One page, one input, one button.

---

## System Architecture

```
┌──────────┐     POST /api/generate      ┌──────────────┐
│  Client   │ ──────────────────────────→ │  API Route   │
│  (Next.js)│ ←── SSE progress updates ── │  (Next.js)   │
└──────────┘                              └──────┬───────┘
                                                 │
                                    run_web_automation_async
                                                 │
                                                 ▼
                                          ┌──────────────┐
                                          │  TinyFish    │
                                          │  Web Agent   │
                                          └──────┬───────┘
                                                 │
                                    1. Reads target URL
                                    2. Browses Imgflip gallery
                                    3. Picks template
                                    4. Fills text (hardened)
                                    5. Generates meme
                                                 │
                                                 ▼
                                          ┌──────────────┐
                                          │  Imgflip     │
                                          │  Meme URL    │
                                          └──────────────┘
```

### API Flow

1. Client sends `POST /api/generate` with `{ url: "https://example.com" }`
2. Server generates random page number (1-10)
3. Server constructs prompt from template with `{TARGET_URL}` and `{RANDOM_PAGE}`
4. Server calls `run_web_automation_async` with target URL and prompt
5. Server opens SSE connection to client for progress updates
6. Server polls TinyFish `get_run` every 5 seconds
7. On completion, extracts meme URL from result
8. Returns meme URL to client via SSE final event
9. Client displays the meme image

### Progress Messages (via SSE)

```
"Reading the page..."           (sent immediately)
"Finding the perfect template..." (sent at ~30s)
"Crafting your meme..."          (sent at ~60s)
"Almost there..."                (sent at ~120s)
"Done!"                          (sent on completion)
```

These are time-based estimates, not actual TinyFish step tracking. Simple and reliable.

---

## UI Design (MVP — Minimal)

### Layout

```
┌─────────────────────────────────────────────┐
│                                             │
│        🐟 FishPosts                         │
│        "Paste your URL. Get memed."         │
│                                             │
│  ┌─────────────────────────────────────┐    │
│  │  https://                           │    │
│  └─────────────────────────────────────┘    │
│                                             │
│          [ 🎣 Meme Me ]                     │
│                                             │
│  ┌─ Progress (while generating) ────────┐   │
│  │  🐟 "Reading the page..."            │   │
│  │  ▓▓▓▓▓▓░░░░░░░░ 40%                 │   │
│  └──────────────────────────────────────┘   │
│                                             │
│  ┌─ Result ─────────────────────────────┐   │
│  │                                      │   │
│  │     [ Generated Meme Image ]         │   │
│  │                                      │   │
│  │  [📋 Copy Link] [⬇ Download] [🔄 Again]│  │
│  └──────────────────────────────────────┘   │
│                                             │
│        Powered by TinyFish Web Agent        │
│                                             │
└─────────────────────────────────────────────┘
```

### Styling
- Clean, minimal — the meme is the hero, not the UI
- Dark mode default
- "Powered by TinyFish" branding on every page
- Mobile-responsive

### States
1. **Empty** — URL input + "Meme Me" button
2. **Generating** — Progress bar + fun status messages
3. **Result** — Meme image + action buttons (copy, download, regenerate)
4. **Error** — "Something went wrong, try again" + retry button

---

## Constraints & Limitations

### TinyFish Limitations (from testing)
- Max 3-5 concurrent runs (10 overwhelms the system)
- ~2-4 min per meme generation
- LLM guard blocks certain words (see guard-safe rules above)
- "Completed" status doesn't guarantee visual correctness (but hardened protocol fixes this)
- Some pages may be hard to read (login-walled, very JS-heavy)

### Imgflip Limitations
- "Private" checkbox causes Access Denied on generated links — always leave unchecked
- 4-box templates are unreliable — the gallery browsing approach naturally avoids these
- Template availability changes over time — random page browsing handles this automatically

### Design Decisions
- No database for MVP — everything is stateless
- No user accounts — anyone with the URL can use it
- No saved history — generate, copy, done
- No rate limiting for MVP — add later if needed
- No visual verification step — the hardened protocol is reliable enough (100% in testing)

---

## Future Modes (Post-Core, Iterative)

Once the core engine is solid, each mode is just a different way to feed it:

| Mode | Input Change | Same Engine |
|------|-------------|-------------|
| Trend Meme | Server auto-picks trending URL | Yes |
| Battle Mode | Two URLs, two memes | Yes x2 |
| Quote Dunks | Tweet URL as input | Yes |
| Fish Dispatches | Random URL + narration wrapper | Yes + text |
| Chaos Mode | Random URL + random page | Yes, randomized |

**Do NOT build any of these until the core engine is shipped and proven with real users.**

---

## Success Criteria

1. **Core engine works reliably** — >90% of URLs produce a usable meme
2. **Speed** — under 4 minutes per meme
3. **Shareability** — memes reference specific page content (not generic)
4. **Template variety** — no two consecutive memes use the same template
5. **"Powered by TinyFish"** — every meme and page credits TinyFish

---

## What To Build (Scope)

### In Scope (MVP)
- Single-page web app
- URL input + generate button
- TinyFish integration (async run + polling)
- SSE progress updates
- Meme display with copy/download
- "Powered by TinyFish" branding

### Out of Scope (Not MVP)
- User accounts / auth
- Database / history
- Multiple content modes
- Rate limiting
- Analytics
- Custom styling / themes
- Mobile app

---

## References

- Proven prompt template: tested across 11+ runs with 100% success
- brainrot.run template selection: gallery page browsing approach (adapted from their open source repo)
- TinyFish MCP server: `https://agent.tinyfish.ai/mcp`
- Imgflip template gallery: `https://imgflip.com/memetemplates?sort=top-30-days&page={N}`
- Previous design: `docs/plans/2026-02-20-contentcannon-design.md`
