package com.ski.speedygobackend.Repository;

import com.ski.speedygobackend.Entity.ReturnManagment.Returns;
import com.ski.speedygobackend.Enum.RetourStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface IReturnsRepository extends JpaRepository<Returns,Long> {

    @Query("SELECT COUNT(r) FROM Returns r WHERE r.user.UserId = :userId AND r.retourstatus = :status")
    long countByUserIdAndRetourstatus(@Param("userId") Long userId, @Param("status") RetourStatus status);


}
