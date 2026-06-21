package eu.jtekt.tcmeansapi.mean.app;

import eu.jtekt.tcmeansapi.mean.api.request.UpdateMeanRequest;
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
public class UpdateMean {

	private final MeanRepo meanRepo;

	@Transactional
	public Mean handle(Long id, UpdateMeanRequest request) {
		Mean mean = meanRepo.findById(id)
			.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "mean_not_found"));
		mean.setIsOut(Boolean.TRUE.equals(request.getIsOut()));
		mean.setLicenceNumber(request.getLicenceNumber());
		mean.setDesignation(request.getDesignation());
		mean.setSerialNumber(request.getSerialNumber());
		mean.setCategory(request.getCategory());
		mean.setType(request.getType());
		mean.setCode(request.getCode());
		mean.setStorageNumber(request.getStorageNumber());
		mean.setBorrower(request.getBorrower());
		mean.setIsError(Boolean.TRUE.equals(request.getIsError()));
		mean.setUpdatedAt(Instant.now());
		return mean;
	}

}
