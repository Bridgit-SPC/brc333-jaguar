import React, { useState, useEffect, useRef } from "react";
import styles from "./RepostQuoteModal.module.css";
import axios from "axios";

export const RepostQuoteModal = ({
  onClose,
  buttonPosition,
  reposted,
  userRepostedId,
  twitterHandle,
  inscriptionid,
  quotedInscriptionContent,
  reposts,
  quoteModalOpen,
  setQuoteModalOpen,
  tableRef,
  parentOnClose,
}) => {
  const [repostsCount, setRepostsCount] = useState(reposts);
  const [userReposted, setUserReposted] = useState(reposted);
  const modalRef = useRef(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalPosition, setModalPosition] = useState({ top: 0, left: 0 });
  const repostButtonClass = userReposted ? styles.reposted : styles.repost;

  const handleRepostOption = async () => {
    if (!userReposted) {
      try {
        console.log("twitterHandle at handleRepost=", twitterHandle);
        console.log("inscriptionid=", inscriptionid);
        const response = await axios.post(`/api/repost`, {
          inscriptionid,
          user: twitterHandle,
        });
        console.log("repostsCount (before setRepostsCount) =", repostsCount);
        setRepostsCount(repostsCount + 1);
        console.log("repostsCount (after setRepostsCount)=", repostsCount);
        setUserReposted(reposted); // Update userReposted state using the posted prop
      } catch (error) {
        console.error("Error reposting tweet:", error);
      }
    } else {
      // Send a DELETE request to remove the repost
      axios
        .delete(`/api/removeResponse`, {
          data: { interactionId: userRepostedId },
        })
        .then((response) => {
          // Update repostsCount and userReposted states based on the server response
          setRepostsCount(repostsCount - 1);
          setUserReposted(false);
        })
        .catch((error) => {
          console.error("Error reposting tweet:", error);
        });
    }
    setModalOpen(false);
    onClose();
    parentOnClose();
  };

  const handleQuoteOption = () => {
    console.log("handleQuoteOption");
    setQuoteModalOpen(true);
    setModalOpen(false);
    onClose();
  };

  console.log("before modalStyle");
  const modalStyle = {
    top: buttonPosition?.top - window.scrollY - 40 + "px",
    left: buttonPosition?.left - 55 + "px",
  };

  const handleOutsideClick = (e) => {
    if (modalRef.current && !modalRef.current.contains(e.target)) {
      console.log("e.target", e.target);
      onClose();
    }
  };

  return (
    <div
      ref={tableRef}
      className={`${styles["repost-quote-modal"]} ${
        buttonPosition ? styles["highlighted-row"] : ""
      }`}
      // style={modalStyle}
    >
      <div className={styles["modal-content"]}>
      <button className={repostButtonClass} onClick={handleRepostOption}>Repost</button>
        <br />
        <button onClick={handleQuoteOption}>Quote</button>
      </div>
    </div>
  );
};
