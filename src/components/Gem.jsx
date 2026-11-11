/** Faceted rarity gem. Colour comes from the --r-* custom properties of the surrounding [data-rarity]. */
function Gem({ className = "" }) {
    return (
        <svg className={`gem ${className}`} viewBox="0 0 24 24" aria-hidden="true">
            <path className="gem__body" d="M12 1.5 21 12 12 22.5 3 12Z" />
            <path className="gem__light" d="M12 1.5 21 12 12 9.2Z" />
            <path className="gem__shade" d="M3 12 12 22.5 12 14.8Z" />
            <path className="gem__edge" d="M12 1.5 21 12 12 22.5 3 12Z" fill="none" />
        </svg>
    );
}

export default Gem;
