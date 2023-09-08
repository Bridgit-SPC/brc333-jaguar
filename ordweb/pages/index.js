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
  baseUrl
}) {
  const [page, setPage] = useState(2);
  const [tweets, setTweets] = useState(initialTweets);
  const router = useRouter();
  const { twitterErrorHandle, loginError } = router.query;
  const { data: session } = useSession();
  const [loggedIn, setLoggedIn] = useState(false);
  const [hasLoginError, setHasLoginError] = useState(!!loginError);
  const [twitterHandle, setTwitterHandle] = useState("");
  const [twitterDisplayName, setTwitterDisplayName] = useState("");

  useEffect(() => {
    // Handle login error and twitter handle here
    setHasLoginError(!!loginError); // Convert to boolean and set the state
    if (twitterErrorHandle) {
      console.log("Authenticated user Twitter handle:", twitterHandle);
    }
  }, [twitterErrorHandle, loginError]);

  useEffect(() => {
    if (session) {
      setLoggedIn(true);
      if (session.user.name) {
        const nameMatch = session.user.name.match(/^(.*?)\s+\(([^)]+)\)/);
        const displayName = nameMatch ? nameMatch[1] : session.user.name;
        const twitterUsername = nameMatch ? `@${nameMatch[2].toLowerCase()}` : "";
        console.log("displayName =", displayName);
        console.log("twitterUsername =", twitterUsername);
        setTwitterHandle(twitterUsername);
        setTwitterDisplayName(displayName);
      }
    } else {
      setLoggedIn(false);
      setTwitterHandle("");
    }
  }, [session]);

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

  return (

  <div className={styles.container}>  
    <div className={styles.sidebar}>
      <Sidebar 
        session={session}
        twitterDisplayName={twitterDisplayName}
        twitterHandle={twitterHandle} 
      />
    </div> 
    <div className={styles.feed}>

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
      </div>

      <div className={styles.feed}>
        <InfiniteScroll
          dataLength={tweets.length}
          next={fetchMore}
          hasMore={true}
          loader={<h4>Loading...</h4>}
        >
           {tweets.map(tweet => (
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
            baseUrl={baseUrl}
            loggedIn={loggedIn}
          />
        ))}
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
    const baseUrl = process.env.BASE_URL;
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
        baseUrl
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
