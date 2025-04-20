package com.ski.speedygobackend.Service.EnvironmentalImpactManagement;

import com.ski.speedygobackend.Entity.EnvironmentalImpactManagement.CarbonFootPrint;
import com.ski.speedygobackend.Entity.TripManagement.Vehicle;

import java.io.IOException;

public interface ICarbonFootprintServices {

    public void exportCarbonFootPrintToCSV(String filePath);
    }
