const fetch = require('node-fetch');
const { Pool } = require('pg');
const BATCH_SIZE = 20;
const RATE_LIMIT = 500;
const fs = require('fs');

require('dotenv').config();

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

function logToFile(message) {
  fs.writeFileSync('log.txt', `${new Date().toISOString()} - ${message}\n`, { flag: 'a' });
}

async function getHighestMissingInscriptionNumbers() {
  const client = await pool.connect();
  try {
    const res = await client.query(`
      SELECT s.i AS missing_number
      FROM generate_series(
        (SELECT MIN(number) FROM inscriptions),
        (SELECT MAX(number) FROM inscriptions)
      ) AS s(i)
      LEFT OUTER JOIN inscriptions ON s.i = inscriptions.number
      WHERE inscriptions.number IS NULL
      ORDER BY s.i DESC
      LIMIT $1
    `, [BATCH_SIZE]);

    return res.rows.map(row => row.missing_number);
  } catch (error) {
    logToFile('Failed to retrieve the highest missing inscription numbers:' + error.message);
    return [];
  } finally {
    client.release();
  }
}

async function fetchInscriptions(numbers) {
  logToFile(`Fetching inscriptions with numbers: ${numbers.join(', ')}`);
 console.log(`Fetching inscriptions with numbers: ${numbers.join(', ')}`);
  const url = `https://api.hiro.so/ordinals/v1/inscriptions?${numbers.map(number => `number=${number}`).join('&')}`;
  const response = await fetch(url);
  logToFile('Url:' + url);
  console.log('Url:' + url);
  const data = await response.json();
  logToFile('Fetched inscriptions:' + data.results.length);
  console.log('Fetched inscriptions:' + data.results.length);
  return data.results || [];
}

async function insertInscriptions(inscriptions) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const values = [];
    let placeholders = '';
    for (let i = 0; i < inscriptions.length; i++) {
      const inscription = inscriptions[i];
      const offset = i * 22;
      placeholders += `($${offset + 1}, $${offset + 2}, $${offset + 3}, $${offset + 4}, $${offset + 5}, $${offset + 6}, $${offset + 7}, $${offset + 8}, $${offset + 9}, $${offset + 10}, $${offset + 11}, $${offset + 12}, $${offset + 13}, $${offset + 14}, $${offset + 15}, $${offset + 16}, $${offset + 17}, $${offset + 18}, $${offset + 19}, $${offset + 20}, $${offset + 21}, $${offset + 22}),`;
      values.push(
        inscription.id,
        inscription.number,
        inscription.address,
        inscription.genesis_address,
        inscription.genesis_block_height,
        inscription.genesis_block_hash,
        inscription.genesis_tx_id,
        inscription.genesis_fee,
        toTimestamp(inscription.genesis_timestamp),
        inscription.tx_id,
        inscription.location,
        inscription.output,
        inscription.value,
        inscription.offset,
        inscription.sat_ordinal,
        inscription.sat_rarity,
        inscription.sat_coinbase_height,
        inscription.mime_type,
        inscription.content_type,
        inscription.content_length,
        toTimestamp(inscription.timestamp),
        inscription.curse_type
      );
    }
    placeholders = placeholders.slice(0, -1);  // remove the trailing comma

    const insertQuery = `
      INSERT INTO inscriptions (id, number, address, genesis_address, genesis_block_height, genesis_block_hash, genesis_tx_id, genesis_fee, genesis_timestamp, tx_id, location, output, value, "offset", sat_ordinal, sat_rarity, sat_coinbase_height, mime_type, content_type, content_length, timestamp, curse_type)
      VALUES ${placeholders}
      ON CONFLICT (number) DO NOTHING;
    `;

    logToFile('Query:' + insertQuery);

    const res = await client.query(insertQuery, values);
    await client.query('COMMIT');

    if (res.rowCount == 0) {
      logToFile('No inscriptions were inserted. The given inscriptions might already exist in the database.');
    } else {
      logToFile(`Inserted ${res.rowCount} inscriptions successfully`);
    }

    return res.rowCount;
  } catch (error) {
    if (error.code === '23505') {
      logToFile('Failed to insert inscriptions due to duplicate number:' + error.detail);
    } else {
      await client.query('ROLLBACK');
      logToFile('Failed to insert inscriptions:' + error.message);
    }
  } finally {
    client.release();
  }
}

function toTimestamp(timestamp) {
  const date = new Date(timestamp);
  return date.toISOString().slice(0, 19).replace('T', ' ');
}

let apiCallsTimestamps = [];

async function updateInscriptions() {
  while (true) {
    try {
      const numbers = await getHighestMissingInscriptionNumbers();
      const inscriptions = await fetchInscriptions(numbers);
      const insertedCount = await insertInscriptions(inscriptions);
      logToFile(`Total inserted so far: ${insertedCount}`);
      console.log(`Total inserted so far: ${insertedCount}`);
    } catch (error) {
      logToFile('Failed to update inscriptions:' + error.message);
      console.log('Failed to update inscriptions:' + error.message);
  }
  }
}

updateInscriptions().catch(error => {
  logToFile('Failed to start updating inscriptions:' + error.message);
});