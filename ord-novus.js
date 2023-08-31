const axios = require('axios');
const { Pool } = require('pg');
const BATCH_SIZE = 100;
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
  fs.writeFileSync('log.txt', `[${new Date().toISOString()}] - ${message}\n`, { flag: 'a' });
}

let lowestMissingNumber = 19999951;


async function getInscriptionLinks(currentNumber) {
  const apiKey = 'afcfc988-7d6c-42a3-a663-cbc43599249d';
  const url = `https://ord.ordinalnovus.com/api/inscriptions/${currentNumber}`;
  console.log('Link Url (getInscriptionLinks) =', url); 

  try {
    const headers = {
      'apiKey': 'afcfc988-7d6c-42a3-a663-cbc43599249d'
    };
    //logToFile('headers =', headers);

    const response = await axios.get(url, { headers });
    //logToFile('response (getInscriptionLinks) =', response);
    if (!response || response.status !== 200) {
      console.error(`Error fetching inscription links. Status code: ${response ? response.status : 'Unknown'}`);
      return null;
    }

    const jsonData = response.data;
    console.log('href in getInscriptionLinks =',jsonData._links.self.href);
    //logToFile('jsonData.insciptions (getInscriptionLinks) =',jsonData.inscriptions);

    if (jsonData._links && jsonData._links.self && jsonData._links.self.href) {
      return jsonData.inscriptions; // 
    } else {
      console.log('No more inscriptions to fetch.');
      return null;
    }
  } catch (error) {
    console.error('Error fetching inscription links:', error);
    return null;
  }
}


function setInscriptionId(inscription) {
  // Extract the inscriptionId from the self link's href
  const selfLinkHref = inscription._links.self.href;
  const startIndex = selfLinkHref.lastIndexOf('/') + 1;
  const inscriptionId = selfLinkHref.substring(startIndex);

  // Set the inscriptionId property in the object
  inscription.inscriptionId = inscriptionId;
  console.log('inscriptionId =',inscriptionId);
}

async function fetchInscriptionData(url) {
  try {
    console.log('Url (fetchInscriptionData) =', url);
    const response = await axios.get(`https://ord.ordinalnovus.com/api${url}`);

    if (response.data.inscriptionId  == null) {
       setInscriptionId(response.data);
    }
    console.log('response.data.inscriptionId =',response.data.inscriptionId);  

    //console.log('response data =', response.data);
    if (!response || response.status !== 200) {
      console.error(`Error fetching inscription data. Status code: ${response ? response.status : 'Unknown'}`);
      return null;
    }
    return response.data;
  } catch (error) {
    console.error('Error fetching inscription data:', error);
    return null;
  }
}

async function 
insertInscriptions(inscriptions) {
//console.log('Starting insertInscriptions');  
//console.log('inscriptions at insertInscriptions =', inscriptions);
const client = await pool.connect();
  try {
    //console.log('connected to Pool (insertInscriptions)');
    await client.query('BEGIN');

    const values = [];
    let placeholders = '';
    console.log('inscriptions.length =', inscriptions.length);
    for (let i = 0; i < inscriptions.length; i++) {
      const inscription = inscriptions[i];
      console.log('inscriptionId =', inscription.inscriptionId);
      //console.log('inscription in InsertInscriptions  =', inscription); 

      const offset = i * 37;

      placeholders += `($${offset + 1}, $${offset + 2}, $${offset + 3}, $${offset + 4}, $${offset + 5}, $${offset + 6}, 
        $${offset + 7}, $${offset + 8}, $${offset + 9}, $${offset + 10}, $${offset + 11}, $${offset + 12}, $${offset + 
13}, 
        $${offset + 14}, $${offset + 15}, $${offset + 16}, $${offset + 17}, $${offset + 18}, $${offset + 19}, $${offset 
+ 20}, 
        $${offset + 21}, $${offset + 22}, $${offset + 23}, $${offset + 24}, $${offset + 25}, $${offset + 26}, $${offset 
+ 27}, 
        $${offset + 28}, $${offset + 29}, $${offset + 30}, $${offset + 31}, $${offset + 32}, $${offset + 33}, $${offset 
+ 34}, $${offset + 35}, $${offset + 36}, $${offset + 37}),`;

      values.push(
        inscription.inscriptionId,
        inscription.number,
        inscription.content || null,
        inscription.sha || null,
        inscription.flagged || null,
        inscription.banned || null,
        inscription.content_type || null,
        inscription.lists || null,
        inscription.tags || null,
        inscription.error || null,
        inscription.sattributes || null,
        inscription.block || null,
        inscription.content_length || null,
        inscription.cycle || null,
        inscription.decimal || null,
        inscription.degree || null,
        inscription.epoch || null,
        inscription.genesis_address || null,
        inscription.genesis_fee || null,
        inscription.genesis_height || null,
        inscription.location || null,
        inscription.percentile || null,
        inscription.period || null,
        inscription.preview || null,
        inscription.rarity || null,
        inscription.sat || null,
        inscription.sat_name || null,
        inscription.sat_offset || null,
        toTimestamp(inscription.timestamp),
        inscription.attributes || null,
        inscription.name || null,
        inscription.officialcollection || null,
        inscription._links || null,
        inscription.address || null,
        inscription.offset || null,
        inscription.output || null,
        inscription.output_value || null
      );
    }
    placeholders = placeholders.slice(0, -1);

    const insertQuery = `
      INSERT INTO inscriptions (inscriptionid, number, content, sha, flagged, banned, content_type, lists, tags, error, 
sattributes,
        block, content_length, cycle, decimal, degree, epoch, genesis_address, genesis_fee, genesis_height, location, 
percentile, period,
        preview, rarity, sat, sat_name, sat_offset, timestamp, attributes, name, officialcollection, _links, address, 
"offset", output, output_value)
      VALUES ${placeholders}
      ON CONFLICT (number) DO NOTHING;
    `;

    console.log('insert Query:' + insertQuery); 
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
      const urls = await getInscriptionLinks(lowestMissingNumber);
      if (!urls) {
        logToFile('No more inscription links to fetch.');
        console.log('No more inscription links to fetch.');
        break;
      }

      //logToFile(`Fetching inscription links from URLs (updateInscriptions): ${urls}`);
      //console.log(`Fetching inscription links from URLs (updateInscriptions) : ${urls}`);

      let currentUrl = "";
      let inscriptions = [];
      for (let i = 0; i < BATCH_SIZE; i++) { 
        //console.log('i =', i);
        currentUrl = urls[i].href;
        //console.log('currentUrl (updateInscriptions) =', currentUrl);
        const currentInscription = await fetchInscriptionData(currentUrl);
        //console.log('currentInscription=', currentInscription);
        if (!currentInscription ) {
          logToFile(`No inscriptions fetched from: ${currentUrl}`);
          console.log(`No inscriptions fetched from: ${currentUrl}`);
        } else {
          try {
            inscriptions.push(currentInscription); 
            // console.log('success with push');
          } catch (error) {
            console.log(`Failed to push: ${error}`);
          }   
        }
      }
      //console.log('inscriptions =', inscriptions);

      //logToFile(`Fetched inscriptions: ${inscriptions}`);
      console.log(`Fetched inscriptions from: ${inscriptions}`);
      //logToFile(`Fetched ${inscriptions.length} inscriptions from: ${currentUrl}`);  
      //console.log(`Fetched ${inscriptions.length} inscriptions`);
      
      // Insertion logic here - 
      //console.log('=========================================================');
      await insertInscriptions(inscriptions);

      //logToFile(`Successfully inserted ${inscriptions.length} inscriptions.`);
      console.log(`Successfully inserted ${inscriptions.length} inscriptions.`);
      totalInsertedCount +=  BATCH_SIZE;
      console.log(`totalInsertedCount =`,  totalInsertedCount);
      // Move to the next URL
      //currentUrl = `https://ord.ordinalnovus.com/api${jsonData._links.next.href}`;

      // Update the current number for the next batch
      lowestMissingNumber += BATCH_SIZE;
    } catch (error) {
      logToFile(`Failed to update inscriptions: ${error}`);
      console.log(`Failed to update inscriptions: ${error}`);
    }
  }
}

updateInscriptions().catch(error => {
  console.error('Failed to start updating inscriptions:', error);
});
