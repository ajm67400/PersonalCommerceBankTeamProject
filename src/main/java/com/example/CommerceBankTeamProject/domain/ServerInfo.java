package com.example.CommerceBankTeamProject.domain;

import com.example.CommerceBankTeamProject.repository.ApplicationInfoRepository;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;

import java.sql.Timestamp;
import java.time.Instant;

@Data
@Entity
@NoArgsConstructor
public class ServerInfo {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer serverInfoUid;
    @ManyToOne
    @JoinColumn(name = "app_info_uid", nullable = false)
    private ApplicationInfo applicationInfo;
    private String sourceHostname;
    private String sourceIpAddress;
    private String destinationHostname;
    private String destinationIpAddress;
    private String destinationPort;
    private String ipStatus;
    @Column(nullable = false, updatable = false)
    private Timestamp createdAt;
    private String createdBy;
    @Column(nullable = false)
    private Timestamp modifiedAt;
    private String modifiedBy;

    public ServerInfo(ApplicationInfo applicationInfo,
                      String sourceHostname,
                      String sourceIpAddress,
                      String destinationHostname,
                      String destinationIpAddress,
                      String destinationPort,
                      String ipStatus) {
        this.applicationInfo = applicationInfo;
        this.sourceHostname = sourceHostname;
        this.sourceIpAddress = sourceIpAddress;
        this.destinationHostname = destinationHostname;
        this.destinationIpAddress = destinationIpAddress;
        this.destinationPort = destinationPort;
        this.ipStatus = ipStatus;
    }

    @PrePersist
    public void creationDate() {
        // sets creation date at the time obj is created in db
        if (this.createdAt == null) {
            this.createdAt = Timestamp.from(Instant.now());
        }
        if (this.modifiedAt == null) {
            this.modifiedAt = Timestamp.from(Instant.now());
        }
    }

    public void setCreatedAt(java.sql.Timestamp createdAt) {
        this.createdAt = new java.sql.Timestamp(System.currentTimeMillis());
    }
    public void setModifiedAt(java.sql.Timestamp createdAt) {
        this.modifiedAt = new java.sql.Timestamp(System.currentTimeMillis());
    }
}
