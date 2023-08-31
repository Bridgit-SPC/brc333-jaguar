import axios from 'axios';
import { generateCodeChallenge } from '../../../utils/oauth';

export default async (req, res) => {
  try {
    const { state, code } = req.query;

    const response = await axios.get(`${process.env.BASE_URL}/api/get-auth-info?state=${state}`);
    const storedCodeVerifier = response.data.codeVerifier;
    const storedState = response.data.state;
    const storedChallenge = response.data.codeChallenge;

    // Verify that the state matches
    if (state !== storedState) {
      throw new Error('State mismatch');
    }

    const tokenExchangeData = new URLSearchParams();
    tokenExchangeData.append('grant_type', 'authorization_code');
    tokenExchangeData.append('client_id', process.env.TWITTER_CLIENT_ID);
    tokenExchangeData.append('code', code);
    const redirectUri = `${process.env.BASE_URL}${process.env.TWITTER_REDIRECT_URI}`;
    tokenExchangeData.append('redirect_uri', redirectUri);
    tokenExchangeData.append('code_verifier', storedCodeVerifier);

    const regeneratedCodeChallenge = generateCodeChallenge(storedCodeVerifier);

    const base64EncodedCredentials = Buffer.from(`${encodeURIComponent(process.env.TWITTER_CLIENT_ID)}:${encodeURIComponent(process.env.TWITTER_CLIENT_SECRET)}`).toString('base64');
    console.log('tokenExchangeData=',tokenExchangeData);
    console.log('storedChallenge=',storedChallenge);
    console.log('regeneratedCodeChallenge=',regeneratedCodeChallenge);
    //console.log('encodeURIComponent(redirectUri)=',encodeURIComponent(redirectUri));

    // Continue with the token exchange process using Axios
    const tokenExchangeResponse = await axios.post(
      'https://api.twitter.com/2/oauth2/token',
      tokenExchangeData,
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Basic ${base64EncodedCredentials}`
        },
      }
    );

    // Process the token exchange response
    const accessToken = tokenExchangeResponse.data.access_token;
    const userId = tokenExchangeResponse.data.user_id;

    console.log('userId}=',userId);
    // Make a request to the Twitter API to get user information
    const userInfoResponse = await axios.get(`https://api.twitter.com/2/users/${userId}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      },
    });

   // Extract the user's Twitter handle
   const twitterHandle = userInfoResponse.data.username;
   res.status(200).end();

  } catch (error) {
    console.error('Token exchange error:', error);
    res.status(500).send('Token exchange error.');
  }
};
