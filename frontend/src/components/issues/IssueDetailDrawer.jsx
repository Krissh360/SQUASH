import { useState, useEffect, useCallback } from "react";
import Drawer from "../ui/Drawer";
import Badge from "../ui/Badge";
import Button from "../ui/Button";
import Input from "../ui/Input";
import Skeleton from "../ui/Skeleton";
import { useToast } from "../ui/Toast";
import {
  fetchIssue,
  updateStatus,
  assignIssue,
  deleteIssue,
} from "../../api/issues";
import {
  Calendar,
  User,
  Clock,
  ArrowRight,
  Edit2,
  Trash2,
  CheckCircle,
  AlertTriangle,
} from "lucide-react";
import Dialog from "../ui/Dialog";

const ALLOWED_TRANSITIONS = {
  OPEN: [{ target: "IN_PROGRESS", label: "Start work", variant: "primary" }],
  IN_PROGRESS: [
    { target: "RESOLVED", label: "Mark resolved", variant: "primary" },
    { target: "OPEN", label: "Back to backlog", variant: "outline" },
  ],
  RESOLVED: [
    { target: "CLOSED", label: "Verify & close", variant: "primary" },
    { target: "OPEN", label: "Reopen", variant: "outline" },
  ],
  CLOSED: [],
};

const PRIORITY_LABELS = {
  P1: "P1 — High",
  P2: "P2 — Medium",
  P3: "P3 — Low",
};

export default function IssueDetailDrawer({
  issueId,
  onClose,
  onUpdated,
  onDeleted,
  onEdit,
}) {
  const toast = useToast();
  const [issue, setIssue] = useState(null);
  const [loading, setLoading] = useState(false);
  const [assigneeInput, setAssigneeInput] = useState("");
  const [isUpdatingAssignee, setIsUpdatingAssignee] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadIssue = useCallback(async () => {
    if (!issueId) return;
    setLoading(true);
    try {
      const data = await fetchIssue(issueId);
      setIssue(data);
      setAssigneeInput(data.assignee || "");
    } catch (err) {
      toast.error(err);
      onClose();
    } finally {
      setLoading(false);
    }
  }, [issueId, toast, onClose]);

  useEffect(() => {
    if (issueId) {
      loadIssue();
    } else {
      setIssue(null);
    }
  }, [issueId, loadIssue]);

  const handleStatusChange = async (targetStatus) => {
    if (!issue) return;
    setIsUpdatingStatus(true);
    try {
      const updated = await updateStatus(issue.id, targetStatus);
      setIssue(updated);
      toast.success(`Status changed to ${targetStatus.replace("_", " ")}`);
      onUpdated?.();
    } catch (err) {
      toast.error(err);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleAssignSubmit = async (e) => {
    e.preventDefault();
    if (!issue) return;
    const trimmed = assigneeInput.trim();
    if (!trimmed) {
      toast.error("Please enter an assignee name.");
      return;
    }
    setIsUpdatingAssignee(true);
    try {
      const updated = await assignIssue(issue.id, trimmed);
      setIssue(updated);
      toast.success(`Assigned to ${trimmed}`);
      onUpdated?.();
    } catch (err) {
      toast.error(err);
    } finally {
      setIsUpdatingAssignee(false);
    }
  };

  const handleDelete = async () => {
    if (!issue) return;
    setIsDeleting(true);
    try {
      await deleteIssue(issue.id);
      toast.success(`Issue #${issue.id} deleted`);
      setConfirmDeleteOpen(false);
      onDeleted?.();
    } catch (err) {
      toast.error(err);
    } finally {
      setIsDeleting(false);
    }
  };

  const formatDate = (isoString) => {
    if (!isoString) return "—";
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return isoString;
    }
  };

  const nextSteps = issue ? ALLOWED_TRANSITIONS[issue.status] || [] : [];

  return (
    <>
      <Drawer
        open={Boolean(issueId)}
        onClose={onClose}
        title={issue ? `Issue #${issue.id}` : "Issue Details"}
      >
        {loading && (
          <div className="space-y-4">
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-20 w-full" />
            <div className="grid grid-cols-2 gap-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
            <Skeleton className="h-24 w-full" />
          </div>
        )}

        {!loading && issue && (
          <div className="space-y-6">
            {/* Header badges and actions */}
            <div className="flex items-center justify-between gap-2 border-b border-border pb-4">
              <div className="flex flex-wrap items-center gap-2">
                <Badge type="severity" value={issue.severity} />
                <Badge type="status" value={issue.status} />
                <span className="rounded-full border border-border px-2.5 py-0.5 text-xs text-muted-foreground font-medium">
                  {PRIORITY_LABELS[issue.priority] || issue.priority}
                </span>
              </div>

              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onEdit?.(issue)}
                  title="Edit issue"
                  aria-label="Edit issue"
                >
                  <Edit2 className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-destructive hover:text-destructive"
                  onClick={() => setConfirmDeleteOpen(true)}
                  title="Delete issue"
                  aria-label="Delete issue"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Title & Description */}
            <div>
              <h3 className="text-xl font-bold text-foreground leading-snug">
                {issue.title}
              </h3>
              <div className="mt-3 text-sm text-foreground/90 whitespace-pre-wrap leading-relaxed rounded-md bg-muted/30 p-3 border border-border/50 min-h-[60px]">
                {issue.description || (
                  <span className="text-muted-foreground italic">No description provided.</span>
                )}
              </div>
            </div>

            {/* Workflow status transition buttons */}
            <div className="rounded-lg border border-border bg-card p-4 space-y-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block">
                Workflow Actions
              </span>
              {nextSteps.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {nextSteps.map((step) => (
                    <Button
                      key={step.target}
                      variant={step.variant}
                      size="sm"
                      onClick={() => handleStatusChange(step.target)}
                      disabled={isUpdatingStatus}
                    >
                      <ArrowRight className="h-3.5 w-3.5" />
                      <span>{step.label}</span>
                    </Button>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                  <CheckCircle className="h-4 w-4 text-emerald-500" />
                  This issue is closed. No further workflow transitions available.
                </p>
              )}
            </div>

            {/* Assignment form */}
            <div className="rounded-lg border border-border bg-card p-4 space-y-2">
              <label
                htmlFor="assigneeInput"
                className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block"
              >
                Assignee
              </label>
              <form onSubmit={handleAssignSubmit} className="flex gap-2">
                <Input
                  id="assigneeInput"
                  placeholder="Enter username..."
                  value={assigneeInput}
                  onChange={(e) => setAssigneeInput(e.target.value)}
                  className="h-8 text-xs"
                />
                <Button
                  type="submit"
                  size="sm"
                  variant="secondary"
                  disabled={isUpdatingAssignee || !assigneeInput.trim() || assigneeInput === issue.assignee}
                >
                  Save
                </Button>
              </form>
              {issue.assignee && (
                <p className="text-xs text-muted-foreground">
                  Currently assigned to <span className="font-medium text-foreground">{issue.assignee}</span>
                </p>
              )}
            </div>

            {/* Metadata / Timestamps */}
            <div className="border-t border-border pt-4 space-y-2.5 text-xs text-muted-foreground">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <User className="h-3.5 w-3.5" /> Reporter
                </span>
                <span className="font-medium text-foreground">{issue.reporter}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5" /> Created
                </span>
                <span>{formatDate(issue.createdAt)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5" /> Last updated
                </span>
                <span>{formatDate(issue.updatedAt)}</span>
              </div>
              {issue.resolvedAt && (
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-emerald-400">
                    <CheckCircle className="h-3.5 w-3.5" /> Resolved at
                  </span>
                  <span className="text-emerald-400 font-medium">
                    {formatDate(issue.resolvedAt)}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}
      </Drawer>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={confirmDeleteOpen}
        onClose={() => setConfirmDeleteOpen(false)}
        title="Delete Issue"
      >
        <div className="space-y-4">
          <div className="flex items-start gap-3 text-destructive">
            <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5" />
            <p className="text-sm text-foreground">
              Are you sure you want to delete{" "}
              <strong className="text-foreground">Issue #{issue?.id}</strong>? This
              action is permanent and cannot be undone.
            </p>
          </div>
          <div className="flex justify-end gap-3 pt-3 border-t border-border">
            <Button
              type="button"
              variant="outline"
              onClick={() => setConfirmDeleteOpen(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete issue"}
            </Button>
          </div>
        </div>
      </Dialog>
    </>
  );
}
