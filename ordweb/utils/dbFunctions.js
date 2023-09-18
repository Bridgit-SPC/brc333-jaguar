const { Pool } = require('pg');

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

export async function getTweets(page = 1, limit = 50, criteria = null) {
  try {
    const offset = (page - 1) * limit;
    let res; 
    const client = await pool.connect();
    
    if (criteria == null) {
      const query = `
        SELECT * 
        FROM info_inscriptions
        ORDER BY number DESC
        LIMIT $1 OFFSET $2
      `;
      res = await client.query(query, [limit, offset]);
    } else {
      const query = `
        SELECT * 
        FROM info_inscriptions
        WHERE content ILIKE '%' || $3 || '%'
        ORDER BY number DESC
        LIMIT $1 OFFSET $2
      `;
      //console.log(`query=, ${query} limit=${limit} offset=${offset} criteria=${criteria}`);
      res = await client.query(query, [limit, offset, criteria]);
    }
    client.release();
    console.log(`returning res.rows with length ${res.rows.length}`);
    return res.rows;
  } catch (error) {
    console.error('Error fetching tweets:', error);
    throw error; // Rethrow the error to handle it elsewhere
  }
}

export async function addResponse({ parent, user, operation, content = null, media = null }) {
  try {
    //console.log('parent=',parent,' user=', user,' operation=', operation);
    const query = `
      INSERT INTO responses (parent, address, operation, content, media)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *;
    `;
    
    const values = [parent, user, operation, content , media ];
    
    //console.log('query and values=', query, ' ', values);
 
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
          (SELECT COUNT(*) FROM responses WHERE parent = $1 AND operation = 'quote'),
          0
       ) AS quotesCount,
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
    //console.log(`query= ${query}`);
    //console.log(`inscriptionId= ${inscriptionId} user = ${user}`);
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
    console.log('interationId to delete=', interactionId);
    await client.query(query, [interactionId]);
    client.release();
  } catch (error) {
    console.error('Error removing interaction:', error);
    throw error; // Rethrow the error to handle it elsewhere
  }
}

export async function getTweetDetail(inscriptionId, page = 1, limit = 50) {
  try {

    const query = `
      SELECT * 
      FROM responses
      WHERE parent = $1
      and operation = 'reply'
      ORDER BY timestamp DESC
    `;
    const client = await pool.connect();
    const replies = await client.query(query, [inscriptionId, page, offset]);
    client.release();
    return replies.rows;
  } catch (error) {
    console.error('Error fetching tweet replies:', error);
    throw error; // Rethrow the error to handle it elsewhere
  }
}
