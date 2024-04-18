package com.example.CommerceBankTeamProject.controller.api.login;

import com.example.CommerceBankTeamProject.domain.User;
import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class LoginResponse {
	private String error;
	// this json response is formatted as snake_case in order to work with front-end well
	private int user_uid;
	private String user_id;
	private String user_role;
	public LoginResponse(User user) {
		this.user_uid = user.getUserUid();
		this.user_id = user.getUserId();
		this.user_role = user.getUserRole();
	}
	public LoginResponse(String error) {
		this.error = error;
	}
}
