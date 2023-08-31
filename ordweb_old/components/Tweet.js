import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/reply-modal.css';
import ReplyModal from './ReplyModal'; 
import QuoteModal from './QuoteModal'; 
import LoginModal from './LoginModal';
let user; 

export function Tweet({ inscriptionid, genesis_address, number, twitterClientId, twitterClientSecret, twitterRedirectUri }) {
  const [loggedIn, setLoggedIn] = useState(false); 
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [loginError, setLoginError] = useState(false);
  const [content, setContent] = useState('');
  const [likesCount, setLikesCount] = useState(0);
  const [repliesCount, setRepliesCount] = useState(0);
  const [repostsCount, setRepostsCount] = useState(0);
  const [bookmarksCount, setBookmarksCount] = useState(0);
  const [userLiked, setUserLiked] = useState(false);
  const [userReposted, setUserReposted] = useState(false);
  const [userBookmarked, setUserBookmarked] = useState(false);
  const [replyModalOpen, setReplyModalOpen] = useState(false);
  const [quoteModalOpen, setQuoteModalOpen] = useState(false);

  // Fetch content from the server
  useEffect(() => {
    axios.get(`https://ord.ordinalnovus.com/content/${inscriptionid}`)
      .then(response => {
        setContent(response.data);
      })
      .catch(error => {
        console.error('Error fetching content:', error);
      });
  }, [inscriptionid]);

  useEffect(() => {
  axios.get(`/api/tweet-state?id=${inscriptionid}&user=${user || "unknown"}`)
    .then(response => {
      console.log('response=', response.data);
      setUserLiked(response.userLiked);
      setUserReposted(response.userReposted);
      setUserBookmarked(response.userBookmarked);
      setLikesCount(response.likesCount);
      setRepostsCount(response.repostsCount);
      setRepliesCount(response.repliesCount);
      setBookmarksCount(response.bookmarksCount);
    })
    .catch(error => {
      console.error('Error fetching user state and counts:', error);
    });
 }, [inscriptionid, twitterClientId, twitterClientSecret, twitterRedirectUri]);

 useEffect(() => {
   console.log('loginModalOpen=', loginModalOpen);
 }, [loginModalOpen]);

 const handleLikeClick = () => {
  console.log('loggedIn=',loggedIn);
  if (!loggedIn) {
    setLoginModalOpen(true);
  } else {
    if (!userLiked) {
      // Send a POST request to your server to like the tweet
      axios.post(`/api/like`, { inscriptionid, user })
        .then(response => {
          // Update likesCount and userLiked states based on the server response
          setLikesCount(response.data.newLikesCount);
          setUserLiked(true);
        })
        .catch(error => {
          console.error('Error liking tweet:', error);
        });
    } else {
      // Send a DELETE request to your server to remove the like
      axios.delete(`/api/unlike`, { data: { inscriptionid, user } })
        .then(response => {
          // Update likesCount and userLiked states based on the server response
          setLikesCount(response.data.newLikesCount);
          setUserLiked(false);
        })
        .catch(error => {
          console.error('Error unliking tweet:', error);
        });
    }
  }
 };

  // Handle repost button click
  const handleRepostClick = () => {
     if (!loggedIn) {
        setLoginModalOpen(true);
     } else {
        if (!userReposted) {
           // Show repost/quote options in a modal
        } else {
           // Show undo repost/quote options in a modal
        }
     }
  };

  // Handle reply button click
  const handleReplyClick = () => {
    if (!loggedIn) {
      setLoginModalOpen(true);
    } else {
      setReplyModalOpen(true);
    }
  };

  // Handle quote button click
  const handleQuoteClick = () => {
    if (!loggedIn) {
      setLoginModalOpen(true);
    } else {
      setQuoteModalOpen(true);
    }
  };

const renderContent = () => {
  if (typeof content === 'string') {
    // If content is plain text
    return <p>{content}</p>;
  } else if (typeof content === 'object' && content.type === 'image') {
    // If content is an image
    return <img src={content.url} alt="Content" />;
  } else if (typeof content === 'object' && content.type === 'video') {
    // If content is a video clip
    return (
      <video controls>
        <source src={content.url} type="video/mp4" />
        Your browser does not support the video tag.
      </video>
    );
  } else if (typeof content === 'object' && content.type === 'html') {
    // If content is HTML
    return <div dangerouslySetInnerHTML={{ __html: content.html }} />;
  } else {
    // For other types of content or objects, you can display the JSON representation
    return <pre>{JSON.stringify(content, null, 2)}</pre>;
  }
};

 return (
    <div className="tweet">
      <div>
        <span> number={number}</span>
        <span>{genesis_address}</span>

        {renderContent()}

        <div>
          <button onClick={handleLikeClick}>
            <img src={userLiked ? '/images/like-active.png' : '/images/like.png'} alt="Like" />
          </button>
           {likesCount} Likes
          <button onClick={handleRepostClick}>
            <img src={userReposted ? '/images/repost-active.png' : '/images/repost.png'} alt="Repost" />
            {repostsCount} Reposts
          </button>
          <button onClick={handleReplyClick}>Reply</button>
        </div>

        {loginModalOpen && (
          <LoginModal
            isOpen={loginModalOpen}
            onClose={() => setLoginModalOpen(false)}
            loginError={loginError}
            twitterClientId={twitterClientId}
            twitterClientSecret={twitterClientSecret}
            twitterRedirectUri={twitterRedirectUri}
          />
        )}

        {replyModalOpen && (
        <ReplyModal
          isOpen={replyModalOpen}
          onClose={() => setReplyModalOpen(false)}
          quotedInscriptionContent={content} 
          user={user} 
        />
        )}

        {quoteModalOpen && (
        <QuoteModal
          isOpen={quoteModalOpen}
          onClose={() => setQuoteModalOpen(false)}
          quotedInscriptionContent={content}
          user={user} 
        />
        )}
      </div>
    </div>
  );
}
