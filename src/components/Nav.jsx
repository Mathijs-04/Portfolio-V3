import { NavLink } from "react-router";

const links = [
    { label: "Home", to: "/" },
    { label: "Projects", to: "/projects" },
    { label: "Skills", to: "/skills" },
    { label: "About", to: "/about" },
];

function Nav() {
    return (
        <header className="nav">
            <nav aria-label="Main">
                <ul className="nav__links">
                    {links.map(({ label, to }) => (
                        <li key={to}>
                            <NavLink
                                to={to}
                                end
                                className={({ isActive }) => `nav__link${isActive ? " is-active" : ""}`}
                            >
                                <span className="ink">{label}</span>
                            </NavLink>
                        </li>
                    ))}
                </ul>
            </nav>
        </header>
    );
}

export default Nav;
