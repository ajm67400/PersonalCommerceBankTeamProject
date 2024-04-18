package com.example.CommerceBankTeamProject.util;

import java.util.Random;
import java.util.UUID;

public final class CommerceServerDataGenerator {
	private static final Random ipv4Random = new Random();
	private static final Random portRandom = new Random();
	public static String randomIpv4() {
		return ipv4Random.nextInt(256)
				+ "." + ipv4Random.nextInt(256)
				+ "." + ipv4Random.nextInt(256)
				+ "." + ipv4Random.nextInt(256);
	}
	public static String randomHostname() {
		String domain = ".real-example.com";
		String randomCharacters = UUID.randomUUID().toString()
				.replaceAll("-", "")
				.substring(0, 8);
		return randomCharacters + domain;
	}
	public static int randomPort() {
		return portRandom.nextInt(1000, 25565);
	}
}
