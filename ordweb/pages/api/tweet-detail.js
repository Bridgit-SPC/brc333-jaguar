import { getTweetDetail } from '../../utils/dbFunctions';

export default async function handler(req, res) {
    if (req.method === 'GET') {
        console.log('got here');
      try {
        const inscriptionid = req.query.id;
        //const { id } = req.query; // Access the parameter from req.query
        console.log('req.query=', req.query);  
        console.log('Fetching tweet detail for inscriptionId:', id);
  
        //const tweetDetail = await getTweetDetail(id);
        //console.log('Tweet detail fetched:', tweetDetail);
  
        //res.status(200).json({ tweetDetail });
        //res.status(200);
      } catch (error) {
        console.error('Error fetching tweet state:', error);
        res.status(500).json({ error: 'An error occurred while fetching tweet state.' });
      }
    } else {
      res.status(405).json({ error: 'Method not allowed.' });
    }
  }

/*
export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const { id } = req.query; // Use destructuring to get the value from the URL parameter
      console.log('req.query=');  
      console.log('Fetching tweet detail for inscriptionId:', id);

      const tweetDetail = await getTweetDetail(id);
      console.log('Tweet detail fetched:', tweetDetail);

      res.status(200).json({ tweetDetail }); // Corrected the response to use tweetDetail
    } catch (error) {
      console.error('Error fetching tweet state:', error);
      res.status(500).json({ error: 'An error occurred while fetching tweet state.' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed.' });
  }
}
*/