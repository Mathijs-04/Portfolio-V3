import { BrowserRouter, Navigate, Route, Routes, useLocation, useOutlet } from "react-router";
import { lazy, Suspense, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Atmosphere from "./components/Atmosphere.jsx";
import Nav from "./components/Nav.jsx";
import Home from "./pages/Home.jsx";
import Projects from "./pages/Projects.jsx";
import Skills from "./pages/Skills.jsx";
import About from "./pages/About.jsx";

// Background tuning sliders (components/DebugPanel.jsx). Switched off now that the values are
// chosen; set to true to bring them back. Even then they only load in `npm run dev`.
const SHOW_BG_DEBUG = false;
const DebugPanel =
    import.meta.env.DEV && SHOW_BG_DEBUG ? lazy(() => import("./components/DebugPanel.jsx")) : null;

const TITLES = {
    "/": "Home",
    "/projects": "Projects",
    "/skills": "Skills",
    "/about": "About",
};

// Pages can tune the shared sky via html[data-sky] (see atmosphere.css).
// "skills" lifts the fog and reveals the deep stars and milky way.
const SKY_MODES = { "/skills": "skills" };

const PAGE_FADE = {
    initial: { opacity: 0 },
    animate: { opacity: 1, transition: { duration: 0.5, ease: "easeOut" } },
    exit: { opacity: 0, transition: { duration: 0.3, ease: "easeIn" } },
};

function Layout() {
    const location = useLocation();
    const outlet = useOutlet();
    const { pathname } = location;

    useEffect(() => {
        const page = TITLES[pathname];
        document.title = page && pathname !== "/" ? `${page} | Mathijs van der Meijde` : "Mathijs van der Meijde";
    }, [pathname]);

    return (
        <>
            {/* The sky and nav persist across pages; only the page itself fades. */}
            <Atmosphere mode={SKY_MODES[pathname] ?? "default"} />
            <Nav />
            {DebugPanel && (
                <Suspense fallback={null}>
                    <DebugPanel />
                </Suspense>
            )}
            <AnimatePresence mode="wait" initial={false} onExitComplete={() => window.scrollTo(0, 0)}>
                <motion.main key={pathname} className="page" {...PAGE_FADE}>
                    {outlet}
                </motion.main>
            </AnimatePresence>
        </>
    );
}

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route element={<Layout />}>
                    <Route index element={<Home />} />
                    <Route path="/projects" element={<Projects />} />
                    <Route path="/skills" element={<Skills />} />
                    <Route path="/about" element={<About />} />
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Route>
            </Routes>
        </BrowserRouter>
    );
}

export default App;
