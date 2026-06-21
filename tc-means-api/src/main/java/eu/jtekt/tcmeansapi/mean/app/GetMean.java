package eu.jtekt.tcmeansapi.mean.app;

import eu.jtekt.tcmeansapi.mean.db.Mean;
import eu.jtekt.tcmeansapi.mean.db.MeanRepo;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
@RequiredArgsConstructor
public class GetMean {

	private final MeanRepo meanRepo;

	@Transactional(readOnly = true)
	public Mean handle(Long id) {
		return meanRepo.findById(id)
			.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "mean_not_found"));
	}

}
