package com.ski.speedygobackend.DTO;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
@Data
@AllArgsConstructor
@NoArgsConstructor
public class offresDetailsDTO {
    private Long offreId;
    private String title;
    private String description;
    private double discount;
    private String image;
    private double price;
    private boolean isAvailable;
    private String category;
    private String dateStart;
    private String storeName;

}
