package eu.jtekt.tcmeansapi.mean.app;

import eu.jtekt.tcmeansapi.mean.api.response.ImportMeansExcelErrorResponse;
import eu.jtekt.tcmeansapi.mean.api.response.ImportMeansExcelResponse;
import eu.jtekt.tcmeansapi.mean.db.Mean;
import eu.jtekt.tcmeansapi.mean.db.MeanRepo;
import java.io.IOException;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Locale;
import java.util.Set;
import lombok.RequiredArgsConstructor;
import org.apache.poi.ss.usermodel.DataFormatter;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.ss.usermodel.WorkbookFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

@Service
@RequiredArgsConstructor
public class ImportMeansExcel {

	private static final List<String> EXPECTED_HEADERS = List.of(
		"N° Armoire",
		"Désignation",
		"N° Série",
		"N° Licence",
		"Type",
		"Code",
		"Etat",
		"Utilisateur",
		"Date"
	);

	private static final DateTimeFormatter DATE_TIME_FORMATTER = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");
	private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("dd/MM/yyyy");

	private final MeanRepo meanRepo;
	private final CreateMeanHistory createMeanHistory;

	@Transactional
	public ImportMeansExcelResponse handle(MultipartFile file) {
		List<ImportMeansExcelErrorResponse> errors = new ArrayList<>();

		if (file.isEmpty()) {
			errors.add(new ImportMeansExcelErrorResponse(null, null, "Le fichier est vide."));
			return new ImportMeansExcelResponse(0, errors);
		}

		try (Workbook workbook = WorkbookFactory.create(file.getInputStream())) {
			if (workbook.getNumberOfSheets() == 0) {
				errors.add(new ImportMeansExcelErrorResponse(null, null, "Le fichier ne contient aucune feuille."));
				return new ImportMeansExcelResponse(0, errors);
			}

			Row headerRow = workbook.getSheetAt(0).getRow(0);
			DataFormatter formatter = new DataFormatter(Locale.FRANCE);
			if (!hasValidHeaders(headerRow, formatter)) {
				errors.add(new ImportMeansExcelErrorResponse(1, null,
					"Les colonnes doivent être dans cet ordre : " + String.join(", ", EXPECTED_HEADERS) + "."));
				return new ImportMeansExcelResponse(0, errors);
			}

			int createdCount = 0;
			Set<String> importedCodes = new HashSet<>();
			for (int rowIndex = 1; rowIndex <= workbook.getSheetAt(0).getLastRowNum(); rowIndex++) {
				Row row = workbook.getSheetAt(0).getRow(rowIndex);
				if (isBlankRow(row, formatter)) {
					continue;
				}

				RowImport rowImport = readRow(row, formatter);
				List<String> rowErrors = validateRow(rowImport, importedCodes);
				if (!rowErrors.isEmpty()) {
					addErrors(errors, rowIndex + 1, rowImport.code(), rowErrors);
					continue;
				}

				Instant stateDate = parseDate(rowImport.date());
				if (stateDate == null) {
					errors.add(new ImportMeansExcelErrorResponse(rowIndex + 1, rowImport.code(),
						"La date doit être au format dd/MM/yyyy ou dd/MM/yyyy HH:mm."));
					continue;
				}

				Mean savedMean = meanRepo.save(Mean.builder()
					.isOut(isOut(rowImport.state()))
					.createdAt(Instant.now())
					.updatedAt(stateDate)
					.licenceNumber(rowImport.licenceNumber())
					.designation(rowImport.designation())
					.serialNumber(rowImport.serialNumber())
					.type(rowImport.type())
					.code(rowImport.code())
					.storageNumber(rowImport.storageNumber())
					.borrower(rowImport.borrower())
					.isError(false)
					.build());

				createMeanHistory.handle(savedMean, stateDate);
				importedCodes.add(rowImport.code());
				createdCount++;
			}

			return new ImportMeansExcelResponse(createdCount, errors);
		} catch (IOException e) {
			errors.add(new ImportMeansExcelErrorResponse(null, null, "Impossible de lire le fichier Excel."));
			return new ImportMeansExcelResponse(0, errors);
		}
	}

	private boolean hasValidHeaders(Row headerRow, DataFormatter formatter) {
		if (headerRow == null) {
			return false;
		}

		for (int index = 0; index < EXPECTED_HEADERS.size(); index++) {
			if (!EXPECTED_HEADERS.get(index).equals(readCell(headerRow, index, formatter))) {
				return false;
			}
		}

		return true;
	}

	private boolean isBlankRow(Row row, DataFormatter formatter) {
		if (row == null) {
			return true;
		}

		for (int index = 0; index < EXPECTED_HEADERS.size(); index++) {
			if (!readCell(row, index, formatter).isBlank()) {
				return false;
			}
		}

		return true;
	}

	private RowImport readRow(Row row, DataFormatter formatter) {
		return new RowImport(
			readCell(row, 0, formatter),
			readCell(row, 1, formatter),
			readCell(row, 2, formatter),
			readCell(row, 3, formatter),
			readCell(row, 4, formatter),
			readCell(row, 5, formatter),
			readCell(row, 6, formatter),
			readCell(row, 7, formatter),
			readCell(row, 8, formatter)
		);
	}

	private String readCell(Row row, int index, DataFormatter formatter) {
		return formatter.formatCellValue(row.getCell(index)).trim();
	}

	private List<String> validateRow(RowImport rowImport, Set<String> importedCodes) {
		List<String> errors = new ArrayList<>();

		if (rowImport.designation().isBlank()) {
			errors.add("La désignation est obligatoire.");
		}
		if (rowImport.code().isBlank()) {
			errors.add("Le code est obligatoire.");
		}
		if (rowImport.type().isBlank()) {
			errors.add("Le type est obligatoire.");
		}
		if (rowImport.state().isBlank()) {
			errors.add("L'état est obligatoire.");
		} else if (!"E".equalsIgnoreCase(rowImport.state()) && !"S".equalsIgnoreCase(rowImport.state())) {
			errors.add("L'état doit être E ou S.");
		}
		if (!rowImport.code().isBlank() && importedCodes.contains(rowImport.code())) {
			errors.add("Le code est déjà présent dans le fichier.");
		}
		if (!rowImport.code().isBlank() && meanRepo.existsByCode(rowImport.code())) {
			errors.add("Le code existe déjà.");
		}

		return errors;
	}

	private void addErrors(List<ImportMeansExcelErrorResponse> errors, int line, String code, List<String> messages) {
		for (String message : messages) {
			errors.add(new ImportMeansExcelErrorResponse(line, code, message));
		}
	}

	private Instant parseDate(String value) {
		if (value.isBlank()) {
			return Instant.now();
		}

		ZoneId zoneId = ZoneId.systemDefault();
		try {
			return LocalDateTime.parse(value, DATE_TIME_FORMATTER).atZone(zoneId).toInstant();
		} catch (DateTimeParseException ignored) {
			try {
				return LocalDate.parse(value, DATE_FORMATTER).atTime(LocalTime.now()).atZone(zoneId).toInstant();
			} catch (DateTimeParseException ignoredDateOnly) {
				return null;
			}
		}
	}

	private boolean isOut(String state) {
		return "S".equalsIgnoreCase(state);
	}

	private record RowImport(
		String storageNumber,
		String designation,
		String serialNumber,
		String licenceNumber,
		String type,
		String code,
		String state,
		String borrower,
		String date
	) {
	}

}
