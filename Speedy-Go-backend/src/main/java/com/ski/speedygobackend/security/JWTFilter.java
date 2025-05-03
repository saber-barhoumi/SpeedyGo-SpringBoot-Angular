package com.ski.speedygobackend.security;

import com.ski.speedygobackend.Service.UserManagement.CustomUserDetailsService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
public class JWTFilter extends OncePerRequestFilter {
    private static final Logger logger = LoggerFactory.getLogger(JWTFilter.class);

    private final JwtUtils jwtUtils;
    private final CustomUserDetailsService customUserDetailsService;

    public JWTFilter(JwtUtils jwtUtils, CustomUserDetailsService customUserDetailsService) {
        this.jwtUtils = jwtUtils;
        this.customUserDetailsService = customUserDetailsService;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        String path = request.getRequestURI();
        logger.debug("Processing request: {} {}", request.getMethod(), path);

        if (isPublicPath(path)) {
            logger.debug("Skipping JWT validation for public path: {}", path);
            filterChain.doFilter(request, response);
            return;
        }

        String authorizationHeader = request.getHeader("Authorization");

        if (authorizationHeader != null && authorizationHeader.startsWith("Bearer ")) {
            String token = authorizationHeader.substring(7);

            try {
                String username = jwtUtils.extractUsername(token);

                if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                    UserDetails userDetails = customUserDetailsService.loadUserByUsername(username);

                    if (jwtUtils.validateToken(token, username)) {

                        // 🔥 VÉRIFICATION AJOUTÉE ICI 🔥
                        if (!userDetails.isEnabled()) {
                            logger.warn("Blocked user tried to authenticate: {}", username);
                            response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "User account is disabled or banned.");
                            return;
                        }

                        if (!userDetails.isAccountNonLocked()) {
                            logger.warn("Locked user tried to authenticate: {}", username);
                            response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "User account is locked.");
                            return;
                        }

                        UsernamePasswordAuthenticationToken authToken =
                                new UsernamePasswordAuthenticationToken(
                                        userDetails,
                                        null,
                                        userDetails.getAuthorities()
                                );

                        authToken.setDetails(
                                new WebAuthenticationDetailsSource().buildDetails(request)
                        );

                        SecurityContextHolder.getContext().setAuthentication(authToken);
                        logger.debug("JWT Token validated for user: {}", username);
                        logger.debug("User authorities: {}", userDetails.getAuthorities());
                    }
                }
            } catch (Exception e) {
                logger.error("Error processing JWT token", e);
            }
        }

        filterChain.doFilter(request, response);
    }


    private boolean isPublicPath(String path) {
        return path.equals("/api/carpoolings/calculate-price") ||
                path.startsWith("/api/price/") ||
                path.startsWith("/api/auth/") ||
                path.startsWith("/api/email/") ||
                path.startsWith("/api/trips/") ||
                path.startsWith("/public/") ||
                path.startsWith("/v3/api-docs/") ||
                path.startsWith("/swagger-ui/") ||
                path.startsWith("/swagger-resources/");
    }
}