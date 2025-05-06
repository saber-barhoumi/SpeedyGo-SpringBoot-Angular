package com.ski.speedygobackend.Service.ComfirmationTransfertServiceManagment;

import com.ski.speedygobackend.Entity.ComfirmationTransfert;
import com.ski.speedygobackend.Entity.PointsRelaisManagment.PointsRelais;
import com.ski.speedygobackend.Repository.IComfirmationTransfertRepository;
import com.ski.speedygobackend.Repository.IPointsRelaisRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class ComfirmationTransfertServiceImpl implements IComfirmationTransfertService {

    private final IComfirmationTransfertRepository comfirmationTransfertRepository;
    private final IPointsRelaisRepository pointsRelaisRepository;

    @Override
    public void confirmerTransfert(Long pointRelaisId) {
        Optional<PointsRelais> pointRelaisOpt = pointsRelaisRepository.findById(pointRelaisId);

        if (pointRelaisOpt.isPresent()) {
            ComfirmationTransfert confirmation = new ComfirmationTransfert();
            confirmation.setDateConfirmation(LocalDateTime.now());
            comfirmationTransfertRepository.save(confirmation);
        } else {
            throw new RuntimeException("Point relais non trouvé");
        }
    }
}
