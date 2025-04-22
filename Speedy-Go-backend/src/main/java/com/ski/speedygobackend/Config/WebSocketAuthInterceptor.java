package com.ski.speedygobackend.Config;

import com.ski.speedygobackend.Service.CommunicationManagement.IChatService;
import com.ski.speedygobackend.security.JwtUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@RequiredArgsConstructor
public class WebSocketAuthInterceptor implements ChannelInterceptor {

    private final JwtUtils jwtUtils;
    private final UserDetailsService userDetailsService;
    private final IChatService chatService;

    @Override
    public Message<?> preSend(Message<?> message, MessageChannel channel) {
        StompHeaderAccessor accessor = MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);

        if (accessor != null && StompCommand.CONNECT.equals(accessor.getCommand())) {
            List<String> authorization = accessor.getNativeHeader("Authorization");

            if (authorization != null && !authorization.isEmpty()) {
                String authToken = authorization.get(0).replace("Bearer ", "");

                try {
                    // Extract email from token
                    String email = jwtUtils.extractUsername(authToken);

                    // Check if the token is valid (assuming we're validating against the extracted email)
                    if (jwtUtils.validateToken(authToken, email)) {
                        UserDetails userDetails = userDetailsService.loadUserByUsername(email);

                        UsernamePasswordAuthenticationToken authentication =
                                new UsernamePasswordAuthenticationToken(
                                        userDetails, null, userDetails.getAuthorities());

                        SecurityContextHolder.getContext().setAuthentication(authentication);
                        accessor.setUser(authentication);

                        // Update user's online status
                        chatService.updateUserOnlineStatus(email, true);
                    }
                } catch (Exception e) {
                    // Log the error but don't throw it to avoid disrupting the WebSocket connection
                    System.err.println("Error authenticating WebSocket connection: " + e.getMessage());
                }
            }
        } else if (accessor != null && StompCommand.DISCONNECT.equals(accessor.getCommand())) {
            // When user disconnects, update their status to offline
            if (accessor.getUser() != null) {
                String email = accessor.getUser().getName();
                chatService.updateUserOnlineStatus(email, false);
            }
        }

        return message;
    }
}