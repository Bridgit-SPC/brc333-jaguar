const db = require('../../utils/database'); 

module.exports = async (req, res) => {
  try {
    const { codeVerifier, state, codeChallenge } = req.body; // Extract data from the request

    // Save data to the database
    const query = `
      INSERT INTO oauth_tokens (code_verifier, state, code_challenge) 
      VALUES ($1, $2, $3)
    `;
    await db.query(query, [codeVerifier, state, codeChallenge]);

    res.status(200).json({ message: 'Authorization info saved successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'An error occurred' });
  }
};

