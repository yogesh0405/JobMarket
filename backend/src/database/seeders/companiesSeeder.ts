import bcrypt from 'bcrypt';
import { PoolClient } from 'pg';
import { CSN_COMPANIES, CompanySeedData } from './companiesData';

export interface SeededCompanyRecord {
  employerId: string;
  companyData: CompanySeedData;
}

export const INDIAN_MALE_EMPLOYER_PHOTOS = [
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&w=400&q=80',
];

export class CompaniesSeeder {
  /**
   * Seed 50 real employers/companies into the database
   */
  static async seed(client: PoolClient): Promise<Map<string, SeededCompanyRecord>> {
    console.log('🏭 Seeding 50 real companies from Chhatrapati Sambhajinagar...');
    const companyMap = new Map<string, SeededCompanyRecord>();
    const defaultPasswordHash = await bcrypt.hash('employer123', 10);

    let photoIdx = 0;
    for (const comp of CSN_COMPANIES) {
      // Create a unique employer email for each company
      const sanitizedName = comp.name.toLowerCase().replace(/[^a-z0-9]/g, '');
      const email = `hr@${sanitizedName}.com`;
      const photoUrl = INDIAN_MALE_EMPLOYER_PHOTOS[photoIdx % INDIAN_MALE_EMPLOYER_PHOTOS.length];
      photoIdx++;

      const result = await client.query(
        `
        INSERT INTO users (
          email, password_hash, name, phone, role, company_name, gst_number,
          aadhaar_verified, status, location, profile_picture_url
        ) VALUES (
          $1, $2, $3, $4, 'employer', $5, $6, TRUE, 'ACTIVE', $7, $8
        )
        ON CONFLICT (email) DO UPDATE SET
          name = EXCLUDED.name,
          company_name = EXCLUDED.company_name,
          profile_picture_url = EXCLUDED.profile_picture_url,
          status = 'ACTIVE'
        RETURNING id;
        `,
        [
          email,
          defaultPasswordHash,
          `${comp.name} HR Head`,
          comp.phone,
          comp.name,
          `27${sanitizedName.slice(0, 5).toUpperCase()}1234F1Z9`,
          `${comp.address}, ${comp.city}`,
          photoUrl
        ]
      );

      const employerId = result.rows[0].id;
      companyMap.set(comp.name, {
        employerId,
        companyData: comp
      });
    }

    console.log(`✅ Successfully seeded ${companyMap.size} companies with profile pictures.`);
    return companyMap;
  }
}
