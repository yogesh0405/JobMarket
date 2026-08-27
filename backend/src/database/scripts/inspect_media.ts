import { pool } from '../../config/database/pool';

async function checkMedia() {
  try {
    const usersWithAvatars = await pool.query("SELECT id, name, profile_picture_url FROM users WHERE profile_picture_url IS NOT NULL AND profile_picture_url != ''");
    console.log(`Found ${usersWithAvatars.rowCount} users with profile pictures.`);
    usersWithAvatars.rows.slice(0, 3).forEach(r => console.log('Avatar sample:', r.profile_picture_url));

    const usersWithResumes = await pool.query("SELECT id, name, resume FROM users WHERE resume IS NOT NULL");
    console.log(`Found ${usersWithResumes.rowCount} users with resumes.`);
    usersWithResumes.rows.slice(0, 3).forEach(r => console.log('Resume sample:', r.resume));

    const jobsWithLogos = await pool.query("SELECT id, title, company_logo FROM jobs WHERE company_logo IS NOT NULL AND company_logo != ''");
    console.log(`Found ${jobsWithLogos.rowCount} jobs with logos.`);
    jobsWithLogos.rows.slice(0, 3).forEach(r => console.log('Logo sample:', r.company_logo));

    const ticketsWithAttachments = await pool.query("SELECT id, attachment FROM support_tickets WHERE attachment IS NOT NULL AND attachment != ''");
    console.log(`Found ${ticketsWithAttachments.rowCount} tickets with attachments.`);
    ticketsWithAttachments.rows.slice(0, 3).forEach(r => console.log('Attachment sample:', r.attachment));

    const messagesWithAttachments = await pool.query("SELECT id, attachment FROM support_messages WHERE attachment IS NOT NULL AND attachment != ''");
    console.log(`Found ${messagesWithAttachments.rowCount} messages with attachments.`);
    messagesWithAttachments.rows.slice(0, 3).forEach(r => console.log('Message attachment sample:', r.attachment));

    process.exit(0);
  } catch (err) {
    console.error('Error querying DB:', err);
    process.exit(1);
  }
}

checkMedia();
