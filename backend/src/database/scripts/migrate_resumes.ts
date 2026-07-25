import { pool } from '../../config/database/pool';
import { CloudinaryUtil } from '../../utils/cloudinary';
import { logger } from '../../utils/logger';

async function runResumeMigration() {
  const client = await pool.connect();
  try {
    console.log('Starting resume storage migration to Cloudinary...');
    
    // Find all users with active resumes in the database
    const query = `
      SELECT id, name, email, resume 
      FROM users 
      WHERE resume IS NOT NULL;
    `;
    const result = await client.query(query);
    const usersWithResumes = result.rows;
    
    console.log(`Found ${usersWithResumes.length} users with resumes in the database.`);
    
    let migratedCount = 0;
    
    for (const user of usersWithResumes) {
      const resumeObj = user.resume;
      
      // Check if the resume URL is a base64 string
      if (resumeObj && resumeObj.url && resumeObj.url.startsWith('data:')) {
        console.log(`Migrating resume for user: ${user.name} (${user.email})...`);
        
        try {
          const publicId = `resume_${user.id}`;
          const folder = 'resumes';
          
          // Upload to Cloudinary
          const secureUrl = await CloudinaryUtil.uploadFile(resumeObj.url, folder, publicId);
          
          // Update the resume object with the Cloudinary URL
          const updatedResume = {
            ...resumeObj,
            url: secureUrl
          };
          
          // Save the updated resume object back to the database
          const updateQuery = `
            UPDATE users 
            SET resume = $1, updated_at = CURRENT_TIMESTAMP
            WHERE id = $2;
          `;
          await client.query(updateQuery, [JSON.stringify(updatedResume), user.id]);
          
          console.log(`✅ Resume for ${user.name} successfully migrated. URL: ${secureUrl}`);
          migratedCount++;
        } catch (uploadErr: any) {
          console.error(`❌ Failed to migrate resume for user ${user.name}:`, uploadErr);
        }
      } else {
        console.log(`Skipping user ${user.name} - resume is already stored as a URL.`);
      }
    }
    
    console.log(`🎉 Resume migration complete. Migrated ${migratedCount} resumes.`);
  } catch (err) {
    console.error('Migration failed:', err);
  } finally {
    client.release();
    await pool.end();
  }
}

runResumeMigration();
