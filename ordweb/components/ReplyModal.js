import React, { useState } from 'react';
import '../app/globals.css'; 
import axios from 'axios';
import styles from './ReplyModal.module.css';

export function ReplyModal({
  isOpen,
  onClose,
  twitterHandle,
  inscriptionid,
  quotedInscriptionContent,
  inscriptor,
  elapsedTime,
  inscriptionNumber
}) {
  const [reply, setReply] = useState('');
  const [replyText, setReplyText] = useState(''); 

  const handleTextChange = (event) => {
    setReplyText(event.target.value);
  };

  const handlePostClick = async () => {
    try {
      const requestData = {
        inscriptionid,
        user: twitterHandle,
        operation: 'reply',
        content: reply,
      };

      // Send the data as JSON in the request body
      const response = await axios.post('/api/response', requestData, {
        headers: {
          'Content-Type': 'application/json', // Set the content type to JSON
        },
      });

      console.log('Posting reply:', reply);
      console.log('Response:', response.data);

      onClose();
    } catch (error) {
      console.error('Error replying to tweet:', error);
    }
  };

  return (
    <div className={`modal ${isOpen ? 'open' : ''}`}>
      <div className="modalContent">
        <div className="modalHeader">
          <h2>Reply</h2>
          <button className={styles.closeButton} onClick={onClose}>X</button>
        </div>
        <div className={styles.commentInput}>
          <textarea
            className={styles.customTextarea} 
            placeholder="Post your reply"
            value={reply}
            onChange={(e) => setReply(e.target.value)}
          ></textarea>
        </div>
        <div className={styles.quotedInscription}>
          <div className={styles.avatar}></div>
          <div className={styles.inscriptionNumber}>{inscriptionNumber}</div>
          <div className={styles.quotedContent}>{quotedInscriptionContent}</div>
        </div>
        <div className={styles.postButton}>
          <button onClick={handlePostClick} disabled={!replyText}>Post</button>
        </div>
      </div>
    </div>
  );
}

