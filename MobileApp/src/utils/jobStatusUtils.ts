/**
 * Utility to strictly determine if a job listing is live and active.
 *
 * A job is strictly considered "Live" / "Active" if:
 * 1. It is not marked inactive (is_active !== false, isActive !== false, active !== false)
 * 2. Status is explicitly 'APPROVED', 'ACTIVE', or 'PUBLISHED' (case-insensitive)
 * 3. Status is NOT 'CLOSED', 'EXPIRED', 'REJECTED', 'PENDING', 'PENDING_REVIEW', 'CHANGES_REQUESTED', 'DRAFT', etc.
 * 4. Application deadline (if configured) has not passed.
 */
export const isJobLive = (job: any): boolean => {
  if (!job || typeof job !== 'object') return false;

  // 1. Check explicit active flag
  if (job.is_active === false || job.isActive === false || job.active === false) {
    return false;
  }

  // 2. Normalize status
  const rawStatus = (job.status || job.approval_status || job.approvalStatus || '')
    .toString()
    .trim()
    .toUpperCase();

  // Excluded inactive/pending/rejected/closed statuses
  const excludedStatuses = [
    'CLOSED',
    'EXPIRED',
    'REJECTED',
    'PENDING',
    'PENDING_REVIEW',
    'PENDING_APPROVAL',
    'IN_REVIEW',
    'UNDER_APPROVAL',
    'CHANGES_REQUESTED',
    'ARCHIVED',
    'INACTIVE',
    'DRAFT',
    'UNPUBLISHED',
    'DELETED',
    'HIDDEN',
    'PAUSED',
  ];

  if (excludedStatuses.includes(rawStatus)) {
    return false;
  }

  // Must match approved/active status
  const activeStatuses = ['APPROVED', 'ACTIVE', 'PUBLISHED', 'LIVE', 'OPEN'];
  if (!activeStatuses.includes(rawStatus)) {
    return false;
  }

  // 3. Application deadline verification
  const deadline =
    job.application_deadline ||
    job.applicationDeadline ||
    job.deadline ||
    job.expires_at ||
    job.expiresAt;

  if (deadline) {
    const deadlineDate = new Date(deadline);
    if (!isNaN(deadlineDate.getTime())) {
      // If date string without timestamp (e.g. "2026-10-01"), compare against end of day (23:59:59.999)
      if (typeof deadline === 'string' && deadline.trim().length <= 10) {
        deadlineDate.setHours(23, 59, 59, 999);
      }
      if (deadlineDate.getTime() < Date.now()) {
        return false;
      }
    }
  }

  return true;
};
