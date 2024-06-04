package fr.akensys.jtektserver.model;

import java.time.LocalDateTime;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonManagedReference;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class Mean {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private String storage;
    private String serial_number;
    private String licence_number;
    private String type;
    private String name;
    private State in_out;
    private LocalDateTime lastDate;
    private String meanNumber;
    
    @JsonManagedReference
    @OneToMany(mappedBy = "mean", cascade = CascadeType.ALL)
    private List<History> histories;
}
