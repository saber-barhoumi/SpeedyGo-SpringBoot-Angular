package com.ski.speedygobackend.Service.statistiqueService;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.ski.speedygobackend.Entity.OfferManagement.Offres;
import com.ski.speedygobackend.Repository.IOffresRepository;
import com.ski.speedygobackend.Repository.IStoreRepository;

import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
@Service
public class statistiqueServiceImpl implements statistiqueService {
    // Placeholder for database interaction methods

    private final IOffresRepository offresRepository;
    private final IStoreRepository storeRepository;

    @Override
    public List<String> getDashboardStats() {
        // Get base statistics
        List<String> stats = new ArrayList<>();
        stats.add("Total Offers: " + offresRepository.count());
        stats.add("Total Stores: " + storeRepository.count());

        // Add offers per store statistics
        Map<String, Long> offersPerStore = getOffersPerStore();
        offersPerStore.forEach((storeKey, count) -> {
            stats.add("Store '" + storeKey + "' has " + count + " offers");
        });

        return stats;
    }

    /**
     * Gets the count of offers for each store
     * @return Map with store name as key and count of offers as value
     */
    private Map<String, Long> getOffersPerStore() {
        List<Offres> allOffers = offresRepository.findAll();

        // Group offers by store name and count them, handling null stores
        return allOffers.stream()
                .collect(Collectors.groupingBy(
                        offre -> {
                            // Handle null store reference safely
                            if (offre.getStore() == null) {
                                return "Unassigned";
                            } else {
                                return offre.getStore().getName() != null ?
                                        offre.getStore().getName() : "Unnamed Store";
                            }
                        },
                        Collectors.counting()
                ));
    }
}