package com.ski.speedygobackend.Repository;

import com.ski.speedygobackend.Entity.ParcelPaymentManagement.InternationalShipping;
import org.springframework.data.jpa.repository.JpaRepository;

public interface IInternationalShippingRepository extends JpaRepository<InternationalShipping,Long> {
}
