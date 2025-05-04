package com.ski.speedygobackend.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.messaging.MessageSecurityMetadataSourceRegistry;
import org.springframework.security.config.annotation.web.socket.AbstractSecurityWebSocketMessageBrokerConfigurer;
import org.springframework.security.messaging.context.SecurityContextChannelInterceptor;

@Configuration
public class WebSocketSecurityConfig {

    @Bean
    public SecurityContextChannelInterceptor securityContextChannelInterceptor() {
        return new SecurityContextChannelInterceptor();
    }

    // Alternatively, if you want to keep the authentication logic
    @Bean
    public WebSocketMessageSecurityMetadataSource webSocketMessageSecurityMetadataSource() {
        return new WebSocketMessageSecurityMetadataSource();
    }

    // Custom implementation if needed
    public static class WebSocketMessageSecurityMetadataSource {
        public void configureInbound(MessageSecurityMetadataSourceRegistry messages) {
            messages
                    .simpDestMatchers("/app/**").authenticated()
                    .simpSubscribeDestMatchers("/user/**", "/topic/**").authenticated()
                    .anyMessage().authenticated();
        }
    }
}