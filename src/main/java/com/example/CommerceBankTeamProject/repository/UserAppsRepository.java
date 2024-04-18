package com.example.CommerceBankTeamProject.repository;

import com.example.CommerceBankTeamProject.domain.ApplicationInfo;
import com.example.CommerceBankTeamProject.domain.User;
import com.example.CommerceBankTeamProject.domain.UserApps;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserAppsRepository extends JpaRepository<UserApps, Integer> {
	List<UserApps> findAllByUser(User user);
	Optional<UserApps> findByApplicationInfoAndUser(ApplicationInfo applicationInfo, User user);
	List<UserApps> findAllByApplicationInfo(ApplicationInfo applicationInfo);
	void deleteAllByUser(User user);
}
