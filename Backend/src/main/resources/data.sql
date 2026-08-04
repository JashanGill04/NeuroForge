-- 1. BASE DEPENDENCIES (Parents must exist before children)
INSERT INTO team (id, name) VALUES (1, 'NeuroForge Core');

INSERT INTO users (id, username, email, keycloak_id, role, active, team_id) VALUES
(1, 'RajanGill04', 'rajan@example.com', 'kc-admin-1', 'ADMIN', true, 1),
(2, 'dev_user', 'dev@example.com', 'kc-dev-2', 'DEVELOPER', true, 1),
(3, 'tester_user', 'tester@example.com', 'kc-test-3', 'TESTER', true, 1);

INSERT INTO project (id, name, status, team_id, manager_id, created_at) VALUES
(1, 'Project 1', 'ACTIVE', 1, 1, '2026-07-01');

INSERT INTO milestone (id, title, target_date, project_id) VALUES
(1, 'MVP Release', '2026-08-30', 1);

-- 2. SPRINTS
INSERT INTO sprint (id, goal, name, start_date, end_date, project_id, milestone_id) VALUES
(1, 'Setup Auth', 'Sprint 1', '2026-07-01', '2026-07-15', 1, 1),
(2, 'Dashboard', 'Sprint 2', '2026-07-20', '2026-08-02', 1, 1),
(3, 'Payments', 'Sprint 3', '2026-08-03', '2026-08-16', 1, 1);

-- 3. TASKS
INSERT INTO task (title, points, status, assignee_id, sprint_id, project_id, is_blocked, description) VALUES
('Login Page', 5, 'COMPLETED', 1, 1, 1, false, 'Build login page UI'),
('Dashboard UI', 8, 'IN_PROGRESS', 2, 1, 1, false, 'Implement main dashboard components'),
('Payment API', 13, 'BLOCKED', 3, 1, 1, true, 'Integrate Stripe API'),
('Profile Page', 3, 'COMPLETED', 2, 1, 1, false, 'User profile settings'),
('Notification Service', 2, 'TODO', 1, 1, 1, false, 'Email notifications logic');

-- 4. PIPELINES (Mapped exactly 1:1 with Deployments and Releases)
INSERT INTO pipeline (id, status, duration, commit_hash, branch, started_at, finished_at, project_id, trigger_source, commit_message) VALUES
(1, 'SUCCESS', 120, 'a1b2c3d4', 'main', '2026-07-06 14:00:00', '2026-07-06 14:02:00', 1, 'JENKINS', 'Initial commit'),
(2, 'SUCCESS', 130, 'u1v2w3x4', 'main', '2026-07-08 16:00:00', '2026-07-08 16:02:10', 1, 'JENKINS', 'Release prep'),
(3, 'SUCCESS', 140, 'o1p2q3r4', 'main', '2026-07-11 16:00:00', '2026-07-11 16:02:20', 1, 'JENKINS', 'Version bump'),
(4, 'SUCCESS', 135, 'm5n6o7p8', 'main', '2026-07-14 16:00:00', '2026-07-14 16:02:15', 1, 'JENKINS', 'Deploy dashboard'),
(5, 'SUCCESS', 138, 'k9l0m1n2', 'main', '2026-07-17 16:00:00', '2026-07-17 16:02:18', 1, 'JENKINS', 'Prod deployment'),
(6, 'SUCCESS', 132, 'w1x2y3z4', 'main', '2026-07-19 15:00:00', '2026-07-19 15:02:12', 1, 'JENKINS', 'Docs update'),
(7, 'SUCCESS', 140, 'm7n8o9p0', 'main', '2026-07-21 16:00:00', '2026-07-21 16:02:20', 1, 'JENKINS', 'Release paypal'),
(8, 'SUCCESS', 142, 'k1l2m3n4', 'main', '2026-07-24 16:00:00', '2026-07-24 16:02:22', 1, 'JENKINS', 'Release filters'),
(9, 'SUCCESS', 134, 'w3x4y5z6', 'main', '2026-07-26 15:00:00', '2026-07-26 15:02:14', 1, 'JENKINS', 'Routine deploy'),
(10, 'SUCCESS', 138, 'i5j6k7l8', 'main', '2026-07-28 16:00:00', '2026-07-28 16:02:18', 1, 'JENKINS', 'Release SSO'),
(11, 'SUCCESS', 136, 'y1z2a3b4', 'main', '2026-07-30 16:00:00', '2026-07-30 16:02:16', 1, 'JENKINS', 'Release receipts'),
(12, 'SUCCESS', 140, 'k3l4m5n6', 'main', '2026-08-01 16:00:00', '2026-08-01 16:02:20', 1, 'JENKINS', 'Deploy headers'),
(13, 'SUCCESS', 148, 'a9b0c1d2', 'main', '2026-08-03 16:00:00', '2026-08-03 16:02:28', 1, 'JENKINS', 'Release charts'),
(14, 'SUCCESS', 132, 'm1n2o3p4', 'main', '2026-08-04 12:00:00', '2026-08-04 12:02:12', 1, 'JENKINS', 'Deploy patch');

-- 5. DEPLOYMENTS (Mapped strictly to Pipelines 1 through 14)
INSERT INTO deployment (id, environment, success, deployed_at, pipeline_id, cpu_percent, memory_percent, pods_running, pods_total, rollback_eligible, image_tag) VALUES
(1, 'PRODUCTION', true, '2026-07-06 14:05:00', 1, 12.5, 40.0, 1, 1, false, 'neuroforge-service'),
(2, 'PRODUCTION', true, '2026-07-08 16:05:00', 2, 15.0, 42.0, 1, 1, true, 'neuroforge-service'),
(3, 'PRODUCTION', true, '2026-07-11 16:05:00', 3, 14.5, 41.5, 1, 1, true, 'neuroforge-service'),
(4, 'PRODUCTION', true, '2026-07-14 16:05:00', 4, 16.0, 43.0, 1, 1, true, 'neuroforge-service'),
(5, 'PRODUCTION', true, '2026-07-17 16:05:00', 5, 15.5, 42.5, 1, 1, true, 'neuroforge-service'),
(6, 'PRODUCTION', true, '2026-07-19 15:05:00', 6, 14.0, 40.5, 1, 1, true, 'neuroforge-service'),
(7, 'PRODUCTION', true, '2026-07-21 16:05:00', 7, 15.0, 42.0, 1, 1, true, 'neuroforge-service'),
(8, 'PRODUCTION', true, '2026-07-24 16:05:00', 8, 16.5, 44.0, 1, 1, true, 'neuroforge-service'),
(9, 'PRODUCTION', true, '2026-07-26 15:05:00', 9, 14.0, 41.0, 1, 1, true, 'neuroforge-service'),
(10, 'PRODUCTION', true, '2026-07-28 16:05:00', 10, 15.0, 42.0, 1, 1, true, 'neuroforge-service'),
(11, 'PRODUCTION', true, '2026-07-30 16:05:00', 11, 16.0, 43.5, 1, 1, true, 'neuroforge-service'),
(12, 'PRODUCTION', true, '2026-08-01 16:05:00', 12, 14.5, 41.5, 1, 1, true, 'neuroforge-service'),
(13, 'PRODUCTION', true, '2026-08-03 16:05:00', 13, 15.0, 42.0, 1, 1, true, 'neuroforge-service'),
(14, 'PRODUCTION', true, '2026-08-04 12:05:00', 14, 13.5, 39.5, 1, 1, true, 'neuroforge-service');

-- 6. RELEASES (Mapped strictly to Deployments 1 through 14)
INSERT INTO releases (id, version, approved, release_date, deployment_id) VALUES
(1, 'v1.0.0', true, '2026-07-06 14:10:00', 1),
(2, 'v1.1.0', true, '2026-07-08 16:10:00', 2),
(3, 'v1.2.0', true, '2026-07-11 16:10:00', 3),
(4, 'v1.3.0', true, '2026-07-14 16:10:00', 4),
(5, 'v2.0.0', true, '2026-07-17 16:10:00', 5),
(6, 'v2.1.0', true, '2026-07-19 15:10:00', 6),
(7, 'v2.2.0', true, '2026-07-21 16:10:00', 7),
(8, 'v3.0.0', true, '2026-07-24 16:10:00', 8),
(9, 'v3.1.0', true, '2026-07-26 15:10:00', 9),
(10, 'v3.2.0', true, '2026-07-28 16:10:00', 10),
(11, 'v4.0.0', true, '2026-07-30 16:10:00', 11),
(12, 'v4.1.0', true, '2026-08-01 16:10:00', 12),
(13, 'v4.2.0', true, '2026-08-03 16:10:00', 13),
(14, 'v5.0.0', true, '2026-08-04 12:10:00', 14);

-- 7. PIPELINE STAGES
INSERT INTO pipeline_stage (name, sequence_order, status, duration_seconds, pipeline_id) VALUES
('Build', 1, 'SUCCESS', 45, 1),
('Test', 2, 'SUCCESS', 30, 1),
('Deploy', 3, 'SUCCESS', 45, 1);

-- 8. TEST CASES
INSERT INTO test_case (name, result, coverage, pipeline_id) VALUES
('AuthenticationTests', 'PASSED', 85.5, 1),
('DashboardTests', 'PASSED', 90.0, 1);

-- 9. NOTIFICATIONS
INSERT INTO notifications (type, message, is_read, created_at, user_id) VALUES
('TASK_UPDATE', 'Your task was approved', false, '2026-08-04 10:00:00', 1);

-- 10. REPOSITORIES
INSERT INTO repository (url, branch) VALUES
('https://github.com/RajanGill04/NeuroForge', 'main');

-- 11. REQUIREMENTS
INSERT INTO requirement (description, priority) VALUES
('System must support SSO', 'HIGH');

-- 12. BLOCKERS
INSERT INTO blockers (task_id, task_title, reason, resolved, raised_at, sprint_id) VALUES
(3, 'Payment API', 'Waiting on API keys', false, '2026-07-02 09:00:00', 1);

-- 13. TASK COMMENTS
INSERT INTO task_comments (task_id, comment) VALUES
(1, 'Great job on the login page!');