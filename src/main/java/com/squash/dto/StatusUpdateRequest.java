package com.squash.dto;

import com.squash.enums.Status;
import jakarta.validation.constraints.NotNull;

public class StatusUpdateRequest {
    @NotNull(message = "Status is required")
    private Status status;

    public StatusUpdateRequest() {
    }

    public StatusUpdateRequest(Status status) {
        this.status = status;
    }

    public Status getStatus() {
        return status;
    }

    public void setStatus(Status status) {
        this.status = status;
    }
}
