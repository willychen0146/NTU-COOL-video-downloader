// popup.js

// Define the browser API
const api = typeof browser !== 'undefined' ? browser : chrome;

// document.getElementById('downloadBtn').addEventListener('click', function() {
//   const button = this;
//   const status = document.getElementById('status');
//   const downloadText = document.getElementById('downloadText');
//   const loadingImg = document.getElementById('loadingImg');

//   // Hide button
//   button.classList.add('hidden');

//   api.runtime.sendMessage({action: "triggerDownload"}, function(response) {
//     if (response.success) {
//       // Show loading image
//       loadingImg.classList.remove('hidden');
//       downloadText.innerHTML = 'Downloading...';

//       // Close the popup after 3 seconds
//       setTimeout(() => window.close(), 2000);
//     } else {
//       // If download failed, show error and button, hide loading image
//       status.innerHTML = '<i class="fas fa-solid fa-skull"></i> <br> Download Failed';
//       loadingImg.classList.add('hidden');
//       // Close the popup after a delay
//       setTimeout(() => window.close(), 2000);
//     }
//   });
// });

document.addEventListener('DOMContentLoaded', function() {
    const downloadBtn = document.getElementById('downloadBtn');
    const copyUrlBtn = document.getElementById('copyUrlBtn');
    const videoUrlDisplay = document.getElementById('videoUrlDisplay');
    const urlError = document.getElementById('urlError');
    const status = document.getElementById('status');
    const loadingIndicator = document.getElementById('loadingIndicator');

    // Fetch and display the video URL
    function fetchVideoUrl() {
        api.runtime.sendMessage({action: "getVideoUrl"}, function(response) {
            if (response.url) {
                videoUrlDisplay.textContent = response.url;
                urlError.classList.add('hidden');
            } else {
                urlError.classList.remove('hidden');
            }
        });
    }

    // Fetch video URL when popup opens
    fetchVideoUrl();

    downloadBtn.addEventListener('click', function() {
        loadingIndicator.classList.remove('hidden');
        api.runtime.sendMessage({action: "triggerDownload"}, function(response) {
            loadingIndicator.classList.add('hidden');
            if (response.success) {
                status.textContent = 'Download started successfully!';
                status.classList.add('text-green-500');
            } else {
                status.textContent = response.error || 'Download failed.';
                status.classList.add('text-red-500');
            }
        });
    });

    copyUrlBtn.addEventListener('click', function() {
        const url = videoUrlDisplay.textContent;
        if (url) {
            navigator.clipboard.writeText(url).then(() => {
                status.textContent = 'URL copied to clipboard!';
                status.classList.add('text-green-500');
            });
        }
    });
});