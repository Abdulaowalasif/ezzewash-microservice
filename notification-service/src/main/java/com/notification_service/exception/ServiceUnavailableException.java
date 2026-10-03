package com.notification_service.exception;

public class ServiceUnavailableException extends AppException {

    public ServiceUnavailableException(String message) {
        super(message, 503);
    }
}