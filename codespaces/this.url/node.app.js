import readline from 'readline';
import { URL } from './index.js';  // Importing the URL class from index.js
// Create readline interface
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Prompt the user to enter a URL
rl.question('Please enter a URL: ', async (url) => {
  const urlMetadata = new URL(url);
  await urlMetadata.fetchData();
  const structuredData = urlMetadata.getStructuredData();
  // Log the structured data
  console.log('Structured Data:', JSON.stringify(structuredData, null, 2));
  rl.close();
});