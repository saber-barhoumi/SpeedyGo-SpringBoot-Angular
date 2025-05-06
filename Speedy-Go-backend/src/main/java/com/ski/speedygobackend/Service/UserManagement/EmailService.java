package com.ski.speedygobackend.Service.UserManagement;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {
    @Autowired
    private JavaMailSender mailSender;

    public void sendPasswordResetEmail(String to, String resetLink) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom("noreply@speedygo.com");
        message.setTo(to);
        message.setSubject("SpeedyGo - Password Reset Request");
        message.setText("You have requested to reset your password. " +
                "Please click the link below to reset your password:\n\n" +
                resetLink + "\n\n" +
                "If you did not make this request, please ignore this email.\n\n" +
                "This link will expire in 1 hour.\n\n" +
                "Best regards,\nSpeedyGo Team");

        mailSender.send(message);
        System.out.println("Would send password reset email to: " + to);
        System.out.println("Reset link: " + resetLink);
    }
}