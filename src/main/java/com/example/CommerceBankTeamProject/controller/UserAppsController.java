package com.example.CommerceBankTeamProject.controller;

import com.example.CommerceBankTeamProject.domain.User;
import com.example.CommerceBankTeamProject.domain.UserApps;
import com.example.CommerceBankTeamProject.repository.ApplicationInfoRepository;
import com.example.CommerceBankTeamProject.repository.UserAppsRepository;
import com.example.CommerceBankTeamProject.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/user-apps")
public class UserAppsController {
    //CRUD Operations
    private final UserAppsRepository userAppsRepository;
    private final UserRepository userRepository;
    private final ApplicationInfoRepository applicationInfoRepository;

    @Autowired
    public UserAppsController(UserAppsRepository userAppsRepository, UserRepository userRepository, ApplicationInfoRepository applicationInfoRepository) {
        this.userAppsRepository = userAppsRepository;
        this.userRepository = userRepository;
        this.applicationInfoRepository = applicationInfoRepository;
    }

    private boolean isAllowedToAccessThisRoute(int requesterUid) {
        Optional<User> requester = userRepository.findByUserUid(requesterUid);
        return requester.isPresent() && requester.get().getUserRole().equals("admin");
    }

    @GetMapping("/{id}")
    public ResponseEntity<UserApps> getUserAppsById(@PathVariable Integer id) {
        Optional<UserApps> userAppsOptional = userAppsRepository.findById(id);
        return userAppsOptional.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<UserApps> createUserApps(@RequestBody UserApps userApps) {
        UserApps savedUserApps = userAppsRepository.save(userApps);
        return ResponseEntity.status(HttpStatus.CREATED).body(savedUserApps);
    }

    @PutMapping("/{id}")
    public ResponseEntity<UserApps> updateUserApps(@PathVariable Integer id, @RequestBody UserApps userApps) {
        if (!userAppsRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        userApps.setUserAppsUid(id);
        UserApps updatedUserApps = userAppsRepository.save(userApps);
        return ResponseEntity.ok(updatedUserApps);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUserApps(@PathVariable Integer id) {
        if (!userAppsRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        userAppsRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
