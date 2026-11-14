import { useState, useEffect, useMemo, useCallback } from "react";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "../components/ui/Table";
import Badge from "../components/ui/Badge";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import Select from "../components/ui/Select";
import Card from "../components/ui/Card";
import Skeleton from "../components/ui/Skeleton";
import Dialog from "../components/ui/Dialog";
import { useToast } from "../components/ui/Toast";
import {
  fetchIssues,
  searchIssues,
  deleteIssue,
} from "../api/issues";
import {
  Search,
  RotateCcw,
  Plus,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Eye,
  Edit2,
  Trash2,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  FolderOpen,
} from "lucide-react";

const PAGE_SIZE = 10;

const SEVERITY_ORDER = {
  LOW: 1,
  MEDIUM: 2,
  HIGH: 3,
  CRITICAL: 4,
};

const STATUS_ORDER = {
  OPEN: 1,
  IN_PROGRESS: 2,
  RESOLVED: 3,
  CLOSED: 4,
};

export default function Issues({
  refreshTrigger,
  onSelectIssue,
  onOpenNewIssue,
  onEditIssue,
}) {
  const toast = useToast();
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [severityFilter, setSeverityFilter] = useState("");
  const [assigneeFilter, setAssigneeFilter] = useState("");

  // Sorting
  const [sortField, setSortField] = useState("createdAt"); // 'createdAt', 'severity', 'status', 'id'
  const [sortDirection, setSortDirection] = useState("desc"); // 'asc', 'desc'

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);

  // Deletion modal state
  const [issueToDelete, setIssueToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Debounce search input by 300ms
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery.trim());
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch issues
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      let data = [];
      if (debouncedSearch) {
        // Use search endpoint
        data = await searchIssues(debouncedSearch);
        // If other filters are also selected, filter in memory
        if (statusFilter) {
          data = data.filter((i) => i.status === statusFilter);
        }
        if (severityFilter) {
          data = data.filter((i) => i.severity === severityFilter);
        }
        if (assigneeFilter) {
          data = data.filter(
            (i) =>
              i.assignee &&
              i.assignee.toLowerCase() === assigneeFilter.toLowerCase()
          );
        }
      } else {
        // Use combined filter endpoint
        data = await fetchIssues({
          status: statusFilter || undefined,
          severity: severityFilter || undefined,
          assignee: assigneeFilter || undefined,
        });
      }
      setIssues(data || []);
      setCurrentPage(1); // Reset to first page on filter change
    } catch (err) {
      toast.error(err);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, statusFilter, severityFilter, assigneeFilter, toast]);

  useEffect(() => {
    loadData();
  }, [loadData, refreshTrigger]);

  // Extract unique assignees for the filter dropdown
  const uniqueAssignees = useMemo(() => {
    const set = new Set();
    issues.forEach((i) => {
      if (i.assignee) set.add(i.assignee);
    });
    return Array.from(set).sort();
  }, [issues]);

  const handleClearFilters = () => {
    setSearchQuery("");
    setDebouncedSearch("");
    setStatusFilter("");
    setSeverityFilter("");
    setAssigneeFilter("");
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  // Sort and paginate data
  const sortedIssues = useMemo(() => {
    return [...issues].sort((a, b) => {
      let comp = 0;
      if (sortField === "id") {
        comp = a.id - b.id;
      } else if (sortField === "severity") {
        comp = (SEVERITY_ORDER[a.severity] || 0) - (SEVERITY_ORDER[b.severity] || 0);
      } else if (sortField === "status") {
        comp = (STATUS_ORDER[a.status] || 0) - (STATUS_ORDER[b.status] || 0);
      } else if (sortField === "createdAt") {
        const timeA = new Date(a.createdAt || 0).getTime();
        const timeB = new Date(b.createdAt || 0).getTime();
        comp = timeA - timeB;
      }
      return sortDirection === "asc" ? comp : -comp;
    });
  }, [issues, sortField, sortDirection]);

  const totalPages = Math.max(1, Math.ceil(sortedIssues.length / PAGE_SIZE));
  const paginatedIssues = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return sortedIssues.slice(start, start + PAGE_SIZE);
  }, [sortedIssues, currentPage]);

  const handleDeleteConfirm = async () => {
    if (!issueToDelete) return;
    setIsDeleting(true);
    try {
      await deleteIssue(issueToDelete.id);
      toast.success(`Issue #${issueToDelete.id} deleted`);
      setIssueToDelete(null);
      loadData();
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
      });
    } catch {
      return isoString;
    }
  };

  const renderSortIcon = (field) => {
    if (sortField !== field) {
      return <ArrowUpDown className="ml-1 h-3.5 w-3.5 inline opacity-40" />;
    }
    return sortDirection === "asc" ? (
      <ArrowUp className="ml-1 h-3.5 w-3.5 inline text-primary" />
    ) : (
      <ArrowDown className="ml-1 h-3.5 w-3.5 inline text-primary" />
    );
  };

  const hasActiveFilters =
    Boolean(searchQuery || statusFilter || severityFilter || assigneeFilter);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">
            Tracking
          </span>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Issues</h1>
          <p className="text-sm text-muted-foreground">
            Filter, triage, and manage bug reports across your project.
          </p>
        </div>
        <Button onClick={onOpenNewIssue}>
          <Plus className="h-4 w-4" />
          <span>New issue</span>
        </Button>
      </div>

      {/* Filter bar */}
      <Card className="p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 items-center">
          {/* Search box */}
          <div className="relative md:col-span-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search title & description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Status filter */}
          <div>
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              aria-label="Filter by Status"
            >
              <option value="">All Statuses</option>
              <option value="OPEN">Open</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="RESOLVED">Resolved</option>
              <option value="CLOSED">Closed</option>
            </Select>
          </div>

          {/* Severity filter */}
          <div>
            <Select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              aria-label="Filter by Severity"
            >
              <option value="">All Severities</option>
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
              <option value="CRITICAL">Critical</option>
            </Select>
          </div>

          {/* Assignee filter / Clear */}
          <div className="flex items-center gap-2">
            <Select
              value={assigneeFilter}
              onChange={(e) => setAssigneeFilter(e.target.value)}
              className="flex-1"
              aria-label="Filter by Assignee"
            >
              <option value="">All Assignees</option>
              {uniqueAssignees.map((a) => (
                <option key={a} value={a}>
                  {a}
                </option>
              ))}
            </Select>

            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="icon"
                onClick={handleClearFilters}
                title="Clear filters"
                aria-label="Clear filters"
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* Table & Content */}
      <Card className="p-0 overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-4">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        ) : sortedIssues.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <FolderOpen className="mx-auto h-10 w-10 text-muted-foreground/60" />
            <h3 className="text-base font-semibold text-foreground">
              {hasActiveFilters ? "No matching issues" : "No bugs yet. Nothing to squash."}
            </h3>
            <p className="text-sm text-muted-foreground max-w-sm mx-auto">
              {hasActiveFilters
                ? "Try adjusting your search keywords or removing active filter dropdowns."
                : "You're all clear! Click 'New issue' above to report a bug."}
            </p>
            {hasActiveFilters && (
              <Button variant="outline" size="sm" onClick={handleClearFilters}>
                Clear all filters
              </Button>
            )}
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead
                  className="w-16 cursor-pointer select-none"
                  onClick={() => handleSort("id")}
                >
                  ID {renderSortIcon("id")}
                </TableHead>
                <TableHead className="min-w-[200px]">Title</TableHead>
                <TableHead
                  className="cursor-pointer select-none"
                  onClick={() => handleSort("severity")}
                >
                  Severity {renderSortIcon("severity")}
                </TableHead>
                <TableHead className="w-20">Priority</TableHead>
                <TableHead
                  className="cursor-pointer select-none"
                  onClick={() => handleSort("status")}
                >
                  Status {renderSortIcon("status")}
                </TableHead>
                <TableHead>Assignee</TableHead>
                <TableHead
                  className="cursor-pointer select-none"
                  onClick={() => handleSort("createdAt")}
                >
                  Created {renderSortIcon("createdAt")}
                </TableHead>
                <TableHead className="text-right w-24">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedIssues.map((issue) => (
                <TableRow
                  key={issue.id}
                  className="cursor-pointer hover:bg-muted/40"
                  onClick={() => onSelectIssue(issue.id)}
                >
                  <TableCell className="font-mono text-xs font-semibold text-muted-foreground">
                    #{issue.id}
                  </TableCell>
                  <TableCell className="font-medium text-foreground max-w-xs truncate">
                    {issue.title}
                  </TableCell>
                  <TableCell>
                    <Badge type="severity" value={issue.severity} />
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {issue.priority}
                  </TableCell>
                  <TableCell>
                    <Badge type="status" value={issue.status} />
                  </TableCell>
                  <TableCell className="text-xs text-foreground">
                    {issue.assignee || (
                      <span className="text-muted-foreground italic">Unassigned</span>
                    )}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {formatDate(issue.createdAt)}
                  </TableCell>
                  <TableCell
                    className="text-right"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-muted-foreground hover:text-foreground"
                        onClick={() => onSelectIssue(issue.id)}
                        title="View details"
                        aria-label="View details"
                      >
                        <Eye className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-muted-foreground hover:text-foreground"
                        onClick={() => onEditIssue?.(issue)}
                        title="Edit issue"
                        aria-label="Edit issue"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-destructive hover:text-destructive"
                        onClick={() => setIssueToDelete(issue)}
                        title="Delete issue"
                        aria-label="Delete issue"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}

        {/* Pagination controls */}
        {sortedIssues.length > 0 && (
          <div className="flex items-center justify-between border-t border-border px-6 py-3">
            <span className="text-xs text-muted-foreground">
              Showing {(currentPage - 1) * PAGE_SIZE + 1} to{" "}
              {Math.min(currentPage * PAGE_SIZE, sortedIssues.length)} of{" "}
              {sortedIssues.length} issues
            </span>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
                <span className="hidden sm:inline">Previous</span>
              </Button>
              <span className="text-xs font-medium px-2">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                <span className="hidden sm:inline">Next</span>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Delete confirmation modal */}
      <Dialog
        open={Boolean(issueToDelete)}
        onClose={() => setIssueToDelete(null)}
        title="Delete Issue"
      >
        <div className="space-y-4">
          <div className="flex items-start gap-3 text-destructive">
            <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5" />
            <p className="text-sm text-foreground">
              Are you sure you want to delete{" "}
              <strong className="text-foreground">
                Issue #{issueToDelete?.id} ({issueToDelete?.title})
              </strong>
              ? This action cannot be undone.
            </p>
          </div>
          <div className="flex justify-end gap-3 pt-3 border-t border-border">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIssueToDelete(null)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete issue"}
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
