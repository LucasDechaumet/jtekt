package fr.akensys.jtektserver.model;

import java.time.LocalDateTime;

import lombok.Data;

@Data
public class MeanMobileRequest {

    private String username;
    private String meanNumber;
    private String in_out;
    private LocalDateTime date;

}
