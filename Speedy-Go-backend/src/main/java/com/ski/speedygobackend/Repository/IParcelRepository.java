package com.ski.speedygobackend.Repository;

import com.ski.speedygobackend.Entity.ParcelPaymentManagement.Parcel;
import org.springframework.data.repository.CrudRepository;

public interface IParcelRepository extends CrudRepository<Parcel,Long> {
}
