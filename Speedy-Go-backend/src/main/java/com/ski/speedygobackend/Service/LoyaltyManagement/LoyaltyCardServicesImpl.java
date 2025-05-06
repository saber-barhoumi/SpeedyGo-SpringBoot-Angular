package com.ski.speedygobackend.Service.LoyaltyManagement;

import com.ski.speedygobackend.Entity.LoyaltyManagement.LoyaltyCard;

import com.ski.speedygobackend.Repository.ILoyaltyCardRepository;
import com.ski.speedygobackend.Service.LoyaltyManagement.ILoyaltyCardServices;
import lombok.AllArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class LoyaltyCardServicesImpl implements ILoyaltyCardServices {

    private final ILoyaltyCardRepository loyaltyCardRepository;

    @Autowired
    public LoyaltyCardServicesImpl(ILoyaltyCardRepository loyaltyCardRepository) {
        this.loyaltyCardRepository = loyaltyCardRepository;
    }

    @Override
    public LoyaltyCard addLoyaltyCard(LoyaltyCard loyaltyCard) {
        return loyaltyCardRepository.save(loyaltyCard);
    }

    @Override
    public List<LoyaltyCard> getAllLoyaltyCards() {
        return loyaltyCardRepository.findAll();
    }

    @Override
    public Optional<LoyaltyCard> getLoyaltyCardById(Long id) {
        return loyaltyCardRepository.findById(id);
    }

    @Override
    public void deleteLoyaltyCard(Long id) {
        if (loyaltyCardRepository.existsById(id)) {
            loyaltyCardRepository.deleteById(id);
        }
    }
}