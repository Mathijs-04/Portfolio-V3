import Gem from "./Gem.jsx";
import TechIcon from "./TechIcon.jsx";

export const RARITY_LABEL = {
    legendary: "Legendary",
    epic: "Epic",
    rare: "Rare",
    common: "Common",
};

// Tiles that fit across the front; with more tech the last tile becomes "+N".
const MAX_FRONT_TILES = 6;

export function Ornaments() {
    return (
        <>
            <span className="ornament ornament--tl" aria-hidden="true" />
            <span className="ornament ornament--tr" aria-hidden="true" />
            <span className="ornament ornament--bl" aria-hidden="true" />
            <span className="ornament ornament--br" aria-hidden="true" />
        </>
    );
}

/**
 * The front of a project card (ported from the prototype). Sizes are in container
 * units (cqw), so the same face renders at any card size.
 * `project`: { name, rarity, tagline, tech[], cover } (cover: the 640px card art thumbnail).
 * `children` are painted on the stone, behind the art and text (e.g. legendary embers).
 */
function CardFace({ project, children }) {
    const { name, rarity, tagline, tech, cover } = project;
    const shown = tech.length > MAX_FRONT_TILES ? MAX_FRONT_TILES - 1 : tech.length;
    const extraTech = tech.length - shown;

    return (
        <div className="face" data-rarity={rarity}>
            <div className="face__surface" aria-hidden="true" />
            {rarity === "epic" && <div className="face__arcane" aria-hidden="true" />}
            {children}
            <Ornaments />
            <Gem className="face__gem" />

            <h3 className="face__name">{name}</h3>

            <figure className="face__art">
                <img src={cover} alt={`Preview of ${name}`} loading="lazy" decoding="async" />
            </figure>

            <p className="face__tagline">{tagline}</p>

            <ul className="face__tech" aria-label="Built with">
                {tech.slice(0, shown).map((t) => (
                    <li key={t} title={t}>
                        <TechIcon name={t} />
                        <span className="sr-only">{t}</span>
                    </li>
                ))}
                {extraTech > 0 && (
                    <li className="face__tech-more" title={tech.slice(shown).join(", ")}>
                        +{extraTech}
                    </li>
                )}
            </ul>

            <p className="face__rarity">{RARITY_LABEL[rarity]}</p>

            <div className="face__fx" aria-hidden="true">
                <div className="face__foil" />
            </div>
        </div>
    );
}

export default CardFace;
