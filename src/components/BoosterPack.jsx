import { forwardRef, useMemo } from "react";
import { Ornaments } from "./CardFace.jsx";
import useTilt from "./useTilt.js";
import { PACK_SIZE } from "../data/collection.js";

const FLECKS = 12;

/** Bits of foil that pop off along the tear line, left to right as the strip peels away. */
function Flecks() {
    const flecks = useMemo(
        () =>
            Array.from({ length: FLECKS }, (_, i) => {
                const x = 6 + (i / (FLECKS - 1)) * 88 + (Math.random() - 0.5) * 6;
                return {
                    "--x": `${x.toFixed(1)}%`,
                    "--fx": `${(-6 + Math.random() * 16).toFixed(1)}cqw`,
                    "--fy": `${(-10 - Math.random() * 22).toFixed(1)}cqw`,
                    "--fr": `${(-200 + Math.random() * 400).toFixed(0)}deg`,
                    "--delay": `${(0.12 + (x / 100) * 0.42).toFixed(2)}s`,
                };
            }),
        [],
    );
    return (
        <div className="pack-art__flecks" aria-hidden="true">
            {flecks.map((style, i) => (
                <span key={i} className="pack-art__fleck" style={style} />
            ))}
        </div>
    );
}

/**
 * The printed wrapper of a booster pack: crimped foil strips top and bottom, a plain obsidian
 * body with a gold double rule, the card ornaments and the set's name. Sized in cqw so it renders at any size (page and opening overlay).
 * `torn` rips the top strip off (used by the opening): it peels up from the left while the right
 * end holds, then snaps free; the tear line turns ragged and bits of foil pop off.
 */
export function PackArt({ count = PACK_SIZE, torn = false }) {
    return (
        <div className="pack-art" data-torn={torn || undefined}>
            <div className="pack-art__crimp pack-art__crimp--top" aria-hidden="true">
                <span className="pack-art__tear pack-art__tear--strip" />
            </div>
            <div className="pack-art__body">
                <div className="pack-art__surface" aria-hidden="true" />
                <span className="pack-art__tear pack-art__tear--body" aria-hidden="true" />
                <Ornaments />
                <p className="pack-art__title">Projects</p>
                <p className="pack-art__count">{count} cards</p>
                <div className="pack-art__sheen" aria-hidden="true" />
            </div>
            <div className="pack-art__crimp pack-art__crimp--bottom" aria-hidden="true" />
            {torn && <Flecks />}
        </div>
    );
}

/**
 * The sealed pack waiting on the Projects page, on top of a small stack that shows how many
 * packs are left. Tilts under the pointer like the cards. Clicking it (or Enter/Space)
 * calls `onOpen(rect)` with the pack's position, where the opening flight starts.
 */
const BoosterPack = forwardRef(function BoosterPack({ packsLeft, nextCount, alone, onOpen }, packRef) {
    const { ref, onPointerMove, onPointerLeave } = useTilt(9);

    const open = () => {
        onPointerLeave();
        onOpen(ref.current.parentElement.getBoundingClientRect());
    };

    return (
        <section className={`pack-stage${alone ? " pack-stage--alone" : ""}`} aria-label="Booster packs">
            <div ref={packRef} className="pack-stack" style={{ "--ghosts": Math.min(packsLeft - 1, 3) }}>
                {Array.from({ length: Math.min(packsLeft - 1, 3) }, (_, i) => (
                    <span key={i} className="pack-ghost" style={{ "--i": i + 1 }} aria-hidden="true" />
                ))}
                <div className="pack-float">
                    <div
                        ref={ref}
                        className="pack"
                        role="button"
                        tabIndex={0}
                        aria-label={`Open a booster pack (${packsLeft} left)`}
                        onPointerMove={onPointerMove}
                        onPointerLeave={onPointerLeave}
                        onClick={open}
                        onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                                e.preventDefault();
                                open();
                            }
                        }}
                    >
                        <div className="pack__glow" aria-hidden="true" />
                        <PackArt count={nextCount} />
                    </div>
                </div>
            </div>
        </section>
    );
});

export default BoosterPack;
