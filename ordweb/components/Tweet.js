import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import "../styles/reply-modal.css";
import { ReplyModal } from "./ReplyModal";
import { QuoteModal } from "./QuoteModal";
import { RepostQuoteModal } from "./RepostQuoteModal";
import { getSession, signIn, signOut, useSession } from "next-auth/react";
let user;

export function Tweet({
  inscriptionid,
  genesis_address,
  number,
  twitterClientId,
  twitterClientSecret,
  twitterRedirectUri,
}) {
  const [repostButtonPosition, setRepostButtonPosition] = useState(null);
  const [loggedIn, setLoggedIn] = useState(false);
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
  const [twitterHandle, setTwitterHandle] = useState('');
  const [repostQuoteModalOpen, setRepostQuoteModalOpen] = useState(false);
  const [modalPosition, setModalPosition] = useState({ top: 0, left: 0 });
  const [clickedButton, setClickedButton] = useState(null);
  const [buttonPosition, setButtonPosition] = useState(null);
  const buttonRef = useRef(null); 
  const { data: session } = useSession();

  useEffect(() => {
    if (session) {
      setLoggedIn(true);
      if (session.user.name) {
	const usernameMatch = session.user.name.match(/\(([^)]+)\)/); 
      	const twitterUsername = usernameMatch ? usernameMatch[1].toLowerCase() : '';
        console.log('twitterHan=',twitterUsername); 
        setTwitterHandle(twitterUsername);
      }
    } else {
      setLoggedIn(false);
      setTwitterHandle(''); 
    }
  }, [session]);

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
    axios
      .get(`/api/tweet-state?id=${inscriptionid}&user=${user || "unknown"}`)
      .then((response) => {
         const tweetState = response.data.tweetState[0];
         console.log('tweetState=',tweetState);
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
  }, [inscriptionid, twitterClientId, twitterClientSecret, twitterRedirectUri]);

  const handleLikeClick = async () => {
    //console.log("loggedIn=", loggedIn);
    console.log('likesCount (before)=',likesCount);
    console.log('userLiked=',userLiked);
    if (!loggedIn) {
       signIn(); 
     } else {
      if (!userLiked) {
        try {
          console.log('twitterHandle at handleLike=',twitterHandle);
          console.log('inscriptionid=',inscriptionid);
          const response = await axios.post(`/api/like`, { inscriptionid, user: twitterHandle });
          console.log('likesCount (before setLikesCount) =',likesCount);
          setLikesCount(likesCount + 1);
          console.log('likesCount (after setLikesCount)=',likesCount);
          setUserLiked(true);
        } catch (error) {
          console.error("Error liking tweet:", error);
        }
      } else {
        // Send a DELETE request to remove the like
        axios
          .delete(`/api/removeResponse`, { data: { interactionId: userLikedId } })
          .then((response) => {
            // Update likesCount and userLiked states based on the server response
            setLikesCount(likesCount-1);
            setUserLiked(false);
          })
          .catch((error) => {
            console.error("Error unliking tweet:", error);
          });
      }
    }
  };

  // Handle reply button click
  const handleReplyClick = () => {
    if (!loggedIn) {
       signIn();
    } else {
      setReplyModalOpen(true);
    }
  };

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
      //console.log('repostQuoteModalOpen=',repostQuoteModalOpen);
    }   
  };

  const renderContent = () => {
    if (typeof content === "string") {
      // If content is plain text
      return <p>{content}</p>;
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
      return <pre>{JSON.stringify(content, null, 2)}</pre>;
    }
  };

  return (
    <div className="tweet">
      <div className="tweet-controller">
        <span> number={number}</span>
        <span>{genesis_address}</span>

        {renderContent()}

        <div className="flex">
          <div>
            <button onClick={handleLikeClick}>
              <img
                src={userLiked ? "/images/like-active.png" : "/images/like.png"}
                alt="Like"
              />
            </button>
            <p>{likesCount} Likes</p>
          </div>
          <div>
            <button onClick={(e) => handleRepostClick(e)}>
              <img
                src={
                  userReposted
                    ? "/images/repost-active.png"
                    : "/images/repost.png"
                }
                alt="Repost"
              />
            </button>
            <p>{repostsCount} Reposts</p>
          </div>
          <div>
            <button onClick={handleReplyClick}>Reply</button>
          </div>
        </div>

        {replyModalOpen && (
          <ReplyModal
            isOpen={replyModalOpen}
            onClose={() => setReplyModalOpen(false)}
            twitterHandle={twitterHandle}
            inscriptionid={inscriptionid}
            quotedInscriptionContent={renderContent()}
          />
        )}

        {repostQuoteModalOpen && (
          <RepostQuoteModal
            onClose={() => setRepostQuoteModalOpen(false)}
            buttonPosition={buttonPosition}
            userReposted={userReposted}
            twitterHandle={twitterHandle}
            inscriptionid={inscriptionid}
            quotedInscriptionContent={renderContent()}
          />
        )}

      </div>
    </div>
  );
}
