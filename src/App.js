import logo from './logo.svg';
import './App.css';


import React, { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

// Chakra — Clues on Board + Draw CLUE deck
//
// User requirement:
// ✅ Make sure ALL the clues are draw-able from the deck
//
// This version:
// - The deck draws CLUE CARDS (not just chakra names).
// - The board is built from the SAME clue pool (sampled without replacement), so every board clue
//   is guaranteed to be present in the deck.
// - You can optionally enable “Caller Lock” so you can only mark the exact clue that was drawn.
//
// Drop into a React app (Vite/Next) as App.jsx and render <App />.

const CHAKRAS = [
  {
    id: "root",
    name: "Root Chakra",
    sanskrit: "Mulādhāra",
    color: "#e53935",
    theme: "Stability • Grounding • Safety",
    clues: [
      "I govern safety, survival, and belonging.",
      "My element is Earth.",
      "I live at the base of the spine.",
      "Grounding and stability are my vibe.",
      "Think: legs, feet, and roots.",
      "When balanced: steady and secure.",
    ],
  },
  {
    id: "sacral",
    name: "Sacral Chakra",
    sanskrit: "Svādhiṣṭhāna",
    color: "#fb8c00",
    theme: "Creativity • Pleasure • Flow",
    clues: [
      "I govern creativity, pleasure, and emotional flow.",
      "My element is Water.",
      "I live in the lower belly / pelvis.",
      "Think: sensuality and movement.",
      "When balanced: open, playful, fluid.",
      "Hip-openers often connect to me.",
    ],
  },
  {
    id: "solar",
    name: "Solar Plexus",
    sanskrit: "Maṇipūra",
    color: "#fdd835",
    theme: "Confidence • Will • Personal Power",
    clues: [
      "I govern confidence, will, and personal power.",
      "My element is Fire.",
      "I live in the upper belly / navel area.",
      "Think: courage and boundaries.",
      "When balanced: energized and decisive.",
      "Core work often wakes me up.",
    ],
  },
  {
    id: "heart",
    name: "Heart Chakra",
    sanskrit: "Anāhata",
    color: "#43a047",
    theme: "Love • Compassion • Balance",
    clues: [
      "I govern love, compassion, and connection.",
      "My element is Air.",
      "I live in the center of the chest.",
      "Think: forgiveness and balance.",
      "When balanced: open-hearted and kind.",
      "Backbends and chest openers relate to me.",
    ],
  },
  {
    id: "throat",
    name: "Throat Chakra",
    sanskrit: "Viśuddha",
    color: "#1e88e5",
    theme: "Truth • Communication • Expression",
    clues: [
      "I govern truth, voice, and expression.",
      "My element is Ether (Space).",
      "I live at the throat / neck.",
      "Think: speaking clearly and listening well.",
      "When balanced: honest and expressive.",
      "Chanting and breath can support me.",
    ],
  },
  {
    id: "third",
    name: "Third Eye",
    sanskrit: "Ājñā",
    color: "#5e35b1",
    theme: "Intuition • Insight • Awareness",
    clues: [
      "I govern intuition and inner knowing.",
      "I live between the eyebrows.",
      "Think: clarity, insight, and awareness.",
      "When balanced: you trust your inner guidance.",
      "Meditation often strengthens me.",
      "Less thinking—more seeing.",
    ],
  },
  {
    id: "crown",
    name: "Crown Chakra",
    sanskrit: "Sahasrāra",
    color: "#8e24aa",
    theme: "Connection • Consciousness • Unity",
    clues: [
      "I govern connection to something bigger.",
      "I live at the top of the head.",
      "Think: consciousness and unity.",
      "When balanced: peace and purpose.",
      "Silence and surrender support me.",
      "Not about doing—about being.",
    ],
  },
];

function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function byId(id) {
  return CHAKRAS.find((c) => c.id === id);
}

// Build a flat pool of ALL clues (each clue is draw-able from the deck)
function buildCluePool() {
  const pool = [];
  for (const c of CHAKRAS) {
    for (const clue of c.clues) {
      pool.push({
        chakraId: c.id,
        clue,
        token: `${c.id}:${clue}`,
      });
    }
  }
  return pool;
}

// Create a board by sampling clues WITHOUT replacement from the pool.
// That guarantees every board clue exists in the deck.
function buildBoardAndDeck() {
  const pool = shuffle(buildCluePool());
  // 24 clue squares + FREE center
  const boardClues = pool.slice(0, 24);
  const remainingDeck = pool.slice(24);

  // Assemble 25 board cells, then insert FREE at center (index 12)
  const cells = [];
  for (let i = 0; i < 25; i++) {
    if (i === 12) {
      cells.push({ type: "FREE", token: "FREE" });
    } else {
      const item = boardClues.shift();
      cells.push({
        type: "CLUE",
        chakraId: item.chakraId,
        clue: item.clue,
        token: item.token,
      });
    }
  }

  // Deck contains ALL clues (board + remaining), shuffled
  const deck = shuffle([...cells.filter((c) => c.type === "CLUE").map((c) => ({ chakraId: c.chakraId, clue: c.clue, token: c.token })), ...remainingDeck]);

  return { board: cells, deck };
}

function getLines() {
  const lines = [];
  for (let r = 0; r < 5; r++) lines.push([0, 1, 2, 3, 4].map((c) => r * 5 + c));
  for (let c = 0; c < 5; c++) lines.push([0, 1, 2, 3, 4].map((r) => r * 5 + c));
  lines.push([0, 6, 12, 18, 24]);
  lines.push([4, 8, 12, 16, 20]);
  return lines;
}

function hasChakra(selectedSet) {
  const lines = getLines();
  return lines.some((line) => line.every((i) => selectedSet.has(i)));
}

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia?.("(prefers-reduced-motion: reduce)");
    if (!mq) return;
    const handler = () => setReduced(!!mq.matches);
    handler();
    mq.addEventListener?.("change", handler);
    return () => mq.removeEventListener?.("change", handler);
  }, []);
  return reduced;
}

function ConfettiBurst({ fireKey }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf = 0;
    let alive = true;

    const dpr = window.devicePixelRatio || 1;
    const resize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      canvas.style.width = w + "px";
      canvas.style.height = h + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    resize();
    window.addEventListener("resize", resize);

    const colors = [
      "#e53935",
      "#fb8c00",
      "#fdd835",
      "#43a047",
      "#1e88e5",
      "#5e35b1",
      "#8e24aa",
      "#ffffff",
    ];

    const particles = Array.from({ length: 180 }).map(() => {
      const angle = (Math.random() * Math.PI) / 1 + Math.PI * 1.15;
      const speed = 4 + Math.random() * 8;
      return {
        x: window.innerWidth * 0.5,
        y: window.innerHeight * 0.18,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        g: 0.12 + Math.random() * 0.09,
        r: 2 + Math.random() * 3,
        rot: Math.random() * Math.PI,
        vr: (Math.random() - 0.5) * 0.22,
        color: colors[Math.floor(Math.random() * colors.length)],
        life: 95 + Math.random() * 40,
      };
    });

    const tick = () => {
      if (!alive) return;
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      for (const p of particles) {
        p.life -= 1;
        p.vy += p.g;
        p.x += p.vx;
        p.y += p.vy;
        p.rot += p.vr;

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = Math.max(0, Math.min(1, p.life / 120));
        ctx.fillRect(-p.r, -p.r * 0.6, p.r * 2.2, p.r * 1.2);
        ctx.restore();
      }

      if (particles.some((p) => p.life > 0 && p.y < window.innerHeight + 40)) {
        raf = requestAnimationFrame(tick);
      } else {
        ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      }
    };

    raf = requestAnimationFrame(tick);

    return () => {
      alive = false;
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    };
  }, [fireKey]);

  return <canvas ref={canvasRef} className="pointer-events-none fixed inset-0 z-50" />;
}

export default function App() {
  const reducedMotion = usePrefersReducedMotion();

  const [{ board, deck }, setGame] = useState(() => buildBoardAndDeck());
  const [selected, setSelected] = useState(() => new Set([12]));
  const [isWin, setIsWin] = useState(false);
  const [confettiKey, setConfettiKey] = useState(0);

  // Board display controls
  const [showAnswers, setShowAnswers] = useState(false);
  const [lockFree, setLockFree] = useState(true);

  // Caller controls
  const [callerLock, setCallerLock] = useState(false);
  const [lastDraw, setLastDraw] = useState(null); // { token, clue, chakraId }
  const [flipCard, setFlipCard] = useState(false);

  const drawnChakra = useMemo(() => (lastDraw ? byId(lastDraw.chakraId) : null), [lastDraw]);

  useEffect(() => {
    const win = hasChakra(selected);
    if (win && !isWin) {
      setIsWin(true);
      setConfettiKey((k) => k + 1);
    }
    if (!win && isWin) setIsWin(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected]);

  function newGame() {
    setGame(buildBoardAndDeck());
    setSelected(new Set([12]));
    setIsWin(false);
    setLastDraw(null);
    setFlipCard(false);
  }

  function clearSelection() {
    setSelected(new Set([12]));
    setIsWin(false);
  }

  function drawClue() {
    setGame((prev) => {
      const nextDeck = prev.deck.length ? prev.deck.slice() : shuffle(buildCluePool());
      const card = nextDeck.pop();
      setLastDraw(card);
      setFlipCard(false);
      requestAnimationFrame(() => requestAnimationFrame(() => setFlipCard(true)));
      return { ...prev, deck: nextDeck };
    });
  }

  function toggle(i) {
    if (i === 12 && lockFree) return;

    const cell = board[i];
    if (!cell) return;

    // Caller lock: only allow marking the EXACT drawn clue.
    if (callerLock) {
      if (!lastDraw) return;
      if (cell.type !== "CLUE") return;
      if (cell.token !== lastDraw.token) return;
    }

    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto w-full max-w-6xl px-5 py-8">
        <header className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-xl font-extrabold tracking-tight md:text-2xl">Chakra</h1>
            <p className="mt-1 max-w-2xl text-sm text-slate-300">
              Draw a clue card, then click the matching clue on the board to mark it. 5 in a row wins.
            </p>
          </div>

          <div className="mt-3 flex flex-wrap gap-2 md:mt-0">
            <button
              onClick={drawClue}
              className="rounded-2xl bg-sky-500/20 px-4 py-2 text-sm font-semibold ring-1 ring-sky-400/30 hover:bg-sky-500/30"
            >
              Draw Clue
            </button>
            <button
              onClick={newGame}
              className="rounded-2xl bg-white/10 px-4 py-2 text-sm font-semibold ring-1 ring-white/15 hover:bg-white/15"
            >
              New Game
            </button>
            <button
              onClick={clearSelection}
              className="rounded-2xl bg-white/10 px-4 py-2 text-sm font-semibold ring-1 ring-white/15 hover:bg-white/15"
            >
              Clear Marks
            </button>
          </div>
        </header>

        <main className="mt-6 grid gap-4 md:grid-cols-[360px_1fr]">
          {/* Left panel */}
          <section className="rounded-3xl bg-white/5 p-4 ring-1 ring-white/10">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-extrabold tracking-wide text-slate-100">Clue Card</h2>
              <div className="text-xs text-slate-300">Deck: {deck.length} left</div>
            </div>

            <div className="mt-3">
              <CallerCard clueCard={lastDraw} chakra={drawnChakra} flipped={flipCard} reducedMotion={reducedMotion} />
            </div>

            <div className="mt-3 rounded-2xl bg-black/20 p-3 ring-1 ring-white/10">
              <div className="flex items-center justify-between">
                <div className="text-xs text-slate-300">
                  Last draw: <span className="font-semibold text-slate-100">{lastDraw?.clue ?? "—"}</span>
                </div>
                <div className="text-xs text-slate-300">
                  Marked: <span className="font-semibold text-slate-100">{selected.size}/25</span>
                </div>
              </div>
            </div>

            <label className="mt-3 flex cursor-pointer items-center justify-between rounded-2xl bg-black/20 p-3 text-xs text-slate-200 ring-1 ring-white/10">
              <span className="font-semibold">Caller Lock (only mark the exact drawn clue)</span>
              <input
                type="checkbox"
                checked={callerLock}
                onChange={(e) => setCallerLock(e.target.checked)}
                className="h-4 w-4 accent-sky-400"
              />
            </label>

            <label className="mt-2 flex cursor-pointer items-center justify-between rounded-2xl bg-black/20 p-3 text-xs text-slate-200 ring-1 ring-white/10">
              <span className="font-semibold">Show answers (chakra name)</span>
              <input
                type="checkbox"
                checked={showAnswers}
                onChange={(e) => setShowAnswers(e.target.checked)}
                className="h-4 w-4 accent-sky-400"
              />
            </label>

            <label className="mt-2 flex cursor-pointer items-center justify-between rounded-2xl bg-black/20 p-3 text-xs text-slate-200 ring-1 ring-white/10">
              <span className="font-semibold">Lock FREE center</span>
              <input
                type="checkbox"
                checked={lockFree}
                onChange={(e) => setLockFree(e.target.checked)}
                className="h-4 w-4 accent-sky-400"
              />
            </label>

            <div className="mt-3 rounded-2xl bg-black/20 p-3 ring-1 ring-white/10">
              <div className="text-xs font-semibold text-slate-200">Why this satisfies “draw-able clues”</div>
              <div className="mt-2 text-xs text-slate-300">
                The board is built from the same clue pool as the deck (no replacement), so every clue on the board can be drawn.
              </div>
            </div>
          </section>

          {/* Board */}
          <section className="rounded-3xl bg-white/5 p-4 ring-1 ring-white/10">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-extrabold tracking-wide text-slate-100">5×5 Clue Board</h2>
              <AnimatePresence mode="wait">
                {isWin ? (
                  <motion.div
                    key="win"
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    className="rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-extrabold text-emerald-100 ring-1 ring-emerald-400/30"
                  >
                    CHAKRA! 🎉
                  </motion.div>
                ) : (
                  <motion.div
                    key="nowin"
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    className="text-xs text-slate-300"
                  >
                    {callerLock ? "Mark only the drawn clue" : "Mark any squares"}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="mt-3 grid grid-cols-5 gap-2">
              {board.map((cell, i) => (
                <ClueSquare
                  key={cell.token ?? i}
                  cell={cell}
                  marked={selected.has(i)}
                  onClick={() => toggle(i)}
                  reducedMotion={reducedMotion}
                  showAnswer={showAnswers}
                  lastDraw={lastDraw}
                  callerLock={callerLock}
                />
              ))}
            </div>

            <div className="mt-3 rounded-2xl bg-black/20 p-3 ring-1 ring-white/10">
              <div className="text-xs text-slate-300">
                Tip: With Caller Lock ON, this behaves like true chakra: draw → find exact match → mark.
              </div>
            </div>
          </section>
        </main>
      </div>

      {isWin ? <ConfettiBurst fireKey={confettiKey} /> : null}
    </div>
  );
}

function CallerCard({ clueCard, chakra, flipped, reducedMotion }) {
  const duration = reducedMotion ? 0 : 0.7;
  const wash = chakra?.color ?? "rgba(255,255,255,.14)";

  return (
    <div className="relative h-[220px] w-full [perspective:1000px]">
      <motion.div
        className="absolute inset-0 rounded-3xl"
        style={{ transformStyle: "preserve-3d" }}
        initial={false}
        animate={{ rotateY: flipped ? 180 : 0 }}
        transition={{ duration, ease: [0.2, 0.9, 0.2, 1] }}
      >
        {/* Front */}
        <div
          className="absolute inset-0 rounded-3xl bg-gradient-to-br from-white/10 to-white/5 p-4 ring-1 ring-white/10"
          style={{ backfaceVisibility: "hidden" }}
        >
          <div className="text-sm font-extrabold text-slate-100">Draw a Clue</div>
          <div className="mt-2 text-sm text-slate-300">
            Press <span className="font-semibold text-slate-100">Draw Clue</span> to reveal the next clue card.
          </div>
          <div className="mt-6 rounded-2xl bg-black/20 p-3 ring-1 ring-white/10">
            <div className="text-xs font-semibold text-slate-200">How to play</div>
            <div className="mt-1 text-xs text-slate-300">Match the drawn clue to the exact clue on the board and mark it.</div>
          </div>
        </div>

        {/* Back */}
        <div
          className="absolute inset-0 overflow-hidden rounded-3xl bg-gradient-to-br from-white/10 to-white/5 p-4 ring-1 ring-white/15"
          style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
        >
          <div className="pointer-events-none absolute inset-0 opacity-25" style={{ background: wash }} />

          <div className="relative">
            <div className="text-[11px] font-extrabold text-slate-200/90">CLUE</div>
            <div className="mt-2 text-base font-extrabold leading-snug text-slate-100">
              {clueCard?.clue ?? "—"}
            </div>

            <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-black/25 px-3 py-1 text-xs font-extrabold ring-1 ring-white/15">
              <span className="h-2.5 w-2.5 rounded-full" style={{ background: wash }} />
              <span>{chakra ? `${chakra.name} • ${chakra.sanskrit}` : "—"}</span>
            </div>

            <div className="mt-4 rounded-2xl bg-black/20 p-3 text-xs text-slate-300 ring-1 ring-white/10">
              Find this exact clue on the board and mark it.
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function ClueSquare({ cell, marked, onClick, reducedMotion, showAnswer, lastDraw, callerLock }) {
  const chakra = useMemo(() => (cell.type === "CLUE" ? byId(cell.chakraId) : null), [cell]);

  const isFree = cell.type === "FREE";

  const disabledNoDrawYet = callerLock && !isFree && !lastDraw;
  const disabledByCaller = callerLock && !isFree && lastDraw && cell.token !== lastDraw.token;
  const disabled = disabledNoDrawYet || disabledByCaller;

  const wash = isFree ? "rgba(255,255,255,.18)" : (marked ? chakra?.color : "rgba(255,255,255,.18)");

  return (
    <button
      type="button"
      onClick={disabled ? undefined : onClick}
      className={
        "group relative min-h-[98px] rounded-2xl p-2.5 text-left ring-1 transition " +
        (disabled
          ? "cursor-not-allowed bg-white/5 ring-white/10 opacity-55"
          : marked
            ? "bg-white/10 ring-white/25"
            : "bg-white/5 ring-white/10 hover:bg-white/8 hover:ring-white/15")
      }
      style={{ isolation: "isolate" }}
      aria-pressed={marked}
      aria-disabled={disabled}
      title={disabledNoDrawYet ? "Draw a clue first" : disabledByCaller ? "Only mark the exact drawn clue" : ""}
    >
      {/* Chakra color stripe */}
      <div className="pointer-events-none absolute left-0 top-0 h-1.5 w-full rounded-t-2xl" style={{ background: wash, opacity: 0.95 }} />

      {/* Chakra color wash */}
      <div className="pointer-events-none absolute inset-0 rounded-2xl opacity-25" style={{ background: wash }} />

      <div className="relative z-10">
        {isFree ? (
          <>
            <div className="text-[12px] font-extrabold">FREE</div>
            <div className="mt-1 text-[11px] text-slate-200/90">Auto-marked</div>
          </>
        ) : (
          <>
            <div className="line-clamp-5 break-words text-[12px] font-semibold leading-snug text-slate-100">
              {cell.clue}
            </div>

            {showAnswer ? (
              <div className="mt-2 inline-flex items-center gap-2 rounded-full bg-black/25 px-2.5 py-1 text-[10px] font-extrabold ring-1 ring-white/15">
                <span className="h-2.5 w-2.5 rounded-full" style={{ background: chakra?.color }} />
                <span className="truncate">{chakra?.name} • {chakra?.sanskrit}</span>
              </div>
            ) : (
              <div className="mt-2 hidden text-[10px] font-semibold text-slate-200/80 md:block">
                {callerLock ? (lastDraw ? "(Mark if it matches the draw)" : "(Draw a clue first)") : "(Click to mark)"}
              </div>
            )}
          </>
        )}
      </div>

      {/* Checkmark */}
      <AnimatePresence>
        {marked ? (
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ duration: reducedMotion ? 0 : 0.15 }}
            className="pointer-events-none absolute right-2 top-2 z-20 grid h-7 w-7 place-items-center rounded-full bg-black/30 ring-1 ring-white/15"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M20 7L10.5 16.5L4 10" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </button>
  );
}


