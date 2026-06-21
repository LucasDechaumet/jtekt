package eu.jtekt.tcmeansapi.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

	@Bean
	SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
		return http
			.cors(Customizer.withDefaults())
			.csrf(csrf -> csrf.disable())
			.authorizeHttpRequests(authorize -> authorize
				.requestMatchers("/auth/login", "/actuator/health", "/error").permitAll()
				.anyRequest().authenticated())
			.formLogin(formLogin -> formLogin.disable())
			.logout(logout -> logout
				.logoutUrl("/auth/logout")
				.logoutSuccessHandler((request, response, authentication) -> response.setStatus(204))
				.invalidateHttpSession(true)
				.deleteCookies("JSESSIONID"))
			.sessionManagement(session -> session
				.sessionFixation(sessionFixation -> sessionFixation.migrateSession()))
			.build();
	}

}
