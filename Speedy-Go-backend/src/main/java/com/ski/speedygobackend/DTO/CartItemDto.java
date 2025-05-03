package com.ski.speedygobackend.DTO;

public class CartItemDto {
  private offresDetailsDTO offer;
  private int quantity;

  // Getters and Setters
  public offresDetailsDTO getOffer() {
    return offer;
  }

  public void setOffer(offresDetailsDTO offer) {
    this.offer = offer;
  }

  public int getQuantity() {
    return quantity;
  }

  public void setQuantity(int quantity) {
    this.quantity = quantity;
  }
}
