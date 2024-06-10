// background.js

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
      // console.log("Video request URL added to the array:", url);
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
        if (data.altSourceUri) {
          // Generate a unique filename with a timestamp
          const timestamp = new Date().getTime();
          const uniqueFilename = `video_${timestamp}.mp4`;
          api.downloads.download({
            url: data.altSourceUri,
            filename: uniqueFilename
          }, function(downloadId) {
            // Check if the download was initiated successfully
            if (downloadId) {
              sendResponse({success: true});
            } else {
              sendResponse({success: false, error: "Download initiation failed."});
            }
          });
          return true; // For asynchronous sendResponse
        } else {
          sendResponse({success: false, error: "No alternative source URI found."});
        }
      })
      .catch(error => {
        console.error('Error:', error);
        sendResponse({success: false, error: "Failed to fetch video URL."});
      });
    return true; // Indicates the response is sent asynchronously
  } else {
    sendResponse({success: false, error: "No video URL found."});
  }
});