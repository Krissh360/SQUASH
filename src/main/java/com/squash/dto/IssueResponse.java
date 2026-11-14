package com.squash.dto;

import com.squash.enums.Priority;
import com.squash.enums.Severity;
import com.squash.enums.Status;

import java.time.LocalDateTime;

public class IssueResponse {
    private Long id;
    private String title;
    private String description;
    private Severity severity;
    private Priority priority;
    private Status status;
    private String assignee;
    private String reporter;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime resolvedAt;

    public IssueResponse() {
    }

    public IssueResponse(Long id, String title, String description, Severity severity, Priority priority,
                         Status status, String assignee, String reporter, LocalDateTime createdAt,
                         LocalDateTime updatedAt, LocalDateTime resolvedAt) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.severity = severity;
        this.priority = priority;
        this.status = status;
        this.assignee = assignee;
        this.reporter = reporter;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.resolvedAt = resolvedAt;
    }

    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private Long id;
        private String title;
        private String description;
        private Severity severity;
        private Priority priority;
        private Status status;
        private String assignee;
        private String reporter;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;
        private LocalDateTime resolvedAt;

        public Builder id(Long id) { this.id = id; return this; }
        public Builder title(String title) { this.title = title; return this; }
        public Builder description(String description) { this.description = description; return this; }
        public Builder severity(Severity severity) { this.severity = severity; return this; }
        public Builder priority(Priority priority) { this.priority = priority; return this; }
        public Builder status(Status status) { this.status = status; return this; }
        public Builder assignee(String assignee) { this.assignee = assignee; return this; }
        public Builder reporter(String reporter) { this.reporter = reporter; return this; }
        public Builder createdAt(LocalDateTime createdAt) { this.createdAt = createdAt; return this; }
        public Builder updatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; return this; }
        public Builder resolvedAt(LocalDateTime resolvedAt) { this.resolvedAt = resolvedAt; return this; }

        public IssueResponse build() {
            return new IssueResponse(id, title, description, severity, priority, status, assignee, reporter, createdAt, updatedAt, resolvedAt);
        }
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public Severity getSeverity() { return severity; }
    public void setSeverity(Severity severity) { this.severity = severity; }

    public Priority getPriority() { return priority; }
    public void setPriority(Priority priority) { this.priority = priority; }

    public Status getStatus() { return status; }
    public void setStatus(Status status) { this.status = status; }

    public String getAssignee() { return assignee; }
    public void setAssignee(String assignee) { this.assignee = assignee; }

    public String getReporter() { return reporter; }
    public void setReporter(String reporter) { this.reporter = reporter; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    public LocalDateTime getResolvedAt() { return resolvedAt; }
    public void setResolvedAt(LocalDateTime resolvedAt) { this.resolvedAt = resolvedAt; }
}
