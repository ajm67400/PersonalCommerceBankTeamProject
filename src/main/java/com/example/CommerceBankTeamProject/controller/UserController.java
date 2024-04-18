package com.example.CommerceBankTeamProject.controller;

import com.example.CommerceBankTeamProject.domain.ApplicationInfo;
import com.example.CommerceBankTeamProject.domain.User;
import com.example.CommerceBankTeamProject.domain.UserApps;
import com.example.CommerceBankTeamProject.repository.ApplicationInfoRepository;
import com.example.CommerceBankTeamProject.repository.UserAppsRepository;
import com.example.CommerceBankTeamProject.repository.UserRepository;
import com.example.CommerceBankTeamProject.service.SecurityService;
import com.example.CommerceBankTeamProject.service.UserService;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpCookie;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.sql.Timestamp;
import java.time.Instant;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/users")
public class UserController {
    // CRUD Operations
    private final UserRepository userRepository;
    private final UserAppsRepository userAppsRepository;
    private final ApplicationInfoRepository applicationInfoRepository;
    private final UserService userService;
    private final SecurityService securityService;

    @Autowired
    public UserController(UserRepository userRepository,
                          UserService userService,
                          SecurityService securityService,
                          UserAppsRepository userAppsRepository,
                          ApplicationInfoRepository applicationInfoRepository) {
        this.userRepository = userRepository;
        this.userService = userService;
        this.securityService = securityService;
        this.userAppsRepository = userAppsRepository;
        this.applicationInfoRepository = applicationInfoRepository;
    }

    private boolean isAllowedToAccessThisRoute(int requesterUid) {
        Optional<User> requester = userRepository.findByUserUid(requesterUid);
		return requester.isPresent() && requester.get().getUserRole().equals("admin");
	}

    @GetMapping
    public ResponseEntity<List<User>> getAllUsers(@RequestParam int requesterUid) {
        if (!isAllowedToAccessThisRoute(requesterUid)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        List<User> userList = userRepository.findAll();
        return ResponseEntity.ok(userList);
    }

    @GetMapping("/{id}")
    public ResponseEntity<User> getUserById(@PathVariable Integer id, @RequestParam int requesterUid) {
        if (!isAllowedToAccessThisRoute(requesterUid)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        Optional<User> userOptional = userRepository.findById(id);
        if (userOptional.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        User user = userOptional.get();
        return ResponseEntity.ok(user);
    }

    @PostMapping
    public ResponseEntity<User> createUser(@RequestBody User user, @RequestParam int requesterUid) {
        Optional<User> maybeAdmin = userRepository.findByUserUid(requesterUid);
        if (maybeAdmin.isEmpty() || !maybeAdmin.get().getUserRole().equals("admin")) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        // check if username taken
        Optional<User> maybeAlreadyUser = userRepository.findByUserId(user.getUserId());
        if (maybeAlreadyUser.isPresent()) {
            return ResponseEntity.status(HttpStatus.FOUND).build();
        }

        User admin = maybeAdmin.get();
        user.setCreatedBy(admin.getUserId());
        user.setModifiedBy(admin.getUserId());
        user.setCreatedAt(Timestamp.from(Instant.now()));
        user.setModifiedAt(Timestamp.from(Instant.now()));

        User savedUser = userRepository.save(user);
        if (savedUser.getUserRole().equals("admin")) {
            // admins get access to all applications
            List<ApplicationInfo> allApps = applicationInfoRepository.findAll();
            List<UserApps> adminUserApps = allApps.stream()
                    .map(app -> new UserApps(savedUser, app, savedUser))
                    .toList();
            userAppsRepository.saveAll(adminUserApps);
        }

        return ResponseEntity.status(HttpStatus.CREATED).body(savedUser);
    }

    @PutMapping("/{id}")
    public ResponseEntity<User> updateUser(@PathVariable Integer id, @RequestBody User user, @RequestParam int requesterUid) {
        Optional<User> maybeExistingUser = userRepository.findById(id);
        if (maybeExistingUser.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        // check if username is changed to an already existing user
        Optional<User> maybeAlreadyUsernameUser = userRepository.findByUserId(user.getUserId());
        if (maybeAlreadyUsernameUser.isPresent() && !maybeAlreadyUsernameUser.get().getUserUid().equals(id)) {
           return ResponseEntity.status(HttpStatus.FOUND).build();
        }

        Optional<User> maybeAdmin = userRepository.findByUserUid(requesterUid);
        if (maybeAdmin.isEmpty() || !maybeAdmin.get().getUserRole().equals("admin")) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        User admin = maybeAdmin.get();
        User existingUser = maybeExistingUser.get();
        user.setUserUid(id);
        user.setCreatedAt(existingUser.getCreatedAt());
        user.setCreatedBy(existingUser.getCreatedBy());
        user.setModifiedAt(Timestamp.from(Instant.now()));
        user.setModifiedBy(admin.getUserId());
        user.setUserPassword(existingUser.getUserPassword());

        User updatedUser = userRepository.save(user);
        return ResponseEntity.ok(updatedUser);
    }

    @Transactional
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable Integer id, @RequestParam int requesterUid) {
        if (!isAllowedToAccessThisRoute(requesterUid)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        Optional<User> maybeUser = userRepository.findByUserUid(id);
        if (maybeUser.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }

        User user = maybeUser.get();
        List<UserApps> usersAssignedApps = userAppsRepository.findAllByUser(user);
        if (!usersAssignedApps.isEmpty()) {
            userAppsRepository.deleteAllByUser(user);
        }
        userRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
    @GetMapping("/{userUid}/apps")
    public ResponseEntity<List<UserApps>> getAllUserAppsFromUser(@PathVariable int userUid, @RequestParam int requesterUid) {
        Optional<User> maybeUser = userRepository.findByUserUid(userUid);
        if (maybeUser.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }

        List<UserApps> userAppsList = userAppsRepository.findAllByUser(maybeUser.get());
        return ResponseEntity.ok(userAppsList);
    }

    private ResponseEntity<UserApps> getUserAppsFromUids(int userUid, int appUid, int requesterUid) {
        if (!isAllowedToAccessThisRoute(requesterUid)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        Optional<User> maybeUser = userRepository.findByUserUid(userUid);
        if (maybeUser.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }

        Optional<ApplicationInfo> maybeAppInfo = applicationInfoRepository.findByAppInfoUid(appUid);
        if (maybeAppInfo.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }

        Optional<UserApps> maybeUserApp = userAppsRepository.findByApplicationInfoAndUser(maybeAppInfo.get(), maybeUser.get());
        if (maybeUserApp.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        UserApps userApp = maybeUserApp.get();
        return ResponseEntity.ok(userApp);
    }

    @DeleteMapping("{userUid}/apps/{appUid}")
    public ResponseEntity<UserApps> deleteUserAppFromUser(@PathVariable int userUid,
                                                          @PathVariable int appUid,
                                                          @RequestParam int requesterUid) {
        ResponseEntity<UserApps> userAppResponse = getUserAppsFromUids(userUid, appUid, requesterUid);
        if (userAppResponse.getStatusCode() != HttpStatus.OK) {
            return userAppResponse;
        }

        userAppsRepository.deleteById(userAppResponse.getBody().getUserAppsUid());
        return ResponseEntity.noContent().build();
    }
    @PutMapping("/{userUid}/apps/{appUid}")
    public ResponseEntity<UserApps> updateUserAppFromUser(@RequestBody UserApps newUserApp,
                                                        @PathVariable int userUid,
                                                        @PathVariable int appUid,
                                                        @RequestParam int requesterUid) {
        ResponseEntity<UserApps> userAppResponse = getUserAppsFromUids(userUid, appUid, requesterUid);
        if (userAppResponse.getStatusCode() != HttpStatus.OK) {
            return userAppResponse;
        }

        newUserApp.setUserAppsUid(userAppResponse.getBody().getUserAppsUid());
        userAppsRepository.save(newUserApp);
        return ResponseEntity.ok(newUserApp);
    }
    @GetMapping("/{userUid}/apps/{appUid}")
    public ResponseEntity<UserApps> getUserAppFromUser(@PathVariable int userUid,
                                                                 @PathVariable int appUid,
                                                                 @RequestParam int requesterUid) {
		return getUserAppsFromUids(userUid, appUid, requesterUid);
	}

    @PostMapping("/{userUid}/apps")
    public ResponseEntity<UserApps> createUserAppFromUser(@PathVariable int userUid,
                                                          @RequestParam int appUid,
                                                          @RequestParam int requesterUid) {
        if (!isAllowedToAccessThisRoute(requesterUid)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        Optional<User> maybeUser = userRepository.findByUserUid(userUid);
        if (maybeUser.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        User user = maybeUser.get();

        Optional<ApplicationInfo> maybeApp = applicationInfoRepository.findByAppInfoUid(appUid);
        if (maybeApp.isEmpty()) {
            return ResponseEntity.status(HttpStatus.FAILED_DEPENDENCY).build();
        }
        ApplicationInfo app = maybeApp.get();

        User creator = userRepository.findByUserUid(requesterUid).orElse(null);
        assert creator != null;
        UserApps userApp = new UserApps(user, app, creator);
        userAppsRepository.save(userApp);

        return ResponseEntity.status(HttpStatus.CREATED).body(userApp);
    }
}
