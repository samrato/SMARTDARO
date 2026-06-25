-- Migration: Add missing academic catalogs, campus management, and exam management
CREATE TABLE IF NOT EXISTS faculties (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(100) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_faculty_code UNIQUE (tenant_id, code)
);

CREATE INDEX IF NOT EXISTS idx_faculties_tenant ON faculties(tenant_id);

CREATE TABLE IF NOT EXISTS departments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    faculty_id UUID NOT NULL REFERENCES faculties(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(100) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_department_code UNIQUE (tenant_id, code)
);

CREATE INDEX IF NOT EXISTS idx_departments_tenant ON departments(tenant_id);

CREATE TABLE IF NOT EXISTS units (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(100) NOT NULL,
    credit_hours INT DEFAULT 3,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_unit_code UNIQUE (tenant_id, code)
);

CREATE INDEX IF NOT EXISTS idx_units_tenant ON units(tenant_id);

CREATE TABLE IF NOT EXISTS campuses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    location VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_campus_name UNIQUE (tenant_id, name)
);

CREATE INDEX IF NOT EXISTS idx_campuses_tenant ON campuses(tenant_id);

-- Add foreign key constraint to courses linking to departments
ALTER TABLE courses ADD COLUMN IF NOT EXISTS department_id UUID REFERENCES departments(id) ON DELETE SET NULL;

-- Exams Management
CREATE TABLE IF NOT EXISTS exams (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    academic_session_id UUID NOT NULL REFERENCES academic_sessions(id) ON DELETE CASCADE,
    course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL CHECK (type IN ('MAIN', 'SUPPLEMENTARY', 'DEFERRED')),
    exam_date DATE NOT NULL,
    start_time INT NOT NULL, -- Hour, e.g. 9
    end_time INT NOT NULL,   -- Hour, e.g. 12
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_exams_tenant ON exams(tenant_id);

CREATE TABLE IF NOT EXISTS exam_allocations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    exam_id UUID NOT NULL REFERENCES exams(id) ON DELETE CASCADE,
    room_id UUID NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
    seating_capacity INT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_exam_room UNIQUE (tenant_id, exam_id, room_id)
);

CREATE TABLE IF NOT EXISTS invigilator_allocations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    exam_allocation_id UUID NOT NULL REFERENCES exam_allocations(id) ON DELETE CASCADE,
    invigilator_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_invigilator_exam UNIQUE (tenant_id, exam_allocation_id, invigilator_id)
);
