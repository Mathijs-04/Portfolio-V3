import { useEffect, useLayoutEffect, useMemo, useRef } from "react";

const STAR_COUNT = 90;
const FOG_RATE = 0.6;

function makeStars(count, { minSize, sizeRange, min, max }) {
    return Array.from({ length: count }, () => ({
        "--star-size": `${(minSize + Math.random() * sizeRange).toFixed(2)}px`,
        "--star-top": `${(Math.random() * 100).toFixed(2)}%`,
        "--star-left": `${(Math.random() * 100).toFixed(2)}%`,
        "--star-min": (min + Math.random() * 0.06).toFixed(2),
        "--star-max": (max + Math.random() * 0.08).toFixed(2),
        "--star-duration": `${(4 + Math.random() * 6).toFixed(2)}s`,
        "--star-delay": `${(-Math.random() * 10).toFixed(2)}s`,
    }));
}

/**
 * The shared background, after The Arcane Archive: a twinkling starfield,
 * looping fog and a film-grain overlay. Fixed behind (and grain above) everything.
 */
function Atmosphere({ mode = "default" }) {
    const stars = useMemo(() => makeStars(STAR_COUNT, { minSize: 1, sizeRange: 2, min: 0.12, max: 0.22 }), []);
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
            fog.defaultPlaybackRate = FOG_RATE;
            fog.playbackRate = FOG_RATE;
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
                <div className="starfield__stars">
                    {stars.map((style, i) => (
                        <span key={i} className="star" style={style} />
                    ))}
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
