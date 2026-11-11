import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";

const FADE = { duration: 0.25, ease: "easeOut" };

/**
 * A near full-screen view of one image, opened from the card gallery. Portalled to <body> so it
 * sits above the card inspector (and outside its 3D transform). Closes with Esc, the × button or
 * a click next to the image; Esc is caught here first so the card behind stays open.
 * The ←/→ keys keep working through the gallery, which owns `src`.
 */
function ImageViewer({ open, src, alt, counter, onClose }) {
    const closeRef = useRef(null);

    useEffect(() => {
        if (!open) return;
        const returnFocus = document.activeElement;
        const onKey = (e) => {
            if (e.key !== "Escape") return;
            e.stopPropagation(); // capture phase on window: the inspector never hears this Esc
            onClose();
        };
        window.addEventListener("keydown", onKey, true);
        closeRef.current?.focus({ preventScroll: true });
        return () => {
            window.removeEventListener("keydown", onKey, true);
            returnFocus?.focus?.({ preventScroll: true });
        };
    }, [open, onClose]);

    return createPortal(
        <AnimatePresence>
            {open && (
                <motion.div
                    className="viewer"
                    role="dialog"
                    aria-modal="true"
                    aria-label={alt}
                    onClick={(e) => e.target === e.currentTarget && onClose()}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={FADE}
                >
                    <AnimatePresence mode="popLayout" initial={false}>
                        <motion.img
                            key={src}
                            className="viewer__image"
                            src={src}
                            alt={alt}
                            draggable={false}
                            initial={{ opacity: 0, scale: 0.97 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0 }}
                            transition={FADE}
                        />
                    </AnimatePresence>

                    {counter && (
                        <p className="viewer__count" aria-hidden="true">
                            {counter}
                        </p>
                    )}

                    <button ref={closeRef} type="button" className="viewer__close" onClick={onClose} aria-label="Close image">
                        ×
                    </button>
                </motion.div>
            )}
        </AnimatePresence>,
        document.body,
    );
}

export default ImageViewer;
