// PLACEHOLDER data: one card per rarity, only for styling the trading cards and their backs.
// The real projects (names, taglines, write-ups, images, links, rarities) come over in a later step.
//
// Shape of a project:
//   slug, name, rarity ("common" | "rare" | "epic" | "legendary"), tagline,
//   tech: string[] (names as in components/TechIcon.jsx),
//   images: string[] (first one is the card art; all of them show in the gallery on the back),
//   lore: string[] (the long description, one string per paragraph),
//   links: { label, href, kind: "code" | "live" }[]
const PLACEHOLDER = {
    tagline: "A short placeholder line describing the project.",
    // Deliberately long lists, to see how the cards cope with a lot of content.
    tech: [
        "React",
        "Three.js",
        "Node.js",
        "Blender",
        "Figma",
        "Laravel",
        "Vue",
        "Tailwind",
        "Python",
        "FastAPI",
        "OpenAI",
        "SQL",
        "Docker",
        "Unreal Engine 5",
    ],
    images: Array.from({ length: 10 }, (_, i) => `/projects/placeholder${i ? `-${i + 1}` : ""}.svg`),
    lore: [
        "Placeholder paragraph. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
        "Placeholder paragraph. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Curabitur pretium tincidunt lacus, nulla gravida orci a odio.",
        "Placeholder paragraph. Nullam varius, turpis et commodo pharetra, est eros bibendum elit, nec luctus magna felis sollicitudin mauris. Integer in mauris eu nibh euismod gravida. Duis ac tellus et risus vulputate vehicula.",
    ],
    links: [
        { label: "Source", href: "#", kind: "code" },
        { label: "Live", href: "#", kind: "live" },
    ],
};

export const sampleCards = [
    { slug: "sample-common", name: "Project Name", rarity: "common", ...PLACEHOLDER },
    { slug: "sample-rare", name: "Project Name", rarity: "rare", ...PLACEHOLDER },
    { slug: "sample-epic", name: "Project Name", rarity: "epic", ...PLACEHOLDER },
    { slug: "sample-legendary", name: "Project Name", rarity: "legendary", ...PLACEHOLDER },
];
