package com.ski.speedygobackend.Controller.OcrController;

import net.sourceforge.tess4j.ITesseract;
import net.sourceforge.tess4j.Tesseract;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;
import java.io.File;
import java.io.IOException;

@RestController
@RequestMapping("/api/ocr")
public class OCRController {

    private final ITesseract tesseract;

    public OCRController() {
        // Initialize Tesseract instance
        this.tesseract = new Tesseract();
        // You can set the language here (e.g., 'eng' for English, or any other supported language)
        this.tesseract.setLanguage("eng");
    }

    @PostMapping
    public ResponseEntity<Object> processOCR(@RequestParam("image") MultipartFile imageFile) {
        // Check if the file is empty
        if (imageFile.isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("No image file uploaded.");
        }

        try {
            // Convert the MultipartFile to a File
            File image = convertMultipartFileToFile(imageFile);

            // Perform OCR using Tesseract
            String result = tesseract.doOCR(image);
            System.out.println("OCR result: " + result);

            // Extract numbers from OCR result
            String extractedNumber = extractNumbers(result);

            // Clean up temporary file after use
            image.delete();

            // Return the extracted number as a response
            return ResponseEntity.ok().body(new OCRResponse(extractedNumber));

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to process the image: " + e.getMessage());
        }
    }

    // Convert MultipartFile to File
    private File convertMultipartFileToFile(MultipartFile file) throws IOException {
        // Create a temporary file to avoid leaving files on disk
        File convFile = File.createTempFile("upload-", ".png");
        file.transferTo(convFile);
        return convFile;
    }

    // Function to extract numbers from a string
    private String extractNumbers(String text) {
        // Remove all non-digit characters from the text
        return text.replaceAll("\\D", "");
    }

    // Simple response class to return the extracted number
    public static class OCRResponse {
        private String number;

        public OCRResponse(String number) {
            this.number = number;
        }

        public String getNumber() {
            return number;
        }

        public void setNumber(String number) {
            this.number = number;
        }
    }
}
