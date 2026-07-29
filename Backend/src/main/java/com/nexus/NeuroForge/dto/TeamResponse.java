package com.nexus.NeuroForge.dto;

import java.util.List;

public class TeamResponse {
    private Long id;
    private String name;
    private int memberCount;
    private List<String> memberUsernames;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public int getMemberCount() { return memberCount; }
    public void setMemberCount(int memberCount) { this.memberCount = memberCount; }

    public List<String> getMemberUsernames() { return memberUsernames; }
    public void setMemberUsernames(List<String> memberUsernames) { this.memberUsernames = memberUsernames; }
}