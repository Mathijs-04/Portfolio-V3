import { projects } from "./projects.js";

/*
 * The visitor's card collection, kept in localStorage.
 *
 * Each booster pack holds PACK_SIZE cards drawn at random from the projects the visitor
 * doesn't own yet, so there are never doubles. With 28 projects that is 8 + 8 + 8 + 4:
 * four packs complete the collection.
 */

export const PACK_SIZE = 8;

const STORAGE_KEY = "projects:collection:v1";
const known = new Set(projects.map((p) => p.slug));

/** The collected slugs. Unknown slugs (e.g. a removed project) are dropped. */
export function loadCollection() {
    try {
        const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");
        return new Set(Array.isArray(saved) ? saved.filter((slug) => known.has(slug)) : []);
    } catch {
        return new Set();
    }
}

export function saveCollection(collected) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify([...collected]));
    } catch {
        /* storage unavailable (private mode, blocked): the collection lasts for this visit only */
    }
}

export function clearCollection() {
    try {
        localStorage.removeItem(STORAGE_KEY);
    } catch {
        /* nothing to clear */
    }
}

export function packsRemaining(collected) {
    return Math.ceil((projects.length - collected.size) / PACK_SIZE);
}

const RARITY_RANK = { common: 0, rare: 1, epic: 2, legendary: 3 };

/**
 * Draws the next pack: up to PACK_SIZE random projects the visitor doesn't have yet,
 * ordered from common to legendary so the best cards end up last in the spread.
 */
export function drawPack(collected) {
    const pool = projects.filter((p) => !collected.has(p.slug));
    for (let i = pool.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [pool[i], pool[j]] = [pool[j], pool[i]];
    }
    return pool.slice(0, PACK_SIZE).sort((a, b) => RARITY_RANK[a.rarity] - RARITY_RANK[b.rarity]);
}

/** The rarest rarity among some cards (the colour of the light that spills from the pack). */
export function bestRarity(cards) {
    return cards.reduce((best, c) => (RARITY_RANK[c.rarity] > RARITY_RANK[best] ? c.rarity : best), "common");
}
