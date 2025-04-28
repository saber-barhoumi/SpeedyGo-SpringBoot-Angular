package com.ski.speedygobackend.Config;


import com.ski.speedygobackend.shared.uploadImage;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestTemplate;

@Configuration
public class AppConfig {

    @Bean
    public uploadImage uploadImage() {
        return new uploadImage();
    }


    @Bean
    public RestTemplate restTemplate() {
        return new RestTemplate();
    }
}
