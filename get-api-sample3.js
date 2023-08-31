const baseUrl = 'https://api.ordinalnovus.com/api';
const endpoint = '/inscription';

const data = {
  number: ["0", "20000000", "17999999"],
  show: "all",
  apiKey: "afcfc988-7d6c-42a3-a663-cbc43599249d"
};

// Define the paramsSerializer function (same as before)
const paramsSerializer = params => {
  return Object.entries(params)
    .map(([key, value]) => {
      if (Array.isArray(value)) {
        return value.map(v => `${key}=${encodeURIComponent(v)}`).join('&');
      }
      return `${key}=${encodeURIComponent(value)}`;
    })
    .join('&');
};

// Function to send the API request using fetch
const sendRequest = async () => {
  const queryString = new URLSearchParams(paramsSerializer(data)).toString();
  const fullUrl = baseUrl + endpoint + (queryString ? `?${queryString}` : '');

  console.log(`Sending GET request to: ${fullUrl}`);
  console.log('Request params:', data);

  try {
    const response = await fetch(fullUrl, {
      method: 'GET',
      headers: {
        "X-API-KEY": data.apiKey
      }
    });

    const jsonData = await response.json();
    console.log('Response:', jsonData);
  } catch (error) {
    console.log('Error:', error);
  }
};

// Call the function to send the API request
sendRequest();

