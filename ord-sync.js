const fetch = require('node-fetch');
const { Pool } = require('pg');
const sleep = require('util').promisify(setTimeout);

const RATE_LIMIT = 500; // max requests per minute
const REQUEST_INTERVAL = 60 * 1000 / RATE_LIMIT; // time between requests in ms
const BATCH_SIZE = 1000; // Number of inscriptions to insert in each batch

// Create a new connection pool to your PostgreSQL database
require('dotenv').config()

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

// Get the highest block number currently in the database
async function getHighestBlock() {
  const res = await pool.query('SELECT MAX(genesis_block_height) FROM inscriptions');
  return res.rows[0].max;
}

// Fetch inscriptions from the Ordinals API
async function fetchInscriptions(blockNumber) {
  const response = await fetch(`https://api.hiro.so/ordinals/v1/inscriptions?start=${blockNumber}`);

  // Check for HTTP errors
  if (!response.ok) {
    throw new Error(`HTTP error ${response.status}`);
  }

  const data = await response.json();

  // Log fetched data
  console.log('Fetched inscriptions:', data);

  return data; // Assuming this is an array of inscriptions
}

// Insert inscriptions into the database
async function insertInscriptions(inscriptions) {
  const client = await pool.connect();

  try {
    console.log('Connected to the database');
    console.log('Number of inscriptions to insert:', inscriptions.length);

    await client.query('BEGIN');

    for (let i = 0; i < inscriptions.length; i += BATCH_SIZE) {
      const batch = inscriptions.slice(i, i + BATCH_SIZE);

      for (const inscription of batch) {
        const {
          id,
          number,
          address,
          genesis_address,
          genesis_block_height,
          genesis_block_hash,
          genesis_tx_id,
          genesis_fee,
          genesis_timestamp,
          tx_id,
          location,
          output,
          value,
          offset,
          sat_ordinal,
          sat_rarity,
          sat_coinbase_height,
          mime_type,
          content_type,
          content_length,
          timestamp,
        } = inscription;

        await client.query(
          `
          INSERT INTO inscriptions (
            id,
            number,
            address,
            genesis_address,
            genesis_block_height,
            genesis_block_hash,
            genesis_tx_id,
            genesis_fee,
            genesis_timestamp,
            tx_id,
            location,
            output,
            value,
            offset,
            sat_ordinal,
            sat_rarity,
            sat_coinbase_height,
            mime_type,
            content_type,
            content_length,
            timestamp
          )
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22);
        `,
          [
            id,
            number,
            address,
            genesis_address,
            genesis_block_height,
            genesis_block_hash,
            genesis_tx_id,
            genesis_fee,
            genesis_timestamp,
            tx_id,
            location,
            output,
            value,
            offset,
            sat_ordinal,
            sat_rarity,
            sat_coinbase_height,
            mime_type,
            content_type,
            content_length,
            timestamp,
          ]
        );

        // Wait before making the next request to respect the rate limit
        await sleep(REQUEST_INTERVAL);
      }
    }

    await client.query('COMMIT');
    console.log('Inserted inscriptions successfully');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Failed to insert inscriptions:', error.message);
    throw error;
  } finally {
    client.release();
    console.log('Database connection released');
  }
}

// Fetch and insert new inscriptions
async function updateInscriptions() {
  try {
    const highestBlock = await getHighestBlock();
    const newInscriptions = await fetchInscriptions(highestBlock + 1);

    // Make inscriptions iterable by adding Symbol.iterator property
    newInscriptions[Symbol.iterator] = function* () {
      for (const inscription of this) {
        yield inscription;
      }
    };

    await insertInscriptions(newInscriptions);
  } catch (error) {
    console.error(`Failed to update inscriptions: ${error.message}`);
  }
}

// Run the update function
updateInscriptions().catch(console.error);
