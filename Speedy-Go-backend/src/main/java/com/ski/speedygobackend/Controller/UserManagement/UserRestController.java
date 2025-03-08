package com.ski.speedygobackend.Controller.UserManagement;

import com.ski.speedygobackend.Entity.UserManagement.User;
import com.ski.speedygobackend.Service.UserManagement.UserServicesImpl;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("api/user")
public class UserRestController {
    private final UserServicesImpl userService;

    public UserRestController(UserServicesImpl userService) {
        this.userService = userService;
    }

    @GetMapping
    public List<User> getAllUsers() {

        return userService.getAllUsers();
    }

    @GetMapping("/getUser/{id}")
    public User getUser(@PathVariable Long id) {
        return userService.getUserById(id);
    }

    @PostMapping("/add")
    public User createUser(@RequestBody User user) {
        return userService.saveUser(user);
    }

    @PutMapping("/updateUser/{id}")
    public User updateUser(@PathVariable Long id, @RequestBody User user) {
        return userService.saveUser(user);
    }

    @DeleteMapping("/deleteUser/{id}")
    public void deleteUser(@PathVariable Long id) {
        userService.deleteUser(id);
    }

    @GetMapping("/{id}/delivery-recruitment-completed")
    public ResponseEntity<Boolean> isDeliveryRecruitmentCompleted(@PathVariable Long id) {
        // Get the user by ID
        User user = userService.getUserById(id);

        // Check if the user exists
        if (user == null) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND); // User not found
        }

        // Check if the delivery recruitment is completed for the user
        boolean isCompleted = userService.isDeliveryRecruitmentCompleted(user);

        // Return the result
        return new ResponseEntity<>(isCompleted, HttpStatus.OK);
    }
}