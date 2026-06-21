package eu.jtekt.tcmeansapi.mean.app;

import eu.jtekt.tcmeansapi.mean.db.Mean;
import eu.jtekt.tcmeansapi.mean.db.MeanHistory;
import eu.jtekt.tcmeansapi.mean.db.MeanHistoryRepo;
import eu.jtekt.tcmeansapi.mean.db.MeanRepo;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.UncheckedIOException;
import java.time.Instant;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.CellStyle;
import org.apache.poi.ss.usermodel.Font;
import org.apache.poi.ss.usermodel.HorizontalAlignment;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.VerticalAlignment;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.ss.util.CellRangeAddress;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
@RequiredArgsConstructor
public class ExportMeansExcel {

	private static final List<String> HEADERS = List.of(
		"Code",
		"Désignation",
		"N° Armoire",
		"Date",
		"Utilisateur",
		"Etat",
		"Durée (min)"
	);

	private static final DateTimeFormatter DATE_TIME_FORMATTER =
		DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm").withZone(ZoneId.of("Europe/Paris"));

	private final MeanRepo meanRepo;
	private final MeanHistoryRepo meanHistoryRepo;

	@Transactional(readOnly = true)
	public byte[] handle(List<String> codes) {
		if (codes == null || codes.isEmpty()) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "no_code_selected");
		}

		List<Mean> means = meanRepo.findByCodeIn(codes);
		if (means.isEmpty()) {
			throw new ResponseStatusException(HttpStatus.NOT_FOUND, "means_not_found");
		}

		try (Workbook workbook = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
			Sheet sheet = workbook.createSheet("Historiques");
			writeHeader(workbook, sheet);

			CellStyle codeStyle = workbook.createCellStyle();
			codeStyle.setAlignment(HorizontalAlignment.CENTER);
			codeStyle.setVerticalAlignment(VerticalAlignment.CENTER);

			int rowIndex = 1;
			for (Mean mean : means) {
				List<MeanHistory> history =
					meanHistoryRepo.findByMeanIdOrderByCreatedAtDesc(mean.getId().toString());
				if (history.isEmpty()) {
					continue;
				}

				int firstRow = rowIndex;
				for (MeanHistory entry : history) {
					Row row = sheet.createRow(rowIndex++);
					Cell codeCell = row.createCell(0);
					codeCell.setCellValue(mean.getCode());
					codeCell.setCellStyle(codeStyle);
					row.createCell(1).setCellValue(nullSafe(mean.getDesignation()));
					row.createCell(2).setCellValue(nullSafe(mean.getStorageNumber()));
					row.createCell(3).setCellValue(formatDate(entry.getCreatedAt()));
					row.createCell(4).setCellValue(nullSafe(entry.getBorrower()));
					row.createCell(5).setCellValue(Boolean.TRUE.equals(entry.getIsOut()) ? "Sortie" : "Entrée");
					if (entry.getPreviousDurationMinutes() != null) {
						row.createCell(6).setCellValue(entry.getPreviousDurationMinutes());
					}
				}

				int lastRow = rowIndex - 1;
				if (lastRow > firstRow) {
					sheet.addMergedRegion(new CellRangeAddress(firstRow, lastRow, 0, 0));
				}
			}

			for (int column = 0; column < HEADERS.size(); column++) {
				sheet.autoSizeColumn(column);
			}

			workbook.write(out);
			return out.toByteArray();
		} catch (IOException e) {
			throw new UncheckedIOException(e);
		}
	}

	private void writeHeader(Workbook workbook, Sheet sheet) {
		CellStyle headerStyle = workbook.createCellStyle();
		Font headerFont = workbook.createFont();
		headerFont.setBold(true);
		headerStyle.setFont(headerFont);

		Row headerRow = sheet.createRow(0);
		for (int column = 0; column < HEADERS.size(); column++) {
			Cell cell = headerRow.createCell(column);
			cell.setCellValue(HEADERS.get(column));
			cell.setCellStyle(headerStyle);
		}
	}

	private String formatDate(Instant instant) {
		return instant == null ? "" : DATE_TIME_FORMATTER.format(instant);
	}

	private String nullSafe(String value) {
		return value == null ? "" : value;
	}

}
