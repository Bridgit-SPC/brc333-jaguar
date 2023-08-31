import { addResponse } from '../../utils/dbFunctions';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { parent, user } = req.body;
    try {
      // Insert reply into responses table
      const response = await responses.addResponse({
        parent,
        user,
        operation: 'bookmark',
      });
      res.status(201).json(response);
    } catch (error) {
      console.error('Error adding bookmark:', error);
      res.status(500).json({ error: 'Error adding bookmark.' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed.' });
  }
}

