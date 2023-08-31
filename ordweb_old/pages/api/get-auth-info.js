const db = require('../../utils/database');

const handler = async (req, res) => {
  if (req.method === 'GET') {
    const { state } = req.query;
    try {
      // Retrieve codeVerifier and state from the database based on the provided state
      const results = await db.query(
        'SELECT code_verifier, state, code_challenge FROM oauth_tokens WHERE state = $1',
        [state]
      );

      if (results.rowCount === 1) {
         const { code_verifier, state, code_challenge } = results.rows[0];
         res.status(200).json({ codeVerifier: code_verifier, state: state, codeChallenge: code_challenge });
      } else {
         //console.log('results.rowCount=', results.rowCount);
         res.status(404).json({ message: 'OAuth info not found.' });
      }
    } catch (error) {
      console.error('Error retrieving authorization info:', error);
      res.status(500).json({ message: 'Internal server error.' });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed.' });
  }
};

export default handler;

