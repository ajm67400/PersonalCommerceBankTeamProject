package com.example.CommerceBankTeamProject.controller;
import com.example.CommerceBankTeamProject.domain.ApplicationInfo;
import com.example.CommerceBankTeamProject.domain.ServerInfo;
import com.example.CommerceBankTeamProject.domain.User;
import com.example.CommerceBankTeamProject.domain.UserApps;
import com.example.CommerceBankTeamProject.repository.ApplicationInfoRepository;
import com.example.CommerceBankTeamProject.repository.ServerInfoRepository;
import com.example.CommerceBankTeamProject.repository.UserAppsRepository;
import com.example.CommerceBankTeamProject.repository.UserRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/application-info")
public class ApplicationInfoController {
// CRUD Operations
    private final ApplicationInfoRepository applicationInfoRepository;
    private final UserAppsRepository userAppsRepository;
    private final ServerInfoRepository serverInfoRepository;
    private final UserRepository userRepository;

    @Autowired
    public ApplicationInfoController(ApplicationInfoRepository applicationInfoRepository,
                                     UserRepository userRepository,
                                     UserAppsRepository userAppsRepository,
                                     ServerInfoRepository serverInfoRepository) {
       this.applicationInfoRepository = applicationInfoRepository;
       this.userRepository = userRepository;
       this.userAppsRepository = userAppsRepository;
       this.serverInfoRepository = serverInfoRepository;
    }

    private boolean isAllowedToAccessThisRoute(int requesterUid) {
        Optional<User> requester = userRepository.findByUserUid(requesterUid);
        return requester.isPresent() && requester.get().getUserRole().equals("admin");
    }

    @GetMapping
    public ResponseEntity<List<ApplicationInfo>> getAllApplicationInfo() {
        List<ApplicationInfo> applicationInfoList = applicationInfoRepository.findAll();
        return ResponseEntity.ok(applicationInfoList);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApplicationInfo> getApplicationInfoById(@PathVariable Integer id) {
        Optional<ApplicationInfo> applicationInfoOptional = applicationInfoRepository.findById(id);
        return applicationInfoOptional.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<ApplicationInfo> createApplicationInfo(@RequestBody ApplicationInfo applicationInfo) {
        Optional<ApplicationInfo> existingAppWithName = applicationInfoRepository.findByAppInfoDescription(applicationInfo.getAppInfoDescription());
        if (existingAppWithName.isPresent()) {
            return ResponseEntity.status(HttpStatus.FOUND).build();
        }
        ApplicationInfo savedApplicationInfo = applicationInfoRepository.save(applicationInfo);
        return ResponseEntity.status(HttpStatus.CREATED).body(savedApplicationInfo);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApplicationInfo> updateApplicationInfo(@PathVariable Integer id,
                                                                 @RequestParam int requesterUid,
                                                                 @RequestBody ApplicationInfo applicationInfo) {
        if (!isAllowedToAccessThisRoute(requesterUid)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        if (!applicationInfoRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }

        Optional<ApplicationInfo> existingAppInfoWithNewName = applicationInfoRepository.findByAppInfoDescription(applicationInfo.getAppInfoDescription());
        if (existingAppInfoWithNewName.isPresent()) {
           return ResponseEntity.status(HttpStatus.FOUND).build();
        }

        applicationInfo.setAppInfoUid(id);
        ApplicationInfo updatedApplicationInfo = applicationInfoRepository.save(applicationInfo);
        return ResponseEntity.ok(updatedApplicationInfo);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteApplicationInfo(@PathVariable Integer id) {
        Optional<ApplicationInfo> maybeAppInfo = applicationInfoRepository.findById(id);
        if (maybeAppInfo.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        ApplicationInfo appInfo = maybeAppInfo.get();

        // to avoid foreign key integrity violation we must delete all user apps that have this applicationinfo
        List<UserApps> userAppsWithThisApplication = userAppsRepository.findAllByApplicationInfo(appInfo);
        userAppsWithThisApplication.forEach(userApp -> userAppsRepository.deleteById(userApp.getUserAppsUid()));
        // and also all serverinfo assigned to this app
        List<ServerInfo> serverInfosWithThisApplication = serverInfoRepository.findByApplicationInfo(appInfo);
        serverInfosWithThisApplication.forEach(server -> serverInfoRepository.deleteById(server.getServerInfoUid()));

        applicationInfoRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}