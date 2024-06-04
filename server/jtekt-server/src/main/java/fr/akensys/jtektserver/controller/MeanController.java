package fr.akensys.jtektserver.controller;

import java.util.ArrayList;
import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import fr.akensys.jtektserver.model.Mean;
import fr.akensys.jtektserver.model.MeanMobileRequest;
import fr.akensys.jtektserver.model.MeanWebRequest;
import fr.akensys.jtektserver.services.MeanService;
import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/mean")
public class MeanController {

    private final MeanService meanService;

    @PostMapping("/addMeansFromExcel")
    public void addMeansFromExcel(@RequestBody ArrayList<MeanWebRequest> means) {
        try {
            meanService.addMeansFromExcel(means);
        } catch (Exception e) {
            System.out.println(e.getMessage());
        }
    }

    @GetMapping("/getAllMeanNumber")
    public ResponseEntity<?> getAllMeanNumber() {
        try {
            List<String> meanNumbers = meanService.getAllMeanNumbers();
            return ResponseEntity.ok(meanNumbers);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Une erreur s'est produite lors de la récupération des numéros de moyens.");
        }
    }

    @PostMapping("/addMeansFromMobile")
    public void addMeansFromMobile(@RequestBody MeanMobileRequest[] means) {
        try {
            meanService.addMeansFromMobile(means);
        } catch (Exception e) {
            System.out.println(e.getMessage());
        }
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

    @GetMapping("/getMeanByMeanNumber/{meanNumber}")
    public ResponseEntity<?> getMeanByMeanNumber(@PathVariable String meanNumber) {
        Mean mean = meanService.getMeanByMeanNumber(meanNumber);
        return ResponseEntity.ok(mean);
    }
}
