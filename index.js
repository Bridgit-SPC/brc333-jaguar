const express = require('express');
const app = express();

app.listen(3000)

// Redirect HTTP requests to the desired port (3000)
app.use((req, res, next) => {
  if (req.headers.host === 'dev.ordweb.com') {
    return res.redirect(`http://dev.ordweb.com:3000${req.url}`);
  }
  next();
});

// Handle other routes and requests
app.get('/', (req, res) => {
  res.send('Hello, World!');
});
