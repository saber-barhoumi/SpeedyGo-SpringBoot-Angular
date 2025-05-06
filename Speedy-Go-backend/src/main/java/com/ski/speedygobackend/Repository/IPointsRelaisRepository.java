package com.ski.speedygobackend.Repository;

import com.ski.speedygobackend.Entity.PointsRelaisManagment.PointsRelais;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface IPointsRelaisRepository extends JpaRepository<PointsRelais, Long> {
    // Méthodes de recherche personnalisées peuvent être ajoutées ici si nécessaire
}
