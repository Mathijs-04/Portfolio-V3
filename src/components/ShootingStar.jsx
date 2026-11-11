import { useEffect, useRef } from "react";

const rand = (min, max) => min + Math.random() * (max - min);

/**
 * An occasional falling star. Each shot gets a new place, angle, length and
 * speed, then waits a random while before the next. Animated with the Web
 * Animations API on transform/opacity only, so it stays on the compositor.
 */
function ShootingStar() {
    const ref = useRef(null);

    useEffect(() => {
        const el = ref.current;
        if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

        let timer;
        let anim;

        const shoot = () => {
            // Mostly falling to the left like the prototype's, sometimes to the right.
            const angle = Math.random() < 0.65 ? rand(148, 168) : rand(12, 32);
            el.style.top = `${rand(5, 45).toFixed(1)}%`;
            el.style.left = `${rand(10, 90).toFixed(1)}%`;
            el.style.width = `${Math.round(rand(80, 130))}px`;
            el.style.rotate = `${angle.toFixed(1)}deg`;

            anim = el.animate(
                [
                    { transform: "translateX(0)", opacity: 0 },
                    { opacity: 1, offset: 0.15 },
                    { transform: `translateX(${Math.round(rand(260, 420))}px)`, opacity: 0 },
                ],
                { duration: rand(800, 1200), easing: "linear" },
            );
            anim.onfinish = () => {
                timer = setTimeout(shoot, rand(6000, 15000));
            };
        };

        timer = setTimeout(shoot, rand(2000, 6000));
        return () => {
            clearTimeout(timer);
            anim?.cancel();
        };
    }, []);

    return (
        <div className="shooting-star">
            <span ref={ref} className="shooting-star__streak" />
        </div>
    );
}

export default ShootingStar;
