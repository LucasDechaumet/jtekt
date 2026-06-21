package eu.jtekt.tcmeansapi.mean.api.response;

import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class ImportMeansExcelResponse {

	private int createdCount;

	private List<ImportMeansExcelErrorResponse> errors;

}
