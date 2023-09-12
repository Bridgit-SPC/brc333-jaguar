// pages/inscription/[id].js
import { useEffect, useState } from "react";
import TweetDetail from "../../components/TweetDetail";
import Sidebar from "../../components/Sidebar";
import axios from "axios"; // Import Axios
import { useRouter } from "next/router";
import { getSession, signIn, useSession } from "next-auth/react";
import styles from "../styles.module.css";

const InscriptionPage = ({
  twitterClientId,
  twitterRedirectUri,
  twitterClientSecret,
  baseUrl,
}) => {
  const router = useRouter();
  const { id } = router.query; // Get the inscription ID from the URL query

  const [session, loading] = useSession();
  const [loggedIn, setLoggedIn] = useState(false);
  const [hasLoginError, setHasLoginError] = useState(false);
  const [twitterHandle, setTwitterHandle] = useState("");
  const [twitterDisplayName, setTwitterDisplayName] = useState("");

  useEffect(() => {
    console.log("Session:", session); // Add this line
    console.log("Loading:", loading); // Add this line

    if (session) {
      setLoggedIn(true);
      if (session.user.name) {
        const nameMatch = session.user.name.match(/^(.*?)\s+\(([^)]+)\)/);
        const displayName = nameMatch ? nameMatch[1] : session.user.name;
        const twitterUsername = nameMatch
          ? `@${nameMatch[2].toLowerCase()}`
          : "";
        setTwitterHandle(twitterUsername);
        setTwitterDisplayName(displayName);
      }
    } else {
      setLoggedIn(false);
      setTwitterHandle("");
    }
  }, [session]);

  useEffect(() => {
    console.log("Router query:", router.query); // Add this line

    if (router.query.twitterErrorHandle) {
      console.log("Authenticated user Twitter handle:", twitterHandle);
    }
  }, [router.query.twitterErrorHandle, twitterHandle]);

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
        {/* Replace the feed with the TweetDetail component */}
        {id ? (
          <TweetDetail
            inscriptionId={id} // Pass the inscription ID to the TweetDetail component
            twitterClientId={twitterClientId}
            twitterClientSecret={twitterClientSecret}
            twitterRedirectUri={twitterRedirectUri}
            baseUrl={baseUrl}
            loggedIn={loggedIn}
            twitterHandle={twitterHandle}
          />
        ) : (
          <p>Loading inscription...</p>
        )}
      </div>
    </div>
  );
};

export default InscriptionPage;

export async function getServerSideProps(context) {
  // Fetch your authentication and configuration data here
  const twitterClientId = process.env.TWITTER_CLIENT_ID;
  const twitterClientSecret = process.env.TWITTER_CLIENT_SECRET;
  const baseUrl = process.env.BASE_URL;
  const twitterRedirectUri =
    process.env.BASE_URL + process.env.TWITTER_REDIRECT_URI;
  const session = await getSession(context);

  return {
    props: {
      twitterClientId,
      twitterRedirectUri,
      twitterClientSecret,
      baseUrl,
      session,
    },
  };
}


