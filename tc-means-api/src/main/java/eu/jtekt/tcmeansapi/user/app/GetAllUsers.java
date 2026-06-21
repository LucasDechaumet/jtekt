package eu.jtekt.tcmeansapi.user.app;

import eu.jtekt.tcmeansapi.user.api.response.UserResponse;
import eu.jtekt.tcmeansapi.user.db.UserRepo;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class GetAllUsers {

	private final UserRepo userRepo;

	@Transactional(readOnly = true)
	public List<UserResponse> handle() {
		return userRepo.findAll().stream()
			.map(UserResponse::from)
			.toList();
	}

}
