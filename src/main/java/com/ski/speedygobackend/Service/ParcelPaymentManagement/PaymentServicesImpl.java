package com.ski.speedygobackend.Service.ParcelPaymentManagement;

import com.ski.speedygobackend.Entity.ParcelPaymentManagement.Parcel;
import com.ski.speedygobackend.Entity.ParcelPaymentManagement.Payment;
import com.ski.speedygobackend.Repository.IParcelRepository;
import com.ski.speedygobackend.Repository.IPaymentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
@Service
public class PaymentServicesImpl implements IPaymentServices{
    private final IPaymentRepository paymentRepository;
    @Autowired  // Explicitly tell Spring to inject this dependency
    public PaymentServicesImpl(IPaymentRepository paymentRepository) {
        this.paymentRepository = paymentRepository;
    }
    @Override
    public Payment addPayment(Payment payment) {
        return paymentRepository.save(payment);
    }
    @Override
    public Payment retrievePayment(Long paymentId) {
        return paymentRepository.findById(paymentId).orElse(null);
    }
    @Override
    public List<Payment> retrieveAll() {
        return (List<Payment>) paymentRepository.findAll();
    }

    @Override
    public void deletePayment(Long paymentId) {
        paymentRepository.deleteById(paymentId);
    }

    @Override
    public Payment updatePayment(Long paymentId ,Payment payment) {
        Payment existingPayment = paymentRepository.findById(paymentId).orElse(null);
        return paymentRepository.save(payment);
    }
}
