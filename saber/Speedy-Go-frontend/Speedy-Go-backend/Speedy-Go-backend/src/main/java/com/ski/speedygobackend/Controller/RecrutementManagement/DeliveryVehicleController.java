package com.ski.speedygobackend.Controller.RecrutementManagement;

import com.ski.speedygobackend.Entity.RecrutementManagement.DeliveryVehicle;
import com.ski.speedygobackend.Enum.VehicleType;
import com.ski.speedygobackend.Service.RecrutementManagement.IDeliveryVehicleService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

@RestController
@RequestMapping("/api/deliveryvehicles")
@CrossOrigin(origins = "http://localhost:4200")
public class DeliveryVehicleController {

    @Value("${file.upload.directory:uploads/vehicles}")
    private String uploadDirectory;

    private final IDeliveryVehicleService deliveryVehicleService;

    @Autowired
    public DeliveryVehicleController(IDeliveryVehicleService deliveryVehicleService) {
        this.deliveryVehicleService = deliveryVehicleService;
    }

    @GetMapping
    public ResponseEntity<List<DeliveryVehicle>> getAllVehicles() {
        return ResponseEntity.ok(deliveryVehicleService.getAllVehicles());
    }

    @GetMapping("/{id}")
    public ResponseEntity<DeliveryVehicle> getVehicleById(@PathVariable Long id) {
        return ResponseEntity.ok(deliveryVehicleService.getVehicleById(id));
    }

    // Modified to handle regular vehicle creation without photo
    @PostMapping
    public ResponseEntity<?> createVehicle(@RequestBody DeliveryVehicle deliveryVehicle) {
        try {
            DeliveryVehicle createdVehicle = deliveryVehicleService.createVehicle(deliveryVehicle);
            return ResponseEntity.status(HttpStatus.CREATED).body(createdVehicle);
        } catch (Exception e) {
            Map<String, String> response = new HashMap<>();
            response.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    // New endpoint to upload a vehicle photo
    @PostMapping(value = "/upload-photo", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> uploadVehiclePhoto(@RequestParam("file") MultipartFile file) {
        try {
            // Check if file is empty
            if (file.isEmpty()) {
                Map<String, String> response = new HashMap<>();
                response.put("error", "File is empty");
                return ResponseEntity.badRequest().body(response);
            }

            // Validate file type
            String contentType = file.getContentType();
            if (contentType == null || !contentType.startsWith("image/")) {
                Map<String, String> response = new HashMap<>();
                response.put("error", "Only image files are allowed");
                return ResponseEntity.badRequest().body(response);
            }

            // Create upload directory if it doesn't exist
            File directory = new File(uploadDirectory);
            if (!directory.exists()) {
                directory.mkdirs();
            }

            // Generate unique filename to prevent collisions
            String originalFilename = file.getOriginalFilename();
            String fileExtension = originalFilename != null
                    ? originalFilename.substring(originalFilename.lastIndexOf("."))
                    : ".jpg";

            String uniqueFilename = UUID.randomUUID().toString() + fileExtension;

            // Save the file
            Path targetPath = Paths.get(uploadDirectory, uniqueFilename);
            Files.copy(file.getInputStream(), targetPath, StandardCopyOption.REPLACE_EXISTING);

            // Create response with file path
            Map<String, String> response = new HashMap<>();
            response.put("vehiclePhotoPath", "/" + uploadDirectory + "/" + uniqueFilename);

            return ResponseEntity.ok(response);
        } catch (IOException e) {
            Map<String, String> response = new HashMap<>();
            response.put("error", "Failed to upload file: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    // New endpoint to create vehicle with photo upload
    @PostMapping(value = "/with-photo", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> createVehicleWithPhoto(
            @RequestPart("vehicle") DeliveryVehicle deliveryVehicle,
            @RequestPart(value = "photo", required = false) MultipartFile photo) {

        try {
            // Upload photo if provided
            if (photo != null && !photo.isEmpty()) {
                String photoPath = uploadPhoto(photo);
                deliveryVehicle.setVehiclePhotoPath(photoPath);
            }

            // Create the vehicle
            DeliveryVehicle createdVehicle = deliveryVehicleService.createVehicle(deliveryVehicle);
            return ResponseEntity.status(HttpStatus.CREATED).body(createdVehicle);
        } catch (Exception e) {
            Map<String, String> response = new HashMap<>();
            response.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    // New endpoint to update vehicle with photo upload
    @PutMapping(value = "/{id}/with-photo", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> updateVehicleWithPhoto(
            @PathVariable Long id,
            @RequestPart("vehicle") DeliveryVehicle vehicleDetails,
            @RequestPart(value = "photo", required = false) MultipartFile photo) {

        try {
            // Upload photo if provided
            if (photo != null && !photo.isEmpty()) {
                String photoPath = uploadPhoto(photo);
                vehicleDetails.setVehiclePhotoPath(photoPath);
            }

            // Update the vehicle
            DeliveryVehicle updatedVehicle = deliveryVehicleService.updateVehicle(id, vehicleDetails);
            return ResponseEntity.ok(updatedVehicle);
        } catch (Exception e) {
            Map<String, String> response = new HashMap<>();
            response.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateVehicle(@PathVariable Long id, @RequestBody DeliveryVehicle vehicleDetails) {
        try {
            DeliveryVehicle updatedVehicle = deliveryVehicleService.updateVehicle(id, vehicleDetails);
            return ResponseEntity.ok(updatedVehicle);
        } catch (Exception e) {
            Map<String, String> response = new HashMap<>();
            response.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteVehicle(@PathVariable Long id) {
        try {
            deliveryVehicleService.deleteVehicle(id);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            Map<String, String> response = new HashMap<>();
            response.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    @GetMapping("/type/{vehicleType}")
    public ResponseEntity<List<DeliveryVehicle>> getVehiclesByType(@PathVariable VehicleType vehicleType) {
        return ResponseEntity.ok(deliveryVehicleService.getVehiclesByType(vehicleType));
    }

    @GetMapping("/check-license-plate")
    public ResponseEntity<Map<String, Boolean>> checkLicensePlate(@RequestParam String licensePlate) {
        Map<String, Boolean> response = new HashMap<>();
        response.put("exists", deliveryVehicleService.isLicensePlateAlreadyRegistered(licensePlate));
        return ResponseEntity.ok(response);
    }

    // Helper method to upload photo and return the path
    private String uploadPhoto(MultipartFile file) throws IOException {
        // Validate file type
        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            throw new IllegalArgumentException("Only image files are allowed");
        }

        // Create upload directory if it doesn't exist
        File directory = new File(uploadDirectory);
        if (!directory.exists()) {
            directory.mkdirs();
        }

        // Generate unique filename
        String originalFilename = file.getOriginalFilename();
        String fileExtension = originalFilename != null
                ? originalFilename.substring(originalFilename.lastIndexOf("."))
                : ".jpg";

        // Add timestamp to filename for uniqueness
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyyMMdd-HHmmss");
        String timestamp = LocalDateTime.now().format(formatter);
        String uniqueFilename = "vehicle-" + timestamp + "-" + UUID.randomUUID().toString().substring(0, 8) + fileExtension;

        // Save the file
        Path targetPath = Paths.get(uploadDirectory, uniqueFilename);
        Files.copy(file.getInputStream(), targetPath, StandardCopyOption.REPLACE_EXISTING);

        // Return path that can be stored in database and used by frontend
        return "/" + uploadDirectory + "/" + uniqueFilename;
    }
    @RestController
    @RequestMapping("/api/debug")
    public class DebugController {

        @Value("${file.upload.directory:uploads/vehicles}")
        private String uploadDirectory;

        @GetMapping("/file-paths")
        public ResponseEntity<Map<String, Object>> debugFilePaths() {
            Map<String, Object> debug = new HashMap<>();

            // Get working directory
            debug.put("workingDirectory", System.getProperty("user.dir"));

            // Check configured upload directory
            debug.put("configuredUploadDirectory", uploadDirectory);

            // Check if the directory exists
            File uploadDir = new File(uploadDirectory);
            debug.put("uploadDirectoryExists", uploadDir.exists());
            debug.put("uploadDirectoryPath", uploadDir.getAbsolutePath());

            // List files in the directory
            if (uploadDir.exists()) {
                String[] files = uploadDir.list();
                debug.put("fileCount", files != null ? files.length : 0);

                List<Map<String, Object>> fileDetails = new ArrayList<>();
                if (files != null) {
                    for (String fileName : files) {
                        Map<String, Object> fileInfo = new HashMap<>();
                        File file = new File(uploadDir, fileName);
                        fileInfo.put("name", fileName);
                        fileInfo.put("size", file.length());
                        fileInfo.put("lastModified", new Date(file.lastModified()));
                        fileInfo.put("path", file.getAbsolutePath());
                        fileDetails.add(fileInfo);
                    }
                }
                debug.put("files", fileDetails);
            }

            return ResponseEntity.ok(debug);
        }
    }
}