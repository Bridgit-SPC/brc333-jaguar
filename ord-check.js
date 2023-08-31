const { Pool } = require('pg');

require('dotenv').config();

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

async function getLowestInscriptionNumber() {
  const client = await pool.connect();
  console.log('connected');
  try {
    const res = await client.query('SELECT MIN(number) as min_number FROM inscriptions');
    console.log('res =',res);
    return res.rows[0]?.min_number || null;
  } catch (error) {
    console.error('Failed to retrieve the lowest inscription number:', error.message);
    return null;
  } finally {
    client.release();
  }
}

async function getHighestInscriptionNumber() {
  const client = await pool.connect();
  try {
    const res = await client.query('SELECT MAX(number) as max_number FROM inscriptions');
    return res.rows[0]?.max_number || null;
  } catch (error) {
    console.error('Failed to retrieve the highest inscription number:', error.message);
    return null;
  } finally {
    client.release();
  }
}

async function getTotalInscriptions() {
  const client = await pool.connect();
  try {
    const res = await client.query('SELECT COUNT(*) as total_inscriptions FROM inscriptions');
    return res.rows[0]?.total_inscriptions || 0;
  } catch (error) {
    console.error('Failed to retrieve the total number of inscriptions:', error.message);
    return 0;
  } finally {
    client.release();
  }
}

async function getNumberOfSkippedNumbers(highestNumber, lowestNumber) {
  if (!highestNumber || !lowestNumber) {
    return null;
  }

  const totalInRange = highestNumber - lowestNumber + 1;
  const totalInDatabase = await getTotalInscriptions();
  return totalInRange - totalInDatabase;
}

async function ordCheck() {
  const highestNumber = await getHighestInscriptionNumber();
  const lowestNumber = await getLowestInscriptionNumber();
  const totalInscriptions = await getTotalInscriptions();
  const skippedNumbers = await getNumberOfSkippedNumbers(highestNumber, lowestNumber);

  console.log('Highest Inscription Number:', highestNumber);
  console.log('Lowest Inscription Number:', lowestNumber);
  console.log('Total Inscriptions in the Table:', totalInscriptions);
  console.log('Number of Skipped Numbers:', skippedNumbers);
}

ordCheck().catch(console.error);
