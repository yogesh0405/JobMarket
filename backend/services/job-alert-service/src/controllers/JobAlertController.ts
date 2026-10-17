import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../../../shared/types';
import { JobMatchRecommendationService } from '../../../../src/modules/job-alerts/services/JobMatchRecommendationService';
import { JobAlertLogRepository } from '../../../../src/modules/job-alerts/repositories/JobAlertLogRepository';

export class JobAlertController {
  /**
   * POST /api/v1/job-alerts/dispatch
   * Trigger profile-based job match alerts and push notifications for a published job
   */
  static async dispatchMatches(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { jobId, job } = req.body;
      const targetJob = job || jobId;

      if (!targetJob) {
        return res.status(400).json({
          success: false,
          error: 'Missing required parameter: jobId or job object must be provided.',
        });
      }

      const summary = await JobMatchRecommendationService.processJobPublication(targetJob);

      return res.status(200).json({
        success: true,
        message: `Job alerts processed: ${summary.alertsDispatchedCount} push notifications sent.`,
        data: summary,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/job-alerts/preview/:jobId
   * Preview matching candidate volume and top matches without sending push notifications
   */
  static async previewMatches(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { jobId } = req.params;
      if (!jobId) {
        return res.status(400).json({ success: false, error: 'jobId is required.' });
      }

      const limit = parseInt(req.query.limit as string, 10) || 20;
      const preview = await JobMatchRecommendationService.previewMatchesForJob(jobId, limit);

      return res.status(200).json({
        success: true,
        data: preview,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/job-alerts/history
   * Candidate's personalized feed of job recommendation alerts
   */
  static async getCandidateAlertHistory(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = (req.headers['x-user-id'] as string) || req.user?.userId || req.user?.id;
      if (!userId) {
        return res.status(401).json({ success: false, error: 'Unauthorized: User ID required' });
      }

      const limit = parseInt(req.query.limit as string, 10) || 20;
      const history = await JobAlertLogRepository.getUserAlertHistory(userId, limit);

      return res.status(200).json({
        success: true,
        count: history.length,
        data: history,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/job-alerts/metrics/:jobId
   * Recruiter metrics on job notification reach
   */
  static async getJobMetrics(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { jobId } = req.params;
      if (!jobId) {
        return res.status(400).json({ success: false, error: 'jobId is required.' });
      }

      const metrics = await JobAlertLogRepository.getJobAlertMetrics(jobId);

      return res.status(200).json({
        success: true,
        data: metrics,
      });
    } catch (error) {
      next(error);
    }
  }
}
