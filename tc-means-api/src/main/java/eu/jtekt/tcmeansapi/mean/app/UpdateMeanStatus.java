package eu.jtekt.tcmeansapi.mean.app;

import eu.jtekt.tcmeansapi.mean.api.request.UpdateMeanStatusRequest;
import eu.jtekt.tcmeansapi.mean.db.Mean;
import eu.jtekt.tcmeansapi.mean.db.MeanRepo;
import java.time.Instant;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
@RequiredArgsConstructor
public class UpdateMeanStatus {

	private final MeanRepo meanRepo;
	private final CreateMeanHistory createMeanHistory;

	@Transactional
	public Mean handle(String code, UpdateMeanStatusRequest request) {
		if (request.getEventDate() == null) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "event_date_required");
		}

		Instant eventDate = request.getEventDate();
		String normalizedCode = code.trim();
		boolean isOut = Boolean.TRUE.equals(request.getIsOut());

		Mean mean = meanRepo.findByCodeAndIsErrorFalse(normalizedCode)
			.orElse(null);

		if (mean == null) {
			return meanRepo.save(Mean.builder()
				.isOut(isOut)
				.createdAt(eventDate)
				.updatedAt(eventDate)
				.code(normalizedCode)
				.borrower(request.getBorrower())
				.isError(true)
				.build());
		}

		mean.setIsOut(isOut);
		mean.setBorrower(request.getBorrower());
		mean.setIsError(false);
		mean.setUpdatedAt(eventDate);
		createMeanHistory.handle(mean, eventDate);
		return mean;
	}

}
