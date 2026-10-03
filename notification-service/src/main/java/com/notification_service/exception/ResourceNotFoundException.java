package com.notification_service.exception;

public class ResourceNotFoundException extends AppException {

    public ResourceNotFoundException(String message) {
        super(message, 404);
    }
}