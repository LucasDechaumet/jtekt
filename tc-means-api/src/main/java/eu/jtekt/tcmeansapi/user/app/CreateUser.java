package eu.jtekt.tcmeansapi.user.app;

import eu.jtekt.tcmeansapi.user.Role;
import eu.jtekt.tcmeansapi.user.api.request.CreateUserRequest;
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
public class CreateUser {

	private final UserRepo userRepo;
	private final PasswordEncoder passwordEncoder;

	@Transactional
	public UserResponse handle(CreateUserRequest request) {
		if (request.getUsername() == null || request.getUsername().isBlank()) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "username_required");
		}
		if (request.getPassword() == null || request.getPassword().isBlank()) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "password_required");
		}
		if (userRepo.findByUsername(request.getUsername()).isPresent()) {
			throw new ResponseStatusException(HttpStatus.CONFLICT, "username_already_exists");
		}

		User user = userRepo.save(User.builder()
			.username(request.getUsername())
			.password(passwordEncoder.encode(request.getPassword()))
			.role(request.getRole() == null ? Role.USER : request.getRole())
			.build());

		return UserResponse.from(user);
	}

}
