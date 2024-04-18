package com.example.CommerceBankTeamProject.controller;
import com.example.CommerceBankTeamProject.domain.ApplicationInfo;
import com.example.CommerceBankTeamProject.domain.ServerInfo;
import com.example.CommerceBankTeamProject.domain.User;
import com.example.CommerceBankTeamProject.domain.UserApps;
import com.example.CommerceBankTeamProject.repository.ApplicationInfoRepository;
import com.example.CommerceBankTeamProject.repository.ServerInfoRepository;
import com.example.CommerceBankTeamProject.repository.UserAppsRepository;
import com.example.CommerceBankTeamProject.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.sql.Timestamp;
import java.time.Instant;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/server-info")
public class ServerInfoController {
    // CRUD Operations
    private final ServerInfoRepository serverInfoRepository;
    private final UserAppsRepository userAppsRepository;
    private final UserRepository userRepository;
    private final ApplicationInfoRepository applicationInfoRepository;

    @Autowired
    public ServerInfoController(ServerInfoRepository serverInfoRepository,
                                UserAppsRepository userAppsRepository,
                                ApplicationInfoRepository applicationInfoRepository,
                                UserRepository userRepository) {
        this.serverInfoRepository = serverInfoRepository;
        this.userAppsRepository = userAppsRepository;
        this.applicationInfoRepository = applicationInfoRepository;
        this.userRepository = userRepository;
    }

    @GetMapping()
    public ResponseEntity<List<ServerInfo>> getAllServerInfoByUser(@RequestParam int userUid) {
        // This is to get all server infos for apps assigned to a user, as required by the project

        // 1. Find user by id
        Optional<User> maybeUser = userRepository.findByUserUid(userUid);
        if (maybeUser.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(List.of());
        }

        // 2. Get a users apps
        User user = maybeUser.get();
        List<UserApps> usersApps = userAppsRepository.findAllByUser(user);

        // 3. for every UserApp, lookup its ApplicationInfo
        List<ApplicationInfo> apps = usersApps
                .stream()
                .map(ua -> applicationInfoRepository.findByAppInfoUid(ua.getApplicationInfo().getAppInfoUid()))
                .map(ua -> ua.orElse(null))
                .toList();

        // 4. Get all server infos where app info uid is in apps
        List<ServerInfo> serverInfos = apps
                .stream()
                .flatMap(app -> serverInfoRepository.findByApplicationInfo(app).stream())
                .toList();

        return ResponseEntity.ok(serverInfos);
    }

    @GetMapping("/admin")
    public ResponseEntity<List<ServerInfo>> getAllServerInfoAdmin() {
        List<ServerInfo> serverInfos = serverInfoRepository.findAll();
        return ResponseEntity.ok(serverInfos);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ServerInfo> getServerInfoById(@PathVariable Integer id, @RequestParam int userUid) {
        Optional<User> maybeUser = userRepository.findByUserUid(userUid);
        if (maybeUser.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Optional<ServerInfo> serverInfoOptional = serverInfoRepository.findById(id);
        if (serverInfoOptional.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Optional<UserApps> serverInfoUserApp = userAppsRepository.findAllByUser(maybeUser.get())
                .stream()
                .filter(userApp -> userApp.getApplicationInfo().getAppInfoUid() == serverInfoOptional.get().getApplicationInfo().getAppInfoUid())
                .findFirst();
        if (serverInfoUserApp.isEmpty()) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        return ResponseEntity.ok(serverInfoOptional.get());
    }

    @PostMapping
    public ResponseEntity<ServerInfo> createServerInfo(
            @RequestParam int userUid,
            @RequestParam int appUid,
            @RequestBody ServerInfo serverInfo) {
        Optional<User> maybeUser = userRepository.findByUserUid(userUid);
        if (maybeUser.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Optional<ApplicationInfo> maybeAppInfo = applicationInfoRepository.findByAppInfoUid(appUid);
        if (maybeAppInfo.isEmpty()) {
            return ResponseEntity.status(HttpStatus.FAILED_DEPENDENCY).build();
        }

        User user = maybeUser.get();
        ApplicationInfo applicationInfo = maybeAppInfo.get();

        Optional<UserApps> maybeAssignedApp = userAppsRepository.findAllByUser(user)
                .stream()
                .filter(userApp -> userApp.getApplicationInfo().getAppInfoUid().equals(applicationInfo.getAppInfoUid()))
                .findFirst();

        // make sure creating server info for an app user is assigned to
        if (maybeAssignedApp.isEmpty()) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        serverInfo.setApplicationInfo(applicationInfo);
        serverInfo.setCreatedBy(user.getUserId());
        serverInfo.setModifiedBy(user.getUserId());
        ServerInfo savedServerInfo = serverInfoRepository.save(serverInfo);
        return ResponseEntity.status(HttpStatus.CREATED).body(savedServerInfo);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ServerInfo> updateServerInfo(@PathVariable Integer id,
                                                       @RequestParam int userUid,
                                                       @RequestBody ServerInfo serverInfo) {
        Optional<ServerInfo> maybeOriginal = serverInfoRepository.findById(id);
        if (maybeOriginal.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Optional<User> maybeUser = userRepository.findByUserUid(userUid);
        if (maybeUser.isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }

        ServerInfo original = maybeOriginal.get();
        User user = maybeUser.get();
        serverInfo.setModifiedBy(user.getUserId());
        serverInfo.setModifiedAt(Timestamp.from(Instant.now()));
        serverInfo.setApplicationInfo(original.getApplicationInfo());
        serverInfo.setServerInfoUid(id);
        ServerInfo updatedServerInfo = serverInfoRepository.save(serverInfo);
        return ResponseEntity.ok(updatedServerInfo);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteServerInfo(@PathVariable Integer id) {
        if (!serverInfoRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        serverInfoRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
