import { useCallback, useRef } from "react";

const canTilt = () =>
    typeof window !== "undefined" &&
    window.matchMedia("(hover: hover) and (pointer: fine)").matches &&
    !window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/**
 * Pointer-driven 3D tilt. Writes CSS custom properties straight onto the element
 * (no React re-renders): --px/--py (0..1 pointer position), --rx/--ry (degrees), --hover (0|1).
 */
function useTilt(maxDeg = 12) {
    const ref = useRef(null);
    const frame = useRef(0);

    const onPointerMove = useCallback(
        (e) => {
            const el = ref.current;
            if (!el || !canTilt()) return;
            const rect = el.getBoundingClientRect();
            const px = Math.min(Math.max((e.clientX - rect.left) / rect.width, 0), 1);
            const py = Math.min(Math.max((e.clientY - rect.top) / rect.height, 0), 1);
            cancelAnimationFrame(frame.current);
            frame.current = requestAnimationFrame(() => {
                el.style.setProperty("--px", px.toFixed(3));
                el.style.setProperty("--py", py.toFixed(3));
                el.style.setProperty("--rx", `${((0.5 - py) * maxDeg * 2).toFixed(2)}deg`);
                el.style.setProperty("--ry", `${((px - 0.5) * maxDeg * 2).toFixed(2)}deg`);
                el.style.setProperty("--hover", "1");
                el.dataset.tilting = "true";
            });
        },
        [maxDeg],
    );

    const onPointerLeave = useCallback(() => {
        const el = ref.current;
        if (!el) return;
        cancelAnimationFrame(frame.current);
        el.style.setProperty("--rx", "0deg");
        el.style.setProperty("--ry", "0deg");
        el.style.setProperty("--hover", "0");
        delete el.dataset.tilting;
    }, []);

    return { ref, onPointerMove, onPointerLeave };
}

export default useTilt;
