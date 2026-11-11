import {
    SiBlender,
    SiClaude,
    SiCss3,
    SiDocker,
    SiExpress,
    SiFastapi,
    SiFigma,
    SiHtml5,
    SiJavascript,
    SiLaravel,
    SiMongodb,
    SiNodedotjs,
    SiOpenai,
    SiPhp,
    SiPython,
    SiReact,
    SiTailwindcss,
    SiThreedotjs,
    SiUnrealengine,
    SiVuedotjs,
    SiWebgl,
} from "react-icons/si";
import { GiBroadsword } from "react-icons/gi";
import { TbBrain, TbDatabase, TbDeviceGamepad2, TbHexagon, TbSparkles, TbTopologyStar3, TbWaveSine } from "react-icons/tb";

// Every tech name used in the projects data, mapped to a single-colour icon.
// Brands come from Simple Icons; tech without a logo gets a fitting Tabler/Game icon.
const ICONS = {
    Blender: SiBlender,
    "Claude Code": SiClaude,
    CSS: SiCss3,
    Docker: SiDocker,
    "Excalibur.js": GiBroadsword,
    Express: SiExpress,
    FastAPI: SiFastapi,
    Figma: SiFigma,
    HTML: SiHtml5,
    JavaScript: SiJavascript,
    Laravel: SiLaravel,
    "MakeCode Arcade": TbDeviceGamepad2,
    "Mistral-7B": TbSparkles,
    MongoDB: SiMongodb,
    "Neural Network": TbBrain,
    "Node.js": SiNodedotjs,
    OpenAI: SiOpenai,
    PHP: SiPhp,
    Python: SiPython,
    Qdrant: TbTopologyStar3,
    React: SiReact,
    "React Native": SiReact,
    SQL: TbDatabase,
    Tailwind: SiTailwindcss,
    "Three.js": SiThreedotjs,
    "Unreal Engine 5": SiUnrealengine,
    Vue: SiVuedotjs,
    "Web Audio": TbWaveSine,
    WebGL: SiWebgl,
};

/** The icon for a tech name (colour follows currentColor). Unknown names get a plain hexagon. */
function TechIcon({ name, className = "" }) {
    const Icon = ICONS[name] ?? TbHexagon;
    return <Icon className={className} aria-hidden="true" focusable="false" />;
}

export default TechIcon;
