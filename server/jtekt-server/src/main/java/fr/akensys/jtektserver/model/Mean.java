package fr.akensys.jtektserver.model;

import java.util.List;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import lombok.Builder;
import lombok.Data;

@Entity
@Data
@Builder
public class Mean {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToMany(mappedBy = "mean")
    private List<History> histories;

    private int storage;
    private String serial_number;
    private String licence_number;
    private String type;
    private String name;
    private State in_out;
    private String mean_number;
    
}
