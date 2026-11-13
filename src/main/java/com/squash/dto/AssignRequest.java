package com.squash.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class AssignRequest {
    @NotBlank(message = "Assignee is required")
    private String assignee;
}
