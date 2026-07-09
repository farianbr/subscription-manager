import { useEffect, useRef, useState } from "react";
import { HiOutlineDotsHorizontal } from "react-icons/hi";
import { cn } from "../../lib/utils";

/** Compact "…" menu; destructive items are styled by the caller via `danger`. */
const OverflowMenu = ({ items, label = "More actions" }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    const onClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    const onKey = (e) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={(e) => {
          e.stopPropagation();
          setOpen((o) => !o);
        }}
        aria-label={label}
        aria-haspopup="menu"
        aria-expanded={open}
        className="p-2.5 text-muted hover:text-foreground hover:bg-surface-2 rounded-full transition-colors"
      >
        <HiOutlineDotsHorizontal className="w-4.5 h-4.5" />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full mt-1 w-44 bg-surface rounded-xl border border-border shadow-[var(--shadow-overlay)] py-1 z-30"
        >
          {items.map((item) => (
            <button
              key={item.label}
              role="menuitem"
              onClick={(e) => {
                e.stopPropagation();
                setOpen(false);
                item.onClick();
              }}
              className={cn(
                "flex items-center gap-2.5 w-full px-3.5 py-2.5 text-sm text-left transition-colors",
                item.danger
                  ? "text-danger hover:bg-danger-soft"
                  : "text-foreground hover:bg-surface-2"
              )}
            >
              {item.icon && <item.icon className="w-4 h-4 shrink-0" aria-hidden="true" />}
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default OverflowMenu;
