package com.example.CommerceBankTeamProject.controller;

import com.example.CommerceBankTeamProject.controller.api.login.LoginRequest;
import com.example.CommerceBankTeamProject.controller.api.login.LoginResponse;
import com.example.CommerceBankTeamProject.domain.User;
import com.example.CommerceBankTeamProject.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/login")
public class LoginController {
    //CRUD Operations
    private final UserRepository userRepository;

    @Autowired
    public LoginController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @PostMapping
    public ResponseEntity<LoginResponse> login(@RequestBody LoginRequest request) {
        String userId = request.getUserId();
        String userPassword = request.getUserPassword();

        Optional<User> user = userRepository.findByUserIdAndUserPassword(userId, userPassword);
        if (user.isPresent()) {
            return ResponseEntity.ok(new LoginResponse(user.get()));
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(new LoginResponse("Invalid login details"));
    }
}