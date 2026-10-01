package com.payment_service.client;

import com.payment_service.client.dto.UserInfoResponse;
import com.payment_service.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestClient;

@Component
@RequiredArgsConstructor
public class AuthClient {

    private final RestClient restClient;

    @Value("${auth-service.url}")
    private String authServiceUrl;

    public UserInfoResponse getUser(
            String userId,
            String authorization
    ) {
        try {
            return restClient
                    .get()
                    .uri(
                            authServiceUrl + "/api/v1/users/{userId}",
                            userId
                    )
                    .header(
                            "Authorization",
                            authorization
                    )
                    .retrieve()
                    .body(UserInfoResponse.class);
        } catch (HttpClientErrorException.NotFound exception) {
            throw new ResourceNotFoundException(
                    "User not found"
            );
        } catch (HttpClientErrorException.BadRequest exception) {
            throw new com.payment_service.exception.BadRequestException(
                    "Invalid user ID"
            );
        }
    }
}