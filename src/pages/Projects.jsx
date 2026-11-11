import ProjectCard from "../components/ProjectCard.jsx";
import { sampleCards } from "../data/projects.js";

function Projects() {
    return (
        <div className="container">
            <h1 className="page-title">
                <span className="ink">Projects</span>
            </h1>

            {/* For now: one placeholder card per rarity, to style the cards. */}
            <ul className="deck">
                {sampleCards.map((project) => (
                    <li key={project.slug} className="deck__slot">
                        <ProjectCard project={project} />
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default Projects;
