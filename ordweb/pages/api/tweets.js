import { getTweets } from '../../utils/dbFunctions'; // Import your database interaction functions

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const page = req.query.page || 1; 
      const limit = req.query.limit || 50;

      const inscriptions = await getTweets(page, limit);
      res.status(200).json({ inscriptions });
    } catch (error) {
      console.error('Error fetching inscriptions:', error);
      res.status(500).json({ error: 'An error occurred while fetching inscriptions.'});
    }
  } else {
    res.status(405).json({ error: 'Method not allowed.' });
  }
}

