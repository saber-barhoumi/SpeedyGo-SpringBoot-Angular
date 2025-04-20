package com.ski.speedygobackend.Repository;

import com.ski.speedygobackend.Entity.ReturnManagment.Returns;
import org.springframework.data.jpa.repository.JpaRepository;

public interface IReturnsRepository extends JpaRepository<Returns,Long> {
}
