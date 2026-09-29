package com.ezzewash.rider_service;


import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;

@RestController
public class HealthCheck {

    @GetMapping("/health")
    public HashMap<String,Object> healthCheck(){
        HashMap<String,Object> response = new HashMap<>();
        response.put("success",true);
        response.put("message","Rider service running on port 3004");

        return response;
    }
}
