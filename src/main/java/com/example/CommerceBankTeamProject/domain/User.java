package com.example.CommerceBankTeamProject.domain;


import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.sql.Timestamp;
import java.time.Instant;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Table(name = "users") // Allows the use of a table to be called user
//user is a reserved word in a H2 database
public class User implements Sanitizable {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer userUid;
    private String userId;
    @Column(nullable = false)
    private String userPassword;
    private String userRole;
    @Column(nullable = false, updatable = false)
    private Timestamp createdAt;
    private String createdBy;
    @Column(nullable = false)
    private Timestamp modifiedAt;
    private String modifiedBy;

    public User(Integer userUid, String userId, String userPassword, String userRole) {
        this.userUid = userUid;
        this.userId = userId;
        this.userPassword = userPassword;
        this.userRole = userRole;
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

    @Override
    public void sanitize() {
        // lets not leak her password
        this.setUserPassword(null);
    }
}