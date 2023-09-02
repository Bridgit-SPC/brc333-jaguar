import { removeInteraction } from '../../utils/dbFunctions';

export default async (req, res) => {
  const { interactionId } = req.body;

  try {
    await removeInteraction(interactionId);

    res.status(200).json();
  } catch (error) {
    res.status(500).json({ error: `Error removing interaction ${interactionId}`});
  }
};

