package com.ski.speedygobackend.security;

import com.ski.speedygobackend.Service.UserManagement.CustomUserDetailsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
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

import java.util.Arrays;

@Configuration
@Primary
@EnableWebSecurity
@EnableMethodSecurity(prePostEnabled = true)
public class SecurityConfig {

    private final JWTFilter jwtFilter;

    @Autowired
    private CustomUserDetailsService customUserDetailsService;

    public SecurityConfig(JWTFilter jwtFilter) {
        this.jwtFilter = jwtFilter;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable())
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .sessionManagement(session -> session
                        .sessionCreationPolicy(SessionCreationPolicy.STATELESS) // Assure que l'application est sans état
                )
                .authorizeHttpRequests(authorize -> authorize
                        .requestMatchers("/api/auth/**").permitAll() // Permet l'accès libre à toutes les routes d'authentification
                        .requestMatchers("/api/demandes-conge/create").permitAll()
                        .requestMatchers("/api/recruitment/**").permitAll()


                        .anyRequest().authenticated() // Tout autre accès nécessite une authentification
                )
                .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class); // Ajoute le filtre JWT avant l'authentification standard

        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder(); // Utilisation de BCrypt pour le hachage des mots de passe
    }

    @Bean
    public UserDetailsService userDetailsService() {
        return customUserDetailsService; // Utilisation du service personnalisé pour récupérer les détails de l'utilisateur
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(Arrays.asList("http://localhost:4200")); // Autorisation des origines du frontend
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS")); // Définition des méthodes autorisées
        configuration.setAllowedHeaders(Arrays.asList("authorization", "content-type", "x-auth-token")); // Définition des en-têtes autorisés
        configuration.setExposedHeaders(Arrays.asList("x-auth-token")); // Expose l'en-tête x-auth-token
        configuration.setAllowCredentials(true); // Permet l'utilisation de cookies et headers d'authentification
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration); // Applique la configuration à toutes les requêtes
        return source;
    }
}
