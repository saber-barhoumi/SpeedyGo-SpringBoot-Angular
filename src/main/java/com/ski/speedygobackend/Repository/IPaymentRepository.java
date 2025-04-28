package com.ski.speedygobackend.Repository;

import com.ski.speedygobackend.Entity.ParcelPaymentManagement.Parcel;
import com.ski.speedygobackend.Entity.ParcelPaymentManagement.Payment;
import org.springframework.data.repository.CrudRepository;

public interface IPaymentRepository extends CrudRepository<Payment,Long> {
}
