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

-- 4. PIPELINES
INSERT INTO pipeline (id, status, duration, commit_hash, branch, started_at, finished_at, project_id, trigger_source, commit_message) VALUES
(1, 'SUCCESS', 120, 'a1b2c3d4', 'main', '2026-07-06 14:00:00', '2026-07-06 14:02:00', 1, 'JENKINS', 'Initial commit'),
(2, 'SUCCESS', 95, 'e5f6g7h8', 'develop', '2026-07-07 12:00:00', '2026-07-07 12:01:35', 1, 'JENKINS', 'Update configs'),
(3, 'FAILED', 42, 'i9j0k1l2', 'feature/auth', '2026-07-07 16:00:00', '2026-07-07 16:00:42', 1, 'JENKINS', 'Add auth module');

-- 5. PIPELINE STAGES
INSERT INTO pipeline_stage (name, sequence_order, status, duration_seconds, pipeline_id) VALUES
('Build', 1, 'SUCCESS', 45, 1),
('Test', 2, 'SUCCESS', 30, 1),
('Deploy', 3, 'SUCCESS', 45, 1);

-- 6. TEST CASES
INSERT INTO test_case (name, result, coverage, pipeline_id) VALUES
('AuthenticationTests', 'PASSED', 85.5, 1),
('DashboardTests', 'PASSED', 90.0, 1);

-- 7. DEPLOYMENTS
INSERT INTO deployment (id, environment, success, deployed_at, pipeline_id, cpu_percent, memory_percent, pods_running, pods_total, rollback_eligible, image_tag) VALUES
(1, 'PRODUCTION', true, '2026-07-06 14:05:00', 1, 12.5, 40.0, 1, 1, false, 'neuroforge-service'),
(2, 'TESTING', true, '2026-07-07 12:05:00', 2, 10.0, 35.0, 1, 1, false, 'neuroforge-service');

-- 8. RELEASES (Changed to 'releases' to avoid SQL reserved keyword syntax errors)
INSERT INTO releases (id, version, approved, release_date, deployment_id) VALUES
(1, 'v1.0.0', true, '2026-07-06 14:10:00', 1),
(2, 'v1.1.0', true, '2026-07-08 16:10:00', 4),
(3, 'v1.2.0', true, '2026-07-11 16:10:00', 6),
(4, 'v1.3.0', true, '2026-07-14 16:10:00', 9),
(5, 'v2.0.0', true, '2026-07-17 16:10:00', 12),
(6, 'v2.1.0', true, '2026-07-19 15:10:00', 14),
(7, 'v2.2.0', true, '2026-07-21 16:10:00', 16),
(8, 'v3.0.0', true, '2026-07-24 16:10:00', 19),
(9, 'v3.1.0', true, '2026-07-26 15:10:00', 21),
(10, 'v3.2.0', true, '2026-07-28 16:10:00', 23),
(11, 'v4.0.0', true, '2026-07-30 16:10:00', 25),
(12, 'v4.1.0', true, '2026-08-01 16:10:00', 27),
(13, 'v4.2.0', true, '2026-08-03 16:10:00', 29),
(14, 'v5.0.0', true, '2026-08-04 12:10:00', 31);

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