package com.squash.dto;

import com.squash.enums.*;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
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
}
