package com.example.CommerceBankTeamProject.service;

import com.example.CommerceBankTeamProject.domain.UserApps;
import com.example.CommerceBankTeamProject.repository.UserAppsRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.sql.Timestamp;
import java.util.List;
import java.util.NoSuchElementException;

@Service
public class UserAppsService {

    @Autowired
    private UserAppsRepository userAppsRepository;

    public List<UserApps> getAllUserApps() {
        return userAppsRepository.findAll();
    }

    public UserApps getUserAppById(Integer id) {
        return userAppsRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("User App not found with id: " + id));
    }

    public UserApps addUserApp(UserApps userApps) {
        userApps.setCreatedAt(new Timestamp(System.currentTimeMillis()));
        userApps.setModifiedAt(new Timestamp(System.currentTimeMillis()));
        return userAppsRepository.save(userApps);
    }

    public UserApps updateUserApp(UserApps userApps) {
        userApps.setModifiedAt(new Timestamp(System.currentTimeMillis()));
        return userAppsRepository.save(userApps);
    }

    public void deleteUserApp(Integer id) {
        userAppsRepository.deleteById(id);
    }
}
