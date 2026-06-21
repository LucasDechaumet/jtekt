package eu.jtekt.tcmeansapi.mean.api.response;

public record MeanDurationResponse(
	Long id,
	String code,
	String designation,
	String type,
	String serialNumber,
	double daysIn,
	double daysOut
) {
}
