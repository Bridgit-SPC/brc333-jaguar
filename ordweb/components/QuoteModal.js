import React, { useState } from 'react';
import styles from './QuoteModal.module.css';

export const QuoteModal = ({ isOpen, onClose, inscriptionid, quotedInscriptionContent, twitterHandle }) => {
  const [comment, setComment] = useState('');

  const handlePostClick = async () => {
    try {
      if (comment) {
        console.log('twitterHandle at handleLike=',twitterHandle);
        console.log('inscriptionid=',inscriptionid);
        const response = await axios.post(`/api/response`, { 
          inscriptionid, 
          user: twitterHandle,    
          operation: 'repost', 
          content: comment, 
          media: media ? media : null, });
        console.log('repostsCount (before setRepostsCount) =',repostsCount);
        setLikesCount(repostsCount + 1);
        console.log('repostsCount (after setRepostsCount)=',repostsCount);
        setUserReposted(true);
      }
    } catch (error) {
        console.error("Error Quoting tweet:", error);
    }
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

