import React, { useState } from "react";
import axios from "axios";
import styles from "./LoginModal.module.css";
import {
  generateCodeVerifierAndChallenge,
  generateRandomState,
} from "../utils/oauth";
import { useSession, onClose, signIn, signOut } from "next-auth/react";
const LoginModal = ({ onClose }) => {
  //   const [loginError, setLoginError] = useState(false);
  const { data: session } = useSession();
  console.log(session);
  //   const handleTwitterLogin = async () => {
  //     // Generate code verifier and challenge
  //     const { codeVerifier, codeChallenge } = generateCodeVerifierAndChallenge();
  //     const state = generateRandomState();

  //     await axios.post('/api/save-auth-info', {
  //        codeVerifier,
  //        state,
  //        codeChallenge
  //     });

  //     //Construct the authorization URL with the code challenge
  //     //const twitterAuthUrl = `https://twitter.com/i/oauth2/authorize?response_type=code&client_id=${twitterClientId}&redirect_uri=${encodeURIComponent(twitterRedirectUri)}&scope=tweet.read%20users.read%20offline.access&state=${state}&code_challenge=${codeChallenge}&code_challenge_method=plain`;
  //     const twitterAuthUrl =
  // `https://twitter.com/i/oauth2/authorize?response_type=code&client_id=${twitterClientId}&redirect_uri=${encodeURIComponent(twitterRedirectUri)}&scope=tweet.read&state=${state}&code_challenge=${codeChallenge}&code_challenge_method=plain`;

  //     console.log('twitterAuthUrl=',twitterAuthUrl);
  //     console.log('twitterRedirectUri=',twitterRedirectUri);
  //     console.log('encodeURIComponent(twitterRedirectUri)=',encodeURIComponent(twitterRedirectUri));

  //     setTimeout(() => {
  //       window.location.href = twitterAuthUrl;
  //     }, 10000);

  //     //Redirect the user to the authorization URL  Temporily commented out to give delay
  //     //window.location.href = twitterAuthUrl;
  //   };

  return (
    <div className={styles.modal}>
      <div className={styles.modalContent}>
        <h2 className={styles.modalTitle}>Login with Twitter</h2>
        {session ? (
          <>
            Signed in as {session.user.name} <br />
            <button onClick={() => signOut()}>Sign out</button>
          </>
        ) : (
          <>
            <button
              onClick={() => signIn({ callbackUrl: "/api/twitter/callback" })}
            >
              Sign in
            </button>
          </>
        )}
        {/* {loginError && <p style={{ color: 'red' }}>Login failed. Please try again.</p>}
        <p className={styles.modalDescription}>
          Click the button below to log in using your Twitter account.
        </p>
        <button className={styles.modalButton} onClick={handleTwitterLogin}>
          Login with Twitter
        </button> */}
        <button className={styles.modalButton} onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  );
};
export async function getServerSideProps(context) {
  const session = await getSession(context);
  return {
    props: {
      session,
    },
  };
}
export default LoginModal;
