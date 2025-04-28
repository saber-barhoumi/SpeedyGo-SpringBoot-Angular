package com.ski.speedygobackend.Service.RouteOptimizationManagement;

import com.ski.speedygobackend.Entity.RouteManagement.SmartRoute;

import java.util.List;

public interface ISmartRouteServices {
    SmartRoute saveRoute(SmartRoute route);
    List<SmartRoute> findHistoricalSimilarRoutes(String startLocation, String endLocation);
}
