package eu.jtekt.tcmeansapi.mean.api;

import eu.jtekt.tcmeansapi.mean.api.request.CorrectMeanErrorRequest;
import eu.jtekt.tcmeansapi.mean.api.request.CreateMeanRequest;
import eu.jtekt.tcmeansapi.mean.api.request.UpdateMeanRequest;
import eu.jtekt.tcmeansapi.mean.api.request.UpdateMeanStatusRequest;
import eu.jtekt.tcmeansapi.mean.api.response.ImportMeansExcelResponse;
import eu.jtekt.tcmeansapi.mean.api.response.MeanDurationResponse;
import eu.jtekt.tcmeansapi.mean.app.CorrectMeanError;
import eu.jtekt.tcmeansapi.mean.app.CreateMean;
import eu.jtekt.tcmeansapi.mean.app.DeleteMean;
import eu.jtekt.tcmeansapi.mean.app.ExportMeansExcel;
import eu.jtekt.tcmeansapi.mean.app.GetAllMeans;
import eu.jtekt.tcmeansapi.mean.app.GetMeanDurations;
import eu.jtekt.tcmeansapi.mean.app.GetMeanErrors;
import eu.jtekt.tcmeansapi.mean.app.GetMeanHistory;
import eu.jtekt.tcmeansapi.mean.app.ImportMeansExcel;
import eu.jtekt.tcmeansapi.mean.app.UpdateMean;
import eu.jtekt.tcmeansapi.mean.app.UpdateMeanStatus;
import eu.jtekt.tcmeansapi.mean.db.Mean;
import eu.jtekt.tcmeansapi.mean.db.MeanHistory;
import java.time.Instant;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/means")
@RequiredArgsConstructor
public class MeanController {

	private final GetAllMeans getAllMeans;
	private final GetMeanErrors getMeanErrors;
	private final GetMeanHistory getMeanHistory;
	private final CreateMean createMean;
	private final UpdateMean updateMean;
	private final UpdateMeanStatus updateMeanStatus;
	private final DeleteMean deleteMean;
	private final ImportMeansExcel importMeansExcel;
	private final ExportMeansExcel exportMeansExcel;
	private final CorrectMeanError correctMeanError;
	private final GetMeanDurations getMeanDurations;

	@GetMapping
	public List<Mean> findAll() {
		return getAllMeans.handle();
	}

	@GetMapping("/errors")
	public List<Mean> findErrors() {
		return getMeanErrors.handle();
	}

	@GetMapping("/stats/durations")
	public List<MeanDurationResponse> durations(
		@RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant from,
		@RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant to) {
		return getMeanDurations.handle(from, to);
	}

	@GetMapping("/{id}/history")
	public Page<MeanHistory> findHistory(@PathVariable Long id, Pageable pageable) {
		return getMeanHistory.handle(id, pageable);
	}

	@PostMapping
	public Mean create(@RequestBody CreateMeanRequest request) {
		return createMean.handle(request);
	}

	@PostMapping("/excel")
	public ImportMeansExcelResponse importExcel(@RequestPart MultipartFile file) {
		return importMeansExcel.handle(file);
	}

	@PostMapping("/excel/export")
	public ResponseEntity<byte[]> exportExcel(@RequestBody List<String> codes) {
		byte[] content = exportMeansExcel.handle(codes);
		return ResponseEntity.ok()
			.header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"extraction-moyens.xlsx\"")
			.contentType(MediaType.parseMediaType(
				"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
			.body(content);
	}

	@PatchMapping("/{id}/correct")
	public Mean correctError(@PathVariable Long id, @RequestBody CorrectMeanErrorRequest request) {
		return correctMeanError.handle(id, request.getCode());
	}

	@PutMapping("/{id}")
	public Mean update(@PathVariable Long id, @RequestBody UpdateMeanRequest request) {
		return updateMean.handle(id, request);
	}

	@PatchMapping("/{code}/status")
	public Mean updateStatus(@PathVariable String code, @RequestBody UpdateMeanStatusRequest request) {
		return updateMeanStatus.handle(code, request);
	}

	@DeleteMapping("/{id}")
	public void delete(@PathVariable Long id) {
		deleteMean.handle(id);
	}

}
