package com.nexus.NeuroForge.dto;

import java.time.LocalDateTime;

public class NotificationDto {
    private Long id;
    private String type;
    private String message;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public boolean isRead() {
        return read;
    }

    public void setRead(boolean read) {
        this.read = read;
    }

    public String getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(String createdAt) {
        this.createdAt = createdAt;
    }

    private boolean read;
    private String createdAt; // Sent as an ISO string to match JS Date.toISOString()

    // Constructors, Getters, and Setters...
}