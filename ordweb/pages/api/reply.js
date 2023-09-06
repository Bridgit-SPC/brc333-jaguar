import { addResponse } from '../../utils/dbFunctions';

export default async (req, res) => {
  console.log('req=',req.body);

  if (req.method === 'POST') {
    try {
      const { inscriptionid, user, content } = req.body;
      const operation = 'reply';

      console.log('user (reply.js)=', user); 
      console.log('inscriptionid (reply.js)=', inscriptionid);    
      console.log('content (reply.js)=', content);

      const newResponse = await addResponse({
        parent: inscriptionid,
        user,
        operation,
        content: content || null,
        media: null, // Remove media from this code path for now
      });
      console.log('newResponse=', newResponse);
      
      // Send a success response
      res.status(200).json({ message: 'Reply added successfully' });
    } catch (error) {
      // Handle errors and send an error response
      console.error(error);
      res.status(500).json({ error: `Error adding reply: ${error.message}` });
    }
  }
};

