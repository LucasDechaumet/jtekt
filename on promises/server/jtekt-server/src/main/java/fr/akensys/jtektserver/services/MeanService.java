package fr.akensys.jtektserver.services;

import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import fr.akensys.jtektserver.database.MeanRepo;
import fr.akensys.jtektserver.entity.History;
import fr.akensys.jtektserver.entity.Mean;
import fr.akensys.jtektserver.error.mean.MeanNotFoundException;
import fr.akensys.jtektserver.model.MeanMobileRequest;
import fr.akensys.jtektserver.model.MeanTotalDuration;
import fr.akensys.jtektserver.model.MeanWebRequest;
import fr.akensys.jtektserver.model.State;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional
public class MeanService {

    private final MeanRepo meanRepo;

    public List<Mean> getAllMeans() {
        return meanRepo.findAll();
    }

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

    public LocalDateTime convertStringInLocalDateTime(String date) {
        if (date == null || date.trim().isEmpty()) {
            return LocalDateTime.now();
        }
        try {
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");
            LocalDate localDate = LocalDate.parse(date, formatter);
            return localDate.atStartOfDay();
        } catch (DateTimeParseException e) {
            System.err.println("Invalid date format: " + date + ". Error: " + e.getMessage());
            return LocalDateTime.now();
        }
    }

    public void addMeansFromExcel(List<MeanWebRequest> means) {
        try {
            // Remove the header of the Excel file
            means.remove(0);
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
                        .error(false)
                        .build();
                if (mean.getName() == null || mean.getName().isEmpty()) {
                    throw new IllegalArgumentException("Mean name cannot be null or empty");
                }
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

    public Long getDuration(LocalDateTime currentDate, LocalDateTime lastDate) {
        System.out.println("lastDate: " + lastDate + " currentDate: " + currentDate);

        Duration duration = Duration.between(lastDate, currentDate);
        Long durationInMinutes = duration.toMinutes();

        System.out.println("duration in minutes = " + durationInMinutes);
        return durationInMinutes;
    }

    public void addMeansFromMobile(MeanMobileRequest[] means) {
        for (MeanMobileRequest meanRequest : means) {
            Optional<Mean> optionalMean = meanRepo.findByMeanNumber(meanRequest.getMeanNumber());
    
            if (optionalMean.isPresent()) {
                Mean mean = optionalMean.get();
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
                history.add(newHistory);
                meanRepo.save(mean);
            } else {
                Mean newMean = Mean.builder()
                        .meanNumber(meanRequest.getMeanNumber())
                        .in_out(State.valueOf(meanRequest.getIn_out()))
                        .lastDate(meanRequest.getDate())
                        .type("ERROR")
                        .error(true) // Set error to true
                        .build();
    
                History newHistory = History.builder()
                        .mean(newMean)
                        .username(meanRequest.getUsername())
                        .created_at(meanRequest.getDate())
                        .in_out(State.valueOf(meanRequest.getIn_out()))
                        .build();
    
                List<History> history = new ArrayList<>();
                history.add(newHistory);
                newMean.setHistories(history);
                meanRepo.save(newMean);
            }
        }
    }
    

    public List<MeanTotalDuration> getMeansByTypeWithinInterval(String type, LocalDateTime startDate, LocalDateTime endDate) {
        List<Mean> means = meanRepo.findByType(type);
        List<MeanTotalDuration> meansTotalDuration = new ArrayList<>();
        for (Mean mean : means) {
            Long totalDurationIn = 0L;
            Long totalDurationOut = 0L;
            List<History> filteredHistories = mean.getHistories().stream()
                    .filter(history -> !history.getCreated_at().isBefore(startDate) && !history.getCreated_at().isAfter(endDate))
                    .collect(Collectors.toList());

            for (History history : filteredHistories) {
                if (history.getDuration_in() != null) {
                    totalDurationIn += history.getDuration_in();
                }
                if (history.getDuration_out() != null) {
                    totalDurationOut += history.getDuration_out();
                }
            }
            MeanTotalDuration meanTotalDuration = MeanTotalDuration.builder()
                    .meanName(mean.getType())
                    .totalDurationIn(totalDurationIn)
                    .totalDurationOut(totalDurationOut)
                    .build();
            meansTotalDuration.add(meanTotalDuration);
        }
        return meansTotalDuration;
    }

    public List<String> getAllMeansType() {
        List<Mean> means = meanRepo.findAll();
        List<String> meansType = new ArrayList<>();
        for (Mean mean : means) {
            meansType.add(mean.getType());
        }
        return meansType;
    }

    public void deleteMean(String meanNumber) {
        Mean mean = meanRepo.findByMeanNumber(meanNumber).orElseThrow(() -> new MeanNotFoundException(meanNumber));
        meanRepo.delete(mean);
    }
}
