package fr.akensys.jtektserver.database;

import java.util.Optional;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import fr.akensys.jtektserver.entity.Mean;


public interface MeanRepo extends JpaRepository<Mean, Long>{

    Optional<Mean> findByMeanNumber(String meanNumber);
    List<Mean> findByType(String type);

    // @Query("SELECT h FROM History h WHERE h.mean = :mean ORDER BY h.created_at DESC")
    // Optional<History> findLatestHistoryByMean(@Param("mean") Mean mean);

    // @Query("SELECT h FROM History h WHERE h.mean.meanNumber = :mean ORDER BY h.created_at DESC")
    // Optional<History> findLatestHistoryByMeanNumber(@Param("mean") String meanNumber);


}
