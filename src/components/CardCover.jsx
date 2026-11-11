import { Ornaments } from "./CardFace.jsx";

/**
 * The common reverse of every card, seen while it is still face down in a pack:
 * plain dark stone with a bone double rule and the corner ornaments.
 * (Not to be confused with CardBack, the detail side shown in the inspector.)
 */
function CardCover() {
    return (
        <div className="cover">
            <div className="cover__surface" aria-hidden="true" />
            <Ornaments />
        </div>
    );
}

export default CardCover;
