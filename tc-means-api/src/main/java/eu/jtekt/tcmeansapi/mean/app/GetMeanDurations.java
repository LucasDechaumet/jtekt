package eu.jtekt.tcmeansapi.mean.app;

import eu.jtekt.tcmeansapi.mean.api.response.MeanDurationResponse;
import eu.jtekt.tcmeansapi.mean.db.Mean;
import eu.jtekt.tcmeansapi.mean.db.MeanDurationAggregate;
import eu.jtekt.tcmeansapi.mean.db.MeanHistoryRepo;
import eu.jtekt.tcmeansapi.mean.db.MeanRepo;
import java.time.Instant;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class GetMeanDurations {

	private static final double MINUTES_PER_DAY = 60.0 * 24.0;

	private final MeanRepo meanRepo;
	private final MeanHistoryRepo meanHistoryRepo;

	@Transactional(readOnly = true)
	public List<MeanDurationResponse> handle(Instant from, Instant to) {
		// daysByMeanId[0] = temps en Entrée, daysByMeanId[1] = temps en Sortie
		Map<String, double[]> daysByMeanId = new HashMap<>();
		for (MeanDurationAggregate aggregate : meanHistoryRepo.aggregateDurations(from, to)) {
			double days = aggregate.getTotalMinutes() / MINUTES_PER_DAY;
			double[] totals = daysByMeanId.computeIfAbsent(aggregate.getMeanId(), key -> new double[2]);
			if (Boolean.TRUE.equals(aggregate.getIsOut())) {
				totals[1] += days;
			} else {
				totals[0] += days;
			}
		}

		return meanRepo.findByIsErrorFalse().stream()
			.map(mean -> toResponse(mean, daysByMeanId.get(mean.getId().toString())))
			.toList();
	}

	private MeanDurationResponse toResponse(Mean mean, double[] totals) {
		double daysIn = totals == null ? 0 : round(totals[0]);
		double daysOut = totals == null ? 0 : round(totals[1]);
		return new MeanDurationResponse(
			mean.getId(),
			mean.getCode(),
			mean.getDesignation(),
			mean.getType(),
			mean.getSerialNumber(),
			daysIn,
			daysOut
		);
	}

	private double round(double value) {
		return Math.round(value * 100.0) / 100.0;
	}

}
