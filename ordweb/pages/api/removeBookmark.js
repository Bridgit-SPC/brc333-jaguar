import { removeInteraction } from '../../utils/dbFunctions';

export default async (req, res) => {
// check for type of response
  const { interactionId, user } = req.body;
  const address = req.session.user.address; 

  try {
    await removeInteraction(interactionId, user);

    res.status(200).json();
  } catch (error) {
    res.status(500).json({ error: 'Error removing interaction' });
  }
};

