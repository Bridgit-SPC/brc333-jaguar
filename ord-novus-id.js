const axios = require('axios');
const { Pool } = require('pg');
const fs = require('fs');
const process = require('process');
require('dotenv').config();

const BATCH_SIZE = 100;
const LOG_FILE_PATH = 'log.txt';

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

const lowestCurse = -76000;
let lowestMissingNumber = 21000000;

async function findAndUpdateMissingNumber() {
  try {
    const client = await pool.connect();
    
    while (true) {
      try {
        await client.query('SELECT pg_advisory_lock(1);');

        await client.query('BEGIN'); // Start a transaction

        // Find the highest missing inscription number below the starting point
        const queryResult = await client.query(`
          SELECT LEAST(
            (SELECT COALESCE(MAX(number) + 1, 1) FROM generate_series(-76000, 21000000) AS gs(number)
            WHERE NOT EXISTS (SELECT 1 FROM ins_num_id WHERE number = gs.number)),
            (SELECT MIN(number) FROM load1)
          );
        `);

        if (queryResult.rowCount === 0) {
          throw new Error('No missing numbers found.');
        }

        const missingNumber = queryResult.rows[0].least - BATCH_SIZE;
        console.log('missingNumber =', missingNumber);

        // Get the process name from environment variables
        const processName = process.argv[2] || 'default_process';

        // Store the missing number with the process name in the "load1" table
        await client.query(`
          INSERT INTO load1 (number, process_name)
          VALUES ($1, $2);
        `, [missingNumber, processName]);

        await client.query('COMMIT'); // Commit the transaction
        client.release();
        await client.query('SELECT pg_advisory_unlock(1);');
        return missingNumber;
        break; // Exit the retry loop if successful
      } catch (error) {
        await client.query('ROLLBACK'); // Rollback the transaction
        await client.query('SELECT pg_advisory_unlock(1);');
        if (error.code === '23505') {
          // Unique key violation error, retry the loop
          console.log('Duplicate key violation. Retrying...');
          continue;
        }
        throw error; // Throw other errors
      }
    }
  } catch (error) {
    throw error;
  }
}

function logToFile(message) {
  fs.writeFileSync(LOG_FILE_PATH, `[${new Date().toISOString()}] - ${message}\n`, { flag: 'a' });
}


async function getInscriptionLinks(currentNumber) {
  const apiKey = 'afcfc988-7d6c-42a3-a663-cbc43599249d';


  const url = `https://ord.ordinalnovus.com/api/inscriptions/${currentNumber}`;

  try {

    const response = await axios.get(url);
    if (!response || response.status !== 200) {
      console.error(`Error fetching inscription links. Status code: ${response ? response.status : 'Unknown'}`);
      return null;
    }

    const jsonData = response.data;
    console.log('href in getInscriptionLinks =', jsonData._links.self.href);
    //console.log('jsonData in getInscriptionLinks =', jsonData);

    if (jsonData && jsonData.inscriptions) {
      return jsonData.inscriptions;
    } else {
      console.log('No more inscriptions to fetch.');
      return null;
    }
  } catch (error) {
    console.error('Error fetching inscription links:', error);
    return null;
  }
}

function getUrlCaboose(url) {
  // Extract the inscriptionId from the href
  const startIndex = url.lastIndexOf('/') + 1;
  return url.substring(startIndex);
}

async function 
insertInscriptions(inscriptions) {
//console.log('inscriptions at insertInscriptions =', inscriptions);
const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const values = [];
    let placeholders = '';
    console.log('inscriptions.length =', inscriptions.length);
    for (let i = 0; i < inscriptions.length; i++) {
      const inscription = inscriptions[i];

      const offset = i * 2;

      placeholders += `($${offset + 1}, $${offset + 2}),`;

      values.push(
        inscription.inscriptionId,
        inscription.number
      );
    }
    placeholders = placeholders.slice(0, -1);

    const insertQuery = `
      INSERT INTO ins_num_id (inscriptionid, number)
      VALUES ${placeholders}
      ON CONFLICT (number) DO NOTHING;
    `;

    //console.log('insert Query:' + insertQuery); 
    //logToFile('insert Query:' + insertQuery);

    let res = [];
    try {
      res = await client.query(insertQuery, values);
      await client.query('COMMIT');
      console.log('Transaction committed successfully.');
    } catch (err) {
      console.error('Error while committing the transaction:', err);
    }
    if (res.rowCount == 0) {
      logToFile('No inscriptions were inserted. The given inscriptions might already exist in the database.');
    } else {
      logToFile(`Inserted ${res.rowCount} inscriptions successfully`);
    }

    return res.rowCount;
  } catch (error) {
    await client.query('ROLLBACK');
    if (error.code === '23505') {
      logToFile('Failed to insert inscriptions due to duplicate number:' + error.detail);
    } else {
      logToFile('Failed to insert inscriptions:' + error.message);
    }
    return 0;
  } finally {
    client.release();
  }
}


function toTimestamp(strDate) {
    // If the timestamp is null or empty, return null
    if (!strDate) {
      console.log(`Empty timestamp`);
      return null;
    }

    // Parse the timestamp string into a Date object
    const date = new Date(strDate);

    // If the date is invalid, log the problematic string and return null
    if (isNaN(date.getTime())) {
      console.log(`Invalid timestamp: ${strDate}`);
      return null;
    }

    // Format the Date object into the desired format "YYYY-MM-DD HH:mm:ss"
    const formattedDate = date.toISOString().slice(0, 19).replace('T', ' ');
    return formattedDate;
  
    date = new Date(modifiedStrDate);
    // If the date is invalid, log the problematic string and return null
    if (isNaN(date.getTime())) {
      console.log(`Invalid timestamp: ${strDate}`);
      return null;
    }
    
    return date.toISOString().slice(0, 19).replace('T', ' ');
}

let totalInsertedCount = 0;

const logFilePath = 'log.txt';

async function updateInscriptions() {
  while (true) {
    try {
      lowestMissingNumber = await findAndUpdateMissingNumber();
      //console.log('lowestMissingNumber =',lowestMissingNumber );
      const urls = await getInscriptionLinks(lowestMissingNumber);
      if (!urls) {
        logToFile('No more inscription links to fetch.');
        break;
      }
      //console.log('urls =',urls);

      let currentUrl = "";
      let inscriptions = [];
      for (let i = 0; i < BATCH_SIZE; i++) { 
        let inscription = {}; 
        currentUrl = urls[i].href;
        //console.log('currentUrl =', currentUrl );
        inscription.inscriptionId = getUrlCaboose(urls[i].href);
        inscription.number =  lowestMissingNumber - i;
        //console.log(`i = ${i}, lowestMissingNumber = ${lowestMissingNumber}, inscription.number = ${inscription.number}`);
        
        //console.log('inscription=', inscription);
        if (!inscription ) {
         logToFile(`No inscriptions fetched from: ${currentUrl}`);
         console.log(`No inscriptions fetched from: ${currentUrl}`);
        } else {
          try {
            inscriptions.push(inscription); 
            //console.log('success with push');
          } catch (error) {
            console.log(`Failed to push: ${error}`);
          }   
        }
      }

      //console.log('inscriptions =', inscriptions);
      // Insert the inscriptions into the database
      const insertedCount = await insertInscriptions(inscriptions);
      if (insertedCount > 0) {
        logToFile(`Inserted ${insertedCount} inscriptions into the database.`);
      }

      totalInsertedCount += BATCH_SIZE;
      lowestMissingNumber -= BATCH_SIZE;
      console.log(' totalInsertedCount =', totalInsertedCount );
    } catch (error) {
      logToFile(`Failed to update inscriptions: ${error}`);
      console.log(`Failed to update inscriptions: ${error}`);

      // Send an email notification when an error occurs
      const { exec } = require('child_process');
      const emailCommand = 'echo "An error occurred while updating inscriptions: ' + error + '" | sendmail your@email.com';

      exec(emailCommand, (error, stdout, stderr) => {
        if (error) {
          console.error(`Error sending email: ${error.message}`);
          return;
        }
        console.log('Email sent successfully.');
      })
    }
  }
}

// Call the updateInscriptions function to start the process
updateInscriptions().catch(error => {
  console.error('Failed to start updating inscriptions:', error);
});
