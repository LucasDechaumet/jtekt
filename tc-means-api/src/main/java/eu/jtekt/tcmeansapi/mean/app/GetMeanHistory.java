package eu.jtekt.tcmeansapi.mean.app;

import eu.jtekt.tcmeansapi.mean.db.MeanHistory;
import eu.jtekt.tcmeansapi.mean.db.MeanHistoryRepo;
import eu.jtekt.tcmeansapi.mean.db.MeanRepo;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
@RequiredArgsConstructor
public class GetMeanHistory {

	private final MeanRepo meanRepo;
	private final MeanHistoryRepo meanHistoryRepo;

	@Transactional(readOnly = true)
	public Page<MeanHistory> handle(Long meanId, Pageable pageable) {
		if (!meanRepo.existsById(meanId)) {
			throw new ResponseStatusException(HttpStatus.NOT_FOUND, "mean_not_found");
		}
		return meanHistoryRepo.findByMeanIdOrderByCreatedAtDesc(meanId.toString(), pageable);
	}

}
