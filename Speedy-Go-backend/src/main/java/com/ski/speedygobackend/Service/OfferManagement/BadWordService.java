package com.ski.speedygobackend.Service.OfferManagement;

import com.ski.speedygobackend.DTO.BadWordRequest;
import com.ski.speedygobackend.DTO.BadWordResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Service
public class BadWordService {

    private final RestTemplate restTemplate;
    private final String badWordApiUrl;

    public BadWordService(RestTemplate restTemplate,
                          @Value("${badword.api.url:http://localhost:8000/analyze}") String badWordApiUrl) {
        this.restTemplate = restTemplate;
        this.badWordApiUrl = badWordApiUrl;
    }

    public Boolean checkForBadWords(String text, String language) {
        try {
            BadWordRequest request = new BadWordRequest(text, language);
            ResponseEntity<BadWordResponse> response = restTemplate.postForEntity(
                    badWordApiUrl, request, BadWordResponse.class);

            if (response.getBody() != null) {
                String sentiment = response.getBody().getSentiment();
                System.out.println("Sentiment analysis result: " + sentiment);

                // Consider negative sentiment as a bad comment
                // Neutral and positive sentiments are considered acceptable
                return "négatif".equals(sentiment);
            }
            return false;
        } catch (Exception e) {
            // Log the error and return false to allow the comment if the API fails
            System.err.println("Error checking for sentiment: " + e.getMessage());
            return false;
        }
    }
}