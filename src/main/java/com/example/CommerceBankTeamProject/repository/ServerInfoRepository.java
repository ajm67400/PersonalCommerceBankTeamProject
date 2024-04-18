package com.example.CommerceBankTeamProject.repository;

import com.example.CommerceBankTeamProject.domain.ApplicationInfo;
import com.example.CommerceBankTeamProject.domain.ServerInfo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ServerInfoRepository extends JpaRepository<ServerInfo, Integer> {
    List<ServerInfo> findByOrderByCreatedAtAsc();

    // Method to search for ServerInfo entities by source IP address
    List<ServerInfo> findBySourceIpAddress(String sourceIpAddress);

    // Method to search for ServerInfo entities by destination port
    List<ServerInfo> findByDestinationPort(String destinationPort);

    // Method to search for ServerInfo entities by application info UID
    List<ServerInfo> findByApplicationInfo(ApplicationInfo appInfoUid);

    // Method to search for ServerInfo entities by source hostname
    List<ServerInfo> findBySourceHostname(String sourceHostname);
}
