import { addResponse } from '../../utils/dbFunctions';

export default async (req, res) => {
//console.log('req=',req);
if (req.method === 'POST') {
  const { inscriptionid, user } = req.body;
  const operation = 'like'; 
  console.log('inscriptionid=', inscriptionid);
  
  try {
    const newResponse = await addResponse({
      parent: inscriptionid,
      user,
      operation,
      content: null,
      media: null
    });
    console.log('newResponse=',newResponse); 
    res.status(200).json();
  } catch (error) {
    res.status(500).json({ error: `Error adding like: ${error.message}` });  }
 } 
};
