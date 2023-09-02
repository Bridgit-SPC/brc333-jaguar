const axios = require('axios');
const { Pool } = require('pg');
const BATCH_SIZE = 100;
const fs = require('fs');

require('dotenv').config();
const directoryPath = process.env.ORDWEB_ASSET_PATH;

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

let emailSent = false;
const nodemailer = require("nodemailer");

// Create a transporter using your email service credentials
const transporter = nodemailer.createTransport({
  service: "Zoho",
  host: "smtp.zoho.com",
  port: 465, // Use 465 for SSL or 587 for TLS
  secure: true, // Set to true for SSL or false for TLS
  auth: {
    user: process.env.EMAIL,
    pass: process.env.EMAIL_PW
  }
});

async function sendErrorEmail(errorMessage) {
 if (!emailSent) {
  // Define email options
  const mailOptions = {
    from: "daveed@bridgit.io",
    to: "daveed@bridgit.io", // Your email address
    subject: `Script Error Notification: ${process.pid}`,
    text: errorMessage
  };

  try {
    // Send the email
    await transporter.sendMail(mailOptions);
    console.log("Error notification email sent successfully. ", new Date());
  } catch (error) {
    console.error("Error sending error notification email:", error, ' ', new Date());
  }
 }
}

const contentTypeToExtension = {
  "application/brotli": "br",
  "application/gzip": "gz",
  "application/javascript": "js",
  "application/json": "json",
  "application/json;charset=utf-8": "json",
  "application/macbinary": "bin",
  "application/msword": "doc",
  "application/octet-stream": "bin",
  "application/pdf": "pdf",
  "application/pgp-signature": "sig",
  "application/protobuf; proto=34c7fd3d8584f263e447aa95839c1feb52bf5fba88b2f784b876de004767a665i0": "proto",
  "application/protobuf; proto=c0a29763e2c3d0a8a1246df8a86c194476a2932c32aff998c3b436d04d7b568ei0": "proto",
  "application/rar": "rar",
  "application/rtf": "rtf",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": "xlsx",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "docx",
  "application/x-gzip": "gz",
  "application/x-javascript": "js",
  "application/x-zip-compressed": "zip",
  "application/zip": "zip",
  "audio/midi": "midi",
  "audio/mpeg": "mp3",
  "audio/ogg": "ogg",
  "audio/wav": "wav",
  "audio/x-m4a": "m4a",
  "font/ttf": "ttf",
  "image/avif": "avif",
  "image/bmp": "bmp",
  "image/gif": "gif",
  "image/heic": "heic",
  "image/jp2": "jp2",
  "image/jpeg": "jpg",
  "image/jpg": "jpg",
  "image/pict": "pict",
  "image/png": "png",
  "image/png;": "png",
  "image/svg+xml": "svg",
  "image/svg+xml;charset=utf-8": "svg",
  "image/vnd.microsoft.icon": "ico",
  "image/webp": "webp",
  "model/gltf-binary": "gltf",
  "multipart/related": "multipart",
  "ordtext/plain;charset=utf-8": "txt",
  "text/css": "css",
  "text/css;charset=utf-8": "css",
  "text/csv": "csv",
  "text/html": "html",
  "text/html;charset=utf8": "html",
  "text/html;charset=utf-8": "html",
  "text/javascript": "js",
  "text/javascript;charset=utf-8": "js",
  "text/markdown": "md",
  "text/markdown;charset=utf-8": "md",
  "text/plain": "txt",
  "text/plain; charset=utf-8": "txt",
  "text/plain;charset=utf-8": "txt",
  "text/plain; charset=UTF-8": "txt",
  "text/plain;charset=UTF-8": "txt",
  "text/rtf": "rtf",
  "text/shadow": "shd",
  "text/xml": "xml",
  "video/mp4": "mp4",
  "video/quicktime": "mov",
  "video/webm": "webm"
};

// Function to get file extension from content type
function getFileExtension(contentType) {
  // Return the extension or a default value if not found
  return contentTypeToExtension[contentType] || "unknown";
}

// Function to save content to a file
async function saveContentToFile(content, contentType, inscriptionNumber) {
  const extension = getFileExtension(contentType);
  const fileName = `${inscriptionNumber}.${extension}`;
  const filePath = `${directoryPath}/${fileName}`;
  //console.log('filePath=',filePath);
  try {
    await fs.promises.writeFile(filePath, content);
    console.log(`Saved content to ${filePath}`);
  } catch (error) {
    console.error(`Error saving content to ${filePath}: ${error}`);
  }
}

async function getInscriptionData(id) {
  try {
    const response = await axios.get(`https://ord.ordinalnovus.com/content/${id}`, { responseType: 'arraybuffer' });

    if (!response || response.status !== 200) {
      console.error(`Error fetching inscription data. Status code: ${response ? response.status : 'Unknown'}`);
      return null;
    }

    const contentType = response.headers['content-type'];
    const content = response.data;

    return { inscriptionId: id, content, contentType }; // Include content type in the response
  } catch (error) {
    console.error('Error fetching inscription data:', error);
    return null;
  }
}

const startingPoint = process.argv[2] || 2100000000000000;
const PROCESS_BATCH_SIZE = process.argv[3] || 100;

async function getHighestMissingIds() {
  let client;
  try {
    client = await pool.connect();
    const missingQuery = `
           SELECT inscriptionid as id, number
           FROM inscriptions
           WHERE content is null
           AND number < ${startingPoint}
           ORDER BY number DESC
           LIMIT ${PROCESS_BATCH_SIZE}
    `;
    const res = await client.query(missingQuery);
    if (res != null && res.rows.length > 0) {
      //console.log('res.rows=', res.rows);
      return res.rows;
    } else {
      console.log('Not able to get rows with missing content ', new Date());
      return null;
    }
  } catch (error) {
    console.error('Error getting rows with missing content:', error, ' ', new Date());
    return null;
  } finally {
    client.release();
  }
}

async function
updateInscriptionContent(inscriptions) {
const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const values = [];
    let placeholders1 = '';
    let placeholders2 = '';
    console.log(inscriptions.length,' inscriptions starting with ',inscriptions[0].inscriptionId);
    for (let i = 0; i < inscriptions.length; i++) {
      const inscription = inscriptions[i];
      const offset = i * 2;

      placeholders1 += `WHEN inscriptionid = $${offset + 1} THEN $${offset + 2} `;
      placeholders2 += `$${offset + 1},`; 

      values.push(
        inscription.inscriptionId,
        JSON.stringify(inscription.content)
      );
    }
    placeholders2 = placeholders2.slice(0, -1);

    const updateQuery = `
    UPDATE inscriptions
    SET content = CASE
    ${placeholders1}
    END
    WHERE inscriptionid IN (${placeholders2})
    RETURNING *;
    `;

    //console.log(`update Query: ${updateQuery}`);
    //console.log(`values ${values}`);

    let res = [];
    try {
      res = await client.query(updateQuery, values);
      //console.log('res.rows=',res.rows);
      await client.query('COMMIT');
      //console.log('Transaction committed successfully.');
    } catch (err) {
      console.error('Error while committing the transaction:', err);
    }

    if (res.rowCount == 0) {
      console.log('No inscriptions were updated. The given inscriptions might already exist');
    } else {
      console.log(`Updated ${res.rowCount} inscriptions successfully`);
    }
    return res.rowCount;
   } catch (err) {
      console.error('Error while committing the transaction:', err, ' ', new Date());
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

let totalTextInsertedCount = 0;
let totalMediaInsertedCount = 0;

const logFilePath = 'log.txt';

async function updateInscriptions() {
  while (true) {
    try {
      const ids = await getHighestMissingIds();
      if (!ids) {
        console.log('No more missing inscription content. ', new Date());
        if (!emailSent) {
          await sendErrorEmail(`No more missing inscription content`);
        }
        break;
      }

      let currentId = '';
      let inscriptions = [];
      console.log(`Starting with ${ids[0].number} at ${new Date()}`); 
      for (let i = 0; i < ids.length; i++) {
        currentId = ids[i].id;
        const currentInscription = await getInscriptionData(currentId);
        if (!currentInscription) {
          console.log(`No inscriptions fetched from: ${currentId} ${new Date()}`);
        } else {
          try {
            inscriptions.push(currentInscription);
          } catch (error) {
            console.log(`Failed to push: ${error} ${new Date()}`);
          }
        }
      }

      //console.log('inscriptions=', inscriptions);

      let textInscriptions = [];
      let numberOfTextInscriptions = 0;
      for (const inscription of inscriptions) {
        if (inscription.contentType) { 
          const extension = contentTypeToExtension[inscription.contentType];
          if (extension && (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'avif', 'webp', 'ico', 'jp2', 'heic', 'pict', 'svg','mp3', 'ogg', 'wav', 'm4a', 'midi', 'mp4', 'mov', 'webm','pdf', 'doc', 'docx', 'rtf', 'xlsx', 'zip' ,'rar']).includes(extension)) {
          // Save non-text content to the file system
          await saveContentToFile(inscription.content, inscription.contentType, inscription.inscriptionId);
          textInscriptions.push({ ...inscription, content: `${inscription.inscriptionId}.${extension}` });
        } else {
          // Convert the buffer to a string
          const textContent = inscription.content.toString('utf-8'); // Assuming UTF-8 encoding
          //console.log('textContent =',textContent);
          textInscriptions.push({ ...inscription, content: textContent });
          numberOfTextInscriptions += 1;
        }
       }
      }

      //console.log('textInscriptions=',textInscriptions);
      await updateInscriptionContent(textInscriptions);

      console.log(`Successfully updated ${inscriptions.length} inscriptions. ${new Date()}`);
      console.log(`Text: ${numberOfTextInscriptions}  Media: ${inscriptions.length - numberOfTextInscriptions}`);
      totalTextInsertedCount += numberOfTextInscriptions;
      totalMediaInsertedCount += inscriptions.length - numberOfTextInscriptions;
      console.log('total updated text/media count =', totalTextInsertedCount,'/', totalMediaInsertedCount);
    } catch (error) {
      console.log(`Failed to update inscriptions: ${error}`);
      await sendErrorEmail(`${process.pid} Script error occurred:\n\n${error.stack}`);
    }
  }
}

updateInscriptions().catch(error => {
  console.error('Failed to start updating inscriptions:', error, ' ',new Date());
});

