-- =========================
-- ROLES
-- =========================
INSERT INTO roles (id, name, description, created_at) VALUES
('a0000000-0000-0000-0000-000000000001', 'Admin', 'Has full system control and management capabilities.', NOW()),
('a0000000-0000-0000-0000-000000000002', 'Trainer', 'Can create, manage, and grade courses/modules.', NOW()),
('a0000000-0000-0000-0000-000000000003', 'Trainee', 'Can enroll in and complete courses/modules.', NOW());

-- =========================
-- PERMISSIONS
-- =========================
INSERT INTO permissions (id, type_name, created_at) VALUES
('b0000000-0000-0000-0000-000000000001', 'user:manage_all', NOW()),
('b0000000-0000-0000-0000-000000000002', 'course:create_edit', NOW()),
('b0000000-0000-0000-0000-000000000003', 'course:enroll_self', NOW()),
('b0000000-0000-0000-0000-000000000004', 'course:view_content', NOW()),
('b0000000-0000-0000-0000-000000000005', 'grade:submit_work', NOW()),
('b0000000-0000-0000-0000-000000000006', 'grade:view_others', NOW()),
('b0000000-0000-0000-0000-000000000007', 'grade:edit_others', NOW());

-- =========================
-- ROLE_PERMISSIONS
-- =========================
-- Admin
INSERT INTO role_permissions (role_id, permission_id, created_at) VALUES
('a0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', NOW()),
('a0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000002', NOW()),
('a0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000003', NOW()),
('a0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000004', NOW()),
('a0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000005', NOW()),
('a0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000006', NOW()),
('a0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000007', NOW());

-- Trainer
INSERT INTO role_permissions (role_id, permission_id, created_at) VALUES
('a0000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000002', NOW()),
('a0000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000004', NOW()),
('a0000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000006', NOW()),
('a0000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000007', NOW());

-- Trainee
INSERT INTO role_permissions (role_id, permission_id, created_at) VALUES
('a0000000-0000-0000-0000-000000000003', 'b0000000-0000-0000-0000-000000000003', NOW()),
('a0000000-0000-0000-0000-000000000003', 'b0000000-0000-0000-0000-000000000004', NOW()),
('a0000000-0000-0000-0000-000000000003', 'b0000000-0000-0000-0000-000000000005', NOW());

-- =========================
-- USERS
-- =========================
-- Note: You need to provide hashed passwords. Example uses bcrypt hash placeholders.
INSERT INTO users (id, first_name, last_name, email, is_active, created_at, updated_at) VALUES
('c0000000-0000-0000-0000-000000000001', 'System', 'Admin', 'adminb40@gmail.com', TRUE, NOW(), NOW()),
('c0000000-0000-0000-0000-000000000002', 'System', 'Trainer', 'trainerb40@gmail.com', TRUE, NOW(), NOW()),
('c0000000-0000-0000-0000-000000000003', 'System', 'Trainee', 'traineeb40@gmail.com', TRUE, NOW(), NOW());

-- =========================
-- PASSWORDS
-- =========================
-- Replace <HASHED_PASSWORD> with the actual bcrypt hashes
INSERT INTO passwords (id, password, user_id, is_current, created_at) VALUES
(gen_random_uuid(), '<HASHED_ADMIN_PASSWORD>', 'c0000000-0000-0000-0000-000000000001', TRUE, NOW()),
(gen_random_uuid(), '<HASHED_TRAINER_PASSWORD>', 'c0000000-0000-0000-0000-000000000002', TRUE, NOW()),
(gen_random_uuid(), '<HASHED_TRAINEE_PASSWORD>', 'c0000000-0000-0000-0000-000000000003', TRUE, NOW());

-- =========================
-- USER_ROLES
-- =========================
INSERT INTO user_roles (user_id, role_id, created_at) VALUES
('c0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', NOW()),
('c0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000002', NOW()),
('c0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000003', NOW());
