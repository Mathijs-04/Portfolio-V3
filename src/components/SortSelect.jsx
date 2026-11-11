import { useEffect, useId, useRef, useState } from "react";
import { TbArrowsSort, TbChevronDown } from "react-icons/tb";

/**
 * A small dropdown (listbox) in the site's style: a dark plaque with a double rule.
 * Keyboard: Enter/Space/↓ opens, ↑/↓/Home/End move, Enter/Space picks, Esc/Tab closes.
 * `options`: { value, label }[].
 */
function SortSelect({ label, options, value, onChange }) {
    const [open, setOpen] = useState(false);
    const [active, setActive] = useState(0);
    const rootRef = useRef(null);
    const buttonRef = useRef(null);
    const listRef = useRef(null);
    const id = useId();
    const current = options.find((o) => o.value === value) ?? options[0];

    const openList = () => {
        setActive(Math.max(0, options.indexOf(current)));
        setOpen(true);
    };

    const pick = (option) => {
        onChange(option.value);
        setOpen(false);
        buttonRef.current?.focus();
    };

    // Close on a click outside.
    useEffect(() => {
        if (!open) return;
        const onDown = (e) => !rootRef.current?.contains(e.target) && setOpen(false);
        document.addEventListener("pointerdown", onDown);
        return () => document.removeEventListener("pointerdown", onDown);
    }, [open]);

    useEffect(() => {
        if (open) listRef.current?.focus();
    }, [open]);

    const onButtonKey = (e) => {
        if (e.key === "ArrowDown" || e.key === "ArrowUp") {
            e.preventDefault();
            openList();
        }
    };

    const onListKey = (e) => {
        const last = options.length - 1;
        const moves = { ArrowDown: Math.min(active + 1, last), ArrowUp: Math.max(active - 1, 0), Home: 0, End: last };
        if (e.key in moves) {
            e.preventDefault();
            setActive(moves[e.key]);
        } else if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            pick(options[active]);
        } else if (e.key === "Escape") {
            e.preventDefault();
            setOpen(false);
            buttonRef.current?.focus();
        } else if (e.key === "Tab") {
            setOpen(false);
        }
    };

    return (
        <div ref={rootRef} className={`sort${open ? " is-open" : ""}`}>
            <button
                ref={buttonRef}
                type="button"
                className="sort__button"
                aria-haspopup="listbox"
                aria-expanded={open}
                aria-controls={`${id}-list`}
                onClick={() => (open ? setOpen(false) : openList())}
                onKeyDown={onButtonKey}
            >
                <TbArrowsSort className="sort__icon" aria-hidden="true" />
                <span className="sort__label">{label}:</span>
                <span className="sort__value">{current.label}</span>
                <TbChevronDown className="sort__chevron" aria-hidden="true" />
            </button>

            {open && (
                <ul
                    ref={listRef}
                    id={`${id}-list`}
                    className="sort__list"
                    role="listbox"
                    tabIndex={-1}
                    aria-label={label}
                    aria-activedescendant={`${id}-${active}`}
                    onKeyDown={onListKey}
                >
                    {options.map((option, i) => (
                        <li
                            key={option.value}
                            id={`${id}-${i}`}
                            role="option"
                            aria-selected={option.value === current.value}
                            className={`sort__option${i === active ? " is-active" : ""}`}
                            onPointerEnter={() => setActive(i)}
                            onClick={() => pick(option)}
                        >
                            {option.label}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

export default SortSelect;
