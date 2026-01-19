package com.contactapp.backend.Controller;

import com.contactapp.backend.Model.User;
import com.contactapp.backend.Repository.UserRepository;
import com.contactapp.backend.Security.JwtUtil;
import jakarta.validation.Valid;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    private final UserRepository userRepository;

    public AuthController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }


    @PostMapping("/register")
    public User register(@Valid @RequestBody User user) {

        if (userRepository.findByEmail(user.getEmail()).isPresent()) {
            throw new RuntimeException("Email already registered");
        }

        User saved = userRepository.save(user);
        System.out.println("User registered with ID: " + saved.getId());

        return saved;
    }


    @PostMapping("/login")
    public String login(@RequestBody User loginUser) {

 

        User dbUser = userRepository.findByEmail(loginUser.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!dbUser.getPassword().equals(loginUser.getPassword())) {
            System.out.println(" PASSWORD MISMATCH");
            throw new RuntimeException("Invalid password");
        }

        String token = JwtUtil.generateToken(dbUser.getId());

    

        return token;
    }


    @PutMapping("/profile")
    public User updateProfile(@RequestBody User updatedUser) {

    

        Authentication authentication =
                SecurityContextHolder.getContext().getAuthentication();


        if (authentication == null) {
            System.out.println(" Authentication is NULL");
            throw new RuntimeException("Unauthorized");
        }

        Object principal = authentication.getPrincipal();

        System.out.println("Principal value: " + principal);
        System.out.println("Principal class: " + principal.getClass().getName());

        Long userId;

        if (principal instanceof Long) {
            userId = (Long) principal;
            System.out.println("Principal is Long, userId = " + userId);
        }
        else if (principal instanceof String) {
            System.out.println("Principal is String: " + principal);

            if ("anonymousUser".equals(principal)) {
                System.out.println(" anonymousUser detected");
                throw new RuntimeException("Unauthorized");
            }

            userId = Long.parseLong((String) principal);
            System.out.println("Parsed userId from String: " + userId);
        }
        else {
            System.out.println(" Unknown principal type");
            throw new RuntimeException("Unauthorized");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        System.out.println("User found for update: " + user.getEmail());

        if (updatedUser.getName() != null && !updatedUser.getName().isEmpty()) {
            System.out.println("Updating name to: " + updatedUser.getName());
            user.setName(updatedUser.getName());
        }

        if (updatedUser.getPassword() != null && !updatedUser.getPassword().isEmpty()) {
            System.out.println("Updating password");
            user.setPassword(updatedUser.getPassword());
        }

        User saved = userRepository.save(user);
        System.out.println("PROFILE UPDATED SUCCESSFULLY");

        return saved;
    }
}
