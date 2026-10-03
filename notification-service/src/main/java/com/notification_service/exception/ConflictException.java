package com.notification_service.exception;

public class ConflictException extends AppException {

    public ConflictException(String message) {
        super(message, 409);
    }
}