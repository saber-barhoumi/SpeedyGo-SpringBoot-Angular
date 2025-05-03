package com.ski.speedygobackend.Service.UserManagement;


import com.ski.speedygobackend.Entity.UserManagement.User;
import com.ski.speedygobackend.Repository.IUserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    @Autowired
    private IUserRepository userRepository; // Ensure this repository exists

    @Override
    @Transactional(readOnly = true)
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + email));

        boolean isAccountNonLocked = !user.isBanned(); // s'il est banni, compte bloqué
        boolean isEnabled = !user.isBanned();           // s'il est banni, pas activé
        boolean isAccountNonExpired = true;             // tu peux mettre à false si tu veux gérer expiration
        boolean isCredentialsNonExpired = true;         // pareil pour expiration mot de passe

        return org.springframework.security.core.userdetails.User
                .withUsername(user.getEmail())
                .password(user.getPassword())
                .authorities(Collections.singletonList(
                        new SimpleGrantedAuthority("ROLE_" + user.getRole().name())
                ))
                .accountLocked(!isAccountNonLocked)          // Important ici !!
                .disabled(!isEnabled)                        // Important aussi
                .accountExpired(!isAccountNonExpired)
                .credentialsExpired(!isCredentialsNonExpired)
                .build();
    }


}

