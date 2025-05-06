package com.ski.speedygobackend.Service.ParcelPaymentManagement;

import com.ski.speedygobackend.Entity.ParcelPaymentManagement.Parcel;
import com.ski.speedygobackend.Entity.ParcelPaymentManagement.Payment;
import com.ski.speedygobackend.Entity.UserManagement.User;
import com.ski.speedygobackend.Repository.IPaymentRepository;
import com.ski.speedygobackend.Repository.IUserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class PaymentServicesImpl implements IPaymentServices {
    private final IPaymentRepository paymentRepository;
    private final IUserRepository userRepository;

    @Autowired
    public PaymentServicesImpl(IPaymentRepository paymentRepository, IUserRepository userRepository) {
        this.paymentRepository = paymentRepository;
        this.userRepository = userRepository;
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
    public Payment updatePayment(Long paymentId, Payment payment) {
        Payment existingPayment = paymentRepository.findById(paymentId).orElse(null);
        if (existingPayment != null) {
            // Update only the fields that should change
            existingPayment.setAmount(payment.getAmount());
            existingPayment.setPaymentMethod(payment.getPaymentMethod());

            // Handle user update
            if (payment.getUser() != null && payment.getUser().getUserId() != null) {
                User existingUser = userRepository.findById(payment.getUser().getUserId()).orElse(null);
                if (existingUser != null) {
                    existingPayment.setUser(existingUser);
                } else {
                    existingPayment.setUser(null); // Avoid transient user
                }
            } else {
                existingPayment.setUser(existingPayment.getUser()); // Preserve existing user if no change
            }

            // Preserve paymentDate from the existing record
            return paymentRepository.save(existingPayment);
        }
        return null; // Or throw an exception if payment not found
    }
}