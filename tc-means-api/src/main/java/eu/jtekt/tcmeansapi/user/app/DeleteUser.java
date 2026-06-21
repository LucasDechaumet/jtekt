package eu.jtekt.tcmeansapi.user.app;

import eu.jtekt.tcmeansapi.user.db.UserRepo;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
@RequiredArgsConstructor
public class DeleteUser {

	private final UserRepo userRepo;

	@Transactional
	public void handle(Long id) {
		if (!userRepo.existsById(id)) {
			throw new ResponseStatusException(HttpStatus.NOT_FOUND, "user_not_found");
		}
		userRepo.deleteById(id);
	}

}
