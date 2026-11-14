import { useState, useEffect } from "react";
import Dialog from "../ui/Dialog";
import Button from "../ui/Button";
import Input from "../ui/Input";
import Textarea from "../ui/Textarea";
import Select from "../ui/Select";
import { useToast } from "../ui/Toast";
import { createIssue, updateIssue } from "../../api/issues";

const SEVERITIES = [
  { value: "LOW", label: "Low" },
  { value: "MEDIUM", label: "Medium" },
  { value: "HIGH", label: "High" },
  { value: "CRITICAL", label: "Critical" },
];

const PRIORITIES = [
  { value: "P1", label: "P1 — High" },
  { value: "P2", label: "P2 — Medium" },
  { value: "P3", label: "P3 — Low (Default)" },
];

export default function CreateIssueDialog({ open, onClose, onSuccess, initialData = null }) {
  const toast = useToast();
  const isEditing = Boolean(initialData && initialData.id);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    severity: "MEDIUM",
    priority: "P3",
    assignee: "",
    reporter: "",
  });

  const [clientErrors, setClientErrors] = useState({});
  const [serverErrors, setServerErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title || "",
        description: initialData.description || "",
        severity: initialData.severity || "MEDIUM",
        priority: initialData.priority || "P3",
        assignee: initialData.assignee || "",
        reporter: initialData.reporter || "",
      });
    } else {
      setFormData({
        title: "",
        description: "",
        severity: "MEDIUM",
        priority: "P3",
        assignee: "",
        reporter: "",
      });
    }
    setClientErrors({});
    setServerErrors({});
  }, [initialData, open]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear specific field errors when user types
    if (clientErrors[name]) {
      setClientErrors((prev) => ({ ...prev, [name]: undefined }));
    }
    if (serverErrors[name]) {
      setServerErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const validate = () => {
    const errors = {};
    if (!formData.title || !formData.title.trim()) {
      errors.title = "Title is required";
    } else if (formData.title.trim().length > 150) {
      errors.title = "Title must be at most 150 characters";
    }

    if (!formData.severity) {
      errors.severity = "Severity is required";
    }

    // Reporter is required on create (and backend requires it on update DTO as well)
    if (!formData.reporter || !formData.reporter.trim()) {
      errors.reporter = "Reporter is required";
    }

    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = validate();
    if (Object.keys(errors).length > 0) {
      setClientErrors(errors);
      return;
    }

    setSubmitting(true);
    setServerErrors({});

    const payload = {
      title: formData.title.trim(),
      description: formData.description.trim() || null,
      severity: formData.severity,
      priority: formData.priority,
      assignee: formData.assignee.trim() || null,
      reporter: formData.reporter.trim(),
    };

    try {
      if (isEditing) {
        await updateIssue(initialData.id, payload);
        toast.success(`Issue #${initialData.id} updated successfully.`);
      } else {
        const created = await createIssue(payload);
        toast.success(`Issue #${created.id} created successfully.`);
      }
      onSuccess?.();
    } catch (err) {
      if (err.fieldErrors) {
        setServerErrors(err.fieldErrors);
      }
      toast.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const getFieldError = (fieldName) => {
    return clientErrors[fieldName] || serverErrors[fieldName];
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={isEditing ? `Edit Issue #${initialData.id}` : "Report New Issue"}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="title" className="block text-xs font-medium text-muted-foreground mb-1">
            Title <span className="text-destructive">*</span>
          </label>
          <Input
            id="title"
            name="title"
            placeholder="e.g. Payment gateway times out on retry"
            value={formData.title}
            onChange={handleChange}
            error={getFieldError("title")}
            maxLength={150}
            autoFocus
          />
          <span className="block text-[11px] text-muted-foreground text-right mt-1">
            {formData.title.length}/150
          </span>
        </div>

        <div>
          <label htmlFor="description" className="block text-xs font-medium text-muted-foreground mb-1">
            Description
          </label>
          <Textarea
            id="description"
            name="description"
            placeholder="Steps to reproduce, environment, or error message..."
            value={formData.description}
            onChange={handleChange}
            error={getFieldError("description")}
            rows={3}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="severity" className="block text-xs font-medium text-muted-foreground mb-1">
              Severity <span className="text-destructive">*</span>
            </label>
            <Select
              id="severity"
              name="severity"
              value={formData.severity}
              onChange={handleChange}
              error={getFieldError("severity")}
            >
              {SEVERITIES.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </Select>
          </div>

          <div>
            <label htmlFor="priority" className="block text-xs font-medium text-muted-foreground mb-1">
              Priority
            </label>
            <Select
              id="priority"
              name="priority"
              value={formData.priority}
              onChange={handleChange}
              error={getFieldError("priority")}
            >
              {PRIORITIES.map((p) => (
                <option key={p.value} value={p.value}>
                  {p.label}
                </option>
              ))}
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="reporter" className="block text-xs font-medium text-muted-foreground mb-1">
              Reporter <span className="text-destructive">*</span>
            </label>
            <Input
              id="reporter"
              name="reporter"
              placeholder="e.g. Alice"
              value={formData.reporter}
              onChange={handleChange}
              error={getFieldError("reporter")}
              disabled={isEditing} // reporter is fixed after creation
            />
          </div>

          <div>
            <label htmlFor="assignee" className="block text-xs font-medium text-muted-foreground mb-1">
              Assignee
            </label>
            <Input
              id="assignee"
              name="assignee"
              placeholder="e.g. Krissh (optional)"
              value={formData.assignee}
              onChange={handleChange}
              error={getFieldError("assignee")}
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-border">
          <Button type="button" variant="outline" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button type="submit" disabled={submitting}>
            {submitting ? "Saving..." : isEditing ? "Save changes" : "Create issue"}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
