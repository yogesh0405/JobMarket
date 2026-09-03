import { Request, Response, NextFunction } from 'express';
import { CompanyRepository } from '../repositories/CompanyRepository';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

export class CompanyController {
  /**
   * GET /api/v1/companies
   * Public endpoint to fetch list of companies with open job counts
   */
  static async getAllCompanies(req: Request, res: Response, next: NextFunction) {
    try {
      const { search, industry, zone } = req.query;
      const companies = await CompanyRepository.getAllCompanies(
        search as string,
        industry as string,
        zone as string
      );

      return res.status(200).json({
        success: true,
        data: companies,
        count: companies.length
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/companies/:companyId
   * Public endpoint to fetch company profile metadata
   */
  static async getCompanyById(req: Request, res: Response, next: NextFunction) {
    try {
      const rawId = req.params.companyId;
      const companyId = Array.isArray(rawId) ? rawId[0] : rawId;

      if (!companyId) {
        return res.status(400).json({
          success: false,
          error: 'Company identifier is required.'
        });
      }

      const company = await CompanyRepository.getCompanyById(companyId);

      if (!company) {
        return res.status(404).json({
          success: false,
          error: 'Company profile not found.'
        });
      }

      return res.status(200).json({
        success: true,
        data: company
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/companies/:companyId/jobs
   * Public endpoint to fetch active job postings for a company
   */
  static async getCompanyJobs(req: Request, res: Response, next: NextFunction) {
    try {
      const rawId = req.params.companyId;
      const companyId = Array.isArray(rawId) ? rawId[0] : rawId;

      if (!companyId) {
        return res.status(400).json({
          success: false,
          error: 'Company identifier is required.'
        });
      }

      const company = await CompanyRepository.getCompanyById(companyId);
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(companyId);
      const companyName = company?.name || (isUuid ? '' : companyId);
      const employerId = company?.employer_id || (isUuid ? companyId : undefined);

      const jobs = await CompanyRepository.getCompanyJobs(companyName, employerId);

      return res.status(200).json({
        success: true,
        data: jobs,
        count: jobs.length
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /api/v1/companies/:companyId
   * Protected employer endpoint to update company profile
   */
  static async updateCompanyProfile(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const rawId = req.params.companyId;
      const companyId = Array.isArray(rawId) ? rawId[0] : rawId;
      const employerId = (req.user as any)?.userId || req.user?.id;

      if (!employerId) {
        return res.status(401).json({
          success: false,
          error: 'Authentication required to update company profile.'
        });
      }

      const updatedCompany = await CompanyRepository.updateCompanyProfile(companyId, employerId, req.body);

      return res.status(200).json({
        success: true,
        message: 'Company profile updated successfully.',
        data: updatedCompany
      });
    } catch (error: any) {
      if (error.message?.includes('Unauthorized') || error.message?.includes('only edit your own')) {
        return res.status(403).json({
          success: false,
          error: error.message
        });
      }
      next(error);
    }
  }
}
