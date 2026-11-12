import { useEffect, useMemo, useState } from "react";
import { constellations, LAYOUTS } from "../data/constellations.js";

// Portrait screens get their own arrangement (see LAYOUTS in data/constellations.js).
const PORTRAIT = "(max-aspect-ratio: 1/1)";

function useLayoutName() {
    const [tall, setTall] = useState(() => window.matchMedia(PORTRAIT).matches);
    useEffect(() => {
        const mq = window.matchMedia(PORTRAIT);
        const update = () => setTall(mq.matches);
        update();
        mq.addEventListener("change", update);
        return () => mq.removeEventListener("change", update);
    }, []);
    return tall ? "tall" : "wide";
}

// Small seeded PRNG (mulberry32), so twinkles and weathering are the same on every visit.
function seededRandom(seed) {
    let a = seed;
    return () => {
        a = (a + 0x6d2b79f5) | 0;
        let t = Math.imul(a ^ (a >>> 15), 1 | a);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

const fixed = (n, d = 3) => +n.toFixed(d);

/**
 * A mask along a line: fades in, then patchy like worn ink (brighter and dimmer stretches,
 * now and then a nearly bare spot), then fades out.
 */
function weather(rng) {
    const start = 0.14 + rng() * 0.1;
    const end = 0.86 - rng() * 0.1;
    const stops = ["transparent 0%"];
    for (let t = start; t < end; t += 0.06 + rng() * 0.08) {
        const alpha = rng() < 0.15 ? 0.08 + rng() * 0.15 : 0.4 + rng() * 0.6;
        stops.push(`rgba(0,0,0,${alpha.toFixed(2)}) ${(t * 100).toFixed(1)}%`);
    }
    stops.push(`rgba(0,0,0,${(0.4 + rng() * 0.6).toFixed(2)}) ${(end * 100).toFixed(1)}%`, "transparent 100%");
    return `linear-gradient(to right, ${stops.join(", ")})`;
}

/** Puts every constellation in place for one layout: mirrored if asked, lines cut short. */
function arrange(name) {
    const { rows } = LAYOUTS[name];

    return constellations.map((c) => {
        const rng = seededRandom(c.seed * 131);
        const at = c.at[name];
        const w = Math.max(...c.stars.map((s) => s.x));
        const h = Math.max(...c.stars.map((s) => s.y));
        // Like the background stars: a little dimmer towards the horizon.
        const dimAt = (y) => 1 - 0.3 * Math.max(0, (at.y + y) / rows) ** 1.5;
        const flip = (x) => (at.mirror ? w - x : x);
        const twinkle = () => ({ dur: 4 + rng() * 6, delay: -rng() * 9 });

        const stars = c.stars.map((s) => ({ ...s, x: flip(s.x), dim: dimAt(s.y), ...twinkle() }));
        const dust = c.dust.map((s) => ({ ...s, x: flip(s.x), dim: dimAt(s.y), ...twinkle() }));

        // Lines are faint straight glows rather than drawn strokes: they stop short of their
        // stars, fade in and out at the ends and are weathered along the way (see weather()).
        // The longer the line, the fainter.
        const lines = c.lines.map(([a, b], k) => {
            const p = stars[a];
            const q = stars[b];
            const len = Math.hypot(q.x - p.x, q.y - p.y);
            const ux = (q.x - p.x) / len;
            const uy = (q.y - p.y) / len;
            const gp = 0.16 + p.mag * 0.08;
            const gq = 0.16 + q.mag * 0.08;
            const mask = weather(rng);
            return {
                key: k,
                style: {
                    "--lx": fixed(p.x + ux * gp),
                    "--ly": fixed(p.y + uy * gp),
                    "--len": fixed(len - gp - gq),
                    "--angle": `${fixed((Math.atan2(uy, ux) * 180) / Math.PI, 2)}deg`,
                    "--strength": fixed((0.7 + rng() * 0.3) * Math.min(1, 1.1 / len) ** 0.6, 2),
                    WebkitMaskImage: mask,
                    maskImage: mask,
                },
            };
        });

        return { seed: c.seed, x: at.x, y: at.y, w, h, stars, dust, lines };
    });
}

function starStyle(s) {
    return {
        "--sx": fixed(s.x),
        "--sy": fixed(s.y),
        "--mag": fixed(s.mag, 2),
        "--dim": fixed(s.dim),
        "--twinkle": `${s.dur.toFixed(2)}s`,
        "--twinkle-delay": `${s.delay.toFixed(2)}s`,
    };
}

/**
 * The constellations on the Skills page, drawn into the shared night sky. Nothing moves:
 * stars twinkle with opacity and the lines fade in once.
 */
function Constellations() {
    const name = useLayoutName();
    const layout = LAYOUTS[name];
    const placed = useMemo(() => arrange(name), [name]);

    return (
        <div className="sky" aria-hidden="true">
            <div
                className="sky__grid"
                style={{
                    "--cols": layout.cols,
                    "--rows": layout.rows,
                    "--side": layout.side,
                    "--bottom": layout.bottom,
                }}
            >
                {placed.map((c) => (
                    <div
                        key={c.seed}
                        className="constellation"
                        style={{ "--x": c.x, "--y": c.y, "--w": c.w, "--h": c.h }}
                    >
                        <div className="constellation__lines">
                            {c.lines.map((l) => (
                                <span key={l.key} className="c-line" style={l.style} />
                            ))}
                        </div>
                        {c.dust.map((s, j) => (
                            <span key={`d${j}`} className="c-dust" style={starStyle(s)} />
                        ))}
                        {c.stars.map((s, j) => (
                            <span key={j} className="c-star" data-bright={s.mag > 0.6 || undefined} style={starStyle(s)}>
                                <span className="c-star__core" />
                            </span>
                        ))}
                    </div>
                ))}
            </div>
        </div>
    );
}

export default Constellations;
