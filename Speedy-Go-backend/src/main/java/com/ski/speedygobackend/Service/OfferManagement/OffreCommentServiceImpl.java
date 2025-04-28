package com.ski.speedygobackend.Service.OfferManagement;

import com.ski.speedygobackend.DTO.OffreCommentDTO;
import com.ski.speedygobackend.Entity.OfferManagement.OffreComment;
import com.ski.speedygobackend.Entity.OfferManagement.Offres;
import com.ski.speedygobackend.Repository.IOffresRepository;
import com.ski.speedygobackend.Repository.OffreCommentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class OffreCommentServiceImpl implements IOffreCommentService {

    private final OffreCommentRepository commentRepository;
    private final IOffresRepository offresRepository;
    private final BadWordService badWordService;

    @Override
    @Transactional
    public OffreComment addComment(Long offreId, Long userId, String username, String text, String language) {
        Offres offre = offresRepository.findById(offreId)
                .orElseThrow(() -> new IllegalArgumentException("Offre with ID " + offreId + " not found"));

        // Check for bad words using the Python API
        Boolean containsBadWord = badWordService.checkForBadWords(text, language);

        OffreComment comment = new OffreComment();
        comment.setText(text);
        comment.setUserId(userId);
        comment.setUsername(username);
        comment.setOffre(offre);
        comment.setBadWord(!containsBadWord);

        return commentRepository.save(comment);
    }

    @Override
    public List<OffreCommentDTO> getCommentsByOffre(Long offreId) {
        return commentRepository.findByOffreOffreId(offreId).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<OffreCommentDTO> getCommentsByUser(Long userId) {
        return commentRepository.findByUserId(userId).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<OffreCommentDTO> getNegativeCommentsByOffre(Long offreId) {
        return commentRepository.findByOffreOffreId(offreId).stream()
                .filter(comment -> comment.getBadWord() != null && comment.getBadWord())
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public OffreComment updateComment(Long commentId, String text, String language) {
        OffreComment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new IllegalArgumentException("Comment with ID " + commentId + " not found"));

        // Check for bad words using the Python API
        Boolean containsBadWord = badWordService.checkForBadWords(text, language);

        comment.setText(text);
        comment.setBadWord(containsBadWord);
        return commentRepository.save(comment);
    }

    @Override
    @Transactional
    public void deleteComment(Long commentId) {
        if (!commentRepository.existsById(commentId)) {
            throw new IllegalArgumentException("Comment with ID " + commentId + " not found");
        }
        commentRepository.deleteById(commentId);
    }

    private OffreCommentDTO mapToDTO(OffreComment comment) {
        return new OffreCommentDTO(
                comment.getCommentId(),
                comment.getText(),
                comment.getUserId(),
                comment.getUsername(),
                comment.getOffre().getOffreId(),
                comment.getCreatedAt(),
                comment.getBadWord()
        );
    }
}