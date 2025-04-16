package com.ski.speedygobackend.Config;


import java.io.File;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {
    @Bean
    public WebMvcConfigurer corsConfigurer() {
        return new WebMvcConfigurer() {
            @Override
            public void addCorsMappings(CorsRegistry registry) {
                registry.addMapping("/**") // Apply to all endpoints
                        .allowedOrigins("http://localhost:4200/") // Angular frontend
                        .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                        .allowedHeaders("*") // Allow all headers
                        .allowCredentials(true); // Allow cookies if needed
            }
        };

    }
// hedha code legdim mte3ik
    // @Override
    // public void addResourceHandlers(ResourceHandlerRegistry registry) {
    //     registry.addResourceHandler("/uploads/**")
    //             .addResourceLocations("file:uploads/");
    // }


    @Value("${upload.directory}")
    private String uploadDirectory;

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // Convert the path to an absolute path
        File uploadDir = new File(uploadDirectory);
        String absolutePath = uploadDir.getAbsolutePath() + File.separator;

        // Map "/api/stores/images/**" to the physical upload directory
        registry.addResourceHandler("/api/stores/images/**")
                .addResourceLocations("file:" + absolutePath);
    }
    @Value("${upload.directory.trip}")
    private String uploadDirectoryTrip;

    public void addResourceHandlersFortrip(ResourceHandlerRegistry registry) {
        // Convert the path to an absolute path
        File uploadDir = new File(uploadDirectoryTrip);
        String absolutePath = uploadDir.getAbsolutePath() + File.separator;

        // Map "/api/stores/images/**" to the physical upload directory
        registry.addResourceHandler("/api/stores/images/**")
                .addResourceLocations("file:" + absolutePath);
    }
}
