package com.ski.speedygobackend.Controller.statistiqueController;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import com.ski.speedygobackend.Service.statistiqueService.statistiqueServiceImpl;

@RestController
@RequestMapping("/api/statistiques")
public class statistiqueController {

    @Autowired
    private statistiqueServiceImpl statistiqueService;

    @GetMapping("/dashboard")
    public List<String> getDashboardStats() {
        return statistiqueService.getDashboardStats();
    }
}
