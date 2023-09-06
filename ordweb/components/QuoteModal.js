import React, { useState } from 'react';
import '../app/globals.css';
import axios from 'axios';
import styles from './RepostQuoteModal.module.css';
import ParentComponent from './ParentComponent';        

export const QuoteModal = ({ 
    isOpen, 
    onClose, 
    inscriptionid, 
    quotedInscriptionContent,  
    twitterHandle,
    inscriptor,
    elapsedTime 
}) => {
  const [comment, setComment] = useState('');
   

  const handlePostClick = async () => {
    try {
      if (comment) {
        const requestData = {
          inscriptionid,
          user: twitterHandle,
          operation: 'quote', 
          content: comment,
        };

        //console.log('user=', twitterHandle);
        // Send the data as JSON in the request body
        const response = await axios.post('/api/response', requestData, {
          headers: {
            'Content-Type': 'application/json', // Set the content type to JSON
          },
        });

        console.log('Posting quote:', comment);
        console.log('Response:', response.data);
      }
    } catch (error) {
        console.error("Error Quoting tweet:", error);
    }
   onClose();
  };

  const handleCloseClick = () => {
    onClose(); // Close the QuoteModal
  };

  return (
    <div className={`${styles.modal} ${isOpen ? styles.open : ''}`}>
      <div className={styles.modalContent}>
        <div className={styles.modalHeader}>
          <h2>Quote the Inscription</h2>
          <button className={styles.closeButton} onClick={onClose}>
            &times;
          </button>
        </div>
        <div className={styles.user}>{twitterHandle}</div>
        <div className="customTextarea">
          <textarea
            placeholder="Add a comment"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />
        </div>
        <div className={styles.quoteHeader}>
          <div className={styles.avatar}></div>
          <div className={styles.inscriptionid}>
            <div className={styles.inscriptor}>{inscriptor}</div>
            <div className={styles.elapsedTime}>{elapsedTime}</div>
            <div className={styles.quotedContent}>{quotedInscriptionContent}</div>
          </div>
        </div>
        <div className={styles.postButton}>
          <button onClick={handlePostClick}>Post</button>
        </div>
      </div>
    </div>
  );
}

