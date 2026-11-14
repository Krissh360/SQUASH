const severityColors = {
  LOW: "bg-chart-4",
  MEDIUM: "bg-chart-3",
  HIGH: "bg-chart-2",
  CRITICAL: "bg-chart-1",
};

const statusLabels = {
  OPEN: "Open",
  IN_PROGRESS: "In Progress",
  RESOLVED: "Resolved",
  CLOSED: "Closed",
};

const severityLabels = {
  LOW: "Low",
  MEDIUM: "Medium",
  HIGH: "High",
  CRITICAL: "Critical",
};

/** A small badge with a colored dot for status, or a filled pill for severity. */
export default function Badge({ type = "status", value, className = "" }) {
  if (type === "severity") {
    const dotColor = severityColors[value] || "bg-muted-foreground";
    return (
      <span
        className={`inline-flex items-center gap-1.5 rounded-full border border-border
          px-2.5 py-0.5 text-xs font-medium text-foreground ${className}`}
      >
        <span className={`h-2 w-2 rounded-full ${dotColor}`} />
        {severityLabels[value] || value}
      </span>
    );
  }

  // status badge — outlined with a small dot
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border border-border
        px-2.5 py-0.5 text-xs font-medium text-muted-foreground ${className}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground" />
      {statusLabels[value] || value}
    </span>
  );
}
