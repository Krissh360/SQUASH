package com.squash.dto;

import com.squash.enums.Severity;
import com.squash.enums.Status;

import java.util.Map;

public class StatsResponse {
    private long total;
    private Map<Status, Long> byStatus;
    private Map<Severity, Long> bySeverity;

    public StatsResponse() {
    }

    public StatsResponse(long total, Map<Status, Long> byStatus, Map<Severity, Long> bySeverity) {
        this.total = total;
        this.byStatus = byStatus;
        this.bySeverity = bySeverity;
    }

    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private long total;
        private Map<Status, Long> byStatus;
        private Map<Severity, Long> bySeverity;

        public Builder total(long total) { this.total = total; return this; }
        public Builder byStatus(Map<Status, Long> byStatus) { this.byStatus = byStatus; return this; }
        public Builder bySeverity(Map<Severity, Long> bySeverity) { this.bySeverity = bySeverity; return this; }

        public StatsResponse build() {
            return new StatsResponse(total, byStatus, bySeverity);
        }
    }

    public long getTotal() { return total; }
    public void setTotal(long total) { this.total = total; }

    public Map<Status, Long> getByStatus() { return byStatus; }
    public void setByStatus(Map<Status, Long> byStatus) { this.byStatus = byStatus; }

    public Map<Severity, Long> getBySeverity() { return bySeverity; }
    public void setBySeverity(Map<Severity, Long> bySeverity) { this.bySeverity = bySeverity; }
}
