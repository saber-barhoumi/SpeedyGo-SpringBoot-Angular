package com.ski.speedygobackend.Service.ReturnManagment;

import com.ski.speedygobackend.Entity.ReturnManagment.Returns;

import java.util.List;

public interface IReturnsServices {
    List<Returns> getAllReturns();

    Returns getReturnsById(Long id);

    Returns saveReturns(Returns returns);

    void deleteReturns(Long id);

    public void checkAndBanUser(Long userId);

    }

