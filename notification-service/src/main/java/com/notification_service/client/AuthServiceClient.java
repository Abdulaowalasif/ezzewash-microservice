package com.notification_service.client;

import com.notification_service.dto.UserInfoResponse;
import com.notification_service.exception.ResourceNotFoundException;
import com.notification_service.exception.ServiceUnavailableException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatusCode;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

@Component
public class AuthServiceClient {

    private final RestClient restClient;

    public AuthServiceClient(@Value("${auth-service.url}") String authServiceUrl) {
        this.restClient = RestClient.builder()
                .baseUrl(authServiceUrl)
                .build();
    }

    public UserInfoResponse getUserById(String userId, String accessToken) {
        try {
            return restClient.get()
                    .uri("/api/v1/users/{userId}", userId)
                    .header("Authorization", "Bearer " + accessToken)
                    .retrieve()
                    .onStatus(
                            status -> status.value() == 404,
                            (request, response) -> {
                                throw new ResourceNotFoundException("User not found");
                            }
                    )
                    .onStatus(
                            HttpStatusCode::is5xxServerError,
                            (request, response) -> {
                                throw new ServiceUnavailableException("Auth Service is unavailable");
                            }
                    )
                    .body(UserInfoResponse.class);
        } catch (ResourceNotFoundException | ServiceUnavailableException exception) {
            throw exception;
        } catch (Exception exception) {
            exception.printStackTrace();
            throw new ServiceUnavailableException(
                    "Auth Service communication failed: " + exception.getMessage()
            );
        }
    }
}