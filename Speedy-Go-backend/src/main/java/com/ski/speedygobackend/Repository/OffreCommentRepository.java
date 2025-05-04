package com.ski.speedygobackend.Repository;

import com.ski.speedygobackend.Entity.OfferManagement.OffreComment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OffreCommentRepository extends JpaRepository<OffreComment, Long> {
    List<OffreComment> findByOffreOffreId(Long offreId);
    List<OffreComment> findByUserId(Long userId);
    List<OffreComment> findByOffreOffreIdAndUserId(Long offreId, Long userId);
}
