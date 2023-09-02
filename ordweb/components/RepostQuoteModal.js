import React, { useState, useEffect, useRef } from "react";
import styles from "./RepostQuoteModal.module.css"; 
import axios from "axios";

export const RepostQuoteModal = ({ onClose, buttonPosition, userReposted, twitterHandle, inscriptionid, quotedInscriptionContent }) => {
  const modalRef = useRef(null);
  const [repostQuoteModalOpen, setRepostQuoteModalOpen] = useState(false);
  console.log("buttonPosition:", buttonPosition); 

  const handleRepostOption = async () => {
    if (!userReposted) {
      try {
        console.log('twitterHandle at handleRepost=', twitterHandle);
        console.log('inscriptionid=', inscriptionid);
        const response = await axios.post(`/api/repost`, { inscriptionid, user: twitterHandle });
        console.log('repostsCount (before setRepostsCount) =', repostsCount);
        setRepostsCount(repostsCount + 1);
        console.log('repostsCount (after setRepostsCount)=', repostsCount);
        setUserReposted(true);
      } catch (error) {
        console.error("Error reposting tweet:", error);
      }
    } else {
        // Send a DELETE request to remove the repost
        axios
          .delete(`/api/removeResponse`, { data: { interactionId: userRepostedId } })
          .then((response) => {
            // Update repostsCount and userReposted states based on the server response
            setRepostsCount(repostsCount-1);
            setUserReposted(false);
          })
          .catch((error) => {
            console.error("Error reposting tweet:", error);
          });
    }
    onClose();
  };

  const handleQuoteOption = () => {
    // Handle Quote logic here
    // Close the modal after quoting
    onClose();
  };

  const modalStyle = {
    top: buttonPosition?.top + window.scrollY - 30 + "px",
    left: buttonPosition?.left -30 + "px",
  };

const handleOutsideClick = (e) => {
  // Check if the click occurred outside of the modal content
  if (repostQuoteModalOpen && modalRef.current && !modalRef.current.contains(e.target)) {
    onClose(); // Close the modal
  }
};

useEffect(() => {
  // Add the event listener when the component mounts
  document.addEventListener('click', handleOutsideClick);

  // Clean up the event listener when the component unmounts
  return () => {
    document.removeEventListener('click', handleOutsideClick);
  };
}, [repostQuoteModalOpen, onClose]);

  console.log("modalStyle:", modalStyle); // Add this log statement

return (
    <div
      ref={modalRef}
      className={`${styles["repost-quote-modal"]} ${
        buttonPosition ? styles["highlighted-row"] : ""
      }`}
      style={modalStyle}
    >
      <div className={styles["modal-content"]}>
          <button onClick={handleRepostOption}>Repost</button><br></br>
          <button onClick={handleQuoteOption}>Quote</button>
      </div>
    </div>
  ); 

  {quoteModalOpen && (
    <QuoteModal
      isOpen={quoteModalOpen}
      onClose={() => setQuoteModalOpen(false)}
      inscriptionid={inscriptionid}
      quotedInscriptionContent={quotedInscriptionContent}
      twitterHandle={twitterHandle}
    />
  )}
};




