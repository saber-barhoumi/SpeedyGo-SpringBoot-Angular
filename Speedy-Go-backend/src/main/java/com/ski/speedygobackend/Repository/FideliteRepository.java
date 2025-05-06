package com.ski.speedygobackend.Repository;

import com.ski.speedygobackend.Entity.OfferManagement.pointfidelite;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface FideliteRepository extends JpaRepository<pointfidelite, Long> {

    List<pointfidelite> findByUserId(Long id);

    Optional<pointfidelite> findByStore_StoreIDAndUserId(Long idStore, Long userId);
}
