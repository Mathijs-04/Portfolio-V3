import { useMemo } from "react";
import CardFace, { RARITY_LABEL } from "./CardFace.jsx";
import useTilt from "./useTilt.js";

const EMBERS = 10;

/** Sparks rising up a legendary card, behind its art and text (transform/opacity only). */
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

/**
 * A trading card that tilts under the pointer (ported from the prototype).
 * Click or Enter/Space opens it in the inspector, which turns it over.
 */
function ProjectCard({ project, hidden, onInspect }) {
    const { ref, onPointerMove, onPointerLeave } = useTilt(project.rarity === "legendary" ? 12 : 10);

    // Measure the slot, not the card: the card may still be lifted and tilted by the hover.
    const open = () => {
        onPointerLeave();
        onInspect(project, ref.current.parentElement.getBoundingClientRect());
    };

    return (
        <div
            ref={ref}
            className="card"
            data-rarity={project.rarity}
            style={hidden ? { visibility: "hidden" } : undefined}
            role="button"
            tabIndex={0}
            aria-label={`${project.name}, ${RARITY_LABEL[project.rarity]}. Open details.`}
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
            <div className="card__shadow" aria-hidden="true" />
            <div className="card__inner">
                <CardFace project={project}>{project.rarity === "legendary" && <Embers />}</CardFace>
            </div>
        </div>
    );
}

export default ProjectCard;
