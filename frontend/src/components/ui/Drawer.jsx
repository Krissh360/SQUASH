import { useEffect, useRef, useCallback } from "react";
import { X } from "lucide-react";

/**
 * A side drawer that slides in from the right.
 * Props: open, onClose, title, children, className
 */
export default function Drawer({ open, onClose, title, children, className = "" }) {
  const overlayRef = useRef(null);

  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === "Escape") onClose();
    },
    [onClose]
  );

  useEffect(() => {
    if (open) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [open, handleKeyDown]);

  if (!open) return null;

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex justify-end bg-black/60"
      onClick={(e) => e.target === overlayRef.current && onClose()}
    >
      <div
        className={`h-full w-full max-w-md overflow-y-auto border-l border-border
          bg-card p-6 shadow-xl ${className}`}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        style={{ animation: "slideIn 0.2s ease-out" }}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-foreground">{title}</h2>
          <button
            onClick={onClose}
            className="rounded-md p-1 text-muted-foreground hover:text-foreground
              hover:bg-accent transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        {children}
      </div>

      <style>{`
        @keyframes slideIn {
          from { transform: translateX(100%); }
          to   { transform: translateX(0); }
        }
      `}</style>
    </div>
  );
}
