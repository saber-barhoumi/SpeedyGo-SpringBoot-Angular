package com.ski.speedygobackend.Service.SmsManagement;

import com.vonage.client.VonageClient;
import com.vonage.client.sms.messages.TextMessage;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor

public class SmsService implements ISmsService{

    @Value("${vonage.apiKey}")
    private String apiKey;

    @Value("${vonage.apiSecret}")
    private String apiSecret;

    @Value("${vonage.fromNumber}")
    private String fromNumber;

    private VonageClient vonageClient;

    @PostConstruct
    public void init() {
        vonageClient = VonageClient.builder()
                .apiKey(apiKey)
                .apiSecret(apiSecret)
                .build();
    }

    public void sendSms(String to, String message) {
        TextMessage sms = new TextMessage(fromNumber, to, message);

        try {
            var response = vonageClient.getSmsClient().submitMessage(sms);
            if (response.getMessages().get(0).getStatus() == com.vonage.client.sms.MessageStatus.OK) {
                System.out.println("Message envoyé avec succès !");
            } else {
                System.out.println("Erreur lors de l'envoi : " + response.getMessages().get(0).getErrorText());
            }
        } catch (Exception e) {
            System.out.println("Exception : " + e.getMessage());
        }
    }
}