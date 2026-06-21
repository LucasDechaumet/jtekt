package eu.jtekt.tcmeansapi.mean.db;

public interface MeanDurationAggregate {

	String getMeanId();

	Boolean getIsOut();

	Long getTotalMinutes();

}
