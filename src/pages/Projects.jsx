import { useCallback, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence } from "framer-motion";
import ProjectCard from "../components/ProjectCard.jsx";
import CardInspector from "../components/CardInspector.jsx";
import { sampleCards } from "../data/projects.js";

function Projects() {
    const [inspecting, setInspecting] = useState(null); // { project, origin }
    const [hiddenSlug, setHiddenSlug] = useState(null);

    const inspect = useCallback((project, origin) => {
        setInspecting({ project, origin });
        setHiddenSlug(project.slug);
    }, []);

    const close = useCallback(() => setInspecting(null), []);

    return (
        <div className="container">
            <h1 className="page-title">
                <span className="ink">Projects</span>
            </h1>

            {/* For now: one placeholder card per rarity, to style the cards. */}
            <ul className="deck">
                {sampleCards.map((project) => (
                    <li key={project.slug} className="deck__slot">
                        <ProjectCard project={project} hidden={hiddenSlug === project.slug} onInspect={inspect} />
                    </li>
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
