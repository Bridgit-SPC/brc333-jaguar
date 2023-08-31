import { removeInteraction } from '../../utils/dbFunctions';

export default async (req, res) => {
  const { interactionId, user } = req.body;

  try {
    await removeInteraction(interactionId,user);
   
    // Fetch updated reposts count after removing the repost
    const newLRepostsCount = calculateNewRepostsCount(inscriptionid); 

    res.status(200).json({ newRepostsCount });
  } catch (error) {
    res.status(500).json({ error: 'Error removing repost' });
  }
};    
