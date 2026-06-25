CREATE TABLE IF NOT EXISTS lecturer_constraints (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    lecturer_id VARCHAR(255) NOT NULL,
    preferred_days JSONB NOT NULL DEFAULT '[]',
    preferred_time_slots JSONB NOT NULL DEFAULT '[]',
    unavailable_days JSONB NOT NULL DEFAULT '[]',
    max_hours_per_week INT NOT NULL DEFAULT 20,
    max_classes_per_day INT NOT NULL DEFAULT 3,
    home_campus VARCHAR(100),
    travel_buffer_minutes INT NOT NULL DEFAULT 30,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_lecturer_constraint UNIQUE (tenant_id, lecturer_id)
);

CREATE TABLE IF NOT EXISTS course_streams (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    course_id VARCHAR(255) NOT NULL,
    academic_session_id UUID NOT NULL REFERENCES academic_sessions(id) ON DELETE CASCADE,
    stream_code VARCHAR(50) NOT NULL,
    stream_name VARCHAR(100) NOT NULL,
    capacity INT NOT NULL DEFAULT 40,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_course_stream UNIQUE (tenant_id, course_id, academic_session_id, stream_code)
);

CREATE TABLE IF NOT EXISTS student_registrations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    student_id VARCHAR(255) NOT NULL,
    unit_id VARCHAR(255) NOT NULL,
    session_id UUID NOT NULL REFERENCES academic_sessions(id) ON DELETE CASCADE,
    registration_status VARCHAR(50) DEFAULT 'REGISTERED' CHECK (registration_status IN ('REGISTERED', 'DROPPED')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_student_registration UNIQUE (tenant_id, student_id, unit_id, session_id)
);

CREATE INDEX IF NOT EXISTS idx_lecturer_constraints_tenant ON lecturer_constraints(tenant_id, lecturer_id);
CREATE INDEX IF NOT EXISTS idx_course_streams_tenant ON course_streams(tenant_id, course_id, academic_session_id);
CREATE INDEX IF NOT EXISTS idx_student_registrations_lookup ON student_registrations(tenant_id, student_id, session_id);
