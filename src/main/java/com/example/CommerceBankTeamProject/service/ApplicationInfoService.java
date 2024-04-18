package com.example.CommerceBankTeamProject.service;

import com.example.CommerceBankTeamProject.domain.ApplicationInfo;
import com.example.CommerceBankTeamProject.repository.ApplicationInfoRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.sql.Timestamp;
import java.util.List;
import java.util.NoSuchElementException;

@Service
public class ApplicationInfoService {

    private final ApplicationInfoRepository applicationInfoRepository;

    @Autowired
    public ApplicationInfoService(ApplicationInfoRepository applicationInfoRepository) {
        this.applicationInfoRepository = applicationInfoRepository;
    }

    @Transactional
    public List<ApplicationInfo> getAllApplicationInfos() {
        return applicationInfoRepository.findAll();
    }

    @Transactional
    public ApplicationInfo getApplicationInfoById(Integer id) {
        return applicationInfoRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Application Info not found with id: " + id));
    }

    @Transactional
    public ApplicationInfo addApplicationInfo(ApplicationInfo applicationInfo) {
        applicationInfo.setCreatedAt(new Timestamp(System.currentTimeMillis()));
        applicationInfo.setModifiedAt(new Timestamp(System.currentTimeMillis()));
        return applicationInfoRepository.save(applicationInfo);
    }

    @Transactional
    public ApplicationInfo updateApplicationInfo(Integer id, ApplicationInfo updatedInfo) {
        ApplicationInfo existingInfo = getApplicationInfoById(id);
        existingInfo.setAppInfoDescription(updatedInfo.getAppInfoDescription());
        existingInfo.setModifiedAt(new Timestamp(System.currentTimeMillis()));
        return applicationInfoRepository.save(existingInfo);
    }

    @Transactional
    public void deleteApplicationInfo(Integer id) {
        applicationInfoRepository.deleteById(id);
    }
}
