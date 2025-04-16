package com.ski.speedygobackend.Controller.SpecificTripManagement;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.ski.speedygobackend.Entity.SpecificTripManagement.SpecifiqueTrip;
import com.ski.speedygobackend.Enum.VehicleType;
import com.ski.speedygobackend.Service.SpecificTripManagement.ISpecificTripServices;

import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.net.MalformedURLException;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import org.springframework.http.HttpHeaders;

@RestController
@RequestMapping("/specific-trips")
@RequiredArgsConstructor
public class SpecificTripRestController {

    private final ISpecificTripServices tripService;
    private final com.ski.speedygobackend.shared.uploadImage uploadImage;

    @Value("${upload.directory.trip}")
    private String uploadDirectory;

    @GetMapping("/{id}")
    public ResponseEntity<SpecifiqueTrip> getTripById(@PathVariable Long id) {
        Optional<SpecifiqueTrip> tripOptional = tripService.getTripById(id);
        if (tripOptional.isPresent()) {
            SpecifiqueTrip trip = tripOptional.get();
            System.out.println("Number of trips: " + tripService.getAllTrips().size());
            String baseUrl = "http://localhost:8084/api";

            System.out.println("Trip ID: " + trip.getId());
            System.out.println("Image URL before processing: " + trip.getPhoto());
            if (trip.getPhoto() != null && !trip.getPhoto().isEmpty()) {
                String filename = trip.getPhoto();
                if (filename.contains("/")) {
                    filename = filename.substring(filename.lastIndexOf("/") + 1);
                }
                trip.setPhoto(baseUrl + "/specific-trips/images/" + filename);
                System.out.println("Image URL after processing: " + trip.getPhoto());
            }
            return ResponseEntity.ok(trip);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping
    public ResponseEntity<List<SpecifiqueTrip>> getAllTrips() {
        List<SpecifiqueTrip> SpecifiqueTrip = tripService.getAllTrips();


        return ResponseEntity.ok(SpecifiqueTrip);
    }

    @GetMapping("/images/**")
    public ResponseEntity<Resource> serveImage(HttpServletRequest request) {
        try {
            String requestPath = request.getRequestURI();
            String filename = requestPath.substring(requestPath.indexOf("/images/") + 8);
            System.out.println("Requested image: " + filename);

            if (filename.startsWith("upload/trip/")) {
                filename = filename.substring("upload/trip/".length());
            }

            Path filePath = Paths.get(uploadDirectory).resolve(filename).normalize();
            System.out.println("Looking for image at: " + filePath.toAbsolutePath());

            Resource resource = new UrlResource(filePath.toUri());

            if (resource.exists() && resource.isReadable()) {
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
    // Support for legacy endpoint
    @PostMapping("/create")
    public SpecifiqueTrip createTripLegacy(
            @RequestPart(value = "trip") String tripJson,
            @RequestPart(value = "file", required = false) MultipartFile file) {

        // Convert JSON string to SpecifiqueTrip object
        ObjectMapper mapper = new ObjectMapper();
        mapper.registerModule(new JavaTimeModule()); // If using dates
        SpecifiqueTrip trip;

        try {
            trip = mapper.readValue(tripJson, SpecifiqueTrip.class);
        } catch (Exception e) {
            throw new RuntimeException("Failed to parse trip data: " + e.getMessage());
        }

        // Rest of your code...
        if (file != null && !file.isEmpty()) {
            try {
                String imagePath = uploadImage.uploadStoreImage(file, "upload/trip");
                trip.setPhoto(imagePath);
            } catch (RuntimeException e) {
                throw new RuntimeException("Failed to upload image: " + e.getMessage());
            }
        }

        return tripService.createTrip(trip);
    }

    @PutMapping("/{id}")
    public ResponseEntity<SpecifiqueTrip> updateTrip(@PathVariable Long id, @RequestBody SpecifiqueTrip trip) {
        try {
            return ResponseEntity.ok(tripService.updateTrip(id, trip));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PutMapping("/update/{id}")
    public ResponseEntity<SpecifiqueTrip> updateTripNow(@PathVariable Long id, @RequestBody SpecifiqueTrip trip) {
        try {
            return ResponseEntity.ok(tripService.updateTrip(id, trip));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTrip(@PathVariable Long id) {
        tripService.deleteTrip(id);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping
    public ResponseEntity<Void> deleteAllTrips() {
        tripService.deleteAllTrips();
        return ResponseEntity.noContent().build();
    }

    // Search endpoints


    @GetMapping("/search/departure-date/{date}")
    public List<SpecifiqueTrip> getTripsByDepartureDate(@PathVariable String date) {
        return tripService.findTripsByDepartureDate(LocalDate.parse(date));
    }

    @PostMapping("/{id}/upload-image")
    public ResponseEntity<String> uploadTripImage(@PathVariable Long id, @RequestParam("file") MultipartFile file) {
        try {
            String imagePath = uploadImage.uploadStoreImage(file, "upload/trip");
            return ResponseEntity.ok(imagePath);
        } catch (RuntimeException e) {
            return ResponseEntity.status(500).body(e.getMessage());
        }
    }
}