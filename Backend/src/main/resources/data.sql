
-- Sprint Seed Data


INSERT INTO sprint (goal, dates, project_id)
VALUES
('Sprint 1', '01-Jul-2026 to 15-Jul-2026', 1),
('Sprint 2', '2026-07-20 to 2026-08-02', 1),
('Sprint 3', '2026-08-03 to 2026-08-16', 1);


-- Task Seed Data


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