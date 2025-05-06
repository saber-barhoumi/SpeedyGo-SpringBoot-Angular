package com.ski.speedygobackend.Service.PointsRelaisService;

import com.ski.speedygobackend.Entity.PointsRelaisManagment.PointsRelais;
import com.ski.speedygobackend.Repository.IPointsRelaisRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class PointsRelaisServiceImpl implements IPointsRelaisService {

    private final IPointsRelaisRepository pointsRelaisRepository;

    @Override
    public List<PointsRelais> getAllPointsRelais() {
        return pointsRelaisRepository.findAll();
    }

    @Override
    public PointsRelais getPointRelaisById(Long id) {
        return pointsRelaisRepository.findById(id).orElse(null);
    }

    @Override
    public PointsRelais addPointRelais(PointsRelais pointRelais) {
        return pointsRelaisRepository.save(pointRelais);
    }

    @Override
    public void deletePointRelais(Long id) {
        pointsRelaisRepository.deleteById(id);
    }
}
