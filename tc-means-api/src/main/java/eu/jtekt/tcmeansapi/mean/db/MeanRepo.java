package eu.jtekt.tcmeansapi.mean.db;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MeanRepo extends JpaRepository<Mean, Long> {

	boolean existsByCode(String code);

	Optional<Mean> findByCode(String code);

	Optional<Mean> findByCodeAndIsErrorFalse(String code);

	List<Mean> findByCodeIn(List<String> codes);

	List<Mean> findByIsErrorTrue();

	List<Mean> findByIsErrorFalse();

	List<Mean> findByIsErrorFalseOrderByTypeAsc();

}
