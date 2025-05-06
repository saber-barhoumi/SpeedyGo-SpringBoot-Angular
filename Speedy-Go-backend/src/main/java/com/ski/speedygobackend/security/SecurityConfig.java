package com.ski.speedygobackend.security;

import com.ski.speedygobackend.Service.UserManagement.CustomUserDetailsService;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity(prePostEnabled = true)
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

                // Configure session management
                .sessionManagement(session ->
                        session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
                )

                // Configure authorization
                .authorizeHttpRequests(authz -> authz
                        // Public endpoints
                        .requestMatchers(
                                "/ws/**",
                                "/parcel/**",
                                "/payment/**",
                                "/route/**",
                                "/public/**",
                                "/api/auth/**",
                                "/api/email/forgot-password",
                                "/api/email/reset-password",
                                "/api/carpoolings/calculate-price",
                                "/api/price/**",
                                "/api/trips/**",
                                "/api/demandes-conge/create",
                                "/api/recruitment/**",
                                "/api/reviews/carpooling/**",
                                "/v3/api-docs/**",
                                "/swagger-ui/**",
                                "/swagger-resources/**",
                                "/specific-trips/**",
                                "/stores/**",
                                "/stores/images/**",
                                "/api/offres/**",
                                "/offres/**",
                                "/statistiques/**",
                                "/api/statistiques/**",
                                "/api/specific-trips/**",
                                "/api/specific-trips/images/**",
                                "/api/stores/**",
                                "/api/uploads/**"
                        ).permitAll()

                        // Admin-specific endpoints
                        .requestMatchers(
                                "/api/admin/**",
                                "/payment/get/**",
                                "/payment/getAll",
                                "/payment/add",
                                "/payment/update/**",
                                "/payment/delete/**"
                        ).hasRole("ADMIN")

                        // Customer and delivery-specific endpoints
                        .requestMatchers("/api/carpoolings/reservations/me").authenticated()
                        .requestMatchers("/api/carpoolings/add").authenticated()
                        .requestMatchers("/api/carpoolings/{id}/reserve").hasAnyRole("CUSTOMER", "DELEVERY", "USER")
                        .requestMatchers("/api/delivery-services/register").hasAnyRole("DELEVERY", "ADMIN")
                        .requestMatchers("/api/delivery-services/provider/**").hasAnyRole("ADMIN", "DELEVERY")
                        .requestMatchers("/api/delivery-orders/delivery-person/**").hasAnyRole("ADMIN", "DELEVERY")
                        .requestMatchers(HttpMethod.POST, "/api/delivery-services/*/rate").hasAnyRole("CUSTOMER", "ADMIN", "USER")
                        .requestMatchers(HttpMethod.POST, "/api/delivery-orders").hasAnyRole("CUSTOMER", "ADMIN", "DELEVERY", "USER")
                        .requestMatchers("/api/reviews/**").authenticated()
                        .requestMatchers("/api/reviews/rate").hasAnyRole("USER", "DELEVERY")
                        .requestMatchers("/api/reviews/add").hasAnyRole("USER", "DELEVERY")
                        .requestMatchers("/api/carpoolings/reservations/my-reservations").hasRole("CUSTOMER")
                        .requestMatchers("/api/reviews/user").hasRole("CUSTOMER")

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
}