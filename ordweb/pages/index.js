import { useState, useEffect } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import { Tweet } from "../components/Tweet";
import Sidebar from "../components/Sidebar";
import axios from "axios"; // Import Axios
import styles from "./styles.module.css";
import { useRouter } from "next/router";
import { getSession, signIn, signOut, useSession } from "next-auth/react"//;
//import { Console } from "console";

export default function Feed({
  initialTweets,
  twitterClientId,
  twitterRedirectUri,
  twitterClientSecret,
  baseUrl = 'http://localhost:3000'
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
  const [criteria, setCriteria] = useState("");
  const [searched, setSearched] = useState(false); 

  useEffect(() => {
    if (router.query.criteria) {
      setCriteria(router.query.criteria);
      //console.log('criteria set in router.query=', criteria);
    }
  }, [router.query]);


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
        console.log("session.user.name =", session.user.name);
        console.log("session =", session);
        setTwitterHandle(session.user.username);
        setTwitterDisplayName(session.user.name);
      }
    } else {
      setLoggedIn(false);
      setTwitterHandle("");
    }
  }, [session]);

  const fetchMore = async () => {
    try {
      const url = criteria ? `http://localhost:3000/api/tweets?page=${page}&criteria=${criteria}` : `http://localhost:3000/api/tweets?page=${page}`;      
      console.log("Fetching more tweets from: " + url);
      const response = await axios.get(url);
      const moreTweets = response.data.inscriptions;
      //console.log("Fetched ", response.data.inscriptions);

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

  const handleSearch = () => {
    const url = `/?criteria=${encodeURIComponent(criteria)}`;
    console.log("url=", url);
    window.location.href = url;
    setSearched(true); 
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
          placeholder="Enter ordinal or meta-ordinal address"
          className={styles.urlInput}
          value={criteria}
          onChange={async (e) => {
            const inputValue = e.target.value;
            setCriteria(inputValue); // Update the state immediately
            console.log("Criteria updated:", criteria);
            // Make an API call here to check if inputValue matches data
            /*
            try {
              const response = await axios.get(
                `/api/search?query=${encodeURIComponent(inputValue)}`
              );
              const searchData = response.data; // Adjust this based on your API response
              // Now you can work with the searchData as needed
            } catch (error) {
              console.error("Error searching data:", error);
            } 
            */
          }}
        /> 
        <button onClick={handleSearch}>Search</button> 
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
    const queryParams = new URLSearchParams(context.req.url.split("?")[1]);
    const criteria = queryParams.get("criteria");
    const url = criteria ? `http://localhost:3000/api/tweets?criteria=${criteria}` : `http://localhost:3000/api/tweets`;
    console.log("Url in server side:", url);
    const response = await axios.get(url);
    //const response = await axios.get(`http://localhost:3000/api/tweets`); //CHANGE FOR PROD
    const initialTweets = response.data.inscriptions;
    const twitterClientId = process.env.TWITTER_CLIENT_ID;
    const twitterClientSecret = process.env.TWITTER_CLIENT_SECRET;
    const baseUrl = process.env.BASE_URL;
    const twitterRedirectUri = process.env.BASE_URL + process.env.TWITTER_REDIRECT_URI;
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
