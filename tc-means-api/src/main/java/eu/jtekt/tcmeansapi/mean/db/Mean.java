package eu.jtekt.tcmeansapi.mean.db;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import java.time.Instant;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Mean {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	private Boolean isOut;

	private Instant createdAt;

	private Instant updatedAt;

	private String licenceNumber;

	private String designation;

	private String serialNumber;

	private String category;

	private String type;

	@Column(unique = true)
	private String code;

	private String storageNumber;

	private String borrower;

	private Boolean isError;

}
