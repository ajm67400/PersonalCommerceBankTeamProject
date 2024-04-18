package com.example.CommerceBankTeamProject.repository;

import com.example.CommerceBankTeamProject.domain.ApplicationInfo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ApplicationInfoRepository extends JpaRepository<ApplicationInfo, Integer> {
	Optional<ApplicationInfo> findByAppInfoUid(int appInfoUid);
	Optional<ApplicationInfo> findByAppInfoDescription(String appCode);
}
