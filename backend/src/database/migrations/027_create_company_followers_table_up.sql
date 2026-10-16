-- Migration 027: Create company_followers table for real-time company follow/unfollow module
CREATE TABLE IF NOT EXISTS company_followers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    company_id VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_user_company_follow UNIQUE(user_id, company_id)
);

CREATE INDEX IF NOT EXISTS idx_company_followers_company_id ON company_followers(company_id);
CREATE INDEX IF NOT EXISTS idx_company_followers_user_id ON company_followers(user_id);
CREATE INDEX IF NOT EXISTS idx_company_followers_created_at ON company_followers(created_at);

-- Populate initial genuine followers from candidates who already submitted applications
INSERT INTO company_followers (user_id, company_id, created_at)
SELECT DISTINCT 
    ja.user_id as user_id, 
    COALESCE(c.id::text, c.name, j.company) as company_id,
    MIN(ja.applied_at) as created_at
FROM job_applications ja
JOIN jobs j ON ja.job_id = j.id
LEFT JOIN companies c ON (
    (j.employer_id IS NOT NULL AND c.employer_id = j.employer_id)
    OR (LOWER(TRIM(c.name)) = LOWER(TRIM(j.company)))
)
WHERE ja.user_id IS NOT NULL 
  AND (c.id IS NOT NULL OR j.company IS NOT NULL)
GROUP BY ja.user_id, COALESCE(c.id::text, c.name, j.company)
ON CONFLICT (user_id, company_id) DO NOTHING;
