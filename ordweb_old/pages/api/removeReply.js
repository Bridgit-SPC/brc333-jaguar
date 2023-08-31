import { removeInteraction } from '../../utils/dbFunctions';

export default async (req, res) => {
  const { interactionId, user } = req.body;
  const address = req.session.user.address; 

  try {
    await removeInteraction(interactionId);

    // Fetch updated replies count after removing the reply
    const newLRepliesCount = calculateNewRepliesCount(inscriptionid); 

    res.status(200).json({ newRepliesCount });
  } catch (error) {
    res.status(500).json({ error: 'Error removing reply' });
  }
};

