package com.ski.speedygobackend.Repository;
import com.ski.speedygobackend.Entity.OfferManagement.Store;
import com.ski.speedygobackend.Enum.StoreType;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface IStoreRepository extends JpaRepository<Store, Long> {

    List<Store> findByStoreType(StoreType storeType);
    boolean existsById(Long storeId);

}
