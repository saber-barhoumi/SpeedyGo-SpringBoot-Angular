package com.ski.speedygobackend.Controller.OfferManagement;

import com.ski.speedygobackend.DTO.OffreCommentDTO;
import com.ski.speedygobackend.Entity.OfferManagement.OffreComment;
import com.ski.speedygobackend.Service.OfferManagement.IOffreCommentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("api/offres/comments")
@RequiredArgsConstructor
public class OffreCommentController {

    private final IOffreCommentService commentService;

    @PostMapping("/{offreId}/{userId}/{username}")
    public ResponseEntity<?> addComment(
            @PathVariable Long offreId,
            @PathVariable Long userId,
            @PathVariable String username,
            @RequestBody Map<String, String> commentBody) {

        try {
            String text = commentBody.get("text");
            if (text == null || text.trim().isEmpty()) {
                return ResponseEntity.badRequest().body("Comment text cannot be empty");
            }

            // Default to French if language is not provided
            String language = commentBody.getOrDefault("language", "fr");

            OffreComment savedComment = commentService.addComment(offreId, userId, username, text, language);
            return ResponseEntity.status(HttpStatus.CREATED).body(savedComment);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error adding comment: " + e.getMessage());
        }
    }

    @GetMapping("/offre/{offreId}")
    public ResponseEntity<?> getCommentsByOffre(@PathVariable Long offreId) {
        try {
            // Get only negative comments (badWord = true)
            List<OffreCommentDTO> comments = commentService.getNegativeCommentsByOffre(offreId);
            return ResponseEntity.ok(comments);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error fetching comments: " + e.getMessage());
        }
    }

    @GetMapping("/offre/{offreId}/all")
    public ResponseEntity<?> getAllCommentsByOffre(@PathVariable Long offreId) {
        try {
            // Get all comments regardless of sentiment
            List<OffreCommentDTO> comments = commentService.getCommentsByOffre(offreId);
            return ResponseEntity.ok(comments);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error fetching comments: " + e.getMessage());
        }
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<?> getCommentsByUser(@PathVariable Long userId) {
        try {
            List<OffreCommentDTO> comments = commentService.getCommentsByUser(userId);
            return ResponseEntity.ok(comments);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error fetching comments: " + e.getMessage());
        }
    }

    @PutMapping("/{commentId}")
    public ResponseEntity<?> updateComment(
            @PathVariable Long commentId,
            @RequestBody Map<String, String> commentBody) {

        try {
            String text = commentBody.get("text");
            if (text == null || text.trim().isEmpty()) {
                return ResponseEntity.badRequest().body("Comment text cannot be empty");
            }

            // Default to French if language is not provided
            String language = commentBody.getOrDefault("language", "fr");

            OffreComment updatedComment = commentService.updateComment(commentId, text, language);
            return ResponseEntity.ok(updatedComment);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error updating comment: " + e.getMessage());
        }
    }

    @DeleteMapping("/{commentId}")
    public ResponseEntity<?> deleteComment(@PathVariable Long commentId) {
        try {
            commentService.deleteComment(commentId);
            return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error deleting comment: " + e.getMessage());
        }
    }
}