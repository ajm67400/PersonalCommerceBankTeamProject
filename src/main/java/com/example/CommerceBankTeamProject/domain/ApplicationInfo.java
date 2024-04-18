package com.example.CommerceBankTeamProject.domain;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.sql.Timestamp;
import java.time.Instant;
import java.util.List;


@Data
@Entity
@NoArgsConstructor
@AllArgsConstructor
public class ApplicationInfo {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer appInfoUid;
    private String appInfoDescription;
    private Timestamp createdAt;
    private String createdBy;
    private Timestamp modifiedAt;
    private String modifiedBy;

    public ApplicationInfo(String appInfoDescription, User creator) {
        this.appInfoDescription = appInfoDescription;
        this.modifiedBy = creator.getUserId();
        this.createdBy = creator.getUserId();
        setCreatedAt(Timestamp.from(Instant.now()));
        setModifiedAt(Timestamp.from(Instant.now()));
    }

    public void setCreatedAt(Timestamp createdAt) {
        this.createdAt = new Timestamp(System.currentTimeMillis());
    }
    public void setModifiedAt(Timestamp createdAt) {
        this.modifiedAt = new Timestamp(System.currentTimeMillis());
    }
}
