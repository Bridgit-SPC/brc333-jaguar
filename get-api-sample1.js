const axios = require('axios');

// Define the paramsSerializer function (same as before)
const response = 
axios.get('https://api.ordinalnovus.com/api/ordapi/feed?apiKey=afcfc988-7d6c-42a3-a663-cbc43599249d')
  .then(response => {
    console.log(response.data);
    // Handle the response data here
  })
  .catch(error => {
    console.error(error);
    // Handle the error here
  });
