import Gem from "./Gem.jsx";

export const RARITY_LABEL = {
    legendary: "Legendary",
    epic: "Epic",
    rare: "Rare",
    common: "Common",
};

const MAX_FRONT_TECH = 4;

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
 * `project`: { name, rarity, tagline, tech[], image }.
 */
function CardFace({ project }) {
    const { name, rarity, tagline, tech, image } = project;
    const extraTech = tech.length - MAX_FRONT_TECH;

    return (
        <div className="face" data-rarity={rarity}>
            <div className="face__surface" aria-hidden="true" />
            <Ornaments />
            <Gem className="face__gem" />

            <h3 className="face__name">{name}</h3>

            <figure className="face__art">
                <img src={image} alt={`Preview of ${name}`} loading="lazy" decoding="async" />
            </figure>

            <p className="face__tagline">{tagline}</p>

            <ul className="face__tech" aria-label="Built with">
                {tech.slice(0, MAX_FRONT_TECH).map((t) => (
                    <li key={t}>{t}</li>
                ))}
                {extraTech > 0 && <li className="face__tech-more">+{extraTech}</li>}
            </ul>

            <p className="face__rarity">{RARITY_LABEL[rarity]}</p>

            <div className="face__fx" aria-hidden="true">
                <div className="face__foil" />
                <div className="face__glare" />
            </div>
        </div>
    );
}

export default CardFace;
