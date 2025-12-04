-- Drop columns from lectures
ALTER TABLE lectures
DROP COLUMN content_url,
DROP COLUMN content_type;

-- Create resources table
CREATE TABLE resources (
    resource_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    file_url TEXT NOT NULL,
    content_type VARCHAR(50),        -- e.g., 'video', 'pdf', 'image'
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create lecture_resources join table
CREATE TABLE lecture_resources (
    lecture_id UUID NOT NULL,
    resource_id UUID NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    PRIMARY KEY (lecture_id, resource_id),
    CONSTRAINT fk_lecture
        FOREIGN KEY (lecture_id) 
        REFERENCES lectures(lecture_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    CONSTRAINT fk_resource
        FOREIGN KEY (resource_id) 
        REFERENCES resources(resource_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);


-- --------------------------
-- LECTURES_ASSESSMENTS TABLE
-- --------------------------
CREATE TABLE IF NOT EXISTS lectures_assessments (
    lecture_id UUID NOT NULL,
    assessment_id UUID NOT NULL,
    "order" INTEGER,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_lecture
        FOREIGN KEY (lecture_id)
        REFERENCES lectures (lecture_id)
        ON UPDATE CASCADE
        ON DELETE CASCADE,
    CONSTRAINT fk_assessment
        FOREIGN KEY (assessment_id)
        REFERENCES assessments (assessment_id)
        ON UPDATE CASCADE
        ON DELETE CASCADE,
    PRIMARY KEY (lecture_id, assessment_id)
);

-- Indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_lectures_assessments_lecture_id
    ON lectures_assessments (lecture_id);

CREATE INDEX IF NOT EXISTS idx_lectures_assessments_assessment_id
    ON lectures_assessments (assessment_id);
