package eu.jtekt.tcmeansapi.mean.api.request;

import lombok.Data;

@Data
public class CreateMeanRequest {

	private Boolean isOut;

	private String licenceNumber;

	private String designation;

	private String serialNumber;

	private String category;

	private String type;

	private String code;

	private String storageNumber;

	private String borrower;

	private Boolean isError;

}
