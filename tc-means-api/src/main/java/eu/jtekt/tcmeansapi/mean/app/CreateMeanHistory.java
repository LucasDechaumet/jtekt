package eu.jtekt.tcmeansapi.mean.app;

import eu.jtekt.tcmeansapi.mean.db.Mean;
import eu.jtekt.tcmeansapi.mean.db.MeanHistory;
import eu.jtekt.tcmeansapi.mean.db.MeanHistoryRepo;
import java.time.Duration;
import java.time.Instant;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class CreateMeanHistory {

	private final MeanHistoryRepo meanHistoryRepo;

	public MeanHistory handle(Mean mean, Instant now) {
		meanHistoryRepo.findTopByMeanIdOrderByCreatedAtDesc(mean.getId().toString())
			.ifPresent(previousHistory -> {
				previousHistory.setPreviousDurationMinutes(
					Duration.between(previousHistory.getCreatedAt(), now).toMinutes());
				meanHistoryRepo.save(previousHistory);
			});

		return meanHistoryRepo.save(MeanHistory.builder()
			.isOut(mean.getIsOut())
			.createdAt(now)
			.meanId(mean.getId().toString())
			.borrower(mean.getBorrower())
			.build());
	}

}
