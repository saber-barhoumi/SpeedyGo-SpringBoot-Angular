package com.ski.speedygobackend.Service.LoyaltyManagement;

import com.ski.speedygobackend.Entity.LoyaltyManagement.LoyaltyCard;

import java.util.List;
import java.util.Optional;

public interface ILoyaltyCardServices {


    LoyaltyCard addLoyaltyCard(LoyaltyCard loyaltyCard);

    List<LoyaltyCard> getAllLoyaltyCards();

    Optional<LoyaltyCard> getLoyaltyCardById(Long id);


    void deleteLoyaltyCard(Long id);
}
