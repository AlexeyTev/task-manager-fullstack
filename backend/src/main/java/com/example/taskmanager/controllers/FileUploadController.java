package com.example.taskmanager.controllers;

import com.example.taskmanager.services.S3Service;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
@RestController
@RequestMapping("/upload")
public class FileUploadController {

    private final S3Service s3Service;

    public FileUploadController(S3Service s3Service) {
        this.s3Service = s3Service;
    }

    @PostMapping
    public ResponseEntity<String> upload(@RequestParam("file") MultipartFile file) {
        try {
            String fileUrl = s3Service.uploadFile(file);
            return ResponseEntity.ok(fileUrl); // ✅ returns the public or S3 URL
        } catch (Exception e) {
            e.printStackTrace(); // 🐛 log the real problem
            return ResponseEntity.status(500).body("Upload failed: " + e.getMessage());
        }
    }
}

