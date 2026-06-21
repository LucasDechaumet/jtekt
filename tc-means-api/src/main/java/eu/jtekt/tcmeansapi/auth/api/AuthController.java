package eu.jtekt.tcmeansapi.auth.api;

import eu.jtekt.tcmeansapi.auth.api.request.LoginRequest;
import eu.jtekt.tcmeansapi.auth.api.response.MeResponse;
import eu.jtekt.tcmeansapi.auth.app.Login;
import eu.jtekt.tcmeansapi.auth.app.Me;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

	private final Login login;
	private final Me me;

	@PostMapping("/login")
	public void login(
		@RequestBody LoginRequest request, HttpServletRequest httpRequest, HttpServletResponse httpResponse) {
		login.handle(request, httpRequest, httpResponse);
	}

	@GetMapping("/me")
	public MeResponse me(Authentication authentication) {
		return me.handle(authentication);
	}
}
