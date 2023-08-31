import { getTweetState } from '../../utils/dbFunctions';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const inscriptionid = req.query.id;
      const user = req.query.user;
      //console.log('Fetching tweet state for inscriptionid:', inscriptionid);

      const tweetState = await getTweetState(inscriptionid,user);
      //console.log('Tweet state fetched:', tweetState);

      res.status(200).json({ tweetState });
    } catch (error) {
      console.error('Error fetching tweet state:', error);
      res.status(500).json({ error: 'An error occurred while fetching tweet state.' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed.' });
  }
}
