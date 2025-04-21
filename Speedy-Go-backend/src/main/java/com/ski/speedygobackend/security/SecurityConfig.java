package com.ski.speedygobackend.security;

import com.ski.speedygobackend.Service.UserManagement.CustomUserDetailsService;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;

import java.util.Arrays;


import java.util.Arrays;
import java.util.List;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity

public class SecurityConfig {

    private final JWTFilter jwtFilter;
    private final CustomUserDetailsService customUserDetailsService;

    public SecurityConfig(JWTFilter jwtFilter, CustomUserDetailsService customUserDetailsService) {
        this.jwtFilter = jwtFilter;
        this.customUserDetailsService = customUserDetailsService;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                // Disable CSRF protection
                .csrf(AbstractHttpConfigurer::disable)

                // Configure CORS
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))

                // Configure session management
                .sessionManagement(session ->
                        session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
                )

                // Configure authorization
                .authorizeHttpRequests(authz -> authz
                        // Public endpoints
                        .requestMatchers(
                                "/ws/**",
                                "/public/**",
                                "/api/auth/**",
                                "/api/email/forgot-password",
                                "/api/email/reset-password",
                                "/api/carpoolings/calculate-price", // Original endpoint
                                "/api/price/**", // New price calculation endpoint
                                "/api/trips/**",
                                "/v3/api-docs/**",
                                "/swagger-ui/**",
                                "/swagger-resources/**"
                        ).permitAll()

                        // Admin-specific endpoints
                        .requestMatchers("/api/admin/**").hasRole("ADMIN")

                        // Customer-specific endpoints
                        .requestMatchers("/api/carpoolings/reservations/me").authenticated()
                        .requestMatchers("/api/carpoolings/add").authenticated()
                        .requestMatchers("/api/carpoolings/{id}/reserve").hasAnyRole("CUSTOMER", "DELEVERY", "USER")

                        .requestMatchers("/api/carpoolings/{id}/reserve").authenticated()




                        // Require authentication for all other requests
                        .anyRequest().authenticated()
                )

                // Add JWT filter
                .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public UserDetailsService userDetailsService() {
        return customUserDetailsService;
    }

    @Bean
    public AuthenticationManager authenticationManager(
            AuthenticationConfiguration authenticationConfiguration
    ) throws Exception {
        return authenticationConfiguration.getAuthenticationManager();
    }

    @Bean
    CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        // Replace wildcard with specific origin
        configuration.setAllowedOrigins(Arrays.asList("http://localhost:4200"));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("authorization", "content-type", "x-auth-token"));
        configuration.setExposedHeaders(Arrays.asList("x-auth-token"));
        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}