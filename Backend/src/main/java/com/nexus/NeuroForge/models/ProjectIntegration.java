package com.nexus.NeuroForge.models;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;

@Entity
@Table(name = "project_integrations")
public class ProjectIntegration {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id", unique = true, nullable = false)
    @JsonIgnore
    private Project project;

    private String githubOwner;
    private String githubRepo;
    private String githubBranch = "main";
    private String workflowFile = "ci-cd.yml";

    // Encrypted at rest — never serialized, never returned raw via API.
    @Column(name = "github_token_encrypted", columnDefinition = "TEXT")
    @JsonIgnore
    private String githubTokenEncrypted;

    // Given to the user to paste into their repo's Actions secrets.
    // Used to verify inbound webhook payloads (see WebhookSignatureValidator).
    @Column(name = "webhook_secret")
    private String webhookSecret;

    public ProjectIntegration() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Project getProject() { return project; }
    public void setProject(Project project) { this.project = project; }
    public String getGithubOwner() { return githubOwner; }
    public void setGithubOwner(String githubOwner) { this.githubOwner = githubOwner; }
    public String getGithubRepo() { return githubRepo; }
    public void setGithubRepo(String githubRepo) { this.githubRepo = githubRepo; }
    public String getGithubBranch() { return githubBranch; }
    public void setGithubBranch(String githubBranch) { this.githubBranch = githubBranch; }
    public String getWorkflowFile() { return workflowFile; }
    public void setWorkflowFile(String workflowFile) { this.workflowFile = workflowFile; }
    public String getGithubTokenEncrypted() { return githubTokenEncrypted; }
    public void setGithubTokenEncrypted(String githubTokenEncrypted) { this.githubTokenEncrypted = githubTokenEncrypted; }
    public String getWebhookSecret() { return webhookSecret; }
    public void setWebhookSecret(String webhookSecret) { this.webhookSecret = webhookSecret; }
}