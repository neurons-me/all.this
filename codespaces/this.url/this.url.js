import axios from 'axios';
import cheerio from 'cheerio';
import fs from 'fs';
import path from 'path';
import { createLogger, transports, format } from 'winston';

/**
 * Class representing a URL node.
 */
class URL {
  /**
   * Create a URL instance.
   * @param {string} url - The URL of the node.
   * @param {URL} [parent=null] - The parent node.
   */
  constructor(url, parent = null) {
    this.url = this.ensureProtocol(url);
    this.statusCode = null;
    this.responseTime = null;
    this.contentLength = null;
    this.contentType = null;
    this.headers = null;
    this.redirects = 0;
    this.isOnline = false;
    this.errorMessage = null;
    this.title = null;
    this.timestamp = null;

    // Content-related properties
    this.htmlContent = null;
    this.hyperlinks = [];
    this.images = [];
    this.videos = [];
    this.textContent = null;

    // Node-related properties
    this.parent = parent;
    this.children = [];
    this.references = [];

    this.logger = this.setupLogger();
  }

  /**
   * Ensure the URL has a protocol.
   * @param {string} url - The URL to check.
   * @returns {string} The URL with the protocol.
   */
  ensureProtocol(url) {
    if (!/^https?:\/\//i.test(url)) {
      return `http://${url}`;
    }
    return url;
  }

  /**
   * Set up the logger.
   * @returns {Object} The logger instance.
   */
  setupLogger() {
    return createLogger({
      level: 'info',
      format: format.combine(
        format.colorize(),
        format.timestamp(),
        format.printf(({ timestamp, level, message }) => {
          return `${timestamp} ${level}: ${message}`;
        })
      ),
      transports: [
        new transports.Console(),
        new transports.File({ filename: 'url_fetch.log' })
      ],
    });
  }

  /**
   * Fetch metadata of the URL.
   * @async
   */
  async fetchMetadata() {
    const startTime = Date.now();
    this.timestamp = new Date(startTime).toISOString();

    try {
      const response = await axios.head(this.url, { maxRedirects: 10 });
      this.statusCode = response.status;
      this.responseTime = Date.now() - startTime;
      this.contentLength = response.headers['content-length'];
      this.contentType = response.headers['content-type'];
      this.headers = response.headers;
      this.redirects = response.request._redirectable._redirectCount;
      this.isOnline = true;

      const titleResponse = await axios.get(this.url, { maxRedirects: 10 });
      const $ = cheerio.load(titleResponse.data);
      this.title = $('title').text();

      this.logger.info(`Successfully fetched metadata from ${this.url}`);
    } catch (error) {
      this.isOnline = false;
      if (error.response) {
        this.statusCode = error.response.status;
        this.headers = error.response.headers;
        this.responseTime = Date.now() - startTime;
        this.logger.error(`Failed to fetch metadata from ${this.url} - Status: ${this.statusCode}`);
      } else {
        this.errorMessage = error.message;
        this.logger.error(`Failed to fetch metadata from ${this.url} - Error: ${this.errorMessage}`);
      }
    }
  }

  /**
   * Fetch the full content of the URL.
   * @async
   */
  async fetchContent() {
    if (!this.isOnline) {
      this.logger.error(`Cannot fetch content. URL ${this.url} is offline.`);
      return;
    }

    try {
      const response = await axios.get(this.url, { maxRedirects: 10 });
      this.htmlContent = response.data;

      const $ = cheerio.load(this.htmlContent);
      this.hyperlinks = $('a').map((i, el) => $(el).attr('href')).get();
      this.images = $('img').map((i, el) => $(el).attr('src')).get();
      this.videos = $('video').map((i, el) => $(el).attr('src')).get();
      this.textContent = $('body').text();

      await this.downloadMediaFiles();

      this.logger.info(`Successfully fetched content from ${this.url}`);
    } catch (error) {
      this.errorMessage = error.message;
      this.logger.error(`Failed to fetch content from ${this.url} - Error: ${this.errorMessage}`);
    }
  }

  /**
   * Download media files (images and videos).
   * @async
   */
  async downloadMediaFiles() {
    const mediaDir = './media';
    if (!fs.existsSync(mediaDir)) {
      fs.mkdirSync(mediaDir);
    }

    for (const imgUrl of this.images) {
      await this.downloadFile(imgUrl, mediaDir);
    }

    for (const videoUrl of this.videos) {
      await this.downloadFile(videoUrl, mediaDir);
    }
  }

  /**
   * Download a file and save it locally.
   * @async
   * @param {string} url - The URL of the file to download.
   * @param {string} directory - The directory to save the downloaded file.
   */
  async downloadFile(url, directory) {
    try {
      const response = await axios({
        url,
        method: 'GET',
        responseType: 'stream',
      });

      const filePath = path.join(directory, path.basename(url));
      const writer = fs.createWriteStream(filePath);

      response.data.pipe(writer);

      return new Promise((resolve, reject) => {
        writer.on('finish', resolve);
        writer.on('error', reject);
      });
    } catch (error) {
      this.logger.error(`Failed to download file from ${url} - Error: ${error.message}`);
    }
  }

  /**
   * Get the metadata of the URL.
   * @returns {Object} The metadata of the URL.
   */
  getMetadata() {
    return {
      url: this.url,
      statusCode: this.statusCode,
      responseTime: this.responseTime,
      contentLength: this.contentLength,
      contentType: this.contentType,
      headers: this.headers,
      redirects: this.redirects,
      isOnline: this.isOnline,
      errorMessage: this.errorMessage,
      title: this.title,
      timestamp: this.timestamp
    };
  }

  /**
   * Get the full content of the URL.
   * @returns {Object} The content of the URL.
   */
  getContent() {
    return {
      url: this.url,
      htmlContent: this.htmlContent,
      hyperlinks: this.hyperlinks,
      images: this.images,
      videos: this.videos,
      textContent: this.textContent
    };
  }

  /**
   * Add a child node.
   * @param {URL} childNode - The child node to add.
   */
  addChild(childNode) {
    childNode.parent = this;
    this.children.push(childNode);
  }

  /**
   * Add a reference to another node.
   * @param {URL} referenceNode - The node being referenced.
   */
  addReference(referenceNode) {
    this.references.push(referenceNode);
  }

  /**
   * Display the node structure.
   * @param {number} [level=0] - The current level of the node.
   */
  displayStructure(level = 0) {
    console.log('  '.repeat(level) + this.url);
    for (const child of this.children) {
      child.displayStructure(level + 1);
    }
  }

  /**
   * Crawl the website starting from the initial URL.
   * @async
   * @param {number} depth - The maximum depth to crawl.
   */
  async crawl(depth = 2) {
    const queue = [{ url: this.url, depth: 0, parent: this }];
    const visited = new Set();

    while (queue.length > 0) {
      const { url, depth: currentDepth, parent } = queue.shift();
      if (visited.has(url) || currentDepth > depth) {
        continue;
      }

      visited.add(url);
      const page = new URL(url, parent);

      await page.fetchMetadata();
      await page.fetchContent();

      console.log(`Crawled: ${url}`);
      console.log('Metadata:', page.getMetadata());
      console.log('Content:', page.getContent());

      parent.addChild(page);

      for (const link of page.hyperlinks) {
        if (!visited.has(link)) {
          queue.push({ url: this.ensureProtocol(link), depth: currentDepth + 1, parent: page });
        }
      }
    }
  }
}

export default URL;

