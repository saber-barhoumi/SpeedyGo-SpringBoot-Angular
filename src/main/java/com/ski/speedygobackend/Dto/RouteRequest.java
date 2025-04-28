package com.ski.speedygobackend.Dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class RouteRequest {

    @NotBlank
    private String fromLabel;
    @NotBlank
    private String toLabel;
    @NotNull
    private Double fromLat;
    @NotNull
    private Double fromLon;
    @NotNull
    private Double toLat;
    @NotNull
    private Double toLon;

}
