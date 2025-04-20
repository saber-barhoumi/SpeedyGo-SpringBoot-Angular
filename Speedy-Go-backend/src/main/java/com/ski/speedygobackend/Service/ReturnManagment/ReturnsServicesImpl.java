package com.ski.speedygobackend.Service.ReturnManagment;

import com.ski.speedygobackend.Entity.ParcelPaymentManagement.Parcel;
import com.ski.speedygobackend.Entity.ReturnManagment.Returns;
import com.ski.speedygobackend.Repository.IParcelRepository;
import com.ski.speedygobackend.Repository.IReturnsRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ReturnsServicesImpl implements IReturnsServices {

    private final IReturnsRepository returnRepository;
    private final IParcelRepository parcelRepository;

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
        return returnRepository.save(returns);
    }

    @Override
    public void deleteReturns(Long id) {
        returnRepository.deleteById(id);
    }

    /**
     * Associe un colis à un retour en utilisant leurs identifiants.
     */
    @Transactional
    @Override
    public Returns assignParcelToReturn(Long returnId, Long parcelId) {
        Returns returns = returnRepository.findById(returnId)
                .orElseThrow(() -> new RuntimeException("Retour introuvable avec l'ID : " + returnId));

        Parcel parcel = parcelRepository.findById(parcelId)
                .orElseThrow(() -> new RuntimeException("Colis introuvable avec l'ID : " + parcelId));

        // Association bidirectionnelle
        returns.setParcel(parcel);
        parcel.getReturnss().add(returns);

        return returnRepository.save(returns);
    }
}
