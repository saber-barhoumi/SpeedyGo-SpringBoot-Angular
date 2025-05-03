package com.ski.speedygobackend.Controller.OfferManagement;

import com.ski.speedygobackend.DTO.StoreDetailsDTO;
import com.ski.speedygobackend.Entity.OfferManagement.Store;
import com.ski.speedygobackend.Entity.UserManagement.User;
import com.ski.speedygobackend.Service.OfferManagement.IStoreServices;
import com.ski.speedygobackend.Service.UserManagement.IUserServices;

import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;

import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.beans.factory.annotation.Value;

import java.net.MalformedURLException;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.io.IOException;

@RestController
@RequestMapping("api/stores")
@RequiredArgsConstructor
public class StoreRestController {
    private final IStoreServices storeServices;
    private final IUserServices userServices;
    private final com.ski.speedygobackend.shared.uploadImage uploadImage;

    @Value("${upload.directory}")
    private String uploadDirectory;

    @PostMapping("/add")
    public ResponseEntity<?> addStore(@RequestPart("store") Store store,
                                      @RequestPart(value = "file", required = false) MultipartFile file) {
        try {
            // Ensure the user is saved before saving the store
            User user = store.getUser();
            if (user != null && user.getUserId() == null) {
                user = userServices.saveUser(user);
                store.setUser(user);
            }

            // Handle file upload only if a file was provided
            if (file != null && !file.isEmpty()) {
                try {
                    String imagePath = uploadImage.uploadStoreImage(file , "upload/store");
                    store.setImage(imagePath);
                } catch (Exception e) {
                    return ResponseEntity
                            .status(HttpStatus.BAD_REQUEST)
                            .body("File upload failed: " + e.getMessage());
                }
            }

            Store savedStore = storeServices.addStore(store);
            return ResponseEntity.ok(savedStore);
        } catch (Exception e) {
            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Store creation failed: " + e.getMessage());
        }
    }

    @GetMapping("/all")
    public ResponseEntity<List<StoreDetailsDTO>> getAllStores() {
        List<StoreDetailsDTO> stores = storeServices.retrieveAllStores();

        // Use the fixed base URL
        String baseUrl = "http://localhost:8084/api";

        // Construct the full image URL - make sure this matches your endpoint path exactly
        stores.forEach(store -> {
            if (store.getImage() != null && !store.getImage().isEmpty()) {
                // Only keep the filename part of the path
                String filename = store.getImage();
                if (filename.contains("/")) {
                    filename = filename.substring(filename.lastIndexOf("/") + 1);
                }
                store.setImage(baseUrl + "/stores/images/" + filename);
                System.out.println("Image URL: " + store.getImage());
            }
        });

        return ResponseEntity.ok(stores);
    }

    @GetMapping("/get/{id-store}")
    public ResponseEntity<Store> getById(@PathVariable("id-store") Long idStore) {
        Store store = storeServices.retrieveStore(idStore);
        if (store == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(store);
    }

    @PutMapping("/update/{id-store}")
    public ResponseEntity<Store> updateStore(@RequestBody Store store, @PathVariable("id-store") Long idStore) {
        return ResponseEntity.ok(storeServices.updateStore(store, idStore));
    }

    @DeleteMapping("/delete/{id-store}")
    public ResponseEntity<Void> deleteById(@PathVariable("id-store") Long idStore) {
        storeServices.removeStore(idStore);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/type/{type}")
    public ResponseEntity<?> getStoresByType(@PathVariable("type") String type) {
        try {
            List<Store> stores = storeServices.getStoresByType(type);
            return ResponseEntity.ok(stores);
        } catch (IllegalArgumentException e) {
            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body(e.getMessage());
        }
    }

    // Update this endpoint to match the full URL path seen in the logs
    @GetMapping("/images/**")
    public ResponseEntity<Resource> serveImage(HttpServletRequest request) {
        try {
            String requestPath = request.getRequestURI();
            // Extract the filename from the path
            String filename = requestPath.substring(requestPath.indexOf("/images/") + 8);
            System.out.println("Requested image: " + filename);

            // Handle the case where the path contains upload/store/
            if (filename.startsWith("upload/store/")) {
                filename = filename.substring("upload/store/".length());
            }

            // Resolve the file path
            Path filePath = Paths.get(uploadDirectory).resolve(filename).normalize();
            System.out.println("Looking for image at: " + filePath.toAbsolutePath());

            Resource resource = new UrlResource(filePath.toUri());

            // Check if the file exists
            if (resource.exists() && resource.isReadable()) {
                // Determine content type
                String contentType = determineContentType(filename);

                return ResponseEntity.ok()
                        .contentType(MediaType.parseMediaType(contentType))
                        .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + resource.getFilename() + "\"")
                        .body(resource);
            } else {
                System.out.println("Image not found: " + filePath.toAbsolutePath());
                return ResponseEntity.notFound().build();
            }
        } catch (MalformedURLException e) {
            System.out.println("MalformedURLException: " + e.getMessage());
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            System.out.println("Exception serving image: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    private String determineContentType(String filename) {
        filename = filename.toLowerCase();
        if (filename.endsWith(".jpg") || filename.endsWith(".jpeg")) {
            return "image/jpeg";
        } else if (filename.endsWith(".png")) {
            return "image/png";
        } else if (filename.endsWith(".gif")) {
            return "image/gif";
        } else if (filename.endsWith(".bmp")) {
            return "image/bmp";
        } else if (filename.endsWith(".webp")) {
            return "image/webp";
        } else {
            return "application/octet-stream";
        }
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<String> handleIllegalArgumentException(IllegalArgumentException e) {
        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(e.getMessage());
    }
}