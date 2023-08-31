import passport from "@superfaceai/passport-twitter-oauth2";
import "../../../utils/passport"; // Import and initialize your custom passport strategy
import TwitterStrategy from "@superfaceai/passport-twitter-oauth2";

export default function handler(req, res) {
  // Configure the TwitterStrategy with your client ID, client secret, and callback URL
  const twitterStrategy = new TwitterStrategy(
    {
      clientID: process.env.TWITTER_CLIENT_ID,
      clientSecret: process.env.TWITTER_CLIENT_SECRET,
      clientType: "private",
      callbackURL: `${process.env.BASE_URL}/api/twitter/callback`,
    },
    (accessToken, refreshToken, profile, done) => {
      console.log("Success!", { accessToken, refreshToken });
      // Handle user authentication here, e.g., save user to the database
      return done(null, profile);
    },
  );

  // Initialize passport with your custom strategy
  passport.use(twitterStrategy);

  // Initialize passport for this request
  passport.initialize()(req, res, () => {
    // Authenticate using the Twitter strategy directly
    passport.authenticate("twitter", (err, user) => {
      if (err) {
        return res.redirect(
          `/?loginError=${encodeURIComponent("Authentication failed")}`,
        );
      }

      // Handle user data after successful authentication
      if (user) {
        // Assuming you have a `twitterHandle` property in the user profile
        const userTwitterHandle = user.twitterHandle;
        return res.redirect(`/?twitterHandle=${userTwitterHandle}`);
      }

      // Redirect to a default page if user is not authenticated
      return res.redirect("/");
    })(req, res);
  });
}
