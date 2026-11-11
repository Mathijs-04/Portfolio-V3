import { useEffect, useLayoutEffect, useMemo, useRef } from "react";
import ShootingStar from "./ShootingStar.jsx";

// Stars are spread over the top 85% of the screen (down behind the mountains).
const STAR_COUNT = 200;
const DEEP_STAR_COUNT = 170;
// Same sky on every visit; change the seed for a different arrangement.
const SKY_SEED = 1404;
// Fallback only: the fog's playback rate comes from --bg-fog-speed in atmosphere.css.
const FOG_RATE = 0.5;

// Small seeded PRNG (mulberry32): returns floats in [0, 1).
function seededRandom(seed) {
    let a = seed;
    return () => {
        a = (a + 0x6d2b79f5) | 0;
        let t = Math.imul(a ^ (a >>> 15), 1 | a);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

/**
 * A believable starfield, in black and white:
 * - brightness follows a steep curve: many faint stars, a few bright ones;
 * - about a third of the stars gather in loose clusters, leaving emptier patches;
 * - towards the horizon stars get dimmer and twinkle more (thicker air);
 * - the brightest few get a small soft glow.
 */
function makeStars(count, rng, { sizeMin, sizeRange, dim, glowAbove }) {
    const gauss = () => Math.sqrt(-2 * Math.log(1 - rng())) * Math.cos(2 * Math.PI * rng());
    const clusters = Array.from({ length: 5 }, () => ({
        x: 8 + rng() * 84,
        y: 5 + rng() * 65,
        sx: 4 + rng() * 6,
        sy: 3 + rng() * 5,
    }));

    return Array.from({ length: count }, () => {
        let x = rng() * 100;
        let y = rng() * 100;
        if (rng() < 0.35) {
            const c = clusters[Math.floor(rng() * clusters.length)];
            const cx = c.x + gauss() * c.sx;
            const cy = c.y + gauss() * c.sy;
            if (cx >= 0 && cx <= 100 && cy >= 0 && cy <= 100) [x, y] = [cx, cy];
        }

        const mag = rng() ** 2.6; // 0 = faintest, 1 = brightest; most stars are faint
        const low = y / 100; // 0 = top of the sky, 1 = horizon
        const extinction = 1 - 0.45 * low ** 1.5;
        const min = (0.11 + mag * 0.42) * extinction * dim;
        const max = min * (1.2 + 0.55 * low + rng() * 0.15);

        return {
            bright: mag > glowAbove,
            style: {
                "--star-size": `${(sizeMin + mag * sizeRange).toFixed(2)}px`,
                "--star-top": `${y.toFixed(2)}%`,
                "--star-left": `${x.toFixed(2)}%`,
                "--star-min": min.toFixed(3),
                "--star-max": max.toFixed(3),
                "--star-duration": `${(3 + rng() * 6).toFixed(2)}s`,
                "--star-delay": `${(-rng() * 9).toFixed(2)}s`,
            },
        };
    });
}

function useStars() {
    return useMemo(() => {
        const rng = seededRandom(SKY_SEED);
        return {
            near: makeStars(STAR_COUNT, rng, { sizeMin: 0.8, sizeRange: 2.2, dim: 1, glowAbove: 0.8 }),
            // The deeper sky: only revealed on pages that lift the fog (html[data-sky="skills"]).
            deep: makeStars(DEEP_STAR_COUNT, rng, { sizeMin: 0.6, sizeRange: 1.3, dim: 0.7, glowAbove: 2 }),
        };
    }, []);
}

/**
 * The shared background, after The Arcane Archive: starfield + moon, the
 * mountain/forest/castle backdrop, looping fog and a film-grain overlay.
 * Fixed behind (and grain above) everything.
 */
function Atmosphere({ mode = "default" }) {
    const stars = useStars();
    const fogRef = useRef(null);

    // Pages can tune the sky through html[data-sky="..."] selectors in CSS.
    useLayoutEffect(() => {
        document.documentElement.dataset.sky = mode;
    }, [mode]);

    // The fog loop reads best slowed down; browsers reset the rate on load/play.
    useEffect(() => {
        const fog = fogRef.current;
        if (!fog) return;
        const setRate = () => {
            const css = getComputedStyle(document.documentElement).getPropertyValue("--bg-fog-speed");
            const rate = parseFloat(css) || FOG_RATE;
            fog.defaultPlaybackRate = rate;
            fog.playbackRate = rate;
        };
        setRate();
        fog.addEventListener("loadedmetadata", setRate);
        fog.addEventListener("play", setRate);
        return () => {
            fog.removeEventListener("loadedmetadata", setRate);
            fog.removeEventListener("play", setRate);
        };
    }, []);

    return (
        <>
            <div className="starfield" aria-hidden="true">
                <div className="starfield__milkyway" />
                <div className="starfield__moon" />
                <div className="starfield__halo" />
                {/* Masked so no star ever sits on or right next to the moon. */}
                <div className="starfield__sky">
                    <div className="starfield__deep">
                        {stars.deep.map(({ bright, style }, i) => (
                            <span key={i} className={bright ? "star star--bright" : "star"} style={style} />
                        ))}
                    </div>
                    <div className="starfield__stars">
                        {stars.near.map(({ bright, style }, i) => (
                            <span key={i} className={bright ? "star star--bright" : "star"} style={style} />
                        ))}
                    </div>
                    <ShootingStar />
                </div>
            </div>

            <div className="forest" aria-hidden="true">
                <div className="forest__frame">
                    {/* Faint light low in the sky, so the ridgeline reads against it. */}
                    <div className="forest__glow" />
                    {/* Solid night-coloured silhouette: hides the stars behind the mountains. */}
                    <div className="forest__occluder" />
                    <img className="forest__art" src="/fx/Background.webp" alt="" decoding="async" />
                </div>
            </div>

            <div className="fog" aria-hidden="true">
                <video ref={fogRef} className="fog__video" autoPlay muted loop playsInline preload="auto">
                    <source src="/fx/Fog-Loop.mp4" type="video/mp4" />
                </video>
            </div>

            <svg className="svg-filters" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    {/* Straight from The Arcane Archive: rough, bleeding, worn ink. Used by .ink */}
                    <filter
                        id="vintage-print"
                        x="-10%"
                        y="-20%"
                        width="120%"
                        height="140%"
                        colorInterpolationFilters="sRGB"
                    >
                        <feTurbulence type="fractalNoise" baseFrequency="0.042" numOctaves="3" seed="9" result="edgeNoise" />
                        <feDisplacementMap
                            in="SourceGraphic"
                            in2="edgeNoise"
                            scale="0.36"
                            xChannelSelector="R"
                            yChannelSelector="G"
                            result="roughened"
                        />
                        <feGaussianBlur in="roughened" stdDeviation="0.26" result="bleed" />
                        <feColorMatrix
                            in="bleed"
                            type="matrix"
                            values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 0.24 0"
                            result="bleedFaint"
                        />
                        <feMerge result="inkBleed">
                            <feMergeNode in="bleedFaint" />
                            <feMergeNode in="roughened" />
                        </feMerge>
                        <feTurbulence type="fractalNoise" baseFrequency="0.95" numOctaves="4" seed="3" result="fineNoise" />
                        <feColorMatrix
                            in="fineNoise"
                            type="matrix"
                            values="0 0 0 0 0.11  0 0 0 0 0.10  0 0 0 0 0.09  0 0 0 0.62 0"
                            result="densityNoise"
                        />
                        <feComposite in="densityNoise" in2="inkBleed" operator="in" result="densityNoiseMasked" />
                        <feBlend in="inkBleed" in2="densityNoiseMasked" mode="multiply" result="densityClipped" />
                        <feTurbulence type="fractalNoise" baseFrequency="1.35" numOctaves="2" seed="17" result="wearNoise" />
                        <feColorMatrix
                            in="wearNoise"
                            type="matrix"
                            values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0"
                            result="wearAlpha"
                        />
                        <feComponentTransfer in="wearAlpha" result="wearSpecks">
                            <feFuncA type="discrete" tableValues="1 1 1 0.97 1 1 0.96 1" />
                        </feComponentTransfer>
                        <feComposite in="densityClipped" in2="wearSpecks" operator="in" result="worn" />
                        <feColorMatrix
                            in="worn"
                            type="matrix"
                            values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 1.04 0"
                            result="inkBoost"
                        />
                        <feComposite in="inkBoost" in2="inkBleed" operator="in" />
                    </filter>
                </defs>
            </svg>

            <div className="grain" aria-hidden="true" />
        </>
    );
}

export default Atmosphere;
