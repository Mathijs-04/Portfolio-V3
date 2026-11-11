import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import ProjectCard from "../components/ProjectCard.jsx";
import CardInspector from "../components/CardInspector.jsx";
import SortSelect from "../components/SortSelect.jsx";
import { projects } from "../data/projects.js";

const RARITY_RANK = { common: 0, rare: 1, epic: 2, legendary: 3 };
const byName = (a, b) => a.name.localeCompare(b.name, "en", { sensitivity: "base" });

// Sorts are stable, so ties (e.g. two epics) keep the order of the data file.
const SORTS = [
    { value: "rarity-asc", label: "Rarity – Ascending", compare: (a, b) => RARITY_RANK[a.rarity] - RARITY_RANK[b.rarity] },
    { value: "rarity-desc", label: "Rarity – Descending", compare: (a, b) => RARITY_RANK[b.rarity] - RARITY_RANK[a.rarity] },
    { value: "date-asc", label: "Date – Ascending", compare: (a, b) => a.order - b.order },
    { value: "date-desc", label: "Date – Descending", compare: (a, b) => b.order - a.order },
    { value: "name-asc", label: "Name – Ascending", compare: byName },
    { value: "name-desc", label: "Name – Descending", compare: (a, b) => byName(b, a) },
];

// Cards glide to their new place when the sort changes (layout animation: transform only).
const REORDER = { type: "spring", stiffness: 260, damping: 32, mass: 0.9 };
const DEAL_STAGGER_MS = 70;

/**
 * Deals cards in as they scroll into view (ported from the prototype). One IntersectionObserver
 * for the whole deck; cards arriving in the same batch get a small stagger. The motion itself is
 * a CSS transition on opacity/translate/rotate, so the compositor does the work. Each card is
 * dealt once; with reduced motion they are simply shown.
 *
 * Returns `dealAll`: shows every card that hasn't been dealt yet, at once. Used when the deck is
 * re-sorted, because cards that glide into view (framer layout animation) are not reliably
 * reported by the observer and would otherwise stay invisible.
 */
function useDealIn(deckRef) {
    const ioRef = useRef(null);

    useEffect(() => {
        const slots = [...deckRef.current.querySelectorAll(".deck__slot")];
        const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        if (reduced || !("IntersectionObserver" in window)) {
            slots.forEach((s) => s.classList.add("is-dealt"));
            return;
        }
        const io = new IntersectionObserver(
            (entries) => {
                entries
                    .filter((e) => e.isIntersecting)
                    .forEach((e, i) => {
                        e.target.style.transitionDelay = `${i * DEAL_STAGGER_MS}ms`;
                        e.target.classList.add("is-dealt");
                        io.unobserve(e.target);
                    });
            },
            { rootMargin: "0px 0px -8% 0px", threshold: 0.12 },
        );
        slots.forEach((s) => io.observe(s));
        ioRef.current = io;
        return () => io.disconnect();
    }, [deckRef]);

    return useCallback(() => {
        ioRef.current?.disconnect();
        deckRef.current.querySelectorAll(".deck__slot:not(.is-dealt)").forEach((s) => {
            s.style.transitionDelay = "0ms";
            s.classList.add("is-dealt");
        });
    }, [deckRef]);
}

function Projects() {
    const [sort, setSort] = useState("rarity-desc");
    const [inspecting, setInspecting] = useState(null); // { project, origin }
    const [hiddenSlug, setHiddenSlug] = useState(null);
    const deckRef = useRef(null);

    const dealAll = useDealIn(deckRef);

    const changeSort = useCallback(
        (value) => {
            dealAll();
            setSort(value);
        },
        [dealAll],
    );

    const sorted = useMemo(() => {
        const { compare } = SORTS.find((s) => s.value === sort);
        return [...projects].sort(compare);
    }, [sort]);

    const inspect = useCallback((project, origin) => {
        setInspecting({ project, origin });
        setHiddenSlug(project.slug);
    }, []);

    const close = useCallback(() => setInspecting(null), []);

    return (
        <div className="container">
            <header className="projects__header">
                <h1 className="page-title">
                    <span className="ink">Projects</span>
                </h1>
                <SortSelect label="Sort" options={SORTS} value={sort} onChange={changeSort} />
            </header>

            <ul ref={deckRef} className="deck">
                {sorted.map((project) => (
                    <motion.li key={project.slug} className="deck__slot" layout="position" transition={REORDER}>
                        <ProjectCard project={project} hidden={hiddenSlug === project.slug} onInspect={inspect} />
                    </motion.li>
                ))}
            </ul>

            {/* Portalled so it covers the nav too. */}
            {createPortal(
                <AnimatePresence onExitComplete={() => setHiddenSlug(null)}>
                    {inspecting && (
                        <CardInspector
                            key={inspecting.project.slug}
                            project={inspecting.project}
                            origin={inspecting.origin}
                            onClose={close}
                        />
                    )}
                </AnimatePresence>,
                document.body,
            )}
        </div>
    );
}

export default Projects;
