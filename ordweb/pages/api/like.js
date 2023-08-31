// api/like.js
import { addResponse } from '../../utils/dbFunctions';

export default async (req, res) => {
if (req.method === 'POST') {
  const { nscriptionid, user = "unknown" } = req.body;
  const operation = 'like'; 
  
  try {
    const newResponse = await addResponse({
      parent,
      user,
      operation,
    });

    // Fetch updated likes count after adding the like
    const newLikesCount = calculateNewLikesCount(inscriptionid); 

    res.status(200).json({ newLikesCount });
  } catch (error) {
    res.status(500).json({ error: 'Error adding like' });
  }
};

