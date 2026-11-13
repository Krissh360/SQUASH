package com.squash.dto;

import com.squash.enums.Severity;
import com.squash.enums.Status;
import lombok.Builder;
import lombok.Data;

import java.util.Map;

@Data
@Builder
public class StatsResponse {
    private long total;
    private Map<Status, Long> byStatus;
    private Map<Severity, Long> bySeverity;
}
