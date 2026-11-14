import { forwardRef } from "react";

const Input = forwardRef(({ className = "", error, ...props }, ref) => {
  return (
    <div className="w-full">
      <input
        ref={ref}
        className={`flex h-9 w-full rounded-md border bg-card px-3 py-1 text-sm
          text-foreground placeholder:text-muted-foreground
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

Input.displayName = "Input";
export default Input;
