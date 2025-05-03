package com.ski.speedygobackend.Service.ParcelPaymentManagement;

import com.ski.speedygobackend.Entity.ParcelPaymentManagement.Parcel;
import com.ski.speedygobackend.Entity.ParcelPaymentManagement.Payment;

import java.util.List;

public interface IPaymentServices {
    Payment addPayment(Payment payment);
    Payment retrievePayment(Long paymentId);
    List<Payment> retrieveAll();
    void deletePayment(Long paymentId);
    Payment updatePayment(Long paymentId, Payment payment);
}
