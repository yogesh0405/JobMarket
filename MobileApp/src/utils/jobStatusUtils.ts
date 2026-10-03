/**
 * Utility to strictly determine if a job listing is live and active.
 *
 * A job is strictly considered "Live" / "Active" if:
 * 1. It is not marked inactive (is_active !== false, isActive !== false, active !== false)
 * 2. It does not have rejection reasons or rejected status
 * 3. Status is explicitly 'APPROVED', 'ACTIVE', or 'PUBLISHED' (case-insensitive)
 * 4. Status is NOT 'CLOSED', 'EXPIRED', 'REJECTED', 'PENDING', 'PENDING_REVIEW', 'CHANGES_REQUESTED', 'DRAFT', etc.
 * 5. Application deadline (if configured) has not passed.
 */
export const isJobLive = (job: any): boolean => {
  if (!job || typeof job !== 'object') return false;

  // 1. Check explicit active boolean flag
  if (job.is_active === false || job.isActive === false || job.active === false) {
    return false;
  }

  // 2. Collect all status properties
  const candidateStatuses = [
    job.status,
    job.dbStatus,
    job.db_status,
    job.approval_status,
    job.approvalStatus,
    job.approval_state,
  ]
    .filter((s) => typeof s === 'string' && s.trim().length > 0)
    .map((s) => s.trim().toUpperCase());

  // Excluded inactive/pending/rejected/closed statuses
  const excludedStatuses = [
    'CLOSED',
    'EXPIRED',
    'REJECTED',
    'REJECT',
    'PENDING',
    'PENDING_REVIEW',
    'PENDING_APPROVAL',
    'IN_REVIEW',
    'UNDER_APPROVAL',
    'UNDER_REVIEW',
    'CHANGES_REQUESTED',
    'ARCHIVED',
    'INACTIVE',
    'DRAFT',
    'UNPUBLISHED',
    'DELETED',
    'HIDDEN',
    'PAUSED',
  ];

  // If ANY status property indicates rejected, pending, closed, etc., it is NOT live!
  for (const s of candidateStatuses) {
    if (excludedStatuses.includes(s)) {
      return false;
    }
  }

  // If it has a reject reason, it was rejected
  if (job.reject_reason || job.rejectReason) {
    return false;
  }

  // Must match at least one approved/active status
  const activeStatuses = ['APPROVED', 'ACTIVE', 'PUBLISHED', 'LIVE', 'OPEN'];
  const hasApprovedStatus = candidateStatuses.some((s) => activeStatuses.includes(s));

  // If candidateStatuses has values and NONE is approved/active, return false
  if (candidateStatuses.length > 0 && !hasApprovedStatus) {
    return false;
  }

  // 3. Application deadline verification:
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
