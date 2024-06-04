package fr.akensys.jtektserver.services;

import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Service;

import fr.akensys.jtektserver.database.MeanRepo;
import fr.akensys.jtektserver.error.mean.MeanNotFoundException;
import fr.akensys.jtektserver.model.History;
import fr.akensys.jtektserver.model.Mean;
import fr.akensys.jtektserver.model.MeanMobileRequest;
import fr.akensys.jtektserver.model.MeanWebRequest;
import fr.akensys.jtektserver.model.State;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional
public class MeanService {

    private final MeanRepo meanRepo;

    /**
     * Retrieves all means from the repository.
     *
     * @return a list of Mean objects representing all means in the repository.
     */
    public List<Mean> getAllMeans() {
        try {
            return meanRepo.findAll();
        } catch (Exception e) {
            System.out.println(e.getMessage());
            return new ArrayList<>();
        }
    }

    /**
     * Retrieves all mean numbers from the database.
     *
     * @return a list of mean numbers
     */
    public List<String> getAllMeanNumbers() {
        List<Mean> means = meanRepo.findAll();
        List<String> meanNumbers = new ArrayList<>();
        for (Mean mean : means) {
            meanNumbers.add(mean.getMeanNumber());
        }
        return meanNumbers;
    }

    public Mean getMeanByMeanNumber(String mean_number) {
        return meanRepo.findByMeanNumber(mean_number).orElseThrow(() -> new MeanNotFoundException(mean_number));
    }

    /**
        * Converts a string representation of a date into a LocalDateTime object.
        *
        * @param date the string representation of the date dd-mm-yyyy
        * @return the LocalDateTime object representing the date
        */
    public LocalDateTime convertStringInLocalDateTime(String date) {
        if(date == null) {
            return LocalDateTime.now();
        }
        LocalDate localDate = LocalDate.parse(date);
        return localDate.atStartOfDay();
    }

    /**
     * Adds means from an Excel file.
     *
     * @param means the list of MeanWebRequest objects representing the means to be added
     */
    public void addMeansFromExcel(List<MeanWebRequest> means) {
        try {
            means.remove(0); // Remove the header of the Excel file
            for (MeanWebRequest meanRequest : means) {
                Mean mean = Mean.builder()
                        .storage(meanRequest.getA())
                        .serial_number(meanRequest.getC())
                        .licence_number(meanRequest.getD())
                        .type(meanRequest.getE())
                        .name(meanRequest.getB())
                        .in_out(State.valueOf(meanRequest.getG()))
                        .lastDate(convertStringInLocalDateTime(meanRequest.getI()))
                        .meanNumber(meanRequest.getF())
                        .histories(new ArrayList<>())
                        .build();
                History history = History.builder()
                        .mean(mean)
                        .created_at(convertStringInLocalDateTime(meanRequest.getI()))
                        .username(meanRequest.getH())
                        .in_out(State.valueOf(meanRequest.getG()))
                        .build();
                mean.getHistories().add(history);
                meanRepo.save(mean);
            }
        } catch (Exception e) {
            System.out.println(e);
        }
    }

    /**
     * Calculates the duration in minutes between two given LocalDateTime objects.
     *
     * @param currentDate the current LocalDateTime object
     * @param lastDate the last LocalDateTime object
     * @return the duration in minutes between the two LocalDateTime objects
     */
    public Long getDuration(LocalDateTime currentDate, LocalDateTime lastDate) {
        System.out.println("lastDate: " + lastDate + " currentDate: " + currentDate);
        
        Duration duration = Duration.between(lastDate, currentDate);
        Long durationInMinutes = duration.toMinutes();
        
        System.out.println("duration in minutes = " + durationInMinutes);
        return durationInMinutes;
    }

        public void addMeansFromMobile(MeanMobileRequest[] means) {
        for (MeanMobileRequest meanRequest : means) {
            Mean mean = meanRepo.findByMeanNumber(meanRequest.getMeanNumber()).orElseThrow(() -> new MeanNotFoundException(meanRequest.getMeanNumber()));
            mean.setIn_out(State.valueOf(meanRequest.getIn_out()));
            mean.setLastDate(meanRequest.getDate());
            List<History> history = mean.getHistories();
            LocalDateTime lastDate = history.get(history.size() - 1).getCreated_at();
            Long currentDuration = getDuration(meanRequest.getDate(), lastDate);
            History newHistory = History.builder()
            .mean(mean)
            .username(meanRequest.getUsername())
            .created_at(meanRequest.getDate())
            .in_out(State.valueOf(meanRequest.getIn_out()))
            .duration_in(
                meanRequest.getIn_out().equals("S") ? currentDuration : null
            )
            .duration_out(
                meanRequest.getIn_out().equals("E") ? currentDuration : null
            )
            .build();
            mean.getHistories().add(newHistory);
            meanRepo.save(mean);
        }
    }
}
