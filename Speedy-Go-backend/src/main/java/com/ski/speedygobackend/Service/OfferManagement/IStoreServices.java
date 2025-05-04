package com.ski.speedygobackend.Service.OfferManagement;

import com.ski.speedygobackend.DTO.StoreDetailsDTO;
import com.ski.speedygobackend.Entity.OfferManagement.Store;

import java.util.List;

import org.springframework.web.multipart.MultipartFile;

public interface IStoreServices {
    Store addStore(Store store);

    List<StoreDetailsDTO> retrieveAllStores();

    Store retrieveStore(Long idStore);

    void removeStore(Long idStore);

    Store updateStore(Store store , Long idStore);

    List<Store> getStoresByType(String type);
    // String uploadStoreImage(MultipartFile file);

    // Removed the redundant addNewStore method declaration
}
