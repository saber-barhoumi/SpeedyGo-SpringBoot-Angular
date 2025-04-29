package com.ski.speedygobackend.Service.ReturnManagment;

import com.ski.speedygobackend.Entity.ReturnManagment.Returns;
import com.ski.speedygobackend.Entity.UserManagement.User;
import com.ski.speedygobackend.Enum.RetourStatus;
import com.ski.speedygobackend.Repository.IReturnsRepository;
import com.ski.speedygobackend.Repository.IUserRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ReturnsServicesImpl implements IReturnsServices {

    private final IReturnsRepository returnRepository;
    private final IUserRepository userRepository;

    @Override
    public List<Returns> getAllReturns() {
        return returnRepository.findAll();
    }

    @Override
    public Returns getReturnsById(Long id) {
        return returnRepository.findById(id).orElse(null);
    }

    @Override
    public Returns saveReturns(Returns returns) {
        if (returns.getReturnID() == null) {
            // Nouveau Return : affecter l'utilisateur connecté
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            String email = authentication.getName();

            User user = userRepository.findByEmail(email).orElseThrow(() ->
                    new RuntimeException("Utilisateur non trouvé avec email: " + email)
            );
            returns.setUser(user);
        } else {
            // Modification d'un retour existant : NE PAS toucher à l'utilisateur
            Returns existingReturn = returnRepository.findById(returns.getReturnID()).orElseThrow(() ->
                    new RuntimeException("Retour non trouvé avec ID: " + returns.getReturnID())
            );
            returns.setUser(existingReturn.getUser()); // On garde l'ancien User
        }

        return returnRepository.save(returns);
    }


    @Override
    public void deleteReturns(Long id) {
        returnRepository.deleteById(id);
    }

    @Transactional
    public void checkAndBanUser(Long userId) {
        // Vérifie si l'utilisateur existe
        User user = userRepository.findById(userId).orElse(null);
        if (user == null) {
            System.out.println("Utilisateur introuvable avec ID : " + userId);
            return; // utilisateur introuvable
        }

        System.out.println("Vérification de l'utilisateur : " + user.getUserId());

        // Compter combien de returns de ce user sont en statut NOTDONE
        long countNotDone = returnRepository.countByUserIdAndRetourstatus(userId, RetourStatus.NOTDONE);

        System.out.println("Nombre de 'NOTDONE' pour l'utilisateur " + user.getUserId() + " : " + countNotDone);

        // Si l'utilisateur a 3 NOTDONE, le bannir
        if (countNotDone >= 3) {
            user.setBanned(true);
            userRepository.save(user);
            System.out.println("Utilisateur " + user.getUserId() + " a été banni.");
        } else {
            user.setBanned(false);
            userRepository.save(user);
            System.out.println("Utilisateur " + user.getUserId() + " reste non banni.");
        }
    }




}
