package com.ski.speedygobackend.Service.ParcelPaymentManagement;

import com.ski.speedygobackend.Entity.ParcelPaymentManagement.InternationalShipping;

import java.util.List;

public interface IInternationalShippingService {
    InternationalShipping addInternationalShipping(InternationalShipping internationalShipping);
    InternationalShipping retrieveInternationalShipping(Long shippingId);
    List<InternationalShipping> retrieveAll();
    void deleteInternationalShipping(Long shippingId);
    InternationalShipping updateInternationalShipping(Long shippingId, InternationalShipping internationalShipping);
}