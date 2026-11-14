import { createContext, useContext, useState, useCallback } from "react";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback(
    ({ type = "info", message, fieldErrors, duration = 4000 }) => {
      const id = Date.now() + Math.random().toString(36).substring(2, 9);
      setToasts((prev) => [...prev, { id, type, message, fieldErrors }]);

      if (duration > 0) {
        setTimeout(() => {
          removeToast(id);
        }, duration);
      }
    },
    [removeToast]
  );

  const toast = {
    success: (message) => addToast({ type: "success", message }),
    info: (message) => addToast({ type: "info", message }),
    error: (errOrMessage) => {
      if (typeof errOrMessage === "string") {
        addToast({ type: "error", message: errOrMessage });
      } else if (errOrMessage && typeof errOrMessage === "object") {
        const msg =
          errOrMessage.data?.message ||
          errOrMessage.message ||
          "An unexpected error occurred.";
        const fieldErrors = errOrMessage.fieldErrors || errOrMessage.data?.fieldErrors;
        addToast({ type: "error", message: msg, fieldErrors });
      } else {
        addToast({ type: "error", message: "An unexpected error occurred." });
      }
    },
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-md w-full pointer-events-none px-4 sm:px-0">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto flex items-start gap-3 rounded-lg border p-4 shadow-lg transition-all animate-in slide-in-from-bottom-2 ${
              t.type === "success"
                ? "border-border bg-card text-foreground"
                : t.type === "error"
                ? "border-destructive/50 bg-card text-foreground"
                : "border-border bg-card text-foreground"
            }`}
            role="alert"
          >
            {t.type === "success" && (
              <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
            )}
            {t.type === "error" && (
              <AlertCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
            )}
            {t.type === "info" && (
              <Info className="h-5 w-5 text-chart-3 shrink-0 mt-0.5" />
            )}

            <div className="flex-1 text-sm">
              <p className="font-medium">{t.message}</p>
              {t.fieldErrors && Object.keys(t.fieldErrors).length > 0 && (
                <ul className="mt-1 list-disc list-inside text-xs text-destructive space-y-0.5">
                  {Object.entries(t.fieldErrors).map(([field, err]) => (
                    <li key={field}>
                      <span className="font-semibold">{field}:</span> {err}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <button
              onClick={() => removeToast(t.id)}
              className="text-muted-foreground hover:text-foreground p-0.5 rounded cursor-pointer"
              aria-label="Dismiss"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}
