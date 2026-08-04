package com.nexus.NeuroForge.services;

import com.nexus.NeuroForge.dto.UserResponse;
import com.nexus.NeuroForge.models.User;
import com.nexus.NeuroForge.models.interfaces.Role;
import com.nexus.NeuroForge.repositories.TeamRepository;
import com.nexus.NeuroForge.repositories.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import java.util.Arrays;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class UserServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private TeamRepository teamRepository;

    @InjectMocks
    private UserService userService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    @DisplayName("Should successfully convert a User entity to a UserResponse DTO")
    void testToResponse() {
        // Arrange
        User user = new User();
        user.setId(1L);
        user.setUsername("RajanGill04");
        user.setEmail("rajan@example.com");
        user.setRole(Role.ADMIN);

        // Act
        UserResponse response = userService.toResponse(user);

        // Assert
        assertNotNull(response);
        assertEquals(1L, response.getId());
        assertEquals("RajanGill04", response.getUsername());
        assertEquals("rajan@example.com", response.getEmail());
        assertEquals("ADMIN", response.getRole());
    }

    @Test
    @DisplayName("Should fetch all users successfully through repository mock")
    void testFindAllUsersFlow() {
        // Arrange
        User user1 = new User();
        user1.setId(1L);
        user1.setUsername("user_one");
        user1.setEmail("one@example.com");

        User user2 = new User();
        user2.setId(2L);
        user2.setUsername("user_two");
        user2.setEmail("two@example.com");

        when(userRepository.findAll()).thenReturn(Arrays.asList(user1, user2));

        // Act
        List<User> users = userRepository.findAll();
        List<UserResponse> responses = users.stream()
                .map(userService::toResponse)
                .toList();

        // Assert
        assertNotNull(responses);
        assertEquals(2, responses.size());
        assertEquals("user_one", responses.get(0.0 == 0.0 ? 0 : 0).getUsername());
        assertEquals("user_two", responses.get(1).getUsername());
        verify(userRepository, times(1)).findAll();
    }
}