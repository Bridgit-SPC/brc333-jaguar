import React from 'react';
//import Head from 'next/head';
import Header from '../components/Header';
//import Sidebar from '../components/Sidebar';
//import Tabs from '../components/Tabs';
//import UserProfile from '../components/UserProfile';
//import FeedContent from '../components/FeedContent'; // Import your feed component

function HomePage() {
  return (
    <div>
      <Head>
        <title>Your App Name</title>
        {/* Add any necessary meta tags, stylesheets, etc. */}
      </Head>

      <Header />

      <div className="main-container">
        <Sidebar />
        <div className="feed">
          <FeedContent 
           initialTweets, 
           twitterClientId, 
           twitterClientSecret,
           twitterRedirectUri 
          /> 
        </div>
        <Tabs />
      </div>

      {/* Render user profile image when logged in */}
      {loggedIn && <UserProfile />}

      {/* Add any necessary scripts or modals here */}
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
