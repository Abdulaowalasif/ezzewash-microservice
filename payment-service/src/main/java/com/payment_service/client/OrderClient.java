package com.payment_service.client;

import com.payment_service.client.dto.OrderPaymentInfoResponse;
import com.payment_service.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestClient;

@Component
@RequiredArgsConstructor
public class OrderClient {

    private final RestClient restClient;

    @Value("${order-service.url}")
    private String orderServiceUrl;

    public OrderPaymentInfoResponse getOrder(
            String orderId,
            String authorization
    ) {
        try {
            return restClient
                    .get()
                    .uri(
                            orderServiceUrl
                                    + "/api/v1/orders/{orderId}",
                            orderId
                    )
                    .header(
                            "Authorization",
                            authorization
                    )
                    .retrieve()
                    .body(OrderPaymentInfoResponse.class);
        } catch (HttpClientErrorException.NotFound exception) {
            throw new ResourceNotFoundException(
                    "Order not found"
            );
        } catch (HttpClientErrorException.BadRequest exception) {
            throw new com.payment_service.exception.BadRequestException(
                    "Invalid order ID"
            );
        }
    }
}