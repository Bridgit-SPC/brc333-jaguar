const axios = require('axios');

axios.post('https://api.ordinalnovus.com/api/apikey/create', { wallet: 'bc1pkn6zsrwew3tksqspztp57yuvn9q6tx2uuzmyqjgy3hr7c7e2a32q65950r' })
  .then(response => {
    console.log(response.data);
  })
  .catch(error => {
    console.error(error);
  });
