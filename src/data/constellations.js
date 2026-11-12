/*
 * The Skills sky: five constellations. For now they are pure decoration; later each star
 * becomes a skill and each constellation a domain.
 *
 * The shapes are grown, not drawn: tools/constellations/gen.py walks out from a seed with
 * uneven steps, the odd branch and sometimes a closing line, then turns the result to a random
 * angle (`seed` is the generator seed). Positions are in "units": one unit is a length the CSS
 * works out from the free sky between the nav and the mountains (see skills.css), so shapes
 * keep their proportions on every screen. Stars in one constellation are at least 0.85 units
 * apart (~56px on a 1280px-wide screen).
 *
 * stars: the stars that will stand for skills. mag 0..1, how bright (1 = brightest).
 * lines: pairs of star indexes. Not every star has one: some are members the figure skips.
 * dust:  secondary stars in and around the shape: not part of the figure, they fill it out and
 *        tie it into the starfield.
 * at:    per layout (`wide` for landscape screens, `tall` for portrait ones), the top-left of
 *        the shape's box in grid units, optionally mirrored. Found by tools/constellations/opt.py,
 *        which checks every star against the title, the moon and the real mountain ridge on
 *        common screen sizes: re-run it rather than moving them by hand.
 */

export const LAYOUTS = {
    // cols x rows: the grid that has to fit the free sky. side: screen-edge margin (fraction of
    // the width). bottom: where the sky ends, as a fraction of the backdrop's height.
    wide: { cols: 18, rows: 6.8, side: 0.03, bottom: 0.52 },
    tall: { cols: 8.4, rows: 15, side: 0.04, bottom: 0.52 },
};

export const constellations = [
    {
        seed: 106,
        stars: [
            { x: 0, y: 0, mag: 0.18 },
            { x: 1.18, y: 0.09, mag: 0.21 },
            { x: 2.13, y: 0.86, mag: 0.98 },
            { x: 2.87, y: 1.65, mag: 0.03 },
            { x: 1.41, y: 1.66, mag: 0.36 },
            { x: 3.8, y: 2.09, mag: 0.18 },
            { x: 2.77, y: 2.72, mag: 0 },
            { x: 3.54, y: 0.87, mag: 0.17 },
            { x: 4.4, y: 1.31, mag: 0.3 },
            { x: 2.9, y: 0.14, mag: 0.09 },
        ],
        lines: [[0, 1], [1, 2], [2, 3], [3, 5], [3, 6], [2, 7], [7, 8]],
        dust: [
            { x: 4.66, y: 1.96, mag: 0.26 },
            { x: 2.97, y: 1.35, mag: 0.18 },
            { x: 1.49, y: 1.95, mag: 0.19 },
            { x: 2.4, y: 0.36, mag: 0.07 },
            { x: 1.07, y: 1.2, mag: 0.45 },
            { x: 4.01, y: 0.63, mag: 0.21 },
            { x: 3.17, y: 2.66, mag: 0.29 },
            { x: 1.75, y: 1.13, mag: 0.12 },
            { x: 0.93, y: 1.65, mag: 0.05 },
        ],
        at: {
            wide: { x: 13.57, y: 2.51 },
            tall: { x: 3.02, y: 1.94 },
        },
    },
    {
        seed: 118,
        stars: [
            { x: 1.65, y: 0.32, mag: 0.92 },
            { x: 2.26, y: 1, mag: 0.04 },
            { x: 3.22, y: 1.19, mag: 0.23 },
            { x: 3.26, y: 0, mag: 0 },
            { x: 0.58, y: 1.01, mag: 0.02 },
            { x: 2.61, y: 2.36, mag: 0.24 },
            { x: 2.95, y: 3.17, mag: 0.33 },
            { x: 1.59, y: 1.7, mag: 0.74 },
            { x: 0.75, y: 1.86, mag: 0.17 },
            { x: 0, y: 2.56, mag: 0.07 },
        ],
        lines: [[0, 1], [1, 2], [0, 4], [1, 5], [5, 6], [0, 7], [7, 8], [8, 9], [2, 5]],
        dust: [
            { x: 1.82, y: 1.93, mag: 0.38 },
            { x: 2.36, y: 2.95, mag: 0.24 },
            { x: 2.8, y: 0.29, mag: 0.14 },
            { x: 2.65, y: 0.57, mag: 0.06 },
            { x: 0.01, y: 3.37, mag: 0.05 },
            { x: 2.26, y: 2.39, mag: 0.06 },
            { x: 1.88, y: 3.06, mag: 0.06 },
            { x: 1.35, y: 2.61, mag: 0.07 },
            { x: 1.16, y: 1.35, mag: 0.08 },
            { x: -0.36, y: 1.68, mag: 0.04 },
            { x: 0.48, y: 2.79, mag: 0.21 },
            { x: 2.96, y: 2.3, mag: 0.37 },
            { x: 1.98, y: 2.21, mag: 0.44 },
        ],
        at: {
            wide: { x: 9.98, y: 2.61, mirror: true },
            tall: { x: -0.5, y: 3.55 },
        },
    },
    {
        seed: 126,
        stars: [
            { x: 0, y: 1.8, mag: 0.27 },
            { x: 1.06, y: 1.03, mag: 0.11 },
            { x: 2.14, y: 0.84, mag: 0.41 },
            { x: 2.81, y: 1.61, mag: 0.9 },
            { x: 2.68, y: 3.14, mag: 0.11 },
            { x: 0.8, y: 2.17, mag: 0.01 },
            { x: 3.68, y: 2.07, mag: 0.45 },
            { x: 1.14, y: 0, mag: 0.75 },
            { x: 3.54, y: 0.77, mag: 0.11 },
            { x: 4.33, y: 1.07, mag: 0.43 },
        ],
        lines: [[0, 1], [1, 2], [2, 3], [0, 5], [2, 8], [8, 9]],
        dust: [
            { x: 1.73, y: 1.11, mag: 0.16 },
            { x: 3.11, y: 2.73, mag: 0.16 },
            { x: 2.27, y: -0.04, mag: 0.05 },
            { x: 2.26, y: 2.38, mag: 0.11 },
            { x: 3.19, y: 1.52, mag: 0.46 },
            { x: 4.55, y: 2.01, mag: 0.22 },
            { x: 3.07, y: 0.35, mag: 0.06 },
            { x: 2.84, y: 2.26, mag: 0.11 },
            { x: 4.62, y: 0.12, mag: 0.33 },
            { x: 1.11, y: 2.45, mag: 0.35 },
            { x: 2.07, y: 0.45, mag: 0.13 },
            { x: 0.7, y: 1.66, mag: 0.08 },
        ],
        at: {
            wide: { x: 4.57, y: 3.66 },
            tall: { x: -0.5, y: 7.91 },
        },
    },
    {
        seed: 131,
        stars: [
            { x: 4.66, y: 0.64, mag: 0.3 },
            { x: 3.85, y: 1.63, mag: 0.94 },
            { x: 3.87, y: 2.79, mag: 0.12 },
            { x: 3.06, y: 1.22, mag: 0.37 },
            { x: 2.24, y: 1.53, mag: 0.32 },
            { x: 1.38, y: 0.92, mag: 0.03 },
            { x: 1.06, y: 0, mag: 0 },
            { x: 0.45, y: 1.1, mag: 0.18 },
            { x: 3.71, y: 0.25, mag: 0.05 },
            { x: 0, y: 0.32, mag: 0.02 },
            { x: 2.67, y: 2.29, mag: 0.42 },
        ],
        lines: [[0, 1], [1, 2], [1, 3], [3, 4], [4, 5], [5, 7]],
        dust: [
            { x: 0.56, y: 1.39, mag: 0.1 },
            { x: 1.15, y: 2.01, mag: 0.11 },
            { x: 3.97, y: 0.9, mag: 0.12 },
            { x: 0.39, y: 0.08, mag: 0.28 },
            { x: 3.62, y: 2.58, mag: 0.46 },
            { x: 3.54, y: 0.95, mag: 0.16 },
            { x: 0.9, y: 0.7, mag: 0.33 },
            { x: 0.6, y: 0.64, mag: 0.17 },
            { x: 4.24, y: 2.75, mag: 0.41 },
            { x: 1.1, y: 1.36, mag: 0.11 },
        ],
        at: {
            wide: { x: 0.06, y: 2.44, mirror: true },
            tall: { x: 4.16, y: 6.24 },
        },
    },
    {
        seed: 102,
        stars: [
            { x: 0.44, y: 1.16, mag: 0.23 },
            { x: 1.27, y: 1.39, mag: 0.12 },
            { x: 2.17, y: 1.86, mag: 0.9 },
            { x: 0.74, y: 2.46, mag: 0.21 },
            { x: 0.35, y: 0.2, mag: 0.24 },
            { x: 2.18, y: 0.97, mag: 0.37 },
            { x: 0, y: 2, mag: 0.67 },
            { x: 3, y: 0.69, mag: 0.42 },
            { x: 4.15, y: 0.06, mag: 0.03 },
            { x: 1.65, y: 0, mag: 0.35 },
        ],
        lines: [[0, 1], [1, 2], [1, 5], [5, 7], [7, 8], [2, 7]],
        dust: [
            { x: 3.52, y: -0.4, mag: 0.27 },
            { x: 1.76, y: 0.3, mag: 0.07 },
            { x: 0.78, y: 1.87, mag: 0.16 },
            { x: 2.13, y: 0.56, mag: 0.06 },
            { x: -0.36, y: 0.13, mag: 0.41 },
            { x: 1.22, y: 2.55, mag: 0.31 },
            { x: 3.68, y: 1.62, mag: 0.22 },
            { x: 0.09, y: 1.21, mag: 0.09 },
            { x: 1.61, y: 0.6, mag: 0.27 },
            { x: 4.52, y: -0.3, mag: 0.23 },
            { x: 0.01, y: 1.58, mag: 0.07 },
        ],
        at: {
            wide: { x: 6.41, y: 0.51 },
            tall: { x: 4.75, y: 10.5, mirror: true },
        },
    },
];
