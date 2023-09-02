const { Pool } = require('pg');

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

export async function getTweets(page = 1, limit = 50) {
  try {
    const offset = (page - 1) * limit;
    const query = `
      SELECT * 
      FROM inscriptions
      ORDER BY number DESC
      LIMIT $1 OFFSET $2
    `;
    const client = await pool.connect();
    const res = await client.query(query, [limit, offset]);
    client.release();
    return res.rows;
  } catch (error) {
    console.error('Error fetching tweets:', error);
    throw error; // Rethrow the error to handle it elsewhere
  }
}

export async function addResponse({ parent, user, operation, content = null, media = null }) {
  try {
    console.log(parent,' ', user,' ', operation);
    const query = `
      INSERT INTO responses (parent, address, operation, content, media)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *;
    `;
    
    const values = [parent, user, operation, content , media ];
    
    console.log('query and values=', query, ' ', values);
 
    const client = await pool.connect();
    const result = await client.query(query, values);
    client.release();
    //console.log('result=',result);
    return result.rows[0];
  } catch (error) {
    console.error('Error adding response:', error);
    throw error; 
  }
}

// Function to get counts for a specific tweet
export async function getTweetState(inscriptionId, user) {
  try {
    const client = await pool.connect();
    const query = `
      SELECT
        COALESCE(
           (SELECT COUNT(*) FROM responses WHERE parent = $1 AND operation = 'like'),
           0
        ) AS likesCount,
        COALESCE(
           (SELECT COUNT(*) FROM responses WHERE parent = $1 AND operation = 'reply'),
           0
        ) AS repliesCount,
        COALESCE(
           (SELECT COUNT(*) FROM responses WHERE parent = $1 AND operation = 'repost'),
           0
        ) AS repostsCount,
        COALESCE(
           (SELECT COUNT(*) FROM responses WHERE parent = $1 AND operation = 'bookmark'),
           0
        ) AS bookmarksCount,
        COALESCE(
           EXISTS (SELECT 1 FROM responses WHERE parent = $1 AND operation = 'like' AND address = $2),
           false
        ) AS userLiked,
        COALESCE(
           EXISTS (SELECT 1 FROM responses WHERE parent = $1 AND operation = 'repost' AND address = $2),
           false
        ) AS userReposted,
        COALESCE(
           EXISTS (SELECT 1 FROM responses WHERE parent = $1 AND operation = 'bookmark' AND address = $2),
           false
        ) AS userBookmarked,
        (SELECT id FROM responses WHERE parent = $1 AND operation = 'like' AND address = $2 ORDER BY id LIMIT 1) AS userLikedId,
    	(SELECT id FROM responses WHERE parent = $1 AND operation = 'repost' AND address = $2 ORDER BY id LIMIT 1) AS userRepostedId,
    	(SELECT id FROM responses WHERE parent = $1 AND operation = 'bookmark' AND address = $2 ORDER BY id LIMIT 1) AS userBookmarkedId;
    `;
    const result = await client.query(query, [inscriptionId, user]);
    //console.log('query= ', query);
    client.release();
    return result.rows;
  } catch (error) {
    console.error('Error fetching counts:', error);
    throw error;
  }
}

// Function to remove an interaction (like, repost, reply, or quote-repost)
export async function removeInteraction(interactionId) {
  try {
    const query = `
      DELETE FROM responses
      WHERE id = $1
    `;
    const client = await pool.connect();
    await client.query(query, [interactionId]);
    client.release();
  } catch (error) {
    console.error('Error removing interaction:', error);
    throw error; // Rethrow the error to handle it elsewhere
  }
}
