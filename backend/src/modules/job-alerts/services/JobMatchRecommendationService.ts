import { pool } from '../../../config/database/pool';
import { logger } from '../../../utils/logger';
import { NotificationService } from '../../notifications/services/NotificationService';
import { PushNotificationService } from '../../notifications/services/PushNotificationService';
import { ProfileJobMatcher, JobListing, MatchResult } from './ProfileJobMatcher';
import { JobAlertLogRepository } from '../repositories/JobAlertLogRepository';

export interface DispatchSummary {
  jobId: string;
  jobTitle: string;
  company: string;
  candidatesEvaluated: number;
  qualifiedMatchesCount: number;
  alertsDispatchedCount: number;
  frequencyCappedCount: number;
  topMatchesCount: number;
  durationMs: number;
}

export class JobMatchRecommendationService {
  /**
   * Main pipeline: Dispatches personalized push and in-app alerts to qualified candidates
   * for a newly published job opening.
   */
  static async processJobPublication(jobInput: string | JobListing): Promise<DispatchSummary> {
    const startTime = Date.now();
    let job: JobListing | null = null;

    if (typeof jobInput === 'string') {
      job = await this.fetchJobById(jobInput);
    } else {
      job = jobInput;
      // If minimal job object passed, fetch full details from DB
      if (!job.skills || !job.location) {
        const fullJob = await this.fetchJobById(job.id);
        if (fullJob) job = fullJob;
      }
    }

    if (!job || !job.id) {
      throw new Error(`JobMatchRecommendationService: Invalid or non-existent job.`);
    }

    logger.info(`🔔 [JobAlertService] Processing matching job alerts for: "${job.title}" at "${job.company}" (ID: ${job.id})`);

    // 1. Fetch potential candidate pool matching role keywords / region
    const candidates = await JobAlertLogRepository.findCandidatePoolForJob(job);
    logger.info(`🔍 [JobAlertService] Retrieved candidate pool of ${candidates.length} candidates for evaluation.`);

    let qualifiedMatchesCount = 0;
    let alertsDispatchedCount = 0;
    let frequencyCappedCount = 0;
    let topMatchesCount = 0;

    // 2. Score every candidate profile using LinkedIn/Naukri multi-factor algorithm
    const matchResults: MatchResult[] = [];
    for (const candidate of candidates) {
      const match = ProfileJobMatcher.calculateMatch(candidate, job);
      if (match.isQualified) {
        matchResults.push(match);
      }
    }

    qualifiedMatchesCount = matchResults.length;
    // Sort highest matching candidates first
    matchResults.sort((a, b) => b.score - a.score);

    logger.info(`🎯 [JobAlertService] ${qualifiedMatchesCount} qualified candidate matches found (Score >= 50).`);

    // 3. Dispatch notifications with Anti-Spam deduplication and frequency capping
    const BATCH_SIZE = 25;
    for (let i = 0; i < matchResults.length; i += BATCH_SIZE) {
      const batch = matchResults.slice(i, i + BATCH_SIZE);

      await Promise.all(
        batch.map(async (match) => {
          try {
            // Anti-Spam Deduplication check: Has candidate already been notified about this job?
            const alreadyAlerted = await JobAlertLogRepository.hasUserBeenAlerted(match.candidateId, job.id);
            if (alreadyAlerted) {
              return;
            }

            // LinkedIn/Naukri Frequency Capping: Max 3 job alert push notifications per 24 hours
            const dailyAlerts = await JobAlertLogRepository.getDailyAlertCount(match.candidateId);
            if (dailyAlerts >= 3 && !match.isTopMatch) {
              frequencyCappedCount++;
              return;
            }

            if (match.isTopMatch) {
              topMatchesCount++;
            }

            // 1. Create In-App Notification (Visible in app notification drawer & bell icon)
            await NotificationService.sendNotification(
              match.candidateId,
              match.notificationTitle,
              match.notificationBody,
              'JOB_RECOMMENDATION',
              `/job/${job.id}`,
              'JOB',
              job.id,
              {
                jobId: job.id,
                company: job.company,
                matchScore: match.score,
                matchReasons: match.reasons,
                isTopMatch: match.isTopMatch,
              }
            );

            // 2. Dispatch High-Priority Mobile FCM Push Notification
            await PushNotificationService.sendToUser(match.candidateId, {
              title: match.notificationTitle,
              body: match.notificationBody,
              data: {
                type: 'JOB_ALERT',
                jobId: String(job.id),
                company: job.company || '',
                link: `/job/${job.id}`,
                screen: 'CandidateJobDetail',
                matchScore: String(match.score),
              },
            });

            // 3. Log into job_alert_logs
            await JobAlertLogRepository.logAlert(
              match.candidateId,
              job.id,
              match.score,
              match.reasons,
              'PUSH',
              'SENT'
            );

            alertsDispatchedCount++;
          } catch (err: any) {
            logger.warn(`Failed to dispatch alert to candidate ${match.candidateId}:`, err?.message || err);
          }
        })
      );
    }

    const durationMs = Date.now() - startTime;
    logger.info(
      `✅ [JobAlertService] Dispatched ${alertsDispatchedCount} push job alerts in ${durationMs}ms (${topMatchesCount} Top Matches, ${frequencyCappedCount} Frequency-Capped).`
    );

    return {
      jobId: job.id,
      jobTitle: job.title,
      company: job.company,
      candidatesEvaluated: candidates.length,
      qualifiedMatchesCount,
      alertsDispatchedCount,
      frequencyCappedCount,
      topMatchesCount,
      durationMs,
    };
  }

  /**
   * Preview matches without dispatching (used for employer dashboard insight)
   */
  static async previewMatchesForJob(jobId: string, limit: number = 20): Promise<{
    job: JobListing;
    totalMatches: number;
    topMatchesCount: number;
    matches: Array<MatchResult & { candidateName: string; candidateLocation?: string; trade?: string }>;
  }> {
    const job = await this.fetchJobById(jobId);
    if (!job) {
      throw new Error(`Job listing ${jobId} not found.`);
    }

    const candidates = await JobAlertLogRepository.findCandidatePoolForJob(job);
    const matches: Array<MatchResult & { candidateName: string; candidateLocation?: string; trade?: string }> = [];

    for (const candidate of candidates) {
      const match = ProfileJobMatcher.calculateMatch(candidate, job);
      if (match.isQualified) {
        matches.push({
          ...match,
          candidateName: candidate.name,
          candidateLocation: candidate.location || undefined,
          trade: candidate.trade_specialization || undefined,
        });
      }
    }

    matches.sort((a, b) => b.score - a.score);

    return {
      job,
      totalMatches: matches.length,
      topMatchesCount: matches.filter((m) => m.isTopMatch).length,
      matches: matches.slice(0, limit),
    };
  }

  private static async fetchJobById(jobId: string): Promise<JobListing | null> {
    const query = `
      SELECT 
        id, 
        title, 
        company, 
        trade, 
        iti_trade, 
        industry, 
        location, 
        midc_zone, 
        skills, 
        min_experience, 
        max_experience, 
        salary_min, 
        salary_max, 
        job_type, 
        status
      FROM jobs 
      WHERE id = $1
      LIMIT 1
    `;
    const { rows } = await pool.query(query, [jobId]);
    return rows[0] || null;
  }
}
