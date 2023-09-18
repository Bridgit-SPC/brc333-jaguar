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

const lowestCurse = -80000;
const startingPoint = process.argv[2] || 30000000;
const PROCESS_BATCH_SIZE = process.argv[3] || 1000000;

function logToFile(message) {
  fs.writeFileSync(LOG_FILE_PATH, `[${new Date().toISOString()}] - ${message}\n`, { flag: 'a' 
});
}


async function getInscriptionLinks(currentNumber) {
  const apiKey = 'afcfc988-7d6c-42a3-a663-cbc43599249d';
  const url = `https://ord.ordinalnovus.com/api/inscriptions/${currentNumber}`;
  //console.log('url =', url);
  try {

    const response = await axios.get(url);
    if (!response || response.status !== 200) {
      console.error(`Error fetching inscription links. Status code: ${response ? response.status : 'Unknown'}`);
      return null;
    }

    const jsonData = response.data;
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
        inscription.id,
        inscription.number
      );  
      //console.log('inscription.id=',inscription.id,'inscription.number=',inscription.number);
    }
    placeholders = placeholders.slice(0, -1);

    const insertQuery = `
      INSERT INTO ins_num_id (id, number)
      VALUES ${placeholders}
      ON CONFLICT (number) DO NOTHING;
    `;

    //console.log('values:' + values); 
    //logToFile('insert Query:' + insertQuery);

    let res = [];
    try {
      res = await client.query(insertQuery, values);
      //console.log('res=',res);
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
 let  currentNumber = startingPoint;
  while (currentNumber > startingPoint - PROCESS_BATCH_SIZE) {
    try {
      //console.log('currentNumber =',currentNumber);
      const urls = await getInscriptionLinks(currentNumber);
      if (!urls) {
        logToFile('No more inscription links to fetch.');
        break;
      }
      console.log('urls =',urls);

      let currentUrl = "";
      let inscriptions = [];
      for (let i = 0; i < Math.min(BATCH_SIZE, urls.length); i++) {
        let inscription = {};
        currentUrl = urls[i];
        inscription.id = urls[i];
        inscription.number =  currentNumber - i;
        console.log('inscription=', inscription);
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


      try {
          const insertedCount = await insertInscriptions(inscriptions);
          if (insertedCount > 0) {
             logToFile(`Inserted ${insertedCount} inscriptions into the database.`);
          }
   
          totalInsertedCount += BATCH_SIZE;
      } catch (error) {
         logToFile(`An error occurred: ${error.message}`);
      }

      //const insertedCount = await insertInscriptions(inscriptions);
      //if (insertedCount > 0) {
      //  logToFile(`Inserted ${insertedCount} inscriptions into the database.`);
      //}

      //totalInsertedCount += BATCH_SIZE;
      currentNumber -= BATCH_SIZE;
      console.log(' totalInsertedCount =', totalInsertedCount );
    } catch (error) {
      logToFile(`Failed to update inscriptions: ${error}`);
      console.log(`Failed to update inscriptions: ${error}`);
    }
  }
}

// Call the updateInscriptions function to start the process
updateInscriptions().catch(error => {
  console.error('Failed to start updating inscriptions:', error);
});
