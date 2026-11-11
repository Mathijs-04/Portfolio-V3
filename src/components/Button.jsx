import { Link } from "react-router";

const CORNERS = ["tl", "tr", "bl", "br"];

/**
 * The site's button: a dark plaque with a thin double rule and an ornate gothic
 * bracket inside each corner (the Arcane Archive ornament), label in Ransite.
 * Renders a router Link when given `to`, a plain <a> for `href`, and a <button> otherwise.
 */
function Button({ to, href, children, className = "", ...rest }) {
    const classes = `btn ${className}`.trim();
    const content = (
        <>
            <span className="btn__grime" aria-hidden="true" />
            {CORNERS.map((c) => (
                <span key={c} className={`btn__corner btn__corner--${c}`} aria-hidden="true" />
            ))}
            <span className="btn__label">{children}</span>
        </>
    );

    if (to) {
        return (
            <Link to={to} className={classes} {...rest}>
                {content}
            </Link>
        );
    }
    if (href) {
        return (
            <a href={href} className={classes} {...rest}>
                {content}
            </a>
        );
    }
    return (
        <button type="button" className={classes} {...rest}>
            {content}
        </button>
    );
}

export default Button;
