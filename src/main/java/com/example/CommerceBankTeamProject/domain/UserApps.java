package com.example.CommerceBankTeamProject.domain;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.sql.Timestamp;
import java.time.Instant;

@Data
@Entity
@NoArgsConstructor
public class UserApps implements Sanitizable {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer userAppsUid;
    @ManyToOne
    @JoinColumn(name = "user_uid")
    private User user;
    @ManyToOne
    @JoinColumn(name = "app_info_uid")
    private ApplicationInfo applicationInfo;
    private Timestamp createdAt;
    private String createdBy;
    private Timestamp modifiedAt;
    private String modifiedBy;

    public UserApps(User user, ApplicationInfo applicationInfo, User creator) {
       this.user = user;
       this.applicationInfo = applicationInfo;
       this.createdBy = creator.getUserId();
       this.modifiedBy = creator.getUserId();
       setCreatedAt(Timestamp.from(Instant.now()));
       setModifiedAt(Timestamp.from(Instant.now()));
    }

    public void setCreatedAt(java.sql.Timestamp createdAt) {
        this.createdAt = new Timestamp(System.currentTimeMillis());
    }
    public void setModifiedAt(java.sql.Timestamp createdAt) {
        this.modifiedAt = new java.sql.Timestamp(System.currentTimeMillis());
    }

    @Override
    public void sanitize() {
        this.user.setUserPassword(null);
    }
}
