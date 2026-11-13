package com.squash;

import com.squash.entity.Issue;
import com.squash.enums.Priority;
import com.squash.enums.Severity;
import com.squash.enums.Status;
import com.squash.repository.IssueRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;

@SpringBootApplication
public class SquashApplication {

	public static void main(String[] args) {
		SpringApplication.run(SquashApplication.class, args);
	}

	@Bean
	CommandLineRunner initDatabase(IssueRepository repository) {
		return args -> {
			if (repository.count() == 0) {
				Issue i1 = new Issue();
				i1.setTitle("Login page crash on empty password");
				i1.setDescription("Entering an empty password throws a NullPointerException.");
				i1.setSeverity(Severity.CRITICAL);
				i1.setPriority(Priority.P1);
				i1.setStatus(Status.OPEN);
				i1.setReporter("Alice");
				repository.save(i1);

				Issue i2 = new Issue();
				i2.setTitle("Navbar alignment on mobile");
				i2.setDescription("The navigation links wrap awkwardly on iPhone SE.");
				i2.setSeverity(Severity.LOW);
				i2.setPriority(Priority.P3);
				i2.setStatus(Status.IN_PROGRESS);
				i2.setAssignee("Bob");
				i2.setReporter("Charlie");
				repository.save(i2);

				Issue i3 = new Issue();
				i3.setTitle("Export CSV button missing");
				i3.setDescription("Users cannot export their report data to CSV.");
				i3.setSeverity(Severity.MEDIUM);
				i3.setPriority(Priority.P2);
				i3.setStatus(Status.OPEN);
				i3.setReporter("Diana");
				repository.save(i3);

				Issue i4 = new Issue();
				i4.setTitle("Password reset email not sending");
				i4.setDescription("SMTP connection timeout when triggering reset.");
				i4.setSeverity(Severity.HIGH);
				i4.setPriority(Priority.P1);
				i4.setStatus(Status.RESOLVED);
				i4.setAssignee("Krissh");
				i4.setReporter("Evan");
				repository.save(i4);

				Issue i5 = new Issue();
				i5.setTitle("Typo in footer copyright date");
				i5.setDescription("Footer says 2023 instead of 2026.");
				i5.setSeverity(Severity.LOW);
				i5.setPriority(Priority.P3);
				i5.setStatus(Status.CLOSED);
				i5.setAssignee("Bob");
				i5.setReporter("Grace");
				repository.save(i5);
			}
		};
	}
}
