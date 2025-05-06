package com.ski.speedygobackend.Config;

import java.io.File;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Bean
    public CorsFilter corsFilter() {
        CorsConfiguration config = new CorsConfiguration();
        config.addAllowedOrigin("http://localhost:4200"); // Align with WebMvcConfigurer
        config.setAllowCredentials(true);
        config.addAllowedHeader("authorization");
        config.addAllowedHeader("content-type");
        config.addAllowedHeader("x-auth-token");
        config.addAllowedMethod("GET");
        config.addAllowedMethod("POST");
        config.addAllowedMethod("PUT");
        config.addAllowedMethod("DELETE");
        config.addAllowedMethod("OPTIONS");

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config); // Apply to all paths, including /ws

        return new CorsFilter(source);
    }

    @Bean
    public WebMvcConfigurer corsConfigurer() {
        return new WebMvcConfigurer() {
            @Override
            public void addCorsMappings(CorsRegistry registry) {
                registry.addMapping("/**") // Apply to all endpoints
                        .allowedOrigins("http://localhost:4200") // Angular frontend
                        .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                        .allowedHeaders("authorization", "content-type", "x-auth-token")
                        .exposedHeaders("x-auth-token")
                        .allowCredentials(true);
            }
        };
    }

    @Value("${upload.directory}")
    private String uploadDirectory;

    @Value("${upload.directory.trip}")
    private String uploadDirectoryTrip;

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // Map store images
        File storeUploadDir = new File(uploadDirectory);
        String storeAbsolutePath = storeUploadDir.getAbsolutePath() + File.separator;
        registry.addResourceHandler("/api/stores/images/**")
                .addResourceLocations("file:" + storeAbsolutePath);

        // Map trip images
        File tripUploadDir = new File(uploadDirectoryTrip);
        String tripAbsolutePath = tripUploadDir.getAbsolutePath() + File.separator;
        registry.addResourceHandler("/api/trips/images/**")
                .addResourceLocations("file:" + tripAbsolutePath);
    }
}