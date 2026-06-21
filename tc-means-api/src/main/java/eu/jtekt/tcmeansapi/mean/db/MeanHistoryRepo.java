package eu.jtekt.tcmeansapi.mean.db;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface MeanHistoryRepo extends JpaRepository<MeanHistory, Long> {

	Optional<MeanHistory> findTopByMeanIdOrderByCreatedAtDesc(String meanId);

	List<MeanHistory> findByMeanIdOrderByCreatedAtDesc(String meanId);

	Page<MeanHistory> findByMeanIdOrderByCreatedAtDesc(String meanId, Pageable pageable);

	void deleteByMeanId(String meanId);

	@Query("""
		SELECT h.meanId AS meanId, h.isOut AS isOut, SUM(h.previousDurationMinutes) AS totalMinutes
		FROM MeanHistory h
		WHERE h.previousDurationMinutes IS NOT NULL
			AND (:from IS NULL OR h.createdAt >= :from)
			AND (:to IS NULL OR h.createdAt <= :to)
		GROUP BY h.meanId, h.isOut
		""")
	List<MeanDurationAggregate> aggregateDurations(@Param("from") Instant from, @Param("to") Instant to);

}
