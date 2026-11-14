/**
 * SQUASH API client — all backend calls in one file.
 *
 * Backend response shapes:
 *   IssueResponse:  { id, title, description, severity, priority, status, assignee, reporter, createdAt, updatedAt, resolvedAt }
 *   StatsResponse:  { total, byStatus: { OPEN, IN_PROGRESS, RESOLVED, CLOSED }, bySeverity: { LOW, MEDIUM, HIGH, CRITICAL } }
 *   ErrorResponse:  { timestamp, status, error, message, path, fieldErrors }
 *
 * List endpoints return plain JSON arrays (no pagination wrapper).
 */

const BASE = import.meta.env.VITE_API_URL || "http://localhost:8080";

// ── Error helper ──

export class ApiError extends Error {
  constructor(status, data) {
    super(data?.message || "Something went wrong");
    this.status = status;
    this.data = data; // full ErrorResponse from backend
    this.fieldErrors = data?.fieldErrors || null;
  }
}

async function request(path, options = {}) {
  let res;
  try {
    res = await fetch(`${BASE}${path}`, {
      headers: { "Content-Type": "application/json", ...options.headers },
      ...options,
    });
  } catch {
    throw new ApiError(0, {
      message: "Cannot reach the SQUASH server. Is the backend running?",
    });
  }

  // 204 No Content (delete)
  if (res.status === 204) return null;

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    throw new ApiError(res.status, data);
  }

  return data;
}

// ── Issues ──

/** List / filter issues. All params optional. */
export function fetchIssues({ status, severity, assignee } = {}) {
  const params = new URLSearchParams();
  if (status) params.set("status", status);
  if (severity) params.set("severity", severity);
  if (assignee) params.set("assignee", assignee);
  const qs = params.toString();
  return request(`/api/issues${qs ? `?${qs}` : ""}`);
}

/** Search issues by keyword (title + description). */
export function searchIssues(keyword) {
  return request(`/api/issues/search?keyword=${encodeURIComponent(keyword)}`);
}

/** Get a single issue by ID. */
export function fetchIssue(id) {
  return request(`/api/issues/${id}`);
}

/** Create a new issue. */
export function createIssue(body) {
  return request("/api/issues", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

/** Update (replace) an issue. */
export function updateIssue(id, body) {
  return request(`/api/issues/${id}`, {
    method: "PUT",
    body: JSON.stringify(body),
  });
}

/** Delete an issue. */
export function deleteIssue(id) {
  return request(`/api/issues/${id}`, { method: "DELETE" });
}

/** Change issue status (PATCH). */
export function updateStatus(id, status) {
  return request(`/api/issues/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
}

/** Assign an issue (PATCH). */
export function assignIssue(id, assignee) {
  return request(`/api/issues/${id}/assign`, {
    method: "PATCH",
    body: JSON.stringify({ assignee }),
  });
}

/** Get aggregate stats. */
export function fetchStats() {
  return request("/api/issues/stats");
}

/** Get issues by severity. */
export function fetchBySeverity(severity) {
  return request(`/api/issues/severity/${severity}`);
}
