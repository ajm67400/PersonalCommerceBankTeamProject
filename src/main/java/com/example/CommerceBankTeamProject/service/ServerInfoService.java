package com.example.CommerceBankTeamProject.service;

import com.example.CommerceBankTeamProject.domain.ApplicationInfo;
import com.example.CommerceBankTeamProject.domain.ServerInfo;
import com.example.CommerceBankTeamProject.util.ExcelExporter;
import com.example.CommerceBankTeamProject.repository.ServerInfoRepository;
import jakarta.persistence.EntityManager;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.sql.Timestamp;
import javax.persistence.TypedQuery;
import java.util.List;
import java.util.NoSuchElementException;

@Service
public class ServerInfoService {

    private ServerInfoRepository serverInfoRepository;

    @Autowired
    private EntityManager entityManager;

    @Autowired
    public ServerInfoService(EntityManager entityManager) {
        this.entityManager = entityManager;
    }

    public List<ServerInfo> getAllServerInfos() {
        return serverInfoRepository.findAll();
    }

    public ServerInfo getServerInfoById(Integer id) {
        return serverInfoRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Server Info not found with id: " + id));
    }

    public ServerInfo addServerInfo(ServerInfo serverInfo) {
        serverInfo.setCreatedAt(new Timestamp(System.currentTimeMillis()));
        serverInfo.setModifiedAt(new Timestamp(System.currentTimeMillis()));
        return serverInfoRepository.save(serverInfo);
    }

    public ServerInfo updateServerInfo(ServerInfo serverInfo) {
        serverInfo.setModifiedAt(new Timestamp(System.currentTimeMillis()));
        return serverInfoRepository.save(serverInfo);
    }

    public void deleteServerInfo(Integer id) {
        serverInfoRepository.deleteById(id);
    }

    public List<ServerInfo> sortByCreatedAt() {
        return serverInfoRepository.findByOrderByCreatedAtAsc();
    }

    // Method to search for ServerInfo entities by source IP address
    public List<ServerInfo> searchBySourceIpAddress(String sourceIpAddress) {
        return serverInfoRepository.findBySourceIpAddress(sourceIpAddress);
    }

    // Method to search for ServerInfo entities by destination port
    public List<ServerInfo> searchByDestinationPort(String destinationPort) {
        return serverInfoRepository.findByDestinationPort(destinationPort);
    }

    // Method to search for ServerInfo entities by application info UID
    public List<ServerInfo> searchByAppInfoUid(ApplicationInfo appInfoUid) {
        return serverInfoRepository.findByApplicationInfo(appInfoUid);
    }

    // Method to search for ServerInfo entities by source hostname
    public List<ServerInfo> searchBySourceHostname(String sourceHostname) {
        return serverInfoRepository.findBySourceHostname(sourceHostname);
    }

    public void exportServerInfoToExcel(String filePath) {
        // Query to fetch ServerInfo objects
        TypedQuery<ServerInfo> query = (TypedQuery<ServerInfo>) entityManager.createQuery("SELECT s FROM ServerInfo s", ServerInfo.class);
        List<ServerInfo> serverInfos = query.getResultList();

        try {
            ExcelExporter.exportToExcel(serverInfos, filePath);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

}
