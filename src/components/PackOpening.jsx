import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import CardFace, { RARITY_LABEL } from "./CardFace.jsx";
import CardCover from "./CardCover.jsx";
import Button from "./Button.jsx";
import { PackArt } from "./BoosterPack.jsx";
import { bestRarity } from "../data/collection.js";

const CARD_RATIO = 88 / 63; // height / width
const PACK_RATIO = 104 / 63;

// Phases of the opening. Times (ms) are when each phase starts.
const RISE_MS = 750; // pack flies to the centre
const TEAR_MS = 1100; // shake, the top strip is ripped off, light spills out
const CARD_STAGGER = 0.07; // s between cards leaving the pack

const FLY = { type: "tween", duration: 0.7, ease: [0.22, 1, 0.36, 1] };
const SPILL = { type: "spring", stiffness: 115, damping: 17, mass: 0.9 };
const LAND = { type: "tween", duration: 0.8, ease: [0.33, 1, 0.68, 1] };

const EMBERS = 10;

// Epic and legendary pulls: the card charges up before it turns, then celebrates.
const CHARGE_MS = { epic: 450, legendary: 800 };
const SPARKS = { rare: 6, epic: 16, legendary: 30 };
const SHAKE = {
    epic: { px: 5, ms: 380 },
    legendary: { px: 10, ms: 620 },
};
const isBig = (rarity) => rarity === "epic" || rarity === "legendary";

/** Sparks thrown out from a card as it turns (transform/opacity only, one shot). */
function Sparks({ count, size }) {
    const sparks = useMemo(
        () =>
            Array.from({ length: count }, () => {
                const a = Math.random() * Math.PI * 2;
                const dist = size * (0.55 + Math.random() * 0.95);
                return {
                    "--dx": `${(Math.cos(a) * dist).toFixed(1)}px`,
                    "--dy": `${(Math.sin(a) * dist * 0.85 + size * 0.3).toFixed(1)}px`, // a little gravity
                    "--s": `${(2.5 + Math.random() * 3.5).toFixed(1)}px`,
                    "--d": `${(0.85 + Math.random() * 0.7).toFixed(2)}s`,
                    "--delay": `${(Math.random() * 0.12).toFixed(2)}s`,
                };
            }),
        [count, size],
    );
    return (
        <span className="reveal-card__sparks" aria-hidden="true">
            {sparks.map((style, i) => (
                <span key={i} className="spark" style={style} />
            ))}
        </span>
    );
}

/** Legendary sparks (same as on the grid cards). */
function Embers() {
    const embers = useMemo(
        () =>
            Array.from({ length: EMBERS }, () => ({
                "--x": `${(10 + Math.random() * 80).toFixed(1)}%`,
                "--drift": `${(-16 + Math.random() * 32).toFixed(1)}px`,
                "--size": `${(2 + Math.random() * 2).toFixed(1)}px`,
                "--dur": `${(3.6 + Math.random() * 3).toFixed(2)}s`,
                "--delay": `${(-Math.random() * 6).toFixed(2)}s`,
            })),
        [],
    );
    return (
        <div className="embers" aria-hidden="true">
            {embers.map((style, i) => (
                <span key={i} className="ember" style={style} />
            ))}
        </div>
    );
}

/** Where the pack sits in the middle of the screen. */
function packTarget() {
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const height = Math.min(vh * 0.62, 520, (vw * 0.7) * PACK_RATIO);
    const width = height / PACK_RATIO;
    return { width, height, left: (vw - width) / 2, top: (vh - height) / 2 - vh * 0.03 };
}

/** The spread: up to 4 across (3 on tall screens), rows centred, room left for the button. */
function spreadLayout(n) {
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const portrait = vw / vh < 0.9;
    const cols = portrait ? (n <= 4 ? 2 : 3) : Math.min(n, 4);
    const rows = Math.ceil(n / cols);
    const gap = portrait ? 12 : Math.round(Math.min(30, vw * 0.02));
    const top = portrait ? 64 : 48;
    const bottom = portrait ? 104 : 120;
    const availW = vw * 0.92;
    const availH = vh - top - bottom;
    const w = Math.min(230, (availW - gap * (cols - 1)) / cols, ((availH - gap * (rows - 1)) / rows) / CARD_RATIO);
    const h = w * CARD_RATIO;
    const y0 = top + (availH - (rows * h + (rows - 1) * gap)) / 2;
    const cells = Array.from({ length: n }, (_, i) => {
        const r = Math.floor(i / cols);
        const inRow = r === rows - 1 ? n - r * cols : cols;
        const x0 = (vw - (inRow * w + (inRow - 1) * gap)) / 2;
        return { left: x0 + (i % cols) * (w + gap), top: y0 + r * (h + gap) };
    });
    return { w, h, cells };
}

function useViewportKey() {
    const [key, setKey] = useState(0);
    useEffect(() => {
        const onResize = () => setKey((k) => k + 1);
        window.addEventListener("resize", onResize);
        return () => window.removeEventListener("resize", onResize);
    }, []);
    return key;
}

/**
 * Opening a booster pack, in a full-screen overlay:
 *   rise    the pack flies from its place on the page to the centre
 *   tear    it shakes, the crimped top tears off and light (in the colour of the best card
 *           inside) spills out
 *   spill   the wrapper drops away while the cards shoot out face down into a spread
 *   reveal  click a card to turn it over; rarer cards flash as they turn
 *   collect "Add to collection" flies every card into its slot in the deck below
 * Only transform/opacity animate. `onLand(slug)` fires as each card reaches its slot,
 * `onDone()` when the overlay can go.
 */
function PackOpening({ cards, origin, onLand, onDone }) {
    const reduced = useReducedMotion();
    const viewportKey = useViewportKey();
    const [phase, setPhase] = useState(reduced ? "reveal" : "rise");
    const [flipped, setFlipped] = useState(() => new Set());
    const [targets, setTargets] = useState(null); // landing positions, measured on collect
    const [flash, setFlash] = useState({ n: 0, rarity: null });
    const [charging, setCharging] = useState(() => new Set());
    const [celebrated, setCelebrated] = useState(() => new Set()); // turned by hand, rare or better
    const landed = useRef(new Set());
    const firstCardRef = useRef(null);
    const stageRef = useRef(null);
    const chargeTimers = useRef([]);

    useEffect(() => () => chargeTimers.current.forEach(clearTimeout), []);

    // eslint-disable-next-line react-hooks/exhaustive-deps
    const pack = useMemo(packTarget, [viewportKey]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    const spread = useMemo(() => spreadLayout(cards.length), [cards.length, viewportKey]);
    const light = bestRarity(cards);

    // The scripted part: rise → tear → spill → reveal.
    useEffect(() => {
        if (reduced) return;
        const timers = [
            setTimeout(() => setPhase("tear"), RISE_MS),
            setTimeout(() => setPhase("spill"), RISE_MS + TEAR_MS),
            setTimeout(() => setPhase("reveal"), RISE_MS + TEAR_MS + 700 + cards.length * CARD_STAGGER * 1000),
        ];
        return () => timers.forEach(clearTimeout);
    }, [reduced, cards.length]);

    useEffect(() => {
        if (phase === "reveal") firstCardRef.current?.focus({ preventScroll: true });
    }, [phase]);

    // Lock the page while the overlay is up.
    useEffect(() => {
        const root = document.documentElement;
        const prev = root.style.overflow;
        root.style.overflow = "hidden";
        return () => {
            root.style.overflow = prev;
        };
    }, []);

    const turn = (i) => {
        const { rarity } = cards[i];
        setFlipped((prev) => new Set(prev).add(i));
        if (rarity === "common" || reduced) return;
        setCelebrated((prev) => new Set(prev).add(i));
        if (!isBig(rarity)) return; // rare: only a small shimmer (ring + a few sparks)
        setFlash((f) => ({ n: f.n + 1, rarity }));
        const { px, ms } = SHAKE[rarity];
        stageRef.current?.animate(
            [
                { translate: "0 0" },
                { translate: `${-px}px ${px * 0.4}px` },
                { translate: `${px * 0.8}px ${-px * 0.5}px` },
                { translate: `${-px * 0.5}px ${px * 0.3}px` },
                { translate: `${px * 0.25}px 0` },
                { translate: "0 0" },
            ],
            { duration: ms, easing: "ease-out" },
        );
    };

    // Epic and legendary cards charge up (tremble, glow swells) before they turn.
    const flip = (i) => {
        if (phase !== "reveal" || flipped.has(i) || charging.has(i)) return;
        const { rarity } = cards[i];
        if (!isBig(rarity) || reduced) return turn(i);
        setCharging((prev) => new Set(prev).add(i));
        chargeTimers.current.push(
            setTimeout(() => {
                setCharging((prev) => {
                    const next = new Set(prev);
                    next.delete(i);
                    return next;
                });
                turn(i);
            }, CHARGE_MS[rarity]),
        );
    };

    const collect = useCallback(() => {
        if (phase === "collect") return;
        // Measure each card's slot in the deck (already rendered, hidden) and fly there.
        const t = cards.map((card, i) => {
            const slot = document.querySelector(`.deck__slot[data-slot="${card.slug}"]`)?.getBoundingClientRect();
            const cell = spread.cells[i];
            if (!slot) return { x: 0, y: window.innerHeight, scale: 1 };
            return {
                x: slot.left + slot.width / 2 - (cell.left + spread.w / 2),
                y: slot.top + slot.height / 2 - (cell.top + spread.h / 2),
                scale: slot.width / spread.w,
            };
        });
        chargeTimers.current.forEach(clearTimeout);
        setCharging(new Set());
        setFlipped(new Set(cards.map((_, i) => i)));
        setTargets(t);
        setPhase("collect");
        if (reduced) {
            cards.forEach((c) => onLand(c.slug));
            onDone();
        }
    }, [phase, cards, spread, reduced, onLand, onDone]);

    useEffect(() => {
        const onKey = (e) => e.key === "Escape" && phase !== "rise" && phase !== "tear" && collect();
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [phase, collect]);

    const cardLanded = (slug) => {
        if (landed.current.has(slug)) return;
        landed.current.add(slug);
        onLand(slug);
        if (landed.current.size === cards.length) onDone();
    };

    const allFlipped = flipped.size === cards.length;
    const packGone = phase === "spill" || phase === "reveal" || phase === "collect";
    const cardsOut = packGone;

    // The pack starts exactly where it sat on the page.
    const fromPage = {
        x: origin.left + origin.width / 2 - (pack.left + pack.width / 2),
        y: origin.top + origin.height / 2 - (pack.top + pack.height / 2),
        scale: origin.width / pack.width,
    };

    // Cards start inside the pack's open top.
    const mouth = { x: pack.left + pack.width / 2, y: pack.top + pack.height * 0.2 };

    return (
        <div className="pack-opening" data-phase={phase} data-light={light} role="dialog" aria-modal="true" aria-label="Booster pack">
            <motion.div
                className="pack-opening__veil"
                aria-hidden="true"
                initial={{ opacity: 0 }}
                animate={{ opacity: phase === "collect" ? 0 : 1 }}
                transition={{ duration: phase === "collect" ? 0.6 : 0.45, delay: phase === "collect" ? 0.25 : 0 }}
            />
            <motion.div
                key={flash.n}
                className="pack-opening__flash"
                data-rarity={flash.rarity ?? undefined}
                aria-hidden="true"
                initial={{ opacity: flash.n ? 1 : 0 }}
                animate={{ opacity: 0 }}
                transition={{ duration: flash.rarity === "legendary" ? 1.8 : 1.2, ease: "easeOut" }}
            />

            {/* The pack */}
            {!reduced && (
                <motion.div
                    className="pack-flight"
                    data-rarity={light}
                    style={{ left: pack.left, top: pack.top, width: pack.width, height: pack.height }}
                    initial={fromPage}
                    animate={
                        packGone
                            ? { x: 0, y: window.innerHeight * 0.75, scale: 0.92, rotate: 7, opacity: 0 }
                            : { x: 0, y: 0, scale: 1, rotate: 0, opacity: 1 }
                    }
                    transition={packGone ? { duration: 0.75, ease: [0.55, 0, 0.75, 0.4] } : FLY}
                >
                    <div className="pack-flight__light" aria-hidden="true" />
                    <div className="pack-flight__shake">
                        <PackArt count={cards.length} torn={phase !== "rise"} />
                    </div>
                </motion.div>
            )}

            {/* The spread (wrapped so a big pull can shake it) */}
            <div ref={stageRef} className="pack-opening__stage">
            {cards.map((card, i) => {
                const cell = spread.cells[i];
                const out = {
                    x: mouth.x - (cell.left + spread.w / 2),
                    y: mouth.y - (cell.top + spread.h / 2),
                    scale: 0.34,
                    rotate: ((i * 37) % 21) - 10,
                    opacity: 0,
                };
                const isFlipped = flipped.has(i);
                const celebrate = celebrated.has(i);
                return (
                    <motion.div
                        key={card.slug}
                        className="reveal-card"
                        data-rarity={card.rarity}
                        data-flipped={isFlipped || undefined}
                        data-charging={charging.has(i) || undefined}
                        data-celebrate={(celebrate && isBig(card.rarity)) || undefined}
                        data-shimmer={(celebrate && card.rarity === "rare") || undefined}
                        style={{
                            left: cell.left,
                            top: cell.top,
                            width: spread.w,
                            height: spread.h,
                            zIndex: celebrate || charging.has(i) ? 30 + i : 10 + i,
                        }}
                        initial={reduced ? false : out}
                        animate={
                            phase === "collect" && targets
                                ? { ...targets[i], rotate: 0, opacity: 1 }
                                : cardsOut || reduced
                                  ? { x: 0, y: 0, scale: 1, rotate: 0, opacity: 1 }
                                  : out
                        }
                        transition={
                            phase === "collect"
                                ? { ...LAND, delay: i * 0.05 }
                                : { ...SPILL, delay: 0.12 + i * CARD_STAGGER, opacity: { duration: 0.2, delay: 0.12 + i * CARD_STAGGER } }
                        }
                        onAnimationComplete={() => phase === "collect" && cardLanded(card.slug)}
                    >
                        {celebrate && card.rarity === "legendary" && (
                            <div className="reveal-card__rays" aria-hidden="true" />
                        )}
                        <div className="reveal-card__aura" aria-hidden="true" />
                        <div className="reveal-card__burst" aria-hidden="true" />
                        {celebrate && (
                            <>
                                <span className="reveal-card__ring" aria-hidden="true" />
                                {card.rarity === "legendary" && (
                                    <span className="reveal-card__ring reveal-card__ring--late" aria-hidden="true" />
                                )}
                            </>
                        )}
                        <button
                            ref={i === 0 ? firstCardRef : undefined}
                            type="button"
                            className="reveal-card__flip"
                            disabled={phase !== "reveal"}
                            aria-label={isFlipped ? `${card.name}, ${RARITY_LABEL[card.rarity]}` : `Turn over card ${i + 1} of ${cards.length}`}
                            onClick={() => flip(i)}
                        >
                            <span className="reveal-card__side reveal-card__side--cover">
                                <CardCover />
                            </span>
                            <span className="reveal-card__side reveal-card__side--face">
                                <CardFace project={card}>{card.rarity === "legendary" && <Embers />}</CardFace>
                            </span>
                        </button>
                        {celebrate && (
                            <Sparks
                                count={SPARKS[card.rarity]}
                                size={card.rarity === "rare" ? spread.w * 0.55 : spread.w}
                            />
                        )}
                    </motion.div>
                );
            })}
            </div>

            <motion.div
                className="pack-opening__actions"
                initial={{ opacity: 0, y: 12 }}
                animate={allFlipped && phase === "reveal" ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
                transition={{ duration: 0.45, delay: allFlipped && phase === "reveal" ? 0.5 : 0 }}
                style={{ pointerEvents: allFlipped && phase === "reveal" ? "auto" : "none" }}
            >
                <Button onClick={collect} tabIndex={allFlipped ? 0 : -1}>
                    Add to collection
                </Button>
            </motion.div>
        </div>
    );
}

export default PackOpening;
