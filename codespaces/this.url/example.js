// Example usage
(async () => {
  const website = new URL('https://example.com');

  // Crawl the website with a depth of 2
  await website.crawl(2);

  // Display the structure of the root node
  console.log('Node Structure:');
  website.displayStructure();
})();
