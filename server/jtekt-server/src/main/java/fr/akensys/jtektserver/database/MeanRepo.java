package fr.akensys.jtektserver.database;

import org.springframework.data.jpa.repository.JpaRepository;

import fr.akensys.jtektserver.model.Mean;

public interface MeanRepo extends JpaRepository<Mean, Long>{

}
