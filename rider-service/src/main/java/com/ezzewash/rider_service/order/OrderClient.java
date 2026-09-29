package com.ezzewash.rider_service.order;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;

@Component
@RequiredArgsConstructor
public class OrderClient {

    @Value("${order-service.url}")
    private String orderServiceUrl;

    private final ObjectMapper objectMapper;

    private final HttpClient httpClient =
            HttpClient.newHttpClient();

    public void updateOrderStatus(
            String orderId,
            String status
    ) {
        try {
            String body =
                    """
                            {"status":"%s"}
                            """.formatted(status);

            HttpRequest request =
                    HttpRequest.newBuilder()
                            .uri(
                                    URI.create(
                                            orderServiceUrl
                                                    + "/api/v1/internal/orders/"
                                                    + orderId
                                                    + "/status"
                                    )
                            )
                            .header(
                                    "Content-Type",
                                    "application/json"
                            )
                            .method(
                                    "PATCH",
                                    HttpRequest.BodyPublishers.ofString(body)
                            )
                            .build();

            HttpResponse<String> response =
                    httpClient.send(
                            request,
                            HttpResponse.BodyHandlers.ofString()
                    );

            if (
                    response.statusCode() < 200
                            || response.statusCode() >= 300
            ) {
                throw new RuntimeException(
                        "Order service request failed with status "
                                + response.statusCode()
                                + ": "
                                + response.body()
                );
            }

        } catch (InterruptedException error) {
            Thread.currentThread().interrupt();

            throw new RuntimeException(
                    "Order service request interrupted",
                    error
            );

        } catch (Exception error) {
            throw new RuntimeException(
                    "Failed to update order status: "
                            + error.getMessage(),
                    error
            );
        }
    }


    public JsonNode getOrder(
            String orderId
    ) {
        try {
            HttpRequest request =
                    HttpRequest.newBuilder()
                            .uri(
                                    URI.create(
                                            orderServiceUrl
                                                    + "/api/v1/internal/orders/"
                                                    + orderId
                                    )
                            )
                            .GET()
                            .build();

            HttpResponse<String> response =
                    httpClient.send(
                            request,
                            HttpResponse.BodyHandlers.ofString()
                    );

            if (
                    response.statusCode() < 200
                            || response.statusCode() >= 300
            ) {
                throw new RuntimeException(
                        "Order service request failed with status "
                                + response.statusCode()
                                + ": "
                                + response.body()
                );
            }

            return objectMapper
                    .readTree(response.body())
                    .path("data");

        } catch (InterruptedException error) {
            Thread.currentThread().interrupt();

            throw new RuntimeException(
                    "Order service request interrupted",
                    error
            );

        } catch (Exception error) {
            throw new RuntimeException(
                    "Failed to fetch order: "
                            + error.getMessage(),
                    error
            );
        }
    }
}