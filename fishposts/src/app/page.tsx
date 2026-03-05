"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { MODE_INFO, type ContentMode } from "@/lib/prompts";

/* ================================================================
   TYPES
   ================================================================ */

type AppState = "idle" | "generating" | "done" | "error";
type WindowId = "fishposts" | "recent_memes";

interface ProgressEvent {
  type: "progress" | "done" | "error";
  message?: string;
  percent?: number;
  memeUrl?: string;
  pageUrl?: string;
  textContent?: string[];
  textTitle?: string;
  mode?: string;
  error?: string;
}

interface WindowState {
  x: number;
  y: number;
  zIndex: number;
  minimized: boolean;
  maximized: boolean;
  preMaxPos?: { x: number; y: number };
}

/* ================================================================
   STATIC DATA
   ================================================================ */

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
  { num: "1", emoji: "\uD83D\uDD17", title: "Pick a mode", desc: "Click Start and choose your weapon." },
  { num: "2", emoji: "\uD83D\uDC1F", title: "Feed the fish", desc: "Drop a URL, paste a take, or let it roam." },
  { num: "3", emoji: "\uD83C\uDFA8", title: "Fish does its thing", desc: "Our AI literally browses the internet." },
  { num: "4", emoji: "\uD83D\uDC80", title: "Content drops", desc: "Memes, threads, dispatches \u2014 so specific it's scary." },
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

const SPARKLE_BURST = Array.from({ length: 24 }, (_, i) => ({
  left: `${(i * 4.3 + 3) % 100}%`,
  char: SPARKLE_CHARS[i % SPARKLE_CHARS.length],
  color: NEON_COLORS[i % NEON_COLORS.length],
  delay: `${(i * 0.05).toFixed(2)}s`,
  duration: `${(1.2 + (i * 0.08) % 1).toFixed(2)}s`,
}));

/** Mode descriptions shown in idle state */
const MODE_FLAVOR: Record<ContentMode, { tagline: string; placeholder?: string; inputType: "url" | "text" | "none" }> = {
  site_roast: {
    tagline: "Paste a URL. The fish visits it. A meme appears.",
    placeholder: "https://your-favorite-website.com",
    inputType: "url",
  },
  trend_roast: {
    tagline: "The fish browses trending tech news and makes fun of whatever it finds.",
    inputType: "none",
  },
  quote_dunks: {
    tagline: "Paste a tweet, a LinkedIn post, a hot take. Get 3 devastating responses.",
    placeholder: "Paste a tweet, a LinkedIn post, a hot take...",
    inputType: "text",
  },
  fish_dispatches: {
    tagline: "The fish visits your URL and writes unhinged first-person dispatches.",
    placeholder: "https://where-should-the-fish-go.com",
    inputType: "url",
  },
  unhinged_threads: {
    tagline: "The fish researches a topic and writes a thread that escalates into chaos.",
    placeholder: "What topic should the fish go off about?",
    inputType: "text",
  },
  chaos_mode: {
    tagline: "Random template + random tone + your input = pure WTF.",
    placeholder: "Type literally anything...",
    inputType: "text",
  },
  corporate_bs: {
    tagline: "Paste corporate speak. The fish translates what it actually means.",
    placeholder: "Paste a corporate email, LinkedIn post, or press release...",
    inputType: "text",
  },
  plot_twist: {
    tagline: "Enter any statement. Get a meme with a devastating plot twist.",
    placeholder: "Type any normal statement...",
    inputType: "text",
  },
  excuse_gen: {
    tagline: "Describe the situation. Get a Win98 error message as your excuse.",
    placeholder: "What do you need an excuse for?",
    inputType: "text",
  },
};

/** Start Menu mode groups */
const MEME_MODES: ContentMode[] = [
  "site_roast",
  "trend_roast",
  "chaos_mode",
  "plot_twist",
];

const TEXT_MODES: ContentMode[] = [
  "quote_dunks",
  "fish_dispatches",
  "unhinged_threads",
  "corporate_bs",
  "excuse_gen",
];

/** All modes flat (for validation, etc.) */
const MODE_ORDER: ContentMode[] = [...MEME_MODES, ...TEXT_MODES];

/** Short description for each mode in the Start Menu */
const MODE_DESC: Record<ContentMode, string> = {
  site_roast: "URL → meme",
  trend_roast: "trending news → meme",
  chaos_mode: "your text → random meme",
  plot_twist: "your text → plot twist meme",
  quote_dunks: "hot take → 3 dunks",
  fish_dispatches: "URL → fish reviews the site",
  unhinged_threads: "topic → viral thread",
  corporate_bs: "corporate text → translation",
  excuse_gen: "situation → Win98 error excuse",
};

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
  windowState,
  isDesktop,
  onMinimize,
  onMaximize,
  onClose,
  onFocus,
  onDragStart,
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
  statusBar?: React.ReactNode;
  windowState: WindowState;
  isDesktop: boolean;
  onMinimize: () => void;
  onMaximize: () => void;
  onClose: () => void;
  onFocus: () => void;
  onDragStart: (e: React.MouseEvent) => void;
}) {
  const maximizedStyle: React.CSSProperties | undefined =
    isDesktop && windowState.maximized
      ? {
          position: "absolute",
          left: 0,
          top: 0,
          width: "100%",
          height: "calc(100vh - 42px)",
          zIndex: windowState.zIndex,
        }
      : isDesktop
        ? {
            position: "absolute",
            left: windowState.x,
            top: windowState.y,
            zIndex: windowState.zIndex,
          }
        : undefined;

  return (
    <div
      className={`win-window ${className || ""} ${windowState.minimized ? "win-window-minimized" : ""} ${windowState.maximized ? "win-window-maximized" : ""}`}
      style={maximizedStyle}
      onMouseDown={onFocus}
    >
      <div
        className={`win-titlebar ${isDesktop && !windowState.maximized ? "win-titlebar-draggable" : ""}`}
        onMouseDown={(e) => {
          if (!(e.target as HTMLElement).closest(".win-buttons")) {
            onDragStart(e);
          }
        }}
        onDoubleClick={(e) => {
          if (isDesktop && !(e.target as HTMLElement).closest(".win-buttons")) {
            onMaximize();
          }
        }}
      >
        <div className="win-title">
          <span>{"\uD83D\uDC1F"}</span> {title}
        </div>
        <div className="win-buttons">
          <button
            className="win-btn"
            aria-label="Minimize"
            onClick={(e) => {
              e.stopPropagation();
              onMinimize();
            }}
          >
            _
          </button>
          <button
            className="win-btn"
            aria-label="Maximize"
            onClick={(e) => {
              e.stopPropagation();
              onMaximize();
            }}
          >
            {windowState.maximized ? "\u2750" : "\u25A1"}
          </button>
          <button
            className="win-btn"
            aria-label="Close"
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
          >
            {"\u00D7"}
          </button>
        </div>
      </div>
      {!windowState.minimized && (
        <>
          <div className="win-body">{children}</div>
          {statusBar && <>{statusBar}</>}
        </>
      )}
    </div>
  );
}

function StartMenu({
  isOpen,
  activeMode,
  onSelectMode,
  onClose,
}: {
  isOpen: boolean;
  activeMode: ContentMode;
  onSelectMode: (mode: ContentMode) => void;
  onClose: () => void;
}) {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (
        menuRef.current &&
        !menuRef.current.contains(target) &&
        !target.closest(".start-btn")
      ) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const renderModeItem = (mode: ContentMode) => {
    const info = MODE_INFO[mode];
    return (
      <button
        key={mode}
        className={`start-menu-item ${mode === activeMode ? "start-menu-item-active" : ""}`}
        onClick={() => {
          onSelectMode(mode);
          onClose();
        }}
      >
        <span className="start-menu-icon">{info.icon}</span>
        <span className="start-menu-label-wrap">
          <span className="start-menu-label">{info.label}</span>
          <span className="start-menu-desc">{MODE_DESC[mode]}</span>
        </span>
      </button>
    );
  };

  return (
    <div className="start-menu" ref={menuRef}>
      <div className="start-menu-sidebar">
        <span className="start-menu-sidebar-text">FishPosts 98</span>
      </div>
      <div className="start-menu-items">
        <div className="start-menu-section-header">
          <span className="start-menu-section-icon">{"\uD83D\uDDBC\uFE0F"}</span>
          Meme Generators
        </div>
        {MEME_MODES.map(renderModeItem)}
        <div className="start-menu-divider" />
        <div className="start-menu-section-header">
          <span className="start-menu-section-icon">{"\uD83D\uDCDD"}</span>
          Text Generators
        </div>
        {TEXT_MODES.map(renderModeItem)}
        <div className="start-menu-divider" />
        <div className="start-menu-item start-menu-item-disabled">
          <span className="start-menu-icon">{"\u2699\uFE0F"}</span>
          <span className="start-menu-label-wrap">
            <span className="start-menu-label">Settings (coming soon)</span>
          </span>
        </div>
      </div>
    </div>
  );
}

function Taskbar({
  memeCount,
  windows,
  topZ,
  activeMode,
  startMenuOpen,
  onStartClick,
  onWindowClick,
}: {
  memeCount: number;
  windows: Record<WindowId, WindowState>;
  topZ: number;
  activeMode: ContentMode;
  startMenuOpen: boolean;
  onStartClick: () => void;
  onWindowClick: (id: WindowId) => void;
}) {
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

  // Dynamic window config with mode-specific title
  const windowConfig: Record<WindowId, { title: string; icon: string }> = {
    fishposts: {
      title: MODE_INFO[activeMode].exe,
      icon: MODE_INFO[activeMode].icon,
    },
    recent_memes: { title: "recent_memes.exe", icon: "\uD83D\uDCC1" },
  };

  return (
    <div className="taskbar">
      <button
        className={`start-btn ${startMenuOpen ? "start-btn-pressed" : ""}`}
        onClick={onStartClick}
      >
        <span className="start-flag">{"\uD83E\uDE9F"}</span> Start
      </button>
      <div className="taskbar-windows">
        {(Object.keys(windowConfig) as WindowId[]).map((id) => (
          <button
            key={id}
            className={`taskbar-window-btn ${
              windows[id].zIndex === topZ && !windows[id].minimized
                ? "taskbar-window-active"
                : ""
            }`}
            onClick={() => onWindowClick(id)}
          >
            {windowConfig[id].icon} {windowConfig[id].title}
          </button>
        ))}
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
        {"\u2605"} WELCOME TO FISHPOSTS DOT COM {"\u2605"} 9 MODES OF UNHINGED
        CONTENT {"\u2605"} CLICK START TO BEGIN {"\u2605"} POWERED BY A LITERAL
        FISH BROWSING THE INTERNET {"\u2605"} 100% FREE {"\u2605"} NO LOGIN{" "}
        {"\u2605"} FISHPOSTS DOT COM {"\u2605"}
      </div>
    </div>
  );
}

/** Text card display for text mode results */
function TextCardResult({
  lines,
  title,
  mode,
}: {
  lines: string[];
  title?: string;
  mode: ContentMode;
}) {
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(false);

  const handleSaveAsImage = async () => {
    setSaving(true);
    setSaveError(false);
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);
    try {
      const res = await fetch("/api/render-card", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode, content: lines, title }),
        signal: controller.signal,
      });
      clearTimeout(timeout);
      if (!res.ok) throw new Error("Failed to render card");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `fishposts-${mode}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {
      clearTimeout(timeout);
      setSaveError(true);
    } finally {
      setSaving(false);
    }
  };

  /* ---- Win98 Error Dialog for excuse_gen ---- */
  if (mode === "excuse_gen") {
    return (
      <div className="excuse-dialog">
        <div className="excuse-dialog-titlebar">
          <span>⚠️ excuse_gen.exe</span>
          <span className="excuse-dialog-close">×</span>
        </div>
        <div className="excuse-dialog-body">
          <div className="excuse-dialog-icon">⚠️</div>
          <div className="excuse-dialog-content">
            {title && <div className="excuse-dialog-situation">{title}</div>}
            <div className="excuse-dialog-excuse">{lines[0] || "Error: no excuse generated."}</div>
          </div>
        </div>
        <div className="excuse-dialog-footer">
          <button className="excuse-dialog-btn">OK</button>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 8 }}>
          <button
            className="win98-btn win98-btn-sm"
            onClick={handleSaveAsImage}
            disabled={saving}
          >
            <IconDownload /> {saving ? "Saving..." : "Save as Image"}
          </button>
          {saveError && (
            <span style={{ color: "#ff4444", fontSize: 12 }}>
              Failed — try again
            </span>
          )}
        </div>
      </div>
    );
  }

  /* ---- Mode-specific emojis for line badges ---- */
  const modeEmojis: Record<string, string[]> = {
    quote_dunks: ["\uD83D\uDDE1\uFE0F", "\uD83D\uDD25", "\uD83D\uDCA3"],
    fish_dispatches: ["\uD83D\uDC1F", "\uD83D\uDC1F", "\uD83D\uDC1F", "\uD83D\uDC1F", "\uD83D\uDC1F"],
    unhinged_threads: ["\uD83E\uDDF5", "\uD83E\uDDF5", "\uD83E\uDDF5", "\uD83E\uDDF5", "\uD83E\uDDF5"],
    corporate_bs: ["\uD83D\uDCBC", "\uD83D\uDCBC", "\uD83D\uDCBC", "\uD83D\uDCBC", "\uD83D\uDCBC"],
  };
  const emojis = modeEmojis[mode] || [];

  return (
    <div className="text-card" data-mode={mode}>
      {title && (
        <div className="text-card-header">
          <span className="text-card-header-icon">{MODE_INFO[mode]?.icon || "\uD83D\uDC1F"}</span>
          <span className="text-card-title">{title}</span>
        </div>
      )}
      <div className="text-card-lines">
        {lines.map((line, i) => (
          <div key={i} className="text-card-line" style={{ animationDelay: `${i * 0.1}s` }}>
            <span className="text-card-badge">{emojis[i] || `${i + 1}`}</span>
            <span className="text-card-text">{line}</span>
          </div>
        ))}
      </div>
      <div className="text-card-footer">
        <span className="text-card-watermark">{"\uD83D\uDC1F"} fishposts.exe</span>
        <button
          className="win98-btn win98-btn-sm"
          onClick={handleSaveAsImage}
          disabled={saving}
        >
          <IconDownload /> {saving ? "Saving..." : "Save as Image"}
        </button>
        {saveError && (
          <span style={{ color: "#ff4444", fontSize: 12 }}>
            Failed — try again
          </span>
        )}
      </div>
    </div>
  );
}

/* ================================================================
   MAIN COMPONENT
   ================================================================ */

export default function Home() {
  /* ---- App state ---- */
  const [activeMode, setActiveMode] = useState<ContentMode>("site_roast");
  const [url, setUrl] = useState("");
  const [text, setText] = useState("");
  const [state, setState] = useState<AppState>("idle");
  const [statusMessage, setStatusMessage] = useState("");
  const [progress, setProgress] = useState(0);
  const [memeUrl, setMemeUrl] = useState("");
  const [pageUrl, setPageUrl] = useState("");
  const [textContent, setTextContent] = useState<string[]>([]);
  const [textTitle, setTextTitle] = useState<string | undefined>();
  const [errorMsg, setErrorMsg] = useState("");
  const [copied, setCopied] = useState(false);
  const [fishLogs, setFishLogs] = useState<string[]>([]);
  const [factIdx, setFactIdx] = useState(0);
  const [memeCount, setMemeCount] = useState(0);
  const [recentMemes, setRecentMemes] = useState<string[]>([]);
  const [startMenuOpen, setStartMenuOpen] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const logRef = useRef<NodeJS.Timeout | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const stateRef = useRef<AppState>("idle");
  const logIdx = useRef(0);

  /* ---- Window management state ---- */
  const [windows, setWindows] = useState<Record<WindowId, WindowState>>({
    fishposts: { x: 0, y: 0, zIndex: 2, minimized: false, maximized: false },
    recent_memes: { x: 0, y: 0, zIndex: 1, minimized: false, maximized: false },
  });
  const [topZ, setTopZ] = useState(2);
  const [isDesktop, setIsDesktop] = useState(false);
  const dragRef = useRef<{
    windowId: WindowId;
    startX: number;
    startY: number;
    origX: number;
    origY: number;
  } | null>(null);

  /* ---- Helpers ---- */

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

  /* ---- isDesktop media query ---- */
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const handler = (e: MediaQueryListEvent) => setIsDesktop(e.matches);
    setIsDesktop(mq.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  /* ---- Calculate initial window positions when entering desktop mode ---- */
  useEffect(() => {
    if (isDesktop) {
      const vw = window.innerWidth;
      const contentWidth = Math.min(1100, vw - 48);
      const offsetX = (vw - contentWidth) / 2;

      setWindows((prev) => ({
        recent_memes: {
          ...prev.recent_memes,
          x: offsetX,
          y: 60,
          minimized: false,
        },
        fishposts: {
          ...prev.fishposts,
          x: offsetX + 380 + 16,
          y: 60,
          minimized: false,
        },
      }));
    }
  }, [isDesktop]);

  /* ---- Rotating fish facts ---- */
  useEffect(() => {
    const interval = setInterval(() => {
      setFactIdx((prev) => (prev + 1) % FISH_FACTS.length);
    }, 7000);
    return () => clearInterval(interval);
  }, []);

  /* ---- Meme counter + recent memes from localStorage ---- */
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

  /* ---- Mouse sparkle trail ---- */
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

  /* ================================================================
     WINDOW MANAGEMENT — Drag, Focus, Minimize, Maximize
     ================================================================ */

  const bringToFront = useCallback((windowId: WindowId) => {
    setTopZ((prev) => {
      const newZ = prev + 1;
      setWindows((w) => ({
        ...w,
        [windowId]: { ...w[windowId], zIndex: newZ },
      }));
      return newZ;
    });
  }, []);

  const handleDragMove = useCallback((e: MouseEvent) => {
    if (!dragRef.current) return;
    const { windowId, startX, startY, origX, origY } = dragRef.current;
    const dx = e.clientX - startX;
    const dy = e.clientY - startY;

    const newX = origX + dx;
    const newY = origY + dy;

    const clampedX = Math.max(-400, Math.min(window.innerWidth - 100, newX));
    const clampedY = Math.max(0, Math.min(window.innerHeight - 50, newY));

    setWindows((prev) => ({
      ...prev,
      [windowId]: {
        ...prev[windowId],
        x: clampedX,
        y: clampedY,
      },
    }));
  }, []);

  const handleDragEnd = useCallback(() => {
    dragRef.current = null;
    document.removeEventListener("mousemove", handleDragMove);
    document.removeEventListener("mouseup", handleDragEnd);
  }, [handleDragMove]);

  const handleDragStart = useCallback(
    (windowId: WindowId) => (e: React.MouseEvent) => {
      if (!isDesktop) return;
      const ws = windows[windowId];
      if (ws.maximized) return;
      e.preventDefault();
      dragRef.current = {
        windowId,
        startX: e.clientX,
        startY: e.clientY,
        origX: ws.x,
        origY: ws.y,
      };

      bringToFront(windowId);
      document.addEventListener("mousemove", handleDragMove);
      document.addEventListener("mouseup", handleDragEnd);
    },
    [isDesktop, windows, bringToFront, handleDragMove, handleDragEnd]
  );

  const handleMinimize = useCallback((windowId: WindowId) => {
    setWindows((prev) => ({
      ...prev,
      [windowId]: { ...prev[windowId], minimized: true },
    }));
  }, []);

  const handleMaximize = useCallback((windowId: WindowId) => {
    if (!isDesktop) return;
    setWindows((prev) => {
      const ws = prev[windowId];
      if (ws.maximized) {
        return {
          ...prev,
          [windowId]: {
            ...ws,
            maximized: false,
            x: ws.preMaxPos?.x ?? ws.x,
            y: ws.preMaxPos?.y ?? ws.y,
            preMaxPos: undefined,
          },
        };
      }
      return {
        ...prev,
        [windowId]: {
          ...ws,
          maximized: true,
          preMaxPos: { x: ws.x, y: ws.y },
        },
      };
    });
    bringToFront(windowId);
  }, [isDesktop, bringToFront]);

  const handleWindowFocus = useCallback(
    (windowId: WindowId) => {
      if (windows[windowId].zIndex !== topZ) {
        bringToFront(windowId);
      }
    },
    [windows, topZ, bringToFront]
  );

  const handleTaskbarWindowClick = useCallback(
    (id: WindowId) => {
      const ws = windows[id];
      if (ws.minimized) {
        setWindows((prev) => ({
          ...prev,
          [id]: { ...prev[id], minimized: false },
        }));
        bringToFront(id);
      } else if (ws.zIndex === topZ) {
        setWindows((prev) => ({
          ...prev,
          [id]: { ...prev[id], minimized: true },
        }));
      } else {
        bringToFront(id);
      }
    },
    [windows, topZ, bringToFront]
  );

  /* ================================================================
     GENERATE HANDLER
     ================================================================ */

  const flavor = MODE_FLAVOR[activeMode];
  const canGenerate =
    flavor.inputType === "none"
      ? true
      : flavor.inputType === "url"
        ? url.trim().length > 0
        : text.trim().length > 0;

  const handleGenerate = async () => {
    if (!canGenerate) return;
    cleanup();
    setAppState("generating");
    setMemeUrl("");
    setPageUrl("");
    setTextContent([]);
    setTextTitle(undefined);
    setErrorMsg("");
    setCopied(false);
    setProgress(0);
    setStatusMessage(STATUS_MESSAGES[0]);
    logIdx.current = 0;
    setFishLogs([FISH_LOGS[0]]);

    // Close start menu if open
    setStartMenuOpen(false);

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

    // Build request body based on active mode
    const body: Record<string, string> = { mode: activeMode };
    if (flavor.inputType === "url") {
      body.url = url.trim();
    } else if (flavor.inputType === "text") {
      body.text = text.trim();
    }
    // "none" input type (trend_roast) sends just { mode }

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
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
            } else if (event.type === "done") {
              gotFinal = true;
              cleanup();
              setProgress(100);

              if (event.memeUrl) {
                // Meme mode result
                setMemeUrl(event.memeUrl);
                if (event.pageUrl) setPageUrl(event.pageUrl);
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
              } else if (event.textContent) {
                // Text mode result
                setTextContent(event.textContent);
                if (event.textTitle) setTextTitle(event.textTitle);
              }

              setAppState("done");
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

  /* ---- Action handlers ---- */

  const handleCopy = async () => {
    const u = pageUrl || memeUrl;
    if (!u) return;
    try {
      await navigator.clipboard.writeText(u);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard API denied — ignore */
    }
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
    setTextContent([]);
    setTextTitle(undefined);
    setErrorMsg("");
    setProgress(0);
    setFishLogs([]);
  };

  const handleDesktopIconClick = (exUrl: string) => {
    setActiveMode("site_roast");
    setUrl(exUrl);
    handleReset();
  };

  const handleModeSelect = (mode: ContentMode) => {
    setActiveMode(mode);
    // Reset to idle when switching modes
    if (state !== "generating") {
      handleReset();
    }
    // Ensure fishposts window is visible and focused
    setWindows((prev) => ({
      ...prev,
      fishposts: { ...prev.fishposts, minimized: false },
    }));
    bringToFront("fishposts");
  };

  /* ---- Current mode info ---- */
  const modeInfo = MODE_INFO[activeMode];

  /* ================================================================
     RENDER
     ================================================================ */

  return (
    <div className="desktop">
      <Marquee />

      {/* Desktop icons */}
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

      {/* Two-window content area */}
      <div className="desktop-content">
        {/* LEFT WINDOW: recent_memes.exe */}
        <Win98Window
          title="recent_memes.exe"
          className="win-window-side"
          windowState={windows.recent_memes}
          isDesktop={isDesktop}
          onMinimize={() => handleMinimize("recent_memes")}
          onMaximize={() => handleMaximize("recent_memes")}
          onClose={() => handleMinimize("recent_memes")}
          onFocus={() => handleWindowFocus("recent_memes")}
          onDragStart={handleDragStart("recent_memes")}
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
        <Win98Window
          title={modeInfo.exe}
          className="win-window-main"
          windowState={windows.fishposts}
          isDesktop={isDesktop}
          onMinimize={() => handleMinimize("fishposts")}
          onMaximize={() => handleMaximize("fishposts")}
          onClose={() => handleMinimize("fishposts")}
          onFocus={() => handleWindowFocus("fishposts")}
          onDragStart={handleDragStart("fishposts")}
        >
          {/* ---- IDLE STATE ---- */}
          {state === "idle" && (
            <div className="state-enter">
              <h1 className="impact headline">
                {modeInfo.icon} {modeInfo.label.toUpperCase()}
              </h1>
              <p className="subhead">{flavor.tagline}</p>

              {/* Mode-specific input */}
              <div className="win-tab-body">
                {flavor.inputType === "url" && (
                  <>
                    <div style={{ marginBottom: 10 }}>
                      <label className="input-label" htmlFor="url-input">
                        {activeMode === "fish_dispatches"
                          ? "Where should the fish go?"
                          : "Target URL:"}
                      </label>
                      <input
                        id="url-input"
                        type="url"
                        className="win-input"
                        placeholder={flavor.placeholder}
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleGenerate();
                        }}
                      />
                    </div>
                    {activeMode === "site_roast" && (
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
                    )}
                  </>
                )}

                {flavor.inputType === "text" && (
                  <div>
                    <label className="input-label" htmlFor="text-input">
                      {activeMode === "unhinged_threads"
                        ? "Topic:"
                        : activeMode === "chaos_mode"
                          ? "Input:"
                          : "The take:"}
                    </label>
                    <textarea
                      id="text-input"
                      className="win-input win-textarea"
                      placeholder={flavor.placeholder}
                      value={text}
                      onChange={(e) => setText(e.target.value)}
                      rows={4}
                    />
                  </div>
                )}

                {flavor.inputType === "none" && (
                  <div className="trend-roast-idle">
                    <p className="trend-roast-desc">
                      No input needed. The fish will browse Hacker News, find
                      something worth making fun of, and come back with a meme.
                    </p>
                  </div>
                )}
              </div>

              <button
                className="win98-btn win98-btn-full"
                onClick={handleGenerate}
                disabled={!canGenerate}
              >
                {activeMode === "trend_roast"
                  ? `${modeInfo.icon} FIND A TREND`
                  : activeMode === "chaos_mode"
                    ? `${modeInfo.icon} CHAOS`
                    : `\u25BA MEME ME \u25C4`}
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
          {state === "done" && (memeUrl || textContent.length > 0) && (
            <div className="pop-in" style={{ position: "relative" }}>
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

              <h2 className="result-title">
                {"\uD83D\uDC1F"}{" "}
                {memeUrl ? "YOUR MEME IS READY" : "CONTENT SERVED"}
              </h2>

              {/* Meme result */}
              {memeUrl && (
                <>
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
                </>
              )}

              {/* Text card result */}
              {!memeUrl && textContent.length > 0 && (
                <>
                  <TextCardResult
                    lines={textContent}
                    title={textTitle}
                    mode={activeMode}
                  />
                  <div className="btn-group" style={{ marginTop: 12 }}>
                    <button
                      className="win98-btn win98-btn-sm"
                      onClick={handleReset}
                    >
                      <IconRefresh /> Make Another
                    </button>
                  </div>
                </>
              )}
            </div>
          )}

          {/* ---- ERROR STATE ---- */}
          {state === "error" && (
            <div className="pop-in">
              <div className="error-row">
                <div className="error-icon">{"\u26A0\uFE0F"}</div>
                <div className="error-text">
                  <strong>{modeInfo.exe} has encountered an error.</strong>
                  <br />
                  <br />
                  {errorMsg || "Something went wrong"}
                  <br />
                  <br />
                  Try a different input, or just try again.
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

      {/* Start Menu (rendered above taskbar) */}
      <StartMenu
        isOpen={startMenuOpen}
        activeMode={activeMode}
        onSelectMode={handleModeSelect}
        onClose={() => setStartMenuOpen(false)}
      />

      <Taskbar
        memeCount={memeCount}
        windows={windows}
        topZ={topZ}
        activeMode={activeMode}
        startMenuOpen={startMenuOpen}
        onStartClick={() => setStartMenuOpen((prev) => !prev)}
        onWindowClick={handleTaskbarWindowClick}
      />
    </div>
  );
}
