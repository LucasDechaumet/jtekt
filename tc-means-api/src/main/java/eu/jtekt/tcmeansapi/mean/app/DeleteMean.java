package eu.jtekt.tcmeansapi.mean.app;

import eu.jtekt.tcmeansapi.mean.db.MeanHistoryRepo;
import eu.jtekt.tcmeansapi.mean.db.MeanRepo;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
@RequiredArgsConstructor
public class DeleteMean {

	private final MeanRepo meanRepo;
	private final MeanHistoryRepo meanHistoryRepo;

	@Transactional
	public void handle(Long id) {
		if (!meanRepo.existsById(id)) {
			throw new ResponseStatusException(HttpStatus.NOT_FOUND, "mean_not_found");
		}
		meanHistoryRepo.deleteByMeanId(id.toString());
		meanRepo.deleteById(id);
	}

}
