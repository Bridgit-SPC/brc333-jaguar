import React, { useState } from 'react';
import styles from './QuoteModal.module.css';

export default function QuoteModal({ isOpen, onClose, quotedInscriptionContent, walletAddress 
}) {
  const [comment, setComment] = useState('');

  const handlePostClick = () => {
    // Perform the post action here
    console.log('Posting comment:', comment);
    onClose();
  };

  return (
    <div className={`${styles.modal} ${isOpen ? styles.open : ''}`}>
      <div className={styles.modalContent}>
        <div className={styles.modalHeader}>
          <h2>Quote Inscription</h2>
          <button className={styles.closeButton} onClick={onClose}>
            &times;
          </button>
        </div>
        <div className={styles.commentInput}>
          <textarea
            placeholder="Post a comment"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />
        </div>
        <div className={styles.quoteHeader}>
          <div className={styles.avatar}></div>
          <div className={styles.quotedInscription}>
            <div className={styles.walletAddress}>{walletAddress}</div>
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

