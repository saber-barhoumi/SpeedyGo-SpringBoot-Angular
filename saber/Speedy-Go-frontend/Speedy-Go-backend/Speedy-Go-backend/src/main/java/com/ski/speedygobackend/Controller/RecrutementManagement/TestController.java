package com.ski.speedygobackend.Controller.RecrutementManagement;

import com.ski.speedygobackend.Service.RecrutementManagement.GeminiAiService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.beans.factory.annotation.Value;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestTemplate;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/test")
public class TestController {

    @Value("${gemini.api.key}")
    private String apiKey;

    @GetMapping("/gemini")
    public ResponseEntity<Map<String, Object>> testGeminiCurl() {
        Map<String, Object> result = new HashMap<>();

        try {
            // Configure headers
            org.springframework.http.HttpHeaders headers = new org.springframework.http.HttpHeaders();
            headers.setContentType(org.springframework.http.MediaType.APPLICATION_JSON);

            // Create request body exactly like the curl command
            Map<String, Object> requestBody = new HashMap<>();
            List<Map<String, Object>> contents = new ArrayList<>();
            Map<String, Object> content = new HashMap<>();
            List<Map<String, Object>> parts = new ArrayList<>();
            Map<String, Object> textPart = new HashMap<>();

            textPart.put("text", "Explain how AI works");
            parts.add(textPart);
            content.put("parts", parts);
            contents.add(content);
            requestBody.put("contents", contents);

            // Create HTTP entity
            org.springframework.http.HttpEntity<Map<String, Object>> request =
                    new org.springframework.http.HttpEntity<>(requestBody, headers);

            // API URL
            String url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=" + apiKey;

            // Make API call
            RestTemplate restTemplate = new RestTemplate();
            Map response = restTemplate.postForObject(url, request, Map.class);

            // Return response
            result.put("request", requestBody);
            result.put("response", response);

            return ResponseEntity.ok(result);
        } catch (Exception e) {
            result.put("error", e.getMessage());
            return ResponseEntity.internalServerError().body(result);
        }
    }
}