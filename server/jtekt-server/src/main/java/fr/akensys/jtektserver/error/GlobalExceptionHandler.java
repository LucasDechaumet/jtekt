package fr.akensys.jtektserver.error;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.context.request.WebRequest;

import fr.akensys.jtektserver.error.mean.MeanNotFoundException;

@ControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(MeanNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleMeanNotFoundException(MeanNotFoundException ex, WebRequest request) {
        ErrorResponse.builder()
            .message(ex.getMessage())
            .details(request.getDescription(false))
            .status(HttpStatus.NOT_FOUND)
            .build();
        return ResponseEntity.ok().build();
    }
}
