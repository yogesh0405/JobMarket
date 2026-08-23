-- Migration 024: Create companies table and populate initial company data
CREATE TABLE IF NOT EXISTS companies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employer_id UUID REFERENCES users(id) ON DELETE SET NULL,
    name VARCHAR(255) UNIQUE NOT NULL,
    logo TEXT,
    color VARCHAR(50),
    industry VARCHAR(255),
    company_type VARCHAR(100) DEFAULT 'Private Limited',
    description TEXT,
    website VARCHAR(255),
    address TEXT,
    city VARCHAR(255),
    state VARCHAR(255),
    pincode VARCHAR(50),
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    email VARCHAR(255),
    phone VARCHAR(50),
    company_size VARCHAR(100) DEFAULT '100-500 employees',
    founded_year INT DEFAULT 2000,
    midc_zone VARCHAR(255),
    specializations JSONB DEFAULT '[]'::jsonb,
    verified BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_companies_name ON companies(name);
CREATE INDEX IF NOT EXISTS idx_companies_employer_id ON companies(employer_id);

-- Auto-populate companies table from users table where role = 'employer' and company_name IS NOT NULL
INSERT INTO companies (employer_id, name, logo, industry, address, email, phone, verified)
SELECT 
    id as employer_id,
    COALESCE(company_name, name) as name,
    profile_picture_url as logo,
    COALESCE(trade_specialization, 'Industrial Manufacturing') as industry,
    location as address,
    email,
    phone,
    TRUE as verified
FROM users
WHERE role = 'employer' AND company_name IS NOT NULL
ON CONFLICT (name) DO NOTHING;
