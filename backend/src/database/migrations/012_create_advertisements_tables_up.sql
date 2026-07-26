-- UP Migration: 012_create_advertisements_tables.sql

-- 1. Advertisements Table
CREATE TABLE IF NOT EXISTS advertisements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    banner_image TEXT NOT NULL,
    advertisement_type VARCHAR(50) NOT NULL,
    owner_type VARCHAR(20) NOT NULL DEFAULT 'EMPLOYER', -- EMPLOYER, ADMIN
    owner_id UUID REFERENCES users(id) ON DELETE CASCADE,
    linked_job_id UUID REFERENCES jobs(id) ON DELETE SET NULL,
    redirect_url TEXT,
    button_text VARCHAR(100) DEFAULT 'Apply Now',
    priority VARCHAR(20) DEFAULT 'MEDIUM', -- LOW, MEDIUM, HIGH, CRITICAL
    status VARCHAR(50) DEFAULT 'PENDING_APPROVAL', -- DRAFT, SUBMITTED, PENDING_APPROVAL, APPROVED, REJECTED, PUBLISHED, EXPIRED
    approval_status VARCHAR(50) DEFAULT 'PENDING', -- PENDING, APPROVED, REJECTED
    rejection_reason TEXT,
    start_date TIMESTAMP WITH TIME ZONE NOT NULL,
    end_date TIMESTAMP WITH TIME ZONE NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    target_audience VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_advertisements_active_status ON advertisements(status, is_active, start_date, end_date, priority);
CREATE INDEX IF NOT EXISTS idx_advertisements_owner ON advertisements(owner_id);
CREATE INDEX IF NOT EXISTS idx_advertisements_linked_job ON advertisements(linked_job_id);

-- 2. Advertisement Clicks Table
CREATE TABLE IF NOT EXISTS advertisement_clicks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    advertisement_id UUID REFERENCES advertisements(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    ip_address VARCHAR(100),
    clicked_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_ad_clicks_ad_id ON advertisement_clicks(advertisement_id);

-- 3. Advertisement Views Table
CREATE TABLE IF NOT EXISTS advertisement_views (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    advertisement_id UUID REFERENCES advertisements(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    viewed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_ad_views_ad_id ON advertisement_views(advertisement_id);

-- 4. Advertisement Approvals Table
CREATE TABLE IF NOT EXISTS advertisement_approvals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    advertisement_id UUID REFERENCES advertisements(id) ON DELETE CASCADE,
    admin_id UUID REFERENCES users(id) ON DELETE SET NULL,
    status VARCHAR(50) NOT NULL,
    reason TEXT,
    approved_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_ad_approvals_ad_id ON advertisement_approvals(advertisement_id);

-- 5. Notifications Table
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) NOT NULL, -- AD_SUBMITTED, AD_APPROVED, AD_REJECTED, AD_PUBLISHED, AD_EXPIRED, AD_DELETED, AD_RESUBMITTED
    read BOOLEAN DEFAULT FALSE,
    link TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
