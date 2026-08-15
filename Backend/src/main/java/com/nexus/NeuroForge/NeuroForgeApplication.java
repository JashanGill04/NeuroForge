package com.nexus.NeuroForge;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class NeuroForgeApplication {

	public static void main(String[] args) {
		SpringApplication.run(NeuroForgeApplication.class, args);
	}

}
