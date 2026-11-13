package com.squash.dto;

import com.squash.enums.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class IssueRequest {
    @NotBlank(message = "Title is required")
    @Size(max = 150, message = "Title must be at most 150 characters")
    private String title;

    private String description;

    @NotNull(message = "Severity is required")
    private Severity severity;

    private Priority priority = Priority.P3;

    private String assignee;

    @NotBlank(message = "Reporter is required")
    private String reporter;
}
