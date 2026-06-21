package eu.jtekt.tcmeansapi.user.api.request;

import eu.jtekt.tcmeansapi.user.Role;
import lombok.Data;

@Data
public class UpdateUserRequest {

	private String username;

	private String password;

	private Role role;

}
