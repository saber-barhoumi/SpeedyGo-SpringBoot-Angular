package com.ski.speedygobackend.DTO;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SendMessageRequest {
    @JsonProperty("conversationId")
    private Long conversationId;

    @JsonProperty("content")
    private String content;

    @JsonProperty("timestamp")
    private String timestamp;
}