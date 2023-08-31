import { useState, useEffect } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import { Tweet } from "../components/Tweet";
import axios from "axios"; // Import Axios
import styles from "./styles.module.css";
import { useRouter } from "next/router";
import LoginModal from "../components/LoginModal";
import { getSession, signIn, signOut, useSession } from "next-auth/react";

export default function Feed({
  initialTweets,
  twitterClientId,
  twitterRedirectUri,
  twitterClientSecret,
}) {
  const [page, setPage] = useState(2);
  const [tweets, setTweets] = useState(initialTweets);
  console.log("++++++++++>", twitterRedirectUri);
  const router = useRouter();
  const { twitterHandle, loginError } = router.query;

  useEffect(() => {
    // Handle login error and twitter handle here
    if (loginError) {
      console.log("Authentication failed");
    }
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
      setPage(page + 1);
      setTweets((prevTweets) => [...prevTweets, ...moreTweets]);
    } catch (error) {
      console.error("Error fetching more tweets:", error);
    }
  };
  const { data: session } = useSession();
  return (
    <>
      <div className={styles.nav}>
        <div className={styles.navList}>
          <a class={styles.active} href="#home">
            Home
          </a>
          <a href="#news">News</a>
          <a href="#contact">Contact</a>
          <a href="#about">Teweets</a>
        </div>

        <div className={styles.navList}>
          {session ? (
            <div className={styles.navList}>
              <img src={session.user.image} className={styles.avtar} /> <br />
              <button onClick={() => signOut()}>Sign out</button>
            </div>
          ) : (
            <>
              <button onClick={() => signIn()}>Sign in</button>
            </>
          )}
        </div>
      </div>
      <div className={styles.feed}>
        {/* {loginError && (
          <LoginModal
            isOpen={true}
            session={session}
            onClose={() => router.replace("/")}
            twitterClientId={twitterClientId}
            twitterClientSecret={twitterClientSecret}
            twitterRedirectUri={twitterRedirectUri}
          />
        )} */}
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
    </>
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
