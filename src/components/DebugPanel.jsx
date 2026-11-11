import { useEffect, useState } from "react";
import "../styles/debug.css";

/**
 * Dev-only sliders for tuning the background live (only loaded by `npm run dev`).
 * Each slider writes a --bg-* custom property on <html>; the defaults live in
 * atmosphere.css. Values persist in this browser until "Reset".
 */
const CONTROLS = [
    { group: "Backdrop" },
    { name: "--bg-backdrop-opacity", label: "Opacity", min: 0, max: 1, step: 0.01 },
    { name: "--bg-backdrop-brightness", label: "Brightness", min: 0, max: 3, step: 0.05 },
    { group: "Horizon glow" },
    { name: "--bg-horizon-glow", label: "Strength", min: 0, max: 4, step: 0.05 },
    { name: "--bg-glow-start", label: "Reach (lower = higher up)", min: 0, max: 70, step: 1 },
    { group: "Sky" },
    { name: "--bg-stars", label: "Stars", min: 0, max: 3, step: 0.05 },
    { name: "--bg-moon", label: "Moon", min: 0, max: 2, step: 0.05 },
    { name: "--bg-moon-halo", label: "Moon halo", min: 0, max: 4, step: 0.05 },
    { group: "Fog" },
    { name: "--bg-fog-opacity", label: "Opacity", min: 0, max: 1, step: 0.01 },
    { name: "--bg-fog-top", label: "Starts at (% from top)", min: 0, max: 90, step: 1 },
    { name: "--bg-fog-fade", label: "Top edge softness", min: 0, max: 100, step: 1 },
    {
        name: "--bg-fog-speed",
        label: "Speed",
        min: 0.1,
        max: 2,
        step: 0.05,
        // The video's playback rate isn't CSS: apply it directly as well.
        apply: (v) => {
            const fog = document.querySelector(".fog__video");
            if (fog) fog.defaultPlaybackRate = fog.playbackRate = v;
        },
    },
];
const SLIDERS = CONTROLS.filter((c) => c.name);

const STORAGE_KEY = "bg-debug";
const root = document.documentElement;

function readDefaults() {
    // Read with any live overrides removed, so these are the stylesheet's values.
    const saved = SLIDERS.map(({ name }) => root.style.getPropertyValue(name));
    SLIDERS.forEach(({ name }) => root.style.removeProperty(name));
    const css = getComputedStyle(root);
    const defaults = Object.fromEntries(
        SLIDERS.map(({ name }) => [name, parseFloat(css.getPropertyValue(name))]),
    );
    SLIDERS.forEach(({ name }, i) => saved[i] && root.style.setProperty(name, saved[i]));
    return defaults;
}

function loadSaved() {
    try {
        return JSON.parse(localStorage.getItem(STORAGE_KEY)) ?? {};
    } catch {
        return {};
    }
}

function DebugPanel() {
    const [defaults] = useState(readDefaults);
    const [values, setValues] = useState(() => ({ ...defaults, ...loadSaved() }));
    const [open, setOpen] = useState(true);
    const [copied, setCopied] = useState(false);

    // Apply and remember every change (only the ones that differ from the stylesheet).
    useEffect(() => {
        const changed = {};
        for (const { name, apply } of SLIDERS) {
            const isDefault = values[name] === defaults[name];
            if (isDefault) root.style.removeProperty(name);
            else root.style.setProperty(name, values[name]);
            apply?.(values[name]);
            if (!isDefault) changed[name] = values[name];
        }
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(changed));
        } catch {
            /* storage unavailable: values just won't persist */
        }
    }, [values, defaults]);

    // While dragging, switch off the background's slow fades so changes show instantly.
    const startTuning = () => {
        root.dataset.bgTuning = "";
        const stop = () => {
            delete root.dataset.bgTuning;
            window.removeEventListener("pointerup", stop);
            window.removeEventListener("pointercancel", stop);
        };
        window.addEventListener("pointerup", stop);
        window.addEventListener("pointercancel", stop);
    };

    const copy = async () => {
        const text = SLIDERS.map(({ name }) => `${name}: ${values[name]};`).join("\n");
        try {
            await navigator.clipboard.writeText(text);
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
        } catch {
            window.prompt("Copy these values:", text);
        }
    };

    if (!open) {
        return (
            <button type="button" className="debug-panel debug-panel--closed" onClick={() => setOpen(true)}>
                Background
            </button>
        );
    }

    return (
        <aside className="debug-panel" aria-label="Background debug controls">
            <header className="debug-panel__head">
                <span>Background</span>
                <button type="button" onClick={() => setOpen(false)} aria-label="Close">
                    ×
                </button>
            </header>

            {CONTROLS.map(({ group, name, label, min, max, step }) => {
                if (group) {
                    return (
                        <h3 key={group} className="debug-panel__group">
                            {group}
                        </h3>
                    );
                }
                const value = values[name];
                const changed = value !== defaults[name];
                return (
                    <label key={name} className={`debug-panel__row${changed ? " is-changed" : ""}`}>
                        <span className="debug-panel__label">{label}</span>
                        <span className="debug-panel__value">{value.toFixed(2)}</span>
                        <input
                            type="range"
                            min={min}
                            max={max}
                            step={step}
                            value={value}
                            onPointerDown={startTuning}
                            onChange={(e) => setValues((v) => ({ ...v, [name]: parseFloat(e.target.value) }))}
                            onDoubleClick={() => setValues((v) => ({ ...v, [name]: defaults[name] }))}
                        />
                    </label>
                );
            })}

            <footer className="debug-panel__actions">
                <button type="button" onClick={copy}>
                    {copied ? "Copied" : "Copy values"}
                </button>
                <button type="button" onClick={() => setValues({ ...defaults })}>
                    Reset
                </button>
            </footer>
            <p className="debug-panel__hint">Double-click a slider to reset it.</p>
        </aside>
    );
}

export default DebugPanel;
