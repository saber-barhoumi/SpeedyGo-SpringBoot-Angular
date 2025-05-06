package com.ski.speedygobackend.Service.ParcelPaymentManagement;

import com.ski.speedygobackend.Entity.ParcelPaymentManagement.InternationalShipping;
import com.ski.speedygobackend.Repository.IInternationalShippingRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class InternationalShippingServiceImpl implements IInternationalShippingService {
    private final IInternationalShippingRepository internationalShippingRepository;

    @Autowired
    public InternationalShippingServiceImpl(IInternationalShippingRepository internationalShippingRepository) {
        this.internationalShippingRepository = internationalShippingRepository;
    }

    @Override
    public InternationalShipping addInternationalShipping(InternationalShipping internationalShipping) {
        return internationalShippingRepository.save(internationalShipping);
    }

    @Override
    public InternationalShipping retrieveInternationalShipping(Long shippingId) {
        return internationalShippingRepository.findById(shippingId).orElse(null);
    }

    @Override
    public List<InternationalShipping> retrieveAll() {
        return (List<InternationalShipping>) internationalShippingRepository.findAll();
    }

    @Override
    public void deleteInternationalShipping(Long shippingId) {
        internationalShippingRepository.deleteById(shippingId);
    }

    @Override
    public InternationalShipping updateInternationalShipping(Long shippingId, InternationalShipping internationalShipping) {
        InternationalShipping existingShipping = internationalShippingRepository.findById(shippingId).orElse(null);
        return internationalShippingRepository.save(internationalShipping);
    }
}