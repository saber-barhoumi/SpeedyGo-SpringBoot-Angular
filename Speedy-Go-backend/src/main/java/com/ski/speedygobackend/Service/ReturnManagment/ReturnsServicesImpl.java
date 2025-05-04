package com.ski.speedygobackend.Service.ReturnManagment;

import com.ski.speedygobackend.Entity.ReturnManagment.Returns;
import com.ski.speedygobackend.Entity.UserManagement.User;
import com.ski.speedygobackend.Enum.RetourStatus;
import com.ski.speedygobackend.Repository.IReturnsRepository;
import com.ski.speedygobackend.Repository.IUserRepository;
import com.ski.speedygobackend.Service.SmsManagement.SmsService;
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
    private final SmsService smsService; // ✅ injection correcte

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
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            String email = authentication.getName();

            User user = userRepository.findByEmail(email).orElseThrow(() ->
                    new RuntimeException("Utilisateur non trouvé avec email: " + email)
            );
            returns.setUser(user);
        } else {
            Returns existingReturn = returnRepository.findById(returns.getReturnID()).orElseThrow(() ->
                    new RuntimeException("Retour non trouvé avec ID: " + returns.getReturnID())
            );
            returns.setUser(existingReturn.getUser());
        }

        return returnRepository.save(returns);
    }

    @Override
    public void deleteReturns(Long id) {
        returnRepository.deleteById(id);
    }

    @Transactional
    public void checkAndBanUser(Long userId) {
        User user = userRepository.findById(userId).orElse(null);
        if (user == null) {
            System.out.println("Utilisateur introuvable avec ID : " + userId);
            return;
        }

        System.out.println("Vérification de l'utilisateur : " + user.getUserId());
        long countNotDone = returnRepository.countByUserIdAndRetourstatus(userId, RetourStatus.NOTDONE);
        System.out.println("Nombre de NOTDONE: " + countNotDone);

        if (countNotDone >= 3) {
            user.setBanned(true);
            userRepository.save(user);
            System.out.println("Utilisateur banni avec succès.");

            if (user.getPhoneNumber() != null && !user.getPhoneNumber().isBlank()) {
                System.out.println("Tentative d'envoi de SMS à : " + user.getPhoneNumber());
                try {
                    smsService.sendSms(
                            user.getPhoneNumber(),
                            "Hello, your SpeedyGo account has been temporarily suspended due to multiple incomplete exchange demands. Please contact us for more information."
                    );
                    System.out.println("SMS envoyé avec succès.");
                } catch (Exception e) {
                    System.err.println("Erreur lors de l'envoi du SMS : " + e.getMessage());
                    e.printStackTrace();
                }
            } else {
                System.out.println("Numéro de téléphone non défini pour l'utilisateur.");
            }

        } else {
            user.setBanned(false);
            userRepository.save(user);
            System.out.println("Utilisateur non banni.");
        }
    }
}
