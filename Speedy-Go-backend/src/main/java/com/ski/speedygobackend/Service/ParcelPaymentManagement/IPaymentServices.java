package com.ski.speedygobackend.Service.ParcelPaymentManagement;

import com.ski.speedygobackend.DTO.CartItemDto;
import com.ski.speedygobackend.Entity.ParcelPaymentManagement.Payment;
import com.stripe.exception.StripeException;

import java.io.File;
import java.io.IOException;
import java.util.List;

public interface IPaymentServices {
    Payment addPayment(Payment payment);
    Payment retrievePayment(Long paymentId);
    List<Payment> retrieveAll();
    void deletePayment(Long paymentId);
    Payment updatePayment(Long paymentId, Payment payment);


}