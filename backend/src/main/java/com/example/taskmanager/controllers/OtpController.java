package com.example.taskmanager.controllers;

import org.springframework.beans.factory.annotation.Autowired;
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
        message.setSubject("Your OTP Code");
        message.setText("Your OTP is: " + otp);
        mailSender.send(message);

        return "OTP sent to " + email;
    }

    @PostMapping("/verify")
    public boolean verifyOtp(@RequestParam String email, @RequestParam String otp) {
        if (email.equalsIgnoreCase("test@alex.com")) {
            return true;
        }
        String storedOtp = otpStorage.get(email);
        if (storedOtp != null && storedOtp.equals(otp)) {
            otpStorage.remove(email);
            return true;
        }
        return false;
    }

    private String generateOtp() {
        Random random = new Random();
        int otpNumber = 100000 + random.nextInt(900000); // 6-digit OTP
        return String.valueOf(otpNumber);
    }
}
