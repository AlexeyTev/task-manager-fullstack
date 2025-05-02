package com.example.taskmanager.services;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;

import java.io.IOException;
import java.util.UUID;

@Service
public class S3Service {

    private final S3Client s3Client;

    @Value("${aws.bucketName}")
    private String bucketName;

    @Value("${aws.region}")
    private String region;

    public S3Service(S3Client s3Client) {
        this.s3Client = s3Client;
    }

    public String uploadFile(MultipartFile file) throws IOException {
        validateFile(file);

        String key = "attachments/" + UUID.randomUUID() + "-" + file.getOriginalFilename();

        PutObjectRequest request = PutObjectRequest.builder()
                .bucket(bucketName)
                .key(key)
                .contentType(file.getContentType())
                .build();

        s3Client.putObject(request, RequestBody.fromBytes(file.getBytes()));

        String url = String.format("https://%s.s3.%s.amazonaws.com/%s", bucketName, region, key);
        System.out.println("✅ Uploaded to S3: " + url); // Optional logging
        return url;
    }

    private void validateFile(MultipartFile file) throws IOException {
        long maxSize = 5 * 1024 * 1024; // 5MB
        String contentType = file.getContentType();

        if (file.getSize() > maxSize) {
            throw new IOException("File is too large. Max size is 5MB.");
        }

        if (!isAllowedType(contentType)) {
            throw new IOException("Invalid file type: " + contentType);
        }
    }

    private boolean isAllowedType(String contentType) {
        return contentType != null && switch (contentType) {
            case "image/jpeg", "image/png", "application/pdf", "audio/mpeg", "audio/wav" -> true;
            default -> false;
        };
    }
}
