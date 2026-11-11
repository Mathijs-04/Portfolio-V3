import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

const SWIPE_DISTANCE = 50; // px
const SWIPE_VELOCITY = 400; // px/s
const SLIDE = { type: "tween", duration: 0.45, ease: [0.22, 1, 0.36, 1] };

// Images slide in from the side they come from (transform only).
const slide = {
    enter: (dir) => ({ x: dir > 0 ? "100%" : "-100%" }),
    center: { x: 0 },
    exit: (dir) => ({ x: dir > 0 ? "-100%" : "100%" }),
};

/**
 * The gallery on a card back: one large image that slides between pictures. Change it by
 * swiping/dragging the image, the arrow keys or the row of thumbnails. Loops at the ends.
 */
function CardGallery({ name, images }) {
    const [[active, dir], setState] = useState([0, 0]);
    const count = images.length;

    const go = useCallback(
        (step) => setState(([i]) => [(i + step + count) % count, step]),
        [count],
    );
    const show = (i) => setState(([current]) => [i, i > current ? 1 : -1]);

    useEffect(() => {
        if (count < 2) return;
        const onKey = (e) => {
            if (e.key === "ArrowRight") go(1);
            if (e.key === "ArrowLeft") go(-1);
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [go, count]);

    const onDragEnd = (_, { offset, velocity }) => {
        if (offset.x < -SWIPE_DISTANCE || velocity.x < -SWIPE_VELOCITY) go(1);
        else if (offset.x > SWIPE_DISTANCE || velocity.x > SWIPE_VELOCITY) go(-1);
    };

    return (
        <div className="gallery">
            <figure className="back__art">
                <AnimatePresence initial={false} custom={dir}>
                    <motion.img
                        key={active}
                        src={images[active]}
                        alt={`${name}, image ${active + 1} of ${count}`}
                        draggable={false}
                        custom={dir}
                        variants={slide}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        transition={SLIDE}
                        drag={count > 1 ? "x" : false}
                        dragConstraints={{ left: 0, right: 0 }}
                        dragElastic={0.5}
                        onDragEnd={onDragEnd}
                    />
                </AnimatePresence>

                {count > 1 && (
                    <p className="gallery__count" aria-hidden="true">
                        {active + 1} / {count}
                    </p>
                )}
            </figure>

            {count > 1 && (
                <div className="back__thumbs" role="group" aria-label="Gallery">
                    {images.map((src, i) => (
                        <button
                            key={src}
                            type="button"
                            className={`back__thumb${i === active ? " is-active" : ""}`}
                            onClick={() => show(i)}
                            aria-label={`Show image ${i + 1}`}
                            aria-pressed={i === active}
                        >
                            <img src={src} alt="" loading="lazy" draggable={false} />
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}

export default CardGallery;
