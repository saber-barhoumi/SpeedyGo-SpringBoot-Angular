package com.ski.speedygobackend.Service.PointsRelaisService;

import com.ski.speedygobackend.Entity.PointsRelaisManagment.PointsRelais;

import java.util.List;

public interface IPointsRelaisService {
    List<PointsRelais> getAllPointsRelais();
    PointsRelais getPointRelaisById(Long id);
    PointsRelais addPointRelais(PointsRelais pointRelais);
    void deletePointRelais(Long id);
}
