import { pool } from '../../config/database/pool';
import { S3Util } from '../../utils/s3';
import { logger } from '../../utils/logger';

async function migrateCloudinaryToS3() {
  console.log('🚀 Starting Cloudinary to S3 Media Migration...');

  try {
    // 1. Migrate Users Resumes
    const usersResumesRes = await pool.query("SELECT id, resume FROM users WHERE resume IS NOT NULL");
    console.log(`Checking ${usersResumesRes.rowCount} users for resumes to migrate...`);

    for (const row of usersResumesRes.rows) {
      const resume = typeof row.resume === 'string' ? JSON.parse(row.resume) : row.resume;
      if (resume && resume.url && resume.url.includes('res.cloudinary.com')) {
        console.log(`Migrating resume for user ${row.id}: ${resume.url}`);
        try {
          const resp = await fetch(resume.url);
          if (!resp.ok) {
            console.error(`Failed to fetch resume from Cloudinary: ${resp.statusText}`);
            continue;
          }
          const arrayBuffer = await resp.arrayBuffer();
          const buffer = Buffer.from(arrayBuffer);
          const base64 = `data:${resume.type || 'application/pdf'};base64,${buffer.toString('base64')}`;

          const s3Url = await S3Util.uploadBase64(base64, 'resumes', `resume_${row.id}_${Date.now()}`);
          resume.url = s3Url;

          await pool.query("UPDATE users SET resume = $1 WHERE id = $2", [JSON.stringify(resume), row.id]);
          console.log(`✅ Migrated resume for user ${row.id} -> ${s3Url}`);
        } catch (err: any) {
          console.error(`❌ Error migrating resume for user ${row.id}:`, err.message);
        }
      }
    }

    // 2. Migrate User Profile Pictures
    const usersAvatarRes = await pool.query("SELECT id, profile_picture_url FROM users WHERE profile_picture_url LIKE '%res.cloudinary.com%'");
    console.log(`Found ${usersAvatarRes.rowCount} user profile pictures to migrate...`);

    for (const row of usersAvatarRes.rows) {
      console.log(`Migrating profile picture for user ${row.id}: ${row.profile_picture_url}`);
      try {
        const resp = await fetch(row.profile_picture_url);
        if (!resp.ok) continue;
        const arrayBuffer = await resp.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const contentType = resp.headers.get('content-type') || 'image/jpeg';
        const base64 = `data:${contentType};base64,${buffer.toString('base64')}`;

        const s3Url = await S3Util.uploadBase64(base64, 'profiles', `avatar_${row.id}_${Date.now()}`);
        await pool.query("UPDATE users SET profile_picture_url = $1 WHERE id = $2", [s3Url, row.id]);
        console.log(`✅ Migrated profile picture for user ${row.id} -> ${s3Url}`);
      } catch (err: any) {
        console.error(`❌ Error migrating profile picture for user ${row.id}:`, err.message);
      }
    }

    // 3. Migrate Job Logos
    const jobsLogoRes = await pool.query("SELECT id, company_logo FROM jobs WHERE company_logo LIKE '%res.cloudinary.com%'");
    console.log(`Found ${jobsLogoRes.rowCount} job company logos to migrate...`);

    for (const row of jobsLogoRes.rows) {
      console.log(`Migrating logo for job ${row.id}: ${row.company_logo}`);
      try {
        const resp = await fetch(row.company_logo);
        if (!resp.ok) continue;
        const arrayBuffer = await resp.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const contentType = resp.headers.get('content-type') || 'image/png';
        const base64 = `data:${contentType};base64,${buffer.toString('base64')}`;

        const s3Url = await S3Util.uploadBase64(base64, 'company_logos', `logo_${row.id}_${Date.now()}`);
        await pool.query("UPDATE jobs SET company_logo = $1 WHERE id = $2", [s3Url, row.id]);
        console.log(`✅ Migrated logo for job ${row.id} -> ${s3Url}`);
      } catch (err: any) {
        console.error(`❌ Error migrating logo for job ${row.id}:`, err.message);
      }
    }

    // 4. Migrate Support Tickets Attachments
    const ticketsRes = await pool.query("SELECT id, attachment FROM support_tickets WHERE attachment LIKE '%res.cloudinary.com%'");
    console.log(`Found ${ticketsRes.rowCount} support ticket attachments to migrate...`);

    for (const row of ticketsRes.rows) {
      console.log(`Migrating attachment for ticket ${row.id}: ${row.attachment}`);
      try {
        const resp = await fetch(row.attachment);
        if (!resp.ok) continue;
        const arrayBuffer = await resp.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const contentType = resp.headers.get('content-type') || 'application/octet-stream';
        const base64 = `data:${contentType};base64,${buffer.toString('base64')}`;

        const s3Url = await S3Util.uploadBase64(base64, 'support', `ticket_${row.id}_${Date.now()}`);
        await pool.query("UPDATE support_tickets SET attachment = $1 WHERE id = $2", [s3Url, row.id]);
        console.log(`✅ Migrated attachment for ticket ${row.id} -> ${s3Url}`);
      } catch (err: any) {
        console.error(`❌ Error migrating attachment for ticket ${row.id}:`, err.message);
      }
    }

    // 5. Migrate Support Messages Attachments
    const messagesRes = await pool.query("SELECT id, attachment FROM support_messages WHERE attachment LIKE '%res.cloudinary.com%'");
    console.log(`Found ${messagesRes.rowCount} support message attachments to migrate...`);

    for (const row of messagesRes.rows) {
      console.log(`Migrating attachment for support message ${row.id}: ${row.attachment}`);
      try {
        const resp = await fetch(row.attachment);
        if (!resp.ok) continue;
        const arrayBuffer = await resp.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const contentType = resp.headers.get('content-type') || 'application/octet-stream';
        const base64 = `data:${contentType};base64,${buffer.toString('base64')}`;

        const s3Url = await S3Util.uploadBase64(base64, 'support', `reply_${row.id}_${Date.now()}`);
        await pool.query("UPDATE support_messages SET attachment = $1 WHERE id = $2", [s3Url, row.id]);
        console.log(`✅ Migrated attachment for support message ${row.id} -> ${s3Url}`);
      } catch (err: any) {
        console.error(`❌ Error migrating attachment for message ${row.id}:`, err.message);
      }
    }

    console.log('🎉 S3 Media Migration Completed Successfully!');
    process.exit(0);
  } catch (error: any) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

migrateCloudinaryToS3();
