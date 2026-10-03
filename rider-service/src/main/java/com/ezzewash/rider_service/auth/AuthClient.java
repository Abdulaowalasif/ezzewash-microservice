package com.ezzewash.rider_service.auth;

import com.ezzewash.rider_service.auth.dto.AuthUserResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

@Component
@RequiredArgsConstructor
public class AuthClient {

    private final RestClient.Builder restClientBuilder;

    @Value("${auth-service.url:http://localhost:3001}")
    private String authServiceUrl;

    public AuthUserResponse getUserById(String userId, String token) {
        try {
            return restClientBuilder
                    .baseUrl(authServiceUrl)
                    .build()
                    .get()
                    .uri("/api/v1/users/{userId}", userId)
                    .header("Authorization", "Bearer " + token)
                    .retrieve()
                    .body(AuthUserResponse.class);
        } catch (Exception e) {
            // Log error and return null or empty to prevent failure
            return null;
        }
    }
}
