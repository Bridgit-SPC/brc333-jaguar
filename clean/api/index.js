const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 
`postgres://postgres:d0nt8Eevil$%$@psg-aurora-instance-1.covvmmm4ujrt.us-east-1.rds.amazonaws.com:5432/bitcoin`,
});

export async function getTweets(page = 1, limit = 50) {
  let client;
  try {
    client = await pool.connect();
    const offset = (page - 1) * limit;
    const query = `
      SELECT * 
      FROM inscriptions
      ORDER BY number DESC
      LIMIT $1 OFFSET $2
    `;
    const res = await client.query(query, [limit, offset]);
    return res.rows;
  } catch (error) {
    console.error('Error getting tweets', error) 
    return null
  } finally {
    client.release();
  }
}
