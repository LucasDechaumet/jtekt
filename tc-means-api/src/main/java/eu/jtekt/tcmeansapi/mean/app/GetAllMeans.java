package eu.jtekt.tcmeansapi.mean.app;

import eu.jtekt.tcmeansapi.mean.db.Mean;
import eu.jtekt.tcmeansapi.mean.db.MeanRepo;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class GetAllMeans {

	private final MeanRepo meanRepo;

	@Transactional(readOnly = true)
	public List<Mean> handle() {
		return meanRepo.findByIsErrorFalseOrderByTypeAsc();
	}

}
