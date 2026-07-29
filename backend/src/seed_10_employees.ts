import bcrypt from 'bcrypt';
import { pool } from './config/database/pool';

/**
 * Seeder script for 10 Employee / Candidate Users with realistic Indian male profiles and photos.
 */
export const INDIAN_MEN_EMPLOYEES = [
  {
    name: 'Rajesh Kumar Sharma',
    email: 'rajesh.sharma@demo.com',
    phone: '9822011001',
    role: 'candidate',
    profilePictureUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
    headline: 'Senior CNC Operator & Machinist (ITI Certified)',
    tradeSpecialization: 'CNC Machinist',
    location: 'Waluj MIDC, Chhatrapati Sambhajinagar',
    skills: ['CNC Operating', 'VMC', 'Fanuc', 'Precision Turning', 'Shop Safety'],
    experienceYears: 6,
    company: 'Bajaj Auto Ltd',
    education: 'ITI Machinist - Govt ITI Sambhajinagar'
  },
  {
    name: 'Amitabh Verma',
    email: 'amitabh.verma@demo.com',
    phone: '9822011002',
    role: 'candidate',
    profilePictureUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
    headline: 'VMC Programmer & CAD/CAM Designer',
    tradeSpecialization: 'VMC Programmer',
    location: 'Chikalthana MIDC, Chhatrapati Sambhajinagar',
    skills: ['VMC Programming', 'Mastercam', 'AutoCAD', 'Fixture Design'],
    experienceYears: 4,
    company: 'Wockhardt Ltd',
    education: 'Diploma in Mechanical Engineering'
  },
  {
    name: 'Sunil Deshmukh',
    email: 'sunil.deshmukh@demo.com',
    phone: '9822011003',
    role: 'candidate',
    profilePictureUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=400&q=80',
    headline: 'Certified Industrial Electrician & PLC Maintenance Technician',
    tradeSpecialization: 'Industrial Electrician',
    location: 'Shendra MIDC, Chhatrapati Sambhajinagar',
    skills: ['PLC Maintenance', 'Siemens TIA Portal', 'Control Wiring', 'HT/LT Panels'],
    experienceYears: 8,
    company: 'Siemens Limited',
    education: 'ITI Electrician'
  },
  {
    name: 'Vikram Kulkarni',
    email: 'vikram.kulkarni@demo.com',
    phone: '9822011004',
    role: 'candidate',
    profilePictureUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=400&q=80',
    headline: 'Quality Control Inspector & CMM Specialist',
    tradeSpecialization: 'Quality Assurance',
    location: 'Waluj MIDC, Chhatrapati Sambhajinagar',
    skills: ['CMM Inspection', 'IATF 16949', 'Metrology', 'Vernier & Micrometer'],
    experienceYears: 5,
    company: 'CEAT Tyres Ltd',
    education: 'B.E. Mechanical Engineering'
  },
  {
    name: 'Pradeep Shinde',
    email: 'pradeep.shinde@demo.com',
    phone: '9822011005',
    role: 'candidate',
    profilePictureUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=400&q=80',
    headline: 'High-Pressure Heavy MIG & TIG Welder',
    tradeSpecialization: 'MIG/TIG Welder',
    location: 'Paithan MIDC, Chhatrapati Sambhajinagar',
    skills: ['MIG Welding', 'TIG Welding', 'Structural Steel Fabrication', 'Safety Standards'],
    experienceYears: 7,
    company: 'Thermax Industrial',
    education: 'ITI Welder Trade'
  },
  {
    name: 'Sachin Joshi',
    email: 'sachin.joshi@demo.com',
    phone: '9822011006',
    role: 'candidate',
    profilePictureUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    headline: 'Warehouse & Inventory Store Supervisor (SAP MM)',
    tradeSpecialization: 'Store Keeper',
    location: 'Chikalthana MIDC, Chhatrapati Sambhajinagar',
    skills: ['SAP MM', 'Inventory Control', 'Goods Receipt', 'Dispatch Management'],
    experienceYears: 6,
    company: 'Lupin Pharmaceuticals',
    education: 'B.Com - Dr. BAMU University'
  },
  {
    name: 'Anil Gavhane',
    email: 'anil.gavhane@demo.com',
    phone: '9822011007',
    role: 'candidate',
    profilePictureUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=400&q=80',
    headline: 'Senior Hydraulics & Pneumatics Maintenance Engineer',
    tradeSpecialization: 'Plant Maintenance',
    location: 'Railway Station MIDC, Chhatrapati Sambhajinagar',
    skills: ['Hydraulics', 'Pneumatics', 'Preventive Maintenance', 'Pump Overhaul'],
    experienceYears: 9,
    company: 'Endurance Technologies',
    education: 'Diploma in Production Engineering'
  },
  {
    name: 'Manoj Jadhav',
    email: 'manoj.jadhav@demo.com',
    phone: '9822011008',
    role: 'candidate',
    profilePictureUrl: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=400&q=80',
    headline: 'Certified Heavy Material Handling & Forklift Operator',
    tradeSpecialization: 'Forklift Driver',
    location: 'Waluj MIDC, Chhatrapati Sambhajinagar',
    skills: ['Forklift Operating', 'Material Loading', 'Pallet Handling', 'Safety Checklists'],
    experienceYears: 5,
    company: 'Škoda Auto Volkswagen India',
    education: '12th Pass + Heavy Driving License'
  },
  {
    name: 'Sanjay Pawar',
    email: 'sanjay.pawar@demo.com',
    phone: '9822011009',
    role: 'candidate',
    profilePictureUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80',
    headline: 'Shop Floor Assembly Line Production Supervisor',
    tradeSpecialization: 'Assembly Line Supervisor',
    location: 'Shendra MIDC, Chhatrapati Sambhajinagar',
    skills: ['Production Planning', '5S & Kaizen', 'Shift Management', 'Manpower Allocation'],
    experienceYears: 10,
    company: 'Mahindra Heavy Engines',
    education: 'Diploma in Industrial Management'
  },
  {
    name: 'Vijay Kale',
    email: 'vijay.kale@demo.com',
    phone: '9822011010',
    role: 'candidate',
    profilePictureUrl: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&w=400&q=80',
    headline: 'Tool & Die Maker Fitter Specialist',
    tradeSpecialization: 'Tool & Die Fitter',
    location: 'Waluj MIDC, Chhatrapati Sambhajinagar',
    skills: ['Die Fitting', 'Tool Room', 'Grinding Machine', 'Press Tools'],
    experienceYears: 7,
    company: 'Bharat Forge Ltd',
    education: 'ITI Tool & Die Maker'
  }
];

export async function seed10Employees(): Promise<void> {
  console.log('👤 Seeding 10 Indian male candidates/employees with profile photos into database...');
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const defaultPasswordHash = await bcrypt.hash('employee123', 10);

    for (const emp of INDIAN_MEN_EMPLOYEES) {
      const expJson = JSON.stringify([
        {
          title: emp.headline.split('&')[0].trim(),
          company: emp.company,
          duration: `${2024 - emp.experienceYears} - Present`,
          description: `Worked as ${emp.tradeSpecialization} specializing in industrial manufacturing and shop floor safety.`
        }
      ]);

      const eduJson = JSON.stringify([
        {
          degree: emp.education,
          institution: 'Chhatrapati Sambhajinagar Technical Institute',
          year: '2018 - 2020'
        }
      ]);

      await client.query(
        `
        INSERT INTO users (
          email, password_hash, name, phone, role, headline,
          trade_specialization, status, location, profile_picture_url,
          skills, experience, education, aadhaar_verified
        ) VALUES (
          $1, $2, $3, $4, $5, $6,
          $7, 'ACTIVE', $8, $9,
          $10, $11, $12, TRUE
        )
        ON CONFLICT (email) DO UPDATE SET
          name = EXCLUDED.name,
          phone = EXCLUDED.phone,
          headline = EXCLUDED.headline,
          trade_specialization = EXCLUDED.trade_specialization,
          location = EXCLUDED.location,
          profile_picture_url = EXCLUDED.profile_picture_url,
          skills = EXCLUDED.skills,
          experience = EXCLUDED.experience,
          education = EXCLUDED.education,
          status = 'ACTIVE';
        `,
        [
          emp.email,
          defaultPasswordHash,
          emp.name,
          emp.phone,
          emp.role,
          emp.headline,
          emp.tradeSpecialization,
          emp.location,
          emp.profilePictureUrl,
          emp.skills,
          expJson,
          eduJson
        ]
      );
    }

    await client.query('COMMIT');
    console.log('✅ Successfully seeded 10 Indian male employee profiles with pictures!');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Failed seeding 10 employees:', error);
    throw error;
  } finally {
    client.release();
  }
}

if (require.main === module) {
  seed10Employees()
    .then(() => {
      pool.end();
      process.exit(0);
    })
    .catch((err) => {
      console.error(err);
      pool.end();
      process.exit(1);
    });
}
