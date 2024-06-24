package fr.akensys.jtektserver.error;

import org.springframework.http.HttpStatus;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

@Data
@AllArgsConstructor
@Builder
public class ErrorResponse {

    private String message;
    private String details;
    private HttpStatus status;

}
