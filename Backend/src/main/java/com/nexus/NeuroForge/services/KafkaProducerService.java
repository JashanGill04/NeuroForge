package com.nexus.NeuroForge.services;

import com.nexus.NeuroForge.events.TaskEvent;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

@Service
public class KafkaProducerService {

    private static final String TOPIC = "task-events";

    // This now perfectly matches the @Bean in KafkaConfig
    @Autowired
    private KafkaTemplate<String, Object> kafkaTemplate;

    public void publishTaskEvent(TaskEvent event) {
        kafkaTemplate.send(TOPIC, event.getTaskId(), event);
        System.out.println("Published Event to Kafka: " + event.getEventType());
    }
}