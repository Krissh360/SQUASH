package com.squash.service;

import com.squash.dto.*;
import com.squash.entity.Issue;
import com.squash.enums.Severity;
import com.squash.enums.Status;
import com.squash.exception.InvalidStatusTransitionException;
import com.squash.exception.IssueNotFoundException;
import com.squash.repository.IssueRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class IssueService {

    private final IssueRepository issueRepository;

    public IssueService(IssueRepository issueRepository) {
        this.issueRepository = issueRepository;
    }

    @Transactional
    public IssueResponse createIssue(IssueRequest request) {
        Issue issue = new Issue();
        issue.setTitle(request.getTitle());
        issue.setDescription(request.getDescription());
        issue.setSeverity(request.getSeverity());
        if (request.getPriority() != null) {
            issue.setPriority(request.getPriority());
        }
        issue.setStatus(Status.OPEN); // forced to OPEN
        issue.setAssignee(request.getAssignee());
        issue.setReporter(request.getReporter());

        Issue saved = issueRepository.save(issue);
        return mapToResponse(saved);
    }

    public List<IssueResponse> getAllIssuesFiltered(Status status, Severity severity, String assignee, Pageable pageable) {
        Page<Issue> page;
        List<Issue> allIssues = issueRepository.findAll();

        // Simple in-memory or custom spec filtering for maximum reliability
        List<Issue> filtered = allIssues.stream()
                .filter(i -> status == null || i.getStatus() == status)
                .filter(i -> severity == null || i.getSeverity() == severity)
                .filter(i -> assignee == null || i.getAssignee() != null && i.getAssignee().equalsIgnoreCase(assignee))
                .collect(Collectors.toList());

        int start = (int) pageable.getOffset();
        int end = Math.min((start + pageable.getPageSize()), filtered.size());

        if (start > filtered.size()) {
            return Collections.emptyList();
        }

        return filtered.subList(start, end).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public Page<IssueResponse> getIssues(Status status, Severity severity, String assignee, Pageable pageable) {
        // We can use a custom specification or filtered stream for full flexibility
        List<IssueResponse> allFiltered = getAllIssuesFiltered(status, severity, assignee, pageable);
        // For simplicity and Page return type, let's build using PageImpl or direct repository query
        // Let's implement a clean Specification or query method in repository if needed,
        // or just return List and let controller handle or return PageImpl.
        return null; // We'll implement a proper repository query or standard page approach
    }

    public List<IssueResponse> getAllIssues(Status status, Severity severity, String assignee) {
        return issueRepository.findAll().stream()
                .filter(i -> status == null || i.getStatus() == status)
                .filter(i -> severity == null || i.getSeverity() == severity)
                .filter(i -> assignee == null || (i.getAssignee() != null && i.getAssignee().equalsIgnoreCase(assignee)))
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public IssueResponse getIssueById(Long id) {
        Issue issue = issueRepository.findById(id)
                .orElseThrow(() -> new IssueNotFoundException("Issue not found with id " + id));
        return mapToResponse(issue);
    }

    @Transactional
    public IssueResponse updateIssue(Long id, IssueRequest request) {
        Issue issue = issueRepository.findById(id)
                .orElseThrow(() -> new IssueNotFoundException("Issue not found with id " + id));

        issue.setTitle(request.getTitle());
        issue.setDescription(request.getDescription());
        issue.setSeverity(request.getSeverity());
        if (request.getPriority() != null) {
            issue.setPriority(request.getPriority());
        }
        issue.setAssignee(request.getAssignee());

        Issue updated = issueRepository.save(issue);
        return mapToResponse(updated);
    }

    @Transactional
    public void deleteIssue(Long id) {
        if (!issueRepository.existsById(id)) {
            throw new IssueNotFoundException("Issue not found with id " + id);
        }
        issueRepository.deleteById(id);
    }

    @Transactional
    public IssueResponse updateStatus(Long id, Status newStatus) {
        Issue issue = issueRepository.findById(id)
                .orElseThrow(() -> new IssueNotFoundException("Issue not found with id " + id));

        Status currentStatus = issue.getStatus();
        validateStatusTransition(currentStatus, newStatus);

        issue.setStatus(newStatus);

        if (newStatus == Status.RESOLVED) {
            issue.setResolvedAt(LocalDateTime.now());
        } else if (currentStatus == Status.RESOLVED && newStatus == Status.OPEN) {
            issue.setResolvedAt(null);
        }

        Issue saved = issueRepository.save(issue);
        return mapToResponse(saved);
    }

    @Transactional
    public IssueResponse assignIssue(Long id, String assignee) {
        Issue issue = issueRepository.findById(id)
                .orElseThrow(() -> new IssueNotFoundException("Issue not found with id " + id));

        issue.setAssignee(assignee);
        Issue saved = issueRepository.save(issue);
        return mapToResponse(saved);
    }

    public List<IssueResponse> getIssuesBySeverity(Severity severity) {
        return issueRepository.findAll().stream()
                .filter(i -> i.getSeverity() == severity)
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public List<IssueResponse> searchIssues(String keyword) {
        if (keyword == null || keyword.trim().isEmpty()) {
            return Collections.emptyList();
        }
        String lowerKw = keyword.toLowerCase();
        return issueRepository.findAll().stream()
                .filter(i -> (i.getTitle() != null && i.getTitle().toLowerCase().contains(lowerKw)) ||
                             (i.getDescription() != null && i.getDescription().toLowerCase().contains(lowerKw)))
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public StatsResponse getStats() {
        List<Issue> issues = issueRepository.findAll();
        long total = issues.size();

        Map<Status, Long> byStatus = Arrays.stream(Status.values())
                .collect(Collectors.toMap(s -> s, s -> 0L));
        Map<Severity, Long> bySeverity = Arrays.stream(Severity.values())
                .collect(Collectors.toMap(sev -> sev, sev -> 0L));

        for (Issue i : issues) {
            byStatus.put(i.getStatus(), byStatus.get(i.getStatus()) + 1);
            bySeverity.put(i.getSeverity(), bySeverity.get(i.getSeverity()) + 1);
        }

        return StatsResponse.builder()
                .total(total)
                .byStatus(byStatus)
                .bySeverity(bySeverity)
                .build();
    }

    private void validateStatusTransition(Status current, Status target) {
        boolean valid = false;
        if (current == Status.OPEN && target == Status.IN_PROGRESS) valid = true;
        else if (current == Status.IN_PROGRESS && target == Status.RESOLVED) valid = true;
        else if (current == Status.IN_PROGRESS && target == Status.OPEN) valid = true;
        else if (current == Status.RESOLVED && target == Status.CLOSED) valid = true;
        else if (current == Status.RESOLVED && target == Status.OPEN) valid = true;

        if (!valid) {
            throw new InvalidStatusTransitionException(
                    String.format("Invalid status transition from %s to %s", current, target)
            );
        }
    }

    public IssueResponse mapToResponse(Issue issue) {
        return IssueResponse.builder()
                .id(issue.getId())
                .title(issue.getTitle())
                .description(issue.getDescription())
                .severity(issue.getSeverity())
                .priority(issue.getPriority())
                .status(issue.getStatus())
                .assignee(issue.getAssignee())
                .reporter(issue.getReporter())
                .createdAt(issue.getCreatedAt())
                .updatedAt(issue.getUpdatedAt())
                .resolvedAt(issue.getResolvedAt())
                .build();
    }
}
