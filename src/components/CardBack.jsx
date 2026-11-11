import { SiGithub } from "react-icons/si";
import { TbExternalLink } from "react-icons/tb";
import { Ornaments, RARITY_LABEL } from "./CardFace.jsx";
import CardGallery from "./CardGallery.jsx";
import TechIcon from "./TechIcon.jsx";

const LINK_ICON = { code: SiGithub, live: TbExternalLink };
const CORNERS = ["tl", "tr", "bl", "br"];

/**
 * A link on the card back: a hand-cut plate ruled like the card's own frame, with small
 * corner brackets and a little grime.
 */
function CardLink({ href, kind, children }) {
    const Icon = LINK_ICON[kind] ?? TbExternalLink;
    return (
        <a className={`back__link back__link--${kind}`} href={href} target="_blank" rel="noreferrer">
            <span className="back__link-grime" aria-hidden="true" />
            {CORNERS.map((c) => (
                <span key={c} className={`back__link-corner back__link-corner--${c}`} aria-hidden="true" />
            ))}
            <Icon aria-hidden="true" focusable="false" />
            {children}
        </a>
    );
}

/**
 * The reverse of a card (ported from the prototype): the project's long description,
 * a gallery, the full tech list and links. Scrolls inside the card when it runs long.
 */
function CardBack({ project }) {
    const { name, rarity, tagline, tech, images, lore, links } = project;

    return (
        <div className="face face--back" data-rarity={rarity}>
            <div className="face__surface" aria-hidden="true" />
            <Ornaments />

            <div className="back">
                <p className="back__rarity">{RARITY_LABEL[rarity]}</p>
                <h2 className="back__name" id="inspector-title">
                    {name}
                </h2>
                <p className="back__tagline">{tagline}</p>

                <CardGallery name={name} images={images} />

                <div className="back__lore">
                    {lore.map((p) => (
                        <p key={p.slice(0, 32)}>{p}</p>
                    ))}
                </div>

                <ul className="back__tech" aria-label="Built with">
                    {tech.map((t) => (
                        <li key={t}>
                            <TechIcon name={t} />
                            {t}
                        </li>
                    ))}
                </ul>

                {links.length > 0 && (
                    <div className="back__links">
                        {links.map(({ label, href, kind }) => (
                            <CardLink key={label} href={href} kind={kind}>
                                {label}
                            </CardLink>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default CardBack;
