package com.nexus.NeuroForge.models;


import jakarta.persistence.*;
import lombok.RequiredArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Entity
public class Team {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String name;

    public Team() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public List<User> getMembers() {
        return members;
    }

    public void setMembers(List<User> members) {
        this.members = members;
    }

    @OneToMany(mappedBy = "team", cascade = {CascadeType.PERSIST, CascadeType.MERGE})
    private List<User> members = new ArrayList<>();

    public void addMember(User user) {
        this.members.add(user);
        user.setTeam(this); // Keeps the relationship in sync
    }

    public void removeMember(User user) {
        this.members.remove(user);
        user.setTeam(null); // Keeps the relationship in sync
    }


}
