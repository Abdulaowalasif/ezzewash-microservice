package com.notification_service.exception;

public class BadRequestException extends AppException {

    public BadRequestException(String message) {
        super(message, 400);
    }
}