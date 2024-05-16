package fr.akensys.jtektserver.model;

import java.sql.Date;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToOne;
import lombok.Builder;
import lombok.Data;

@Entity
@Data
@Builder
public class History {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    private Mean mean;

    private String username;
    private Date created_at;
    private State in_out;
    private int duration_out;
    private int duration_in;
}
