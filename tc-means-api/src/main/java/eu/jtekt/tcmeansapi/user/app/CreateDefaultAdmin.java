package eu.jtekt.tcmeansapi.user.app;

import eu.jtekt.tcmeansapi.user.Role;
import eu.jtekt.tcmeansapi.user.db.User;
import eu.jtekt.tcmeansapi.user.db.UserRepo;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class CreateDefaultAdmin implements CommandLineRunner {

	private final UserRepo userRepo;
	private final PasswordEncoder passwordEncoder;

	@Override
	public void run(String... args) {
		if (userRepo.findByUsername("admin").isPresent()) {
			return;
		}

		userRepo.save(User.builder()
			.username("admin")
			.password(passwordEncoder.encode("admin"))
			.role(Role.ADMIN)
			.build());
	}
}
