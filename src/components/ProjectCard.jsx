import { useMemo } from "react";
import CardFace, { RARITY_LABEL } from "./CardFace.jsx";
import useTilt from "./useTilt.js";

const EMBERS = 6;

/** Sparks rising off legendary cards (transform/opacity only). */
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
 * Not clickable yet: the inspector/back comes in a later step.
 */
function ProjectCard({ project }) {
    const { ref, onPointerMove, onPointerLeave } = useTilt(project.rarity === "legendary" ? 12 : 10);

    return (
        <div
            ref={ref}
            className="card"
            data-rarity={project.rarity}
            tabIndex={0}
            aria-label={`${project.name}, ${RARITY_LABEL[project.rarity]}`}
            onPointerMove={onPointerMove}
            onPointerLeave={onPointerLeave}
        >
            <div className="card__shadow" aria-hidden="true" />
            <div className="card__inner">
                <CardFace project={project} />
            </div>
            {project.rarity === "legendary" && <Embers />}
        </div>
    );
}

export default ProjectCard;
