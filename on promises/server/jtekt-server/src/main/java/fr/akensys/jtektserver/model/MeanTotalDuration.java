package fr.akensys.jtektserver.model;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class MeanTotalDuration {

    private String meanName;
    private Long totalDurationIn;
    private Long totalDurationOut;

}
