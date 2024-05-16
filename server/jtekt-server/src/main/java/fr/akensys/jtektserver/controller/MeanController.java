package fr.akensys.jtektserver.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import fr.akensys.jtektserver.model.Mean;
import fr.akensys.jtektserver.services.MeanService;
import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/mean")
public class MeanController {

    private final MeanService meanService;

    @PostMapping("/addTable")
    public void addTable(@RequestBody Mean[] means) {
        try {
            if (!meanService.isStateVerified(means)) {
                throw new Exception("The means have different states");
            }
            meanService.calculateDuration(means);
            meanService.changeState(means);
        } catch (Exception e) {
            // TODO: handle exception
        }
        // verify if all the means have th same state
        // if not, throw an exception
        // calculate the duration_out or duration_in for each mean
        // change the state of the means
        // save the means in the database
    }

    @GetMapping("/getAllMeans")
    public ResponseEntity<?> getAllMeans() {
        try {
            List<Mean> means = meanService.getAllMeans();
            return ResponseEntity.ok(means);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Une erreur s'est produite lors de la récupération des moyens.");
        }
    }
}
