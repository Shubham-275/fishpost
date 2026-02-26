"use client";

import { useState, useRef, useCallback, useEffect } from "react";

/* ================================================================
   TYPES
   ================================================================ */

type AppState = "idle" | "generating" | "done" | "error";
type InputMode = "url" | "text";

interface ProgressEvent {
  type: "progress" | "done" | "error";
  message?: string;
  percent?: number;
  memeUrl?: string;
  pageUrl?: string;
  error?: string;
}

/* ================================================================
   STATIC DATA
   ================================================================ */

const TAGLINES = [
  "Paste a URL, get a meme that\u2019s weirdly accurate",
  "Our fish reads your website. Yes, really.",
  "Making the internet funnier, one URL at a time",
  "The meme generator that actually gets the joke",
  "AI-powered comedy. You\u2019re welcome.",
];

const FISH_LOGS = [
  "C:\\fishposts> deploy_fish.exe",
  "> deploying the fish...",
  "> swimming to target URL... \uD83E\uDD1D",
  "> page found \u2014 loading content...",
  "> reading the headline... \uD83D\uDC40",
  "> scanning body text...",
  "> analyzing page vibes...",
  "> extracting the key message...",
  "> pulling out the juicy parts...",
  '> "synergy" detected. yikes.',
  "> buzzword density: CRITICAL \u26A0\uFE0F",
  "> understanding the vibe...",
  "> swimming to imgflip now... \uD83C\uDFCA",
  "> browsing meme templates...",
  "> drake? distracted bf? hmm...",
  "> debating which template fits...",
  "> this one? no wait, THIS one!",
  "> template locked in \uD83D\uDD12",
  "> writing top text...",
  "> crafting bottom text...",
  "> applying impact font...",
  "> fine-tuning the punchline...",
  "> adjusting comedy levels... \uD83D\uDCC8",
  "> rendering final meme...",
  "> almost done \u2014 fish is tired \uD83D\uDE2E\u200D\uD83D\uDCA8",
];

const STATUS_MESSAGES = [
  "Reading the page...",
  "Analyzing content...",
  "Finding the perfect template...",
  "Writing comedy gold...",
  "Almost there...",
];

const EXAMPLE_URLS = [
  { label: "stripe.com", url: "https://stripe.com", icon: "\uD83D\uDCB3" },
  { label: "notion.so", url: "https://notion.so", icon: "\uD83D\uDCDD" },
  { label: "figma.com", url: "https://figma.com", icon: "\uD83C\uDFA8" },
  { label: "vercel.com", url: "https://vercel.com", icon: "\u25B2" },
  { label: "linear.app", url: "https://linear.app", icon: "\u26A1" },
  { label: "shopify.com", url: "https://shopify.com", icon: "\uD83D\uDECD\uFE0F" },
];

const STEPS = [
  { num: "1", emoji: "\uD83D\uDD17", title: "Drop a URL", desc: "Any website. We don\u2019t judge." },
  { num: "2", emoji: "\uD83D\uDC1F", title: "Fish reads it", desc: "Our AI literally browses your page." },
  { num: "3", emoji: "\uD83C\uDFA8", title: "Template magic", desc: "Picks the perfect meme format." },
  { num: "4", emoji: "\uD83D\uDC80", title: "Meme drops", desc: "So specific it\u2019s scary." },
];

const FISH_FACTS = [
  { emoji: "\uD83E\uDDE0", fact: "A goldfish has a longer attention span than the average internet user." },
  { emoji: "\uD83D\uDC21", fact: "Pufferfish contain enough toxin to kill 30 adults. They chose violence." },
  { emoji: "\uD83C\uDF0A", fact: "There are more fish in the sea than stars visible to the naked eye." },
  { emoji: "\uD83D\uDCA4", fact: "Some fish sleep with one eye open. Trust issues are real." },
  { emoji: "\uD83E\uDD88", fact: "Sharks have been around longer than trees. They\u2019re OG." },
  { emoji: "\uD83C\uDFA8", fact: "Clownfish can change gender. They\u2019re built different." },
  { emoji: "\uD83D\uDCAA", fact: "The mantis shrimp punches so hard it boils water around its fist." },
  { emoji: "\uD83D\uDC40", fact: "A seahorse can move its eyes independently. Multitasking king." },
  { emoji: "\u26A1", fact: "Electric eels can produce 860 volts. That\u2019s a weapon." },
  { emoji: "\uD83E\uDDD3", fact: "Some deep sea fish create their own light. Bioluminescent drip." },
  { emoji: "\uD83C\uDFC3", fact: "Sailfish can swim 68 mph. Faster than most people drive." },
  { emoji: "\uD83E\uDD14", fact: "Fish can recognize human faces. They\u2019re judging you right now." },
];

const SPARKLE_CHARS = ["\u2726", "\u2727", "\u2605", "\u00B7", "\u22C6"];
const NEON_COLORS = ["#FF00FF", "#00FFFF", "#FFFF00", "#00FF00"];

/* Sparkle burst pieces for done state */
const SPARKLE_BURST = Array.from({ length: 24 }, (_, i) => ({
  left: `${(i * 4.3 + 3) % 100}%`,
  char: SPARKLE_CHARS[i % SPARKLE_CHARS.length],
  color: NEON_COLORS[i % NEON_COLORS.length],
  delay: `${(i * 0.05).toFixed(2)}s`,
  duration: `${(1.2 + (i * 0.08) % 1).toFixed(2)}s`,
}));

/* ================================================================
   SUB-COMPONENTS
   ================================================================ */

function IconCopy() {
  return (
    <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="5.5" y="5.5" width="8" height="8" rx="1.5" />
      <path d="M10.5 5.5V3.5a1.5 1.5 0 0 0-1.5-1.5H3.5A1.5 1.5 0 0 0 2 3.5V9a1.5 1.5 0 0 0 1.5 1.5h2" />
    </svg>
  );
}

function IconDownload() {
  return (
    <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 2v8.5M4.5 7L8 10.5 11.5 7M3 13h10" />
    </svg>
  );
}

function IconRefresh() {
  return (
    <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2.5 8a5.5 5.5 0 0 1 9.9-3.3M13.5 8a5.5 5.5 0 0 1-9.9 3.3" />
      <path d="M12.5 2v3h-3M3.5 14v-3h3" />
    </svg>
  );
}

function Win98Window({
  title,
  children,
  className,
  statusBar,
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
  statusBar?: React.ReactNode;
}) {
  return (
    <div className={`win-window ${className || ""}`}>
      <div className="win-titlebar">
        <div className="win-title">
          <span>{"\uD83D\uDC1F"}</span> {title}
        </div>
        <div className="win-buttons">
          <button className="win-btn" aria-label="Minimize">_</button>
          <button className="win-btn" aria-label="Maximize">{"\u25A1"}</button>
          <button className="win-btn" aria-label="Close">{"\u00D7"}</button>
        </div>
      </div>
      <div className="win-body">{children}</div>
      {statusBar && <>{statusBar}</>}
    </div>
  );
}

function Taskbar({ memeCount }: { memeCount: number }) {
  const [time, setTime] = useState("");

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setTime(
        now.toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        })
      );
    };
    update();
    const interval = setInterval(update, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="taskbar">
      <button className="start-btn">
        <span className="start-flag">{"\uD83E\uDE9F"}</span> Start
      </button>
      <div className="taskbar-windows">
        <button className="taskbar-window-btn taskbar-window-active">
          {"\uD83D\uDC1F"} fishposts.exe
        </button>
        <button className="taskbar-window-btn">
          {"\uD83D\uDCC1"} recent_memes
        </button>
      </div>
      <div className="system-tray">
        {memeCount > 0 && (
          <span className="tray-item" title={`${memeCount} memes generated`}>
            {"\uD83D\uDD25"} {memeCount}
          </span>
        )}
        <span className="tray-item">{"\uD83D\uDC1F"}</span>
        <span className="tray-clock">{time}</span>
      </div>
    </div>
  );
}

function Marquee() {
  return (
    <div className="marquee-bar">
      <div className="marquee-text">
        {"\u2605"} WELCOME TO FISHPOSTS DOT COM {"\u2605"} OUR FISH READS YOUR
        WEBSITE AND MAKES A MEME {"\u2605"} 100% FREE {"\u2605"} NO LOGIN{" "}
        {"\u2605"} POWERED BY A LITERAL FISH BROWSING THE INTERNET {"\u2605"}{" "}
        FISHPOSTS DOT COM {"\u2605"}
      </div>
    </div>
  );
}

/* ================================================================
   MAIN COMPONENT
   ================================================================ */

export default function Home() {
  const [inputMode, setInputMode] = useState<InputMode>("text");
  const [url, setUrl] = useState("");
  const [text, setText] = useState("");
  const [state, setState] = useState<AppState>("idle");
  const [statusMessage, setStatusMessage] = useState("");
  const [progress, setProgress] = useState(0);
  const [memeUrl, setMemeUrl] = useState("");
  const [pageUrl, setPageUrl] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [copied, setCopied] = useState(false);
  const [fishLogs, setFishLogs] = useState<string[]>([]);
  const [taglineIdx, setTaglineIdx] = useState(0);
  const [factIdx, setFactIdx] = useState(0);
  const [memeCount, setMemeCount] = useState(0);
  const [recentMemes, setRecentMemes] = useState<string[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const logRef = useRef<NodeJS.Timeout | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const stateRef = useRef<AppState>("idle");
  const logIdx = useRef(0);

  const setAppState = useCallback((s: AppState) => {
    stateRef.current = s;
    setState(s);
  }, []);

  const cleanup = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (logRef.current) {
      clearInterval(logRef.current);
      logRef.current = null;
    }
    if (abortRef.current) {
      abortRef.current.abort();
      abortRef.current = null;
    }
  }, []);

  useEffect(() => cleanup, [cleanup]);

  /* Rotating taglines */
  useEffect(() => {
    const interval = setInterval(() => {
      setTaglineIdx((prev) => (prev + 1) % TAGLINES.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  /* Rotating fish facts */
  useEffect(() => {
    const interval = setInterval(() => {
      setFactIdx((prev) => (prev + 1) % FISH_FACTS.length);
    }, 7000);
    return () => clearInterval(interval);
  }, []);

  /* Meme counter + recent memes from localStorage */
  useEffect(() => {
    const saved = localStorage.getItem("fishposts-count");
    if (saved) setMemeCount(parseInt(saved, 10) || 0);
    try {
      const memes = JSON.parse(
        localStorage.getItem("fishposts-recent") || "[]"
      );
      if (Array.isArray(memes)) setRecentMemes(memes.slice(0, 6));
    } catch {
      /* ignore */
    }
  }, []);

  /* Mouse sparkle trail */
  useEffect(() => {
    let lastSparkle = 0;

    const handleMouseMove = (e: MouseEvent) => {
      const now = Date.now();
      if (now - lastSparkle < 80) return;
      lastSparkle = now;

      const spark = document.createElement("span");
      spark.className = "sparkle";
      spark.textContent =
        SPARKLE_CHARS[Math.floor(Math.random() * SPARKLE_CHARS.length)];
      spark.style.left = e.clientX + "px";
      spark.style.top = e.clientY + "px";
      spark.style.color =
        NEON_COLORS[Math.floor(Math.random() * NEON_COLORS.length)];
      document.body.appendChild(spark);
      setTimeout(() => spark.remove(), 600);
    };

    document.addEventListener("mousemove", handleMouseMove);
    return () => document.removeEventListener("mousemove", handleMouseMove);
  }, []);

  /* ---- Generate handler ---- */

  const canGenerate = inputMode === "url" ? url.trim() : text.trim();

  const handleGenerate = async () => {
    if (!canGenerate) return;
    cleanup();
    setAppState("generating");
    setMemeUrl("");
    setPageUrl("");
    setErrorMsg("");
    setCopied(false);
    setProgress(0);
    setStatusMessage(STATUS_MESSAGES[0]);
    logIdx.current = 0;
    setFishLogs([FISH_LOGS[0]]);

    const startTime = Date.now();
    const statusIdx = { current: 0 };

    timerRef.current = setInterval(() => {
      const elapsed = (Date.now() - startTime) / 1000;
      const pct = Math.min(92, (1 - Math.exp(-elapsed / 80)) * 100);
      setProgress((prev) => Math.max(prev, pct));
      let idx = 0;
      if (elapsed > 120) idx = 4;
      else if (elapsed > 90) idx = 3;
      else if (elapsed > 45) idx = 2;
      else if (elapsed > 20) idx = 1;
      if (idx !== statusIdx.current) {
        statusIdx.current = idx;
        setStatusMessage(STATUS_MESSAGES[idx]);
      }
    }, 500);

    logRef.current = setInterval(() => {
      logIdx.current = Math.min(logIdx.current + 1, FISH_LOGS.length - 1);
      setFishLogs((prev) =>
        [...prev, FISH_LOGS[logIdx.current]].slice(-6)
      );
    }, 10000);

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          inputMode === "url"
            ? { url: url.trim() }
            : { text: text.trim() }
        ),
        signal: controller.signal,
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || `Server error: ${res.status}`);
      }

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      if (!reader) throw new Error("No response stream");

      let buffer = "";
      let gotFinal = false;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          try {
            const event: ProgressEvent = JSON.parse(line.slice(6));
            if (event.type === "progress") {
              if (event.message) setStatusMessage(event.message);
              if (event.percent)
                setProgress((prev) => Math.max(prev, event.percent!));
            } else if (event.type === "done" && event.memeUrl) {
              gotFinal = true;
              cleanup();
              setProgress(100);
              setMemeUrl(event.memeUrl);
              if (event.pageUrl) setPageUrl(event.pageUrl);
              setAppState("done");
              /* Increment meme counter + save to recent memes */
              setMemeCount((prev) => {
                const next = prev + 1;
                localStorage.setItem("fishposts-count", String(next));
                return next;
              });
              setRecentMemes((prev) => {
                const updated = [
                  event.memeUrl!,
                  ...prev.filter((u) => u !== event.memeUrl),
                ].slice(0, 6);
                localStorage.setItem(
                  "fishposts-recent",
                  JSON.stringify(updated)
                );
                return updated;
              });
            } else if (event.type === "error") {
              gotFinal = true;
              cleanup();
              setErrorMsg(event.error || "Something went wrong");
              setAppState("error");
            }
          } catch {
            /* skip malformed SSE */
          }
        }
      }

      if (!gotFinal && stateRef.current === "generating") {
        cleanup();
        setErrorMsg("Connection lost. Try again.");
        setAppState("error");
      }
    } catch (err) {
      if ((err as Error).name === "AbortError") return;
      cleanup();
      setErrorMsg(
        err instanceof Error ? err.message : "Something went wrong"
      );
      setAppState("error");
    }
  };

  /* ---- Handlers ---- */

  const handleCopy = async () => {
    const u = pageUrl || memeUrl;
    if (!u) return;
    await navigator.clipboard.writeText(u);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!memeUrl) return;
    const a = document.createElement("a");
    a.href = `/api/download?url=${encodeURIComponent(memeUrl)}`;
    a.download = "";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleReset = () => {
    cleanup();
    setAppState("idle");
    setMemeUrl("");
    setPageUrl("");
    setErrorMsg("");
    setProgress(0);
    setFishLogs([]);
  };

  const handleDesktopIconClick = (exUrl: string) => {
    setInputMode("url");
    setUrl(exUrl);
  };

  /* ================================================================
     RENDER
     ================================================================ */

  return (
    <div className="desktop">
      <Marquee />

      {/* Desktop icons — 1280px+ only (CSS hidden below) */}
      <div className="desktop-icons" aria-hidden="true">
        {EXAMPLE_URLS.map((ex) => (
          <button
            key={ex.url}
            className="desktop-icon"
            onClick={() => handleDesktopIconClick(ex.url)}
            title={ex.url}
          >
            <span className="desktop-icon-img">{ex.icon}</span>
            <span className="desktop-icon-label">{ex.label}</span>
          </button>
        ))}
      </div>

      {/* Two-column content */}
      <div className="desktop-content">
        {/* LEFT WINDOW: recent_memes.exe */}
        <Win98Window
          title="recent_memes.exe"
          className="win-window-side"
          statusBar={
            <div className="win-statusbar" key={factIdx}>
              {FISH_FACTS[factIdx].emoji} {FISH_FACTS[factIdx].fact}
            </div>
          }
        >
          <div className="win-section-label">How it works:</div>
          <div className="win-steps">
            {STEPS.map((step) => (
              <div key={step.num} className="win-step">
                <div className="win-step-num">{step.emoji}</div>
                <div className="win-step-text">
                  <strong>{step.title}</strong>
                  <span>{step.desc}</span>
                </div>
              </div>
            ))}
          </div>

          <hr className="hr98" />

          <div className="win-section-label">
            Recent memes ({recentMemes.length}/6):
          </div>
          {recentMemes.length > 0 ? (
            <div className="recent-memes-grid">
              {recentMemes.map((meme, i) => (
                <a
                  key={`${meme}-${i}`}
                  href={meme}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="recent-meme-item"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={meme}
                    alt={`Meme ${i + 1}`}
                    loading="lazy"
                    onError={(e) => {
                      const el = (e.target as HTMLImageElement).parentElement;
                      if (el) (el as HTMLElement).style.display = "none";
                    }}
                  />
                </a>
              ))}
            </div>
          ) : (
            <div className="recent-memes-empty">
              No files found. Generate your first meme!
            </div>
          )}
        </Win98Window>

        {/* RIGHT WINDOW: fishposts.exe (main) */}
        <Win98Window title="fishposts.exe" className="win-window-main">
          {/* ---- IDLE STATE ---- */}
          {state === "idle" && (
            <div className="state-enter">
              {/* Fishstick GIF */}
              <div style={{ textAlign: "center", marginBottom: 8 }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="https://media1.tenor.com/m/y-N3_SzK0OcAAAAC/sussy-baka.gif"
                  alt="Fishstick"
                  className="win-fishstick"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
              </div>

              <h1 className="impact headline">FISHPOSTS</h1>
              <p className="subhead" key={taglineIdx}>
                {TAGLINES[taglineIdx]}
              </p>

              {/* Mode tabs */}
              <div className="win-tabs">
                <button
                  className={`win-tab ${inputMode === "url" ? "active" : ""}`}
                  onClick={() => setInputMode("url")}
                >
                  {"\uD83D\uDD17"} URL
                </button>
                <button
                  className={`win-tab ${inputMode === "text" ? "active" : ""}`}
                  onClick={() => setInputMode("text")}
                >
                  {"\u270D\uFE0F"} Text
                </button>
              </div>

              <div className="win-tab-body">
                {inputMode === "url" ? (
                  <>
                    <div style={{ marginBottom: 10 }}>
                      <label className="input-label" htmlFor="url-input">
                        Target URL:
                      </label>
                      <input
                        id="url-input"
                        type="url"
                        className="win-input"
                        placeholder="https://your-favorite-website.com"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleGenerate();
                        }}
                      />
                    </div>
                    <div className="examples">
                      <span>or try: </span>
                      {EXAMPLE_URLS.map((ex, i) => (
                        <span key={ex.url}>
                          <a
                            href="#"
                            onClick={(e) => {
                              e.preventDefault();
                              setUrl(ex.url);
                            }}
                          >
                            {ex.label}
                          </a>
                          {i < EXAMPLE_URLS.length - 1 && " \u00B7 "}
                        </span>
                      ))}
                    </div>
                  </>
                ) : (
                  <div>
                    <label className="input-label" htmlFor="text-input">
                      {"What\u2019s the meme about?"}
                    </label>
                    <textarea
                      id="text-input"
                      className="win-input win-textarea"
                      placeholder={"Type anything \u2014 a hot take, a shower thought, a rant about your coworker..."}
                      value={text}
                      onChange={(e) => setText(e.target.value)}
                      rows={4}
                    />
                  </div>
                )}
              </div>

              <button
                className="win98-btn win98-btn-full"
                onClick={handleGenerate}
                disabled={!canGenerate}
              >
                {"\u25BA"} MEME ME {"\u25C4"}
              </button>
            </div>
          )}

          {/* ---- GENERATING STATE ---- */}
          {state === "generating" && (
            <div className="state-enter">
              <div className="terminal">
                {fishLogs.map((log, i) => (
                  <div
                    key={`${i}-${log}`}
                    className={`term-line ${
                      i === fishLogs.length - 1 ? "active" : ""
                    }`}
                  >
                    {log}
                    {i === fishLogs.length - 1 && (
                      <span className="cursor-blink" />
                    )}
                  </div>
                ))}
              </div>

              <div className="progress-wrap">
                <div className="progress-label">
                  {statusMessage} {Math.round(progress)}%
                </div>
                <div className="win-progress">
                  <div
                    className="win-progress-fill"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>

              <p className="wait-text">
                please wait... the fish is literally browsing the internet rn{" "}
                {"\uD83D\uDC1F"}
              </p>
            </div>
          )}

          {/* ---- DONE STATE ---- */}
          {state === "done" && memeUrl && (
            <div className="pop-in" style={{ position: "relative" }}>
              {/* Sparkle burst */}
              <div className="sparkle-burst" aria-hidden="true">
                {SPARKLE_BURST.map((s, i) => (
                  <span
                    key={i}
                    className="sparkle-piece"
                    style={{
                      left: s.left,
                      color: s.color,
                      animationDelay: s.delay,
                      animationDuration: s.duration,
                    }}
                  >
                    {s.char}
                  </span>
                ))}
              </div>

              <h2 className="impact result-title">
                {"\u2726"} YOUR MEME IS READY {"\u2726"}
              </h2>

              <div className="meme-frame">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={memeUrl}
                  alt="Generated meme"
                  onError={() => {
                    setErrorMsg("Could not load meme image");
                    setAppState("error");
                  }}
                />
              </div>

              <div className="btn-group">
                <button className="win98-btn win98-btn-sm" onClick={handleCopy}>
                  <IconCopy /> {copied ? "Copied!" : "Copy Link"}
                </button>
                <button
                  className="win98-btn win98-btn-sm"
                  onClick={handleDownload}
                >
                  <IconDownload /> Save
                </button>
                <button
                  className="win98-btn win98-btn-sm"
                  onClick={handleReset}
                >
                  <IconRefresh /> Make Another
                </button>
              </div>

              {pageUrl && (
                <p style={{ textAlign: "center", marginTop: 8 }}>
                  <a
                    href={pageUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="win-link"
                    style={{ fontSize: 11 }}
                  >
                    {"View on Imgflip \u2192"}
                  </a>
                </p>
              )}
            </div>
          )}

          {/* ---- ERROR STATE ---- */}
          {state === "error" && (
            <div className="pop-in">
              <div className="error-row">
                <div className="error-icon">{"\u26A0\uFE0F"}</div>
                <div className="error-text">
                  <strong>fishposts.exe has encountered an error.</strong>
                  <br />
                  <br />
                  {errorMsg || "Something went wrong"}
                  <br />
                  <br />
                  Try a different URL, or just try again.
                </div>
              </div>
              <div style={{ textAlign: "center" }}>
                <button className="win98-btn" onClick={handleReset}>
                  OK
                </button>
              </div>
            </div>
          )}
        </Win98Window>
      </div>

      {/* Footer */}
      <div className="footer-98">
        <div className="hit-counter">visitors: 042069</div>
        <br />
        powered by{" "}
        <a href="https://tinyfish.ai" target="_blank" rel="noopener noreferrer">
          tinyfish.ai
        </a>{" "}
        {"\uD83D\uDC1F"} {"\u2014"} a literal fish that browses the internet
        <div className="construction">
          {"\uD83D\uDEA7"} always under construction {"\uD83D\uDEA7"}
        </div>
        <div className="netscape">
          best viewed in netscape navigator 4.0 at 800{"\u00D7"}600
        </div>
      </div>

      <Taskbar memeCount={memeCount} />
    </div>
  );
}
