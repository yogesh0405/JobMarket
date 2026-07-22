import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

async function checkResume() {
  try {
    const res = await pool.query("SELECT id, email, resume FROM users WHERE email = 'raaaj6626@gmail.com'");
    console.log("Database Row:", JSON.stringify(res.rows[0], null, 2));
    
    if (res.rows[0] && res.rows[0].resume) {
      const resume = res.rows[0].resume;
      console.log("Type of resume:", typeof resume);
      if (typeof resume === 'string') {
        try {
          const parsed = JSON.parse(resume);
          console.log("Parsed once, type:", typeof parsed);
          console.log("Parsed keys:", Object.keys(parsed));
          console.log("Parsed URL length:", parsed.url ? parsed.url.length : 0);
          console.log("Parsed URL prefix:", parsed.url ? parsed.url.substring(0, 100) : 'N/A');
        } catch (e) {
          console.log("Failed to parse string:", e);
        }
      } else {
        console.log("Resume keys:", Object.keys(resume));
        if (resume.url) {
          console.log("Resume URL length:", resume.url.length);
          console.log("Resume URL start:", resume.url.substring(0, 100));
          console.log("Resume URL end:", resume.url.substring(resume.url.length - 100));
        }
      }
    }
  } catch (err) {
    console.error("Error:", err);
  } finally {
    await pool.end();
  }
}

checkResume();
