package com.example.CommerceBankTeamProject.util;

import com.example.CommerceBankTeamProject.domain.Sanitizable;
import org.springframework.core.MethodParameter;
import org.springframework.http.MediaType;
import org.springframework.http.converter.HttpMessageConverter;
import org.springframework.http.server.ServerHttpRequest;
import org.springframework.http.server.ServerHttpResponse;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.servlet.mvc.method.annotation.ResponseBodyAdvice;

import java.util.List;

// Erases any database row data like user passwords before sending out any response entity
@ControllerAdvice
public class CommerceSensitiveDataEraserConfig implements ResponseBodyAdvice<Object> {
	@Override
	public boolean supports(MethodParameter returnType, Class<? extends HttpMessageConverter<?>> converterType) {
		return true;
	}

	@Override
	public Object beforeBodyWrite(Object body, MethodParameter returnType, MediaType selectedContentType,
								  Class<? extends HttpMessageConverter<?>> selectedConverterType, ServerHttpRequest request,
								  ServerHttpResponse response) {
		if (body instanceof List<?> jsonArray) {
			// body with many entities .All() api call
			jsonArray.forEach(obj -> {
				if (obj instanceof Sanitizable sanitized) {
					sanitized.sanitize();
				}
			});
		} else {
			// body with single entity .Single() api call
			if (body instanceof Sanitizable sanitized) {
				sanitized.sanitize();
			}
		}

		return body;
	}
}
