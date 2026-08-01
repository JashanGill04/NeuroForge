INSERT INTO sprint (goal, dates, project_id)
VALUES
('Sprint 1', '01-Jul-2026 to 15-Jul-2026', 1),
('Sprint 2', '2026-07-20 to 2026-08-02', 1),
('Sprint 3', '2026-08-03 to 2026-08-16', 1);

INSERT INTO task (title, points, status, assignee_id, sprint_id)
VALUES
('Login Page', 5, 'COMPLETED', 1, 1),
('Dashboard UI', 8, 'IN_PROGRESS', 2, 1),
('Payment API', 13, 'BLOCKED', 3, 1),
('Profile Page', 3, 'COMPLETED', 2, 1),
('Notification Service', 2, 'TODO', 1, 1),
('Settings Module', 5, 'COMPLETED', 2, 1),
('Bug Fix #101', 8, 'BLOCKED', 3, 1),
('User Search', 3, 'IN_PROGRESS', 1, 1),
('Reports', 13, 'TODO', 2, 1),
('Logout', 2, 'COMPLETED', 1, 1),
('Email Service', 5, 'BLOCKED', 2, 1),
('Task Filter', 3, 'COMPLETED', 3, 1),
('Dark Mode', 2, 'TODO', 1, 1),
('Role Management', 8, 'IN_PROGRESS', 2, 1),
('Audit Logs', 13, 'COMPLETED', 3, 1),
('JWT Authentication', 5, 'COMPLETED', 1, 2),
('Kanban Drag Drop', 8, 'IN_PROGRESS', 2, 2),
('Kafka Integration', 13, 'BLOCKED', 3, 2),
('Notification API', 2, 'TODO', 1, 2),
('User Profile', 3, 'COMPLETED', 2, 2),
('Task Assignment', 5, 'IN_PROGRESS', 3, 2),
('Dashboard Metrics', 8, 'COMPLETED', 1, 2),
('Bug Fix #205', 5, 'BLOCKED', 2, 2),
('Dark Theme', 2, 'TODO', 3, 2),
('Search API', 3, 'COMPLETED', 1, 2),
('Sprint Report', 5, 'COMPLETED', 1, 3),
('Velocity Chart', 8, 'IN_PROGRESS', 2, 3),
('Task Comments', 2, 'TODO', 3, 3),
('Reminder Service', 13, 'BLOCKED', 1, 3),
('Export Reports', 5, 'COMPLETED', 2, 3),
('Audit Logs', 3, 'IN_PROGRESS', 3, 3),
('Project Settings', 5, 'TODO', 1, 3),
('Email Verification', 8, 'BLOCKED', 2, 3),
('Task Labels', 2, 'COMPLETED', 3, 3),
('Release Notes', 3, 'COMPLETED', 1, 3);

INSERT INTO pipeline (id, status, duration, commit_hash, branch, started_at, finished_at, project_id) VALUES
(1, 'SUCCESS', 120, 'a1b2c3d4', 'main', NOW() - INTERVAL '29 days 4 hours', NOW() - INTERVAL '29 days 3 hours 58 minutes', NULL),
(2, 'SUCCESS', 95, 'e5f6g7h8', 'develop', NOW() - INTERVAL '28 days 6 hours', NOW() - INTERVAL '28 days 5 hours 58 minutes', NULL),
(3, 'FAILED', 42, 'i9j0k1l2', 'feature/auth', NOW() - INTERVAL '28 days 2 hours', NOW() - INTERVAL '28 days 1 hour 59 minutes', NULL),
(4, 'SUCCESS', 105, 'm3n4o5p6', 'feature/auth', NOW() - INTERVAL '27 days 8 hours', NOW() - INTERVAL '27 days 7 hours 58 minutes', NULL),
(5, 'SUCCESS', 115, 'q7r8s9t0', 'develop', NOW() - INTERVAL '27 days 4 hours', NOW() - INTERVAL '27 days 3 hours 58 minutes', NULL),
(6, 'SUCCESS', 130, 'u1v2w3x4', 'main', NOW() - INTERVAL '27 days 2 hours', NOW() - INTERVAL '27 days 1 hour 58 minutes', NULL),
(7, 'SUCCESS', 88, 'y5z6a7b8', 'feature/payment', NOW() - INTERVAL '26 days 12 hours', NOW() - INTERVAL '26 days 11 hours 58 minutes', NULL),
(8, 'FAILED', 55, 'c9d0e1f2', 'feature/payment', NOW() - INTERVAL '26 days 8 hours', NOW() - INTERVAL '26 days 8 hours 7 minutes', NULL),
(9, 'SUCCESS', 112, 'g3h4i5j6', 'feature/payment', NOW() - INTERVAL '25 days 9 hours', NOW() - INTERVAL '25 days 8 hours 58 minutes', NULL),
(10, 'SUCCESS', 120, 'k7l8m9n0', 'develop', NOW() - INTERVAL '25 days 4 hours', NOW() - INTERVAL '25 days 3 hours 58 minutes', NULL);

INSERT INTO pipeline (id, status, duration, commit_hash, branch, started_at, finished_at, project_id) VALUES
(11, 'SUCCESS', 140, 'o1p2q3r4', 'main', NOW() - INTERVAL '24 days 2 hours', NOW() - INTERVAL '24 days 1 hour 58 minutes', NULL),
(12, 'SUCCESS', 90, 's5t6u7v8', 'bugfix/issue-42', NOW() - INTERVAL '23 days 10 hours', NOW() - INTERVAL '23 days 9 hours 58 minutes', NULL),
(13, 'SUCCESS', 105, 'w9x0y1z2', 'develop', NOW() - INTERVAL '23 days 6 hours', NOW() - INTERVAL '23 days 5 hours 58 minutes', NULL),
(14, 'FAILED', 30, 'a3b4c5d6', 'feature/dashboard', NOW() - INTERVAL '22 days 11 hours', NOW() - INTERVAL '22 days 11 hours 9 minutes', NULL),
(15, 'SUCCESS', 118, 'e7f8g9h0', 'feature/dashboard', NOW() - INTERVAL '22 days 8 hours', NOW() - INTERVAL '22 days 7 hours 58 minutes', NULL),
(16, 'SUCCESS', 125, 'i1j2k3l4', 'develop', NOW() - INTERVAL '22 days 4 hours', NOW() - INTERVAL '22 days 3 hours 58 minutes', NULL),
(17, 'SUCCESS', 135, 'm5n6o7p8', 'main', NOW() - INTERVAL '21 days 2 hours', NOW() - INTERVAL '21 days 1 hour 58 minutes', NULL),
(18, 'SUCCESS', 92, 'q9r0s1t2', 'bugfix/issue-42', NOW() - INTERVAL '20 days 9 hours', NOW() - INTERVAL '20 days 8 hours 58 minutes', NULL),
(19, 'SUCCESS', 102, 'u3v4w5x6', 'develop', NOW() - INTERVAL '20 days 5 hours', NOW() - INTERVAL '20 days 4 hours 58 minutes', NULL),
(20, 'FAILED', 48, 'y7z8a9b0', 'feature/auth', NOW() - INTERVAL '19 days 14 hours', NOW() - INTERVAL '19 days 13 hours 59 minutes', NULL);

INSERT INTO pipeline (id, status, duration, commit_hash, branch, started_at, finished_at, project_id) VALUES
(21, 'SUCCESS', 114, 'c1d2e3f4', 'feature/auth', NOW() - INTERVAL '19 days 10 hours', NOW() - INTERVAL '19 days 9 hours 58 minutes', NULL),
(22, 'SUCCESS', 122, 'g5h6i7j8', 'develop', NOW() - INTERVAL '18 days 6 hours', NOW() - INTERVAL '18 days 5 hours 58 minutes', NULL),
(23, 'SUCCESS', 138, 'k9l0m1n2', 'main', NOW() - INTERVAL '18 days 2 hours', NOW() - INTERVAL '18 days 1 hour 58 minutes', NULL),
(24, 'SUCCESS', 99, 'o3p4q5r6', 'bugfix/issue-42', NOW() - INTERVAL '17 days 11 hours', NOW() - INTERVAL '17 days 10 hours 58 minutes', NULL),
(25, 'SUCCESS', 110, 's7t8u9v0', 'develop', NOW() - INTERVAL '17 days 5 hours', NOW() - INTERVAL '17 days 4 hours 58 minutes', NULL),
(26, 'SUCCESS', 132, 'w1x2y3z4', 'main', NOW() - INTERVAL '16 days 3 hours', NOW() - INTERVAL '16 days 2 hours 58 minutes', NULL),
(27, 'FAILED', 38, 'a5b6c7d8', 'feature/payment', NOW() - INTERVAL '15 days 12 hours', NOW() - INTERVAL '15 days 12 hours 11 minutes', NULL),
(28, 'SUCCESS', 120, 'e9f0g1h2', 'feature/payment', NOW() - INTERVAL '15 days 8 hours', NOW() - INTERVAL '15 days 7 hours 58 minutes', NULL),
(29, 'SUCCESS', 108, 'i3j4k5l6', 'develop', NOW() - INTERVAL '14 days 6 hours', NOW() - INTERVAL '14 days 5 hours 58 minutes', NULL),
(30, 'SUCCESS', 140, 'm7n8o9p0', 'main', NOW() - INTERVAL '14 days 2 hours', NOW() - INTERVAL '14 days 1 hour 58 minutes', NULL);

INSERT INTO pipeline (id, status, duration, commit_hash, branch, started_at, finished_at, project_id) VALUES
(31, 'SUCCESS', 101, 'q1r2s3t4', 'bugfix/issue-42', NOW() - INTERVAL '13 days 10 hours', NOW() - INTERVAL '13 days 9 hours 58 minutes', NULL),
(32, 'SUCCESS', 112, 'u5v6w7x8', 'develop', NOW() - INTERVAL '13 days 5 hours', NOW() - INTERVAL '13 days 4 hours 58 minutes', NULL),
(33, 'FAILED', 52, 'y9z0a1b2', 'feature/dashboard', NOW() - INTERVAL '12 days 13 hours', NOW() - INTERVAL '12 days 13 hours 9 minutes', NULL),
(34, 'SUCCESS', 124, 'c3d4e5f6', 'feature/dashboard', NOW() - INTERVAL '12 days 9 hours', NOW() - INTERVAL '12 days 8 hours 58 minutes', NULL),
(35, 'SUCCESS', 128, 'g7h8i9j0', 'develop', NOW() - INTERVAL '11 days 6 hours', NOW() - INTERVAL '11 days 5 hours 58 minutes', NULL),
(36, 'SUCCESS', 142, 'k1l2m3n4', 'main', NOW() - INTERVAL '11 days 2 hours', NOW() - INTERVAL '11 days 1 hour 58 minutes', NULL),
(37, 'SUCCESS', 94, 'o5p6q7r8', 'bugfix/issue-42', NOW() - INTERVAL '10 days 10 hours', NOW() - INTERVAL '10 days 9 hours 58 minutes', NULL),
(38, 'SUCCESS', 108, 's9t0u1v2', 'develop', NOW() - INTERVAL '10 days 5 hours', NOW() - INTERVAL '10 days 4 hours 58 minutes', NULL),
(39, 'SUCCESS', 134, 'w3x4y5z6', 'main', NOW() - INTERVAL '9 days 3 hours', NOW() - INTERVAL '9 days 2 hours 58 minutes', NULL),
(40, 'SUCCESS', 102, 'a7b8c9d0', 'feature/auth', NOW() - INTERVAL '8 days 11 hours', NOW() - INTERVAL '8 days 10 hours 58 minutes', NULL);

INSERT INTO pipeline (id, status, duration, commit_hash, branch, started_at, finished_at, project_id) VALUES
(41, 'SUCCESS', 111, 'e1f2g3h4', 'develop', NOW() - INTERVAL '8 days 5 hours', NOW() - INTERVAL '8 days 4 hours 58 minutes', NULL),
(42, 'SUCCESS', 138, 'i5j6k7l8', 'main', NOW() - INTERVAL '7 days 2 hours', NOW() - INTERVAL '7 days 1 hour 58 minutes', NULL),
(43, 'FAILED', 45, 'm9n0o1p2', 'feature/payment', NOW() - INTERVAL '6 days 14 hours', NOW() - INTERVAL '6 days 13 hours 59 minutes', NULL),
(44, 'SUCCESS', 116, 'q3r4s5t6', 'feature/payment', NOW() - INTERVAL '6 days 9 hours', NOW() - INTERVAL '6 days 8 hours 58 minutes', NULL),
(45, 'SUCCESS', 115, 'u7v8w9x0', 'develop', NOW() - INTERVAL '5 days 6 hours', NOW() - INTERVAL '5 days 5 hours 58 minutes', NULL),
(46, 'SUCCESS', 136, 'y1z2a3b4', 'main', NOW() - INTERVAL '5 days 2 hours', NOW() - INTERVAL '5 days 1 hour 58 minutes', NULL),
(47, 'SUCCESS', 98, 'c5d6e7f8', 'bugfix/issue-42', NOW() - INTERVAL '4 days 10 hours', NOW() - INTERVAL '4 days 9 hours 58 minutes', NULL),
(48, 'SUCCESS', 110, 'g9h0i1j2', 'develop', NOW() - INTERVAL '4 days 4 hours', NOW() - INTERVAL '4 days 3 hours 58 minutes', NULL),
(49, 'SUCCESS', 140, 'k3l4m5n6', 'main', NOW() - INTERVAL '3 days 2 hours', NOW() - INTERVAL '3 days 1 hour 58 minutes', NULL),
(50, 'FAILED', 58, 'o7p8q9r0', 'feature/dashboard', NOW() - INTERVAL '2 days 13 hours', NOW() - INTERVAL '2 days 13 hours 8 minutes', NULL);

INSERT INTO pipeline (id, status, duration, commit_hash, branch, started_at, finished_at, project_id) VALUES
(51, 'SUCCESS', 115, 's1t2u3v4', 'feature/dashboard', NOW() - INTERVAL '2 days 9 hours', NOW() - INTERVAL '2 days 8 hours 58 minutes', NULL),
(52, 'SUCCESS', 122, 'w5x6y7z8', 'develop', NOW() - INTERVAL '2 days 4 hours', NOW() - INTERVAL '2 days 3 hours 58 minutes', NULL),
(53, 'SUCCESS', 148, 'a9b0c1d2', 'main', NOW() - INTERVAL '1 day 2 hours', NOW() - INTERVAL '1 day 1 hour 58 minutes', NULL),
(54, 'SUCCESS', 92, 'e3f4g5h6', 'bugfix/issue-42', NOW() - INTERVAL '18 hours', NOW() - INTERVAL '17 hours 58 minutes', NULL),
(55, 'SUCCESS', 108, 'i7j8k9l0', 'develop', NOW() - INTERVAL '12 hours', NOW() - INTERVAL '11 hours 58 minutes', NULL),
(56, 'SUCCESS', 132, 'm1n2o3p4', 'main', NOW() - INTERVAL '6 hours', NOW() - INTERVAL '5 hours 58 minutes', NULL),
(57, 'FAILED', 40, 'q5r6s7t8', 'feature/auth', NOW() - INTERVAL '4 hours', NOW() - INTERVAL '3 hours 59 minutes', NULL),
(58, 'SUCCESS', 114, 'u9v0w1x2', 'feature/auth', NOW() - INTERVAL '2 hours', NOW() - INTERVAL '1 hour 58 minutes', NULL),
(59, 'RUNNING', 0, 'y3z4a5b6', 'develop', NOW() - INTERVAL '30 minutes', NULL, NULL),
(60, 'PENDING', 0, 'c7d8e9f0', 'feature/dashboard', NOW() - INTERVAL '10 minutes', NULL, NULL);

INSERT INTO deployment (id, environment, success, deployed_at, pipeline_id) VALUES
(1, 'PRODUCTION', true, NOW() - INTERVAL '29 days 3 hours 55 minutes', 1),
(2, 'TESTING', true, NOW() - INTERVAL '28 days 5 hours 55 minutes', 2),
(3, 'DEVELOPMENT', true, NOW() - INTERVAL '27 days 3 hours 55 minutes', 5),
(4, 'PRODUCTION', true, NOW() - INTERVAL '27 days 1 hour 55 minutes', 6),
(5, 'STAGING', true, NOW() - INTERVAL '25 days 3 hours 55 minutes', 10),
(6, 'PRODUCTION', true, NOW() - INTERVAL '24 days 1 hour 55 minutes', 11),
(7, 'TESTING', true, NOW() - INTERVAL '23 days 5 hours 55 minutes', 13),
(8, 'DEVELOPMENT', true, NOW() - INTERVAL '22 days 3 hours 55 minutes', 16),
(9, 'PRODUCTION', true, NOW() - INTERVAL '21 days 1 hour 55 minutes', 17),
(10, 'STAGING', true, NOW() - INTERVAL '20 days 4 hours 55 minutes', 19);

INSERT INTO deployment (id, environment, success, deployed_at, pipeline_id) VALUES
(11, 'TESTING', true, NOW() - INTERVAL '18 days 5 hours 55 minutes', 22),
(12, 'PRODUCTION', true, NOW() - INTERVAL '18 days 1 hour 55 minutes', 23),
(13, 'DEVELOPMENT', true, NOW() - INTERVAL '17 days 4 hours 55 minutes', 25),
(14, 'PRODUCTION', true, NOW() - INTERVAL '16 days 2 hours 55 minutes', 26),
(15, 'STAGING', true, NOW() - INTERVAL '14 days 5 hours 55 minutes', 29),
(16, 'PRODUCTION', true, NOW() - INTERVAL '14 days 1 hour 55 minutes', 30),
(17, 'TESTING', true, NOW() - INTERVAL '13 days 4 hours 55 minutes', 32),
(18, 'DEVELOPMENT', true, NOW() - INTERVAL '11 days 5 hours 55 minutes', 35),
(19, 'PRODUCTION', true, NOW() - INTERVAL '11 days 1 hour 55 minutes', 36),
(20, 'STAGING', true, NOW() - INTERVAL '10 days 4 hours 55 minutes', 38);

INSERT INTO deployment (id, environment, success, deployed_at, pipeline_id) VALUES
(21, 'PRODUCTION', true, NOW() - INTERVAL '9 days 2 hours 55 minutes', 39),
(22, 'TESTING', true, NOW() - INTERVAL '8 days 4 hours 55 minutes', 41),
(23, 'PRODUCTION', true, NOW() - INTERVAL '7 days 1 hour 55 minutes', 42),
(24, 'DEVELOPMENT', true, NOW() - INTERVAL '5 days 5 hours 55 minutes', 45),
(25, 'PRODUCTION', true, NOW() - INTERVAL '5 days 1 hour 55 minutes', 46),
(26, 'STAGING', true, NOW() - INTERVAL '4 days 3 hours 55 minutes', 48),
(27, 'PRODUCTION', true, NOW() - INTERVAL '3 days 1 hour 55 minutes', 49),
(28, 'DEVELOPMENT', true, NOW() - INTERVAL '2 days 3 hours 55 minutes', 52),
(29, 'PRODUCTION', true, NOW() - INTERVAL '1 day 1 hour 55 minutes', 53),
(30, 'TESTING', true, NOW() - INTERVAL '11 hours 55 minutes', 55),
(31, 'PRODUCTION', true, NOW() - INTERVAL '5 hours 55 minutes', 56);

INSERT INTO "release" (id, version, approved, release_date, deployment_id) VALUES
(1, 'v1.0.0', true, NOW() - INTERVAL '29 days 3 hours 50 minutes', 1),
(2, 'v1.1.0', true, NOW() - INTERVAL '27 days 1 hour 50 minutes', 4),
(3, 'v1.2.0', true, NOW() - INTERVAL '24 days 1 hour 50 minutes', 6),
(4, 'v1.3.0', true, NOW() - INTERVAL '21 days 1 hour 50 minutes', 9),
(5, 'v2.0.0', true, NOW() - INTERVAL '18 days 1 hour 50 minutes', 12),
(6, 'v2.1.0', true, NOW() - INTERVAL '16 days 2 hours 50 minutes', 14),
(7, 'v2.2.0', true, NOW() - INTERVAL '14 days 1 hour 50 minutes', 16),
(8, 'v3.0.0', true, NOW() - INTERVAL '11 days 1 hour 50 minutes', 19),
(9, 'v3.1.0', true, NOW() - INTERVAL '9 days 2 hours 50 minutes', 21),
(10, 'v3.2.0', true, NOW() - INTERVAL '7 days 1 hour 50 minutes', 23);

INSERT INTO "release" (id, version, approved, release_date, deployment_id) VALUES
(11, 'v4.0.0', true, NOW() - INTERVAL '5 days 1 hour 50 minutes', 25),
(12, 'v4.1.0', true, NOW() - INTERVAL '3 days 1 hour 50 minutes', 27),
(13, 'v4.2.0', true, NOW() - INTERVAL '1 day 1 hour 50 minutes', 29),
(14, 'v5.0.0', true, NOW() - INTERVAL '5 hours 50 minutes', 31);