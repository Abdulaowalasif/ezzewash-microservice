package com.payment_service.client.dto;

import java.math.BigDecimal;

public record OrderPaymentInfoResponse(
        Data data
) {

    public record Data(
            Order order
    ) {
    }

    public record Order(
            String _id,
            String userId,
            String branchId,
            String status,
            BigDecimal subtotal,
            BigDecimal discount,
            BigDecimal total
    ) {
    }

    public String userId() {
        return data.order.userId;
    }

    public BigDecimal totalAmount() {
        return data.order.total;
    }

    public String status() {
        return data.order.status;
    }

    public String id() {
        return data.order._id;
    }
}