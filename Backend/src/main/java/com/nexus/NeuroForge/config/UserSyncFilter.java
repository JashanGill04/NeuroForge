package com.nexus.NeuroForge.config;

import com.nexus.NeuroForge.models.interfaces.Role;
import com.nexus.NeuroForge.models.User;
import com.nexus.NeuroForge.repositories.UserRepository;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

@Component
public class UserSyncFilter extends OncePerRequestFilter {

    private final UserRepository userRepository;

    public UserSyncFilter(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {

        // Wrapping the ENTIRE sync attempt — a failure here should never
        // stop the actual request the user is trying to make. Before this
        // fix, any exception thrown below (e.g. a raced duplicate insert)
        // propagated straight past the filter chain as a raw 500, since
        // filters run before Spring's @RestControllerAdvice ever gets a
        // chance to handle anything.
        try {
            syncUser();
        } catch (Exception e) {
            System.err.println("UserSyncFilter: sync failed, continuing request anyway — " + e.getMessage());
        }

        filterChain.doFilter(request, response);
    }

    private void syncUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (!(authentication instanceof JwtAuthenticationToken jwtAuth)) {
            return;
        }

        var jwt = jwtAuth.getToken();

        String keycloakId = jwt.getSubject();
        String username = jwt.getClaimAsString("preferred_username");
        String email = jwt.getClaimAsString("email");

        Object roleObj = jwt.getClaim("app_role");
        String roleStr = roleObj instanceof List ? ((List<?>) roleObj).get(0).toString() : String.valueOf(roleObj);

        User user = userRepository.findByKeycloakId(keycloakId)
                .orElseGet(() -> {
                    User newUser = new User();
                    newUser.setKeycloakId(keycloakId);
                    return newUser;
                });

        user.setUsername(username);
        user.setEmail(email);

        try {
            if (roleStr != null && !roleStr.equals("null")) {
                user.setRole(Role.valueOf(roleStr.toUpperCase()));
            }
        } catch (IllegalArgumentException e) {
            System.err.println("Warning: Unknown role received from Keycloak: " + roleStr);
        }

        try {
            userRepository.save(user);
        } catch (DataIntegrityViolationException e) {
            // Another request racing this exact same first-login moment
            // already inserted this user a split second earlier. That's
            // fine — the row exists now either way. This is the specific
            // case that was previously surfacing as a raw server error.
            System.out.println("User sync raced with a concurrent request for "
                + username + " — row already created, ignoring");
        }
    }
}