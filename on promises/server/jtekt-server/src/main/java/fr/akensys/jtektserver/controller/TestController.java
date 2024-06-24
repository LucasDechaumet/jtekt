package fr.akensys.jtektserver.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/test")
public class TestController {

    @RequestMapping("/server")
    public ResponseEntity<String> testServer() {
        return ResponseEntity.ok("Server is running");
    }
}
