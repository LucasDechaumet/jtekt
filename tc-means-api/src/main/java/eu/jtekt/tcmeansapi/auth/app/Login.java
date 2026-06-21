package eu.jtekt.tcmeansapi.auth.app;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.context.HttpSessionSecurityContextRepository;
import org.springframework.stereotype.Service;
import eu.jtekt.tcmeansapi.auth.api.request.LoginRequest;

@Service
@RequiredArgsConstructor
public class Login {

	private final AuthenticationManager authenticationManager;
	private final HttpSessionSecurityContextRepository securityContextRepository = new HttpSessionSecurityContextRepository();

	public void handle(LoginRequest request, HttpServletRequest httpRequest, HttpServletResponse httpResponse) {
		
		Authentication authentication = authenticationManager.authenticate(
			UsernamePasswordAuthenticationToken.unauthenticated(request.getUsername(), request.getPassword())
		);

		SecurityContext context = SecurityContextHolder.createEmptyContext();
		context.setAuthentication(authentication);
		SecurityContextHolder.setContext(context);
		securityContextRepository.saveContext(context, httpRequest, httpResponse);
	}

}
