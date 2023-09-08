import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { ReplyModal } from "./ReplyModal";
import ParentComponent from "./ParentComponent";
import moment from "moment-timezone";
import convertElapsedTime from "../utils/datetimeUtils";
import styles from "./Tweet.module.css";
import { formatAddress, copyToClipboard } from '../utils/display';
let user;

export function Tweet({
  inscriptionid,
  genesis_address,
  timestamp,
  number,
  twitterClientId,
  twitterClientSecret,
  twitterRedirectUri,
  baseUrl,
  loggedIn,
  twitterHandle
}) {
  const [repostButtonPosition, setRepostButtonPosition] = useState(null);
  const [loginError, setLoginError] = useState(false);
  const [content, setContent] = useState("");
  const [likesCount, setLikesCount] = useState(0);
  const [repliesCount, setRepliesCount] = useState(0);
  const [repostsCount, setRepostsCount] = useState(0);
  const [bookmarksCount, setBookmarksCount] = useState(0);
  const [userLiked, setUserLiked] = useState(false);
  const [userReposted, setUserReposted] = useState(false);
  const [userBookmarked, setUserBookmarked] = useState(false);
  const [replyModalOpen, setReplyModalOpen] = useState(false);
  const [quoteModalOpen, setQuoteModalOpen] = useState(false);
  const [userLikedId, setUserLikedId] = useState(false);
  const [userBookmarkedId, setUserBookmarkedId] = useState(false);
  const [userRepostedId, setUserRepostedId] = useState(false);
  const [repostQuoteModalOpen, setRepostQuoteModalOpen] = useState(false);
  const [modalPosition, setModalPosition] = useState({ top: 0, left: 0 });
  const [clickedButton, setClickedButton] = useState(null);
  const [buttonPosition, setButtonPosition] = useState(null);
  const buttonRef = useRef(null);
  const elapsedTime = convertElapsedTime(timestamp);
  const inscriptionNumber = number;

  const tableRef = useRef(null);
  function useOutsideAlerter(ref, setRepostQuoteModalOpen) {
    useEffect(() => {
      function handleClickOutside(event) {
        if (ref.current && !ref.current.contains(event.target)) {
          setRepostQuoteModalOpen(false);
        }
      }
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }, [tableRef, setRepostQuoteModalOpen]);
  }
  useOutsideAlerter(tableRef, setRepostQuoteModalOpen);

  // Fetch content from the server
  useEffect(() => {
    axios
      .get(`https://ord.ordinalnovus.com/content/${inscriptionid}`)
      .then((response) => {
        setContent(response.data);
      })
      .catch((error) => {
        console.error("Error fetching content:", error);
      });
  }, [inscriptionid]);

  useEffect(() => {
    //console.log('twitterHandle=',twitterHandle);
    axios
      .get(
        `/api/tweet-state?id=${inscriptionid}&user=${
          twitterHandle || "unknown"
        }`
      )
      .then((response) => {
        const tweetState = response.data.tweetState[0];
        console.log("tweetState=", tweetState);
        setUserLiked(tweetState.userliked);
        setUserReposted(tweetState.userreposted);
        setUserBookmarked(tweetState.userbookmarked);
        setLikesCount(parseInt(tweetState.likescount));
        setRepostsCount(parseInt(tweetState.repostscount));
        setRepliesCount(parseInt(tweetState.repliescount));
        setBookmarksCount(parseInt(tweetState.bookmarkscount));
        setUserLikedId(tweetState.userlikedid);
        setUserRepostedId(tweetState.userrepostedid);
        setUserBookmarkedId(tweetState.userbookmarkedid);
      })
      .catch((error) => {
        console.error("Error fetching user state and counts:", error);
      });
  }, [inscriptionid, twitterClientId, twitterHandle, twitterRedirectUri]);

  const handleLikeClick = async () => {
    //console.log("loggedIn=", loggedIn);
    console.log("likesCount (before)=", likesCount);
    console.log("userLiked=", userLiked);
    if (!loggedIn) {
      signIn();
    } else {
      if (!userLiked) {
        try {
          //console.log('twitterHandle at handleLike=',twitterHandle);
          //console.log('inscriptionid=',inscriptionid);
          const response = await axios.post(`/api/like`, {
            inscriptionid,
            user: twitterHandle,
          });
          //setLikesCount(likesCount + 1);
          setLikesCount((prevLikesCount) => prevLikesCount + 1);
          setUserLiked(true);
        } catch (error) {
          console.error("Error liking tweet:", error);
        }
      } else {
        // Send a DELETE request to remove the like
        axios
          .delete(`/api/removeResponse`, {
            data: { interactionId: userLikedId },
          })
          .then((response) => {
            // Update likesCount and userLiked states based on the server response
            setLikesCount((prevLikesCount) => prevLikesCount - 1);
            //setLikesCount(likesCount-1);
            setUserLiked(false);
          })
          .catch((error) => {
            console.error("Error unliking tweet:", error);
          });
      }
    }
  };

  useEffect(() => {}, [
    likesCount,
    userLiked,
    repostsCount,
    userReposted,
    bookmarksCount,
    userBookmarked,
    repliesCount,
  ]);

  // Handle reply button click
  const handleReplyClick = () => {
    if (!loggedIn) {
      signIn();
    } else {
      setReplyModalOpen(true);
    }
  };

  useEffect(() => {}, [likesCount, userLiked]);

  // Handle repost button click
  const handleRepostClick = (e) => {
    if (!loggedIn) {
      signIn();
    } else {
      const buttonPosition = {
        top: e.clientY + window.scrollY,
        left: e.clientX,
      };
      setButtonPosition(buttonPosition);
      setRepostQuoteModalOpen(true);
      console.log("Setting repostQuoteModalOpen=", repostQuoteModalOpen);
    }
  };

  function handleShareClick() {
    console.log("baseUrl=", baseUrl);
    copyToClipboard(baseUrl);
  }

  const renderContent = () => {
    if (typeof content === "string") {
      // If content is plain text
      return <p className={styles.textStyles}>{content}</p>;
    } else if (typeof content === "object" && content.type === "image") {
      // If content is an image
      return <img src={content.url} alt="Content" />;
    } else if (typeof content === "object" && content.type === "video") {
      // If content is a video clip
      return (
        <video controls>
          <source src={content.url} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      );
    } else if (typeof content === "object" && content.type === "html") {
      // If content is HTML
      return <div dangerouslySetInnerHTML={{ __html: content.html }} />;
    } else {
      // For other types of content or objects, you can display the JSON representation
      return (
        <pre className={styles.jsonStyles}>
          {JSON.stringify(content, null, 2)}
        </pre>
      );
    }
  };

  //console.log('repostQuoteModalOpen=', repostQuoteModalOpen);

  return (
    <div className={styles["tweet"]}>
      <div className={styles["tweet-controller"]}>
      <div className={styles["number"]}>{number}</div>
      <div className={styles["genesisAddress"]}>{formatAddress(genesis_address)}</div>
      <div className={styles["elapsedTime"]}>{elapsedTime}</div>
      </div>
      {renderContent()}

      <div className={styles["action-icons"]}>
        <button onClick={handleReplyClick}>
          <img src="/images/reply.png" alt="Reply" />
          <p>{repliesCount}</p>
        </button>
        <button onClick={(e) => handleRepostClick(e)}>
          <img
            src={
              userReposted ? "/images/repost-active.png" : "/images/repost.png"
            }
            alt="Repost"
          />
          <p>{repostsCount}</p>
        </button>
        <button onClick={handleLikeClick}>
          <img
            src={userLiked ? "/images/like-active.png" : "/images/like.png"}
            alt="Like"
          />
          <p>{likesCount}</p>
        </button>
        <button onClick={handleShareClick}>
        <img
            src="/images/share2.png"
            alt="Share"
          />
        </button>
      </div>

      {replyModalOpen && (
        <ReplyModal
          isOpen={replyModalOpen}
          onClose={() => setReplyModalOpen(false)}
          twitterHandle={twitterHandle}
          inscriptionid={inscriptionid}
          quotedInscriptionContent={renderContent()}
          inscriptor={genesis_address}
          elapsedTime={elapsedTime}
          inscriptionNumber={number}
        />
      )}

      {repostQuoteModalOpen && (
        <ParentComponent
          tableRef={tableRef}
          onClose={() => setRepostQuoteModalOpen(false)}
          buttonPosition={buttonPosition}
          reposted={userReposted}
          twitterHandle={twitterHandle}
          inscriptionid={inscriptionid}
          quotedInscriptionContent={renderContent()}
          reposts={repostsCount}
          inscriptor={genesis_address}
          elapsedTime={elapsedTime}
          inscriptionNumber={number}
        />
      )}
    </div>
  );
}
