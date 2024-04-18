package com.example.CommerceBankTeamProject;

import com.example.CommerceBankTeamProject.util.Globals;
import com.fasterxml.jackson.databind.PropertyNamingStrategies;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.http.converter.json.Jackson2ObjectMapperBuilder;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@SpringBootApplication
public class CommerceBankTeamProjectApplication {

	public static void main(String[] args) {
		SpringApplication.run(CommerceBankTeamProjectApplication.class, args);
	}

	@Bean
	public WebMvcConfigurer corsConfigurer() {
		return new WebMvcConfigurer() {
			@Override
			public void addCorsMappings(CorsRegistry registry) {
				registry.addMapping("/**")
						.allowedMethods("GET", "POST", "PUT", "DELETE")
						.allowedOrigins(Globals.CORS_ORIGINS);
			}
		};
	}

	@Bean
	public Jackson2ObjectMapperBuilder jackson2ObjectMapperBuilder() {
		// to convert our java camelCase names to the front-end snake_case react expects
		Jackson2ObjectMapperBuilder builder = new Jackson2ObjectMapperBuilder();
		builder.propertyNamingStrategy(PropertyNamingStrategies.SnakeCaseStrategy.INSTANCE);
		return builder;
	}
}
