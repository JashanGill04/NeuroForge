package com.nexus.NeuroForge.events;

import java.time.LocalDateTime;

public class TaskEvent {
    private String taskId;
    private String eventType;
    private String message;
    private LocalDateTime timestamp;

    public TaskEvent(){}

    public TaskEvent(String taskId, String eventType, String message) {
        this.taskId = taskId;
        this.eventType = eventType;
        this.message = message;
        this.timestamp = LocalDateTime.now(); // FIXED — was never being set before
    }

    public String getTaskId() { return taskId; }
    public void setTaskId(String taskId) { this.taskId = taskId; }
    public String getEventType() { return eventType; }
    public void setEventType(String eventType) { this.eventType = eventType; }
    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
    public LocalDateTime getTimestamp() { return timestamp; }
    public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }

    @Override
    public String toString() {
        return "TaskEvent{" +
                "taskId='" + taskId + '\'' +
                ", eventType='" + eventType + '\'' +
                ", message='" + message + '\'' +
                ", timestamp=" + timestamp +
                '}';
    }
}
