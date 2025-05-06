package com.ski.speedygobackend.Entity;

import com.ski.speedygobackend.Entity.PointsRelaisManagment.PointsRelais;
import com.ski.speedygobackend.Entity.UserManagement.User;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;


@Entity
@Getter
@Setter
public class ComfirmationTransfert {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private LocalDateTime dateConfirmation;





}
