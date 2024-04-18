package com.example.CommerceBankTeamProject.repository;

import com.example.CommerceBankTeamProject.domain.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Integer> {
    Optional<User> findByUserIdAndUserPassword(String userId, String password);
    Optional<User> findByUserId(String userId);
    Optional<User> findByUserUid(int userUid);
}
