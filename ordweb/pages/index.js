import { useState, useEffect } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import { Tweet } from "../components/Tweet";
import Sidebar from "../components/Sidebar";
import axios from "axios"; // Import Axios
import styles from "./styles.module.css";
import { useRouter } from "next/router";
import { getSession, signIn, signOut, useSession } from "next-auth/react";

export default function Feed({
  initialTweets,
  twitterClientId,
  twitterRedirectUri,
  twitterClientSecret,
}) {
  const [page, setPage] = useState(2);
  const [tweets, setTweets] = useState(initialTweets);
  //console.log("++++++++++>", twitterRedirectUri);
  const router = useRouter();
  const { twitterHandle, loginError } = router.query;
  const [hasLoginError, setHasLoginError] = useState(!!loginError);

  useEffect(() => {
    // Handle login error and twitter handle here
    setHasLoginError(!!loginError); // Convert to boolean and set the state
    if (twitterHandle) {
      console.log("Authenticated user Twitter handle:", twitterHandle);
    }
  }, [twitterHandle, loginError]);

  const fetchMore = async () => {
    try {
      const response = await axios.get(
        `http://localhost:3000/api/tweets?page=${page}`,
      );
      const moreTweets = response.data.tweets;

      if (Array.isArray(moreTweets)) {
         setTweets((prevTweets) => [...prevTweets, ...moreTweets]);
         setPage(page + 1);
      } else {
         console.error("Error: moreTweets is not an array");
      }
    } catch (error) {
      console.error("Error fetching more tweets:", error);
    }
  };
  const { data: session } = useSession();
  return (

  <div className={styles.container}>
    <div className={styles.sidebar}>
      <Sidebar />
    </div>
    <div className={styles.mainContent}>

      <div className={styles.topRow}>
        <input
          type="text"
          placeholder="Enter URL"
          className={styles.urlInput}
        />
        {hasLoginError && (
          <div>
            <p>
              Authentication failed. Please click the button below to sign in.
            </p>
           <button onClick={() => signIn()}>Sign in</button>
          </div>
        )}

        {session ? (
          <div className={styles.userNav}>
            <img src={session.user.image} className={styles.avatar} /> <br />
            <button onClick={() => signOut()}>Sign out</button>
          </div>
        ) : (
          <button onClick={() => signIn()}>Sign in</button>
        )}
      </div>

      <div className={styles.feed}>
        <InfiniteScroll
          dataLength={tweets.length}
          next={fetchMore}
          hasMore={true}
          loader={<h4>Loading...</h4>}
        >
          {tweets.map((tweet) => {
            return (
            <Tweet
              key={tweet.inscriptionid}
              genesis_address={tweet.genesis_address}
              timestamp={tweet.timestamp}
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
    </div>
  </div>   
  );
}   


export async function getServerSideProps(context) {
  try {
    const response = await axios.get("http://localhost:3000/api/tweets");
    const initialTweets = response.data.inscriptions;
    const twitterClientId = process.env.TWITTER_CLIENT_ID;
    const twitterClientSecret = process.env.TWITTER_CLIENT_SECRET;
    const twitterRedirectUri =
       process.env.BASE_URL + process.env.TWITTER_REDIRECT_URI;
    const session = await getSession(context);
    return {
      props: {
        initialTweets,
        twitterClientId,
        twitterRedirectUri,
        twitterClientSecret,
        session,
      },
    };
  } catch (error) {
    console.error("Error fetching initial tweets:", error);
    return {
      props: {
        initialTweets: [],
        twitterClientId: "",
        twitterRedirectUri: "",
        session,
      },
    };
  }
}
