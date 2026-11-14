export default function Card({ className = "", children, ...props }) {
  return (
    <div
      className={`rounded-lg border border-border bg-card text-card-foreground p-6 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ className = "", children }) {
  return <div className={`mb-4 ${className}`}>{children}</div>;
}

export function CardTitle({ className = "", children }) {
  return (
    <h3 className={`text-sm font-medium text-muted-foreground ${className}`}>
      {children}
    </h3>
  );
}

export function CardContent({ className = "", children }) {
  return <div className={className}>{children}</div>;
}
