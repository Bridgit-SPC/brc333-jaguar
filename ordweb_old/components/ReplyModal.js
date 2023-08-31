import React, { useState } from 'react';
import 'styles/reply-modal.css';

export default function ReplyModal({
  isOpen,
  onClose,
  quotedInscriptionContent,
  walletAddress,
}) {
  const [reply, setReply] = useState('');

  const handlePostClick = () => {
    // Perform the post action here
    console.log('Posting reply:', reply);
    onClose();
  };

  return (
    <div className={`${styles.modal} ${isOpen ? styles.open : ''}`}>
      <div className={styles.modalContent}>
        <div className={styles.modalHeader}>
          <h2>Reply</h2>
          <button className={styles.closeButton} onClick={onClose}>
            &times;
          </button>
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
          <div className={styles.walletAddress}>{walletAddress}</div>
          <div className={styles.quotedContent}>{quotedInscriptionContent}</div>
        </div>
        <div className={styles.postButton}>
          <button onClick={handlePostClick}>Reply</button>
        </div>
      </div>
    </div>
  );
}

