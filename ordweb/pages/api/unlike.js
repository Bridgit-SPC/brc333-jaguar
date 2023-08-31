import { removeInteraction } from '../../utils/dbFunctions';

export default async (req, res) => {
  const { interactionId, user } = req.body;

  try {
    await removeInteraction(interactionId, user);

    // Fetch updated likes count after removing the like
    const newLikesCount = calculateNewLikesCount(inscriptionid); 

    res.status(200).json({ newLikesCount });
  } catch (error) {
    res.status(500).json({ error: 'Error removing like' });
  }
};

