package eu.jtekt.tcmeansapi.mean.api.request;

import java.time.Instant;
import lombok.Data;

@Data
public class UpdateMeanStatusRequest {

	private Boolean isOut;

	private String borrower;

	private Instant eventDate;

}
