package com.example.CommerceBankTeamProject.controller.api.login;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class LoginRequest {
	String userId;
	String userPassword;
}
