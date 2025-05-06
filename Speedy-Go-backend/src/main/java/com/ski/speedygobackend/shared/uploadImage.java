package com.ski.speedygobackend.shared;

import java.io.File;
import java.io.IOException;

import org.springframework.web.multipart.MultipartFile;
import org.springframework.stereotype.Component;

@Component
public class uploadImage {
    public String uploadStoreImage(MultipartFile file,
                                   String uploadDirPath) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("File is empty or null");
        }

        String uploadDir = System.getProperty("user.dir")  + File.separator + uploadDirPath + File.separator;


        File uploadDirFile = new File(uploadDir);
        if (!uploadDirFile.exists()) {
            boolean created = uploadDirFile.mkdirs();
            if (!created) {
                throw new RuntimeException("Failed to create upload directory: " + uploadDir);
            }
        }

        String originalFilename = file.getOriginalFilename();
        String fileExtension = originalFilename != null ?
                originalFilename.substring(originalFilename.lastIndexOf('.')) : ".jpg";
        String newFilename = java.util.UUID.randomUUID().toString() + fileExtension;

        String filePath = uploadDir + newFilename;


        File destFile = new File(filePath);
        try {
            // Transfer the file
            file.transferTo(destFile);

            // Return a relative path for storage in the database
            return uploadDirPath+'/' + newFilename;
        } catch (IOException e) {
            throw new RuntimeException("Failed to upload file: " + e.getMessage(), e);
        }
    }

}
