package eu.jtekt.tcmeansapi.mean.app;

import eu.jtekt.tcmeansapi.mean.api.request.CreateMeanRequest;
import eu.jtekt.tcmeansapi.mean.db.Mean;
import eu.jtekt.tcmeansapi.mean.db.MeanRepo;
import java.time.Instant;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class CreateMean {

	private final MeanRepo meanRepo;
	private final CreateMeanHistory createMeanHistory;

	@Transactional
	public Mean handle(CreateMeanRequest request) {
		Instant now = Instant.now();
		Mean mean = Mean.builder()
			.isOut(Boolean.TRUE.equals(request.getIsOut()))
			.createdAt(now)
			.updatedAt(now)
			.licenceNumber(request.getLicenceNumber())
			.designation(request.getDesignation())
			.serialNumber(request.getSerialNumber())
			.category(request.getCategory())
			.type(request.getType())
			.code(request.getCode())
			.storageNumber(request.getStorageNumber())
			.borrower(request.getBorrower())
			.isError(Boolean.TRUE.equals(request.getIsError()))
			.build();

		Mean savedMean = meanRepo.save(mean);
		createMeanHistory.handle(savedMean, now);
		return savedMean;
	}

}
