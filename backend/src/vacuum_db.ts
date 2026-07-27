import { pool } from './config/database/pool';

async function vacuum() {
  const client = await pool.connect();
  try {
    console.log('Running VACUUM FULL users to reclaim physical storage...');
    await client.query('VACUUM FULL users;');
    console.log('✅ Vacuum completed successfully.\n');

    const tableSizesQuery = `
      SELECT 
          relname AS table_name, 
          pg_size_pretty(pg_total_relation_size(c.oid)) AS total_size,
          pg_size_pretty(pg_relation_size(c.oid)) AS table_size,
          pg_size_pretty(pg_total_relation_size(c.oid) - pg_relation_size(c.oid)) AS index_size
      FROM 
          pg_class c
      LEFT JOIN 
          pg_namespace n ON n.oid = c.relnamespace
      WHERE 
          nspname = 'public' 
          AND relkind = 'r'
      ORDER BY 
          pg_total_relation_size(c.oid) DESC;
    `;
    const res = await client.query(tableSizesQuery);
    console.log('--- Database Table Sizes After VACUUM FULL ---');
    console.table(res.rows.map((r: any) => ({
      table: r.table_name,
      total_size: r.total_size,
      table_size: r.table_size,
      index_size: r.index_size
    })));
  } catch (err) {
    console.error(err);
  } finally {
    client.release();
    await pool.end();
  }
}

vacuum();
