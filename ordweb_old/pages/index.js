import { useState, useEffect } from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';
import { Tweet } from '../components/Tweet';
import axios from 'axios'; // Import Axios
import styles from './styles.module.css';
import { useRouter } from 'next/router';
import LoginModal from '../components/LoginModal';

export default function Feed({ initialTweets, twitterClientId, twitterRedirectUri, twitterClientSecret }) {
  const [page, setPage] = useState(2);
  const [tweets, setTweets] = useState(initialTweets);

  const router = useRouter();
  const { twitterHandle, loginError } = router.query;

  useEffect(() => {
    // Handle login error and twitter handle here
    if (loginError) {
      console.log('Authentication failed');
    }
    if (twitterHandle) {
      console.log('Authenticated user Twitter handle:', twitterHandle);
    }
  }, [twitterHandle, loginError]);

  const fetchMore = async () => {
    try {
      const response = await axios.get(`http://localhost:3000/api/tweets?page=${page}`);
      const moreTweets = response.data.tweets;
      setPage(page + 1);
      setTweets(prevTweets => [...prevTweets, ...moreTweets]);
    } catch (error) {
      console.error('Error fetching more tweets:', error);
    }
  };

  return (
    <div className={styles.feed}>

      {loginError && (
        <LoginModal
          isOpen={true}
          onClose={() => router.replace('/')}
          twitterClientId={twitterClientId}
          twitterClientSecret={twitterClientSecret}
          twitterRedirectUri={twitterRedirectUri}
        />
      )}
      <InfiniteScroll
        dataLength={tweets.length}
        next={fetchMore}
        hasMore={true}
        loader={<h4>Loading...</h4>}
      >

      {tweets.map(tweet => {
           return (
              <Tweet 
              key={tweet.inscriptionid} 
              genesis_address={tweet.genesis_address} 
              inscriptionid={tweet.inscriptionid} 
              number={tweet.number} 
              twitterHandle={twitterHandle}
              twitterClientId={twitterClientId}
              twitterClientSecret={twitterClientSecret}
              twitterRedirectUri={twitterRedirectUri}
              />
           );
      })}
      </InfiniteScroll>
    </div>
  );
}

export async function getServerSideProps() {
  try {
    const response = await axios.get('http://localhost:3000/api/tweets');
    const initialTweets = response.data.inscriptions;
    const twitterClientId = process.env.TWITTER_CLIENT_ID; 
    const twitterClientSecret = process.env.TWITTER_CLIENT_SECRET;   
    const twitterRedirectUri = process.env.BASE_URL + process.env.TWITTER_REDIRECT_URI; 


    return {
      props: {
        initialTweets,
        twitterClientId,
        twitterRedirectUri,
        twitterClientSecret,
      },
    };
  } catch (error) {
    console.error('Error fetching initial tweets:', error);
    return { props: { initialTweets: [], twitterClientId: '', twitterRedirectUri: '' } };
  }
}
