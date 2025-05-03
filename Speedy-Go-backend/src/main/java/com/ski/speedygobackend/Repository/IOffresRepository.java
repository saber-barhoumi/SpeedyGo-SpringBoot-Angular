package com.ski.speedygobackend.Repository;

import com.ski.speedygobackend.Entity.OfferManagement.Offres;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

public interface IOffresRepository extends JpaRepository<Offres, Long> {
    boolean existsById(Long offreID);
    List<Offres> findByStore_StoreID(Long storeID);  // or whatever the exact property name is

}
