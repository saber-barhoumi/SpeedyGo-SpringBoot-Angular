package com.ski.speedygobackend.Controller.OcrController;

import net.sourceforge.tess4j.ITesseract;
import net.sourceforge.tess4j.Tesseract;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;
import org.springframework.web.multipart.MultipartFile;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.ByteArrayInputStream;
import java.io.File;
import java.io.IOException;
import java.net.URL;
import java.nio.file.Paths;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/ocr")
public class OcrController {

    @PostMapping("/ocr")
    public ResponseEntity<Map<String, String>> extractIdNumber(@RequestParam("file") MultipartFile file) {
        try {
            // 1. Verify and convert the image
            BufferedImage image = ImageIO.read(new ByteArrayInputStream(file.getBytes()));
            if (image == null) {
                throw new IllegalArgumentException("Invalid image file");
            }

            // 2. Configure Tesseract
            ITesseract tesseract = new Tesseract();

            // Set Tesseract datapath dynamically
            String tessDataPath = getClass().getClassLoader().getResource("tessdata").getPath();
            if (tessDataPath == null) {
                throw new IOException("Tesseract datapath is not found in resources.");
            }
            tesseract.setDatapath(new File("src\\main\\java\\com\\ski\\speedygobackend\\Controller\\OcrController\\tessedata").getAbsolutePath());

            // 3. Perform OCR
            String result = tesseract.doOCR(image);
            String numberOnly = result.replaceAll("[^0-9]", "");

            // 4. Return the result
            Map<String, String> response = new HashMap<>();
            response.put("number", numberOnly);
            response.put("text", result);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "OCR failed: " + e.getMessage()));
        }
    }
}
