package com.ski.speedygobackend.Config;


import com.ski.speedygobackend.shared.uploadImage;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class AppConfig {

    @Bean
    public uploadImage uploadImage() {
        return new uploadImage();
    }
}
