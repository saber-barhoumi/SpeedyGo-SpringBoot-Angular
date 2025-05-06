package com.ski.speedygobackend.DTO;

import lombok.Data;

@Data
public class PasswordResetRequestDTO {
    private String email;
    private String token;
    private String newPassword;
}