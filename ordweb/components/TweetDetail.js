import React, { useEffect, useState } from "react";
import { Tweet } from "./Tweet";
import axios from "axios"; // Import Axios

const TweetDetail = ({
  inscriptionId,
  twitterClientId,
  twitterClientSecret,
  twitterRedirectUri,
  baseUrl,
  loggedIn,
  twitterHandle,
}) => {
  const [inscription, setInscription] = useState(null);
  const [replies, setReplies] = useState([]); // State variable for replies

  useEffect(() => {
    // Fetch the individual inscription data by ID from your PostgreSQL database
    // You'll need to implement this API endpoint or database query
    // Replace 'fetchInscriptionById' with your actual function to fetch inscription data
    if (inscriptionId) {
      axios
        .get(`/api/tweet-detail?${inscriptionId}`)
        .then((response) => {
          const data = response.data;
          //setInscription(data.inscription); // Set the inscription data
          setReplies(data.replies); // Set the replies data
        })
        .catch((error) => {
          console.error("Error fetching inscription and replies:", error);
        });
    }
  }, [inscriptionId]);

  // ... rest of the component

  return (
    <div>
      {/* Display the individual inscription */}
      {inscription ? (
        <Tweet
          inscriptionid={inscription.inscriptionid}
          genesis_address={inscription.genesis_address}
          timestamp={inscription.timestamp}
          number={inscription.number}
          // Add other necessary props as needed
        />
      ) : (
        <p>Loading inscription...</p>
      )}

      {/* Display replies */}
      <div>
        {replies.map((reply) => (
          <Tweet
            key={reply.inscriptionid}
            inscriptionid={reply.inscriptionid}
            genesis_address={reply.genesis_address}
            timestamp={reply.timestamp}
            number={reply.number}
            // Add other necessary props for replies
          />
        ))}
      </div>
    </div>
  );
};

export default TweetDetail;
