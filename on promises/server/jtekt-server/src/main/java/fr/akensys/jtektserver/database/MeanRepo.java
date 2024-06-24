package fr.akensys.jtektserver.database;

import java.util.Optional;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

import fr.akensys.jtektserver.model.Mean;


public interface MeanRepo extends JpaRepository<Mean, Long>{

    Optional<Mean> findByMeanNumber(String meanNumber);
    List<Mean> findByType(String type);
}
