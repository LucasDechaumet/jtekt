package eu.jtekt.tcmeansapi.auth.api.response;

import eu.jtekt.tcmeansapi.user.Role;
import lombok.Value;

@Value
public class MeResponse {

	String username;
	Role role;

}
