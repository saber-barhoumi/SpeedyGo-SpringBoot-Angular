package com.ski.speedygobackend.Config;
import jakarta.annotation.PostConstruct;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

@Configuration
public class FileStorageConfig {

    private Path uploadDirectory;

    @PostConstruct
    public void init() {
        try {
            // Use user home directory
            String userHome = System.getProperty("user.home");
            uploadDirectory = Paths.get(userHome, "speedygo", "uploads", "store").normalize();
            Files.createDirectories(uploadDirectory);
            System.out.println("Created upload directory: " + uploadDirectory);
        } catch (Exception e) {
            throw new RuntimeException("Could not create upload directory", e);
        }
    }

    @Bean
    public Path uploadDirectoryPath() {
        return uploadDirectory;
    }
}