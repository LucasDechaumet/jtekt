package fr.akensys.jtektserver.model;

import java.time.LocalDateTime;

import lombok.Data;

@Data
public class MeansWithinIntervalRequest {

    private String type;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
}