package com.squash.dto;

import jakarta.validation.constraints.NotBlank;

public class AssignRequest {
    @NotBlank(message = "Assignee is required")
    private String assignee;

    public AssignRequest() {
    }

    public AssignRequest(String assignee) {
        this.assignee = assignee;
    }

    public String getAssignee() {
        return assignee;
    }

    public void setAssignee(String assignee) {
        this.assignee = assignee;
    }
}
