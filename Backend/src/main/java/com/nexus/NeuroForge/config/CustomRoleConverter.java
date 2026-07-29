package com.nexus.NeuroForge.config;

import org.springframework.core.convert.converter.Converter;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.Collection;
import java.util.List;

@Component
public class CustomRoleConverter implements Converter<Jwt, Collection<GrantedAuthority>> {

    @Override
    public Collection<GrantedAuthority> convert(Jwt jwt) {
        Collection<GrantedAuthority> authorities = new ArrayList<>();

        // Extract the custom attribute we mapped in Keycloak
        Object appRoleClaim = jwt.getClaim("app_role");

        if (appRoleClaim instanceof String role) {
            authorities.add(new SimpleGrantedAuthority("ROLE_" + role.toUpperCase()));
        } else if (appRoleClaim instanceof List<?> roles) {
            for (Object role : roles) {
                authorities.add(new SimpleGrantedAuthority("ROLE_" + role.toString().toUpperCase()));
            }
        }

        return authorities;
    }
}