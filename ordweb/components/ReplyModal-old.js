import React, { useState } from 'react';
import '../app/globals.css'; 
import axios from 'axios';
import styles from './ReplyModal.module.css';

export function ReplyModal({
  isOpen,
  onClose,
  twitterHandle,
  inscriptionid,
  quotedInscriptionContent
}) {
  //console.log('twitterHandle=',twitterHandle);
  //console.log('inscriptionid=', inscriptionid);
  const [reply, setReply] = useState('');
  const [media, setMedia] = useState(null);

  const handlePostClick = async () => {
    try {
      const formData = new FormData();
      formData.append('inscriptionid', inscriptionid);
      formData.append('user', twitterHandle);
      formData.append('content', reply);
      if (media) {
        formData.append('media', media);
      }

      for (const entry of formData.entries()) {
        const [key, value] = entry;
        console.log(`${key}: ${value}`);
      }

      const response = await axios.post('/api/reply', formData, {
        headers: {
          'Content-Type': 'multipart/form-data', // Set the correct content type for form data
        },
      });
    } catch (error) {
      console.error('Error replying to tweet:', error);
    }
    console.log('Posting reply:', reply);
    onClose();
  };

  const handleMediaChange = (e) => {
    const selectedMedia = e.target.files[0];
  
    // Check if the selected file exceeds the maximum size (1 MB)
    if (selectedMedia && selectedMedia.size > 1048576) {
      alert('File size exceeds the maximum allowed size (1 MB). Please select a smaller file.');
      // Clear the input field
      e.target.value = null;
    } else {
      setMedia(selectedMedia);
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
        <div className={styles.mediaInput}>
          <label htmlFor="mediaUpload">Upload Media:</label>
          <input
            type="file"
            id="mediaUpload"
            accept="image/*, video/*"
            onChange={handleMediaChange}
            size="1048576" 
          />
        </div>
        <div className={styles.quotedInscription}>
          <div className={styles.avatar}></div>
          <div className={styles.inscriptionid}>{inscriptionid}</div>
          <div className={styles.quotedContent}>{quotedInscriptionContent}</div>
        </div>
        <div className={styles.postButton}>
          <button onClick={handlePostClick}>Post</button>
          <button onClick={onClose}>X</button>
        </div>
      </div>
    </div>
  );
}

