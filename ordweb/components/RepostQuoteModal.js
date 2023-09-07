import React, { useState, useEffect, useRef } from "react";
import styles from "./RepostQuoteModal.module.css";
import axios from "axios";

export const RepostQuoteModal = ({
  onClose,
  buttonPosition,
  posted,
  twitterHandle,
  inscriptionid,
  quotedInscriptionContent,
  reposts,
  quoteModalOpen,
  setQuoteModalOpen,
  tableRef,
}) => {
  const [repostsCount, setRepostsCount] = useState(reposts);
  const [userReposted, setUserReposted] = useState(posted);
  const modalRef = useRef(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalPosition, setModalPosition] = useState({ top: 0, left: 0 });

  // useEffect(() => {
  //   const updateModalPosition = () => {
  //     const buttonPosition = modalRef.current.getBoundingClientRect();
  //     const newTop = buttonPosition.top + window.scrollY - 30 + "px";
  //     setModalPosition((prevPosition) => ({
  //       ...prevPosition,
  //       top: newTop,
  //     }));
  //   };

  //   window.addEventListener("scroll", updateModalPosition);
  //   updateModalPosition();

  //   return () => {
  //     window.removeEventListener("scroll", updateModalPosition);
  //   };
  // }, []);

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
        setUserReposted(posted); // Update userReposted state using the posted prop
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

  // useEffect(() => {
  //   console.log("changed - modalOpen=", modalOpen);
  //   if (modalOpen) {
  //     document.addEventListener("click", handleOutsideClick);
  //     console.log("opening listener");
  //   } else {
  //     document.removeEventListener("click", handleOutsideClick);
  //     console.log("removing listener - modalOpen=", modalOpen);
  //   }
  //   return () => {
  //     document.removeEventListener("click", handleOutsideClick);
  //     console.log("removing on return");
  //   };
  // }, [modalOpen, onClose]);

  return (
    <div
      ref={tableRef}
      className={`${styles["repost-quote-modal"]} ${
        buttonPosition ? styles["highlighted-row"] : ""
      }`}
      style={modalStyle}
    >
      <div className={styles["modal-content"]}>
        <button onClick={handleRepostOption}>Repost</button>
        <br />
        <button onClick={handleQuoteOption}>Quote</button>
      </div>
    </div>
  );
};
