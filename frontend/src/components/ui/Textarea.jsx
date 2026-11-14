import { forwardRef } from "react";

const Textarea = forwardRef(({ className = "", error, ...props }, ref) => {
  return (
    <div className="w-full">
      <textarea
        ref={ref}
        className={`flex min-h-[80px] w-full rounded-md border bg-card px-3 py-2 text-sm
          text-foreground placeholder:text-muted-foreground resize-y
          focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring
          disabled:cursor-not-allowed disabled:opacity-50
          ${error ? "border-destructive" : "border-input"} ${className}`}
        {...props}
      />
      {error && (
        <p className="mt-1 text-xs text-destructive">{error}</p>
      )}
    </div>
  );
});

Textarea.displayName = "Textarea";
export default Textarea;
