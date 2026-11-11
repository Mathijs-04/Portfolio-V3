import Button from "../components/Button.jsx";

function Home() {
    return (
        <div className="container home">
            <header className="home__intro">
                <h1 className="home__name">Mathijs van der Meijde</h1>
                <p className="home__role">Creative Technologist</p>
            </header>
            <div className="home__actions">
                {/* Placeholder label: change to the user's own wording. */}
                <Button to="/projects">View projects</Button>
            </div>
        </div>
    );
}

export default Home;
