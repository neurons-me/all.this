import readline from 'readline';
import axios from 'axios';
import cheerio from 'cheerio';

// Create readline interface
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Function to add protocol if missing
function ensureProtocol(url) {
  if (!/^https?:\/\//i.test(url)) {
    return `http://${url}`;
  }
  return url;
}

// Function to check the status of a URL and log the parameters
async function checkUrl(url) {
  const formattedUrl = ensureProtocol(url);
  const startTime = Date.now();
  let statusCode = null;
  let responseTime = null;
  let contentLength = null;
  let contentType = null;
  let headers = null;
  let redirects = 0;
  let isOnline = false;
  let errorMessage = null;
  let htmlContent = null;
  let hyperlinks = [];
  let images = [];
  let videos = [];
  let textContent = null;

  try {
    const response = await axios.get(formattedUrl, { maxRedirects: 10 });
    statusCode = response.status;
    responseTime = Date.now() - startTime;
    contentLength = response.headers['content-length'];
    contentType = response.headers['content-type'];
    headers = response.headers;
    redirects = response.request._redirectable._redirectCount;
    isOnline = true;
    htmlContent = response.data;

    // Parse the HTML content
    const $ = cheerio.load(htmlContent);
    hyperlinks = $('a').map((i, el) => $(el).attr('href')).get();
    images = $('img').map((i, el) => $(el).attr('src')).get();
    videos = $('video').map((i, el) => $(el).attr('src')).get();
    textContent = $('body').text();

  } catch (error) {
    if (error.response) {
      statusCode = error.response.status;
      headers = error.response.headers;
      responseTime = Date.now() - startTime;
    } else {
      errorMessage = error.message;
    }
  }

  // Log the parameters to the console
  console.log('URL:', formattedUrl);
  console.log('Status Code:', statusCode);
  console.log('Response Time (ms):', responseTime);
  console.log('Content Length:', contentLength);
  console.log('Content Type:', contentType);
  console.log('Headers:', headers);
  console.log('Redirects:', redirects);
  console.log('Is Online:', isOnline);
  console.log('Error Message:', errorMessage);
  console.log('Hyperlinks:', hyperlinks);
  console.log('Images:', images);
  console.log('Videos:', videos);
  console.log('Text Content:', textContent);
}

// Prompt the user to enter a URL
rl.question('Please enter a URL: ', (url) => {
  checkUrl(url);
  rl.close();
});
