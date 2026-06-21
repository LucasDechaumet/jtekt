package eu.jtekt.tcmeansapi.user.app;

import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import eu.jtekt.tcmeansapi.user.db.UserRepo;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class LoadUser implements UserDetailsService {

	private final UserRepo userRepository;

	@Override
	@Transactional(readOnly = true)
	public UserDetails loadUserByUsername(String username) {
		return userRepository.findByUsername(username)
			.map(user -> org.springframework.security.core.userdetails.User
				.withUsername(user.getUsername())
				.password(user.getPassword())
				.roles(user.getRole().name())
				.build())
			.orElseThrow(() -> new UsernameNotFoundException("User not found"));
	}
}
