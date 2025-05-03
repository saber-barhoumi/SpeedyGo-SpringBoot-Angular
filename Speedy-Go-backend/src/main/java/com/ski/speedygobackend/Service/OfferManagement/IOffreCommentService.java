package com.ski.speedygobackend.Service.OfferManagement;

import com.ski.speedygobackend.DTO.OffreCommentDTO;
import com.ski.speedygobackend.Entity.OfferManagement.OffreComment;

import java.util.List;

public interface IOffreCommentService {
    OffreComment addComment(Long offreId, Long userId, String username, String text, String language);
    List<OffreCommentDTO> getCommentsByOffre(Long offreId);
    List<OffreCommentDTO> getNegativeCommentsByOffre(Long offreId);
    List<OffreCommentDTO> getCommentsByUser(Long userId);
    OffreComment updateComment(Long commentId, String text, String language);
    void deleteComment(Long commentId);
}