package com.contactapp.backend.Security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Collections;

public class JwtAuthFilter extends OncePerRequestFilter {


    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {

        String path = request.getRequestURI();

        boolean skip =
                path.equals("/auth/login") ||
                        path.equals("/auth/register") ||
                        path.startsWith("/swagger-ui") ||
                        path.startsWith("/v3/api-docs") ||
                        "OPTIONS".equalsIgnoreCase(request.getMethod());

        System.out.println("JWT shouldNotFilter ");
        System.out.println("Request URI: " + path);
        System.out.println("Skip JWT Filter: " + skip);

        return skip;
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {


        String authHeader = request.getHeader("Authorization");
        System.out.println("Authorization Header: " + authHeader);

        if (authHeader != null && authHeader.startsWith("Bearer ")) {

            String token = authHeader.substring(7);
       

            try {
                Long userId = JwtUtil.extractUserId(token);
                System.out.println("Token valid, extracted userId: " + userId);

                UsernamePasswordAuthenticationToken authentication =
                        new UsernamePasswordAuthenticationToken(
                                userId,
                                null,
                                Collections.emptyList()
                        );

                SecurityContextHolder
                        .getContext()
                        .setAuthentication(authentication);

                System.out.println(" Authentication set in SecurityContext");
                System.out.println(
                        "Authentication principal: " +
                                SecurityContextHolder.getContext()
                                        .getAuthentication()
                                        .getPrincipal()
                );

            } catch (Exception e) {
                System.out.println(" Invalid JWT Token");
                System.out.println("Exception: " + e.getMessage());

                SecurityContextHolder.clearContext();
            }
        } else {
            System.out.println("Authorization header missing or invalid");
        }

        filterChain.doFilter(request, response);
    }
}
