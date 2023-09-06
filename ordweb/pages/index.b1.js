import React, { useState, useEffect } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import axios from "axios"; // Import Axios
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
  const router = useRouter();
  const { twitterHandle, loginError } = router.query;
  const [hasLoginError, setHasLoginError] = useState(!!loginError);

  useEffect(() => {
    setHasLoginError(!!loginError);
    if (twitterHandle) {
      console.log("Authenticated user Twitter handle:", twitterHandle);
    }
  }, [twitterHandle, loginError]);

  const fetchMore = async () => {
    try {
      const response = await axios.get(
        `http://localhost:3000/api/tweets?page=${page}`
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
    <div>
      <aside>
        <div>Sidebar</div>
      </aside>
      <div>
        <input type="text" placeholder="Enter URL" />
        {hasLoginError && (
          <div>
            <p>Authentication failed. Please click the button below to sign in.</p>
            <button onClick={() => signIn()}>Sign in</button>
          </div>
        )}

        {session ? (
          <div>
            <img src={session.user.image} /> <br />
            <button onClick={() => signOut()}>Sign out</button>
          </div>
        ) : (
          <button onClick={() => signIn()}>Sign in</button>
        )}
      </div>

      <div>
        <div>
          <InfiniteScroll
            dataLength={tweets.length}
            next={fetchMore}
            hasMore={true}
            loader={<h4>Loading...</h4>}
          >
            {tweets.map((tweet) => {
              return (
                <div key={tweet.inscriptionid}>
                  {/* Render your tweet content here */}
                </div>
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

