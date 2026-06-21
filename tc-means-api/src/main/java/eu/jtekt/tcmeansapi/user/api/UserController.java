package eu.jtekt.tcmeansapi.user.api;

import eu.jtekt.tcmeansapi.user.api.request.CreateUserRequest;
import eu.jtekt.tcmeansapi.user.api.request.UpdateUserRequest;
import eu.jtekt.tcmeansapi.user.api.response.UserResponse;
import eu.jtekt.tcmeansapi.user.app.CreateUser;
import eu.jtekt.tcmeansapi.user.app.DeleteUser;
import eu.jtekt.tcmeansapi.user.app.GetAllUsers;
import eu.jtekt.tcmeansapi.user.app.UpdateUser;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
public class UserController {

	private final GetAllUsers getAllUsers;
	private final CreateUser createUser;
	private final UpdateUser updateUser;
	private final DeleteUser deleteUser;

	@GetMapping
	public List<UserResponse> findAll() {
		return getAllUsers.handle();
	}

	@PostMapping
	public UserResponse create(@RequestBody CreateUserRequest request) {
		return createUser.handle(request);
	}

	@PutMapping("/{id}")
	public UserResponse update(@PathVariable Long id, @RequestBody UpdateUserRequest request) {
		return updateUser.handle(id, request);
	}

	@DeleteMapping("/{id}")
	public void delete(@PathVariable Long id) {
		deleteUser.handle(id);
	}

}
