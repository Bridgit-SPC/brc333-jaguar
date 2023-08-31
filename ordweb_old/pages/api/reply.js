import { addResponse } from '../../utils/dbFunctions';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { parent, user, content = null, media = null } = req.body;
    try {
      // Insert reply into responses table
      const response = await responses.addResponse({
        parent,
        user,
        operation: 'reply',
        content: content,
        media: media,
      });
      res.status(201).json(response);
    } catch (error) {
      console.error('Error adding reply:', error);
      res.status(500).json({ error: 'Error adding reply.' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed.' });
  }
}
