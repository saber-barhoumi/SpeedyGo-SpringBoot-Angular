package com.ski.speedygobackend.Repository;

import com.ski.speedygobackend.Entity.CarpoolingManagement.Carpooling;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository

public interface ICarpoolingRepository extends JpaRepository<Carpooling, Long> {


}
