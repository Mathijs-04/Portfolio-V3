import Constellations from "../components/Constellations.jsx";

// For now just the sky: the stars don't stand for skills yet.
function Skills() {
    return (
        <>
            <Constellations />
            <div className="container">
                <h1 className="page-title"><span className="ink">Skills</span></h1>
            </div>
        </>
    );
}

export default Skills;
