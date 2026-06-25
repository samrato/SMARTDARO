CREATE TABLE IF NOT EXISTS timetable_versions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    academic_session_id UUID NOT NULL REFERENCES academic_sessions(id) ON DELETE CASCADE,
    version_number INT NOT NULL,
    status VARCHAR(50) DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'UNDER_REVIEW', 'APPROVED', 'PUBLISHED', 'ARCHIVED')),
    created_by VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_session_version UNIQUE (tenant_id, academic_session_id, version_number)
);

CREATE TABLE IF NOT EXISTS timetable_allocations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    timetable_version_id UUID NOT NULL REFERENCES timetable_versions(id) ON DELETE CASCADE,
    course_id VARCHAR(255) NOT NULL,
    room_id VARCHAR(255) NOT NULL,
    lecturer_id VARCHAR(255) NOT NULL,
    day_of_week VARCHAR(20) NOT NULL,
    start_time INT NOT NULL,
    end_time INT NOT NULL,
    locked_by VARCHAR(255),
    locked_at TIMESTAMP WITH TIME ZONE,
    lock_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_allocations_version ON timetable_allocations(timetable_version_id);
