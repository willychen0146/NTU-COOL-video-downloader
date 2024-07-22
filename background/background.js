// background.js

// import { API } from '/utils/api.js';
// import { URLPatterns } from '/utils/constants.js';
// import { Logger } from '/utils/logger.js';
// import { VideoRequestManager } from '/utils/videoRequestManager.js';
// import { DownloadManager } from '/utils/downloadManager.js';

// class BackgroundScript {
//   constructor() {
//     this.api = API;
//     this.logger = new Logger();
//     this.videoRequestManager = new VideoRequestManager();
//     this.downloadManager = new DownloadManager(this.api, this.logger);

//     this.initializeListeners();
//   }

//   initializeListeners() {
//     this.api.webRequest.onBeforeRequest.addListener(
//       this.handleWebRequest.bind(this),
//       { urls: [URLPatterns.NTU_VIDEO] }
//     );

//     this.api.tabs.onUpdated.addListener(this.handleTabUpdate.bind(this));
//     this.api.tabs.onRemoved.addListener(this.handleTabRemove.bind(this));
//     this.api.runtime.onMessage.addListener(this.handleMessage.bind(this));
//   }

//   handleWebRequest(details) {
//     const url = details.url;
//     if (URLPatterns.VIDEO_REQUEST.test(url)) {
//       this.videoRequestManager.addUrl(url);
//       this.logger.info(`Video request URL added: ${url}`);
//     }
//   }

//   handleTabUpdate(tabId, changeInfo, tab) {
//     if (tab.url && tab.url.includes(URLPatterns.NTU_COOL) && changeInfo.status === "loading") {
//       this.videoRequestManager.clear();
//       this.logger.info("Cleared video request URLs for new page navigation.");
//     }
//   }

//   handleTabRemove(tabId, removeInfo) {
//     this.videoRequestManager.clear();
//     this.logger.info("Cleared video request URLs as tab is closed.");
//   }

//   async handleMessage(request, sender, sendResponse) {
//     if (request.action === "triggerDownload") {
//       try {
//         const result = await this.downloadManager.downloadVideo(this.videoRequestManager.getLastUrl());
//         sendResponse(result);
//       } catch (error) {
//         this.logger.error('Error in download:', error);
//         sendResponse({ success: false, error: error.message });
//       }
//     } else {
//       sendResponse({ success: false, error: "Invalid action." });
//     }
//     return true;
//   }
// }

// new BackgroundScript();

// Define the browser API
const api = typeof browser !== 'undefined' ? browser : chrome;

// Array to store video request URLs
let videoRequestUrls = [];

// Listen for requests made by the webpage
api.webRequest.onBeforeRequest.addListener(
  details => {
    const url = details.url;
    // console.log("Request made by the webpage:", url);
    const urlPattern = /^https:\/\/cool-video\.dlc\.ntu\.edu\.tw\/api\/courses\/[^\/]+\/videos\/[^\/]+\/view$/;
    if (urlPattern.test(url)) {
      videoRequestUrls.push(url);
      console.log("Video request URL added to the array:", url);
    }
  },
  {urls: ["*://cool-video.dlc.ntu.edu.tw/*"]} // Listen only to ntu URLs
);

// Listen for tab navigation events
api.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  // Check if the tab is navigating within the cool.ntu.edu.tw domain
  if (tab.url && tab.url.includes("cool.ntu.edu.tw") && changeInfo.status === "loading") {
    // Clear the videoRequestUrls array to start fresh for the new page
    videoRequestUrls = [];
    console.log("Cleared videoRequestUrls for new page navigation.");
  }
});

// Listen for tab removal events (when a tab is closed)
api.tabs.onRemoved.addListener((tabId, removeInfo) => {
  // Clear the videoRequestUrls array as the tab is closed
  videoRequestUrls = [];
  console.log("Cleared videoRequestUrls as tab is closed.");
});

// Listen for messages from the popup and trigger the download
api.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "triggerDownload" && videoRequestUrls.length > 0) {
    const videoUrl = videoRequestUrls.pop(); // Use and remove the last URL
    fetch(videoUrl)
      .then(response => response.json())
      .then(data => {
        let downloadUrl = null;
        console.log('data.sourceUri', data.sourceUri);
        console.log('data.altSourceUri', data.altSourceUri);
        
        // Check for different possible URL patterns
        if (data.sourceUri && data.sourceUri.includes('.mp4')) {
          downloadUrl = data.sourceUri;
        } else if (data.altSourceUri && data.altSourceUri.includes('.mp4')) {
          downloadUrl = data.altSourceUri;
        } else if (data.sourceUri && data.sourceUri.includes('manifest.mpd')) {
          // If it's a manifest file, use the altSourceUri if available
          downloadUrl = data.altSourceUri;
        }
        console.log('downloadUrl', downloadUrl)
        if (downloadUrl) {
          const timestamp = new Date().getTime();
          const uniqueFilename = `video_${timestamp}.mp4`;
          api.downloads.download({
            url: downloadUrl,
            filename: uniqueFilename
          }, function(downloadId) {
            if (downloadId) {
              sendResponse({success: true});
            } else {
              sendResponse({success: false, error: "Download initiation failed."});
            }
          });
        } else {
          sendResponse({success: false, error: "No suitable video URL found."});
        }
      })
      .catch(error => {
        console.error('Error:', error);
        sendResponse({success: false, error: "Failed to fetch video URL."});
      });
    return true;
  } else if (request.action === "getVideoUrl") {
    if (videoRequestUrls.length > 0) {
      sendResponse({url: videoRequestUrls[videoRequestUrls.length - 1]});
    } else {
      sendResponse({url: null});
    }
    return true;
  } else {
    sendResponse({success: false, error: "No video URL found."});
  }
});