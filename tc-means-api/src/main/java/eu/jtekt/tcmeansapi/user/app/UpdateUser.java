package eu.jtekt.tcmeansapi.user.app;

import eu.jtekt.tcmeansapi.user.api.request.UpdateUserRequest;
import eu.jtekt.tcmeansapi.user.api.response.UserResponse;
import eu.jtekt.tcmeansapi.user.db.User;
import eu.jtekt.tcmeansapi.user.db.UserRepo;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
@RequiredArgsConstructor
public class UpdateUser {

	private final UserRepo userRepo;
	private final PasswordEncoder passwordEncoder;

	@Transactional
	public UserResponse handle(Long id, UpdateUserRequest request) {
		User user = userRepo.findById(id)
			.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "user_not_found"));

		if (request.getUsername() != null && !request.getUsername().isBlank()
			&& !request.getUsername().equals(user.getUsername())) {
			userRepo.findByUsername(request.getUsername()).ifPresent(existing -> {
				throw new ResponseStatusException(HttpStatus.CONFLICT, "username_already_exists");
			});
			user.setUsername(request.getUsername());
		}

		if (request.getPassword() != null && !request.getPassword().isBlank()) {
			user.setPassword(passwordEncoder.encode(request.getPassword()));
		}

		if (request.getRole() != null) {
			user.setRole(request.getRole());
		}

		return UserResponse.from(user);
	}

}
