package com.payment_service.client;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

@Component
@RequiredArgsConstructor
public class RiderClient {

    private final RestClient restClient;

    @Value("${rider-service.url}")
    private String riderServiceUrl;

    public Object getRider(String riderId) {
        return restClient
                .get()
                .uri(
                        riderServiceUrl + "/api/riders/{riderId}",
                        riderId
                )
                .retrieve()
                .body(Object.class);
    }
}