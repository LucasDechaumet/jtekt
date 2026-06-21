package eu.jtekt.tcmeansapi.user.api.response;

import eu.jtekt.tcmeansapi.user.Role;
import eu.jtekt.tcmeansapi.user.db.User;

public record UserResponse(Long id, String username, Role role) {

	public static UserResponse from(User user) {
		return new UserResponse(user.getId(), user.getUsername(), user.getRole());
	}

}
