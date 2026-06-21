package eu.jtekt.tcmeansapi.auth.app;

import eu.jtekt.tcmeansapi.auth.api.response.MeResponse;
import eu.jtekt.tcmeansapi.user.db.UserRepo;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class Me {

	private final UserRepo userRepo;

	@Transactional(readOnly = true)
	public MeResponse handle(Authentication authentication) {
		return userRepo.findByUsername(authentication.getName())
			.map(user -> new MeResponse(user.getUsername(), user.getRole()))
			.orElseThrow(() -> new UsernameNotFoundException("User not found"));
	}

}
