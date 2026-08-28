import { pool } from '../../config/database/pool';
import { S3Util } from '../../utils/s3';

async function main() {
  const ads = await pool.query("SELECT id, title, banner_image FROM advertisements WHERE banner_image LIKE 'data:%'");
  for (const ad of ads.rows) {
    const s3Url = await S3Util.uploadImage(ad.banner_image, 'static', `banner_${ad.id}_${Date.now()}`);
    await pool.query('UPDATE advertisements SET banner_image = $1 WHERE id = $2', [s3Url, ad.id]);
    console.log('✅ Migrated Ad:', ad.title, '->', s3Url);
  }

  const users = await pool.query("SELECT id, email, profile_picture_url FROM users WHERE profile_picture_url LIKE 'data:%'");
  for (const u of users.rows) {
    const s3Url = await S3Util.uploadImage(u.profile_picture_url, 'profiles', `avatar_${u.id}_${Date.now()}`);
    await pool.query('UPDATE users SET profile_picture_url = $1 WHERE id = $2', [s3Url, u.id]);
    console.log('✅ Migrated User:', u.email, '->', s3Url);
  }

  console.log('🎉 Done migrating remaining rows!');
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
