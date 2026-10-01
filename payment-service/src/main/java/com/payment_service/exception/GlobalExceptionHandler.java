package com.payment_service.exception;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.LocalDateTime;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(AppException.class)
    public ResponseEntity<?> handleAppException(AppException exception) {
        return ResponseEntity
                .status(exception.getStatus())
                .body(Map.of(
                        "success", false,
                        "message", exception.getMessage(),
                        "timestamp", LocalDateTime.now()
                ));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<?> handleException(Exception exception) {
        exception.printStackTrace();

        return ResponseEntity
                .internalServerError()
                .body(Map.of(
                        "success", false,
                        "message", exception.getMessage(),
                        "timestamp", LocalDateTime.now()
                ));
    }
}