package com.example.CommerceBankTeamProject.service;

import com.example.CommerceBankTeamProject.domain.User;
import com.example.CommerceBankTeamProject.repository.UserRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.sql.Timestamp;
import java.util.List;
import java.util.NoSuchElementException;
import java.util.Optional;

@Service
public class UserService {
    private final UserRepository userRepository;

    @Autowired
    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public User getUserById(Integer id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("User not found with id: " + id));
    }

    public User addUser(User user) {
        user.setCreatedAt(new Timestamp(System.currentTimeMillis()));
        return userRepository.save(user);
    }

    public User updateUser(User user) {
        user.setModifiedAt(new Timestamp(System.currentTimeMillis()));
        return userRepository.save(user);
    }

    public void deleteUser(Integer id) {
        userRepository.deleteById(id);
    }

    public boolean authenticateUser(String userId, String password) {
        Optional<User> userOptional = userRepository.findByUserIdAndUserPassword(userId, password);
        return userOptional.isPresent();
    }

    // Role distinction
    public boolean isAdmin(String userId) {
        Optional<User> userOptional = userRepository.findByUserId(userId);
        return userOptional.map(user -> "admin".equals(user.getUserRole())).orElse(false);
    }
}
