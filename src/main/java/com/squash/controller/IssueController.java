package com.squash.controller;

import com.squash.dto.*;
import com.squash.enums.Severity;
import com.squash.enums.Status;
import com.squash.service.IssueService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/issues")
public class IssueController {

    private final IssueService issueService;

    public IssueController(IssueService issueService) {
        this.issueService = issueService;
    }

    @PostMapping
    public ResponseEntity<IssueResponse> createIssue(@Valid @RequestBody IssueRequest request) {
        IssueResponse response = issueService.createIssue(request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<IssueResponse>> getAllIssues(
            @RequestParam(required = false) Status status,
            @RequestParam(required = false) Severity severity,
            @RequestParam(required = false) String assignee) {
        List<IssueResponse> issues = issueService.getAllIssues(status, severity, assignee);
        return ResponseEntity.ok(issues);
    }

    @GetMapping("/{id}")
    public ResponseEntity<IssueResponse> getIssueById(@PathVariable Long id) {
        IssueResponse response = issueService.getIssueById(id);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}")
    public ResponseEntity<IssueResponse> updateIssue(
            @PathVariable Long id,
            @Valid @RequestBody IssueRequest request) {
        IssueResponse response = issueService.updateIssue(id, request);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteIssue(@PathVariable Long id) {
        issueService.deleteIssue(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<IssueResponse> updateStatus(
            @PathVariable Long id,
            @Valid @RequestBody StatusUpdateRequest request) {
        IssueResponse response = issueService.updateStatus(id, request.getStatus());
        return ResponseEntity.ok(response);
    }

    @PatchMapping("/{id}/assign")
    public ResponseEntity<IssueResponse> assignIssue(
            @PathVariable Long id,
            @Valid @RequestBody AssignRequest request) {
        IssueResponse response = issueService.assignIssue(id, request.getAssignee());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/severity/{severity}")
    public ResponseEntity<List<IssueResponse>> getIssuesBySeverity(@PathVariable Severity severity) {
        List<IssueResponse> issues = issueService.getIssuesBySeverity(severity);
        return ResponseEntity.ok(issues);
    }

    @GetMapping("/search")
    public ResponseEntity<List<IssueResponse>> searchIssues(@RequestParam String keyword) {
        List<IssueResponse> issues = issueService.searchIssues(keyword);
        return ResponseEntity.ok(issues);
    }

    @GetMapping("/stats")
    public ResponseEntity<StatsResponse> getStats() {
        StatsResponse stats = issueService.getStats();
        return ResponseEntity.ok(stats);
    }
}
