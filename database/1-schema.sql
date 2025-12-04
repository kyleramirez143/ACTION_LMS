-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =========================
-- USERS
-- =========================
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    email VARCHAR(150) NOT NULL UNIQUE,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    profile_picture VARCHAR(255),
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- PASSWORDS
CREATE TABLE passwords (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    password VARCHAR NOT NULL,
    user_id UUID NOT NULL REFERENCES users(id) ON UPDATE CASCADE ON DELETE CASCADE,
    is_current BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ROLES
CREATE TABLE roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(50) NOT NULL UNIQUE,
    description VARCHAR(255),
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- PERMISSIONS
CREATE TABLE permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type_name VARCHAR(100) NOT NULL UNIQUE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- USER_ROLES
CREATE TABLE user_roles (
    user_id UUID NOT NULL REFERENCES users(id) ON UPDATE CASCADE ON DELETE CASCADE,
    role_id UUID NOT NULL REFERENCES roles(id) ON UPDATE CASCADE ON DELETE CASCADE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    PRIMARY KEY (user_id, role_id)
);

-- ROLE_PERMISSIONS
CREATE TABLE role_permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    role_id UUID NOT NULL REFERENCES roles(id) ON UPDATE CASCADE ON DELETE CASCADE,
    permission_id UUID NOT NULL REFERENCES permissions(id) ON UPDATE CASCADE ON DELETE CASCADE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- =========================
-- COURSES, MODULES, LECTURES
-- =========================
CREATE TABLE courses (
    course_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    image VARCHAR(255),
    description TEXT,
    is_published BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE course_instructors (
    course_id UUID NOT NULL REFERENCES courses(course_id) ON UPDATE CASCADE ON DELETE CASCADE,
    managed_by UUID NOT NULL REFERENCES users(id) ON UPDATE CASCADE ON DELETE CASCADE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    PRIMARY KEY (course_id, managed_by)
);

CREATE TABLE modules (
    module_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id UUID REFERENCES courses(course_id) ON UPDATE CASCADE ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    created_by UUID REFERENCES users(id) ON UPDATE CASCADE ON DELETE CASCADE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_modules_course_id ON modules(course_id);
CREATE INDEX IF NOT EXISTS idx_modules_created_by ON modules(created_by);

CREATE TABLE lectures (
    lecture_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id UUID REFERENCES courses(course_id) ON UPDATE CASCADE ON DELETE CASCADE,
    module_id UUID REFERENCES modules(module_id) ON UPDATE CASCADE ON DELETE CASCADE,
    created_by UUID REFERENCES users(id) ON UPDATE CASCADE ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_lectures_module_id ON lectures(module_id);
CREATE INDEX IF NOT EXISTS idx_lectures_created_by ON lectures(created_by);

-- RESOURCES and LECTURE_RESOURCES
CREATE TABLE resources (
    resource_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    file_url TEXT NOT NULL,
    content_type VARCHAR(50),
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE lecture_resources (
    lecture_id UUID NOT NULL REFERENCES lectures(lecture_id) ON UPDATE CASCADE ON DELETE CASCADE,
    resource_id UUID NOT NULL REFERENCES resources(resource_id) ON UPDATE CASCADE ON DELETE CASCADE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    PRIMARY KEY (lecture_id, resource_id)
);

-- =========================
-- ASSESSMENTS
-- =========================
CREATE TABLE assessment_types (
    assessment_type_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE assessments (
    assessment_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    pdf_source_url TEXT,
    assessment_type_id UUID REFERENCES assessment_types(assessment_type_id) ON UPDATE CASCADE ON DELETE CASCADE,
    is_published BOOLEAN NOT NULL DEFAULT FALSE,
    created_by UUID REFERENCES users(id) ON UPDATE CASCADE ON DELETE CASCADE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_assessments_type_creator ON assessments(assessment_type_id, created_by);

CREATE TABLE assessment_questions (
    question_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assessment_id UUID REFERENCES assessments(assessment_id) ON UPDATE CASCADE ON DELETE CASCADE,
    question_text TEXT NOT NULL,
    options JSON,
    correct_answer JSON,
    points INTEGER DEFAULT 1,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_assessment_questions_assessment_id ON assessment_questions(assessment_id);

CREATE TABLE assessment_responses (
    response_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assessment_id UUID REFERENCES assessments(assessment_id) ON UPDATE CASCADE ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON UPDATE CASCADE ON DELETE CASCADE,
    question_id UUID REFERENCES assessment_questions(question_id) ON UPDATE CASCADE ON DELETE CASCADE,
    answer JSON,
    score DECIMAL(5,2),
    feedback TEXT,
    submitted_at TIMESTAMP NOT NULL DEFAULT NOW(),
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_assessment_responses ON assessment_responses(assessment_id, user_id, question_id);

CREATE TABLE grades (
    grade_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON UPDATE CASCADE ON DELETE CASCADE,
    assessment_id UUID REFERENCES assessments(assessment_id) ON UPDATE CASCADE ON DELETE CASCADE,
    grade_type VARCHAR(50),
    score DECIMAL(5,2),
    weight DECIMAL(5,2),
    calculated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    remarks TEXT,
    overridden_by UUID REFERENCES users(id) ON UPDATE CASCADE ON DELETE SET NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_grades_user_assessment ON grades(user_id, assessment_id);

-- =========================
-- AI INSIGHTS
-- =========================
CREATE TABLE ai_insights (
    insight_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON UPDATE CASCADE ON DELETE CASCADE,
    generated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    weakness_summary TEXT,
    improvement_areas_json JSON,
    recommended_courses_json JSON,
    confidence_score DECIMAL(5,2),
    reviewed_by UUID REFERENCES users(id) ON UPDATE CASCADE ON DELETE SET NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ai_insights_user_id ON ai_insights(user_id);

-- =========================
-- ASSESSMENT SCREEN RECORDING SESSIONS
-- =========================
CREATE TABLE assessment_screen_sessions (
    session_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assessment_id UUID NOT NULL REFERENCES assessments(assessment_id) ON UPDATE CASCADE ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON UPDATE CASCADE ON DELETE CASCADE,
    start_time TIMESTAMP NOT NULL DEFAULT NOW(),
    end_time TIMESTAMP,
    recording_url TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'active',
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_assessment_screen_sessions_user_id ON assessment_screen_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_assessment_screen_sessions_assessment_id ON assessment_screen_sessions(assessment_id);
CREATE INDEX IF NOT EXISTS idx_assessment_screen_sessions_user_assessment ON assessment_screen_sessions(user_id, assessment_id);
