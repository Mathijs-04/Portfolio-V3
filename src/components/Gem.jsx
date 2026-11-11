/**
 * Rarity stone: a polished oval stone held by four claws in a mount of the card's ink.
 * Colour comes from --r of the surrounding [data-rarity]; no gradients, so no ids to collide.
 */
function Gem({ className = "" }) {
    return (
        <svg className={`gem ${className}`} viewBox="0 0 28 20" aria-hidden="true">
            <g className="gem__mount">
                <ellipse cx="14" cy="10" rx="11.6" ry="8.2" />
                <path d="M12.6 1.9 14 0.2 15.4 1.9Z M12.6 18.1 14 19.8 15.4 18.1Z M2.6 8.7 0.4 10 2.6 11.3Z M25.4 8.7 27.6 10 25.4 11.3Z" />
            </g>
            <ellipse className="gem__stone" cx="14" cy="10" rx="9.4" ry="6.3" />
            <ellipse className="gem__depth" cx="14.6" cy="11.3" rx="6.6" ry="3.9" />
            <ellipse className="gem__glint" cx="10.6" cy="7.4" rx="2.6" ry="1.2" transform="rotate(-16 10.6 7.4)" />
        </svg>
    );
}

export default Gem;
