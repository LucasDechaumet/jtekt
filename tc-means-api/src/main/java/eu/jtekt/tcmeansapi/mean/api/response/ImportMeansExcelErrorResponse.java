package eu.jtekt.tcmeansapi.mean.api.response;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class ImportMeansExcelErrorResponse {

	private Integer line;

	private String code;

	private String message;

}
