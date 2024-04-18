package com.example.CommerceBankTeamProject.util;

import com.example.CommerceBankTeamProject.domain.ApplicationInfo;
import com.example.CommerceBankTeamProject.domain.ServerInfo;
import com.example.CommerceBankTeamProject.domain.User;
import com.example.CommerceBankTeamProject.domain.UserApps;
import com.example.CommerceBankTeamProject.repository.ApplicationInfoRepository;
import com.example.CommerceBankTeamProject.repository.ServerInfoRepository;
import com.example.CommerceBankTeamProject.repository.UserAppsRepository;
import com.example.CommerceBankTeamProject.repository.UserRepository;
import org.apache.xmlbeans.impl.tool.CommandLine;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.sql.Timestamp;
import java.time.Instant;
import java.util.*;

/**
 * Automatically inserts rows into the tables on server startup.
 * Needed to create basic user and admin users so you can login.
 */
@Component
public class CommerceDataInitializer implements CommandLineRunner {
	private final UserRepository userRepository;
	private final ApplicationInfoRepository applicationInfoRepository;
	private final UserAppsRepository userAppsRepository;
	private final ServerInfoRepository serverInfoRepository;
	@Autowired
	public CommerceDataInitializer(UserRepository userRepository,
								   ApplicationInfoRepository applicationInfoRepository,
								   UserAppsRepository userAppsRepository,
								   ServerInfoRepository serverInfoRepository) {
		this.userRepository = userRepository;
		this.applicationInfoRepository = applicationInfoRepository;
		this.userAppsRepository = userAppsRepository;
		this.serverInfoRepository = serverInfoRepository;
	}

	@Override
	public void run(String... args) throws Exception {
		System.out.println();
		System.out.println("Default data initialization :)");
		this.createDefaultUsers();
		System.out.printf("Created %d default users %n", this.userRepository.findAll().size());

		this.createDefaultApps();
		System.out.printf("Created %d default apps%n", this.applicationInfoRepository.findAll().size());

		this.createDefaultUserApps();
		System.out.printf("Created %d default userapps%n", this.userAppsRepository.findAll().size());

		// not required
		this.createDefaultServerInfos();
		System.out.printf("Created %d default serverinfos%n", this.serverInfoRepository.findAll().size());
	}

	public void createDefaultServerInfos() {
		User adminUser = this.userRepository.findByUserId("admin").orElse(null);
		User defaultUser = this.userRepository.findByUserId("user").orElse(null);
		User testUser = this.userRepository.findByUserId("barosa").orElse(null);
		List<UserApps> userApps = this.userAppsRepository.findAllByUser(defaultUser);
		userApps.addAll(this.userAppsRepository.findAllByUser(testUser));

		Timestamp date = Timestamp.from(Instant.now());
		for (UserApps userApp : userApps) {
			ServerInfo serverInfo = new ServerInfo(
					userApp.getApplicationInfo(),
					CommerceServerDataGenerator.randomHostname(),
					CommerceServerDataGenerator.randomIpv4(),
					CommerceServerDataGenerator.randomHostname(),
					CommerceServerDataGenerator.randomIpv4(),
					String.valueOf(CommerceServerDataGenerator.randomPort()),
					"active"
			);
			serverInfo.setCreatedBy(adminUser.getUserId());
			serverInfo.setModifiedAt(date);
			serverInfo.setModifiedBy(adminUser.getUserId());
			serverInfoRepository.save(serverInfo);
		}
	}

	public void createDefaultUserApps() {
		List<ApplicationInfo> apps = this.applicationInfoRepository.findAll();
		User regularUser = this.userRepository.findByUserId("user").orElse(null);
		User testUser = this.userRepository.findByUserId("barosa").orElse(null);
		User adminUser = this.userRepository.findByUserId("admin").orElse(null);

		// default user gets assigned first 3 "app codes"
		List<UserApps> regularUserApps = apps.stream()
				.limit(3)
				.map(app -> new UserApps(regularUser, app, adminUser))
				.toList();
		userAppsRepository.saveAll(regularUserApps);

		// second test user gets next 3
		List<UserApps> testUserApps = apps.stream()
				.skip(3)
				.limit(3)
				.map(app -> new UserApps(testUser, app, adminUser))
				.toList();
		userAppsRepository.saveAll(testUserApps);

		// admin gets assigned all apps
		List<UserApps> adminUserApps = apps.stream()
				.map(app -> new UserApps(adminUser, app, adminUser))
				.toList();
		userAppsRepository.saveAll(adminUserApps);
	}

	private void createDefaultApps() {
		User adminUser = this.userRepository.findByUserId("admin").orElse(null);
		assert adminUser != null;
		for (int i = 0; i < Globals.DEFAULT_APP_INFO_CODES.size(); ++i) {
			ApplicationInfo appInfo = new ApplicationInfo(
					Globals.DEFAULT_APP_INFO_CODES.get(i),
					adminUser
			);
			this.applicationInfoRepository.save(appInfo);
		}
	}

	private void createDefaultUsers() {
		User defaultAdmin = new User(1,
				"admin",
				"commercebank",
				"admin");
		User defaultUser = new User(2,
				"user",
				"commercebank",
				"user");
		User testUser = new User(3,
				"barosa",
				"commercebank",
				"user");

		defaultAdmin.setCreatedBy("admin");
		defaultUser.setCreatedBy("admin");
		testUser.setCreatedBy("admin");

		defaultAdmin.setModifiedBy("admin");
		defaultUser.setModifiedBy("admin");
		testUser.setModifiedBy("admin");

		this.userRepository.save(defaultAdmin);
		this.userRepository.save(defaultUser);
		this.userRepository.save(testUser);
	}
}
