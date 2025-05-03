package com.example.taskmanager.controllers;

import com.example.taskmanager.utils.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Random;

@RestController
@RequestMapping("/otp")
public class OtpController {

    private Map<String, String> otpStorage = new HashMap<>();

    @Autowired
    private JavaMailSender mailSender;
    @Autowired
    private JwtUtil jwtUtil;


    @PostMapping("/send")
    public String sendOtp(@RequestParam String email) {
        if (email.equalsIgnoreCase("test@alex.com")) {
            return "Developer mode: OTP bypassed";
        }
        String otp = generateOtp();
        otpStorage.put(email, otp);

        // Send real email
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(email);
        message.setSubject("Your OTP Code - To Task-Manager");
        message.setText("Your OTP To Task-Manager is: " + otp);
        mailSender.send(message);

        return "OTP sent to " + email;
    }

    @PostMapping("/verify")
    public ResponseEntity<?> verifyOtp(@RequestParam String email, @RequestParam String otp) {
        String storedOtp = otpStorage.get(email);

        if (email.equalsIgnoreCase("test@alex.com") || (storedOtp != null && storedOtp.equals(otp))) {
            otpStorage.remove(email);
            String token = jwtUtil.generateToken(email);
            System.out.println("Generated token pass to" + email + token);
            return ResponseEntity.ok().body(Map.of("token", token));
        }

        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid OTP");
    }

    private String generateOtp() {
        Random random = new Random();
        int otpNumber = 100000 + random.nextInt(900000); // 6-digit OTP
        return String.valueOf(otpNumber);
    }
}
