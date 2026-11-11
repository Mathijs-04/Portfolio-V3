// PLACEHOLDER data: one card per rarity, only for styling the trading cards.
// The real projects (names, taglines, images, rarities) come over in a later step.
const PLACEHOLDER = {
    tagline: "A short placeholder line describing the project.",
    tech: ["React", "Three.js", "Node.js", "Blender", "Figma"],
    image: "/projects/placeholder.svg",
};

export const sampleCards = [
    { slug: "sample-legendary", name: "Project Name", rarity: "legendary", ...PLACEHOLDER },
    { slug: "sample-epic", name: "Project Name", rarity: "epic", ...PLACEHOLDER },
    { slug: "sample-rare", name: "Project Name", rarity: "rare", ...PLACEHOLDER },
    { slug: "sample-common", name: "Project Name", rarity: "common", ...PLACEHOLDER },
];
