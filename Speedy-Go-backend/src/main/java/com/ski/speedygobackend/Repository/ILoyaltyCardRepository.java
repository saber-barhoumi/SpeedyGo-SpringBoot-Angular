package com.ski.speedygobackend.Repository;

import com.ski.speedygobackend.Entity.LoyaltyManagement.LoyaltyCard;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

@Repository

public interface ILoyaltyCardRepository extends  JpaRepository <LoyaltyCard, Long> {

}
