package fr.akensys.jtektserver.services;

import java.util.Date;
import java.util.List;

import org.springframework.stereotype.Service;

import fr.akensys.jtektserver.database.MeanRepo;
import fr.akensys.jtektserver.model.History;
import fr.akensys.jtektserver.model.Mean;
import fr.akensys.jtektserver.model.State;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class MeanService {

    private final MeanRepo meanRepo;

    public boolean isStateVerified(Mean[] means) {
        State state = means[0].getIn_out();
        for (Mean mean : means) {
            if (mean.getIn_out() != state) {
                return false;
            }
        }
        return true;
    }

    public void calculateDuration(Mean[] means) {
        State state = means[0].getIn_out();
        for (Mean mean : means) {
            List<History> histories = mean.getHistories();
            History lastHistory = histories.get(histories.size() - 1);
            Date dateLastHistory = lastHistory.getCreated_at();
            Long timeDifference = getDifferenceOfDurationinMinutes(dateLastHistory, new Date());
            if (state == State.S) {
                lastHistory.setDuration_in(timeDifference);
            } else {
                lastHistory.setDuration_out(timeDifference);
            }
        }
    }

    public Long getDifferenceOfDurationinMinutes(Date date1, Date date2) {
        Long difference = date2.getTime() - date1.getTime();
        return (difference / (60 * 1000));
    }

    public void changeState(Mean[] means) {
        State state = means[0].getIn_out();
        for (Mean mean : means) {
            mean.setIn_out(state == State.S ? State.E : State.S);
        }
    }

    public List<Mean> getAllMeans() {
        return meanRepo.findAll();
    }
}
