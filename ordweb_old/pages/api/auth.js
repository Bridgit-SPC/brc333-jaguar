import passport from 'passport';
import session from 'express-session'; // Import the session package

// Initialize the session middleware
const sessionMiddleware = session({
  secret: process.env.TWITTER_CONSUMER_SECRET,
  resave: false,
  saveUninitialized: true,
});

// Use the session middleware
passport.authenticate('twitter', {
  session: false, // Do not use Passport session
})(req, res);

// Store the original URL in the session
sessionMiddleware(req, res, () => {
  req.session.returnTo = req.headers.referer || '/'; // Store the original URL
});

