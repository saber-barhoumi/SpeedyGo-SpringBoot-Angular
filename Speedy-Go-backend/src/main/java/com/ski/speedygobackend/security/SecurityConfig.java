package com.ski.speedygobackend.security;

import com.ski.speedygobackend.Service.UserManagement.CustomUserDetailsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
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

import java.util.Arrays;

@Configuration
@Primary
@EnableWebSecurity
public class SecurityConfig {

    private final JWTFilter jwtFilter;

    public SecurityConfig(JWTFilter jwtFilter) {
        this.jwtFilter = jwtFilter;
    }

    @Autowired
    private CustomUserDetailsService customUserDetailsService;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable()) // Désactiver CSRF
                .cors(cors -> cors.configurationSource(corsConfigurationSource())) // Configurer CORS
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)) // Session sans état
                .authorizeHttpRequests(authorize -> authorize
                        // Autoriser l'accès public aux endpoints d'authentification et de réinitialisation de mot de passe
                        .requestMatchers("/api/auth/**").permitAll()
                        .requestMatchers("/api/email/forgot-password").permitAll()
                        .requestMatchers("/api/email/reset-password").permitAll()

                        // Restreindre l'accès aux endpoints admin aux utilisateurs avec le rôle ADMIN
                        .requestMatchers("/api/admin/**").hasRole("ADMIN")

                        // Restreindre l'accès aux endpoints spécifiques aux utilisateurs authentifiés
                        .requestMatchers("/api/carpoolings/reservations/me").authenticated()
                        .requestMatchers("/api/carpoolings/add").authenticated()

                        // Restreindre l'accès aux endpoints spécifiques aux utilisateurs avec l'autorité CUSTOMER
                        .requestMatchers("/api/carpoolings/{carpoolingId}/reserve").hasAuthority("CUSTOMER")

                        // Toutes les autres requêtes doivent être authentifiées
                        .anyRequest().authenticated()
                )
                // Ajouter le filtre JWT avant le filtre d'authentification par nom d'utilisateur et mot de passe
                .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder(); // Utiliser BCrypt pour le hachage des mots de passe
    }

    @Bean
    public UserDetailsService userDetailsService() {
        return customUserDetailsService; // Utiliser le service personnalisé pour charger les détails de l'utilisateur
    }

    @Bean
    CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(Arrays.asList("http://localhost:4200")); // Autoriser les requêtes depuis localhost:4200
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS")); // Autoriser les méthodes HTTP
        configuration.setAllowedHeaders(Arrays.asList("authorization", "content-type", "x-auth-token")); // Autoriser les en-têtes
        configuration.setExposedHeaders(Arrays.asList("x-auth-token")); // Exposer les en-têtes personnalisés
        configuration.setAllowCredentials(true); // Autoriser les cookies et les en-têtes d'authentification

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration); // Appliquer la configuration CORS à tous les endpoints
        return source;
    }
}