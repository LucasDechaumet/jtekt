package eu.jtekt.tcmeansapi.mean.app;

import eu.jtekt.tcmeansapi.mean.db.Mean;
import eu.jtekt.tcmeansapi.mean.db.MeanHistoryRepo;
import eu.jtekt.tcmeansapi.mean.db.MeanRepo;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
@RequiredArgsConstructor
public class CorrectMeanError {

	private final MeanRepo meanRepo;
	private final MeanHistoryRepo meanHistoryRepo;
	private final CreateMeanHistory createMeanHistory;

	@Transactional
	public Mean handle(Long errorId, String correctedCode) {
		if (correctedCode == null || correctedCode.isBlank()) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "code_required");
		}

		Mean errorMean = meanRepo.findById(errorId)
			.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "error_mean_not_found"));

		Mean realMean = meanRepo.findByCode(correctedCode.trim())
			.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "code_not_found"));

		if (realMean.getId().equals(errorMean.getId())) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "same_mean");
		}

		// Apply the erroneous scan event to the real mean, then record it in its history.
		realMean.setIsOut(errorMean.getIsOut());
		realMean.setBorrower(errorMean.getBorrower());
		realMean.setUpdatedAt(errorMean.getUpdatedAt());
		createMeanHistory.handle(realMean, errorMean.getUpdatedAt());

		// Remove the erroneous mean and its history.
		meanHistoryRepo.deleteByMeanId(errorMean.getId().toString());
		meanRepo.delete(errorMean);

		return realMean;
	}

}
