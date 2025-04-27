package com.ski.speedygobackend.Service.UserManagement;

import org.springframework.stereotype.Service;

@Service
public class EmailService {
    public void sendEmail(String to, String subject, String body) {
        // 👉 Ici, on simule l'envoi d'email en affichant dans la console
        System.out.println("-------------------------------------------------");
        System.out.println("📧 Email envoyé à : " + to);
        System.out.println("Sujet : " + subject);
        System.out.println("Message : " + body);
        System.out.println("-------------------------------------------------");
    }
}
