package com.ski.speedygobackend.Config;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.*;

@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        registry
                .addEndpoint("/ws") // Le endpoint à atteindre
               // .setAllowedOrigins("http://localhost:4200") // Autorise ton frontend
                .setAllowedOriginPatterns("*") // ← ajoute cette ligne
                .withSockJS(); // SockJS support
    }

    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        config.enableSimpleBroker("/topic"); // Pour les messages de sortie
        config.setApplicationDestinationPrefixes("/app"); // Pour les messages envoyés par le client
    }
}
